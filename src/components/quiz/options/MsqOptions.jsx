import { renderHtml } from '../../../utils/renderHtml.js';

export default function MsqOptions({ question, savedState, isLocked, onToggle, onSubmit }) {
  const savedSet = savedState.value || [];
  return (
    <>
      {question.options.map((opt, idx) => {
        const isChecked = savedSet.includes(idx);
        let statusClass = '';
        if (isLocked) {
          if (question.correctAnswer.includes(idx)) statusClass = 'reveal-correct';
          else if (savedSet.includes(idx)) statusClass = 'reveal-wrong';
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
          </label>
        );
      })}
      {!isLocked && (
        <button className="btn-check" style={{ marginTop: '1rem' }} onClick={onSubmit}>
          Submit
        </button>
      )}
    </>
  );
}
