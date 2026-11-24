import { useState } from 'react';
import ScoreRing from '../components/result/ScoreRing.jsx';
import Seg from './Seg.jsx';
import { DOMAINS, DOMAIN_NAME, LETTERS, QUESTIONS, fmt, gradeOf, isAnswered, mmss, totalScore } from './engine.js';

// Same bands as the catalog quizzes' result screen; the ring takes its color
// from the result-tone class.
const toneOf = (pct) => (pct >= 80 ? 'good' : pct >= 50 ? 'mid' : 'low');

const SELF_LABEL = { 1: 'Got it', 0.5: 'Partly', 0: 'Missed it' };

// The score, how each domain went, which topics to revisit, and every
// question again with the right answer.
export default function TopcitResults({ session: S, onRetryMissed, onRetrySame, onNew }) {
  const [filter, setFilter] = useState('all');
  const n = S.ids.length;
  const score = totalScore(S);
  const percent = (score / n) * 100;
  const missedIds = S.ids.filter((id) => gradeOf(S, id) < 1);
  const flaggedCount = S.ids.filter((id) => S.flag[id]).length;
  const answeredCount = S.ids.filter((id) => isAnswered(S, id)).length;

  const topics = {};
  for (const id of S.ids) {
    const q = QUESTIONS[id];
    const t = (topics[`${q.d}|${q.t}`] = topics[`${q.d}|${q.t}`] || { d: q.d, t: q.t, g: 0, n: 0 });
    t.g += gradeOf(S, id);
    t.n++;
  }
  const weak = Object.values(topics)
    .filter((t) => t.g < t.n)
    .sort((a, b) => a.g / a.n - b.g / b.n || b.n - a.n)
    .slice(0, 6);

  const shown = S.ids
    .map((id, i) => ({ id, i }))
    .filter(({ id }) => filter === 'all' || (filter === 'wrong' && gradeOf(S, id) < 1) || (filter === 'right' && gradeOf(S, id) === 1) || (filter === 'flag' && S.flag[id]));

  return (
    <div className="topcit-wrap">
      <div className="topcit-results">
        <section className="topcit-panel topcit-score">
          <p className="topcit-muted">
            {S.label}, {n} questions, {mmss(S.el)}
            {S.timeUp ? ', time ran out' : ''}
          </p>
          <div className={`result-tone--${toneOf(percent)}`}>
            <ScoreRing percentage={Math.round(percent)} />
          </div>
          <h2 className="topcit-score-line">
            {fmt(score)} of {n} correct
          </h2>
          <div className="topcit-go">
            <button type="button" className="btn-next" onClick={() => onRetryMissed(missedIds)} disabled={!missedIds.length}>
              {missedIds.length ? `Retry missed (${missedIds.length})` : 'Retry missed'}
            </button>
            <button type="button" className="btn-prev" onClick={onRetrySame}>
              Retry same set
            </button>
            <button type="button" className="btn-prev" onClick={onNew}>
              New quiz
            </button>
          </div>
          <div className="topcit-figs">
            {[
              [answeredCount, 'answered'],
              [n - answeredCount, 'left blank'],
              [flaggedCount, 'flagged'],
              [mmss(S.el / n), 'avg per question'],
            ].map(([value, label]) => (
              <div key={label}>
                <b>{value}</b>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="topcit-panel">
          <h3>By domain</h3>
          {DOMAINS.map((d) => {
            const ids = S.ids.filter((id) => QUESTIONS[id].d === d.id);
            if (!ids.length) return null;
            const got = ids.reduce((sum, id) => sum + gradeOf(S, id), 0);
            const accuracy = got / ids.length;
            return (
              <div className="topcit-row" key={d.id}>
                <span>{d.name}</span>
                <span className="topcit-bar">
                  <i className={accuracy < 0.6 ? 'low' : ''} style={{ width: `${Math.round(accuracy * 100)}%` }} />
                </span>
                <span className="topcit-row-v">
                  {fmt(got)}/{ids.length}
                </span>
              </div>
            );
          })}
          <h3 className="topcit-sub">Review these topics next</h3>
          <ul className="topcit-weak">
            {weak.length ? (
              weak.map((w) => (
                <li key={`${w.d}|${w.t}`}>
                  <span>
                    {w.t} <span className="topcit-muted topcit-small">{DOMAIN_NAME[w.d]}</span>
                  </span>
                  <span className="topcit-nowrap">
                    {fmt(w.g)}/{w.n}
                  </span>
                </li>
              ))
            ) : (
              <li>Nothing missed in this set. Try a harder mix or the mock exam.</li>
            )}
          </ul>
        </section>
      </div>

      <section className="topcit-review">
        <div className="topcit-panel-head">
          <h3>Answer review</h3>
          <Seg
            label="Filter the review"
            value={filter}
            onChange={setFilter}
            items={[
              ['all', `All (${n})`],
              ['wrong', `Missed (${missedIds.length})`],
              ['flag', `Flagged (${flaggedCount})`],
              ['right', `Correct (${n - missedIds.length})`],
            ]}
          />
        </div>
        {shown.length ? (
          shown.map(({ id, i }) => {
            const q = QUESTIONS[id];
            const wrong = gradeOf(S, id) < 1;
            const letter = (oi) => LETTERS[S.perm[id].indexOf(oi)];
            return (
              <article className={`topcit-card ${wrong ? 'topcit-card--wrong' : ''}`} key={id}>
                <div className="topcit-card-n">{i + 1}</div>
                <div>
                  <div className="topcit-tags">
                    <span className="topcit-tag topcit-tag--domain">{DOMAIN_NAME[q.d]}</span>
                    <span className="topcit-tag">{q.t}</span>
                    {S.flag[id] && <span className="topcit-tag topcit-tag--flag">Flagged</span>}
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
                  {q.k === 'desc' ? (
                    <>
                      <p className="topcit-ans">
                        <b>Your answer</b>
                        {(S.txt[id] || '').trim() || '(blank)'}
                      </p>
                      <p className="topcit-ans">
                        <b>Self-mark</b>
                        {S.self[id] === undefined ? 'not marked (counted as 0)' : SELF_LABEL[S.self[id]]}
                      </p>
                      <div className="q-explanation">
                        <span className="q-explanation-label">Model answer</span>
                        <div className="q-explanation-text topcit-model">{q.m}</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="topcit-ans">
                        <b>Your answer</b>
                        {S.ans[id] === undefined ? '(blank)' : `${letter(S.ans[id])}. ${q.o[S.ans[id]]}`}
                      </p>
                      {wrong && (
                        <p className="topcit-ans">
                          <b>Correct</b>
                          {letter(q.a)}. {q.o[q.a]}
                        </p>
                      )}
                      <div className="q-explanation">
                        <span className="q-explanation-label">Explanation</span>
                        <div className="q-explanation-text">{q.e}</div>
                      </div>
                    </>
                  )}
                </div>
              </article>
            );
          })
        ) : (
          <p className="topcit-muted">No questions in this view.</p>
        )}
      </section>
    </div>
  );
}
