import { renderHtml } from '../../../utils/renderHtml.js';
import { choiceKeyLabel } from '../useEnterShortcut.js';
import { EnterKeyIcon } from '../../common/KeyIcons.jsx';

// showKeyHints: number keycap at the right of each unanswered choice (the
// number-key shortcut toggles it, QuizScreen). submitEnterHint: ⏎ on Submit.
export default function MsqOptions({ question, savedState, isLocked, onToggle, onSubmit, showKeyHints, submitEnterHint }) {
  const savedSet = savedState.value || [];
  // Once submitted, a correct option the user didn't pick is "missed"
  // (styled apart from the ones they got) — every correct option, after
  // Show Answer with nothing picked, since none of them scored.
  return (
    <>
      {question.options.map((opt, idx) => {
        const isChecked = savedSet.includes(idx);
        let statusClass = '';
        if (isLocked) {
          if (question.correctAnswer.includes(idx)) statusClass = isChecked ? 'reveal-correct' : 'reveal-missed';
          else if (isChecked) statusClass = 'reveal-wrong';
        }
        const keyLabel = showKeyHints && !isLocked && choiceKeyLabel(idx);
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
            {keyLabel && (
              <kbd className="option-key" aria-hidden="true">
                {keyLabel}
              </kbd>
            )}
          </label>
        );
      })}
      {!isLocked && (
        // Nothing picked yet: the same button doubles as "give up and reveal".
        <button className="btn-check" style={{ marginTop: '1rem' }} onClick={onSubmit}>
          {savedSet.length === 0 ? 'Show Answer' : 'Submit'}
          {submitEnterHint && <EnterKeyIcon />}
        </button>
      )}
    </>
  );
}
