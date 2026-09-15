// Overload indicator: a soft red glow creeping in from the screen edges
// while a Multi selection is overloaded. Stays unobtrusive — click-through,
// faint at first; as heat rises it spreads further in and deepens, and each
// surge gives it a gentle pulse (replayed by remounting: key = surgeId).
// Always mounted so it can fade out when Multi mode is switched off.
export default function OverloadVignette({ heat, surgeId, active }) {
  const level = active ? heat : 0;
  return (
    <div
      key={surgeId}
      className={`overload-vignette ${level > 0 && surgeId > 0 ? 'overload-vignette--surge' : ''}`}
      style={{
        '--overload-heat': level,
        '--vignette-opacity': level > 0 ? (0.35 + 0.65 * level).toFixed(3) : 0,
      }}
      aria-hidden="true"
    />
  );
}
