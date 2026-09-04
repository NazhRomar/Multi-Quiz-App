import { useApp } from '../../state/AppContext.jsx';
import { renderHtml } from '../../utils/renderHtml.js';
import McTfOptions from './options/McTfOptions.jsx';
import MsqOptions from './options/MsqOptions.jsx';
import FitbInput from './options/FitbInput.jsx';
import MatchingGrid from './options/MatchingGrid.jsx';
import DragDropBoard from './options/DragDropBoard.jsx';
import FeedbackBanner from './FeedbackBanner.jsx';

const TYPE_LABELS = {
  mc: 'Multiple Choice',
  tf: 'True / False',
  msq: 'Multiple Select',
  fitb: 'Fill in the Blank',
  matching: 'Dropdown Matching',
  'drag-drop': 'Drag & Drop',
};

export default function QuestionCard({ question, index, savedState, isLocked, exiting }) {
  const { state, dispatch } = useApp();
  const { quizOptions } = state;

  const submit = () => dispatch({ type: 'CHECK_ANSWER', payload: { qId: question.id } });

  let optionsEl = null;
  switch (question.type) {
    case 'mc':
    case 'tf':
      optionsEl = (
        <McTfOptions
          question={question}
          savedState={savedState}
          isLocked={isLocked}
          onSelect={(idx) => dispatch({ type: 'SAVE_ANSWER', payload: { qId: question.id, value: idx } })}
          onSubmit={submit}
        />
      );
      break;
    case 'msq':
      optionsEl = (
        <MsqOptions
          question={question}
          savedState={savedState}
          isLocked={isLocked}
          onToggle={(idx, checked) => dispatch({ type: 'TOGGLE_MSQ', payload: { qId: question.id, idx, checked } })}
          onSubmit={submit}
        />
      );
      break;
    case 'fitb':
      optionsEl = (
        <FitbInput
          question={question}
          savedState={savedState}
          isLocked={isLocked}
          onChange={(value) => dispatch({ type: 'SAVE_ANSWER', payload: { qId: question.id, value } })}
          onSubmit={submit}
        />
      );
      break;
    case 'matching':
      optionsEl = (
        <MatchingGrid
          question={question}
          savedState={savedState}
          isLocked={isLocked}
          onSelect={(term, value) => dispatch({ type: 'SAVE_DROPDOWN', payload: { qId: question.id, term, value } })}
          onSubmit={submit}
        />
      );
      break;
    case 'drag-drop':
      optionsEl = (
        <DragDropBoard
          question={question}
          savedState={savedState}
          isLocked={isLocked}
          onDrop={(value) => dispatch({ type: 'SAVE_DRAGDROP', payload: { qId: question.id, value } })}
          onSubmit={submit}
        />
      );
      break;
    default:
      break;
  }

  return (
    <div className={`question-card ${exiting ? 'question-card--exiting' : ''}`}>
      <div className="q-meta">
        <div className="q-meta-left">
          <span className="q-num-badge">{index + 1}</span>
          <span className={`q-type-badge ${question.type}`}>{TYPE_LABELS[question.type] || 'Question'}</span>
        </div>
        <span className={`q-points ${question.flagged ? 'q-points--flagged' : ''}`}>
          {question.flagged ? 'Not Scored' : `${question.points || 1} pts`}
        </span>
      </div>
      {question.context && (
        <div className="q-context">
          <div className="q-context-body" {...renderHtml(question.context)} />
        </div>
      )}
      <div className="q-text" {...renderHtml(question.text)} />
      <div className="options-list">
        {optionsEl}
        {isLocked && <FeedbackBanner question={question} savedState={savedState} quizOptions={quizOptions} />}
      </div>
    </div>
  );
}
