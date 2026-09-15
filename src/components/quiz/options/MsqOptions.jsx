import { renderHtml } from '../../../utils/renderHtml.js';

export default function MsqOptions({ question, savedState, isLocked, onToggle, onSubmit }) {
  const savedSet = savedState.value || [];
  // After an actual attempt, a correct option the user didn't pick is
  // "missed" (styled apart from the ones they got). With nothing picked
  // (Show Answer) it's a plain reveal of the key instead.
  const attempted = savedSet.length > 0;
  return (
    <>
      {question.options.map((opt, idx) => {
        const isChecked = savedSet.includes(idx);
        let statusClass = '';
        if (isLocked) {
          if (question.correctAnswer.includes(idx)) statusClass = isChecked || !attempted ? 'reveal-correct' : 'reveal-missed';
          else if (isChecked) statusClass = 'reveal-wrong';
        }
        return (
          <label key={idx} className={`option-label ${statusClass} ${isLocked ? 'locked' : ''}`}>
            <input
              type="checkbox"
              name={`q${question.id}`}
              checked={isChecked}
              disabled={isLocked}
              onChange={(e) => onToggle(idx, e.target.checked)}
            />
            <span {...renderHtml(opt)} />
            {statusClass === 'reveal-missed' && <span className="reveal-tag">Missed</span>}
          </label>
        );
      })}
      {!isLocked && (
        // Nothing picked yet: the same button doubles as "give up and reveal".
        <button className="btn-check" style={{ marginTop: '1rem' }} onClick={onSubmit}>
          {savedSet.length === 0 ? 'Show Answer' : 'Submit'}
        </button>
      )}
    </>
  );
}
