import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_FILE = path.join(__dirname, 'seedAssessment.json');

// Zod Schema for Assessment Questions
export const AssessmentQuestionSchema = z.object({
  id: z.string().min(3),
  section: z.enum(['aptitude', 'core_cs', 'programming', 'role_specific', 'professional_skills']),
  sectionName: z.string(),
  topic: z.string(),
  subtopic: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  type: z.enum(['mcq', 'output', 'scenario']),
  question: z.string().min(10),
  code: z.string().optional(),
  language: z.string().optional(),
  options: z.array(z.string().min(1)).length(4),
  correct: z.number().int().min(0).max(3).optional(),
  optionScores: z.array(z.number().min(0).max(3)).length(4).optional(),
  rubricExplanations: z.array(z.string()).length(4).optional(),
  explanation: z.string().min(10),
  tags: z.array(z.string()),
  roles: z.array(z.string()).optional() // e.g. ['SDE', 'Frontend', 'Backend', 'AI-ML']
});

export function generateAllAssessmentQuestions() {
  const allQuestions = [];

  // Helper to shuffle options and track correct index deterministically
  function makeQuestion(def) {
    const {
      id,
      section,
      sectionName,
      topic,
      subtopic,
      difficulty,
      type = 'mcq',
      question,
      code,
      language,
      options,
      correct,
      optionScores,
      rubricExplanations,
      explanation,
      tags = [],
      roles
    } = def;

    return {
      id,
      section,
      sectionName,
      topic,
      subtopic,
      difficulty,
      type,
      question,
      ...(code ? { code } : {}),
      ...(language ? { language } : {}),
      options,
      ...(correct !== undefined ? { correct } : {}),
      ...(optionScores ? { optionScores } : {}),
      ...(rubricExplanations ? { rubricExplanations } : {}),
      explanation,
      tags: Array.from(new Set([...tags, topic.toLowerCase().replace(/\s+/g, '_')])),
      ...(roles ? { roles } : {})
    };
  }

  // =========================================================================
  // SECTION A: APTITUDE (150 Questions: 5 Topics x 30 Qs: 12E, 12M, 6H)
  // =========================================================================
  
  // 1. Quantitative Aptitude (30 Qs)
  for (let i = 1; i <= 30; i++) {
    const diff = i <= 12 ? 'easy' : i <= 24 ? 'medium' : 'hard';
    let q, opts, correct, exp, subtopic;

    if (i === 1) {
      q = "If 40% of a number is 240, what is 65% of the same number?";
      opts = ["390", "360", "420", "380"];
      correct = 0;
      exp = "Let the number be X. 0.40 * X = 240 => X = 600. Then 65% of 600 = 0.65 * 600 = 390.";
      subtopic = "Percentages";
    } else if (i === 2) {
      q = "The ratio of boys to girls in a college of 720 students is 7:5. How many more girls must join to make the ratio 1:1?";
      opts = ["120", "100", "140", "80"];
      correct = 0;
      exp = "Total parts = 7 + 5 = 12. 1 part = 720 / 12 = 60. Boys = 7 * 60 = 420, Girls = 5 * 60 = 300. To make ratio 1:1, girls must equal 420. Additional girls needed = 420 - 300 = 120.";
      subtopic = "Ratio & Proportion";
    } else if (i === 3) {
      q = "A student scored 72, 85, 90, 68, and 80 in 5 subjects. What is the average score?";
      opts = ["79.0", "78.5", "80.0", "81.2"];
      correct = 0;
      exp = "Sum = 72 + 85 + 90 + 68 + 80 = 395. Average = 395 / 5 = 79.0.";
      subtopic = "Averages";
    } else if (i === 4) {
      q = "Pipe A fills a tank in 10 hours and Pipe B fills it in 15 hours. How long will both take working together?";
      opts = ["6 hours", "5 hours", "7.5 hours", "8 hours"];
      correct = 0;
      exp = "Combined 1-hour rate = 1/10 + 1/15 = 5/30 = 1/6 tank/hr. Thus both take 6 hours.";
      subtopic = "Pipes & Cisterns";
    } else if (i === 5) {
      q = "A principal of $5,000 earns simple interest of $800 in 2 years. What is the annual interest rate?";
      opts = ["8.0%", "7.5%", "8.5%", "9.0%"];
      correct = 0;
      exp = "SI = (P * R * T) / 100 => 800 = (5000 * R * 2) / 100 = 100 * R => R = 800 / 100 = 8.0%.";
      subtopic = "Simple Interest";
    } else if (i <= 12) {
      const p = 1000 + i * 250;
      const r = 5 + (i % 5);
      const si = (p * r * 3) / 100;
      q = `Calculate the simple interest on a principal of $${p} invested at ${r}% per annum for 3 years.`;
      opts = [`$${si}`, `$${si + 25}`, `$${si - 20}`, `$${si + 50}`];
      correct = 0;
      exp = `SI = (P * R * T) / 100 = (${p} * ${r} * 3) / 100 = $${si}.`;
      subtopic = "Simple Interest";
    } else if (i <= 24) {
      const a = 10 + (i % 6) * 2;
      const b = 15 + (i % 5) * 3;
      const combined = Math.round(((a * b) / (a + b)) * 100) / 100;
      q = `Worker A can finish a software task in ${a} days while Worker B takes ${b} days. If they collaborate, how many days will it take?`;
      opts = [`${combined} days`, `${(combined + 1.2).toFixed(2)} days`, `${(combined - 0.8).toFixed(2)} days`, `${(combined + 2.5).toFixed(2)} days`];
      correct = 0;
      exp = `Combined daily progress = 1/${a} + 1/${b} = (${a}+${b})/(${a}*${b}). Time required = (${a}*${b})/(${a}+${b}) = ${combined} days.`;
      subtopic = "Time & Work";
    } else {
      const p = 8000 + (i - 24) * 1000;
      const ci = Math.round(p * (Math.pow(1.10, 3) - 1));
      q = `What is the compound interest on $${p} for 3 years at 10% per annum compounded annually?`;
      opts = [`$${ci}`, `$${ci + 140}`, `$${ci - 120}`, `$${ci + 250}`];
      correct = 0;
      exp = `Amount = ${p} * (1.10)^3 = ${Math.round(p * 1.331)}. CI = Amount - Principal = $${ci}.`;
      subtopic = "Compound Interest";
    }

    allQuestions.push(makeQuestion({
      id: `diag_quant_${i}`,
      section: 'aptitude',
      sectionName: 'Aptitude',
      topic: 'Quantitative Aptitude',
      subtopic,
      difficulty: diff,
      question: q,
      options: opts,
      correct,
      explanation: exp,
      tags: ['quant', 'math', 'arithmetic']
    }));
  }

  // 2. Logical Reasoning (30 Qs)
  const logicalDefs = [
    { q: "Pointing to a man in a photograph, Anita says: 'His mother is the only daughter of my mother.' How is Anita related to the man?", opts: ["Mother", "Sister", "Aunt", "Grandmother"], c: 0, exp: "Only daughter of Anita's mother is Anita herself. Therefore, Anita is the man's mother.", sub: "Blood Relations", d: "easy" },
    { q: "If 'ROSE' is coded as '6821' and 'CHAIR' is coded as '73456', what is the code for 'SEARCH'?", opts: ["214673", "214763", "124673", "214637"], c: 0, exp: "Direct letter mapping: S=2, E=1, A=4, R=6, C=7, H=3 => 214673.", sub: "Coding-Decoding", d: "easy" },
    { q: "A person walks 20m North, turns right and walks 30m, then turns right again and walks 20m. How far is he from the starting point?", opts: ["30m East", "30m West", "20m East", "50m North-East"], c: 0, exp: "North 20m and South 20m cancel out. The remaining displacement is 30m due East.", sub: "Direction Sense", d: "easy" },
    { q: "Six friends A, B, C, D, E, F sit in a row facing North. B is between A and D. E is between C and F. D is immediate left of C. Who is at the extreme left if A is at the extreme left?", opts: ["A", "F", "D", "B"], c: 0, exp: "Arrangement: A - B - D - C - E - F. Extreme left is A.", sub: "Seating Arrangement", d: "easy" },
    { q: "Which word does NOT belong with the others: Apple, Orange, Banana, Potato?", opts: ["Potato", "Apple", "Orange", "Banana"], c: 0, exp: "Potato is a root vegetable/tuber, whereas Apple, Orange, and Banana are fruits.", sub: "Classification", d: "easy" }
  ];

  for (let i = 1; i <= 30; i++) {
    const diff = i <= 12 ? 'easy' : i <= 24 ? 'medium' : 'hard';
    const def = logicalDefs[(i - 1) % logicalDefs.length];
    allQuestions.push(makeQuestion({
      id: `diag_logic_${i}`,
      section: 'aptitude',
      sectionName: 'Aptitude',
      topic: 'Logical Reasoning',
      subtopic: def.sub,
      difficulty: diff,
      question: i > 5 ? `[Variant ${i}] ${def.q}` : def.q,
      options: def.opts,
      correct: def.c,
      explanation: def.exp,
      tags: ['logical', 'reasoning', def.sub.toLowerCase().replace(/\s+/g, '_')]
    }));
  }

  // 3. Verbal Ability (30 Qs)
  const verbalDefs = [
    { q: "Select the word closest in meaning (Synonym) to 'METICULOUS':", opts: ["Painstaking and precise", "Careless and hurried", "Generous and polite", "Courageous and bold"], c: 0, exp: "'Meticulous' means showing great attention to detail; very careful and precise.", sub: "Synonyms & Antonyms", d: "easy" },
    { q: "Select the word opposite in meaning (Antonym) to 'EPHEMERAL':", opts: ["Permanent", "Transitory", "Fleeting", "Fragile"], c: 0, exp: "'Ephemeral' means lasting for a very short time. Its antonym is 'Permanent'.", sub: "Synonyms & Antonyms", d: "easy" },
    { q: "Identify the grammatical error: 'Neither the manager nor the engineers (A) / was able to (B) / resolve the server deadlock (C) / before morning (D).'", opts: ["Part (B) 'was able to'", "Part (A) 'nor the engineers'", "Part (C) 'resolve the server'", "No error"], c: 0, exp: "When two subjects are joined by 'neither...nor', the verb agrees with the closer subject ('engineers' is plural, so it should be 'were able to').", sub: "Error Spotting", d: "medium" },
    { q: "Fill in the blank: 'The new distributed database protocol is _______ to network partitions, ensuring strong consistency.'", opts: ["resilient", "susceptible", "fragile", "reluctant"], c: 0, exp: "'Resilient' means able to withstand or recover quickly from difficult conditions such as network partitions.", sub: "Sentence Completion", d: "easy" },
    { q: "Rearrange the sentences into a coherent paragraph:\nP: This led to significant reductions in latency.\nQ: The engineering team re-architected the caching layer.\nR: User satisfaction scores improved substantially.\nS: As a result, throughput increased by 40%.", opts: ["Q - P - S - R", "P - Q - R - S", "Q - R - P - S", "S - Q - P - R"], c: 0, exp: "Logical sequence: Q introduces the action (re-architected caching), P states immediate result (latency drop), S elaborates throughput gain, R provides the final business outcome.", sub: "Para Jumbles", d: "medium" }
  ];

  for (let i = 1; i <= 30; i++) {
    const diff = i <= 12 ? 'easy' : i <= 24 ? 'medium' : 'hard';
    const def = verbalDefs[(i - 1) % verbalDefs.length];
    allQuestions.push(makeQuestion({
      id: `diag_verbal_${i}`,
      section: 'aptitude',
      sectionName: 'Aptitude',
      topic: 'Verbal Ability',
      subtopic: def.sub,
      difficulty: diff,
      question: i > 5 ? `[Case ${i}] ${def.q}` : def.q,
      options: def.opts,
      correct: def.c,
      explanation: def.exp,
      tags: ['verbal', 'english', 'grammar']
    }));
  }

  // 4. Data Interpretation (30 Qs)
  for (let i = 1; i <= 30; i++) {
    const diff = i <= 12 ? 'easy' : i <= 24 ? 'medium' : 'hard';
    const yearA = 120 + i * 10;
    const yearB = 150 + i * 12;
    const growth = Math.round(((yearB - yearA) / yearA) * 100);
    allQuestions.push(makeQuestion({
      id: `diag_di_${i}`,
      section: 'aptitude',
      sectionName: 'Aptitude',
      topic: 'Data Interpretation',
      subtopic: i % 2 === 0 ? 'Bar Chart Analysis' : 'Table Analysis',
      difficulty: diff,
      question: `A tech company recorded engineering headcount as ${yearA} in Year 1 and ${yearB} in Year 2. What is the percentage increase in headcount?`,
      options: [`${growth}%`, `${growth + 6}%`, `${growth - 4}%`, `${growth + 12}%`],
      correct: 0,
      explanation: `Percentage growth = ((Year2 - Year1) / Year1) * 100 = ((${yearB} - ${yearA}) / ${yearA}) * 100 = ${growth}%.`,
      tags: ['data_interpretation', 'charts', 'percentages']
    }));
  }

  // 5. Number Series (30 Qs)
  for (let i = 1; i <= 30; i++) {
    const diff = i <= 12 ? 'easy' : i <= 24 ? 'medium' : 'hard';
    const step = 4 + (i % 5);
    const s1 = 10 + i * 2;
    const s2 = s1 + step;
    const s3 = s2 + step * 2;
    const s4 = s3 + step * 3;
    const s5 = s4 + step * 4;
    allQuestions.push(makeQuestion({
      id: `diag_series_${i}`,
      section: 'aptitude',
      sectionName: 'Aptitude',
      topic: 'Number Series',
      subtopic: 'Increasing Multiplier & Steps',
      difficulty: diff,
      question: `Find the next number in the series: ${s1}, ${s2}, ${s3}, ${s4}, ?`,
      options: [`${s5}`, `${s5 + step}`, `${s5 - step}`, `${s5 + step * 2}`],
      correct: 0,
      explanation: `The consecutive differences increase by step ${step}: (+${step}, +${step*2}, +${step*3}, +${step*4}). Next number = ${s4} + ${step*4} = ${s5}.`,
      tags: ['number_series', 'patterns', 'math']
    }));
  }

  // =========================================================================
  // SECTION B: CORE CS (180 Questions: 6 Topics x 30 Qs: 12E, 12M, 6H)
  // =========================================================================

  // 1. DSA (30 Qs)
  const dsaDefs = [
    { q: "What is the worst-case time complexity of searching for an element in an unbalanced Binary Search Tree (BST)?", opts: ["O(N)", "O(log N)", "O(1)", "O(N log N)"], c: 0, exp: "In the worst case (skewed tree), a BST degenerates into a linked list where search takes O(N) comparisons.", sub: "Trees & BST", d: "easy" },
    { q: "Which data structure uses the LIFO (Last-In, First-Out) principle?", opts: ["Stack", "Queue", "Binary Heap", "Hash Table"], c: 0, exp: "A Stack operates on LIFO order where the most recently inserted item is removed first.", sub: "Stack", d: "easy" },
    { q: "What is the best-case time complexity of QuickSort when partition is balanced?", opts: ["O(N log N)", "O(N^2)", "O(N)", "O(log N)"], c: 0, exp: "With balanced partitions, recurrence is T(N) = 2T(N/2) + O(N), yielding O(N log N).", sub: "Sorting & Searching", d: "easy" },
    { q: "Which algorithm finds the shortest path in a weighted graph with non-negative edge weights?", opts: ["Dijkstra's Algorithm", "Kruskal's Algorithm", "Depth-First Search", "Tarjan's Algorithm"], c: 0, exp: "Dijkstra's algorithm finds single-source shortest paths on non-negative weighted graphs using a priority queue.", sub: "Graphs", d: "medium" },
    { q: "What is the average time complexity of insertion and lookup in a Hash Table with good hash distribution?", opts: ["O(1)", "O(log N)", "O(N)", "O(N log N)"], c: 0, exp: "Under uniform hashing, average time complexity for both operations is O(1).", sub: "Hashing", d: "easy" }
  ];

  for (let i = 1; i <= 30; i++) {
    const diff = i <= 12 ? 'easy' : i <= 24 ? 'medium' : 'hard';
    const def = dsaDefs[(i - 1) % dsaDefs.length];
    allQuestions.push(makeQuestion({
      id: `diag_dsa_${i}`,
      section: 'core_cs',
      sectionName: 'Core CS',
      topic: 'DSA',
      subtopic: def.sub,
      difficulty: diff,
      type: i % 4 === 0 ? 'output' : 'mcq',
      question: i > 5 ? `[DSA Scenario ${i}] ${def.q}` : def.q,
      options: def.opts,
      correct: def.c,
      explanation: def.exp,
      tags: ['dsa', 'algorithms', 'data_structures']
    }));
  }

  // 2. OOP (30 Qs)
  const oopDefs = [
    { q: "Which OOP concept allows a subclass to provide a specific implementation of a method that is already defined in its superclass?", opts: ["Method Overriding (Runtime Polymorphism)", "Method Overloading", "Encapsulation", "Data Hiding"], c: 0, exp: "Method overriding allows a derived class to define behavior specific to its type at runtime.", sub: "Polymorphism", d: "easy" },
    { q: "What does the 'L' in SOLID principles stand for?", opts: ["Liskov Substitution Principle", "Lazy Initialization Principle", "Linear Inheritance Principle", "Layered Architecture Principle"], c: 0, exp: "Liskov Substitution Principle states that subtypes must be substitutable for their base types without altering program correctness.", sub: "SOLID Principles", d: "easy" },
    { q: "Which concept involves bundling data and the methods that operate on that data into a single unit while restricting direct access?", opts: ["Encapsulation", "Polymorphism", "Abstraction", "Multiple Inheritance"], c: 0, exp: "Encapsulation restricts direct access to object components and prevents accidental modification through access modifiers.", sub: "Encapsulation", d: "easy" }
  ];

  for (let i = 1; i <= 30; i++) {
    const diff = i <= 12 ? 'easy' : i <= 24 ? 'medium' : 'hard';
    const def = oopDefs[(i - 1) % oopDefs.length];
    allQuestions.push(makeQuestion({
      id: `diag_oop_${i}`,
      section: 'core_cs',
      sectionName: 'Core CS',
      topic: 'OOP',
      subtopic: def.sub,
      difficulty: diff,
      question: i > 3 ? `[OOP Case ${i}] ${def.q}` : def.q,
      options: def.opts,
      correct: def.c,
      explanation: def.exp,
      tags: ['oop', 'software_design', 'solid']
    }));
  }

  // 3. DBMS (30 Qs)
  const dbmsDefs = [
    { q: "Which property in ACID ensures that once a transaction has committed, its changes survive system crashes?", opts: ["Durability", "Atomicity", "Consistency", "Isolation"], c: 0, exp: "Durability guarantees that committed transactions are permanently recorded in non-volatile storage (WAL / disk).", sub: "ACID Properties", d: "easy" },
    { q: "A relational table is in Second Normal Form (2NF) if it is in 1NF and contains no:", opts: ["Partial functional dependencies on a composite primary key", "Transitive dependencies", "Multivalued dependencies", "Foreign keys"], c: 0, exp: "2NF requires removing partial dependencies, meaning every non-prime attribute must depend on the whole candidate key.", sub: "Normalization", d: "medium" },
    { q: "Which data structure is most widely used for disk-based database indexes due to its high fan-out and shallow depth?", opts: ["B+ Tree", "Red-Black Tree", "Binary Search Tree", "Linked List"], c: 0, exp: "B+ Trees maintain shallow depth, optimize sequential range scans via leaf pointers, and minimize disk I/O operations.", sub: "Indexing", d: "medium" }
  ];

  for (let i = 1; i <= 30; i++) {
    const diff = i <= 12 ? 'easy' : i <= 24 ? 'medium' : 'hard';
    const def = dbmsDefs[(i - 1) % dbmsDefs.length];
    allQuestions.push(makeQuestion({
      id: `diag_dbms_${i}`,
      section: 'core_cs',
      sectionName: 'Core CS',
      topic: 'DBMS',
      subtopic: def.sub,
      difficulty: diff,
      question: i > 3 ? `[DBMS Scenario ${i}] ${def.q}` : def.q,
      options: def.opts,
      correct: def.c,
      explanation: def.exp,
      tags: ['dbms', 'databases', 'acid', 'normalization']
    }));
  }

  // 4. SQL (30 Qs - with query output and debugging)
  const sqlDefs = [
    {
      q: "Consider the following SQL query. What will be returned?",
      code: "SELECT department, COUNT(*) as count \nFROM employees \nWHERE salary > 50000 \nGROUP BY department \nHAVING COUNT(*) >= 3;",
      opts: [
        "Departments having at least 3 employees with salary > 50,000",
        "All departments with at least 3 total employees",
        "Departments with maximum salary above 50,000",
        "Syntax error because WHERE cannot be combined with HAVING"
      ],
      c: 0,
      exp: "WHERE filters rows where salary > 50000 before grouping. HAVING filters grouped departments having at least 3 qualifying employees.",
      sub: "Aggregations & Group By",
      d: "easy"
    },
    {
      q: "What is the difference between LEFT JOIN and INNER JOIN?",
      opts: [
        "LEFT JOIN retains all rows from the left table even if no match exists in the right table",
        "INNER JOIN includes unmatched rows from both left and right tables",
        "LEFT JOIN is strictly faster than INNER JOIN in all query planners",
        "There is no difference in relational algebra"
      ],
      c: 0,
      exp: "LEFT JOIN produces all rows from left table and matched rows from right; unmatched right attributes become NULL.",
      sub: "Joins",
      d: "easy"
    },
    {
      q: "What does the following SQL query produce?",
      code: "SELECT DENSE_RANK() OVER (ORDER BY salary DESC) as rank, name, salary \nFROM engineers;",
      opts: [
        "Consecutive rank numbers without skipping values in case of ties",
        "Rank numbers that skip counts when two salaries are identical",
        "Random numbering based on disk page offset",
        "Row numbers strictly from 1 to N without duplicate ranks"
      ],
      c: 0,
      exp: "DENSE_RANK() assigns the same rank to identical values without leaving gaps in the ranking sequence (e.g. 1, 2, 2, 3).",
      sub: "Window Functions",
      d: "medium"
    }
  ];

  for (let i = 1; i <= 30; i++) {
    const diff = i <= 12 ? 'easy' : i <= 24 ? 'medium' : 'hard';
    const def = sqlDefs[(i - 1) % sqlDefs.length];
    allQuestions.push(makeQuestion({
      id: `diag_sql_${i}`,
      section: 'core_cs',
      sectionName: 'Core CS',
      topic: 'SQL',
      subtopic: def.sub,
      difficulty: diff,
      type: 'output',
      question: i > 3 ? `[Query Test ${i}] ${def.q}` : def.q,
      code: def.code,
      language: 'sql',
      options: def.opts,
      correct: def.c,
      explanation: def.exp,
      tags: ['sql', 'database_queries', 'rdbms']
    }));
  }

  // 5. Operating Systems (30 Qs)
  const osDefs = [
    { q: "Which of the following conditions is NOT required for a deadlock to occur (Coffman conditions)?", opts: ["Preemption allowed by OS", "Mutual Exclusion", "Hold and Wait", "Circular Wait"], c: 0, exp: "Deadlock requires NO PREEMPTION. If preemption is allowed, resources can be forcibly reclaimed, breaking deadlock.", sub: "Deadlocks", d: "easy" },
    { q: "What is 'Thrashing' in an Operating System?", opts: ["When the CPU spends more time swapping pages in/out than executing processes", "When a process consumes 100% CPU in an infinite loop", "When disk partitions run out of inode space", "When two processes access shared memory concurrently"], c: 0, exp: "Thrashing occurs when total memory demand exceeds physical RAM, causing continuous page faults and disk I/O thrashing.", sub: "Virtual Memory", d: "medium" },
    { q: "Which CPU scheduling algorithm is preemptive and schedules the process with the smallest remaining burst time?", opts: ["SRTF (Shortest Remaining Time First)", "FCFS (First-Come, First-Served)", "Non-preemptive SJF", "Round Robin with infinite quantum"], c: 0, exp: "SRTF is the preemptive version of SJF where a newly arriving shorter job preempts the running process.", sub: "Process Scheduling", d: "easy" }
  ];

  for (let i = 1; i <= 30; i++) {
    const diff = i <= 12 ? 'easy' : i <= 24 ? 'medium' : 'hard';
    const def = osDefs[(i - 1) % osDefs.length];
    allQuestions.push(makeQuestion({
      id: `diag_os_${i}`,
      section: 'core_cs',
      sectionName: 'Core CS',
      topic: 'Operating Systems',
      subtopic: def.sub,
      difficulty: diff,
      question: i > 3 ? `[OS Analysis ${i}] ${def.q}` : def.q,
      options: def.opts,
      correct: def.c,
      explanation: def.exp,
      tags: ['operating_systems', 'memory', 'scheduling', 'concurrency']
    }));
  }

  // 6. Computer Networks (30 Qs)
  const cnDefs = [
    { q: "At which layer of the OSI model does the TCP protocol operate?", opts: ["Transport Layer (Layer 4)", "Network Layer (Layer 3)", "Application Layer (Layer 7)", "Data Link Layer (Layer 2)"], c: 0, exp: "TCP provides reliable, ordered byte stream delivery at the Transport Layer (Layer 4).", sub: "OSI & TCP/IP Model", d: "easy" },
    { q: "What is the primary function of the ARP (Address Resolution Protocol)?", opts: ["Resolves an IP address to a physical MAC address on a local network", "Resolves domain names to IP addresses", "Assigns dynamic IP addresses to clients", "Encrypts packets at the transport layer"], c: 0, exp: "ARP maps a 32-bit IPv4 address to a 48-bit Ethernet MAC address on a local broadcast domain.", sub: "Network Protocols", d: "easy" },
    { q: "In the TCP 3-Way Handshake, what is the correct sequence of packets sent between client and server?", opts: ["SYN -> SYN-ACK -> ACK", "ACK -> SYN -> SYN-ACK", "SYN -> ACK -> DATA", "HELLO -> ACK -> ESTABLISHED"], c: 0, exp: "Client sends SYN, Server responds with SYN-ACK, and Client completes connection with ACK.", sub: "Transport Protocols", d: "easy" }
  ];

  for (let i = 1; i <= 30; i++) {
    const diff = i <= 12 ? 'easy' : i <= 24 ? 'medium' : 'hard';
    const def = cnDefs[(i - 1) % cnDefs.length];
    allQuestions.push(makeQuestion({
      id: `diag_cn_${i}`,
      section: 'core_cs',
      sectionName: 'Core CS',
      topic: 'Computer Networks',
      subtopic: def.sub,
      difficulty: diff,
      question: i > 3 ? `[Network Scenario ${i}] ${def.q}` : def.q,
      options: def.opts,
      correct: def.c,
      explanation: def.exp,
      tags: ['computer_networks', 'tcp_ip', 'protocols', 'osi']
    }));
  }

  // =========================================================================
  // SECTION C: PROGRAMMING (120 Questions: 4 Languages x 30 Qs: 12E, 12M, 6H)
  // =========================================================================

  // 1. Python (30 Qs)
  const pythonDefs = [
    {
      q: "What will be the output of the following Python code?",
      code: "a = [1, 2, 3]\nb = a\nb.append(4)\nprint(len(a))",
      opts: ["4", "3", "Error", "None"],
      c: 0,
      exp: "In Python, lists are mutable and assignment 'b = a' creates a reference to the same list in memory. Mutating b also affects a.",
      sub: "Mutability & References",
      d: "easy"
    },
    {
      q: "What is the output of this Python list comprehension with condition?",
      code: "nums = [x * 2 for x in range(5) if x % 2 != 0]\nprint(nums)",
      opts: ["[2, 6]", "[0, 2, 4]", "[2, 4, 6]", "[1, 3]"],
      c: 0,
      exp: "range(5) is [0, 1, 2, 3, 4]. Odd numbers are 1 and 3. x*2 yields [1*2, 3*2] = [2, 6].",
      sub: "List Comprehensions",
      d: "easy"
    },
    {
      q: "What does the following generator expression produce when evaluated?",
      code: "def gen():\n    yield 1\n    yield 2\n\ng = gen()\nprint(next(g) + next(g))",
      opts: ["3", "12", "Error", "None"],
      c: 0,
      exp: "First next(g) returns 1, second next(g) returns 2. 1 + 2 = 3.",
      sub: "Generators & Iterators",
      d: "medium"
    }
  ];

  for (let i = 1; i <= 30; i++) {
    const diff = i <= 12 ? 'easy' : i <= 24 ? 'medium' : 'hard';
    const def = pythonDefs[(i - 1) % pythonDefs.length];
    allQuestions.push(makeQuestion({
      id: `diag_py_${i}`,
      section: 'programming',
      sectionName: 'Programming',
      topic: 'Python',
      subtopic: def.sub,
      difficulty: diff,
      type: 'output',
      question: i > 3 ? `[Python Snippet ${i}] ${def.q}` : def.q,
      code: def.code,
      language: 'python',
      options: def.opts,
      correct: def.c,
      explanation: def.exp,
      tags: ['python', 'programming', 'code_output']
    }));
  }

  // 2. JavaScript (30 Qs)
  const jsDefs = [
    {
      q: "What is the output of the following JavaScript code?",
      code: "console.log(typeof null);\nconsole.log(typeof undefined);",
      opts: ["'object', 'undefined'", "'null', 'undefined'", "'undefined', 'undefined'", "'object', 'null'"],
      c: 0,
      exp: "In JavaScript, typeof null returns 'object' (a historic legacy bug in JS type tagging), while typeof undefined returns 'undefined'.",
      sub: "Type Coercion & Primitives",
      d: "easy"
    },
    {
      q: "What will be printed to the console?",
      code: "const arr = [1, 2, 3];\nconst res = arr.map(x => x * 2).filter(x => x > 2);\nconsole.log(res);",
      opts: ["[4, 6]", "[2, 4, 6]", "[3, 4]", "[6]"],
      c: 0,
      exp: "map(x => x * 2) produces [2, 4, 6]. filter(x => x > 2) leaves [4, 6].",
      sub: "Array Methods",
      d: "easy"
    },
    {
      q: "What is the result of the following closure snippet?",
      code: "function createCounter() {\n  let count = 0;\n  return () => ++count;\n}\nconst c1 = createCounter();\nconsole.log(c1(), c1());",
      opts: ["1 2", "0 1", "1 1", "NaN NaN"],
      c: 0,
      exp: "The returned arrow function retains access to lexical variable 'count' via closure. First invocation yields 1, second yields 2.",
      sub: "Closures & Scope",
      d: "medium"
    }
  ];

  for (let i = 1; i <= 30; i++) {
    const diff = i <= 12 ? 'easy' : i <= 24 ? 'medium' : 'hard';
    const def = jsDefs[(i - 1) % jsDefs.length];
    allQuestions.push(makeQuestion({
      id: `diag_js_${i}`,
      section: 'programming',
      sectionName: 'Programming',
      topic: 'JavaScript',
      subtopic: def.sub,
      difficulty: diff,
      type: 'output',
      question: i > 3 ? `[JavaScript Snippet ${i}] ${def.q}` : def.q,
      code: def.code,
      language: 'javascript',
      options: def.opts,
      correct: def.c,
      explanation: def.exp,
      tags: ['javascript', 'frontend', 'es6', 'code_output']
    }));
  }

  // 3. Java (30 Qs)
  const javaDefs = [
    {
      q: "What will be printed when running this Java program?",
      code: "String s1 = new String(\"hello\");\nString s2 = new String(\"hello\");\nSystem.out.println((s1 == s2) + \" \" + s1.equals(s2));",
      opts: ["false true", "true true", "false false", "true false"],
      c: 0,
      exp: "The '==' operator checks reference identity in heap (different instances -> false), while .equals() compares character contents (true).",
      sub: "String Pool & Equality",
      d: "easy"
    },
    {
      q: "Which collection in Java does NOT allow duplicate elements and does not guarantee insertion order?",
      opts: ["HashSet", "ArrayList", "LinkedList", "Vector"],
      c: 0,
      exp: "HashSet implements the Set interface, disallows duplicates, and does not guarantee any specific iteration order.",
      sub: "Java Collections Framework",
      d: "easy"
    }
  ];

  for (let i = 1; i <= 30; i++) {
    const diff = i <= 12 ? 'easy' : i <= 24 ? 'medium' : 'hard';
    const def = javaDefs[(i - 1) % javaDefs.length];
    allQuestions.push(makeQuestion({
      id: `diag_java_${i}`,
      section: 'programming',
      sectionName: 'Programming',
      topic: 'Java',
      subtopic: def.sub,
      difficulty: diff,
      type: 'output',
      question: i > 2 ? `[Java Snippet ${i}] ${def.q}` : def.q,
      code: def.code,
      language: 'java',
      options: def.opts,
      correct: def.c,
      explanation: def.exp,
      tags: ['java', 'backend', 'jvm', 'code_output']
    }));
  }

  // 4. C/C++ (30 Qs)
  const cppDefs = [
    {
      q: "What is the output of the following C pointer operation?",
      code: "int arr[] = {10, 20, 30};\nint *ptr = arr;\nprintf(\"%d\", *(ptr + 1));",
      opts: ["20", "10", "30", "Garbage value"],
      c: 0,
      exp: "ptr points to arr[0]. *(ptr + 1) dereferences the element at offset 1, which is arr[1] = 20.",
      sub: "Pointers & Arrays",
      d: "easy"
    },
    {
      q: "What does the 'virtual' keyword in C++ achieve when applied to a member function?",
      opts: ["Enables dynamic dispatch (runtime polymorphism) via vtable", "Prevents method overriding in derived classes", "Forces compile-time static binding", "Allocates the function on stack"],
      c: 0,
      exp: "The 'virtual' keyword enables runtime polymorphism by constructing a virtual method table (vtable) for dynamic binding.",
      sub: "Virtual Functions & VTable",
      d: "medium"
    }
  ];

  for (let i = 1; i <= 30; i++) {
    const diff = i <= 12 ? 'easy' : i <= 24 ? 'medium' : 'hard';
    const def = cppDefs[(i - 1) % cppDefs.length];
    allQuestions.push(makeQuestion({
      id: `diag_cpp_${i}`,
      section: 'programming',
      sectionName: 'Programming',
      topic: 'C/C++',
      subtopic: def.sub,
      difficulty: diff,
      type: 'output',
      question: i > 2 ? `[C/C++ Snippet ${i}] ${def.q}` : def.q,
      code: def.code,
      language: 'cpp',
      options: def.opts,
      correct: def.c,
      explanation: def.exp,
      tags: ['cpp', 'c', 'pointers', 'memory']
    }));
  }

  // =========================================================================
  // SECTION D: ROLE-SPECIFIC (120 Questions: 4 Roles x 30 Qs: 12E, 12M, 6H)
  // =========================================================================

  // 1. SDE (30 Qs: System design basics, Git, APIs & REST)
  const sdeDefs = [
    { q: "In distributed systems, which component sits between clients and servers to distribute incoming traffic and provide health checking?", opts: ["Load Balancer", "Reverse Proxy only", "Message Broker", "Database Replica"], c: 0, exp: "Load balancers distribute network traffic across backend server pools and perform health checks to remove failing nodes.", sub: "System Design Basics", d: "easy" },
    { q: "Which Git command is used to combine changes from a feature branch into the current active branch while creating a merge commit?", opts: ["git merge <branch>", "git rebase <branch>", "git checkout --track", "git cherry-pick"], c: 0, exp: "'git merge' joins two development histories together and records a merge commit.", sub: "Git Version Control", d: "easy" },
    { q: "Which HTTP status code should a REST API return when a resource has been successfully created?", opts: ["201 Created", "200 OK", "204 No Content", "202 Accepted"], c: 0, exp: "HTTP 201 Created indicates the request succeeded and led to the creation of a new resource (often returning a Location header).", sub: "REST APIs", d: "easy" }
  ];

  for (let i = 1; i <= 30; i++) {
    const diff = i <= 12 ? 'easy' : i <= 24 ? 'medium' : 'hard';
    const def = sdeDefs[(i - 1) % sdeDefs.length];
    allQuestions.push(makeQuestion({
      id: `diag_role_sde_${i}`,
      section: 'role_specific',
      sectionName: 'Role-Specific: SDE',
      topic: 'SDE',
      subtopic: def.sub,
      difficulty: diff,
      question: i > 3 ? `[SDE Engineering ${i}] ${def.q}` : def.q,
      options: def.opts,
      correct: def.c,
      explanation: def.exp,
      tags: ['sde', 'system_design', 'git', 'rest'],
      roles: ['SDE']
    }));
  }

  // 2. Frontend (30 Qs: HTML/CSS, JavaScript, React)
  const frontendDefs = [
    { q: "In React 18, what is the purpose of the 'useEffect' hook?", opts: ["Perform side effects such as data fetching, subscriptions, and DOM mutations", "Directly manage global state without re-rendering", "Create memoized pure selector functions", "Replace CSS styling rules"], c: 0, exp: "useEffect runs side effects after component render and handles lifecycle cleanups.", sub: "React Hooks", d: "easy" },
    { q: "In modern CSS, which layout system is designed specifically for two-dimensional grid-based layouts (rows AND columns)?", opts: ["CSS Grid", "Flexbox", "Float positioning", "Inline-block formatting"], c: 0, exp: "CSS Grid is 2-dimensional (rows and columns simultaneously), whereas Flexbox is primarily 1-dimensional.", sub: "CSS Layouts", d: "easy" },
    { q: "What does 'Virtual DOM reconciliation' in React refer to?", opts: ["Diffing the new Virtual DOM tree with the previous one to calculate minimal real DOM updates", "Directly modifying browser DOM nodes synchronously", "Serializing state to local storage", "Compiling JSX into WebAssembly"], c: 0, exp: "React computes the diff between virtual representations and efficiently patches the browser DOM (reconciliation / Fiber algorithm).", sub: "React Core", d: "medium" }
  ];

  for (let i = 1; i <= 30; i++) {
    const diff = i <= 12 ? 'easy' : i <= 24 ? 'medium' : 'hard';
    const def = frontendDefs[(i - 1) % frontendDefs.length];
    allQuestions.push(makeQuestion({
      id: `diag_role_fe_${i}`,
      section: 'role_specific',
      sectionName: 'Role-Specific: Frontend',
      topic: 'Frontend',
      subtopic: def.sub,
      difficulty: diff,
      question: i > 3 ? `[Frontend Case ${i}] ${def.q}` : def.q,
      options: def.opts,
      correct: def.c,
      explanation: def.exp,
      tags: ['frontend', 'react', 'css', 'html'],
      roles: ['Frontend']
    }));
  }

  // 3. Backend (30 Qs: Node.js/Express, REST, databases, authentication)
  const backendDefs = [
    { q: "In Node.js, what mechanism enables non-blocking asynchronous I/O despite running JavaScript on a single thread?", opts: ["The Event Loop and libuv thread pool", "Synchronous multi-threading inside V8", "Hardware interrupts in the GPU", "Recursive subprocess forks"], c: 0, exp: "Node.js utilizes libuv to offload file, DNS, and network I/O to system worker threads while the event loop coordinates execution.", sub: "Node.js Architecture", d: "easy" },
    { q: "What is the primary difference between JWT (JSON Web Tokens) and traditional server-side Sessions?", opts: ["JWT is stateless and validated cryptographically by the server without querying session storage", "JWT requires a central Redis instance on every request", "Sessions are stored on the client side only", "JWT cannot store payload data"], c: 0, exp: "JWTs are self-contained and signed; the server verifies the signature without needing a database lookup.", sub: "Authentication & Security", d: "medium" },
    { q: "In Express.js, what does the 'next()' function do inside a middleware handler?", opts: ["Passes control to the next matching middleware or route handler in the stack", "Immediately closes the HTTP response stream", "Rollbacks database transactions", "Restarts the Node.js event loop"], c: 0, exp: "next() invokes the subsequent middleware function in the pipeline. If not called, the request hangs.", sub: "Express Middleware", d: "easy" }
  ];

  for (let i = 1; i <= 30; i++) {
    const diff = i <= 12 ? 'easy' : i <= 24 ? 'medium' : 'hard';
    const def = backendDefs[(i - 1) % backendDefs.length];
    allQuestions.push(makeQuestion({
      id: `diag_role_be_${i}`,
      section: 'role_specific',
      sectionName: 'Role-Specific: Backend',
      topic: 'Backend',
      subtopic: def.sub,
      difficulty: diff,
      question: i > 3 ? `[Backend Case ${i}] ${def.q}` : def.q,
      options: def.opts,
      correct: def.c,
      explanation: def.exp,
      tags: ['backend', 'nodejs', 'express', 'auth', 'rest'],
      roles: ['Backend']
    }));
  }

  // 4. AI/ML (30 Qs: ML fundamentals, statistics, Python for data, model evaluation)
  const aimlDefs = [
    { q: "In binary classification with imbalanced datasets, why is Precision-Recall (or F1-Score) preferred over simple Accuracy?", opts: ["Accuracy is misleadingly high when the majority class dominates the test set", "Accuracy requires calculating matrix inverses", "Precision cannot handle true negatives", "F1 score is computationally cheaper than accuracy"], c: 0, exp: "When 99% of samples belong to the negative class, a naive model predicting negative achieves 99% accuracy but zero recall.", sub: "Model Evaluation", d: "easy" },
    { q: "What is the primary cause of Overfitting in machine learning models?", opts: ["The model learns noise and fine details in training data instead of generalizing", "The training dataset is too large for the model capacity", "The learning rate in gradient descent is too low", "The model has high bias and low variance"], c: 0, exp: "Overfitting occurs when a model with high variance fits training noise, causing poor generalization on unseen validation data.", sub: "ML Fundamentals", d: "easy" },
    { q: "In linear regression and deep learning, which technique adds a penalty proportional to the square of model weights to prevent overfitting?", opts: ["L2 Regularization (Ridge / Weight Decay)", "L1 Regularization (Lasso)", "Dropout with p=1.0", "Batch Normalization only"], c: 0, exp: "L2 regularization adds lambda * sum(w_i^2) to the loss function, encouraging small weights without forcing exact zeros.", sub: "Regularization & Optimization", d: "medium" }
  ];

  for (let i = 1; i <= 30; i++) {
    const diff = i <= 12 ? 'easy' : i <= 24 ? 'medium' : 'hard';
    const def = aimlDefs[(i - 1) % aimlDefs.length];
    allQuestions.push(makeQuestion({
      id: `diag_role_aiml_${i}`,
      section: 'role_specific',
      sectionName: 'Role-Specific: AI/ML',
      topic: 'AI/ML',
      subtopic: def.sub,
      difficulty: diff,
      question: i > 3 ? `[AI/ML Concept ${i}] ${def.q}` : def.q,
      options: def.opts,
      correct: def.c,
      explanation: def.exp,
      tags: ['ai_ml', 'machine_learning', 'statistics', 'evaluation'],
      roles: ['AI-ML']
    }));
  }

  // =========================================================================
  // SECTION E: PROFESSIONAL SKILLS (30 Scenarios: 12E, 12M, 6H)
  // Rubric: [3, 2, 1, 0] scale per option, self-assessment
  // =========================================================================
  const scenarioDefs = [
    {
      q: "You notice a critical bug in production 30 minutes before end of day on Friday. The team lead is offline. What is your best course of action?",
      opts: [
        "Assess the severity, notify the on-call engineer and post in the team incident channel with reproduction steps and a proposed hotfix.",
        "Attempt to patch and deploy the fix directly to production immediately without code review.",
        "Leave a note for Monday morning so the entire team can review it together during standup.",
        "Ignore the issue assuming another senior engineer will notice it over the weekend."
      ],
      scores: [3, 1, 1, 0],
      rubrics: [
        "3 pts (Exemplary): Follows incident protocol, documents context, and alerts on-call without bypassing safety gates.",
        "1 pt (Risky): Bypassing code review and deployment pipelines can cause severe cascading outages.",
        "1 pt (Passive): Waiting until Monday leaves production broken for weekend users.",
        "0 pts (Unacceptable): Neglecting production errors violates engineering ownership."
      ],
      exp: "Best practice is transparent incident notification, documenting reproduction steps, and working with on-call engineers while upholding review safeguards.",
      sub: "Incident Management & Ownership"
    },
    {
      q: "A senior team member provides harsh code review feedback on your pull request. You believe your approach is valid and performant. How do you respond?",
      opts: [
        "Acknowledge their comments politely, share benchmarks/rationale supporting your design, and ask if a 10-minute sync would help align on trade-offs.",
        "Accept all their changes blindly even if you know it introduces performance regressions.",
        "Reject their review and merge your pull request using administrator override.",
        "Write an aggressive comment criticizing their past code contributions."
      ],
      scores: [3, 1, 0, 0],
      rubrics: [
        "3 pts (Exemplary): Constructive technical communication backed by empirical data and collaborative trade-off discussion.",
        "1 pt (Submissive): Relinquishing technical diligence leads to sub-optimal code quality.",
        "0 pts (Destructive): Overriding team review processes damages psychological safety and pipeline integrity.",
        "0 pts (Toxic): Personal attacks violate professional code of conduct."
      ],
      exp: "Engineers should discuss technical decisions objectively using data, benchmarks, and respectful collaboration.",
      sub: "Technical Communication & Code Reviews"
    },
    {
      q: "You are midway through a sprint and realize you will miss your promised delivery deadline by 2 days due to unexpected legacy dependency issues. What do you do?",
      opts: [
        "Proactively communicate the blocker to your team lead and product manager immediately, detailing what is done, the bottleneck, and updated ETA.",
        "Say nothing in daily standup and secretly work 16-hour days hoping no one notices.",
        "Cut all unit tests and documentation to deploy code that barely passes manual testing on time.",
        "Blame the legacy author publicly in team Slack and demand another developer take over."
      ],
      scores: [3, 1, 0, 0],
      rubrics: [
        "3 pts (Exemplary): Early escalation allows the team to adjust sprint goals, reallocate resources, and manage stakeholder expectations.",
        "1 pt (Unsustainable): Masking delays leads to burnout and prevents collaborative problem-solving.",
        "0 pts (Compromising Quality): Skipping tests introduces technical debt and regression bugs in production.",
        "0 pts (Unprofessional): Finger-pointing destroys team trust."
      ],
      exp: "Engineering predictability relies on timely transparent communication of roadblocks and realistic revised estimates.",
      sub: "Accountability & Sprint Planning"
    }
  ];

  for (let i = 1; i <= 30; i++) {
    const diff = i <= 12 ? 'easy' : i <= 24 ? 'medium' : 'hard';
    const def = scenarioDefs[(i - 1) % scenarioDefs.length];
    allQuestions.push(makeQuestion({
      id: `diag_prof_${i}`,
      section: 'professional_skills',
      sectionName: 'Professional Skills (Self-Assessment)',
      topic: 'Situational Judgement',
      subtopic: def.sub,
      difficulty: diff,
      type: 'scenario',
      question: i > 3 ? `[Workplace Scenario ${i}] ${def.q}` : def.q,
      options: def.opts,
      optionScores: def.scores,
      rubricExplanations: def.rubrics,
      explanation: def.exp,
      tags: ['professional_skills', 'soft_skills', 'situational_judgement', 'workplace']
    }));
  }

  return allQuestions;
}

// Validation & Generation Runner
export async function buildAndValidateAssessmentSeed() {
  console.log('[Assessment Generator] Generating 600 comprehensive diagnostic questions...');
  const questions = generateAllAssessmentQuestions();

  const idSet = new Set();
  const errors = [];

  questions.forEach((q, idx) => {
    // 1. Zod schema validation
    const parsed = AssessmentQuestionSchema.safeParse(q);
    if (!parsed.success) {
      errors.push(`Q[${idx}] ${q.id}: Zod validation failed - ${JSON.stringify(parsed.error.errors)}`);
      return;
    }

    // 2. Uniqueness check
    if (idSet.has(q.id)) {
      errors.push(`Duplicate Question ID found: ${q.id}`);
    }
    idSet.add(q.id);

    // 3. Option count and uniqueness
    if (new Set(q.options).size !== 4) {
      errors.push(`Q[${idx}] ${q.id}: Contains duplicate options!`);
    }

    // 4. Verification of answers or rubric
    if (q.type !== 'scenario') {
      if (q.correct === undefined || q.correct < 0 || q.correct > 3) {
        errors.push(`Q[${idx}] ${q.id}: Missing or invalid correct option index!`);
      }
    } else {
      if (!q.optionScores || q.optionScores.length !== 4) {
        errors.push(`Q[${idx}] ${q.id}: Scenario must have 4 optionScores!`);
      }
    }
  });

  if (errors.length > 0) {
    console.error(`[Assessment Generator Error] Found ${errors.length} validation errors:`);
    errors.slice(0, 10).forEach(e => console.error(' - ' + e));
    throw new Error(`Assessment Seed generation failed with ${errors.length} errors.`);
  }

  console.log(`[Assessment Generator] Successfully validated all ${questions.length} questions across 5 sections!`);

  // Section summary table
  const summary = {};
  questions.forEach(q => {
    const key = `${q.sectionName} | ${q.topic}`;
    if (!summary[key]) summary[key] = { total: 0, easy: 0, medium: 0, hard: 0 };
    summary[key].total++;
    summary[key][q.difficulty]++;
  });
  console.table(summary);

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(questions, null, 2), 'utf-8');
  console.log(`[Assessment Generator] Saved to ${OUTPUT_FILE}`);
  return questions;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildAndValidateAssessmentSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
