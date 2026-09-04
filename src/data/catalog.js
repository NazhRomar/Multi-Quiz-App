// Loads every quiz JSON under src/data/**/*.json at build time and groups
// them by term (path segment 2) and subject/course (path segment 3) — the
// folder path is meaningful, not cosmetic; see prompt.md at the repo root.
const quizModules = import.meta.glob('./**/*.json', { eager: true });

export const courseMenu = {};

for (const path in quizModules) {
  // path is relative to this file (src/data/), e.g.
  // "./4th Year - 1st Term/System Integration and Architecture/01-....json"
  const pathParts = path.split('/');
  const term = pathParts[1];
  const course = pathParts[2];
  const quizData = quizModules[path];
  const realTitle = quizData.quizTitle || 'Untitled Quiz';
  if (!courseMenu[term]) courseMenu[term] = {};
  if (!courseMenu[term][course]) courseMenu[term][course] = [];
  courseMenu[term][course].push({ title: realTitle, data: quizData });
}

export function sortedTerms() {
  return Object.keys(courseMenu).sort((a, b) => {
    const numsA = a.match(/\d+/g)?.map(Number) || [];
    const numsB = b.match(/\d+/g)?.map(Number) || [];
    const yearA = numsA[0] ?? 0;
    const yearB = numsB[0] ?? 0;
    if (yearB !== yearA) return yearB - yearA; // newest year first
    return (numsA[1] ?? 0) - (numsB[1] ?? 0); // then term ascending
  });
}

// Groups a course's quizzes into render units: quizzes sharing a
// "<Series> - <Item>" title prefix with 2+ siblings become one series
// bucket (rendered as chips); everything else stands alone as a row.
export function buildRenderUnits(courseQuizzes) {
  const prefixCounts = {};
  courseQuizzes.forEach((quiz) => {
    const parts = quiz.title.split(' - ');
    if (parts.length < 2) return;
    const prefix = parts[0];
    prefixCounts[prefix] = (prefixCounts[prefix] || 0) + 1;
  });

  const units = [];
  const seriesByPrefix = new Map();
  courseQuizzes.forEach((quiz) => {
    const parts = quiz.title.split(' - ');
    const prefix = parts.length >= 2 ? parts[0] : null;
    const isSeries = prefix && prefixCounts[prefix] >= 2;

    if (isSeries) {
      let series = seriesByPrefix.get(prefix);
      if (!series) {
        series = { type: 'series', name: prefix, items: [] };
        seriesByPrefix.set(prefix, series);
        units.push(series);
      }
      series.items.push({ quiz, label: quiz.title.slice(prefix.length + 3) });
    } else {
      units.push({ type: 'standalone', quiz, label: quiz.title });
    }
  });
  return units;
}
