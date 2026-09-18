import { useApp } from '../../state/AppContext.jsx';
import SettingsGroup from './SettingsGroup.jsx';
import ToggleRow from './ToggleRow.jsx';

export default function ReviewOptionsFields() {
  const { state, dispatch } = useApp();
  const { reviewOptions } = state;
  const set = (key, value) => dispatch({ type: 'SET_REVIEW_OPTION', payload: { key, value } });
  // A review started fresh from the home menu (not right after a quiz
  // attempt) has no grading to filter by — see ReviewScreen.jsx, which
  // ignores the setting either way, but it's disabled here too rather than
  // left checked and silently doing nothing.
  const hasAttempt = Object.keys(state.userAnswers).length > 0;

  return (
    <>
      <SettingsGroup label="View">
        <ToggleRow
          title="List view"
          hint="All questions on one page"
          checked={reviewOptions.listView}
          onChange={(v) => set('listView', v)}
        />
        <ToggleRow
          title="Wrong answers only"
          hint="Only the questions you missed"
          inert={!hasAttempt}
          why="This review didn't start from a quiz attempt, so there's nothing to grade"
          checked={reviewOptions.wrongOnly}
          onChange={(v) => set('wrongOnly', v)}
        />
      </SettingsGroup>

      <SettingsGroup label="On each card">
        <ToggleRow
          title="Show all choices"
          hint="Every option, not just the answer"
          checked={reviewOptions.showAllChoices}
          onChange={(v) => set('showAllChoices', v)}
        />
        <ToggleRow
          title="Hide explanation"
          hint="Never show the explanation text"
          checked={reviewOptions.hideExplanation}
          onChange={(v) => set('hideExplanation', v)}
        />
      </SettingsGroup>
    </>
  );
}
