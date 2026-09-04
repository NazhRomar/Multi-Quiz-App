import { useEffect, useRef } from 'react';
import { renderHtml } from '../../../utils/renderHtml.js';

// Ports setupDragAndDrop()/saveDragDropState() as native HTML5 drag events,
// delegated on the board's root ref instead of re-querying/re-binding on
// every render. After any drop, the DOM is read back (same as
// saveDragDropState did) and the resulting term->match mapping is reported
// up via onDrop, so React state stays the source of truth on the next render.
export default function DragDropBoard({ question, savedState, isLocked, onDrop }) {
  const boardRef = useRef(null);
  const draggedRef = useRef(null);
  const allMatches = question.pairs.map((p) => p.match);
  const savedMatches = savedState.value || {};

  useEffect(() => {
    if (isLocked) return;
    const root = boardRef.current;
    if (!root) return;

    function onDragStart(e) {
      const item = e.target.closest('.drag-item');
      if (!item) return;
      draggedRef.current = item;
      setTimeout(() => item.classList.add('dragging'), 0);
    }
    function onDragEnd(e) {
      const item = e.target.closest('.drag-item');
      if (!item) return;
      item.classList.remove('dragging');
      draggedRef.current = null;
      const currentState = {};
      root.querySelectorAll('.drop-zone').forEach((zone) => {
        const term = zone.getAttribute('data-term');
        const placed = zone.querySelector('.drag-item');
        if (placed) currentState[term] = placed.getAttribute('data-match');
      });
      onDrop(currentState);
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
      const dragged = draggedRef.current;
      if (dragged) {
        if (zone.classList.contains('drop-zone') && zone.children.length > 0) {
          root.querySelector('#items-bank')?.appendChild(zone.children[0]);
        }
        zone.appendChild(dragged);
      }
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
  }, [isLocked, question.id, onDrop]);

  return (
    <div className="matching-container" ref={boardRef}>
      {!isLocked && (
        <div className="items-bank" id="items-bank">
          {allMatches
            .filter((m) => !Object.values(savedMatches).includes(m))
            .map((m, i) => (
              <div className="drag-item" draggable="true" data-match={m} key={i} {...renderHtml(m)} />
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
                  <div className="drag-item" draggable={!isLocked} data-match={placedItem} {...renderHtml(placedItem)} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
