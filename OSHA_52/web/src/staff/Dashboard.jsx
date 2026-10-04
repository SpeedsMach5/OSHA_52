import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useApi, Loading, ErrorBox, formatDate, TRACK_NAMES } from '../util.jsx';
import { useAction } from './common.jsx';

function Signup({ s, onDone }) {
  const { busy, error, run } = useAction();
  const decide = (verb, confirmText) => run(async () => {
    if (confirmText && !window.confirm(confirmText)) return;
    await api(`/staff/trainees/${s.id}/${verb}`, { method: 'POST' });
    onDone();
  });
  return (
    <li className="card signup">
      <div className="signup-main">
        <p className="signup-name">{s.name}</p>
        <p className="small muted">Signed up {formatDate(s.createdAt)}</p>
        {s.similarTo.length > 0 && (
          <div className="warn small" role="note">
            <strong>Similar to an existing trainee:</strong>
            <ul>{s.similarTo.map(x => <li key={x.id}><Link to={`/staff/trainees/${x.id}`}>{x.name}</Link> ({x.reason})</li>)}</ul>
            Check this isn't the same person signing up twice.
          </div>
        )}
        {error && <p className="notice notice-error small" role="alert">{error}</p>}
      </div>
      <div className="signup-actions">
        <button type="button" className="btn btn-primary btn-small" disabled={busy}
          onClick={() => decide('approve', s.similarTo.length ? `Approve ${s.name}? This name looks like ${s.similarTo.map(x => x.name).join(', ')}. Make sure it is a different person.` : null)}>Approve</button>
        <button type="button" className="btn btn-danger btn-small" disabled={busy}
          onClick={() => decide('reject', `Reject the sign-up for ${s.name}? They will not be able to sign in, and the name becomes free for someone else.`)}>Reject</button>
      </div>
    </li>
  );
}

function FlaggedWeek({ trainee, w, onDone }) {
  const { busy, error, run } = useAction();
  const unlock = () => run(async () => {
    await api(`/staff/trainees/${trainee.id}/unlock-week`, { method: 'POST', body: { track: w.track, week: w.week } });
    onDone();
  });
  return (
    <li className="flag-week">
      <span>{TRACK_NAMES[w.track]} week {w.week} · {w.fails} fails {w.locked && <span className="chip chip-locked">Locked</span>}</span>
      {w.locked && <button type="button" className="btn btn-secondary btn-small" disabled={busy} onClick={unlock}>Unlock</button>}
      {error && <span className="small fail">{error}</span>}
    </li>
  );
}

export default function Dashboard() {
  const { data, error, loading, reload } = useApi(['/staff/summary', '/staff/signups', '/staff/trainees']);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const [sum, { signups }, { trainees }] = data;
  const flagged = trainees.filter(t => t.flagged && t.approval === 'approved');
  const passRate = sum.attempts7d ? Math.round((sum.passes7d / sum.attempts7d) * 100) : null;

  return (
    <>
      <h1>Dashboard</h1>
      <section aria-labelledby="signups-h">
        <h2 id="signups-h">Pending sign-ups {signups.length > 0 && <span className="count">{signups.length}</span>}</h2>
        {signups.length === 0 ? <p className="muted">No sign-ups waiting.</p> : (
          <ul className="plain-list">{signups.map(s => <Signup key={s.id} s={s} onDone={reload} />)}</ul>
        )}
      </section>

      <section aria-labelledby="flag-h">
        <h2 id="flag-h">Needs attention {flagged.length > 0 && <span className="count count-warn">{flagged.length}</span>}</h2>
        <p className="small muted">Trainees with 2 or more fails on a week they haven't passed. A locked week needs you to unlock it after talking with the trainee.</p>
        {flagged.length === 0 ? <p className="muted">Nobody needs attention.</p> : (
          <ul className="plain-list">
            {flagged.map(t => (
              <li key={t.id} className="card flag">
                <Link to={`/staff/trainees/${t.id}`} className="flag-name">{t.name}</Link>
                <ul className="plain-list">{t.flaggedWeeks.map(w => <FlaggedWeek key={`${w.track}-${w.week}`} trainee={t} w={w} onDone={reload} />)}</ul>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="week-h">
        <h2 id="week-h">Last 7 days</h2>
        <div className="tiles">
          <div className="tile"><span className="tile-num">{sum.activeTrainees}</span><span className="tile-label">Active trainees</span></div>
          <div className="tile"><span className="tile-num">{sum.attempts7d}</span><span className="tile-label">Tests taken</span></div>
          <div className="tile"><span className="tile-num">{passRate == null ? '—' : `${passRate}%`}</span><span className="tile-label">Passed</span></div>
        </div>
        <p className="small"><Link to="/staff/results">See all results</Link> · <Link to="/staff/missed">Most-missed questions</Link></p>
      </section>
    </>
  );
}
