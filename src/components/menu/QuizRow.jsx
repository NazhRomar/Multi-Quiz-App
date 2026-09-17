import QuizBadges from './QuizBadges.jsx';

// selected: undefined outside Multi Quiz selection mode, else true/false.
export default function QuizRow({ quiz, label, onOpen, selected }) {
  const totalItems = quiz.data.questions ? quiz.data.questions.length : 0;
  const selectable = selected !== undefined;
  return (
    <button
      className={`btn-quiz ${selectable ? 'quiz-selectable' : ''} ${selected ? 'quiz-selected' : ''}`}
      onClick={onOpen}
      aria-pressed={selectable ? selected : undefined}
    >
      <span className="quiz-btn-title">
        {/* Always mounted (collapsed to zero width outside selection mode) so it can grow in. */}
        <span className="quiz-select-check" aria-hidden="true" />
        {label}
        <QuizBadges data={quiz.data} />
      </span>
      <span className="quiz-btn-right">
        <span className="quiz-btn-meta">{totalItems}</span>
      </span>
    </button>
  );
}
