import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useSession } from '../session.jsx';

export default function StaffLogin() {
  const { session, signIn, notice, setNotice } = useSession();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (session) return <Navigate to={session.user.mustChangePassword ? '/staff/change-password' : location.state?.from || '/staff'} replace />;

  async function submit(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const s = await api('/auth/staff/login', { method: 'POST', body: { email, password }, realm: 'staff' });
      signIn(s);
      navigate(s.user.mustChangePassword ? '/staff/change-password' : location.state?.from || '/staff', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="page page-narrow">
      <h1 className="app-title">OSHA 52 Reviewer</h1>
      <p className="muted center">For trainers, reviewers and administrators</p>
      <div className="card">
        {notice && <div className="notice" role="status">{notice}</div>}
        <form onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <div className="notice notice-error" role="alert">{error}</div>}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>{busy ? 'Please wait…' : 'Sign in'}</button>
        </form>
        <p className="muted small">Forgot your password? Ask your administrator for a reset link. Trainees sign in on the <a href="/login">trainee page</a>.</p>
      </div>
    </main>
  );
}
