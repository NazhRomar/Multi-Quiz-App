import { useState } from 'react';
import { Activity, Callout, Flashcards, NumberCheck, PickAll, QuizRound, RevealCards, Slider, SortGame, Stat, Step, num, peso, useParts } from '../kit.jsx';

// Module 5: Financial Planning (public/notes/techno-05-financial-planning.pdf).
// Every figure here is the slides' own.

// --- 1. Financial Plan Basics (slides 3–5) ---------------------------------

function Basics({ id }) {
  const [pickParts, pickFocus] = useParts(id, 2);
  return (
    <Activity
      id={id}
      number={1}
      title="Financial Plan Basics"
      slides="3–5"
      intro="Building a financial plan can be the most intimidating part of a business plan, and one of the most vital. Tap each card, then test yourself."
    >
      <Step title="A complete financial plan prepares a business to…">
        <RevealCards
          cards={[
            { front: 'Pitch to Investors', back: 'Present clear, credible financial projections and strategic direction.' },
            { front: 'Receive Funding', back: 'Demonstrate financial readiness and risk management to secure capital.' },
            { front: 'Achieve Long-Term Success', back: 'Maintain structured monetary control and sustainable growth expectations.' },
          ]}
        />
      </Step>
      <Step title="What is a financial plan?">
        <Callout label="Definition">
          A <strong>Financial Plan</strong> is an overview of your current business financials and projections for growth.
        </Callout>
        <RevealCards
          cards={[
            { tag: 'Component 1', front: 'Current Monetary Situation', back: 'A snapshot of the present financial health of your business.' },
            { tag: 'Component 2', front: 'Future Growth Projections', back: 'Projections detailing your future financial expectations and targets.' },
          ]}
        />
      </Step>
      <Step title="The technopreneurship twist">
        <Callout label="Definition">
          A financial plan in technopreneurship <strong>merges engineering and technology innovation with rigorous startup finance.</strong>
        </Callout>
        <RevealCards
          cards={[
            { tag: 'Focus area', front: 'Heavy Upfront R&D', back: 'Substantial research & development funding.' },
            { tag: 'Focus area', front: 'Scalable Tech', back: 'Highly scalable infrastructure design.' },
            { tag: 'Focus area', front: 'Pricing Models', back: 'Unique models like SaaS subscriptions.' },
            { tag: 'Focus area', front: 'VC Timelines', back: 'Specific venture capital milestones.' },
          ]}
        />
        <Callout label="Ultimate goal" tone="accent">
          Outline the <strong>pathway to commercializing a technological solution</strong> while rigorously managing capital.
        </Callout>
      </Step>
      <Step title="Check yourself">
        <PickAll
          prompt="Pick the two key components of a financial plan."
          options={[
            { label: 'Current Monetary Situation', correct: true },
            { label: 'Future Growth Projections', correct: true },
            { label: 'Competitor Analysis', correct: false },
            { label: 'Marketing Mix', correct: false },
          ]}
          explain="A snapshot of today's financial health, plus projections of where it's going."
          onDone={pickParts}
        />
        <PickAll
          prompt="Pick all four strategic focus areas of a technopreneurship financial plan."
          options={[
            { label: 'Heavy Upfront R&D', correct: true },
            { label: 'Scalable Tech', correct: true },
            { label: 'Pricing Models', correct: true },
            { label: 'VC Timelines', correct: true },
            { label: 'Bulk Inventory Discounts', correct: false },
            { label: 'Steel-Mold Tooling', correct: false },
            { label: 'Maximum Machine Uptime', correct: false },
          ]}
          explain="R&D, Scalable Tech, Pricing Models (like SaaS) and VC Timelines. The others are traditional-manufacturing ideas from Module 6."
          onDone={pickFocus}
        />
      </Step>
    </Activity>
  );
}

// --- 2. Burn & Runway Simulator (slides 6–9) -------------------------------

const EXPENSES = [
  { key: 'salaries', label: 'Engineering & product salaries', note: '3 developers', start: 250000, max: 600000 },
  { key: 'marketing', label: 'Sales & marketing', note: 'User acquisition & ads', start: 80000, max: 300000 },
  { key: 'cloud', label: 'Cloud & hosting', note: 'AWS servers & DB tools', start: 45000, max: 200000 },
  { key: 'software', label: 'Software subscriptions', note: 'GitHub, Slack, CRM', start: 15000, max: 100000 },
  { key: 'workspace', label: 'Workspace & admin', note: 'Co-working & internet', start: 10000, max: 100000 },
];
const START_CASH = 5000000;
const START_REVENUE = 150000;
const startLines = () => Object.fromEntries(EXPENSES.map((e) => [e.key, e.start]));
const MONTH_CELLS = 36;

function BurnSimulator({ id }) {
  const [checkA, checkB] = useParts(id, 2);
  const [cash, setCash] = useState(START_CASH);
  const [lines, setLines] = useState(startLines);
  const [revenue, setRevenue] = useState(START_REVENUE);
  const gross = Object.values(lines).reduce((a, b) => a + b, 0);
  const net = gross - revenue;
  const runway = net > 0 ? cash / net : Infinity;
  const isExample = cash === START_CASH && revenue === START_REVENUE && EXPENSES.every((e) => lines[e.key] === e.start);
  const salaryShare = gross > 0 ? (lines.salaries / gross) * 100 : 0;
  const runwayText = Number.isFinite(runway) ? `${num(runway, 1)} months` : 'No burn';

  return (
    <Activity
      id={id}
      number={2}
      title="Burn & Runway Simulator"
      slides="6–9"
      intro="A B2B SaaS startup just raised ₱5,000,000 in seed funding. Move the sliders and watch how long the cash lasts. The starting values are the slides' example."
    >
      <div className="learn-sim">
        <div className="learn-sim-controls">
          <Slider label="Cash in the bank" value={cash} min={1000000} max={10000000} step={250000} onChange={setCash} format={peso} />
          <p className="learn-sim-group">Monthly cash outflows</p>
          {EXPENSES.map((e) => (
            <Slider
              key={e.key}
              label={e.label}
              note={e.note}
              value={lines[e.key]}
              min={0}
              max={e.max}
              step={5000}
              onChange={(v) => setLines((l) => ({ ...l, [e.key]: v }))}
              format={peso}
            />
          ))}
          <p className="learn-sim-group">Monthly inflow</p>
          <Slider label="Subscription revenue" note="MVP launched · early adopters" value={revenue} min={0} max={800000} step={10000} onChange={setRevenue} format={peso} />
          {!isExample && (
            <button
              type="button"
              className="learn-link"
              onClick={() => {
                setCash(START_CASH);
                setLines(startLines());
                setRevenue(START_REVENUE);
              }}
            >
              Reset to the slides&apos; example
            </button>
          )}
        </div>
        <div className="learn-sim-output">
          <div className="learn-stats">
            <Stat label="Gross burn" value={peso(gross)} sub="total cash spent / mo" />
            <Stat label="Net burn" value={net > 0 ? peso(net) : '₱0'} sub="gross − revenue" tone={net > 0 ? 'warn' : 'good'} />
            <Stat label="Runway" value={runwayText} sub="cash ÷ net burn" tone={Number.isFinite(runway) ? (runway < 12 ? 'warn' : undefined) : 'good'} />
          </div>
          <div className="learn-months" aria-label={`Runway: ${runwayText}`}>
            {Array.from({ length: MONTH_CELLS }, (_, i) => {
              const fill = Number.isFinite(runway) ? Math.max(0, Math.min(1, runway - i)) : 1;
              return (
                <span key={i} className={`learn-month ${fill === 0 ? 'learn-month--empty' : ''}`} title={`Month ${i + 1}`}>
                  <span className="learn-month-fill" style={{ height: `${fill * 100}%` }} />
                </span>
              );
            })}
          </div>
          <p className="learn-months-caption">
            {Number.isFinite(runway)
              ? runway > MONTH_CELLS
                ? `Each block is a month. The cash lasts past the ${MONTH_CELLS} shown.`
                : `Each block is a month. The cash runs out during month ${Math.ceil(runway)}.`
              : 'Revenue covers every peso spent, so nothing is burned. The startup is cash-flow positive.'}
          </p>
          <ol className="learn-working">
            <li>
              <span>Gross burn</span> = {EXPENSES.map((e) => num(lines[e.key])).join(' + ')} = <strong>{peso(gross)}</strong>
            </li>
            <li>
              <span>Net burn</span> = gross burn − monthly revenue = {num(gross)} − {num(revenue)} = <strong>{net > 0 ? peso(net) : `${peso(net)} (no burn)`}</strong>
            </li>
            <li>
              <span>Cash runway</span> = cash balance ÷ net burn = {Number.isFinite(runway) ? `${num(cash)} ÷ ${num(net)} = ` : ''}
              <strong>{runwayText}</strong>
            </li>
          </ol>
          {gross > 0 && (
            <p className="learn-aside">
              Salaries are <strong>{num(salaryShare, 1)}%</strong> of gross burn{lines.salaries === 250000 && gross === 400000 ? ', the slide’s “largest outflow (62.5%)”' : ''}. Tech startup costs lean toward engineering talent and
              digital infrastructure, not physical inventory.
            </p>
          )}
        </div>
      </div>
      <Callout label="Investor perspective" tone="accent">
        Net burn reveals the <strong>true account depletion</strong>. Runway is the time left to hit profitability or raise the next funding round.
      </Callout>
      <Step title="Your turn">
        <NumberCheck
          prompt="Same ₱5,000,000 and ₱400,000 gross burn, but revenue grows to ₱200,000 a month. What's the runway in months?"
          answer={25}
          unit="months"
          explain="Net burn = 400,000 − 200,000 = 200,000. Runway = 5,000,000 ÷ 200,000 = 25 months."
          onDone={checkA}
        />
        <NumberCheck
          prompt="Before the MVP launches there's no revenue at all. With ₱5,000,000 and a ₱400,000 burn, how many months?"
          answer={12.5}
          unit="months"
          explain="With no revenue, net burn = gross burn = 400,000. Runway = 5,000,000 ÷ 400,000 = 12.5 months."
          onDone={checkB}
        />
      </Step>
    </Activity>
  );
}

// --- 3. Build the Funding Ask (slides 10–13) -------------------------------

const FUNDING_ITEMS = [
  { text: 'Patent filings, software copyright & legal IP protection', amount: 150000, bucket: 'capex', why: 'IP is a long-lived asset in the CapEx schedule (useful life 10 years).' },
  { text: 'Localized server rack & edge-computing nodes', amount: 280000, bucket: 'capex', why: 'Technical infrastructure is a fixed capital asset (5 years).' },
  { text: '3D printers, CNC prototypes & electrical testing gear', amount: 450000, bucket: 'capex', why: 'R&D and lab equipment is a fixed capital asset (5 years).' },
  { text: 'High-performance GPU laptops for ML & engineering', amount: 320000, bucket: 'capex', why: 'Hardware and dev kits are fixed capital assets (3 years).' },
  { text: 'Workstation desks, ergonomic seating & safety setups', amount: 80000, bucket: 'capex', why: 'Office furniture and fixtures are fixed capital assets (5 years).' },
  { text: 'Software MVP audit & security penetration testing', amount: 120000, bucket: 'preop', why: 'A one-time startup cost paid before operating.' },
  { text: 'Business registration, local permits & licensing', amount: 35000, bucket: 'preop', why: 'A one-time startup cost paid before operating.' },
  { text: 'Initial branding & core website deployment', amount: 45000, bucket: 'preop', why: 'A one-time startup cost paid before operating.' },
  { text: '3 months of engineering payroll buffer', amount: 900000, bucket: 'wc', why: 'An operating runway reserve, so the company survives its first months.' },
  { text: '3 months of cloud server hosting (AWS/GCP)', amount: 120000, bucket: 'wc', why: 'An operating runway reserve, so the company survives its first months.' },
];

const LIFE_OPTIONS = ['3 years', '5 years', '10 years'];
const LIFE_QUESTIONS = [
  { q: 'Intellectual Property (patents, copyright, legal IP protection), ₱150,000', answer: 2, why: 'IP has the longest useful life in the schedule: 10 years.' },
  { q: 'Technical Infrastructure (server rack & edge-computing nodes), ₱280,000', answer: 1, why: 'Technical infrastructure: 5 years.' },
  { q: 'R&D & Lab Equipment (3D printers, CNC, testing gear), ₱450,000', answer: 1, why: 'R&D and lab equipment: 5 years. It is also the biggest CapEx item.' },
  { q: 'Hardware / Dev Kits (GPU laptops), ₱320,000', answer: 0, why: 'Laptops have the shortest useful life: 3 years.' },
  { q: 'Office Furniture & Fixtures, ₱80,000', answer: 1, why: 'Office furniture and fixtures: 5 years.' },
].map((q) => ({ ...q, options: LIFE_OPTIONS, keepOrder: true }));

const SOURCES = [
  { label: "Founders' Equity", sub: 'Bootstrapping', amount: 500000, share: 20, cls: 'founders' },
  { label: 'Angel / VC Investor', sub: 'Seed round funding', amount: 1800000, share: 72, cls: 'vc' },
  { label: 'Government Grant', sub: 'Innovation / R&D grant', amount: 200000, share: 8, cls: 'grant', note: 'non-dilutive' },
];

const FUNDING_QUESTIONS = [
  {
    q: 'Total pro forma investment requirement is…',
    options: ['CapEx + pre-operating expenses + working capital margin', 'CapEx only', 'Gross burn × 12 months', 'Revenue − expenses'],
    answer: 0,
    why: '₱1,280,000 + ₱200,000 + ₱1,020,000 = ₱2,500,000, the exact funding ask for investors.',
  },
  {
    q: 'Why add a working capital margin to the funding ask?',
    options: ["So the company doesn't go bankrupt in Month 1", 'To pay for patents', 'To buy GPU laptops', 'To lower the tax bill'],
    answer: 0,
    why: 'It is an operating runway reserve (3 months of payroll and hosting).',
  },
  {
    q: 'Which funding source is non-dilutive?',
    options: ['Government innovation / R&D grant', "Founders' bootstrapping", 'Angel / VC seed round', 'All three'],
    answer: 0,
    why: 'A grant brings money in without giving away any ownership stake (₱200,000, 8%).',
  },
  {
    q: 'The Angel / VC seed round contributes…',
    options: ['₱1,800,000 for a 72% stake', '₱500,000 for a 20% stake', '₱200,000, 8%', '₱2,500,000 for 100%'],
    answer: 0,
    why: 'Founders put in ₱500,000 (20%), the VC ₱1,800,000 (72%), and the grant ₱200,000 (8%).',
  },
  {
    q: 'Matching the investment total to its funding structure shows…',
    options: ['Where equity dilution or debt liabilities stand', 'The break-even point', 'The cash runway', 'The useful life of assets'],
    answer: 0,
    why: 'Part 3, the pro forma capital sourcing structure, shows who owns what and what is owed.',
  },
];

function FundingAsk({ id }) {
  const [sortPart, lifeDone, fundingDone] = useParts(id, 3);
  const [sorted, setSorted] = useState(false);
  const sortDone = () => {
    setSorted(true);
    sortPart();
  };
  return (
    <Activity
      id={id}
      number={3}
      title="Build the Funding Ask"
      slides="10–13"
      intro="A deep-tech robotics & IoT startup is preparing its infrastructure before market rollout. Work out how much to ask investors for, then who puts it in."
    >
      <Step title="Part 1 · What counts as CapEx?" hint="Capital Expenditure: the immediate technology infrastructure, hardware and IP required to launch.">
        <RevealCards
          cards={[
            { front: 'R&D and Prototyping', back: 'Costs for initial coding, building a Minimum Viable Product (MVP), and software product design.' },
            { front: 'Tech Stack & Infrastructure', back: 'Cloud hosting (AWS, Azure, GCP), data pipelines, proprietary software integrations, and physical hardware setup.' },
            { front: 'Intellectual Property (IP)', back: 'Patent filings, copyrights, and legal compliance fees.' },
          ]}
        />
      </Step>
      <Step title="Part 2 · Sort every cost" hint="Fixed capital (CapEx), one-time pre-operating expenses, or the working capital margin? The totals add up as you go.">
        <SortGame
          buckets={[
            { id: 'capex', label: 'CapEx' },
            { id: 'preop', label: 'Pre-operating' },
            { id: 'wc', label: 'Working capital' },
          ]}
          items={FUNDING_ITEMS}
          showTotals
          onDone={sortDone}
        />
        {sorted && (
          <Callout label="Total pro forma investment requirement" tone="accent">
            ₱1,280,000 CapEx + ₱200,000 pre-operating + ₱1,020,000 working capital = <strong>₱2,500,000</strong>
          </Callout>
        )}
      </Step>
      <Step title="Part 3 · Useful life" hint="The CapEx schedule lists how long each asset lasts.">
        <QuizRound questions={LIFE_QUESTIONS} label="Asset" onDone={lifeDone} />
      </Step>
      <Step title="Part 4 · Who funds the ₱2,500,000?">
        <div className="learn-stack" role="img" aria-label="Founders 20%, Angel or VC 72%, government grant 8%">
          {SOURCES.map((s) => (
            <span key={s.cls} className={`learn-stack-seg learn-stack-seg--${s.cls}`} style={{ flexGrow: s.share }}>
              {s.share}%
            </span>
          ))}
        </div>
        <div className="learn-stack-legend">
          {SOURCES.map((s) => (
            <div key={s.cls} className="learn-stack-key">
              <span className={`learn-stack-dot learn-stack-seg--${s.cls}`} />
              <div>
                <strong>{s.label}</strong> · {s.sub}
                <div>
                  {peso(s.amount)} · {s.share}% {s.note ? <em>{s.note}</em> : 'stake'}
                </div>
              </div>
            </div>
          ))}
        </div>
        <QuizRound questions={FUNDING_QUESTIONS} onDone={fundingDone} />
      </Step>
    </Activity>
  );
}

// --- 4. Break-Even Playground (slides 15–19) -------------------------------

const BE_START = { fixed: 300000, price: 2500, variable: 500 };

function BreakEvenChart({ fixed, price, variable, users, setUsers, bep, xMax }) {
  const W = 640;
  const H = 280;
  const pad = { l: 64, r: 16, t: 16, b: 36 };
  const yMax = Math.max(price * xMax, fixed + variable * xMax) * 1.05;
  const x = (u) => pad.l + (u / xMax) * (W - pad.l - pad.r);
  const y = (v) => H - pad.b - (v / yMax) * (H - pad.t - pad.b);
  const ticks = Array.from({ length: 5 }, (_, i) => (yMax / 4) * i);
  const xTicks = Array.from({ length: 5 }, (_, i) => Math.round((xMax / 4) * i));
  const profit = users * (price - variable) - fixed;
  const compact = (v) => (v >= 1e6 ? `₱${num(v / 1e6, 1)}M` : `₱${num(v / 1e3)}k`);
  return (
    <svg className="learn-chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Revenue and total cost lines crossing at the break-even point">
      {ticks.map((t) => (
        <g key={t}>
          <line className="learn-chart-grid" x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} />
          <text className="learn-chart-label" x={pad.l - 8} y={y(t) + 4} textAnchor="end">
            {compact(t)}
          </text>
        </g>
      ))}
      {xTicks.map((t) => (
        <text key={t} className="learn-chart-label" x={x(t)} y={H - pad.b + 18} textAnchor="middle">
          {t}
        </text>
      ))}
      <text className="learn-chart-label" x={W - pad.r} y={H - 4} textAnchor="end">
        subscribers
      </text>
      {/* Profit / loss gap at the chosen user count. */}
      <line className={profit >= 0 ? 'learn-chart-gap--good' : 'learn-chart-gap--bad'} x1={x(users)} x2={x(users)} y1={y(price * users)} y2={y(fixed + variable * users)} />
      <line className="learn-chart-fixed" x1={pad.l} x2={W - pad.r} y1={y(fixed)} y2={y(fixed)} />
      <line className="learn-chart-cost" x1={x(0)} y1={y(fixed)} x2={x(xMax)} y2={y(fixed + variable * xMax)} />
      <line className="learn-chart-rev" x1={x(0)} y1={y(0)} x2={x(xMax)} y2={y(price * xMax)} />
      {Number.isFinite(bep) && bep <= xMax && (
        <g>
          <circle className="learn-chart-bep" cx={x(bep)} cy={y(price * bep)} r="6" />
          <text className="learn-chart-bep-label" x={x(bep) - 10} y={y(price * bep) - 12} textAnchor="end">
            Break-even: {num(Math.ceil(bep))}
          </text>
        </g>
      )}
      <line className="learn-chart-marker" x1={x(users)} x2={x(users)} y1={pad.t} y2={H - pad.b} />
      <rect
        className="learn-chart-hit"
        x={pad.l}
        y={pad.t}
        width={W - pad.l - pad.r}
        height={H - pad.t - pad.b}
        onPointerDown={(e) => {
          const svg = e.currentTarget.ownerSVGElement;
          const at = (ev) => {
            const r = svg.getBoundingClientRect();
            const px = ((ev.clientX - r.left) / r.width) * W;
            setUsers(Math.round(Math.max(0, Math.min(xMax, ((px - pad.l) / (W - pad.l - pad.r)) * xMax))));
          };
          at(e);
          const up = () => {
            window.removeEventListener('pointermove', at);
            window.removeEventListener('pointerup', up);
            window.removeEventListener('pointercancel', up);
          };
          window.addEventListener('pointermove', at);
          window.addEventListener('pointerup', up);
          window.addEventListener('pointercancel', up);
        }}
      />
    </svg>
  );
}

function BreakEven({ id }) {
  const [checkA, checkB] = useParts(id, 2);
  const [fixed, setFixed] = useState(BE_START.fixed);
  const [price, setPrice] = useState(BE_START.price);
  const [variable, setVariable] = useState(BE_START.variable);
  const [users, setUsers] = useState(150);
  const cm = price - variable;
  const bep = cm > 0 ? fixed / cm : Infinity;
  const bepUnits = Math.ceil(bep);
  const xMax = Number.isFinite(bep) ? Math.max(300, Math.min(3000, Math.ceil((bep * 2) / 50) * 50)) : 300;
  const shownUsers = Math.min(users, xMax);
  const profitAt = (u) => u * price - u * variable - fixed;
  const isExample = fixed === BE_START.fixed && price === BE_START.price && variable === BE_START.variable;
  const matrix = Number.isFinite(bep) ? [Math.max(1, Math.round(bepUnits / 3)), bepUnits, bepUnits * 2] : [50, 150, 300];

  return (
    <Activity
      id={id}
      number={4}
      title="Break-Even Playground"
      slides="15–19"
      intro="Technopreneurs often run at a net loss early on. Break-even analysis finds exactly when unit profit margins offset fixed technical overhead. Scenario: a cloud inventory-management SaaS charging a monthly subscription."
    >
      <Step title="The three building blocks">
        <RevealCards
          cards={[
            { tag: 'Numerator', front: 'Fixed Overhead Costs', back: 'Base operating expenses that stay the same at 1 user or 1,000: server infrastructure, core development salaries, recurring admin overhead.' },
            { tag: 'Denominator', front: 'Unit Profit Margin (Contribution Margin)', back: 'Net revenue per user or unit after deducting direct variable costs of delivery (hosting, payment processing, support). Selling price − variable cost.' },
            { tag: 'Target result', front: 'The Payoff Threshold (Break-Even Point)', back: 'The exact user volume where margins fully cover fixed overhead: zero net loss. It establishes baseline viability and the minimum active-user threshold.' },
          ]}
        />
        <Callout label="Break-even formula" tone="accent">
          Break-Even Point (Units) = <strong>Total Fixed Monthly Costs ÷ Contribution Margin per Unit</strong>
        </Callout>
      </Step>
      <Step title="Play with it" hint="Drag across the chart, or use the subscriber slider, to see profit or loss at any user count.">
        <div className="learn-sim learn-sim--wide">
          <div className="learn-sim-controls">
            <Slider label="Fixed monthly costs" note="Engineering & admin ₱220k · marketing ₱40k · licenses ₱25k · office ₱15k" value={fixed} min={50000} max={800000} step={10000} onChange={setFixed} format={peso} />
            <Slider label="Selling price per subscription (P)" value={price} min={500} max={6000} step={100} onChange={setPrice} format={(v) => `${peso(v)} / mo`} />
            <Slider label="Variable cost per user (V)" note="Database scaling, transaction fees, support" value={variable} min={0} max={3000} step={50} onChange={setVariable} format={(v) => `${peso(v)} / mo`} />
            <Slider label="Active subscribers" value={shownUsers} min={0} max={xMax} step={1} onChange={setUsers} format={(v) => num(v)} />
            {!isExample && (
              <button
                type="button"
                className="learn-link"
                onClick={() => {
                  setFixed(BE_START.fixed);
                  setPrice(BE_START.price);
                  setVariable(BE_START.variable);
                  setUsers(150);
                }}
              >
                Reset to the slides&apos; example
              </button>
            )}
          </div>
          <div className="learn-sim-output">
            <div className="learn-stats">
              <Stat label="Contribution margin" value={cm > 0 ? peso(cm) : '—'} sub={`${num(price)} − ${num(variable)}`} />
              <Stat label="Break-even" value={Number.isFinite(bep) ? `${num(bepUnits)} users` : 'Never'} sub={Number.isFinite(bep) ? `${num(fixed)} ÷ ${num(cm)}` : 'price ≤ variable cost'} tone="accent" />
              <Stat label="Break-even revenue" value={Number.isFinite(bep) ? peso(bepUnits * price) : '—'} sub={Number.isFinite(bep) ? `${num(bepUnits)} × ${num(price)}` : ''} />
            </div>
            <BreakEvenChart fixed={fixed} price={price} variable={variable} users={shownUsers} setUsers={setUsers} bep={bep} xMax={xMax} />
            <div className="learn-chart-legend">
              <span className="learn-key learn-key--rev">Revenue</span>
              <span className="learn-key learn-key--cost">Total cost</span>
              <span className="learn-key learn-key--fixed">Fixed overhead</span>
            </div>
            <p className={`learn-profit ${profitAt(shownUsers) >= 0 ? 'learn-profit--good' : 'learn-profit--bad'}`}>
              At <strong>{num(shownUsers)}</strong> subscribers: {profitAt(shownUsers) === 0 ? 'exactly break-even (₱0)' : profitAt(shownUsers) > 0 ? `profit of ${peso(profitAt(shownUsers))} / month` : `loss of ${peso(-profitAt(shownUsers))} / month`}
            </p>
          </div>
        </div>
        {cm > 0 && (
          <div className="learn-table-wrap">
            <table className="learn-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  {matrix.map((u, i) => (
                    <th key={i}>
                      {num(u)} users
                      <span>{i === 0 ? 'Loss' : i === 1 ? 'Break-even' : 'Profitable'}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total monthly revenue</td>
                  {matrix.map((u, i) => (
                    <td key={i}>{peso(u * price)}</td>
                  ))}
                </tr>
                <tr>
                  <td>Variable cloud costs</td>
                  {matrix.map((u, i) => (
                    <td key={i}>{peso(u * variable)}</td>
                  ))}
                </tr>
                <tr>
                  <td>Fixed software overhead</td>
                  {matrix.map((u, i) => (
                    <td key={i}>{peso(fixed)}</td>
                  ))}
                </tr>
                <tr className="learn-table-total">
                  <td>Net monthly profit / loss</td>
                  {matrix.map((u, i) => (
                    <td key={i} className={profitAt(u) < 0 ? 'learn-neg' : profitAt(u) > 0 ? 'learn-pos' : ''}>
                      {profitAt(u) > 0 ? '+' : ''}
                      {peso(profitAt(u))}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
        <p className="learn-aside">Profit scales fast once you pass break-even because of high software leverage: each extra user adds the full contribution margin.</p>
      </Step>
      <Step title="Your turn">
        <NumberCheck
          prompt="Fixed costs rise to ₱400,000 while price stays ₱2,500 and variable cost ₱500. How many subscribers to break even?"
          answer={200}
          unit="subscribers"
          explain="Contribution margin = 2,500 − 500 = 2,000. Break-even = 400,000 ÷ 2,000 = 200 subscribers."
          onDone={checkA}
        />
        <NumberCheck
          prompt="Back to the original 150 break-even subscribers at ₱2,500 each. What's the break-even sales revenue per month?"
          answer={375000}
          prefix="₱"
          explain="Break-Even Sales Revenue = Subscribers × Price per Unit = 150 × 2,500 = ₱375,000 per month."
          onDone={checkB}
        />
      </Step>
    </Activity>
  );
}

// --- 5. Metrics & Statements (slides 6, 14) -------------------------------

const CARDS = [
  { front: 'Burn Rate', back: 'The monthly speed at which seed capital is spent before generating positive cash flow.' },
  { front: 'Gross vs. Net Burn', back: 'Gross burn = total cash spent per month. Net burn = gross burn − monthly revenue: the actual amount the business loses monthly.' },
  { front: 'Runway', back: 'How many months a startup can survive: Cash Balance ÷ Monthly (Net) Burn Rate.' },
  { front: 'CAC & LTV', back: 'Customer Acquisition Cost versus the total Lifetime Value generated per user.' },
  { front: 'ARR / MRR', back: 'Annual / Monthly Recurring Revenue: tracks baseline subscription income.' },
  { front: 'Financial Discipline', back: 'Rigorously measuring these metrics ensures capital efficiency and product-market viability before scaling.' },
  { front: 'Pro Forma Financial Statements', back: 'Forward-looking 3-to-5-year projections built by "bottom-up" forecasting from precise unit economics and realistic growth conversion rates.' },
  { front: 'Pro Forma Income Statement', back: 'Forecasts revenue streams, COGS (for tech: hosting costs and customer support operations) and operating expenses to determine future profitability.' },
  { front: 'Pro Forma Cash Flow Statement', back: 'Previews cash inflows and outflows. Critical for spotting timing gaps between heavy customer onboarding and actual invoice settlements.' },
  { front: 'Pro Forma Balance Sheet', back: "Tracks the startup's financial position (assets, technology liabilities, equity structure) at a given point in time." },
  { front: 'Contribution Margin', back: 'Selling price per unit − variable cost per unit. The money from each subscription that chips away at fixed overhead.' },
  { front: 'Break-Even Point', back: 'Total Fixed Monthly Costs ÷ Contribution Margin per Unit: the unit volume for zero net loss.' },
];

const STATEMENT_QUESTIONS = [
  {
    q: 'Which pro forma statement would reveal a cash gap between onboarding lots of customers and actually getting their invoices paid?',
    options: ['Cash Flow Statement', 'Income Statement', 'Balance Sheet', 'CapEx Schedule'],
    answer: 0,
    why: 'The cash flow statement previews inflows and outflows, so it exposes timing gaps.',
  },
  {
    q: "In a tech company's pro forma income statement, COGS includes…",
    options: ['Hosting costs and customer support operations', 'Patent filings', 'Office furniture', 'Founder equity'],
    answer: 0,
    why: 'For technology, the cost of goods sold is mostly hosting and support.',
  },
  {
    q: 'Which statement shows assets, technology liabilities and equity structure at a given point in time?',
    options: ['Balance Sheet', 'Income Statement', 'Cash Flow Statement', 'Break-even analysis'],
    answer: 0,
    why: 'A balance sheet is a snapshot of financial position.',
  },
  {
    q: 'Pro forma statements are built using…',
    options: ['Bottom-up forecasting from unit economics and realistic conversion rates', 'Last year’s audited sales', 'Top-down market share guesses', 'Competitor price lists'],
    answer: 0,
    why: 'They are 3-to-5-year projections built bottom-up.',
  },
  {
    q: 'Which metric compares what it costs to win a customer with what that customer is worth over time?',
    options: ['CAC & LTV', 'ARR / MRR', 'Burn rate', 'Runway'],
    answer: 0,
    why: 'Customer Acquisition Cost vs. Lifetime Value.',
  },
  {
    q: 'MRR tracks…',
    options: ['Baseline monthly subscription income', 'Monthly spending on R&D', 'Months of runway remaining', 'Marketing reach rate'],
    answer: 0,
    why: 'Monthly Recurring Revenue; ARR is the annual version.',
  },
];

function Metrics({ id }) {
  const [quizDone] = useParts(id, 1);
  return (
    <Activity id={id} number={5} title="Metrics & Statement Flashcards" slides="6, 14" intro="Flip through the terms, then take the quick quiz. Before building traditional statements, a technopreneur tracks these metrics to judge financial viability.">
      <Flashcards cards={CARDS} />
      <Step title="Quick quiz">
        <QuizRound questions={STATEMENT_QUESTIONS} shuffleQuestions onDone={quizDone} />
      </Step>
    </Activity>
  );
}

export const MODULE5 = [
  { id: 'learn-basics', label: 'Financial Plan Basics', Component: Basics },
  { id: 'learn-burn', label: 'Burn & Runway Simulator', Component: BurnSimulator },
  { id: 'learn-funding', label: 'Build the Funding Ask', Component: FundingAsk },
  { id: 'learn-breakeven', label: 'Break-Even Playground', Component: BreakEven },
  { id: 'learn-metrics', label: 'Metrics & Statement Flashcards', Component: Metrics },
];
