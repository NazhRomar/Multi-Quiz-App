// A return-key keycap, shown inside a button that Enter will press
// (Next/Finish, or Submit once an answer is picked). CSS hides it on
// touch-only devices (no keyboard).
export default function EnterKeyIcon() {
  return (
    <span className="enter-hint" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.5 3.5v4a2 2 0 0 1-2 2H4" />
        <path d="M6.5 7L4 9.5 6.5 12" />
      </svg>
    </span>
  );
}
