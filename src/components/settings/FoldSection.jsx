import { useState } from 'react';

// A settings row that folds: the heading row shows the setting's name, its
// current value (summary) and an optional small visual (badge); tapping it
// slides the full control open. Starts folded every time the settings menu
// opens. Rendered as a div, not a label — a label would forward clicks on
// its blank space to the first control inside.
export default function FoldSection({ title, summary, badge, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="dropdown-item fold-section">
      <button type="button" className="fold-toggle" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="dropdown-item-text">
          <strong>{title}</strong>
          <small className="fold-summary">{summary}</small>
        </span>
        {badge && (
          <span className="fold-badge" aria-hidden="true">
            {badge}
          </span>
        )}
        <svg className="fold-chevron" viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 6l4 4 4-4" />
        </svg>
      </button>
      <div className={`fold-panel ${open ? 'fold-panel--open' : ''}`} inert={!open}>
        <div className="fold-panel-inner">
          <div className="fold-panel-content">{children}</div>
        </div>
      </div>
    </div>
  );
}
