import { useApp } from '../../state/AppContext.jsx';
import Switch from './Switch.jsx';
import { useIsMobile } from '../../utils/useIsMobile.js';
import { FONTS, fontLabel } from '../../utils/fonts.js';
import { THEMES } from '../../utils/themes.js';
import ThemePicker, { ThemeModeIcon, themeSwatchStyle } from './ThemePicker.jsx';
import FoldSection from './FoldSection.jsx';

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
// showSearchOrder: the reverse — home-menu only (it's about home search).
export default function AppSettingsFields({ showNavLocation = false, showSearchOrder = false }) {
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
      <FoldSection
        title="UI Theme"
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
        title="Code Block Theme"
        summary={(CODE_THEMES.find((t) => t.value === appSettings.codeTheme) || CODE_THEMES[0]).label}
        badge={
          <span className="q-context q-context--code code-theme-badge">
            <span className="q-context-body">{'</>'}</span>
          </span>
        }
      >
        <select
          className="fold-select"
          aria-label="Code Block Theme"
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
      <FoldSection title="App Font" summary={fontLabel(appSettings.appFont, `Default (${appFontDefault})`)} badge={<span className="app-font-sample">Aa</span>}>
        <select className="fold-select" aria-label="App Font" value={appSettings.appFont} onChange={(e) => set('appFont', e.target.value)}>
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
        title="Answer Font"
        summary={fontLabel(appSettings.answerFont, `Default (${answerFontDefault})`)}
        badge={<span className="answer-font-sample">@</span>}
      >
        <select className="fold-select" aria-label="Answer Font" value={appSettings.answerFont} onChange={(e) => set('answerFont', e.target.value)}>
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
            {!isMobile && (
              <>
                <option value="sides">Sides</option>
                <option value="center">Centered</option>
                <option value="both">Top and Bottom</option>
                <option value="all">All</option>
              </>
            )}
          </select>
        </label>
      )}
      {showSearchOrder && (
        <label className="dropdown-item">
          <span className="dropdown-item-text">
            <strong>Question matches first</strong>
            <small>When searching, show matching questions above matching quizzes</small>
          </span>
          <Switch checked={appSettings.searchQuestionsFirst} onChange={(v) => set('searchQuestionsFirst', v)} />
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
    </>
  );
}
