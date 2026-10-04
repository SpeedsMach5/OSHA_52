import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from './api.js';

// Loads one or more API paths; returns { data, error, loading, reload }.
export function useApi(paths, realm) {
  const key = JSON.stringify(paths);
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const latest = useRef(0); // only the newest request may update the page
  const load = useCallback(async () => {
    const id = ++latest.current;
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const list = JSON.parse(key);
      const results = await Promise.all(list.map(p => api(p, { realm })));
      if (id === latest.current) setState({ data: results, error: null, loading: false });
    } catch (error) {
      if (id === latest.current) setState({ data: null, error, loading: false });
    }
  }, [key, realm]);
  useEffect(() => { load(); }, [load]);
  return { ...state, reload: load };
}

export function Loading() {
  return <p className="muted" role="status">Loading…</p>;
}

export function ErrorBox({ error, onRetry }) {
  return (
    <div className="notice notice-error" role="alert">
      <p>{error.message}</p>
      {onRetry && <button type="button" className="btn btn-secondary" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export const TRACK_NAMES = { 1926: 'Construction', 1910: 'General Industry' };

export function formatDateTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function minutes(total) {
  const h = Math.floor(total / 60), m = total % 60;
  return h ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`;
}

// Status of a week for the trainee, from the API's progress object.
export function weekStatus(p) {
  if (!p) return { key: 'new', label: 'Not started' };
  if (p.passed) return { key: 'passed', label: 'Passed', detail: p.bestScore != null ? `Best ${Math.round(p.bestScore)}%` : '' };
  if (p.locked) return { key: 'locked', label: 'Locked', detail: 'Talk to your trainer' };
  if (p.availableAt) return { key: 'wait', label: 'Try again tomorrow', detail: p.bestScore != null ? `Best ${Math.round(p.bestScore)}%` : '' };
  if (p.attempts > 0) return { key: 'retry', label: 'Not passed yet', detail: `Best ${Math.round(p.bestScore)}%` };
  return { key: 'new', label: 'Not started' };
}

export function StatusChip({ status }) {
  return <span className={`chip chip-${status.key}`}>{status.label}</span>;
}
