import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { findNote, loadNote, notesForSubject } from '../notes/index.js';
import Dropdown from '../components/settings/Dropdown.jsx';
import SegmentedToggle from '../components/common/SegmentedToggle.jsx';
import AppSettingsFields from '../components/settings/AppSettingsFields.jsx';
import PdfDocument from '../components/notes/PdfDocument.jsx';
import { MarkdownBlocks, collectHeadings, parseMarkdown } from '../utils/markdown.jsx';

// Renders a study-notes Markdown file or PDF (src/notes/) with a
// table of contents — a sidebar on wide screens, a collapsible "Contents"
// panel above the notes on narrow ones. TOC entries scroll with
// scrollIntoView rather than href="#id", since the hash router owns the
// URL fragment.

// The switcher's one tab for all of a subject's PDFs (no note has this slug).
const PDFS_TAB = '#pdfs';

export default function NotesRoute() {
  const { noteSlug } = useParams();
  const navigate = useNavigate();
  const note = findNote(noteSlug);
  // The Markdown text, or a PDF note's loaded document (notes/pdf.js).
  const [source, setSource] = useState(null);
  const [failed, setFailed] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [tocOpen, setTocOpen] = useState(false);
  const pageRef = useRef(null);
  const topRef = useRef(null);
  // Each tab's scroll position, so switching back to a note returns to
  // where it was left. Only while the notes page stays open — opening notes
  // from Home starts at the top.
  const scrollBySlug = useRef({});
  const restoreY = useRef(0);
  // The PDF last open, so the PDFs tab goes back to it rather than the first.
  const lastPdfSlug = useRef(null);
  if (note?.pdf) lastPdfSlug.current = note.slug;

  useEffect(() => {
    if (!note) return;
    let cancelled = false;
    let loaded = null;
    setSource(null);
    setFailed(false);
    loadNote(note).then(
      (result) => {
        // A PDF holds the worker's memory for its pages until destroyed.
        if (cancelled) result.destroy?.();
        else setSource((loaded = result));
      },
      () => !cancelled && setFailed(true)
    );
    restoreY.current = scrollBySlug.current[note.slug] ?? 0;
    window.scrollTo(0, 0);
    return () => {
      cancelled = true;
      loaded?.destroy?.();
      scrollBySlug.current[note.slug] = window.scrollY;
    };
  }, [note]);

  // Once the note has rendered, so the page is tall enough to scroll to it.
  useLayoutEffect(() => {
    if (source != null) window.scrollTo({ top: restoreY.current, behavior: 'instant' });
  }, [source]);

  // The header and switcher stick together; their combined height (which
  // varies with breakpoint and theme) offsets the sidebar and the headings'
  // scroll margin via --notes-top-h.
  useEffect(() => {
    const top = topRef.current;
    if (!top) return;
    const observer = new ResizeObserver(() => pageRef.current?.style.setProperty('--notes-top-h', `${top.offsetHeight}px`));
    observer.observe(top);
    return () => observer.disconnect();
  }, [note]);

  const { blocks, headings } = useMemo(() => {
    if (source == null) return { blocks: [], headings: [] };
    if (typeof source !== 'string') return { blocks: [], headings: source.headings };
    const blocks = parseMarkdown(source);
    // A leading h1 is the document's own title — the header already shows
    // the note's name, so it's dropped from the body and the contents.
    if (blocks[0]?.type === 'heading' && blocks[0].level === 1) blocks.shift();
    return { blocks, headings: collectHeadings(blocks).filter((h) => h.level <= 2) };
  }, [source]);

  // Highlights the section currently at the top of the viewport. A PDF's
  // entries point at the page they start on (anchor), which several can
  // share; a Markdown heading is its own anchor. Each counts as reached a
  // little past where a jump to it lands (its scroll margin), which for a
  // PDF page also clears the viewer's toolbar.
  useEffect(() => {
    if (!headings.length) return;
    const targets = headings.map((h) => ({ id: h.id, el: document.getElementById(h.anchor ?? h.id) })).filter((t) => t.el);
    const onScroll = () => {
      let current = targets[0]?.id;
      for (const { id, el } of targets) {
        const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || (topRef.current?.offsetHeight ?? 62) + 18;
        if (el.getBoundingClientRect().top <= margin + 30) current = id;
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
  // subject) get a switcher that sticks under the header, so it's
  // reachable without scrolling back up. Its PDFs, however many, share one
  // tab there; which one is open is picked in the viewer itself.
  const siblings = notesForSubject(note.subjectId);
  const pdfs = siblings.filter((n) => n.pdf);
  const openNote = (slug) => slug !== note.slug && navigate(`/notes/${slug}`, { replace: true });
  const tabs = [
    ...siblings.filter((n) => !n.pdf).map((n) => ({ value: n.slug, label: n.tab || n.title })),
    ...(pdfs.length ? [{ value: PDFS_TAB, label: pdfs.length === 1 ? 'PDF' : 'PDFs' }] : []),
  ];
  const switcher = tabs.length > 1 && (
    <SegmentedToggle
      label="Notes"
      options={tabs}
      value={note.pdf ? PDFS_TAB : note.slug}
      onChange={(value) => openNote(value === PDFS_TAB ? (pdfs.find((n) => n.slug === lastPdfSlug.current) ?? pdfs[0]).slug : value)}
    />
  );
  const pdfPicker =
    pdfs.length > 1 ? (
      <label className="pdf-picker">
        <select value={note.slug} onChange={(e) => openNote(e.target.value)} aria-label="Choose a PDF">
          {pdfs.map((n) => (
            <option key={n.slug} value={n.slug}>
              {n.label || n.title}
            </option>
          ))}
        </select>
        <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 6l4 4 4-4" />
        </svg>
      </label>
    ) : (
      note.label && <h2 className="pdf-picker pdf-picker--single">{note.label}</h2>
    );

  const jumpTo = (h) => {
    setTocOpen(false);
    document.getElementById(h.anchor ?? h.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toc = (
    <nav className="notes-toc" aria-label="Contents">
      {headings.map((h) => (
        <button
          key={h.id}
          type="button"
          className={`notes-toc-item notes-toc-item--h${h.level} ${activeId === h.id ? 'notes-toc-item--active' : ''}`}
          onClick={() => jumpTo(h)}
        >
          {h.label}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="notes-page" ref={pageRef}>
      <div className="notes-top" ref={topRef}>
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
        </header>
        {switcher && <div className="notes-switcher">{switcher}</div>}
        {tocOpen && <div className="notes-toc-sheet">{toc}</div>}
      </div>

      <div className={`notes-layout ${switcher ? 'notes-layout--switched' : ''}`}>
        {headings.length > 0 && <aside className="notes-sidebar">{toc}</aside>}
        {source != null && typeof source !== 'string' ? (
          <PdfDocument key={note.slug} doc={source} href={`${import.meta.env.BASE_URL}notes/${note.pdf}`} picker={pdfPicker} />
        ) : (
          <article className="notes-body">
            {failed ? (
              <p className="notes-loading">Couldn&apos;t load {note.pdf ? 'this PDF' : 'these notes'}. Check your connection and try again.</p>
            ) : source == null ? (
              <p className="notes-loading">Loading notes…</p>
            ) : (
              <MarkdownBlocks blocks={blocks} />
            )}
          </article>
        )}
      </div>
    </div>
  );
}
