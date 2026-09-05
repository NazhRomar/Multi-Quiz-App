import { useState } from 'react';
import { useApp } from '../../state/AppContext.jsx';
import { filterCourseMenu, sortedTerms } from '../../data/catalog.js';
import Dropdown from '../settings/Dropdown.jsx';
import AppSettingsFields from '../settings/AppSettingsFields.jsx';
import TermSection from './TermSection.jsx';
import { formatBuildDate } from '../../utils/formatBuildDate.js';
import { showcaseQuiz } from '../../devFixtures/showcaseQuiz.js';

export default function MenuScreen() {
  const { dispatch } = useApp();
  const [search, setSearch] = useState('');
  const isSearching = search.trim().length > 0;
  const menu = filterCourseMenu(search);
  const terms = sortedTerms(menu);

  const openQuiz = (term, course, quiz) => {
    dispatch({ type: 'START_QUIZ', payload: { term, course, quizData: quiz.data } });
  };

  // Hidden testing shortcut: click the footer to launch a fixture quiz
  // covering every question type, including drag-drop (no real quiz data
  // uses that type, so this is the only way to exercise it end to end).
  const openShowcase = () => {
    dispatch({ type: 'START_QUIZ', payload: { term: 'Dev', course: 'Testing', quizData: showcaseQuiz } });
  };

  return (
    <>
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
          />
        ))}
      </main>
      <footer className="home-footer" onClick={openShowcase}>
        Last updated: {formatBuildDate(__BUILD_DATE__)}
      </footer>
    </>
  );
}
