// Quiz Harvester content script.
//
// PASSIVE ONLY. This file never dispatches a click, never submits a form,
// never calls .focus()/.select() on page controls, and never navigates.
// It only reads the DOM. Advancing through a quiz is entirely up to you.
//
// Injected into every frame of an armed tab (quiz content is very often
// inside an iframe on LMS-style sites), re-injected by the background
// worker after full page navigations. Re-running this file on the same
// frame (e.g. double-inject) is safe: it tears down any previous instance
// first. Only the top-most frame renders the visual pill; every frame
// (including iframes) still scans and writes to the shared session in
// chrome.storage.local, and the top frame's pill re-renders whenever that
// storage changes, from any frame.
//
// Many LMS quiz widgets (e.g. the Adapt learning framework, used by at
// least some Cisco NetAcad course content) render inside deeply NESTED
// OPEN shadow roots — a plain querySelector from the document never sees
// any of it. Everything here that looks for candidate elements walks the
// full composed tree (document + every open shadow root, recursively).
// A CLOSED shadow root is invisible to any script, including this one —
// there's no way around that; if capture silently finds nothing on a site
// like that, this is why.

(() => {
  if (window.__quizHarvesterTeardown) {
    window.__quizHarvesterTeardown();
  }

  const isTopFrame = window.top === window;

  const NOISE_ANCESTOR_SELECTOR = "nav, header, footer, [role='navigation'], [role='menu'], .menu, .navbar, .sidebar, [class*='nav-']";
  const TRAILING_MARK = /(\(correct\)|[✓✔]\s*$)/i;
  const QUESTION_NUMBER_PATTERNS = [
    /\bquestion\s*#?\s*(\d+)\b/i,
    /\bq\.?\s*(\d+)\b/i,
    /^\s*(\d+)\s*[.):]/,
    /\b(\d+)\s*(?:of|\/)\s*\d+\b/i,
  ];
  const JUNK_TEXT_PATTERNS = [
    /^(incomplete|complete|correct|incorrect|submit|skip( question| all)?|next|previous|continue)$/i,
    /^\d+\s*(of|\/)\s*\d+\s*questions?$/i,
  ];

  let sessionId = "default";
  let observer = null;
  let scanTimer = null;
  let pollTimer = null;
  let hostEl = null;
  let shadow = null;
  let destroyed = false;
  let storageListener = null;

  // ---------- shadow-DOM-piercing traversal ----------
  // Composed-tree helpers: treat the document plus every open shadow root
  // reachable from it as one searchable space, in roughly document order.

  function deepQueryAll(root, selector) {
    const results = [...root.querySelectorAll(selector)];
    for (const el of root.querySelectorAll("*")) {
      if (el.shadowRoot) results.push(...deepQueryAll(el.shadowRoot, selector));
    }
    return results;
  }

  function composedChildren(el) {
    const kids = [];
    if (el.shadowRoot) kids.push(...el.shadowRoot.children);
    kids.push(...el.children);
    return kids;
  }

  // Pre-order flatten of the composed tree, so a sibling block's entire
  // (possibly shadow-nested) subtree appears together and in order —
  // needed because plain parentElement/previousElementSibling chains
  // break at shadow-root boundaries.
  function flattenComposed(root, acc = []) {
    for (const child of composedChildren(root)) {
      if (/^(SCRIPT|STYLE|TEMPLATE)$/.test(child.tagName)) continue;
      acc.push(child);
      flattenComposed(child, acc);
    }
    return acc;
  }

  // ---------- storage helpers ----------

  const storageKey = (id) => `qh_session_${id}`;

  async function getActiveSessionId() {
    const { qh_active_session } = await chrome.storage.local.get("qh_active_session");
    return qh_active_session || "default";
  }

  async function loadSession(id) {
    const key = storageKey(id);
    const data = await chrome.storage.local.get(key);
    return data[key] || { sessionId: id, createdAt: Date.now(), questions: [] };
  }

  async function saveQuestion(id, record) {
    const session = await loadSession(id);
    const idx = session.questions.findIndex((q) => q.hash === record.hash);
    if (idx === -1) {
      session.questions.push(record);
    } else {
      const existing = session.questions[idx];
      if (existing.userOverride) return session; // never clobber a manual answer, from any frame
      const rank = { unresolved: 0, ambiguous: 1, "site-marked": 2, "user-marked": 3 };
      if ((rank[record.confidence] ?? 0) < (rank[existing.confidence] ?? 0)) return session; // don't regress
      session.questions[idx] = { ...existing, ...record, capturedAt: existing.capturedAt };
    }
    session.updatedAt = Date.now();
    await chrome.storage.local.set({ [storageKey(id)]: session });
    return session;
  }

  // ---------- text/hash helpers ----------

  function cleanText(s) {
    return (s || "").replace(/\s+/g, " ").trim();
  }

  // Screen-reader-only helper text (e.g. Adapt's ".screenReader-position-text"
  // holding "1 of 4" inside an option label, or ".accessibility-completion-
  // indicator" holding "Incomplete") is invisible but still part of
  // textContent — strip it before reading an element's "visible" text.
  const SR_ONLY_SELECTOR =
    "[class*='sr-only'], [class*='screenReader'], [class*='screen-reader'], [class*='visually-hidden'], [class*='accessibility-'], .aria-label";

  function visibleText(el) {
    const clone = el.cloneNode(true);
    clone.querySelectorAll(SR_ONLY_SELECTOR).forEach((n) => n.remove());
    return cleanText(clone.textContent);
  }

  function hashOf(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16);
  }

  function isNoise(el) {
    return !!el.closest(NOISE_ANCESTOR_SELECTOR);
  }

  function isJunkText(t) {
    if (!t || t.length < 8 || t.length > 500) return true;
    if (/[{};]/.test(t) && t.includes(":")) return true; // looks like CSS spilling out of a <style> read
    return JUNK_TEXT_PATTERNS.some((re) => re.test(t));
  }

  function looksLikeNavList(items) {
    const linky = items.filter((li) => li.querySelector && li.querySelector("a[href]")).length;
    return linky >= Math.ceil(items.length * 0.6); // most items are links out — this is a nav/menu, not options
  }

  // ---------- question-text discovery ----------

  // Framework-specific fast path: the Adapt learning framework (used by at
  // least some Cisco NetAcad content) renders an MCQ's prompt in a
  // `.mcq__body`/`.component__body` element that lives in a SEPARATE shadow
  // root from the options, as a preceding sibling block. Try this first
  // since it's precise when it matches; fall back to generic heuristics.
  //
  // Note: BEM-style class names like "mcq__widget-inner" contain "__widget"
  // as a substring, so a loose [class*='__widget'] selector wrongly matches
  // it via .closest() (it's closer to the input than the real ".mcq__widget"
  // ancestor). closestExactClassSuffix requires the FULL class token to end
  // in the suffix, not just contain it.
  function closestExactClassSuffix(el, suffix) {
    let node = el;
    while (node) {
      if (node.classList) {
        for (const cls of node.classList) {
          if (cls.endsWith(suffix)) return node;
        }
      }
      node = node.parentElement;
    }
    return null;
  }

  function findAdaptQuestionText(containerEl) {
    const widgetRoot = closestExactClassSuffix(containerEl, "__widget");
    if (!widgetRoot) return null;
    const componentRoot = widgetRoot.parentElement;
    if (!componentRoot) return null;
    for (const bodyEl of deepQueryAll(componentRoot, ".mcq__body, .component__body, [class*='__body']")) {
      const t = visibleText(bodyEl);
      if (t.length > 3 && !isJunkText(t)) return t;
    }
    return null;
  }

  function findAdaptQuestionNumber(containerEl) {
    const widgetRoot = closestExactClassSuffix(containerEl, "__widget");
    if (!widgetRoot) return null;
    const label = widgetRoot.querySelector(".aria-label");
    if (label) {
      const m = cleanText(label.textContent).match(/(\d+)/);
      if (m) return parseInt(m[1], 10);
    }
    return null;
  }

  function findQuestionText(containerEl, flat) {
    const adaptText = findAdaptQuestionText(containerEl);
    if (adaptText) return adaptText;

    // Pass 1: nearby headings/legend/paragraphs within the same shadow tree
    // (semantic, most trustworthy for classic light-DOM markup).
    let node = containerEl;
    for (let depth = 0; depth < 5 && node; depth++, node = node.parentElement) {
      let sib = node.previousElementSibling;
      while (sib) {
        if (/^(H[1-6]|LEGEND|P)$/.test(sib.tagName)) {
          const t = cleanText(sib.textContent);
          if (t.length > 3 && !isJunkText(t)) return t;
        }
        const heading = sib.querySelector && sib.querySelector("h1,h2,h3,h4,h5,h6,legend,p");
        if (heading) {
          const t = cleanText(heading.textContent);
          if (t.length > 3 && !isJunkText(t)) return t;
        }
        sib = sib.previousElementSibling;
      }
      const legend = node.parentElement && node.parentElement.querySelector(":scope > legend");
      if (legend) {
        const t = cleanText(legend.textContent);
        if (t.length > 3 && !isJunkText(t)) return t;
      }
    }

    // Pass 2: an ancestor whose id/class hints "question", using its own
    // text minus the option group's text.
    node = containerEl.parentElement;
    for (let depth = 0; depth < 6 && node; depth++, node = node.parentElement) {
      const hint = `${node.id || ""} ${node.className || ""}`;
      if (/question|prompt|stem/i.test(hint)) {
        const full = cleanText(node.textContent);
        const optionsText = cleanText(containerEl.textContent);
        const stripped = cleanText(full.replace(optionsText, ""));
        if (stripped.length > 3 && stripped.length < 500 && !isJunkText(stripped)) return stripped;
      }
    }

    // Pass 3: composed-tree order fallback — walk backward from containerEl
    // in the shadow-piercing flattened list, collecting plausible leaf text
    // candidates, and prefer one that reads like a question (ends in "?")
    // else the longest.
    if (flat) {
      const idx = flat.indexOf(containerEl);
      if (idx > 0) {
        const candidates = [];
        for (let i = idx - 1; i >= 0 && i > idx - 250; i--) {
          const el = flat[i];
          if (el.contains(containerEl)) continue; // an ancestor, not a preceding block
          if (el.children.length > 0) continue; // want leaf text holders
          if (el.closest && el.closest("input,select,textarea,button,a")) continue;
          const t = cleanText(el.textContent);
          if (t.length > 5 && t.length < 400 && !isJunkText(t)) candidates.push(t);
          if (candidates.length >= 8) break;
        }
        const withQuestionMark = candidates.find((t) => t.includes("?"));
        if (withQuestionMark) return withQuestionMark;
        if (candidates.length) return candidates.sort((a, b) => b.length - a.length)[0];
      }
    }

    return null;
  }

  function findQuestionNumber(containerEl, questionText) {
    const adaptNum = findAdaptQuestionNumber(containerEl);
    if (adaptNum != null) return adaptNum;

    const dataAttrEl = containerEl.closest("[data-question-index], [data-question-number], [data-qnum], [data-question-id]");
    if (dataAttrEl) {
      const raw =
        dataAttrEl.getAttribute("data-question-index") ||
        dataAttrEl.getAttribute("data-question-number") ||
        dataAttrEl.getAttribute("data-qnum") ||
        dataAttrEl.getAttribute("data-question-id");
      const n = parseInt(raw, 10);
      if (!Number.isNaN(n)) return n;
    }
    for (const re of QUESTION_NUMBER_PATTERNS) {
      const m = questionText && questionText.match(re);
      if (m) return parseInt(m[1], 10);
    }
    let node = containerEl;
    for (let depth = 0; depth < 5 && node; depth++, node = node.parentElement) {
      let sib = node.previousElementSibling;
      while (sib) {
        const t = cleanText(sib.textContent);
        for (const re of QUESTION_NUMBER_PATTERNS) {
          const m = t.match(re);
          if (m) return parseInt(m[1], 10);
        }
        sib = sib.previousElementSibling;
      }
    }
    return null;
  }

  function findCodeContext(containerEl) {
    let node = containerEl;
    for (let depth = 0; depth < 4 && node; depth++, node = node.parentElement) {
      const pre = node.querySelector && node.querySelector("pre, code");
      if (pre && !containerEl.contains(pre)) {
        return pre.outerHTML;
      }
    }
    return null;
  }

  // ---------- candidate option groups (shadow-piercing) ----------

  function collectInputGroups(root) {
    const inputs = deepQueryAll(root, "input[type=radio], input[type=checkbox]");
    const byName = new Map();
    for (const input of inputs) {
      if (isNoise(input)) continue;
      const key = input.name ? `name:${input.name}` : `parent:${input.parentElement && input.parentElement.parentElement}`;
      if (!byName.has(key)) byName.set(key, []);
      byName.get(key).push(input);
    }
    const groups = [];
    for (const [, els] of byName) {
      if (els.length < 2) continue;
      // Common ancestor within the same shadow tree as the first input.
      let container = els[0].parentElement;
      while (container && !els.every((e) => container.contains(e))) {
        container = container.parentElement;
      }
      if (!container) continue;
      groups.push({ container, type: "input", optionEls: els });
    }
    return groups;
  }

  function collectListGroups(root) {
    const lists = deepQueryAll(root, "ul, ol");
    const groups = [];
    for (const list of lists) {
      if (isNoise(list)) continue;
      const items = Array.from(list.children).filter((c) => c.tagName === "LI");
      if (items.length < 2 || items.length > 8) continue;
      if (items.some((li) => cleanText(li.textContent).length === 0 || cleanText(li.textContent).length > 400)) continue;
      if (list.querySelector("input[type=radio], input[type=checkbox]")) continue; // handled by collectInputGroups
      if (looksLikeNavList(items)) continue; // e.g. <ul class="nav nav-tabs"> of <a href> links
      groups.push({ container: list, type: "list", optionEls: items });
    }
    return groups;
  }

  function optionLabel(el, type) {
    if (type === "input") {
      if (el.id) {
        const root = el.getRootNode();
        const lbl = root.querySelector && root.querySelector(`label[for="${CSS.escape(el.id)}"]`);
        if (lbl) return cleanText(lbl.textContent);
      }
      const wrappingLabel = el.closest("label");
      if (wrappingLabel) return cleanText(wrappingLabel.textContent);
      const parent = el.parentElement;
      return cleanText(parent ? parent.textContent : "");
    }
    return cleanText(el.textContent);
  }

  function optionMarkerEl(el, type) {
    if (type === "input") return el.closest("label") || el.parentElement || el;
    return el;
  }

  // ---------- correct-answer detection (read-only) ----------

  function colorSignature(el) {
    const cs = window.getComputedStyle(el);
    return `${cs.color}`;
  }

  function detectCorrect(group) {
    const { optionEls, type } = group;
    const markerEls = optionEls.map((el) => optionMarkerEl(el, type));

    // 1. Already-checked inputs.
    if (type === "input") {
      const checked = optionEls.map((el, i) => (el.checked ? i : -1)).filter((i) => i >= 0);
      if (checked.length) return { indexes: checked, confidence: "site-marked", reason: "checked" };
    }

    // 2. Explicit class-name markers (also catches Adapt's mcq__item--correct).
    const classHit = markerEls.map((el, i) => {
      const cls = el.className && el.className.toString();
      return cls && /\b(correct|is-correct|answer-correct|right-answer)\b|--correct\b/i.test(cls) && !/wrong|incorrect|--incorrect\b/i.test(cls) ? i : -1;
    }).filter((i) => i >= 0);
    if (classHit.length) return { indexes: classHit, confidence: "site-marked", reason: "class" };

    // 3. Trailing text markers ("(correct)", checkmark char).
    const textHit = optionEls.map((el, i) => (TRAILING_MARK.test(el.textContent) ? i : -1)).filter((i) => i >= 0);
    if (textHit.length) return { indexes: textHit, confidence: "site-marked", reason: "trailing-text" };

    // 4. Outlier color within the group (e.g. one option in red, rest default).
    const colors = markerEls.map(colorSignature);
    const counts = new Map();
    colors.forEach((c) => counts.set(c, (counts.get(c) || 0) + 1));
    if (counts.size === 2) {
      const [minorityColor] = [...counts.entries()].sort((a, b) => a[1] - b[1])[0];
      const minorityCount = counts.get(minorityColor);
      if (minorityCount >= 1 && minorityCount < colors.length) {
        const idxs = colors.map((c, i) => (c === minorityColor ? i : -1)).filter((i) => i >= 0);
        return { indexes: idxs, confidence: "site-marked", reason: "outlier-color" };
      }
    }

    return { indexes: [], confidence: "unresolved", reason: null };
  }

  // ---------- main scan ----------

  async function scan() {
    if (destroyed) return;
    const flat = flattenComposed(document.body);
    const groups = [...collectInputGroups(document), ...collectListGroups(document)];
    for (const group of groups) {
      const questionText = findQuestionText(group.container, flat);
      if (!questionText) continue;
      const options = group.optionEls.map((el) => optionLabel(el, group.type));
      if (options.some((o) => !o) || new Set(options).size < 2) continue;

      const hash = hashOf(questionText + "|" + options.join("|"));
      const { indexes, confidence, reason } = detectCorrect(group);
      const codeContext = findCodeContext(group.container);
      const questionNumber = findQuestionNumber(group.container, questionText);

      await saveQuestion(sessionId, {
        hash,
        questionNumber,
        sourceUrl: location.href,
        text: questionText,
        options,
        correctIndexes: indexes,
        confidence,
        detectionReason: reason,
        codeContext,
        capturedAt: Date.now(),
      });
    }
    if (isTopFrame) await renderPillFromStorage();
  }

  function scheduleScan() {
    if (scanTimer) clearTimeout(scanTimer);
    scanTimer = setTimeout(scan, 300);
  }

  // ---------- pill UI (top frame only; shadow DOM; read-only except the manual "mark answer" control) ----------

  async function renderPillFromStorage() {
    if (!shadow || destroyed) return;
    const session = await loadSession(sessionId);
    const records = [...session.questions].sort((a, b) => (a.questionNumber ?? 1e9) - (b.questionNumber ?? 1e9));
    const resolved = records.filter((r) => r.confidence !== "unresolved" && r.confidence !== "ambiguous");
    const needsReview = records.filter((r) => r.confidence === "unresolved" || r.confidence === "ambiguous");

    const root = shadow.getElementById("qh-root");
    if (!root) return;

    const state = records.length === 0 ? "none" : needsReview.length > 0 ? "review" : "captured";
    root.dataset.state = state;

    const summary = shadow.getElementById("qh-summary");
    summary.textContent =
      state === "none" ? "No question detected" : `${resolved.length} captured${needsReview.length ? ` · ${needsReview.length} need review` : ""}`;

    const list = shadow.getElementById("qh-list");
    list.innerHTML = "";
    for (const r of records) {
      const item = document.createElement("div");
      item.className = "qh-item";
      const badge = r.confidence === "unresolved" || r.confidence === "ambiguous" ? "qh-badge-amber" : "qh-badge-green";
      item.innerHTML = `
        <div class="qh-item-head">
          <span class="qh-dot ${badge}"></span>
          <span class="qh-item-text">${r.questionNumber != null ? `#${r.questionNumber} — ` : ""}${escapeHtml(r.text)}</span>
        </div>
        <ul class="qh-options"></ul>
        ${r.codeContext ? `<pre class="qh-code">${escapeHtml(stripTags(r.codeContext))}</pre>` : ""}
      `;
      const optList = item.querySelector(".qh-options");
      r.options.forEach((opt, i) => {
        const li = document.createElement("li");
        const isMarked = r.correctIndexes.includes(i);
        li.className = isMarked ? "qh-opt-correct" : "";
        li.textContent = opt;
        if (r.confidence === "unresolved" || r.confidence === "ambiguous") {
          li.classList.add("qh-opt-pickable");
          li.title = "Click to mark this as the correct answer";
          li.addEventListener("click", async () => {
            await saveQuestion(sessionId, { ...r, correctIndexes: [i], confidence: "user-marked", userOverride: true });
            renderPillFromStorage();
          });
        }
        optList.appendChild(li);
      });
      list.appendChild(item);
    }
  }

  function escapeHtml(s) {
    return (s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  function stripTags(html) {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || "";
  }

  function buildPill() {
    hostEl = document.createElement("div");
    hostEl.id = "quiz-harvester-host";
    hostEl.style.all = "initial";
    hostEl.style.position = "fixed";
    hostEl.style.bottom = "16px";
    hostEl.style.right = "16px";
    hostEl.style.zIndex = "2147483647";
    document.documentElement.appendChild(hostEl);

    shadow = hostEl.attachShadow({ mode: "open" });
    shadow.innerHTML = `
      <style>
        * { box-sizing: border-box; font-family: system-ui, sans-serif; }
        #qh-root { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
        #qh-pill {
          display: flex; align-items: center; gap: 8px;
          background: #16a34a; color: white; padding: 8px 14px; border-radius: 999px;
          font-size: 13px; font-weight: 600; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,.25);
          user-select: none;
        }
        #qh-root[data-state="review"] #qh-pill { background: #d97706; }
        #qh-root[data-state="none"] #qh-pill { background: #6b7280; }
        #qh-panel {
          display: none; width: 340px; max-height: 420px; overflow-y: auto;
          background: #111827; color: #e5e7eb; border-radius: 10px; padding: 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,.4); font-size: 12px;
        }
        #qh-root.qh-open #qh-panel { display: block; }
        .qh-item { border-bottom: 1px solid #374151; padding: 8px 0; }
        .qh-item:last-child { border-bottom: none; }
        .qh-item-head { display: flex; gap: 6px; align-items: flex-start; margin-bottom: 4px; }
        .qh-dot { width: 9px; height: 9px; border-radius: 50%; margin-top: 3px; flex-shrink: 0; }
        .qh-badge-green { background: #22c55e; }
        .qh-badge-amber { background: #f59e0b; }
        .qh-item-text { font-weight: 600; line-height: 1.3; }
        .qh-options { list-style: none; margin: 0; padding: 0 0 0 15px; }
        .qh-options li { padding: 2px 0; color: #cbd5e1; }
        .qh-opt-correct { color: #4ade80 !important; font-weight: 600; }
        .qh-opt-pickable { cursor: pointer; text-decoration: underline dotted; }
        .qh-opt-pickable:hover { color: white !important; }
        .qh-code { background: #030712; padding: 6px; border-radius: 6px; overflow-x: auto; white-space: pre; margin-top: 4px; }
      </style>
      <div id="qh-root" data-state="none">
        <div id="qh-panel"><div id="qh-list"></div></div>
        <div id="qh-pill">
          <span id="qh-summary">No question detected</span>
        </div>
      </div>
    `;
    shadow.getElementById("qh-pill").addEventListener("click", () => {
      shadow.getElementById("qh-root").classList.toggle("qh-open");
    });
  }

  // ---------- lifecycle ----------

  async function init() {
    sessionId = await getActiveSessionId();

    if (isTopFrame) {
      buildPill();
      storageListener = (changes, area) => {
        if (area === "local" && changes[storageKey(sessionId)]) renderPillFromStorage();
      };
      chrome.storage.onChanged.addListener(storageListener);
      renderPillFromStorage();
    }

    // A plain MutationObserver on document.body can't see mutations inside
    // nested shadow roots, and dynamically attaching one to every shadow
    // root a component might create later isn't reliable — so poll as the
    // primary trigger, and keep the observer as a fast-path for ordinary
    // light-DOM-only pages.
    observer = new MutationObserver(scheduleScan);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class", "style"] });
    pollTimer = setInterval(scan, 1000);
    scheduleScan();
  }

  window.__quizHarvesterTeardown = () => {
    destroyed = true;
    if (observer) observer.disconnect();
    if (scanTimer) clearTimeout(scanTimer);
    if (pollTimer) clearInterval(pollTimer);
    if (storageListener) chrome.storage.onChanged.removeListener(storageListener);
    if (hostEl) hostEl.remove();
    delete window.__quizHarvesterTeardown;
  };

  init();
})();
