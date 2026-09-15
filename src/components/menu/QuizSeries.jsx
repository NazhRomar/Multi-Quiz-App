import QuizChip from './QuizChip.jsx';

export default function QuizSeries({ unit, onOpen, isSelected }) {
  return (
    <div className="quiz-series">
      <div className="quiz-series-header">
        <span>{unit.name}</span>
        <span className="quiz-series-count">{unit.items.length}</span>
      </div>
      <div className="quiz-series-chips">
        {unit.items.map(({ quiz, label }) => (
          <QuizChip key={label} quiz={quiz} label={label} onOpen={() => onOpen(quiz)} selected={isSelected(quiz)} />
        ))}
      </div>
    </div>
  );
}
