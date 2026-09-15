import { useApp } from '../../state/AppContext.jsx';
import { scoreBySource } from '../../state/grading.js';

const round2 = (n) => Math.round(n * 100) / 100;

// Multi results only: score per source quiz, so it's clear which modules
// need another pass. Bar tone: green ≥ 80%, amber ≥ 50%, red below.
export default function ModuleBreakdown() {
  const { state } = useApp();
  const { activeQuiz, userAnswers, quizOptions } = state;
  const rows = scoreBySource(activeQuiz.questions, userAnswers, activeQuiz.multi.quizzes, quizOptions);
  if (rows.length === 0) return null;
  const multiSubject = activeQuiz.multi.subjects.length > 1;

  return (
    <section className="module-breakdown">
      <h4 className="module-breakdown-title">Score by module</h4>
      <ul className="module-breakdown-list">
        {rows.map((row) => {
          const pct = Math.round((row.score / row.total) * 100);
          const tone = pct >= 80 ? 'good' : pct >= 50 ? 'mid' : 'low';
          return (
            <li className="module-row" key={`${row.term}|${row.course}|${row.title}`}>
              <div className="module-row-head">
                <span className="module-row-name">
                  {multiSubject && <small>{row.course}</small>}
                  {row.title}
                </span>
                <span className="module-row-score">
                  {round2(row.score)}/{row.total} pts
                  <strong className={`module-row-pct module-row-pct--${tone}`}>{pct}%</strong>
                </span>
              </div>
              <div className="module-bar" role="img" aria-label={`${pct}%`}>
                <div className={`module-bar-fill module-bar-fill--${tone}`} style={{ width: `${pct}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
