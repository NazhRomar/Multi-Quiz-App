# Quiz Ingestion Prompt

Instructions for a Claude Code session asked to add a quiz to this app from source material — attached images, a pasted document/text, or a website URL.

## 1. Get the source content

**If images are attached:** Read them directly (Claude is multimodal — no OCR tool needed). Read every image in the set before writing anything; a multi-page quiz is often split across several screenshots.

**If a website URL is given:** Do not scrape via a plain text dump alone (`get_page_text`/similar strips away the signal you need). Go through the DOM:
- Use a JS-execution tool (e.g. `javascript_tool`) to query the page's actual markup — headers, option lists, and whatever inline style/class the site uses to mark the correct answer (e.g. `color: #ff0000`, a `.correct` class, a checkmark icon). Inspect a raw `innerHTML` sample first to find the marker before assuming one.
- Pull code blocks from `<pre>`/`<code>` elements' `innerHTML` directly, not from the rendered text — text extraction frequently mangles source code (lost whitespace, stripped double-underscores from `__init__`-style names caught by naive Markdown-bold parsing, etc.).
- If the site paginates or lazy-loads content, make sure you've captured every question before proceeding.

**If it's pasted text/PDF/Word content:** Use it as given, but stay alert for the same kinds of transcription damage (dropped underscores, garbled punctuation, mismatched option counts) described below.

**If a `quiz-capture-*.json` file is given** (exported from the Quiz Harvester Chrome extension in `tools/quiz-harvester-extension/`): this is a raw, unverified capture — read it as data, not as an answer key. Each entry has a `confidence` field (`site-marked`, `user-marked`, `unresolved`, `ambiguous`) describing *how* the extension arrived at a candidate answer, not whether it's actually correct:
- `site-marked` — the extension found a color/class/checked-state marker on the page. Still just a heuristic guess at what the site's marker means.
- `user-marked` — you clicked an option yourself in the review panel while looking at the page. More trustworthy than a scraped marker, but still your own live judgment call under time pressure — not exempt from verification.
- `unresolved` / `ambiguous` — no marker was found, or conflicting ones were; treat `correctIndexes` as empty/unreliable and figure out the real answer yourself (run the code, check the fact) rather than picking one arbitrarily.

Every question in the file still goes through the full verification pass in step 2 below, regardless of `confidence` — this field only tells you how much you already know *not* to trust it going in. `codeContext` is captured from the page's raw `outerHTML` (not flattened text), but re-check it for oddities the same way you would DOM-sourced code from a live site.

Each entry also carries a `questionNumber` when the extension could detect one (from on-page text like "Question 5" or a data attribute) — it's `null` when it couldn't. Some question banks serve questions in a randomized/shuffled order across pages or attempts, so `questionNumber` (when present) is a better ordering key for the final `"id"` sequence than capture order — but don't invent numbers for entries where it's `null`; just slot those in wherever they make sense and renumber `id` sequentially in the final output regardless (the app doesn't care about gaps, but `id` should still just count 1..N).

## 2. Verify, don't just transcribe

Source material — especially third-party exam-answer sites — is frequently wrong or corrupted. Before trusting a marked "correct" answer:
- If the question involves runnable code, actually run it (e.g. via the `Bash` tool) rather than reasoning about it silently. Confirm the marked answer matches real output.
- If it doesn't match, or the code as given doesn't run (undefined names, missing definitions, stray typos, mismatched case), reconstruct the most plausible *intended* version of the question, verify that version runs and produces one of the listed options, and use that as the correct answer.
- Fix obvious transcription damage before it goes in the JSON: restore dunder methods (`def_init_` → `def __init__`), fix stray typos (`perint` → `print`, `pitcures` → `pictures`), repair broken literals (`2. 3` → `2, 3`), etc.
- Every time you correct something the source got wrong, say so in that question's `"explanation"` field — note what was wrong and that you verified the fix by running it. Don't silently diverge from the source.
- For pure recall/definitional questions (no code to run), rely on your own knowledge of the subject to confirm the marked answer is actually correct.

### Screenshots specifically — the marked answer may be the user's own (wrong) guess

When the source is a screenshot the user took themselves (e.g. of an exam, a study app, or their own notes), a circled/highlighted/selected option there isn't a verified answer key — it may just be what the user picked, and it can be wrong. Apply the same verification as above (run the code, check the fact) regardless of who did the marking.

If what's marked in the screenshot turns out to be incorrect:
- Put the actually-correct answer in the JSON, with the usual `"explanation"` noting what was marked vs. what's actually right.
- Also say so directly in your chat reply to the user — don't just fix it silently in the file and move on. Give a short, clear explanation and state the correct choice by name, e.g.: "Question 4 was marked as `a`, but that's incorrect — `errno.EEXIST` means 'File exists', so the right answer is `d`. [one-sentence reason]." Keep it brief: one or two sentences per corrected question, not a full re-derivation.

## 3. Output schema

Match the structure already used throughout `src/data/**/*.json` (see any existing file there for a live example). Top level:

```json
{
  "quizTitle": "STRING — e.g. 'Module 3'",
  "badges": { "unofficial": true },
  "questions": [ ... ]
}
```

`"badges"` is optional and only needs the keys that *differ* from what the quiz already inherits — see "Badges" below. A quiz that inherits everything it needs omits `"badges"` entirely.

### Badges

Four optional flags, each independently `true`/absent, live inside the `"badges"` object. Each key resolves independently: a quiz's own `"badges"` wins if it sets that key; otherwise it falls back to its Series folder's `_meta.json` default, then its Section's, then its Subject's (see "Where to save it" below) — so only set a key here when this quiz needs to *differ* from what its folder already defaults to.

Each badge's hover tooltip (the `title` attribute, from the `*_TITLE` constants in `src/components/menu/QuizBadges.jsx`) is deliberately just the short badge name now (e.g. "Verified", "Unofficial") — the full explanation lives instead in that badge's `blurb` line in the `ITEMS` array of `src/components/menu/BadgeLegend.jsx`, shown in the on-page "What do the icons mean?" legend. Update both files together if you ever change what a badge means.

- `"unverified": true` puts a warning-triangle icon next to the quiz on the home menu; the legend blurb says the answers were AI-filled and never checked by hand. Set it when you ingested a quiz you couldn't fully verify; drop it once the answers have been confirmed.
- `"verified": true` puts a blue tick next to the quiz on the home menu, styled like a social-network verified badge; the legend blurb reads "From CCNA/ITExamAnswers/InfraExam." It is a statement about **provenance** — the questions came from one of those sites — not about whether the answer key has been checked. That makes it independent of `unverified` rather than its opposite, and a quiz can legitimately carry both: sourced from itexam, answers not yet hand-checked. It sits first, before the mask, so it reads as part of the quiz name.
- `"unofficial": true` puts a flask icon next to the quiz on the home menu; the legend blurb says the questions were written here, not given by the course. Set it on anything you authored — a comprehensive/master quiz built from slides, notes or a study plan (e.g. `General/General/06-laravel-comprehensive.json`) — and leave it off for quizzes transcribed from a real module quiz, exam or reviewer, however much you had to correct them. It is independent of `unverified`: a quiz you wrote *and* haven't hand-checked carries both badges, rendered side by side.
- `"unethicallySourced": true` puts a mask icon next to the quiz on the home menu — the codename for a quiz whose questions were lifted from a sitting of the real thing (a capture off a quiz site, a screenshot of someone's attempt) rather than from material the course handed out. It is about where the questions came from rather than who wrote them, and in practice it rules `unofficial` out: the questions really are the course's, they just were not given to you. Its tooltip stays `???`, and the legend entry is deliberately unhelpful in spirit (currently a cheeky song-reference blurb) rather than a plain explanation — the flag name is the codename, and the badge isn't meant to explain itself straightforwardly on screen. Keep that spirit if you touch it.
- `"flagged": true` (on a single question, not a top-level badge) takes that question out of scoring entirely — it shows "Not Scored" instead of its points and is skipped by the score, the totals and the unanswered count. This is the escape hatch for a question the source got so wrong that no listed option can be correct (see `NetAcad/Python Essentials 1/05-final-exam.json` question 1: the real output has 9 elements and every choice has 8). Pair it with `"correctAnswer": null` and an `"explanation"` that says what's broken and that it's worth reporting to the instructor. Don't use it to dodge a question you merely found hard to verify.

### `quizTitle` and item labels

A quiz's Section/Series (see "Where to save it" below) is decided entirely by which folder it's in — there's no `"section"`/`"series"` field on the quiz itself. `quizTitle` still matters for display: within a Series card, if *every* quiz sitting in that folder shares the exact same `"<Prefix> - "` prefix, the prefix is stripped and only the remainder is shown as that quiz's chip label (e.g. every `"Python Essentials 2 - Module N"` title in the `Python Essentials 2` series folder shows just "Module N" as its chip label); otherwise each quiz's full title is used as-is.

So: to add a new item to an existing series, either match its siblings' exact shared prefix, character-for-character, or just give the quiz a title that stands on its own — both work, they only change whether the chip label gets shortened. **If it's unclear whether a new quiz's title should match its siblings' prefix — stop and ask the user rather than guessing**; getting it wrong doesn't break anything structurally, but it does change every sibling's chip label the moment titles stop matching.

Every question has `id` (sequential integer from 1), `type`, `text`, `options`/type-specific fields, `correctAnswer`, `points`, `explanation`. Add `"context"` (HTML allowed, typically `<pre>...</pre>` for a code block) only when there's a snippet or note to show — omit it entirely rather than setting it to `""` when there's nothing to show, matching the style of existing files. `"context"` can also be an **array** of HTML strings, rendered as separate stacked boxes, for a question that shows several code snippets side by side (e.g. "which of these two functions…").

Supported `type` values (verified against the current renderers in `src/components/quiz/options/` — `McTfOptions.jsx`, `MsqOptions.jsx`, `FitbInput.jsx`, `MatchingGrid.jsx`, `DragDropBoard.jsx` — and the scoring in `src/state/grading.js`):

- **`mc`** — multiple choice. `options`: string array. `correctAnswer`: 0-based index.
- **`tf`** — true/false. `options`: `["True", "False"]`. `correctAnswer`: 0 or 1.
- **`msq`** — multiple select (2+ correct). `options`: string array. `correctAnswer`: array of 0-based indices.
- **`fitb`** — fill in the blank. `text` contains a blank (e.g. `___`). `correctAnswer`: the exact string answer (matched case-insensitively, trimmed).
  - **Code fill-in variant:** add a `"code"` field holding the raw code (plain text, **not** HTML — don't escape `<`/`>` or wrap it in `<pre>`) with `___` marking the blank. The answer box then renders inline inside the code block at that spot, and `text` is just the instruction (no `___` needed there). Don't also put the same code in `"context"`.
  - **Multiple blanks in one snippet:** put several `___` markers in `"code"` and make `correctAnswer` an array of strings — one per blank, in the order they appear (e.g. `"code": "for i in ___(3):\n    ___(i)"`, `"correctAnswer": ["range", "print"]`). The array length must equal the number of `___` markers. Each blank is graded separately, with partial credit per blank (like `matching`), so consider giving these questions more than 1 point. A single blank keeps the plain-string `correctAnswer`.
- **`matching`** — dropdown matching. `allChoices`: flat array of every possible right-side value. `pairs`: array of `{ "term": "...", "match": "..." }`.
- **`drag-drop`** — same shape as `matching` (`pairs` of `{ "term", "match" }`), rendered as drag targets instead of dropdowns.

### String-safety rules (the JSON must parse cleanly)

- Escape nested double quotes: `\"`.
- No literal newlines/tabs inside a string value — use `\n`/`\t` escape sequences (this is how multi-line code in `"context"` is represented, e.g. `"<pre>line one\nline two</pre>"`).
- No raw control characters.
- Inline HTML (`<code>`, `<strong>`, `<pre>`, `<em>`) is fine and expected for formatting code or emphasis inside `"text"`/`"context"`.

## 4. Where to save it

The folder path is meaningful, not cosmetic, and now five levels deep: `src/data/<Term>/<Subject>/<Section>/<Series>/<quiz file>.json`. `src/data/catalog.js` reads `path.split('/')` on every file under `src/data/**/*.json` and uses that position — term, subject, section, series — to build the menu; a quiz's Section/Series membership is exactly whichever folder it sits in, nothing else decides it (e.g. `src/data/4th Year - 1st Term/System Integration and Architecture/Canvas/Module 1/…` → term "4th Year - 1st Term", subject "System Integration and Architecture", section "Canvas", series "Module 1").

**Every folder at every level requires a `_meta.json`** — at minimum `{ "id": "<url-slug>" }`. See `src/data/_meta.json.example` for the full field list (`displayName`, `order`, `archived`, `showLabel`/`showCount` for Section/Series, and the `"badges"` default a Subject/Section/Series can declare — see "Badges" above for how those cascade).

A subject with no natural grouping still needs at least one Section and one Series folder — by convention both named `General`, with `{ "id": "general", "showLabel": false }` at each level so no extra header shows up in the UI. Look at any existing subject for a live example before creating a new one.

- Adding to an existing series: drop the file straight into that Series folder — reuse the folder's exact name and its numeric-prefix filename convention (`01-`, `02-`, …; the prefix is a sort aid within that folder, not read by the app, but continue the existing sequence rather than breaking it).
- Adding a genuinely new subject, section, or series: create the new folder(s) plus their `_meta.json` files, matching the existing naming conventions seen in `src/data/` (term folders: `"<N>th Year - <N>st/nd/rd/th Term"`; everything else: plain, human-readable names).
- Quizzes are auto-discovered by `import.meta.glob('./**/*.json', { eager: true })` in `src/data/catalog.js` (the glob is relative to `src/data/`) — there's no manifest/index file to update. Re-check that file if that ever seems not to hold.

**If it's unclear whether a new quiz belongs under an existing Term/Subject/Section/Series or needs a new one — ask rather than guessing**, same as the title-prefix ambiguity above.

## 5. Report the full answer key in chat (only when asked)

Only when the user asks for it, list every question's correct answer in your chat reply (a short numbered list: question number → correct option), not just the ones you changed from the source. Otherwise skip the list. Either way, keep calling out corrections per section 2 — what was wrong and what you fixed.
