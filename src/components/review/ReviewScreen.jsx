import { useEffect, useMemo, useState } from 'react';
import { useIsMobile } from '../../utils/useIsMobile.js';
import { useApp } from '../../state/AppContext.jsx';
import { useNavRow } from '../quiz/useNavRow.jsx';
import { useEnterShortcut, usePrevShortcut } from '../quiz/useEnterShortcut.js';
import { isAnswerCorrect } from '../../state/grading.js';
import { MIN_SEARCH_LENGTH, questionSearchText } from '../../data/catalog.js';
import ReviewHeader from './ReviewHeader.jsx';
import ReviewCard from './ReviewCard.jsx';
import ReviewSearchBar from './ReviewSearchBar.jsx';
import QuestionSource from '../common/QuestionSource.jsx';

// Matches of the review search, painted with the CSS Custom Highlight API
// (style.css ::highlight(review-search)) so the rendered card HTML is left
// untouched. Browsers without it just don't highlight.
const HIGHLIGHT = 'review-search';

function highlightMatches(root, term) {
  if (typeof CSS === 'undefined' || !CSS.highlights) return;
  if (!root || !term) {
    CSS.highlights.delete(HIGHLIGHT);
    return;
  }
  const ranges = [];
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const lower = node.nodeValue.toLowerCase();
    for (let at = lower.indexOf(term); at !== -1; at = lower.indexOf(term, at + term.length)) {
      const range = new Range();
      range.setStart(node, at);
      range.setEnd(node, at + term.length);
      ranges.push(range);
    }
  }
  CSS.highlights.set(HIGHLIGHT, new Highlight(...ranges));
}

export default function ReviewScreen({ goHome }) {
  const { state, dispatch } = useApp();
  const { activeQuiz, currentIndex, appSettings, reviewOptions, userAnswers } = state;
  const [isCardExiting, setIsCardExiting] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Bumped by Restart: remounts the cards so their entrance plays again —
  // otherwise restarting on question 1, or in list view, shows no change.
  const [runKey, setRunKey] = useState(0);
  const isMobile = useIsMobile();
  const isListView = reviewOptions.listView;
  // Reviewing right after a quiz attempt (not a fresh review from home):
  // cards then grade that attempt. Wrong answers only needs one to filter
  // by — started fresh, there's no grading to base it on (and nothing
  // filtered would ever be "wrong"), so it's ignored either way; the
  // setting itself is also disabled in Review options (ReviewOptionsFields).
  const hasAttempt = Object.keys(userAnswers).length > 0;
  const reviewQuestions =
    reviewOptions.wrongOnly && hasAttempt
      ? activeQuiz.questions.filter((q) => !q.flagged && !isAnswerCorrect(q, userAnswers[q.id]?.value ?? null))
      : activeQuiz.questions;

  // Review search: positions in reviewQuestions whose text, snippet or
  // correct answer contain the query (from MIN_SEARCH_LENGTH characters).
  // Card view keeps every question and steps between matches; list view
  // shows only the matches.
  const haystacks = useMemo(() => new Map(activeQuiz.questions.map((q) => [q.id, questionSearchText(q).haystack])), [activeQuiz]);
  const findMatches = (query) => {
    const term = query.trim().toLowerCase();
    if (term.length < MIN_SEARCH_LENGTH) return null;
    return reviewQuestions.flatMap((q, i) => (haystacks.get(q.id).includes(term) ? [i] : []));
  };
  const searchTerm = searchOpen && searchQuery.trim().length >= MIN_SEARCH_LENGTH ? searchQuery.trim().toLowerCase() : '';
  const matchIndexes = (searchTerm && findMatches(searchQuery)) || [];
  const questions = isListView && searchTerm ? matchIndexes.map((i) => reviewQuestions[i]) : reviewQuestions;
  const total = questions.length;
  // Each card's own number badge (ReviewCard) always names its position in
  // the quiz itself — stable for the session (shuffled once at quiz start,
  // same order throughout) — never its position in a Wrong-only subset, so
  // "Question 7" stays Question 7 whether you're looking at every question
  // or only the ones you missed.
  const quizIndexById = new Map(activeQuiz.questions.map((q, i) => [q.id, i]));
  const answerOf = (q) => userAnswers[q.id]?.value ?? null;

  // action: an action type ('NEXT_Q') or a whole action ({ type: 'GO_TO_Q', payload }).
  const animatedNav = (action) => {
    const go = () => dispatch(typeof action === 'string' ? { type: action } : action);
    if (appSettings.disableAnimations || isListView) {
      go();
      window.scrollTo(0, 0);
      return;
    }
    setIsCardExiting(true);
    setTimeout(() => {
      setIsCardExiting(false);
      go();
      window.scrollTo(0, 0);
    }, 95);
  };

  // A review started fresh (from Home, nothing answered) has nothing to
  // restart, so its Restart button is Start instead: it switches to Quiz
  // mode, same as the dropdown's "Switch to quiz mode". After a quiz
  // attempt, Restart goes back to question 1 and the top of the page,
  // closing any search.
  const startsQuiz = !hasAttempt;
  const restart = () => {
    if (startsQuiz) {
      dispatch({ type: 'SWITCH_TO_QUIZ' });
      window.scrollTo(0, 0);
      return;
    }
    dispatch({ type: 'RESTART' });
    setSearchOpen(false);
    setSearchQuery('');
    setRunKey((k) => k + 1);
    window.scrollTo(0, 0);
  };

  const shownIndex = Math.min(currentIndex, total - 1);
  const matchPos = matchIndexes.indexOf(shownIndex);
  // Next/previous match from the current card, wrapping around the ends.
  const goToMatch = (dir) => {
    if (matchIndexes.length === 0) return;
    const target =
      dir > 0
        ? (matchIndexes.find((i) => i > shownIndex) ?? matchIndexes[0])
        : ([...matchIndexes].reverse().find((i) => i < shownIndex) ?? matchIndexes[matchIndexes.length - 1]);
    if (target !== shownIndex) animatedNav({ type: 'GO_TO_Q', payload: target });
  };
  // While typing, card view moves to the first match from the current card
  // on (wrapping), unless the current card already matches.
  const onSearchChange = (value) => {
    setSearchQuery(value);
    const matches = findMatches(value);
    if (isListView || !matches?.length || matches.includes(shownIndex)) return;
    dispatch({ type: 'GO_TO_Q', payload: matches.find((i) => i >= shownIndex) ?? matches[0] });
    window.scrollTo(0, 0);
  };
  const toggleSearch = () => {
    if (searchOpen) setSearchQuery('');
    setSearchOpen((open) => !open);
  };

  useEffect(() => {
    highlightMatches(document.getElementById('quiz-container'), searchTerm);
  });
  useEffect(() => () => highlightMatches(null, ''), []);

  const isFirst = currentIndex === 0;
  const isLast = currentIndex === total - 1;

  // Enter goes to the next card (every review card is already "answered").
  // Nothing on the last card — its button is Done, which leaves the review,
  // too easy to trigger by tapping Enter one time too many — or in list view.
  const canEnterNext = !isListView && total > 0 && currentIndex < total - 1;
  useEnterShortcut(canEnterNext && !isCardExiting ? () => animatedNav('NEXT_Q') : null);
  // Left arrow: the previous card.
  usePrevShortcut(!isListView && total > 0 && !isFirst && !isCardExiting ? () => animatedNav('PREV_Q') : null);

  const { topRow, bottomRow, portals } = useNavRow({
    navLocation: appSettings.navLocation,
    isFirst: isListView || total === 0 ? true : isFirst,
    isLast: isListView || total === 0 ? true : isLast,
    nextBlocked: false,
    isQuizMode: false,
    isListView,
    onPrev: () => animatedNav('PREV_Q'),
    onNext: () => animatedNav('NEXT_Q'),
    onDone: goHome,
    onRestart: restart,
    restartLabel: startsQuiz ? 'Start' : 'Restart',
    onExit: goHome,
    // List view keeps each card's own in-card source strip instead.
    sourceTag: !isListView && total > 0 && <QuestionSource question={questions[Math.min(currentIndex, total - 1)]} variant="nav" />,
    enterHint: canEnterNext && !state.quizOptions.hideEnterHint,
    prevHint: !state.quizOptions.hideEnterHint,
  });

  const progressLabel = total === 0 ? '0 Items' : isListView ? `${total} Items` : `${Math.min(currentIndex + 1, total)}/${total}`;
  const progressPct = total === 0 ? 100 : isListView ? 100 : ((currentIndex + 1) / total) * 100;

  return (
    <>
      <ReviewHeader
        progressLabel={progressLabel}
        progressPct={progressPct}
        goHome={goHome}
        onRestart={restart}
        restartLabel={startsQuiz ? 'Start' : 'Restart'}
        searchOpen={searchOpen}
        onToggleSearch={toggleSearch}
      />
      {searchOpen && (
        <ReviewSearchBar
          query={searchQuery}
          onQueryChange={onSearchChange}
          matchCount={matchIndexes.length}
          matchPos={matchPos}
          isListView={isListView}
          onPrev={() => goToMatch(-1)}
          onNext={() => goToMatch(1)}
          onClose={toggleSearch}
        />
      )}
      {topRow}
      <main id="quiz-container" key={runKey}>
        {total === 0 && searchTerm ? (
          <div className="menu-search-empty">No questions or answers match &quot;{searchQuery.trim()}&quot;.</div>
        ) : total === 0 ? (
          <div className="feedback-banner correct" style={{ textAlign: 'center' }}>
            <strong>🎉 No wrong answers to review!</strong>
          </div>
        ) : isListView ? (
          questions.map((q) => (
            <ReviewCard
              key={q.id}
              question={q}
              index={quizIndexById.get(q.id)}
              reviewOptions={reviewOptions}
              quizOptions={state.quizOptions}
              compactStatus={isMobile}
              isListView
              userAnswer={answerOf(q)}
              hasAttempt={hasAttempt}
            />
          ))
        ) : (
          <ReviewCard
            // Remounts per question, like the quiz card: otherwise the
            // previous card's revealed colors transition away on this one.
            key={questions[Math.min(currentIndex, total - 1)].id}
            compactStatus={isMobile}
            question={questions[Math.min(currentIndex, total - 1)]}
            index={quizIndexById.get(questions[Math.min(currentIndex, total - 1)].id)}
            reviewOptions={reviewOptions}
            quizOptions={state.quizOptions}
            isListView={false}
            exiting={isCardExiting}
            userAnswer={answerOf(questions[Math.min(currentIndex, total - 1)])}
            hasAttempt={hasAttempt}
          />
        )}
      </main>
      {bottomRow}
      {portals}
    </>
  );
}
