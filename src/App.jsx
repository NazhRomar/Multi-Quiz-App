import { useCallback, useState } from 'react';
import { AppProvider, useApp } from './state/AppContext.jsx';
import MenuScreen from './components/menu/MenuScreen.jsx';
import QuizScreen from './components/quiz/QuizScreen.jsx';
import ReviewScreen from './components/review/ReviewScreen.jsx';
import ResultScreen from './components/result/ResultScreen.jsx';

function Shell() {
  const { state, dispatch } = useApp();
  const [isAppExiting, setIsAppExiting] = useState(false);

  // Mirrors exitToMenu(): fade #app-root out before swapping back to the
  // menu, unless animations are disabled.
  const goHome = useCallback(() => {
    if (state.appSettings.disableAnimations) {
      dispatch({ type: 'GO_HOME' });
      return;
    }
    setIsAppExiting(true);
    setTimeout(() => {
      setIsAppExiting(false);
      dispatch({ type: 'GO_HOME' });
    }, 200);
  }, [state.appSettings.disableAnimations, dispatch]);

  let content;
  switch (state.screen) {
    case 'quiz':
      content = <QuizScreen goHome={goHome} />;
      break;
    case 'review':
      content = <ReviewScreen goHome={goHome} />;
      break;
    case 'result':
      content = <ResultScreen goHome={goHome} />;
      break;
    case 'menu':
    default:
      content = <MenuScreen />;
      break;
  }

  return <div className={isAppExiting ? 'app-exiting' : ''}>{content}</div>;
}

export default function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
