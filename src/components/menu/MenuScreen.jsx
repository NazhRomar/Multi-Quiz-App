import { useApp } from '../../state/AppContext.jsx';
import { courseMenu, sortedTerms } from '../../data/catalog.js';
import Dropdown from '../settings/Dropdown.jsx';
import AppSettingsFields from '../settings/AppSettingsFields.jsx';
import TermSection from './TermSection.jsx';
import { formatBuildDate } from '../../utils/formatBuildDate.js';
import { showcaseQuiz } from '../../devFixtures/showcaseQuiz.js';

export default function MenuScreen() {
  const { dispatch } = useApp();

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
            <AppSettingsFields />
          </Dropdown>
        </div>
      </header>
      <main className="menu-container">
        {sortedTerms().map((term) => (
          <TermSection key={term} term={term} courses={courseMenu[term]} onOpen={(course, quiz) => openQuiz(term, course, quiz)} />
        ))}
      </main>
      <footer className="home-footer" onClick={openShowcase}>
        Last updated: {formatBuildDate(__BUILD_DATE__)}
      </footer>
    </>
  );
}
