const UNVERIFIED_TITLE = 'I (the AI) filled these answers in — no manual verification has been made yet.';

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
        {selectable && <span className="quiz-select-check" aria-hidden="true" />}
        {label}
        {quiz.data.unverified && (
          <span className="quiz-warning" title={UNVERIFIED_TITLE}>
            ⚠️
          </span>
        )}
      </span>
      <span className="quiz-btn-right">
        <span className="quiz-btn-meta">{totalItems}</span>
      </span>
    </button>
  );
}
