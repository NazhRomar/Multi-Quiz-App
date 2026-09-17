# Multi Quiz App

A study app for my own coursework: the quizzes and reviewers for each subject, in one
place, as an installable offline PWA. 16 quizzes / 679 questions across 4 subjects today,
all bundled at build time — there is no backend, no account and no network call once the
app has loaded.

Built with React 19 + Vite. State lives in one reducer; everything that should outlive a
visit goes to `localStorage`.

## Running it

```bash
npm install
npm run dev
```

`npm run build` writes `dist/` (and generates the service worker); `npm run preview`
serves that build. Agents working in this repo should start the dev server through
`preview_start` with the **`multi-quiz-app`** config from `.claude/launch.json`, not by
running `npm run dev` in a shell.

## Adding a quiz

**Read [`prompt.md`](prompt.md) first — it is the spec for this, and it is detailed.**
Quiz JSON is hand-checked content, not just data entry: the answer keys on the sites and
handouts these come from are wrong often enough that the ingestion process is built
around verifying every answer (running the code where there is code) rather than
transcribing it.

The short version of the mechanics:

- A quiz is one JSON file under `src/data/<Term>/<Subject>/`. **The folder path is the
  taxonomy** — path segment 2 becomes the term heading, segment 3 the subject heading.
- Files are auto-discovered by `import.meta.glob` in `src/data/catalog.js`. There is no
  index or manifest to update.
- `quizTitle` drives sub-grouping: quizzes sharing a `"<Series> - <Item>"` prefix collapse
  into one card, but only once two of them share it. Reuse an existing prefix
  character-for-character.
- Six question types: `mc`, `tf`, `msq`, `fitb` (including multi-blank code fill-ins),
  `matching`, `drag-drop`.
- Three top-level badge flags show on the menu entry: `"fromCanvas": true` (graduation cap
  — the source material came off Canvas), `"unofficial": true` (flask — a quiz assembled
  from the course material rather than handed out by the course) and `"unverified": true`
  (warning triangle — answers AI-filled, never hand-checked). They are independent, and a
  quiz can carry any combination. The home menu explains all three in a legend: a sticky
  rail in the right-hand gutter from 1320px up, and a fold-away summary below that.

## How it fits together

```
src/
  App.jsx              screen switch: menu | quiz | review | result
  state/
    store.js           the reducer, defaults, and localStorage load/save
    AppContext.jsx     provider + the persistence effects
    grading.js         all correctness and scoring logic, in one place
  data/
    catalog.js         quiz discovery, grouping, Multi quiz assembly
    <Term>/<Subject>/  the quiz JSON
  components/
    menu/ quiz/ review/ result/ settings/ common/
  style.css            every style, including all 8 themes
```

`grading.js` is the file to be careful with — correctness, partial credit for
matching/drag-drop/multi-blank, and the three multiple-select scoring modes all live
there, and a bug in it silently produces a wrong score rather than an error.

## Things worth knowing

**Two axes on the home menu.** Single/Multi picks whether tapping a quiz opens it or
selects it, and Quiz/Review picks which mode it opens in. Multi combines any selection of
quizzes — across subjects and terms — into one session, renumbering question ids and
tagging each question with where it came from.

**Quiz vs Review.** Quiz mode grades you. Review mode is the answer key, either cold from
the menu or graded against the attempt you just made.

**Attempts survive a reload.** The in-progress attempt is saved to `localStorage`, split
across two keys because the questions and the answers change at very different rates.
Reloading mid-quiz drops you back into it; leaving via Exit lands on the menu with a
Resume card. One slot — starting another quiz replaces it.

**Everything is a setting.** Shuffling, partial-credit rules, instant submit, blur-before-
you-answer, keyboard hints, nav button placement, 8 themes, separate code-block themes
and fonts. Defaults are in `store.js`.

**Shuffled matching pools are deliberate.** Matching and drag-drop answer pools are
always shuffled, with or without "Shuffle choices" — authored order lines up 1:1 with the
rows and hands over the answers.

**Tapping the "Last updated" footer** opens a hidden fixture quiz covering every question
type, including `drag-drop` (no real quiz uses that type, so it is the only way to
exercise it).

## Deployment

Pushing to `main` deploys to GitHub Pages via `.github/workflows/deploy.yml`.
`netlify.toml` and the `@vercel/analytics` component are both present so the same build
works on those hosts; the analytics script only resolves on a Vercel deployment and is
inert elsewhere.

## Also in here

`tools/quiz-harvester-extension/` — an unpacked Chrome extension that captures questions
off a quiz site into a `quiz-capture-*.json` file for ingestion. Its output is an
*unverified* starting point, with a `confidence` field per question saying how the guess
was arrived at; `prompt.md` covers how much to trust each level (short answer: not much).

## Known gaps

- Quiz JSON is bundled into the main chunk, so the JS bundle is ~560 kB. Code-splitting it
  needs a build-time manifest, because the menu needs question counts and reading length
  before opening anything (`chunkSizeWarningLimit` in `vite.config.js` is raised to hide
  the warning meanwhile).
- No tests. `grading.js` is pure and self-contained and is the obvious first target.
- Searching question text (not just titles) was built in `cd3814a` and reverted;
  `git cherry-pick cd3814a` restores it as a starting point.
- `style.css` is one ~4,400-line file.
