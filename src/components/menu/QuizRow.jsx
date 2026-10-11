import QuizBadges from './QuizBadges.jsx';
import { useIsNewQuiz } from '../../utils/newQuizzes.js';

// selected: undefined outside Multi Quiz selection mode, else true/false.
export default function QuizRow({ quiz, label, onOpen, selected }) {
  const totalItems = quiz.data.questions ? quiz.data.questions.length : 0;
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
        <span className="quiz-btn-meta" title={`${totalItems} questions`}>
          {totalItems}
        </span>
      </span>
    </button>
  );
}
