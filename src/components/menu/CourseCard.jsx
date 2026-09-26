import { useNavigate } from 'react-router-dom';
import { buildRenderUnits } from '../../data/catalog.js';
import { notesForSubject } from '../../notes/index.js';
import QuizSeries from './QuizSeries.jsx';
import QuizRow from './QuizRow.jsx';

function RenderUnits({ units, onOpen, isSelected }) {
  return units.map((unit, i) =>
    unit.type === 'series' ? (
      <QuizSeries key={unit.key} unit={unit} onOpen={onOpen} isSelected={isSelected} />
    ) : (
      <QuizRow key={i} quiz={unit.quiz} label={unit.label} onOpen={() => onOpen(unit.quiz)} selected={isSelected(unit.quiz)} />
    )
  );
}

// selection: null normally; { selected, toggleQuizzes } while the home menu
// is in Multi Quiz selection mode.
export default function CourseCard({ course, onOpen, selection }) {
  const { quizzes } = course;
  const sections = buildRenderUnits(course);
  const isSelected = selection ? (quiz) => selection.selected.has(quiz.id) : () => undefined;
  const allSelected = selection && quizzes.every((q) => selection.selected.has(q.id));
  const notes = notesForSubject(course.id);
  const navigate = useNavigate();
  return (
    <div className="course-card">
      <div className="course-card-header">
        <h3>{course.displayName}</h3>
        <span className="course-count">
          {quizzes.length} {quizzes.length === 1 ? 'quiz' : 'quizzes'}
        </span>
        {/* Study notes (src/notes/), if this subject has any. */}
        {notes.map((note) => (
          <button key={note.slug} type="button" className="btn-notes" onClick={() => navigate(`/notes/${note.slug}`)}>
            <svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 1.75h5.5L12.5 4.75v9.5h-8.5z" />
              <path d="M6.5 7.5h4M6.5 10h4" />
            </svg>
            Notes
          </button>
        ))}
        {/* Always mounted so it can fade in/out with Multi mode (style.css). */}
        <button
          className={`btn-select-all ${selection ? 'btn-select-all--visible' : ''}`}
          onClick={() => selection?.toggleQuizzes(quizzes)}
          inert={!selection}
        >
          {allSelected ? 'Deselect all' : 'Select all'}
        </button>
      </div>
      {sections.map((section) => (
        <div className="quiz-section" key={section.key}>
          {/* A section's own name is redundant often enough (a lone
              section wrapping a subject's whole quiz list, or one that
              just repeats the subject's name) that its _meta.json can
              turn the header off entirely via showLabel — see
              catalog.js/buildRenderUnits. */}
          {section.showLabel && (
            <div className="quiz-section-header">
              {section.name}
              {section.showCount && (
                <span className="quiz-section-count">
                  {section.count} {section.count === 1 ? 'quiz' : 'quizzes'}
                </span>
              )}
            </div>
          )}
          <div className="quiz-list">
            <RenderUnits units={section.units} onOpen={onOpen} isSelected={isSelected} />
          </div>
        </div>
      ))}
    </div>
  );
}
