import { useState } from 'react';

// Runs an action button's request, showing "Working…" and any error next to it.
export function useAction() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const run = async fn => {
    setBusy(true);
    setError('');
    try { return await fn(); } catch (err) { setError(err.message); return undefined; } finally { setBusy(false); }
  };
  return { busy, error, run, setError };
}

// A one-time link or code to hand over, with a copy button (falls back to selecting the text).
export function Secret({ label, value, note }) {
  const [copied, setCopied] = useState(false);
  const copy = async e => {
    const box = e.currentTarget.parentElement.querySelector('input');
    try { await navigator.clipboard.writeText(value); setCopied(true); } catch { box.select(); }
  };
  return (
    <div className="secret" role="status">
      <label className="small">{label}</label>
      <div className="secret-row">
        <input readOnly value={value} onFocus={e => e.target.select()} aria-label={label} />
        <button type="button" className="btn btn-secondary btn-small" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
      </div>
      {note && <p className="small muted">{note}</p>}
    </div>
  );
}

export const pct = n => (n == null ? '—' : `${Math.round(n)}%`);
