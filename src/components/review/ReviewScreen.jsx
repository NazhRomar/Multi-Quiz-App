import { useState } from 'react';
import { useIsMobile } from '../../utils/useIsMobile.js';
import { useApp } from '../../state/AppContext.jsx';
import { useNavRow } from '../quiz/useNavRow.jsx';
import { useEnterShortcut, usePrevShortcut } from '../quiz/useEnterShortcut.js';
import { isAnswerCorrect } from '../../state/grading.js';
import ReviewHeader from './ReviewHeader.jsx';
import ReviewCard from './ReviewCard.jsx';
import QuestionSource from '../common/QuestionSource.jsx';

export default function ReviewScreen({ goHome }) {
  const { state, dispatch } = useApp();
  const { activeQuiz, currentIndex, appSettings, reviewOptions, userAnswers } = state;
  const [isCardExiting, setIsCardExiting] = useState(false);
  const isMobile = useIsMobile();
  const isListView = reviewOptions.listView;
  // Reviewing right after a quiz attempt (not a fresh review from home):
  // cards then grade that attempt. Wrong answers only needs one to filter
  // by — started fresh, there's no grading to base it on (and nothing
  // filtered would ever be "wrong"), so it's ignored either way; the
  // setting itself is also disabled in Review options (ReviewOptionsFields).
  const hasAttempt = Object.keys(userAnswers).length > 0;
  const questions =
    reviewOptions.wrongOnly && hasAttempt
      ? activeQuiz.questions.filter((q) => !q.flagged && !isAnswerCorrect(q, userAnswers[q.id]?.value ?? null))
      : activeQuiz.questions;
  const total = questions.length;
  // Each card's own number badge (ReviewCard) always names its position in
  // the quiz itself — stable for the session (shuffled once at quiz start,
  // same order throughout) — never its position in a Wrong-only subset, so
  // "Question 7" stays Question 7 whether you're looking at every question
  // or only the ones you missed.
  const quizIndexById = new Map(activeQuiz.questions.map((q, i) => [q.id, i]));
  const answerOf = (q) => userAnswers[q.id]?.value ?? null;

  const animatedNav = (actionType) => {
    if (appSettings.disableAnimations || isListView) {
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

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

  // Enter goes to the next card (every review card is already "answered").
  // Nothing on the last card — its button is Done, which leaves the review,
  // too easy to trigger by tapping Enter one time too many — or in list view.
  const canEnterNext = !isListView && total > 0 && currentIndex < total - 1;
  useEnterShortcut(canEnterNext && !isCardExiting ? () => animatedNav('NEXT_Q') : null);
  // Left arrow: the previous card.
  usePrevShortcut(!isListView && total > 0 && !isFirst && !isCardExiting ? () => animatedNav('PREV_Q') : null);

  const { topRow, bottomRow, portals } = useNavRow({
    navLocation: appSettings.navLocation,
    isFirst: isListView || total === 0 ? true : isFirst,
    isLast: isListView || total === 0 ? true : isLast,
    nextBlocked: false,
    isQuizMode: false,
    isListView,
    onPrev: () => animatedNav('PREV_Q'),
    onNext: () => animatedNav('NEXT_Q'),
    onDone: goHome,
    onRestart: () => dispatch({ type: 'RESTART' }),
    onExit: goHome,
    // List view keeps each card's own in-card source strip instead.
    sourceTag: !isListView && total > 0 && <QuestionSource question={questions[Math.min(currentIndex, total - 1)]} variant="nav" />,
    enterHint: canEnterNext && !state.quizOptions.hideEnterHint,
    prevHint: !state.quizOptions.hideEnterHint,
  });

  const progressLabel = total === 0 ? '0 Items' : isListView ? `${total} Items` : `${Math.min(currentIndex + 1, total)}/${total}`;
  const progressPct = total === 0 ? 100 : isListView ? 100 : ((currentIndex + 1) / total) * 100;

  return (
    <>
      <ReviewHeader progressLabel={progressLabel} progressPct={progressPct} goHome={goHome} />
      {topRow}
      <main id="quiz-container">
        {total === 0 ? (
          <div className="feedback-banner correct" style={{ textAlign: 'center' }}>
            <strong>🎉 No wrong answers to review!</strong>
          </div>
        ) : isListView ? (
          questions.map((q) => (
            <ReviewCard
              key={q.id}
              question={q}
              index={quizIndexById.get(q.id)}
              reviewOptions={reviewOptions}
              quizOptions={state.quizOptions}
              compactStatus={isMobile}
              isListView
              userAnswer={answerOf(q)}
              hasAttempt={hasAttempt}
            />
          ))
        ) : (
          <ReviewCard
            // Remounts per question, like the quiz card: otherwise the
            // previous card's revealed colors transition away on this one.
            key={questions[Math.min(currentIndex, total - 1)].id}
            compactStatus={isMobile}
            question={questions[Math.min(currentIndex, total - 1)]}
            index={quizIndexById.get(questions[Math.min(currentIndex, total - 1)].id)}
            reviewOptions={reviewOptions}
            quizOptions={state.quizOptions}
            isListView={false}
            exiting={isCardExiting}
            userAnswer={answerOf(questions[Math.min(currentIndex, total - 1)])}
            hasAttempt={hasAttempt}
          />
        )}
      </main>
      {bottomRow}
      {portals}
    </>
  );
}
