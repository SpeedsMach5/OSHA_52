import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, download } from '../api.js';
import { useSession } from '../session.jsx';
import { useApi, Loading, ErrorBox, formatDate, formatDateTime, TRACK_NAMES, weekStatus, minutes } from '../util.jsx';
import { useAction, Secret } from './common.jsx';
import { traineeStatus } from './Trainees.jsx';

function WeekGrid({ track, weeks, traineeId, onChange }) {
  const { busy, error, run } = useAction();
  const passed = weeks.filter(w => w.progress?.passed);
  const locked = weeks.filter(w => w.progress?.locked);
  const done = passed.reduce((s, w) => s + w.duration, 0);
  const unlock = w => run(async () => {
    await api(`/staff/trainees/${traineeId}/unlock-week`, { method: 'POST', body: { track, week: w.week } });
    onChange();
  });
  return (
    <section className="card">
      <div className="card-head">
        <h2>{TRACK_NAMES[track]} <span className="muted h-sub">29 CFR {track}</span></h2>
        <span className="small">{passed.length} of {weeks.length} weeks passed · {minutes(done)} completed</span>
      </div>
      <ol className="week-grid" aria-label={`${TRACK_NAMES[track]} weeks`}>
        {weeks.map(w => {
          const s = weekStatus(w.progress);
          return (
            <li key={w.week} className={`wk wk-${s.key}`} title={`Week ${w.week}: ${w.title} — ${s.label}${s.detail ? ` (${s.detail})` : ''}`}>
              <span className="wk-num">{w.week}</span>
              <span className="sr-only">{w.title}: {s.label}</span>
            </li>
          );
        })}
      </ol>
      <p className="legend small"><span className="wk-key wk-passed" /> Passed <span className="wk-key wk-retry" /> Not passed yet <span className="wk-key wk-locked" /> Locked <span className="wk-key wk-new" /> Not started</p>
      {locked.length > 0 && (
        <div className="locked-weeks">
          {locked.map(w => (
            <p key={w.week} className="flag-week">
              <span><strong>Week {w.week}</strong> {w.title}: locked after 2 fails</span>
              <button type="button" className="btn btn-secondary btn-small" disabled={busy} onClick={() => unlock(w)}>Unlock week {w.week}</button>
            </p>
          ))}
          {error && <p className="small fail">{error}</p>}
        </div>
      )}
    </section>
  );
}

export default function Trainee() {
  const { id } = useParams();
  const { session } = useSession();
  const isAdmin = session.user.role === 'admin';
  const { data, error, loading, reload } = useApi([`/staff/trainees/${id}`]);
  const act = useAction();
  const [resetCode, setResetCode] = useState(null);

  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const [{ trainee: t, tracks, attempts }] = data;
  const status = traineeStatus(t);

  const resetPin = () => act.run(async () => {
    if (!window.confirm(`Reset the PIN for ${t.name}? Their current PIN stops working and they will be signed out.`)) return;
    const r = await api(`/staff/trainees/${t.id}/reset-pin`, { method: 'POST' });
    setResetCode(r);
    reload();
  });
  const setActive = on => act.run(async () => {
    if (!on && !window.confirm(`Deactivate ${t.name}? They will be signed out and cannot sign in until reactivated. Their records are kept.`)) return;
    await api(`/admin/trainees/${t.id}/${on ? 'reactivate' : 'deactivate'}`, { method: 'POST' });
    reload();
  });
  const pdf = () => act.run(() => download(`/staff/trainees/${t.id}/record.pdf`, 'training-record.pdf'));

  return (
    <>
      <p className="crumbs"><Link to="/staff/trainees">Trainees</Link></p>
      <h1>{t.name}</h1>
      <p><span className={`chip chip-${status.key}`}>{status.label}</span> <span className="small muted">Account created {formatDate(t.createdAt)}</span></p>

      <div className="actions">
        <button type="button" className="btn btn-primary" disabled={act.busy} onClick={pdf}>Download training record (PDF)</button>
        <Link to={`/staff/results?traineeId=${t.id}`} className="btn btn-secondary">See all results</Link>
        {t.approval === 'approved' && <button type="button" className="btn btn-secondary" disabled={act.busy} onClick={resetPin}>Reset PIN</button>}
        {isAdmin && t.approval === 'approved' && (t.active
          ? <button type="button" className="btn btn-danger" disabled={act.busy} onClick={() => setActive(false)}>Deactivate</button>
          : <button type="button" className="btn btn-secondary" disabled={act.busy} onClick={() => setActive(true)}>Reactivate</button>)}
      </div>
      {act.error && <div className="notice notice-error" role="alert">{act.error}</div>}
      {resetCode && (
        <Secret label={`Reset code for ${t.name}`} value={resetCode.code}
          note={`Give this code to ${t.name} in person. It works once and expires ${formatDateTime(resetCode.expiresAt)}. They enter it on the sign-in page under "I have a reset code".`} />
      )}

      <WeekGrid track="1926" weeks={tracks['1926']} traineeId={t.id} onChange={reload} />
      <WeekGrid track="1910" weeks={tracks['1910']} traineeId={t.id} onChange={reload} />

      <h2>Attempt history</h2>
      {attempts.length === 0 ? <p className="muted">No tests taken yet.</p> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Date</th><th>Week</th><th>Score</th><th>Result</th></tr></thead>
            <tbody>
              {attempts.map(a => (
                <tr key={a.id}>
                  <td data-label="Date"><Link to={`/staff/attempts/${a.id}`}>{formatDateTime(a.submittedAt)}</Link></td>
                  <td data-label="Week">{TRACK_NAMES[a.track]} {a.week}: {a.weekTitle}</td>
                  <td data-label="Score">{Math.round(a.scorePct)}% ({a.correct}/{a.total})</td>
                  <td data-label="Result"><span className={a.passed ? 'pass' : 'fail'}>{a.passed ? 'Pass' : 'Fail'}</span>{a.practice && <span className="chip chip-new chip-gap">Practice</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
