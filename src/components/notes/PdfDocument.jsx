import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

// A PDF note's pages (NotesRoute), loaded by notes/pdf.js. Every page is laid
// out up front at its own aspect ratio, so the Contents can jump anywhere
// and scroll positions hold, but only pages near the viewport are drawn;
// ones scrolled far away are freed again, so a long deck stays light on a
// phone. 100% zoom fits the page to the column; past that it scrolls
// sideways.
const ZOOMS = [0.5, 0.75, 1, 1.25, 1.5, 2, 3];
const INVERT_KEY = 'quizApp_pdfInvert';

// How far beyond the viewport a page is drawn ahead of being scrolled to,
// and how far past it is freed.
const DRAW_MARGIN = '150% 0px';

const readInvert = () => {
  try {
    return localStorage.getItem(INVERT_KEY) === 'true';
  } catch (e) {
    return false;
  }
};

const icon = (children) => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

function PdfPage({ entry, number, cssWidth, doc }) {
  const ref = useRef(null);
  const canvasRef = useRef(null);
  const textRef = useRef(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => setNear(e.isIntersecting), { rootMargin: DRAW_MARGIN });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!near || !cssWidth) return;
    return doc.renderPage(entry.page, canvasRef.current, textRef.current, cssWidth);
  }, [near, cssWidth, entry, doc]);

  useEffect(() => {
    if (!near) doc.releasePage(canvasRef.current, textRef.current);
  }, [near, doc]);

  return (
    <div ref={ref} id={entry.anchor} className="pdf-page" style={{ aspectRatio: `${entry.width} / ${entry.height}` }} data-page={number}>
      <div className="pdf-page-canvas" ref={canvasRef} />
      <div className="pdf-page-text" ref={textRef} />
    </div>
  );
}

// toolbarSlot: where the toolbar goes, NotesRoute's sticky switcher row
// (beside the PDF picker), so it stays in reach without its own sticky bar.
export default function PdfDocument({ doc, href, toolbarSlot }) {
  const { pages } = doc;
  const [zoom, setZoom] = useState(1);
  const [invert, setInvert] = useState(readInvert);
  const [current, setCurrent] = useState(1);
  const [pageInput, setPageInput] = useState('1');
  // The column's width at 100%, in CSS pixels; 0 until measured.
  const [fitWidth, setFitWidth] = useState(0);
  const rootRef = useRef(null);
  const pagesRef = useRef(null);
  // Where the reader was (page and how far down it) when the zoom changed,
  // so the page under them stays put rather than the scroll offset.
  const zoomAnchor = useRef(null);

  // Settles before redrawing, so dragging a window edge doesn't restart
  // every visible page's drawing on each pixel.
  useEffect(() => {
    const root = rootRef.current;
    let timer;
    const measure = () => setFitWidth(Math.floor(root.clientWidth));
    measure();
    const observer = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(measure, 120);
    });
    observer.observe(root);
    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  // The reading line: a page counts as current once its top is above it.
  const readingLine = () => window.innerHeight * 0.4;

  useEffect(() => {
    const onScroll = () => {
      const line = readingLine();
      const els = pagesRef.current?.children ?? [];
      let n = 1;
      for (let i = 0; i < els.length; i++) {
        if (els[i].getBoundingClientRect().top <= line) n = i + 1;
        else break;
      }
      setCurrent(n);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setPageInput(String(current)), [current]);

  const changeZoom = (next) => {
    const el = pagesRef.current?.children[current - 1];
    if (el) {
      const rect = el.getBoundingClientRect();
      zoomAnchor.current = { index: current - 1, fraction: (readingLine() - rect.top) / rect.height };
    }
    setZoom(next);
  };

  useLayoutEffect(() => {
    const anchor = zoomAnchor.current;
    zoomAnchor.current = null;
    const el = anchor && pagesRef.current?.children[anchor.index];
    if (!el) return;
    const rect = el.getBoundingClientRect();
    window.scrollTo({ top: window.scrollY + rect.top + anchor.fraction * rect.height - readingLine(), behavior: 'instant' });
  }, [zoom]);

  const goToPage = (n) => {
    const page = Math.min(pages.length, Math.max(1, Math.round(n) || current));
    setPageInput(String(page));
    pagesRef.current?.children[page - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const toggleInvert = () => {
    setInvert((on) => {
      try {
        localStorage.setItem(INVERT_KEY, String(!on));
      } catch (e) {
        /* just this visit, then */
      }
      return !on;
    });
  };

  const zoomIndex = ZOOMS.indexOf(zoom);
  const cssWidth = Math.floor(fitWidth * zoom);

  const toolbar = (
    <div className="pdf-toolbar">
      <div className="pdf-toolbar-group">
        <button type="button" className="pdf-tool" onClick={() => goToPage(current - 1)} disabled={current <= 1} aria-label="Previous page">
          {icon(<path d="M10 3.5L5.5 8l4.5 4.5" />)}
        </button>
        <form
          className="pdf-page-field"
          onSubmit={(e) => {
            e.preventDefault();
            goToPage(Number(pageInput));
          }}
        >
          <input
            type="text"
            inputMode="numeric"
            value={pageInput}
            onChange={(e) => setPageInput(e.target.value.replace(/\D/g, ''))}
            onBlur={() => setPageInput(String(current))}
            onFocus={(e) => e.target.select()}
            aria-label="Page number"
          />
          <span className="pdf-page-total">/ {pages.length}</span>
        </form>
        <button
          type="button"
          className="pdf-tool"
          onClick={() => goToPage(current + 1)}
          disabled={current >= pages.length}
          aria-label="Next page"
        >
          {icon(<path d="M6 3.5L10.5 8 6 12.5" />)}
        </button>
      </div>
      <div className="pdf-toolbar-group">
        <button type="button" className="pdf-tool" onClick={() => changeZoom(ZOOMS[zoomIndex - 1])} disabled={zoomIndex <= 0} aria-label="Zoom out">
          {icon(<path d="M3.5 8h9" />)}
        </button>
        <button type="button" className="pdf-tool pdf-zoom-level" onClick={() => changeZoom(1)} title="Fit to width">
          {Math.round(zoom * 100)}%
        </button>
        <button
          type="button"
          className="pdf-tool"
          onClick={() => changeZoom(ZOOMS[zoomIndex + 1])}
          disabled={zoomIndex >= ZOOMS.length - 1}
          aria-label="Zoom in"
        >
          {icon(<path d="M3.5 8h9M8 3.5v9" />)}
        </button>
      </div>
      <div className="pdf-toolbar-group">
        <button
          type="button"
          className={`pdf-tool ${invert ? 'pdf-tool--on' : ''}`}
          onClick={toggleInvert}
          aria-pressed={invert}
          title="Dark pages: invert the pages' colors"
        >
          {icon(
            <>
              <circle cx="8" cy="8" r="5.75" />
              <path d="M8 2.25v11.5a5.75 5.75 0 0 0 0-11.5z" fill="currentColor" />
            </>
          )}
          <span className="pdf-tool-label">Dark pages</span>
        </button>
        {/* The browser's own viewer: printing, downloading, its own search. */}
        <a className="pdf-tool" href={href} target="_blank" rel="noopener noreferrer" title="Open the PDF file in a new tab">
          {icon(
            <>
              <path d="M9.5 2.5h4v4" />
              <path d="M13.5 2.5L7.5 8.5" />
              <path d="M12 9.5v3.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-8a.5.5 0 0 1 .5-.5H7" />
            </>
          )}
          <span className="pdf-tool-label">Open file</span>
        </a>
      </div>
    </div>
  );

  return (
    <div className={`pdf-doc ${invert ? 'pdf-doc--inverted' : ''}`} ref={rootRef}>
      {toolbarSlot && createPortal(toolbar, toolbarSlot)}
      <div className="pdf-scroll">
        <div className="pdf-pages" ref={pagesRef} style={{ width: cssWidth || undefined }}>
          {pages.map((entry, i) => (
            <PdfPage key={entry.anchor} entry={entry} number={i + 1} cssWidth={cssWidth} doc={doc} />
          ))}
        </div>
      </div>
    </div>
  );
}
