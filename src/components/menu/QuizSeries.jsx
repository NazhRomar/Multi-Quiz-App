import QuizChip from './QuizChip.jsx';

export default function QuizSeries({ unit, onOpen, isSelected }) {
  return (
    <div className="quiz-series">
      {/* A series' _meta.json can turn its own name (showLabel) and/or the
          item count (showCount, only meaningful alongside a shown label)
          off — see catalog.js/buildRenderUnits. */}
      {unit.showLabel && (
        <div className="quiz-series-header">
          <span>{unit.name}</span>
          {/* Optional series tag (_meta.json "tag"): each character is its own
              span so the CSS can stagger a wave across the letters. */}
          {unit.tag && (
            <span className="series-tag" aria-label={`(${unit.tag})`}>
              {[...`(${unit.tag})`].map((ch, i) => (
                <span key={i} className="series-tag-char" style={{ '--i': i }} aria-hidden="true">
                  {ch === ' ' ? ' ' : ch}
                </span>
              ))}
            </span>
          )}
          {unit.showCount && <span className="quiz-series-count">{unit.items.length}</span>}
        </div>
      )}
      <div className="quiz-series-chips">
        {unit.items.map(({ quiz, label }) => (
          <QuizChip key={label} quiz={quiz} label={label} onOpen={() => onOpen(quiz)} selected={isSelected(quiz)} />
        ))}
      </div>
    </div>
  );
}
