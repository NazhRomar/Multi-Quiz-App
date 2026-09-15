import { createContext, useContext, useEffect, useReducer } from 'react';
import { reducer, createInitialState } from './store.js';
import { applyFonts } from '../utils/fonts.js';
import { applyTheme } from '../utils/themes.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);

  useEffect(() => {
    localStorage.setItem('quizApp_appSettings', JSON.stringify(state.appSettings));
    // !! — toggle() with an undefined force flips the class instead of
    // setting it, so a missing setting must not reach it raw.
    document.body.classList.toggle('no-animations', !!state.appSettings.disableAnimations);
    document.body.classList.toggle('compact-mode', !!state.appSettings.compactMode);
    applyTheme(state.appSettings.theme);
    // Code block theme: independent of the app theme; 'default' just
    // follows the app theme's own code block look.
    [...document.body.classList].filter((c) => c.startsWith('code-theme-')).forEach((c) => document.body.classList.remove(c));
    if (state.appSettings.codeTheme && state.appSettings.codeTheme !== 'default') {
      document.body.classList.add(`code-theme-${state.appSettings.codeTheme}`);
    }
    applyFonts(state.appSettings.appFont, state.appSettings.answerFont);
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
