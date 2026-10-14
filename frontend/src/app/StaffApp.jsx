import { useCallback, useEffect, useState } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from '../components/AppShell.jsx';
import { ErrorState, LoadingState } from '../components/Feedback.jsx';
import LoginPage from '../features/auth/presentation/LoginPage.jsx';
import RecordList from '../features/staff/presentation/RecordList.jsx';
import RecordForm from '../features/staff/presentation/RecordForm.jsx';
import RecordDetail from '../features/staff/presentation/RecordDetail.jsx';
import { resources } from '../features/staff/domain/resources.js';

export default function StaffApp({ gateway }) {
  const [session, setSession] = useState({ loading: true, user: null, error: null });
  const [revision, setRevision] = useState(0);
  const [logoutError, setLogoutError] = useState(null);
  const onSessionExpired = useCallback(() => setSession({ loading: false, user: null, error: null }), []);
  useEffect(() => {
    let active = true;
    setSession({ loading: true, user: null, error: null });
    gateway.session().then((user) => { if (active) setSession({ loading: false, user, error: null }); })
      .catch((error) => { if (active) setSession({ loading: false, user: null, error }); });
    return () => { active = false; };
  }, [gateway, revision]);

  async function logout() {
    setLogoutError(null);
    try { await gateway.logout(); onSessionExpired(); }
    catch (error) { if (error.status === 401) onSessionExpired(); else setLogoutError(error); }
  }

  if (session.loading) return <main className="login-page"><LoadingState label="Opening your workspace…" /></main>;
  if (session.error) return <main className="login-page"><section className="login-card"><h1>Let’s reconnect.</h1><ErrorState error={session.error} onRetry={() => setRevision(revision + 1)} /></section></main>;
  if (!session.user) return <LoginPage gateway={gateway} onLogin={(user) => setSession({ loading: false, user, error: null })} />;

  const props = { gateway, onSessionExpired };
  return <AppShell user={session.user} onLogout={logout}>
    {logoutError && <ErrorState error={logoutError} />}
    <Routes><Route path="/" element={<Navigate to="/students" replace />} />
      {Object.keys(resources).map((resource) => <Route key={resource} path={`/${resource}`}>
        <Route index element={<RecordList key={resource} resource={resource} {...props} />} />
        <Route path="new" element={<RecordForm key={`${resource}-new`} resource={resource} {...props} />} />
        <Route path=":id" element={<RecordDetail key={resource} resource={resource} {...props} />} />
        <Route path=":id/edit" element={<RecordForm key={`${resource}-edit`} resource={resource} {...props} />} />
      </Route>)}
      <Route path="*" element={<section className="empty-state"><h1>Page not found</h1><p>Let’s get you back to your workspace.</p><Link className="button button-primary" to="/students">View students</Link></section>} />
    </Routes>
  </AppShell>;
}
