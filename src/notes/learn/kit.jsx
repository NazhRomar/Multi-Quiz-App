import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import './learn.css';

// Building blocks for the interactive "Learn" pages (notes/index.js
// `component` notes): an Activity section per topic, and small games that
// report back through onDone when finished, so the page can track progress.

export const peso = (n) => `${n < 0 ? '−' : ''}₱${Math.abs(Math.round(n)).toLocaleString('en-PH')}`;
export const num = (n, digits = 0) => n.toLocaleString('en-PH', { maximumFractionDigits: digits });

export const shuffle = (list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// --- Progress: which activities are done, kept per device ---------------

const LearnContext = createContext({ done: new Set(), markDone: () => {}, reset: () => {} });
export const useLearn = () => useContext(LearnContext);

const readDone = (key) => {
  try {
    return new Set(JSON.parse(localStorage.getItem(key) || '[]'));
  } catch (e) {
    return new Set();
  }
};

export function LearnProvider({ storageKey, children }) {
  const [done, setDone] = useState(() => readDone(storageKey));
  const save = (next) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...next]));
    } catch (e) {
      /* kept for this visit only */
    }
  };
  const markDone = useCallback(
    (id) =>
      setDone((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev).add(id);
        save(next);
        return next;
      }),
    [storageKey]
  );
  const reset = useCallback(() => {
    const next = new Set();
    save(next);
    setDone(next);
  }, [storageKey]);
  const value = useMemo(() => ({ done, markDone, reset }), [done, markDone, reset]);
  return <LearnContext.Provider value={value}>{children}</LearnContext.Provider>;
}

// An activity with several parts is done once every part is: parts[i] is the
// onDone for part i.
export function useParts(id, count) {
  const { markDone } = useLearn();
  const [finished, setFinished] = useState(() => new Set());
  const parts = useMemo(
    () => Array.from({ length: count }, (_, i) => () => setFinished((prev) => (prev.has(i) ? prev : new Set(prev).add(i)))),
    [count]
  );
  useEffect(() => {
    if (finished.size >= count) markDone(id);
  }, [finished, count, id, markDone]);
  return parts;
}

export function ProgressSummary({ items }) {
  const { done, reset } = useLearn();
  const [confirming, setConfirming] = useState(false);
  const count = items.filter((a) => done.has(a.id)).length;
  return (
    <div className="learn-progress">
      <div className="learn-progress-row">
        <strong>
          {count} of {items.length} done
        </strong>
        {count > 0 &&
          (confirming ? (
            <span className="learn-progress-confirm">
              Clear all progress?
              <button type="button" className="learn-link" onClick={() => (reset(), setConfirming(false))}>
                Yes, start over
              </button>
              <button type="button" className="learn-link" onClick={() => setConfirming(false)}>
                Cancel
              </button>
            </span>
          ) : (
            <button type="button" className="learn-link" onClick={() => setConfirming(true)}>
              Start over
            </button>
          ))}
      </div>
      <div className="learn-progress-track" aria-hidden="true">
        {items.map((a) => (
          <button
            type="button"
            key={a.id}
            className={`learn-progress-seg ${done.has(a.id) ? 'learn-progress-seg--done' : ''}`}
            title={a.label}
            tabIndex={-1}
            onClick={() => document.getElementById(a.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          />
        ))}
      </div>
    </div>
  );
}

// --- Layout ---------------------------------------------------------------

export function ModuleHeading({ id, kicker, title, children }) {
  return (
    <header className="learn-module" id={id}>
      <span className="learn-kicker">{kicker}</span>
      <h2 className="learn-module-title">{title}</h2>
      {children && <p className="learn-module-sub">{children}</p>}
    </header>
  );
}

export function Activity({ id, number, title, slides, intro, children }) {
  const { done } = useLearn();
  const isDone = done.has(id);
  return (
    <section className={`learn-activity ${isDone ? 'learn-activity--done' : ''}`} id={id}>
      <header className="learn-activity-head">
        <span className="learn-activity-num" aria-hidden="true">
          {isDone ? '✓' : number}
        </span>
        <div className="learn-activity-titles">
          <h3 className="learn-activity-title">{title}</h3>
          {slides && <span className="learn-slides">Slides {slides}</span>}
        </div>
        {isDone && <span className="learn-done-badge">Done</span>}
      </header>
      {intro && <p className="learn-intro">{intro}</p>}
      <div className="learn-activity-body">{children}</div>
    </section>
  );
}

export function Step({ title, hint, children }) {
  return (
    <div className="learn-step">
      <h4 className="learn-step-title">{title}</h4>
      {hint && <p className="learn-step-hint">{hint}</p>}
      {children}
    </div>
  );
}

export function Callout({ label, children, tone }) {
  return (
    <div className={`learn-callout ${tone ? `learn-callout--${tone}` : ''}`}>
      {label && <span className="learn-callout-label">{label}</span>}
      <div>{children}</div>
    </div>
  );
}

// --- Tap-to-reveal cards --------------------------------------------------

export function RevealCards({ cards, onDone }) {
  const [open, setOpen] = useState(() => new Set());
  const seen = useRef(new Set());
  const toggle = (i) => {
    seen.current.add(i);
    if (seen.current.size === cards.length) onDone?.();
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };
  const allOpen = open.size === cards.length;
  return (
    <div className="learn-reveal-wrap">
      <div className="learn-reveal-grid">
        {cards.map((c, i) => {
          const isOpen = open.has(i);
          return (
            <button type="button" key={i} className={`learn-reveal ${isOpen ? 'learn-reveal--open' : ''}`} onClick={() => toggle(i)} aria-expanded={isOpen}>
              {c.tag && <span className="learn-tag">{c.tag}</span>}
              <span className="learn-reveal-front">{c.front}</span>
              {isOpen ? <span className="learn-reveal-back">{c.back}</span> : <span className="learn-reveal-hint">Tap to reveal</span>}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        className="learn-link learn-reveal-all"
        onClick={() => {
          cards.forEach((_, i) => seen.current.add(i));
          onDone?.();
          setOpen(allOpen ? new Set() : new Set(cards.map((_, i) => i)));
        }}
      >
        {allOpen ? 'Hide all' : 'Reveal all'}
      </button>
    </div>
  );
}

// --- Flashcards -----------------------------------------------------------

export function Flashcards({ cards, onDone }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const seen = useRef(new Set());
  const card = cards[index];
  const go = (delta) => {
    setFlipped(false);
    setIndex((i) => (i + delta + cards.length) % cards.length);
  };
  const flip = () => {
    if (!flipped) {
      seen.current.add(index);
      if (seen.current.size === cards.length) onDone?.();
    }
    setFlipped((f) => !f);
  };
  return (
    <div className="learn-flash">
      <button type="button" className={`learn-flash-card ${flipped ? 'learn-flash-card--back' : ''}`} onClick={flip} aria-live="polite">
        <span className="learn-flash-side">{flipped ? 'Answer' : 'Term'}</span>
        <span className="learn-flash-text">{flipped ? card.back : card.front}</span>
        {!flipped && <span className="learn-reveal-hint">Tap to flip</span>}
      </button>
      <div className="learn-flash-nav">
        <button type="button" className="learn-btn learn-btn--ghost" onClick={() => go(-1)}>
          ← Prev
        </button>
        <span className="learn-flash-count">
          {index + 1} / {cards.length}
        </span>
        <button type="button" className="learn-btn learn-btn--ghost" onClick={() => go(1)}>
          Next →
        </button>
      </div>
    </div>
  );
}

// --- Multiple choice round ------------------------------------------------
// questions: [{ q, options, answer (index into options), why, keepOrder }]

export function QuizRound(props) {
  const [round, setRound] = useState(0);
  return <QuizRun key={round} {...props} onRetry={() => setRound((r) => r + 1)} />;
}

function QuizRun({ questions, onDone, shuffleQuestions = false, label = 'Question', onRetry }) {
  const [order] = useState(() => (shuffleQuestions ? shuffle(questions.map((_, i) => i)) : questions.map((_, i) => i)));
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [missed, setMissed] = useState([]);
  const [finished, setFinished] = useState(false);
  const q = questions[order[index]];
  const optionOrder = useMemo(() => (q.keepOrder ? q.options.map((_, i) => i) : shuffle(q.options.map((_, i) => i))), [q]);

  const pick = (i) => {
    if (picked != null) return;
    setPicked(i);
    if (i !== q.answer) setMissed((m) => [...m, q]);
  };
  const next = () => {
    if (index + 1 < order.length) {
      setIndex(index + 1);
      setPicked(null);
    } else {
      setFinished(true);
      onDone?.();
    }
  };

  if (finished) {
    const score = order.length - missed.length;
    return (
      <div className="learn-quiz learn-quiz--done">
        <p className="learn-score">
          <strong>
            {score} / {order.length}
          </strong>{' '}
          {score === order.length ? 'Perfect!' : score >= order.length * 0.7 ? 'Nice work.' : 'Worth another go.'}
        </p>
        {missed.length > 0 && (
          <ul className="learn-missed">
            {missed.map((m, i) => (
              <li key={i}>
                <span>{m.q}</span>
                <strong>{m.options[m.answer]}</strong>
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="learn-btn" onClick={onRetry}>
          Try again
        </button>
      </div>
    );
  }

  const answered = picked != null;
  const right = picked === q.answer;
  return (
    <div className="learn-quiz">
      <div className="learn-quiz-meta">
        {label} {index + 1} of {order.length}
      </div>
      <p className="learn-quiz-q">{q.q}</p>
      <div className="learn-options">
        {optionOrder.map((i) => {
          const state = !answered ? '' : i === q.answer ? 'learn-option--right' : i === picked ? 'learn-option--wrong' : 'learn-option--dim';
          return (
            <button type="button" key={i} className={`learn-option ${state}`} onClick={() => pick(i)} disabled={answered}>
              {q.options[i]}
            </button>
          );
        })}
      </div>
      {answered && (
        <div className={`learn-feedback ${right ? 'learn-feedback--right' : 'learn-feedback--wrong'}`}>
          <strong>{right ? 'Correct.' : 'Not quite.'}</strong> {q.why}
        </div>
      )}
      {answered && (
        <button type="button" className="learn-btn" onClick={next}>
          {index + 1 < order.length ? 'Next' : 'See score'}
        </button>
      )}
    </div>
  );
}

// --- Sort into buckets ----------------------------------------------------
// buckets: [{ id, label }]; items: [{ text, bucket, why?, amount?, source? }].
// roundSize plays a random subset each round.

export function SortGame(props) {
  const [round, setRound] = useState(0);
  return <SortRun key={round} {...props} onRetry={() => setRound((r) => r + 1)} />;
}

function SortRun({ buckets, items, onDone, roundSize, onRetry, showTotals = false }) {
  const [deck] = useState(() => shuffle(items).slice(0, roundSize ?? items.length));
  const [index, setIndex] = useState(0);
  const [placed, setPlaced] = useState([]);
  const [wrong, setWrong] = useState(null);
  const [flash, setFlash] = useState(false);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const finished = index >= deck.length;
  const item = deck[index];
  const finishedRef = useRef(false);
  useEffect(() => {
    if (finished && !finishedRef.current) {
      finishedRef.current = true;
      onDone?.();
    }
  }, [finished, onDone]);

  const choose = (bucketId) => {
    if (wrong || flash) return;
    const correct = bucketId === item.bucket;
    setPlaced((p) => [...p, { ...item, correct }]);
    if (correct) {
      const s = streak + 1;
      setStreak(s);
      setBest((b) => Math.max(b, s));
      setFlash(true);
      timer.current = setTimeout(() => {
        setFlash(false);
        setIndex((i) => i + 1);
      }, 420);
    } else {
      setStreak(0);
      setWrong(bucketId);
    }
  };
  const next = () => {
    setWrong(null);
    setIndex((i) => i + 1);
  };

  const score = placed.filter((p) => p.correct).length;
  const bucketLabel = (id) => buckets.find((b) => b.id === id)?.label;

  return (
    <div className="learn-sort">
      {!finished ? (
        <>
          <div className="learn-sort-meta">
            <span>
              Card {index + 1} of {deck.length}
            </span>
            <span className={`learn-streak ${streak >= 3 ? 'learn-streak--hot' : ''}`}>Streak {streak}</span>
          </div>
          <div className={`learn-sort-card ${flash ? 'learn-sort-card--right' : ''} ${wrong ? 'learn-sort-card--wrong' : ''}`}>
            <span className="learn-sort-text">{item.text}</span>
            {item.amount != null && <span className="learn-sort-amount">{peso(item.amount)}</span>}
          </div>
          <div className="learn-sort-buttons" style={{ '--bucket-count': buckets.length }}>
            {buckets.map((b) => (
              <button
                type="button"
                key={b.id}
                className={`learn-bucket-btn ${wrong === b.id ? 'learn-bucket-btn--wrong' : ''} ${wrong && b.id === item.bucket ? 'learn-bucket-btn--right' : ''}`}
                onClick={() => choose(b.id)}
              >
                {b.label}
              </button>
            ))}
          </div>
          {wrong && (
            <div className="learn-feedback learn-feedback--wrong">
              <strong>It goes in {bucketLabel(item.bucket)}.</strong> {item.why}
              {item.source && <span className="learn-source"> ({item.source})</span>}
              <div>
                <button type="button" className="learn-btn" onClick={next}>
                  Next card
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="learn-quiz--done">
          <p className="learn-score">
            <strong>
              {score} / {deck.length}
            </strong>{' '}
            sorted right · best streak {best}
          </p>
          <button type="button" className="learn-btn" onClick={onRetry}>
            {roundSize && roundSize < items.length ? 'Play a new round' : 'Play again'}
          </button>
        </div>
      )}
      <div className="learn-buckets" style={{ '--bucket-count': buckets.length }}>
        {buckets.map((b) => {
          const inBucket = placed.filter((p) => p.bucket === b.id);
          const total = inBucket.reduce((sum, p) => sum + (p.amount ?? 0), 0);
          return (
            <div className="learn-bucket" key={b.id}>
              <div className="learn-bucket-head">
                <span>{b.label}</span>
                {showTotals && <strong>{peso(total)}</strong>}
              </div>
              <ul>
                {inBucket.map((p, i) => (
                  <li key={i} className={p.correct ? '' : 'learn-bucket-item--missed'}>
                    {p.text}
                    {p.amount != null && <span className="learn-bucket-amount">{peso(p.amount)}</span>}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Put in order ---------------------------------------------------------
// items: [{ text, sub? }] in the right order.

export function OrderGame(props) {
  const [round, setRound] = useState(0);
  return <OrderRun key={round} {...props} onRetry={() => setRound((r) => r + 1)} />;
}

function OrderRun({ items, onDone, onRetry, prompt }) {
  const [pool] = useState(() => {
    let order = shuffle(items.map((_, i) => i));
    // Never start already in order.
    while (order.length > 1 && order.every((v, i) => v === i)) order = shuffle(order);
    return order;
  });
  const [placed, setPlaced] = useState([]);
  const [shake, setShake] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  const finished = placed.length === items.length;

  const tap = (i) => {
    if (placed.includes(i)) return;
    if (i === placed.length) {
      const next = [...placed, i];
      setPlaced(next);
      if (next.length === items.length) onDone?.();
    } else {
      setMistakes((m) => m + 1);
      setShake(i);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setShake(null), 450);
    }
  };

  return (
    <div className="learn-order">
      {prompt && <p className="learn-order-prompt">{prompt}</p>}
      <ol className="learn-order-slots">
        {items.map((it, i) => (
          <li key={i} className={`learn-order-slot ${placed[i] != null ? 'learn-order-slot--filled' : ''}`}>
            <span className="learn-order-n">{i + 1}</span>
            {placed[i] != null ? (
              <span>
                <strong>{items[placed[i]].text}</strong>
                {items[placed[i]].sub && <span className="learn-order-sub">{items[placed[i]].sub}</span>}
              </span>
            ) : (
              <span className="learn-order-empty">…</span>
            )}
          </li>
        ))}
      </ol>
      {!finished ? (
        <div className="learn-order-pool">
          {pool
            .filter((i) => !placed.includes(i))
            .map((i) => (
              <button type="button" key={i} className={`learn-chip ${shake === i ? 'learn-chip--shake' : ''}`} onClick={() => tap(i)}>
                {items[i].text}
              </button>
            ))}
        </div>
      ) : (
        <div className="learn-order-done">
          <span>{mistakes === 0 ? 'Perfect order!' : `In order, with ${mistakes} wrong tap${mistakes === 1 ? '' : 's'}.`}</span>
          <button type="button" className="learn-link" onClick={onRetry}>
            Shuffle again
          </button>
        </div>
      )}
    </div>
  );
}

// --- Pick every correct option --------------------------------------------
// options: [{ label, correct }]

export function PickAll({ prompt, options, onDone, explain }) {
  const [order, setOrder] = useState(() => shuffle(options.map((_, i) => i)));
  const [selected, setSelected] = useState(() => new Set());
  const [checked, setChecked] = useState(false);
  const allRight = checked && options.every((o, i) => o.correct === selected.has(i));

  const toggle = (i) => {
    if (checked) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };
  const check = () => {
    setChecked(true);
    if (options.every((o, i) => o.correct === selected.has(i))) onDone?.();
  };
  const retry = () => {
    setChecked(false);
    setSelected(new Set());
    setOrder(shuffle(options.map((_, i) => i)));
  };

  return (
    <div className="learn-pick">
      <p className="learn-quiz-q">{prompt}</p>
      <div className="learn-pick-grid">
        {order.map((i) => {
          const o = options[i];
          const on = selected.has(i);
          let state = on ? 'learn-chip--on' : '';
          if (checked) state = o.correct ? (on ? 'learn-chip--right' : 'learn-chip--missed') : on ? 'learn-chip--wrong' : 'learn-chip--dim';
          return (
            <button type="button" key={i} className={`learn-chip ${state}`} onClick={() => toggle(i)} aria-pressed={on}>
              {o.label}
            </button>
          );
        })}
      </div>
      {!checked ? (
        <button type="button" className="learn-btn" onClick={check} disabled={selected.size === 0}>
          Check
        </button>
      ) : (
        <div className={`learn-feedback ${allRight ? 'learn-feedback--right' : 'learn-feedback--wrong'}`}>
          <strong>{allRight ? 'All correct.' : 'Not quite. The dashed ones were missed.'}</strong> {explain}
          {!allRight && (
            <div>
              <button type="button" className="learn-btn" onClick={retry}>
                Try again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// --- Type the number ------------------------------------------------------

export function NumberCheck({ prompt, answer, unit, prefix, explain, onDone, tolerance = 0.05 }) {
  const [value, setValue] = useState('');
  const [result, setResult] = useState(null);
  const [tries, setTries] = useState(0);
  const check = (e) => {
    e.preventDefault();
    const n = parseFloat(value.replace(/[₱,\s]/g, ''));
    if (Number.isNaN(n)) return;
    const ok = Math.abs(n - answer) <= tolerance;
    setResult(ok ? 'right' : 'wrong');
    setTries((t) => t + 1);
    if (ok) onDone?.();
  };
  const reveal = result === 'right' || tries >= 2;
  return (
    <form className="learn-number" onSubmit={check}>
      <p className="learn-quiz-q">{prompt}</p>
      <div className="learn-number-row">
        {prefix && <span className="learn-number-affix">{prefix}</span>}
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (result === 'wrong') setResult(null);
          }}
          aria-label="Your answer"
          placeholder="?"
          disabled={result === 'right'}
        />
        {unit && <span className="learn-number-affix">{unit}</span>}
        {result !== 'right' && (
          <button type="submit" className="learn-btn">
            Check
          </button>
        )}
      </div>
      {result && (
        <div className={`learn-feedback ${result === 'right' ? 'learn-feedback--right' : 'learn-feedback--wrong'}`}>
          <strong>{result === 'right' ? 'Correct!' : tries >= 2 ? 'Here’s how:' : 'Not quite, try again.'}</strong> {reveal && explain}
        </div>
      )}
    </form>
  );
}

// --- Slider ---------------------------------------------------------------

export function Slider({ label, value, min, max, step = 1, onChange, format = (v) => v, note }) {
  return (
    <label className="learn-slider">
      <span className="learn-slider-head">
        <span>{label}</span>
        <strong>{format(value)}</strong>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      {note && <span className="learn-slider-note">{note}</span>}
    </label>
  );
}

export function Stat({ label, value, tone, sub }) {
  return (
    <div className={`learn-stat ${tone ? `learn-stat--${tone}` : ''}`}>
      <span className="learn-stat-label">{label}</span>
      <strong className="learn-stat-value">{value}</strong>
      {sub && <span className="learn-stat-sub">{sub}</span>}
    </div>
  );
}
