import RoleLayout from './RoleLayout.jsx';
const navigation = [
  { path: '/student/dashboard', label: 'Dashboard', icon: 'book' },
  { path: '/student/records/students', label: 'My profile', icon: 'students' },
  { path: '/student/records/groups', label: 'My class', icon: 'groups' },
  { path: '/student/records/exams', label: 'My exams', icon: 'exams' },
  { path: '/student/records/scores', label: 'My scores', icon: 'scores' },
];
export default function StudentLayout() { return <RoleLayout roleLabel="Student" navigation={navigation} />; }
