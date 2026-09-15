import { renderHtml } from '../../../utils/renderHtml.js';
import { choiceKeyLabel } from '../useEnterShortcut.js';
import EnterKeyIcon from '../../common/EnterKeyIcon.jsx';

// showKeyHints: number keycap at the right of each unanswered choice (the
// number-key shortcut, QuizScreen). submitEnterHint: ⏎ on Submit.
export default function McTfOptions({ question, savedState, isLocked, onSelect, onSubmit, hideSubmit, showKeyHints, submitEnterHint }) {
  return (
    <>
      {question.options.map((opt, idx) => {
        const isChecked = savedState.value === idx;
        let statusClass = '';
        if (isLocked) {
          if (idx === question.correctAnswer) statusClass = 'reveal-correct';
          else if (savedState.value === idx) statusClass = 'reveal-wrong';
        }
        const keyLabel = showKeyHints && !isLocked && choiceKeyLabel(idx);
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
            {keyLabel && (
              <kbd className="option-key" aria-hidden="true">
                {keyLabel}
              </kbd>
            )}
          </label>
        );
      })}
      {!isLocked && !hideSubmit && (
        <button className="btn-check" style={{ marginTop: '1rem' }} onClick={onSubmit} disabled={savedState.value === null}>
          Submit
          {submitEnterHint && <EnterKeyIcon />}
        </button>
      )}
    </>
  );
}
