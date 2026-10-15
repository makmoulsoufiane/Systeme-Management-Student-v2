import { useState } from 'react';
import Icon from '../../../components/Icon.jsx';
import './login.css';

export default function LoginPage({ gateway, onLogin }) {
  const [error, setError] = useState(null);
  const [pending, setPending] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);

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

  return (
    <main className="login-page glass-login" data-motion={motionPaused ? 'paused' : 'playing'}>
      <div className="glass-scene" aria-hidden="true">
        <div className="glass-light glass-light-blue" />
        <div className="glass-light glass-light-peach" />
        <div className="glass-orb glass-orb-large" />
        <div className="glass-orb glass-orb-small" />
        <div className="glass-horizon" />
      </div>

      <button
        className="motion-toggle"
        type="button"
        aria-pressed={motionPaused}
        onClick={() => setMotionPaused(!motionPaused)}
      >
        <span className={motionPaused ? 'motion-symbol is-paused' : 'motion-symbol'} aria-hidden="true" />
        {motionPaused ? 'Resume animation' : 'Pause animation'}
      </button>

      <section className="login-card" aria-labelledby="login-title">
        <div className="login-brand">
          <span className="brand-mark"><Icon name="book" size={27} /></span>
          <span>Campus<span className="login-brand-dot">.</span></span>
        </div>

        <div className="login-intro">
          <p className="eyebrow"><span aria-hidden="true" />YOUR SCHOOL WORKSPACE</p>
          <h1 id="login-title">Welcome to<br /><span>Campus.</span></h1>
          <p className="page-description">Manage students, teachers, groups, exams, and scores in one place.</p>
        </div>

        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="username">Username</label>
            <input id="username" name="username" autoComplete="username" autoFocus required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
          {error && <p className="error-banner" role="alert">{error}</p>}
          <button className="button button-primary" disabled={pending}>
            {pending ? 'Signing in…' : 'Sign in to workspace'}<Icon name="chevron" />
          </button>
        </form>

        <p className="login-note"><Icon name="shield" size={17} />Sign in with your school account. Contact your administrator if you need access.</p>
      </section>
      <p className="login-footer">Less administration. <span>More possibility.</span></p>
    </main>
  );
}
