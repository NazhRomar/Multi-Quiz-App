import { useApp } from '../../state/AppContext.jsx';

// Multi sessions only: which quiz a question came from (question.source,
// set by buildMultiQuiz). Rendered twice per card — variant "aside" sits in
// the empty page margin beside the card on wide screens (so it adds no
// vertical height), variant "inline" is a full-width strip under the meta
// row on narrower screens (it used to live inside the meta row, where it
// got truncated to nothing on phones); CSS shows exactly one of them. The
// subject is only spelled out when the session spans more than one.
export default function QuestionSource({ question, variant }) {
  const { state } = useApp();
  const { activeQuiz, multiOptions } = state;
  const source = question.source;
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
    <div className="q-source-inline" title={tooltip}>
      <span className="q-source-label">From</span>
      <span className="q-source-inline-text">
        {multiSubject && <span className="q-source-course">{source.course} · </span>}
        <strong className="q-source-title">{source.title}</strong>
      </span>
    </div>
  );
}
