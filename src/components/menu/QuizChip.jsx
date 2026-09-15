const UNVERIFIED_TITLE = 'I (the AI) filled these answers in — no manual verification has been made yet.';

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
        {quiz.data.unverified && (
          <span className="quiz-warning" title={UNVERIFIED_TITLE}>
            ⚠️
          </span>
        )}
      </span>
      <span className="quiz-chip-count">{totalItems}</span>
    </button>
  );
}
