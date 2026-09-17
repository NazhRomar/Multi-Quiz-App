export function loadState(key, defaultState) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? { ...defaultState, ...JSON.parse(stored) } : defaultState;
  } catch (e) {
    return defaultState;
  }
}

// An in-progress attempt is saved in two pieces, because they change at
// very different rates: the quiz itself (heavy — the shuffled questions
// plus the unshuffled original Restart goes back to) is written once when
// the attempt starts, while the progress (small — answers, position,
// score) is rewritten on every keystroke in a blank. Splitting them keeps
// answering cheap no matter how big the quiz is.
export const ATTEMPT_QUIZ_KEY = 'quizApp_attemptQuiz';
export const ATTEMPT_PROGRESS_KEY = 'quizApp_attemptProgress';

// The attempt blob is the only thing here big enough to hit the storage
// quota, and a browser in private mode can refuse writes outright. Either
// way the app keeps working in memory — it just won't survive a reload.
export function saveState(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* not resumable this time */
  }
}

export function clearAttempt() {
  try {
    localStorage.removeItem(ATTEMPT_QUIZ_KEY);
    localStorage.removeItem(ATTEMPT_PROGRESS_KEY);
  } catch (e) {
    /* nothing to clear */
  }
}

// Reads back a saved attempt, or null if there isn't one (or it's damaged
// — quiz data can change under a saved attempt between deploys, so every
// field is treated as untrusted).
function loadAttempt() {
  try {
    const quiz = JSON.parse(localStorage.getItem(ATTEMPT_QUIZ_KEY));
    const progress = JSON.parse(localStorage.getItem(ATTEMPT_PROGRESS_KEY));
    if (!quiz || !progress) return null;
    if (!Array.isArray(quiz.activeQuiz?.questions) || quiz.activeQuiz.questions.length === 0) return null;
    return { quiz, progress };
  } catch (e) {
    return null;
  }
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export const DEFAULT_APP_SETTINGS = {
  disableAnimations: false,
  navLocation: 'down', // 'up' | 'down' | 'sides' | 'center' | 'both' | 'all'
  theme: 'default',
  codeTheme: 'default', // see CODE_THEMES in AppSettingsFields.jsx
  // false (default): long code lines scroll sideways, keeping indentation
  // intact. true: wrap to fit the screen instead (no horizontal scrolling).
  codeWrap: false,
  appFont: 'default', // see FONTS in utils/fonts.js
  answerFont: 'default', // see FONTS in utils/fonts.js
  compactMode: false,
};
export const DEFAULT_QUIZ_OPTIONS = {
  noSkip: false,
  hideFeedback: true,
  hideFeedbackIfExplanation: false,
  hideExplanation: false,
  shuffleQuestions: false,
  shuffleMatchingRows: false, // shuffleQuestions also reorders the term rows of matching/drag & drop questions
  shuffleChoices: false,
  keepTrueFalseOrder: true, // shuffleChoices leaves True/False questions as True, False
  showMsqCount: false, // "Select N" hint on multiple-select questions
  readFirstSeconds: 0, // blur the choices for N seconds on a new question (0 = off)
  msqScoring: 'rightMinusWrong', // multiple select: 'right' | 'rightMinusWrong' | 'allOrNothing' (see pointsEarned)
  instantSubmit: true, // auto-submit mc/tf the moment you pick an option
  // Mobile: Next turns into Submit once the question could actually be
  // submitted (mirroring the in-card Submit button), then back to Next
  // once it's locked in. See QuizScreen's submitReady / useNavRow.jsx.
  mobileSubmitButton: false,
  autoFocusBlank: true, // fitb: cursor in the first blank on arrival (not on touch screens)
  hideEnterHint: false, // hide the ⏎ keycaps (Next/Submit) and ← (Previous); the shortcuts still work
  hideNumberHint: false, // hide the 1–9/0 keycaps on choices (the number keys still work)
};
export const DEFAULT_REVIEW_OPTIONS = {
  showAllChoices: false,
  hideExplanation: false,
  listView: false,
  wrongOnly: false,
};

// Only shown/used in a Multi session (quizzes combined via the home menu's
// Multi Quiz selection — see buildMultiQuiz in catalog.js).
export const DEFAULT_MULTI_OPTIONS = {
  showSource: true, // label each question with the quiz it came from
};

export const DEFAULT_HOME_MODE = {
  multi: false, // Single vs Multi: tapping a quiz opens it, or selects it
  review: false, // Quiz vs Review: which mode quizzes open in
};

export function createInitialState() {
  const base = {
    screen: 'menu', // 'menu' | 'quiz' | 'review' | 'result'
    activeTerm: '',
    activeCourse: '',
    originalQuizData: null,
    activeQuiz: null,
    activeMode: 'quiz', // 'quiz' | 'review' — which mode the current activeQuiz session is in
    currentIndex: 0,
    userAnswers: {},
    result: null, // scoreQuiz() output, set on SUBMIT_QUIZ

    appSettings: loadState('quizApp_appSettings', DEFAULT_APP_SETTINGS),
    quizOptions: loadState('quizApp_quizOptions', DEFAULT_QUIZ_OPTIONS),
    reviewOptions: loadState('quizApp_reviewOptions', DEFAULT_REVIEW_OPTIONS),
    multiOptions: loadState('quizApp_multiOptions', DEFAULT_MULTI_OPTIONS),
    // Home menu Single/Multi + Quiz/Review toggles (persisted), and the
    // Multi selection (courseMenu quiz ids; kept across returns to the menu
    // for the session, not persisted).
    homeMode: loadState('quizApp_homeMode', DEFAULT_HOME_MODE),
    multiSelection: [],
    collapsedTerms: loadState('quizApp_collapsedTerms', {}),
  };

  // Restore an attempt left over from the last visit, if there is one.
  // The saved screen is what decides where you land: a reload mid quiz
  // drops you straight back into it, while leaving via Exit saved
  // 'menu' — so that one lands on the menu, with the attempt offered as
  // a Resume card (ResumeCard.jsx) instead of reopening behind your back.
  const saved = loadAttempt();
  if (!saved) return base;
  const { quiz, progress } = saved;
  const result = progress.result ?? null;
  // A result screen with no result to show would crash ResultScreen.
  const screen = ['quiz', 'review', 'result'].includes(progress.screen) && (progress.screen !== 'result' || result)
    ? progress.screen
    : 'menu';

  return {
    ...base,
    screen,
    activeTerm: quiz.activeTerm ?? '',
    activeCourse: quiz.activeCourse ?? '',
    activeMode: quiz.activeMode === 'review' ? 'review' : 'quiz',
    activeQuiz: quiz.activeQuiz,
    // Pre-shuffle copy Restart goes back to. Older saves (or a failed
    // write) may not have it; the shuffled copy is a workable stand-in.
    originalQuizData: quiz.originalQuizData ?? quiz.activeQuiz,
    currentIndex: Math.min(Math.max(progress.currentIndex | 0, 0), quiz.activeQuiz.questions.length - 1),
    userAnswers: progress.userAnswers ?? {},
    result,
  };
}

function applyShuffle(quiz, quizOptions) {
  if (quizOptions.shuffleQuestions) {
    shuffleArray(quiz.questions);
    // A matching/drag & drop row is a sub-question, so its order rides with
    // Shuffle questions rather than Shuffle choices (which names the pool
    // below). Behind its own toggle, because the terms are often in a
    // deliberate order - alphabetical, or grouped by topic.
    if (quizOptions.shuffleMatchingRows) {
      quiz.questions.forEach((q) => {
        if (q.type === 'matching' || q.type === 'drag-drop') shuffleArray(q.pairs);
      });
    }
  }
  if (quizOptions.shuffleChoices) {
    quiz.questions.forEach((q) => {
      if (q.type === 'tf' && quizOptions.keepTrueFalseOrder) return;
      if (q.type === 'mc' || q.type === 'tf') {
        let arr = q.options.map((opt, i) => ({ text: opt, isCorrect: i === q.correctAnswer }));
        shuffleArray(arr);
        q.options = arr.map((a) => a.text);
        q.correctAnswer = arr.findIndex((a) => a.isCorrect);
      } else if (q.type === 'msq') {
        let arr = q.options.map((opt, i) => ({ text: opt, isCorrect: q.correctAnswer.includes(i) }));
        shuffleArray(arr);
        q.options = arr.map((a) => a.text);
        q.correctAnswer = arr.reduce((acc, a, i) => {
          if (a.isCorrect) acc.push(i);
          return acc;
        }, []);
      }
    });
  }
  // The pool of answers to choose from (matching dropdowns, drag & drop
  // bank) is ALWAYS shuffled, with or without Shuffle choices: authored
  // order lines up 1:1 with the rows, which hands over the answers.
  quiz.questions.forEach((q) => {
    if (q.type !== 'matching' && q.type !== 'drag-drop') return;
    q.choicePool = shuffleArray(q.allChoices ? [...q.allChoices] : q.pairs.map((p) => p.match));
  });
  return quiz;
}

export function reducer(state, action) {
  switch (action.type) {
    case 'START_QUIZ': {
      const { term, course, quizData } = action.payload;
      const activeQuiz = applyShuffle(JSON.parse(JSON.stringify(quizData)), state.quizOptions);
      return {
        ...state,
        screen: 'quiz',
        originalQuizData: quizData,
        activeQuiz,
        activeTerm: term,
        activeCourse: course,
        activeMode: 'quiz',
        currentIndex: 0,
        userAnswers: {},
        result: null,
      };
    }

    // fresh: opened straight from the home menu, not switched to from a quiz
    // attempt — drop any previous attempt's answers so they can't leak into
    // this review (e.g. the Wrong answers only filter; ids repeat across quizzes).
    case 'START_REVIEW': {
      const { term, course, quizData, fresh } = action.payload;
      return {
        ...state,
        screen: 'review',
        originalQuizData: quizData,
        activeQuiz: JSON.parse(JSON.stringify(quizData)),
        activeTerm: term,
        activeCourse: course,
        activeMode: 'review',
        currentIndex: 0,
        result: null,
        ...(fresh ? { userAnswers: {} } : {}),
      };
    }

    case 'RESTART': {
      if (state.activeMode === 'quiz') {
        return reducer(state, {
          type: 'START_QUIZ',
          payload: { term: state.activeTerm, course: state.activeCourse, quizData: state.originalQuizData },
        });
      }
      // Review restarts from the current activeQuiz rather than the original:
      // after a quiz attempt it may be shuffled, and the kept userAnswers
      // (graded on the review cards) refer to that shuffled order.
      return reducer(state, {
        type: 'START_REVIEW',
        payload: { term: state.activeTerm, course: state.activeCourse, quizData: state.activeQuiz },
      });
    }

    // Mirrors switchToReview()/switchToQuiz(): reuses the CURRENT (possibly
    // shuffled) activeQuiz, not originalQuizData — deliberately different
    // from RESTART.
    case 'SWITCH_TO_REVIEW':
      return reducer(state, {
        type: 'START_REVIEW',
        payload: { term: state.activeTerm, course: state.activeCourse, quizData: state.activeQuiz },
      });
    case 'SWITCH_TO_QUIZ':
      return reducer(state, {
        type: 'START_QUIZ',
        payload: { term: state.activeTerm, course: state.activeCourse, quizData: state.activeQuiz },
      });

    case 'GO_HOME':
      return { ...state, screen: 'menu' };

    // Back into the attempt the menu's Resume card is offering — the
    // state is already loaded, only the screen has to change.
    case 'RESUME_ATTEMPT':
      return { ...state, screen: state.activeMode === 'review' ? 'review' : 'quiz' };

    // Throw the saved attempt away. Clearing activeQuiz is what actually
    // wipes it from storage: the persistence effect in AppContext removes
    // both keys whenever there's no active quiz.
    case 'DISCARD_ATTEMPT':
      return {
        ...state,
        screen: 'menu',
        activeTerm: '',
        activeCourse: '',
        originalQuizData: null,
        activeQuiz: null,
        currentIndex: 0,
        userAnswers: {},
        result: null,
      };

    // Clamped defensively: the UI only ever offers Next/Prev when it's valid
    // to move (the last question swaps to a Finish/Done button instead),
    // but React can batch many rapid dispatches into one render before that
    // swap takes effect, so the reducer itself must not assume the caller
    // already enforced the bound.
    case 'NEXT_Q':
      return { ...state, currentIndex: Math.min(state.currentIndex + 1, state.activeQuiz.questions.length - 1) };
    case 'PREV_Q':
      return { ...state, currentIndex: Math.max(state.currentIndex - 1, 0) };

    case 'SAVE_ANSWER': {
      const { qId, value } = action.payload;
      const existing = state.userAnswers[qId] || { value: null, submitted: false };
      return { ...state, userAnswers: { ...state.userAnswers, [qId]: { ...existing, value } } };
    }

    case 'TOGGLE_MSQ': {
      const { qId, idx, checked } = action.payload;
      const existing = state.userAnswers[qId] || { value: [], submitted: false };
      const arr = existing.value || [];
      const nextArr = checked ? (arr.includes(idx) ? arr : [...arr, idx]) : arr.filter((i) => i !== idx);
      return { ...state, userAnswers: { ...state.userAnswers, [qId]: { ...existing, value: nextArr } } };
    }

    case 'SAVE_DROPDOWN': {
      const { qId, term, value } = action.payload;
      const existing = state.userAnswers[qId] || { value: {}, submitted: false };
      return {
        ...state,
        userAnswers: { ...state.userAnswers, [qId]: { ...existing, value: { ...(existing.value || {}), [term]: value } } },
      };
    }

    case 'SAVE_DRAGDROP': {
      const { qId, value } = action.payload;
      const existing = state.userAnswers[qId] || { value: null, submitted: false };
      return { ...state, userAnswers: { ...state.userAnswers, [qId]: { ...existing, value } } };
    }

    // Submitting with nothing entered is allowed — it's how you give up and
    // reveal the answer (the question then counts as unanswered).
    case 'CHECK_ANSWER': {
      const { qId } = action.payload;
      const existing = state.userAnswers[qId] || { value: null };
      return { ...state, userAnswers: { ...state.userAnswers, [qId]: { ...existing, submitted: true } } };
    }

    case 'SUBMIT_QUIZ':
      return { ...state, screen: 'result', result: action.payload };

    case 'SET_APP_SETTING': {
      const appSettings = { ...state.appSettings, [action.payload.key]: action.payload.value };
      return { ...state, appSettings };
    }
    case 'SET_QUIZ_OPTION': {
      const quizOptions = { ...state.quizOptions, [action.payload.key]: action.payload.value };
      return { ...state, quizOptions };
    }
    case 'SET_REVIEW_OPTION': {
      const reviewOptions = { ...state.reviewOptions, [action.payload.key]: action.payload.value };
      return { ...state, reviewOptions };
    }
    case 'SET_MULTI_OPTION': {
      const multiOptions = { ...state.multiOptions, [action.payload.key]: action.payload.value };
      return { ...state, multiOptions };
    }
    case 'SET_HOME_MODE': {
      const homeMode = { ...state.homeMode, [action.payload.key]: action.payload.value };
      return { ...state, homeMode };
    }
    case 'SET_MULTI_SELECTION':
      return { ...state, multiSelection: action.payload };
    case 'TOGGLE_TERM': {
      const collapsedTerms = { ...state.collapsedTerms, [action.payload.term]: !state.collapsedTerms[action.payload.term] };
      return { ...state, collapsedTerms };
    }

    default:
      return state;
  }
}
