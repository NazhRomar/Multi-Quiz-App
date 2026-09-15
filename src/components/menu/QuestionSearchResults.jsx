// Wraps each case-insensitive occurrence of `query` in <mark>.
function highlight(text, query) {
  if (!query) return text;
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const parts = [];
  let from = 0;
  let at = lower.indexOf(q);
  while (at !== -1) {
    if (at > from) parts.push(text.slice(from, at));
    parts.push(<mark key={at}>{text.slice(at, at + q.length)}</mark>);
    from = at + q.length;
    at = lower.indexOf(q, from);
  }
  if (from < text.length) parts.push(text.slice(from));
  return parts;
}

// Home menu search: questions whose text/code/correct answer match (see
// searchQuestions in catalog.js). Each result shows where it's from, the
// question and its answer; tapping it opens that quiz in Review mode at
// that question.
export default function QuestionSearchResults({ query, results, total, onOpen }) {
  return (
    <section className="term-section question-search">
      <h2 className="term-header question-search-header">
        <span className="term-title-text">Matching questions</span>
        <span className="term-count">{total === results.length ? total : `${results.length} of ${total}`}</span>
      </h2>
      {results.length === 0 ? (
        <div className="question-search-empty">No questions or answers match.</div>
      ) : (
        <ul className="question-search-list">
          {results.map((r) => (
            <li key={r.key}>
              <button className="question-search-result" onClick={() => onOpen(r)}>
                <span className="question-search-source">
                  {r.course} · {r.quiz.title} · Q{r.qIndex + 1}
                </span>
                <span className="question-search-text">{highlight(r.text, query)}</span>
                {r.answer && (
                  <span className="question-search-answer">
                    <span className="question-search-answer-label">Answer</span> {highlight(r.answer, query)}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
