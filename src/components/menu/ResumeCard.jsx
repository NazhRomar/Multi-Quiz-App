import { useNavigate } from 'react-router-dom';
import { useApp } from '../../state/AppContext.jsx';
import { findQuizById, multiSubjectLabel, quizUrlFor } from '../../data/catalog.js';

// Top of the home menu: the attempt you left unfinished, whether you
// walked away via Exit or the browser/OS dropped the app mid quiz (the
// attempt is restored by createInitialState). Only shown for an attempt
// that hasn't been submitted yet — once there's a result, the attempt is
// finished and just sits in storage until the next quiz replaces it.
export default function ResumeCard() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const { activeQuiz, activeMode, activeTerm, activeCourse, activeQuizId, currentIndex, userAnswers, result } = state;

  // Nothing worth resuming: opened and backed straight out again without
  // touching anything. Any saved answer counts, submitted or not — a
  // half-typed blank is still progress you'd want back.
  const hasProgress = currentIndex > 0 || Object.keys(userAnswers).length > 0;
  if (!activeQuiz || result || !hasProgress) return null;

  const isReview = activeMode === 'review';
  const total = activeQuiz.questions.length;
  const answered = activeQuiz.questions.filter((q) => userAnswers[q.id]?.submitted).length;
  const { label, tooltip } = activeQuiz.multi
    ? multiSubjectLabel(activeQuiz.multi)
    : { label: `${activeCourse} / ${activeQuiz.quizTitle}`, tooltip: `${activeTerm} — ${activeCourse}` };

  // Navigates to the session's URL — QuizSessionRoute/MultiSessionRoute
  // pick up from there (it's already the active session, so they just flip
  // the screen rather than restarting it). Falls back to the direct
  // dispatch only for an attempt saved before activeQuizId existed, or one
  // whose quiz was since renamed/deleted.
  const resume = () => {
    if (activeQuiz.multi) {
      navigate(isReview ? '/multi/review' : '/multi/quiz');
      return;
    }
    const found = findQuizById(activeQuizId);
    if (found) {
      navigate(quizUrlFor(found.term, found.course, found.quiz, isReview ? 'review' : 'quiz'));
      return;
    }
    dispatch({ type: 'RESUME_ATTEMPT' });
  };

  return (
    <section className="resume-card">
      <div className="resume-card-text">
        <div className="resume-card-title">
          <span className={`mode-pill mode-pill--${isReview ? 'review' : activeQuiz.multi ? 'multi' : 'quiz'}`}>
            {isReview ? 'Review' : activeQuiz.multi ? 'Multi' : 'Quiz'}
          </span>
          <span className="resume-card-name" title={tooltip}>
            {label}
          </span>
        </div>
        <div className="resume-card-meta">
          {/* Review has nothing to answer, so position is all there is to report. */}
          {isReview
            ? `Left off at ${Math.min(currentIndex + 1, total)} of ${total}`
            : `${answered} of ${total} answered · left off at ${Math.min(currentIndex + 1, total)}`}
        </div>
      </div>
      <div className="resume-card-actions">
        <button className="btn-prev resume-discard" onClick={() => dispatch({ type: 'DISCARD_ATTEMPT' })}>
          Discard
        </button>
        <button className={`btn-next ${isReview ? 'btn-next--review' : ''}`} onClick={resume}>
          Resume
        </button>
      </div>
    </section>
  );
}
