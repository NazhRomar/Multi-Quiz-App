import { useState } from 'react';
import { useApp } from '../../state/AppContext.jsx';
import { liveScore, scoreQuiz } from '../../state/grading.js';
import { useNavRow } from './useNavRow.jsx';
import QuizHeader from './QuizHeader.jsx';
import QuestionCard from './QuestionCard.jsx';
import SubmitConfirmModal from './SubmitConfirmModal.jsx';

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
