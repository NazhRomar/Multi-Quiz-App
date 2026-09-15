// App Settings → Answer Font: the font for answer text (choices, fill-in
// boxes, matching dropdowns, review answers). 'default' keeps each app
// theme's own answer font (Space Mono; Lato under Canvas). googleFont
// entries aren't in index.html's font link — they're fetched only once
// someone actually picks them (loadAnswerFont).
export const ANSWER_FONTS = [
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

const loaded = new Set();

// Applies the chosen answer font: body.custom-answer-font turns on the
// override rules in style.css, which read the --answer-font stack.
export function applyAnswerFont(value) {
  const font = ANSWER_FONTS.find((f) => f.value === value && f.stack);
  document.body.classList.toggle('custom-answer-font', !!font);
  if (!font) {
    document.body.style.removeProperty('--answer-font');
    return;
  }
  document.body.style.setProperty('--answer-font', font.stack);
  if (font.googleFont && !loaded.has(font.googleFont)) {
    loaded.add(font.googleFont);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${font.googleFont}&display=swap`;
    document.head.appendChild(link);
  }
}
