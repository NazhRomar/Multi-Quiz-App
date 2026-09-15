// Rough time a set of questions takes, for the Multi selection bar's
// estimate. Each question costs reading time (prose and code read at
// different speeds) plus a per-type answering cost that scales with how
// much answering it needs: options to weigh, correct picks to find, blanks
// to type, pairs to match. Review mode only reads: question, answer and
// explanation. The numbers are ballpark, tuned to feel right, not measured.

const PROSE_WPS = 4; // words per second, careful quiz reading (~240 wpm)
const CODE_WPS = 2; // code reads slower
const EXPLANATION_WPS = 6; // skimmed after answering
const NEXT_OVERHEAD = 2; // glance at the result, press Next

const words = (html) => {
  if (!html) return 0;
  const text = String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ');
  return text.split(/\s+/).filter(Boolean).length;
};
const wordsOf = (list) => (list || []).reduce((sum, item) => sum + words(item), 0);
const blankCount = (q) => (Array.isArray(q.correctAnswer) ? q.correctAnswer.length : 1);

// Seconds to read the prompt: text, plus any context/code block.
function readSeconds(q) {
  const contextIsCode = /<pre|<code/i.test(q.context || '');
  return (
    words(q.text) / PROSE_WPS +
    words(q.context) / (contextIsCode ? CODE_WPS : PROSE_WPS) +
    words(q.code) / CODE_WPS
  );
}

// Seconds to answer, on top of reading the prompt.
function answerSeconds(q) {
  const optionCount = q.options?.length || 0;
  switch (q.type) {
    case 'tf':
      return 3;
    case 'mc':
      return 3 + wordsOf(q.options) / PROSE_WPS + optionCount;
    case 'msq': {
      // Every option is its own yes/no call, and each pick is a click.
      const picks = Array.isArray(q.correctAnswer) ? q.correctAnswer.length : 1;
      return 4 + wordsOf(q.options) / PROSE_WPS + 2 * optionCount + picks + 1;
    }
    case 'fitb':
      // Recall + type each blank.
      return 2 + 8 * blankCount(q);
    case 'matching': {
      // Per pair: read the term, scan the dropdown, pick.
      const pairs = q.pairs?.length || 0;
      const choices = q.allChoices?.length || pairs;
      return 2 + wordsOf(q.pairs?.map((p) => p.term)) / PROSE_WPS + pairs * (3 + 0.4 * choices);
    }
    case 'drag-drop': {
      const pairs = q.pairs?.length || 0;
      return 2 + wordsOf(q.pairs?.map((p) => p.term)) / PROSE_WPS + pairs * 4;
    }
    default:
      return 8;
  }
}

// Words in the correct answer, what review mode shows beside the prompt.
function answerWords(q) {
  switch (q.type) {
    case 'mc':
    case 'tf':
      return words(q.options?.[q.correctAnswer]);
    case 'msq':
      return wordsOf((q.correctAnswer || []).map((i) => q.options?.[i]));
    case 'fitb':
      return wordsOf([].concat(q.correctAnswer));
    case 'matching':
    case 'drag-drop':
      return wordsOf(q.pairs?.flatMap((p) => [p.term, p.match]));
    default:
      return 0;
  }
}

// review: reading only. showExplanation: add a skim of the explanation.
export function estimateSeconds(questions, { review = false, showExplanation = true } = {}) {
  return questions.reduce((sum, q) => {
    const explanation = showExplanation ? words(q.explanation) / EXPLANATION_WPS : 0;
    if (review) return sum + readSeconds(q) + answerWords(q) / PROSE_WPS + explanation + NEXT_OVERHEAD;
    return sum + readSeconds(q) + answerSeconds(q) + explanation + NEXT_OVERHEAD;
  }, 0);
}

// "~45 min", "~1 h 20 min", "<1 min". Past an hour, rounded to 5 minutes:
// the estimate isn't that precise.
export function formatDuration(seconds) {
  const minutes = seconds / 60;
  if (minutes < 1) return '<1 min';
  if (minutes < 60) return `~${Math.round(minutes)} min`;
  const rounded = Math.round(minutes / 5) * 5;
  const h = Math.floor(rounded / 60);
  const m = rounded % 60;
  return m ? `~${h} h ${m} min` : `~${h} h`;
}
