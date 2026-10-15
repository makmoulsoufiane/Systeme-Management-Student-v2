export function workspacePath(user) {
  if (user?.role === 'teacher' && user.id) return `/teacher/${user.id}`;
  if (['admin', 'student'].includes(user?.role)) return `/${user.role}`;
  return '/unauthorized';
}

export function dashboardPath(user) {
  const path = workspacePath(user);
  return path === '/unauthorized' ? path : `${path}/dashboard`;
}
