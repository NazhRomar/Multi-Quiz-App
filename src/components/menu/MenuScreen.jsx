import { useRef, useState } from 'react';
import { useApp } from '../../state/AppContext.jsx';
import { buildMultiQuiz, courseMenu, filterCourseMenu, sortedTerms } from '../../data/catalog.js';
import Dropdown from '../settings/Dropdown.jsx';
import AppSettingsFields from '../settings/AppSettingsFields.jsx';
import SegmentedToggle from '../common/SegmentedToggle.jsx';
import TermSection from './TermSection.jsx';
import HeatedQuestionCount from './HeatedQuestionCount.jsx';
import { formatBuildDate } from '../../utils/formatBuildDate.js';
import { showcaseQuiz } from '../../devFixtures/showcaseQuiz.js';

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

export default function MenuScreen() {
  const { state, dispatch } = useApp();
  const { homeMode } = state;
  const [search, setSearch] = useState('');
  const isSearching = search.trim().length > 0;
  const menu = filterCourseMenu(search);
  const terms = sortedTerms(menu);
  // Multi: tapping a quiz toggles it in the selection instead of opening it.
  const selected = new Set(state.multiSelection);
  const setHomeMode = (key, value) => dispatch({ type: 'SET_HOME_MODE', payload: { key, value } });

  const toggleQuizzes = (quizzes) => {
    const next = new Set(selected);
    const allSelected = quizzes.every((q) => next.has(q.id));
    quizzes.forEach((q) => (allSelected ? next.delete(q.id) : next.add(q.id)));
    dispatch({ type: 'SET_MULTI_SELECTION', payload: [...next] });
  };

  const start = (term, course, quizData) => {
    if (homeMode.review) {
      dispatch({ type: 'START_REVIEW', payload: { term, course, quizData, fresh: true } });
    } else {
      dispatch({ type: 'START_QUIZ', payload: { term, course, quizData } });
    }
  };

  const openQuiz = (term, course, quiz) => {
    if (homeMode.multi) toggleQuizzes([quiz]);
    else start(term, course, quiz.data);
  };

  const selectedQuestionCount = Object.values(courseMenu)
    .flatMap((courses) => Object.values(courses).flat())
    .filter((quiz) => selected.has(quiz.id))
    .reduce((sum, quiz) => sum + (quiz.data.questions?.length || 0), 0);

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
  // covering every question type, including drag-drop (no real quiz data
  // uses that type, so this is the only way to exercise it end to end).
  const openShowcase = () => {
    dispatch({ type: 'START_QUIZ', payload: { term: 'Dev', course: 'Testing', quizData: showcaseQuiz } });
  };

  return (
    <div className={homeMode.multi ? 'menu--selecting' : ''}>
      <header className="quiz-header">
        <h1>Multi Quiz App</h1>
        <div className="header-right">
          <Dropdown ariaLabel="Settings">
            <div className="dropdown-section-title">App Settings</div>
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
          onChange={(e) => setSearch(e.target.value)}
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
        {isSearching && terms.length === 0 && <div className="menu-search-empty">No quizzes match "{search.trim()}".</div>}
        {terms.map((term) => (
          <TermSection
            key={term}
            term={term}
            courses={menu[term]}
            forceExpanded={isSearching}
            onOpen={(course, quiz) => openQuiz(term, course, quiz)}
            selection={homeMode.multi ? { selected, toggleQuizzes } : null}
          />
        ))}
      </main>
      <footer className="home-footer" onClick={openShowcase}>
        Last updated: {formatBuildDate(__BUILD_DATE__)}
      </footer>
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
              · <HeatedQuestionCount count={selectedQuestionCount} />
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
            onClick={() => start('', '', buildMultiQuiz(selected))}
            disabled={selected.size === 0}
          >
            {homeMode.review ? 'Start Review' : 'Start Quiz'}
          </button>
        </div>
      </div>
    </div>
  );
}
