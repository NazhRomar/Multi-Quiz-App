import { Activity, LearnProvider, ModuleHeading, ProgressSummary, QuizRound, useParts } from '../kit.jsx';
import { MODULE5 } from './module5.jsx';
import { MODULE6 } from './module6.jsx';

// The Technopreneurship "Learn" tab (notes/index.js): interactive activities
// for Modules 5 and 6, then a mixed final check.
//
// Coverage map, slide by slide (title, objectives and "thank you" slides
// left out). Keep it in step when the PDFs or activities change.
//   Module 5 (techno-05-financial-planning.pdf)
//     3–5    Why a plan, definition, 2 components, 4 focus areas, goal → 1 Basics
//     6      Burn rate, runway, CAC & LTV, ARR/MRR, discipline        → 2 Burn, 5 Metrics
//     7–9    Gross burn lines, net burn, runway, summary table        → 2 Burn
//     10–11  CapEx components, CapEx schedule + useful lives          → 3 Funding (parts 1–3)
//     12     Pro forma investment: CapEx + pre-op + working capital   → 3 Funding (part 2)
//     13     Capital sourcing: founders / VC / grant, non-dilutive    → 3 Funding (part 4)
//     14     Pro forma income, cash flow, balance sheet               → 5 Metrics
//     15–19  Break-even concepts, formula, SaaS scenario, matrix      → 4 Break-even
//   Module 6 (techno-06-production-planning.pdf)
//     2      PPC definition, traditional vs techno, resources, PMF    → 6 PPC Map
//     3–4    Planning (3) vs Control (3)                              → 6 PPC Map
//     5–8    Paradigm shift, both philosophies, strategic comparison  → 7 Sort game
//     9      Pillar 1 dynamic BOM, Pillar 2 stages                    → 6 PPC Map, 8 Scale
//     10     Pillar 3 cash runway alignment, capital freeze           → 6 PPC Map
//     11     Sourcing mix: CM selection, BYOP, MVP ecosystem          → 8 Scale
//     12     Tier 3 → Tier 2/1 transition path                        → 8 Scale
//     13     C2C, MOQ, component obsolescence                         → 8 Scale, 9 C2C
//     14–15  C2C formula, sourcing strategy table                     → 9 C2C, 7 Sort game
//     16     Traditional QC, hardware danger, technopreneurial QC     → 10 QC, 7 Sort game
//     17–19  HIL jigs, dynamic ECOs / cloud PLM, telemetry loop       → 10 QC
//     20     Traditional vs technopreneurial QC table                 → 7 Sort game
//     21     Local jigs (DTI FabLab), NTC / ESP32, DOST-AMCen          → 10 QC
//   Final check draws from both modules.

const FINAL_QUESTIONS = [
  { q: 'Gross burn ₱400,000, revenue ₱150,000, cash ₱5,000,000. What is the runway?', options: ['20 months', '12.5 months', '33.3 months', '8 months'], answer: 0, why: 'Net burn 400,000 − 150,000 = 250,000; 5,000,000 ÷ 250,000 = 20 months.' },
  { q: 'The break-even point in units is…', options: ['Total fixed monthly costs ÷ contribution margin per unit', 'Selling price − variable cost', 'Subscribers × price per unit', 'Cash balance ÷ net burn'], answer: 0, why: 'The others are contribution margin, break-even revenue, and runway.' },
  { q: 'Price ₱2,500, variable cost ₱500, fixed costs ₱300,000. Break-even subscribers?', options: ['150', '120', '600', '100'], answer: 0, why: 'CM = 2,000; 300,000 ÷ 2,000 = 150.' },
  { q: 'In that same scenario, what is the break-even sales revenue per month?', options: ['₱375,000', '₱300,000', '₱450,000', '₱250,000'], answer: 0, why: '150 subscribers × ₱2,500 = ₱375,000.' },
  { q: 'The total pro forma investment requirement combines…', options: ['CapEx, pre-operating expenses and a working capital margin', 'Revenue, COGS and operating expenses', 'DIO, DSO and DPO', 'Founders, VC and grant'], answer: 0, why: '₱1.28M + ₱0.2M + ₱1.02M = ₱2.5M.' },
  { q: 'Which funding source is non-dilutive?', options: ['A government innovation / R&D grant', 'An angel investor', 'A VC seed round', "Founders' equity"], answer: 0, why: 'A grant gives no ownership stake away.' },
  { q: 'In the CapEx schedule, the GPU laptops have a useful life of…', options: ['3 years', '5 years', '10 years', '1 year'], answer: 0, why: 'Hardware/dev kits are 3 years; IP is 10; the rest are 5.' },
  { q: 'Which is NOT one of the four strategic focus areas of a technopreneurship financial plan?', options: ['Bulk inventory discounts', 'Heavy upfront R&D', 'Pricing models', 'VC timelines'], answer: 0, why: 'The four are heavy upfront R&D, scalable tech, pricing models and VC timelines.' },
  { q: 'Which pro forma statement exposes timing gaps between customer onboarding and invoice settlement?', options: ['Cash flow statement', 'Income statement', 'Balance sheet', 'CapEx schedule'], answer: 0, why: 'It previews cash inflows and outflows.' },
  { q: 'PPC translates a high-tech prototype or code architecture into…', options: ['A scalable, commercially viable market product', 'A patent filing', 'A pro forma balance sheet', 'A government grant'], answer: 0, why: "That's the core definition of PPC." },
  { q: 'Deciding what to make in-house vs. contract out belongs to…', options: ['Production planning (routing & sourcing)', 'Production control (bottleneck & burn-rate)', 'Quality control', 'Break-even analysis'], answer: 0, why: 'Planning: the vision and strategy, before capital is spent.' },
  { q: 'The primary goal of technopreneurship PPC is to…', options: ['Maximize learning rate and speed-to-market', 'Minimize unit cost via extreme replication', 'Run machines at 90%+ capacity', 'Buy in bulk for discounts'], answer: 0, why: 'The others are the traditional view.' },
  { q: 'The Pilot Run stage means…', options: ['Short batches of 10–100 units with temporary tooling', 'Single-unit hand-assembly', 'Offloading to a global contract partner', 'Full automation'], answer: 0, why: 'Alpha/Beta → Pilot Run → Mass Customization.' },
  { q: 'The C2C (cash conversion) cycle is…', options: ['DIO + DSO − DPO', 'DIO − DSO + DPO', 'DPO + DSO − DIO', 'DIO × DSO ÷ DPO'], answer: 0, why: 'Inventory days plus collection days, minus the days you take to pay suppliers.' },
  { q: 'Where should a startup build its MVP and pilot runs?', options: ['A Tier 3 manufacturer', 'A Tier 1 manufacturer', 'Its own automated factory', 'Overseas mass production'], answer: 0, why: 'Launch at Tier 3, then scale to Tier 2/1 after product-market fit.' },
  { q: 'In technopreneurial QC, testing happens…', options: ['In-line and automated at every critical assembly step', 'Only at the end of the line by sampling', 'Only after customers complain', 'Once per year'], answer: 0, why: 'Functional validation through jigs, plus telemetry after the sale.' },
];

const FINAL = { id: 'learn-final', label: 'Final Check' };
const ALL = [...MODULE5, ...MODULE6, FINAL];

export const headings = [
  { id: 'learn-m5', label: 'Module 5: Financial Planning', level: 1 },
  ...MODULE5.map((a) => ({ id: a.id, label: a.label, level: 2 })),
  { id: 'learn-m6', label: 'Module 6: Production Planning & Control', level: 1 },
  ...MODULE6.map((a) => ({ id: a.id, label: a.label, level: 2 })),
  { id: FINAL.id, label: FINAL.label, level: 1 },
];

function FinalCheck() {
  const [done] = useParts(FINAL.id, 1);
  return (
    <Activity id={FINAL.id} number="★" title="Final Check" intro={`${FINAL_QUESTIONS.length} mixed questions from both modules, shuffled each time. Aim for ${Math.ceil(FINAL_QUESTIONS.length * 0.8)} or better.`}>
      <QuizRound questions={FINAL_QUESTIONS} shuffleQuestions onDone={done} />
    </Activity>
  );
}

export default function TechnoLearn() {
  return (
    <LearnProvider storageKey="quizApp_learn_technopreneurship">
      <article className="learn">
        <div className="learn-hero">
          <h2 className="learn-hero-title">Learn Modules 5 & 6 by doing</h2>
          <p>Ten short activities cover every content slide of both modules, then a final check. Tap, sort, slide and guess. Your progress is saved on this device.</p>
          <ProgressSummary items={ALL} />
        </div>
        <ModuleHeading id="learn-m5" kicker="Module 5" title="Financial Planning">
          Keeping the right currency: burn, runway, funding and break-even.
        </ModuleHeading>
        {MODULE5.map(({ id, Component }) => (
          <Component key={id} id={id} />
        ))}
        <ModuleHeading id="learn-m6" kicker="Module 6" title="Production Planning & Control">
          Calibrates everything: how a startup builds, sources and checks its product without running out of cash.
        </ModuleHeading>
        {MODULE6.map(({ id, Component }) => (
          <Component key={id} id={id} />
        ))}
        <FinalCheck />
      </article>
    </LearnProvider>
  );
}
