import { createContext, useContext, useEffect, useReducer } from 'react';
import { reducer, createInitialState } from './store.js';
import { applyAnswerFont } from '../utils/answerFonts.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  useEffect(() => {
    localStorage.setItem('quizApp_appSettings', JSON.stringify(state.appSettings));
    document.body.classList.toggle('no-animations', state.appSettings.disableAnimations);
    document.body.classList.toggle('compact-mode', state.appSettings.compactMode);
    document.body.classList.remove('theme-canvas', 'theme-modern', 'theme-pink', 'theme-dark-purple');
    if (state.appSettings.theme && state.appSettings.theme !== 'default') {
      document.body.classList.add(`theme-${state.appSettings.theme}`);
    }
    // Code block theme: independent of the app theme; 'default' just
    // follows the app theme's own code block look.
    [...document.body.classList].filter((c) => c.startsWith('code-theme-')).forEach((c) => document.body.classList.remove(c));
    if (state.appSettings.codeTheme && state.appSettings.codeTheme !== 'default') {
      document.body.classList.add(`code-theme-${state.appSettings.codeTheme}`);
    }
    applyAnswerFont(state.appSettings.answerFont);
  }, [state.appSettings]);

  useEffect(() => {
    localStorage.setItem('quizApp_quizOptions', JSON.stringify(state.quizOptions));
  }, [state.quizOptions]);

  useEffect(() => {
    localStorage.setItem('quizApp_reviewOptions', JSON.stringify(state.reviewOptions));
  }, [state.reviewOptions]);

  useEffect(() => {
    localStorage.setItem('quizApp_multiOptions', JSON.stringify(state.multiOptions));
  }, [state.multiOptions]);

  useEffect(() => {
    localStorage.setItem('quizApp_homeMode', JSON.stringify(state.homeMode));
  }, [state.homeMode]);

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
