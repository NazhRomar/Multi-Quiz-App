import { useEffect, useSyncExternalStore } from 'react';

// "N reviewing now": every open copy of the app joins one Supabase Realtime
// presence channel, and the channel's member count is N. The site is static,
// so this is the one piece that needs a server; Supabase keeps the list and
// drops a closed tab on its own a few seconds later.
//
// Both values are public by design (the publishable/anon key only lets you
// do what the project's policies allow, and presence needs no tables). With
// either missing the whole feature is off: no connection, no badge, no
// setting in the menu.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
export const PRESENCE_AVAILABLE = !!(SUPABASE_URL && SUPABASE_KEY);

// null = not connected (off, offline, still joining), so there's no number
// worth showing.
let count = null;
const listeners = new Set();
const setCount = (n) => {
  count = n;
  listeners.forEach((l) => l());
};
const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

// One id per browser, so two tabs of the app count as one person.
function browserId() {
  const make = () => (crypto.randomUUID ? crypto.randomUUID() : String(Math.random()).slice(2));
  try {
    let id = localStorage.getItem('quizApp_presenceId');
    if (!id) {
      id = make();
      localStorage.setItem('quizApp_presenceId', id);
    }
    return id;
  } catch (e) {
    return make();
  }
}

// Joins the channel while `enabled` (the Live count setting). Turning it off
// leaves the channel, so you stop being counted as well as stop seeing it.
// The client is loaded on demand, keeping it out of the main bundle.
export function usePresenceConnection(enabled) {
  useEffect(() => {
    if (!enabled || !PRESENCE_AVAILABLE) return;
    let cancelled = false;
    let client;
    let channel;
    import('@supabase/realtime-js').then(({ RealtimeClient }) => {
      if (cancelled) return;
      client = new RealtimeClient(`${SUPABASE_URL}/realtime/v1`, { params: { apikey: SUPABASE_KEY } });
      channel = client.channel('online', { config: { presence: { key: browserId() } } });
      channel
        .on('presence', { event: 'sync' }, () => setCount(Object.keys(channel.presenceState()).length))
        .subscribe((status) => {
          // Also fires again after a dropped connection comes back, which
          // re-announces this browser.
          if (status === 'SUBSCRIBED') channel.track({});
          else setCount(null);
        });
    });
    return () => {
      cancelled = true;
      setCount(null);
      if (client) {
        client.removeChannel(channel);
        client.disconnect();
      }
    };
  }, [enabled]);
}

export function useLiveCount() {
  return useSyncExternalStore(subscribe, () => count);
}
