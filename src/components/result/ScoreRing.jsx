import { useEffect, useState } from 'react';

const RADIUS = 54;
const COUNT_UP_MS = 900;

// The percentage counts up from 0 as the ring fills, unless animations are
// off (App settings, or the system's reduced-motion preference).
export default function ScoreRing({ percentage, animate = true }) {
  const [shown, setShown] = useState(animate ? 0 : percentage);

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!animate || reduced) {
      setShown(percentage);
      return undefined;
    }
    let frame;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / COUNT_UP_MS, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(percentage * eased));
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [percentage, animate]);

  const circumference = 2 * Math.PI * RADIUS;
  const dashOffset = circumference * (1 - shown / 100);

  return (
    <div className="result-ring-wrap" role="img" aria-label={`${percentage}%`}>
      <svg className="result-ring" viewBox="0 0 120 120" aria-hidden="true">
        <circle className="result-ring-track" cx="60" cy="60" r={RADIUS}></circle>
        <circle
          className="result-ring-fill"
          cx="60"
          cy="60"
          r={RADIUS}
          style={{ strokeDasharray: circumference, strokeDashoffset: dashOffset }}
        ></circle>
      </svg>
      <div className="result-ring-label" aria-hidden="true">
        {shown}
        <small>%</small>
      </div>
    </div>
  );
}
