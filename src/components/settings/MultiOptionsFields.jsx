import { useApp } from '../../state/AppContext.jsx';
import ToggleRow from './ToggleRow.jsx';

// Shown as an extra "Multi" tab in the quiz/review dropdowns, only during
// a Multi session. One setting, so it skips the group headings.
export default function MultiOptionsFields() {
  const { state, dispatch } = useApp();
  const { multiOptions } = state;
  const set = (key, value) => dispatch({ type: 'SET_MULTI_OPTION', payload: { key, value } });

  return (
    <ToggleRow
      title="Show question source"
      hint="Label each question with the subject and module it came from"
      checked={multiOptions.showSource}
      onChange={(v) => set('showSource', v)}
    />
  );
}
