import { Fragment, useEffect, useRef } from 'react';
import { splitCodeBlanks } from '../../../utils/codeBlank.js';
import { fitbExpected, fitbGiven, fitbBlankCorrect } from '../../../state/grading.js';
import { renderHtml } from '../../../utils/renderHtml.js';

// autoFocus: put the cursor in the first empty blank as the question comes
// up, so it can be answered without the mouse (Quiz options → Auto-focus
// blanks). Not on touch screens, where focusing pops the keyboard open.
export default function FitbInput({ question, savedState, isLocked, onChange, onSubmit, autoFocus }) {
  const blankRefs = useRef([]);
  const expected = fitbExpected(question);
  const given = fitbGiven(question, savedState.value);

  useEffect(() => {
    if (!autoFocus || isLocked || window.matchMedia('(hover: none)').matches) return;
    const blanks = blankRefs.current.filter(Boolean);
    const target = blanks.find((el) => !el.value.trim()) || blanks[0];
    target?.focus({ preventScroll: true });
    // Only on arriving at a question (or the setting turning on), not on
    // every keystroke.
  }, [question.id, isLocked, autoFocus]);
  const isRight = (i) => fitbBlankCorrect(given[i], expected[i]);
  const blankClass = (i) => {
    if (!isLocked) return '';
    return isRight(i) ? 'fitb-correct' : 'fitb-wrong';
  };

  // Nothing typed yet: the same button doubles as "give up and reveal".
  const isEmpty = given.every((g) => !g.trim());
  const submitButton = !isLocked && (
    <button className="btn-check" onClick={onSubmit}>
      {isEmpty ? 'Show Answer' : 'Submit'}
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
                  {/* Wrong or skipped blank: reveal its answer right beside it. */}
                  {i < blankCount && isLocked && !isRight(i) && (
                    <span className="code-fitb-answer code-fitb-answer--reveal">{expected[i] ?? ''}</span>
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
    <>
      <div className="fitb-row">
        <input {...inputProps(0, 1)} className={`fitb-input ${blankClass(0)}`} placeholder="Type your answer..." />
        {submitButton}
      </div>
      {isLocked && !isRight(0) && (
        <div className="fitb-reveal">
          Answer: <strong {...renderHtml(expected[0])} />
        </div>
      )}
    </>
  );
}
