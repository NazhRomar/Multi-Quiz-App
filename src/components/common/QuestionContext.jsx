import { renderHtml } from '../../utils/renderHtml.js';

// question.context: an HTML string, or an array of them for multi-part
// snippets (each rendered as its own box). Boxes holding a <pre> get
// q-context--code so the Code Block Theme setting applies to them but not
// to plain prose notes like "Reference: Chapter 8".
export default function QuestionContext({ context }) {
  if (!context) return null;
  const blocks = Array.isArray(context) ? context : [context];
  return blocks.map((block, i) => (
    <div className={`q-context ${block.includes('<pre') ? 'q-context--code' : ''}`} key={i}>
      <div className="q-context-body" {...renderHtml(block)} />
    </div>
  ));
}
