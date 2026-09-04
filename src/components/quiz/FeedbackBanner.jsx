import { isAnswerCorrect, expectedAnswerText } from '../../state/grading.js';
import { renderHtml } from '../../utils/renderHtml.js';

export default function FeedbackBanner({ question, savedState, quizOptions }) {
  if (question.flagged) {
    return (
      <div className="feedback-banner warning">
        <strong>⚠ Flagged Question — Not Scored</strong>
        <br />
        The source material flags this question as broken (no listed choice matches the correct output). It isn't counted toward
        your score.
      </div>
    );
  }

  const isPerfect = isAnswerCorrect(question, savedState.value);
  const expectedText = expectedAnswerText(question);

  let showExplanation = question.explanation && !quizOptions.hideExplanation;
  let showFeedback = !quizOptions.hideFeedback;
  if (quizOptions.hideFeedbackIfExplanation && showExplanation) showFeedback = false;

  return (
    <>
      {showFeedback && (
        <div className={`feedback-banner ${isPerfect ? 'correct' : 'wrong'}`}>
          <strong>{isPerfect ? '✓ Correct!' : '✗ Incorrect.'}</strong>
          {!isPerfect && expectedText && (
            <>
              <br />
              Expected: <span {...renderHtml(expectedText)} />
            </>
          )}
        </div>
      )}
      {showExplanation && (
        <div className="q-explanation">
          <span className="q-explanation-label">Explanation</span>
          <div className="q-explanation-text" {...renderHtml(question.explanation)} />
        </div>
      )}
    </>
  );
}
