export default function SubmitConfirmModal({ unanswered, onCancel, onConfirm }) {
  const message =
    unanswered > 0
      ? `You have ${unanswered} unanswered question${unanswered === 1 ? '' : 's'}. Are you sure you want to submit?`
      : `Are you sure you want to submit your quiz?`;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="modal-card">
        <div className="modal-header">
          <h3>Submit Quiz?</h3>
          <button className="modal-close" onClick={onCancel} aria-label="Close">
            ✕
          </button>
        </div>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn-prev" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn-next" onClick={onConfirm}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
