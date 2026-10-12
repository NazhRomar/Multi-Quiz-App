// Attempt times and durations, shared by the result screen and the
// leaderboard.

export function formatDuration(ms) {
  const totalSecs = Math.round(ms / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = totalSecs % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, '0')}s`;
  return `${s}s`;
}

export const formatDateTime = (ms) =>
  new Date(ms).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

// Leaderboard days and weeks are Manila time (supabase/leaderboard.sql), so
// its dates are shown in Manila time too, wherever the viewer is.
const MANILA = 'Asia/Manila';
export const formatBoardTime = (iso) =>
  new Date(iso).toLocaleTimeString(undefined, { timeZone: MANILA, hour: 'numeric', minute: '2-digit' });
export const formatBoardDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { timeZone: MANILA, month: 'short', day: 'numeric', year: 'numeric' });

export function formatAgo(iso, now = Date.now()) {
  const secs = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (secs < 45) return 'just now';
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatBoardDate(iso);
}
