import { buildRenderUnits } from '../../data/catalog.js';
import QuizSeries from './QuizSeries.jsx';
import QuizRow from './QuizRow.jsx';

// selection: null normally; { selected, toggleQuizzes } while the home menu
// is in Multi Quiz selection mode.
export default function CourseCard({ course, quizzes, onOpen, selection }) {
  const units = buildRenderUnits(quizzes);
  const isSelected = selection ? (quiz) => selection.selected.has(quiz.id) : () => undefined;
  const allSelected = selection && quizzes.every((q) => selection.selected.has(q.id));
  return (
    <div className="course-card">
      <div className="course-card-header">
        <h3>{course}</h3>
        <span className="course-count">
          {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'}
        </span>
        {selection && (
          <button className="btn-select-all" onClick={() => selection.toggleQuizzes(quizzes)}>
            {allSelected ? 'Deselect all' : 'Select all'}
          </button>
        )}
      </div>
      <div className="quiz-list">
        {units.map((unit, i) =>
          unit.type === 'series' ? (
            <QuizSeries key={unit.name} unit={unit} onOpen={onOpen} isSelected={isSelected} />
          ) : (
            <QuizRow key={i} quiz={unit.quiz} label={unit.label} onOpen={() => onOpen(unit.quiz)} selected={isSelected(unit.quiz)} />
          )
        )}
      </div>
    </div>
  );
}
