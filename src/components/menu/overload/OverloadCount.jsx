// Overload indicator: the Multi selection bar's "N questions". Tints red
// with heat (slightly red just past the start, fully red at max) and shakes
// on each surge — a slight wiggle at first, more violent as heat rises.
// The shake replays by remounting the span (key = surgeId).
export default function OverloadCount({ count, heat, surgeId }) {
  const style =
    heat > 0
      ? {
          '--overload-red': `${Math.round(25 + 75 * heat)}%`,
          '--shake-x': `${(1 + 5 * heat).toFixed(2)}px`,
          '--shake-tilt': `${(3 * heat * heat).toFixed(2)}deg`,
          '--shake-duration': `${(0.35 + 0.25 * heat).toFixed(2)}s`,
        }
      : undefined;

  return (
    <span
      key={surgeId}
      className={`overload-count ${heat > 0 ? 'overload-count--hot' : ''} ${heat > 0 && surgeId > 0 ? 'overload-count--shake' : ''}`}
      style={style}
    >
      {count} questions
    </span>
  );
}
