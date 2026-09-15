import { Fragment } from 'react';
import { renderHtml } from '../../utils/renderHtml.js';
import { splitCodeBlanks } from '../../utils/codeBlank.js';
import { fitbExpected, fitbGiven, fitbBlankCorrect, pointsEarned, wasAnswered } from '../../state/grading.js';
import QuestionContext from '../common/QuestionContext.jsx';
import QuestionSource from '../common/QuestionSource.jsx';

const TYPE_LABELS = {
  mc: 'Multiple Choice',
  tf: 'True / False',
  msq: 'Multiple Select',
  fitb: 'Fill in the Blank',
  matching: 'Dropdown Matching',
  'drag-drop': 'Drag & Drop',
};

const STATUS_LABELS = {
  correct: '✓ Correct',
  partial: '◐ Partial',
  wrong: '✗ Wrong',
  unanswered: '— Unanswered',
};

// How the user did on a question in the attempt being reviewed.
function answerStatus(question, userAnswer) {
  if (!wasAnswered(userAnswer)) return 'unanswered';
  const pts = question.points || 1;
  const earned = pointsEarned(question, userAnswer);
  if (earned >= pts - 0.001) return 'correct';
  return earned > 0 ? 'partial' : 'wrong';
}

// Ports generateReviewCardHTML(): shows every option with the correct one(s)
// highlighted, or (default) just a "Correct Answer" block. When reviewing
// right after a quiz attempt (hasAttempt), it also grades that attempt: a
// status badge per question, and on a wrong answer the user's own answer
// shown in red next to the correct one. A review opened fresh from the home
// menu has no attempt and stays answer-key only.
export default function ReviewCard({ question, index, reviewOptions, isListView, exiting, userAnswer, hasAttempt }) {
  const status = hasAttempt && !question.flagged ? answerStatus(question, userAnswer) : null;
  return (
    <div
      className={`question-card question-card--review ${isListView ? 'question-card--list' : ''} ${
        exiting ? 'question-card--exiting' : ''
      }`}
    >
      <QuestionSource question={question} variant="aside" />
      <div className="q-meta">
        <div className="q-meta-left">
          {status && <span className={`review-status review-status--${status}`}>{STATUS_LABELS[status]}</span>}
          <span className="q-num-badge">{index + 1}</span>
          <span className={`q-type-badge ${question.type}`}>{TYPE_LABELS[question.type] || 'Question'}</span>
        </div>
        <span className={`q-points ${question.flagged ? 'q-points--flagged' : ''}`}>
          {question.flagged ? 'Not Scored' : `${question.points || 1} pts`}
        </span>
      </div>
      <QuestionSource question={question} variant="inline" />
      <QuestionContext context={question.context} />
      <div className="q-text" {...renderHtml(question.text)} />
      <div className="options-list">
        <ReviewBody
          question={question}
          reviewOptions={reviewOptions}
          // Only show the user's own answer when it was actually wrong.
          userAnswer={status === 'wrong' || status === 'partial' ? userAnswer : undefined}
        />
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

// "Your Answer" block for a wrong answer, above the Correct Answer block.
function YourAnswer({ label = 'Your Answer', children, html }) {
  return (
    <div className="review-answer-block review-answer-block--yours">
      <span className="review-answer-label">{label}</span>
      {html !== undefined ? <div className="review-answer-value" {...renderHtml(html)} /> : <div className="review-answer-value">{children}</div>}
    </div>
  );
}

// userAnswer: the user's (wrong) answer to show alongside the key, or
// undefined when there's nothing to contrast.
function ReviewBody({ question, reviewOptions, userAnswer }) {
  const showYours = userAnswer !== undefined;

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
        const isYourWrongPick = showYours && idx === userAnswer;
        return (
          <div className={`option-label locked ${isCorrect ? 'reveal-correct' : isYourWrongPick ? 'reveal-wrong' : ''}`} key={idx}>
            {!isCorrect && !isYourWrongPick && <span style={{ width: 18, height: 18, flexShrink: 0, marginRight: '0.5rem' }} />}
            <span {...renderHtml(opt)} />
          </div>
        );
      });
    }
    return (
      <>
        {showYours && <YourAnswer html={question.options[userAnswer]} />}
        <div className="review-answer-block">
          <span className="review-answer-label">Correct Answer</span>
          <div className="review-answer-value" {...renderHtml(question.options[question.correctAnswer])} />
        </div>
      </>
    );
  }

  if (question.type === 'fitb') {
    if (question.code) {
      const segments = splitCodeBlanks(question.code);
      const expected = fitbExpected(question);
      const given = showYours ? fitbGiven(question, userAnswer) : [];
      return (
        <div className="q-context q-context--code code-fitb">
          <div className="q-context-body">
            <pre>
              {segments.map((segment, i) => (
                <Fragment key={i}>
                  {segment}
                  {i < segments.length - 1 && (
                    <>
                      {/* A wrong blank shows the user's entry struck through first. */}
                      {showYours && !fitbBlankCorrect(given[i], expected[i]) && (
                        <del className="code-fitb-yours">{given[i]?.trim() || '(blank)'}</del>
                      )}
                      <span className="code-fitb-answer">{expected[i] ?? ''}</span>
                    </>
                  )}
                </Fragment>
              ))}
            </pre>
          </div>
        </div>
      );
    }
    return (
      <>
        {showYours && <YourAnswer>{String(userAnswer)}</YourAnswer>}
        <div className="review-answer-block">
          <span className="review-answer-label">Correct Answer</span>
          <div className="review-answer-value" {...renderHtml(question.correctAnswer)} />
        </div>
      </>
    );
  }

  if (question.type === 'msq') {
    const picked = showYours ? userAnswer || [] : [];
    if (reviewOptions.showAllChoices) {
      return question.options.map((opt, idx) => {
        const isCorrect = question.correctAnswer.includes(idx);
        const isYourWrongPick = picked.includes(idx) && !isCorrect;
        return (
          <div className={`option-label locked ${isCorrect ? 'reveal-correct' : isYourWrongPick ? 'reveal-wrong' : ''}`} key={idx}>
            {!isCorrect && !isYourWrongPick && <span style={{ width: 18, height: 18, flexShrink: 0, marginRight: '0.5rem' }} />}
            <span {...renderHtml(opt)} />
          </div>
        );
      });
    }
    return (
      <>
        {showYours && <YourAnswer label="Your Answers" html={picked.map((i) => question.options[i]).join(', ')} />}
        <div className="review-answer-block">
          <span className="review-answer-label">Correct Answers</span>
          <div className="review-answer-value" {...renderHtml(question.correctAnswer.map((i) => question.options[i]).join(', '))} />
        </div>
      </>
    );
  }

  if (question.type === 'matching' || question.type === 'drag-drop') {
    const yours = showYours ? userAnswer || {} : {};
    return (
      <div className="matching-grid review-matching">
        {question.pairs.map((pair, i) => {
          const wrongPick = showYours && yours[pair.term] !== pair.match;
          return (
            <div className="match-row" key={i}>
              <div className="match-term" {...renderHtml(pair.term)} />
              <div className="review-match-answers">
                {wrongPick &&
                  (yours[pair.term] ? (
                    <div className="match-answer match-wrong review-match-yours" {...renderHtml(yours[pair.term])} />
                  ) : (
                    <div className="match-answer match-wrong review-match-yours">(no answer)</div>
                  ))}
                <div className="match-answer match-correct" {...renderHtml(pair.match)} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
}
