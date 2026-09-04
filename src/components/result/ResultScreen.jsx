import { useApp } from '../../state/AppContext.jsx';
import ScoreRing from './ScoreRing.jsx';

export default function ResultScreen({ goHome }) {
  const { state, dispatch } = useApp();
  const { activeTerm, activeCourse, activeQuiz, result } = state;
  const { score, totalPossible, correctCount, wrongCount, unansweredCount, flaggedCount } = result;
  const percentage = Math.round((score / totalPossible) * 100);

  return (
    <>
      <header className="quiz-header quiz-header--quiz">
        <div className="header-left">
          <span className="mode-pill mode-pill--quiz">Quiz</span>
          <span className="breadcrumbs">
            {activeTerm} <span>/</span> {activeCourse} <span>/</span> {activeQuiz.quizTitle}
          </span>
        </div>
        <div className="header-right">
          <button className="btn-restart" onClick={() => dispatch({ type: 'RESTART' })}>
            Restart Quiz
          </button>
          <button className="btn-exit" onClick={goHome}>
            ← Home
          </button>
        </div>
      </header>
      <main className="question-card result-card">
        <ScoreRing percentage={percentage} />
        <h3>
          You scored {Math.round(score * 100) / 100} out of {totalPossible} points
        </h3>
        <div className="result-breakdown">
          <div className="result-stat result-stat--correct">
            <strong>{correctCount}</strong>
            <span>Correct</span>
          </div>
          <div className="result-stat result-stat--wrong">
            <strong>{wrongCount}</strong>
            <span>Incorrect</span>
          </div>
          <div className="result-stat result-stat--unanswered">
            <strong>{unansweredCount}</strong>
            <span>Unanswered</span>
          </div>
          {flaggedCount > 0 && (
            <div className="result-stat result-stat--flagged">
              <strong>{flaggedCount}</strong>
              <span>Not Scored</span>
            </div>
          )}
        </div>
        <div className="result-actions">
          <button className="btn-next" onClick={() => dispatch({ type: 'SWITCH_TO_REVIEW' })}>
            Review Answers
          </button>
          <button className="btn-prev" onClick={goHome}>
            Return to Main Menu
          </button>
        </div>
      </main>
    </>
  );
}
