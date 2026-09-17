import { useApp } from '../../state/AppContext.jsx';
import { useIsMobile } from '../../utils/useIsMobile.js';
import { FONTS, fontLabel } from '../../utils/fonts.js';
import { THEMES } from '../../utils/themes.js';
import ThemePicker, { ThemeModeIcon, themeSwatchStyle } from './ThemePicker.jsx';
import FoldSection from './FoldSection.jsx';
import SettingsGroup from './SettingsGroup.jsx';
import ToggleRow from './ToggleRow.jsx';
import SelectRow from './SelectRow.jsx';

// Code block themes (colors live in style.css under body.code-theme-<value>).
// 'default' adds no class, so code blocks follow the app theme.
export const CODE_THEMES = [
  { value: 'default', label: 'Default (match app theme)' },
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'monokai', label: 'Monokai' },
  { value: 'dracula', label: 'Dracula' },
  { value: 'nord', label: 'Nord' },
  { value: 'solarized', label: 'Solarized Light' },
  { value: 'terminal', label: 'Terminal' },
  { value: 'amber', label: 'Midnight Amber' },
];

// Shows off the characters that are easy to misread in some fonts.
const ANSWER_PREVIEW = '@csrf · {{ $name }} · 0O 1lI';

const APP_FONT_PREVIEW = 'Who created the Laravel framework? · Score: 12';

const CODE_PREVIEW ="Route::get('/user/{id}', function ($id) {\n    return view('user', ['id' => $id]);\n});";

// showNavLocation: the home-menu dropdown omits this field — only the
// quiz/review dropdowns show it — so it's opt-in, not default.
export default function AppSettingsFields({ showNavLocation = false }) {
  const { state, dispatch } = useApp();
  const { appSettings } = state;
  const set = (key, value) => dispatch({ type: 'SET_APP_SETTING', payload: { key, value } });
  const isMobile = useIsMobile();
  const currentTheme = THEMES.find((t) => t.value === appSettings.theme) || THEMES[0];
  const isCanvas = appSettings.theme === 'canvas';
  const appFontDefault = isCanvas ? 'Lato' : 'Nunito + Space Mono';
  // Answers fall back to the App Font when one is set (style.css).
  const answerFontDefault = fontLabel(appSettings.appFont, null) ? 'same as App Font' : isCanvas ? 'Lato' : 'Space Mono';

  return (
    <>
      <SettingsGroup label="Appearance">
        <FoldSection
          title="UI theme"
          summary={
            <span className="theme-picker-current">
              <ThemeModeIcon theme={currentTheme} />
              {currentTheme.label}
            </span>
          }
          badge={<span className="theme-picker-swatch" style={themeSwatchStyle(currentTheme)} />}
        >
          <ThemePicker value={appSettings.theme} onChange={(v) => set('theme', v)} />
        </FoldSection>
        <FoldSection
          title="Code block theme"
          summary={(CODE_THEMES.find((t) => t.value === appSettings.codeTheme) || CODE_THEMES[0]).label}
          badge={
            <span className="q-context q-context--code code-theme-badge">
              <span className="q-context-body">{'</>'}</span>
            </span>
          }
        >
          <select
            className="fold-select"
            aria-label="Code block theme"
            value={appSettings.codeTheme}
            onChange={(e) => set('codeTheme', e.target.value)}
          >
            {CODE_THEMES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <div className="q-context q-context--code code-theme-preview" aria-hidden="true">
            <div className="q-context-body">
              <pre>{CODE_PREVIEW}</pre>
            </div>
          </div>
        </FoldSection>
        <ToggleRow
          title="Wrap code lines"
          hint="Off: scroll sideways, keeps indentation intact. On: wraps to fit the screen."
          checked={appSettings.codeWrap}
          onChange={(v) => set('codeWrap', v)}
        />
        <FoldSection title="App font" summary={fontLabel(appSettings.appFont, `Default (${appFontDefault})`)} badge={<span className="app-font-sample">Aa</span>}>
          <select className="fold-select" aria-label="App font" value={appSettings.appFont} onChange={(e) => set('appFont', e.target.value)}>
            {FONTS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.value === 'default' ? `Default (${appFontDefault})` : f.label}
              </option>
            ))}
          </select>
          <div className="app-font-preview" aria-hidden="true">
            {APP_FONT_PREVIEW}
          </div>
          <small className="fold-note">Changes all text except code snippets.</small>
        </FoldSection>
        <FoldSection
          title="Answer font"
          summary={fontLabel(appSettings.answerFont, `Default (${answerFontDefault})`)}
          badge={<span className="answer-font-sample">@</span>}
        >
          <select className="fold-select" aria-label="Answer font" value={appSettings.answerFont} onChange={(e) => set('answerFont', e.target.value)}>
            {FONTS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.value === 'default' ? `Default (${answerFontDefault})` : f.label}
              </option>
            ))}
          </select>
          <div className="answer-font-preview" aria-hidden="true">
            {ANSWER_PREVIEW}
          </div>
        </FoldSection>
      </SettingsGroup>

      <SettingsGroup label="Layout and motion">
        {showNavLocation && (
          <SelectRow
            title="Navigation position"
            hint="Where the Previous / Next buttons sit"
            value={appSettings.navLocation}
            onChange={(v) => set('navLocation', v)}
          >
            <option value="up">Top</option>
            <option value="down">Bottom</option>
            {!isMobile && (
              <>
                <option value="sides">Sides</option>
                <option value="center">Centered</option>
                <option value="both">Top and bottom</option>
                <option value="all">All</option>
              </>
            )}
          </SelectRow>
        )}
        <ToggleRow
          title="Compact mode"
          hint="Tighter spacing, less scrolling"
          checked={appSettings.compactMode}
          onChange={(v) => set('compactMode', v)}
        />
        <ToggleRow
          title="Disable animations"
          hint="Turn off all transitions and fades"
          checked={appSettings.disableAnimations}
          onChange={(v) => set('disableAnimations', v)}
        />
      </SettingsGroup>
    </>
  );
}
