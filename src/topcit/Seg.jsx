// A row of pill buttons where one (or none) is pressed: TOPCIT's count,
// pool, mode and timer pickers, and the results filter. items:
// [[value, label, disabled?]].
export default function Seg({ label, items, value, onChange }) {
  return (
    <div className="topcit-seg" role="group" aria-label={label}>
      {items.map(([v, text, disabled]) => (
        <button key={v} type="button" aria-pressed={String(v) === String(value)} disabled={disabled} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  );
}
