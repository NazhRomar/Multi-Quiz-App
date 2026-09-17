import {
  CanvasIcon,
  UnofficialIcon,
  UnverifiedIcon,
  CANVAS_TITLE,
  UNOFFICIAL_TITLE,
  UNVERIFIED_TITLE,
} from './QuizBadges.jsx';

// The same three badges QuizBadges puts on a quiz, with what they mean. The
// full sentence stays in the tooltip, as it is on the badge itself.
const ITEMS = [
  {
    key: 'canvas',
    Icon: CanvasIcon,
    label: 'From Canvas',
    blurb: 'Built from material posted on the course’s Canvas page.',
    title: CANVAS_TITLE,
  },
  {
    key: 'unofficial',
    Icon: UnofficialIcon,
    label: 'Unofficial',
    blurb: 'The questions were written here, not given by the course.',
    title: UNOFFICIAL_TITLE,
  },
  {
    key: 'unverified',
    Icon: UnverifiedIcon,
    label: 'Unverified',
    blurb: 'Answers were AI-filled and have not been checked by hand.',
    title: UNVERIFIED_TITLE,
  },
];

const LegendItems = () => (
  <ul className="badge-legend-list">
    {ITEMS.map(({ key, Icon, label, blurb, title }) => (
      <li key={key} className="badge-legend-item">
        <span className={`quiz-badge quiz-badge--${key}`} title={title}>
          <Icon />
        </span>
        <span className="badge-legend-text">
          <strong>{label}</strong>
          <span className="badge-legend-blurb">{blurb}</span>
        </span>
      </li>
    ))}
  </ul>
);

export default function BadgeLegend() {
  return (
    <>
      {/* Wide screens: a sticky card in the gutter beside the menu, the same
          trick .q-source-aside uses beside a question card. */}
      <aside className="badge-legend-aside" aria-label="What the quiz icons mean">
        <div className="badge-legend-aside-inner">
          <div className="badge-legend-title">What the icons mean</div>
          <LegendItems />
        </div>
      </aside>
      {/* Narrower: there is no gutter to put it in, so it folds away rather
          than pushing the quiz list down the screen. */}
      <details className="badge-legend-fold">
        <summary>What do the icons mean?</summary>
        <LegendItems />
      </details>
    </>
  );
}
