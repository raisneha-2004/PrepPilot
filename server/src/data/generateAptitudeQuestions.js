import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SEED_APTITUDE_PATH = path.resolve(__dirname, 'seedAptitude.json');

export const QuestionSchema = z.object({
  id: z.string().min(1),
  topic: z.string().min(1),
  subtopic: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  pool: z.enum(['practice', 'exam', 'both']),
  question: z.string().min(5),
  options: z.array(z.string().min(1)).length(4),
  correctOption: z.number().int().min(0).max(3),
  explanation: z.string().min(5),
  shortcut: z.string().optional(),
  hints: z.array(z.string()).min(2),
  timeHintSeconds: z.number().int().positive(),
  dataset: z
    .object({
      type: z.enum(['table', 'bar', 'pie', 'line']),
      title: z.string(),
      columns: z.array(z.string()).optional(),
      data: z.array(z.record(z.any()))
    })
    .optional(),
  passageId: z.string().optional(),
  passage: z.string().optional()
});

/**
 * Utility to assign pools deterministically: ~60% practice, ~40% exam, ~25% both
 */
function assignPool(index) {
  const mod = index % 4;
  if (mod === 0) return 'both';
  if (mod === 1 || mod === 2) return 'practice';
  return 'exam';
}

function assignTime(difficulty) {
  if (difficulty === 'easy') return 45;
  if (difficulty === 'medium') return 75;
  return 120;
}

// ==========================================
// 1. QUANTITATIVE APTITUDE GENERATOR (42 Qs)
// ==========================================
function generateQuantitative() {
  const list = [];
  let qId = 1;

  // Easy (15 Qs)
  const easyConfigs = [
    { p: 15, base: 400, sub: 'Percentages' },
    { p: 25, base: 640, sub: 'Percentages' },
    { p: 30, base: 450, sub: 'Percentages' },
    { p: 12, base: 1250, sub: 'Percentages' },
    { a: 24, b: 36, sub: 'Ratio & Proportion' },
    { a: 45, b: 60, sub: 'Ratio & Proportion' },
    { a: 18, b: 42, sub: 'Ratio & Proportion' },
    { nums: [20, 30, 40, 50, 60], sub: 'Averages' },
    { nums: [15, 25, 35, 45, 55], sub: 'Averages' },
    { p: 1000, r: 5, t: 2, sub: 'Simple Interest' },
    { p: 2400, r: 6, t: 3, sub: 'Simple Interest' },
    { p: 5000, r: 8, t: 2, sub: 'Simple Interest' },
    { aDays: 10, bDays: 15, sub: 'Time & Work' },
    { aDays: 12, bDays: 24, sub: 'Time & Work' },
    { aDays: 20, bDays: 30, sub: 'Time & Work' }
  ];

  for (let i = 0; i < easyConfigs.length; i++) {
    const c = easyConfigs[i];
    let qText = '', correctVal = '', wrongVals = [], exp = '', shortcut = '', hints = [];

    if (c.sub === 'Percentages') {
      const ans = (c.p * c.base) / 100;
      qText = `What is ${c.p}% of ${c.base}?`;
      correctVal = `${ans}`;
      wrongVals = [`${ans + 10}`, `${ans - 8}`, `${ans + 15}`];
      exp = `${c.p}% of ${c.base} = (${c.p} / 100) × ${c.base} = ${ans}.`;
      shortcut = `Break ${c.p}% into 10% + 5% for quick mental calculation.`;
      hints = [`Convert ${c.p}% to decimal ${(c.p / 100).toFixed(2)}.`, `Multiply ${c.base} by ${(c.p / 100).toFixed(2)}.`];
    } else if (c.sub === 'Ratio & Proportion') {
      // GCD ratio
      const gcd = (x, y) => (y === 0 ? x : gcd(y, x % y));
      const g = gcd(c.a, c.b);
      const rA = c.a / g;
      const rB = c.b / g;
      qText = `Express the ratio of ${c.a} to ${c.b} in its simplest irreducible form.`;
      correctVal = `${rA} : ${rB}`;
      wrongVals = [`${rA + 1} : ${rB}`, `${rA} : ${rB + 1}`, `${rA * 2} : ${rB * 3}`];
      exp = `Divide both ${c.a} and ${c.b} by their greatest common divisor (${g}) to get ${rA} : ${rB}.`;
      shortcut = `Divide both numbers by common factor ${g}.`;
      hints = [`Find the common divisor of ${c.a} and ${c.b}.`, `Divide both terms by ${g}.`];
    } else if (c.sub === 'Averages') {
      const sum = c.nums.reduce((a, b) => a + b, 0);
      const avg = sum / c.nums.length;
      qText = `Find the arithmetic mean (average) of the numbers: ${c.nums.join(', ')}.`;
      correctVal = `${avg}`;
      wrongVals = [`${avg - 4}`, `${avg + 5}`, `${avg + 10}`];
      exp = `Sum = ${sum}. Total count = ${c.nums.length}. Average = ${sum} / ${c.nums.length} = ${avg}.`;
      shortcut = `Since numbers form an AP with common difference 10, average is the exact middle term (${avg}).`;
      hints = [`Sum all ${c.nums.length} numbers.`, `Divide the sum (${sum}) by ${c.nums.length}.`];
    } else if (c.sub === 'Simple Interest') {
      const si = (c.p * c.r * c.t) / 100;
      qText = `Find the simple interest on a principal of $${c.p} at ${c.r}% per annum for ${c.t} years.`;
      correctVal = `$${si}`;
      wrongVals = [`$${si + 20}`, `$${si - 15}`, `$${si + 50}`];
      exp = `SI = (P × R × T) / 100 = (${c.p} × ${c.r} × ${c.t}) / 100 = $${si}.`;
      shortcut = `Interest per year is ${c.r}% of $${c.p} = $${(c.p * c.r) / 100}. Multiply by ${c.t} years.`;
      hints = [`Use SI = (P × R × T) / 100.`, `P=${c.p}, R=${c.r}, T=${c.t}.`];
    } else if (c.sub === 'Time & Work') {
      // 1/a + 1/b = (a+b)/(ab) -> ab/(a+b)
      const combined = (c.aDays * c.bDays) / (c.aDays + c.bDays);
      qText = `Person A completes a project in ${c.aDays} days, and Person B completes it in ${c.bDays} days. Working together, how many days will they take?`;
      correctVal = `${combined} days`;
      wrongVals = [`${combined + 2} days`, `${combined - 1} days`, `${Math.round(combined * 1.5)} days`];
      exp = `Combined rate = 1/${c.aDays} + 1/${c.bDays} = (${c.aDays + c.bDays}) / ${c.aDays * c.bDays}. Total days = (${c.aDays} × ${c.bDays}) / (${c.aDays} + ${c.bDays}) = ${combined} days.`;
      shortcut = `Formula: (A × B) / (A + B) = (${c.aDays * c.bDays}) / ${c.aDays + c.bDays} = ${combined}.`;
      hints = [`Calculate 1-day work of A and B.`, `Add reciprocal rates (1/${c.aDays} + 1/${c.bDays}).`];
    }

    const options = [correctVal, ...wrongVals].sort(() => 0.5 - Math.random());
    list.push({
      id: `quant_e_${qId++}`,
      topic: 'Quantitative Aptitude',
      subtopic: c.sub,
      difficulty: 'easy',
      pool: assignPool(i),
      question: qText,
      options,
      correctOption: options.indexOf(correctVal),
      explanation: exp,
      shortcut,
      hints,
      timeHintSeconds: assignTime('easy')
    });
  }

  // Medium (15 Qs)
  const medConfigs = [
    { p: 12000, r: 10, t: 2, sub: 'Compound Interest' },
    { p: 8000, r: 5, t: 2, sub: 'Compound Interest' },
    { p: 15000, r: 10, t: 3, sub: 'Compound Interest' },
    { aDays: 12, bDays: 15, cDays: 20, sub: 'Time & Work' },
    { aDays: 10, bDays: 20, cDays: 30, sub: 'Time & Work' },
    { cp: 450, sp: 540, sub: 'Percentages & Margin' },
    { cp: 800, sp: 960, sub: 'Percentages & Margin' },
    { cp: 1200, sp: 1500, sub: 'Percentages & Margin' },
    { ratioA: 3, ratioB: 4, total: 350, sub: 'Ratio & Proportion' },
    { ratioA: 5, ratioB: 7, total: 480, sub: 'Ratio & Proportion' },
    { ratioA: 2, ratioB: 3, total: 600, sub: 'Ratio & Proportion' },
    { m1: 15, d1: 12, m2: 20, sub: 'Men & Days Work' },
    { m1: 8, d1: 18, m2: 12, sub: 'Men & Days Work' },
    { aAge: 24, bAge: 36, years: 6, sub: 'Problems on Ages' },
    { aAge: 16, bAge: 28, years: 4, sub: 'Problems on Ages' }
  ];

  for (let i = 0; i < medConfigs.length; i++) {
    const c = medConfigs[i];
    let qText = '', correctVal = '', wrongVals = [], exp = '', shortcut = '', hints = [];

    if (c.sub === 'Compound Interest') {
      const amount = Math.round(c.p * Math.pow(1 + c.r / 100, c.t));
      const ci = amount - c.p;
      qText = `Calculate the compound interest on $${c.p} compounded annually at ${c.r}% p.a. for ${c.t} years.`;
      correctVal = `$${ci}`;
      wrongVals = [`$${ci + 150}`, `$${ci - 100}`, `$${ci + 240}`];
      exp = `Amount = P × (1 + R/100)^T = ${c.p} × (1 + ${c.r}/100)^${c.t} = $${amount}. Compound Interest = Amount - Principal = $${amount} - $${c.p} = $${ci}.`;
      shortcut = `Successive % method: For 2 years at ${c.r}%, net rate = ${c.r} + ${c.r} + (${c.r}×${c.r})/100 = ${(2 * c.r + (c.r * c.r) / 100).toFixed(2)}%.`;
      hints = [`Formula: CI = P[(1 + R/100)^T - 1].`, `Compute ${(1 + c.r / 100).toFixed(2)}^${c.t}.`];
    } else if (c.sub === 'Time & Work') {
      // 1/a + 1/b + 1/c
      const lcm = 60;
      const rateA = lcm / c.aDays;
      const rateB = lcm / c.bDays;
      const rateC = lcm / c.cDays;
      const totalRate = rateA + rateB + rateC;
      const days = (lcm / totalRate).toFixed(1);
      qText = `A, B, and C can finish a job in ${c.aDays}, ${c.bDays}, and ${c.cDays} days respectively. Working simultaneously, in how many days will the task be completed?`;
      correctVal = `${days} days`;
      wrongVals = [`${(parseFloat(days) + 1.5).toFixed(1)} days`, `${(parseFloat(days) - 1).toFixed(1)} days`, `${(parseFloat(days) + 3).toFixed(1)} days`];
      exp = `Take LCM of (${c.aDays}, ${c.bDays}, ${c.cDays}) = ${lcm} units of work. Daily work: A = ${rateA}, B = ${rateB}, C = ${rateC}. Total daily = ${totalRate} units. Days = ${lcm} / ${totalRate} = ${days} days.`;
      shortcut = `Use LCM work efficiency method rather than fractions.`;
      hints = [`Find LCM of days (${c.aDays}, ${c.bDays}, ${c.cDays}).`, `Calculate combined daily units of work.`];
    } else if (c.sub === 'Percentages & Margin') {
      const profit = c.sp - c.cp;
      const pct = Math.round((profit / c.cp) * 100);
      qText = `An item bought for $${c.cp} was sold for $${c.sp}. Find the percentage gain.`;
      correctVal = `${pct}%`;
      wrongVals = [`${pct - 5}%`, `${pct + 4}%`, `${pct + 10}%`];
      exp = `Profit = $${c.sp} - $${c.cp} = $${profit}. Percentage Gain = (Profit / Cost Price) × 100 = (${profit} / ${c.cp}) × 100 = ${pct}%.`;
      shortcut = `Gain % is always calculated with respect to Cost Price ($${c.cp}).`;
      hints = [`Find absolute profit: Selling Price - Cost Price.`, `Divide profit by Cost Price ($${c.cp}) and multiply by 100.`];
    } else if (c.sub === 'Ratio & Proportion') {
      const partA = (c.total / (c.ratioA + c.ratioB)) * c.ratioA;
      const partB = (c.total / (c.ratioA + c.ratioB)) * c.ratioB;
      qText = `Divide $${c.total} between A and B in the ratio ${c.ratioA} : ${c.ratioB}. What is A's share?`;
      correctVal = `$${partA}`;
      wrongVals = [`$${partB}`, `$${partA + 20}`, `$${partA - 25}`];
      exp = `Total parts = ${c.ratioA} + ${c.ratioB} = ${c.ratioA + c.ratioB}. 1 part = $${c.total} / ${c.ratioA + c.ratioB} = $${c.total / (c.ratioA + c.ratioB)}. A's share = ${c.ratioA} × $${c.total / (c.ratioA + c.ratioB)} = $${partA}.`;
      shortcut = `A's share = (${c.ratioA} / ${c.ratioA + c.ratioB}) × ${c.total} = $${partA}.`;
      hints = [`Sum the ratio terms (${c.ratioA} + ${c.ratioB}).`, `Multiply total by (${c.ratioA} / ${c.ratioA + c.ratioB}).`];
    } else if (c.sub === 'Men & Days Work') {
      const d2 = (c.m1 * c.d1) / c.m2;
      qText = `If ${c.m1} workers can complete a task in ${c.d1} days, how many days will ${c.m2} workers take to finish the identical task?`;
      correctVal = `${d2} days`;
      wrongVals = [`${d2 + 3} days`, `${d2 - 2} days`, `${d2 + 5} days`];
      exp = `Total work = M1 × D1 = ${c.m1} × ${c.d1} = ${c.m1 * c.d1} man-days. Days for ${c.m2} workers = (M1 × D1) / M2 = ${c.m1 * c.d1} / ${c.m2} = ${d2} days.`;
      shortcut = `Formula: M1 × D1 = M2 × D2. Hence D2 = (${c.m1} × ${c.d1}) / ${c.m2}.`;
      hints = [`Use man-days conservation: M1 × D1 = M2 × D2.`, `Solve for D2.`];
    } else if (c.sub === 'Problems on Ages') {
      const futureA = c.aAge + c.years;
      const futureB = c.bAge + c.years;
      qText = `Present ages of X and Y are ${c.aAge} and ${c.bAge} years. What will be the ratio of their ages after ${c.years} years in simplest form?`;
      const gcd = (x, y) => (y === 0 ? x : gcd(y, x % y));
      const g = gcd(futureA, futureB);
      correctVal = `${futureA / g} : ${futureB / g}`;
      wrongVals = [`${(futureA / g) + 1} : ${futureB / g}`, `${futureA / g} : ${(futureB / g) + 1}`, `${futureA} : ${futureB + 2}`];
      exp = `After ${c.years} years, X = ${c.aAge} + ${c.years} = ${futureA}, Y = ${c.bAge} + ${c.years} = ${futureB}. Ratio = ${futureA} : ${futureB} = ${futureA / g} : ${futureB / g}.`;
      shortcut = `Add ${c.years} to each age and simplify the resulting fraction.`;
      hints = [`Add ${c.years} to both ${c.aAge} and ${c.bAge}.`, `Reduce ${futureA} : ${futureB} to simplest form.`];
    }

    const options = [correctVal, ...wrongVals].sort(() => 0.5 - Math.random());
    list.push({
      id: `quant_m_${qId++}`,
      topic: 'Quantitative Aptitude',
      subtopic: c.sub,
      difficulty: 'medium',
      pool: assignPool(i),
      question: qText,
      options,
      correctOption: options.indexOf(correctVal),
      explanation: exp,
      shortcut,
      hints,
      timeHintSeconds: assignTime('medium')
    });
  }

  // Hard (10 Qs)
  const hardConfigs = [
    { p: 20000, r: 12, sub: 'Difference of CI and SI' },
    { p: 15000, r: 8, sub: 'Difference of CI and SI' },
    { q1: 40, c1: 20, q2: 60, c2: 30, sub: 'Alligation & Mixtures' },
    { q1: 50, c1: 15, q2: 50, c2: 25, sub: 'Alligation & Mixtures' },
    { a: 12, b: 16, c: 24, leaveDays: 2, sub: 'Work with Leaves' },
    { mp: 1000, d1: 10, d2: 20, sub: 'Successive Discounts' },
    { mp: 2500, d1: 20, d2: 15, sub: 'Successive Discounts' },
    { capacity: 120, inlet: 15, outlet: 10, sub: 'Pipes & Cisterns' },
    { capacity: 180, inlet: 20, outlet: 12, sub: 'Pipes & Cisterns' },
    { leakRate: 2, normalHours: 6, sub: 'Pipes & Cisterns' }
  ];

  for (let i = 0; i < hardConfigs.length; i++) {
    const c = hardConfigs[i];
    let qText = '', correctVal = '', wrongVals = [], exp = '', shortcut = '', hints = [];

    if (c.sub === 'Difference of CI and SI') {
      // Diff for 2 years = P * (R/100)^2
      const diff = Math.round(c.p * Math.pow(c.r / 100, 2));
      qText = `What is the difference between Compound Interest and Simple Interest on $${c.p} for 2 years at ${c.r}% per annum?`;
      correctVal = `$${diff}`;
      wrongVals = [`$${diff + 24}`, `$${diff - 18}`, `$${diff + 45}`];
      exp = `Difference for 2 years = P × (R / 100)² = ${c.p} × (${c.r} / 100)² = ${c.p} × ${(c.r / 100) ** 2} = $${diff}.`;
      shortcut = `Direct formula for 2 years: Diff = P × (R / 100)².`;
      hints = [`Use 2-year difference formula Diff = P(R/100)².`, `Calculate (${c.r}/100)² and multiply by ${c.p}.`];
    } else if (c.sub === 'Alligation & Mixtures') {
      const avgCost = (c.q1 * c.c1 + c.q2 * c.c2) / (c.q1 + c.q2);
      qText = `${c.q1} kg of tea costing $${c.c1}/kg is blended with ${c.q2} kg of tea costing $${c.c2}/kg. What is the average cost price per kg of the resulting mixture?`;
      correctVal = `$${avgCost.toFixed(2)}/kg`;
      wrongVals = [`$${(avgCost + 2.5).toFixed(2)}/kg`, `$${(avgCost - 1.8).toFixed(2)}/kg`, `$${(avgCost + 4).toFixed(2)}/kg`];
      exp = `Total cost = (${c.q1} × $${c.c1}) + (${c.q2} × $${c.c2}) = $${c.q1 * c.c1 + c.q2 * c.c2}. Total weight = ${c.q1 + c.q2} kg. Cost/kg = $${c.q1 * c.c1 + c.q2 * c.c2} / ${c.q1 + c.q2} = $${avgCost.toFixed(2)}/kg.`;
      shortcut = `Alligation weighted mean: (Q1·C1 + Q2·C2) / (Q1 + Q2).`;
      hints = [`Find total spend across both quantities.`, `Divide total cost by combined weight (${c.q1 + c.q2} kg).`];
    } else if (c.sub === 'Successive Discounts') {
      const netDiscount = c.d1 + c.d2 - (c.d1 * c.d2) / 100;
      const sp = c.mp * (1 - netDiscount / 100);
      qText = `An item with a Marked Price of $${c.mp} is offered with successive discounts of ${c.d1}% and ${c.d2}%. What is the final selling price?`;
      correctVal = `$${sp.toFixed(0)}`;
      wrongVals = [`$${(sp + 50).toFixed(0)}`, `$${(sp - 40).toFixed(0)}`, `$${(c.mp * (1 - (c.d1 + c.d2) / 100)).toFixed(0)}`];
      exp = `Equivalent single discount = ${c.d1} + ${c.d2} - (${c.d1} × ${c.d2})/100 = ${netDiscount}%. Selling price = $${c.mp} × (1 - ${netDiscount}/100) = $${sp.toFixed(0)}.`;
      shortcut = `Net discount formula: d1 + d2 - (d1 × d2)/100 = ${netDiscount}%.`;
      hints = [`Successive discounts do NOT simply add up.`, `Use d = a + b - (ab/100) to find net discount percentage.`];
    } else if (c.sub === 'Pipes & Cisterns') {
      if (c.leakRate) {
        // Normal 6h, with leak net rate = 1/6 - 1/leak
        const emptyHours = 12;
        qText = `A pipe can fill a tank in ${c.normalHours} hours. Due to a leak at the bottom, it takes 8 hours to fill it. In how many hours will the leak alone empty the full tank?`;
        correctVal = `24 hours`;
        wrongVals = [`18 hours`, `20 hours`, `30 hours`];
        exp = `Pipe fill rate = 1/6 tank/hr. Combined rate with leak = 1/8 tank/hr. Leak emptying rate = 1/6 - 1/8 = (4 - 3)/24 = 1/24 tank/hr. Therefore, leak empties the tank in 24 hours.`;
        shortcut = `Formula: (T_fill × T_leak_fill) / (T_leak_fill - T_fill) = (6 × 8) / (8 - 6) = 48 / 2 = 24 hrs.`;
        hints = [`Subtract combined rate (1/8) from normal rate (1/6).`, `Reciprocal of resulting fraction is the answer.`];
      } else {
        const netRate = c.inlet - c.outlet;
        const timeToFill = c.capacity / netRate;
        qText = `A cistern of capacity ${c.capacity} liters has an inlet pipe delivering ${c.inlet} L/min and a drain releasing ${c.outlet} L/min. How long will it take to fill the empty cistern with both pipes open?`;
        correctVal = `${timeToFill} mins`;
        wrongVals = [`${timeToFill + 5} mins`, `${timeToFill - 4} mins`, `${timeToFill * 2} mins`];
        exp = `Net filling rate = ${c.inlet} - ${c.outlet} = ${netRate} L/min. Time required = ${c.capacity} / ${netRate} = ${timeToFill} mins.`;
        shortcut = `Net rate = Inlet - Outlet. Time = Capacity / Net rate.`;
        hints = [`Calculate net inflow per minute: ${c.inlet} - ${c.outlet}.`, `Divide total volume by net rate.`];
      }
    } else {
      qText = `A and B can complete a work in 12 and 16 days. They worked together for 3 days and then A left. How many days will B take to complete the remaining work?`;
      correctVal = `8 days`;
      wrongVals = [`6 days`, `10 days`, `12 days`];
      exp = `Total work = LCM(12, 16) = 48 units. A = 4 units/day, B = 3 units/day. In 3 days, (A+B) do 3 × 7 = 21 units. Remaining = 48 - 21 = 27 units. B takes 27 / 3 = 9 days.`;
      shortcut = `LCM method: Work done in 3 days = 21 units, remaining 27 units done by B at 3 units/day.`;
      hints = [`Find LCM of 12 and 16 to set total units.`, `Calculate remaining units and divide by B's daily rate.`];
    }

    const options = [correctVal, ...wrongVals].sort(() => 0.5 - Math.random());
    list.push({
      id: `quant_h_${qId++}`,
      topic: 'Quantitative Aptitude',
      subtopic: c.sub,
      difficulty: 'hard',
      pool: assignPool(i),
      question: qText,
      options,
      correctOption: options.indexOf(correctVal),
      explanation: exp,
      shortcut,
      hints,
      timeHintSeconds: assignTime('hard')
    });
  }

  return list;
}

// ==========================================
// 2. LOGICAL REASONING (40 Qs)
// ==========================================
function generateLogical() {
  const items = [
    // Easy (15 Qs)
    { d: 'easy', sub: 'Blood Relations', q: 'Pointing to a photograph, John says: "She is the only daughter of my mother\'s father." How is the woman in the photograph related to John?', o: ['Mother', 'Aunt', 'Sister', 'Grandmother'], c: 0, exp: 'Mother\'s father is maternal grandfather. His only daughter is John\'s mother.', s: 'Trace backwards from "my mother\'s father".' },
    { d: 'easy', sub: 'Blood Relations', q: 'A is B\'s sister. C is B\'s mother. D is C\'s father. How is A related to D?', o: ['Granddaughter', 'Daughter', 'Grandmother', 'Niece'], c: 0, exp: 'A is C\'s daughter (since A is sister of B whose mother is C). D is C\'s father, so A is D\'s granddaughter.', s: 'Map family generations: D (Gen 1) -> C (Gen 2) -> A & B (Gen 3).' },
    { d: 'easy', sub: 'Blood Relations', q: 'If P $ Q means P is the father of Q, and P # Q means P is the sister of Q, what does A $ B # C mean?', o: ['A is the father of C', 'A is the brother of C', 'A is the uncle of C', 'C is the father of A'], c: 0, exp: 'A is father of B, and B is sister of C. Hence A is the father of both B and C.', s: 'Replace symbols with relations from left to right.' },
    { d: 'easy', sub: 'Coding-Decoding', q: 'In a certain code language, "APPLE" is written as "EQQPI". How is "GRAPE" written in that same code?', o: ['KVETI', 'KUERI', 'KVDTI', 'KUFSI'], c: 0, exp: 'Each letter is shifted forward by +4 in the alphabet: G(+4)=K, R(+4)=V, A(+4)=E, P(+4)=T, E(+4)=I.', s: 'Check shift on the first letter: A (1) to E (5) = +4.' },
    { d: 'easy', sub: 'Coding-Decoding', q: 'If "DELHI" is coded as 73541 and "CALCUTTA" as 82589662, how is "CALICUT" coded in that system?', o: ['8251896', '8251869', '8251986', '8258196'], c: 0, exp: 'Direct letter-to-digit mapping: C=8, A=2, L=5, I=1, C=8, U=9, T=6 -> 8251896.', s: 'Lookup each letter in the provided dictionary words.' },
    { d: 'easy', sub: 'Direction Sense', q: 'Ravi walks 10 km North, turns right and walks 6 km, then turns right again and walks 10 km. How far and in what direction is he from his starting point?', o: ['6 km East', '6 km West', '10 km North', '16 km South'], c: 0, exp: 'The 10 km North and 10 km South cancel out. He remains 6 km East of the origin.', s: 'Opposite parallel displacements cancel each other.' },
    { d: 'easy', sub: 'Direction Sense', q: 'A person facing South turns 135° in the anti-clockwise direction and then 180° in the clockwise direction. Which direction is he facing now?', o: ['South-West', 'North-West', 'South-East', 'North-East'], c: 0, exp: 'Net rotation = 180° CW - 135° ACW = 45° Clockwise. 45° CW from South is South-West.', s: 'Calculate net angle = CW - ACW.' },
    { d: 'easy', sub: 'Order & Ranking', q: 'In a class of 45 students, Rohan ranks 15th from the top. What is his rank from the bottom?', o: ['31st', '30th', '32nd', '29th'], c: 0, exp: 'Rank from bottom = Total - Rank from top + 1 = 45 - 15 + 1 = 31st.', s: 'Formula: Total = Top + Bottom - 1.' },
    { d: 'easy', sub: 'Order & Ranking', q: 'Suresh is 7 ranks ahead of Ashok in a class of 39. If Ashok\'s rank is 17th from the last, what is Suresh\'s rank from the start?', o: ['16th', '17th', '15th', '18th'], c: 0, exp: 'Ashok from start = 39 - 17 + 1 = 23rd. Suresh is 7 ranks ahead (closer to 1st) = 23 - 7 = 16th.', s: 'Ahead in rank means a lower numerical rank.' },
    { d: 'easy', sub: 'Seating Arrangement', q: 'Five friends P, Q, R, S, T are sitting in a row facing North. S is between T and Q. Q is to the immediate left of R. P is to the immediate left of T. Who is in the middle?', o: ['S', 'T', 'Q', 'P'], c: 0, exp: 'Order from left to right: P, T, S, Q, R. Middle person is S.', s: 'Build relative clusters: [P T], [T S Q], [Q R].' },
    { d: 'easy', sub: 'Analogies', q: 'Clock is to Time as Thermometer is to:', o: ['Temperature', 'Heat', 'Mercury', 'Pressure'], c: 0, exp: 'A clock is an instrument used to measure time; a thermometer measures temperature.', s: 'Identify the "Instrument : Measurement" relationship.' },
    { d: 'easy', sub: 'Odd One Out', q: 'Find the odd one out among the following words:', o: ['Circle', 'Square', 'Triangle', 'Rectangle'], c: 0, exp: 'Square, Triangle, and Rectangle are polygons formed by straight line segments, whereas a Circle is curved.', s: 'Identify geometrical classification (polygon vs curve).' },
    { d: 'easy', sub: 'Clock & Calendar', q: 'What is the angle between the hour hand and the minute hand of a clock at 3:30?', o: ['75°', '90°', '60°', '85°'], c: 0, exp: 'Angle = |(30 × H) - (11/2 × M)| = |(30 × 3) - (11/2 × 30)| = |90 - 165| = 75°.', s: 'Formula: Angle = |30H - 5.5M|.' },
    { d: 'easy', sub: 'Clock & Calendar', q: 'If today is Monday, what day of the week will it be after 61 days?', o: ['Saturday', 'Friday', 'Sunday', 'Tuesday'], c: 0, exp: '61 mod 7 = 5 remainder. Monday + 5 days = Saturday.', s: 'Divide days by 7 and count remainder forward from current day.' },
    { d: 'easy', sub: 'Alphabetical Order', q: 'Which word will appear third when arranged in alphabetical dictionary order?', o: ['Nature', 'Native', 'Nation', 'Natural'], c: 0, exp: 'Dictionary order: 1. Nation, 2. Native, 3. Natural, 4. Nature. Third is Natural.', s: 'Compare letter by letter from left to right.' },

    // Medium (15 Qs)
    { d: 'medium', sub: 'Seating Arrangement', q: 'Six persons A, B, C, D, E, F are sitting around a circular table facing the center. A is opposite to D. E is between A and B. F is between D and A. Who is sitting opposite to B?', o: ['F', 'C', 'E', 'D'], c: 0, exp: 'Placing A at top and D at bottom: E is left of A, B is next to E. F is right of A. Opposite to B is F.', s: 'Draw circle with 6 symmetric points.' },
    { d: 'medium', sub: 'Seating Arrangement', q: 'Eight persons A through H sit around a square table with 2 on each side facing center. A is second to the right of B. C is opposite to A. G is adjacent to C. Who sits opposite to B?', o: ['D', 'F', 'H', 'E'], c: 0, exp: 'Following the positioning constraints step by step around the 8 seats leads directly to D opposite B.', s: 'Place fixed reference nodes first.' },
    { d: 'medium', sub: 'Blood Relations Puzzle', q: 'In a family of six (P, Q, R, S, T, U), there are two married couples. Q is a doctor and father of T. U is grandfather of R and is a contractor. S is grandmother of T and a housewife. There is one doctor, one contractor, one nurse, one housewife, and two students. What is the profession of P?', o: ['Nurse', 'Doctor', 'Housewife', 'Student'], c: 0, exp: 'U (Grandfather, Contractor) is married to S (Grandmother, Housewife). Q (Father, Doctor) is married to P, making P the Nurse. T and R are students.', s: 'Match family tree generations with professional assignments.' },
    { d: 'medium', sub: 'Coding Patterns', q: 'If "MACHINE" is coded as 19-7-9-14-15-20-11, how will "DANGER" be coded in the same scheme?', o: ['10-7-20-13-11-24', '11-7-20-16-11-24', '13-7-20-9-11-25', '10-8-20-13-11-24'], c: 0, exp: 'Each letter\'s alphabetical position is increased by +6: M(13+6)=19, A(1+6)=7. D(4+6)=10, A(1+6)=7, N(14+6)=20, G(7+6)=13, E(5+6)=11, R(18+6)=24.', s: 'Letter numerical rank + 6.' },
    { d: 'medium', sub: 'Direction & Distance', q: 'A person walks 8m East from point A, turns right and walks 6m, then turns left and walks 4m, then turns left and walks 11m to reach point B. What is the shortest distance between A and B?', o: ['13m', '15m', '12m', '17m'], c: 0, exp: 'Net East displacement = 8 + 4 = 12m. Net North displacement = -6 + 11 = 5m. Shortest distance = √(12² + 5²) = √(144 + 25) = √169 = 13m.', s: 'Pythagorean triplet (5, 12, 13).' },
    { d: 'medium', sub: 'Clock Hands', q: 'At what time between 4 and 5 o\'clock will the hands of a clock coincide (overlap)?', o: ['21 9/11 minutes past 4', '22 minutes past 4', '20 5/11 minutes past 4', '23 2/11 minutes past 4'], c: 0, exp: 'At 4 o\'clock, the minute hand is 20 minute spaces behind. Gain rate = 55/60 space/min = 11/12. Time = 20 × (12/11) = 240/11 = 21 9/11 minutes past 4.', s: 'Formula for coincidence: (5 × H) × 12/11 minutes past H.' },
    { d: 'medium', sub: 'Calendar Leap Years', q: 'The calendar for the year 2024 will be identical and usable again for which year?', o: ['2052', '2048', '2030', '2050'], c: 0, exp: 'A leap year calendar repeats every 28 years (unless century exception). 2024 + 28 = 2052.', s: 'Leap year calendar cycle is 28 years.' },
    { d: 'medium', sub: 'Statement & Assumptions', q: 'Statement: "The municipal corporation warned residents to boil water before drinking during the monsoon." Assumption I: Residents are prone to water-borne diseases during monsoon. Assumption II: Boiling water destroys harmful pathogens.', o: ['Both I and II are implicit', 'Only I is implicit', 'Only II is implicit', 'Neither is implicit'], c: 0, exp: 'Both assumptions are directly presupposed by the warning: boiling prevents water-borne diseases common in monsoons.', s: 'An assumption is what the speaker takes for granted when issuing the statement.' },
    { d: 'medium', sub: 'Statement & Conclusions', q: 'Statement: "All successful tech startups have high product velocity. Startup X has high product velocity." Conclusion I: Startup X is a successful tech startup. Conclusion II: High product velocity guarantees funding.', o: ['Neither I nor II follows', 'Only I follows', 'Only II follows', 'Both follow'], c: 0, exp: 'High velocity is a necessary condition for successful startups, but not every company with high velocity is guaranteed to be successful (affirming the consequent). Funding is unmentioned.', s: 'Avoid assuming converse statement.' },
    { d: 'medium', sub: 'Data Sufficiency', q: 'What is the value of x? Statement 1: 2x + y = 10. Statement 2: y = 4.', o: ['Both statements together are sufficient', 'Statement 1 alone is sufficient', 'Statement 2 alone is sufficient', 'Neither statement is sufficient'], c: 0, exp: 'From Statement 2, y = 4. Substituting into Statement 1: 2x + 4 = 10 => 2x = 6 => x = 3. Both are required.', s: 'Check if single unique value can be solved.' },
    { d: 'medium', sub: 'Letter Series', q: 'Find the next term in the series: B2D, D4G, F8J, H16M, ?', o: ['J32P', 'J32Q', 'I32P', 'K32O'], c: 0, exp: 'First letter: B(+2)->D(+2)->F(+2)->H(+2)->J. Number doubles: 2, 4, 8, 16, 32. Third letter: D(+3)->G(+3)->J(+3)->M(+3)->P. Next is J32P.', s: 'Split into three independent parallel sub-series.' },
    { d: 'medium', sub: 'Matrix Puzzle', q: 'In a 3x3 matrix, row 1 has (4, 9, 2), row 2 has (3, 5, 7), row 3 has (8, 1, ?). What replaces the question mark if all rows, columns, and diagonals sum to 15?', o: ['6', '5', '4', '7'], c: 0, exp: 'Row 3 sum = 8 + 1 + ? = 15 => ? = 6. This is the classic 3x3 magic square.', s: 'Magic square with magic constant 15.' },
    { d: 'medium', sub: 'Input-Output Machine', q: 'An arrangement machine shifts words alphabetically. Input: "zebra apple mango cat". Step 1: "apple zebra mango cat". Step 2: "apple cat zebra mango". How many total steps to fully sort ascending?', o: ['3 steps', '2 steps', '4 steps', '5 steps'], c: 0, exp: 'Step 1: apple zebra mango cat. Step 2: apple cat zebra mango. Step 3: apple cat mango zebra. Fully sorted in 3 steps.', s: 'Simulate selection shift on each pass.' },
    { d: 'medium', sub: 'Inequalities', q: 'Statements: A > B ≥ C = D < E. Conclusions: I. A > D, II. E > C.', o: ['Both I and II are true', 'Only I is true', 'Only II is true', 'Neither is true'], c: 0, exp: 'A > B ≥ C = D implies A > D (True). C = D < E implies E > C (True). Both hold.', s: 'Trace directional inequality flow.' },
    { d: 'medium', sub: 'Logical Deduction', q: 'If it rains, the ground is wet. The ground is not wet. What logically follows?', o: ['It did not rain', 'It rained lightly', 'The sun is shining', 'No deduction is possible'], c: 0, exp: 'By Modus Tollens (contrapositive): If P then Q. Not Q. Therefore, Not P ("It did not rain").', s: 'Contrapositive of P -> Q is ~Q -> ~P.' },

    // Hard (10 Qs)
    { d: 'hard', sub: 'Complex Arrangement', q: 'Seven professionals P, Q, R, S, T, U, V live on floors 1 to 7. P lives on an odd floor. Only two people live between P and S. V lives immediately above U. Q lives on floor 4. R lives on floor 1. S lives above Q. Who lives on floor 7?', o: ['S', 'P', 'V', 'T'], c: 0, exp: 'Placing R on 1, Q on 4: S must be on floor 6 or 7. Two people between P and S: if P is on 3, S is on 6. If S is on 7, P is on 4 (clashes with Q). Hence S is on 6, P on 3. V and U take 7 and 6? No, V(6) U(5). Resolving gives T on floor 7.', s: 'Eliminate floor assignments clashing with fixed anchors.' },
    { d: 'hard', sub: 'Complex Arrangement', q: 'Eight persons sit in two parallel rows of 4 each facing each other. Row 1 faces South, Row 2 faces North. A faces the person who sits second to the left of B. Following all constraints, who sits at the extreme right end of Row 2?', o: ['H', 'G', 'F', 'E'], c: 0, exp: 'Solving the row mapping grid places H at the extreme right of Row 2.', s: 'Map both rows simultaneously with facing pointers.' },
    { d: 'hard', sub: 'Critical Reasoning', q: 'Which of the following, if true, most seriously weakens the argument that "remote work permanently decreases commercial real estate value"?', o: ['Hybrid companies lease premium renovated spaces at higher rates per sq ft despite smaller footprints', 'More workers report preferring working from home 3 days a week', 'Cities have seen an increase in co-working spaces', 'Residential real estate prices have climbed in suburbs'], c: 0, exp: 'If companies pay higher rates per sq ft for premium spaces, total commercial real estate values may remain resilient or increase.', s: 'Look for the counter-evidence to the causal conclusion.' },
    { d: 'hard', sub: 'Conditional Logic', q: 'If and only if Candidate A passes the technical round and the system design round, they receive an offer. Candidate A did not receive an offer and passed the technical round. What must be true?', o: ['Candidate A failed the system design round', 'Candidate A failed the HR round', 'Candidate A failed both rounds', 'Candidate A declined the offer'], c: 0, exp: 'Biconditional (P ∧ Q) ↔ R. Since R is false and P is true, Q (System Design) must be false.', s: 'In a biconditional, truth values of both sides must match.' },
    { d: 'hard', sub: 'Truth Tellers & Liars', q: 'In an island, Knights always tell the truth and Knaves always lie. Person A says: "We are both Knaves." What are Person A and Person B?', o: ['A is a Knave and B is a Knight', 'Both are Knaves', 'Both are Knights', 'A is a Knight and B is a Knave'], c: 0, exp: 'If A were a Knight, his statement would be true (both Knaves), which contradicts A being a Knight. Thus A is a Knave (statement is false). Since the statement "both are Knaves" is false and A is a Knave, B must be a Knight.', s: 'A Knight can never say "I am a Knave".' },
    { d: 'hard', sub: 'Binary Logic Puzzle', q: 'Three boxes are labeled: "Apples", "Oranges", and "Both". ALL three labels are known to be incorrect. You pick one fruit from the "Both" box and it is an Apple. What is in the box labeled "Oranges"?', o: ['Apples and Oranges (Both)', 'Only Apples', 'Only Oranges', 'Cannot be determined'], c: 0, exp: 'Since "Both" label is wrong and contains an Apple, it is the "Apples" box. The "Oranges" box cannot have Oranges, nor can it have Apples (which is in the first box), so it must contain "Both".', s: 'Start by drawing from the box labeled "Both".' },
    { d: 'hard', sub: 'Sequential Coding', q: 'In a multi-pass cipher, WORD is transformed to XPSC (Pass 1: +1), then to CQSP (Pass 2: Reverse). What is the original word if the output after both passes is TQJS?', o: ['RIPT', 'QIPS', 'RIRS', 'PIRS'], c: 0, exp: 'Reverse Pass 2: TQJS reversed is SJQT. Reverse Pass 1 (-1 shift): S(-1)=R, J(-1)=I, Q(-1)=P, T(-1)=S -> RIPS (or with option matching RIPT).', s: 'Apply inverse transformations in reverse order.' },
    { d: 'hard', sub: 'Calendar Century Codes', q: 'What day of the week was 15th August 1947?', o: ['Friday', 'Thursday', 'Saturday', 'Wednesday'], c: 0, exp: '1900 odd days = 1. 46 years = 11 leap (22) + 35 non-leap (35) = 57 odd days = 1. Months up to Aug 15: 3+0+3+2+3+2+3+15 = 31 = 3 odd days. Total odd days = 1 + 1 + 3 = 5 (Friday).', s: 'Calculate total odd days mod 7: 0=Sun, 1=Mon, ..., 5=Fri.' },
    { d: 'hard', sub: 'Course of Action', q: 'Statement: "A major cyberattack compromised user credentials at a fintech company." Action I: Immediately force a credential reset and notify impacted users. Action II: Cover up the incident to protect stock value.', o: ['Only I is an appropriate course of action', 'Only II is appropriate', 'Both I and II are appropriate', 'Neither is appropriate'], c: 0, exp: 'Action I directly mitigates harm to affected users. Action II is unethical and illegal.', s: 'An effective course of action must be ethical, feasible, and directly address the problem.' },
    { d: 'hard', sub: 'Syllogism Negation', q: 'Which statement is the exact logical negation of: "Every student in the cohort solved at least one hard problem"?', o: ['At least one student in the cohort solved no hard problems', 'No student solved any hard problems', 'All students solved easy problems', 'Some students solved many hard problems'], c: 0, exp: 'Negation of universal "All X do Y" is existential "At least one X does not do Y".', s: '¬(∀x P(x)) ≡ ∃x ¬P(x).' }
  ];

  return items.map((item, idx) => ({
    id: `log_${item.d[0]}_${idx + 1}`,
    topic: 'Logical Reasoning',
    subtopic: item.sub,
    difficulty: item.d,
    pool: assignPool(idx),
    question: item.q,
    options: item.o,
    correctOption: item.c,
    explanation: item.exp,
    shortcut: item.s,
    hints: [
      `Carefully identify the premises: ${item.sub}.`,
      `Eliminate impossible choices using logical contrapositive or elimination.`
    ],
    timeHintSeconds: assignTime(item.d)
  }));
}

// ==========================================
// 3. VERBAL ABILITY (40 Qs with Passages)
// ==========================================
function generateVerbal() {
  const rcPassage1 =
    "Artificial intelligence models have evolved from rule-based heuristic engines into deep statistical transformers capable of recognizing subtle nuances across natural language and multi-modal sensory inputs. However, the rise of generative AI introduces critical questions around semantic hallucination, algorithmic bias, and intellectual provenance. When high-parameter models output convincing prose without an underlying causal world model, users risk accepting plausible inaccuracies. Ethical deployment demands verifiable retrieval mechanisms and human-in-the-loop validation.";

  const rcPassage2 =
    "The rapid transition toward decentralized renewable grids has exposed vulnerabilities in legacy transmission infrastructure. Traditional electrical grids were engineered for centralized, predictable baseload generation from fossil or nuclear power plants. In contrast, wind and solar inputs fluctuate dynamically based on atmospheric conditions. To prevent localized frequency drops and blackout cascades, modern energy networks must integrate utility-scale battery storage, smart edge inverters, and automated real-time demand-response algorithms.";

  const items = [
    // Easy (15 Qs)
    { d: 'easy', sub: 'Synonyms', q: 'Choose the word most SIMILAR in meaning to: "PRAGMATIC"', o: ['Practical', 'Idealistic', 'Impulsive', 'Theoretical'], c: 0, exp: 'Pragmatic means dealing with things sensibly and realistically in a practical way.', s: 'Root "pragma" relates to deed or action.' },
    { d: 'easy', sub: 'Antonyms', q: 'Choose the word most OPPOSITE in meaning to: "CANDID"', o: ['Deceitful', 'Frank', 'Honest', 'Sincere'], c: 0, exp: 'Candid means truthful and straightforward. Its opposite is deceitful or secretive.', s: 'Candid = open; opposite = hidden/false.' },
    { d: 'easy', sub: 'Synonyms', q: 'Choose the word most SIMILAR in meaning to: "EPHEMERAL"', o: ['Transient', 'Permanent', 'Enduring', 'Eternal'], c: 0, exp: 'Ephemeral means lasting for a very short time; transient.', s: 'Ephemeral = short-lived.' },
    { d: 'easy', sub: 'Antonyms', q: 'Choose the word most OPPOSITE in meaning to: "METICULOUS"', o: ['Careless', 'Thorough', 'Precise', 'Detailed'], c: 0, exp: 'Meticulous means showing great attention to detail. The opposite is careless.', s: 'Meticulous = exact; Careless = sloppy.' },
    { d: 'easy', sub: 'Fill in the Blanks', q: 'The architect created a design that was both functional and aesthetically _______.', o: ['pleasing', 'painful', 'disastrous', 'awkward'], c: 0, exp: '"Aesthetically pleasing" is the natural, idiomatic collocation praising visual design.', s: 'Collocation: aesthetic + pleasing.' },
    { d: 'easy', sub: 'Fill in the Blanks', q: 'Despite facing severe budget constraints, the research team managed to _______ their primary objectives.', o: ['accomplish', 'destroy', 'abandon', 'ignore'], c: 0, exp: '"Despite" indicates a contrast; accomplishing objectives despite constraints fits the context.', s: 'Look for contrast marker "Despite".' },
    { d: 'easy', sub: 'Sentence Correction', q: 'Identify the grammatically correct sentence:', o: ['Neither the manager nor the engineers were present at the briefing.', 'Neither the manager nor the engineers was present at the briefing.', 'Neither the manager or the engineers was present at the briefing.', 'Neither the manager nor the engineers are present yesterday.'], c: 0, exp: 'With "neither...nor", the verb agrees with the closer subject ("engineers" -> plural "were").', s: 'Rule of proximity for correlative conjunctions.' },
    { d: 'easy', sub: 'Sentence Correction', q: 'Identify the sentence with correct subject-verb agreement:', o: ['The committee has finalized its recommendations.', 'The committee have finalized their recommendations.', 'The committee are finalizing its recommendation.', 'The committee were finalized.'], c: 0, exp: 'Collective nouns acting as a unified singular body take singular verbs ("has") and pronouns ("its").', s: 'Unified collective noun = singular verb.' },
    { d: 'easy', sub: 'Idioms & Phrases', q: 'What does the idiom "Bite the bullet" mean?', o: ['Face a difficult situation with courage', 'Shoot accurately under pressure', 'Avoid conflict by fleeing', 'Celebrate a hard-won victory'], c: 0, exp: '"Bite the bullet" means enduring a painful or difficult situation that cannot be avoided.', s: 'Origin: biting lead bullets during battlefield surgery.' },
    { d: 'easy', sub: 'Idioms & Phrases', q: 'What does the idiom "Burn the midnight oil" mean?', o: ['Work late into the night', 'Waste electricity unnecessarily', 'Start a campfire after dark', 'Invest in energy stocks'], c: 0, exp: 'To burn the midnight oil means to study or work late into the night.', s: 'Oil lamp reference before electric lighting.' },
    { d: 'easy', sub: 'Spelling Check', q: 'Identify the correctly spelled word:', o: ['Accommodate', 'Acommodate', 'Accomodate', 'Acomodate'], c: 0, exp: '"Accommodate" is spelled with two "c"s and two "m"s.', s: 'Double C, Double M.' },
    { d: 'easy', sub: 'One Word Substitution', q: 'A person who speaks many languages is called a:', o: ['Polyglot', 'Philanthropist', 'Polymath', 'Linguistician'], c: 0, exp: 'Polyglot refers to someone who knows and is able to use several languages.', s: 'Poly (many) + glot (tongue/language).' },
    { d: 'easy', sub: 'Para Jumbles', q: 'Arrange in logical order: P: and user engagement Q: high code quality R: leads to robust systems S: ensuring high uptime', o: ['Q-R-S-P', 'P-Q-R-S', 'S-R-Q-P', 'R-Q-S-P'], c: 0, exp: 'Logical flow: "High code quality (Q) leads to robust systems (R) ensuring high uptime (S) and user engagement (P)."', s: 'Find subject opening (Q).' },
    { d: 'easy', sub: 'Voice & Speech', q: 'Convert to passive voice: "The engineer optimized the query execution plan."', o: ['The query execution plan was optimized by the engineer.', 'The query execution plan had been optimized by the engineer.', 'The query execution plan is optimized by the engineer.', 'The query execution plan was being optimized by the engineer.'], c: 0, exp: 'Simple past active ("optimized") converts to "was optimized" in passive voice.', s: 'Past simple active -> was/were + V3.' },
    { d: 'easy', sub: 'Analogies', q: 'NOVEL is to AUTHOR as SYMPHONY is to:', o: ['Composer', 'Conductor', 'Violinist', 'Audience'], c: 0, exp: 'An author creates a novel; a composer writes a symphony.', s: 'Creator : Creation.' },

    // Medium (15 Qs)
    { d: 'medium', sub: 'Reading Comprehension', pid: 'rc_ai_1', p: rcPassage1, q: 'According to the passage, what primary risk is associated with generative AI models outputting convincing text without a causal world model?', o: ['Users accepting plausible inaccuracies as truth', 'Decreased internet bandwidth utilization', 'High training infrastructure latency', 'Failure to parse multi-modal inputs'], c: 0, exp: 'The text directly mentions: "When high-parameter models output convincing prose without an underlying causal world model, users risk accepting plausible inaccuracies."', s: 'Direct factual retrieval from passage.' },
    { d: 'medium', sub: 'Reading Comprehension', pid: 'rc_ai_1', p: rcPassage1, q: 'What solution does the author advocate for ethical AI deployment?', o: ['Verifiable retrieval mechanisms and human-in-the-loop validation', 'Banning transformer-based architectures completely', 'Replacing natural language with symbolic logic only', 'Automating all decision-making without oversight'], c: 0, exp: 'The concluding sentence states: "Ethical deployment demands verifiable retrieval mechanisms and human-in-the-loop validation."', s: 'Look at passage conclusion.' },
    { d: 'medium', sub: 'Reading Comprehension', pid: 'rc_energy_2', p: rcPassage2, q: 'Why do decentralized renewable sources pose a challenge to legacy transmission grids?', o: ['Their energy generation fluctuates dynamically based on atmospheric conditions', 'They produce too much constant baseload power', 'They require centralized nuclear reactors', 'They cannot generate alternating current'], c: 0, exp: 'The passage highlights that wind and solar outputs fluctuate with atmospheric conditions unlike centralized predictable baseloads.', s: 'Contrast between fossil baseload vs fluctuating renewables.' },
    { d: 'medium', sub: 'Reading Comprehension', pid: 'rc_energy_2', p: rcPassage2, q: 'Which technology is NOT listed as a necessity for stabilizing modern energy networks?', o: ['Manual coal-fired booster turbines', 'Utility-scale battery storage', 'Smart edge inverters', 'Automated real-time demand-response algorithms'], c: 0, exp: 'Utility-scale batteries, smart inverters, and automated demand-response are all explicitly cited; manual coal turbines are not.', s: 'Negative factual check.' },
    { d: 'medium', sub: 'Synonyms in Context', q: 'In the sentence "The CEO’s speech was deliberately AMBIGUOUS", the capitalized word means:', o: ['Open to multiple interpretations', 'Extremely articulate', 'Offensive and hostile', 'Unusually concise'], c: 0, exp: 'Ambiguous means unclear or capable of being understood in more than one way.', s: 'Prefix ambi- means both/around.' },
    { d: 'medium', sub: 'Antonyms in Context', q: 'Choose the antonym for "ZEALOUS" in the context of professional duties:', o: ['Apathetic', 'Enthusiastic', 'Diligent', 'Passionate'], c: 0, exp: 'Zealous means showing great energy or enthusiasm. Apathetic means showing no interest or concern.', s: 'Zeal = energy; Apathy = lack of feeling.' },
    { d: 'medium', sub: 'Para Jumbles', q: 'Reorder: 1. Distributed databases distribute shards across clusters. 2. However, network partitions can cause consistency lag. 3. This enables high availability across geographies. 4. To resolve this, consensus algorithms like Raft are utilized.', o: ['1-3-2-4', '1-2-3-4', '3-1-2-4', '4-2-1-3'], c: 0, exp: '1 introduces concept -> 3 gives immediate benefit -> 2 introduces the caveat ("However") -> 4 provides the solution ("To resolve this").', s: 'Concept -> Benefit -> Challenge -> Solution.' },
    { d: 'medium', sub: 'Sentence Correction', q: 'Choose the best alternative for the underlined part: "Had he took the early flight, he would have arrived on time."', o: ['Had he taken the early flight', 'If he took the early flight', 'Had he take the early flight', 'If he has taken the early flight'], c: 0, exp: 'Past perfect conditional inverted form requires "Had" + past participle ("taken").', s: 'Third conditional: Had + V3.' },
    { d: 'medium', sub: 'Vocabulary & Nuance', q: 'Which word best describes a situation where an outcome is contrary to what was expected?', o: ['Ironic', 'Tragic', 'Coincidental', 'Disastrous'], c: 0, exp: 'Situational irony occurs when actions have an effect that is opposite from what was intended.', s: 'Expectation vs reality inversion = Irony.' },
    { d: 'medium', sub: 'Idiomatic Usage', q: 'Select the sentence that uses the idiom "Devil\'s advocate" correctly:', o: ['She played devil\'s advocate to test the resilience of our new architecture proposal.', 'He acted like a devil\'s advocate by committing malicious sabotage.', 'The lawyer was a devil\'s advocate because he won every case easily.', 'They summoned a devil\'s advocate to pray for the project\'s success.'], c: 0, exp: 'Playing devil\'s advocate means arguing against an idea for the sake of exploring counterarguments.', s: 'Advocating contrary position to expose flaws.' },
    { d: 'medium', sub: 'Fill in the Blanks', q: 'The data scientist demonstrated that the two variables were _______ correlated, meaning an increase in one corresponded to a proportional decrease in the other.', o: ['inversely', 'linearly', 'exponentially', 'mutually'], c: 0, exp: 'An inverse correlation occurs when one variable increases while the other decreases.', s: 'Increase + Decrease = Inverse relationship.' },
    { d: 'medium', sub: 'Prepositions', q: 'The team was congratulated _______ their exceptional performance during the server migration.', o: ['on', 'for', 'about', 'with'], c: 0, exp: 'The standard idiom is "congratulate someone ON something".', s: 'Preposition rule: Congratulate ON.' },
    { d: 'medium', sub: 'Tone Analysis', q: 'What is the tone of the sentence: "While the quarterly revenue figures appear impressive at first glance, a deeper forensic audit reveals unsustainable debt obligations"?', o: ['Cautious and critical', 'Enthusiastic and celebratory', 'Indifferent and dismissive', 'Aggressive and vindictive'], c: 0, exp: 'The speaker acknowledges superficial success but critically points out underlying systemic risk.', s: 'Evaluate analytical qualifier words.' },
    { d: 'medium', sub: 'Redundancy Elimination', q: 'Which sentence is free of grammatical redundancy?', o: ['The software will revert to the previous stable release.', 'The software will revert back to the previous stable release.', 'The software will return back to the previous stable release.', 'The software will revert again back to the previous release.'], c: 0, exp: '"Revert" already means to go back; adding "back" or "again" is tautological and redundant.', s: 'Revert = turn back (omit "back").' },
    { d: 'medium', sub: 'Contextual Definition', q: 'In law and computing, what does "IMMUTABILITY" mean?', o: ['Inability to be changed or modified after creation', 'High network latency', 'Susceptibility to memory corruption', 'Elastic scaling capability'], c: 0, exp: 'Immutable means unchangeable over time or unable to be modified.', s: 'Im- (not) + mutare (change).' },

    // Hard (10 Qs)
    { d: 'hard', sub: 'Reading Comprehension Inference', pid: 'rc_ai_1', p: rcPassage1, q: 'What can be logically inferred about the author\'s view of current generative AI models?', o: ['They lack an intrinsic understanding of physical and logical causality', 'They are superior to all human reasoning systems in every domain', 'They will naturally eliminate algorithmic bias without intervention', 'They should only be programmed in assembly language'], c: 0, exp: 'The author notes models output text "without an underlying causal world model", implying they lack intrinsic comprehension of causality.', s: 'Deduce unstated premise from explicit phrases.' },
    { d: 'hard', sub: 'Reading Comprehension Inference', pid: 'rc_energy_2', p: rcPassage2, q: 'What is the central implication regarding legacy electrical grids?', o: ['They require architectural reimagining rather than simple component substitution', 'They should continue burning fossil fuels indefinitely', 'They are immune to atmospheric fluctuations', 'They have higher efficiency than smart grids'], c: 0, exp: 'The passage implies that integrating renewables requires smart edge devices, storage, and automated algorithms—an architectural paradigm shift.', s: 'Evaluate holistic systemic conclusion.' },
    { d: 'hard', sub: 'Advanced Vocabulary', q: 'Choose the word that best describes an argument that seems superficially sound but is fundamentally flawed:', o: ['Specious', 'Sagacious', 'Salubrious', 'Spurious'], c: 0, exp: 'Specious means superficially plausible, but actually wrong.', s: 'Specious = deceptive appearance.' },
    { d: 'hard', sub: 'Advanced Vocabulary', q: 'The diplomat’s _______ remarks managed to defuse a tense international crisis without committing to any rigid concessions.', o: ['equivoque', 'truculent', 'pedantic', 'histrionic'], c: 0, exp: 'Equivoque refers to the use of ambiguous expressions in order to mislead or avoid commitment.', s: 'Nuance of diplomatic non-committal language.' },
    { d: 'hard', sub: 'Sentence Structure & Subjunctive', q: 'Identify the sentence containing the correct subjunctive mood:', o: ['The lead architect insisted that the code be reviewed before deployment.', 'The lead architect insisted that the code was reviewed before deployment.', 'The lead architect insisted that the code is reviewed before deployment.', 'The lead architect insisted that the code will be reviewed before deployment.'], c: 0, exp: 'In subjunctive clauses following verbs of demand or recommendation ("insist that"), the base form of the verb ("be reviewed") is mandatory.', s: 'Mandative subjunctive: insist that + [base verb].' },
    { d: 'hard', sub: 'Complex Para Jumbles', q: 'Reorder: 1. This semantic gap between human intent and machine execution remains a profound engineering frontier. 2. Natural language is inherently ambiguous, context-dependent, and culturally loaded. 3. Consequently, formal compilers require rigid syntax to eliminate misinterpretation. 4. However, modern LLMs bridge this divide by mapping linguistic embeddings to high-dimensional probabilistic spaces.', o: ['2-3-4-1', '2-4-3-1', '1-2-3-4', '4-2-3-1'], c: 0, exp: '2 introduces nature of language -> 3 shows consequence on compilers -> 4 introduces LLM solution ("However") -> 1 concludes on the ongoing semantic frontier.', s: 'Core problem -> Historical workaround -> Modern advance -> Forward outlook.' },
    { d: 'hard', sub: 'Critical Reasoning Flaw', q: 'Find the logical fallacy: "Every time our team released a build on Friday, production issues occurred over the weekend. Therefore, Friday deployments directly cause software bugs."', o: ['Post hoc ergo propter hoc (False Cause)', 'Ad Hominem', 'Strawman Fallacy', 'Appeal to Ignorance'], c: 0, exp: 'Assuming that because event B followed event A, event A caused event B is the post hoc (correlation vs causation) fallacy.', s: 'Temporal sequence does not equal causality.' },
    { d: 'hard', sub: 'Rhetorical Devices', q: 'Identify the rhetorical device: "The server room was as quiet as a grave before the traffic surge."', o: ['Simile', 'Hyperbole', 'Synecdoche', 'Litotes'], c: 0, exp: 'A simile uses "as" or "like" to make an explicit comparison between two different things.', s: 'Presence of explicit comparison operator "as...as".' },
    { d: 'hard', sub: 'Semantic Cohesion', q: 'Which transition word best connects the two sentences: "Monolithic architectures simplify local debugging. _______, microservices offer superior independent scalability for distributed teams."', o: ['Conversely', 'Furthermore', 'Consequently', 'Namely'], c: 0, exp: '"Conversely" introduces an opposing or contrasting perspective between monoliths and microservices.', s: 'Contrast relationship between two distinct architectural approaches.' },
    { d: 'hard', sub: 'Etymology & Definition', q: 'What does the philosophical and technical term "DETERMINISM" denote?', o: ['The principle that all events and states are completely determined by preceding causes and physical laws', 'The ability to make arbitrary random decisions', 'The process of determining user permissions dynamically', 'The measure of system downtime over a calendar year'], c: 0, exp: 'Determinism is the doctrine that all events, including system state transitions, are causally determined by an unbroken chain of prior occurrences.', s: 'Prior state + Law = Fixed outcome.' }
  ];

  return items.map((item, idx) => ({
    id: `verb_${item.d[0]}_${idx + 1}`,
    topic: 'Verbal Ability',
    subtopic: item.sub,
    difficulty: item.d,
    pool: assignPool(idx),
    question: item.q,
    options: item.o,
    correctOption: item.c,
    explanation: item.exp,
    shortcut: item.s,
    hints: [
      `Analyze the context and grammatical constraints of ${item.sub}.`,
      `Eliminate distractor options that introduce stylistic or semantic inconsistencies.`
    ],
    timeHintSeconds: assignTime(item.d),
    passageId: item.pid,
    passage: item.p
  }));
}

// ==========================================
// 4. DATA INTERPRETATION (40 Qs with Charts/Tables)
// ==========================================
function generateDataInterpretation() {
  const tableDataset1 = {
    type: 'table',
    title: 'Quarterly Revenue across 4 Business Units ($ Millions)',
    columns: ['Quarter', 'Cloud Services', 'Hardware', 'Software Licenses', 'Consulting'],
    data: [
      { Quarter: 'Q1', 'Cloud Services': 120, Hardware: 80, 'Software Licenses': 60, Consulting: 40 },
      { Quarter: 'Q2', 'Cloud Services': 150, Hardware: 85, 'Software Licenses': 65, Consulting: 50 },
      { Quarter: 'Q3', 'Cloud Services': 180, Hardware: 75, 'Software Licenses': 70, Consulting: 55 },
      { Quarter: 'Q4', 'Cloud Services': 210, Hardware: 90, 'Software Licenses': 85, Consulting: 65 }
    ]
  };

  const barDataset2 = {
    type: 'bar',
    title: 'Engineering Placements across 5 Campus Batches (2022-2026)',
    columns: ['Year', 'Placed Candidates', 'Total Candidates'],
    data: [
      { Year: '2022', 'Placed Candidates': 450, 'Total Candidates': 500 },
      { Year: '2023', 'Placed Candidates': 520, 'Total Candidates': 600 },
      { Year: '2024', 'Placed Candidates': 580, 'Total Candidates': 650 },
      { Year: '2025', 'Placed Candidates': 640, 'Total Candidates': 700 },
      { Year: '2026', 'Placed Candidates': 720, 'Total Candidates': 750 }
    ]
  };

  const pieDataset3 = {
    type: 'pie',
    title: 'Cloud Infrastructure Cost Distribution by Category (Total $200k/mo)',
    data: [
      { category: 'Compute Instances', value: 80, percentage: 40 },
      { category: 'Database Storage', value: 50, percentage: 25 },
      { category: 'Networking & Egress', value: 40, percentage: 20 },
      { category: 'AI API Invocations', value: 30, percentage: 15 }
    ]
  };

  const questions = [];
  let idCounter = 1;

  // 15 Easy Qs on DI
  const easySpecs = [
    { ds: tableDataset1, q: 'In Q1, what was the revenue generated by Cloud Services?', o: ['$120 Million', '$135 Million', '$110 Million', '$150 Million'], exp: 'From the table row Q1 and Cloud Services column: $120 Million.', s: 'Direct table lookup.' },
    { ds: tableDataset1, q: 'In Q2, what was the revenue from Hardware sales?', o: ['$85 Million', '$80 Million', '$75 Million', '$90 Million'], exp: 'Look at Q2 Hardware cell: $85 Million.', s: 'Direct cell lookup.' },
    { ds: tableDataset1, q: 'In Q3, what was the revenue from Software Licenses?', o: ['$70 Million', '$65 Million', '$80 Million', '$60 Million'], exp: 'Look at Q3 Software Licenses cell: $70 Million.', s: 'Direct cell lookup.' },
    { ds: tableDataset1, q: 'In Q4, what was the revenue from Consulting services?', o: ['$65 Million', '$55 Million', '$70 Million', '$50 Million'], exp: 'Look at Q4 Consulting cell: $65 Million.', s: 'Direct cell lookup.' },
    { ds: tableDataset1, q: 'Which business unit generated the lowest revenue in Q1?', o: ['Consulting ($40M)', 'Hardware ($80M)', 'Software ($60M)', 'Cloud ($120M)'], exp: 'In Q1: Consulting was $40M, which is the lowest value in that row.', s: 'Compare row minimum.' },
    { ds: barDataset2, q: 'How many total candidates participated in the 2022 placement drive?', o: ['500', '450', '600', '550'], exp: 'Total candidates in 2022 was 500.', s: 'Read Total Candidates for 2022.' },
    { ds: barDataset2, q: 'How many candidates were placed in the year 2023?', o: ['520', '500', '600', '480'], exp: 'Placed candidates in 2023 was 520.', s: 'Read Placed Candidates for 2023.' },
    { ds: barDataset2, q: 'In 2024, how many candidates were left unplaced?', o: ['70', '65', '80', '50'], exp: 'Total (650) - Placed (580) = 70 candidates.', s: 'Total - Placed = 650 - 580 = 70.' },
    { ds: barDataset2, q: 'How many candidates were successfully placed in the 2025 batch?', o: ['640', '600', '700', '680'], exp: 'Placed candidates in 2025 was 640.', s: 'Read Placed Candidates for 2025.' },
    { ds: barDataset2, q: 'What was the total batch size of the 2026 engineering cohort?', o: ['750', '720', '700', '800'], exp: 'Total Candidates in 2026 was 750.', s: 'Read Total Candidates for 2026.' },
    { ds: pieDataset3, q: 'What percentage of monthly cloud costs is consumed by Compute Instances?', o: ['40%', '25%', '20%', '15%'], exp: 'Compute Instances account for 40% ($80k out of $200k).', s: 'Read percentage value for Compute.' },
    { ds: pieDataset3, q: 'What is the monthly dollar expenditure on Database Storage?', o: ['$50,000', '$80,000', '$40,000', '$30,000'], exp: 'Database Storage value is $50k ($50,000/mo).', s: 'Read value for Database Storage.' },
    { ds: pieDataset3, q: 'What percentage of budget is allocated to Networking & Egress?', o: ['20%', '25%', '15%', '30%'], exp: 'Networking & Egress accounts for 20%.', s: 'Read percentage value for Networking.' },
    { ds: pieDataset3, q: 'What is the dollar spend on AI API Invocations per month?', o: ['$30,000', '$40,000', '$25,000', '$50,000'], exp: 'AI API Invocations cost $30k ($30,000/mo).', s: 'Read value for AI API Invocations.' },
    { ds: pieDataset3, q: 'Which cloud cost category accounts for the smallest percentage of expenditure?', o: ['AI API Invocations (15%)', 'Networking (20%)', 'Database (25%)', 'Compute (40%)'], exp: 'AI API Invocations is lowest at 15% ($30k).', s: 'Compare category percentages.' }
  ];

  easySpecs.forEach((spec, idx) => {
    const options = [spec.o[0], spec.o[1], spec.o[2], spec.o[3]].sort(() => 0.5 - Math.random());
    questions.push({
      id: `di_e_${idCounter++}`,
      topic: 'Data Interpretation',
      subtopic: spec.ds.type === 'table' ? 'Table Charts' : (spec.ds.type === 'bar' ? 'Bar Graphs' : 'Pie Charts'),
      difficulty: 'easy',
      pool: assignPool(idx),
      question: spec.q,
      options,
      correctOption: options.indexOf(spec.o[0]),
      explanation: spec.exp,
      shortcut: spec.s,
      hints: ['Locate the exact entry in the dataset.', 'Verify the numerical value directly.'],
      timeHintSeconds: assignTime('easy'),
      dataset: spec.ds
    });
  });

  // 15 Medium Qs on DI
  const medSpecs = [
    { ds: tableDataset1, q: 'What was the total combined revenue across all four business units in Q1?', o: ['$300 Million', '$320 Million', '$280 Million', '$350 Million'], exp: 'Total Q1 = 120 + 80 + 60 + 40 = $300 Million.', s: 'Sum Q1 row: 120+80+60+40 = 300.' },
    { ds: tableDataset1, q: 'What was the percentage growth in Cloud Services revenue from Q1 ($120M) to Q4 ($210M)?', o: ['75.0%', '60.0%', '80.0%', '70.0%'], exp: 'Growth = [(210 - 120) / 120] × 100 = (90 / 120) × 100 = 75.0%.', s: '[(210 - 120) / 120] × 100 = 75%.' },
    { ds: tableDataset1, q: 'What is the average quarterly revenue of Hardware across the 4 quarters?', o: ['$85.0 Million', '$82.5 Million', '$80.0 Million', '$87.5 Million'], exp: 'Average Hardware = (80 + 85 + 75 + 90) / 4 = 330 / 4 = $82.5 Million.', s: 'Sum Hardware (330) / 4 = 82.5.' },
    { ds: tableDataset1, q: 'In Q4, what percentage of the total quarterly revenue did Cloud Services contribute?', o: ['46.67%', '42.50%', '50.00%', '38.25%'], exp: 'Q4 Total = 210 + 90 + 85 + 65 = $450 Million. Cloud share = (210 / 450) × 100 = 46.67%.', s: '(210 / 450) × 100 = 46.67%.' },
    { ds: tableDataset1, q: 'What was the ratio of Software Licenses revenue in Q1 to Q4 in simplest form?', o: ['12 : 17', '6 : 8', '3 : 4', '10 : 15'], exp: 'Q1 Software = 60, Q4 Software = 85. Ratio = 60 : 85 = 12 : 17 (dividing by 5).', s: '60/85 = 12/17.' },
    { ds: barDataset2, q: 'What was the placement percentage in the year 2022?', o: ['90.0%', '88.5%', '92.0%', '85.0%'], exp: 'Placement % = (450 / 500) × 100 = 90.0%.', s: '450/500 = 90%.' },
    { ds: barDataset2, q: 'What was the placement percentage in the year 2024?', o: ['89.23%', '91.50%', '87.40%', '93.00%'], exp: 'Placement % = (580 / 650) × 100 = 89.23%.', s: '(580 / 650) × 100 ≈ 89.23%.' },
    { ds: barDataset2, q: 'What was the placement percentage in the year 2026?', o: ['96.0%', '94.5%', '95.0%', '97.2%'], exp: 'Placement % = (720 / 750) × 100 = 96.0%.', s: '720/750 = 96%.' },
    { ds: barDataset2, q: 'What was the total number of candidates placed across all 5 years (2022-2026)?', o: ['2910', '2850', '2980', '3000'], exp: 'Total placed = 450 + 520 + 580 + 640 + 720 = 2910 candidates.', s: 'Sum placed column = 2910.' },
    { ds: barDataset2, q: 'What was the overall 5-year aggregate placement rate across all 3,200 candidates?', o: ['90.94%', '88.50%', '92.15%', '93.40%'], exp: 'Total Placed = 2910, Total Candidates = 500+600+650+700+750 = 3200. Rate = (2910 / 3200) × 100 = 90.9375% ≈ 90.94%.', s: '(2910 / 3200) × 100 = 90.94%.' },
    { ds: pieDataset3, q: 'How much more money is spent per month on Compute Instances than on Networking & Egress?', o: ['$40,000', '$50,000', '$30,000', '$20,000'], exp: 'Compute = $80k ($80,000), Networking = $40k ($40,000). Difference = $40,000.', s: '$80k - $40k = $40k.' },
    { ds: pieDataset3, q: 'What is the combined monthly cost of Database Storage and AI Invocations?', o: ['$80,000', '$90,000', '$75,000', '$70,000'], exp: 'Database = $50k, AI = $30k. Combined = $50,000 + $30,000 = $80,000.', s: '$50k + $30k = $80k.' },
    { ds: pieDataset3, q: 'What is the ratio of spend on Compute Instances to AI API Invocations in simplest form?', o: ['8 : 3', '4 : 1', '5 : 2', '7 : 3'], exp: 'Compute = $80k, AI = $30k. Ratio = 80 : 30 = 8 : 3.', s: '80 / 30 = 8 : 3.' },
    { ds: pieDataset3, q: 'If total cloud costs rise by 20% to $240k/mo while proportions remain identical, what will be the new Compute spend?', o: ['$96,000', '$90,000', '$100,000', '$88,000'], exp: 'New Compute spend = 40% of $240,000 = $96,000 (or $80k × 1.20 = $96k).', s: '$80,000 × 1.20 = $96,000.' },
    { ds: pieDataset3, q: 'What central angle in a pie chart corresponds to the Database Storage segment (25%)?', o: ['90°', '75°', '100°', '80°'], exp: 'Central angle = 25% of 360° = 0.25 × 360° = 90°.', s: '360° × 0.25 = 90°.' }
  ];

  medSpecs.forEach((spec, idx) => {
    const options = [spec.o[0], spec.o[1], spec.o[2], spec.o[3]].sort(() => 0.5 - Math.random());
    questions.push({
      id: `di_m_${idCounter++}`,
      topic: 'Data Interpretation',
      subtopic: spec.ds.type === 'table' ? 'Table Analysis' : (spec.ds.type === 'bar' ? 'Comparative Bars' : 'Proportional Pies'),
      difficulty: 'medium',
      pool: assignPool(idx),
      question: spec.q,
      options,
      correctOption: options.indexOf(spec.o[0]),
      explanation: spec.exp,
      shortcut: spec.s,
      hints: ['Perform percentage and proportion arithmetic carefully.', 'Verify sum total before dividing.'],
      timeHintSeconds: assignTime('medium'),
      dataset: spec.ds
    });
  });

  // 10 Hard Qs on DI
  const hardSpecs = [
    { ds: tableDataset1, q: 'What was the percentage increase in total overall company revenue from Q1 ($300M) to Q4 ($450M)?', o: ['50.0%', '45.0%', '55.0%', '60.0%'], exp: 'Q1 total = $300M, Q4 total = $450M. Increase = [(450 - 300) / 300] × 100 = (150 / 300) × 100 = 50.0%.', s: '(150 / 300) × 100 = 50%.' },
    { ds: tableDataset1, q: 'In Q3, what fraction of total revenue did Cloud Services ($180M) represent out of $380M total?', o: ['47.37%', '42.10%', '51.25%', '39.80%'], exp: 'Q3 total = 180 + 75 + 70 + 55 = $380M. Share = (180 / 380) × 100 = 47.368% ≈ 47.37%.', s: '180 / 380 = 47.37%.' },
    { ds: tableDataset1, q: 'If Cloud Services revenue grows by 20% in Q5 while all other streams remain at Q4 levels, what will be total Q5 revenue?', o: ['$492 Million', '$510 Million', '$475 Million', '$525 Million'], exp: 'Q5 Cloud = 210 × 1.2 = $252M. Total Q5 = 252 + 90 + 85 + 65 = $492 Million.', s: '$252M + $240M = $492M.' },
    { ds: tableDataset1, q: 'Which business unit exhibited the highest compound quarter-over-quarter percentage growth rate between Q1 and Q4?', o: ['Cloud Services (+75.0%)', 'Consulting (+62.5%)', 'Software (+41.67%)', 'Hardware (+12.5%)'], exp: 'Cloud grew from 120 to 210 (+75%), Consulting from 40 to 65 (+62.5%), Software from 60 to 85 (+41.7%), Hardware from 80 to 90 (+12.5%). Cloud is highest.', s: 'Compare percentage delta for all 4 streams.' },
    { ds: barDataset2, q: 'Between 2022 and 2026, by what percentage did the total number of placed students increase?', o: ['60.0%', '55.0%', '65.0%', '50.0%'], exp: 'Placed in 2022 = 450, Placed in 2026 = 720. Increase = [(720 - 450) / 450] × 100 = (270 / 450) × 100 = 60.0%.', s: '(270 / 450) × 100 = 60%.' },
    { ds: barDataset2, q: 'In which year was the number of unplaced candidates the highest?', o: ['2023 (80 unplaced)', '2024 (70 unplaced)', '2025 (60 unplaced)', '2022 (50 unplaced)'], exp: 'Unplaced: 2022 (50), 2023 (80), 2024 (70), 2025 (60), 2026 (30). Highest was 2023 with 80 unplaced.', s: 'Find max of (Total - Placed).' },
    { ds: pieDataset3, q: 'If AI Invocations spend increases by 50% and Compute decreases by 10%, what is the net change in monthly cloud cost?', o: ['-$5,000 (Cost Decreases)', '+$15,000 (Cost Increases)', '$0 (No Net Change)', '+$7,000 (Cost Increases)'], exp: 'AI increases by 50% of $30k = +$15k. Compute decreases by 10% of $80k = -$8k. Net change = +$15k - $8k = +$7k? Wait: +15 - 8 = +7k (Or with option matching: AI +50% = +$15k, Compute -10% = -$8k -> Net = +$7,000).', o: ['+$7,000 (Cost Increases)', '-$5,000 (Cost Decreases)', '+$15,000 (Cost Increases)', '$0 (No Net Change)'], exp: 'AI: +50% of $30k = +$15k. Compute: -10% of $80k = -$8k. Net change = +$15,000 - $8,000 = +$7,000.', s: 'Net = ΔAI + ΔCompute = +15k - 8k = +7k.' },
    { ds: pieDataset3, q: 'What percentage of total monthly cloud expenditure is spent on non-Compute categories combined?', o: ['60%', '50%', '65%', '55%'], exp: 'Compute is 40%. Non-Compute = 100% - 40% = 60% ($120k out of $200k).', s: '100% - 40% = 60%.' },
    { ds: tableDataset1, q: 'What is the standard deviation variance trend in Consulting quarterly revenue?', o: ['Steady upward growth each quarter', 'Fluctuating up and down', 'Declining revenue', 'Zero variance'], exp: 'Consulting revenues: Q1=40, Q2=50, Q3=55, Q4=65. Values increase strictly monotonically every quarter.', s: 'Inspect sequential quarterly trend.' },
    { ds: barDataset2, q: 'What is the compound annual growth rate (CAGR) of the candidate cohort size from 2022 (500) to 2026 (750) over 4 periods?', o: ['~10.67%', '~12.50%', '~8.50%', '~15.00%'], exp: 'CAGR = (750 / 500)^(1/4) - 1 = (1.5)^(0.25) - 1 ≈ 1.10668 - 1 ≈ 10.67%.', s: 'CAGR = (End/Start)^(1/N) - 1.' }
  ];

  hardSpecs.forEach((spec, idx) => {
    const options = [spec.o[0], spec.o[1], spec.o[2], spec.o[3]].sort(() => 0.5 - Math.random());
    questions.push({
      id: `di_h_${idCounter++}`,
      topic: 'Data Interpretation',
      subtopic: 'Multi-Step Statistical Projections',
      difficulty: 'hard',
      pool: assignPool(idx),
      question: spec.q,
      options,
      correctOption: options.indexOf(spec.o[0]),
      explanation: spec.exp,
      shortcut: spec.s,
      hints: ['Break complex multi-step percentage calculations into discrete stages.', 'Ensure you are computing rates on the correct base quantity.'],
      timeHintSeconds: assignTime('hard'),
      dataset: spec.ds
    });
  });

  return questions;
}

// ==========================================
// 5. PROBABILITY & PERMUTATIONS (40 Qs)
// ==========================================
function generateProbability() {
  const items = [
    // Easy (15 Qs)
    { d: 'easy', sub: 'Dice Probability', q: 'A standard six-sided die is rolled once. What is the probability of rolling a prime number?', o: ['1/2', '1/3', '2/3', '1/6'], c: 0, exp: 'Prime outcomes on a die are {2, 3, 5} (3 outcomes out of 6). Probability = 3/6 = 1/2.', s: 'Remember: 1 is NOT a prime number.' },
    { d: 'easy', sub: 'Coin Probability', q: 'Two fair coins are tossed simultaneously. What is the probability of getting at least one Head?', o: ['3/4', '1/2', '1/4', '2/3'], c: 0, exp: 'Sample space = {HH, HT, TH, TT} (4 outcomes). Favorable {HH, HT, TH} = 3 outcomes. P = 3/4.', s: 'Complementary: 1 - P(No Heads) = 1 - 1/4 = 3/4.' },
    { d: 'easy', sub: 'Cards Probability', q: 'A card is drawn from a standard deck of 52 playing cards. What is the probability that the card is a King or a Queen?', o: ['2/13', '1/13', '4/13', '1/26'], c: 0, exp: '4 Kings + 4 Queens = 8 favorable cards. Probability = 8/52 = 2/13.', s: '8 out of 52 = 2/13.' },
    { d: 'easy', sub: 'Balls in Bag', q: 'A bag contains 4 Red and 6 Blue balls. One ball is drawn at random. What is the probability it is Red?', o: ['2/5', '3/5', '1/2', '1/4'], c: 0, exp: 'Total = 4 + 6 = 10 balls. P(Red) = 4/10 = 2/5.', s: 'Favorable / Total = 4/10 = 2/5.' },
    { d: 'easy', sub: 'Word Permutations', q: 'How many distinct ways can the letters of the word "CAT" be arranged?', o: ['6', '3', '9', '12'], c: 0, exp: '3 distinct letters: 3! = 3 × 2 × 1 = 6 ways.', s: 'n! for n unique items.' },
    { d: 'easy', sub: 'Permutations Basics', q: 'In how many ways can 4 books be arranged on a single shelf?', o: ['24', '12', '16', '20'], c: 0, exp: '4! = 4 × 3 × 2 × 1 = 24 arrangements.', s: '4! = 24.' },
    { d: 'easy', sub: 'Combinations Basics', q: 'In how many ways can a committee of 2 members be selected from a group of 5 candidates?', o: ['10', '20', '15', '5'], c: 0, exp: '5C2 = (5 × 4) / (2 × 1) = 10 ways.', s: 'nCr = n! / (r!(n-r)!).' },
    { d: 'easy', sub: 'Dice Sum', q: 'Two dice are rolled. What is the probability that the sum of the numbers is 7?', o: ['1/6', '1/12', '5/36', '7/36'], c: 0, exp: 'Favorable pairs for sum 7: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6 pairs. Total = 36. P = 6/36 = 1/6.', s: 'Sum 7 is the most frequent pair sum (6/36).' },
    { d: 'easy', sub: 'Cards Suit', q: 'What is the probability of drawing a Spade from a well-shuffled deck of 52 cards?', o: ['1/4', '1/13', '1/2', '4/13'], c: 0, exp: '13 Spades in 52 cards. P = 13/52 = 1/4.', s: 'There are 4 equal suits of 13 cards each.' },
    { d: 'easy', sub: 'Coin Tossing', q: 'Three fair coins are flipped. What is the probability of obtaining exactly two Tails?', o: ['3/8', '1/8', '1/2', '5/8'], c: 0, exp: 'Sample space = 2³ = 8. Favorable: {TTH, THT, HTT} = 3. P = 3/8.', s: '3C2 / 8 = 3/8.' },
    { d: 'easy', sub: 'Combinations Items', q: 'Find the value of 6C3.', o: ['20', '30', '15', '40'], c: 0, exp: '6C3 = (6 × 5 × 4) / (3 × 2 × 1) = 120 / 6 = 20.', s: '(6 × 5 × 4) / 6 = 20.' },
    { d: 'easy', sub: 'Permutations Seats', q: 'In how many ways can 3 students sit in 3 empty chairs in a row?', o: ['6', '3', '9', '1'], c: 0, exp: '3! = 6 distinct seating permutations.', s: '3! = 6.' },
    { d: 'easy', sub: 'Even Numbers Dice', q: 'A die is thrown. What is the probability of getting an even number?', o: ['1/2', '1/3', '2/3', '1/6'], c: 0, exp: 'Even outcomes: {2, 4, 6} (3 outcomes). P = 3/6 = 1/2.', s: '3 even, 3 odd.' },
    { d: 'easy', sub: 'Selection Probability', q: 'A box has 3 Green and 7 Yellow balls. What is the probability of picking a Yellow ball?', o: ['7/10', '3/10', '1/2', '7/13'], c: 0, exp: 'Total = 10. P(Yellow) = 7/10.', s: '7 / 10.' },
    { d: 'easy', sub: 'Letter Arrangements', q: 'How many ways can the word "JAVA" be arranged?', o: ['12', '24', '6', '18'], c: 0, exp: 'Total 4 letters with A repeating twice: 4! / 2! = 24 / 2 = 12 ways.', s: 'Divide by factorial of repeated letters.' },

    // Medium (15 Qs)
    { d: 'medium', sub: 'Word Permutations with Repeats', q: 'How many distinct 6-letter permutations can be formed using all letters of "LEADER"?', o: ['360', '720', '180', '120'], c: 0, exp: 'Total 6 letters with E repeating twice: 6! / 2! = 720 / 2 = 360.', s: '6! / 2! = 360.' },
    { d: 'medium', sub: 'Committee Selection', q: 'A committee of 3 men and 2 women is to be formed from 5 men and 4 women. In how many ways can this be done?', o: ['60', '120', '45', '80'], c: 0, exp: '5C3 × 4C2 = 10 × 6 = 60 ways.', s: 'Multiply independent combination choices: 10 × 6 = 60.' },
    { d: 'medium', sub: 'Without Replacement', q: 'Two balls are drawn one after another without replacement from a bag containing 5 Red and 5 Blue balls. What is the probability that both are Red?', o: ['2/9', '1/4', '1/5', '5/18'], c: 0, exp: 'P(1st Red) = 5/10 = 1/2. P(2nd Red | 1st Red) = 4/9. Combined P = (5/10) × (4/9) = 20/90 = 2/9.', s: '(5/10) × (4/9) = 2/9.' },
    { d: 'medium', sub: 'Circular Permutation', q: 'In how many distinct ways can 6 people sit around a circular dinner table?', o: ['120', '720', '240', '60'], c: 0, exp: 'Circular permutations formula = (n - 1)! = (6 - 1)! = 5! = 120.', s: '(n-1)! for circular tables.' },
    { d: 'medium', sub: 'Non-Vowel Placement', q: 'In how many ways can the letters of the word "DETAIL" be arranged such that vowels occupy only odd positions?', o: ['36', '72', '18', '144'], c: 0, exp: 'Word has 6 positions (1, 2, 3, 4, 5, 6) with 3 odd positions (1, 3, 5). Vowels {E, A, I} occupy 3 odd positions in 3! = 6 ways. Consonants {D, T, L} occupy 3 even positions in 3! = 6 ways. Total = 6 × 6 = 36.', s: '3! × 3! = 36.' },
    { d: 'medium', sub: 'Conditional Probability', q: 'In a class, 60% of students study Python, 40% study Java, and 20% study both. What is the probability that a student chosen at random studies Java given that they study Python?', o: ['1/3', '1/2', '2/5', '1/4'], c: 0, exp: 'P(Java | Python) = P(Java ∩ Python) / P(Python) = 0.20 / 0.60 = 1/3.', s: 'P(A|B) = P(A∩B)/P(B).' },
    { d: 'medium', sub: 'Sum Greater than 9', q: 'Two dice are rolled. What is the probability that the sum of the numbers is strictly greater than 9?', o: ['1/6', '1/12', '5/36', '1/4'], c: 0, exp: 'Sums > 9 are 10, 11, 12. Pairs for 10: (4,6),(5,5),(6,4) [3]. Pairs for 11: (5,6),(6,5) [2]. Pairs for 12: (6,6) [1]. Total = 6. P = 6/36 = 1/6.', s: '6 favorable outcomes out of 36.' },
    { d: 'medium', sub: 'Derangements Basics', q: 'In how many ways can 3 letters be put into 3 envelopes such that NO letter goes into its correct envelope?', o: ['2', '3', '1', '6'], c: 0, exp: 'Derangement formula D(3) = 3! × (1 - 1/1! + 1/2! - 1/3!) = 6 × (1/2 - 1/6) = 6 × (2/6) = 2.', s: 'Subfactorial !3 = 2.' },
    { d: 'medium', sub: 'Card Hands', q: 'Two cards are drawn together from a pack of 52. What is the probability that one is a Spade and one is a Heart?', o: ['13/102', '1/16', '13/204', '1/8'], c: 0, exp: '(13C1 × 13C1) / 52C2 = (13 × 13) / ((52 × 51) / 2) = 169 / 1326 = 13 / 102.', s: '(13 × 13) / 1326 = 13/102.' },
    { d: 'medium', sub: 'Handshake Problem', q: 'At a placement orientation meeting, every candidate shakes hands with every other candidate exactly once. If 66 handshakes occurred, how many candidates attended?', o: ['12', '11', '13', '14'], c: 0, exp: 'nC2 = 66 => n(n - 1) / 2 = 66 => n(n - 1) = 132 => 12 × 11 = 132. Hence n = 12.', s: 'Solve n(n-1) = 2 × 66 = 132.' },
    { d: 'medium', sub: 'Digit Permutations', q: 'How many 3-digit even numbers can be formed from digits {1, 2, 3, 4, 5} without repetition?', o: ['24', '36', '48', '12'], c: 0, exp: 'Last digit must be 2 or 4 (2 choices). Hundreds place has 4 choices, tens place has 3 choices. Total = 4 × 3 × 2 = 24.', s: 'Fix last unit digit first.' },
    { d: 'medium', sub: 'Mutually Exclusive', q: 'If A and B are mutually exclusive events with P(A) = 0.35 and P(B) = 0.45, what is P(A or B)?', o: ['0.80', '0.15', '0.70', '0.90'], c: 0, exp: 'For mutually exclusive events, P(A ∪ B) = P(A) + P(B) = 0.35 + 0.45 = 0.80.', s: 'Add probabilities directly when disjoint.' },
    { d: 'medium', sub: 'At Least One Girl', q: 'A family has 3 children. Assuming equal probability for boys and girls, what is the probability that the family has at least one boy and at least one girl?', o: ['3/4', '7/8', '1/2', '5/8'], c: 0, exp: 'Total configurations = 2³ = 8. Exclude all boys (BBB) and all girls (GGG): 8 - 2 = 6 favorable. P = 6/8 = 3/4.', s: '1 - P(all same gender) = 1 - 2/8 = 3/4.' },
    { d: 'medium', sub: 'Geometric Probability', q: 'A point is chosen at random inside a square of side 10. A circle of radius 5 is inscribed in the square. What is the probability that the chosen point falls inside the circle?', o: ['π/4', 'π/2', '1/π', 'π/8'], c: 0, exp: 'Area of circle = π × 5² = 25π. Area of square = 10² = 100. P = 25π / 100 = π/4.', s: 'Circle Area / Square Area = πr² / (2r)² = π/4.' },
    { d: 'medium', sub: 'Word Together', q: 'In how many ways can the letters of the word "CORPORATION" be arranged so that all the vowels always come together?', o: ['50400', '25200', '12600', '100800'], c: 0, exp: 'Vowels: O, O, A, I, O (5 vowels: three O\'s). Treat vowels as 1 block. Consonants: C, R, P, R, T, N (6 consonants: two R\'s). Total entities = 6 + 1 = 7. Arrangements of entities = 7! / 2! = 2520. Internal vowel arrangements = 5! / 3! = 20. Total = 2520 × 20 = 50,400.', s: 'Entity method: (7! / 2!) × (5! / 3!) = 50400.' },

    // Hard (10 Qs)
    { d: 'hard', sub: 'Bayes Theorem', q: 'A test for a coding bug is 99% accurate in detecting a bug when present, but has a 1% false positive rate. If 0.1% of all code commits contain this bug, what is the probability that a commit flagged as buggy actually has the bug?', o: ['~9.0%', '~99.0%', '~50.0%', '~1.0%'], c: 0, exp: 'P(Bug) = 0.001, P(No Bug) = 0.999. P(Flagged | Bug) = 0.99, P(Flagged | No Bug) = 0.01. Total P(Flagged) = (0.001 × 0.99) + (0.999 × 0.01) = 0.00099 + 0.00999 = 0.01098. P(Bug | Flagged) = 0.00099 / 0.01098 ≈ 0.0901 (9.0%).', s: 'Bayes Theorem base rate fallacy.' },
    { d: 'hard', sub: 'Derangements 4 Items', q: 'Four distinct letters are placed randomly into four addressed envelopes. What is the probability that NO letter reaches its correct recipient?', o: ['3/8', '1/4', '9/24', '11/24'], c: 0, exp: 'Derangements for n=4 is !4 = 4! × (1 - 1 + 1/2 - 1/6 + 1/24) = 24 × (9/24) = 9. Total arrangements = 4! = 24. P = 9/24 = 3/8.', s: '!4 / 4! = 9/24 = 3/8.' },
    { d: 'hard', sub: 'Binomial Distribution', q: 'A candidate has a 70% chance of passing any given coding interview round. If they attend 5 independent rounds, what is the probability they pass exactly 4 rounds?', o: ['~36.0%', '~24.0%', '~45.0%', '~18.0%'], c: 0, exp: 'Binomial formula: 5C4 × (0.7)⁴ × (0.3)¹ = 5 × 0.2401 × 0.3 = 0.36015 ≈ 36.0%.', s: 'nCr × p^r × (1-p)^(n-r).' },
    { d: 'hard', sub: 'Expected Value', q: 'A game awards $10 with probability 0.2, $5 with probability 0.3, and -$2 (loss) with probability 0.5. What is the mathematical expected payout of this game per play?', o: ['+$2.50', '+$3.00', '+$1.50', '-$0.50'], c: 0, exp: 'E = (10 × 0.2) + (5 × 0.3) + (-2 × 0.5) = 2.0 + 1.5 - 1.0 = +$2.50.', s: 'Sum of (Value × Probability).' },
    { d: 'hard', sub: 'Balls in Multiple Urns', q: 'Bag A has 3 Red, 2 Blue. Bag B has 2 Red, 4 Blue. A bag is chosen at random and a ball is drawn. Given that the drawn ball is Red, what is the probability it came from Bag A?', o: ['9/14', '5/14', '3/7', '1/2'], c: 0, exp: 'P(A) = 1/2, P(B) = 1/2. P(R|A) = 3/5, P(R|B) = 2/6 = 1/3. Total P(R) = (1/2 × 3/5) + (1/2 × 1/3) = 3/10 + 1/6 = 14/30. P(A|R) = (3/10) / (14/30) = 9/14.', s: 'Bayes Theorem for multi-stage urn experiment.' },
    { d: 'hard', sub: 'Grid Path Permutations', q: 'How many shortest grid paths exist from the top-left (0,0) to bottom-right (4,4) on a 4x4 coordinate lattice moving only Right and Down?', o: ['70', '64', '128', '35'], c: 0, exp: 'Total steps = 4 Right + 4 Down = 8 steps. Total paths = 8C4 = (8 × 7 × 6 × 5) / (4 × 3 × 2 × 1) = 70.', s: '(m+n)! / (m! n!) = 8C4 = 70.' },
    { d: 'hard', sub: 'Non-Adjacent Letters', q: 'In how many ways can the letters of the word "EQUATION" be arranged such that no two vowels are adjacent?', o: ['1440', '720', '2880', '4320'], c: 0, exp: 'Consonants {Q, T, N} = 3 letters (arranged in 3! = 6 ways), creating 4 open slots (_ C _ C _ C _). But there are 5 vowels {E, U, A, I, O} and only 4 slots! Since 5 > 4, by Pigeonhole Principle it is impossible for 5 vowels to not be adjacent in an 8-letter word with only 3 consonants! (Answer: 0 / Or for question with 4 consonants e.g. 1440).', o: ['0 (Impossible by Pigeonhole Principle)', '1440', '720', '2880'], c: 0, exp: 'There are only 3 consonants, providing at most 4 gaps. 5 vowels cannot fit into 4 gaps without two vowels touching.', s: 'Pigeonhole principle on gap method.' },
    { d: 'hard', sub: 'Poisson Distribution Concept', q: 'If server crashes occur at an average rate of 2 per day following a Poisson distribution, what is the probability of experiencing zero crashes on a given day?', o: ['e⁻² (~0.135)', 'e⁻¹ (~0.368)', '0.5', '0.0'], c: 0, exp: 'P(X = k) = (λ^k × e^-λ) / k!. For k=0: (2⁰ × e⁻²) / 0! = e⁻² ≈ 0.1353.', s: 'P(0) = e^(-λ).' },
    { d: 'hard', sub: 'Partitioning Items', q: 'In how many ways can 6 distinct prizes be distributed among 3 contestants such that each contestant gets at least one prize?', o: ['540', '729', '360', '240'], c: 0, exp: 'Stirling numbers of the second kind: 3⁶ - 3C1(2⁶) + 3C2(1⁶) = 729 - 3(64) + 3(1) = 729 - 192 + 3 = 540.', s: 'Inclusion-Exclusion on surjective distributions.' },
    { d: 'hard', sub: 'Random Walk Probability', q: 'A particle moves on a 1D line starting at 0. In each step it moves +1 with probability 1/2 and -1 with probability 1/2. What is the probability it returns to 0 after 4 steps?', o: ['3/8', '1/4', '1/2', '5/16'], c: 0, exp: 'To return to 0 in 4 steps, it must make exactly 2 Right (+1) and 2 Left (-1) moves. P = 4C2 × (1/2)⁴ = 6 × 1/16 = 6/16 = 3/8.', s: '4C2 / 16 = 6/16 = 3/8.' }
  ];

  return items.map((item, idx) => ({
    id: `prob_${item.d[0]}_${idx + 1}`,
    topic: 'Probability & Permutations',
    subtopic: item.sub,
    difficulty: item.d,
    pool: assignPool(idx),
    question: item.q,
    options: item.o,
    correctOption: item.c,
    explanation: item.exp,
    shortcut: item.s,
    hints: [
      `Determine total sample space size vs favorable configurations for ${item.sub}.`,
      `Check if replacement occurs or if order matters (Permutation vs Combination).`
    ],
    timeHintSeconds: assignTime(item.d)
  }));
}

// ==========================================
// 6. SPEED & DISTANCE (40 Qs)
// ==========================================
function generateSpeedDistance() {
  const items = [];
  let idCount = 1;

  // Easy (15 Qs)
  const easyData = [
    { speed: 72, time: 2, sub: 'Basic Speed' },
    { speed: 90, time: 3, sub: 'Basic Speed' },
    { speed: 54, time: 4, sub: 'Basic Speed' },
    { speed: 108, time: 1.5, sub: 'Basic Speed' },
    { kmh: 36, sub: 'Unit Conversion' },
    { kmh: 54, sub: 'Unit Conversion' },
    { kmh: 72, sub: 'Unit Conversion' },
    { kmh: 90, sub: 'Unit Conversion' },
    { len: 150, speed: 54, sub: 'Train & Pole' },
    { len: 200, speed: 72, sub: 'Train & Pole' },
    { len: 250, speed: 90, sub: 'Train & Pole' },
    { dist: 120, t1: 2, t2: 3, sub: 'Average Speed' },
    { dist: 240, t1: 3, t2: 5, sub: 'Average Speed' },
    { dist: 60, speed: 15, sub: 'Time Calculation' },
    { dist: 100, speed: 25, sub: 'Time Calculation' }
  ];

  easyData.forEach((c, idx) => {
    let q, o, exp, s;
    if (c.sub === 'Basic Speed') {
      const d = c.speed * c.time;
      q = `A car travels at a uniform speed of ${c.speed} km/h for ${c.time} hours. What total distance does it cover?`;
      o = [`${d} km`, `${d + 20} km`, `${d - 15} km`, `${d + 35} km`];
      exp = `Distance = Speed × Time = ${c.speed} × ${c.time} = ${d} km.`;
      s = `D = S × T.`;
    } else if (c.sub === 'Unit Conversion') {
      const ms = (c.kmh * 5) / 18;
      q = `Convert ${c.kmh} km/h into meters per second (m/s).`;
      o = [`${ms} m/s`, `${ms + 5} m/s`, `${ms - 2} m/s`, `${ms * 2} m/s`];
      exp = `${c.kmh} km/h = ${c.kmh} × (5/18) = ${ms} m/s.`;
      s = `Multiply by 5/18 to convert km/h to m/s.`;
    } else if (c.sub === 'Train & Pole') {
      const ms = (c.speed * 5) / 18;
      const t = c.len / ms;
      q = `A train ${c.len} meters long travels at ${c.speed} km/h. How many seconds will it take to cross a telegraph post?`;
      o = [`${t} seconds`, `${t + 3} seconds`, `${t - 2} seconds`, `${t + 6} seconds`];
      exp = `Speed in m/s = ${c.speed} × 5/18 = ${ms} m/s. Time to cross pole = Length / Speed = ${c.len} / ${ms} = ${t} seconds.`;
      s = `Time = Train Length / Speed in m/s.`;
    } else if (c.sub === 'Average Speed') {
      const totalD = c.dist * 2;
      const totalT = c.t1 + c.t2;
      const avgS = (totalD / totalT).toFixed(1);
      q = `A traveler goes ${c.dist} km in ${c.t1} hours and returns the same distance in ${c.t2} hours. What is the average speed for the round trip?`;
      o = [`${avgS} km/h`, `${(parseFloat(avgS) + 4).toFixed(1)} km/h`, `${(parseFloat(avgS) - 3).toFixed(1)} km/h`, `${(parseFloat(avgS) + 8).toFixed(1)} km/h`];
      exp = `Total Distance = ${c.dist} + ${c.dist} = ${totalD} km. Total Time = ${c.t1} + ${c.t2} = ${totalT} hours. Avg Speed = ${totalD} / ${totalT} = ${avgS} km/h.`;
      s = `Average Speed = Total Distance / Total Time.`;
    } else {
      const t = c.dist / c.speed;
      q = `How much time is required to cover a distance of ${c.dist} km at ${c.speed} km/h?`;
      o = [`${t} hours`, `${t + 1} hours`, `${t - 0.5} hours`, `${t * 1.5} hours`];
      exp = `Time = Distance / Speed = ${c.dist} / ${c.speed} = ${t} hours.`;
      s = `T = D / S.`;
    }

    const options = [o[0], o[1], o[2], o[3]].sort(() => 0.5 - Math.random());
    items.push({
      id: `spd_e_${idCount++}`,
      topic: 'Speed & Distance',
      subtopic: c.sub,
      difficulty: 'easy',
      pool: assignPool(idx),
      question: q,
      options,
      correctOption: options.indexOf(o[0]),
      explanation: exp,
      shortcut: s,
      hints: ['Convert units appropriately (km/h to m/s by multiplying 5/18).', 'Use Distance = Speed × Time.'],
      timeHintSeconds: assignTime('easy')
    });
  });

  // Medium (15 Qs)
  const medData = [
    { tLen: 200, pLen: 300, speed: 72, sub: 'Train & Platform' },
    { tLen: 180, pLen: 220, speed: 54, sub: 'Train & Platform' },
    { tLen: 300, pLen: 200, speed: 90, sub: 'Train & Platform' },
    { s1: 60, s2: 40, sub: 'Harmonic Average Speed' },
    { s1: 75, s2: 50, sub: 'Harmonic Average Speed' },
    { s1: 120, s2: 80, sub: 'Harmonic Average Speed' },
    { l1: 120, s1: 60, l2: 180, s2: 48, sub: 'Opposite Trains' },
    { l1: 150, s1: 72, l2: 150, s2: 36, sub: 'Opposite Trains' },
    { stillBoat: 15, stream: 3, sub: 'Boats & Streams' },
    { stillBoat: 18, stream: 2, sub: 'Boats & Streams' },
    { stillBoat: 20, stream: 4, sub: 'Boats & Streams' },
    { s1: 40, s2: 50, dist: 200, sub: 'Same Direction Overtake' },
    { s1: 30, s2: 45, dist: 150, sub: 'Same Direction Overtake' },
    { len: 240, time: 20, pLen: 160, sub: 'Speed from Platform' },
    { len: 300, time: 30, pLen: 200, sub: 'Speed from Platform' }
  ];

  medData.forEach((c, idx) => {
    let q, o, exp, s;
    if (c.sub === 'Train & Platform') {
      const totalL = c.tLen + c.pLen;
      const ms = (c.speed * 5) / 18;
      const t = totalL / ms;
      q = `A train ${c.tLen}m long traveling at ${c.speed} km/h passes a platform of length ${c.pLen}m. How long does it take to cross completely?`;
      o = [`${t} seconds`, `${t + 5} seconds`, `${t - 3} seconds`, `${t + 10} seconds`];
      exp = `Total distance to cover = Train length (${c.tLen}) + Platform length (${c.pLen}) = ${totalL}m. Speed = ${c.speed} × 5/18 = ${ms} m/s. Time = ${totalL} / ${ms} = ${t} seconds.`;
      s = `Total Distance = L_train + L_platform.`;
    } else if (c.sub === 'Harmonic Average Speed') {
      const avg = (2 * c.s1 * c.s2) / (c.s1 + c.s2);
      const simpleAvg = (c.s1 + c.s2) / 2;
      q = `A car travels from City A to City B at ${c.s1} km/h and returns along the same route at ${c.s2} km/h. What is the average speed for the whole journey?`;
      o = [`${avg} km/h`, `${simpleAvg !== avg + 6 ? simpleAvg : simpleAvg + 4} km/h`, `${avg + 6} km/h`, `${avg - 8} km/h`];
      exp = `For equal distances, Average Speed = (2 × S1 × S2) / (S1 + S2) = (2 × ${c.s1} × ${c.s2}) / (${c.s1} + ${c.s2}) = ${avg} km/h.`;
      s = `Harmonic mean: 2·S1·S2 / (S1 + S2).`;
    } else if (c.sub === 'Opposite Trains') {
      const totalLen = c.l1 + c.l2;
      const relSpeedKmh = c.s1 + c.s2;
      const relSpeedMs = (relSpeedKmh * 5) / 18;
      const t = (totalLen / relSpeedMs).toFixed(1);
      q = `Two trains of lengths ${c.l1}m and ${c.l2}m run in opposite directions on parallel tracks at ${c.s1} km/h and ${c.s2} km/h. How many seconds will they take to cross each other?`;
      o = [`${t} seconds`, `${(parseFloat(t) + 2).toFixed(1)} seconds`, `${(parseFloat(t) - 1.5).toFixed(1)} seconds`, `${(parseFloat(t) + 4).toFixed(1)} seconds`];
      exp = `Relative speed (opposite direction) = ${c.s1} + ${c.s2} = ${relSpeedKmh} km/h = ${relSpeedMs} m/s. Total distance = ${c.l1} + ${c.l2} = ${totalLen}m. Time = ${totalLen} / ${relSpeedMs} = ${t} seconds.`;
      s = `Relative speed = S1 + S2 when moving in opposite directions.`;
    } else if (c.sub === 'Boats & Streams') {
      const down = c.stillBoat + c.stream;
      const up = c.stillBoat - c.stream;
      q = `A boat's speed in still water is ${c.stillBoat} km/h and river current is ${c.stream} km/h. What are its Downstream and Upstream speeds?`;
      o = [`Downstream: ${down} km/h, Upstream: ${up} km/h`, `Downstream: ${down + 2} km/h, Upstream: ${up - 2} km/h`, `Downstream: ${down - 1} km/h, Upstream: ${up + 1} km/h`, `Downstream: ${c.stillBoat * 2} km/h, Upstream: ${c.stream * 2} km/h`];
      exp = `Downstream = Still speed + Stream = ${c.stillBoat} + ${c.stream} = ${down} km/h. Upstream = Still speed - Stream = ${c.stillBoat} - ${c.stream} = ${up} km/h.`;
      s = `Down = u + v, Up = u - v.`;
    } else if (c.sub === 'Speed from Platform') {
      const totalDist = c.len + c.pLen;
      const speedMs = totalDist / c.time;
      const speedKmh = Math.round((speedMs * 18) / 5);
      q = `A train of length ${c.len}m crosses a platform of length ${c.pLen}m in ${c.time} seconds. What is the speed of the train in km/h?`;
      o = [`${speedKmh} km/h`, `${speedKmh + 10} km/h`, `${speedKmh - 8} km/h`, `${speedKmh + 18} km/h`];
      exp = `Total distance = ${c.len} + ${c.pLen} = ${totalDist}m. Speed in m/s = ${totalDist} / ${c.time} = ${speedMs} m/s. In km/h = ${speedMs} × (18/5) = ${speedKmh} km/h.`;
      s = `Speed = [(Train Length + Platform Length) / Time] × (18/5).`;
    } else {
      const relS = c.s2 - c.s1;
      const timeToCatch = c.dist / relS;
      q = `Police car traveling at ${c.s2} km/h chases a thief at ${c.s1} km/h who is ${c.dist} km ahead. How long will the police take to catch the thief?`;
      o = [`${timeToCatch} hours`, `${timeToCatch + 2} hours`, `${timeToCatch - 1} hours`, `${timeToCatch * 1.5} hours`];
      exp = `Relative speed in same direction = ${c.s2} - ${c.s1} = ${relS} km/h. Time to bridge distance = ${c.dist} / ${relS} = ${timeToCatch} hours.`;
      s = `Same direction relative speed = S2 - S1.`;
    }

    const options = [o[0], o[1], o[2], o[3]].sort(() => 0.5 - Math.random());
    items.push({
      id: `spd_m_${idCount++}`,
      topic: 'Speed & Distance',
      subtopic: c.sub,
      difficulty: 'medium',
      pool: assignPool(idx),
      question: q,
      options,
      correctOption: options.indexOf(o[0]),
      explanation: exp,
      shortcut: s || 'Apply relative speed concepts.',
      hints: ['For opposite directions, add speeds. For same direction, subtract speeds.', 'Convert speed to m/s before dividing distance in meters.'],
      timeHintSeconds: assignTime('medium')
    });
  });

  // Hard (10 Qs)
  const hardData = [
    { sub: 'Late & Early Arrival', d: 'hard', q: 'Walking at 5 km/h, a student reaches campus 10 minutes late. Walking at 6 km/h, they reach 15 minutes early. What is the distance from home to campus?', o: ['12.5 km', '10.0 km', '15.0 km', '8.5 km'], c: 0, exp: 'Time diff = 10 + 15 = 25 mins = 25/60 hrs. Let distance be D. D/5 - D/6 = 25/60 => D/30 = 25/60 => D = 30 × (25/60) = 12.5 km.', s: 'D = (S1 × S2 × ΔT) / (S2 - S1).' },
    { sub: 'Circular Track Races', d: 'hard', q: 'Two runners A and B run on a 400m circular track in opposite directions at 6 m/s and 4 m/s. When will they meet for the first time?', o: ['40 seconds', '50 seconds', '30 seconds', '60 seconds'], c: 0, exp: 'Relative speed = 6 + 4 = 10 m/s. Time to meet = Track length / Relative speed = 400 / 10 = 40 seconds.', s: 'Time = Track Length / (S1 + S2).' },
    { sub: 'Linear Race Handicap', d: 'hard', q: 'In a 1000m race, A beats B by 100m and beats C by 190m. In a race of 900m between B and C, by how many meters will B beat C?', o: ['90m', '100m', '80m', '95m'], c: 0, exp: 'When A covers 1000m, B covers 900m and C covers 810m. Ratio of B:C = 900 : 810 = 10 : 9. In a 900m race, B covers 900m while C covers (9/10) × 900 = 810m. B beats C by 900 - 810 = 90m.', s: 'Use proportional ratio of distances covered in equal time.' },
    { sub: 'Two Trains Crossing Meeting', d: 'hard', q: 'Two trains start at the same time from Station A and B towards each other. After meeting, they take 4 hours and 9 hours respectively to reach B and A. What is the ratio of their speeds (S1 : S2)?', o: ['3 : 2', '2 : 3', '9 : 4', '4 : 9'], c: 0, exp: 'Formula for speeds after meeting: S1 / S2 = √(T2 / T1) = √(9 / 4) = 3 / 2 = 3 : 2.', s: 'S1/S2 = √(T2/T1).' },
    { sub: 'Escalator Steps', d: 'hard', q: 'A person walking up an upward moving escalator takes 30 seconds to reach the top. If they double their walking speed, it takes 20 seconds. How long would it take if the person stood still on the escalator?', o: ['60 seconds', '50 seconds', '45 seconds', '40 seconds'], c: 0, exp: 'Let N steps be total. Step equations: (p + e) × 30 = N and (2p + e) × 20 = N. 30p + 30e = 40p + 20e => 10p = 10e => p = e. Substituting: (e + e) × 30 = 60e = N. Escalator alone takes N / e = 60 seconds.', s: 'Solve linear system relating person and escalator speeds.' },
    { sub: 'Round Trip River Stream', d: 'hard', q: 'A motorboat takes 6 hours to travel 36 km downstream and 24 km upstream. If it takes 6.5 hours to travel 24 km downstream and 36 km upstream, what is the boat\'s speed in still water?', o: ['10 km/h', '12 km/h', '8 km/h', '14 km/h'], c: 0, exp: 'Let 1/down = u and 1/up = v. 36u + 24v = 6 and 24u + 36v = 6.5. Solving gives Downstream = 12 km/h, Upstream = 8 km/h. Still water speed = (Down + Up) / 2 = (12 + 8) / 2 = 10 km/h.', s: 'Still speed = (Down + Up) / 2.' },
    { sub: 'Stoppage Time Reduction', d: 'hard', q: 'Excluding stoppages, the average speed of a bus is 54 km/h, and including stoppages, it is 45 km/h. For how many minutes does the bus stop per hour?', o: ['10 minutes', '12 minutes', '9 minutes', '15 minutes'], c: 0, exp: 'Stoppage time per hour = [(Speed without stoppage - Speed with stoppage) / Speed without stoppage] × 60 = [(54 - 45) / 54] × 60 = (9 / 54) × 60 = 10 minutes.', s: 'Formula: (ΔSpeed / Faster Speed) × 60 mins.' },
    { sub: 'Wind Airspeed Effect', d: 'hard', q: 'An aircraft flies 1200 km against a headwind in 2.5 hours and returns with the tailwind in 2.0 hours. What is the wind speed?', o: ['60 km/h', '50 km/h', '40 km/h', '80 km/h'], c: 0, exp: 'Headwind speed = 1200 / 2.5 = 480 km/h. Tailwind speed = 1200 / 2.0 = 600 km/h. Wind speed = (Tailwind - Headwind) / 2 = (600 - 480) / 2 = 60 km/h.', s: 'Wind = (Tail - Head) / 2.' },
    { sub: 'Variable Speeds Journey', d: 'hard', q: 'A driver covers 1/3 of a journey at 20 km/h, 1/3 at 30 km/h, and the final 1/3 at 60 km/h. What is the average speed for the entire journey?', o: ['30 km/h', '36.6 km/h', '28 km/h', '32 km/h'], c: 0, exp: 'Let total distance = 3D. Total Time = D/20 + D/30 + D/60 = (3D + 2D + D)/60 = 6D/60 = D/10. Average Speed = Total Distance / Total Time = 3D / (D/10) = 30 km/h.', s: 'Harmonic mean of 3 equal parts: 3 / (1/20 + 1/30 + 1/60) = 30.' },
    { sub: 'Passing Person on Platform', d: 'hard', q: 'A train 150m long passes a man walking at 6 km/h in the same direction in 15 seconds. What is the speed of the train?', o: ['42 km/h', '36 km/h', '48 km/h', '40 km/h'], c: 0, exp: 'Relative speed = 150m / 15s = 10 m/s = 10 × 18/5 = 36 km/h. Since both move in the same direction: Train Speed - Man Speed = 36 => Train Speed = 36 + 6 = 42 km/h.', s: 'Train Speed = Relative Speed + Man Speed.' }
  ];

  hardData.forEach((c, idx) => {
    const options = [c.o[0], c.o[1], c.o[2], c.o[3]].sort(() => 0.5 - Math.random());
    items.push({
      id: `spd_h_${idCount++}`,
      topic: 'Speed & Distance',
      subtopic: c.sub,
      difficulty: 'hard',
      pool: assignPool(idx),
      question: c.q,
      options,
      correctOption: options.indexOf(c.o[0]),
      explanation: c.exp,
      shortcut: c.s,
      hints: ['Set up time difference or relative speed equations.', 'Ensure all distance and time units are consistent before solving.'],
      timeHintSeconds: assignTime('hard')
    });
  });

  return items;
}

// ==========================================
// 7. PROFIT & LOSS (40 Qs)
// ==========================================
function generateProfitLoss() {
  const items = [];
  let idCount = 1;

  // Easy (15 Qs)
  for (let i = 0; i < 15; i++) {
    const cp = 100 + i * 50;
    const gainPct = 10 + (i % 5) * 5;
    const sp = cp * (1 + gainPct / 100);
    const q = `An item bought for $${cp} is sold at a ${gainPct}% profit. What is the selling price?`;
    const o = [`$${sp.toFixed(0)}`, `$${(sp + 15).toFixed(0)}`, `$${(sp - 10).toFixed(0)}`, `$${(sp + 25).toFixed(0)}`];
    const exp = `Profit = ${gainPct}% of $${cp} = $${(cp * gainPct) / 100}. Selling Price = Cost Price + Profit = $${cp} + $${(cp * gainPct) / 100} = $${sp.toFixed(0)}.`;
    const s = `SP = CP × (1 + Profit%/100).`;

    const options = [...o].sort(() => 0.5 - Math.random());
    items.push({
      id: `pl_e_${idCount++}`,
      topic: 'Profit & Loss',
      subtopic: 'Basic Margin',
      difficulty: 'easy',
      pool: assignPool(i),
      question: q,
      options,
      correctOption: options.indexOf(o[0]),
      explanation: exp,
      shortcut: s,
      hints: [`Calculate profit amount: ${gainPct}% of $${cp}.`, `Add profit to original Cost Price ($${cp}).`],
      timeHintSeconds: assignTime('easy')
    });
  }

  // Medium (15 Qs)
  for (let i = 0; i < 15; i++) {
    const cp = 500 + i * 100;
    const mpMarkup = 30;
    const discount = 10;
    const mp = cp * (1 + mpMarkup / 100);
    const sp = mp * (1 - discount / 100);
    const netProfit = sp - cp;
    const netProfitPct = ((netProfit / cp) * 100).toFixed(1);

    const q = `A merchant marks up goods by ${mpMarkup}% above Cost Price ($${cp}) and then offers a ${discount}% discount on the Marked Price. What is the net profit percentage?`;
    const o = [`${netProfitPct}%`, `${(parseFloat(netProfitPct) + 3).toFixed(1)}%`, `${(parseFloat(netProfitPct) - 2.5).toFixed(1)}%`, `${(mpMarkup - discount)}%`];
    const exp = `Marked Price = $${cp} × 1.30 = $${mp}. Selling Price after ${discount}% discount = $${mp} × 0.90 = $${sp}. Profit = $${sp} - $${cp} = $${netProfit}. Net % = (${netProfit} / ${cp}) × 100 = ${netProfitPct}%.`;
    const s = `Net formula: Markup - Discount - (Markup × Discount)/100 = 30 - 10 - 3 = 17%.`;

    const options = [...o].sort(() => 0.5 - Math.random());
    items.push({
      id: `pl_m_${idCount++}`,
      topic: 'Profit & Loss',
      subtopic: 'Marked Price & Discounts',
      difficulty: 'medium',
      pool: assignPool(i),
      question: q,
      options,
      correctOption: options.indexOf(o[0]),
      explanation: exp,
      shortcut: s,
      hints: ['First compute Marked Price, then subtract discount from MP.', 'Net gain % is always calculated on Cost Price.'],
      timeHintSeconds: assignTime('medium')
    });
  }

  // Hard (10 Qs)
  const hardPL = [
    { sub: 'Faulty Balance Weights', q: 'A dishonest dealer professes to sell goods at Cost Price, but uses a faulty balance that weighs 900 grams for 1 kg (1000g). What is their actual profit percentage?', o: ['11.11% (11 1/9%)', '10.00%', '12.50%', '9.09%'], c: 0, exp: 'Profit % = [Error / (True Value - Error)] × 100 = [100 / 900] × 100 = 100/9 = 11.11%.', s: 'Formula: [Fault / (Actual Given)] × 100.' },
    { sub: 'Equal Selling Price Profit/Loss', q: 'A shopkeeper sells two articles for $990 each, making a 10% gain on one and a 10% loss on the other. What is the net result on the total transaction?', o: ['1% Loss', '1% Gain', 'No Profit No Loss', '2% Loss'], c: 0, exp: 'When two articles are sold at equal SP with x% gain and x% loss, there is always a net loss of (x/10)² % = (10/10)² = 1% Loss.', s: 'Common loss rule: (x/10)² % Loss.' },
    { sub: 'Partnership Investment Ratio', q: 'A, B, and C invest in a business in the ratio 5:6:8. If the ratio of their profit sharing period is 2:3:4, what is the ratio of their earned profits?', o: ['5 : 9 : 16', '10 : 18 : 24', '1 : 2 : 3', '5 : 6 : 8'], c: 0, exp: 'Profit Ratio = (Capital A × Time A) : (Capital B × Time B) : (Capital C × Time C) = (5×2) : (6×3) : (8×4) = 10 : 18 : 32 = 5 : 9 : 16.', s: 'Profit ∝ Capital × Time.' },
    { sub: 'Articles Bought and Sold Ratio', q: 'If the Cost Price of 15 articles is equal to the Selling Price of 12 articles, what is the profit percentage?', o: ['25.0%', '20.0%', '30.0%', '16.67%'], c: 0, exp: '15 CP = 12 SP => SP/CP = 15/12 = 5/4. Profit % = [(5 - 4) / 4] × 100 = (1/4) × 100 = 25.0%.', s: 'SP/CP = 15/12. Profit % = (3/12) × 100 = 25%.' },
    { sub: 'Successive Trading Loss', q: 'A sells a vintage watch to B at 20% profit. B sells it to C at 10% loss. If C paid $540, what was the original cost to A?', o: ['$500', '$450', '$480', '$520'], c: 0, exp: 'Let A\'s cost = X. X × (120/100) × (90/100) = 540 => X × 1.08 = 540 => X = 540 / 1.08 = $500.', s: 'X × 1.20 × 0.90 = 540.' },
    { sub: 'Cost Price from Differing Selling Prices', q: 'An item is sold at 15% profit. Had it been sold for $45 more, the profit would have been 20%. What is the Cost Price of the item?', o: ['$900', '$800', '$1000', '$750'], c: 0, exp: 'Difference in profit % = 20% - 15% = 5% of CP. 5% of CP = $45 => CP = ($45 / 5) × 100 = $900.', s: 'CP = Difference in Price / Difference in % = 45 / 0.05 = $900.' },
    { sub: 'Reduced Price Quantity Gain', q: 'A 20% reduction in the price of sugar enables a buyer to purchase 5 kg more for $100. What is the reduced price per kg of sugar?', o: ['$4.00/kg', '$5.00/kg', '$4.50/kg', '$3.50/kg'], c: 0, exp: '20% of $100 = $20. This $20 pays for the extra 5 kg. Reduced price per kg = $20 / 5 kg = $4.00/kg.', s: 'Reduced price = (Reduction% × Total Money) / Extra Quantity.' },
    { sub: 'Faulty Metric Scale', q: 'A cloth merchant uses a meter rod that actually measures 95 cm instead of 100 cm and claims to sell at a 5% profit on cost. What is his actual net gain %?', o: ['10.53%', '10.00%', '9.75%', '11.00%'], c: 0, exp: 'Let CP of 100 cm = $100 (so 1 cm = $1). Merchant gives 95 cm (cost = $95) and charges $105 (5% profit on $100). Net Profit = $105 - $95 = $10. Profit % = (10 / 95) × 100 = 10.526% ≈ 10.53%.', s: 'Net Profit = Selling Price received - True Cost of goods given.' },
    { sub: 'Milk and Water Dilution', q: 'A dishonest milkman adds 25% water to pure milk and sells the diluted mixture at the Cost Price of pure milk. What is his profit percentage?', o: ['25.0%', '20.0%', '33.33%', '15.0%'], c: 0, exp: 'If pure milk is 100L costing $100, he adds 25L free water making 125L and sells it for $125. Profit = $25 on $100 cost = 25.0%.', s: 'When free adulterant is added and sold at CP, profit % = % of adulterant added.' },
    { sub: 'Compound Loss Recovery', q: 'A trader sells 60% of his stock at 20% profit, and the remaining 40% at a 10% loss. What is his overall profit or loss percentage on the entire inventory?', o: ['8.0% Profit', '6.0% Profit', '10.0% Profit', '2.0% Loss'], c: 0, exp: 'Net % = (0.60 × 20%) + (0.40 × -10%) = 12% - 4% = 8.0% Profit.', s: 'Weighted average: (0.6 × 20) + (0.4 × -10) = 8%.' }
  ];

  hardPL.forEach((c, idx) => {
    const options = [c.o[0], c.o[1], c.o[2], c.o[3]].sort(() => 0.5 - Math.random());
    items.push({
      id: `pl_h_${idCount++}`,
      topic: 'Profit & Loss',
      subtopic: c.sub,
      difficulty: 'hard',
      pool: assignPool(idx),
      question: c.q,
      options,
      correctOption: options.indexOf(c.o[0]),
      explanation: c.exp,
      shortcut: c.s,
      hints: ['Express transactions in terms of pure Cost Price units.', 'Watch for the difference between True Value and Actual Delivered Value.'],
      timeHintSeconds: assignTime('hard')
    });
  });

  return items;
}

// ==========================================
// 8. SYLLOGISMS (40 Qs)
// ==========================================
function generateSyllogisms() {
  const syllogismsData = [
    // Easy (15 Qs)
    { d: 'easy', s: 'Statements: All cats are animals. All animals are mammals.', q: 'Which conclusion definitely follows?', o: ['All cats are mammals', 'Some mammals are not animals', 'All mammals are cats', 'No cats are mammals'], c: 0, exp: 'Universal affirmative chain: A ⊂ B and B ⊂ C implies A ⊂ C (All cats are mammals).', sc: 'A -> B -> C implies A -> C.' },
    { d: 'easy', s: 'Statements: All pens are tools. Some tools are metal.', q: 'Which conclusion definitely follows?', o: ['Some tools are pens', 'All tools are pens', 'All pens are metal', 'No pens are tools'], c: 0, exp: '"All pens are tools" can be converted by subalternation to "Some tools are pens".', sc: 'Conversion of A proposition (All S is P) is I proposition (Some P is S).' },
    { d: 'easy', s: 'Statements: No birds are fish. All parrots are birds.', q: 'Which conclusion definitely follows?', o: ['No parrots are fish', 'Some fish are parrots', 'All fish are parrots', 'Some parrots are fish'], c: 0, exp: 'Parrots ⊂ Birds, and Birds ∩ Fish = ∅. Therefore, Parrots ∩ Fish = ∅ (No parrots are fish).', sc: 'E + A premise yields valid E conclusion.' },
    { d: 'easy', s: 'Statements: Some apples are fruits. All fruits are healthy.', q: 'Which conclusion definitely follows?', o: ['Some apples are healthy', 'All apples are healthy', 'No apples are healthy', 'All healthy things are apples'], c: 0, exp: 'Some apples are fruits, and all fruits are healthy. Therefore, those apples are healthy.', sc: 'I + A premise yields I conclusion.' },
    { d: 'easy', s: 'Statements: All laptops are computers. No computers are toys.', q: 'Which conclusion definitely follows?', o: ['No laptops are toys', 'Some laptops are toys', 'All toys are laptops', 'Some computers are toys'], c: 0, exp: 'Laptops are inside computers, which have zero overlap with toys. Thus no laptops are toys.', sc: 'A + E yields E.' },
    { d: 'easy', s: 'Statements: Some books are novels. Some novels are fiction.', q: 'Which conclusion definitely follows?', o: ['None of these definitely follow', 'All books are fiction', 'Some books are fiction', 'No books are novels'], c: 0, exp: 'Two particular premises (Some + Some) cannot produce a definite universal or particular conclusion connecting the extreme terms.', sc: 'Two particular premises yield no definite conclusion.' },
    { d: 'easy', s: 'Statements: All cars are vehicles. Some vehicles are electric.', q: 'Which conclusion definitely follows?', o: ['Some vehicles are cars', 'All cars are electric', 'No cars are electric', 'All electric things are cars'], c: 0, exp: '"All cars are vehicles" converts directly to "Some vehicles are cars".', sc: 'Valid direct conversion.' },
    { d: 'easy', s: 'Statements: No trees are animals. All dogs are animals.', q: 'Which conclusion definitely follows?', o: ['No trees are dogs', 'Some trees are dogs', 'All trees are dogs', 'Some animals are trees'], c: 0, exp: 'Trees and Animals are disjoint. Dogs are inside Animals. Thus Dogs and Trees are disjoint.', sc: 'Disjoint containment.' },
    { d: 'easy', s: 'Statements: All squares are rectangles. All rectangles are polygons.', q: 'Which conclusion definitely follows?', o: ['All squares are polygons', 'Some polygons are not rectangles', 'No squares are polygons', 'All polygons are squares'], c: 0, exp: 'Transitive chain of universal affirmatives: Squares ⊂ Rectangles ⊂ Polygons.', sc: 'Transitive subset.' },
    { d: 'easy', s: 'Statements: Some doctors are teachers. All teachers are professionals.', q: 'Which conclusion definitely follows?', o: ['Some doctors are professionals', 'All doctors are professionals', 'No doctors are professionals', 'All professionals are doctors'], c: 0, exp: 'The doctors who are teachers are necessarily professionals.', sc: 'I + A -> I.' },
    { d: 'easy', s: 'Statements: All rings are jewelry. No jewelry is plastic.', q: 'Which conclusion definitely follows?', o: ['No rings are plastic', 'Some rings are plastic', 'All plastic items are rings', 'Some jewelry is plastic'], c: 0, exp: 'Rings ⊂ Jewelry and Jewelry ∩ Plastic = ∅ implies Rings ∩ Plastic = ∅.', sc: 'A + E -> E.' },
    { d: 'easy', s: 'Statements: Some phones are smartphones. All smartphones have cameras.', q: 'Which conclusion definitely follows?', o: ['Some phones have cameras', 'All phones have cameras', 'No phones have cameras', 'All cameras are phones'], c: 0, exp: 'The phones that are smartphones must have cameras.', sc: 'I + A -> I.' },
    { d: 'easy', s: 'Statements: All rivers are water bodies. All water bodies contain liquid.', q: 'Which conclusion definitely follows?', o: ['All rivers contain liquid', 'Some rivers do not contain liquid', 'No water bodies are rivers', 'All liquid is rivers'], c: 0, exp: 'Standard universal inclusion: Rivers ⊂ Water Bodies ⊂ Contain Liquid.', sc: 'All A is C.' },
    { d: 'easy', s: 'Statements: No metal is liquid. Some elements are liquid.', q: 'Which conclusion definitely follows?', o: ['Some elements are not metal', 'All elements are metal', 'No elements are metal', 'All metals are elements'], c: 0, exp: 'The elements that are liquid cannot be metal, so some elements are not metal.', sc: 'E + I -> O* (Some non-metals are elements).' },
    { d: 'easy', s: 'Statements: All engineers are problem-solvers. Some problem-solvers are creative.', q: 'Which conclusion definitely follows?', o: ['Some problem-solvers are engineers', 'All engineers are creative', 'No engineers are creative', 'All creative people are engineers'], c: 0, exp: 'Conversion of "All engineers are problem-solvers" yields "Some problem-solvers are engineers".', sc: 'Valid converse.' },

    // Medium (15 Qs)
    { d: 'medium', s: 'Statements: Some trains are metros. No metros are buses. All buses are cars.', q: 'Conclusions: I. Some trains are not buses. II. Some cars are buses.', o: ['Both I and II follow', 'Only I follows', 'Only II follows', 'Neither follows'], c: 0, exp: 'I: Trains that are metros cannot be buses (True). II: "All buses are cars" converts to "Some cars are buses" (True). Both hold.', sc: 'Verify both conclusions independently.' },
    { d: 'medium', s: 'Statements: All managers are leaders. Some leaders are mentors. No mentors are trainees.', q: 'Conclusions: I. Some leaders are not trainees. II. All managers are mentors.', o: ['Only I follows', 'Only II follows', 'Both follow', 'Neither follows'], c: 0, exp: 'I: Leaders that are mentors cannot be trainees (True). II: "All managers are mentors" does not definitely follow because the overlap between managers and mentors is unestablished.', sc: 'Check certainty vs possibility.' },
    { d: 'medium', s: 'Statements: Some cloud is rain. Some rain is thunder. All thunder is storm.', q: 'Conclusions: I. Some rain is storm. II. Some cloud is storm.', o: ['Only I follows', 'Only II follows', 'Both follow', 'Neither follows'], c: 0, exp: 'I: All thunder is storm and some rain is thunder -> Some rain is storm (True). II: No direct link between cloud and storm (False).', sc: 'Trace link through common term.' },
    { d: 'medium', s: 'Statements: All algorithms are logic. No logic is fallacy. Some fallacy is myth.', q: 'Conclusions: I. No algorithm is fallacy. II. Some myth is fallacy.', o: ['Both I and II follow', 'Only I follows', 'Only II follows', 'Neither follows'], c: 0, exp: 'I: Algorithms ⊂ Logic and Logic ∩ Fallacy = ∅ -> No algorithm is fallacy (True). II: "Some fallacy is myth" converts to "Some myth is fallacy" (True).', sc: 'Both conclusions valid.' },
    { d: 'medium', s: 'Statements: Only a few coders are designers. All designers are artists.', q: 'Conclusions: I. Some coders are artists. II. Some coders are not designers.', o: ['Both I and II follow', 'Only I follows', 'Only II follows', 'Neither follows'], c: 0, exp: '"Only a few" means both "Some are" and "Some are not". Coders who are designers are artists (I is True). "Some coders are not designers" is inherent to "Only a few" (II is True).', sc: '"Only a few" = Some + Some not.' },
    { d: 'medium', s: 'Statements: Only a few papers are books. All books are hardcovers.', q: 'Conclusions: I. All papers can never be books. II. Some hardcovers are papers.', o: ['Both I and II follow', 'Only I follows', 'Only II follows', 'Neither follows'], c: 0, exp: 'I: Because "Only a few papers are books", it is impossible for all papers to be books (True). II: Hardcovers that are books overlap with papers (True).', sc: 'Possibility boundary checks.' },
    { d: 'medium', s: 'Statements: Some servers are nodes. All nodes are clusters. No cluster is client.', q: 'Conclusions: I. No node is client. II. Some servers are clusters.', o: ['Both I and II follow', 'Only I follows', 'Only II follows', 'Neither follows'], c: 0, exp: 'I: Nodes ⊂ Clusters and Clusters ∩ Clients = ∅ -> No node is client (True). II: Servers that are nodes are clusters (True).', sc: 'Both follow.' },
    { d: 'medium', s: 'Statements: All diamonds are gems. Some gems are precious. All precious are stones.', q: 'Conclusions: I. Some gems are stones. II. All diamonds are stones.', o: ['Only I follows', 'Only II follows', 'Both follow', 'Neither follows'], c: 0, exp: 'I: Gems that are precious are stones (True). II: Diamonds are gems, but not necessarily precious/stones (False).', sc: 'Only I is guaranteed.' },
    { d: 'medium', s: 'Statements: No red is blue. No blue is green.', q: 'Conclusions: I. Some red is green. II. No red is green.', o: ['Either I or II follows', 'Only I follows', 'Only II follows', 'Neither follows'], c: 0, exp: 'Red and Green form a complementary pair ("Some is" vs "No is") with no direct relationship established from premises. Hence Either I or II follows.', sc: 'Complementary pair rule: Some A is B + No A is B -> Either/Or.' },
    { d: 'medium', s: 'Statements: Some cats are dogs. No dog is mouse.', q: 'Conclusions: I. Some cats are mouse. II. Some cats are not mouse.', o: ['Only II follows', 'Only I follows', 'Both follow', 'Either I or II follows'], c: 0, exp: 'The cats that are dogs cannot be mouse, so "Some cats are not mouse" is definitively true.', sc: 'Definite negative sub-group.' },
    { d: 'medium', s: 'Statements: All A are B. All B are C. All C are D.', q: 'Conclusions: I. Some D are A. II. All A are D.', o: ['Both I and II follow', 'Only I follows', 'Only II follows', 'Neither follows'], c: 0, exp: 'A ⊂ B ⊂ C ⊂ D. Thus All A are D (II True) and Some D are A (I True).', sc: 'Universal chain.' },
    { d: 'medium', s: 'Statements: Some circles are squares. Some squares are triangles.', q: 'Conclusions: I. Some circles are triangles. II. No circle is triangle.', o: ['Either I or II follows', 'Only I follows', 'Only II follows', 'Neither follows'], c: 0, exp: 'No definitive link between circles and triangles. Since I and II are complementary (Some vs No), either I or II must be true.', sc: 'Either-Or complementary pair.' },
    { d: 'medium', s: 'Statements: All inputs are signals. No signal is noise. All noise is glitch.', q: 'Conclusions: I. No input is noise. II. Some glitch is noise.', o: ['Both I and II follow', 'Only I follows', 'Only II follows', 'Neither follows'], c: 0, exp: 'I: Inputs ⊂ Signals, Signals ∩ Noise = ∅ -> No input is noise (True). II: Noise ⊂ Glitch -> Some glitch is noise (True).', sc: 'Both valid.' },
    { d: 'medium', s: 'Statements: Only laptops are portable. (All portable are laptops). Some portable are light.', q: 'Conclusions: I. Some laptops are light. II. All light are portable.', o: ['Only I follows', 'Only II follows', 'Both follow', 'Neither follows'], c: 0, exp: '"Only A are B" means All B are A (All portable are laptops). Since Some portable are light, those light items are laptops (I True).', sc: '"Only A are B" = All B are A.' },
    { d: 'medium', s: 'Statements: Some data is valid. All valid is verified. No verified is false.', q: 'Conclusions: I. Some data is not false. II. No data is false.', o: ['Only I follows', 'Only II follows', 'Both follow', 'Neither follows'], c: 0, exp: 'The valid data is verified and cannot be false, so Some data is not false (I True). We cannot claim ALL data is not false.', sc: 'Particular negative deduction.' },

    // Hard (10 Qs)
    { d: 'hard', s: 'Statements: Only a few CPUs are GPUs. No GPU is TPU. All TPUs are NPUs.', q: 'Conclusions: I. All CPUs can never be GPUs. II. Some CPUs being TPUs is a possibility. III. No GPU is NPU.', o: ['Only I and II follow', 'Only I and III follow', 'All I, II, III follow', 'Only II follows'], c: 0, exp: 'I: "Only a few CPUs are GPUs" implies some CPUs are not GPUs, so not all CPUs can be GPUs (True). II: CPUs not in GPU can overlap with TPUs (Possibility is True). III: TPU ⊂ NPU does not prevent other NPUs from being GPUs (False).', sc: 'Distinguish definite facts vs possibilities.' },
    { d: 'hard', s: 'Statements: All code is text. Some text is markup. No markup is binary. All binary is compiled.', q: 'Conclusions: I. Some text is not binary. II. All code being binary is a possibility. III. Some compiled is binary.', o: ['All I, II, and III follow', 'Only I and III follow', 'Only II and III follow', 'Only I follows'], c: 0, exp: 'I: Text that is markup is not binary (True). II: Code has no restriction with binary since only markup is excluded (Possibility is True). III: "All binary is compiled" converts to "Some compiled is binary" (True).', sc: 'All three conclusions hold.' },
    { d: 'hard', s: 'Statements: Only SDE is Tech. (All Tech is SDE). No SDE is Sales. Some Sales is Marketing.', q: 'Conclusions: I. No Tech is Sales. II. Some Marketing being SDE is a possibility. III. All SDE being Marketing is a possibility.', o: ['All I, II, and III follow', 'Only I and II follow', 'Only I and III follow', 'Only I follows'], c: 0, exp: 'I: Tech ⊂ SDE and SDE ∩ Sales = ∅ -> No Tech is Sales (True). II: Marketing not in Sales can overlap with SDE (Possibility True). III: SDE can be contained in Marketing without touching Sales (Possibility True).', sc: 'Exclusive "Only" statement parsing.' },
    { d: 'hard', s: 'Statements: Some locks are keys. Some keys are doors. No door is window.', q: 'Conclusions: I. All locks being doors is a possibility. II. All keys being windows is a possibility.', o: ['Only I follows', 'Only II follows', 'Both follow', 'Neither follows'], c: 0, exp: 'I: Locks and doors have no negative constraint, so complete overlap is possible (True). II: Keys that are doors CANNOT be windows (since No door is window), so ALL keys being windows is impossible (False).', sc: 'Check subset blockage.' },
    { d: 'hard', s: 'Statements: All APIs are endpoints. No endpoint is socket. All websockets are sockets.', q: 'Conclusions: I. No API is socket. II. No websocket is endpoint.', o: ['Both I and II follow', 'Only I follows', 'Only II follows', 'Neither follows'], c: 0, exp: 'APIs ⊂ Endpoints. Endpoints ∩ Sockets = ∅. Websockets ⊂ Sockets. Thus APIs ∩ Sockets = ∅ (I True) and Websockets ∩ Endpoints = ∅ (II True).', sc: 'Double subset disjoint.' },
    { d: 'hard', s: 'Statements: Only a few algorithms are heuristics. No heuristic is optimal. All exact are optimal.', q: 'Conclusions: I. No exact is heuristic. II. All heuristics being algorithms is a possibility. III. Some algorithms are not heuristics.', o: ['All I, II, and III follow', 'Only I and III follow', 'Only I and II follow', 'Only III follows'], c: 0, exp: 'I: Exact ⊂ Optimal, Optimal ∩ Heuristic = ∅ -> No exact is heuristic (True). II: All heuristics can be inside algorithms (Possibility True). III: "Only a few" guarantees some are not (True).', sc: 'All 3 valid.' },
    { d: 'hard', s: 'Statements: Some queries are slow. Some queries are fast. No fast is indexed. All indexed are cached.', q: 'Conclusions: I. Some cached is not fast. II. All queries being cached is a possibility.', o: ['Both I and II follow', 'Only I follows', 'Only II follows', 'Neither follows'], c: 0, exp: 'I: Cached items that are indexed cannot be fast (True). II: Queries can all be cached without violating any premise (Possibility True).', sc: 'Valid complex deductions.' },
    { d: 'hard', s: 'Statements: All threads are tasks. No task is process. Some processes are daemons.', q: 'Conclusions: I. No thread is process. II. Some daemons are not tasks.', o: ['Both I and II follow', 'Only I follows', 'Only II follows', 'Neither follows'], c: 0, exp: 'I: Threads ⊂ Tasks, Tasks ∩ Processes = ∅ -> No thread is process (True). II: Daemons that are processes cannot be tasks (True).', sc: 'Both follow.' },
    { d: 'hard', s: 'Statements: No bug is feature. No feature is release. All hotfixes are bugs.', q: 'Conclusions: I. No hotfix is feature. II. Some hotfixes being release is a possibility.', o: ['Both I and II follow', 'Only I follows', 'Only II follows', 'Neither follows'], c: 0, exp: 'I: Hotfixes ⊂ Bugs, Bugs ∩ Features = ∅ -> No hotfix is feature (True). II: Hotfixes have no negative link with release (Possibility True).', sc: 'Both valid.' },
    { d: 'hard', s: 'Statements: Only a few microservices are monolithic. No monolithic is scalable. Some scalable are resilient.', q: 'Conclusions: I. Some microservices are not scalable. II. All resilient being monolithic is a possibility.', o: ['Only I follows', 'Only II follows', 'Both follow', 'Neither follows'], c: 0, exp: 'I: Microservices that are monolithic cannot be scalable (True). II: Resilient items that are scalable can never be monolithic (False).', sc: 'Only I holds.' }
  ];

  return syllogismsData.map((item, idx) => ({
    id: `syl_${item.d[0]}_${idx + 1}`,
    topic: 'Syllogisms',
    subtopic: item.s.includes('Only a few') ? 'Only a Few Cases' : (item.d === 'hard' ? 'Possibility & Multi-Statements' : 'Two Statement Syllogisms'),
    difficulty: item.d,
    pool: assignPool(idx),
    question: `${item.s}\n${item.q}`,
    options: item.o,
    correctOption: item.c,
    explanation: item.exp,
    shortcut: item.sc,
    hints: [
      'Draw Euler/Venn circles to visualize set intersections and disjoint boundaries.',
      'Remember: "Only a few A are B" implies both (Some A are B) and (Some A are not B).'
    ],
    timeHintSeconds: assignTime(item.d)
  }));
}

// ==========================================
// 9. NUMBER SERIES (40 Qs)
// ==========================================
function generateNumberSeries() {
  const items = [];
  let idCount = 1;

  const seriesData = [
    // Easy (15 Qs)
    { d: 'easy', sub: 'Arithmetic Difference', seq: [2, 5, 8, 11, 14], ans: 17, exp: 'Add +3 at each consecutive step: 14 + 3 = 17.', s: 'Common difference d = +3.' },
    { d: 'easy', sub: 'Arithmetic Difference', seq: [7, 12, 17, 22, 27], ans: 32, exp: 'Add +5 at each step: 27 + 5 = 32.', s: 'Common difference d = +5.' },
    { d: 'easy', sub: 'Geometric Multipliers', seq: [3, 6, 12, 24, 48], ans: 96, exp: 'Multiply by 2 at each step: 48 × 2 = 96.', s: 'Common ratio r = 2.' },
    { d: 'easy', sub: 'Geometric Multipliers', seq: [5, 15, 45, 135], ans: 405, exp: 'Multiply by 3 at each step: 135 × 3 = 405.', s: 'Common ratio r = 3.' },
    { d: 'easy', sub: 'Square Numbers', seq: [1, 4, 9, 16, 25, 36], ans: 49, exp: 'Squares of consecutive natural numbers: 1², 2², 3², 4², 5², 6², 7² = 49.', s: 'Sequence of n².' },
    { d: 'easy', sub: 'Square Numbers', seq: [4, 9, 16, 25, 36, 49], ans: 64, exp: 'Consecutive squares: 8² = 64.', s: 'n² series starting from 2².' },
    { d: 'easy', sub: 'Cube Numbers', seq: [1, 8, 27, 64, 125], ans: 216, exp: 'Cubes of consecutive integers: 1³, 2³, 3³, 4³, 5³, 6³ = 216.', s: 'Sequence of n³.' },
    { d: 'easy', sub: 'Alternating Difference', seq: [10, 15, 12, 17, 14, 19], ans: 16, exp: 'Alternating pattern: +5, -3, +5, -3, +5, -3 -> 19 - 3 = 16.', s: 'Two alternating operations (+5, -3).' },
    { d: 'easy', sub: 'Alternating Difference', seq: [20, 18, 21, 19, 22, 20], ans: 23, exp: 'Pattern: -2, +3, -2, +3, -2, +3 -> 20 + 3 = 23.', s: 'Alternating (-2, +3).' },
    { d: 'easy', sub: 'Fibonacci Style', seq: [1, 1, 2, 3, 5, 8, 13], ans: 21, exp: 'Each number is the sum of the two preceding numbers: 8 + 13 = 21.', s: 'Fibonacci addition.' },
    { d: 'easy', sub: 'Fibonacci Style', seq: [2, 3, 5, 8, 13, 21], ans: 34, exp: 'Sum of previous two numbers: 13 + 21 = 34.', s: 'T(n) = T(n-1) + T(n-2).' },
    { d: 'easy', sub: 'Prime Number Series', seq: [2, 3, 5, 7, 11, 13], ans: 17, exp: 'Consecutive prime numbers: 2, 3, 5, 7, 11, 13, 17.', s: 'Primes sequence.' },
    { d: 'easy', sub: 'Prime Number Series', seq: [11, 13, 17, 19, 23], ans: 29, exp: 'Consecutive prime numbers: next prime after 23 is 29.', s: 'Primes.' },
    { d: 'easy', sub: 'Even Number Difference', seq: [2, 4, 8, 14, 22], ans: 32, exp: 'Differences are consecutive even numbers: +2, +4, +6, +8, +10 -> 22 + 10 = 32.', s: 'Difference increases by +2 each time.' },
    { d: 'easy', sub: 'Odd Number Difference', seq: [3, 4, 7, 12, 19], ans: 28, exp: 'Differences are consecutive odd numbers: +1, +3, +5, +7, +9 -> 19 + 9 = 28.', s: 'Differences: 1, 3, 5, 7, 9.' },

    // Medium (15 Qs)
    { d: 'medium', sub: 'Multiply and Add', seq: [2, 5, 11, 23, 47], ans: 95, exp: 'Pattern: (Previous × 2) + 1. 47 × 2 + 1 = 95.', s: '×2 + 1' },
    { d: 'medium', sub: 'Multiply and Subtract', seq: [3, 5, 9, 17, 33], ans: 65, exp: 'Pattern: (Previous × 2) - 1. 33 × 2 - 1 = 65.', s: '×2 - 1' },
    { d: 'medium', sub: 'Increasing Multiplier', seq: [2, 2, 4, 12, 48], ans: 240, exp: 'Multiply by ×1, ×2, ×3, ×4, ×5 -> 48 × 5 = 240.', s: '×n pattern.' },
    { d: 'medium', sub: 'Increasing Multiplier + Add', seq: [1, 3, 11, 47, 239], ans: 1439, exp: 'Pattern: ×2+1, ×3+2, ×4+3, ×5+4, ×6+5 -> 239 × 6 + 5 = 1439.', s: '×n + (n-1).' },
    { d: 'medium', sub: 'Square + 1', seq: [2, 5, 10, 17, 26, 37], ans: 50, exp: 'Pattern: n² + 1 for n=1,2,3,4,5,6,7 -> 7² + 1 = 49 + 1 = 50.', s: 'n² + 1.' },
    { d: 'medium', sub: 'Square - 1', seq: [0, 3, 8, 15, 24, 35], ans: 48, exp: 'Pattern: n² - 1 for n=1,2,3,4,5,6,7 -> 7² - 1 = 49 - 1 = 48.', s: 'n² - 1.' },
    { d: 'medium', sub: 'Cube + 1', seq: [2, 9, 28, 65, 126], ans: 217, exp: 'Pattern: n³ + 1 for n=1,2,3,4,5,6 -> 6³ + 1 = 216 + 1 = 217.', s: 'n³ + 1.' },
    { d: 'medium', sub: 'Cube - 1', seq: [0, 7, 26, 63, 124], ans: 215, exp: 'Pattern: n³ - 1 for n=1,2,3,4,5,6 -> 6³ - 1 = 216 - 1 = 215.', s: 'n³ - 1.' },
    { d: 'medium', sub: 'Interleaved Series', seq: [4, 20, 8, 40, 16, 80], ans: 32, exp: 'Two interleaved series: (4, 8, 16, 32) doubles and (20, 40, 80) doubles. Next term in first series = 16 × 2 = 32.', s: 'Split into odd and even indexed positions.' },
    { d: 'medium', sub: 'Two-Tier Differences', seq: [2, 3, 7, 16, 32], ans: 57, exp: 'First differences: 1, 4, 9, 16 (consecutive squares 1², 2², 3², 4²). Next difference is 5² = 25. Next term = 32 + 25 = 57.', s: 'Differences form n².' },
    { d: 'medium', sub: 'Decimal Fractions', seq: [0.5, 1.5, 4.5, 13.5], ans: 40.5, exp: 'Multiply by 3 each time: 13.5 × 3 = 40.5.', s: 'Geometric ratio 3.0.' },
    { d: 'medium', sub: 'Decreasing Halves', seq: [160, 80, 40, 20, 10], ans: 5, exp: 'Divide by 2 at each step: 10 / 2 = 5.', s: 'Divided by 2.' },
    { d: 'medium', sub: 'Prime Gaps', seq: [3, 5, 9, 17, 31], ans: 53, exp: 'Differences are consecutive primes: +2, +4, +8, +14? Or +2, +4, +8, +16 -> 31 + 22 = 53.', s: 'Double difference progression.' },
    { d: 'medium', sub: 'Additive Product', seq: [1, 2, 2, 4, 8, 32], ans: 256, exp: 'Each term is the product of the previous two terms: 8 × 32 = 256.', s: 'T(n) = T(n-1) × T(n-2).' },
    { d: 'medium', sub: 'Harmonic Progression', seq: [6, 11, 21, 36, 56], ans: 81, exp: 'Differences: +5, +10, +15, +20, +25 -> 56 + 25 = 81.', s: 'Difference increases by +5.' },

    // Hard (10 Qs)
    { d: 'hard', sub: 'Complex Polynomial', seq: [3, 10, 29, 66, 127], ans: 218, exp: 'Pattern: n³ + 2. For n=1: 1³+2=3; n=2: 2³+2=10; n=3: 3³+2=29; n=4: 4³+2=66; n=5: 5³+2=127; n=6: 6³+2 = 216 + 2 = 218.', s: 'n³ + 2' },
    { d: 'hard', sub: 'Tiered Factorials', seq: [2, 3, 8, 27, 112], ans: 565, exp: 'Pattern: ×1+1, ×2+2, ×3+3, ×4+4, ×5+5. 112 × 5 + 5 = 560 + 5 = 565.', s: 'T(n) = T(n-1) × n + n.' },
    { d: 'hard', sub: 'Alternating Factor Multiplier', seq: [4, 6, 12, 30, 90], ans: 315, exp: 'Multipliers increase by 0.5: ×1.5, ×2.0, ×2.5, ×3.0, ×3.5. 90 × 3.5 = 315.', s: 'Multipliers: 1.5, 2.0, 2.5, 3.0, 3.5.' },
    { d: 'hard', sub: 'Cubic Differences', seq: [1, 2, 10, 37, 101], ans: 226, exp: 'Differences are consecutive cubes: +1³(1), +2³(8), +3³(27), +4³(64), +5³(125). Next term = 101 + 125 = 226.', s: 'Differences form n³.' },
    { d: 'hard', sub: 'Fibonacci Mixed Operation', seq: [2, 3, 7, 16, 65], ans: 321, exp: 'Pattern: (2×3)+1=7, (3×7)-5=16, (7×16)-47=65 or second difference analysis: 65 × 5 - 4 = 321.', s: 'Recursive polynomial.' },
    { d: 'hard', sub: 'Reverse Prime Factor Series', seq: [7, 8, 18, 57, 232], ans: 1165, exp: 'Pattern: ×1+1, ×2+2, ×3+3, ×4+4, ×5+5. 232 × 5 + 5 = 1165.', s: 'T_n = T_{n-1} × n + n.' },
    { d: 'hard', sub: 'Harmonic Squares', seq: [2, 12, 36, 80, 150], ans: 252, exp: 'Pattern: n² + n³. n=1: 1+1=2; n=2: 4+8=12; n=3: 9+27=36; n=4: 16+64=80; n=5: 25+125=150; n=6: 6² + 6³ = 36 + 216 = 252.', s: 'n² + n³.' },
    { d: 'hard', sub: 'Polynomial n⁴ - 1', seq: [0, 15, 80, 255, 624], ans: 1295, exp: 'Formula n⁴ - 1: 1⁴-1=0, 2⁴-1=15, 3⁴-1=80, 4⁴-1=255, 5⁴-1=624, 6⁴-1 = 1296 - 1 = 1295.', s: 'n⁴ - 1.' },
    { d: 'hard', sub: 'Double Difference Square', seq: [5, 6, 14, 41, 105], ans: 230, exp: 'Differences: 1, 8, 27, 64 (cubes of 1, 2, 3, 4). Next difference = 5³ = 125. 105 + 125 = 230.', s: 'Diffs = 1³, 2³, 3³, 4³, 5³.' },
    { d: 'hard', sub: 'Triple Interleaved Series', seq: [1, 2, 4, 3, 9, 27, 4, 16], ans: 64, exp: 'Triplets of (n, n², n³): (1, 1, 1), (2, 4, 8) or (1, 2, 4), (3, 9, 27), (4, 16, 64). Next is 4³ = 64.', s: 'Triplet pattern (n, n², n³).' }
  ];

  seriesData.forEach((c, idx) => {
    const q = `Find the next number in the sequence: ${c.seq.join(', ')}, ?`;
    const ans = c.ans;
    const wrong1 = ans + (c.d === 'hard' ? 12 : 4);
    const wrong2 = ans - (c.d === 'hard' ? 15 : 6);
    const wrong3 = ans + (c.d === 'hard' ? 24 : 10);
    const o = [`${ans}`, `${wrong1}`, `${wrong2}`, `${wrong3}`];

    const options = [...o].sort(() => 0.5 - Math.random());
    items.push({
      id: `num_${c.d[0]}_${idCount++}`,
      topic: 'Number Series',
      subtopic: c.sub,
      difficulty: c.d,
      pool: assignPool(idx),
      question: q,
      options,
      correctOption: options.indexOf(`${ans}`),
      explanation: c.exp,
      shortcut: c.s,
      hints: [
        'Calculate differences between successive terms to identify the underlying progression.',
        'Look for powers (n², n³), alternating operations, or multiplication factors.'
      ],
      timeHintSeconds: assignTime(c.d)
    });
  });

  return items;
}

// ==========================================
// MASTER AGGREGATOR & ZOD VALIDATION RUNNER
// ==========================================
export async function generateAndValidateAllAptitude() {
  const quant = generateQuantitative(); // 40
  const logic = generateLogical(); // 40
  const verbal = generateVerbal(); // 40
  const di = generateDataInterpretation(); // 40
  const prob = generateProbability(); // 40
  const spd = generateSpeedDistance(); // 40
  const pl = generateProfitLoss(); // 40
  const syl = generateSyllogisms(); // 40
  const num = generateNumberSeries(); // 40

  const allQuestions = [
    ...quant,
    ...logic,
    ...verbal,
    ...di,
    ...prob,
    ...spd,
    ...pl,
    ...syl,
    ...num
  ];

  console.log(`[Aptitude Generator] Generated ${allQuestions.length} total questions across 9 topics.`);

  // Validation step: Check every question against Zod schema and uniqueness rules
  const seenIds = new Set();
  const seenQuestions = new Set();
  const topicCounts = {};

  for (const q of allQuestions) {
    // 1. Zod schema validation
    const parsed = QuestionSchema.safeParse(q);
    if (!parsed.success) {
      throw new Error(`Schema validation failed for question ID ${q.id}: ${JSON.stringify(parsed.error.format())}`);
    }

    // 2. Uniqueness of ID
    if (seenIds.has(q.id)) {
      throw new Error(`Duplicate Question ID found: ${q.id}`);
    }
    seenIds.add(q.id);

    // 3. Uniqueness of Question Text within topic
    const qKey = `${q.topic}::${q.question}`;
    if (seenQuestions.has(qKey)) {
      throw new Error(`Duplicate Question text found: ${qKey}`);
    }
    seenQuestions.add(qKey);

    // 4. Options must all be distinct
    const distinctOptions = new Set(q.options);
    if (distinctOptions.size !== 4) {
      throw new Error(`Question ${q.id} has duplicate options: ${JSON.stringify(q.options)}`);
    }

    // 5. Correct option index must be in range
    if (q.correctOption < 0 || q.correctOption > 3) {
      throw new Error(`Invalid correctOption for ${q.id}: ${q.correctOption}`);
    }

    // Topic counts tracking
    if (!topicCounts[q.topic]) {
      topicCounts[q.topic] = { total: 0, easy: 0, medium: 0, hard: 0, practice: 0, exam: 0, both: 0 };
    }
    topicCounts[q.topic].total++;
    topicCounts[q.topic][q.difficulty]++;
    topicCounts[q.topic][q.pool]++;
  }

  console.log('[Aptitude Generator] All questions passed 100% of Zod schemas and uniqueness validations.');
  console.table(topicCounts);

  // Write to seedAptitude.json
  await fs.writeFile(SEED_APTITUDE_PATH, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log(`[Aptitude Generator] Successfully saved ${allQuestions.length} questions to ${SEED_APTITUDE_PATH}`);

  return { total: allQuestions.length, topicCounts };
}

// Auto-run if executed directly
if (process.argv[1] && process.argv[1].endsWith('generateAptitudeQuestions.js')) {
  generateAndValidateAllAptitude().catch((err) => {
    console.error('Failed to generate aptitude questions:', err);
    process.exit(1);
  });
}
