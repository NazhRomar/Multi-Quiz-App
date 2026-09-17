import { useApp } from '../../state/AppContext.jsx';
import { useIsMobile } from '../../utils/useIsMobile.js';
import { renderHtml } from '../../utils/renderHtml.js';
import McTfOptions from './options/McTfOptions.jsx';
import MsqOptions from './options/MsqOptions.jsx';
import FitbInput from './options/FitbInput.jsx';
import MatchingGrid from './options/MatchingGrid.jsx';
import DragDropBoard from './options/DragDropBoard.jsx';
import FeedbackBanner from './FeedbackBanner.jsx';
import QuestionContext from '../common/QuestionContext.jsx';
import QuestionSource from '../common/QuestionSource.jsx';

const TYPE_LABELS = {
  mc: 'Multiple Choice',
  tf: 'True / False',
  msq: 'Multiple Select',
  fitb: 'Fill in the Blank',
  matching: 'Dropdown Matching',
  'drag-drop': 'Drag & Drop',
};

// showKeyHints: number keycaps on the choices (QuizScreen's number-key
// shortcut). submitEnterHint: ⏎ on Submit when Enter would submit.
export default function QuestionCard({ question, index, savedState, isLocked, exiting, showKeyHints, submitEnterHint, blurLeft = 0 }) {
  const { state, dispatch } = useApp();
  const { quizOptions } = state;
  const isMobile = useIsMobile();

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
          onSelect={(idx) => {
            dispatch({ type: 'SAVE_ANSWER', payload: { qId: question.id, value: idx } });
            if (quizOptions.instantSubmit) submit();
          }}
          onSubmit={submit}
          hideSubmit={quizOptions.instantSubmit}
          showKeyHints={showKeyHints}
          submitEnterHint={submitEnterHint}
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
          showKeyHints={showKeyHints}
          submitEnterHint={submitEnterHint}
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
          autoFocus={quizOptions.autoFocusBlank}
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
      <QuestionSource question={question} variant="aside" />
      <div className="q-meta">
        <div className="q-meta-left">
          <span className="q-num-badge">{index + 1}</span>
          <span className={`q-type-badge ${question.type}`}>{TYPE_LABELS[question.type] || 'Question'}</span>
        </div>
        <div className="q-meta-right">
          {/* Quiz options → Show how many to select (off by default). */}
          {question.type === 'msq' && quizOptions.showMsqCount && (
            <span className="msq-count-hint" title={`Select ${question.correctAnswer.length} options for full points`}>
              {/* Phones: icon + number only — the full label wrapped the meta row onto two lines. */}
              {isMobile ? `☑ ${question.correctAnswer.length}` : `Select ${question.correctAnswer.length}`}
            </span>
          )}
          <span className={`q-points ${question.flagged ? 'q-points--flagged' : ''}`}>
            {question.flagged ? 'Not Scored' : `${question.points || 1} pts`}
          </span>
        </div>
      </div>
      <QuestionSource question={question} variant="inline" />
      <QuestionContext context={question.context} />
      <div className="q-text" {...renderHtml(question.text)} />
      <div className="options-list-wrap">
        <div className={`options-list ${blurLeft > 0 ? 'options-list--blurred' : ''}`} aria-hidden={blurLeft > 0}>
          {optionsEl}
          {isLocked && <FeedbackBanner question={question} savedState={savedState} quizOptions={quizOptions} />}
        </div>
        {blurLeft > 0 && (
          <div className="read-first-hint" aria-live="polite">
            Read the question — choices unlock in {blurLeft}s
          </div>
        )}
      </div>
    </div>
  );
}
