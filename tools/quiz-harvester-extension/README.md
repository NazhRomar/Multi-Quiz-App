# Quiz Harvester

A personal, unpublished Chrome extension that passively captures quiz
questions/answers from whatever page you're on, so they can be imported
into Multi Quiz App later. It is **read-only**: it never clicks, submits,
or navigates anything on the page. You drive the quiz exactly as you
normally would; the extension just watches and records.

## Load it

1. `chrome://extensions`
2. Enable **Developer mode** (top right)
3. **Load unpacked** → select this `quiz-harvester-extension` folder

## Use it

1. Click the toolbar icon. This opens a small **detached dashboard window**
   (not the usual auto-closing popup bubble) and remembers whichever tab
   was active as the capture target.
2. In the dashboard, hit **Start Capturing**. This arms just that one tab
   (badge shows "ON") — nothing is injected anywhere else.
3. Switch back to the quiz tab and study/take it normally — click through
   questions, reveal answers however the site normally does that, etc. The
   extension only reads the DOM as it changes; it never clicks anything
   itself.
4. Two places show what's been captured, live:
   - A small pill in the bottom-right corner of the quiz page itself
     (green = captured, amber = needs review, gray = nothing detected yet).
     Click it to expand a quick preview without leaving the page.
   - The dashboard window's list, which shows every question captured this
     session — question number (when detectable), full text, options, the
     marked answer, and any code block — so you can eyeball accuracy while
     you work instead of only finding out after export.
5. For an **amber "needs review"** question (no answer marker found on the
   page), click the actually-correct option directly in either the pill or
   the dashboard list. This marks it `user-marked` and protects it from
   being overwritten by later re-scans.
6. If the quiz spans multiple full page loads (not a single-page app), the
   tab stays armed across navigations automatically — no need to hit Start
   again per page. Quiz content inside an `<iframe>` (common on LMS-style
   sites) is scanned too; only the top-level page shows the pill, but
   iframe captures still show up in the dashboard list.
7. Switch dashboard target any time by clicking a different tab — the
   dashboard follows the last tab you focused in a normal browser window
   (it won't follow itself). Rename/switch the **session** field to keep,
   say, CCNA captures separate from Python ones. **Export session as JSON**
   downloads everything captured under the current session name.

## What it does NOT do

- Never dispatches a click, keypress, or form submission on the page.
- Never navigates or reloads a page itself.
- Never touches "Next"/"Submit"/"Continue"-type controls, even indirectly —
  there's no code path that could, since nothing is clicked at all.

## Output format

```json
{
  "sessionId": "ccna-icnd1",
  "exportedAt": "2026-01-01T00:00:00.000Z",
  "questionCount": 2,
  "questions": [
    {
      "hash": "a1b2c3d4",
      "questionNumber": 3,
      "sourceUrl": "https://example.com/quiz/page-3",
      "text": "Which data structure is LIFO?",
      "options": ["list", "stack", "heap", "tree"],
      "correctIndexes": [1],
      "confidence": "site-marked",
      "detectionReason": "outlier-color",
      "codeContext": null,
      "capturedAt": 1735689600000
    }
  ]
}
```

`confidence` is one of `site-marked`, `user-marked`, `unresolved`,
`ambiguous` — see `prompt.md` at the repo root for how a Claude Code
session should treat each of these when importing (short version:
**every** confidence level still gets fact/code-checked before it's
trusted — a detected marker or your own click can both still be wrong).
