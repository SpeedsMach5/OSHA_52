import { Link, useSearchParams } from 'react-router-dom';
import { useApi, Loading, ErrorBox, formatDate } from '../util.jsx';

export function traineeStatus(t) {
  if (t.approval === 'pending') return { key: 'wait', label: 'Pending approval' };
  if (!t.active) return { key: 'locked', label: 'Deactivated' };
  if (t.locked || t.loginLocked) return { key: 'locked', label: 'Sign-in locked' };
  if (t.pinResetPending) return { key: 'wait', label: 'PIN reset pending' };
  return { key: 'passed', label: 'Active' };
}

// CSV of exactly the list on screen (same search and filter). Formula-like cells are neutralized, as on the server.
function exportCsv(list) {
  const cell = v => { let s = v == null ? '' : String(v); if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; return `"${s.replace(/"/g, '""')}"`; };
  const rows = [['Name', 'Status', 'Construction weeks passed (of 52)', 'General Industry weeks passed (of 26)', 'Tests taken', 'Last test', 'Needs attention'],
    ...list.map(t => [t.name, traineeStatus(t).label, t.weeksPassed['1926'], t.weeksPassed['1910'], t.attempts, t.lastAttemptAt ? formatDate(t.lastAttemptAt) : '',
      t.flaggedWeeks.map(w => `${w.track} week ${w.week} (${w.fails} fails${w.locked ? ', locked' : ''})`).join('; ')])];
  const blob = new Blob([String.fromCharCode(0xfeff) + rows.map(r => r.map(cell).join(',')).join('\r\n') + '\r\n'], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `osha52-trainees-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
}

export default function Trainees() {
  const { data, error, loading, reload } = useApi(['/staff/trainees']);
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const show = params.get('show') || 'all';
  const setParam = (k, v) => { const n = new URLSearchParams(params); if (v && v !== 'all') n.set(k, v); else n.delete(k); setParams(n, { replace: true }); };
  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const [{ trainees }] = data;
  const list = trainees
    .filter(t => t.name.toLowerCase().includes(q.trim().toLowerCase()))
    .filter(t => show === 'all' || (show === 'flagged' ? t.flagged : show === 'inactive' ? !t.active : t.approval === 'pending'));

  return (
    <>
      <h1>Trainees</h1>
      <div className="filters">
        <div className="field">
          <label htmlFor="q">Search by name</label>
          <input id="q" type="search" value={q} onChange={e => setParam('q', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="show">Show</label>
          <select id="show" value={show} onChange={e => setParam('show', e.target.value)}>
            <option value="all">Everyone</option>
            <option value="flagged">Needs attention</option>
            <option value="pending">Pending approval</option>
            <option value="inactive">Deactivated</option>
          </select>
        </div>
      </div>
      <div className="results-bar">
        <p className="small muted">{list.length} of {trainees.length} trainees</p>
        <button type="button" className="btn btn-secondary btn-small" onClick={() => exportCsv(list)}>Export CSV</button>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Status</th><th>Construction</th><th>General Industry</th><th>Tests</th><th>Last test</th></tr>
          </thead>
          <tbody>
            {list.map(t => {
              const s = traineeStatus(t);
              return (
                <tr key={t.id}>
                  <td data-label="Name"><Link to={`/staff/trainees/${t.id}`}><strong>{t.name}</strong></Link>{t.flagged && <span className="chip chip-locked chip-gap">Needs attention</span>}</td>
                  <td data-label="Status"><span className={`chip chip-${s.key}`}>{s.label}</span></td>
                  <td data-label="Construction">{t.weeksPassed['1926']} / 52 weeks</td>
                  <td data-label="General Industry">{t.weeksPassed['1910']} / 26 weeks</td>
                  <td data-label="Tests">{t.attempts}</td>
                  <td data-label="Last test">{t.lastAttemptAt ? formatDate(t.lastAttemptAt) : '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
