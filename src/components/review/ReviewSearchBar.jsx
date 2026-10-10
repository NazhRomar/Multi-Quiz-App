import { useEffect, useRef } from 'react';
import { MIN_SEARCH_LENGTH } from '../../data/catalog.js';

const ARROW = (d) => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={d} />
  </svg>
);

// Review's own search, under the header: finds questions in this review
// whose text, context/code snippet or correct answer contain the query (the
// same matching as the home search). Card view steps between matches with
// the arrows (or Enter / Shift+Enter); list view just shows the matches.
// ReviewScreen owns the query and does the jumping.
export default function ReviewSearchBar({ query, onQueryChange, matchCount, matchPos, isListView, onPrev, onNext, onClose }) {
  const inputRef = useRef(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const typed = query.trim().length;
  const status =
    typed === 0
      ? null
      : typed < MIN_SEARCH_LENGTH
        ? `Type ${MIN_SEARCH_LENGTH}+ characters`
        : matchCount === 0
          ? 'No matches'
          : isListView || matchPos < 0
            ? `${matchCount} ${matchCount === 1 ? 'match' : 'matches'}`
            : `${matchPos + 1} of ${matchCount}`;
  const canStep = !isListView && typed >= MIN_SEARCH_LENGTH && matchCount > 0;

  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'Enter' && canStep) {
      e.preventDefault();
      (e.shiftKey ? onPrev : onNext)();
    }
  };

  return (
    <div className="review-search" role="search">
      <input
        ref={inputRef}
        type="search"
        className="menu-search-input review-search-input"
        placeholder="Search questions and answers in this review..."
        aria-label="Search this review"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
      {status && (
        <span className="review-search-status" aria-live="polite">
          {status}
        </span>
      )}
      {!isListView && (
        <>
          <button type="button" className="review-search-btn" onClick={onPrev} disabled={!canStep} aria-label="Previous match">
            {ARROW('M10 3.5 5.5 8l4.5 4.5')}
          </button>
          <button type="button" className="review-search-btn" onClick={onNext} disabled={!canStep} aria-label="Next match">
            {ARROW('M6 3.5 10.5 8 6 12.5')}
          </button>
        </>
      )}
      <button type="button" className="review-search-btn" onClick={onClose} aria-label="Close search">
        {ARROW('M4 4l8 8M12 4l-8 8')}
      </button>
    </div>
  );
}
