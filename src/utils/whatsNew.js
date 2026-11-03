import { catalog } from '../data/catalog.js';
import { FEATURES } from '../data/whatsNew.js';
import { useApp } from '../state/AppContext.jsx';
import { isRecentDate } from './newQuizzes.js';

// The What's New popup (components/menu/WhatsNewModal.jsx) announces the
// hand-written features in data/whatsNew.js and every quiz added within the
// last NEW_FOR_DAYS days. It opens by itself on Home while any of those is
// unseen; closing it marks them all seen (state.seenWhatsNew, per device).
// A quiz already opened, or cleared with "Mark all as seen", counts as seen
// here too.
const SEEN_KEY = 'quizApp_seenWhatsNew';

const featureKey = (feature) => `feature:${feature.id}`;

// { term, course, quiz } for each recently added quiz, newest first (menu
// order within a day).
export const recentQuizzes = catalog
  .flatMap((term) => term.courses.flatMap((course) => course.quizzes.map((quiz) => ({ term, course, quiz }))))
  .filter((entry) => isRecentDate(entry.quiz.addedOn))
  .sort((a, b) => b.quiz.addedOn.localeCompare(a.quiz.addedOn));

// Everything that can still open the popup.
const announcedIds = [
  ...FEATURES.filter((feature) => isRecentDate(feature.date)).map(featureKey),
  ...recentQuizzes.map((entry) => entry.quiz.id),
];

const isUnseen = (id, seenWhatsNew, seenNewQuizzes) => !seenWhatsNew?.[id] && !seenNewQuizzes?.[id];

const seenMap = (ids) => Object.fromEntries(ids.map((id) => [id, true]));

const readStored = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch (e) {
    return null;
  }
};

// A first-ever visit has nothing to be told is new: everything is. It's
// recognised by app settings never having been saved (AppContext writes them
// on every mount), and everything current is marked seen before the store
// reads it. Runs at module load, ahead of the first render.
let storageWorks = false;
try {
  if (localStorage.getItem('quizApp_appSettings') === null && localStorage.getItem(SEEN_KEY) === null) {
    localStorage.setItem(SEEN_KEY, JSON.stringify(seenMap(announcedIds)));
  }
  storageWorks = true;
} catch (e) {
  /* storage blocked: closing it couldn't be remembered, so it never opens itself */
}

// Whether Home opens the popup by itself on this load. Decided before React
// renders, so the "App updated" toast (UpdateToast.jsx) can step aside
// rather than announce the same update twice.
export const WILL_AUTO_OPEN =
  storageWorks && announcedIds.some((id) => isUnseen(id, readStored(SEEN_KEY), readStored('quizApp_seenNewQuizzes')));

export function useWhatsNew() {
  const { state, dispatch } = useApp();
  const isNew = (id) => isUnseen(id, state.seenWhatsNew, state.seenNewQuizzes);
  const unseenCount = announcedIds.filter(isNew).length;
  // Replaces the stored ids outright, so ones that aged out of the window
  // don't pile up in localStorage.
  const markAllSeen = () => dispatch({ type: 'SET_WHATS_NEW_SEEN', payload: seenMap(announcedIds) });
  return {
    features: FEATURES,
    recentQuizzes,
    isNewFeature: (feature) => isRecentDate(feature.date) && isNew(featureKey(feature)),
    isNewQuiz: (quiz) => isNew(quiz.id),
    unseenCount,
    markAllSeen,
  };
}
