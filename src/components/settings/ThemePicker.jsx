import { THEMES } from '../../utils/themes.js';

const SunIcon = () => (
  <svg className="theme-tile-icon" viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
    <circle cx="8" cy="8" r="3" />
    <path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1" />
  </svg>
);

const MoonIcon = () => (
  <svg className="theme-tile-icon" viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true">
    <path d="M13.5 9.6A5.6 5.6 0 0 1 6.4 2.5a5.6 5.6 0 1 0 7.1 7.1z" />
  </svg>
);

export const ThemeModeIcon = ({ theme }) => (theme.mode === 'dark' ? <MoonIcon /> : <SunIcon />);

export const themeSwatchStyle = (theme) => ({
  '--tile-bg': theme.swatch.bg,
  '--tile-surface': theme.swatch.surface,
  '--tile-accent': theme.swatch.accent,
});

// UI Theme picker: a grid of preview tiles (a mini page in the theme's
// background, card and accent colors) instead of a native select, which
// can't show anything but text. Sun/moon icons mark light vs dark themes.
// Lives inside a FoldSection in AppSettingsFields.
export default function ThemePicker({ value, onChange }) {
  return (
    <div className="theme-picker" role="radiogroup" aria-label="UI Theme">
      {THEMES.map((theme) => {
        const active = theme.value === value;
        return (
          <button
            key={theme.value}
            type="button"
            role="radio"
            aria-checked={active}
            className={`theme-tile ${active ? 'theme-tile--active' : ''}`}
            onClick={() => onChange(theme.value)}
            style={themeSwatchStyle(theme)}
          >
            <span className="theme-tile-preview" aria-hidden="true">
              <span className="theme-tile-card">
                <span className="theme-tile-bar" />
                <span className="theme-tile-line" />
                <span className="theme-tile-line theme-tile-line--short" />
              </span>
            </span>
            <span className="theme-tile-label">
              <ThemeModeIcon theme={theme} />
              {theme.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
