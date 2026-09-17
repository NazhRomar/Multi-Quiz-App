import { useApp } from '../../state/AppContext.jsx';
import SettingsGroup from './SettingsGroup.jsx';
import ToggleRow from './ToggleRow.jsx';
import SelectRow from './SelectRow.jsx';

export default function QuizOptionsFields() {
  const { state, dispatch } = useApp();
  const { quizOptions } = state;
  const set = (key, value) => dispatch({ type: 'SET_QUIZ_OPTION', payload: { key, value } });

  return (
    <>
      <SettingsGroup label="Answering">
        <ToggleRow
          title="No skipping"
          hint="Next locks until you submit. Previous still works"
          checked={quizOptions.noSkip}
          onChange={(v) => set('noSkip', v)}
        />
        <ToggleRow
          title="Instant submit"
          hint="Multiple Choice and True/False submit as soon as you pick"
          checked={quizOptions.instantSubmit}
          onChange={(v) => set('instantSubmit', v)}
        />
        <ToggleRow
          title="Auto-focus blanks"
          hint="Fill in the Blank starts in the first blank (not on touch screens)"
          checked={quizOptions.autoFocusBlank}
          onChange={(v) => set('autoFocusBlank', v)}
        />
        <SelectRow
          title="Read first"
          hint="Blurs the choices for a few seconds so the question gets read first"
          value={quizOptions.readFirstSeconds}
          onChange={(v) => set('readFirstSeconds', Number(v))}
        >
          <option value={0}>Off</option>
          <option value={2}>2 seconds</option>
          <option value={3}>3 seconds</option>
          <option value={5}>5 seconds</option>
          <option value={8}>8 seconds</option>
          <option value={12}>12 seconds</option>
        </SelectRow>
      </SettingsGroup>

      <SettingsGroup label="Question order">
        <ToggleRow
          title="Shuffle questions"
          hint="Applies on restart"
          checked={quizOptions.shuffleQuestions}
          onChange={(v) => set('shuffleQuestions', v)}
        />
        <ToggleRow
          title="Shuffle matching rows"
          hint="Dropdown Matching and Drag & Drop: reorder the terms down the left too"
          nested
          inert={!quizOptions.shuffleQuestions}
          why="Only applies while Shuffle questions is on"
          checked={quizOptions.shuffleMatchingRows}
          onChange={(v) => set('shuffleMatchingRows', v)}
        />
        <ToggleRow
          title="Shuffle choices"
          hint="Applies on restart"
          checked={quizOptions.shuffleChoices}
          onChange={(v) => set('shuffleChoices', v)}
        />
        <ToggleRow
          title="Keep True/False order"
          hint="Leave True/False questions as True, then False"
          nested
          inert={!quizOptions.shuffleChoices}
          why="Only applies while Shuffle choices is on"
          checked={quizOptions.keepTrueFalseOrder}
          onChange={(v) => set('keepTrueFalseOrder', v)}
        />
      </SettingsGroup>

      <SettingsGroup label="Scoring">
        <SelectRow
          title="Multiple Select scoring"
          hint="What a partly-right answer earns"
          value={quizOptions.msqScoring}
          onChange={(v) => set('msqScoring', v)}
        >
          <option value="right">Right only — a point per correct pick</option>
          <option value="rightMinusWrong">Right minus wrong — a wrong pick takes one back</option>
          <option value="allOrNothing">All or nothing — only the exact set scores</option>
        </SelectRow>
        <ToggleRow
          title="Show how many to select"
          hint="Multiple Select shows the number of picks needed"
          checked={quizOptions.showMsqCount}
          onChange={(v) => set('showMsqCount', v)}
        />
      </SettingsGroup>

      <SettingsGroup label="After you answer">
        <ToggleRow
          title="Hide correct/incorrect banner"
          hint="The ✓ Correct / ✗ Incorrect banner, and the expected answer"
          checked={quizOptions.hideFeedback}
          onChange={(v) => set('hideFeedback', v)}
        />
        <ToggleRow
          title="Only when explained"
          hint="Hide that banner just on questions that show an explanation"
          nested
          // The narrower version of the setting above, so it has nothing left
          // to do once that one hides the banner everywhere.
          inert={quizOptions.hideFeedback}
          why="Already hidden everywhere by the setting above"
          checked={quizOptions.hideFeedbackIfExplanation}
          onChange={(v) => set('hideFeedbackIfExplanation', v)}
        />
        <ToggleRow
          title="Hide explanation"
          hint="Never show the explanation text"
          checked={quizOptions.hideExplanation}
          onChange={(v) => set('hideExplanation', v)}
        />
      </SettingsGroup>

      <SettingsGroup label="Keyboard hints">
        <ToggleRow
          title="Hide Enter and ← keycaps"
          hint="On Next, Submit and Previous. The shortcuts still work"
          checked={quizOptions.hideEnterHint}
          onChange={(v) => set('hideEnterHint', v)}
        />
        <ToggleRow
          title="Hide number keycaps"
          hint="On the answer choices. The number keys still work"
          checked={quizOptions.hideNumberHint}
          onChange={(v) => set('hideNumberHint', v)}
        />
      </SettingsGroup>
    </>
  );
}
