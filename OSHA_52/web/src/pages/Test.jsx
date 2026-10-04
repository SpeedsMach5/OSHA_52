import { useEffect, useRef, useState } from 'react';
import { Link, useBlocker, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useSession } from '../session.jsx';
import { useApi, Loading, ErrorBox, TRACK_NAMES } from '../util.jsx';

// Submit errors that a retry with the same test can't fix: the test has to be reloaded (new attempt token).
const NEEDS_RELOAD = new Set(['test_changed', 'invalid_attempt_token']);
// Submit errors that end this attempt for today.
const FINAL = new Set(['already_submitted', 'week_locked', 'daily_limit']);

export default function Test() {
  const { track, week } = useParams();
  const navigate = useNavigate();
  const { unsavedWork } = useSession();
  const { data, error, loading, reload } = useApi([`/tracks/${track}/weeks/${week}/test`]);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const submittingRef = useRef(false); // guards against a fast double tap

  const test = data?.[0];
  const answered = Object.keys(answers).length;
  const total = test?.questions.length || 0;
  const dirty = answered > 0 && !submitting;

  // Unsubmitted answers: ask before leaving by browser close/reload, in-app links, the Back button, or Log out.
  useEffect(() => {
    unsavedWork.current = dirty;
    if (!dirty) return undefined;
    const warn = e => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => { window.removeEventListener('beforeunload', warn); unsavedWork.current = false; };
  }, [dirty, unsavedWork]);
  const blocker = useBlocker(dirty);
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm('Leave this test? Your answers have not been submitted and will be lost.')) blocker.proceed();
    else blocker.reset();
  }, [blocker]);

  if (loading) return <Loading />;
  if (error) {
    const blocked = error.code === 'week_locked' || error.code === 'daily_limit';
    return (
      <>
        <p className="crumbs"><Link to={`/track/${track}/week/${week}`}>Back to week {week}</Link></p>
        {blocked ? <div className="notice notice-error" role="alert"><p>{error.message}</p></div> : <ErrorBox error={error} onRetry={reload} />}
      </>
    );
  }

  async function submit() {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const body = { attemptToken: test.attemptToken, answers: test.questions.map(q => answers[q.index]) };
      const r = await api(`/tracks/${track}/weeks/${week}/attempts`, { method: 'POST', body });
      navigate(`/attempt/${r.attemptId}`, { replace: true });
    } catch (err) {
      submittingRef.current = false;
      setSubmitError(err);
      setSubmitting(false);
    }
  }

  const startOver = () => { setAnswers({}); setSubmitError(null); reload(); };

  return (
    <>
      <p className="crumbs"><Link to={`/track/${track}/week/${week}`}>{TRACK_NAMES[track]} · Week {week}</Link></p>
      <h1>{test.title}</h1>
      <p className="muted">{total} questions · pass mark {test.passMark}% · answer every question, then submit</p>
      <ol className="questions">
        {test.questions.map((q, i) => (
          <li key={q.index} className="card question">
            <fieldset>
              <legend><span className="qnum">{i + 1}.</span> {q.question}</legend>
              {q.options.map((o, k) => (
                <label key={k} className={`option ${answers[q.index] === k ? 'option-selected' : ''}`}>
                  <input type="radio" name={`q${q.index}`} checked={answers[q.index] === k}
                    onChange={() => setAnswers(a => ({ ...a, [q.index]: k }))} />
                  <span>{o}</span>
                </label>
              ))}
            </fieldset>
          </li>
        ))}
      </ol>
      <div className="submitbar">
        {submitError && (
          <div className="notice notice-error" role="alert">
            <p>{submitError.message}</p>
            {submitError.code === 'already_submitted' && <Link to="/history" className="btn btn-secondary">See my results</Link>}
            {(submitError.code === 'week_locked' || submitError.code === 'daily_limit') && <Link to={`/track/${track}/week/${week}`} className="btn btn-secondary">Back to week {week}</Link>}
            {NEEDS_RELOAD.has(submitError.code) && <button type="button" className="btn btn-secondary" onClick={startOver}>Reload the test</button>}
          </div>
        )}
        <div className="submitbar-inner">
          <span className="small"><strong>{answered}</strong> of {total} answered</span>
          <button type="button" className="btn btn-primary" onClick={submit}
            disabled={answered < total || submitting || FINAL.has(submitError?.code) || NEEDS_RELOAD.has(submitError?.code)}>
            {submitting ? 'Submitting…' : 'Submit test'}
          </button>
        </div>
      </div>
    </>
  );
}
