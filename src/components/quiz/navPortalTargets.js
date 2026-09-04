// Fixed, viewport-centered Prev/Next containers ("center" nav setting) and
// question-card-hugging containers ("sides" nav setting) are appended
// directly to document.body — not #app-root — once, for the app's whole
// lifetime, so they stay put regardless of #app-root's exit-fade transform.
// Ported verbatim from main.js's module-level setup.

function makeEl(id, className) {
  const el = document.createElement('div');
  el.id = id;
  el.className = className;
  document.body.appendChild(el);
  return el;
}

export const navSideLeft = makeEl('quiz-nav-side-left', 'nav-side nav-side-left');
export const navSideRight = makeEl('quiz-nav-side-right', 'nav-side nav-side-right');
export const navNearLeft = makeEl('quiz-nav-near-left', 'nav-side nav-near');
export const navNearRight = makeEl('quiz-nav-near-right', 'nav-side nav-near');
