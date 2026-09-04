import { useApp } from '../../state/AppContext.jsx';
import CourseCard from './CourseCard.jsx';

export default function TermSection({ term, courses, onOpen }) {
  const { state, dispatch } = useApp();
  const isCollapsed = !!state.collapsedTerms[term];
  const termQuizCount = Object.values(courses).reduce((sum, quizzes) => sum + quizzes.length, 0);

  return (
    <section className={`term-section ${isCollapsed ? 'collapsed' : ''}`}>
      <h2 className="term-header" onClick={() => dispatch({ type: 'TOGGLE_TERM', payload: { term } })}>
        <span className="term-toggle-icon">▾</span>
        <span className="term-title-text">{term}</span>
        <span className="term-count">
          {termQuizCount} {termQuizCount === 1 ? 'quiz' : 'quizzes'}
        </span>
      </h2>
      <div className="term-content">
        {Object.entries(courses).map(([course, quizzes]) => (
          <CourseCard key={course} course={course} quizzes={quizzes} onOpen={(quiz) => onOpen(course, quiz)} />
        ))}
      </div>
    </section>
  );
}
