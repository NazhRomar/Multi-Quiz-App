import { useEffect, useMemo } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { catalog, filterCatalog, quizUrlFor, searchQuestions } from '../data/catalog.js';
import { useApp } from '../state/AppContext.jsx';
import { useQuizOpener } from './useQuizOpener.js';
import TermSection from '../components/menu/TermSection.jsx';
import QuestionSearchResults from '../components/menu/QuestionSearchResults.jsx';
import { checkForUpdate } from '../utils/appUpdate.js';

// Every term/subject/quiz, inline, one screen — same shape the app always
// had. Searching just narrows it down to matches (forcing every term/course
// open so results aren't hidden behind a collapsed section) and adds a
// "Matching questions" section below the list (or above it — App settings
// → Question matches first); not searching shows everything, respecting
// each term's own collapsed/expanded state.
export default function HomeScreen() {
  const { search, isSearching } = useOutletContext();
  const { state } = useApp();
  const navigate = useNavigate();
  const { openQuiz, selection } = useQuizOpener();

  // Each arrival at Home (including the first load) checks for a newer
  // deploy and reloads into it if there is one.
  useEffect(() => {
    checkForUpdate();
  }, []);

  const terms = isSearching ? filterCatalog(search) : catalog;
  const questionMatches = useMemo(() => searchQuestions(search), [search]);

  if (isSearching && terms.length === 0 && questionMatches.total === 0) {
    return <div className="menu-search-empty">No quizzes, questions or answers match &quot;{search}&quot;.</div>;
  }

  // A question result opens its quiz in Review mode at that question (see
  // QuizSessionRoute's ?question=), whatever the Single/Multi and
  // Quiz/Review toggles say.
  const openQuestionResult = (r) => navigate(`${quizUrlFor(r.term, r.course, r.quiz, 'review')}?question=${r.qIndex + 1}`);

  const quizSections = terms.map((term) => (
    <TermSection
      key={term.key}
      term={term}
      forceExpanded={isSearching}
      // Only the newest term (the catalog's first) starts open.
      defaultCollapsed={term.key !== catalog[0].key}
      onOpen={(course, quiz) => openQuiz(term, course, quiz)}
      selection={selection}
    />
  ));
  const questionSection = isSearching && questionMatches.total > 0 && (
    <QuestionSearchResults query={search} results={questionMatches.results} total={questionMatches.total} onOpen={openQuestionResult} />
  );

  return state.appSettings.searchQuestionsFirst ? (
    <>
      {questionSection}
      {quizSections}
    </>
  ) : (
    <>
      {quizSections}
      {questionSection}
    </>
  );
}
