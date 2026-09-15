import { useApp } from '../../state/AppContext.jsx';
import Switch from './Switch.jsx';
import { useIsMobile } from '../../utils/useIsMobile.js';
import { ANSWER_FONTS } from '../../utils/answerFonts.js';
import ThemePicker from './ThemePicker.jsx';

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

const CODE_PREVIEW ="Route::get('/user/{id}', function ($id) {\n    return view('user', ['id' => $id]);\n});";

// showNavLocation: the home-menu dropdown omits this field — only the
// quiz/review dropdowns show it — so it's opt-in, not default.
export default function AppSettingsFields({ showNavLocation = false }) {
  const { state, dispatch } = useApp();
  const { appSettings } = state;
  const set = (key, value) => dispatch({ type: 'SET_APP_SETTING', payload: { key, value } });
  const isMobile = useIsMobile();

  return (
    <>
      {/* A div, not a label: a label would forward clicks on its blank
          space to the first tile button. ThemePicker renders its own
          heading row (the fold toggle). */}
      <div className="dropdown-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 0, cursor: 'default' }}>
        <ThemePicker value={appSettings.theme} onChange={(v) => set('theme', v)} />
      </div>
      <label className="dropdown-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
        <span className="dropdown-item-text">
          <strong>Code Block Theme</strong>
          <small>Colors for code snippets in questions</small>
        </span>
        <select
          value={appSettings.codeTheme}
          onChange={(e) => set('codeTheme', e.target.value)}
          style={{ width: '100%', padding: '0.4rem', border: '1px solid var(--border)', borderRadius: '6px' }}
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
      </label>
      <label className="dropdown-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
        <span className="dropdown-item-text">
          <strong>Answer Font</strong>
          <small>Font for answer choices and typed answers</small>
        </span>
        <select
          value={appSettings.answerFont}
          onChange={(e) => set('answerFont', e.target.value)}
          style={{ width: '100%', padding: '0.4rem', border: '1px solid var(--border)', borderRadius: '6px' }}
        >
          {ANSWER_FONTS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.value === 'default' ? `Default (${appSettings.theme === 'canvas' ? 'Lato' : 'Space Mono'})` : f.label}
            </option>
          ))}
        </select>
        <div className="answer-font-preview" aria-hidden="true">
          {ANSWER_PREVIEW}
        </div>
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
