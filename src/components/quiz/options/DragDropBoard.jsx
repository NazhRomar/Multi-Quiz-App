import { useEffect, useRef } from 'react';
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
export default function DragDropBoard({ question, savedState, isLocked, onDrop, onSubmit }) {
  const boardRef = useRef(null);
  const draggedMatchRef = useRef(null);
  const allMatches = question.pairs.map((p) => p.match);
  const savedMatches = savedState.value || {};

  useEffect(() => {
    if (isLocked) return;
    const root = boardRef.current;
    if (!root) return;

    function onDragStart(e) {
      const item = e.target.closest('.drag-item');
      if (!item) return;
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

      const nextState = { ...savedMatches };
      for (const term of Object.keys(nextState)) {
        if (nextState[term] === match) delete nextState[term];
      }
      if (zone.classList.contains('drop-zone')) {
        // Whatever was already in this zone is simply left unreferenced —
        // it falls back into the bank automatically, same as the original.
        nextState[zone.getAttribute('data-term')] = match;
      }
      onDrop(nextState);
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
      <div className="matching-container" ref={boardRef}>
        {!isLocked && (
          <div className="items-bank" id="items-bank">
            {allMatches
              .filter((m) => !Object.values(savedMatches).includes(m))
              .map((m, i) => (
                <div className="drag-item" draggable="true" data-match={m} key={m ?? i} {...renderHtml(m)} />
              ))}
          </div>
        )}
        <div className="matching-grid">
          {question.pairs.map((pair, i) => {
            const placedItem = savedMatches[pair.term];
            let dropClass = '';
            if (isLocked) dropClass = placedItem === pair.match ? 'match-correct' : 'match-wrong';
            return (
              <div className="match-row" key={i}>
                <div className="match-term" {...renderHtml(pair.term)} />
                <div className={`drop-zone ${dropClass}`} data-term={pair.term}>
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
