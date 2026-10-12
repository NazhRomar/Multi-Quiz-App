import { useEffect, useState } from 'react';
import { useAuth, signIn } from '../../utils/auth.js';
import { fetchRecentActivity, LIVE_REFRESH_MS } from '../../utils/leaderboard.js';
import { formatAgo, formatBoardDate, formatBoardTime, formatDuration } from '../../utils/formatAttempt.js';
import { findQuizById } from '../../data/catalog.js';
import Avatar from './Avatar.jsx';

// Opened from Home's "N reviewing now": the latest attempts on every quiz,
// newest first, refreshing while it's open. UST accounts only, like the
// leaderboards (supabase/leaderboard.sql → recent_activity).
export default function LiveActivityModal({ count, onClose }) {
  const auth = useAuth();
  const signedIn = auth.status === 'signedIn';
  const [state, setState] = useState({ rows: null, error: null });
  const [, setTick] = useState(0); // re-renders the "2m ago"s between fetches

  useEffect(() => {
    if (!signedIn) return undefined;
    let cancelled = false;
    const load = () =>
      fetchRecentActivity()
        .then((rows) => !cancelled && setState({ rows, error: null }))
        .catch((e) => !cancelled && setState((s) => ({ rows: s.rows, error: e.message })));
    load();
    const timer = setInterval(() => {
      if (document.hidden) return;
      load();
      setTick((n) => n + 1);
    }, LIVE_REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [signedIn]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const { rows, error } = state;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card changelog-card activity-card" role="dialog" aria-modal="true" aria-label="Live activity">
        <div className="modal-header">
          <h3>
            <span className="leaderboard-live-dot" aria-hidden="true" />
            Live activity
          </h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <p className="changelog-note">
          {count != null && `${count} reviewing now · `}
          The latest attempts on every quiz, newest first · refreshes every 15 seconds
        </p>
        <div className="changelog-scroll">
          {!signedIn ? (
            <div className="activity-signin">
              <p>Sign in with your UST Google account to see what everyone's taking right now.</p>
              <button type="button" className="btn-google" onClick={signIn} disabled={auth.status === 'loading'}>
                {auth.status === 'loading' ? 'Signing in…' : 'Sign in'}
              </button>
            </div>
          ) : error && !rows ? (
            <p className="changelog-state">Couldn't load the activity: {error}</p>
          ) : !rows ? (
            <p className="changelog-state">Loading…</p>
          ) : rows.length === 0 ? (
            <p className="changelog-state">No attempts yet.</p>
          ) : (
            <ol className="activity-list">
              {rows.map((row, i) => {
                // The subject comes from this build's catalog; a quiz that's
                // since been renamed or removed just shows its posted title.
                const found = findQuizById(row.quiz_id);
                return (
                  <li key={`${row.completed_at}-${i}`} className={`activity-row${row.is_me ? ' activity-row--me' : ''}`}>
                    <Avatar name={row.display_name} url={row.avatar_url} size={32} />
                    <span className="activity-who">
                      <strong>
                        <span>{row.display_name}</span>
                        {row.is_me && <small>You</small>}
                      </strong>
                      <span>
                        {found ? `${found.course.displayName} · ` : ''}
                        {row.quiz_title}
                      </span>
                    </span>
                    {/* Phones swap the time taken under the % for "when",
                        and drop the separate when column, to leave the
                        name some room. */}
                    <span className="activity-score">
                      <strong>{Math.round(row.pct)}%</strong>
                      <span className="activity-duration">{formatDuration(row.duration_ms)}</span>
                      <span className="activity-when-compact">{formatAgo(row.completed_at)}</span>
                    </span>
                    <span
                      className="activity-when"
                      title={`${formatBoardDate(row.completed_at)}, ${formatBoardTime(row.completed_at)} (Manila)`}
                    >
                      {formatAgo(row.completed_at)}
                    </span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
