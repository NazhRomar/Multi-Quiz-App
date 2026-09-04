import { useEffect, useRef, useState } from 'react';

// Ports toggleDropdown(): mount with display:block first (no --open class),
// add --open on the next frame so the opacity/transform transition actually
// runs, and keep the panel mounted for 140ms after closing so the reverse
// transition can play before it's removed.
export default function Dropdown({ ariaLabel = 'Options', children }) {
  const [phase, setPhase] = useState('closed'); // 'closed' | 'opening' | 'open' | 'closing'
  const wrapRef = useRef(null);

  const openMenu = () => setPhase('opening');
  const closeMenu = () => {
    setPhase((p) => (p === 'closed' ? p : 'closing'));
  };
  const toggle = () => (phase === 'closed' ? openMenu() : closeMenu());

  useEffect(() => {
    if (phase === 'opening') {
      const raf = requestAnimationFrame(() => setPhase('open'));
      return () => cancelAnimationFrame(raf);
    }
    if (phase === 'closing') {
      const t = setTimeout(() => setPhase('closed'), 140);
      return () => clearTimeout(t);
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'closed') return;
    const handler = (e) => {
      if (!wrapRef.current?.contains(e.target)) closeMenu();
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [phase]);

  const mounted = phase !== 'closed';

  return (
    <div className="hamburger-wrap" ref={wrapRef}>
      <button className="btn-hamburger" onClick={toggle} aria-label={ariaLabel}>
        <span></span>
        <span></span>
        <span></span>
      </button>
      {mounted && (
        <div
          className={`dropdown-menu ${phase === 'open' ? 'dropdown-menu--open' : ''} ${phase === 'closing' ? 'dropdown-menu--closing' : ''}`}
          style={{ display: 'block' }}
        >
          <div className="dropdown-close-row">
            <button className="modal-close" onClick={closeMenu} aria-label="Close">
              ✕
            </button>
          </div>
          {children}
        </div>
      )}
    </div>
  );
}
