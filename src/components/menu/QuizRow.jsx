import QuizBadges from './QuizBadges.jsx';
import { totalPointsOf } from '../../utils/quizTotals.js';
import { useIsNewQuiz } from '../../utils/newQuizzes.js';

// selected: undefined outside Multi Quiz selection mode, else true/false.
export default function QuizRow({ quiz, label, onOpen, selected }) {
  const totalPoints = totalPointsOf(quiz.data.questions);
  const selectable = selected !== undefined;
  const isNew = useIsNewQuiz(quiz);
  return (
    <button
      className={`btn-quiz ${selected ? 'quiz-selected' : ''}`}
      onClick={onOpen}
      aria-pressed={selectable ? selected : undefined}
    >
      {isNew && <span className="quiz-new-corner" role="img" aria-label="Newly added" title="Newly added" />}
      <span className="quiz-btn-title">
        {label}
        <QuizBadges badges={quiz.badges} />
      </span>
      <span className="quiz-btn-right">
        <span className="quiz-btn-meta" title={`${totalPoints} points`}>
          {totalPoints}
        </span>
      </span>
    </button>
  );
}
