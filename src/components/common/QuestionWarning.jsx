import { renderHtml } from '../../utils/renderHtml.js';

// question.warning: a heads-up about a question that is still scored as
// normal — e.g. the source showed it garbled, or its answer key disagrees
// with the one used here. Same amber banner as a flagged question, which
// is the heavier option for questions with no correct choice at all.
export default function QuestionWarning({ question, style }) {
  if (!question.warning) return null;
  return (
    <div className="feedback-banner warning" style={style}>
      <strong>⚠ Warning</strong>
      <br />
      <span {...renderHtml(question.warning)} />
    </div>
  );
}
