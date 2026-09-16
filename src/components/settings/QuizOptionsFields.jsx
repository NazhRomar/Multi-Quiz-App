import { useApp } from '../../state/AppContext.jsx';
import Switch from './Switch.jsx';

export default function QuizOptionsFields() {
  const { state, dispatch } = useApp();
  const { quizOptions } = state;
  const set = (key, value) => dispatch({ type: 'SET_QUIZ_OPTION', payload: { key, value } });

  return (
    <>
      <label className="dropdown-item">
        <span className="dropdown-item-text">
          <strong>No skipping</strong>
          <small>Next stays locked until you submit the current question (Show Answer counts). Previous still works</small>
        </span>
        <Switch checked={quizOptions.noSkip} onChange={(v) => set('noSkip', v)} />
      </label>
      <label className="dropdown-item">
        <span className="dropdown-item-text">
          <strong>Instant submit</strong>
          <small>Multiple Choice / True-False: submit the moment you pick an option, no Submit click needed</small>
        </span>
        <Switch checked={quizOptions.instantSubmit} onChange={(v) => set('instantSubmit', v)} />
      </label>
      <label className="dropdown-item">
        <span className="dropdown-item-text">
          <strong>Auto-focus blanks</strong>
          <small>
            Fill in the Blank: the cursor starts in the first blank, so you can type right away. Enter moves to the next
            blank, then submits (not on touch screens, where it would pop up the keyboard)
          </small>
        </span>
        <Switch checked={quizOptions.autoFocusBlank} onChange={(v) => set('autoFocusBlank', v)} />
      </label>
      <label className="dropdown-item">
        <span className="dropdown-item-text">
          <strong>Shuffle questions</strong>
          <small>Randomizes order (Applies on Restart)</small>
        </span>
        <Switch checked={quizOptions.shuffleQuestions} onChange={(v) => set('shuffleQuestions', v)} />
      </label>
      <label className="dropdown-item">
        <span className="dropdown-item-text">
          <strong>Shuffle choices</strong>
          <small>Randomizes choices (Applies on Restart)</small>
        </span>
        <Switch checked={quizOptions.shuffleChoices} onChange={(v) => set('shuffleChoices', v)} />
      </label>
      <label className="dropdown-item">
        <span className="dropdown-item-text">
          <strong>Keep True/False order</strong>
          <small>When shuffling choices, leave True / False questions as True then False (Applies on Restart)</small>
        </span>
        <Switch checked={quizOptions.keepTrueFalseOrder} onChange={(v) => set('keepTrueFalseOrder', v)} />
      </label>
      <label className="dropdown-item">
        <span className="dropdown-item-text">
          <strong>Show how many to select</strong>
          <small>Multiple Select: show how many options to pick for full points, next to the points</small>
        </span>
        <Switch checked={quizOptions.showMsqCount} onChange={(v) => set('showMsqCount', v)} />
      </label>
      <label className="dropdown-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
        <span className="dropdown-item-text">
          <strong>Multiple Select Scoring</strong>
          <small>
            Right only: a point per correct pick. Right minus wrong: wrong picks take a point back (never below 0). All or
            nothing: full points only for the exact set
          </small>
        </span>
        <select
          value={quizOptions.msqScoring}
          onChange={(e) => set('msqScoring', e.target.value)}
          style={{ width: '100%', padding: '0.4rem', border: '1px solid var(--border)', borderRadius: '6px' }}
        >
          <option value="right">Right only</option>
          <option value="rightMinusWrong">Right minus wrong</option>
          <option value="allOrNothing">All or nothing</option>
        </select>
      </label>
      <label className="dropdown-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
        <span className="dropdown-item-text">
          <strong>Read first</strong>
          <small>Blurs the choices (and holds back the number keys) for a few seconds, so the question gets read first</small>
        </span>
        <select
          value={quizOptions.readFirstSeconds}
          onChange={(e) => set('readFirstSeconds', Number(e.target.value))}
          style={{ width: '100%', padding: '0.4rem', border: '1px solid var(--border)', borderRadius: '6px' }}
        >
          <option value={0}>Off</option>
          <option value={2}>2 seconds</option>
          <option value={3}>3 seconds</option>
          <option value={5}>5 seconds</option>
          <option value={8}>8 seconds</option>
          <option value={12}>12 seconds</option>
        </select>
      </label>
      <label className="dropdown-item">
        <span className="dropdown-item-text">
          <strong>Hide feedback</strong>
          <small>Never show the "Correct!" / "Incorrect" banner after answering</small>
        </span>
        <Switch checked={quizOptions.hideFeedback} onChange={(v) => set('hideFeedback', v)} />
      </label>
      <label className="dropdown-item">
        <span className="dropdown-item-text">
          <strong>Hide explanation</strong>
          <small>Never show the explanation text after answering</small>
        </span>
        <Switch checked={quizOptions.hideExplanation} onChange={(v) => set('hideExplanation', v)} />
      </label>
      <label className="dropdown-item">
        <span className="dropdown-item-text">
          <strong>Hide Enter / ← key hints</strong>
          <small>
            Hide the ⏎ on Next and Submit and the ← on Previous (the buttons show plain arrows instead). Enter and ← still
            work: Enter submits, then goes to the next question (the next card in review); ← goes back
          </small>
        </span>
        <Switch checked={quizOptions.hideEnterHint} onChange={(v) => set('hideEnterHint', v)} />
      </label>
      <label className="dropdown-item">
        <span className="dropdown-item-text">
          <strong>Hide number key hints</strong>
          <small>Hide the 1–9 / 0 keys on answer choices. Number keys still pick choices (Multiple Select: pick, then Enter)</small>
        </span>
        <Switch checked={quizOptions.hideNumberHint} onChange={(v) => set('hideNumberHint', v)} />
      </label>
      <label className="dropdown-item">
        <span className="dropdown-item-text">
          <strong>Skip feedback if explained</strong>
          <small>Only hide the correct/incorrect banner on questions that already show an explanation</small>
        </span>
        <Switch checked={quizOptions.hideFeedbackIfExplanation} onChange={(v) => set('hideFeedbackIfExplanation', v)} />
      </label>
    </>
  );
}
