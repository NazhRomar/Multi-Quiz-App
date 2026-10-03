import { useApp } from '../../state/AppContext.jsx';
import CourseCard from './CourseCard.jsx';

// defaultCollapsed: whether the term starts folded before it's ever been
// toggled (every term but the newest); a saved toggle overrides it.
export default function TermSection({ term, onOpen, selection, forceExpanded = false, defaultCollapsed = false }) {
  const { state, dispatch } = useApp();
  const savedCollapsed = state.collapsedTerms[term.key];
  const isFolded = savedCollapsed ?? defaultCollapsed;
  const isCollapsed = !forceExpanded && isFolded;
  const termQuizCount = term.courses.reduce((sum, course) => sum + course.quizzes.length, 0);

  return (
    <section className={`term-section ${isCollapsed ? 'collapsed' : ''}`}>
      <h2 className="term-header" onClick={() => dispatch({ type: 'TOGGLE_TERM', payload: { term: term.key, collapsed: !isFolded } })}>
        <span className="term-toggle-icon">▾</span>
        <span className="term-title-text">{term.displayName}</span>
        <span className="term-count">
          {termQuizCount} {termQuizCount === 1 ? 'quiz' : 'quizzes'}
        </span>
      </h2>
      <div className="term-content">
        {term.courses.map((course) => (
          <CourseCard
            key={course.key}
            course={course}
            foldKey={`${term.key}/${course.key}`}
            forceExpanded={forceExpanded}
            onOpen={(quiz) => onOpen(course, quiz)}
            selection={selection}
          />
        ))}
      </div>
    </section>
  );
}
