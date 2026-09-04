const UNVERIFIED_TITLE = 'I (the AI) filled these answers in — no manual verification has been made yet.';

export default function QuizRow({ quiz, label, onOpen }) {
  const totalItems = quiz.data.questions ? quiz.data.questions.length : 0;
  return (
    <button className="btn-quiz" onClick={onOpen}>
      <span className="quiz-btn-title">
        {label}
        {quiz.data.unverified && (
          <span className="quiz-warning" title={UNVERIFIED_TITLE}>
            ⚠️
          </span>
        )}
      </span>
      <span className="quiz-btn-right">
        <span className="quiz-btn-meta">{totalItems}</span>
        <span className="quiz-btn-icon">→</span>
      </span>
    </button>
  );
}
