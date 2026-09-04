export default function ScoreRing({ percentage }) {
  const circumference = 2 * Math.PI * 54;
  const dashOffset = circumference * (1 - percentage / 100);
  const ringColor = percentage >= 80 ? 'var(--correct)' : percentage >= 50 ? 'var(--accent)' : '#d94f4f';

  return (
    <div className="result-ring-wrap">
      <svg className="result-ring" viewBox="0 0 120 120">
        <circle className="result-ring-track" cx="60" cy="60" r="54"></circle>
        <circle
          className="result-ring-fill"
          cx="60"
          cy="60"
          r="54"
          style={{ stroke: ringColor, strokeDasharray: circumference, strokeDashoffset: dashOffset }}
        ></circle>
      </svg>
      <div className="result-ring-label">{percentage}%</div>
    </div>
  );
}
