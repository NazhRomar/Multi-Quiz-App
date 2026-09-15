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
  // id: the file path — stable across searches/renders, used to track the
  // Multi Quiz selection.
  courseMenu[term][course].push({ id: path, title: realTitle, data: quizData });
}

export function sortedTerms(menu = courseMenu) {
  return Object.keys(menu).sort((a, b) => {
    const numsA = a.match(/\d+/g)?.map(Number) || [];
    const numsB = b.match(/\d+/g)?.map(Number) || [];
    const yearA = numsA[0] ?? 0;
    const yearB = numsB[0] ?? 0;
    if (yearB !== yearA) return yearB - yearA; // newest year first
    return (numsA[1] ?? 0) - (numsB[1] ?? 0); // then term ascending
  });
}

// Search across every quiz's title/course/term, used by the home menu's
// search box. Returns a courseMenu-shaped structure with non-matching
// courses/terms dropped entirely, so callers can render it exactly like
// the full courseMenu.
//
// TODO: also search question text / code / correct answers, shown as a
// "Matching questions" section (tap → Review at that question), only from
// 3 characters, with a "Question matches first" order setting. Built in
// commit cd3814a and reverted for now — `git cherry-pick cd3814a` restores
// it as a starting point.
export function filterCourseMenu(query) {
  const q = query.trim().toLowerCase();
  if (!q) return courseMenu;

  const filtered = {};
  for (const term in courseMenu) {
    const termMatches = term.toLowerCase().includes(q);
    const filteredCourses = {};
    for (const course in courseMenu[term]) {
      const courseMatches = termMatches || course.toLowerCase().includes(q);
      const quizzes = courseMenu[term][course].filter((quiz) => courseMatches || quiz.title.toLowerCase().includes(q));
      if (quizzes.length) filteredCourses[course] = quizzes;
    }
    if (Object.keys(filteredCourses).length) filtered[term] = filteredCourses;
  }
  return filtered;
}

// Combines the selected quizzes (ids from courseMenu entries) into one quiz
// for a Multi session, in home-menu order. Question ids are renumbered
// (every source quiz starts at 1, and answers are keyed by id) and each
// question carries a `source` so the UI can say where it came from.
// `multi.subjects` lists every distinct term/course involved, and
// `multi.quizzes` every source quiz (the results screen's per-module
// breakdown order).
export function buildMultiQuiz(selectedIds) {
  const questions = [];
  const subjects = [];
  const quizzes = [];
  for (const term of sortedTerms()) {
    for (const course in courseMenu[term]) {
      for (const quiz of courseMenu[term][course]) {
        if (!selectedIds.has(quiz.id)) continue;
        if (!subjects.some((s) => s.term === term && s.course === course)) subjects.push({ term, course });
        quizzes.push({ term, course, title: quiz.title });
        for (const q of quiz.data.questions) {
          questions.push({
            ...JSON.parse(JSON.stringify(q)),
            id: questions.length + 1,
            source: { term, course, title: quiz.title },
          });
        }
      }
    }
  }
  return {
    courseCode: 'MULTI',
    quizTitle: 'Multi Quiz',
    totalPoints: questions.reduce((sum, q) => sum + (q.points || 1), 0),
    questions,
    multi: { subjects, quizzes },
  };
}

// Header label for a Multi session: just the subject name(s), no module.
// Past two subjects it collapses to "+N more" (the full list, with terms,
// goes in the tooltip).
export function multiSubjectLabel(multi) {
  const names = multi.subjects.map((s) => s.course);
  const label = names.length <= 2 ? names.join(' · ') : `${names.slice(0, 2).join(' · ')} · +${names.length - 2} more`;
  const tooltip = multi.subjects.map((s) => `${s.term} — ${s.course}`).join('\n');
  return { label, tooltip };
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
