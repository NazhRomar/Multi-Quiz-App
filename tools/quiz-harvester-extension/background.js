// Quiz Harvester background service worker.
//
// The extension never injects itself anywhere automatically. A tab only
// gets the capture content script once you explicitly hit "Start
// Capturing" in the dashboard window for that tab. Once armed, if the
// page does a full navigation (a real new page load, not an SPA route
// change), we re-inject automatically so a multi-page quiz doesn't need
// a click per page — but a never-armed tab is never touched.
//
// State (armed tab ids, the dashboard window id, the last-focused normal
// tab) lives in chrome.storage.session rather than plain module variables,
// since an MV3 service worker can be evicted and restarted at any time and
// in-memory state would silently vanish.

const ARMED_KEY = "qh_armed_tabs"; // { [tabId]: true }
const DASHBOARD_WINDOW_KEY = "qh_dashboard_window_id";
const TARGET_TAB_KEY = "qh_target_tab_id";

async function getArmedTabs() {
  const { [ARMED_KEY]: armed } = await chrome.storage.session.get(ARMED_KEY);
  return armed || {};
}

async function setArmed(tabId, isArmed) {
  const armed = await getArmedTabs();
  if (isArmed) armed[tabId] = true;
  else delete armed[tabId];
  await chrome.storage.session.set({ [ARMED_KEY]: armed });
}

async function injectInto(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      files: ["content/capture.js"],
    });
  } catch (err) {
    console.warn("Quiz Harvester: could not inject into tab", tabId, err);
  }
}

async function teardown(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId, allFrames: true },
      func: () => window.__quizHarvesterTeardown && window.__quizHarvesterTeardown(),
    });
  } catch (err) {
    // Tab may have navigated away already; nothing to tear down.
  }
}

// ---- track the last-active tab in a normal window, so the dashboard
// ---- (which is its own window) always knows what "the current quiz tab" is.

async function rememberActiveTab(tabId, windowId) {
  try {
    const win = await chrome.windows.get(windowId);
    if (win.type !== "normal") return; // ignore the dashboard's own popup window
    await chrome.storage.session.set({ [TARGET_TAB_KEY]: tabId });
  } catch (err) {
    // window may already be gone
  }
}

chrome.tabs.onActivated.addListener(({ tabId, windowId }) => {
  rememberActiveTab(tabId, windowId);
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) return;
  try {
    const [tab] = await chrome.tabs.query({ active: true, windowId });
    if (tab) rememberActiveTab(tab.id, windowId);
  } catch (err) {
    // ignore
  }
});

// ---- toolbar icon opens/focuses the dashboard window ----

chrome.action.onClicked.addListener(async (tab) => {
  if (tab && tab.id) await rememberActiveTab(tab.id, tab.windowId);

  const { [DASHBOARD_WINDOW_KEY]: existingId } = await chrome.storage.session.get(DASHBOARD_WINDOW_KEY);
  if (existingId) {
    try {
      await chrome.windows.update(existingId, { focused: true });
      return;
    } catch (err) {
      // window no longer exists; fall through and create a new one
    }
  }

  const win = await chrome.windows.create({
    url: chrome.runtime.getURL("popup/popup.html"),
    type: "popup",
    width: 380,
    height: 640,
  });
  await chrome.storage.session.set({ [DASHBOARD_WINDOW_KEY]: win.id });
});

chrome.windows.onRemoved.addListener(async (windowId) => {
  const { [DASHBOARD_WINDOW_KEY]: existingId } = await chrome.storage.session.get(DASHBOARD_WINDOW_KEY);
  if (windowId === existingId) {
    await chrome.storage.session.remove(DASHBOARD_WINDOW_KEY);
  }
});

// ---- messages from the dashboard ----

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    if (msg.type === "getTargetTab") {
      const { [TARGET_TAB_KEY]: tabId } = await chrome.storage.session.get(TARGET_TAB_KEY);
      if (!tabId) return sendResponse({ tab: null, armed: false });
      let tab = null;
      try {
        tab = await chrome.tabs.get(tabId);
      } catch (err) {
        return sendResponse({ tab: null, armed: false });
      }
      const armed = await getArmedTabs();
      sendResponse({ tab: { id: tab.id, title: tab.title, url: tab.url }, armed: !!armed[tabId] });
      return;
    }

    if (msg.type === "arm") {
      await setArmed(msg.tabId, true);
      await injectInto(msg.tabId);
      chrome.action.setBadgeText({ tabId: msg.tabId, text: "ON" });
      chrome.action.setBadgeBackgroundColor({ tabId: msg.tabId, color: "#16a34a" });
      sendResponse({ ok: true });
      return;
    }

    if (msg.type === "disarm") {
      await setArmed(msg.tabId, false);
      await teardown(msg.tabId);
      chrome.action.setBadgeText({ tabId: msg.tabId, text: "" });
      sendResponse({ ok: true });
      return;
    }
  })();
  return true; // keep the message channel open for the async response
});

chrome.webNavigation.onCommitted.addListener(async (details) => {
  if (details.frameId !== 0) return; // only re-inject from the top frame's nav event; injection itself covers all frames
  const armed = await getArmedTabs();
  if (armed[details.tabId]) {
    await injectInto(details.tabId);
  }
});

chrome.tabs.onRemoved.addListener(async (tabId) => {
  await setArmed(tabId, false);
});
