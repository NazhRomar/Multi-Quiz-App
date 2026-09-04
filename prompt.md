# Quiz Ingestion Prompt

Instructions for a Claude Code session asked to add a quiz to this app from source material — attached images, a pasted document/text, or a website URL.

## 1. Get the source content

**If images are attached:** Read them directly (Claude is multimodal — no OCR tool needed). Read every image in the set before writing anything; a multi-page quiz is often split across several screenshots.

**If a website URL is given:** Do not scrape via a plain text dump alone (`get_page_text`/similar strips away the signal you need). Go through the DOM:
- Use a JS-execution tool (e.g. `javascript_tool`) to query the page's actual markup — headers, option lists, and whatever inline style/class the site uses to mark the correct answer (e.g. `color: #ff0000`, a `.correct` class, a checkmark icon). Inspect a raw `innerHTML` sample first to find the marker before assuming one.
- Pull code blocks from `<pre>`/`<code>` elements' `innerHTML` directly, not from the rendered text — text extraction frequently mangles source code (lost whitespace, stripped double-underscores from `__init__`-style names caught by naive Markdown-bold parsing, etc.).
- If the site paginates or lazy-loads content, make sure you've captured every question before proceeding.

**If it's pasted text/PDF/Word content:** Use it as given, but stay alert for the same kinds of transcription damage (dropped underscores, garbled punctuation, mismatched option counts) described below.

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
  "courseCode": "STRING — short course code, e.g. 'SIA'",
  "quizTitle": "STRING — e.g. 'Python Essentials 2 - Module 3'",
  "totalPoints": NUMBER,
  "questions": [ ... ]
}
```

`totalPoints` is the sum of every question's `"points"`.

`courseCode` is carried in every existing file but is currently **not read anywhere in `src/main.js`** — it's not wired into the UI. Still fill it in for consistency with the existing files (reuse the same code already used by sibling quizzes in that folder, e.g. `"SIA"` for everything under `System Integration and Architecture`), but don't treat getting it "right" as important — nothing displays it today.

### `quizTitle` drives the sub-grouping in the UI — get this right

`main.js` groups quizzes within a subject by splitting `quizTitle` on `" - "`. The part before the dash is the **series name**; the part after is the **item label**. If 2+ quizzes in the same subject folder share the exact same series name, they're automatically bundled into one card (e.g. every `"Python Essentials 2 - Module N"` title collapses into a single "Python Essentials 2" card with Module 1/2/3/4 as rows inside it). A title with no `" - "`, or whose prefix no other sibling shares, renders as its own standalone row instead.

So: to add a new item to an existing series (another module, another part), reuse that series' exact prefix string, character-for-character (`"Python Essentials 2 - Module 5"`, not `"Python Essentials II - Module 5"` or `"PE2 - Module 5"`). To start a **new** series, pick a prefix, and know it only visually becomes a "series card" once a second quiz shares that same prefix — a lone quiz with a dash in its title still just renders standalone until a sibling shows up.

**If it's ambiguous whether a new quiz belongs to an existing series, extends it with a new naming pattern, or should stand alone — stop and ask the user rather than guessing.** Getting this wrong either silently merges unrelated quizzes into one card or fails to group ones that should be together.

Every question has `id` (sequential integer from 1), `type`, `text`, `options`/type-specific fields, `correctAnswer`, `points`, `explanation`. Add `"context"` (a string, HTML allowed, typically `<pre>...</pre>` for a code block) only when there's a snippet or note to show — omit it entirely rather than setting it to `""` when there's nothing to show, matching the style of existing files.

Supported `type` values (verified against the current renderer in `src/main.js`):

- **`mc`** — multiple choice. `options`: string array. `correctAnswer`: 0-based index.
- **`tf`** — true/false. `options`: `["True", "False"]`. `correctAnswer`: 0 or 1.
- **`msq`** — multiple select (2+ correct). `options`: string array. `correctAnswer`: array of 0-based indices.
- **`fitb`** — fill in the blank. `text` contains a blank (e.g. `___`). `correctAnswer`: the exact string answer (matched case-insensitively, trimmed).
- **`matching`** — dropdown matching. `allChoices`: flat array of every possible right-side value. `pairs`: array of `{ "term": "...", "match": "..." }`.
- **`drag-drop`** — same shape as `matching` (`pairs` of `{ "term", "match" }`), rendered as drag targets instead of dropdowns.

### String-safety rules (the JSON must parse cleanly)

- Escape nested double quotes: `\"`.
- No literal newlines/tabs inside a string value — use `\n`/`\t` escape sequences (this is how multi-line code in `"context"` is represented, e.g. `"<pre>line one\nline two</pre>"`).
- No raw control characters.
- Inline HTML (`<code>`, `<strong>`, `<pre>`, `<em>`) is fine and expected for formatting code or emphasis inside `"text"`/`"context"`.

## 4. Where to save it

The folder path is meaningful, not cosmetic: `main.js` reads `path.split('/')` on every file under `src/data/**/*.json` and uses path segment 2 as the **term** heading and segment 3 as the **subject/course** heading in the UI (e.g. `src/data/4th Year - 1st Term/System Integration and Architecture/…` → term "4th Year - 1st Term", subject "System Integration and Architecture"). So:

- Adding to an existing subject: drop the file straight into that folder — reuse the folder's exact name.
- Adding a genuinely new subject or term: create the new folder(s), matching the existing `"<N>th Year - <N>st/nd/rd/th Term"` and plain subject-name conventions seen in `src/data/`.
- Filenames within a subject folder follow a numeric-prefix convention (`06-py2-module1.json`, `07-py2-module2.json`, `08-py2-module3.json`, …) — the prefix is just a sort/ordering aid, not read by the app, but continue the existing sequence for that folder rather than breaking it.
- Quizzes are auto-discovered via `import.meta.glob('./data/**/*.json')` — there's no manifest/index file to update. Re-check `src/main.js` if that ever seems not to hold.

**If it's unclear whether a new quiz belongs under an existing term/subject folder or needs a new one — ask rather than guessing**, same as the `quizTitle` series-prefix ambiguity above.

## 5. Verify before calling it done

Start the dev server (`preview_start` with the `dev` launch config) and open the new quiz in the browser preview. Confirm:
- The question count and point total match what you intended.
- At least one `mc`/`tf` question and any `msq`/`fitb`/`matching`/`drag-drop` question types you used render correctly.
- Code blocks in `context` display with correct formatting (no broken escaping).
