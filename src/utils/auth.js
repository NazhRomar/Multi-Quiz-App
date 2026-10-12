import { useSyncExternalStore } from 'react';
import { authCallbackPending, authRedirectError } from './authRedirect.js';

// Google sign-in (UST accounts only) through the same Supabase project as
// the live count. supabase-js is loaded on demand: a visitor who never signs
// in never downloads it. It loads at startup only when there's a session to
// restore, or a sign-in redirect to finish.
//
// UST-only is enforced by Supabase (the sign-up hook and every table and
// function — see supabase/leaderboard.sql); the check here only catches a
// non-UST session early, e.g. if the hook were ever switched off.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const AUTH_AVAILABLE = !!(SUPABASE_URL && SUPABASE_KEY);
export const UST_DOMAIN = 'ust.edu.ph';
export const isUstEmail = (email) => (email || '').toLowerCase().endsWith(`@${UST_DOMAIN}`);

// supabase-js's own localStorage key for the session.
function hasStoredSession() {
  try {
    const ref = new URL(SUPABASE_URL).hostname.split('.')[0];
    return !!localStorage.getItem(`sb-${ref}-auth-token`);
  } catch (e) {
    return false;
  }
}

// status: 'loading' (restoring a session / finishing a sign-in) | 'signedOut'
// | 'signedIn'. notice: a one-off message for AuthNotice (failed sign-in).
let auth = {
  status: AUTH_AVAILABLE && (authCallbackPending || hasStoredSession()) ? 'loading' : 'signedOut',
  user: null,
  notice: authRedirectError ? `Couldn't sign in: ${authRedirectError}` : null,
};
const listeners = new Set();
const setAuth = (patch) => {
  auth = { ...auth, ...patch };
  listeners.forEach((l) => l());
};
const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

function userFrom(session) {
  const u = session?.user;
  if (!u) return null;
  const meta = u.user_metadata || {};
  return {
    id: u.id,
    email: u.email,
    name: meta.full_name || meta.name || u.email,
    avatarUrl: meta.avatar_url || meta.picture || null,
  };
}

let clientPromise = null;

export function getSupabase() {
  if (!clientPromise) {
    clientPromise = import('@supabase/supabase-js').then(({ createClient }) => {
      // pkce: the sign-in comes back as ?code=…, not as tokens in the #hash,
      // which is where the router keeps its routes.
      const client = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true },
      });
      client.auth.onAuthStateChange((event, session) => {
        const user = userFrom(session);
        if (user && !isUstEmail(user.email)) {
          setAuth({ status: 'signedOut', user: null, notice: 'Only UST accounts (@ust.edu.ph) can sign in.' });
          // Deferred: supabase-js must not be called back from inside this callback.
          setTimeout(() => client.auth.signOut({ scope: 'local' }), 0);
          return;
        }
        setAuth({ status: user ? 'signedIn' : 'signedOut', user });
      });
      return client;
    });
  }
  return clientPromise;
}

if (auth.status === 'loading') getSupabase();

// Leaves for Google's account picker (UST accounts first) and comes back to
// this page; whatever attempt was on screen is restored from localStorage.
export async function signIn() {
  const client = await getSupabase();
  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + window.location.pathname,
      queryParams: { hd: UST_DOMAIN, prompt: 'select_account' },
    },
  });
  if (error) setAuth({ notice: `Couldn't sign in: ${error.message}` });
}

export async function signOut() {
  const client = await getSupabase();
  await client.auth.signOut({ scope: 'local' });
  setAuth({ status: 'signedOut', user: null });
}

export const dismissAuthNotice = () => setAuth({ notice: null });

export function useAuth() {
  return useSyncExternalStore(subscribe, () => auth);
}
