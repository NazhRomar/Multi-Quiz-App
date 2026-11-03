import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../state/AppContext.jsx';
import { quizUrlFor } from '../../data/catalog.js';
import { NEW_FOR_DAYS } from '../../utils/newQuizzes.js';
import { useWhatsNew } from '../../utils/whatsNew.js';
import ChangelogModal, { formatDay } from './ChangelogModal.jsx';

const HAS_CHANGELOG = __CHANGELOG_COUNT__ > 0;

// Recent quizzes under one heading per day, then per subject within it.
function groupByDayAndCourse(entries) {
  const days = [];
  for (const entry of entries) {
    let day = days[days.length - 1];
    if (!day || day.date !== entry.quiz.addedOn) {
      day = { date: entry.quiz.addedOn, courses: [] };
      days.push(day);
    }
    let group = day.courses.find((c) => c.term === entry.term && c.course === entry.course);
    if (!group) {
      group = { term: entry.term, course: entry.course, quizzes: [] };
      day.courses.push(group);
    }
    group.quizzes.push(entry.quiz);
  }
  return days;
}

// New features and recently added quizzes (utils/whatsNew.js). Home opens it
// by itself while something here is unseen; closing it, however that
// happens, marks everything seen.
export default function WhatsNewModal({ onClose }) {
  const { state } = useApp();
  const navigate = useNavigate();
  const { features, recentQuizzes, isNewFeature, isNewQuiz, markAllSeen } = useWhatsNew();
  const [showChangelog, setShowChangelog] = useState(false);

  const close = () => {
    markAllSeen();
    onClose();
  };

  const go = (to) => {
    close();
    navigate(to);
  };

  // Esc closes, like a dialog should; with the changelog open on top, Esc
  // is that one's to handle.
  useEffect(() => {
    if (showChangelog) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const days = groupByDayAndCourse(recentQuizzes);
  const mode = state.homeMode.review ? 'review' : 'quiz';

  return (
    <>
      <div
        className="modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
      >
        <div className="modal-card changelog-card" role="dialog" aria-modal="true" aria-label="What's new">
          <div className="modal-header">
            <h3>What&apos;s new</h3>
            <button className="modal-close" onClick={close} aria-label="Close">
              ✕
            </button>
          </div>
          <div className="changelog-scroll">
            {features.length > 0 && (
              <section className="whats-new-section">
                <h4 className="changelog-day-label">Features</h4>
                <ul className="whats-new-features">
                  {features.map((feature) => (
                    <li key={feature.id} className="whats-new-feature">
                      <div className="whats-new-feature-head">
                        {isNewFeature(feature) && <span className="whats-new-dot" role="img" aria-label="New" title="New" />}
                        <span className="whats-new-feature-title">{feature.title}</span>
                        <span className="whats-new-date">{formatDay(feature.date)}</span>
                      </div>
                      <p className="whats-new-feature-body">{feature.body}</p>
                      {feature.link && (
                        <button type="button" className="whats-new-feature-link" onClick={() => go(feature.link.to)}>
                          {feature.link.label}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <section className="whats-new-section">
              <h4 className="changelog-day-label">New quizzes</h4>
              {days.length === 0 && <p className="changelog-state">No quizzes added in the last {NEW_FOR_DAYS} days.</p>}
              {days.map((day) => (
                <div className="whats-new-day" key={day.date}>
                  <div className="whats-new-date whats-new-day-label">{formatDay(day.date)}</div>
                  {day.courses.map(({ term, course, quizzes }) => (
                    <div className="whats-new-course" key={`${term.id}/${course.id}`}>
                      <div className="whats-new-course-name">
                        {course.displayName}
                        <span className="whats-new-term">{term.displayName}</span>
                      </div>
                      <ul className="whats-new-quizzes">
                        {quizzes.map((quiz) => (
                          <li key={quiz.id}>
                            <button type="button" className="whats-new-quiz" onClick={() => go(quizUrlFor(term, course, quiz, mode))}>
                              {isNewQuiz(quiz) && <span className="whats-new-dot" role="img" aria-label="New" title="New" />}
                              {quiz.title}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </section>
          </div>
          {HAS_CHANGELOG && (
            <div className="whats-new-footer">
              <button type="button" className="changelog-link" onClick={() => setShowChangelog(true)}>
                Full changelog
              </button>
            </div>
          )}
        </div>
      </div>
      {showChangelog && <ChangelogModal onClose={() => setShowChangelog(false)} />}
    </>
  );
}
