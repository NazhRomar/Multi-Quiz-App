import { useEffect, useState } from 'react';

// Matches the app's existing mobile CSS breakpoint (max-width: 600px), used
// wherever JS needs to know it too (native <select> options can't be
// conditionally shown via a media query).
export function useIsMobile(breakpointPx = 600) {
  const query = `(max-width: ${breakpointPx}px)`;
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);

  return isMobile;
}
