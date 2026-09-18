import { useNavigate } from 'react-router-dom';
import { useApp } from '../state/AppContext.jsx';
import { quizUrlFor } from '../data/catalog.js';

// Used by HomeScreen (via TermSection/CourseCard): in Multi mode tapping a
// quiz toggles it in the selection instead of opening it; otherwise it
// navigates straight to the quiz/review route, which starts it (see
// QuizSessionRoute).
export function useQuizOpener() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const { homeMode } = state;
  const selected = new Set(state.multiSelection);

  const toggleQuizzes = (quizzes) => {
    const next = new Set(selected);
    const allSelected = quizzes.every((q) => next.has(q.id));
    quizzes.forEach((q) => (allSelected ? next.delete(q.id) : next.add(q.id)));
    dispatch({ type: 'SET_MULTI_SELECTION', payload: [...next] });
  };

  const openQuiz = (term, course, quiz) => {
    if (homeMode.multi) toggleQuizzes([quiz]);
    else navigate(quizUrlFor(term, course, quiz, homeMode.review ? 'review' : 'quiz'));
  };

  return { openQuiz, toggleQuizzes, selected, selection: homeMode.multi ? { selected, toggleQuizzes } : null };
}
