import { useState } from 'react';
import { Activity, Callout, NumberCheck, OrderGame, QuizRound, RevealCards, Slider, SortGame, Stat, Step, useParts } from '../kit.jsx';

// Module 6: Production Planning and Control
// (public/notes/techno-06-production-planning.pdf).

// --- 6. The PPC Map (slides 2–4, 9–10) -----------------------------------

const PPC_ITEMS = [
  { text: 'Asks: What are we building, how will we build it, and when do we scale?', bucket: 'plan', why: 'Planning is the vision and strategy: the technopreneur acts as an architect before spending capital.' },
  { text: 'Asks: How do we adapt to immediate disruptions while preserving our financial runway?', bucket: 'control', why: 'Control is the execution and adaptation: the real-time radar once the green light is given.' },
  { text: 'Agile Demand Forecasting: reading pre-orders, crowdfunding metrics and pilot-group signals', bucket: 'plan', why: 'Planning · Market Signals. A startup has no historical sales data to forecast from.' },
  { text: 'Design for Manufacturing (DFM): mapping how a bench prototype scales to thousands of units', bucket: 'plan', why: 'Planning · Scalability.' },
  { text: 'Routing & Sourcing: deciding what to make in-house vs. contract out to keep asset costs low', bucket: 'plan', why: 'Planning · Resource Optimization.' },
  { text: 'Shop Floor & Micro-batch: pushing small engineering or software tweaks mid-production without stopping the line', bucket: 'control', why: 'Control · Process Agility.' },
  { text: 'Dynamic Inventory Tracking: keeping buffer stock minimal (Just-In-Time)', bucket: 'control', why: 'Control · Lean Stock. Tech parts can become obsolete overnight, and demand can pivot.' },
  { text: 'Bottleneck & Burn-Rate: fixing it fast when custom microchips are stuck at customs or cloud capacity maxes out', bucket: 'control', why: 'Control · Risk Remediation.' },
];

const PILLAR_QUESTIONS = [
  {
    q: 'Your supplier offers to deliver every part 3 months before assembly starts. What is the risk?',
    options: ['Capital freeze: working capital gets locked up, starving marketing and R&D', 'Machines sit idle and OEE drops', 'Parts get cheaper', 'None, as early delivery is always safer'],
    answer: 0,
    why: 'Pillar 3: the fix is to sync material drops and component orders with investor funding tranches.',
  },
  {
    q: 'In technopreneurial PPC, hardware startups subordinate machine efficiency to…',
    options: ['Liquidity (cash)', 'Machine uptime', 'Bulk discounts', 'Storage capacity'],
    answer: 0,
    why: '"In technopreneurship, cash is the ultimate constraint." Production schedules align with funding disbursements.',
  },
  {
    q: "A sensor's availability changes and breaks the whole enclosure design. Which pillar deals with this?",
    options: ['Dynamic BOM Management', 'Modular Stage Scaling', 'Cash Runway Alignment', 'Agile Demand Forecasting'],
    answer: 0,
    why: "Pillar 1: the bill of materials is alive. Digital, integrated tools flag how engineering changes alter costs and timelines.",
  },
  {
    q: 'Why does technopreneurial PPC plan production in stages that match fundraising milestones?',
    options: ["Startups can't afford automated assembly lines on day one", 'To maximize machine utilization', 'Because contract manufacturers require it', 'To qualify for bulk discounts'],
    answer: 0,
    why: 'Pillar 2: Modular Stage Scaling.',
  },
  {
    q: 'What is the ultimate goal of technopreneurial PPC?',
    options: ['Deploy evolving tech without running out of cash before achieving Product-Market Fit', 'Reduce the cost per unit by 2%', 'Run machines at 90%+ capacity', 'Freeze the product design early'],
    answer: 0,
    why: 'It is driven by survival, agility and extreme uncertainty.',
  },
];

function PpcMap({ id }) {
  const [sortDone, quizDone] = useParts(id, 2);
  return (
    <Activity id={id} number={6} title="The PPC Map" slides="2–4, 9–10" intro="What Production Planning and Control is, how a startup's version differs, and which job belongs to planning and which to control.">
      <Callout label="Core definition" tone="accent">
        PPC is <strong>the strategic engine that translates a high-tech prototype or code architecture into a scalable, commercially viable market product.</strong>
      </Callout>
      <Step title="Two kinds of PPC">
        <RevealCards
          cards={[
            { tag: 'Traditional industrial PPC', front: 'Primary focus?', back: 'Maximizing high-volume factory efficiency, reducing overall cost per unit, and optimizing steady-state workflows.' },
            { tag: 'Technopreneurial PPC', front: 'Driven by?', back: 'Survival, agility and extreme uncertainty.' },
            { tag: 'Technopreneurial PPC', front: 'Which 3 scarce resources does it coordinate?', back: 'Capital (and financial runway), Human Talent (and core expertise), and Time (to deployment).' },
            { tag: 'Technopreneurial PPC', front: 'Ultimate goal?', back: 'Deploy evolving tech without running out of cash before achieving Product-Market Fit.' },
          ]}
        />
      </Step>
      <Step title="Planning or Control?" hint="Planning is the vision and strategy, done before spending capital. Control is execution and adaptation, after the green light.">
        <SortGame
          buckets={[
            { id: 'plan', label: 'Production Planning' },
            { id: 'control', label: 'Production Control' },
          ]}
          items={PPC_ITEMS}
          onDone={sortDone}
        />
      </Step>
      <Step title="The three core pillars">
        <RevealCards
          cards={[
            {
              tag: 'Pillar 01',
              front: 'Dynamic BOM Management',
              back: "Bill of Materials lifecycle management. The BOM is alive: a change in one sensor's availability can break the entire enclosure design. Digital, integrated environments instantly flag how engineering changes alter component costs and production timelines.",
            },
            { tag: 'Pillar 02', front: 'Modular Stage Scaling', back: "Startups can't afford automated assembly lines on day one, so production is planned in distinct stages matching fundraising milestones (Activity 8)." },
            { tag: 'Pillar 03', front: 'Cash Runway Alignment', back: '"Cash is the ultimate constraint." Machine efficiency is subordinated to liquidity, and production schedules strictly align with funding disbursements.' },
            { tag: 'The trade-off', front: 'The Capital Freeze Risk', back: 'If the master schedule delivers parts 3 months before assembly, it locks up critical working capital and deprives marketing and R&D of funds.' },
            { tag: 'The trade-off', front: 'The Technopreneurial PPC Solution', back: 'Synchronize material drops and component orders with investor funding tranches. Result: maximum runway without compromising assembly timelines.' },
          ]}
        />
        <QuizRound questions={PILLAR_QUESTIONS} shuffleQuestions onDone={quizDone} />
      </Step>
    </Activity>
  );
}

// --- 7. Traditional or Technopreneur? (slides 5–8, 15, 16, 20) ------------

const T = 'trad';
const X = 'tech';
const PARADIGM_ITEMS = [
  // Slide 5: The Paradigm Shift
  { text: 'Primary goal: minimize unit cost via extreme replication', bucket: T, source: 'Slide 5 · Primary goal' },
  { text: 'Primary goal: maximize learning rate and speed-to-market', bucket: X, source: 'Slide 5 · Primary goal' },
  { text: 'Heavy upfront tooling, like steel molds', bucket: T, source: 'Slide 5 · Tooling' },
  { text: 'Soft, flexible tooling, like 3D printing and CNC machining', bucket: X, source: 'Slide 5 · Tooling' },
  { text: 'Main material risk: storage space and handling overhead', bucket: T, source: 'Slide 5 · Material risks' },
  { text: 'Main material risk: component obsolescence and sudden product pivots', bucket: X, source: 'Slide 5 · Material risks' },
  { text: 'Rigid, long-term vendor contracts', bucket: T, source: 'Slide 5 · Supply chain' },
  { text: 'Hybrid, fluid contract-manufacturing ecosystem', bucket: X, source: 'Slide 5 · Supply chain' },
  // Slides 6–7
  { text: 'Success is measured by unit cost and OEE (Overall Equipment Effectiveness)', bucket: T, source: 'Slide 6 · Metric of success' },
  { text: 'Success is measured by time-to-market and cash runway preservation', bucket: X, source: 'Slide 7 · Metric of success' },
  { text: 'Schedules massive production runs to dilute fixed costs', bucket: T, source: 'Slide 6 · Core strategy' },
  { text: 'Schedules micro-batches so a failed design wastes no capital on inventory', bucket: X, source: 'Slide 7 · Core strategy' },
  { text: '"We know exactly what the customer wants. Our job is to build it with zero waste."', bucket: T, source: 'Slide 6 · Philosophy' },
  { text: '"We think we know what the customer wants, but we need to test it immediately."', bucket: X, source: 'Slide 7 · Philosophy' },
  { text: 'Goal: Economies of Scale, making the same item millions of times', bucket: T, source: 'Slide 6' },
  { text: 'Goal: Agile Validation, getting small batches to customers fast', bucket: X, source: 'Slide 7' },
  { text: 'Market demand is predictable and the design is frozen', bucket: T, source: 'Slide 6' },
  // Slide 8: Strategic Comparison
  { text: 'Primary driver: "How do we make this 2% cheaper?"', bucket: T, source: 'Slide 8 · Primary driver' },
  { text: 'Primary driver: "How do we get this to users next week?"', bucket: X, source: 'Slide 8 · Primary driver' },
  { text: 'Nightmare: a machine breakdown on a high-speed line', bucket: T, source: 'Slide 8 · Nightmare scenario' },
  { text: 'Nightmare: 6 months perfectly mass-producing something nobody wants', bucket: X, source: 'Slide 8 · Nightmare scenario' },
  { text: 'Inventory is an asset: raw materials bought in bulk', bucket: T, source: 'Slide 8 · Inventory view' },
  { text: 'Inventory is a liability: materials kept tight, Just-In-Time', bucket: X, source: 'Slide 8 · Inventory view' },
  { text: 'Machines and labor run at 90%+ capacity at all times', bucket: T, source: 'Slide 8 · Capacity focus' },
  { text: 'Excess, fluid capacity: modular setups that can scale up, down or pivot', bucket: X, source: 'Slide 8 · Capacity focus' },
  // Slide 15: Sourcing strategy
  { text: 'Buys massive bulk orders to get a 10% unit discount', bucket: T, source: 'Slide 15 · Procurement' },
  { text: 'Buys smaller micro-batches to avoid locking up cash', bucket: X, source: 'Slide 15 · Procurement' },
  { text: 'High DIO: thousands of units sit in storage for months', bucket: T, source: 'Slide 15 · Inventory state' },
  { text: 'Low DIO: Just-In-Time parts arrive right before assembly', bucket: X, source: 'Slide 15 · Inventory state' },
  { text: 'Standard corporate supplier terms', bucket: T, source: 'Slide 15 · Supplier terms (DPO)' },
  { text: 'Negotiates deferred payments or structural staging with suppliers', bucket: X, source: 'Slide 15 · Supplier terms (DPO)' },
  { text: 'Long C2C cycle: cash trapped for 90–120+ days', bucket: T, source: 'Slide 15 · C2C impact' },
  { text: 'Short or negative C2C cycle: cash freed up immediately', bucket: X, source: 'Slide 15 · C2C impact' },
  // Slides 16, 20: QC
  { text: 'Static, end-of-line QC with statistical sampling', bucket: T, source: 'Slide 16 · QC model' },
  { text: 'Agile, continuous, digitally integrated QC', bucket: X, source: 'Slide 16 · QC model' },
  { text: 'Design status: fully frozen, tolerances rarely change', bucket: T, source: 'Slide 20 · Design status' },
  { text: 'Design status: fluid and iterative, evolving via ECOs', bucket: X, source: 'Slide 20 · Design status' },
  { text: 'Testing: post-assembly or end-of-line sampling', bucket: T, source: 'Slide 20 · Testing timing' },
  { text: 'Testing: in-line and automated at every critical step', bucket: X, source: 'Slide 20 · Testing timing' },
  { text: 'QC focus: mechanical dimensions and cosmetic defects', bucket: T, source: 'Slide 20 · Focus area' },
  { text: 'QC focus: functional validation (firmware integration, signal integrity)', bucket: X, source: 'Slide 20 · Focus area' },
  { text: 'Defects: discarded or manually reworked at a high cost', bucket: T, source: 'Slide 20 · Handling of defects' },
  { text: 'Defects: rapid root-cause analysis, immediate software or line adjustment', bucket: X, source: 'Slide 20 · Handling of defects' },
].map((item) => ({ ...item, why: item.bucket === T ? 'This is the traditional, cost-focused view.' : 'This is the technopreneur’s speed-, learning- and cash-focused view.' }));

function Paradigm({ id }) {
  const [roundDone] = useParts(id, 1);
  return (
    <Activity
      id={id}
      number={7}
      title="Traditional or Technopreneur?"
      slides="5–8, 15, 16, 20"
      intro={`Every row from the module's comparison tables, ${PARADIGM_ITEMS.length} in all. Each round deals 14 at random, so play a few rounds to see them all. Keep your streak going.`}
    >
      <SortGame
        buckets={[
          { id: T, label: 'Traditional' },
          { id: X, label: 'Technopreneur' },
        ]}
        items={PARADIGM_ITEMS}
        roundSize={14}
        onDone={roundDone}
      />
    </Activity>
  );
}

// --- 8. Scale & Source (slides 9, 11–13) -----------------------------------

const TIER_QUESTIONS = [
  {
    q: "You're building your MVP and first pilot runs. Which manufacturer tier?",
    options: ['Tier 3', 'Tier 1', 'Tier 2', 'Build your own factory'],
    answer: 0,
    why: 'Tier 3: proximity, lower financial risk and engineering collaboration let you iron out design defects without burning cash.',
  },
  {
    q: 'When should you move up to a Tier 2/1 manufacturer?',
    options: ['After verified product-market fit, stable designs and predictable high-volume demand', 'As soon as the prototype works', 'Before the pilot run', 'Never'],
    answer: 0,
    why: 'Then you can use your manufacturing data to slash unit production costs.',
  },
  {
    q: 'Why is starting directly with a Tier 1 manufacturer almost always a mistake?',
    options: ["It's usually impossible because of capital constraints", 'Tier 1 has lower quality', 'Tier 1 only does software', 'Tier 1 is too close by'],
    answer: 0,
    why: 'Startups rarely have the capital or the stable design a Tier 1 partner needs.',
  },
  {
    q: 'What is the risk of relying entirely on a Tier 3 shop long-term?',
    options: ['It can limit your ability to scale when adoption explodes', 'It costs too much early on', 'It blocks engineering collaboration', 'It requires NTC certification'],
    answer: 0,
    why: 'That is the technopreneur’s dilemma: launch at Tier 3, then scale to Tier 2/1.',
  },
];

const SOURCING_ITEMS = [
  { text: '"Tier 1 vs. Tier 3 CMs"', bucket: 'cm', why: 'Contract Manufacturing: CM Selection.' },
  { text: 'Evaluating and negotiating with contract manufacturers based on production scale and capital constraints', bucket: 'cm', why: 'Contract Manufacturing: CM Selection.' },
  { text: '"Bring Your Own Parts"', bucket: 'byop', why: 'Hybrid Framework: BYOP.' },
  { text: 'Buying long-lead-time or critical custom silicon yourself and shipping it straight to the assembly partner', bucket: 'byop', why: 'BYOP manages procurement risk for critical parts independently.' },
  { text: '"Rapid Fabrication Services"', bucket: 'mvp', why: 'Rapid Prototyping: the MVP Ecosystem.' },
  { text: 'PCBWay for electronics', bucket: 'mvp', why: 'A rapid-turnaround fabrication service for short runs.' },
  { text: 'Protolabs for injection molding', bucket: 'mvp', why: 'A rapid-turnaround fabrication service for short runs.' },
];

const SUPPLY_OPTIONS = ['Cash-to-Cash (C2C) cycle', 'Minimum Order Quantity (MOQ)', 'Component obsolescence (modular BOM)'];
const SUPPLY_QUESTIONS = [
  { q: 'Calculating exactly how many days capital is trapped in raw materials before it comes back as revenue.', answer: 0, why: 'C2C: "Cycle Optimization".' },
  { q: 'Balancing a higher per-unit cost against the existential risk of tying up survival capital in mass inventory.', answer: 1, why: 'MOQ: "Negotiation Strategies".' },
  { q: 'Designing the bill of materials with alternative parts so a chip going out of stock does not freeze the whole planning cycle.', answer: 2, why: 'Component Obsolescence: "Modular BOM Design".' },
  { q: 'A vendor offers a lower price only if you buy 10,000 units. You can afford 500. Which strategy is this about?', answer: 1, why: 'Weigh the per-unit penalty of a small order against locking up survival cash.' },
].map((q) => ({ ...q, options: SUPPLY_OPTIONS, keepOrder: true }));

function ScaleSource({ id }) {
  const [orderDone, tierDone, sortDone, supplyDone] = useParts(id, 4);
  return (
    <Activity id={id} number={8} title="Scale & Source" slides="9, 11–13" intro="Startups rarely build their own factories on day one. Plan the stages, pick the right partner, and protect your cash.">
      <Step title="Pillar 02 · Modular Stage Scaling" hint="Tap the stages in the order a startup goes through them.">
        <OrderGame
          items={[
            { text: 'Alpha/Beta Stage', sub: 'Single-unit hand-assemblies for lab testing.' },
            { text: 'Pilot Run Stage', sub: 'Short batches (10–100 units) with temporary tooling to test marketplace feedback.' },
            { text: 'Mass Customization Stage', sub: 'Offload to a global contract partner once consumer traction justifies the investment.' },
          ]}
          onDone={orderDone}
        />
      </Step>
      <Step title="The Technopreneur's Dilemma: the transition path">
        <div className="learn-path">
          <div className="learn-path-step">
            <span className="learn-tag">01 · Initial MVP & pilot runs</span>
            <strong>Launch at Tier 3</strong>
            <span>"Low Risk & Engineering Collaboration"</span>
          </div>
          <span className="learn-path-arrow" aria-hidden="true">
            →
          </span>
          <div className="learn-path-step">
            <span className="learn-tag">02 · High-volume production</span>
            <strong>Scale to Tier 2/1</strong>
            <span>"Verified Fit & Cost Reduction"</span>
          </div>
        </div>
        <QuizRound questions={TIER_QUESTIONS} onDone={tierDone} />
      </Step>
      <Step title="The Startup Sourcing Mix (Make vs. Buy vs. Hack)">
        <SortGame
          buckets={[
            { id: 'cm', label: 'CM Selection' },
            { id: 'byop', label: 'BYOP' },
            { id: 'mvp', label: 'MVP Ecosystem' },
          ]}
          items={SOURCING_ITEMS}
          onDone={sortDone}
        />
      </Step>
      <Step title="Supply chain financial engineering" hint="PPC decisions directly dictate cash runway: sync material drops with VC or crowdfunding cash flows. Which strategy does each describe?">
        <QuizRound questions={SUPPLY_QUESTIONS} label="Case" onDone={supplyDone} />
      </Step>
    </Activity>
  );
}

// --- 9. Cash-to-Cash Calculator (slides 13–15) -----------------------------

// The slides give no worked C2C example; these presets are illustrations
// shaped by slide 15 (traditional cash trapped 90–120+ days; technopreneur
// short or negative).
const C2C_PRESETS = [
  { label: 'Traditional (illustration)', dio: 100, dso: 30, dpo: 30 },
  { label: 'Technopreneur (illustration)', dio: 10, dso: 0, dpo: 30 },
];

const C2C_QUESTIONS = [
  { q: 'In C2C = DIO + DSO − DPO, which part is subtracted?', options: ['DPO: days you take to pay suppliers', 'DIO: days inventory sits', 'DSO: days to collect from customers', 'None'], answer: 0, why: 'The longer you can wait to pay suppliers, the shorter the cycle.' },
  { q: 'Selling on your own web store (paid immediately) instead of a retailer with 30-day terms mostly lowers…', options: ['DSO', 'DIO', 'DPO', 'MOQ'], answer: 0, why: 'Days Sales Outstanding: how long it takes to collect cash after a sale.' },
  { q: 'Switching to Just-In-Time parts that arrive right before assembly mostly lowers…', options: ['DIO', 'DSO', 'DPO', 'CAC'], answer: 0, why: 'Days Inventory Outstanding: how long raw parts, WIP and finished goods sit before being sold.' },
  { q: 'Negotiating deferred payments with your contract manufacturer…', options: ['Raises DPO and shortens the C2C cycle', 'Raises DIO', 'Lengthens the C2C cycle', 'Has no effect on cash'], answer: 0, why: 'Higher DPO is subtracted, so the cycle gets shorter.' },
  { q: 'The C2C cycle is also known as the…', options: ['Cash Conversion Cycle (CCC)', 'Capital Expenditure Cycle', 'Cash Runway', 'Contribution Cycle'], answer: 0, why: 'It measures the days from cash out (materials, labor) to cash back in (sales).' },
];

function CashToCash({ id }) {
  const [numDone, quizDone] = useParts(id, 2);
  const [dio, setDio] = useState(C2C_PRESETS[0].dio);
  const [dso, setDso] = useState(C2C_PRESETS[0].dso);
  const [dpo, setDpo] = useState(C2C_PRESETS[0].dpo);
  const c2c = dio + dso - dpo;
  const scale = Math.max(dio + dso, dpo, 1);
  const pct = (d) => `${(d / scale) * 100}%`;
  return (
    <Activity
      id={id}
      number={9}
      title="Cash-to-Cash Calculator"
      slides="13–15"
      intro="The C2C cycle measures how many days it takes to turn cash spent on materials and labor back into cash from customers. Shorter is better, and negative is best."
    >
      <Callout label="Formula" tone="accent">
        C2C Cycle = <strong className="learn-dio">DIO</strong> + <strong className="learn-dso">DSO</strong> − <strong className="learn-dpo">DPO</strong>
      </Callout>
      <div className="learn-sim">
        <div className="learn-sim-controls">
          <div className="learn-presets">
            {C2C_PRESETS.map((p) => (
              <button
                type="button"
                key={p.label}
                className={`learn-chip ${dio === p.dio && dso === p.dso && dpo === p.dpo ? 'learn-chip--on' : ''}`}
                onClick={() => {
                  setDio(p.dio);
                  setDso(p.dso);
                  setDpo(p.dpo);
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <Slider label="DIO: Days Inventory Outstanding" note="Days raw parts, WIP and finished goods sit before being sold (+)" value={dio} min={0} max={150} onChange={setDio} format={(v) => `${v} days`} />
          <Slider label="DSO: Days Sales Outstanding" note="Days to collect cash after a sale (+)" value={dso} min={0} max={90} onChange={setDso} format={(v) => `${v} days`} />
          <Slider label="DPO: Days Payable Outstanding" note="Days you take to pay suppliers and CMs (−)" value={dpo} min={0} max={120} onChange={setDpo} format={(v) => `${v} days`} />
        </div>
        <div className="learn-sim-output">
          <div className="learn-stats">
            <Stat label="C2C cycle" value={`${c2c} days`} sub={`${dio} + ${dso} − ${dpo}`} tone={c2c <= 0 ? 'good' : c2c >= 90 ? 'warn' : undefined} />
          </div>
          <div className="learn-timeline">
            <div className="learn-timeline-row">
              <span className="learn-timeline-label">Cash out → back in</span>
              <div className="learn-timeline-track">
                <span className="learn-timeline-seg learn-timeline-seg--dio" style={{ width: pct(dio) }}>
                  {dio > 8 && 'DIO'}
                </span>
                <span className="learn-timeline-seg learn-timeline-seg--dso" style={{ width: pct(dso) }}>
                  {dso > 8 && 'DSO'}
                </span>
              </div>
            </div>
            <div className="learn-timeline-row">
              <span className="learn-timeline-label">Supplier waits</span>
              <div className="learn-timeline-track">
                <span className="learn-timeline-seg learn-timeline-seg--dpo" style={{ width: pct(dpo) }}>
                  {dpo > 8 && 'DPO'}
                </span>
              </div>
            </div>
            <div className="learn-timeline-row">
              <span className="learn-timeline-label">Your cash trapped</span>
              <div className="learn-timeline-track">
                {c2c > 0 && <span className="learn-timeline-seg learn-timeline-seg--trapped" style={{ marginLeft: pct(Math.min(dpo, dio + dso)), width: pct(c2c) }} />}
              </div>
            </div>
          </div>
          <p className="learn-aside">
            {c2c > 0
              ? `Your own cash is tied up for ${c2c} days on every cycle. ${c2c >= 90 ? 'That is the traditional "long C2C" zone.' : ''}`
              : c2c === 0
                ? 'Customers pay you exactly when suppliers need paying: no cash trapped.'
                : `Negative C2C: customers pay you ${-c2c} days before your suppliers need paying, so cash is freed up immediately.`}
          </p>
          <p className="learn-source">The presets are illustrations. The slides define the formula but give no worked example.</p>
        </div>
      </div>
      <Step title="Your turn">
        <NumberCheck
          prompt="Parts sit for 45 days, customers pay 20 days after a sale, and you pay your CM 35 days after its invoice. What's the C2C cycle?"
          answer={30}
          unit="days"
          tolerance={0}
          explain="C2C = DIO + DSO − DPO = 45 + 20 − 35 = 30 days."
          onDone={numDone}
        />
        <QuizRound questions={C2C_QUESTIONS} shuffleQuestions onDone={quizDone} />
      </Step>
    </Activity>
  );
}

// --- 10. QC & Founder Scenarios (slides 16–21) -----------------------------

const SCENARIOS = [
  {
    q: 'A circuit board looks flawless under the microscope, but its microcontroller fails to boot. What catches this on the line?',
    options: ['A Hardware-in-the-Loop test jig that flashes firmware and runs diagnostics', 'End-of-line statistical sampling', 'A cosmetic inspection', 'Post-purchase telemetry'],
    answer: 0,
    why: 'Hybrid products (hardware + firmware) need functional tests, not just visual ones. Failed boards are rejected before the housing goes on.',
  },
  {
    q: 'Early customers want a different Bluetooth chip, mid-production. How do you change specs without halting the factory?',
    options: ['Push a dynamic ECO through a cloud PLM tool (the digital thread)', 'Stop the line and rewrite the compliance rules', 'Finish the batch and recall it later', 'Order 10,000 of the new chip'],
    answer: 0,
    why: 'Cloud PLM platforms like OpenBOM or Propel push new tolerances, schematics and test specs straight to factory screens and jigs.',
  },
  {
    q: 'Shipped devices start showing battery drain in real-world use. How does technopreneurial QC find and fix it?',
    options: ['Built-in IoT telemetry reports it, and the data adjusts the next batch', 'Wait for customer complaints', 'Inspect warehouse stock', 'Raise the price'],
    answer: 0,
    why: 'QC continues "beyond the dock": a closed loop from field data back to engineering and PPC.',
  },
  {
    q: 'Your device uses Wi-Fi. Which Philippine agency must certify it?',
    options: ['National Telecommunications Commission (NTC)', 'DTI', 'DOST-AMCen', 'SEC'],
    answer: 0,
    why: 'Any device using Wi-Fi, Bluetooth or cellular networks must be NTC-certified.',
  },
  {
    q: 'How do you avoid failing NTC certification late in the project?',
    options: ['Use pre-certified RF modules like the ESP32 during the DFM phase', 'Apply after mass production', 'Remove the antenna', 'Use a Tier 1 manufacturer'],
    answer: 0,
    why: 'Technopreneurial QC factors certification into the timeline from Design-for-Manufacturing onward.',
  },
  {
    q: 'What is a cheap way for a Filipino startup to build a custom testing jig?',
    options: ['Arduino or Raspberry Pi with a 3D-printed enclosure made at a local DTI FabLab', 'Import a factory test line', 'Hire a Tier 1 manufacturer', 'Skip testing for the pilot run'],
    answer: 0,
    why: 'The jig is then handed to the local manufacturer (e.g. in Laguna or Cavite) to automate testing on the line.',
  },
  {
    q: 'Your custom microchips are stuck at customs mid-run. Which production-control function handles this?',
    options: ['Bottleneck & Burn-Rate (risk remediation)', 'Agile Demand Forecasting', 'Design for Manufacturing', 'Routing & Sourcing'],
    answer: 0,
    why: 'Real-time problem solving when parts are delayed or cloud capacity maxes out.',
  },
  {
    q: 'Why is waiting until the end of production to check quality so dangerous for a hardware startup?',
    options: ['One bug or uncalibrated sensor can ruin a whole batch, and recalls or scrap can bankrupt the company', 'It makes the line slower', 'It raises the useful life of assets', 'It lowers DSO'],
    answer: 0,
    why: 'That is "The Hardware Danger": a single high-risk bottleneck at the end of the line.',
  },
  {
    q: 'Besides private Tier 3 contract manufacturers, which government facility can Filipino technopreneurs use?',
    options: ['DOST-AMCen', 'NTC', 'SEC', 'BIR'],
    answer: 0,
    why: 'The slides name DOST-AMCen alongside local Tier 3 CMs.',
  },
];

function QcScenarios({ id }) {
  const [hilDone, threadDone, loopDone, quizDone] = useParts(id, 4);
  return (
    <Activity id={id} number={10} title="QC & Founder Scenarios" slides="16–21" intro="Quality control the technopreneur's way: catch flaws early, change designs without stopping, and keep learning after the sale.">
      <Step title="Why traditional QC isn't enough">
        <RevealCards
          cards={[
            { tag: 'Traditional approach', front: 'Traditional QC Model: static & end-of-line', back: '"Frozen" designs, strict mass-production tolerances, and statistical sampling at the end of a long assembly line.' },
            { tag: 'The startup risk', front: 'The Hardware Danger: a high-risk bottleneck', back: 'A single software bug, uncalibrated sensor or minor defect can ruin an entire batch, risking mass recalls or scrapped inventory that can bankrupt the company.' },
            { tag: 'Modern solution', front: 'Technopreneurial QC: agile & continuous', back: 'A digitally integrated system with an active software and hardware feedback loop that catches flaws early, adapts to shifting designs, and preserves runway.' },
          ]}
        />
      </Step>
      <Step title="Put each process in order">
        <OrderGame
          prompt="Hardware-in-the-Loop (HIL) assembly testing with automated jigs, or “test beds”:"
          items={[
            { text: 'Clamped', sub: 'The assembled board is secured into the jig immediately.' },
            { text: 'Flashed & Tested', sub: 'The jig flashes firmware and runs circuit diagnostics.' },
            { text: 'On-Spot Rejection', sub: 'Failed parts are rejected before the permanent housing goes on.' },
          ]}
          onDone={hilDone}
        />
        <OrderGame
          prompt="The digital thread for dynamic ECOs, via cloud PLM tools like OpenBOM or Propel:"
          items={[
            { text: 'Instant Push', sub: 'Office changes push updated tolerances, schematics and test specs.' },
            { text: 'Floor Sync', sub: 'Factory screens and test jigs update automatically.' },
            { text: 'Zero Halts', sub: 'Quality gates update without stopping production.' },
          ]}
          onDone={threadDone}
        />
        <OrderGame
          prompt="Closed-loop QC with post-purchase telemetry:"
          items={[
            { text: 'Data Transmit', sub: 'The device sends telemetry to the engineering cloud when turned on.' },
            { text: 'Issue Detect', sub: 'Battery drain or sensor calibration errors are caught in real-world use.' },
            { text: 'PPC Update', sub: 'The data immediately changes assembly or calibration for the next batch.' },
          ]}
          onDone={loopDone}
        />
      </Step>
      <Step title="Executing QC locally">
        <RevealCards
          cards={[
            {
              tag: 'Prototyping & testing jigs',
              front: 'Build the Testing Jig Locally',
              back: 'Open-source hardware (Arduinos, Raspberry Pis) plus 3D-printed enclosures from a local DTI FabLab make custom jigs cheap. The jig goes to the local manufacturer in Laguna or Cavite to automate line testing.',
            },
            {
              tag: 'Regulatory compliance',
              front: 'Navigate NTC & Compliance Early',
              back: 'Wi-Fi, Bluetooth or cellular devices need NTC certification. Use pre-certified RF modules (like ESP32) during DFM to avoid failing regulatory checks later.',
            },
          ]}
        />
      </Step>
      <Step title="You're the founder" hint="What would you do in each situation?">
        <QuizRound questions={SCENARIOS} shuffleQuestions label="Scenario" onDone={quizDone} />
      </Step>
    </Activity>
  );
}

export const MODULE6 = [
  { id: 'learn-ppc', label: 'The PPC Map', Component: PpcMap },
  { id: 'learn-paradigm', label: 'Traditional or Technopreneur?', Component: Paradigm },
  { id: 'learn-scale', label: 'Scale & Source', Component: ScaleSource },
  { id: 'learn-c2c', label: 'Cash-to-Cash Calculator', Component: CashToCash },
  { id: 'learn-qc', label: 'QC & Founder Scenarios', Component: QcScenarios },
];

