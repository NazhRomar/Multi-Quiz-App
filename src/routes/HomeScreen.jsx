import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { catalog, filterCatalog } from '../data/catalog.js';
import { useQuizOpener } from './useQuizOpener.js';
import TermSection from '../components/menu/TermSection.jsx';
import { checkForUpdate } from '../utils/appUpdate.js';

// Every term/subject/quiz, inline, one screen — same shape the app always
// had. Searching just narrows it down to matches (forcing every term/course
// open so results aren't hidden behind a collapsed section); not searching
// shows everything, respecting each term's own collapsed/expanded state.
export default function HomeScreen() {
  const { search, isSearching } = useOutletContext();
  const { openQuiz, selection } = useQuizOpener();

  // Each arrival at Home (including the first load) checks for a newer
  // deploy and reloads into it if there is one.
  useEffect(() => {
    checkForUpdate();
  }, []);

  const terms = isSearching ? filterCatalog(search) : catalog;

  if (isSearching && terms.length === 0) {
    return <div className="menu-search-empty">No quizzes match &quot;{search.trim()}&quot;.</div>;
  }

  return terms.map((term) => (
    <TermSection key={term.key} term={term} forceExpanded={isSearching} onOpen={(course, quiz) => openQuiz(term, course, quiz)} selection={selection} />
  ));
}
