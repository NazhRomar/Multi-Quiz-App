// Study-notes viewer (/notes/:slug, NotesRoute). Each entry is
// a Markdown file in this folder, loaded lazily as raw text so the notes
// don't ride along in the main bundle. subjectId links a note to a subject
// (its _meta.json `id`) so that subject's card on Home can show a Notes
// button.
const loaders = import.meta.glob('./*.md', { query: '?raw', import: 'default' });

export const NOTES = [
  { slug: 'project-management', title: 'Project Management', subjectId: 'project-management', file: './project-management.md' },
  { slug: 'laravel', title: 'Laravel', subjectId: 'laravel', file: './laravel.md' },
];

export const findNote = (slug) => NOTES.find((n) => n.slug === slug) || null;

export const notesForSubject = (subjectId) => NOTES.filter((n) => n.subjectId === subjectId);

export const loadNote = (note) => loaders[note.file]();
