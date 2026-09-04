import { renderHtml } from '../../../utils/renderHtml.js';

export default function McTfOptions({ question, savedState, isLocked, onSelect, onSubmit, hideSubmit }) {
  return (
    <>
      {question.options.map((opt, idx) => {
        const isChecked = savedState.value === idx;
        let statusClass = '';
        if (isLocked) {
          if (idx === question.correctAnswer) statusClass = 'reveal-correct';
          else if (savedState.value === idx) statusClass = 'reveal-wrong';
        }
        return (
          <label key={idx} className={`option-label ${statusClass} ${isLocked ? 'locked' : ''}`}>
            <input
              type="radio"
              name={`q${question.id}`}
              checked={isChecked}
              disabled={isLocked}
              onChange={() => onSelect(idx)}
            />
            <span {...renderHtml(opt)} />
          </label>
        );
      })}
      {!isLocked && !hideSubmit && (
        <button className="btn-check" style={{ marginTop: '1rem' }} onClick={onSubmit} disabled={savedState.value === null}>
          Submit
        </button>
      )}
    </>
  );
}
