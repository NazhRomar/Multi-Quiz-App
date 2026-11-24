import { useEffect, useState } from 'react';

// A whole-number box with its unit beside it (the custom question count and
// time limit). What is typed is kept as typed, so the box can be cleared and
// retyped; a usable number (within min..max) is saved as you type, and
// leaving the box snaps it back to the saved value.
export default function NumberField({ label, unit, min, max, value, onChange }) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => setDraft(String(value)), [value]);

  const type = (text) => {
    setDraft(text);
    const n = Math.floor(Number(text));
    if (text.trim() !== '' && Number.isFinite(n) && n >= min) onChange(Math.min(n, max));
  };

  return (
    <label className="topcit-number">
      <input
        className="topcit-num"
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={draft}
        onChange={(e) => type(e.target.value)}
        onBlur={() => setDraft(String(value))}
        aria-label={label}
      />
      <span>{unit}</span>
    </label>
  );
}
