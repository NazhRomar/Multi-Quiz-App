import { useEffect, useRef, useState } from 'react';
import { renderHtml } from '../../../utils/renderHtml.js';

// Ports setupDragAndDrop()/saveDragDropState() as native HTML5 drag events,
// delegated on the board's root ref. Unlike the original (and unlike an
// earlier version of this component), the drop handler never moves DOM
// nodes itself — it only computes the new term->match mapping and reports
// it via onDrop. React owns 100% of the actual DOM placement on the next
// render. Mixing manual appendChild calls with React-rendered content in
// the same subtree desyncs React's reconciler from the real DOM (it still
// expects a node in its old parent), which throws a
// "removeChild: not a child of this node" crash the next time it renders —
// confirmed by testing this exact scenario.
//
// Tap/click (and Enter/Space) is an alternative to dragging — mainly for
// touch screens, where HTML5 drag doesn't fire: tap a bank item to pick it
// up (tap again to put it down), then tap an answer box to place it there
// (replacing what's in it). Tapping an item already in a box sends it back
// to the bank.
export default function DragDropBoard({ question, savedState, isLocked, onDrop, onSubmit }) {
  const boardRef = useRef(null);
  const draggedMatchRef = useRef(null);
  const [pickedMatch, setPickedMatch] = useState(null);
  // choicePool: the same items in a random order (applyShuffle, store.js) —
  // pairs order would list the bank in the rows' own answer order.
  const allMatches = question.choicePool || question.pairs.map((p) => p.match);
  const savedMatches = savedState.value || {};

  // The card component is reused across questions — drop any picked-up item.
  useEffect(() => setPickedMatch(null), [question.id, isLocked]);

  const placeMatch = (match, term) => {
    const nextState = { ...savedMatches };
    for (const t of Object.keys(nextState)) {
      if (nextState[t] === match) delete nextState[t];
    }
    if (term) nextState[term] = match;
    onDrop(nextState);
  };

  const onBankItemTap = (match) => setPickedMatch((cur) => (cur === match ? null : match));
  const onZoneTap = (term) => {
    if (pickedMatch) {
      placeMatch(pickedMatch, term);
      setPickedMatch(null);
    } else if (savedMatches[term]) {
      placeMatch(savedMatches[term], null); // back to the bank
    }
  };
  // Enter/Space act like a tap, for keyboard users.
  const tapProps = (onTap) =>
    isLocked
      ? {}
      : {
          role: 'button',
          tabIndex: 0,
          onClick: onTap,
          onKeyDown: (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onTap();
            }
          },
        };

  useEffect(() => {
    if (isLocked) return;
    const root = boardRef.current;
    if (!root) return;

    function onDragStart(e) {
      const item = e.target.closest('.drag-item');
      if (!item) return;
      setPickedMatch(null);
      draggedMatchRef.current = item.getAttribute('data-match');
      setTimeout(() => item.classList.add('dragging'), 0);
    }
    function onDragEnd(e) {
      const item = e.target.closest('.drag-item');
      if (item) item.classList.remove('dragging');
      draggedMatchRef.current = null;
    }
    function onDragOver(e) {
      const zone = e.target.closest('.drop-zone, .items-bank');
      if (!zone) return;
      e.preventDefault();
      zone.classList.add('drag-over');
    }
    function onDragLeave(e) {
      const zone = e.target.closest('.drop-zone, .items-bank');
      if (zone) zone.classList.remove('drag-over');
    }
    function onDropNative(e) {
      const zone = e.target.closest('.drop-zone, .items-bank');
      if (!zone) return;
      e.preventDefault();
      zone.classList.remove('drag-over');
      const match = draggedMatchRef.current;
      if (!match) return;
      // Whatever was already in the target zone is simply left
      // unreferenced — it falls back into the bank automatically, same as
      // the original. Dropping on the bank itself just unplaces the item.
      placeMatch(match, zone.classList.contains('drop-zone') ? zone.getAttribute('data-term') : null);
    }

    root.addEventListener('dragstart', onDragStart);
    root.addEventListener('dragend', onDragEnd);
    root.addEventListener('dragover', onDragOver);
    root.addEventListener('dragleave', onDragLeave);
    root.addEventListener('drop', onDropNative);
    return () => {
      root.removeEventListener('dragstart', onDragStart);
      root.removeEventListener('dragend', onDragEnd);
      root.removeEventListener('dragover', onDragOver);
      root.removeEventListener('dragleave', onDragLeave);
      root.removeEventListener('drop', onDropNative);
    };
  }, [isLocked, question.id, onDrop, savedMatches]);

  return (
    <>
      <div className={`matching-container ${pickedMatch ? 'matching-container--picking' : ''}`} ref={boardRef}>
        {!isLocked && (
          <div className="items-bank" id="items-bank">
            {allMatches
              .filter((m) => !Object.values(savedMatches).includes(m))
              .map((m, i) => (
                <div
                  className={`drag-item ${pickedMatch === m ? 'drag-item--picked' : ''}`}
                  draggable="true"
                  data-match={m}
                  key={m ?? i}
                  aria-pressed={pickedMatch === m}
                  {...tapProps(() => onBankItemTap(m))}
                  {...renderHtml(m)}
                />
              ))}
          </div>
        )}
        {!isLocked && <div className="drag-hint">Drag items into the boxes, or tap an item and then tap a box.</div>}
        <div className="matching-grid">
          {question.pairs.map((pair, i) => {
            const placedItem = savedMatches[pair.term];
            let dropClass = '';
            if (isLocked) dropClass = placedItem === pair.match ? 'match-correct' : 'match-wrong';
            return (
              <div className="match-row" key={i}>
                <div className="match-term" {...renderHtml(pair.term)} />
                <div
                  className={`drop-zone ${dropClass}`}
                  data-term={pair.term}
                  aria-label={pickedMatch ? 'Place here' : placedItem ? 'Remove' : undefined}
                  {...tapProps(() => onZoneTap(pair.term))}
                >
                  {placedItem && (
                    <div className="drag-item" draggable={!isLocked} data-match={placedItem} key={placedItem} {...renderHtml(placedItem)} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {!isLocked && (
        <button className="btn-check" style={{ marginTop: '1rem' }} onClick={onSubmit}>
          Submit
        </button>
      )}
    </>
  );
}
