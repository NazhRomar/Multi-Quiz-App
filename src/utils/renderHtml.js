// The original app always interpolated question text/context/explanation/
// option strings directly into innerHTML templates, so authored quiz
// content can (and, per quiz-prompt.md, is expected to) contain inline HTML
// like <code>/<pre>/<strong>. React's {value} interpolation escapes by
// default, which would silently break that existing content — so every
// place that ported a raw ${...} interpolation uses this helper instead
// of plain JSX text interpolation, to preserve behavior exactly.
export function renderHtml(html) {
  return { dangerouslySetInnerHTML: { __html: html ?? '' } };
}

// For plain-text content (e.g. question.code answers) that has to pass
// through an HTML-rendered string.
export function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
