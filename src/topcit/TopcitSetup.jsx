import Seg from './Seg.jsx';
import {
  DOMAINS,
  MOCK_TOTAL,
  QUESTIONS,
  TOPICS,
  TYPES,
  mmss,
  plannedSize,
  poolOf,
  timeLimit,
  topicCount,
  topicKey,
} from './engine.js';

const COUNT_CHOICES = [10, 20, 30, 60];

// Choose what to practise and how, then start (or pick up the unfinished
// quiz). Below: progress per domain and the recent attempts.
export default function TopcitSetup({ store, patchCfg, onStart, onResume, onReset }) {
  const { cfg, stats, hist, session } = store;
  const mock = cfg.count === 'mock';
  const poolSize = poolOf(cfg, stats).length;
  const size = plannedSize(cfg, stats);
  const limit = timeLimit(cfg, size);
  const seen = Object.keys(stats).length;
  const missed = Object.values(stats).filter((s) => s.last === 0).length;
  const resumable = session && !session.done;

  const setTopics = (topics) => patchCfg({ topics });
  const toggleTopic = (key, on) => setTopics(on ? [...cfg.topics, key] : cfg.topics.filter((k) => k !== key));
  const toggleDomain = (domain) => {
    const keys = TOPICS[domain].map((t) => topicKey(domain, t));
    const all = keys.every((k) => cfg.topics.includes(k));
    setTopics(all ? cfg.topics.filter((k) => !keys.includes(k)) : [...new Set([...cfg.topics, ...keys])]);
  };
  const allKeys = DOMAINS.flatMap((d) => TOPICS[d.id].map((t) => topicKey(d.id, t)));

  const setCount = (v) => {
    const count = ['all', 'mock', 'custom'].includes(v) ? v : Number(v);
    patchCfg(count === 'mock' ? { count, mode: 'exam' } : { count });
  };
  const setMode = (mode) => patchCfg(mode === 'practice' && mock ? { mode, count: 20 } : { mode });

  const countNote = mock
    ? `Mock exam follows the 2026 blueprint: 15 objective questions per domain plus 7 descriptive (2, 2, 1, 2), exam mode, 2 minutes per question. Performance tasks are not simulated. Topic and type choices are ignored.`
    : (typeof cfg.count === 'number' || cfg.count === 'custom') && size < (cfg.count === 'custom' ? cfg.custom : cfg.count)
      ? `Only ${size} questions match your filters, so the quiz will use all of them.`
      : '';

  return (
    <div className="topcit-wrap">
      <div className="topcit-hero">
        <div>
          <h2 className="topcit-hero-title">TOPCIT practice quiz</h2>
          <p>
            Practice items written in the style of the 2026 test&apos;s four domains. Choose topics, how many questions, and how you want to be
            timed and marked.
          </p>
        </div>
        <div className="topcit-count" aria-live="polite">
          <b>{size}</b>
          <span>
            {size === 1 ? 'question' : 'questions'}
            {limit ? `, ${Math.round(limit / 60)} min` : ''}
          </span>
        </div>
      </div>

      <div className="topcit-setup">
        <section className="topcit-panel" aria-labelledby="topcit-topics">
          <div className="topcit-panel-head">
            <h3 id="topcit-topics">Domains and topics</h3>
            <button type="button" className="topcit-link" onClick={() => setTopics(allKeys)}>
              Select all
            </button>
            <button type="button" className="topcit-link" onClick={() => setTopics([])}>
              Clear
            </button>
          </div>
          {DOMAINS.map((d) => {
            const keys = TOPICS[d.id].map((t) => topicKey(d.id, t));
            return (
              <div className="topcit-domain" key={d.id}>
                <div className="topcit-domain-head">
                  <h4>{d.name}</h4>
                  <span className="topcit-muted">{d.full}</span>
                  <button type="button" className="topcit-link" onClick={() => toggleDomain(d.id)} disabled={mock}>
                    {keys.every((k) => cfg.topics.includes(k)) ? 'Clear' : 'All'}
                  </button>
                </div>
                <div className="topcit-chips">
                  {TOPICS[d.id].map((t) => {
                    const key = topicKey(d.id, t);
                    return (
                      <label className="topcit-chip" key={key}>
                        <input type="checkbox" checked={cfg.topics.includes(key)} disabled={mock} onChange={(e) => toggleTopic(key, e.target.checked)} />
                        {t} <em>{topicCount(d.id, t, cfg, stats)}</em>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>

        <section className="topcit-panel topcit-settings" aria-label="Quiz settings">
          <div>
            <h3>Number of questions</h3>
            <Seg
              label="Number of questions"
              value={cfg.count}
              onChange={setCount}
              items={[
                ['all', `All (${poolSize})`],
                ...COUNT_CHOICES.map((n) => [n, String(n), poolSize < 1]),
                ['mock', `Mock exam (${MOCK_TOTAL})`],
                ['custom', 'Custom'],
              ]}
            />
            {cfg.count === 'custom' && (
              <input
                className="topcit-num"
                type="number"
                min="1"
                max={QUESTIONS.length}
                value={cfg.custom}
                onChange={(e) => patchCfg({ custom: Math.max(1, Math.floor(Number(e.target.value)) || 1) })}
                aria-label="Custom number of questions"
              />
            )}
            {countNote && <p className="topcit-note">{countNote}</p>}
          </div>

          <div>
            <h3>Question types</h3>
            <div className="topcit-chips">
              {TYPES.map(([value, label]) => (
                <label className="topcit-chip" key={value}>
                  <input
                    type="checkbox"
                    checked={cfg.types.includes(value)}
                    disabled={mock}
                    onChange={(e) => patchCfg({ types: e.target.checked ? [...cfg.types, value] : cfg.types.filter((t) => t !== value) })}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3>Question pool</h3>
            <Seg
              label="Question pool"
              value={cfg.pool}
              onChange={(pool) => patchCfg({ pool })}
              items={[
                ['all', 'All questions'],
                ['unseen', `Not yet seen (${QUESTIONS.length - seen})`],
                ['missed', `Missed last time (${missed})`],
              ]}
            />
          </div>

          <div>
            <h3>Mode</h3>
            <Seg
              label="Mode"
              value={cfg.mode}
              onChange={setMode}
              items={[
                ['practice', 'Practice'],
                ['exam', 'Exam'],
              ]}
            />
            <p className="topcit-note">
              {cfg.mode === 'practice' ? 'Practice shows the answer and explanation as soon as you choose.' : 'Exam hides answers until you finish, and lets you change answers.'}
            </p>
          </div>

          <div>
            <h3>Timer</h3>
            <Seg
              label="Timer"
              value={mock ? 'pace' : cfg.timer}
              onChange={(timer) => !mock && patchCfg({ timer })}
              items={[
                ['off', 'Off', mock],
                ['pace', 'Exam pace'],
                ['custom', 'Custom', mock],
              ]}
            />
            {cfg.timer === 'custom' && !mock && (
              <span className="topcit-minutes">
                <input
                  className="topcit-num"
                  type="number"
                  min="1"
                  max="300"
                  value={cfg.minutes}
                  onChange={(e) => patchCfg({ minutes: Math.max(1, Math.floor(Number(e.target.value)) || 1) })}
                  aria-label="Minutes"
                />{' '}
                min
              </span>
            )}
            <p className="topcit-note">
              {limit
                ? `Time limit ${mmss(limit)} (the real test gives 150 minutes for 75 items, about 2 minutes each). The quiz submits when time runs out.`
                : 'No time limit. Elapsed time is still recorded.'}
            </p>
          </div>

          <div>
            <h3>Order</h3>
            <div className="topcit-chips">
              <label className="topcit-chip">
                <input type="checkbox" checked={cfg.shuffleQuestions} onChange={(e) => patchCfg({ shuffleQuestions: e.target.checked })} />
                Shuffle questions
              </label>
              <label className="topcit-chip">
                <input type="checkbox" checked={cfg.shuffleOptions} onChange={(e) => patchCfg({ shuffleOptions: e.target.checked })} />
                Shuffle answer choices
              </label>
            </div>
          </div>

          <div className="topcit-go">
            <button type="button" className="btn-next" onClick={onStart} disabled={size < 1}>
              Start quiz
            </button>
            {resumable && (
              <button type="button" className="btn-prev" onClick={onResume}>
                Resume quiz ({session.cur + 1} of {session.ids.length})
              </button>
            )}
          </div>
        </section>
      </div>

      <div className="topcit-setup topcit-progress">
        <section className="topcit-panel">
          <div className="topcit-panel-head">
            <h3>Your progress</h3>
            <button type="button" className="topcit-link" onClick={onReset}>
              Reset progress
            </button>
          </div>
          {DOMAINS.map((d) => {
            const questions = QUESTIONS.filter((q) => q.d === d.id);
            const results = questions.map((q) => stats[q.id]).filter(Boolean);
            const accuracy = results.length ? results.filter((r) => r.last === 1).length / results.length : 0;
            return (
              <div key={d.id}>
                <div className="topcit-row">
                  <span>{d.name}</span>
                  <span className="topcit-bar" title={`${results.length} of ${questions.length} seen`}>
                    <i className={results.length && accuracy < 0.6 ? 'low' : ''} style={{ width: `${Math.round(accuracy * 100)}%` }} />
                  </span>
                  <span className="topcit-row-v">{results.length ? `${Math.round(accuracy * 100)}%` : 'none'}</span>
                </div>
                <div className="topcit-muted topcit-small">
                  {results.length} of {questions.length} questions seen
                </div>
              </div>
            );
          })}
          <p className="topcit-note">Accuracy is based on your latest answer to each question. Progress stays in this browser only.</p>
        </section>

        <section className="topcit-panel">
          <h3>Recent attempts</h3>
          {hist.length ? (
            <div className="topcit-scroll">
              <table className="topcit-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Mode</th>
                    <th className="r">Items</th>
                    <th className="r">Score</th>
                    <th className="r">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {hist
                    .slice(-8)
                    .reverse()
                    .map((h) => (
                      <tr key={h.at}>
                        <td>{new Date(h.at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</td>
                        <td>{h.mode}</td>
                        <td className="r">{h.n}</td>
                        <td className="r">{Math.round(h.pct)}%</td>
                        <td className="r">{mmss(h.sec)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="topcit-muted">No finished quizzes yet. Your scores will appear here.</p>
          )}
        </section>
      </div>
    </div>
  );
}
