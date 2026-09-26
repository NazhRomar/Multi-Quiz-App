// Loads every quiz JSON under src/data/**/*.json at build time and groups
// them into a `catalog` tree: term -> subject -> section -> series -> quiz.
// The folder path is meaningful, not cosmetic — every level requires a
// `_meta.json` declaring at least an `id` (the URL slug); see quiz-prompt.md and
// _meta.json.example for the full shape of each level's metadata, including
// the `badges` default and `showLabel`/`showCount` display toggles a
// section or series can carry.
import { slugify } from '../utils/slugify.js';

const modules = import.meta.glob('./**/*.json', { eager: true });

const BADGE_KEYS = ['verified', 'unofficial', 'unverified', 'unethicallySourced'];

const termsByKey = new Map();

function getTerm(key) {
  let term = termsByKey.get(key);
  if (!term) {
    term = { key, meta: null, subjectsByKey: new Map() };
    termsByKey.set(key, term);
  }
  return term;
}

function getSubject(term, key) {
  let subject = term.subjectsByKey.get(key);
  if (!subject) {
    subject = { key, meta: null, sectionsByKey: new Map() };
    term.subjectsByKey.set(key, subject);
  }
  return subject;
}

function getSection(subject, key) {
  let section = subject.sectionsByKey.get(key);
  if (!section) {
    section = { key, meta: null, seriesByKey: new Map() };
    subject.sectionsByKey.set(key, section);
  }
  return section;
}

function getSeries(section, key) {
  let series = section.seriesByKey.get(key);
  if (!series) {
    series = { key, meta: null, quizzes: [] };
    section.seriesByKey.set(key, series);
  }
  return series;
}

// path is relative to this file (src/data/), e.g.
// "./4th Year - 1st Term/System Integration and Architecture/Canvas/Module 1/01-module1.json"
// or ".../Canvas/Module 1/_meta.json" (series-level metadata).
for (const path in modules) {
  const parts = path.split('/');
  const termKey = parts[1];
  if (!termKey) continue;
  const term = getTerm(termKey);

  if (parts.length === 3) {
    if (parts[2] === '_meta.json') term.meta = modules[path];
    continue;
  }

  const subjectKey = parts[2];
  if (!subjectKey) continue;
  const subject = getSubject(term, subjectKey);

  if (parts.length === 4) {
    if (parts[3] === '_meta.json') subject.meta = modules[path];
    continue;
  }

  const sectionKey = parts[3];
  if (!sectionKey) continue;
  const section = getSection(subject, sectionKey);

  if (parts.length === 5) {
    if (parts[4] === '_meta.json') section.meta = modules[path];
    continue;
  }

  const seriesKey = parts[4];
  const filename = parts[5];
  if (!seriesKey || !filename) continue;
  const series = getSeries(section, seriesKey);

  if (filename === '_meta.json') {
    series.meta = modules[path];
    continue;
  }

  const quizData = modules[path];
  series.quizzes.push({
    id: path,
    slug: slugify(filename.replace(/\.json$/, '')),
    title: quizData.quizTitle || 'Untitled Quiz',
    // sectionKey/seriesKey: which folders this quiz sits in, so
    // buildRenderUnits can regroup it later straight off course.quizzes
    // (which filterCatalog may have narrowed down) instead of a separately
    // pre-grouped tree that wouldn't reflect a search's results.
    sectionKey,
    seriesKey,
    // Resolved per-tag from quizData.badges plus the series/section/subject
    // defaults once those metas are known — filled in below, after every
    // level's meta has been collected.
    badges: quizData.badges || {},
    data: quizData,
  });
}

function warnDuplicate(scope, id) {
  if (import.meta.env.DEV) {
    console.warn(`[catalog] duplicate ${scope} id "${id}" — one entry will shadow the other in URL lookups`);
  }
}

// A quiz's own badges win per-tag; otherwise it falls back through its
// series, then section, then subject defaults — each declared as a
// `"badges": { "<tag>": true }` object in that level's _meta.json.
function resolveBadges(quizBadges, ...defaults) {
  const resolved = {};
  for (const key of BADGE_KEYS) {
    if (key in quizBadges) {
      resolved[key] = quizBadges[key];
      continue;
    }
    const fromDefault = defaults.find((d) => d && key in d);
    if (fromDefault) resolved[key] = fromDefault[key];
  }
  return resolved;
}

export const catalog = [...termsByKey.values()]
  .map((term) => {
    const tmeta = term.meta || {};
    const subjects = [...term.subjectsByKey.values()]
      .map((subject) => {
        const smeta = subject.meta || {};
        // "sections" is display metadata only — id/name/order/showLabel/
        // showCount for each Section and its Series — never a pre-grouped
        // quiz list. Actual membership is looked up from course.quizzes at
        // render time (via each quiz's sectionKey/seriesKey), so a caller
        // that narrows course.quizzes first (filterCatalog) still groups
        // correctly instead of a stale, pre-baked tree ignoring the filter.
        const sections = [...subject.sectionsByKey.values()]
          .map((section) => {
            const secmeta = section.meta || {};
            const seriesList = [...section.seriesByKey.values()]
              .map((series) => {
                const sermeta = series.meta || {};
                return {
                  key: series.key,
                  id: sermeta.id || slugify(series.key),
                  name: series.key,
                  order: sermeta.order ?? null,
                  showLabel: sermeta.showLabel !== false,
                  showCount: !!sermeta.showCount,
                  badges: sermeta.badges || null,
                };
              })
              .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            return {
              key: section.key,
              id: secmeta.id || slugify(section.key),
              name: section.key,
              order: secmeta.order ?? null,
              showLabel: secmeta.showLabel !== false,
              showCount: !!secmeta.showCount,
              badges: secmeta.badges || null,
              series: seriesList,
            };
          })
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        // The canonical quiz order: section order -> series order -> each
        // series' own file order (matches display order top to bottom).
        // Badges are resolved once here, per quiz.
        const quizzes = sections.flatMap((sec) =>
          sec.series.flatMap((ser) => {
            const rawSeries = subject.sectionsByKey.get(sec.key).seriesByKey.get(ser.key);
            return rawSeries.quizzes.map((q) => ({
              ...q,
              badges: resolveBadges(q.badges, ser.badges, sec.badges, smeta.badges),
            }));
          })
        );
        return {
          key: subject.key,
          id: smeta.id || slugify(subject.key),
          displayName: smeta.displayName || subject.key,
          order: smeta.order ?? null,
          archived: !!smeta.archived,
          sections,
          quizzes,
        };
      })
      .filter((subject) => !subject.archived)
      // No native tiebreaker needed for subjects without an explicit order:
      // Array.prototype.sort is stable, so they keep glob (alphabetical)
      // insertion order among themselves, same as today's Map order.
      .sort((a, b) => {
        if (a.order != null && b.order != null) return a.order - b.order;
        if (a.order != null) return -1;
        if (b.order != null) return 1;
        return 0;
      });

    const seenSubjectIds = new Set();
    const seenQuizSlugs = new Map(); // subjectId -> Set<slug>
    subjects.forEach((s) => {
      if (seenSubjectIds.has(s.id)) warnDuplicate('subject', `${term.key}/${s.id}`);
      seenSubjectIds.add(s.id);
      const slugs = new Set();
      s.quizzes.forEach((q) => {
        if (slugs.has(q.slug)) warnDuplicate('quiz slug', `${term.key}/${s.key}/${q.slug}`);
        slugs.add(q.slug);
      });
      seenQuizSlugs.set(s.id, slugs);
    });

    return {
      key: term.key,
      id: tmeta.id || slugify(term.key),
      displayName: tmeta.displayName || term.key,
      order: tmeta.order ?? null,
      archived: !!tmeta.archived,
      courses: subjects,
    };
  })
  .filter((term) => !term.archived)
  // Today's term-sort convention: two numbers pulled out of the folder name
  // (e.g. "4th Year - 1st Term" -> [4, 1]), newest year first, then term
  // ascending. Used only for terms with no explicit `order`.
  .sort((a, b) => {
    if (a.order != null && b.order != null) return a.order - b.order;
    if (a.order != null) return -1;
    if (b.order != null) return 1;
    const numsA = a.key.match(/\d+/g)?.map(Number) || [];
    const numsB = b.key.match(/\d+/g)?.map(Number) || [];
    const yearA = numsA[0] ?? 0;
    const yearB = numsB[0] ?? 0;
    if (yearB !== yearA) return yearB - yearA;
    return (numsA[1] ?? 0) - (numsB[1] ?? 0);
  });

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
    quizTitle: 'Multi Quiz',
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

// Groups a section's quizzes for CourseCard: every series folder becomes a
// render unit, its membership looked up from `quizzes` (course.quizzes, as
// passed to buildRenderUnits — so a search-narrowed list still groups
// correctly) by matching each quiz's sectionKey/seriesKey. A series with a
// single quiz and showLabel:false renders as a plain standalone row instead
// of a boxed/counted series card — the same visual a lone quiz always got,
// just driven by the folder's _meta.json instead of the old
// explicit-vs-inferred distinction.
//
// Item labels: when every quiz in the series shares the exact same
// "<Prefix> - " title prefix, that prefix is stripped from each label
// (matches the old title-prefix inference); otherwise each quiz's full
// title is used (matches the old explicit-series behavior).
function buildSeriesUnit(series, quizzes) {
  const first = quizzes[0]?.title.split(' - ');
  const prefix = first && first.length >= 2 ? first[0] : null;
  const sharedPrefix = prefix && quizzes.every((q) => q.title.startsWith(`${prefix} - `)) ? prefix : null;
  const items = quizzes.map((quiz) => ({ quiz, label: sharedPrefix ? quiz.title.slice(sharedPrefix.length + 3) : quiz.title }));

  if (quizzes.length === 1 && !series.showLabel) {
    return { type: 'standalone', quiz: quizzes[0], label: quizzes[0].title };
  }
  return { type: 'series', key: series.key, name: series.name, showLabel: series.showLabel, showCount: series.showCount, items };
}

export function buildRenderUnits(course) {
  return course.sections
    .map((section) => {
      const seriesUnits = section.series
        .map((series) => ({ series, quizzes: course.quizzes.filter((q) => q.sectionKey === section.key && q.seriesKey === series.key) }))
        .filter(({ quizzes }) => quizzes.length > 0);
      return {
        key: section.key,
        name: section.name,
        showLabel: section.showLabel,
        showCount: section.showCount,
        count: seriesUnits.reduce((sum, { quizzes }) => sum + quizzes.length, 0),
        units: seriesUnits.map(({ series, quizzes }) => buildSeriesUnit(series, quizzes)),
      };
    })
    .filter((section) => section.units.length > 0);
}
