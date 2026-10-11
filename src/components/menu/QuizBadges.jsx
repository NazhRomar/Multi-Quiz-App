// Deliberately says nothing. The flag name is the codename; the badge is
// not supposed to explain itself to whoever is reading over your shoulder.
export const SOURCED_TITLE = '???';
export const UNOFFICIAL_TITLE =
  'Unofficial';
export const UNVERIFIED_TITLE = 'Unverified';
export const VERIFIED_TITLE = 'Verified';

// Scalloped seal with a tick, the way a social-network verified badge reads:
// solid fill in the badge colour with the check sitting on top in white, so it
// holds up on both themes without needing to know the page background. The
// twelve lobes are quadratic curves between valley points, peaking at r=7.15
// in a 16-box — the control points sit outside the box on purpose, the curve
// itself does not.
export const VerifiedIcon = () => (
  <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
    <path
      fill="currentColor"
      d="M13.65 6.49Q16.65 8.00 13.65 9.51Q15.49 12.32 12.14 12.14Q12.32 15.49 9.51 13.65Q8.00 16.65 6.49 13.65Q3.68 15.49 3.86 12.14Q0.51 12.32 2.35 9.51Q-0.65 8.00 2.35 6.49Q0.51 3.68 3.86 3.86Q3.68 0.51 6.49 2.35Q8.00 -0.65 9.51 2.35Q12.32 0.51 12.14 3.86Q15.49 3.68 13.65 6.49Z"
    />
    <path
      d="M5.15 8.25 7.05 10.15 10.9 6.1"
      fill="none"
      stroke="#fff"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Flask: a quiz brewed here rather than handed out by the course.
export const UnofficialIcon = () => (
  <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6.3 2.2v5.1L3.4 12.6a1 1 0 0 0 .87 1.5h7.46a1 1 0 0 0 .87-1.5L9.7 7.3V2.2" />
    <path d="M5.1 2.2h5.8" />
    <path d="M4.7 10.6h6.6" />
  </svg>
);

// Ring of eight lobes around eight dots: see SOURCED_TITLE. Each lobe is the
// part of an r=2.16 disc, centred on the outer edge, that falls inside the
// r=7.2 ring; the dots sit halfway in, on the same eight spokes.
const SOURCED_DOTS = [
  [8, 4.4], [10.55, 5.45], [11.6, 8], [10.55, 10.55],
  [8, 11.6], [5.45, 10.55], [4.4, 8], [5.45, 5.45],
];

export const SourcedIcon = () => (
  <svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor" aria-hidden="true">
    <path d="M5.86 1.12A7.2 7.2 0 0 1 10.14 1.12A2.16 2.16 0 1 1 5.86 1.12ZM11.35 1.63A7.2 7.2 0 0 1 14.37 4.65A2.16 2.16 0 1 1 11.35 1.63ZM14.88 5.86A7.2 7.2 0 0 1 14.88 10.14A2.16 2.16 0 1 1 14.88 5.86ZM14.37 11.35A7.2 7.2 0 0 1 11.35 14.37A2.16 2.16 0 1 1 14.37 11.35ZM10.14 14.88A7.2 7.2 0 0 1 5.86 14.88A2.16 2.16 0 1 1 10.14 14.88ZM4.65 14.37A7.2 7.2 0 0 1 1.63 11.35A2.16 2.16 0 1 1 4.65 14.37ZM1.12 10.14A7.2 7.2 0 0 1 1.12 5.86A2.16 2.16 0 1 1 1.12 10.14ZM1.63 4.65A7.2 7.2 0 0 1 4.65 1.63A2.16 2.16 0 1 1 1.63 4.65Z" />
    {SOURCED_DOTS.map(([cx, cy]) => (
      <circle key={`${cx},${cy}`} cx={cx} cy={cy} r="0.72" />
    ))}
  </svg>
);

// Warning triangle: the answers have not been checked by hand.
export const UnverifiedIcon = () => (
  <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6.9 2.6 1.5 12.1a1.25 1.25 0 0 0 1.1 1.9h10.8a1.25 1.25 0 0 0 1.1-1.9L9.1 2.6a1.25 1.25 0 0 0-2.2 0Z" />
    <path d="M8 6.2v2.9" />
    <path d="M8 11.4h.01" />
  </svg>
);

// The badges a quiz can carry on the home menu, in order: the tick sits right
// after the name the way a social-network one does, then where the material
// came from, who wrote the questions, whether the answers are checked. They
// are independent, so a quiz can show any combination — including the tick
// beside the warning triangle, which is not a contradiction: one is about
// where the questions came from, the other about whether the answer key has
// been checked by hand.
export default function QuizBadges({ badges }) {
  return (
    <>
      {badges.verified && (
        <span className="quiz-badge quiz-badge--verified" title={VERIFIED_TITLE}>
          <VerifiedIcon />
        </span>
      )}
      {badges.unethicallySourced && (
        <span className="quiz-badge quiz-badge--sourced" title={SOURCED_TITLE}>
          <SourcedIcon />
        </span>
      )}
      {badges.unofficial && (
        <span className="quiz-badge quiz-badge--unofficial" title={UNOFFICIAL_TITLE}>
          <UnofficialIcon />
        </span>
      )}
      {badges.unverified && (
        <span className="quiz-badge quiz-badge--unverified" title={UNVERIFIED_TITLE}>
          <UnverifiedIcon />
        </span>
      )}
    </>
  );
}
