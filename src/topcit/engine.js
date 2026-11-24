import { BANK, DOMAINS } from './bank.js';
import { STORAGE_KEY } from './summary.js';

// Logic for the TOPCIT practice page (no React in here): which questions a
// setup picks, how a session is built and graded, and what is kept in
// localStorage. Behavior follows the original standalone TOPCIT page.

export { DOMAINS };

// Each question gets its position in the bank as a stable id (progress is
// stored by it), and objective questions default to "mcq".
export const QUESTIONS = BANK.map((q, id) => ({ ...q, id, k: q.k || 'mcq' }));

export const DOMAIN_NAME = Object.fromEntries(DOMAINS.map((d) => [d.id, d.name]));

// Topics per domain, in first-seen order.
export const TOPICS = {};
for (const q of QUESTIONS) {
  const list = (TOPICS[q.d] = TOPICS[q.d] || []);
  if (!list.includes(q.t)) list.push(q.t);
}

export const TYPES = [
  ['mcq', 'Multiple choice'],
  ['code', 'Code and SQL tracing'],
  ['desc', 'Descriptive (self-graded)'],
];

// The 2026 test's blueprint, per domain: [objective, descriptive].
const MOCK = { sw: [15, 2], db: [15, 2], sa: [15, 1], bz: [15, 2] };
export const MOCK_TOTAL = Object.values(MOCK).reduce((sum, [obj, desc]) => sum + obj + desc, 0);

// The real test gives 150 minutes for 75 items: about two minutes each.
const SECONDS_PER_QUESTION = 120;

export const LETTERS = 'ABCD';

export const topicKey = (domain, topic) => `${domain}|${topic}`;
const ALL_TOPIC_KEYS = [...new Set(QUESTIONS.map((q) => topicKey(q.d, q.t)))];

const defaultCfg = () => ({
  topics: ALL_TOPIC_KEYS,
  types: TYPES.map(([value]) => value),
  count: 20, // a number, 'all', 'mock' or 'custom'
  custom: 25,
  pool: 'all', // 'all', 'unseen' or 'missed'
  mode: 'practice', // 'practice' or 'exam'
  timer: 'off', // 'off', 'pace' or 'custom'
  minutes: 30,
  shuffleQuestions: true,
  shuffleOptions: true,
});

export function loadStore() {
  const store = { cfg: defaultCfg(), stats: {}, hist: [], session: null };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved && typeof saved === 'object') {
      Object.assign(store.cfg, saved.cfg);
      store.stats = saved.stats || {};
      store.hist = Array.isArray(saved.hist) ? saved.hist : [];
      const s = saved.session;
      // A session from an older bank (an id that no longer exists) is dropped.
      if (s && Array.isArray(s.ids) && s.ids.length && s.ids.every((id) => QUESTIONS[id])) store.session = s;
    }
  } catch (e) {
    /* start fresh */
  }
  return store;
}

export function saveStore(store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    /* kept for this visit only */
  }
}

export const shuffle = (list) => {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const fmt = (n) => (Number.isInteger(n) ? String(n) : n.toFixed(1));

export const mmss = (seconds) => {
  const s = Math.max(0, Math.round(seconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`;
};

// --- Choosing the questions -------------------------------------------------

const inPool = (q, cfg, stats) => {
  const st = stats[q.id];
  if (cfg.pool === 'unseen') return !st;
  if (cfg.pool === 'missed') return !!st && st.last === 0;
  return true;
};

export const poolOf = (cfg, stats) =>
  QUESTIONS.filter((q) => cfg.topics.includes(topicKey(q.d, q.t)) && cfg.types.includes(q.k) && inPool(q, cfg, stats));

// How many questions of a domain's topic (under the current type and pool
// filters) a topic chip stands for.
export const topicCount = (domain, topic, cfg, stats) =>
  QUESTIONS.filter((q) => q.d === domain && q.t === topic && cfg.types.includes(q.k) && inPool(q, cfg, stats)).length;

const mockPart = (domain, descriptive, cfg, stats) =>
  QUESTIONS.filter((q) => q.d === domain && (q.k === 'desc') === descriptive && inPool(q, cfg, stats));

export function plannedIds(cfg, stats) {
  if (cfg.count === 'mock') {
    const ids = [];
    for (const d of Object.keys(MOCK)) {
      ids.push(
        ...shuffle(mockPart(d, false, cfg, stats))
          .slice(0, MOCK[d][0])
          .map((q) => q.id),
        ...shuffle(mockPart(d, true, cfg, stats))
          .slice(0, MOCK[d][1])
          .map((q) => q.id)
      );
    }
    return ids;
  }
  const pool = poolOf(cfg, stats);
  const list = cfg.shuffleQuestions ? shuffle(pool) : pool;
  return list.slice(0, plannedSize(cfg, stats)).map((q) => q.id);
}

export function plannedSize(cfg, stats) {
  if (cfg.count === 'mock') {
    return Object.keys(MOCK).reduce(
      (sum, d) => sum + Math.min(MOCK[d][0], mockPart(d, false, cfg, stats).length) + Math.min(MOCK[d][1], mockPart(d, true, cfg, stats).length),
      0
    );
  }
  const available = poolOf(cfg, stats).length;
  const wanted = cfg.count === 'all' ? available : cfg.count === 'custom' ? cfg.custom : cfg.count;
  return Math.max(0, Math.min(Math.floor(wanted) || 0, available));
}

// Seconds allowed for n questions, or 0 for no limit.
export function timeLimit(cfg, n) {
  if (cfg.count === 'mock' || cfg.timer === 'pace') return n * SECONDS_PER_QUESTION;
  if (cfg.timer === 'custom') return Math.max(1, Math.floor(cfg.minutes) || 1) * 60;
  return 0;
}

// --- A session --------------------------------------------------------------

// ans: chosen option (index into the question's own options); lock: answer
// shown (practice); self: 1 / 0.5 / 0 self-mark on a descriptive one;
// txt: what was typed; perm: the order the options are shown in.
export function newSession(ids, mode, limit, cfg) {
  const perm = {};
  for (const id of ids) {
    const q = QUESTIONS[id];
    if (q.o) {
      const order = q.o.map((_, i) => i);
      perm[id] = cfg.shuffleOptions ? shuffle(order) : order;
    }
  }
  return {
    ids,
    perm,
    ans: {},
    flag: {},
    lock: {},
    self: {},
    txt: {},
    cur: 0,
    mode,
    limit,
    el: 0,
    done: false,
    at: Date.now(),
    label: cfg.count === 'mock' ? 'Mock exam' : mode === 'exam' ? 'Exam' : 'Practice',
  };
}

// 1 right, 0 wrong, or a descriptive question's self-mark.
export const gradeOf = (s, id) => {
  const q = QUESTIONS[id];
  return q.k === 'desc' ? (s.self[id] ?? 0) : s.ans[id] === q.a ? 1 : 0;
};

export const isAnswered = (s, id) => (QUESTIONS[id].k === 'desc' ? s.self[id] !== undefined || !!(s.txt[id] || '').trim() : s.ans[id] !== undefined);

export const totalScore = (s) => s.ids.reduce((sum, id) => sum + gradeOf(s, id), 0);

// The store after a session ends: every question's latest result goes into
// the stats (the progress bars and the "missed" pool), and the attempt into
// the history.
export function finishSession(store, timeUp) {
  const s = store.session;
  if (!s || s.done) return store;
  const stats = { ...store.stats };
  for (const id of s.ids) {
    const prev = stats[id] || { s: 0, c: 0 };
    const g = gradeOf(s, id);
    stats[id] = { s: prev.s + 1, c: prev.c + (g === 1 ? 1 : 0), last: g === 1 ? 1 : 0 };
  }
  const hist = [...store.hist, { at: Date.now(), mode: s.label, n: s.ids.length, pct: (totalScore(s) / s.ids.length) * 100, sec: s.el }].slice(-50);
  return { ...store, stats, hist, session: { ...s, done: true, timeUp } };
}
