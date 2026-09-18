import { createContext, useContext, useEffect, useReducer } from 'react';
import {
  reducer,
  createInitialState,
  saveState,
  clearAttempt,
  ATTEMPT_QUIZ_KEY,
  ATTEMPT_PROGRESS_KEY,
} from './store.js';
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
    document.body.classList.toggle('code-wrap', !!state.appSettings.codeWrap);
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

  // The in-progress attempt, so a reload (or the OS dropping the installed
  // app from memory mid quiz) doesn't cost you the attempt. The heavy half
  // — the questions — only gets rewritten when a new attempt starts, which
  // is exactly when activeQuiz becomes a new object (START_QUIZ /
  // START_REVIEW, and so RESTART and the mode switches too).
  useEffect(() => {
    if (!state.activeQuiz) {
      clearAttempt();
      return;
    }
    saveState(ATTEMPT_QUIZ_KEY, {
      activeQuiz: state.activeQuiz,
      originalQuizData: state.originalQuizData,
      activeTerm: state.activeTerm,
      activeCourse: state.activeCourse,
      activeMode: state.activeMode,
      activeQuizId: state.activeQuizId,
    });
  }, [state.activeQuiz, state.originalQuizData, state.activeTerm, state.activeCourse, state.activeMode, state.activeQuizId]);

  // The light half: where you are and what you've answered. Also the
  // screen, which is what tells the next visit whether to reopen the quiz
  // or just offer it on the menu (see createInitialState).
  useEffect(() => {
    if (!state.activeQuiz) return;
    saveState(ATTEMPT_PROGRESS_KEY, {
      screen: state.screen,
      currentIndex: state.currentIndex,
      userAnswers: state.userAnswers,
      result: state.result,
    });
  }, [state.activeQuiz, state.screen, state.currentIndex, state.userAnswers, state.result]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
