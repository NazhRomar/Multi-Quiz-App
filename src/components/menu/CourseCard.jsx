import { buildRenderUnits } from '../../data/catalog.js';
import QuizSeries from './QuizSeries.jsx';
import QuizRow from './QuizRow.jsx';

function RenderUnits({ units, onOpen, isSelected }) {
  return units.map((unit, i) =>
    unit.type === 'series' ? (
      <QuizSeries key={unit.name} unit={unit} onOpen={onOpen} isSelected={isSelected} />
    ) : (
      <QuizRow key={i} quiz={unit.quiz} label={unit.label} onOpen={() => onOpen(unit.quiz)} selected={isSelected(unit.quiz)} />
    )
  );
}

// selection: null normally; { selected, toggleQuizzes } while the home menu
// is in Multi Quiz selection mode.
export default function CourseCard({ course, onOpen, selection }) {
  const { quizzes } = course;
  const { sections, ungrouped } = buildRenderUnits(course);
  const isSelected = selection ? (quiz) => selection.selected.has(quiz.id) : () => undefined;
  const allSelected = selection && quizzes.every((q) => selection.selected.has(q.id));
  return (
    <div className="course-card">
      <div className="course-card-header">
        <h3>{course.displayName}</h3>
        <span className="course-count">
          {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'}
        </span>
        {/* Always mounted so it can fade in/out with Multi mode (style.css). */}
        <button
          className={`btn-select-all ${selection ? 'btn-select-all--visible' : ''}`}
          onClick={() => selection?.toggleQuizzes(quizzes)}
          inert={!selection}
        >
          {allSelected ? 'Deselect all' : 'Select all'}
        </button>
      </div>
      {/* A subject with no declared sections (every subject today, unless
          its _meta.json opts in) renders exactly like before: one flat
          list, no section headers. */}
      {sections.length === 0 ? (
        <div className="quiz-list">
          <RenderUnits units={ungrouped} onOpen={onOpen} isSelected={isSelected} />
        </div>
      ) : (
        <>
          {sections
            .filter((section) => section.units.length > 0)
            .map((section) => (
              <div className="quiz-section" key={section.id}>
                <div className="quiz-section-header">{section.name}</div>
                <div className="quiz-list">
                  <RenderUnits units={section.units} onOpen={onOpen} isSelected={isSelected} />
                </div>
              </div>
            ))}
          {ungrouped.length > 0 && (
            <div className="quiz-section" key="__ungrouped">
              <div className="quiz-section-header">Other</div>
              <div className="quiz-list">
                <RenderUnits units={ungrouped} onOpen={onOpen} isSelected={isSelected} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
