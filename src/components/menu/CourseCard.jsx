import { buildRenderUnits } from '../../data/catalog.js';
import QuizSeries from './QuizSeries.jsx';
import QuizRow from './QuizRow.jsx';

export default function CourseCard({ course, quizzes, onOpen }) {
  const units = buildRenderUnits(quizzes);
  return (
    <div className="course-card">
      <div className="course-card-header">
        <h3>{course}</h3>
        <span className="course-count">
          {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'}
        </span>
      </div>
      <div className="quiz-list">
        {units.map((unit, i) =>
          unit.type === 'series' ? (
            <QuizSeries key={unit.name} unit={unit} onOpen={onOpen} />
          ) : (
            <QuizRow key={i} quiz={unit.quiz} label={unit.label} onOpen={() => onOpen(unit.quiz)} />
          )
        )}
      </div>
    </div>
  );
}
