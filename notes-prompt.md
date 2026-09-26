# Notes Conversion Prompt

Instructions for a Claude Code session asked to turn source documents (slide decks, PDFs, handouts, syllabi, pasted text) into a study note for this app's notes viewer.

The original ask, which everything below elaborates on: *convert these documents into something digestible to read, and don't remove any important info.* Both halves matter. "Digestible" means easier to read than the source. "Don't remove important info" means nothing a student could be tested on or graded on gets dropped.

## 1. Get the source content

- **PDFs / images / slide screenshots:** Read every file in the set before writing anything. Slides often split one topic across several pages, and a later slide may qualify or correct an earlier one. Read charts, tables, diagrams and speaker-notes text too, not just the headline text.
- **Pasted text or Word content:** Use as given, but watch for transcription damage (dropped characters, garbled punctuation, broken tables).
- **Several documents at once:** Each is normally one module of the same subject. Keep them in the order the course uses (module numbers, week numbers), not the order they were attached. If two documents cover the same module (e.g. a lecture deck and a deliverable brief), merge them into one module and keep both sets of content.
- If a slide or page can't be read (blurry, cut off), say so in chat and mark the gap in the note. Never guess at missing numbers, dates, names or formulas.

## 2. Convert, don't summarize

The job is restructuring for readability, not shortening for its own sake.

**Must keep (never drop):**
- Every definition, formula, framework, step list, and named term.
- Every number, date, weight, percentage, threshold, and grading rule.
- Every table, with all of its rows and columns.
- Worked examples, cases, and exercises, including the data needed to follow them.
- Requirements, rubrics, deliverable checklists and submission rules.
- Sources or citations the slides give (e.g. "PMBOK Guide, 5th Edition, p. 32").

**Fine to cut or compress:**
- Slide chrome: repeated headers/footers, logos, slide numbers, "Thank you", agenda slides that only repeat the headings.
- Filler phrasing, and restating the same point across slides.
- Decorative imagery with no information. If an image carries content (a diagram, a matrix, a chart), convert it to a table, list or short description instead of dropping it.

**Make it digestible:**
- Turn paragraphs of slide text into short lists, and comparisons into tables.
- Lead with the point. Bold the term being defined, then a colon, then the definition: `**Stakeholder:** anyone who may affect or be affected by the project.`
- Keep the source's terminology and abbreviations exactly, so the notes match what the instructor says and what quizzes ask.
- Don't add outside knowledge as if it came from the source. If a short clarification genuinely helps, keep it clearly separate and brief.
- If the source itself looks wrong (contradicts another slide, bad arithmetic), keep what it says, and flag the problem in chat rather than silently fixing it.

## 3. Format

Notes are plain Markdown rendered by `src/utils/markdown.jsx`, which supports only: headings, paragraphs, bullet/numbered/task lists, tables, blockquotes, fenced code, rules, and inline **bold**, *italic*, `code` and links. No raw HTML, images or footnotes. Check that file if this list seems out of date.

Match the structure of the existing note (`src/notes/project-management.md`):

- **One `#` heading for the note title** as the first line (`# IT Project Management (FELEC P): Study Notes`). The viewer drops it from the body, since the header already shows the note's name.
- **One `#` heading per module/document** (`# Module 3: Stakeholder Management & RTM`), in course order. Sub-modules use the source's own label (e.g. `Module 5a`).
- **`##` for the sections within a module.** The contents sidebar lists only `#` and `##` headings, so make `##` titles short and scannable. Use `###` and below for detail that shouldn't clutter the sidebar.
- **Tables** for grading, comparisons, matrices, rubrics, salary/threshold data, anything with rows and columns.
- **Blockquotes** (`> **Key line:** ...`) for the one or two rules per module a student must not forget, such as a golden rule or a grading emphasis. Use them sparingly.
- **Task lists** (`- [ ] ...`) for self-check or submission checklists. They can be ticked in the viewer for the current visit only, and nothing is saved.
- **Fenced code** for anything that is literally code, or a fixed-width diagram like a WBS tree.
- **Style:** don't use em dashes. Write numeric ranges as words ("Weeks 4 to 8", "84 to 91%"). Keep sentences short.
- Keep the wording plain enough to read on a phone. Wide tables scroll sideways, but prefer fewer columns where the content allows.

## 4. Where to save it and register it

- Notes live in `src/notes/<subject-slug>.md`, one file per subject, with all of that subject's modules in it. The file is a living document: modules arrive week by week, so the usual job is **updating the existing file**, not creating one.
  - Read the whole existing note first, so new content matches its structure, heading style and terminology.
  - A new module is appended as a new `#` section in course order (or slotted in order if it belongs between existing ones). Don't create a second file for a subject.
  - If the new documents extend a module that already exists (e.g. a deliverable brief for Module 5), add them under that module, using the source's own sub-label like `Module 5a` when it has one.
  - Leave untouched modules exactly as they are. Only edit earlier content if the new source corrects or supersedes it, and say so in chat when you do.
  - Nothing else needs updating: no index, no `NOTES` entry, no route. The contents sidebar rebuilds itself from the headings on every load.
- Register a **brand-new** note (first time a subject gets one) by adding an entry to the `NOTES` array in `src/notes/index.js`: `{ slug, title, subjectId, file }`.
  - `slug` is the URL segment (`/notes/:slug`).
  - `subjectId` must equal the `"id"` in that subject's `_meta.json` under `src/data/`, so the Notes button shows on that subject's card on Home.
  - `file` is `./<subject-slug>.md`.
- Files are loaded by `import.meta.glob('./*.md', ...)`, so no other wiring is needed. Re-check `src/notes/index.js` if this ever seems not to hold.
- **If it's unclear which subject the documents belong to, or whether they extend an existing note or need a new one, ask rather than guessing.**

## 5. Before calling it done

- Reread the finished note against the source and confirm nothing from the "Must keep" list went missing. Count tables, examples and checklists per module in the source versus the note.
- Confirm every table has a header separator row and the same number of cells per row, since the renderer will not repair broken tables.
- Confirm the file renders without errors (a quick dev-server check of `/notes/<slug>` is enough), only if it's cheap to do. Don't spend long on it.

## 6. Report back in chat

Keep it short: which modules were added or changed (and whether any pre-existing content was edited), anything you couldn't read or had to leave a gap for, and any place where the source looked wrong or contradicted itself. Don't paste the note back into chat.
