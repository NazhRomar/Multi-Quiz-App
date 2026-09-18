import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '../state/AppContext.jsx';
import { findQuizById, quizUrlFor } from '../data/catalog.js';

// Always-mounted root of the route tree. Renders nothing of its own — Home
// and the quiz/review/result screens each own their own header/chrome (see
// BrowseLayout and QuizHeader) — it only runs the one-time boot redirect
// that points the address bar at whatever attempt createInitialState()
// already restored from localStorage, so a plain reload mid-attempt lands
// back on the matching URL instead of resetting to "/".
export default function RootLayout() {
  const { state } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.screen === 'menu') return;
    if (state.activeQuiz?.multi) {
      navigate(state.activeMode === 'review' ? '/multi/review' : '/multi/quiz', { replace: true });
      return;
    }
    const found = findQuizById(state.activeQuizId);
    if (!found) {
      // No id (pre-migration save) or the quiz was since renamed/deleted —
      // degrade to Home, same as today; the attempt still shows up via the
      // Resume card if it's otherwise intact.
      navigate('/', { replace: true });
      return;
    }
    navigate(quizUrlFor(found.term, found.course, found.quiz, state.activeMode), { replace: true });
    // Deliberately once, on mount: this reconciles the URL with whatever
    // createInitialState() already restored, it doesn't react to later
    // in-session navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <Outlet />;
}
