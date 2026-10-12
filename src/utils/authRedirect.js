// Reads what the Google sign-in redirect left in the address bar, before
// anything else runs (it's main.jsx's first import). It has to beat the hash
// router: a failed sign-in comes back as ?error=… or #error=…, and the router
// would read "#error=…" as a route and bounce it to Home, losing the reason.
//
// A successful sign-in comes back as ?code=…, which supabase-js exchanges for
// a session (and then strips) itself; this only notes that it's there, so the
// auth client loads straight away instead of waiting to be needed.

const ERROR_KEYS = ['error', 'error_code', 'error_description'];

function readRedirect() {
  try {
    const url = new URL(window.location.href);
    // A real route's hash starts with "#/"; anything else is redirect params.
    const hashParams = url.hash && !url.hash.startsWith('#/') ? new URLSearchParams(url.hash.slice(1)) : null;
    const get = (key) => url.searchParams.get(key) ?? hashParams?.get(key) ?? null;

    let error = null;
    if (get('error') || get('error_description')) {
      error = (get('error_description') || get('error')).replace(/\+/g, ' ');
      ERROR_KEYS.forEach((key) => url.searchParams.delete(key));
      if (hashParams) url.hash = '';
      window.history.replaceState(window.history.state, '', url.toString());
    }
    return { error, callback: url.searchParams.has('code') };
  } catch (e) {
    return { error: null, callback: false };
  }
}

const redirect = readRedirect();

// Why the last sign-in failed (shown once, by AuthNotice), or null.
export const authRedirectError = redirect.error;
// True while the page is the landing of a successful Google sign-in.
export const authCallbackPending = redirect.callback;
