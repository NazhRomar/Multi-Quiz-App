import { useState } from 'react';

// A Google profile photo, or the name's initial when there's none (or it
// fails to load). no-referrer: Google's photo host can refuse requests that
// carry another site's referrer.
export default function Avatar({ name, url, size = 28 }) {
  const [failed, setFailed] = useState(false);
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.42 }} aria-hidden="true">
      {url && !failed ? <img src={url} alt="" referrerPolicy="no-referrer" onError={() => setFailed(true)} /> : initial}
    </span>
  );
}
