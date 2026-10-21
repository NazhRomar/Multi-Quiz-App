import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useApp } from '../../state/AppContext.jsx';
import { usePresenceConnection, useLiveCount } from '../../utils/presence.js';
import { AUTH_AVAILABLE } from '../../utils/auth.js';
import { LEADERBOARD_ENABLED } from '../../utils/leaderboard.js';
import LiveActivityModal from './LiveActivityModal.jsx';

// Mounted once for the whole app, so you're counted on every screen, not
// just the one that shows the number.
export function LivePresence() {
  const { state } = useApp();
  usePresenceConnection(!!state.appSettings.liveCount);
  return null;
}

// The home header's "● N reviewing now". Nothing at all until connected.
// Tapping it opens the live activity across every quiz (when sign-in is
// set up at all, and the leaderboards are on — it's the same UST-only data).
export default function LiveCount() {
  const { state } = useApp();
  const count = useLiveCount();
  const [open, setOpen] = useState(false);
  if (!state.appSettings.liveCount || count == null) return null;

  const people = `${count} ${count === 1 ? 'person has' : 'people have'} the app open right now`;
  const content = (
    <>
      <span className="live-count-dot" aria-hidden="true" />
      {count}
      <span className="live-count-label">reviewing now</span>
    </>
  );

  if (!AUTH_AVAILABLE || !LEADERBOARD_ENABLED) {
    return (
      <span className="live-count" title={people}>
        {content}
      </span>
    );
  }
  return (
    <>
      <button type="button" className="live-count live-count--button" title={`${people} · see live activity`} onClick={() => setOpen(true)}>
        {content}
      </button>
      {/* Portaled out of the header, whose children are all forced to 36px tall. */}
      {open && createPortal(<LiveActivityModal count={count} onClose={() => setOpen(false)} />, document.body)}
    </>
  );
}
