export default function Switch({ checked, onChange, id, disabled = false }) {
  return (
    <span className={`switch ${disabled ? 'switch--disabled' : ''}`}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="switch-track">
        <span className="switch-thumb"></span>
      </span>
    </span>
  );
}
