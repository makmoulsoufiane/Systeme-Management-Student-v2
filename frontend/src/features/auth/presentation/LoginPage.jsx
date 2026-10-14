import { useState } from 'react';
import Icon from '../../../components/Icon.jsx';

export default function LoginPage({ gateway, onLogin }) {
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);
    try {
      onLogin(await gateway.login({ username: form.get('username'), password: form.get('password') }));
    } catch (failure) { setError(failure.message); }
    finally { setPending(false); }
  }

  return <main className="login-page"><section className="login-card" aria-labelledby="login-title">
    <div className="login-brand"><span className="brand-mark"><Icon name="book" size={28} /></span><span>Campus</span></div>
    <p className="eyebrow">YOUR ACADEMIC WORKSPACE</p>
    <h1 id="login-title">A little clarity.<br />A better school day.</h1>
    <p className="page-description">Sign in to keep your students, people, and learning connected.</p>
    <form onSubmit={submit}>
      <div className="field"><label htmlFor="username">Username</label><input id="username" name="username" autoComplete="username" autoFocus required /></div>
      <div className="field"><label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required /></div>
      {error && <p className="error-banner" role="alert">{error}</p>}
      <button className="button button-primary" disabled={pending}>{pending ? 'Signing in…' : 'Sign in to workspace'}<Icon name="chevron" /></button>
    </form>
    <p className="login-note"><Icon name="shield" size={16} />For authorized school staff. Use your Django staff account.</p>
  </section><p className="login-footer">Less administration. More possibility.</p></main>;
}
