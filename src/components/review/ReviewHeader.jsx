import { useApp } from '../../state/AppContext.jsx';
import Dropdown from '../settings/Dropdown.jsx';
import DropdownTabs from '../settings/DropdownTabs.jsx';
import ReviewOptionsFields from '../settings/ReviewOptionsFields.jsx';
import AppSettingsFields from '../settings/AppSettingsFields.jsx';
import MultiOptionsFields from '../settings/MultiOptionsFields.jsx';
import HeaderTitle from '../common/HeaderTitle.jsx';

const SEARCH_ICON = (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
    <circle cx="7" cy="7" r="4.5" />
    <path d="M10.4 10.4 14 14" />
  </svg>
);

// onRestart: ReviewScreen's restart (back to question 1, top of the page).
// searchOpen/onToggleSearch: the search button, which opens ReviewSearchBar
// under the header — kept visible on mobile, unlike Restart/Exit.
export default function ReviewHeader({ progressLabel, progressPct, goHome, onRestart, searchOpen, onToggleSearch }) {
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
        <button
          type="button"
          className={`btn-review-search${searchOpen ? ' btn-review-search--active' : ''}`}
          onClick={onToggleSearch}
          aria-pressed={searchOpen}
          aria-label="Search this review"
          title="Search this review"
        >
          {SEARCH_ICON}
        </button>
        <button className="btn-restart" onClick={onRestart}>
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
            <button className="btn-restart" onClick={onRestart}>
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
