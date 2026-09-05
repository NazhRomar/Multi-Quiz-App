export function loadState(key, defaultState) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? { ...defaultState, ...JSON.parse(stored) } : defaultState;
  } catch (e) {
    return defaultState;
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
  compactMode: false,
};
export const DEFAULT_QUIZ_OPTIONS = {
  noSkip: false,
  hideFeedback: true,
  hideFeedbackIfExplanation: false,
  hideExplanation: false,
  shuffleQuestions: false,
  shuffleChoices: false,
  instantSubmit: true, // auto-submit mc/tf the moment you pick an option
};
export const DEFAULT_REVIEW_OPTIONS = {
  showAllChoices: false,
  hideExplanation: false,
  listView: false,
  wrongOnly: false,
};

export function createInitialState() {
  return {
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
    collapsedTerms: loadState('quizApp_collapsedTerms', {}),
  };
}

function applyShuffle(quiz, quizOptions) {
  if (quizOptions.shuffleQuestions) {
    shuffleArray(quiz.questions);
  }
  if (quizOptions.shuffleChoices) {
    quiz.questions.forEach((q) => {
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
      } else if (q.type === 'matching' || q.type === 'drag-drop') {
        shuffleArray(q.pairs);
      }
    });
  }
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

    case 'START_REVIEW': {
      const { term, course, quizData } = action.payload;
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
      };
    }

    case 'RESTART': {
      if (state.activeMode === 'quiz') {
        return reducer(state, {
          type: 'START_QUIZ',
          payload: { term: state.activeTerm, course: state.activeCourse, quizData: state.originalQuizData },
        });
      }
      return reducer(state, {
        type: 'START_REVIEW',
        payload: { term: state.activeTerm, course: state.activeCourse, quizData: state.originalQuizData },
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

    case 'CHECK_ANSWER': {
      const { qId } = action.payload;
      const existing = state.userAnswers[qId];
      if (!existing) return state;
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
    case 'TOGGLE_TERM': {
      const collapsedTerms = { ...state.collapsedTerms, [action.payload.term]: !state.collapsedTerms[action.payload.term] };
      return { ...state, collapsedTerms };
    }

    default:
      return state;
  }
}
