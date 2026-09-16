import { useApp } from '../../state/AppContext.jsx';
import { useIsMobile } from '../../utils/useIsMobile.js';
import Dropdown from '../settings/Dropdown.jsx';
import DropdownTabs from '../settings/DropdownTabs.jsx';
import QuizOptionsFields from '../settings/QuizOptionsFields.jsx';
import AppSettingsFields from '../settings/AppSettingsFields.jsx';
import MultiOptionsFields from '../settings/MultiOptionsFields.jsx';
import HeaderTitle from '../common/HeaderTitle.jsx';

export default function QuizHeader({ score, goHome }) {
  const { state, dispatch } = useApp();
  const { activeQuiz, currentIndex } = state;
  const isMobile = useIsMobile();
  const total = activeQuiz.questions.length;
  const totalPoints = activeQuiz.questions.reduce((sum, q) => (q.flagged ? sum : sum + (q.points || 1)), 0);
  const pct = ((currentIndex + 1) / total) * 100;

  return (
    <header className="quiz-header">
      <HeaderTitle mode="quiz" />
      <div className="header-right">
        <div className="progress-wrap">
          <span className="progress-label">
            {currentIndex + 1}/{total}
          </span>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <span className="score-badge" title="Points scored so far, out of every point in this quiz">
          {/* Phones: no room for the trailing word next to the progress bar. */}
          {score} / {totalPoints}
          {!isMobile && ' total'}
        </span>
        <button className="btn-restart" onClick={() => dispatch({ type: 'RESTART' })}>
          Restart
        </button>
        <button className="btn-exit" onClick={goHome}>
          Exit
        </button>
        <Dropdown
          ariaLabel="Options"
          headerAction={
            <button className="dropdown-mode-switch" onClick={() => dispatch({ type: 'SWITCH_TO_REVIEW' })}>
              Switch to Review Mode
            </button>
          }
        >
          <div className="dropdown-mobile-actions">
            <button className="btn-restart" onClick={() => dispatch({ type: 'RESTART' })}>
              Restart
            </button>
            <button className="btn-exit" onClick={goHome}>
              Exit
            </button>
          </div>
          <DropdownTabs
            tabs={[
              { label: 'Quiz Options', content: <QuizOptionsFields /> },
              activeQuiz.multi && { label: 'Multi', content: <MultiOptionsFields /> },
              { label: 'App Settings', content: <AppSettingsFields showNavLocation /> },
            ].filter(Boolean)}
          />
        </Dropdown>
      </div>
    </header>
  );
}
