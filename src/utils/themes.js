// App themes (App settings → UI theme). Each non-default theme adds
// body.theme-<value>; `family` also adds a shared base class whose rules
// the theme drives purely through CSS variables (style.css):
// - 'tinted' → body.theme-tinted: Misty Blue recolored (light).
// - 'dark'   → body.theme-dark: the shared dark-mode fixes.
// `swatch` colors only feed the picker's preview tiles and the browser /
// installed-app status bar color — the real colors live in style.css.
// The status bar takes the header's color, so the two read as one bar:
// `bar` where that differs from `surface` (what the dark themes' headers
// and Modern's use), copied from each theme's .quiz-header background.
export const THEMES = [
  { value: 'default', label: 'Misty Blue', mode: 'light', swatch: { bg: '#f0f5fb', surface: '#ffffff', accent: '#5b9bd5', bar: '#f0f7fd' } },
  { value: 'canvas', label: 'Canvas', mode: 'light', swatch: { bg: '#ffffff', surface: '#f5f5f5', accent: '#105f9a', bar: '#ffffff' } },
  { value: 'modern', label: 'Modern', mode: 'light', swatch: { bg: '#f2f3f5', surface: '#ffffff', accent: '#3b66f5' } },
  { value: 'pink', label: 'Misty Pink', mode: 'light', family: 'tinted', swatch: { bg: '#fbf1f6', surface: '#fff8fb', accent: '#d06f9f', bar: '#fdf4f9' } },
  { value: 'mint', label: 'Mint', mode: 'light', family: 'tinted', swatch: { bg: '#eff8f3', surface: '#f9fdfb', accent: '#4aa57f', bar: '#f3faf6' } },
  { value: 'peach', label: 'Peach', mode: 'light', family: 'tinted', swatch: { bg: '#fdf3ec', surface: '#fffaf6', accent: '#e0805a', bar: '#fef7f1' } },
  { value: 'lavender', label: 'Lavender', mode: 'light', family: 'tinted', swatch: { bg: '#f4f2fb', surface: '#fbfaff', accent: '#8a79d6', bar: '#f7f5fd' } },
  { value: 'sepia', label: 'Sepia', mode: 'light', family: 'tinted', swatch: { bg: '#f4ede0', surface: '#fbf6ec', accent: '#a4733f', bar: '#f7f1e5' } },
  { value: 'dark-purple', label: 'Dark Purple', mode: 'dark', family: 'dark', swatch: { bg: '#15131c', surface: '#1d1a27', accent: '#a898ea' } },
  { value: 'midnight', label: 'Midnight', mode: 'dark', family: 'dark', swatch: { bg: '#0e141c', surface: '#151e29', accent: '#6fb0e6' } },
  { value: 'forest', label: 'Forest', mode: 'dark', family: 'dark', swatch: { bg: '#10190f', surface: '#182619', accent: '#c9a856' } },
  { value: 'amber', label: 'Amber', mode: 'dark', family: 'dark', swatch: { bg: '#150e09', surface: '#1e150d', accent: '#e0983f' } },
  { value: 'graphite', label: 'Graphite', mode: 'dark', family: 'dark', swatch: { bg: '#141516', surface: '#1c1e20', accent: '#9fb0bf' } },
  { value: 'ocean', label: 'Ocean', mode: 'dark', family: 'dark', swatch: { bg: '#0a1618', surface: '#102226', accent: '#4fc3c7' } },
];

const BAR_COLOR_KEY = 'quizApp_statusBarColor';

export function applyTheme(value) {
  const theme = THEMES.find((t) => t.value === value) || THEMES[0];
  const { classList } = document.body;
  [...classList].filter((c) => c.startsWith('theme-')).forEach((c) => classList.remove(c));
  if (theme.value !== 'default') classList.add(`theme-${theme.value}`);
  if (theme.family) classList.add(`theme-${theme.family}`);
  const barColor = theme.swatch.bar ?? theme.swatch.surface;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', barColor);
  // Read back by the inline script in index.html on the next load, so the
  // status bar starts in this color instead of flashing the default first.
  try {
    localStorage.setItem(BAR_COLOR_KEY, barColor);
  } catch (e) {
    /* falls back to index.html's default */
  }
}
