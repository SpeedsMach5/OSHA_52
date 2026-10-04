import { useSearchParams } from 'react-router-dom';
import { download } from '../api.js';
import { useAction } from './common.jsx';
import { useApi, Loading, ErrorBox, TRACK_NAMES } from '../util.jsx';
import { Filters, useTrackWeeks } from './Results.jsx';

// Questions trainees miss most, across graded attempts (practice left out). Useful for toolbox-talk topics.
export default function Missed() {
  const [params, setParams] = useSearchParams();
  const tracks = useTrackWeeks();
  const q = new URLSearchParams();
  for (const k of ['track', 'week', 'from', 'to']) if (params.get(k)) q.set(k, params.get(k));
  const { data, error, loading, reload } = useApi([`/staff/stats/missed?${q}&limit=25`]);
  const csv = useAction();

  return (
    <>
      <h1>Most-missed questions</h1>
      <Filters params={params} setParams={setParams} trainees={[]} tracks={tracks} show={['track', 'week', 'from', 'to']} />
      <div className="results-bar">
        <span />
        <button type="button" className="btn btn-secondary btn-small" disabled={csv.busy}
          onClick={() => csv.run(() => download(`/staff/stats/missed.csv?${q}&limit=25`, 'osha52-most-missed.csv'))}>{csv.busy ? 'Preparing…' : 'Export CSV'}</button>
      </div>
      {csv.error && <div className="notice notice-error" role="alert">{csv.error}</div>}
      {loading && !data ? <Loading /> : error ? <ErrorBox error={error} onRetry={reload} /> : (() => {
        const [{ questions, answersOnOlderVersions }] = data;
        return (
          <>
            <p className="small muted">Graded attempts only. Ranked by the number of trainees' answers that missed the question.
              {answersOnOlderVersions > 0 && ` ${answersOnOlderVersions} answers given on an older version of a test are left out.`}</p>
            {questions.length === 0 ? <p className="muted">No missed questions for these filters.</p> : (
              <ol className="questions missed">
                {questions.map((m, i) => (
                  <li key={`${m.track}-${m.week}-${m.questionNumber}`} className="card">
                    <div className="card-head">
                      <span className="rank">#{i + 1}</span>
                      <span className="small muted">{TRACK_NAMES[m.track]} · week {m.week}: {m.weekTitle} · question {m.questionNumber}</span>
                    </div>
                    <p className="result-q">{m.question}</p>
                    <div className="missbar" aria-label={`Missed ${m.missed} of ${m.answered} times`}>
                      <div className="missbar-fill" style={{ width: `${m.missRate}%` }} />
                    </div>
                    <p className="small"><strong className="fail">Missed {m.missed} of {m.answered} times ({m.missRate}%)</strong></p>
                    <p className="small"><span className="pass">Correct:</span> {m.correctAnswer}</p>
                    {m.commonWrongAnswer && <p className="small"><span className="fail">Most common wrong answer:</span> {m.commonWrongAnswer.text} ({m.commonWrongAnswer.count}×)</p>}
                    <p className="cite small">Citation: <strong>29 CFR {m.citation}</strong></p>
                  </li>
                ))}
              </ol>
            )}
          </>
        );
      })()}
    </>
  );
}
