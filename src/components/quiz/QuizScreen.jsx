import { useEffect, useRef, useState } from 'react';
import { useApp } from '../../state/AppContext.jsx';
import { liveScore, scoreQuiz } from '../../state/grading.js';
import { useNavRow } from './useNavRow.jsx';
import QuizHeader from './QuizHeader.jsx';
import QuestionCard from './QuestionCard.jsx';
import SubmitConfirmModal from './SubmitConfirmModal.jsx';
import QuestionSource from '../common/QuestionSource.jsx';

export default function QuizScreen({ goHome }) {
  const { state, dispatch } = useApp();
  const { activeQuiz, currentIndex, userAnswers, appSettings, quizOptions } = state;
  const [isCardExiting, setIsCardExiting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const question = activeQuiz.questions[currentIndex];
  const savedState = userAnswers[question.id] || { value: null, submitted: false };
  const isLocked = savedState.submitted;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === activeQuiz.questions.length - 1;
  const nextBlocked = quizOptions.noSkip && !savedState.submitted;

  // Ports navigateWithAnimation(): fade the question card out for 95ms
  // before actually changing the index, unless animations are disabled.
  const animatedNav = (actionType) => {
    if (appSettings.disableAnimations) {
      dispatch({ type: actionType });
      window.scrollTo(0, 0);
      return;
    }
    setIsCardExiting(true);
    setTimeout(() => {
      setIsCardExiting(false);
      dispatch({ type: actionType });
      window.scrollTo(0, 0);
    }, 95);
  };

  const unanswered = activeQuiz.questions.filter((q) => !q.flagged && !userAnswers[q.id]?.submitted).length;

  // Enter shortcut: once the current question is answered, Enter does what
  // the Next button does (Finish on the last question). The window listener
  // reads the latest action through a ref. Ignored when the keypress
  // belongs to something else: typing (Enter in a fill-in already submits —
  // it mustn't also skip ahead), a focused button/select/link (handles Enter
  // natively), an open menu, a held-down key, or mid card transition.
  const enterAction = isLocked && !showConfirm && !isCardExiting ? (isLast ? () => setShowConfirm(true) : () => animatedNav('NEXT_Q')) : null;
  const enterActionRef = useRef(enterAction);
  useEffect(() => {
    enterActionRef.current = enterAction;
  });
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Enter' || e.repeat || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.target.closest?.('input, textarea, select, button, a, [role="button"], [contenteditable], .dropdown-menu')) return;
      if (!enterActionRef.current) return;
      e.preventDefault();
      enterActionRef.current();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const { topRow, bottomRow, portals } = useNavRow({
    navLocation: appSettings.navLocation,
    isFirst,
    isLast,
    nextBlocked,
    isQuizMode: true,
    isListView: false,
    onPrev: () => animatedNav('PREV_Q'),
    onNext: () => animatedNav('NEXT_Q'),
    onFinishQuiz: () => setShowConfirm(true),
    sourceTag: <QuestionSource question={question} variant="nav" />,
    enterHint: isLocked && !quizOptions.hideEnterHint,
  });

  const score = liveScore(activeQuiz.questions, userAnswers);

  return (
    <>
      <QuizHeader score={score} goHome={goHome} />
      {topRow}
      <main id="quiz-container">
        <QuestionCard question={question} index={currentIndex} savedState={savedState} isLocked={isLocked} exiting={isCardExiting} />
      </main>
      {bottomRow}
      {portals}
      {showConfirm && (
        <SubmitConfirmModal
          unanswered={unanswered}
          onCancel={() => setShowConfirm(false)}
          onConfirm={() => {
            setShowConfirm(false);
            dispatch({ type: 'SUBMIT_QUIZ', payload: scoreQuiz(activeQuiz.questions, userAnswers) });
          }}
        />
      )}
    </>
  );
}
