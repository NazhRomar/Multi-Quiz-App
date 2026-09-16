import Switch from './Switch.jsx';

// One on/off setting: name, a single line of explanation, and the switch.
//
// nested marks a setting that only means anything while another one is set a
// particular way — it's indented under that parent. inert says the parent is
// currently the other way, so this row is doing nothing: it dims and stops
// responding rather than disappearing, so a setting you went looking for is
// still where you left it (with `why` explaining what would make it apply).
export default function ToggleRow({ title, hint, checked, onChange, nested = false, inert = false, why }) {
  return (
    <label
      className={`dropdown-item setting-row ${nested ? 'setting-row--nested' : ''} ${inert ? 'setting-row--inert' : ''}`}
      title={inert ? why : undefined}
    >
      <span className="dropdown-item-text">
        <strong>{title}</strong>
        {(inert && why) || hint ? <small>{(inert && why) || hint}</small> : null}
      </span>
      <Switch checked={checked} onChange={onChange} disabled={inert} />
    </label>
  );
}
