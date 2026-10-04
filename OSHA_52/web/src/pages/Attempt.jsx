import { Link, useParams } from 'react-router-dom';
import { useApi, Loading, ErrorBox, TRACK_NAMES, formatDateTime } from '../util.jsx';

const letter = k => String.fromCharCode(65 + k);

// What to do after a fail, based on the week's current state (a second fail locks the week).
function NextStep({ track, week, missed }) {
  const { data } = useApi([`/tracks/${track}/weeks`]);
  const p = data?.[0].weeks.find(w => w.week === week)?.progress;
  const missedText = `You missed ${missed} question${missed === 1 ? '' : 's'}. Read the cited sections below.`;
  if (p?.locked) {
    return (
      <div className="notice notice-error" role="status">
        <p>{missedText}</p>
        <p>This week is now locked after two failed attempts. Talk to your trainer to unlock it.</p>
      </div>
    );
  }
  return (
    <div className="notice" role="status">
      <p>{missedText} {p?.passed ? '' : 'Then try again tomorrow.'}</p>
      {!p?.passed && <p className="small">A second fail locks this week until your trainer unlocks it.</p>}
    </div>
  );
}

// Result of one attempt. On a pass the API returns the correct option, explanation and citation for every
// question; on a fail it returns only which questions were missed and the citation for each.
export default function Attempt() {
  const { id } = useParams();
  const { data, error, loading, reload } = useApi([`/me/attempts/${id}`]);
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} onRetry={reload} />;
  const [a] = data;
  const missed = a.results.filter(r => !r.isCorrect).length;

  return (
    <>
      <p className="crumbs"><Link to={`/track/${a.track}/week/${a.week}`}>{TRACK_NAMES[a.track]} · Week {a.week}</Link></p>
      <section className={`card score ${a.passed ? 'score-pass' : 'score-fail'}`}>
        <p className="score-label">{a.passed ? 'Passed' : 'Not passed'}{a.practice ? ' · practice' : ''}</p>
        <p className="score-big">{Math.round(a.scorePct)}%</p>
        <p>{a.correct} of {a.total} correct · pass mark {a.passMark}%</p>
        <p className="small">{formatDateTime(a.submittedAt)}</p>
      </section>

      {a.practice && <p className="muted">This was a practice attempt. Your week stays passed.</p>}
      {!a.passed && !a.practice && <NextStep track={a.track} week={a.week} missed={missed} />}
      {a.contentChanged && <p className="small muted">This week's test was updated after this attempt, so only right/wrong is shown.</p>}

      <h2>{a.passed ? 'Answers and explanations' : 'Your results'}</h2>
      <ol className="questions">
        {a.results.map(r => (
          <li key={r.index} className={`card result ${r.isCorrect ? 'result-right' : 'result-wrong'}`}>
            <p className="result-mark">{r.isCorrect ? '✓ Correct' : '✗ Missed'}</p>
            {r.question && <p className="result-q"><span className="qnum">{r.index + 1}.</span> {r.question}</p>}
            {r.options && (
              <ul className="result-options">
                {r.options.map((o, k) => {
                  const isPick = k === r.selectedIndex;
                  const isRight = r.correctIndex === k;
                  return (
                    <li key={k} className={`${isRight ? 'opt-right' : ''} ${isPick && !r.isCorrect ? 'opt-wrong' : ''}`}>
                      <span className="opt-letter">{letter(k)}.</span> {o}
                      {isPick && <span className="tag">{r.isCorrect ? 'Your answer' : 'Your answer (wrong)'}</span>}
                      {isRight && !isPick && <span className="tag">Correct answer</span>}
                    </li>
                  );
                })}
              </ul>
            )}
            {r.explanation && <p className="explain">{r.explanation}</p>}
            {r.citation && <p className="cite">Citation: <strong>29 CFR {r.citation}</strong></p>}
          </li>
        ))}
      </ol>
      <p><Link to={`/track/${a.track}/week/${a.week}`} className="btn btn-secondary">Back to week {a.week}</Link></p>
    </>
  );
}
