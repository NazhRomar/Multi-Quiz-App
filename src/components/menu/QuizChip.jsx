import QuizBadges from './QuizBadges.jsx';

// selected: undefined outside Multi Quiz selection mode, else true/false.
export default function QuizChip({ quiz, label, onOpen, selected }) {
  const totalItems = quiz.data.questions ? quiz.data.questions.length : 0;
  const selectable = selected !== undefined;
  return (
    <button
      className={`quiz-chip ${selectable ? 'quiz-selectable' : ''} ${selected ? 'quiz-selected' : ''}`}
      onClick={onOpen}
      aria-pressed={selectable ? selected : undefined}
    >
      {/* Always mounted (collapsed to zero width outside selection mode) so it can grow in. */}
      <span className="quiz-select-check" aria-hidden="true" />
      <span className="quiz-chip-label">
        {label}
        <QuizBadges data={quiz.data} />
      </span>
      <span className="quiz-chip-count">{totalItems}</span>
    </button>
  );
}
