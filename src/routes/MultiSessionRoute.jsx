import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../state/AppContext.jsx';
import { buildMultiQuiz } from '../data/catalog.js';
import { useGoHome } from './useGoHome.js';
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
  const { goHome, isExiting } = useGoHome();

  useEffect(() => {
    if (state.activeQuiz?.multi) {
      // Already an active Multi session — regardless of which mode it's
      // in, never restart it from multiSelection (that would wipe
      // progress); only the screen needs to catch up, and only if it's
      // still sitting on the menu.
      if (state.screen === 'menu' && state.activeMode === mode) dispatch({ type: 'RESUME_ATTEMPT' });
      return;
    }
    if (state.multiSelection.length === 0) {
      goHome();
      return;
    }
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
