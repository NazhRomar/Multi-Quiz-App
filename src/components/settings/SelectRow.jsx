// A setting chosen from a list: name and explanation stacked above a
// full-width select. Replaces the inline flexDirection/padding styles these
// rows used to carry.
export default function SelectRow({ title, hint, value, onChange, children }) {
  return (
    <label className="dropdown-item setting-row setting-row--select">
      <span className="dropdown-item-text">
        <strong>{title}</strong>
        {hint && <small>{hint}</small>}
      </span>
      <select className="setting-select" aria-label={title} value={value} onChange={(e) => onChange(e.target.value)}>
        {children}
      </select>
    </label>
  );
}
