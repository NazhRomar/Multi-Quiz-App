import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../state/AppContext.jsx';
import { findQuizBySlug, quizUrlFor } from '../data/catalog.js';
import { useGoHome } from './useGoHome.js';
import QuizScreen from '../components/quiz/QuizScreen.jsx';
import ReviewScreen from '../components/review/ReviewScreen.jsx';
import ResultScreen from '../components/result/ResultScreen.jsx';

// Owns a single (non-Multi) quiz/review session at /quiz/:t/:c/:q or
// /review/:t/:c/:q. Resolves the quiz from the URL and starts it — unless
// it's already the active session (a bookmark opened while it's already
// running, or the router catching up after RootLayout's boot redirect), in
// which case it's left alone rather than restarting and wiping progress.
export default function QuizSessionRoute({ mode }) {
  const { termSlug, courseSlug, quizSlug } = useParams();
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const { goHome, isExiting } = useGoHome();

  useEffect(() => {
    const found = findQuizBySlug(termSlug, courseSlug, quizSlug);
    if (!found) {
      goHome();
      return;
    }
    const { term, course, quiz } = found;
    const matchesActive = state.activeQuizId === quiz.id && state.activeMode === mode;
    if (matchesActive) {
      // Already this session (e.g. restored on boot, or opened from the
      // Resume card) — only the screen needs to catch up, and only if it's
      // still sitting on the menu; leave 'result' alone.
      if (state.screen === 'menu') dispatch({ type: 'RESUME_ATTEMPT' });
      return;
    }
    dispatch({
      type: mode === 'review' ? 'START_REVIEW' : 'START_QUIZ',
      payload: {
        term: term.key,
        course: course.key,
        quizData: quiz.data,
        quizId: quiz.id,
        ...(mode === 'review' ? { fresh: true } : {}),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termSlug, courseSlug, quizSlug, mode]);

  // Keeps the address bar honest when the in-session Quiz/Review switch
  // (QuizHeader/ReviewHeader's dropdown) changes activeMode without a
  // dispatch from this route — cosmetic (a reload would already land on
  // the right URL via RootLayout's boot redirect either way), but a
  // bookmark taken mid-session should still say what's on screen.
  // Skips the mount run: activeMode then still belongs to the previous
  // session, and following it would bounce e.g. a fresh Review back to /quiz.
  const prevActiveMode = useRef(state.activeMode);
  useEffect(() => {
    const changed = prevActiveMode.current !== state.activeMode;
    prevActiveMode.current = state.activeMode;
    if (!changed || state.activeMode === mode || state.activeQuizId == null) return;
    const found = findQuizBySlug(termSlug, courseSlug, quizSlug);
    if (found && found.quiz.id === state.activeQuizId)
      navigate(quizUrlFor(found.term, found.course, found.quiz, state.activeMode), { replace: true });
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
