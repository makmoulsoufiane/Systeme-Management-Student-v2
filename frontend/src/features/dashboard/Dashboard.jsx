import { Link } from 'react-router-dom';
import { useAuth } from '../auth/application/AuthContext.jsx';
import { workspacePath } from '../auth/application/workspacePaths.js';

const sections = {
  admin: [['teachers', 'Teacher accounts', 'Create accounts and manage teacher access.'], ['students', 'Student accounts', 'Create accounts and manage student access.'], ['records/groups', 'School records', 'Manage classes, students, exams, and scores.']],
  teacher: [['records/groups', 'My classes', 'View the classes assigned to you.'], ['records/students', 'My students', 'View students in your classes.'], ['records/scores', 'Student scores', 'Review scores for your students.']],
  student: [['records/students', 'My profile', 'View your enrollment details.'], ['records/exams', 'My exams', 'See the exams scheduled for your class.'], ['records/scores', 'My scores', 'Review your exam results.']],
};
function Dashboard({ role }) {
  const { user } = useAuth();
  return <><header className="page-heading"><div><p className="eyebrow">{role} workspace</p>
    <h1 className="page-title">Welcome, {user.display_name || user.username}</h1>
    <p className="page-description">{role === 'admin' ? 'Manage school records and account access.' : 'Your school information, all in one place.'}</p></div></header>
    <div className="dashboard-grid">{sections[role].map(([path, title, description]) => <Link className="panel dashboard-card" key={path} to={`${workspacePath(user)}/${path}`}><h2>{title}</h2><p>{description}</p><span>Open →</span></Link>)}</div>
  </>;
}
export function AdminDashboard() { return <Dashboard role="admin" />; }
export function TeacherDashboard() { return <Dashboard role="teacher" />; }
export function StudentDashboard() { return <Dashboard role="student" />; }
