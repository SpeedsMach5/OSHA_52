import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useSession } from '../session.jsx';
import { useApi, Loading } from '../util.jsx';

const MIN = 10;

// One-time link from the administrator: a reviewer invite (/invite/:token) or a password reset (/reset-password/:token).
export default function SetPassword() {
  const { token } = useParams();
  const { signIn } = useSession();
  const navigate = useNavigate();
  const { data, error, loading } = useApi([`/auth/invite/${encodeURIComponent(token)}`], 'staff');
  const [password, setPassword] = useState('');
  const [again, setAgain] = useState('');
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return <main className="page page-narrow"><Loading /></main>;
  if (error) {
    return (
      <main className="page page-narrow">
        <h1 className="app-title">OSHA 52 Reviewer</h1>
        <div className="card"><div className="notice notice-error" role="alert">{error.message}</div></div>
      </main>
    );
  }
  const inv = data[0];
  const isReset = inv.kind === 'password_reset';

  async function submit(e) {
    e.preventDefault();
    setFormError('');
    if (password.length < MIN) { setFormError(`Use at least ${MIN} characters.`); return; }
    if (password !== again) { setFormError('The two passwords do not match.'); return; }
    setBusy(true);
    try {
      signIn(await api('/auth/invite/accept', { method: 'POST', body: { token, password }, realm: 'staff' }));
      navigate('/staff', { replace: true });
    } catch (err) {
      setFormError(err.message);
      setBusy(false);
    }
  }

  return (
    <main className="page page-narrow">
      <h1 className="app-title">{isReset ? 'Reset your password' : 'Welcome to OSHA 52'}</h1>
      <div className="card">
        <p><strong>{inv.name}</strong><br /><span className="muted">{inv.email}</span></p>
        <p className="muted small">{isReset ? 'Choose a new password. Your old password no longer works.' : 'You have been invited as a reviewer. Choose a password to finish setting up your account.'} This link works once.</p>
        <form onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="pw">Password (at least {MIN} characters)</label>
            <input id="pw" type="password" autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="pw2">Password again</label>
            <input id="pw2" type="password" autoComplete="new-password" value={again} onChange={e => setAgain(e.target.value)} required />
          </div>
          {formError && <div className="notice notice-error" role="alert">{formError}</div>}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Saving…' : isReset ? 'Set new password' : 'Create my account'}</button>
        </form>
      </div>
    </main>
  );
}
