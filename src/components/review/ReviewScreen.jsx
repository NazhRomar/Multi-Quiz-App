import { useState } from 'react';
import { useApp } from '../../state/AppContext.jsx';
import { useNavRow } from '../quiz/useNavRow.jsx';
import { isAnswerCorrect } from '../../state/grading.js';
import ReviewHeader from './ReviewHeader.jsx';
import ReviewCard from './ReviewCard.jsx';

export default function ReviewScreen({ goHome }) {
  const { state, dispatch } = useApp();
  const { activeQuiz, currentIndex, appSettings, reviewOptions, userAnswers } = state;
  const [isCardExiting, setIsCardExiting] = useState(false);
  const isListView = reviewOptions.listView;
  const questions = reviewOptions.wrongOnly
    ? activeQuiz.questions.filter((q) => !q.flagged && !isAnswerCorrect(q, userAnswers[q.id]?.value ?? null))
    : activeQuiz.questions;
  const total = questions.length;

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
          questions.map((q, idx) => <ReviewCard key={q.id} question={q} index={idx} reviewOptions={reviewOptions} isListView />)
        ) : (
          <ReviewCard
            question={questions[Math.min(currentIndex, total - 1)]}
            index={Math.min(currentIndex, total - 1)}
            reviewOptions={reviewOptions}
            isListView={false}
            exiting={isCardExiting}
          />
        )}
      </main>
      {bottomRow}
      {portals}
    </>
  );
}
