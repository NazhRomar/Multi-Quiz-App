// Code fill-in-the-blank questions carry raw (plain-text, not HTML) code in
// question.code with each "___" marking a blank. Returns the code segments
// around the blanks (blank count = segments.length - 1); a code string with
// no marker puts a single blank at the end.
export const CODE_BLANK = '___';

export function splitCodeBlanks(code) {
  const segments = code.split(CODE_BLANK);
  return segments.length > 1 ? segments : [code, ''];
}
