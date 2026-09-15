import { useEffect, useRef, useState } from 'react';

const WARM_AT = 50; // starts turning red / shaking above this many questions
const MAX_AT = 300; // fully red, most violent shake

// Multi selection bar's "N questions": a playful nudge that a selection is
// getting big. Above WARM_AT it tints red (fully red by MAX_AT), and each
// time the count grows it shakes — a slight wiggle at first, getting more
// violent up to MAX_AT. `heat` (0–1) drives both via CSS custom properties;
// the shake replays by remounting the span (new key) on each increase.
export default function HeatedQuestionCount({ count }) {
  const [shakeId, setShakeId] = useState(0);
  // Starts at 0 so a selection that jumps straight past WARM_AT (e.g. one
  // Select all) shakes on its first appearance too.
  const prevCount = useRef(0);
  useEffect(() => {
    if (count > prevCount.current && count > WARM_AT) setShakeId((n) => n + 1);
    prevCount.current = count;
  }, [count]);

  const heat = count > WARM_AT ? Math.min((count - WARM_AT) / (MAX_AT - WARM_AT), 1) : 0;
  const style =
    heat > 0
      ? {
          // "Slightly" red right past WARM_AT, then all the way.
          '--heat-red': `${Math.round(25 + 75 * heat)}%`,
          '--shake-x': `${(1 + 5 * heat).toFixed(2)}px`,
          '--shake-tilt': `${(3 * heat * heat).toFixed(2)}deg`,
          '--shake-duration': `${(0.35 + 0.25 * heat).toFixed(2)}s`,
        }
      : undefined;

  return (
    <span
      key={shakeId}
      className={`multi-q-count ${heat > 0 ? 'multi-q-count--hot' : ''} ${heat > 0 && shakeId > 0 ? 'multi-q-count--shake' : ''}`}
      style={style}
    >
      {count} questions
    </span>
  );
}
