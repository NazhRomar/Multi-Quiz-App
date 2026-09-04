import { useApp } from '../../state/AppContext.jsx';
import Dropdown from '../settings/Dropdown.jsx';
import DropdownTabs from '../settings/DropdownTabs.jsx';
import QuizOptionsFields from '../settings/QuizOptionsFields.jsx';
import AppSettingsFields from '../settings/AppSettingsFields.jsx';

export default function QuizHeader({ score, goHome }) {
  const { state, dispatch } = useApp();
  const { activeTerm, activeCourse, activeQuiz, currentIndex } = state;
  const total = activeQuiz.questions.length;
  const pct = ((currentIndex + 1) / total) * 100;

  return (
    <header className="quiz-header">
      <div className="header-left">
        <span className="mode-pill mode-pill--quiz">Quiz</span>
        <span className="breadcrumbs">
          {activeTerm} <span>/</span> {activeCourse} <span>/</span> {activeQuiz.quizTitle}
        </span>
      </div>
      <div className="header-right">
        <div className="progress-wrap">
          <span className="progress-label">
            {currentIndex + 1}/{total}
          </span>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <span className="score-badge">Score: {score}</span>
        <button className="btn-restart" onClick={() => dispatch({ type: 'RESTART' })}>
          Restart
        </button>
        <button className="btn-exit" onClick={goHome}>
          Exit
        </button>
        <Dropdown ariaLabel="Options">
          <div className="dropdown-mobile-actions">
            <button className="btn-restart" onClick={() => dispatch({ type: 'RESTART' })}>
              Restart
            </button>
            <button className="btn-exit" onClick={goHome}>
              Exit
            </button>
          </div>
          <button className="dropdown-mode-switch" onClick={() => dispatch({ type: 'SWITCH_TO_REVIEW' })}>
            Switch to Review Mode →
          </button>
          <DropdownTabs
            tabs={[
              { label: 'Quiz Options', content: <QuizOptionsFields /> },
              { label: 'App Settings', content: <AppSettingsFields showNavLocation /> },
            ]}
          />
        </Dropdown>
      </div>
    </header>
  );
}
