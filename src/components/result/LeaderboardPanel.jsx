import { useEffect, useState } from 'react';
import { useApp } from '../../state/AppContext.jsx';
import { useAuth, signIn } from '../../utils/auth.js';
import { postAttempt, fetchLeaderboard, fetchRecentAttempts, MIN_MS_PER_QUESTION, LIVE_REFRESH_MS, LEADERBOARD_ENABLED } from '../../utils/leaderboard.js';
import { formatDuration, formatBoardTime, formatBoardDate, formatAgo } from '../../utils/formatAttempt.js';
import Avatar from '../common/Avatar.jsx';

const TABS = [
  { value: 'live', label: 'Live' },
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'This week' },
  { value: 'all', label: 'All time' },
];

// Attempts being posted right now, by completedAt — so a remount (or React's
// dev double effects) can't send the same attempt twice.
const posting = new Set();

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z" />
    <path d="M7 6H4.5a2.5 2.5 0 0 0 2.6 3.9M17 6h2.5a2.5 2.5 0 0 1-2.6 3.9" />
  </svg>
);

// The result screen's leaderboard for this quiz (single quizzes only).
// Signed in, the attempt is posted automatically — Multiple Select scored "Right
// only" (BOARD_MSQ_SCORING), whatever the quiz options say — and the tabs show
// Live (every attempt, newest first), then each person's best Today / This
// week / All time, in Manila time. While LEADERBOARD_ENABLED is off, just a
// note saying so.
export default function LeaderboardPanel() {
  if (!LEADERBOARD_ENABLED) {
    return (
      <section className="leaderboard leaderboard--signed-out">
        <TrophyIcon />
        <span className="leaderboard-signin-text">
          <strong>Leaderboards are off for now</strong>
          <span>Scores aren't being posted, and results are hidden.</span>
        </span>
      </section>
    );
  }
  return <Board />;
}

function Board() {
  const { state, dispatch } = useApp();
  const { result, activeQuiz, activeQuizId } = state;
  const auth = useAuth();
  const signedIn = auth.status === 'signedIn';
  const [tab, setTab] = useState('day');
  const [postError, setPostError] = useState(null);
  const [retry, setRetry] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const [board, setBoard] = useState({ tab: null, rows: null, error: null });

  const questionCount = result.correctCount + result.wrongCount + result.unansweredCount;
  // Results from before the leaderboard existed have no `board` score.
  const postable = !!(result.board && result.completedAt);
  const tooQuick = postable && !(result.durationMs >= questionCount * MIN_MS_PER_QUESTION);

  useEffect(() => {
    if (!signedIn || !postable || tooQuick || result.posted || posting.has(result.completedAt)) return;
    const key = result.completedAt;
    posting.add(key);
    setPostError(null);
    postAttempt({
      quizId: activeQuizId,
      quizTitle: activeQuiz.quizTitle,
      score: result.board.score,
      total: result.totalPossible,
      correct: result.board.correct,
      questionCount,
      durationMs: result.durationMs,
    })
      .then(() => {
        dispatch({ type: 'MARK_RESULT_POSTED', payload: key });
        setRefresh((n) => n + 1);
      })
      .catch((e) => setPostError(e.message))
      .finally(() => posting.delete(key));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signedIn, result.completedAt, result.posted, retry]);

  // The current tab's rows; Live keeps refreshing while it's on screen.
  useEffect(() => {
    if (!signedIn) return undefined;
    let cancelled = false;
    const load = () =>
      (tab === 'live' ? fetchRecentAttempts(activeQuizId) : fetchLeaderboard(activeQuizId, tab))
        .then((rows) => !cancelled && setBoard({ tab, rows, error: null }))
        .catch((e) => !cancelled && setBoard({ tab, rows: null, error: e.message }));
    load();
    const timer =
      tab === 'live'
        ? setInterval(() => {
            if (!document.hidden) load();
          }, LIVE_REFRESH_MS)
        : null;
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [signedIn, tab, refresh, activeQuizId]);

  if (!signedIn) {
    return (
      <section className="leaderboard leaderboard--signed-out">
        <TrophyIcon />
        <span className="leaderboard-signin-text">
          <strong>Leaderboards</strong>
          <span>Sign in with your UST Google account to post this score and see who's on top.</span>
        </span>
        <button type="button" className="btn-google" onClick={signIn} disabled={auth.status === 'loading'}>
          {auth.status === 'loading' ? 'Signing in…' : 'Sign in'}
        </button>
      </section>
    );
  }

  const postStatus = !postable
    ? 'Only attempts finished from now on are posted.'
    : tooQuick
      ? 'Too quick to rank — under half a second a question.'
      : result.posted
        ? null
        : postError
          ? `Couldn't post this attempt: ${postError}`
          : 'Posting your attempt…';

  const rows = board.tab === tab ? board.rows : null;
  const error = board.tab === tab ? board.error : null;
  const myRank = tab !== 'live' && rows?.find((r) => r.is_me);

  return (
    <section className="leaderboard">
      <div className="leaderboard-head">
        <h4 className="result-section-title">
          <TrophyIcon />
          Leaderboard
        </h4>
        {myRank && (
          <span className="leaderboard-myrank">
            You're #{myRank.rank} of {myRank.players}
          </span>
        )}
      </div>
      {postStatus && (
        <p className={`leaderboard-post${postError ? ' leaderboard-post--error' : ''}`}>
          {postStatus}
          {postError && (
            <button type="button" className="leaderboard-retry" onClick={() => setRetry((n) => n + 1)}>
              Retry
            </button>
          )}
        </p>
      )}
      <div className="leaderboard-tabs" role="tablist" aria-label="Leaderboard period">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={tab === t.value}
            className={`leaderboard-tab${tab === t.value ? ' leaderboard-tab--active' : ''}`}
            onClick={() => setTab(t.value)}
          >
            {t.value === 'live' && <span className="leaderboard-live-dot" aria-hidden="true" />}
            {t.label}
          </button>
        ))}
      </div>
      {error ? (
        <p className="leaderboard-empty">Couldn't load the leaderboard: {error}</p>
      ) : !rows ? (
        <p className="leaderboard-empty">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="leaderboard-empty">{tab === 'live' ? 'No attempts yet.' : 'No one yet — this could be you.'}</p>
      ) : (
        <ol className="leaderboard-list">
          {rows.map((row, i) => {
            // Your own row, when it's below the top 10, comes after a gap.
            const gap = tab !== 'live' && i > 0 && row.rank > rows[i - 1].rank + 1;
            return (
              <li
                key={tab === 'live' ? `${row.completed_at}-${i}` : `${row.rank}-${row.display_name}-${i}`}
                className={`leaderboard-row${row.is_me ? ' leaderboard-row--me' : ''}${gap ? ' leaderboard-row--gap' : ''}`}
              >
                {tab !== 'live' && (
                  <span className={`leaderboard-rank${row.rank <= 3 ? ` leaderboard-rank--${row.rank}` : ''}`}>{row.rank}</span>
                )}
                <Avatar name={row.display_name} url={row.avatar_url} />
                <span className="leaderboard-name">
                  {row.display_name}
                  {row.is_me && <small>You</small>}
                </span>
                <span className="leaderboard-pct">{Math.round(row.pct)}%</span>
                <span className="leaderboard-time" title="Time taken">
                  {formatDuration(row.duration_ms)}
                </span>
                <span className="leaderboard-when" title={`${formatBoardDate(row.completed_at)}, ${formatBoardTime(row.completed_at)} (Manila)`}>
                  {tab === 'live' ? formatAgo(row.completed_at) : tab === 'day' ? formatBoardTime(row.completed_at) : formatBoardDate(row.completed_at)}
                </span>
              </li>
            );
          })}
        </ol>
      )}
      <p className="leaderboard-foot">
        {tab === 'live'
          ? 'Every attempt, newest first · refreshes every 15 seconds'
          : 'Best attempt per person · Manila time · Multiple Select scored Right only'}
      </p>
    </section>
  );
}
