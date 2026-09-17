import { useEffect, useState } from 'react';

// Every change to the app, newest first, read out of git history at build
// time (see readChangelog in vite.config.js — quiz content is filtered out
// there, so this list is app changes only). It's fetched rather than bundled
// because it's ~54 kB that most sessions never look at; the service worker
// precaches the file, so this still works offline.
const REPO_URL = __REPO_URL__;

// "2026-09-17" is already the commit's own local date from git, so it's
// formatted as plain parts rather than through a Date (which would read it as
// UTC midnight and shift the day backwards for anyone behind it).
function formatDay(ymd) {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
}

// Consecutive entries sharing a date collapse under one heading.
function groupByDay(entries) {
  const days = [];
  for (const entry of entries) {
    const last = days[days.length - 1];
    if (last && last.date === entry.date) last.entries.push(entry);
    else days.push({ date: entry.date, entries: [entry] });
  }
  return days;
}

function Entry({ entry }) {
  const [open, setOpen] = useState(false);
  const hasBody = !!entry.body;

  return (
    <li className={`changelog-entry ${hasBody ? 'changelog-entry--expandable' : ''}`}>
      <div className="changelog-entry-head">
        {/* Only the ones with something more to say are buttons. */}
        {hasBody ? (
          <button type="button" className="changelog-subject" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
            <svg className="changelog-chevron" viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 4l4 4-4 4" />
            </svg>
            {entry.subject}
          </button>
        ) : (
          <span className="changelog-subject changelog-subject--plain">{entry.subject}</span>
        )}
        {REPO_URL && (
          <a
            className="changelog-hash"
            href={`${REPO_URL}/commit/${entry.hash}`}
            target="_blank"
            rel="noreferrer noopener"
            title="View this change on GitHub"
          >
            {entry.hash}
          </a>
        )}
      </div>
      {hasBody && open && <pre className="changelog-body">{entry.body}</pre>}
    </li>
  );
}

export default function ChangelogModal({ onClose }) {
  const [entries, setEntries] = useState(null); // null while loading
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    fetch(`${import.meta.env.BASE_URL}changelog.json`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status);
        return res.json();
      })
      .then((data) => live && setEntries(data))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, []);

  // Esc closes, like a dialog should.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const days = entries ? groupByDay(entries) : [];

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card changelog-card" role="dialog" aria-modal="true" aria-label="Changelog">
        <div className="modal-header">
          <h3>
            What&apos;s changed
            {entries && <span className="changelog-count">{entries.length}</span>}
          </h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <p className="changelog-note">Changes to the app itself. Quizzes being added or corrected aren&apos;t listed.</p>
        <div className="changelog-scroll">
          {failed && <p className="changelog-state">Couldn&apos;t load the changelog.</p>}
          {!failed && !entries && <p className="changelog-state">Loading…</p>}
          {days.map((day) => (
            <section className="changelog-day" key={day.date}>
              <h4 className="changelog-day-label">{formatDay(day.date)}</h4>
              <ul className="changelog-list">
                {day.entries.map((entry) => (
                  <Entry key={entry.hash} entry={entry} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
