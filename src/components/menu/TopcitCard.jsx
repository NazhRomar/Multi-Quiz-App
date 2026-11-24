import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { readTopcitSummary } from '../../topcit/summary.js';

// Home's entry to the TOPCIT practice page (#/topcit, src/topcit/): not a
// catalog quiz, so it has its own card at the top of the Finals list. It also
// says where you left off.
export default function TopcitCard() {
  const navigate = useNavigate();
  const { resume, last } = useMemo(readTopcitSummary, []);

  return (
    <button type="button" className="topcit-entry" onClick={() => navigate('/topcit')}>
      <span className="topcit-entry-mark" aria-hidden="true">
        <svg viewBox="0 0 16 16" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2.5" y="2.5" width="11" height="11" rx="2" />
          <path d="M5.25 8.25l1.9 1.9 3.6-4" />
        </svg>
      </span>
      <span className="topcit-entry-text">
        <strong>TOPCIT Practice Quiz</strong>
        <span>Software, data, systems &amp; security and IT business. Practice, exam and mock exam modes.</span>
      </span>
      <span className="topcit-entry-status">{resume ? `Resume (${resume.at} of ${resume.of})` : last != null ? `Last score ${last}%` : 'Start'}</span>
      <span className="topcit-entry-go" aria-hidden="true">
        →
      </span>
    </button>
  );
}
