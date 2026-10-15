import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../application/AuthContext.jsx';
import { ErrorState, LoadingState } from '../../../components/Feedback.jsx';

export default function ProtectedRoute({ allowedRoles, allowPasswordChange = false }) {
  const auth = useAuth();
  if (auth.loading) return <LoadingState label="Opening your workspace…" />;
  if (auth.error) return <ErrorState error={auth.error} onRetry={auth.retry} />;
  if (!auth.tokens || !auth.user) return <Navigate to="/login" replace />;
  if (!allowPasswordChange && auth.user.must_change_password) return <Navigate to="/change-password" replace />;
  if (allowedRoles && !allowedRoles.includes(auth.role)) return <Navigate to="/unauthorized" replace />;
  return <Outlet />;
}
