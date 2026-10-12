import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../state/AppContext.jsx';
import { buildMultiQuiz } from '../data/catalog.js';
import { useGoHome } from './useGoHome.js';
import { newQuizIdsAmong } from '../utils/newQuizzes.js';
import QuizScreen from '../components/quiz/QuizScreen.jsx';
import ReviewScreen from '../components/review/ReviewScreen.jsx';
import ResultScreen from '../components/result/ResultScreen.jsx';

// Owns a Multi Quiz session at /multi/quiz or /multi/review. Unlike a
// single quiz, a Multi session has no url-addressable id of its own — the
// source of truth is state.multiSelection (built from the home menu) or an
// already-active Multi attempt (state.activeQuiz.multi, e.g. restored on
// boot or opened from the Resume card).
export default function MultiSessionRoute({ mode }) {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { goHome, isExiting } = useGoHome();

  useEffect(() => {
    // Set only by the home menu's Start button (BrowseLayout). Dropped from
    // history right away so a reload resumes instead of starting over.
    const starting = !!location.state?.start;
    if (starting) navigate(location.pathname, { replace: true });
    const active = state.activeQuiz?.multi;
    // A Start over the same selection and mode is the same session, like
    // tapping a single quiz that's already active (unless it was already
    // submitted — then Start means a new attempt). Older saves have no ids
    // on multi.quizzes, so they never match and just get replaced.
    const selection = new Set(state.multiSelection);
    const sameSession =
      active &&
      !state.result &&
      state.activeMode === mode &&
      active.quizzes.length === selection.size &&
      active.quizzes.every((q) => selection.has(q.id));
    if (active && (!starting || sameSession)) {
      // Already this Multi session (resumed, restored on boot, or switched
      // between Quiz/Review in-session) — never restart it from
      // multiSelection (that would wipe progress); only the screen needs to
      // catch up, and only if it's still sitting on the menu.
      if (state.screen === 'menu' && state.activeMode === mode) dispatch({ type: 'RESUME_ATTEMPT' });
      return;
    }
    if (state.multiSelection.length === 0) {
      goHome();
      return;
    }
    // Starting a Multi Quiz counts as opening each quiz in it, clearing
    // their "new" corners on the home menu.
    dispatch({ type: 'MARK_QUIZZES_SEEN', payload: newQuizIdsAmong(state.multiSelection) });
    dispatch({
      type: mode === 'review' ? 'START_REVIEW' : 'START_QUIZ',
      payload: {
        term: '',
        course: '',
        quizData: buildMultiQuiz(new Set(state.multiSelection)),
        quizId: null,
        ...(mode === 'review' ? { fresh: true } : {}),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Mirrors QuizSessionRoute: keeps the address bar honest when the
  // in-session Quiz/Review switch changes activeMode without going through
  // this route's own dispatch. Skips the mount run, where activeMode is still
  // the previous session's.
  const prevActiveMode = useRef(state.activeMode);
  useEffect(() => {
    const changed = prevActiveMode.current !== state.activeMode;
    prevActiveMode.current = state.activeMode;
    if (!changed || !state.activeQuiz?.multi || state.activeMode === mode) return;
    navigate(state.activeMode === 'review' ? '/multi/review' : '/multi/quiz', { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.activeMode]);

  const content =
    state.screen === 'quiz' ? (
      <QuizScreen goHome={goHome} />
    ) : state.screen === 'review' ? (
      <ReviewScreen goHome={goHome} />
    ) : state.screen === 'result' ? (
      <ResultScreen goHome={goHome} />
    ) : null;

  return <div className={isExiting ? 'app-exiting' : ''}>{content}</div>;
}
