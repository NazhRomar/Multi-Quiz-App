import { useEffect, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { navSideLeft, navSideRight, navNearLeft, navNearRight } from './navPortalTargets.js';
import { useIsMobile } from '../../utils/useIsMobile.js';
import { EnterKeyIcon, LeftKeyIcon } from '../common/KeyIcons.jsx';

// Chevron for the mobile nav's expand toggle. Points down at rest; CSS
// flips it per row (#quiz-nav-top/#quiz-nav-bottom) and open state so it
// always points toward wherever the Restart/Exit panel will appear.
function CaretIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

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
// sourceTag: optional node (Multi's QuestionSource "nav" variant) rendered
// as the first child of both inline rows — CSS only shows it on phones:
// floating above the bottom bar, or on its own line below the top row's
// buttons. enterHint: the ⏎ keycap on Next/Finish. prevHint: the ← keycap
// on Previous. onRestart/onExit: wired up to a caret button that appears
// between Previous and Next on mobile, expanding the row to reveal them
// (otherwise only reachable via the header's hamburger menu there).
export function useNavRow({
  navLocation,
  isFirst,
  isLast,
  nextBlocked,
  isQuizMode,
  isListView,
  onPrev,
  onNext,
  onFinishQuiz,
  onDone,
  onRestart,
  onExit,
  submitReady,
  onSubmit,
  mobileSubmitButton,
  sourceTag,
  enterHint,
  prevHint,
}) {
  const isMobile = useIsMobile();
  const [expanded, setExpanded] = useState(false);
  // Mobile only ever offers Top or Bottom in the settings UI (see
  // AppSettingsFields) — clamp actual rendering to match, so a value chosen
  // on a wider screen (sides/center/both/all) can't leave mobile in some
  // half-supported in-between layout.
  const effectiveLocation = isMobile ? (navLocation === 'up' ? 'up' : 'down') : navLocation;
  const positions = NAV_POSITION_MAP[effectiveLocation] || ['bottom'];
  const showSides = !isListView && positions.includes('center');
  const showNear = !isListView && positions.includes('sides');

  // A tap outside the (currently visible) row collapses the panel.
  useEffect(() => {
    if (!expanded) return undefined;
    const handler = (e) => {
      const top = document.getElementById('quiz-nav-top');
      const bottom = document.getElementById('quiz-nav-bottom');
      if (top?.contains(e.target) || bottom?.contains(e.target)) return;
      setExpanded(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [expanded]);

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

  // Navigating away collapses an open Restart/Exit panel.
  const wrapClose = (fn) => (fn ? () => { setExpanded(false); fn(); } : fn);

  if (isListView) {
    nextBtn = (
      <button className="btn-next" style={{ marginLeft: 'auto' }} onClick={onDone}>
        Done ✓
      </button>
    );
  } else {
    // A keycap takes the place of the button's arrow, saying which key
    // presses it. The arrow stays in the markup: it's back whenever there's
    // no keycap, and on touch screens, where CSS hides keycaps and
    // shows the arrow instead.
    const arrowClass = (keyed) => `nav-arrow ${keyed ? 'nav-arrow--keyed' : ''}`;
    prevBtn = (
      <button className="btn-prev" onClick={wrapClose(onPrev)} disabled={isFirst} {...(prevHint ? { 'aria-keyshortcuts': 'ArrowLeft' } : {})}>
        {prevHint && <LeftKeyIcon />}
        <span className={arrowClass(prevHint)}>← </span>
        Previous
      </button>
    );

    const disabled = isQuizMode && nextBlocked;
    // The ⏎ keycap: Enter presses this button once the quiz question is
    // answered (useEnterShortcut), and on any review card but the last.
    // Review's Done button never gets it.
    const enterProps = enterHint ? { 'aria-keyshortcuts': 'Enter' } : {};
    const enterIcon = enterHint && <EnterKeyIcon />;
    if (isLast) {
      nextBtn = isQuizMode ? (
        <button
          key="nav-next"
          className="btn-next"
          onClick={wrapClose(onFinishQuiz)}
          disabled={disabled}
          title={disabled ? 'Answer this question first' : undefined}
          {...enterProps}
        >
          Finish Quiz ✓{enterIcon}
        </button>
      ) : (
        <button key="nav-next" className="btn-next" onClick={onDone}>
          Done ✓
        </button>
      );
    } else {
      nextBtn = (
        <button
          key="nav-next"
          className="btn-next"
          onClick={wrapClose(onNext)}
          disabled={disabled}
          title={disabled ? 'Answer this question first' : undefined}
          {...enterProps}
        >
          Next<span className={arrowClass(enterHint)}> →</span>
          {enterIcon}
        </button>
      );
    }

    // Quiz options → Mobile Submit button: once this question could actually
    // be submitted (see QuizScreen's submitReady), Next transforms into a
    // Submit button standing in for the in-card one — so on mobile you don't
    // have to scroll back up to it. A different `key` than the buttons above
    // forces React to remount rather than patch the existing one in place,
    // which is what lets the CSS mount animation (style.css) play each time
    // it swaps either way.
    if (isMobile && mobileSubmitButton && submitReady) {
      nextBtn = (
        <button key="nav-submit" className="btn-next btn-next--submit" onClick={wrapClose(onSubmit)}>
          Submit ✓
        </button>
      );
    }
  }

  // Mobile-only: a caret between Previous and Next expands the row to
  // reveal Restart/Exit (otherwise only reachable via the header dropdown
  // there). Not offered in list view — it has no Previous/Next pair.
  const hasExpand = isMobile && !isListView && (onRestart || onExit);
  const expandBtn = hasExpand && (
    <button
      type="button"
      className="btn-nav-expand"
      onClick={() => setExpanded((e) => !e)}
      aria-expanded={expanded}
      aria-label={expanded ? 'Hide restart and exit' : 'Show restart and exit'}
    >
      <CaretIcon />
    </button>
  );
  const expandPanel = hasExpand && (
    <div className="nav-expand-panel">
      {onRestart && (
        <button className="btn-restart" onClick={wrapClose(onRestart)}>
          Restart
        </button>
      )}
      {onExit && (
        <button className="btn-exit" onClick={onExit}>
          Exit
        </button>
      )}
    </div>
  );
  const rowClass = `nav-row${hasExpand ? ' nav-row--paired' : ''}${expanded ? ' nav-row--expanded' : ''}`;

  const topRow = (
    <nav id="quiz-nav-top" className={rowClass} style={{ display: positions.includes('top') ? 'flex' : 'none' }}>
      {sourceTag}
      {prevBtn}
      {expandBtn}
      {nextBtn}
      {expandPanel}
    </nav>
  );
  const bottomRow = (
    <footer id="quiz-nav-bottom" className={rowClass} style={{ display: positions.includes('bottom') ? 'flex' : 'none' }}>
      {sourceTag}
      {prevBtn}
      {expandBtn}
      {nextBtn}
      {expandPanel}
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
