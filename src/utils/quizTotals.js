// What a quiz is scored out of, for the denominator in the quiz header. A question's points default to 1, and
// flagged questions are out of scoring entirely (see quiz-prompt.md), so they are
// out of the total too. This has to keep agreeing with scoreQuiz() in
// state/grading.js — otherwise the header shows a total the score can never
// reach.
export function totalPointsOf(questions) {
  if (!questions) return 0;
  return questions.reduce((sum, q) => (q.flagged ? sum : sum + (q.points || 1)), 0);
}
