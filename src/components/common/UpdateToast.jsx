import { useEffect, useState } from 'react';
import { consumeUpdatedFlag } from '../../utils/appUpdate.js';

// "App updated", shown briefly after a load that brought in a new build
// (see utils/appUpdate.js). Read once per page load, at module level, so a
// remount can't consume it twice or show it again.
const justUpdated = consumeUpdatedFlag();

export default function UpdateToast() {
  const [visible, setVisible] = useState(justUpdated);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), 3000);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;
  return (
    <div className="update-toast" role="status" onClick={() => setVisible(false)}>
      App Updated
    </div>
  );
}
