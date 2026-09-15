import { splitCodeBlank } from '../../../utils/codeBlank.js';

export default function FitbInput({ question, savedState, isLocked, onChange, onSubmit }) {
  const savedText = savedState.value || '';
  let fitbClass = '';
  if (isLocked) {
    fitbClass = savedText.trim().toLowerCase() === question.correctAnswer.toLowerCase() ? 'fitb-correct' : 'fitb-wrong';
  }

  const submitButton = !isLocked && (
    <button className="btn-check" onClick={onSubmit}>
      Submit
    </button>
  );

  const inputProps = {
    type: 'text',
    value: savedText,
    disabled: isLocked,
    autoComplete: 'off',
    spellCheck: false,
    onChange: (e) => onChange(e.target.value),
    onKeyDown: (e) => {
      if (e.key === 'Enter' && !isLocked) onSubmit();
    },
  };

  // Code fill-in: the answer box sits inline inside the code block, at the
  // spot marked by "___" in question.code.
  if (question.code) {
    const [before, after] = splitCodeBlank(question.code);
    return (
      <>
        <div className="q-context code-fitb">
          <div className="q-context-body">
            <pre>
              {before}
              <input
                {...inputProps}
                className={`fitb-input fitb-input--inline ${fitbClass}`}
                // Grows with what's typed (monospace, so ch is exact) —
                // deliberately not sized to the answer, which would leak it.
                style={{ width: `${Math.max(savedText.length, 6) + 2}ch` }}
                aria-label="Fill in the blank"
              />
              {after}
            </pre>
          </div>
        </div>
        {submitButton}
      </>
    );
  }

  return (
    <div className="fitb-row">
      <input {...inputProps} className={`fitb-input ${fitbClass}`} placeholder="Type your answer..." />
      {submitButton}
    </div>
  );
}
