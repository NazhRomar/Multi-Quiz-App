import QuizBadges from './QuizBadges.jsx';
import { totalPointsOf } from '../../utils/quizTotals.js';
import { useIsNewQuiz } from '../../utils/newQuizzes.js';

// selected: undefined outside Multi Quiz selection mode, else true/false.
export default function QuizChip({ quiz, label, onOpen, selected }) {
  const totalPoints = totalPointsOf(quiz.data.questions);
  const selectable = selected !== undefined;
  const isNew = useIsNewQuiz(quiz);
  return (
    <button
      className={`quiz-chip ${selectable ? 'quiz-selectable' : ''} ${selected ? 'quiz-selected' : ''}`}
      onClick={onOpen}
      aria-pressed={selectable ? selected : undefined}
    >
      {isNew && <span className="quiz-new-corner" role="img" aria-label="Newly added" title="Newly added" />}
      {/* Always mounted (collapsed to zero width outside selection mode) so it can grow in. */}
      <span className="quiz-select-check" aria-hidden="true" />
      <span className="quiz-chip-label">
        {label}
        <QuizBadges badges={quiz.badges} />
      </span>
      <span className="quiz-chip-count" title={`${totalPoints} points`}>
        {totalPoints}
      </span>
    </button>
  );
}
