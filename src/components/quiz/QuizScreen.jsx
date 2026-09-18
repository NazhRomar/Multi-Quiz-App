import { useEffect, useState } from 'react';
import { useApp } from '../../state/AppContext.jsx';
import { liveScore, scoreQuiz, fitbGiven } from '../../state/grading.js';
import { useNavRow } from './useNavRow.jsx';
import { useChoiceKeys, useEnterShortcut, usePrevShortcut } from './useEnterShortcut.js';
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

  // Quiz options → Read first: a new, unanswered question keeps its choices
  // blurred and untouchable for N seconds, counting down, so the question
  // itself gets read first. Already-answered questions never blur.
  const readFirstSecs = quizOptions.readFirstSeconds || 0;
  const [blurLeft, setBlurLeft] = useState(0);
  useEffect(() => {
    setBlurLeft(isLocked ? 0 : readFirstSecs);
  }, [question.id, isLocked, readFirstSecs]);
  useEffect(() => {
    if (blurLeft <= 0) return undefined;
    const timer = setTimeout(() => setBlurLeft((left) => left - 1), 1000);
    return () => clearTimeout(timer);
  }, [blurLeft]);

  // Keyboard shortcuts — only while the question is on screen and settled
  // (not mid card transition, so a quick double press can't skip one, and
  // not behind the Finish dialog).
  const keysActive = !showConfirm && !isCardExiting && blurLeft === 0;
  const isChoiceType = question.type === 'mc' || question.type === 'tf' || question.type === 'msq';
  const hasSelection =
    question.type === 'msq' ? (savedState.value || []).length > 0 : savedState.value !== null && savedState.value !== undefined;
  const submitCurrent = () => dispatch({ type: 'CHECK_ANSWER', payload: { qId: question.id } });

  // Quiz options → Mobile Submit button: whether *this* question could be
  // submitted right now via its in-card Submit button (Multiple Select,
  // Fill in the Blank, Dropdown Matching and Drag & Drop always can — they
  // double as "give up and reveal" — Multiple Choice/True-False only once
  // something's picked, and only when Instant submit is off, since with it
  // on there's no in-card Submit button to mirror).
  const submitReady =
    !isLocked &&
    (question.type === 'msq' || question.type === 'fitb' || question.type === 'matching' || question.type === 'drag-drop'
      ? true
      : (question.type === 'mc' || question.type === 'tf') && !quizOptions.instantSubmit && hasSelection);

  // Nothing picked yet on a question that doubles as "give up and reveal"
  // (msq/fitb — matching and drag-drop's in-card button says Submit either
  // way, so it's mirrored as-is): the mobile Submit button should say Show
  // Answer too, matching what tapping it actually does.
  const submitIsEmpty =
    question.type === 'msq'
      ? (savedState.value || []).length === 0
      : question.type === 'fitb'
        ? fitbGiven(question, savedState.value).every((g) => !g.trim())
        : false;

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
  // Left arrow: what the Previous button does.
  usePrevShortcut(keysActive && !isFirst ? () => animatedNav('PREV_Q') : null);

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
    onRestart: () => dispatch({ type: 'RESTART' }),
    onExit: goHome,
    submitReady,
    submitIsEmpty,
    onSubmit: submitCurrent,
    mobileSubmitButton: quizOptions.mobileSubmitButton,
    sourceTag: <QuestionSource question={question} variant="nav" />,
    // Shown even before Enter can go on (unanswered, or Next blocked by No
    // skipping), so the button doesn't swap its arrow for a keycap mid-question.
    enterHint: !quizOptions.hideEnterHint,
    prevHint: !quizOptions.hideEnterHint,
  });

  const score = liveScore(activeQuiz.questions, userAnswers, quizOptions);

  return (
    <>
      <QuizHeader score={score} goHome={goHome} />
      {topRow}
      <main id="quiz-container">
        <QuestionCard
          // Remounts per question: without it the previous question's
          // revealed green/red choices transition away on the new card.
          key={question.id}
          question={question}
          blurLeft={blurLeft}
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
