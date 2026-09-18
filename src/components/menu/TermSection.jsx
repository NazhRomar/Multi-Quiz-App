import { useApp } from '../../state/AppContext.jsx';
import CourseCard from './CourseCard.jsx';

export default function TermSection({ term, onOpen, selection, forceExpanded = false }) {
  const { state, dispatch } = useApp();
  const isCollapsed = !forceExpanded && !!state.collapsedTerms[term.key];
  const termQuizCount = term.courses.reduce((sum, course) => sum + course.quizzes.length, 0);

  return (
    <section className={`term-section ${isCollapsed ? 'collapsed' : ''}`}>
      <h2 className="term-header" onClick={() => dispatch({ type: 'TOGGLE_TERM', payload: { term: term.key } })}>
        <span className="term-toggle-icon">▾</span>
        <span className="term-title-text">{term.displayName}</span>
        <span className="term-count">
          {termQuizCount} {termQuizCount === 1 ? 'quiz' : 'quizzes'}
        </span>
      </h2>
      <div className="term-content">
        {term.courses.map((course) => (
          <CourseCard key={course.key} course={course} onOpen={(quiz) => onOpen(course, quiz)} selection={selection} />
        ))}
      </div>
    </section>
  );
}
