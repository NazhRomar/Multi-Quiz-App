import { catalog } from '../data/catalog.js';
import { useApp } from '../state/AppContext.jsx';

// A quiz whose JSON has an "addedOn" date shows a colored corner on the home menu
// until the viewer opens it (alone or in a Multi Quiz) or clears them all with
// the header's "Mark all as seen" button (remembered per device in
// state.seenNewQuizzes). The corner also lapses on
// its own after this many days, so a first-time visitor months from now
// doesn't see every quiz flagged as new.
export const NEW_FOR_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

function isRecentlyAdded(quiz) {
  if (!quiz.addedOn) return false;
  const added = Date.parse(quiz.addedOn);
  return !Number.isNaN(added) && Date.now() - added < NEW_FOR_DAYS * DAY_MS;
}

// Ids of every quiz still inside the "new" window, in menu order.
const recentQuizIds = catalog
  .flatMap((term) => term.courses)
  .flatMap((course) => course.quizzes)
  .filter(isRecentlyAdded)
  .map((quiz) => quiz.id);

// The quizzes among ids that are inside the "new" window — what opening them
// should mark seen, so ordinary quiz ids don't pile up in localStorage.
export function newQuizIdsAmong(ids) {
  return ids.filter((id) => recentQuizIds.includes(id));
}

export function useIsNewQuiz(quiz) {
  const { state } = useApp();
  return isRecentlyAdded(quiz) && !state.seenNewQuizzes[quiz.id];
}

// The quizzes still showing a dot, and a way to clear them all at once.
export function useNewQuizzes() {
  const { state, dispatch } = useApp();
  const unseenIds = recentQuizIds.filter((id) => !state.seenNewQuizzes[id]);
  const markAllSeen = () => dispatch({ type: 'MARK_QUIZZES_SEEN', payload: unseenIds });
  return { unseenCount: unseenIds.length, markAllSeen };
}
