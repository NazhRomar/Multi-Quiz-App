import { useAuth, dismissAuthNotice } from '../../utils/auth.js';

// Why a sign-in didn't work (e.g. a non-UST account), until dismissed.
// Styled like UpdateToast, minus the timer: it's worth actually reading.
export default function AuthNotice() {
  const { notice } = useAuth();
  if (!notice) return null;
  return (
    <div className="update-toast auth-notice" role="alert">
      <span className="update-toast-text">{notice}</span>
      <button type="button" className="update-toast-close" aria-label="Dismiss" onClick={dismissAuthNotice}>
        ×
      </button>
    </div>
  );
}
