import { Fragment, useRef } from 'react';
import { splitCodeBlanks } from '../../../utils/codeBlank.js';
import { fitbExpected, fitbGiven, fitbBlankCorrect } from '../../../state/grading.js';

export default function FitbInput({ question, savedState, isLocked, onChange, onSubmit }) {
  const blankRefs = useRef([]);
  const expected = fitbExpected(question);
  const given = fitbGiven(question, savedState.value);
  const blankClass = (i) => {
    if (!isLocked) return '';
    return fitbBlankCorrect(given[i], expected[i]) ? 'fitb-correct' : 'fitb-wrong';
  };

  const submitButton = !isLocked && (
    <button className="btn-check" onClick={onSubmit}>
      Submit
    </button>
  );

  // Enter moves to the next blank, and submits from the last one.
  const inputProps = (i, count) => ({
    type: 'text',
    value: given[i] ?? '',
    disabled: isLocked,
    autoComplete: 'off',
    spellCheck: false,
    ref: (el) => (blankRefs.current[i] = el),
    onChange: (e) => {
      if (!Array.isArray(question.correctAnswer)) return onChange(e.target.value);
      const next = given.slice();
      next[i] = e.target.value;
      onChange(next);
    },
    onKeyDown: (e) => {
      if (e.key !== 'Enter' || isLocked) return;
      if (i < count - 1) blankRefs.current[i + 1]?.focus();
      else onSubmit();
    },
  });

  // Code fill-in: answer boxes sit inline inside the code block, one at
  // each "___" in question.code.
  if (question.code) {
    const segments = splitCodeBlanks(question.code);
    const blankCount = segments.length - 1;
    return (
      <>
        <div className="q-context q-context--code code-fitb">
          <div className="q-context-body">
            <pre>
              {segments.map((segment, i) => (
                <Fragment key={i}>
                  {segment}
                  {i < blankCount && (
                    <input
                      {...inputProps(i, blankCount)}
                      className={`fitb-input fitb-input--inline ${blankClass(i)}`}
                      // Grows with what's typed (monospace, so ch is exact) —
                      // deliberately not sized to the answer, which would leak it.
                      style={{ width: `${Math.max((given[i] ?? '').length, 6) + 2}ch` }}
                      aria-label={blankCount > 1 ? `Blank ${i + 1} of ${blankCount}` : 'Fill in the blank'}
                    />
                  )}
                </Fragment>
              ))}
            </pre>
          </div>
        </div>
        {submitButton}
      </>
    );
  }

  return (
    <div className="fitb-row">
      <input {...inputProps(0, 1)} className={`fitb-input ${blankClass(0)}`} placeholder="Type your answer..." />
      {submitButton}
    </div>
  );
}
