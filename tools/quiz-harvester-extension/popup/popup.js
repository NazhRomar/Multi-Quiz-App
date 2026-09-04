const sessionNameInput = document.getElementById("sessionName");
const capturedCountEl = document.getElementById("capturedCount");
const reviewCountEl = document.getElementById("reviewCount");
const startBtn = document.getElementById("startBtn");
const targetTitleEl = document.getElementById("targetTitle");
const targetUrlEl = document.getElementById("targetUrl");
const listEl = document.getElementById("list");

const storageKey = (id) => `qh_session_${id}`;

let currentTab = null;
let armed = false;

async function getActiveSessionId() {
  const { qh_active_session } = await chrome.storage.local.get("qh_active_session");
  return qh_active_session || "default";
}

async function setActiveSessionId(id) {
  await chrome.storage.local.set({ qh_active_session: id });
}

async function loadSession(id) {
  const key = storageKey(id);
  const data = await chrome.storage.local.get(key);
  return data[key] || { sessionId: id, questions: [] };
}

function escapeHtml(s) {
  return (s || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function stripTags(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || "";
}

async function refreshTarget() {
  const res = await chrome.runtime.sendMessage({ type: "getTargetTab" });
  currentTab = res.tab;
  armed = res.armed;
  if (currentTab) {
    targetTitleEl.textContent = currentTab.title || currentTab.url;
    targetUrlEl.textContent = currentTab.url || "";
  } else {
    targetTitleEl.textContent = "No tab selected — click on a quiz tab first";
    targetUrlEl.textContent = "";
  }
  startBtn.textContent = armed ? "Stop Capturing" : "Start Capturing";
  startBtn.classList.toggle("armed", armed);
  startBtn.disabled = !currentTab;
}

async function refreshSession() {
  const id = await getActiveSessionId();
  sessionNameInput.value = id;
  const session = await loadSession(id);
  const questions = [...session.questions].sort((a, b) => (a.questionNumber ?? 1e9) - (b.questionNumber ?? 1e9));
  const needsReview = questions.filter((q) => q.confidence === "unresolved" || q.confidence === "ambiguous");
  capturedCountEl.textContent = String(questions.length - needsReview.length);
  reviewCountEl.textContent = String(needsReview.length);
  renderList(id, questions);
}

function renderList(sessionId, questions) {
  listEl.innerHTML = "";
  if (questions.length === 0) {
    listEl.innerHTML = `<div id="empty">Nothing captured yet.</div>`;
    return;
  }
  for (const q of questions) {
    const item = document.createElement("div");
    item.className = "qitem";
    const needsReview = q.confidence === "unresolved" || q.confidence === "ambiguous";
    item.innerHTML = `
      <div class="qitem-head">
        <span class="dot ${needsReview ? "dot-amber" : "dot-green"}"></span>
        <span class="qtext">${q.questionNumber != null ? `#${q.questionNumber} — ` : ""}${escapeHtml(q.text)}</span>
      </div>
      <ul class="opts"></ul>
      ${q.codeContext ? `<pre class="code">${escapeHtml(stripTags(q.codeContext))}</pre>` : ""}
    `;
    const optsEl = item.querySelector(".opts");
    q.options.forEach((opt, i) => {
      const li = document.createElement("li");
      const isMarked = q.correctIndexes.includes(i);
      li.className = isMarked ? "opt-correct" : "";
      li.textContent = opt;
      if (needsReview) {
        li.classList.add("opt-pickable");
        li.title = "Mark this as the correct answer";
        li.addEventListener("click", async () => {
          const session = await loadSession(sessionId);
          const idx = session.questions.findIndex((x) => x.hash === q.hash);
          if (idx === -1) return;
          session.questions[idx] = { ...session.questions[idx], correctIndexes: [i], confidence: "user-marked", userOverride: true };
          await chrome.storage.local.set({ [storageKey(sessionId)]: session });
          refreshSession();
        });
      }
      optsEl.appendChild(li);
    });
    listEl.appendChild(item);
  }
}

sessionNameInput.addEventListener("change", async () => {
  const name = sessionNameInput.value.trim() || "default";
  await setActiveSessionId(name);
  await refreshSession();
});

startBtn.addEventListener("click", async () => {
  if (!currentTab) return;
  await chrome.runtime.sendMessage({ type: armed ? "disarm" : "arm", tabId: currentTab.id });
  await refreshTarget();
});

document.getElementById("export").addEventListener("click", async () => {
  const id = await getActiveSessionId();
  const session = await loadSession(id);
  const payload = {
    sessionId: id,
    exportedAt: new Date().toISOString(),
    questionCount: session.questions.length,
    questions: session.questions,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const filename = `quiz-capture-${id}-${Date.now()}.json`;
  await chrome.downloads.download({ url, filename, saveAs: true });
});

document.getElementById("clear").addEventListener("click", async () => {
  const id = await getActiveSessionId();
  if (!confirm(`Clear all captured questions in session "${id}"? This can't be undone.`)) return;
  await chrome.storage.local.remove(storageKey(id));
  await refreshSession();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "local") return;
  getActiveSessionId().then((id) => {
    if (changes[storageKey(id)]) refreshSession();
  });
});

// Poll the target tab occasionally too, since focus can change while this
// window stays open without a storage event firing.
setInterval(refreshTarget, 1500);

refreshTarget();
refreshSession();
