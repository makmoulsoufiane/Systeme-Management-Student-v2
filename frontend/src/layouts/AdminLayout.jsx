import RoleLayout from './RoleLayout.jsx';
const navigation = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: 'book' },
  { path: '/admin/teachers', label: 'Teacher accounts', icon: 'teachers' },
  { path: '/admin/students', label: 'Student accounts', icon: 'students' },
  ...['students', 'teachers', 'groups', 'exams', 'scores'].map((name) => ({ path: `/admin/records/${name}`, label: `${name[0].toUpperCase()}${name.slice(1)}`, icon: name })),
];
export default function AdminLayout() { return <RoleLayout roleLabel="Admin" navigation={navigation} />; }
