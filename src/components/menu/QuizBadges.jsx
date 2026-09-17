// Deliberately says nothing. The flag name is the codename; the badge is
// not supposed to explain itself to whoever is reading over your shoulder.
export const SOURCED_TITLE = '???';
export const UNOFFICIAL_TITLE =
  'Unofficial — this quiz was put together from the course material, it is not a quiz the course itself gave.';
export const UNVERIFIED_TITLE = 'I (the AI) filled these answers in — no manual verification has been made yet.';

// Flask: a quiz brewed here rather than handed out by the course.
export const UnofficialIcon = () => (
  <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6.3 2.2v5.1L3.4 12.6a1 1 0 0 0 .87 1.5h7.46a1 1 0 0 0 .87-1.5L9.7 7.3V2.2" />
    <path d="M5.1 2.2h5.8" />
    <path d="M4.7 10.6h6.6" />
  </svg>
);

// Mask: see SOURCED_TITLE.
export const SourcedIcon = () => (
  <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 5.2a1.4 1.4 0 0 1 1.4-1.4h9.2A1.4 1.4 0 0 1 14 5.2v2c0 2.1-1.5 3.8-3.4 3.8-1 0-1.9-.6-2.6-1.4-.7.8-1.6 1.4-2.6 1.4C3.5 11 2 9.3 2 7.2Z" />
    <circle cx="5.3" cy="6.7" r="1.15" />
    <circle cx="10.7" cy="6.7" r="1.15" />
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

// The badges a quiz can carry on the home menu, in order: where the material
// came from, who wrote the questions, whether the answers are checked. They
// are independent, so a quiz can show any combination.
export default function QuizBadges({ data }) {
  return (
    <>
      {data.unethicallySourced && (
        <span className="quiz-badge quiz-badge--sourced" title={SOURCED_TITLE}>
          <SourcedIcon />
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
