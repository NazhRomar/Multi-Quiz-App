import { useApp } from '../../state/AppContext.jsx';
import Switch from './Switch.jsx';

// Shown as an extra "Multi" tab in the quiz/review dropdowns, only during
// a Multi session.
export default function MultiOptionsFields() {
  const { state, dispatch } = useApp();
  const { multiOptions } = state;
  const set = (key, value) => dispatch({ type: 'SET_MULTI_OPTION', payload: { key, value } });

  return (
    <label className="dropdown-item">
      <span className="dropdown-item-text">
        <strong>Show question source</strong>
        <small>Label each question with the subject and module it came from</small>
      </span>
      <Switch checked={multiOptions.showSource} onChange={(v) => set('showSource', v)} />
    </label>
  );
}
