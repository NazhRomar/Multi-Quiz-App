import { useRef, useState } from 'react';
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../state/AppContext.jsx';
import { catalog } from '../data/catalog.js';
import Dropdown from '../components/settings/Dropdown.jsx';
import AppSettingsFields from '../components/settings/AppSettingsFields.jsx';
import SegmentedToggle from '../components/common/SegmentedToggle.jsx';
import BadgeLegend from '../components/menu/BadgeLegend.jsx';
import ResumeCard from '../components/menu/ResumeCard.jsx';
import ChangelogModal from '../components/menu/ChangelogModal.jsx';
import { useOverload } from '../components/menu/overload/useOverload.js';
import OverloadCount from '../components/menu/overload/OverloadCount.jsx';
import { formatBuildDate } from '../utils/formatBuildDate.js';
import { estimateSeconds, formatDuration } from '../utils/estimateTime.js';

const icon = (children) => (
  <svg className="segmented-icon" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const SCOPE_OPTIONS = [
  { value: 'single', label: 'Single', icon: icon(<rect x="3" y="3" width="10" height="10" rx="2" />) },
  {
    value: 'multi',
    label: 'Multi',
    icon: icon(
      <>
        <rect x="5" y="5" width="8.5" height="8.5" rx="2" />
        <path d="M2.5 10.5V4.5a2 2 0 0 1 2-2h6" />
      </>
    ),
  },
];

const CLOCK_ICON = (
  <svg className="multi-estimate-icon" viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="8" cy="8" r="6.25" />
    <path d="M8 4.75V8l2.25 1.5" />
  </svg>
);

const HISTORY_ICON = (
  <svg className="changelog-link-icon" viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2.5 8a5.5 5.5 0 1 0 1.7-4" />
    <path d="M2.2 2.5v3.2h3.2" />
    <path d="M8 5.2V8l2 1.4" />
  </svg>
);

const MODE_OPTIONS = [
  { value: 'quiz', label: 'Quiz', icon: icon(<path d="M10.5 2.5l3 3L6 13H3v-3z" />) },
  {
    value: 'review',
    label: 'Review',
    icon: icon(
      <>
        <path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z" />
        <circle cx="8" cy="8" r="2" />
      </>
    ),
  },
];

// Home's chrome: header, search box, mode toggles, the Resume card, the
// badge legend, footer and the Multi Quiz selection bar. HomeScreen renders
// in the <Outlet/>, receiving { search, isSearching } via outlet context.
export default function BrowseLayout() {
  const { state, dispatch } = useApp();
  const { homeMode } = state;
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showChangelog, setShowChangelog] = useState(false);

  const search = searchParams.get('q') || '';
  const isSearching = search.trim().length > 0;

  const onSearchChange = (value) => setSearchParams(value ? { q: value } : {}, { replace: true });

  const selected = new Set(state.multiSelection);
  const setHomeMode = (key, value) => dispatch({ type: 'SET_HOME_MODE', payload: { key, value } });

  // Just navigates — MultiSessionRoute is what actually starts the session
  // from state.multiSelection once it mounts (same split as a single quiz:
  // click navigates, the destination route dispatches).
  const startMulti = () => navigate(homeMode.review ? '/multi/review' : '/multi/quiz');

  const selectedQuestions = catalog
    .flatMap((term) => term.courses)
    .flatMap((course) => course.quizzes)
    .filter((quiz) => selected.has(quiz.id))
    .flatMap((quiz) => quiz.data.questions || []);
  const selectedQuestionCount = selectedQuestions.length;
  const overload = useOverload(selectedQuestionCount);
  const estimate = formatDuration(
    estimateSeconds(selectedQuestions, {
      review: homeMode.review,
      showExplanation: homeMode.review ? !state.reviewOptions.hideExplanation : !state.quizOptions.hideExplanation,
    })
  );

  const hint = homeMode.multi
    ? `Pick any quizzes, from any subject or term, to combine into one Multi ${homeMode.review ? 'review' : 'quiz'}.`
    : homeMode.review
      ? 'Tap a quiz to open it in Review mode.'
      : null;
  // The hint row and selection bar stay mounted and animate in/out (see
  // style.css) rather than popping, so toggling modes doesn't jolt the
  // layout; keep the last text so a collapsing hint doesn't go blank first.
  const lastHint = useRef(hint);
  if (hint) lastHint.current = hint;

  // Hidden testing shortcut: click the footer to launch a fixture quiz
  // covering every question type, including drag-drop.
  const openShowcase = () => navigate('/dev/showcase');

  return (
    <div className={homeMode.multi ? 'menu--selecting' : ''}>
      <header className="quiz-header">
        <h1>Multi Quiz App</h1>
        <div className="header-right">
          <Dropdown ariaLabel="Settings">
            <div className="dropdown-section-title">App settings</div>
            <AppSettingsFields />
          </Dropdown>
        </div>
      </header>
      <div className="menu-search-wrap">
        <input
          type="search"
          className="menu-search-input"
          placeholder="Search quizzes, courses, terms..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
        <div className="menu-mode-toggles">
          <SegmentedToggle
            label="Single or Multi quiz"
            options={SCOPE_OPTIONS}
            value={homeMode.multi ? 'multi' : 'single'}
            onChange={(v) => setHomeMode('multi', v === 'multi')}
          />
          <SegmentedToggle
            label="Open in Quiz or Review mode"
            options={MODE_OPTIONS}
            value={homeMode.review ? 'review' : 'quiz'}
            onChange={(v) => setHomeMode('review', v === 'review')}
          />
        </div>
      </div>
      <div className={`menu-mode-hint ${hint ? 'menu-mode-hint--visible' : ''}`} aria-hidden={!hint}>
        <div className="menu-mode-hint-inner">{lastHint.current}</div>
      </div>
      <main className="menu-container">
        <BadgeLegend />
        {/* Hidden while searching — a search is about finding something
            else, and the card would sit on top of the results. */}
        {!isSearching && <ResumeCard />}
        <Outlet context={{ search, isSearching }} />
      </main>
      <footer className="home-footer">
        {/* The showcase shortcut is scoped to the date text rather than the
            whole footer, so the changelog button beside it doesn't also
            launch a quiz. */}
        <span onClick={openShowcase}>Last updated: {formatBuildDate(__BUILD_DATE__)}</span>
        {/* Hidden entirely when the build couldn't read git history. */}
        {__CHANGELOG_COUNT__ > 0 && (
          <>
            <span className="home-footer-sep" aria-hidden="true">
              ·
            </span>
            <button type="button" className="changelog-link" onClick={() => setShowChangelog(true)}>
              {HISTORY_ICON}
              What&apos;s changed
            </button>
          </>
        )}
      </footer>
      {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}
      <div
        className={`multi-select-bar ${homeMode.multi ? 'multi-select-bar--visible' : ''}`}
        role="region"
        aria-label="Multi Quiz selection"
        inert={!homeMode.multi}
      >
        <div className="multi-select-summary">
          {selected.size === 0 ? (
            'No quizzes selected'
          ) : (
            <>
              <strong>
                {selected.size} {selected.size === 1 ? 'quiz' : 'quizzes'}
              </strong>{' '}
              · <OverloadCount count={selectedQuestionCount} heat={overload.heat} surgeId={overload.surgeId} />{' '}
              ·{' '}
              <span
                className="multi-estimate"
                title={
                  homeMode.review
                    ? 'Estimated review time, from how much there is to read: questions, answers and explanations'
                    : "Estimated quiz time, from each question's type, how many answers it needs, and how much there is to read"
                }
              >
                {CLOCK_ICON}
                {estimate}
              </span>
            </>
          )}
        </div>
        <div className="multi-select-actions">
          {selected.size > 0 && (
            <button className="btn-prev" onClick={() => dispatch({ type: 'SET_MULTI_SELECTION', payload: [] })}>
              Clear
            </button>
          )}
          <button
            className={`btn-next ${homeMode.review ? 'btn-next--review' : ''}`}
            onClick={startMulti}
            disabled={selected.size === 0}
          >
            {homeMode.review ? 'Start Review' : 'Start Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}
