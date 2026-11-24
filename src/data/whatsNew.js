// Hand-written feature announcements for the What's New popup
// (components/menu/WhatsNewModal.jsx), newest first. New quizzes don't go
// here: they're listed from their own "addedOn" dates. Only real,
// user-facing features belong here; fixes and tweaks are left to the full
// changelog.
//
// id: stable and unique, so who has seen an entry survives edits to its text.
// date: "YYYY-MM-DD". An entry dated within the last NEW_FOR_DAYS days
//   (utils/newQuizzes.js) opens the popup for anyone who hasn't seen it yet.
// link (optional): { label, to } — a button to an in-app route, e.g.
//   { label: 'Open Laravel notes', to: '/notes/laravel' }.
export const FEATURES = [
  {
    id: 'topcit-practice',
    date: '2026-11-24',
    title: 'TOPCIT practice quiz',
    body: 'A practice quiz for the TOPCIT test, now at the top of the Finals list. Pick the domains and topics, then practise with instant feedback, sit a timed exam, or take a full mock exam. It keeps your progress and lets you resume where you left off.',
    link: { label: 'Open TOPCIT', to: '/topcit' },
  },
  {
    id: 'pdf-notes',
    date: '2026-11-03',
    title: 'Original slides in Notes',
    body: "Notes can now show a module's original PDF, with page jumps, zoom and a dark-pages mode. First up: Technopreneurship Modules 5 and 6, next to the study notes.",
    link: { label: 'Open Module 5 PDF', to: '/notes/technopreneurship-module-5' },
  },
  {
    id: 'whats-new',
    date: '2026-11-03',
    title: "What's new, in one place",
    body: "New quizzes, notes and features now show up here when you open the app. Reopen it anytime from What's new at the bottom of Home.",
  },
];
