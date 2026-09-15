import { useEffect, useRef } from 'react';

// Enter shortcut for the quiz/review screens: calls `action` (or does
// nothing while it's null). The window listener reads the latest action
// through a ref. Ignored when the keypress belongs to something else:
// typing (Enter in a fill-in already submits — it mustn't also move on), a
// focused button/select/link (handles Enter natively), an open menu, a
// modifier combo, or a held-down key.
export function useEnterShortcut(action) {
  const actionRef = useRef(action);
  useEffect(() => {
    actionRef.current = action;
  });
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Enter' || e.repeat || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      if (e.target.closest?.('input, textarea, select, button, a, [role="button"], [contenteditable], .dropdown-menu')) return;
      if (!actionRef.current) return;
      e.preventDefault();
      actionRef.current();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
