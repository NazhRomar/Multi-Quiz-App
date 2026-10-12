import { useEffect, useRef } from 'react';

const FLUSH_EVERY_MS = 15000;

// Times the attempt for the result screen: only while the quiz screen is
// up and the tab is visible, so leaving the tab, or exiting to the menu and
// resuming tomorrow, doesn't count. Time is banked into state.elapsedMs
// (ADD_ELAPSED) every 15s and whenever the tab hides, so a reload loses at
// most the last few seconds. Returns take(): the unbanked time, which the
// submit adds to elapsedMs for the final duration. attemptKey changes when
// a new attempt starts under the same screen (Restart), dropping the old
// attempt's unbanked time.
export function useAttemptClock(dispatch, attemptKey) {
  const segmentStart = useRef(null);

  useEffect(() => {
    segmentStart.current = document.hidden ? null : Date.now();
  }, [attemptKey]);

  const take = () => {
    if (segmentStart.current === null) return 0;
    const now = Date.now();
    const ms = now - segmentStart.current;
    segmentStart.current = now;
    return ms;
  };

  useEffect(() => {
    const bank = () => {
      const ms = take();
      if (ms > 0) dispatch({ type: 'ADD_ELAPSED', payload: ms });
    };
    const onVisibility = () => {
      if (document.hidden) {
        bank();
        segmentStart.current = null;
      } else {
        segmentStart.current = Date.now();
      }
    };
    const timer = setInterval(bank, FLUSH_EVERY_MS);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
      bank();
      segmentStart.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return take;
}
