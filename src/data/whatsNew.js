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
    id: 'whats-new',
    date: '2026-11-03',
    title: "What's new, in one place",
    body: "New quizzes, notes and features now show up here when you open the app. Reopen it anytime from What's new at the bottom of Home.",
  },
];
