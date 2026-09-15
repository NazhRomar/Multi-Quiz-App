// Pill-shaped segmented control with a sliding thumb. options:
// [{ value, label, icon? }]; the thumb gets segmented-thumb--<value> so
// each option can have its own accent color.
export default function SegmentedToggle({ label, options, value, onChange }) {
  const activeIndex = Math.max(
    0,
    options.findIndex((o) => o.value === value)
  );
  return (
    <div className="segmented" role="radiogroup" aria-label={label} style={{ '--seg-count': options.length, '--seg-index': activeIndex }}>
      <span className={`segmented-thumb segmented-thumb--${options[activeIndex].value}`} aria-hidden="true" />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          className={`segmented-option ${o.value === value ? 'segmented-option--active' : ''}`}
          onClick={() => onChange(o.value)}
        >
          {o.icon}
          {o.label}
        </button>
      ))}
    </div>
  );
}
