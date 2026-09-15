import { useEffect, useRef } from 'react';

// Keyboard shortcuts for the quiz/review screens. Each hook calls its
// action (or does nothing while it's null); the window listener reads the
// latest action through a ref. Keypresses that belong to something else
// are ignored: typing in a text field, an open menu, modifier combos, and
// held-down (repeating) keys. Answer checkboxes/radios don't count as
// "typing" — clicking an option leaves focus on its input, and the
// shortcuts should keep working right after.
const TYPING = 'textarea, select, [contenteditable], input:not([type="radio"]):not([type="checkbox"]), .dropdown-menu';

function useKeyShortcut(matches, action, extraIgnore) {
  const actionRef = useRef(action);
  useEffect(() => {
    actionRef.current = action;
  });
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.repeat || e.altKey || e.ctrlKey || e.metaKey) return;
      const arg = matches(e);
      if (arg === undefined) return;
      if (e.target.closest?.(TYPING)) return;
      if (extraIgnore && e.target.closest?.(extraIgnore)) return;
      if (!actionRef.current) return;
      e.preventDefault();
      actionRef.current(arg);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}

// Enter (no Shift). A focused button or link handles Enter itself, so
// those are left alone (Enter in a fill-in box already submits — it's a
// text field, so ignored too, and mustn't also move on).
export function useEnterShortcut(action) {
  useKeyShortcut((e) => (e.key === 'Enter' && !e.shiftKey ? true : undefined), action, 'button, a, [role="button"]');
}

// Number keys 1–9 → option index 0–8, and 0 → index 9 (the 10th option).
export function useChoiceKeys(action) {
  useKeyShortcut((e) => (/^[0-9]$/.test(e.key) ? (e.key === '0' ? 9 : Number(e.key) - 1) : undefined), action);
}

// The keycap label for an option index (the inverse of the above), or null
// past the 10th option.
export function choiceKeyLabel(index) {
  if (index > 9) return null;
  return index === 9 ? '0' : String(index + 1);
}
