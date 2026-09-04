import { renderHtml } from '../../../utils/renderHtml.js';

export default function MatchingGrid({ question, savedState, isLocked, onSelect, onSubmit }) {
  const savedDropdowns = savedState.value || {};
  const allChoices = question.allChoices || question.pairs.map((p) => p.match);

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
              <select
                className={`match-select ${matchClass}`}
                disabled={isLocked}
                value={selectedVal}
                onChange={(e) => onSelect(pair.term, e.target.value)}
              >
                <option value="">-- select --</option>
                {allChoices.map((c, ci) => (
                  <option key={ci} value={c}>
                    {c}
                  </option>
                ))}
              </select>
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
