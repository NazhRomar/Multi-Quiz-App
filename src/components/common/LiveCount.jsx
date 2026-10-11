import { useApp } from '../../state/AppContext.jsx';
import { usePresenceConnection, useLiveCount } from '../../utils/presence.js';

// Mounted once for the whole app, so you're counted on every screen, not
// just the one that shows the number.
export function LivePresence() {
  const { state } = useApp();
  usePresenceConnection(!!state.appSettings.liveCount);
  return null;
}

// The home header's "● N reviewing now". Nothing at all until connected.
export default function LiveCount() {
  const { state } = useApp();
  const count = useLiveCount();
  if (!state.appSettings.liveCount || count == null) return null;
  return (
    <span className="live-count" title={`${count} ${count === 1 ? 'person has' : 'people have'} the app open right now`}>
      <span className="live-count-dot" aria-hidden="true" />
      {count}
      <span className="live-count-label">reviewing now</span>
    </span>
  );
}
