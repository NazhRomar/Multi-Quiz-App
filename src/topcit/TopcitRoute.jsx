import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dropdown from '../components/settings/Dropdown.jsx';
import AppSettingsFields from '../components/settings/AppSettingsFields.jsx';
import { finishSession, isAnswered, loadStore, newSession, plannedIds, saveStore, shuffle, timeLimit } from './engine.js';
import TopcitSetup from './TopcitSetup.jsx';
import TopcitQuiz, { QuizBar } from './TopcitQuiz.jsx';
import TopcitResults from './TopcitResults.jsx';
import ConfirmDialog from './ConfirmDialog.jsx';
import './topcit.css';

// The TOPCIT practice page (#/topcit): its own setup, quiz and results
// screens, kept apart from the catalog quizzes. Everything it remembers
// (settings, per-question results, attempts, an unfinished quiz) is one
// localStorage entry, see engine.js.
export default function TopcitRoute() {
  const navigate = useNavigate();
  const [store, setStore] = useState(loadStore);
  const [view, setView] = useState('setup'); // 'setup' | 'quiz' | 'results'
  const [confirm, setConfirm] = useState(null); // { message, okLabel, onOk }
  const { session } = store;

  useEffect(() => saveStore(store), [store]);

  const show = useCallback((next) => {
    setView(next);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const patchCfg = (patch) => setStore((s) => ({ ...s, cfg: { ...s.cfg, ...patch } }));
  const patchSession = useCallback((fn) => setStore((s) => (s.session ? { ...s, session: fn(s.session) } : s)), []);

  // A new quiz replaces whatever was in progress.
  const begin = (ids, mode, limit, label) => {
    setStore((s) => ({ ...s, session: newSession(ids, mode, limit, s.cfg, label) }));
    show('quiz');
  };

  const start = () => {
    const go = () => {
      const ids = plannedIds(store.cfg, store.stats);
      if (ids.length) begin(ids, store.cfg.count === 'mock' ? 'exam' : store.cfg.mode, timeLimit(store.cfg, ids.length));
    };
    if (session && !session.done) {
      ask('Start a new quiz?', `Your unfinished quiz (question ${session.cur + 1} of ${session.ids.length}) will be replaced.`, 'Start new', go);
    } else go();
  };

  const finish = useCallback((timeUp = false) => setStore((s) => finishSession(s, timeUp)), []);

  // The clock: one second at a time while a quiz is open. Running out of
  // time ends it, and the effect below then moves on to the results.
  const live = view === 'quiz' && !!session && !session.done;
  useEffect(() => {
    if (!live) return undefined;
    const timer = setInterval(
      () =>
        setStore((s) => {
          const cur = s.session;
          if (!cur || cur.done) return s;
          const next = { ...s, session: { ...cur, el: cur.el + 1 } };
          return cur.limit && cur.el + 1 >= cur.limit ? finishSession(next, true) : next;
        }),
      1000
    );
    return () => clearInterval(timer);
  }, [live]);

  const ended = view === 'quiz' && !!session?.done;
  useEffect(() => {
    if (ended) show('results');
  }, [ended, show]);

  const ask = (title, message, okLabel, onOk) => setConfirm({ title, message, okLabel, onOk });

  // A retry is labelled by its mode, even after a mock exam.
  const retryLabel = () => (session.mode === 'exam' ? 'Exam' : 'Practice');
  const retryMissed = (ids) => {
    if (!ids.length) return;
    begin(store.cfg.shuffleQuestions ? shuffle(ids) : ids, session.mode, session.limit ? ids.length * 120 : 0, retryLabel());
  };
  const retrySame = () =>
    begin(store.cfg.shuffleQuestions ? shuffle(session.ids) : session.ids.slice(), session.mode, session.limit, session.label);

  return (
    <div className="topcit">
      <div className="topcit-top">
        <header className="quiz-header notes-header">
          <div className="header-left">
            <img className="header-logo" src={`${import.meta.env.BASE_URL}favicon.svg`} alt="Multi Quiz App" />
            <h1 className="notes-title">TOPCIT Practice</h1>
          </div>
          <div className="header-right">
            <button type="button" className="notes-exit" onClick={() => navigate('/')}>
              Exit
            </button>
            <Dropdown ariaLabel="Settings">
              <div className="dropdown-section-title">App settings</div>
              <AppSettingsFields />
            </Dropdown>
          </div>
        </header>
        {view === 'quiz' && session && (
          <QuizBar
            session={session}
            patchSession={patchSession}
            onFinish={() => askToFinish(session, ask, finish)}
            onQuit={() =>
              ask('Leave this quiz?', 'Your answers are kept, and you can resume it from the start screen.', 'Leave', () => show('setup'))
            }
          />
        )}
      </div>

      {view === 'setup' && (
        <TopcitSetup
          store={store}
          patchCfg={patchCfg}
          onStart={start}
          onResume={() => show('quiz')}
          onReset={() =>
            ask('Reset progress?', 'This clears your saved progress and attempt history. It cannot be undone.', 'Reset', () =>
              setStore((s) => ({ ...s, stats: {}, hist: [] }))
            )
          }
        />
      )}
      {view === 'quiz' && session && (
        <TopcitQuiz
          session={session}
          patchSession={patchSession}
          onFinish={() => askToFinish(session, ask, finish)}
          dialogOpen={!!confirm}
        />
      )}
      {view === 'results' && session && (
        <TopcitResults session={session} onRetryMissed={retryMissed} onRetrySame={retrySame} onNew={() => show('setup')} />
      )}

      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          okLabel={confirm.okLabel}
          onOk={() => {
            const { onOk } = confirm;
            setConfirm(null);
            onOk();
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

function askToFinish(session, ask, finish) {
  const unanswered = session.ids.filter((id) => !isAnswered(session, id)).length;
  const flagged = session.ids.filter((id) => session.flag[id]).length;
  const notes = [unanswered && `${unanswered} unanswered`, flagged && `${flagged} flagged`].filter(Boolean).join(', ');
  ask('Finish quiz?', notes ? `You have ${notes}. See your results anyway?` : 'See your results?', 'Finish', () => finish(false));
}
