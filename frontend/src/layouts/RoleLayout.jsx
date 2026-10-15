import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import AppShell from '../components/AppShell.jsx';
import { useAuth } from '../features/auth/application/AuthContext.jsx';

export default function RoleLayout({ roleLabel, navigation }) {
  const auth = useAuth();
  const [pending, setPending] = useState(false);
  async function logout() {
    if (pending) return;
    setPending(true);
    try { await auth.logout(); } catch { /* Local tokens are always cleared by AuthContext. */ }
    finally { setPending(false); }
  }
  return <AppShell user={auth.user} onLogout={logout} roleLabel={roleLabel} navigation={navigation}>
    <div className="account-settings"><Link to="/change-password">Change password</Link></div>
    <Outlet />
  </AppShell>;
}
