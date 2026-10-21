import { getSupabase } from './auth.js';

// Calls into the leaderboard functions in supabase/leaderboard.sql. Each one
// throws on failure, with the server's message where there is one.

// Off for now: no attempts are posted, and no one's results are shown (the
// result screen's board, Home's live activity, the "Show me" switch).
export const LEADERBOARD_ENABLED = false;

// Everyone on a board is scored the same way, whatever their own Quiz
// options say: Multiple Select as "Right only" (a share per correct pick,
// wrong picks cost nothing — see pointsEarned in state/grading.js).
export const BOARD_MSQ_SCORING = 'right';

// Mirrors submit_attempt's floor, so a too-quick attempt isn't even sent.
export const MIN_MS_PER_QUESTION = 500;

const rpc = async (fn, args) => {
  const client = await getSupabase();
  const { data, error } = await client.rpc(fn, args);
  if (error) throw new Error(error.message);
  return data;
};

export const postAttempt = (a) =>
  rpc('submit_attempt', {
    p_quiz_id: a.quizId,
    p_quiz_title: a.quizTitle,
    p_score: a.score,
    p_total: a.total,
    p_correct: a.correct,
    p_question_count: a.questionCount,
    p_duration_ms: Math.round(a.durationMs),
  });

// period: 'day' | 'week' | 'all'
export const fetchLeaderboard = (quizId, period) => rpc('leaderboard', { p_quiz_id: quizId, p_period: period, p_limit: 10 });

export const fetchRecentAttempts = (quizId) => rpc('recent_attempts', { p_quiz_id: quizId, p_limit: 20 });

// Every quiz at once, for Home's live activity.
export const fetchRecentActivity = () => rpc('recent_activity', { p_limit: 30 });

// How often a live list re-fetches while it's on screen (and the tab visible).
export const LIVE_REFRESH_MS = 15000;

export async function fetchShowOnBoard(userId) {
  const client = await getSupabase();
  const { data, error } = await client.from('profiles').select('show_on_board').eq('id', userId).maybeSingle();
  if (error) throw new Error(error.message);
  return data?.show_on_board ?? true;
}

export async function setShowOnBoard(userId, value) {
  const client = await getSupabase();
  const { error } = await client.from('profiles').update({ show_on_board: value }).eq('id', userId);
  if (error) throw new Error(error.message);
}
