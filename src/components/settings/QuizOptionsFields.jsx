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
          <strong>Instant submit</strong>
          <small>Multiple Choice / True-False: submit the moment you pick an option, no Submit click needed</small>
        </span>
        <Switch checked={quizOptions.instantSubmit} onChange={(v) => set('instantSubmit', v)} />
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
          <strong>Skip feedback if explained</strong>
          <small>Only hide the correct/incorrect banner on questions that already show an explanation</small>
        </span>
        <Switch checked={quizOptions.hideFeedbackIfExplanation} onChange={(v) => set('hideFeedbackIfExplanation', v)} />
      </label>
      <label className="dropdown-item">
        <span className="dropdown-item-text">
          <strong>Disable navigation</strong>
          <small>Must answer before moving forward</small>
        </span>
        <Switch checked={quizOptions.noSkip} onChange={(v) => set('noSkip', v)} />
      </label>
    </>
  );
}
