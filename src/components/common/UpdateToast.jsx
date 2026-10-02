import { useEffect, useState } from 'react';
import { consumeUpdatedFlag } from '../../utils/appUpdate.js';
import ChangelogModal from '../menu/ChangelogModal.jsx';

const DURATION_MS = 7000;
const HAS_CHANGELOG = __CHANGELOG_COUNT__ > 0;

// "App updated", shown briefly after a load that brought in a new build
// (see utils/appUpdate.js). Read once per page load, at module level, so a
// remount can't consume it twice or show it again.
const justUpdated = consumeUpdatedFlag();

export default function UpdateToast() {
  const [visible, setVisible] = useState(justUpdated);
  const [showChangelog, setShowChangelog] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), DURATION_MS);
    return () => clearTimeout(timer);
  }, [visible]);

  return (
    <>
      {visible && (
        <div className="update-toast" role="status" style={{ '--toast-duration': `${DURATION_MS}ms` }}>
          <span className="update-toast-text">App Updated</span>
          {HAS_CHANGELOG && (
            <button
              type="button"
              className="update-toast-action"
              onClick={() => {
                setVisible(false);
                setShowChangelog(true);
              }}
            >
              See new changes
            </button>
          )}
          <button type="button" className="update-toast-close" aria-label="Dismiss" onClick={() => setVisible(false)}>
            ×
          </button>
          {/* Drains over the toast's lifetime, so it's clear when it'll go. */}
          <span className="update-toast-timer" aria-hidden="true" />
        </div>
      )}
      {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}
    </>
  );
}
