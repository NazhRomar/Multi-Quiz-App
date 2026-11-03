import { GlobalWorkerOptions, TextLayer, getDocument } from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// pdf.js, for PDF notes (notes/index.js). Only ever loaded through a dynamic
// import, so the library and its worker stay out of the main bundle until a
// PDF is opened. PdfDocument.jsx does the drawing, through renderPage below,
// and releasePage, so it never has to import pdf.js itself.
GlobalWorkerOptions.workerSrc = workerUrl;

// Longest Contents label, for a page whose title runs on.
const MAX_LABEL = 90;

// Pixels per side a page's canvas may use. A zoomed-in page on a high-DPI
// phone would otherwise ask for a canvas big enough to crash the tab.
const MAX_CANVAS_SIDE = 4096;

// The outline (bookmarks), flattened to the two levels the Contents shows,
// each entry pointing at the page it starts on. Entries whose destination
// can't be resolved are dropped.
async function outlineHeadings(pdf) {
  const outline = await pdf.getOutline().catch(() => null);
  if (!outline?.length) return [];
  const pageOf = async (dest) => {
    try {
      const explicit = typeof dest === 'string' ? await pdf.getDestination(dest) : dest;
      if (!Array.isArray(explicit)) return null;
      const [ref] = explicit;
      return typeof ref === 'number' ? ref : await pdf.getPageIndex(ref);
    } catch (e) {
      return null;
    }
  };
  const flat = [];
  for (const item of outline) {
    flat.push({ item, level: 1 });
    for (const child of item.items || []) flat.push({ item: child, level: 2 });
  }
  const pages = await Promise.all(flat.map(({ item }) => pageOf(item.dest)));
  return flat
    .map(({ item, level }, i) => ({ label: item.title.trim(), level, pageIndex: pages[i] }))
    .filter((h) => h.label && h.pageIndex != null);
}

// A text run minus icon-font glyphs (Unicode private use areas), which are
// often the largest "text" on a slide but read as nothing.
const visibleText = (str = '') => str.replace(/[-\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]/gu, '').trim();

// No bookmarks (most slide decks exported from PowerPoint have none): each
// page's largest text is taken as its title, which for slides is nearly
// always the slide's own heading. A page repeating the previous page's title
// ("…(cont.)" slides aside) is folded into it, and one with no text at all,
// or only a slide number, is listed by number.
async function pageTitleHeadings(pages) {
  const titles = await Promise.all(
    pages.map(async ({ page }) => {
      const { items } = await page.getTextContent().catch(() => ({ items: [] }));
      // Only runs with a letter in them: a slide's biggest text is sometimes
      // a figure ("₱ 400,000") rather than its heading.
      const runs = items.map((it) => ({ ...it, str: visibleText(it.str) })).filter((it) => /\p{L}/u.test(it.str));
      if (!runs.length) return '';
      const size = (it) => Math.hypot(it.transform[2], it.transform[3]);
      const largest = Math.max(...runs.map(size));
      const title = [];
      for (const it of runs) {
        if (size(it) >= largest * 0.9) title.push(it.str);
        else if (title.length) break;
      }
      const label = title.join(' ').replace(/\s+/g, ' ').trim();
      if (/^\d+$/.test(label)) return '';
      return label.length > MAX_LABEL ? `${label.slice(0, MAX_LABEL - 1)}…` : label;
    })
  );
  const headings = [];
  titles.forEach((title, pageIndex) => {
    const label = title || `Page ${pageIndex + 1}`;
    if (title && headings[headings.length - 1]?.label === label) return;
    headings.push({ label, level: 2, pageIndex });
  });
  return headings;
}

const pageAnchor = (pageIndex) => `pdf-page-${pageIndex + 1}`;

// Fetches and opens the PDF, ready to draw: every page's size (so the
// viewer can lay out the whole document before drawing any of it) and the
// Contents entries, in NotesRoute's heading shape. The file is fetched in one
// plain request rather than pdf.js's ranged ones, so the service worker can
// cache it whole for offline use.
export async function loadPdf(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`PDF request failed: ${res.status}`);
  const task = getDocument({ data: new Uint8Array(await res.arrayBuffer()) });
  const pdf = await task.promise;
  const pages = await Promise.all(
    Array.from({ length: pdf.numPages }, async (_, i) => {
      const page = await pdf.getPage(i + 1);
      const { width, height } = page.getViewport({ scale: 1 });
      return { page, width, height, anchor: pageAnchor(i) };
    })
  );
  let headings = await outlineHeadings(pdf);
  if (!headings.length) headings = await pageTitleHeadings(pages);
  return {
    pages,
    headings: headings.map((h, i) => ({ id: `pdf-h${i}`, anchor: pageAnchor(h.pageIndex), label: h.label, level: h.level })),
    renderPage,
    releasePage,
    // The loading task owns the document and its worker-side memory.
    destroy: () => task.destroy(),
  };
}

// Draws a page at cssWidth CSS pixels wide, with its selectable text layer
// on top. Both are built off-screen and swapped in when done, so redrawing
// at a new zoom never blanks the page in between. Returns a cancel function.
function renderPage(page, canvasHolder, textHolder, cssWidth) {
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: cssWidth / base.width });
  const ratio = Math.min(window.devicePixelRatio || 1, MAX_CANVAS_SIDE / Math.max(viewport.width, viewport.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.floor(viewport.width * ratio);
  canvas.height = Math.floor(viewport.height * ratio);

  const textLayer = document.createElement('div');
  textLayer.className = 'textLayer';
  // What pdf.js's own viewer sets on each page (web/pdf_viewer.css), which
  // the text layer sizes and positions its text by.
  textLayer.style.setProperty('--total-scale-factor', viewport.scale);
  textLayer.style.setProperty('--scale-round-x', '1px');
  textLayer.style.setProperty('--scale-round-y', '1px');

  const drawing = page.render({
    canvas,
    viewport,
    transform: ratio !== 1 ? [ratio, 0, 0, ratio, 0, 0] : undefined,
  });
  const text = new TextLayer({ textContentSource: page.streamTextContent(), container: textLayer, viewport });

  let cancelled = false;
  Promise.all([drawing.promise, text.render()]).then(
    () => {
      if (cancelled) return;
      releasePage(canvasHolder, textHolder);
      canvasHolder.append(canvas);
      textHolder.append(textLayer);
    },
    () => {
      /* cancelled, or a page pdf.js couldn't draw: it stays blank */
    }
  );
  return () => {
    cancelled = true;
    drawing.cancel();
    text.cancel();
  };
}

// Frees a page scrolled far away. Zeroing the canvas first matters on iOS,
// which otherwise holds a detached canvas's memory for a while.
function releasePage(canvasHolder, textHolder) {
  for (const canvas of canvasHolder.querySelectorAll('canvas')) {
    canvas.width = 0;
    canvas.height = 0;
  }
  canvasHolder.replaceChildren();
  textHolder.replaceChildren();
}
