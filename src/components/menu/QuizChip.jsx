const UNVERIFIED_TITLE = 'I (the AI) filled these answers in — no manual verification has been made yet.';

export default function QuizChip({ quiz, label, onOpen }) {
  const totalItems = quiz.data.questions ? quiz.data.questions.length : 0;
  return (
    <button className="quiz-chip" onClick={onOpen}>
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
