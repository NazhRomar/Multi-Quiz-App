// Loads every quiz JSON under src/data/**/*.json at build time and groups
// them into a `catalog` tree: term (path segment 2) -> subject/course (path
// segment 3) -> quiz. The folder path is meaningful, not cosmetic; see
// prompt.md at the repo root.
//
// A term or subject folder may optionally carry a `_meta.json` file
// declaring a URL id override, display name, explicit sort order, an
// archived flag, and (subject-level only) an explicit list of sections.
// None of this is required — every field falls back to something derived
// from the folder name, so dropping a new quiz into a new folder with no
// _meta.json still works exactly as before. See _meta.json.example in this
// folder for the full shape, and prompt.md for the quiz-level `"section"`
// field that assigns a quiz to one of those sections.
import { slugify } from '../utils/slugify.js';

const modules = import.meta.glob('./**/*.json', { eager: true });

const termsByKey = new Map();

function getTerm(key) {
  let term = termsByKey.get(key);
  if (!term) {
    term = { key, meta: null, coursesByKey: new Map() };
    termsByKey.set(key, term);
  }
  return term;
}

function getCourse(term, key) {
  let course = term.coursesByKey.get(key);
  if (!course) {
    course = { key, meta: null, quizzes: [] };
    term.coursesByKey.set(key, course);
  }
  return course;
}

for (const path in modules) {
  // path is relative to this file (src/data/), e.g.
  // "./4th Year - 1st Term/System Integration and Architecture/01-....json"
  // or "./4th Year - 1st Term/_meta.json" (term-level metadata).
  const parts = path.split('/');
  const termKey = parts[1];
  if (!termKey) continue;
  const term = getTerm(termKey);

  if (parts.length === 3) {
    if (parts[2] === '_meta.json') term.meta = modules[path];
    continue;
  }

  const courseKey = parts[2];
  const filename = parts[3];
  if (!courseKey || !filename) continue;
  const course = getCourse(term, courseKey);

  if (filename === '_meta.json') {
    course.meta = modules[path];
    continue;
  }

  const quizData = modules[path];
  course.quizzes.push({
    // id: the file path — stable across searches/renders, used to track the
    // Multi Quiz selection.
    id: path,
    // slug: URL-safe form of the filename, used in routes instead of id
    // (which contains slashes/spaces). Unique within a course by
    // construction, since it comes from the filename.
    slug: slugify(filename.replace(/\.json$/, '')),
    title: quizData.quizTitle || 'Untitled Quiz',
    section: quizData.section || null,
    data: quizData,
  });
}

// An entry with an explicit `order` always sorts before one without;
// entries carrying one are compared numerically, entries without one fall
// through to `fallback` among themselves.
function orderThenFallback(a, b, fallback) {
  if (a.order != null && b.order != null) return a.order - b.order;
  if (a.order != null) return -1;
  if (b.order != null) return 1;
  return fallback(a, b);
}

// Today's term-sort convention: two numbers pulled out of the folder name
// (e.g. "4th Year - 1st Term" -> [4, 1]), newest year first, then term
// ascending. Used only for terms with no explicit `order`.
function regexTermCompare(a, b) {
  const numsA = a.key.match(/\d+/g)?.map(Number) || [];
  const numsB = b.key.match(/\d+/g)?.map(Number) || [];
  const yearA = numsA[0] ?? 0;
  const yearB = numsB[0] ?? 0;
  if (yearB !== yearA) return yearB - yearA;
  return (numsA[1] ?? 0) - (numsB[1] ?? 0);
}

function warnDuplicate(scope, id) {
  if (import.meta.env.DEV) {
    console.warn(`[catalog] duplicate ${scope} id "${id}" — one entry will shadow the other in URL lookups`);
  }
}

export const catalog = [...termsByKey.values()]
  .map((term) => {
    const meta = term.meta || {};
    const courses = [...term.coursesByKey.values()]
      .map((course) => {
        const cmeta = course.meta || {};
        const sections = (cmeta.sections || []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        return {
          key: course.key,
          id: cmeta.id || slugify(course.key),
          displayName: cmeta.displayName || course.key,
          order: cmeta.order ?? null,
          archived: !!cmeta.archived,
          sections,
          quizzes: course.quizzes,
        };
      })
      // No native tiebreaker needed for courses without an explicit order:
      // Array.prototype.sort is stable, so they keep glob (alphabetical)
      // insertion order among themselves, same as today's Object.keys().
      .sort((a, b) => orderThenFallback(a, b, () => 0));

    const seenCourseIds = new Set();
    const seenQuizSlugs = new Map(); // courseId -> Set<slug>
    courses.forEach((c) => {
      if (seenCourseIds.has(c.id)) warnDuplicate('subject', `${term.key}/${c.id}`);
      seenCourseIds.add(c.id);
      const slugs = new Set();
      c.quizzes.forEach((q) => {
        if (slugs.has(q.slug)) warnDuplicate('quiz slug', `${term.key}/${c.key}/${q.slug}`);
        slugs.add(q.slug);
      });
      seenQuizSlugs.set(c.id, slugs);
    });

    return {
      key: term.key,
      id: meta.id || slugify(term.key),
      displayName: meta.displayName || term.key,
      order: meta.order ?? null,
      archived: !!meta.archived,
      courses,
    };
  })
  .sort((a, b) => orderThenFallback(a, b, regexTermCompare));

{
  const seenTermIds = new Set();
  catalog.forEach((t) => {
    if (seenTermIds.has(t.id)) warnDuplicate('term', t.id);
    seenTermIds.add(t.id);
  });
}

// Term key strings, in display order — kept for callers that only need the
// ordering, not the full objects (mirrors the old Object.keys(courseMenu)
// call sites).
export function sortedTerms(list = catalog) {
  return list.map((t) => t.key);
}

export function findTerm(termKeyOrId) {
  return catalog.find((t) => t.key === termKeyOrId || t.id === termKeyOrId) || null;
}

export function findCourse(termKeyOrId, courseKeyOrId) {
  const term = findTerm(termKeyOrId);
  if (!term) return null;
  const course = term.courses.find((c) => c.key === courseKeyOrId || c.id === courseKeyOrId);
  return course ? { term, course } : null;
}

export function findQuizBySlug(termSlug, courseSlug, quizSlug) {
  const found = findCourse(termSlug, courseSlug);
  if (!found) return null;
  const quiz = found.course.quizzes.find((q) => q.slug === quizSlug);
  return quiz ? { term: found.term, course: found.course, quiz } : null;
}

// Linear scan over the whole catalog by stable id (the file path) — used to
// resolve a saved attempt back to a URL. Fine at this data size (tens of
// quizzes); revisit if the catalog ever grows enough for this to matter.
export function findQuizById(id) {
  for (const term of catalog) {
    for (const course of term.courses) {
      const quiz = course.quizzes.find((q) => q.id === id);
      if (quiz) return { term, course, quiz };
    }
  }
  return null;
}

export function quizUrlFor(term, course, quiz, mode = 'quiz') {
  const base = mode === 'review' ? '/review' : '/quiz';
  return `${base}/${encodeURIComponent(term.id)}/${encodeURIComponent(course.id)}/${encodeURIComponent(quiz.slug)}`;
}

// Search across every quiz's title/course/term, used by the home menu's
// search box. Returns a catalog-shaped array with non-matching
// courses/terms dropped entirely, so callers can render it exactly like the
// full catalog.
//
// TODO: also search question text / code / correct answers, shown as a
// "Matching questions" section (tap → Review at that question), only from
// 3 characters, with a "Question matches first" order setting. Built in
// commit cd3814a and reverted for now — `git cherry-pick cd3814a` restores
// it as a starting point (now needs retargeting at this function's
// catalog-array shape and HomeScreen/BrowseLayout's `?q=`-based search
// state, which replaced MenuScreen's local state).
export function filterCatalog(query) {
  const q = query.trim().toLowerCase();
  if (!q) return catalog;

  const result = [];
  for (const term of catalog) {
    const termMatches = term.displayName.toLowerCase().includes(q) || term.key.toLowerCase().includes(q);
    const courses = [];
    for (const course of term.courses) {
      const courseMatches = termMatches || course.displayName.toLowerCase().includes(q) || course.key.toLowerCase().includes(q);
      const quizzes = course.quizzes.filter((quiz) => courseMatches || quiz.title.toLowerCase().includes(q));
      if (quizzes.length) courses.push({ ...course, quizzes });
    }
    if (courses.length) result.push({ ...term, courses });
  }
  return result;
}

// Combines the selected quizzes (ids from catalog entries) into one quiz
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
  for (const term of catalog) {
    for (const course of term.courses) {
      for (const quiz of course.quizzes) {
        if (!selectedIds.has(quiz.id)) continue;
        if (!subjects.some((s) => s.term === term.key && s.course === course.key)) subjects.push({ term: term.key, course: course.key });
        quizzes.push({ term: term.key, course: course.key, title: quiz.title });
        for (const q of quiz.data.questions) {
          questions.push({
            ...JSON.parse(JSON.stringify(q)),
            id: questions.length + 1,
            source: { term: term.key, course: course.key, title: quiz.title },
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

function groupUnits(quizzes) {
  const prefixCounts = {};
  quizzes.forEach((quiz) => {
    const parts = quiz.title.split(' - ');
    if (parts.length < 2) return;
    const prefix = parts[0];
    prefixCounts[prefix] = (prefixCounts[prefix] || 0) + 1;
  });

  const units = [];
  const seriesByPrefix = new Map();
  quizzes.forEach((quiz) => {
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

// Groups a course's quizzes into render units for CourseCard: quizzes
// sharing a "<Series> - <Item>" title prefix with 2+ siblings become one
// series bucket (rendered as chips); everything else stands alone as a row.
//
// If the subject's _meta.json declares explicit `sections`, quizzes are
// first bucketed by their own `section` field (falling back to the same
// title-prefix grouping *within* each section), and any quiz with no
// section, or one that doesn't match a declared id, lands in `ungrouped`.
// A subject with no declared sections (every subject today) gets
// `sections: []` and all its quizzes in `ungrouped` — byte-identical to
// what this function used to return outright.
export function buildRenderUnits(course) {
  if (!course.sections.length) {
    return { sections: [], ungrouped: groupUnits(course.quizzes) };
  }

  const used = new Set();
  const sections = course.sections.map((section) => {
    const quizzes = course.quizzes.filter((q) => q.section === section.id);
    quizzes.forEach((q) => used.add(q));
    return { id: section.id, name: section.name, units: groupUnits(quizzes) };
  });
  const leftover = course.quizzes.filter((q) => !used.has(q));
  return { sections, ungrouped: groupUnits(leftover) };
}
