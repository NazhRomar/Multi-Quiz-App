import { useEffect, useRef } from 'react';
import { DOMAIN_NAME, LETTERS, QUESTIONS, gradeOf, isAnswered, mmss } from './engine.js';

const SELF_MARKS = [
  [1, 'Got it'],
  [0.5, 'Partly'],
  [0, 'Missed it'],
];

const toggleFlag = (s) => {
  const id = s.ids[s.cur];
  return { ...s, flag: { ...s.flag, [id]: !s.flag[id] } };
};

// The sticky row under the header: where you are, the clock, and Flag /
// Finish / Quit.
export function QuizBar({ session: S, patchSession, onFinish, onQuit }) {
  const id = S.ids[S.cur];
  const answeredCount = S.ids.filter((i) => isAnswered(S, i)).length;
  const left = S.limit - S.el;
  return (
    <div className="topcit-quizbar">
      <span className="topcit-pos">
        Question {S.cur + 1} of {S.ids.length}
      </span>
      <div className="progress-bar-track topcit-track" aria-hidden="true">
        <div className="progress-bar-fill" style={{ width: `${(answeredCount / S.ids.length) * 100}%` }} />
      </div>
      <span className={`topcit-clock ${S.limit && left <= 120 ? 'topcit-clock--warn' : ''}`} title={S.limit ? 'Time left' : 'Elapsed'}>
        {mmss(S.limit ? left : S.el)}
      </span>
      <button type="button" className="topcit-tool" aria-pressed={!!S.flag[id]} onClick={() => patchSession(toggleFlag)}>
        {S.flag[id] ? 'Flagged' : 'Flag'}
      </button>
      <button type="button" className="topcit-tool" onClick={onFinish}>
        Finish
      </button>
      <button type="button" className="topcit-tool" onClick={onQuit}>
        Quit
      </button>
    </div>
  );
}

// One question at a time with the answer sheet beside it. Practice mode
// locks and explains an answer as soon as it is chosen; exam mode holds the
// answers back until the end.
export default function TopcitQuiz({ session: S, patchSession, onFinish, dialogOpen }) {
  const id = S.ids[S.cur];
  const q = QUESTIONS[id];
  const practice = S.mode === 'practice';
  const locked = !!S.lock[id];
  const last = S.cur === S.ids.length - 1;

  const go = (i) => {
    if (i < 0 || i >= S.ids.length) return;
    patchSession((s) => ({ ...s, cur: i }));
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  const pick = (oi) =>
    patchSession((s) => {
      const qid = s.ids[s.cur];
      if (s.mode === 'practice' && s.lock[qid]) return s;
      return { ...s, ans: { ...s.ans, [qid]: oi }, lock: s.mode === 'practice' ? { ...s.lock, [qid]: true } : s.lock };
    });
  const reveal = () => patchSession((s) => ({ ...s, lock: { ...s.lock, [s.ids[s.cur]]: true } }));
  const selfMark = (value) => patchSession((s) => ({ ...s, self: { ...s.self, [s.ids[s.cur]]: value } }));
  const typeText = (value) => patchSession((s) => ({ ...s, txt: { ...s.txt, [s.ids[s.cur]]: value } }));

  // A–D or 1–4 answer, arrows and Enter move, F flags. Typing in the
  // descriptive box or an open dialog is left alone. One listener for the
  // life of the screen, reading the latest question through a ref, so a key
  // pressed right after a move can't act on the previous question.
  const latest = useRef(null);
  latest.current = { S, q, id, dialogOpen, pick, go };
  useEffect(() => {
    const onKey = (e) => {
      const { S: s, q: cur, id: curId, dialogOpen: blocked, pick: choose, go: move } = latest.current;
      if (blocked || e.ctrlKey || e.metaKey || e.altKey || e.target.tagName === 'TEXTAREA') return;
      const key = e.key.toLowerCase();
      let slot = 'abcd'.indexOf(key);
      if (slot < 0) slot = '1234'.indexOf(key);
      if (slot >= 0 && cur.k !== 'desc' && s.perm[curId][slot] !== undefined) {
        choose(s.perm[curId][slot]);
        e.preventDefault();
      } else if (key === 'arrowright' || (key === 'enter' && e.target.tagName !== 'BUTTON')) {
        move(s.cur + 1);
        e.preventDefault();
      } else if (key === 'arrowleft') {
        move(s.cur - 1);
        e.preventDefault();
      } else if (key === 'f') {
        patchSession(toggleFlag);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [patchSession]);

  return (
    <div className="topcit-wrap topcit-quiz">
      <article className="topcit-q" key={id}>
        <div className="topcit-qn" aria-hidden="true">
          {S.cur + 1}
        </div>
        <div className="topcit-q-body">
          <div className="topcit-tags">
            <span className="topcit-tag topcit-tag--domain">{DOMAIN_NAME[q.d]}</span>
            <span className="topcit-tag">{q.t}</span>
            {q.k === 'desc' && <span className="topcit-tag">Descriptive</span>}
          </div>
          <p className="q-text">{q.q}</p>
          {q.c && (
            <div className="q-context q-context--code">
              <div className="q-context-body">
                <pre>
                  <code>{q.c}</code>
                </pre>
              </div>
            </div>
          )}

          {q.k !== 'desc' ? (
            <>
              <div className="options-list">
                {S.perm[id].map((oi, slot) => {
                  const lockedNow = practice && locked;
                  const status = lockedNow ? (oi === q.a ? 'reveal-correct' : S.ans[id] === oi ? 'reveal-wrong' : '') : '';
                  return (
                    <label key={oi} className={`option-label ${status} ${lockedNow ? 'locked' : ''}`}>
                      <input type="radio" name={`topcit-q${id}`} checked={S.ans[id] === oi} disabled={lockedNow} onChange={(e) => {
                          pick(oi);
                          // So the arrow keys move between questions, not between radios.
                          e.target.blur();
                        }}
                      />
                      <span>
                        <b className="topcit-letter">{LETTERS[slot]}.</b> {q.o[oi]}
                      </span>
                      {!lockedNow && (
                        <kbd className="option-key" aria-hidden="true">
                          {slot + 1}
                        </kbd>
                      )}
                    </label>
                  );
                })}
              </div>
              {practice && locked && (
                <>
                  <div className={`feedback-banner ${S.ans[id] === q.a ? 'correct' : 'wrong'}`}>
                    <strong>{S.ans[id] === q.a ? '✓ Correct!' : '✗ Incorrect.'}</strong>
                    {S.ans[id] !== q.a && (
                      <>
                        <br />
                        Answer: {LETTERS[S.perm[id].indexOf(q.a)]}. {q.o[q.a]}
                      </>
                    )}
                  </div>
                  <div className="q-explanation">
                    <span className="q-explanation-label">Explanation</span>
                    <div className="q-explanation-text">{q.e}</div>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              <label className="topcit-hint" htmlFor="topcit-answer">
                Write your answer, then compare it with the model answer and mark yourself.
              </label>
              <textarea
                id="topcit-answer"
                className="topcit-textarea"
                placeholder="Your answer"
                value={S.txt[id] || ''}
                onChange={(e) => typeText(e.target.value)}
              />
              {locked ? (
                <>
                  <div className="q-explanation">
                    <span className="q-explanation-label">Model answer</span>
                    <div className="q-explanation-text topcit-model">{q.m}</div>
                  </div>
                  <h4 className="topcit-self-title">How did you do?</h4>
                  <div className="topcit-seg" role="group" aria-label="How did you do?">
                    {SELF_MARKS.map(([value, label]) => (
                      <button key={value} type="button" aria-pressed={S.self[id] === value} onClick={() => selfMark(value)}>
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <button type="button" className="btn-check topcit-reveal" onClick={reveal}>
                  Show model answer
                </button>
              )}
            </>
          )}

          <div className="topcit-qnav">
            <button type="button" className="btn-prev" onClick={() => go(S.cur - 1)} disabled={!S.cur}>
              Previous
            </button>
            <button type="button" className="btn-next" onClick={() => (last ? onFinish() : go(S.cur + 1))}>
              {last ? 'Finish quiz' : 'Next'}
            </button>
          </div>
          <p className="topcit-keys">Keys: A to D or 1 to 4 to answer, arrow keys or Enter to move, F to flag.</p>
        </div>
      </article>

      <aside className="topcit-sheet">
        <h3>Answer sheet</h3>
        <div className="topcit-bubbles">
          {S.ids.map((qid, i) => {
            const isDesc = QUESTIONS[qid].k === 'desc';
            const marked = practice && ((S.lock[qid] && !isDesc) || (isDesc && S.self[qid] !== undefined));
            const state = marked ? (gradeOf(S, qid) === 1 ? 'ok' : 'bad') : isAnswered(S, qid) ? 'ans' : '';
            return (
              <button
                key={qid}
                type="button"
                className={`topcit-bubble ${state && `topcit-bubble--${state}`} ${i === S.cur ? 'topcit-bubble--cur' : ''} ${S.flag[qid] ? 'topcit-bubble--flag' : ''}`}
                aria-label={`Question ${i + 1}`}
                aria-current={i === S.cur}
                onClick={() => go(i)}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
        <div className="topcit-legend">
          <span>
            <i className="topcit-dot topcit-dot--ans" />
            Answered
          </span>
          {practice && (
            <>
              <span>
                <i className="topcit-dot topcit-dot--ok" />
                Correct
              </span>
              <span>
                <i className="topcit-dot topcit-dot--bad" />
                Wrong
              </span>
            </>
          )}
          <span>
            <i className="topcit-dot topcit-dot--flag" />
            Flagged
          </span>
        </div>
      </aside>
    </div>
  );
}
