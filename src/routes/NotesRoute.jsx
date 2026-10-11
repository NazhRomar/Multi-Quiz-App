import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { findNote, isHtmlNote, loadNote, notesForSubject } from '../notes/index.js';
import Dropdown from '../components/settings/Dropdown.jsx';
import SegmentedToggle from '../components/common/SegmentedToggle.jsx';
import AppSettingsFields from '../components/settings/AppSettingsFields.jsx';
import { MarkdownBlocks, collectHeadings, parseMarkdown } from '../utils/markdown.jsx';

// Renders a study-notes Markdown file (src/notes/) with a
// table of contents — a sidebar on wide screens, a collapsible "Contents"
// panel above the notes on narrow ones. TOC entries scroll with
// scrollIntoView rather than href="#id", since the hash router owns the
// URL fragment. An .html note is a whole page of its own, shown in a
// sandboxed frame that fills the rest of the screen, with no contents.
export default function NotesRoute() {
  const { noteSlug } = useParams();
  const navigate = useNavigate();
  const note = findNote(noteSlug);
  const html = note ? isHtmlNote(note) : false;
  const [source, setSource] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [tocOpen, setTocOpen] = useState(false);

  useEffect(() => {
    if (!note) return;
    let cancelled = false;
    setSource(null);
    loadNote(note).then((text) => !cancelled && setSource(text));
    window.scrollTo(0, 0);
    return () => {
      cancelled = true;
    };
  }, [note]);

  const { blocks, headings } = useMemo(() => {
    if (source == null || html) return { blocks: [], headings: [] };
    const blocks = parseMarkdown(source);
    // A leading h1 is the document's own title — the header already shows
    // the note's name, so it's dropped from the body and the contents.
    if (blocks[0]?.type === 'heading' && blocks[0].level === 1) blocks.shift();
    return { blocks, headings: collectHeadings(blocks).filter((h) => h.level <= 2) };
  }, [source, html]);

  // Highlights the section currently at the top of the viewport.
  useEffect(() => {
    if (!headings.length) return;
    const els = headings.map((h) => document.getElementById(h.id)).filter(Boolean);
    const onScroll = () => {
      let current = els[0]?.id;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= 110) current = el.id;
        else break;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [headings]);

  if (!note) return <Navigate to="/" replace />;

  // Sibling notes of the same subject (e.g. several courses under one
  // subject) get a switcher above the notes, repeated at the top of the
  // Contents sheet so it's reachable without scrolling back up.
  const siblings = notesForSubject(note.subjectId);
  const switcher = siblings.length > 1 && (
    <SegmentedToggle
      label="Notes"
      options={siblings.map((n) => ({ value: n.slug, label: n.tab || n.title }))}
      value={note.slug}
      onChange={(slug) => slug !== note.slug && navigate(`/notes/${slug}`, { replace: true })}
    />
  );

  const jumpTo = (id) => {
    setTocOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toc = (
    <nav className="notes-toc" aria-label="Contents">
      {headings.map((h) => (
        <button
          key={h.id}
          type="button"
          className={`notes-toc-item notes-toc-item--h${h.level} ${activeId === h.id ? 'notes-toc-item--active' : ''}`}
          onClick={() => jumpTo(h.id)}
        >
          {h.label}
        </button>
      ))}
    </nav>
  );

  return (
    <div className={`notes-page ${html ? 'notes-page--embed' : ''}`}>
      <header className="quiz-header notes-header">
        <div className="header-left">
          <img className="header-logo" src={`${import.meta.env.BASE_URL}favicon.svg`} alt="Multi Quiz App" />
          <h1 className="notes-title">{note.title}</h1>
        </div>
        <div className="header-right">
          {headings.length > 0 && (
            <button type="button" className={`notes-toc-toggle ${tocOpen ? 'notes-toc-toggle--open' : ''}`} onClick={() => setTocOpen((o) => !o)} aria-expanded={tocOpen}>
              Contents
              <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M4 6l4 4 4-4" />
              </svg>
            </button>
          )}
          <button type="button" className="notes-exit" onClick={() => navigate('/')}>
            Exit
          </button>
          <Dropdown ariaLabel="Settings">
            <div className="dropdown-section-title">App settings</div>
            <AppSettingsFields />
          </Dropdown>
        </div>
        {tocOpen && (
          <div className="notes-toc-sheet">
            {switcher && <div className="notes-toc-switcher">{switcher}</div>}
            {toc}
          </div>
        )}
      </header>

      {switcher && <div className="notes-switcher">{switcher}</div>}

      {html ? (
        <div className="notes-embed">
          {source == null ? (
            <p className="notes-loading">Loading notes…</p>
          ) : (
            // allow-scripts without allow-same-origin: the page runs, but in
            // an opaque origin, cut off from the app's storage and DOM.
            <iframe className="notes-frame" title={note.tab || note.title} srcDoc={source} sandbox="allow-scripts" />
          )}
        </div>
      ) : (
        <div className={`notes-layout ${switcher ? 'notes-layout--switched' : ''}`}>
          {headings.length > 0 && <aside className="notes-sidebar">{toc}</aside>}
          <article className="notes-body">{source == null ? <p className="notes-loading">Loading notes…</p> : <MarkdownBlocks blocks={blocks} />}</article>
        </div>
      )}
    </div>
  );
}
