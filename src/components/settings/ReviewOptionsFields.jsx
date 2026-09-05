import { useApp } from '../../state/AppContext.jsx';
import Switch from './Switch.jsx';

export default function ReviewOptionsFields() {
  const { state, dispatch } = useApp();
  const { reviewOptions } = state;
  const set = (key, value) => dispatch({ type: 'SET_REVIEW_OPTION', payload: { key, value } });

  return (
    <>
      <label className="dropdown-item">
        <span className="dropdown-item-text">
          <strong>List View</strong>
          <small>Show all questions on one page</small>
        </span>
        <Switch checked={reviewOptions.listView} onChange={(v) => set('listView', v)} />
      </label>
      <label className="dropdown-item">
        <span className="dropdown-item-text">
          <strong>Wrong answers only</strong>
          <small>Only show questions you missed</small>
        </span>
        <Switch checked={reviewOptions.wrongOnly} onChange={(v) => set('wrongOnly', v)} />
      </label>
      <label className="dropdown-item">
        <span className="dropdown-item-text">
          <strong>Show all choices</strong>
          <small>Display all options, not just the answer</small>
        </span>
        <Switch checked={reviewOptions.showAllChoices} onChange={(v) => set('showAllChoices', v)} />
      </label>
      <label className="dropdown-item">
        <span className="dropdown-item-text">
          <strong>Hide explanation</strong>
          <small>Don't show the explanation text</small>
        </span>
        <Switch checked={reviewOptions.hideExplanation} onChange={(v) => set('hideExplanation', v)} />
      </label>
    </>
  );
}
