import { useState } from 'react';
import { useApp } from '../../state/AppContext.jsx';
import { buildMultiQuiz, courseMenu, filterCourseMenu, sortedTerms } from '../../data/catalog.js';
import Dropdown from '../settings/Dropdown.jsx';
import AppSettingsFields from '../settings/AppSettingsFields.jsx';
import TermSection from './TermSection.jsx';
import { formatBuildDate } from '../../utils/formatBuildDate.js';
import { showcaseQuiz } from '../../devFixtures/showcaseQuiz.js';

export default function MenuScreen() {
  const { dispatch } = useApp();
  const [search, setSearch] = useState('');
  // Multi Quiz selection mode: while active, tapping a quiz toggles it in
  // `selected` (a Set of courseMenu quiz ids) instead of opening it.
  const [isSelecting, setIsSelecting] = useState(false);
  const [selected, setSelected] = useState(() => new Set());
  const isSearching = search.trim().length > 0;
  const menu = filterCourseMenu(search);
  const terms = sortedTerms(menu);

  const toggleQuizzes = (quizzes) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = quizzes.every((q) => next.has(q.id));
      quizzes.forEach((q) => (allSelected ? next.delete(q.id) : next.add(q.id)));
      return next;
    });
  };

  const openQuiz = (term, course, quiz) => {
    if (isSelecting) {
      toggleQuizzes([quiz]);
      return;
    }
    dispatch({ type: 'START_QUIZ', payload: { term, course, quizData: quiz.data } });
  };

  const toggleSelecting = () => {
    setIsSelecting((v) => !v);
    setSelected(new Set());
  };

  const startMulti = () => {
    dispatch({ type: 'START_QUIZ', payload: { term: '', course: '', quizData: buildMultiQuiz(selected) } });
  };

  const selectedQuestionCount = Object.values(courseMenu)
    .flatMap((courses) => Object.values(courses).flat())
    .filter((quiz) => selected.has(quiz.id))
    .reduce((sum, quiz) => sum + (quiz.data.questions?.length || 0), 0);

  // Hidden testing shortcut: click the footer to launch a fixture quiz
  // covering every question type, including drag-drop (no real quiz data
  // uses that type, so this is the only way to exercise it end to end).
  const openShowcase = () => {
    dispatch({ type: 'START_QUIZ', payload: { term: 'Dev', course: 'Testing', quizData: showcaseQuiz } });
  };

  return (
    <div className={isSelecting ? 'menu--selecting' : ''}>
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
        <button className={`btn-multi-toggle ${isSelecting ? 'btn-multi-toggle--active' : ''}`} onClick={toggleSelecting}>
          {isSelecting ? 'Cancel' : 'Multi Quiz'}
        </button>
      </div>
      {isSelecting && (
        <div className="multi-select-hint">Pick any quizzes, from any subject or term, to combine into one Multi quiz.</div>
      )}
      <main className="menu-container">
        {isSearching && terms.length === 0 && <div className="menu-search-empty">No quizzes match "{search.trim()}".</div>}
        {terms.map((term) => (
          <TermSection
            key={term}
            term={term}
            courses={menu[term]}
            forceExpanded={isSearching}
            onOpen={(course, quiz) => openQuiz(term, course, quiz)}
            selection={isSelecting ? { selected, toggleQuizzes } : null}
          />
        ))}
      </main>
      <footer className="home-footer" onClick={openShowcase}>
        Last updated: {formatBuildDate(__BUILD_DATE__)}
      </footer>
      {isSelecting && (
        <div className="multi-select-bar" role="region" aria-label="Multi Quiz selection">
          <div className="multi-select-summary">
            {selected.size === 0 ? (
              'No quizzes selected'
            ) : (
              <>
                <strong>
                  {selected.size} {selected.size === 1 ? 'quiz' : 'quizzes'}
                </strong>{' '}
                · {selectedQuestionCount} questions
              </>
            )}
          </div>
          <div className="multi-select-actions">
            {selected.size > 0 && (
              <button className="btn-prev" onClick={() => setSelected(new Set())}>
                Clear
              </button>
            )}
            <button className="btn-next" onClick={startMulti} disabled={selected.size === 0}>
              Start Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
