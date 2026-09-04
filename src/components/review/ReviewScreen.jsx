import { useState } from 'react';
import { useApp } from '../../state/AppContext.jsx';
import { useNavRow } from '../quiz/useNavRow.jsx';
import ReviewHeader from './ReviewHeader.jsx';
import ReviewCard from './ReviewCard.jsx';

export default function ReviewScreen({ goHome }) {
  const { state, dispatch } = useApp();
  const { activeQuiz, currentIndex, appSettings, reviewOptions } = state;
  const [isCardExiting, setIsCardExiting] = useState(false);
  const isListView = reviewOptions.listView;
  const total = activeQuiz.questions.length;

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
    isFirst: isListView ? true : isFirst,
    isLast: isListView ? true : isLast,
    nextBlocked: false,
    isQuizMode: false,
    isListView,
    onPrev: () => animatedNav('PREV_Q'),
    onNext: () => animatedNav('NEXT_Q'),
    onDone: goHome,
  });

  const progressLabel = isListView ? `${total} Items` : `${currentIndex + 1}/${total}`;
  const progressPct = isListView ? 100 : ((currentIndex + 1) / total) * 100;

  return (
    <>
      <ReviewHeader progressLabel={progressLabel} progressPct={progressPct} goHome={goHome} />
      {topRow}
      <main id="quiz-container">
        {isListView ? (
          activeQuiz.questions.map((q, idx) => (
            <ReviewCard key={q.id} question={q} index={idx} reviewOptions={reviewOptions} isListView />
          ))
        ) : (
          <ReviewCard
            question={activeQuiz.questions[currentIndex]}
            index={currentIndex}
            reviewOptions={reviewOptions}
            isListView={false}
            exiting={isCardExiting}
          />
        )}
      </main>
      {bottomRow}
      <div className="mobile-quiz-actions">
        <button className="btn-restart" onClick={() => dispatch({ type: 'RESTART' })}>
          Restart
        </button>
        <button className="btn-exit" onClick={goHome}>
          Exit
        </button>
      </div>
      {portals}
    </>
  );
}
