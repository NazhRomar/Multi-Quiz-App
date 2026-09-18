import { useEffect, useRef } from 'react';
import { useApp } from '../state/AppContext.jsx';
import { useGoHome } from './useGoHome.js';
import { showcaseQuiz } from '../devFixtures/showcaseQuiz.js';
import QuizScreen from '../components/quiz/QuizScreen.jsx';
import ReviewScreen from '../components/review/ReviewScreen.jsx';
import ResultScreen from '../components/result/ResultScreen.jsx';

// Hidden testing shortcut (Home footer's build-date click): a fixture quiz
// covering every question type, including drag-drop (no real quiz data
// uses that type, so this is the only way to exercise it end to end). It
// isn't part of the catalog, so it gets its own tiny route instead of
// QuizSessionRoute.
export default function DevShowcaseRoute() {
  const { state, dispatch } = useApp();
  const { goHome, isExiting } = useGoHome();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (state.activeTerm === 'Dev' && state.activeCourse === 'Testing') return;
    dispatch({ type: 'START_QUIZ', payload: { term: 'Dev', course: 'Testing', quizData: showcaseQuiz, quizId: null } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
