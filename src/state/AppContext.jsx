import { createContext, useContext, useEffect, useReducer } from 'react';
import { reducer, createInitialState } from './store.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  useEffect(() => {
    localStorage.setItem('quizApp_appSettings', JSON.stringify(state.appSettings));
    document.body.classList.toggle('no-animations', state.appSettings.disableAnimations);
    document.body.classList.toggle('compact-mode', state.appSettings.compactMode);
    document.body.classList.remove('theme-canvas', 'theme-dark-purple');
    if (state.appSettings.theme && state.appSettings.theme !== 'default') {
      document.body.classList.add(`theme-${state.appSettings.theme}`);
    }
  }, [state.appSettings]);

  useEffect(() => {
    localStorage.setItem('quizApp_quizOptions', JSON.stringify(state.quizOptions));
  }, [state.quizOptions]);

  useEffect(() => {
    localStorage.setItem('quizApp_reviewOptions', JSON.stringify(state.reviewOptions));
  }, [state.reviewOptions]);

  useEffect(() => {
    localStorage.setItem('quizApp_collapsedTerms', JSON.stringify(state.collapsedTerms));
  }, [state.collapsedTerms]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
