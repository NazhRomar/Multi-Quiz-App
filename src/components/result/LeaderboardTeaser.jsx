// Placeholder for the planned leaderboards (Google sign-in, daily / weekly /
// all-time per quiz). Deliberately quiet: no button, nothing to tap.
export default function LeaderboardTeaser() {
  return (
    <aside className="leaderboard-teaser" aria-label="Leaderboards, coming soon">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z" />
        <path d="M7 6H4.5a2.5 2.5 0 0 0 2.6 3.9M17 6h2.5a2.5 2.5 0 0 1-2.6 3.9" />
      </svg>
      <span className="leaderboard-teaser-text">
        <strong>Leaderboards</strong>
        <span>Daily, weekly and all-time rankings</span>
      </span>
      <span className="leaderboard-teaser-pill">Soon</span>
    </aside>
  );
}
