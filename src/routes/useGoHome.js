import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../state/AppContext.jsx';

// Mirrors the old Shell()'s exitToMenu(): fade the current quiz/review/
// result screen out before swapping back to Home, unless animations are
// disabled. Each session route (QuizSessionRoute/MultiSessionRoute) owns
// one of these instead of a single top-level Shell, since navigating away
// now unmounts that route's content outright.
export function useGoHome() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [isExiting, setIsExiting] = useState(false);

  const goHome = useCallback(() => {
    if (state.appSettings.disableAnimations) {
      dispatch({ type: 'GO_HOME' });
      navigate('/');
      return;
    }
    setIsExiting(true);
    setTimeout(() => {
      dispatch({ type: 'GO_HOME' });
      navigate('/');
    }, 200);
  }, [state.appSettings.disableAnimations, dispatch, navigate]);

  return { goHome, isExiting };
}
