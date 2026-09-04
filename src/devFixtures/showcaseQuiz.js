// Not real quiz content — a fixture covering every supported question type,
// used only by the hidden "click the home footer" testing shortcut in
// MenuScreen.jsx. Deliberately kept out of src/data/ so it never shows up
// in the normal course/term menu.
export const showcaseQuiz = {
  courseCode: 'DEV',
  quizTitle: 'Question Type Showcase',
  totalPoints: 6,
  questions: [
    {
      id: 1,
      type: 'mc',
      text: 'This is a Multiple Choice question. Which option is correct?',
      options: ['Option A', 'Option B (correct)', 'Option C', 'Option D'],
      correctAnswer: 1,
      points: 1,
      explanation: 'This is where the explanation text renders, including <code>inline code</code> if present.',
      context: '<pre>print("this is a context/code block")</pre>',
    },
    {
      id: 2,
      type: 'tf',
      text: 'This is a True/False question. This statement is true.',
      options: ['True', 'False'],
      correctAnswer: 0,
      points: 1,
      explanation: 'True/False questions reuse the same renderer as Multiple Choice.',
    },
    {
      id: 3,
      type: 'msq',
      text: 'This is a Multiple Select question. Pick the two correct options.',
      options: ['Correct one', 'Wrong', 'Correct two', 'Also wrong'],
      correctAnswer: [0, 2],
      points: 1,
      explanation: 'Multiple Select allows more than one selection and grades exact-match.',
    },
    {
      id: 4,
      type: 'fitb',
      text: 'This is a Fill in the Blank question. Type the word "answer" below.',
      correctAnswer: 'answer',
      points: 1,
      explanation: 'Matched case-insensitively, trimmed.',
    },
    {
      id: 5,
      type: 'matching',
      text: 'This is a Dropdown Matching question. Match each term to its definition.',
      allChoices: ['Definition A', 'Definition B', 'Definition C'],
      pairs: [
        { term: 'Term A', match: 'Definition A' },
        { term: 'Term B', match: 'Definition B' },
        { term: 'Term C', match: 'Definition C' },
      ],
      points: 1,
      explanation: 'Dropdown selects, partial credit per correct pair.',
    },
    {
      id: 6,
      type: 'drag-drop',
      text: 'This is a Drag & Drop question. Drag each item into its matching slot.',
      pairs: [
        { term: 'Slot A', match: 'Item A' },
        { term: 'Slot B', match: 'Item B' },
        { term: 'Slot C', match: 'Item C' },
      ],
      points: 1,
      explanation: 'No real quiz data uses this type today — this is the only place it can be exercised end to end.',
    },
  ],
};
