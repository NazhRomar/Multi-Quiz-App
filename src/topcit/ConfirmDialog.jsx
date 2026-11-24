import { useEffect, useRef } from 'react';

// The app's modal (modal-overlay / modal-card, the same as the quiz's
// Submit dialog), for TOPCIT's "Finish?", "Leave?" and "Reset?" questions.
// Enter confirms (the button is focused); Escape, ✕ or a click outside
// cancels.
export default function ConfirmDialog({ title, message, okLabel, onOk, onCancel }) {
  const okRef = useRef(null);
  // The page re-renders every second while the quiz clock runs, handing a
  // new onCancel each time; read it through a ref so the effect (and the
  // focus) runs once, when the dialog opens.
  const cancelRef = useRef(onCancel);
  cancelRef.current = onCancel;

  useEffect(() => {
    okRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') cancelRef.current();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="topcit-dialog-title">
        <div className="modal-header">
          <h3 id="topcit-dialog-title">{title}</h3>
          <button type="button" className="modal-close" onClick={onCancel} aria-label="Close">
            ✕
          </button>
        </div>
        <p>{message}</p>
        <div className="modal-actions">
          <button type="button" className="btn-prev" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn-next" ref={okRef} onClick={onOk}>
            {okLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
