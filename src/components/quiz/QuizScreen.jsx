import { useState } from 'react';
import { useApp } from '../../state/AppContext.jsx';
import { liveScore, scoreQuiz } from '../../state/grading.js';
import { useNavRow } from './useNavRow.jsx';
import { useChoiceKeys, useEnterShortcut } from './useEnterShortcut.js';
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

  // Keyboard shortcuts — only while the question is on screen and settled
  // (not mid card transition, so a quick double press can't skip one, and
  // not behind the Finish dialog).
  const keysActive = !showConfirm && !isCardExiting;
  const isChoiceType = question.type === 'mc' || question.type === 'tf' || question.type === 'msq';
  const hasSelection =
    question.type === 'msq' ? (savedState.value || []).length > 0 : savedState.value !== null && savedState.value !== undefined;
  const submitCurrent = () => dispatch({ type: 'CHECK_ANSWER', payload: { qId: question.id } });

  // Number keys pick an option (1–9, 0 = 10th): Multiple Choice / True-False
  // select it (and submit, with Instant submit on); Multiple Select toggles
  // it, then Enter submits.
  useChoiceKeys(
    keysActive && !isLocked && isChoiceType
      ? (idx) => {
          if (idx >= question.options.length) return;
          if (question.type === 'msq') {
            const checked = !(savedState.value || []).includes(idx);
            dispatch({ type: 'TOGGLE_MSQ', payload: { qId: question.id, idx, checked } });
          } else {
            dispatch({ type: 'SAVE_ANSWER', payload: { qId: question.id, value: idx } });
            if (quizOptions.instantSubmit) submitCurrent();
          }
        }
      : null
  );

  // Enter: submits a picked-but-unsubmitted choice answer; once answered,
  // does what the Next button does (Finish on the last question).
  const enterSubmits = !isLocked && isChoiceType && hasSelection;
  useEnterShortcut(
    !keysActive ? null : isLocked ? (isLast ? () => setShowConfirm(true) : () => animatedNav('NEXT_Q')) : enterSubmits ? submitCurrent : null
  );

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

  const score = liveScore(activeQuiz.questions, userAnswers, quizOptions);

  return (
    <>
      <QuizHeader score={score} goHome={goHome} />
      {topRow}
      <main id="quiz-container">
        <QuestionCard
          question={question}
          index={currentIndex}
          savedState={savedState}
          isLocked={isLocked}
          exiting={isCardExiting}
          showKeyHints={!quizOptions.hideNumberHint}
          submitEnterHint={enterSubmits && !quizOptions.hideEnterHint}
        />
      </main>
      {bottomRow}
      {portals}
      {showConfirm && (
        <SubmitConfirmModal
          unanswered={unanswered}
          onCancel={() => setShowConfirm(false)}
          onConfirm={() => {
            setShowConfirm(false);
            dispatch({ type: 'SUBMIT_QUIZ', payload: scoreQuiz(activeQuiz.questions, userAnswers, quizOptions) });
          }}
        />
      )}
    </>
  );
}
