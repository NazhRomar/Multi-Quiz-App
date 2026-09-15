import { useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { navSideLeft, navSideRight, navNearLeft, navNearRight } from './navPortalTargets.js';
import { useIsMobile } from '../../utils/useIsMobile.js';

const NAV_POSITION_MAP = {
  up: ['top'],
  down: ['bottom'],
  sides: ['sides'],
  center: ['center'],
  both: ['top', 'bottom'],
  all: ['top', 'bottom', 'center'],
};

// Ports renderNavRow()/positionNearNav(). Returns the top/bottom inline nav
// rows plus the body-level portal content for the "sides"/"center" nav
// location settings, so the caller can place quiz-container content
// between the top and bottom rows in the actual DOM order.
// A return-key keycap, shown inside the quiz's Next/Finish button when Enter
// will press it. CSS hides it on touch-only devices (no keyboard).
function EnterKeyIcon() {
  return (
    <span className="enter-hint" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12.5 3.5v4a2 2 0 0 1-2 2H4" />
        <path d="M6.5 7L4 9.5 6.5 12" />
      </svg>
    </span>
  );
}

// sourceTag: optional node (Multi's QuestionSource "nav" variant) rendered
// as the first child of both inline rows — CSS only shows it on phones:
// floating above the bottom bar, or on its own line below the top row's
// buttons. enterHint: show the ⏎ keycap on the quiz's Next/Finish button.
export function useNavRow({ navLocation, isFirst, isLast, nextBlocked, isQuizMode, isListView, onPrev, onNext, onFinishQuiz, onDone, sourceTag, enterHint }) {
  const isMobile = useIsMobile();
  // Mobile only ever offers Top or Bottom in the settings UI (see
  // AppSettingsFields) — clamp actual rendering to match, so a value chosen
  // on a wider screen (sides/center/both/all) can't leave mobile in some
  // half-supported in-between layout.
  const effectiveLocation = isMobile ? (navLocation === 'up' ? 'up' : 'down') : navLocation;
  const positions = NAV_POSITION_MAP[effectiveLocation] || ['bottom'];
  const showSides = !isListView && positions.includes('center');
  const showNear = !isListView && positions.includes('sides');

  useLayoutEffect(() => {
    navSideLeft.style.display = showSides ? 'flex' : 'none';
    navSideRight.style.display = showSides ? 'flex' : 'none';
    navNearLeft.style.display = showNear ? 'flex' : 'none';
    navNearRight.style.display = showNear ? 'flex' : 'none';

    function positionNearNav() {
      const card = document.querySelector('.question-card');
      if (!card || navNearLeft.style.display !== 'flex') return;
      const rect = card.getBoundingClientRect();
      const gap = 16;
      navNearLeft.style.left = Math.max(8, rect.left - navNearLeft.offsetWidth - gap) + 'px';
      navNearRight.style.left = rect.right + gap + 'px';
    }
    positionNearNav();
    window.addEventListener('resize', positionNearNav);
    return () => window.removeEventListener('resize', positionNearNav);
  });

  useLayoutEffect(() => {
    return () => {
      navSideLeft.style.display = 'none';
      navSideRight.style.display = 'none';
      navNearLeft.style.display = 'none';
      navNearRight.style.display = 'none';
    };
  }, []);

  let prevBtn = null;
  let nextBtn = null;

  if (isListView) {
    nextBtn = (
      <button className="btn-next" style={{ marginLeft: 'auto' }} onClick={onDone}>
        Done ✓
      </button>
    );
  } else {
    prevBtn = (
      <button className="btn-prev" onClick={onPrev} disabled={isFirst}>
        ← Previous
      </button>
    );

    const disabled = isQuizMode && nextBlocked;
    // Quiz mode: once the question is answered, Enter triggers this button
    // (QuizScreen) — enterHint puts a ⏎ keycap inside it to say so.
    const enterProps = isQuizMode && enterHint ? { 'aria-keyshortcuts': 'Enter' } : {};
    const enterIcon = isQuizMode && enterHint && <EnterKeyIcon />;
    if (isLast) {
      nextBtn = isQuizMode ? (
        <button className="btn-next" onClick={onFinishQuiz} disabled={disabled} title={disabled ? 'Answer this question first' : undefined} {...enterProps}>
          Finish Quiz ✓{enterIcon}
        </button>
      ) : (
        <button className="btn-next" onClick={onDone}>
          Done ✓
        </button>
      );
    } else {
      nextBtn = (
        <button className="btn-next" onClick={onNext} disabled={disabled} title={disabled ? 'Answer this question first' : undefined} {...enterProps}>
          Next →{enterIcon}
        </button>
      );
    }
  }

  const topRow = (
    <nav id="quiz-nav-top" className="nav-row" style={{ display: positions.includes('top') ? 'flex' : 'none' }}>
      {sourceTag}
      {prevBtn}
      {nextBtn}
    </nav>
  );
  const bottomRow = (
    <footer id="quiz-nav-bottom" className="nav-row" style={{ display: positions.includes('bottom') ? 'flex' : 'none' }}>
      {sourceTag}
      {prevBtn}
      {nextBtn}
    </footer>
  );

  const portals = (
    <>
      {showSides && createPortal(prevBtn, navSideLeft)}
      {showSides && createPortal(nextBtn, navSideRight)}
      {showNear && createPortal(prevBtn, navNearLeft)}
      {showNear && createPortal(nextBtn, navNearRight)}
    </>
  );

  return { topRow, bottomRow, portals };
}
