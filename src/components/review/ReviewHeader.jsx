import { useApp } from '../../state/AppContext.jsx';
import Dropdown from '../settings/Dropdown.jsx';
import DropdownTabs from '../settings/DropdownTabs.jsx';
import ReviewOptionsFields from '../settings/ReviewOptionsFields.jsx';
import AppSettingsFields from '../settings/AppSettingsFields.jsx';
import MultiOptionsFields from '../settings/MultiOptionsFields.jsx';
import HeaderTitle from '../common/HeaderTitle.jsx';

export default function ReviewHeader({ progressLabel, progressPct, goHome }) {
  const { state, dispatch } = useApp();
  const { activeQuiz } = state;

  return (
    <header className="quiz-header">
      <HeaderTitle mode="review" />
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
        <Dropdown
          ariaLabel="Options"
          headerAction={
            <button className="dropdown-mode-switch" onClick={() => dispatch({ type: 'SWITCH_TO_QUIZ' })}>
              Switch to quiz mode
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
              { label: 'Review options', content: <ReviewOptionsFields /> },
              activeQuiz.multi && { label: 'Multi', content: <MultiOptionsFields /> },
              { label: 'App settings', content: <AppSettingsFields showNavLocation /> },
            ].filter(Boolean)}
          />
        </Dropdown>
      </div>
    </header>
  );
}
