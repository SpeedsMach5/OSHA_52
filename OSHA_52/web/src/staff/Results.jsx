import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { download } from '../api.js';
import { useApi, Loading, ErrorBox, formatDateTime, TRACK_NAMES } from '../util.jsx';
import { useAction, pct } from './common.jsx';

const FIELDS = ['track', 'week', 'traineeId', 'from', 'to', 'result'];

// Filter form shared by Results and Most missed. Filters live in the address bar, so views can be bookmarked.
export function Filters({ params, setParams, trainees, tracks, show = FIELDS }) {
  const [draft, setDraft] = useState(() => Object.fromEntries(FIELDS.map(k => [k, params.get(k) || ''])));
  useEffect(() => { setDraft(Object.fromEntries(FIELDS.map(k => [k, params.get(k) || '']))); }, [params]);
  const set = (k, v) => setDraft(d => ({ ...d, [k]: v, ...(k === 'track' ? { week: '' } : {}) }));
  const weeks = draft.track ? tracks.find(t => t.track === draft.track)?.weeks || [] : [];
  const apply = e => {
    e.preventDefault();
    const next = new URLSearchParams();
    for (const k of show) if (draft[k]) next.set(k, draft[k]);
    if (params.get('view')) next.set('view', params.get('view'));
    setParams(next);
  };
  const clear = () => setParams(params.get('view') ? { view: params.get('view') } : {});
  return (
    <form className="filters" onSubmit={apply}>
      {show.includes('track') && (
        <div className="field"><label htmlFor="f-track">Track</label>
          <select id="f-track" value={draft.track} onChange={e => set('track', e.target.value)}>
            <option value="">Both tracks</option>
            <option value="1926">Construction (1926)</option>
            <option value="1910">General Industry (1910)</option>
          </select></div>
      )}
      {show.includes('week') && (
        <div className="field"><label htmlFor="f-week">Week</label>
          <select id="f-week" value={draft.week} onChange={e => set('week', e.target.value)} disabled={!draft.track}>
            <option value="">{draft.track ? 'All weeks' : 'Choose a track first'}</option>
            {weeks.map(w => <option key={w.week} value={w.week}>Week {w.week}: {w.title}</option>)}
          </select></div>
      )}
      {show.includes('traineeId') && (
        <div className="field"><label htmlFor="f-trainee">Trainee</label>
          <select id="f-trainee" value={draft.traineeId} onChange={e => set('traineeId', e.target.value)}>
            <option value="">All trainees</option>
            {trainees.filter(t => t.approval === 'approved').map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select></div>
      )}
      {show.includes('from') && <div className="field"><label htmlFor="f-from">From</label><input id="f-from" type="date" value={draft.from} onChange={e => set('from', e.target.value)} /></div>}
      {show.includes('to') && <div className="field"><label htmlFor="f-to">To</label><input id="f-to" type="date" value={draft.to} onChange={e => set('to', e.target.value)} /></div>}
      {show.includes('result') && (
        <div className="field"><label htmlFor="f-result">Result</label>
          <select id="f-result" value={draft.result} onChange={e => set('result', e.target.value)}>
            <option value="">All attempts</option>
            <option value="pass">Passed</option>
            <option value="fail">Failed</option>
            <option value="graded">Graded only (no practice)</option>
            <option value="practice">Practice only</option>
          </select></div>
      )}
      <div className="filter-buttons">
        <button type="submit" className="btn btn-primary btn-small">Apply</button>
        <button type="button" className="btn btn-secondary btn-small" onClick={clear}>Clear</button>
      </div>
    </form>
  );
}

export function useTrackWeeks() {
  const { data } = useApi(['/tracks/1926/weeks', '/tracks/1910/weeks']);
  return data ? [{ track: '1926', weeks: data[0].weeks }, { track: '1910', weeks: data[1].weeks }] : [];
}

function AttemptsTable({ query }) {
  const [pages, setPages] = useState(1);
  useEffect(() => setPages(1), [query]);
  const { data, error, loading, reload } = useApi([`/staff/attempts?${query}${query ? '&' : ''}limit=${pages * 50}`]);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const [{ attempts, total }] = data;
  return (
    <>
      <p className="small muted">{total} attempt{total === 1 ? '' : 's'} match{total === 1 ? 'es' : ''}{attempts.length < total ? ` · showing ${attempts.length}` : ''}</p>
      {attempts.length === 0 ? <p className="muted">No attempts match these filters.</p> : (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Date</th><th>Trainee</th><th>Week</th><th>Score</th><th>Result</th></tr></thead>
            <tbody>
              {attempts.map(a => (
                <tr key={a.id}>
                  <td data-label="Date"><Link to={`/staff/attempts/${a.id}`}>{formatDateTime(a.submittedAt)}</Link></td>
                  <td data-label="Trainee"><Link to={`/staff/trainees/${a.traineeId}`}>{a.traineeName}</Link></td>
                  <td data-label="Week">{a.track} · {a.week}: {a.weekTitle}</td>
                  <td data-label="Score">{Math.round(a.scorePct)}%</td>
                  <td data-label="Result"><span className={a.passed ? 'pass' : 'fail'}>{a.passed ? 'Pass' : 'Fail'}</span>{a.practice && <span className="chip chip-new chip-gap">Practice</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {attempts.length < total && <p><button type="button" className="btn btn-secondary" onClick={() => setPages(p => p + 1)}>Show more</button></p>}
    </>
  );
}

function ByWeek({ params }) {
  const track = params.get('track');
  const q = new URLSearchParams();
  for (const k of ['track', 'week', 'traineeId', 'from', 'to']) if (params.get(k)) q.set(k, params.get(k));
  const { data, error, loading, reload } = useApi(track ? [`/staff/stats/weeks?${q}`] : []);
  if (!track) return <p className="notice">Choose a track in the filters to see results by week.</p>;
  if (loading && !data) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const [{ weeks }] = data;
  return (
    <div className="table-wrap">
      <table className="table">
        <thead><tr><th>Week</th><th>Trainees tested</th><th>Trainees passed</th><th>Graded attempts</th><th>Fails</th><th>Average score</th></tr></thead>
        <tbody>
          {weeks.map(w => (
            <tr key={w.week}>
              <td data-label="Week"><Link to={`/staff/results?${new URLSearchParams({ ...Object.fromEntries(q), week: w.week })}`}>{w.week}: {w.title}</Link></td>
              <td data-label="Trainees tested">{w.trainees}</td>
              <td data-label="Trainees passed">{w.traineesPassed}</td>
              <td data-label="Graded attempts">{w.attempts}</td>
              <td data-label="Fails">{w.fails}</td>
              <td data-label="Average score">{pct(w.avgScore)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Results() {
  const [params, setParams] = useSearchParams();
  const { data } = useApi(['/staff/trainees']);
  const tracks = useTrackWeeks();
  const csv = useAction();
  const view = params.get('view') === 'weeks' ? 'weeks' : 'attempts';
  const query = new URLSearchParams(FIELDS.filter(k => params.get(k)).map(k => [k, params.get(k)])).toString();
  // The by-week table ignores the result filter, so its export does too.
  const weekQuery = new URLSearchParams(FIELDS.filter(k => k !== 'result' && params.get(k)).map(k => [k, params.get(k)])).toString();
  const setView = v => { const n = new URLSearchParams(params); if (v === 'weeks') n.set('view', 'weeks'); else n.delete('view'); setParams(n); };
  const trainee = data?.[0].trainees.find(t => String(t.id) === params.get('traineeId'));

  return (
    <>
      <h1>Results{trainee ? `: ${trainee.name}` : ''}</h1>
      <Filters params={params} setParams={setParams} trainees={data?.[0].trainees || []} tracks={tracks} />
      <div className="results-bar">
        <div className="segmented" role="tablist">
          <button type="button" role="tab" aria-selected={view === 'attempts'} className={view === 'attempts' ? 'on' : ''} onClick={() => setView('attempts')}>Attempts</button>
          <button type="button" role="tab" aria-selected={view === 'weeks'} className={view === 'weeks' ? 'on' : ''} onClick={() => setView('weeks')}>By week</button>
        </div>
        <button type="button" className="btn btn-secondary btn-small" disabled={csv.busy || (view === 'weeks' && !params.get('track'))}
          onClick={() => csv.run(() => download(view === 'weeks' ? `/staff/stats/weeks.csv?${weekQuery}` : `/staff/attempts.csv${query ? `?${query}` : ''}`, 'osha52-results.csv'))}>
          {csv.busy ? 'Preparing…' : view === 'weeks' ? 'Export this table (CSV)' : 'Export CSV'}
        </button>
      </div>
      {csv.error && <div className="notice notice-error" role="alert">{csv.error}</div>}
      <p className="small muted">{view === 'weeks'
        ? 'The export has this table. The result filter does not apply here, and practice attempts are left out of passes, attempt counts and averages.'
        : 'The export has every attempt that matches the filters.'}</p>
      {view === 'attempts' ? <AttemptsTable query={query} /> : <ByWeek params={params} />}
    </>
  );
}

