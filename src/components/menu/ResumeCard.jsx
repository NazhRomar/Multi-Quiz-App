import { useApp } from '../../state/AppContext.jsx';
import { multiSubjectLabel } from '../../data/catalog.js';

// Top of the home menu: the attempt you left unfinished, whether you
// walked away via Exit or the browser/OS dropped the app mid quiz (the
// attempt is restored by createInitialState). Only shown for an attempt
// that hasn't been submitted yet — once there's a result, the attempt is
// finished and just sits in storage until the next quiz replaces it.
export default function ResumeCard() {
  const { state, dispatch } = useApp();
  const { activeQuiz, activeMode, activeTerm, activeCourse, currentIndex, userAnswers, result } = state;

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
        <button
          className={`btn-next ${isReview ? 'btn-next--review' : ''}`}
          onClick={() => dispatch({ type: 'RESUME_ATTEMPT' })}
        >
          Resume
        </button>
      </div>
    </section>
  );
}
