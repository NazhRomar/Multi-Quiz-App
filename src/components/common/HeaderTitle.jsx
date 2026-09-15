import { useApp } from '../../state/AppContext.jsx';
import { multiSubjectLabel } from '../../data/catalog.js';

// Left side of the quiz/review/result headers: mode pill + where you are.
// A Multi session (activeQuiz.multi) shows just the subject name(s) instead
// of the full term / course / quiz breadcrumbs, since it spans several
// quizzes, and a "Multi" pill in place of "Quiz" — reviewing shows the
// plain "Review" pill, same as a single quiz's review.
export default function HeaderTitle({ mode }) {
  const { state } = useApp();
  const { activeTerm, activeCourse, activeQuiz } = state;
  const modeLabel = mode === 'review' ? 'Review' : 'Quiz';

  if (activeQuiz.multi) {
    const { label, tooltip } = multiSubjectLabel(activeQuiz.multi);
    return (
      <div className="header-left">
        {mode === 'review' ? (
          <span className="mode-pill mode-pill--review">Review</span>
        ) : (
          <span className="mode-pill mode-pill--multi">Multi</span>
        )}
        <span className="breadcrumbs" title={tooltip}>
          {label}
        </span>
      </div>
    );
  }

  return (
    <div className="header-left">
      <span className={`mode-pill mode-pill--${mode}`}>{modeLabel}</span>
      <span className="breadcrumbs">
        {activeTerm} <span>/</span> {activeCourse} <span>/</span> {activeQuiz.quizTitle}
      </span>
    </div>
  );
}
