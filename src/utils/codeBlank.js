// Code fill-in-the-blank questions carry raw (plain-text, not HTML) code in
// question.code with a single "___" marking where the answer goes. Splits
// on the first marker; a missing marker puts the blank at the end.
export const CODE_BLANK = '___';

export function splitCodeBlank(code) {
  const i = code.indexOf(CODE_BLANK);
  if (i === -1) return [code, ''];
  return [code.slice(0, i), code.slice(i + CODE_BLANK.length)];
}
