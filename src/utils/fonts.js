// Font settings (App Settings → App Font / Answer Font), sharing one list:
// - App Font: the whole interface. 'default' keeps the design's own mix
//   (Nunito text + Space Mono labels; Lato under Canvas). Code snippets
//   always keep their code font.
// - Answer Font: answer text (choices, fill-in boxes, matching dropdowns,
//   review answers). 'default' keeps each theme's answer font — Space
//   Mono, or the App Font if one is set. When both are set, answers use
//   the Answer Font.
// googleFont entries aren't in index.html's font link — they're fetched
// only once someone actually picks them.
export const FONTS = [
  { value: 'default', label: 'Default' },
  { value: 'nunito', label: 'Nunito', stack: "'Nunito', sans-serif" },
  { value: 'atkinson', label: 'Atkinson Hyperlegible', stack: "'Atkinson Hyperlegible', Verdana, sans-serif", googleFont: 'Atkinson+Hyperlegible:wght@400;700' },
  { value: 'arial', label: 'Arial', stack: 'Arial, Helvetica, sans-serif' },
  { value: 'verdana', label: 'Verdana', stack: 'Verdana, Geneva, sans-serif' },
  { value: 'georgia', label: 'Georgia', stack: 'Georgia, serif' },
  { value: 'times', label: 'Times New Roman', stack: "'Times New Roman', Times, serif" },
  { value: 'courier', label: 'Courier New', stack: "'Courier New', Courier, monospace" },
  { value: 'consolas', label: 'Consolas', stack: "Consolas, Menlo, 'DejaVu Sans Mono', monospace" },
  { value: 'jetbrains', label: 'JetBrains Mono', stack: "'JetBrains Mono', Consolas, monospace", googleFont: 'JetBrains+Mono:wght@400;700' },
];

export function fontLabel(value, fallback) {
  const font = FONTS.find((f) => f.value === value && f.stack);
  return font ? font.label : fallback;
}

const loaded = new Set();

// body.custom-<kind>-font turns on that setting's override rules in
// style.css, which read the --<kind>-font stack.
function applyFont(kind, value) {
  const font = FONTS.find((f) => f.value === value && f.stack);
  document.body.classList.toggle(`custom-${kind}-font`, !!font);
  if (!font) {
    document.body.style.removeProperty(`--${kind}-font`);
    return;
  }
  document.body.style.setProperty(`--${kind}-font`, font.stack);
  if (font.googleFont && !loaded.has(font.googleFont)) {
    loaded.add(font.googleFont);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${font.googleFont}&display=swap`;
    document.head.appendChild(link);
  }
}

export function applyFonts(appFont, answerFont) {
  applyFont('app', appFont);
  applyFont('answer', answerFont);
}
