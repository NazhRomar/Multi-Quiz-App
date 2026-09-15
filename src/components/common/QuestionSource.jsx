import { useApp } from '../../state/AppContext.jsx';

// Multi sessions only: which quiz a question came from (question.source,
// set by buildMultiQuiz). Rendered in several places; CSS shows exactly one
// per question depending on screen width:
// - "aside": in the empty page margin beside the card (wide screens), so
//   it adds no vertical height.
// - "nav": phones, one-at-a-time view — outside the card, attached to the
//   Prev/Next row (above the floating bottom bar, or above the top row).
//   Rendered by the screen into useNavRow, not by the card.
// - "inline": a full-width strip under the card's meta row, for mid-width
//   screens and for review list view (where there's no per-card nav row).
// The subject is only spelled out when the session spans more than one.
export default function QuestionSource({ question, variant }) {
  const { state } = useApp();
  const { activeQuiz, multiOptions } = state;
  const source = question?.source;
  if (!source || !activeQuiz?.multi || !multiOptions.showSource) return null;

  const multiSubject = activeQuiz.multi.subjects.length > 1;
  const tooltip = `${source.term} — ${source.course} — ${source.title}`;

  if (variant === 'aside') {
    return (
      <aside className="q-source-aside" title={tooltip}>
        <div className="q-source-aside-inner">
          <span className="q-source-label">From</span>
          {multiSubject && <span className="q-source-course">{source.course}</span>}
          <span className="q-source-title">{source.title}</span>
        </div>
      </aside>
    );
  }

  return (
    <div className={variant === 'nav' ? 'nav-source' : 'q-source-inline'} title={tooltip}>
      <span className="q-source-label">From</span>
      <span className="q-source-inline-text">
        {multiSubject && <span className="q-source-course">{source.course} · </span>}
        <strong className="q-source-title">{source.title}</strong>
      </span>
    </div>
  );
}
