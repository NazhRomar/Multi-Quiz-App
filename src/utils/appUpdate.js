// Picks up new deploys without a manual refresh. Every visit to Home asks the
// server which build is live (version.json, emitted by versionAsset() in
// vite.config.js) and reloads if it isn't the one running. Reloading only on
// a mismatch, not on every visit, keeps Home instant; the reload itself gets
// the new build because the service worker fetches pages network-first and
// build assets are content-hashed.
const LAST_BUILD_KEY = 'quizApp_lastBuild';
// The build a reload was last attempted for. If the server says X but the
// reload still comes back running something else (a CDN serving a stale
// index.html for a few minutes), don't keep reloading towards X.
const RELOADED_FOR_KEY = 'quizApp_reloadedFor';

export async function checkForUpdate() {
  if (!import.meta.env.PROD || !navigator.onLine) return;
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}version.json`, { cache: 'no-store' });
    if (!res.ok) return;
    const { build } = await res.json();
    if (!build || build === __BUILD_DATE__) return;
    if (sessionStorage.getItem(RELOADED_FOR_KEY) === build) return;
    sessionStorage.setItem(RELOADED_FOR_KEY, build);
    window.location.reload();
  } catch (e) {
    /* offline or storage blocked: keep running this build */
  }
}

// True once, on the first load running a different build than the previous
// load did, which is what the "App updated" toast is shown for. Applies to
// any reload that brought a new build, not only ones checkForUpdate started.
// A first-ever visit has nothing to compare against and stays quiet.
export function consumeUpdatedFlag() {
  try {
    const last = localStorage.getItem(LAST_BUILD_KEY);
    localStorage.setItem(LAST_BUILD_KEY, __BUILD_DATE__);
    return last !== null && last !== __BUILD_DATE__;
  } catch (e) {
    return false;
  }
}
