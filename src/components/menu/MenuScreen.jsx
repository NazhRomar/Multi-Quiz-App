import { useApp } from '../../state/AppContext.jsx';
import { courseMenu, sortedTerms } from '../../data/catalog.js';
import Dropdown from '../settings/Dropdown.jsx';
import AppSettingsFields from '../settings/AppSettingsFields.jsx';
import TermSection from './TermSection.jsx';
import { formatBuildDate } from '../../utils/formatBuildDate.js';

export default function MenuScreen() {
  const { dispatch } = useApp();

  const openQuiz = (term, course, quiz) => {
    dispatch({ type: 'OPEN_MODE_SELECT', payload: { term, course, quizData: quiz.data } });
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
      <footer className="home-footer">Last updated: {formatBuildDate(__BUILD_DATE__)}</footer>
    </>
  );
}
