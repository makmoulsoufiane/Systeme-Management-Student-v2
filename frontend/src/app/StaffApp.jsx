import { Link, Navigate, Route, Routes, useLocation, useParams } from 'react-router-dom';
import { ErrorState, LoadingState } from '../components/Feedback.jsx';
import { useAuth } from '../features/auth/application/AuthContext.jsx';
import { dashboardPath, workspacePath } from '../features/auth/application/workspacePaths.js';
import LoginPage from '../features/auth/presentation/LoginPage.jsx';
import ProtectedRoute from '../features/auth/presentation/ProtectedRoute.jsx';
import ChangePasswordPage from '../features/auth/presentation/ChangePasswordPage.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import TeacherLayout from '../layouts/TeacherLayout.jsx';
import StudentLayout from '../layouts/StudentLayout.jsx';
import { AdminDashboard, TeacherDashboard, StudentDashboard } from '../features/dashboard/Dashboard.jsx';
import AccountList from '../features/accounts/presentation/AccountList.jsx';
import AccountForm from '../features/accounts/presentation/AccountForm.jsx';
import RecordList from '../features/staff/presentation/RecordList.jsx';
import RecordForm from '../features/staff/presentation/RecordForm.jsx';
import RecordDetail from '../features/staff/presentation/RecordDetail.jsx';
import { resources } from '../features/staff/domain/resources.js';

function EntryPage() {
  const auth = useAuth();
  if (auth.loading) return <LoadingState label="Opening your workspace…" />;
  if (auth.error) return <ErrorState error={auth.error} onRetry={auth.retry} />;
  if (auth.user) return <Navigate to={auth.user.must_change_password ? '/change-password' : dashboardPath(auth.user)} replace />;
  return <LoginPage gateway={{ login: auth.login }} onLogin={() => {}} />;
}

function LegacyTeacherRedirect({ records = false }) {
  const { user } = useAuth();
  const params = useParams();
  const { search, hash } = useLocation();
  const path = records ? `${workspacePath(user)}/records/${params['*'] || ''}` : dashboardPath(user);
  return <Navigate to={`${path}${search}${hash}`} replace />;
}

export default function StaffApp({ gateway, accountGateway }) {
  const auth = useAuth();
  const props = { gateway, onSessionExpired: auth.clearSession };
  const roles = { admin: [AdminLayout, AdminDashboard], teacher: [TeacherLayout, TeacherDashboard], student: [StudentLayout, StudentDashboard] };
  return <Routes>
    <Route path="/" element={<EntryPage />} />
    <Route path="/login" element={<EntryPage />} />
    <Route element={<ProtectedRoute allowPasswordChange />}><Route path="/change-password" element={<ChangePasswordPage />} /></Route>
    <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
      <Route path="/teacher" element={<LegacyTeacherRedirect />} />
      <Route path="/teacher/dashboard" element={<LegacyTeacherRedirect />} />
      <Route path="/teacher/records/*" element={<LegacyTeacherRedirect records />} />
    </Route>
    {Object.entries(roles).map(([role, [Layout, Dashboard]]) => <Route key={role} element={<ProtectedRoute allowedRoles={[role]} />}>
      <Route path={role === 'teacher' ? '/teacher/:teacherId' : `/${role}`} element={<Layout />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        {role === 'admin' && ['teacher', 'student'].map((accountRole) => <Route key={accountRole} path={`${accountRole}s`}>
          <Route index element={<AccountList key={accountRole} role={accountRole} gateway={accountGateway} />} />
          <Route path="new" element={<AccountForm key={`${accountRole}-new`} role={accountRole} gateway={accountGateway} records={gateway} />} />
          <Route path=":id/edit" element={<AccountForm key={`${accountRole}-edit`} role={accountRole} gateway={accountGateway} records={gateway} />} />
        </Route>)}
        {Object.keys(resources).filter((resource) => role === 'admin' || resource !== 'teachers').map((resource) => <Route key={resource} path={`records/${resource}`}>
          <Route index element={<RecordList canCreate={role === 'admin' || (role === 'teacher' && ['exams', 'scores'].includes(resource))} key={`${role}-${resource}`} resource={resource} {...props} basePath={`${role === 'teacher' ? workspacePath(auth.user) : `/${role}`}/records`} readOnly={role !== 'admin'} />} />
          <Route path=":id" element={<RecordDetail key={`${role}-${resource}`} resource={resource} {...props} basePath={`${role === 'teacher' ? workspacePath(auth.user) : `/${role}`}/records`} readOnly={role !== 'admin'} />} />
          {role === 'teacher' && ['exams', 'scores'].includes(resource) && <Route path="new" element={<RecordForm key={`teacher-${resource}-new`} resource={resource} {...props} basePath={`${workspacePath(auth.user)}/records`} teacherMode />} />}
          {role === 'admin' && <><Route path="new" element={<RecordForm key={`${resource}-new`} resource={resource} {...props} basePath="/admin/records" />} />
            <Route path=":id/edit" element={<RecordForm key={`${resource}-edit`} resource={resource} {...props} basePath="/admin/records" />} /></>}
        </Route>)}
      </Route>
    </Route>)}
    <Route path="/unauthorized" element={<main className="empty-state"><h1>Access denied</h1><p>This page is not available for your role.</p><Link className="button button-primary" to={auth.user ? dashboardPath(auth.user) : '/login'}>Return to my workspace</Link></main>} />
    <Route path="*" element={<main className="empty-state"><h1>Page not found</h1><Link className="button button-primary" to="/">Return to my workspace</Link></main>} />
  </Routes>;
}
