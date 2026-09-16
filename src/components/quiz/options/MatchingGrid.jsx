import { renderHtml } from '../../../utils/renderHtml.js';

export default function MatchingGrid({ question, savedState, isLocked, onSelect, onSubmit }) {
  const savedDropdowns = savedState.value || {};
  // choicePool: the same choices in a random order (applyShuffle, store.js).
  const allChoices = question.choicePool || question.allChoices || question.pairs.map((p) => p.match);

  return (
    <>
      <div className="matching-grid">
        {question.pairs.map((pair, i) => {
          const selectedVal = savedDropdowns[pair.term] || '';
          let matchClass = '';
          if (isLocked) matchClass = selectedVal === pair.match ? 'match-correct' : 'match-wrong';
          return (
            <div className="match-row" key={i}>
              <div className="match-term" {...renderHtml(pair.term)} />
              <div className="match-answers">
                <select
                  className={`match-select ${matchClass}`}
                  disabled={isLocked}
                  value={selectedVal}
                  onChange={(e) => onSelect(pair.term, e.target.value)}
                  // Hover tooltip with the full selected answer (long ones are
                  // cut off with an ellipsis).
                  title={selectedVal || undefined}
                >
                  <option value="">-- select --</option>
                  {allChoices.map((c, ci) => (
                    <option key={ci} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {/* Answered and this row is wrong (or blank): show what it
                    should have been, the way the review cards do. */}
                {isLocked && selectedVal !== pair.match && (
                  <div className="match-answer match-correct match-reveal" {...renderHtml(pair.match)} />
                )}
              </div>
            </div>
          );
        })}
      </div>
      {!isLocked && (
        <button className="btn-check" style={{ marginTop: '1rem' }} onClick={onSubmit}>
          Submit
        </button>
      )}
    </>
  );
}
