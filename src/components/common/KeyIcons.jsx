// Keycaps shown inside a button that a key will press. CSS hides them on
// touch-only devices (no keyboard).

// Return key: Next/Finish, or Submit once an answer is picked.
export function EnterKeyIcon() {
  return (
    <span className="key-hint" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.5 3.5v4a2 2 0 0 1-2 2H4" />
        <path d="M6.5 7L4 9.5 6.5 12" />
      </svg>
    </span>
  );
}

// Left arrow key: Previous. Sits before the label, where the ← arrow was.
export function LeftKeyIcon() {
  return (
    <span className="key-hint key-hint--leading" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.5 8H3.5" />
        <path d="M7 4.5L3.5 8 7 11.5" />
      </svg>
    </span>
  );
}
