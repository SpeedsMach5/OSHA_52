import { useState } from 'react';
import { api } from '../api.js';
import { useSession } from '../session.jsx';

const TABS = [
  { id: 'signin', label: 'Sign in' },
  { id: 'register', label: 'New trainee' },
  { id: 'reset', label: 'I have a reset code' },
];

function PinField({ id, label, value, onChange, autoComplete = 'current-password' }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="password" inputMode="numeric" pattern="[0-9]*" maxLength={4} autoComplete={autoComplete}
        value={value} onChange={e => onChange(e.target.value.replace(/\D/g, '').slice(0, 4))} required />
    </div>
  );
}

function NameField({ value, onChange }) {
  return (
    <div className="field">
      <label htmlFor="name">Full name</label>
      <input id="name" type="text" autoComplete="name" autoCapitalize="words" value={value} onChange={e => onChange(e.target.value)} required />
    </div>
  );
}

export default function Login() {
  const { signIn, notice, setNotice } = useSession();
  const [tab, setTab] = useState('signin');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [pin2, setPin2] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState('');

  const switchTab = id => { setTab(id); setError(''); setPin(''); setPin2(''); setCode(''); };

  async function submit(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    if (tab !== 'signin' && pin !== pin2) { setError('The two PINs do not match.'); return; }
    if (pin.length !== 4) { setError('Your PIN is 4 digits.'); return; }
    setBusy(true);
    try {
      if (tab === 'signin') {
        signIn(await api('/auth/trainee/login', { method: 'POST', body: { name, pin } }));
      } else if (tab === 'register') {
        const r = await api('/auth/trainee/register', { method: 'POST', body: { name, pin } });
        setPending(r.message);
      } else {
        signIn(await api('/auth/trainee/reset-pin', { method: 'POST', body: { name, code, pin } }));
      }
    } catch (err) {
      if (err.code === 'pin_reset_required') { switchTab('reset'); setError(err.message); }
      else if (err.code === 'pending_approval') setPending(err.message);
      else setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (pending) {
    return (
      <main className="page page-narrow">
        <h1 className="app-title">OSHA 52 Training</h1>
        <div className="card center">
          <h2>Thanks, {name.trim() || 'trainee'}</h2>
          <p className="lead">{pending}</p>
          <p className="muted">A reviewer will approve your account. Then sign in with your name and PIN.</p>
          <button type="button" className="btn btn-secondary" onClick={() => { setPending(''); switchTab('signin'); }}>Back to sign in</button>
        </div>
      </main>
    );
  }

  return (
    <main className="page page-narrow">
      <h1 className="app-title">OSHA 52 Training</h1>
      <p className="muted center">Weekly safety training for 29 CFR 1926 and 1910</p>
      <div className="card">
        <div className="tabs" role="tablist">
          {TABS.map(t => (
            <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} className={`tab ${tab === t.id ? 'tab-active' : ''}`} onClick={() => switchTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        {notice && <div className="notice" role="status">{notice}</div>}
        <form onSubmit={submit} noValidate>
          <NameField value={name} onChange={setName} />
          {tab === 'reset' && (
            <div className="field">
              <label htmlFor="code">6-digit reset code from your trainer</label>
              <input id="code" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={6} autoComplete="one-time-code"
                value={code} onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))} required />
            </div>
          )}
          <PinField id="pin" label={tab === 'signin' ? '4-digit PIN' : tab === 'register' ? 'Choose a 4-digit PIN' : 'New 4-digit PIN'}
            value={pin} onChange={setPin} autoComplete={tab === 'signin' ? 'current-password' : 'new-password'} />
          {tab !== 'signin' && <PinField id="pin2" label="Enter the PIN again" value={pin2} onChange={setPin2} autoComplete="new-password" />}
          {error && <div className="notice notice-error" role="alert">{error}</div>}
          <button type="submit" className="btn btn-primary btn-block" disabled={busy}>
            {busy ? 'Please wait…' : tab === 'signin' ? 'Sign in' : tab === 'register' ? 'Create account' : 'Set new PIN'}
          </button>
        </form>
        {tab === 'register' && <p className="muted small">Use your full name. If your name is already taken, add a middle initial. A reviewer approves new accounts.</p>}
        {tab === 'signin' && <p className="muted small">Forgot your PIN? Ask your trainer for a reset code.</p>}
      </div>
    </main>
  );
}
