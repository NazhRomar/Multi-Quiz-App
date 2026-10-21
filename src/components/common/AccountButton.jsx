import { useEffect, useRef, useState } from 'react';
import { AUTH_AVAILABLE, useAuth, signIn, signOut } from '../../utils/auth.js';
import { fetchShowOnBoard, setShowOnBoard, LEADERBOARD_ENABLED } from '../../utils/leaderboard.js';
import Avatar from './Avatar.jsx';
import ToggleRow from '../settings/ToggleRow.jsx';

const PersonIcon = () => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="8" cy="5.5" r="2.75" />
    <path d="M2.75 13.75c.6-2.6 2.7-4 5.25-4s4.65 1.4 5.25 4" />
  </svg>
);

// Home header: "Sign in" (UST Google accounts) when signed out; signed in,
// your photo, opening a menu with the leaderboard switch and Sign out. With
// the leaderboards off there's no Sign in (it's only for them), and the menu
// is just Sign out.
export default function AccountButton() {
  const auth = useAuth();
  const [phase, setPhase] = useState('closed'); // 'closed' | 'opening' | 'open'
  const [showOnBoard, setShow] = useState(null); // null until loaded
  const [error, setError] = useState(null);
  const wrapRef = useRef(null);
  const { user } = auth;

  useEffect(() => {
    if (phase !== 'opening') return undefined;
    const raf = requestAnimationFrame(() => setPhase('open'));
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  useEffect(() => {
    if (phase === 'closed') return undefined;
    const handler = (e) => {
      if (!wrapRef.current?.contains(e.target)) setPhase('closed');
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'opening' || !user || !LEADERBOARD_ENABLED) return;
    setError(null);
    fetchShowOnBoard(user.id)
      .then(setShow)
      .catch((e) => setError(e.message));
  }, [phase, user]);

  if (!AUTH_AVAILABLE) return null;

  if (auth.status !== 'signedIn') {
    if (!LEADERBOARD_ENABLED) return null;
    return (
      <button type="button" className="btn-account" onClick={signIn} disabled={auth.status === 'loading'} title="Sign in with your UST Google account">
        <PersonIcon />
        <span className="btn-account-label">{auth.status === 'loading' ? 'Signing in…' : 'Sign in'}</span>
      </button>
    );
  }

  const toggleShow = (value) => {
    setShow(value);
    setShowOnBoard(user.id, value).catch((e) => {
      setShow(!value);
      setError(e.message);
    });
  };

  return (
    <div className="account-wrap" ref={wrapRef}>
      <button
        type="button"
        className="btn-account btn-account--avatar"
        onClick={() => setPhase((p) => (p === 'closed' ? 'opening' : 'closed'))}
        aria-label={`Account: ${user.name}`}
        title={user.name}
      >
        <Avatar name={user.name} url={user.avatarUrl} size={34} />
      </button>
      {phase !== 'closed' && (
        <div className={`dropdown-menu account-menu ${phase === 'open' ? 'dropdown-menu--open' : ''}`} style={{ display: 'block' }}>
          <div className="account-menu-who">
            <Avatar name={user.name} url={user.avatarUrl} size={40} />
            <span>
              <strong>{user.name}</strong>
              <small>{user.email}</small>
            </span>
          </div>
          {LEADERBOARD_ENABLED && (
            <ToggleRow
              title="Show me on leaderboards"
              hint="Off: hidden from everyone else's boards and Live"
              checked={showOnBoard ?? true}
              onChange={toggleShow}
              inert={showOnBoard === null}
            />
          )}
          {error && <p className="account-menu-error">{error}</p>}
          <div className="account-menu-actions">
            <button
              type="button"
              className="btn-signout"
              onClick={() => {
                setPhase('closed');
                signOut();
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
