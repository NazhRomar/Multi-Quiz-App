// A labelled run of settings inside a dropdown tab. The tabs used to be one
// flat list of a dozen-plus rows; these headings are what make a tab
// skimmable — you look for the group, not the row.
export default function SettingsGroup({ label, children }) {
  return (
    <div className="settings-group">
      <div className="settings-group-label">{label}</div>
      {children}
    </div>
  );
}
