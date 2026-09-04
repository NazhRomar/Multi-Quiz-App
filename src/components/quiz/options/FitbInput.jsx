export default function FitbInput({ question, savedState, isLocked, onChange, onSubmit }) {
  const savedText = savedState.value || '';
  let fitbClass = '';
  if (isLocked) {
    fitbClass = savedText.trim().toLowerCase() === question.correctAnswer.toLowerCase() ? 'fitb-correct' : 'fitb-wrong';
  }
  return (
    <div className="fitb-row">
      <input
        type="text"
        className={`fitb-input ${fitbClass}`}
        value={savedText}
        disabled={isLocked}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your answer..."
      />
      {!isLocked && (
        <button className="btn-check" onClick={onSubmit}>
          Submit
        </button>
      )}
    </div>
  );
}
