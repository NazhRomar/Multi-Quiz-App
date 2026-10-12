import { useApp } from '../../state/AppContext.jsx';
import { isAnswerCorrect } from '../../state/grading.js';
import { BOARD_MSQ_SCORING } from '../../utils/leaderboard.js';
import ScoreRing from './ScoreRing.jsx';
import HeaderTitle from '../common/HeaderTitle.jsx';
import ModuleBreakdown from './ModuleBreakdown.jsx';
import QuestionMap from './QuestionMap.jsx';
import LeaderboardPanel from './LeaderboardPanel.jsx';
import { AUTH_AVAILABLE } from '../../utils/auth.js';
import { formatDuration, formatDateTime } from '../../utils/formatAttempt.js';

const round2 = (n) => Math.round(n * 100) / 100;

// Same bands as the module breakdown's bars: green ≥ 80%, amber ≥ 50%, red below.
const toneOf = (pct) => (pct >= 80 ? 'good' : pct >= 50 ? 'mid' : 'low');

function verdictOf(pct) {
  if (pct === 100) return 'Perfect score';
  if (pct >= 90) return 'Excellent';
  if (pct >= 80) return 'Great work';
  if (pct >= 65) return 'Solid';
  if (pct >= 50) return 'Getting there';
  return 'Keep practicing';
}

const MSQ_SCORING_LABELS = {
  right: 'Right only',
  rightMinusWrong: 'Right minus wrong',
  allOrNothing: 'All or nothing',
};

const Icon = ({ d }) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);
const CALENDAR = 'M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z';
const CLOCK = 'M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z';
const STAR = 'M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3l-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z';

// Personal best for this quiz, from earlier attempts (attemptHistory —
// this attempt is already in it, logged by SUBMIT_QUIZ).
function PersonalBest({ quizId, completedAt, pct }) {
  const { state } = useApp();
  const history = state.attemptHistory[quizId] ?? [];
  const earlier = history.filter((h) => h.at !== completedAt);
  if (earlier.length === 0) {
    return (
      <li className="result-meta-chip">
        <Icon d={STAR} />
        First attempt
      </li>
    );
  }
  const best = Math.max(...earlier.map((h) => h.pct));
  const delta = pct - earlier[earlier.length - 1].pct;
  const deltaText = delta === 0 ? 'same as last time' : `${delta > 0 ? '+' : '−'}${Math.abs(delta)} vs last time`;
  return (
    <li className={`result-meta-chip${pct > best ? ' result-meta-chip--best' : ''}`}>
      <Icon d={STAR} />
      {pct > best ? 'New personal best' : `Best ${best}%`}
      <span className="result-meta-delta">· {deltaText}</span>
    </li>
  );
}

// A small celebratory burst for 90% and up. Pure CSS; hidden under
// reduced motion and with animations turned off.
function Confetti() {
  return (
    <div className="result-confetti" aria-hidden="true">
      {Array.from({ length: 28 }, (_, i) => (
        <span
          key={i}
          style={{ '--i': i, '--x': ((i * 37) % 100) - 50, '--y': `${((i * 5) % 7) * 30 - 100}px`, '--r': `${(i * 53) % 360}deg` }}
        />
      ))}
    </div>
  );
}

export default function ResultScreen({ goHome }) {
  const { state, dispatch } = useApp();
  const { activeQuiz, activeQuizId, activeCourse, result, appSettings } = state;
  const { score, totalPossible, correctCount, wrongCount, unansweredCount, flaggedCount, completedAt, durationMs } = result;
  const percentage = Math.round((score / totalPossible) * 100);
  const tone = toneOf(percentage);
  const scored = correctCount + wrongCount + unansweredCount;
  const isMulti = !!activeQuiz.multi;
  // The leaderboard's score for this attempt, when your own Multiple Select
  // scoring gave a different one (single quizzes only — Multi isn't ranked).
  const showBoardScore =
    !isMulti && activeQuizId && AUTH_AVAILABLE && result.board && Math.abs(result.board.score - score) > 0.001;

  // What Review's "Wrong answers only" filter would leave (wrong, partly
  // right and unanswered), so the button's count matches what it opens.
  const mistakes = activeQuiz.questions.filter(
    (q) => !q.flagged && !isAnswerCorrect(q, state.userAnswers[q.id]?.value ?? null)
  ).length;

  const openReview = (wrongOnly, startIndex = 0) => {
    dispatch({ type: 'SET_REVIEW_OPTION', payload: { key: 'wrongOnly', value: wrongOnly } });
    dispatch({ type: 'SWITCH_TO_REVIEW', payload: { startIndex } });
    window.scrollTo(0, 0);
  };

  return (
    <>
      <header className="quiz-header quiz-header--quiz">
        <HeaderTitle mode="quiz" />
        <div className="header-right">
          <button className="btn-restart" onClick={() => dispatch({ type: 'RESTART' })}>
            Restart Quiz
          </button>
          <button className="btn-exit" onClick={goHome}>
            ← Home
          </button>
        </div>
      </header>
      <main className={`question-card result-card result-tone--${tone}`}>
        <div className="result-hero">
          {percentage >= 90 && !appSettings.disableAnimations && <Confetti />}
          <ScoreRing percentage={percentage} animate={!appSettings.disableAnimations} />
          <div className="result-summary">
            <span className="result-verdict">{verdictOf(percentage)}</span>
            <h2 className="result-title">
              <small>{isMulti ? `${activeQuiz.multi.quizzes.length} quizzes combined` : activeCourse}</small>
              {activeQuiz.quizTitle}
            </h2>
            <p className="result-points">
              <strong>{round2(score)}</strong> / {totalPossible} points
            </p>
            {showBoardScore && (
              <p
                className="result-alt-score"
                title={`Your Multiple Select scoring is “${MSQ_SCORING_LABELS[result.msqScoring] ?? result.msqScoring}” (Quiz options); leaderboards score everyone “${MSQ_SCORING_LABELS[BOARD_MSQ_SCORING]}”.`}
              >
                Leaderboard score (“{MSQ_SCORING_LABELS[BOARD_MSQ_SCORING]}”): <strong>{Math.round((result.board.score / totalPossible) * 100)}%</strong>
              </p>
            )}
            <ul className="result-meta">
              {completedAt && (
                <li className="result-meta-chip">
                  <Icon d={CALENDAR} />
                  {formatDateTime(completedAt)}
                </li>
              )}
              {durationMs >= 1000 && (
                <li className="result-meta-chip" title="Time on the quiz screen, with the tab open">
                  <Icon d={CLOCK} />
                  {formatDuration(durationMs)}
                </li>
              )}
              {activeQuizId && <PersonalBest quizId={activeQuizId} completedAt={completedAt} pct={percentage} />}
            </ul>
          </div>
        </div>

        <div className="result-split" role="img" aria-label={`${correctCount} correct, ${wrongCount} incorrect, ${unansweredCount} unanswered`}>
          {[
            ['correct', correctCount],
            ['wrong', wrongCount],
            ['unanswered', unansweredCount],
          ].map(([kind, n]) =>
            n > 0 ? <span key={kind} className={`result-split-seg result-split-seg--${kind}`} style={{ flexGrow: n / scored }} /> : null
          )}
        </div>
        <div className="result-breakdown">
          <div className="result-stat result-stat--correct">
            <strong>{correctCount}</strong>
            <span>Correct</span>
          </div>
          <div className="result-stat result-stat--wrong">
            <strong>{wrongCount}</strong>
            <span>Incorrect</span>
          </div>
          <div className="result-stat result-stat--unanswered">
            <strong>{unansweredCount}</strong>
            <span>Unanswered</span>
          </div>
          {flaggedCount > 0 && (
            <div className="result-stat result-stat--flagged">
              <strong>{flaggedCount}</strong>
              <span>Not Scored</span>
            </div>
          )}
        </div>

        <QuestionMap onOpen={(i) => openReview(false, i)} />
        {isMulti && <ModuleBreakdown />}
        {!isMulti && activeQuizId && AUTH_AVAILABLE && <LeaderboardPanel />}

        <div className="result-actions">
          {mistakes > 0 ? (
            <>
              <button className="btn-next" onClick={() => openReview(true)}>
                Review Mistakes ({mistakes})
              </button>
              <button className="btn-prev" onClick={() => openReview(false)}>
                Review All
              </button>
            </>
          ) : (
            <button className="btn-next" onClick={() => openReview(false)}>
              Review Answers
            </button>
          )}
          <button className="btn-prev" onClick={goHome}>
            Main Menu
          </button>
        </div>
      </main>
    </>
  );
}
