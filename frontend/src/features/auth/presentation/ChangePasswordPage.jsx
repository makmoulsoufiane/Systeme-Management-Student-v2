import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../application/AuthContext.jsx';
import { dashboardPath } from '../application/workspacePaths.js';

export default function ChangePasswordPage() {
  const auth = useAuth();
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const [complete, setComplete] = useState(false);
  if (complete) return <Navigate to={dashboardPath(auth.user)} replace />;
  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (form.get('new_password') !== form.get('confirm_password')) { setError({ message: 'The new passwords do not match.' }); return; }
    setPending(true); setError(null);
    try {
      await auth.changePassword({ current_password: form.get('current_password'), new_password: form.get('new_password') });
      setComplete(true);
    } catch (failure) { setError(failure); }
    finally { setPending(false); }
  }
  return <main className="login-page"><section className="login-card">
    <h1>Change your password</h1>
    <p>{auth.user.must_change_password ? 'Choose a new password before opening your workspace.' : 'Choose a strong password you do not use elsewhere.'}</p>
    <form onSubmit={submit}>
      {[['current_password', 'Current password'], ['new_password', 'New password'], ['confirm_password', 'Confirm new password']].map(([name, label]) => <div className="field" key={name}>
        <label htmlFor={name}>{label}</label><input id={name} name={name} type="password" required autoComplete={name === 'current_password' ? 'current-password' : 'new-password'} />
        {error?.fields?.[name] && <p className="field-error">{error.fields[name].join(' ')}</p>}
      </div>)}
      <p className="field-hint">Use at least 8 characters. Avoid common passwords, personal details, and passwords made only of numbers.</p>
      {error && <p className="error-banner" role="alert">{error.message}</p>}
      <button className="button button-primary" disabled={pending}>{pending ? 'Saving…' : 'Save new password'}</button>
      <button className="button button-secondary" type="button" onClick={() => auth.logout().catch(() => {})}>Sign out</button>
    </form>
  </section></main>;
}
