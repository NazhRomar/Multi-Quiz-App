import { useEffect, useRef } from 'react';

// The app's modal look (modal-overlay / modal-card), for TOPCIT's
// "Finish?", "Leave?" and "Reset?" questions. Enter confirms (the button is
// focused), Escape or a click outside cancels.
export default function ConfirmDialog({ message, okLabel, onOk, onCancel }) {
  const okRef = useRef(null);

  useEffect(() => {
    okRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="modal-card" role="dialog" aria-modal="true" aria-label={message}>
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
