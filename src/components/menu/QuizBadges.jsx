const CANVAS_TITLE = 'From Canvas — built from the material posted on the course’s Canvas page.';
const UNOFFICIAL_TITLE =
  'Unofficial — this quiz was put together from the course material, it is not a quiz the course itself gave.';
const UNVERIFIED_TITLE = 'I (the AI) filled these answers in — no manual verification has been made yet.';

// Graduation cap: the source material came off Canvas.
const CanvasIcon = () => (
  <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14.4 6.6 8.7 9.2a1.6 1.6 0 0 1-1.4 0L1.6 6.6a.7.7 0 0 1 0-1.3l5.7-2.6a1.6 1.6 0 0 1 1.4 0l5.7 2.6a.7.7 0 0 1 0 1.3Z" />
    <path d="M14.7 6.1v3.9" />
    <path d="M4.2 7.7v2.6c0 1.1 1.7 2 3.8 2s3.8-.9 3.8-2V7.7" />
  </svg>
);

// Flask: a quiz brewed here rather than handed out by the course.
const UnofficialIcon = () => (
  <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6.3 2.2v5.1L3.4 12.6a1 1 0 0 0 .87 1.5h7.46a1 1 0 0 0 .87-1.5L9.7 7.3V2.2" />
    <path d="M5.1 2.2h5.8" />
    <path d="M4.7 10.6h6.6" />
  </svg>
);

// Warning triangle: the answers have not been checked by hand.
const UnverifiedIcon = () => (
  <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6.9 2.6 1.5 12.1a1.25 1.25 0 0 0 1.1 1.9h10.8a1.25 1.25 0 0 0 1.1-1.9L9.1 2.6a1.25 1.25 0 0 0-2.2 0Z" />
    <path d="M8 6.2v2.9" />
    <path d="M8 11.4h.01" />
  </svg>
);

// The badges a quiz can carry on the home menu, in order: where the material
// came from, who wrote the questions, whether the answers are checked. All
// three are independent, so a quiz can show any combination.
export default function QuizBadges({ data }) {
  return (
    <>
      {data.fromCanvas && (
        <span className="quiz-badge quiz-badge--canvas" title={CANVAS_TITLE}>
          <CanvasIcon />
        </span>
      )}
      {data.unofficial && (
        <span className="quiz-badge quiz-badge--unofficial" title={UNOFFICIAL_TITLE}>
          <UnofficialIcon />
        </span>
      )}
      {data.unverified && (
        <span className="quiz-badge quiz-badge--unverified" title={UNVERIFIED_TITLE}>
          <UnverifiedIcon />
        </span>
      )}
    </>
  );
}
