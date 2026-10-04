import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useSession } from '../session.jsx';

const MIN = 10;

// Required on first sign-in with the initial password; also reachable any time.
export default function ChangePassword() {
  const { session, update, logout } = useSession();
  const navigate = useNavigate();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [again, setAgain] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (!session) return <Navigate to="/staff/login" replace />;
  const forced = session.user.mustChangePassword;

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (next.length < MIN) { setError(`Use at least ${MIN} characters.`); return; }
    if (next !== again) { setError('The two new passwords do not match.'); return; }
    setBusy(true);
    try {
      update(await api('/auth/staff/change-password', { method: 'POST', body: { currentPassword: current, newPassword: next }, realm: 'staff' }));
      navigate('/staff', { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <main className="page page-narrow">
      <h1 className="app-title">Change your password</h1>
      <div className="card">
        {forced && <div className="notice" role="status">This is your first sign-in. Choose a new password to continue.</div>}
        <form onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="cur">Current password</label>
            <input id="cur" type="password" autoComplete="current-password" value={current} onChange={e => setCurrent(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="new">New password (at least {MIN} characters)</label>
            <input id="new" type="password" autoComplete="new-password" value={next} onChange={e => setNext(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="again">New password again</label>
            <input id="again" type="password" autoComplete="new-password" value={again} onChange={e => setAgain(e.target.value)} required />
          </div>
          {error && <div className="notice notice-error" role="alert">{error}</div>}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Saving…' : 'Save new password'}</button>
        </form>
        <p className="center"><button type="button" className="linkbtn" onClick={() => logout()}>Log out</button></p>
      </div>
    </main>
  );
}
