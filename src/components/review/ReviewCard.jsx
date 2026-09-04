import { renderHtml } from '../../utils/renderHtml.js';

const TYPE_LABELS = {
  mc: 'Multiple Choice',
  tf: 'True / False',
  msq: 'Multiple Select',
  fitb: 'Fill in the Blank',
  matching: 'Dropdown Matching',
  'drag-drop': 'Drag & Drop',
};

// Ports generateReviewCardHTML() — display-only, no user answer state at
// all; it either shows every option with the correct one(s) highlighted,
// or (default) just a single "Correct Answer" block.
export default function ReviewCard({ question, index, reviewOptions, isListView, exiting }) {
  return (
    <div
      className={`question-card question-card--review ${isListView ? 'question-card--list' : ''} ${
        exiting ? 'question-card--exiting' : ''
      }`}
    >
      <div className="q-meta">
        <div className="q-meta-left">
          <span className="q-num-badge">{index + 1}</span>
          <span className={`q-type-badge ${question.type}`}>{TYPE_LABELS[question.type] || 'Question'}</span>
        </div>
        <span className={`q-points ${question.flagged ? 'q-points--flagged' : ''}`}>
          {question.flagged ? 'Not Scored' : `${question.points || 1} pts`}
        </span>
      </div>
      {question.context && (
        <div className="q-context">
          <div className="q-context-body" {...renderHtml(question.context)} />
        </div>
      )}
      <div className="q-text" {...renderHtml(question.text)} />
      <div className="options-list">
        <ReviewBody question={question} reviewOptions={reviewOptions} />
      </div>
      {question.explanation && !reviewOptions.hideExplanation && (
        <div className="q-explanation">
          <span className="q-explanation-label">Explanation</span>
          <div className="q-explanation-text" {...renderHtml(question.explanation)} />
        </div>
      )}
    </div>
  );
}

function ReviewBody({ question, reviewOptions }) {
  if (question.flagged) {
    return (
      <>
        {question.options?.map((opt, i) => (
          <div className="option-label locked" key={i}>
            <span {...renderHtml(opt)} />
          </div>
        ))}
        <div className="feedback-banner warning" style={{ marginTop: '1rem' }}>
          <strong>⚠ Flagged Question — Not Scored</strong>
          <br />
          The source material flags this question as broken (no listed choice matches the correct output).
        </div>
      </>
    );
  }

  if (question.type === 'mc' || question.type === 'tf') {
    if (reviewOptions.showAllChoices) {
      return question.options.map((opt, idx) => {
        const isCorrect = idx === question.correctAnswer;
        return (
          <div className={`option-label locked ${isCorrect ? 'reveal-correct' : ''}`} key={idx}>
            {!isCorrect && <span style={{ width: 18, height: 18, flexShrink: 0, marginRight: '0.5rem' }} />}
            <span {...renderHtml(opt)} />
          </div>
        );
      });
    }
    return (
      <div className="review-answer-block">
        <span className="review-answer-label">Correct Answer</span>
        <div className="review-answer-value" {...renderHtml(question.options[question.correctAnswer])} />
      </div>
    );
  }

  if (question.type === 'fitb') {
    return (
      <div className="review-answer-block">
        <span className="review-answer-label">Correct Answer</span>
        <div className="review-answer-value" {...renderHtml(question.correctAnswer)} />
      </div>
    );
  }

  if (question.type === 'msq') {
    if (reviewOptions.showAllChoices) {
      return question.options.map((opt, idx) => {
        const isCorrect = question.correctAnswer.includes(idx);
        return (
          <div className={`option-label locked ${isCorrect ? 'reveal-correct' : ''}`} key={idx}>
            {!isCorrect && <span style={{ width: 18, height: 18, flexShrink: 0, marginRight: '0.5rem' }} />}
            <span {...renderHtml(opt)} />
          </div>
        );
      });
    }
    return (
      <div className="review-answer-block">
        <span className="review-answer-label">Correct Answers</span>
        <div className="review-answer-value" {...renderHtml(question.correctAnswer.map((i) => question.options[i]).join(', '))} />
      </div>
    );
  }

  if (question.type === 'matching' || question.type === 'drag-drop') {
    return (
      <div className="matching-grid review-matching">
        {question.pairs.map((pair, i) => (
          <div className="match-row" key={i}>
            <div className="match-term" {...renderHtml(pair.term)} />
            <div className="match-answer match-correct" {...renderHtml(pair.match)} />
          </div>
        ))}
      </div>
    );
  }

  return null;
}
