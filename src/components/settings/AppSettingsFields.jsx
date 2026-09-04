import { useApp } from '../../state/AppContext.jsx';
import Switch from './Switch.jsx';
import DropdownCategory from './DropdownCategory.jsx';

const THEME_MODE_ICONS = {
  default: '☀️',
  canvas: '☀️',
  modern: '☀️',
  'dark-purple': '🌙',
};

// showNavLocation: the home-menu dropdown omits this field — only the
// quiz/review dropdowns show it — so it's opt-in, not default.
export default function AppSettingsFields({ showNavLocation = false }) {
  const { state, dispatch } = useApp();
  const { appSettings } = state;
  const set = (key, value) => dispatch({ type: 'SET_APP_SETTING', payload: { key, value } });

  return (
    <DropdownCategory title="App Settings">
      <label className="dropdown-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
        <span className="dropdown-item-text">
          <strong>UI Theme</strong>
          <small>Switch app appearance</small>
        </span>
        <select
          value={appSettings.theme}
          onChange={(e) => set('theme', e.target.value)}
          style={{ width: '100%', padding: '0.4rem', border: '1px solid var(--border)', borderRadius: '6px' }}
        >
          <option value="default">{THEME_MODE_ICONS.default} Misty Blue</option>
          <option value="canvas">{THEME_MODE_ICONS.canvas} Canvas</option>
          <option value="modern">{THEME_MODE_ICONS.modern} Modern</option>
          <option value="dark-purple">{THEME_MODE_ICONS['dark-purple']} Dark Purple</option>
        </select>
      </label>
      {showNavLocation && (
        <label className="dropdown-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
          <span className="dropdown-item-text">
            <strong>Navigation Position</strong>
            <small>Where to place Prev/Next</small>
          </span>
          <select
            value={appSettings.navLocation}
            onChange={(e) => set('navLocation', e.target.value)}
            style={{ width: '100%', padding: '0.4rem', border: '1px solid var(--border)', borderRadius: '6px' }}
          >
            <option value="up">Top</option>
            <option value="down">Bottom</option>
            <option value="sides">Sides</option>
            <option value="center">Centered</option>
            <option value="both">Top and Bottom</option>
            <option value="all">All</option>
          </select>
        </label>
      )}
      <label className="dropdown-item">
        <span className="dropdown-item-text">
          <strong>Disable animations</strong>
          <small>Turn off all transitions and fades</small>
        </span>
        <Switch checked={appSettings.disableAnimations} onChange={(v) => set('disableAnimations', v)} />
      </label>
      <label className="dropdown-item">
        <span className="dropdown-item-text">
          <strong>Compact mode</strong>
          <small>Tighter spacing, less scrolling</small>
        </span>
        <Switch checked={appSettings.compactMode} onChange={(v) => set('compactMode', v)} />
      </label>
    </DropdownCategory>
  );
}
