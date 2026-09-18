// Turns a folder/file name into a URL-safe id: lowercase, non-alphanumerics
// collapsed to single dashes, edges trimmed. Used as the default term/subject
// id when a _meta.json doesn't override it (see src/data/catalog.js).
export function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
