import RoleLayout from './RoleLayout.jsx';
import { Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../features/auth/application/AuthContext.jsx';
import { workspacePath } from '../features/auth/application/workspacePaths.js';
const navigation = [
  { path: 'dashboard', label: 'Dashboard', icon: 'book' },
  { path: 'records/groups', label: 'My classes', icon: 'groups' },
  { path: 'records/students', label: 'My students', icon: 'students' },
  { path: 'records/exams', label: 'Class exams', icon: 'exams' },
  { path: 'records/scores', label: 'Student scores', icon: 'scores' },
];
export default function TeacherLayout() {
  const { user } = useAuth();
  const { teacherId } = useParams();
  if (teacherId !== String(user.id)) return <Navigate to="/unauthorized" replace />;
  const basePath = workspacePath(user);
  return <RoleLayout roleLabel="Teacher" navigation={navigation.map((item) => ({ ...item, path: `${basePath}/${item.path}` }))} />;
}
