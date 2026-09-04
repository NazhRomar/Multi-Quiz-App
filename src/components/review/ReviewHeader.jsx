import { useApp } from '../../state/AppContext.jsx';
import Dropdown from '../settings/Dropdown.jsx';
import DropdownTabs from '../settings/DropdownTabs.jsx';
import ReviewOptionsFields from '../settings/ReviewOptionsFields.jsx';
import AppSettingsFields from '../settings/AppSettingsFields.jsx';

export default function ReviewHeader({ progressLabel, progressPct, goHome }) {
  const { state, dispatch } = useApp();
  const { activeTerm, activeCourse, activeQuiz } = state;

  return (
    <header className="quiz-header">
      <div className="header-left">
        <span className="mode-pill mode-pill--review">Review</span>
        <span className="breadcrumbs">
          {activeTerm} <span>/</span> {activeCourse} <span>/</span> {activeQuiz.quizTitle}
        </span>
      </div>
      <div className="header-right">
        <div className="progress-wrap">
          <span className="progress-label">{progressLabel}</span>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
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
          <button className="dropdown-mode-switch" onClick={() => dispatch({ type: 'SWITCH_TO_QUIZ' })}>
            Switch to Quiz Mode →
          </button>
          <DropdownTabs
            tabs={[
              { label: 'Review Options', content: <ReviewOptionsFields /> },
              { label: 'App Settings', content: <AppSettingsFields showNavLocation /> },
            ]}
          />
        </Dropdown>
      </div>
    </header>
  );
}
