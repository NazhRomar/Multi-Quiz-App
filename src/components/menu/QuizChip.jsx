import QuizBadges from './QuizBadges.jsx';
import { useIsNewQuiz } from '../../utils/newQuizzes.js';

// selected: undefined outside Multi Quiz selection mode, else true/false.
export default function QuizChip({ quiz, label, onOpen, selected }) {
  const totalItems = quiz.data.questions ? quiz.data.questions.length : 0;
  const selectable = selected !== undefined;
  const isNew = useIsNewQuiz(quiz);
  return (
    <button
      className={`quiz-chip ${selected ? 'quiz-selected' : ''}`}
      onClick={onOpen}
      aria-pressed={selectable ? selected : undefined}
    >
      {isNew && <span className="quiz-new-corner" role="img" aria-label="Newly added" title="Newly added" />}
      <span className="quiz-chip-label">
        {label}
        <QuizBadges badges={quiz.badges} />
      </span>
      <span className="quiz-chip-count" title={`${totalItems} questions`}>
        {totalItems}
      </span>
    </button>
  );
}
