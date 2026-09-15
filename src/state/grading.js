// Shared correctness/scoring logic. Previously this was written three
// slightly different ways (live question feedback, the score badge, and
// the final submit screen) — one shared implementation used by all three.

import { escapeHtml } from '../utils/renderHtml.js';

// fitb correctAnswer is a single string, or — for a code snippet with
// several ___ blanks — an array with one string per blank, in order. The
// saved user answer mirrors that shape. These normalize both to arrays.
export function fitbExpected(question) {
  return [].concat(question.correctAnswer);
}

export function fitbGiven(question, userAnswer) {
  const given = [].concat(userAnswer ?? '');
  return fitbExpected(question).map((_, i) => given[i] ?? '');
}

export function fitbBlankCorrect(given, expected) {
  return !!given && given.trim().toLowerCase() === expected.toLowerCase();
}

export function isAnswerCorrect(question, userAnswer) {
  if (question.type === 'mc' || question.type === 'tf') {
    return userAnswer === question.correctAnswer;
  }
  if (question.type === 'fitb') {
    const given = fitbGiven(question, userAnswer);
    return fitbExpected(question).every((exp, i) => fitbBlankCorrect(given[i], exp));
  }
  if (question.type === 'msq') {
    const sel = (userAnswer || []).slice().sort();
    const correct = question.correctAnswer.slice().sort();
    return sel.length === correct.length && sel.every((v, i) => v === correct[i]);
  }
  if (question.type === 'matching' || question.type === 'drag-drop') {
    if (!userAnswer) return false;
    return question.pairs.every((pair) => userAnswer[pair.term] === pair.match);
  }
  return false;
}

// Partial credit for matching/drag-drop: points earned per correctly
// matched pair, proportional to the question's total points.
export function pointsEarned(question, userAnswer) {
  const pts = question.points || 1;
  if (question.type === 'matching' || question.type === 'drag-drop') {
    if (!userAnswer) return 0;
    const perPair = pts / question.pairs.length;
    return question.pairs.reduce(
      (sum, pair) => sum + (userAnswer[pair.term] === pair.match ? perPair : 0),
      0
    );
  }
  // Multi-blank code fill-in: same per-blank partial credit.
  if (question.type === 'fitb' && Array.isArray(question.correctAnswer)) {
    const expected = fitbExpected(question);
    const given = fitbGiven(question, userAnswer);
    const perBlank = pts / expected.length;
    return expected.reduce((sum, exp, i) => sum + (fitbBlankCorrect(given[i], exp) ? perBlank : 0), 0);
  }
  return isAnswerCorrect(question, userAnswer) ? pts : 0;
}

export function wasAnswered(userAnswer) {
  return (
    userAnswer !== null &&
    userAnswer !== undefined &&
    !(Array.isArray(userAnswer) && userAnswer.length === 0) &&
    // multi-blank fitb with every blank still empty
    !(Array.isArray(userAnswer) && userAnswer.every((v) => typeof v === 'string' && !v.trim())) &&
    !(typeof userAnswer === 'object' && !Array.isArray(userAnswer) && Object.keys(userAnswer).length === 0)
  );
}

export function expectedAnswerText(question) {
  if (question.type === 'mc' || question.type === 'tf') {
    return question.options[question.correctAnswer];
  }
  if (question.type === 'fitb') {
    // question.code answers are plain text (not HTML), and this is rendered as HTML
    if (!question.code) return question.correctAnswer;
    return fitbExpected(question)
      .map((a) => `<code>${escapeHtml(a)}</code>`)
      .join(', ');
  }
  if (question.type === 'msq') {
    return question.correctAnswer.map((i) => question.options[i]).join(', ');
  }
  return 'Review the highlighted answers.';
}

// Score from only the questions the user has actually submitted (used by
// the live "Score: N" badge during a quiz, before it's fully finished).
export function liveScore(questions, userAnswers) {
  let score = 0;
  questions.forEach((q) => {
    if (q.flagged) return;
    const data = userAnswers[q.id];
    if (data?.submitted) score += pointsEarned(q, data.value);
  });
  return Math.round(score);
}

// Full breakdown used by the final result screen.
export function scoreQuiz(questions, userAnswers) {
  let score = 0;
  let totalPossible = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let unansweredCount = 0;
  let flaggedCount = 0;

  questions.forEach((q) => {
    if (q.flagged) {
      flaggedCount++;
      return;
    }
    const pts = q.points || 1;
    totalPossible += pts;
    const userAnswer = userAnswers[q.id]?.value ?? null;
    const earned = pointsEarned(q, userAnswer);
    score += earned;

    if (!wasAnswered(userAnswer)) unansweredCount++;
    else if (earned >= pts - 0.001) correctCount++;
    else wrongCount++;
  });

  return { score, totalPossible, correctCount, wrongCount, unansweredCount, flaggedCount };
}
