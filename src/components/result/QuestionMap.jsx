import { useApp } from '../../state/AppContext.jsx';
import { pointsEarned, wasAnswered } from '../../state/grading.js';

const LABELS = {
  correct: 'Correct',
  partial: 'Partly correct',
  wrong: 'Incorrect',
  blank: 'Unanswered',
  flagged: 'Not scored',
};

function statusOf(question, userAnswer, quizOptions) {
  if (question.flagged) return 'flagged';
  if (!wasAnswered(userAnswer)) return 'blank';
  const pts = question.points || 1;
  const earned = pointsEarned(question, userAnswer, quizOptions);
  if (earned >= pts - 0.001) return 'correct';
  return earned > 0 ? 'partial' : 'wrong';
}

// One dot per question, in the order they were asked; tapping one opens the
// review at that question.
export default function QuestionMap({ onOpen }) {
  const { state } = useApp();
  const { activeQuiz, userAnswers, quizOptions } = state;

  return (
    <section className="question-map">
      <h4 className="result-section-title">Question by question</h4>
      <ol className="question-map-dots">
        {activeQuiz.questions.map((q, i) => {
          const status = statusOf(q, userAnswers[q.id]?.value ?? null, quizOptions);
          const label = `Question ${i + 1}: ${LABELS[status]}`;
          return (
            <li key={q.id}>
              <button
                type="button"
                className={`question-map-dot question-map-dot--${status}`}
                title={label}
                aria-label={`${label}. Open in review`}
                onClick={() => onOpen(i)}
              >
                {i + 1}
              </button>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
