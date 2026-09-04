export default function Switch({ checked, onChange, id }) {
  return (
    <span className="switch">
      <input type="checkbox" id={id} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="switch-track">
        <span className="switch-thumb"></span>
      </span>
    </span>
  );
}
