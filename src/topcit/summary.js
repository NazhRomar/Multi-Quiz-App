// What Home's TOPCIT card shows about the practice page, read straight from
// its saved state. Kept apart from engine.js, which pulls in the whole
// question bank: Home loads this much, the page itself loads on demand.

export const STORAGE_KEY = 'quizApp_topcit';

// The Home term (its _meta.json id) the TOPCIT card sits at the top of.
export const TOPCIT_TERM_ID = '4th-year-1st-term-finals';

// { resume: { at, of } | null, last: percent | null }
export function readTopcitSummary() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    const session = saved?.session;
    const hist = saved?.hist;
    return {
      resume: session && !session.done && Array.isArray(session.ids) ? { at: session.cur + 1, of: session.ids.length } : null,
      last: Array.isArray(hist) && hist.length ? Math.round(hist[hist.length - 1].pct) : null,
    };
  } catch (e) {
    return { resume: null, last: null };
  }
}
