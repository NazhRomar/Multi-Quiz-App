// Study-notes viewer (/notes/:slug, NotesRoute). Each entry is
// a Markdown file in this folder, loaded lazily as raw text so the notes
// don't ride along in the main bundle. subjectId links a note to a subject
// (its _meta.json `id`) so that subject's card on Home can show a Notes
// button. A subject with several notes gets one Notes button (opening its
// first note) and a switcher in the viewer, labelled by each note's `tab`.
//
// A note can be a PDF instead (the original slides, say): `pdf` names a file
// in public/notes/ in place of `file`, and `label` is its name in the viewer's
// PDF picker. However many a subject has, they share one "PDFs" tab in the
// switcher, listed in this order. pdf.js loads only when one is opened
// (notes/pdf.js), and the file itself is fetched on first view and cached
// for offline use from then on, never precached for everyone.
//
// A note can also be an interactive page: `component` names a loader in
// `components` below, a module whose default export is the page and whose
// `headings` export feeds the viewer's Contents. It loads only when opened.
const loaders = import.meta.glob('./*.md', { query: '?raw', import: 'default' });

const components = {
  'technopreneurship-learn': () => import('./learn/technopreneurship/index.jsx'),
};

export const NOTES = [
  { slug: 'project-management', title: 'Project Management', subjectId: 'project-management', file: './project-management.md' },
  { slug: 'laravel', title: 'Laravel', tab: 'PDF', subjectId: 'laravel', file: './laravel.md' },
  { slug: 'laravel-reviewer', title: 'Laravel', tab: 'Reviewer', subjectId: 'laravel', file: './laravel-reviewer.md' },
  { slug: 'technopreneurship', title: 'Technopreneurship', tab: 'Notes', subjectId: 'technopreneurship', file: './technopreneurship.md' },
  { slug: 'technopreneurship-learn', title: 'Technopreneurship', tab: 'Learn', subjectId: 'technopreneurship', component: 'technopreneurship-learn' },
  { slug: 'technopreneurship-module-5', title: 'Technopreneurship', label: 'Module 5: Financial Planning', subjectId: 'technopreneurship', pdf: 'techno-05-financial-planning.pdf' },
  { slug: 'technopreneurship-module-6', title: 'Technopreneurship', label: 'Module 6: Production Planning and Control', subjectId: 'technopreneurship', pdf: 'techno-06-production-planning.pdf' },
  { slug: 'devnet', title: 'DevNet Associate', tab: 'DevNet', subjectId: 'sia', file: './devnet.md' },
  { slug: 'python-essentials-1', title: 'Python Essentials 1', tab: 'PE 1', subjectId: 'sia', file: './python-essentials-1.md' },
  { slug: 'python-essentials-2', title: 'Python Essentials 2', tab: 'PE 2', subjectId: 'sia', file: './python-essentials-2.md' },
];

export const findNote = (slug) => NOTES.find((n) => n.slug === slug) || null;

export const notesForSubject = (subjectId) => NOTES.filter((n) => n.subjectId === subjectId);

// The Markdown text, for a PDF note the loaded document (see loadPdf), or
// for an interactive one { Component, headings }.
export const loadNote = (note) => {
  if (note.component) return components[note.component]().then((m) => ({ Component: m.default, headings: m.headings }));
  if (note.pdf) return import('./pdf.js').then((m) => m.loadPdf(`${import.meta.env.BASE_URL}notes/${note.pdf}`));
  return loaders[note.file]();
};
