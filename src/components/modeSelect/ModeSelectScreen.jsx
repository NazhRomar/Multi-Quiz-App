import { useApp } from '../../state/AppContext.jsx';

export default function ModeSelectScreen({ goHome }) {
  const { state, dispatch } = useApp();
  const { term, course, quizData } = state.pending;

  const launch = (mode) => {
    if (mode === 'quiz') dispatch({ type: 'START_QUIZ', payload: { term, course, quizData } });
    else dispatch({ type: 'START_REVIEW', payload: { term, course, quizData } });
  };

  return (
    <>
      <header className="quiz-header">
        <h1>Multi Quiz App</h1>
      </header>
      <main className="menu-container">
        <section className="mode-select-card">
          <div className="mode-select-title">
            <span className="mode-select-quiz-label">{quizData.quizTitle}</span>
            <span className="mode-select-sub">
              {term} / {course}
            </span>
          </div>
          <div className="mode-select-options">
            <button className="mode-btn mode-btn-quiz" onClick={() => launch('quiz')}>
              <span className="mode-icon">📝</span>
              <span className="mode-btn-label">Quiz Mode</span>
              <span className="mode-btn-desc">Answer questions, get scored</span>
            </button>
            <button className="mode-btn mode-btn-review" onClick={() => launch('review')}>
              <span className="mode-icon">📖</span>
              <span className="mode-btn-label">Review Mode</span>
              <span className="mode-btn-desc">Browse all questions with answers</span>
            </button>
          </div>
          <button className="btn-back" onClick={goHome}>
            ← Back
          </button>
        </section>
      </main>
    </>
  );
}
