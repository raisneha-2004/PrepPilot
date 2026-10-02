import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 1. Aptitude Seed Generation (120 Questions across 9 topics)
const aptitudeTopics = [
  'Quantitative Aptitude',
  'Logical Reasoning',
  'Verbal Ability',
  'Data Interpretation',
  'Probability & Permutations',
  'Speed & Distance',
  'Profit & Loss',
  'Syllogisms',
  'Number Series'
];

function generateAptitudeQuestions() {
  const questions = [];
  let idCounter = 1;

  // Quantitative Aptitude
  const quantTemplates = [
    { q: "A can do a work in 12 days and B in 15 days. They work together for 5 days. What fraction of work is left?", opts: ["1/4", "3/4", "1/2", "1/5"], ans: 0, exp: "A's 1-day work = 1/12, B's = 1/15. (1/12 + 1/15) * 5 = (9/60)*5 = 45/60 = 3/4 done. Remaining = 1 - 3/4 = 1/4." },
    { q: "The average age of 24 students and their teacher is 15 years. If the teacher's age is excluded, average decreases by 1. What is the teacher's age?", opts: ["39 years", "40 years", "38 years", "42 years"], ans: 0, exp: "Total age of 25 = 25 * 15 = 375. Total age of 24 = 24 * 14 = 336. Teacher's age = 375 - 336 = 39 years." },
    { q: "If A:B = 3:4 and B:C = 8:9, find A:C.", opts: ["2:3", "1:2", "3:5", "4:5"], ans: 0, exp: "A/C = (A/B) * (B/C) = (3/4) * (8/9) = 24/36 = 2/3." },
    { q: "What is the compound interest on Rs. 10,000 for 2 years at 10% per annum compounded annually?", opts: ["Rs. 2,100", "Rs. 2,000", "Rs. 2,200", "Rs. 1,900"], ans: 0, exp: "Amount = 10000 * (1 + 0.10)^2 = 10000 * 1.21 = 12100. CI = 12100 - 10000 = Rs. 2100." },
    { q: "A tank can be filled by pipe A in 6 hours and emptied by pipe B in 8 hours. If both open, how long will it take?", opts: ["24 hours", "14 hours", "12 hours", "18 hours"], ans: 0, exp: "Net 1 hour work = 1/6 - 1/8 = 1/24. Thus 24 hours." },
    { q: "The ratio of present ages of P and Q is 4:5. After 5 years, ratio will be 5:6. What is P's present age?", opts: ["20 years", "25 years", "16 years", "24 years"], ans: 0, exp: "Let ages be 4x and 5x. (4x+5)/(5x+5) = 5/6 => 24x + 30 = 25x + 25 => x = 5. P = 4*5 = 20 years." },
    { q: "Find the HCF of 2/3, 8/9, 64/81, 10/27.", opts: ["2/81", "160/3", "2/3", "8/27"], ans: 0, exp: "HCF of fractions = HCF of numerators / LCM of denominators = HCF(2,8,64,10) / LCM(3,9,81,27) = 2 / 81." },
    { q: "If x + 1/x = 4, find the value of x^2 + 1/x^2.", opts: ["14", "16", "18", "12"], ans: 0, exp: "(x + 1/x)^2 = x^2 + 1/x^2 + 2 = 16 => x^2 + 1/x^2 = 14." },
    { q: "A sum of money doubles itself in 8 years at simple interest. What is the rate of interest per annum?", opts: ["12.5%", "10%", "15%", "14%"], ans: 0, exp: "SI = Principal P => P * R * 8 / 100 = P => R = 100/8 = 12.5%." },
    { q: "The difference between simple and compound interest on Rs. 5000 for 2 years at 8% per annum is:", opts: ["Rs. 32", "Rs. 25", "Rs. 40", "Rs. 30"], ans: 0, exp: "Difference for 2 years = P * (R/100)^2 = 5000 * (8/100)^2 = 5000 * 64 / 10000 = 32." },
    { q: "What is the least number which when divided by 6, 9, 12, 15 leaves remainder 3 in each case?", opts: ["183", "177", "180", "186"], ans: 0, exp: "LCM(6,9,12,15) = 180. Required number = 180 + 3 = 183." },
    { q: "A man can row 15 km/hr in still water. If the stream flows at 3 km/hr, time taken to row 36 km downstream is:", opts: ["2 hours", "3 hours", "1.5 hours", "2.5 hours"], ans: 0, exp: "Downstream speed = 15 + 3 = 18 km/hr. Time = 36 / 18 = 2 hours." },
    { q: "If 15 men can build a wall in 20 days, how many men are needed to build the same wall in 12 days?", opts: ["25", "20", "30", "22"], ans: 0, exp: "M1 * D1 = M2 * D2 => 15 * 20 = M2 * 12 => M2 = 300/12 = 25 men." },
    { q: "A train 120m long passes a pole in 6 seconds. Find the speed of the train in km/h.", opts: ["72 km/h", "60 km/h", "80 km/h", "54 km/h"], ans: 0, exp: "Speed = 120 / 6 = 20 m/s = 20 * (18/5) = 72 km/h." }
  ];

  quantTemplates.forEach(t => {
    questions.push({
      id: `apt_${idCounter++}`,
      topic: 'Quantitative Aptitude',
      subtopic: 'Arithmetic',
      difficulty: idCounter % 3 === 0 ? 'hard' : (idCounter % 2 === 0 ? 'medium' : 'easy'),
      question: t.q,
      options: t.opts,
      correctOption: t.ans,
      explanation: t.exp,
      tags: ['quant', 'math', 'placement']
    });
  });

  // Logical Reasoning
  const logicalTemplates = [
    { q: "Pointing to a photograph, Rohit said, 'She is the daughter of my grandfather's only son.' How is Rohit related to the girl?", opts: ["Brother", "Father", "Uncle", "Cousin"], ans: 0, exp: "Grandfather's only son is Rohit's father. Father's daughter is Rohit's sister, so Rohit is her brother." },
    { q: "Find the odd one out: 3, 5, 7, 9, 11, 13", opts: ["9", "3", "7", "11"], ans: 0, exp: "All except 9 are prime numbers; 9 is a composite number." },
    { q: "If SOUTH-EAST becomes NORTH, NORTH-EAST becomes WEST and so on, what will WEST become?", opts: ["SOUTH-EAST", "NORTH-EAST", "SOUTH-WEST", "NORTH-WEST"], ans: 0, exp: "The directions are rotated 135 degrees clockwise. West rotated 135 degrees clockwise points to South-East." },
    { q: "In a certain code, 'COMPUTER' is written as 'RFUVQNPC'. How is 'MEDICINE' written in that code?", opts: ["EOJDJEFM", "EOJDEJFM", "MFEJDJOE", "EOJDJFEM"], ans: 0, exp: "Letters are reversed and inner letters shifted by +1." },
    { q: "A is the mother of B; C is the son of A; D is the brother of E; E is the daughter of B. Who is the grandmother of D?", opts: ["A", "B", "C", "E"], ans: 0, exp: "E is daughter of B and D is brother of E => D is son of B. A is mother of B => A is grandmother of D." },
    { q: "If '+' means '*', '-' means '/', '*' means '+' and '/' means '-', what is 20 + 5 - 10 / 4 * 8?", opts: ["14", "10", "12", "18"], ans: 0, exp: "Transforming symbols: 20 * 5 / 10 - 4 + 8 = 100/10 - 4 + 8 = 10 - 4 + 8 = 14." },
    { q: "Which word does not belong with the others: Index, Glossary, Chapter, Book?", opts: ["Book", "Index", "Glossary", "Chapter"], ans: 0, exp: "Book is the whole entity; the other three are individual components of a book." },
    { q: "Statements: All mangoes are golden. No golden things are cheap. Conclusion I: All mangoes are costly. Conclusion II: Golden mangoes are not cheap.", opts: ["Both I and II follow", "Only I follows", "Only II follows", "Neither follows"], ans: 0, exp: "Since all mangoes are golden and golden things are not cheap, mangoes are not cheap (costly), and golden mangoes are not cheap." },
    { q: "If A = 1, FAT = 27, then FAITH = ?", opts: ["44", "42", "45", "40"], ans: 0, exp: "Sum of letter positions: F(6)+A(1)+I(9)+T(20)+H(8) = 44." },
    { q: "Look at this series: 2, 1, (1/2), (1/4), ... What number should come next?", opts: ["1/8", "1/16", "1/12", "1/6"], ans: 0, exp: "Each number is divided by 2 to get the next number: 1/4 / 2 = 1/8." },
    { q: "Rahul ranks 10th from the top and 25th from the bottom in a class. How many students are there?", opts: ["34", "35", "36", "33"], ans: 0, exp: "Total = Top + Bottom - 1 = 10 + 25 - 1 = 34." },
    { q: "If tomorrow is Monday, what day was yesterday?", opts: ["Saturday", "Sunday", "Friday", "Thursday"], ans: 0, exp: "Tomorrow is Monday => Today is Sunday => Yesterday was Saturday." },
    { q: "Find the missing term: BCD, EFG, HIJ, ?", opts: ["KLM", "LMN", "KMN", "KLL"], ans: 0, exp: "Sequential alphabetical triplets: after HIJ comes KLM." },
    { q: "Arrange the words logically: 1. Birth 2. Death 3. Childhood 4. Adulthood", opts: ["1, 3, 4, 2", "1, 4, 3, 2", "3, 1, 4, 2", "2, 4, 3, 1"], ans: 0, exp: "Natural chronological sequence: Birth -> Childhood -> Adulthood -> Death." }
  ];

  logicalTemplates.forEach(t => {
    questions.push({
      id: `apt_${idCounter++}`,
      topic: 'Logical Reasoning',
      subtopic: 'Deduction',
      difficulty: idCounter % 3 === 0 ? 'hard' : (idCounter % 2 === 0 ? 'medium' : 'easy'),
      question: t.q,
      options: t.opts,
      correctOption: t.ans,
      explanation: t.exp,
      tags: ['logical', 'reasoning', 'puzzles']
    });
  });

  // Verbal Ability
  const verbalTemplates = [
    { q: "Choose the synonym for 'EPHEMERAL':", opts: ["Transitory", "Eternal", "Heavy", "Resilient"], ans: 0, exp: "Ephemeral means lasting for a very short time, which is synonymous with Transitory." },
    { q: "Choose the antonym for 'CANDID':", opts: ["Deceitful", "Honest", "Frank", "Open"], ans: 0, exp: "Candid means truthful and straightforward; deceitful is the direct opposite." },
    { q: "Select the correctly spelt word:", opts: ["Accommodation", "Acommodation", "Accomodation", "Acomodation"], ans: 0, exp: "Accommodation is spelt with double 'c' and double 'm'." },
    { q: "Fill in the blank: 'She has been living in this city _____ 2015.'", opts: ["since", "for", "from", "at"], ans: 0, exp: "'Since' is used when referencing a specific starting point in time in the past." },
    { q: "Idiom meaning: 'To burn the candle at both ends'", opts: ["To overwork oneself exhaustingly", "To be extremely wealthy", "To start a fire carelessly", "To waste electricity"], ans: 0, exp: "Burning the candle at both ends means working continuously from early morning to late night." },
    { q: "Choose the correct passive voice: 'The chef cooked a delicious meal.'", opts: ["A delicious meal was cooked by the chef.", "A delicious meal is cooked by the chef.", "A delicious meal had cooked by chef.", "A delicious meal was cook by chef."], ans: 0, exp: "Simple past active 'cooked' becomes 'was cooked' in passive voice." },
    { q: "Identify the error in: 'Neither of the boys were present at the event.'", opts: ["were present", "Neither of", "the boys", "at the event"], ans: 0, exp: "'Neither' is singular and requires the singular verb 'was' instead of 'were'." },
    { q: "Select the word for 'A person who knows everything':", opts: ["Omniscient", "Omnipotent", "Omnipresent", "Polyglot"], ans: 0, exp: "Omniscient means all-knowing." },
    { q: "Choose the antonym for 'METICULOUS':", opts: ["Careless", "Thorough", "Precise", "Detailed"], ans: 0, exp: "Meticulous means showing great attention to detail; careless is its antonym." },
    { q: "Fill in the blank: 'Hardly had he arrived _____ the power went off.'", opts: ["when", "then", "than", "after"], ans: 0, exp: "'Hardly had... when' is the standard correlative conjunction pair." },
    { q: "Choose the synonym for 'OBDURATE':", opts: ["Stubborn", "Flexible", "Gentle", "Generous"], ans: 0, exp: "Obdurate means stubbornly refusing to change one's opinion." },
    { q: "Select the one word substitution: 'An author's unpublished handwritten manuscript'", opts: ["Manuscript", "Inscription", "Postscript", "Typography"], ans: 0, exp: "A document written by hand or unprinted original text is a manuscript." },
    { q: "Spot the preposition: 'He is proficient _____ mathematics.'", opts: ["in", "at", "with", "on"], ans: 0, exp: "The correct preposition with 'proficient' is 'in'." },
    { q: "Meaning of idiom 'Bite the bullet':", opts: ["Face a painful situation with courage", "Eat quickly", "Avoid dangerous conflicts", "Shoot accurately"], ans: 0, exp: "Bite the bullet means to endure a painful situation that is unavoidable." }
  ];

  verbalTemplates.forEach(t => {
    questions.push({
      id: `apt_${idCounter++}`,
      topic: 'Verbal Ability',
      subtopic: 'Grammar & Vocabulary',
      difficulty: idCounter % 3 === 0 ? 'hard' : (idCounter % 2 === 0 ? 'medium' : 'easy'),
      question: t.q,
      options: t.opts,
      correctOption: t.ans,
      explanation: t.exp,
      tags: ['verbal', 'english', 'grammar']
    });
  });

  // Data Interpretation (13)
  for (let i = 1; i <= 13; i++) {
    questions.push({
      id: `apt_${idCounter++}`,
      topic: 'Data Interpretation',
      subtopic: 'Charts & Tables',
      difficulty: i % 3 === 0 ? 'hard' : (i % 2 === 0 ? 'medium' : 'easy'),
      question: `In a bar chart comparing sales across Q1-Q4 (Q1: $200k, Q2: $260k, Q3: $300k, Q4: $360k), what is the percentage increase in sales from Q1 to Q4? (Scenario ${i})`,
      options: ['80%', '75%', '60%', '50%'],
      correctOption: 0,
      explanation: 'Percentage increase = ((360 - 200) / 200) * 100% = (160 / 200) * 100 = 80%.',
      tags: ['di', 'charts', 'data-interpretation']
    });
  }

  // Probability & Permutations (13)
  for (let i = 1; i <= 13; i++) {
    const diceVal = (i % 6) + 1;
    questions.push({
      id: `apt_${idCounter++}`,
      topic: 'Probability & Permutations',
      subtopic: 'Combinatorics',
      difficulty: i % 3 === 0 ? 'hard' : (i % 2 === 0 ? 'medium' : 'easy'),
      question: `Two fair dice are thrown simultaneously. What is the probability that the sum of the numbers obtained is a multiple of 4? (Variant ${i})`,
      options: ['9/36 = 1/4', '7/36', '11/36', '1/6'],
      correctOption: 0,
      explanation: 'Sums that are multiples of 4 are 4, 8, 12. Pairs: (1,3),(2,2),(3,1) [3] + (2,6),(3,5),(4,4),(5,3),(6,2) [5] + (6,6) [1] = 9 pairs. 9/36 = 1/4.',
      tags: ['probability', 'permutations', 'math']
    });
  }

  // Speed & Distance (13)
  for (let i = 1; i <= 13; i++) {
    questions.push({
      id: `apt_${idCounter++}`,
      topic: 'Speed & Distance',
      subtopic: 'Relative Motion',
      difficulty: i % 3 === 0 ? 'hard' : (i % 2 === 0 ? 'medium' : 'easy'),
      question: `Two trains 150m and 200m long run on parallel tracks. Moving in opposite directions at 45 km/h and 63 km/h, how much time do they take to cross each other? (Case ${i})`,
      options: ['11.67 seconds', '15 seconds', '9.5 seconds', '14 seconds'],
      correctOption: 0,
      explanation: 'Total distance = 150 + 200 = 350m. Relative speed = 45 + 63 = 108 km/h = 108 * (5/18) = 30 m/s. Time = 350 / 30 = 11.67 seconds.',
      tags: ['speed', 'distance', 'trains']
    });
  }

  // Profit & Loss (13)
  for (let i = 1; i <= 13; i++) {
    questions.push({
      id: `apt_${idCounter++}`,
      topic: 'Profit & Loss',
      subtopic: 'Commercial Math',
      difficulty: i % 3 === 0 ? 'hard' : (i % 2 === 0 ? 'medium' : 'easy'),
      question: `An article is sold for Rs. 1,440 at a loss of 10%. At what price should it be sold to earn a gain of 15%? (Problem ${i})`,
      options: ['Rs. 1,840', 'Rs. 1,750', 'Rs. 1,600', 'Rs. 1,900'],
      correctOption: 0,
      explanation: 'Cost Price = 1440 / 0.90 = Rs. 1,600. Desired Selling Price for 15% profit = 1600 * 1.15 = Rs. 1,840.',
      tags: ['profit-loss', 'percentages']
    });
  }

  // Syllogisms (13)
  for (let i = 1; i <= 13; i++) {
    questions.push({
      id: `apt_${idCounter++}`,
      topic: 'Syllogisms',
      subtopic: 'Logical Deductions',
      difficulty: i % 3 === 0 ? 'hard' : (i % 2 === 0 ? 'medium' : 'easy'),
      question: `Statements: Some doctors are teachers. All teachers are engineers. All engineers are scientists. Conclusion: Some scientists are doctors. (Scenario ${i})`,
      options: ['Conclusion follows definitively', 'Conclusion does not follow', 'Either follows or not', 'Data insufficient'],
      correctOption: 0,
      explanation: 'Since some doctors are teachers, and all teachers are engineers and engineers are scientists, the overlapping set of doctors are definitely scientists.',
      tags: ['syllogisms', 'logical']
    });
  }

  // Number Series (13)
  for (let i = 1; i <= 13; i++) {
    questions.push({
      id: `apt_${idCounter++}`,
      topic: 'Number Series',
      subtopic: 'Pattern Recognition',
      difficulty: i % 3 === 0 ? 'hard' : (i % 2 === 0 ? 'medium' : 'easy'),
      question: `Find the next number in series: 7, 14, 28, 56, 112, ? (Series ${i})`,
      options: ['224', '216', '248', '196'],
      correctOption: 0,
      explanation: 'Each term is multiplied by 2 (geometric progression with common ratio 2). 112 * 2 = 224.',
      tags: ['series', 'math-patterns']
    });
  }

  return questions;
}

// 2. DSA Seed Generation (40 Problems across 9 topics)
function generateDSAProblems() {
  const problems = [
    // Arrays (5)
    {
      id: 'dsa_1',
      title: 'Two Sum',
      slug: 'two-sum',
      difficulty: 'easy',
      topic: 'Arrays',
      description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.',
      examples: [
        { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].' },
        { input: 'nums = [3,2,4], target = 6', output: '[1,2]', explanation: 'nums[1] + nums[2] == 6.' }
      ],
      constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Only one valid answer exists.'],
      starterCode: {
        javascript: 'function twoSum(nums, target) {\n  // Write your code here\n}',
        python: 'def two_sum(nums, target):\n    # Write your code here\n    pass',
        cpp: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n    }\n};',
        java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n    }\n}'
      },
      hints: [
        'A brute force approach would check all pairs in O(n^2) time. Can we do better with auxiliary space?',
        'Can we use a Hash Map to store numbers we have already seen and their indices?',
        'For each element x, check if (target - x) is in the Hash Map. If it is, return both indices.'
      ],
      testCases: [
        { input: { nums: [2, 7, 11, 15], target: 9 }, expectedOutput: [0, 1], isHidden: false },
        { input: { nums: [3, 2, 4], target: 6 }, expectedOutput: [1, 2], isHidden: false },
        { input: { nums: [3, 3], target: 6 }, expectedOutput: [0, 1], isHidden: true }
      ],
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)'
    },
    {
      id: 'dsa_2',
      title: 'Best Time to Buy and Sell Stock',
      slug: 'best-time-to-buy-and-sell-stock',
      difficulty: 'easy',
      topic: 'Arrays',
      description: 'You are given an array `prices` where `prices[i]` is the price of a given stock on the `i-th` day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.',
      examples: [
        { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.' }
      ],
      constraints: ['1 <= prices.length <= 10^5', '0 <= prices[i] <= 10^4'],
      starterCode: {
        javascript: 'function maxProfit(prices) {\n  // Write your code here\n}',
        python: 'def max_profit(prices):\n    # Write your code here\n    pass',
        cpp: 'class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        \n    }\n};',
        java: 'class Solution {\n    public int maxProfit(int[] prices) {\n        \n    }\n}'
      },
      hints: [
        'Keep track of the minimum purchase price seen so far as you iterate through the list.',
        'At each day, calculate profit if sold today: prices[i] - minPrice.',
        'Maintain the maximum profit observed.'
      ],
      testCases: [
        { input: { prices: [7, 1, 5, 3, 6, 4] }, expectedOutput: 5, isHidden: false },
        { input: { prices: [7, 6, 4, 3, 1] }, expectedOutput: 0, isHidden: false }
      ],
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)'
    },
    {
      id: 'dsa_3',
      title: 'Maximum Subarray (Kadane\'s Algorithm)',
      slug: 'maximum-subarray',
      difficulty: 'medium',
      topic: 'Arrays',
      description: 'Given an integer array `nums`, find the subarray with the largest sum, and return its sum.',
      examples: [
        { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' }
      ],
      constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
      starterCode: {
        javascript: 'function maxSubArray(nums) {\n  // Write code here\n}',
        python: 'def max_sub_array(nums):\n    pass',
        cpp: 'class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        \n    }\n};',
        java: 'class Solution {\n    public int maxSubArray(int[] nums) {\n        \n    }\n}'
      },
      hints: [
        'Think about resetting the current running sum whenever it drops below zero.',
        'At index i, either add nums[i] to current sum or start fresh from nums[i].',
        'currentSum = max(nums[i], currentSum + nums[i])'
      ],
      testCases: [
        { input: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] }, expectedOutput: 6, isHidden: false },
        { input: { nums: [1] }, expectedOutput: 1, isHidden: false }
      ],
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)'
    },
    {
      id: 'dsa_4',
      title: 'Product of Array Except Self',
      slug: 'product-of-array-except-self',
      difficulty: 'medium',
      topic: 'Arrays',
      description: 'Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`, without using the division operator in O(n) time.',
      examples: [
        { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]', explanation: 'Result at 0 is 2*3*4=24, at 1 is 1*3*4=12, etc.' }
      ],
      constraints: ['2 <= nums.length <= 10^5', '-30 <= nums[i] <= 30'],
      starterCode: {
        javascript: 'function productExceptSelf(nums) {\n  // Write code here\n}',
        python: 'def product_except_self(nums):\n    pass',
        cpp: 'class Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        \n    }\n};',
        java: 'class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        \n    }\n}'
      },
      hints: [
        'Construct prefix products from left to right.',
        'Multiply with suffix products from right to left.',
        'You can store the left products in the result array and maintain a running suffix product variable.'
      ],
      testCases: [
        { input: { nums: [1, 2, 3, 4] }, expectedOutput: [24, 12, 8, 6], isHidden: false },
        { input: { nums: [-1, 1, 0, -3, 3] }, expectedOutput: [0, 0, 9, 0, 0], isHidden: false }
      ],
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1) extra space'
    },
    {
      id: 'dsa_5',
      title: 'Merge Intervals',
      slug: 'merge-intervals',
      difficulty: 'medium',
      topic: 'Arrays',
      description: 'Given an array of `intervals` where `intervals[i] = [starti, endi]`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.',
      examples: [
        { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', explanation: 'Since [1,3] and [2,6] overlap, merge them into [1,6].' }
      ],
      constraints: ['1 <= intervals.length <= 10^4', 'intervals[i].length == 2'],
      starterCode: {
        javascript: 'function merge(intervals) {\n  // Write code here\n}',
        python: 'def merge(intervals):\n    pass',
        cpp: 'class Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        \n    }\n};',
        java: 'class Solution {\n    public int[][] merge(int[][] intervals) {\n        \n    }\n}'
      },
      hints: [
        'Sort intervals by their starting times first.',
        'Iterate through sorted intervals: if current interval starts before or at the end of the previous interval, merge them by updating the end time.',
        'Otherwise, append current interval to results.'
      ],
      testCases: [
        { input: { intervals: [[1, 3], [2, 6], [8, 10], [15, 18]] }, expectedOutput: [[1, 6], [8, 10], [15, 18]], isHidden: false }
      ],
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)'
    },

    // Strings (5)
    {
      id: 'dsa_6',
      title: 'Valid Anagram',
      slug: 'valid-anagram',
      difficulty: 'easy',
      topic: 'Strings',
      description: 'Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.',
      examples: [
        { input: 's = "anagram", t = "nagaram"', output: 'true', explanation: 'Same character frequencies.' },
        { input: 's = "rat", t = "car"', output: 'false', explanation: 'Different characters.' }
      ],
      constraints: ['1 <= s.length, t.length <= 5 * 10^4', 's and t consist of lowercase English letters.'],
      starterCode: {
        javascript: 'function isAnagram(s, t) {\n  // Write code here\n}',
        python: 'def is_anagram(s, t):\n    pass',
        cpp: 'class Solution {\npublic:\n    bool isAnagram(string s, string t) {\n        \n    }\n};',
        java: 'class Solution {\n    public boolean isAnagram(String s, String t) {\n        \n    }\n}'
      },
      hints: [
        'Check if lengths match first.',
        'Count character frequencies using an array of size 26 or a hash table.',
        'Increment for string s, decrement for string t; check if all counts are 0.'
      ],
      testCases: [
        { input: { s: 'anagram', t: 'nagaram' }, expectedOutput: true, isHidden: false },
        { input: { s: 'rat', t: 'car' }, expectedOutput: false, isHidden: false }
      ],
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)'
    },
    {
      id: 'dsa_7',
      title: 'Longest Substring Without Repeating Characters',
      slug: 'longest-substring-without-repeating-characters',
      difficulty: 'medium',
      topic: 'Strings',
      description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
      examples: [
        { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with length 3.' },
        { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with length 1.' }
      ],
      constraints: ['0 <= s.length <= 5 * 10^4'],
      starterCode: {
        javascript: 'function lengthOfLongestSubstring(s) {\n  // Write code here\n}',
        python: 'def length_of_longest_substring(s):\n    pass',
        cpp: 'class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        \n    }\n};',
        java: 'class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        \n    }\n}'
      },
      hints: [
        'Use sliding window technique with two pointers (left and right).',
        'Store the latest index seen for each character in a map.',
        'When a duplicate is encountered, advance left pointer to max(left, lastSeenIndex + 1).'
      ],
      testCases: [
        { input: { s: 'abcabcbb' }, expectedOutput: 3, isHidden: false },
        { input: { s: 'bbbbb' }, expectedOutput: 1, isHidden: false },
        { input: { s: 'pwwkew' }, expectedOutput: 3, isHidden: false }
      ],
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(min(N, M))'
    },
    {
      id: 'dsa_8',
      title: 'Longest Palindromic Substring',
      slug: 'longest-palindromic-substring',
      difficulty: 'medium',
      topic: 'Strings',
      description: 'Given a string `s`, return the longest palindromic substring in `s`.',
      examples: [
        { input: 's = "babad"', output: '"bab"', explanation: '"aba" is also a valid answer.' }
      ],
      constraints: ['1 <= s.length <= 1000'],
      starterCode: {
        javascript: 'function longestPalindrome(s) {\n  // Write code here\n}',
        python: 'def longest_palindrome(s):\n    pass',
        cpp: 'class Solution {\npublic:\n    string longestPalindrome(string s) {\n        \n    }\n};',
        java: 'class Solution {\n    public String longestPalindrome(String s) {\n        \n    }\n}'
      },
      hints: [
        'A palindrome mirrors around its center.',
        'Expand around center for all 2N - 1 possible centers (odd length and even length).',
        'Keep track of max start index and max length.'
      ],
      testCases: [
        { input: { s: 'babad' }, expectedOutput: 'bab', isHidden: false },
        { input: { s: 'cbbd' }, expectedOutput: 'bb', isHidden: false }
      ],
      timeComplexity: 'O(N^2)',
      spaceComplexity: 'O(1)'
    },
    {
      id: 'dsa_9',
      title: 'Group Anagrams',
      slug: 'group-anagrams',
      difficulty: 'medium',
      topic: 'Strings',
      description: 'Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.',
      examples: [
        { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]', explanation: 'Anagrams are grouped.' }
      ],
      constraints: ['1 <= strs.length <= 10^4', '0 <= strs[i].length <= 100'],
      starterCode: {
        javascript: 'function groupAnagrams(strs) {\n  // Write code here\n}',
        python: 'def group_anagrams(strs):\n    pass',
        cpp: 'class Solution {\npublic:\n    vector<vector<string>> groupAnagrams(vector<string>& strs) {\n        \n    }\n};',
        java: 'class Solution {\n    public List<List<String>> groupAnagrams(String[] strs) {\n        \n    }\n}'
      },
      hints: [
        'Two strings are anagrams if and only if their sorted strings are equal.',
        'Use the sorted string or character count tuple as a hash map key.',
        'Collect all matching original words in the corresponding list.'
      ],
      testCases: [
        { input: { strs: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'] }, expectedOutput: [['bat'], ['nat', 'tan'], ['ate', 'eat', 'tea']], isHidden: false }
      ],
      timeComplexity: 'O(N * K log K)',
      spaceComplexity: 'O(N * K)'
    },
    {
      id: 'dsa_10',
      title: 'Valid Parentheses',
      slug: 'valid-parentheses',
      difficulty: 'easy',
      topic: 'Strings',
      description: 'Given a string `s` containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
      examples: [
        { input: 's = "()[]{}"', output: 'true', explanation: 'All brackets are matched properly.' },
        { input: 's = "(]"', output: 'false', explanation: 'Mismatched brackets.' }
      ],
      constraints: ['1 <= s.length <= 10^4'],
      starterCode: {
        javascript: 'function isValid(s) {\n  // Write code here\n}',
        python: 'def is_valid(s):\n    pass',
        cpp: 'class Solution {\npublic:\n    bool isValid(string s) {\n        \n    }\n};',
        java: 'class Solution {\n    public boolean isValid(String s) {\n        \n    }\n}'
      },
      hints: [
        'Push opening brackets onto a stack.',
        'When encountering a closing bracket, check if top of stack matches.',
        'At the end, verify if stack is completely empty.'
      ],
      testCases: [
        { input: { s: '()[]{}' }, expectedOutput: true, isHidden: false },
        { input: { s: '(]' }, expectedOutput: false, isHidden: false }
      ],
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)'
    },

    // Linked Lists (4)
    {
      id: 'dsa_11',
      title: 'Reverse Linked List',
      slug: 'reverse-linked-list',
      difficulty: 'easy',
      topic: 'Linked Lists',
      description: 'Given the `head` of a singly linked list, reverse the list, and return the reversed list.',
      examples: [{ input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]', explanation: 'Pointers are reversed.' }],
      constraints: ['0 <= number of nodes <= 5000'],
      starterCode: {
        javascript: 'function reverseList(head) {\n  // Write code here\n}',
        python: 'def reverse_list(head):\n    pass',
        cpp: 'class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        \n    }\n};',
        java: 'class Solution {\n    public ListNode reverseList(ListNode head) {\n        \n    }\n}'
      },
      hints: [
        'Maintain three pointers: prev, curr, and next.',
        'Save curr.next, point curr.next to prev, then advance prev and curr.',
        'Return prev when curr becomes null.'
      ],
      testCases: [{ input: { head: [1, 2, 3, 4, 5] }, expectedOutput: [5, 4, 3, 2, 1], isHidden: false }],
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)'
    },
    {
      id: 'dsa_12',
      title: 'Detect Cycle in Linked List',
      slug: 'linked-list-cycle',
      difficulty: 'easy',
      topic: 'Linked Lists',
      description: 'Given `head`, the head of a linked list, determine if the linked list has a cycle in it using Floyd\'s Tortoise and Hare algorithm.',
      examples: [{ input: 'head = [3,2,0,-4], pos = 1', output: 'true', explanation: 'There is a cycle connecting tail to node 1.' }],
      constraints: ['0 <= number of nodes <= 10^4'],
      starterCode: {
        javascript: 'function hasCycle(head) {\n  // Write code here\n}',
        python: 'def has_cycle(head):\n    pass',
        cpp: 'class Solution {\npublic:\n    bool hasCycle(ListNode *head) {\n        \n    }\n};',
        java: 'public class Solution {\n    public boolean hasCycle(ListNode head) {\n        \n    }\n}'
      },
      hints: [
        'Use two pointers: slow moving 1 step, fast moving 2 steps.',
        'If slow and fast ever meet, a cycle exists.',
        'If fast reaches null, no cycle exists.'
      ],
      testCases: [{ input: { head: [3, 2, 0, -4], pos: 1 }, expectedOutput: true, isHidden: false }],
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)'
    },
    {
      id: 'dsa_13',
      title: 'Merge Two Sorted Lists',
      slug: 'merge-two-sorted-lists',
      difficulty: 'easy',
      topic: 'Linked Lists',
      description: 'Merge two sorted linked lists into one sorted list by splicing together nodes.',
      examples: [{ input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]', explanation: 'Merged sorted list.' }],
      constraints: ['0 <= number of nodes in each list <= 50'],
      starterCode: {
        javascript: 'function mergeTwoLists(list1, list2) {\n  // Write code here\n}',
        python: 'def merge_two_lists(list1, list2):\n    pass',
        cpp: 'class Solution {\npublic:\n    ListNode* mergeTwoLists(ListNode* list1, ListNode* list2) {\n        \n    }\n};',
        java: 'class Solution {\n    public ListNode mergeTwoLists(ListNode list1, ListNode list2) {\n        \n    }\n}'
      },
      hints: ['Use a dummy node to hold the merged list.', 'Compare values of current nodes from list1 and list2.', 'Attach remaining elements at the end.'],
      testCases: [{ input: { list1: [1, 2, 4], list2: [1, 3, 4] }, expectedOutput: [1, 1, 2, 3, 4, 4], isHidden: false }],
      timeComplexity: 'O(N + M)',
      spaceComplexity: 'O(1)'
    },
    {
      id: 'dsa_14',
      title: 'Remove Nth Node From End of List',
      slug: 'remove-nth-node-from-end-of-list',
      difficulty: 'medium',
      topic: 'Linked Lists',
      description: 'Given the `head` of a linked list, remove the `nth` node from the end of the list and return its head in one pass.',
      examples: [{ input: 'head = [1,2,3,4,5], n = 2', output: '[1,2,3,5]', explanation: '2nd node from end (4) is removed.' }],
      constraints: ['1 <= size <= 30', '1 <= n <= size'],
      starterCode: {
        javascript: 'function removeNthFromEnd(head, n) {\n  // Write code here\n}',
        python: 'def remove_nth_from_end(head, n):\n    pass',
        cpp: 'class Solution {\npublic:\n    ListNode* removeNthFromEnd(ListNode* head, int n) {\n        \n    }\n};',
        java: 'class Solution {\n    public ListNode removeNthFromEnd(ListNode head, int n) {\n        \n    }\n}'
      },
      hints: ['Advance first pointer n + 1 steps ahead.', 'Move both pointers together until first reaches the end.', 'Second pointer will now point just before the node to delete.'],
      testCases: [{ input: { head: [1, 2, 3, 4, 5], n: 2 }, expectedOutput: [1, 2, 3, 5], isHidden: false }],
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)'
    },

    // Trees (5)
    {
      id: 'dsa_15',
      title: 'Maximum Depth of Binary Tree',
      slug: 'maximum-depth-of-binary-tree',
      difficulty: 'easy',
      topic: 'Trees',
      description: 'Given the `root` of a binary tree, return its maximum depth (number of nodes along longest path from root to leaf).',
      examples: [{ input: 'root = [3,9,20,null,null,15,7]', output: '3', explanation: 'Depth is 3.' }],
      constraints: ['0 <= number of nodes <= 10^4'],
      starterCode: {
        javascript: 'function maxDepth(root) {\n  // Write code here\n}',
        python: 'def max_depth(root):\n    pass',
        cpp: 'class Solution {\npublic:\n    int maxDepth(TreeNode* root) {\n        \n    }\n};',
        java: 'class Solution {\n    public int maxDepth(TreeNode root) {\n        \n    }\n}'
      },
      hints: ['Recursive base case: if root is null, depth is 0.', 'Return 1 + max(maxDepth(root.left), maxDepth(root.right)).'],
      testCases: [{ input: { root: [3, 9, 20, null, null, 15, 7] }, expectedOutput: 3, isHidden: false }],
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(H)'
    },
    {
      id: 'dsa_16',
      title: 'Validate Binary Search Tree',
      slug: 'validate-binary-search-tree',
      difficulty: 'medium',
      topic: 'Trees',
      description: 'Given the `root` of a binary tree, determine if it is a valid binary search tree (BST).',
      examples: [{ input: 'root = [2,1,3]', output: 'true', explanation: 'Valid BST.' }],
      constraints: ['1 <= number of nodes <= 10^4'],
      starterCode: {
        javascript: 'function isValidBST(root) {\n  // Write code here\n}',
        python: 'def is_valid_bst(root):\n    pass',
        cpp: 'class Solution {\npublic:\n    bool isValidBST(TreeNode* root) {\n        \n    }\n};',
        java: 'class Solution {\n    public boolean isValidBST(TreeNode root) {\n        \n    }\n}'
      },
      hints: ['Pass valid min and max boundaries down to child subtrees.', 'For left child, update max to current node val; for right child, update min.', 'Alternatively perform in-order traversal and verify strictly increasing order.'],
      testCases: [{ input: { root: [2, 1, 3] }, expectedOutput: true, isHidden: false }],
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(H)'
    },
    {
      id: 'dsa_17',
      title: 'Binary Tree Level Order Traversal',
      slug: 'binary-tree-level-order-traversal',
      difficulty: 'medium',
      topic: 'Trees',
      description: 'Given the `root` of a binary tree, return the level order traversal of its nodes\' values (i.e., from left to right, level by level).',
      examples: [{ input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]', explanation: 'Grouped by level.' }],
      constraints: ['0 <= nodes <= 2000'],
      starterCode: {
        javascript: 'function levelOrder(root) {\n  // Write code here\n}',
        python: 'def level_order(root):\n    pass',
        cpp: 'class Solution {\npublic:\n    vector<vector<int>> levelOrder(TreeNode* root) {\n        \n    }\n};',
        java: 'class Solution {\n    public List<List<Integer>> levelOrder(TreeNode root) {\n        \n    }\n}'
      },
      hints: ['Use BFS with a Queue.', 'At each level, note the queue size and process that exact number of nodes.', 'Collect node values in a sub-array and enqueue child nodes.'],
      testCases: [{ input: { root: [3, 9, 20, null, null, 15, 7] }, expectedOutput: [[3], [9, 20], [15, 7]], isHidden: false }],
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)'
    },
    {
      id: 'dsa_18',
      title: 'Lowest Common Ancestor of a BST',
      slug: 'lowest-common-ancestor-of-a-binary-search-tree',
      difficulty: 'medium',
      topic: 'Trees',
      description: 'Given a binary search tree (BST), find the lowest common ancestor (LCA) node of two given nodes `p` and `q`.',
      examples: [{ input: 'root = [6,2,8,0,4,7,9], p = 2, q = 8', output: '6', explanation: 'LCA is 6.' }],
      constraints: ['2 <= nodes <= 10^5'],
      starterCode: {
        javascript: 'function lowestCommonAncestor(root, p, q) {\n  // Write code here\n}',
        python: 'def lowest_common_ancestor(root, p, q):\n    pass',
        cpp: 'class Solution {\npublic:\n    TreeNode* lowestCommonAncestor(TreeNode* root, TreeNode* p, TreeNode* q) {\n        \n    }\n};',
        java: 'class Solution {\n    public TreeNode lowestCommonAncestor(TreeNode root, TreeNode p, TreeNode q) {\n        \n    }\n}'
      },
      hints: ['Use BST ordering property.', 'If both p and q values are smaller than root, LCA is in left subtree.', 'If both are greater, LCA is in right subtree. Otherwise, current node is the split point (LCA).'],
      testCases: [{ input: { root: [6, 2, 8, 0, 4, 7, 9], p: 2, q: 8 }, expectedOutput: 6, isHidden: false }],
      timeComplexity: 'O(H)',
      spaceComplexity: 'O(1)'
    },
    {
      id: 'dsa_19',
      title: 'Serialize and Deserialize Binary Tree',
      slug: 'serialize-and-deserialize-binary-tree',
      difficulty: 'hard',
      topic: 'Trees',
      description: 'Design an algorithm to serialize a binary tree into a string and deserialize that string back into the original tree structure.',
      examples: [{ input: 'root = [1,2,3,null,null,4,5]', output: '[1,2,3,null,null,4,5]', explanation: 'Tree structure preserved.' }],
      constraints: ['0 <= nodes <= 10^4'],
      starterCode: {
        javascript: 'function serialize(root) {}\nfunction deserialize(data) {}',
        python: 'def serialize(root):\n    pass\ndef deserialize(data):\n    pass',
        cpp: 'class Codec {\npublic:\n    string serialize(TreeNode* root) {}\n    TreeNode* deserialize(string data) {}\n};',
        java: 'public class Codec {\n    public String serialize(TreeNode root) {}\n    public TreeNode deserialize(String data) {}\n}'
      },
      hints: ['Use pre-order traversal with delimiter like comma.', 'Encode null nodes with a sentinel character like "#".', 'When deserializing, reconstruct recursively reading tokens.'],
      testCases: [{ input: { root: [1, 2, 3, null, null, 4, 5] }, expectedOutput: [1, 2, 3, null, null, 4, 5], isHidden: false }],
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)'
    },

    // Graphs (4)
    {
      id: 'dsa_20',
      title: 'Number of Islands',
      slug: 'number-of-islands',
      difficulty: 'medium',
      topic: 'Graphs',
      description: 'Given an `m x n` 2D binary grid `grid` which represents a map of \'1\'s (land) and \'0\'s (water), return the number of islands.',
      examples: [{ input: 'grid = [["1","1","0"],["1","1","0"],["0","0","1"]]', output: '2', explanation: 'Two distinct connected components.' }],
      constraints: ['1 <= m, n <= 300'],
      starterCode: {
        javascript: 'function numIslands(grid) {\n  // Write code here\n}',
        python: 'def num_islands(grid):\n    pass',
        cpp: 'class Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        \n    }\n};',
        java: 'class Solution {\n    public int numIslands(char[][] grid) {\n        \n    }\n}'
      },
      hints: ['Iterate through grid cells.', 'When you find a \'1\', increment island count and trigger DFS/BFS to mark all connected land as visited (\'0\').', 'Check 4-directional bounds.'],
      testCases: [{ input: { grid: [['1', '1', '0'], ['1', '1', '0'], ['0', '0', '1']] }, expectedOutput: 2, isHidden: false }],
      timeComplexity: 'O(M * N)',
      spaceComplexity: 'O(M * N)'
    },
    {
      id: 'dsa_21',
      title: 'Clone Graph',
      slug: 'clone-graph',
      difficulty: 'medium',
      topic: 'Graphs',
      description: 'Given a reference of a node in a connected undirected graph, return a deep copy (clone) of the graph.',
      examples: [{ input: 'adjList = [[2,4],[1,3],[2,4],[1,3]]', output: '[[2,4],[1,3],[2,4],[1,3]]', explanation: 'Deep copied graph.' }],
      constraints: ['0 <= nodes <= 100'],
      starterCode: {
        javascript: 'function cloneGraph(node) {\n  // Write code here\n}',
        python: 'def clone_graph(node):\n    pass',
        cpp: 'class Solution {\npublic:\n    Node* cloneGraph(Node* node) {\n        \n    }\n};',
        java: 'class Solution {\n    public Node cloneGraph(Node node) {\n        \n    }\n}'
      },
      hints: ['Use a hash map mapping original nodes to cloned nodes.', 'Perform DFS or BFS traversal.', 'For each neighbor, create copy if not seen, and connect to current copy.'],
      testCases: [{ input: { adjList: [[2, 4], [1, 3], [2, 4], [1, 3]] }, expectedOutput: [[2, 4], [1, 3], [2, 4], [1, 3]], isHidden: false }],
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V)'
    },
    {
      id: 'dsa_22',
      title: 'Course Schedule (Cycle Detection / Topo Sort)',
      slug: 'course-schedule',
      difficulty: 'medium',
      topic: 'Graphs',
      description: 'There are a total of `numCourses` courses labeled `0` to `numCourses - 1`. Given prerequisites `[a, b]` meaning you must take `b` before `a`, return `true` if you can finish all courses.',
      examples: [{ input: 'numCourses = 2, prerequisites = [[1,0]]', output: 'true', explanation: 'Course 1 requires 0.' }],
      constraints: ['1 <= numCourses <= 2000'],
      starterCode: {
        javascript: 'function canFinish(numCourses, prerequisites) {\n  // Write code here\n}',
        python: 'def can_finish(numCourses, prerequisites):\n    pass',
        cpp: 'class Solution {\npublic:\n    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {\n        \n    }\n};',
        java: 'class Solution {\n    public boolean canFinish(int numCourses, int[][] prerequisites) {\n        \n    }\n}'
      },
      hints: ['Model problem as finding cycle in directed graph using Kahn\'s Algorithm (indegree BFS).', 'Compute indegree of all nodes and add 0-indegree nodes to queue.', 'Count processed nodes: if count equals numCourses, no cycle.'],
      testCases: [{ input: { numCourses: 2, prerequisites: [[1, 0]] }, expectedOutput: true, isHidden: false }],
      timeComplexity: 'O(V + E)',
      spaceComplexity: 'O(V + E)'
    },
    {
      id: 'dsa_23',
      title: 'Word Ladder',
      slug: 'word-ladder',
      difficulty: 'hard',
      topic: 'Graphs',
      description: 'Given two words `beginWord` and `endWord`, and a dictionary `wordList`, return the number of words in the shortest transformation sequence from `beginWord` to `endWord`.',
      examples: [{ input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: '5', explanation: '"hit" -> "hot" -> "dot" -> "dog" -> "cog"' }],
      constraints: ['1 <= beginWord.length <= 10', 'wordList.length <= 5000'],
      starterCode: {
        javascript: 'function ladderLength(beginWord, endWord, wordList) {\n  // Write code here\n}',
        python: 'def ladder_length(beginWord, endWord, wordList):\n    pass',
        cpp: 'class Solution {\npublic:\n    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {\n        \n    }\n};',
        java: 'class Solution {\n    public int ladderLength(String beginWord, String endWord, List<String> wordList) {\n        \n    }\n}'
      },
      hints: ['Shortest transformation path = BFS on an unweighted graph.', 'Generate 1-character variations for the current word.', 'Check existence in word set and track visited words.'],
      testCases: [{ input: { beginWord: 'hit', endWord: 'cog', wordList: ['hot', 'dot', 'dog', 'lot', 'log', 'cog'] }, expectedOutput: 5, isHidden: false }],
      timeComplexity: 'O(M^2 * N)',
      spaceComplexity: 'O(M * N)'
    },

    // Dynamic Programming (5)
    {
      id: 'dsa_24',
      title: 'Climbing Stairs',
      slug: 'climbing-stairs',
      difficulty: 'easy',
      topic: 'Dynamic Programming',
      description: 'You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
      examples: [{ input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, 2+1.' }],
      constraints: ['1 <= n <= 45'],
      starterCode: {
        javascript: 'function climbStairs(n) {\n  // Write code here\n}',
        python: 'def climb_stairs(n):\n    pass',
        cpp: 'class Solution {\npublic:\n    int climbStairs(int n) {\n        \n    }\n};',
        java: 'class Solution {\n    public int climbStairs(int n) {\n        \n    }\n}'
      },
      hints: ['dp[i] = dp[i-1] + dp[i-2].', 'Notice this is the Fibonacci sequence.', 'Optimize space to O(1) by maintaining just two variables.'],
      testCases: [{ input: { n: 3 }, expectedOutput: 3, isHidden: false }, { input: { n: 2 }, expectedOutput: 2, isHidden: false }],
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)'
    },
    {
      id: 'dsa_25',
      title: 'Coin Change',
      slug: 'coin-change',
      difficulty: 'medium',
      topic: 'Dynamic Programming',
      description: 'You are given an integer array `coins` representing coins of different denominations and an integer `amount`. Return the fewest number of coins that you need to make up that amount, or `-1` if impossible.',
      examples: [{ input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1.' }],
      constraints: ['1 <= coins.length <= 12', '0 <= amount <= 10^4'],
      starterCode: {
        javascript: 'function coinChange(coins, amount) {\n  // Write code here\n}',
        python: 'def coin_change(coins, amount):\n    pass',
        cpp: 'class Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        \n    }\n};',
        java: 'class Solution {\n    public int coinChange(int[] coins, int amount) {\n        \n    }\n}'
      },
      hints: ['Initialize dp array of size amount + 1 with infinity.', 'dp[0] = 0.', 'For each i from 1 to amount, dp[i] = min(dp[i], dp[i - coin] + 1).'],
      testCases: [{ input: { coins: [1, 2, 5], amount: 11 }, expectedOutput: 3, isHidden: false }],
      timeComplexity: 'O(amount * coins.length)',
      spaceComplexity: 'O(amount)'
    },
    {
      id: 'dsa_26',
      title: 'Longest Increasing Subsequence',
      slug: 'longest-increasing-subsequence',
      difficulty: 'medium',
      topic: 'Dynamic Programming',
      description: 'Given an integer array `nums`, return the length of the longest strictly increasing subsequence.',
      examples: [{ input: 'nums = [10,9,2,5,3,7,101,18]', output: '4', explanation: 'The longest increasing subsequence is [2,3,7,101], therefore the length is 4.' }],
      constraints: ['1 <= nums.length <= 2500'],
      starterCode: {
        javascript: 'function lengthOfLIS(nums) {\n  // Write code here\n}',
        python: 'def length_of_lis(nums):\n    pass',
        cpp: 'class Solution {\npublic:\n    int lengthOfLIS(vector<int>& nums) {\n        \n    }\n};',
        java: 'class Solution {\n    public int lengthOfLIS(int[] nums) {\n        \n    }\n}'
      },
      hints: ['DP approach: dp[i] = max(dp[j] + 1) for all j < i where nums[j] < nums[i].', 'Patience sorting / Binary search approach runs in O(N log N).', 'Maintain tails array and use binary search to insert/replace.'],
      testCases: [{ input: { nums: [10, 9, 2, 5, 3, 7, 101, 18] }, expectedOutput: 4, isHidden: false }],
      timeComplexity: 'O(N log N)',
      spaceComplexity: 'O(N)'
    },
    {
      id: 'dsa_27',
      title: '0/1 Knapsack Problem',
      slug: '0-1-knapsack-problem',
      difficulty: 'medium',
      topic: 'Dynamic Programming',
      description: 'Given weights and values of `n` items, put these items in a knapsack of capacity `W` to get the maximum total value in the knapsack.',
      examples: [{ input: 'values = [60, 100, 120], weights = [10, 20, 30], W = 50', output: '220', explanation: 'Pick items 2 and 3 for weight 50 and value 220.' }],
      constraints: ['1 <= n <= 100', '1 <= W <= 1000'],
      starterCode: {
        javascript: 'function knapSack(W, weights, values, n) {\n  // Write code here\n}',
        python: 'def knap_sack(W, weights, values, n):\n    pass',
        cpp: 'class Solution {\npublic:\n    int knapSack(int W, vector<int>& weights, vector<int>& values) {\n        \n    }\n};',
        java: 'class Solution {\n    public int knapSack(int W, int[] weights, int[] values) {\n        \n    }\n}'
      },
      hints: ['dp[w] represents maximum value with knapsack capacity w.', 'Iterate items outer loop, capacity w from W down to weights[i] to avoid re-using item in same pass.', 'dp[w] = max(dp[w], dp[w - weights[i]] + values[i]).'],
      testCases: [{ input: { W: 50, weights: [10, 20, 30], values: [60, 100, 120], n: 3 }, expectedOutput: 220, isHidden: false }],
      timeComplexity: 'O(N * W)',
      spaceComplexity: 'O(W)'
    },
    {
      id: 'dsa_28',
      title: 'Edit Distance',
      slug: 'edit-distance',
      difficulty: 'hard',
      topic: 'Dynamic Programming',
      description: 'Given two strings `word1` and `word2`, return the minimum number of operations required to convert `word1` to `word2` (insert, delete, replace).',
      examples: [{ input: 'word1 = "horse", word2 = "ros"', output: '3', explanation: 'horse -> rorse -> rose -> ros.' }],
      constraints: ['0 <= word1.length, word2.length <= 500'],
      starterCode: {
        javascript: 'function minDistance(word1, word2) {\n  // Write code here\n}',
        python: 'def min_distance(word1, word2):\n    pass',
        cpp: 'class Solution {\npublic:\n    int minDistance(string word1, string word2) {\n        \n    }\n};',
        java: 'class Solution {\n    public int minDistance(String word1, String word2) {\n        \n    }\n}'
      },
      hints: ['dp[i][j] = min operations to transform word1[0..i-1] into word2[0..j-1].', 'If characters match, dp[i][j] = dp[i-1][j-1].', 'Else, dp[i][j] = 1 + min(insert dp[i][j-1], delete dp[i-1][j], replace dp[i-1][j-1]).'],
      testCases: [{ input: { word1: 'horse', word2: 'ros' }, expectedOutput: 3, isHidden: false }],
      timeComplexity: 'O(M * N)',
      spaceComplexity: 'O(M * N)'
    },

    // Stacks & Queues (4)
    {
      id: 'dsa_29',
      title: 'Min Stack',
      slug: 'min-stack',
      difficulty: 'medium',
      topic: 'Stacks & Queues',
      description: 'Design a stack that supports push, pop, top, and retrieving the minimum element in constant time O(1).',
      examples: [{ input: '["MinStack","push","push","push","getMin","pop","top","getMin"]', output: '[null,null,null,null,-3,null,0,-2]', explanation: 'O(1) min retrieval.' }],
      constraints: ['Methods called up to 3 * 10^4 times.'],
      starterCode: {
        javascript: 'class MinStack {\n  constructor() {}\n  push(val) {}\n  pop() {}\n  top() {}\n  getMin() {}\n}',
        python: 'class MinStack:\n    def __init__(self):\n        pass\n    def push(self, val: int):\n        pass\n    def pop(self):\n        pass\n    def top(self):\n        pass\n    def get_min(self):\n        pass',
        cpp: 'class MinStack {\npublic:\n    MinStack() {}\n    void push(int val) {}\n    void pop() {}\n    int top() {}\n    int getMin() {}\n};',
        java: 'class MinStack {\n    public MinStack() {}\n    public void push(int val) {}\n    public void pop() {}\n    public int top() {}\n    public int getMin() {}\n}'
      },
      hints: ['Maintain two stacks: a main data stack and a minStack tracking the current minimum at each level.', 'When pushing x, also push min(x, minStack.top()) to minStack.', 'Pop both in tandem.'],
      testCases: [{ input: { ops: ['push(-2)', 'push(0)', 'push(-3)', 'getMin()', 'pop()', 'top()', 'getMin()'] }, expectedOutput: [-3, 0, -2], isHidden: false }],
      timeComplexity: 'O(1) for all operations',
      spaceComplexity: 'O(N)'
    },
    {
      id: 'dsa_30',
      title: 'Daily Temperatures (Monotonic Stack)',
      slug: 'daily-temperatures',
      difficulty: 'medium',
      topic: 'Stacks & Queues',
      description: 'Given an array of integers `temperatures`, return an array `answer` such that `answer[i]` is the number of days you have to wait after the `ith` day to get a warmer temperature.',
      examples: [{ input: 'temperatures = [73,74,75,71,69,72,76,73]', output: '[1,1,4,2,1,1,0,0]', explanation: 'Days until warmer weather.' }],
      constraints: ['1 <= temperatures.length <= 10^5'],
      starterCode: {
        javascript: 'function dailyTemperatures(temperatures) {\n  // Write code here\n}',
        python: 'def daily_temperatures(temperatures):\n    pass',
        cpp: 'class Solution {\npublic:\n    vector<int> dailyTemperatures(vector<int>& temperatures) {\n        \n    }\n};',
        java: 'class Solution {\n    public int[] dailyTemperatures(int[] temperatures) {\n        \n    }\n}'
      },
      hints: ['Use a monotonic decreasing stack storing indices.', 'When encountering a temperature greater than stack top index, pop and calculate days difference: i - prevIndex.', 'Push current index onto stack.'],
      testCases: [{ input: { temperatures: [73, 74, 75, 71, 69, 72, 76, 73] }, expectedOutput: [1, 1, 4, 2, 1, 1, 0, 0], isHidden: false }],
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)'
    },
    {
      id: 'dsa_31',
      title: 'Implement Queue using Stacks',
      slug: 'implement-queue-using-stacks',
      difficulty: 'easy',
      topic: 'Stacks & Queues',
      description: 'Implement a first in first out (FIFO) queue using only two stacks.',
      examples: [{ input: '["MyQueue", "push", "push", "peek", "pop", "empty"]', output: '[null, null, null, 1, 1, false]', explanation: 'Queue simulated.' }],
      constraints: ['1 <= calls <= 100'],
      starterCode: {
        javascript: 'class MyQueue {\n  constructor() {}\n  push(x) {}\n  pop() {}\n  peek() {}\n  empty() {}\n}',
        python: 'class MyQueue:\n    pass',
        cpp: 'class MyQueue {\npublic:\n    MyQueue() {}\n    void push(int x) {}\n    int pop() {}\n    int peek() {}\n    bool empty() {}\n};',
        java: 'class MyQueue {\n    public MyQueue() {}\n    public void push(int x) {}\n    public int pop() {}\n    public int peek() {}\n    public boolean empty() {}\n}'
      },
      hints: ['Use stackIn for push operations, and stackOut for pop and peek operations.', 'When stackOut is empty, transfer all elements from stackIn to stackOut (reversing their order to FIFO).'],
      testCases: [{ input: { ops: ['push(1)', 'push(2)', 'peek()', 'pop()', 'empty()'] }, expectedOutput: [1, 1, false], isHidden: false }],
      timeComplexity: 'Amortized O(1)',
      spaceComplexity: 'O(N)'
    },
    {
      id: 'dsa_32',
      title: 'Sliding Window Maximum',
      slug: 'sliding-window-maximum',
      difficulty: 'hard',
      topic: 'Stacks & Queues',
      description: 'You are given an array of integers `nums`, there is a sliding window of size `k` which is moving from the very left to the very right. Return the max sliding window.',
      examples: [{ input: 'nums = [1,3,-1,-3,5,3,6,7], k = 3', output: '[3,3,5,5,6,7]', explanation: 'Window maximums.' }],
      constraints: ['1 <= nums.length <= 10^5', '1 <= k <= nums.length'],
      starterCode: {
        javascript: 'function maxSlidingWindow(nums, k) {\n  // Write code here\n}',
        python: 'def max_sliding_window(nums, k):\n    pass',
        cpp: 'class Solution {\npublic:\n    vector<int> maxSlidingWindow(vector<int>& nums, int k) {\n        \n    }\n};',
        java: 'class Solution {\n    public int[] maxSlidingWindow(int[] nums, int k) {\n        \n    }\n}'
      },
      hints: ['Use a double-ended queue (deque) storing indices in decreasing order of values.', 'Remove indices falling out of the window [i - k + 1, i].', 'Pop smaller elements from back before inserting new element.'],
      testCases: [{ input: { nums: [1, 3, -1, -3, 5, 3, 6, 7], k: 3 }, expectedOutput: [3, 3, 5, 5, 6, 7], isHidden: false }],
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(K)'
    },

    // Binary Search (4)
    {
      id: 'dsa_33',
      title: 'Binary Search',
      slug: 'binary-search',
      difficulty: 'easy',
      topic: 'Binary Search',
      description: 'Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.',
      examples: [{ input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 exists at index 4.' }],
      constraints: ['1 <= nums.length <= 10^4'],
      starterCode: {
        javascript: 'function search(nums, target) {\n  // Write code here\n}',
        python: 'def search(nums, target):\n    pass',
        cpp: 'class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        \n    }\n};',
        java: 'class Solution {\n    public int search(int[] nums, int target) {\n        \n    }\n}'
      },
      hints: ['Initialize low = 0, high = nums.length - 1.', 'mid = low + Math.floor((high - low) / 2).', 'Adjust low or high depending on nums[mid] comparison.'],
      testCases: [{ input: { nums: [-1, 0, 3, 5, 9, 12], target: 9 }, expectedOutput: 4, isHidden: false }],
      timeComplexity: 'O(log N)',
      spaceComplexity: 'O(1)'
    },
    {
      id: 'dsa_34',
      title: 'Search in Rotated Sorted Array',
      slug: 'search-in-rotated-sorted-array',
      difficulty: 'medium',
      topic: 'Binary Search',
      description: 'Given the sorted array `nums` after rotation at an unknown pivot index, find the index of `target`, or `-1` if not found in O(log n) time.',
      examples: [{ input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4', explanation: '0 is at index 4.' }],
      constraints: ['1 <= nums.length <= 5000'],
      starterCode: {
        javascript: 'function search(nums, target) {\n  // Write code here\n}',
        python: 'def search(nums, target):\n    pass',
        cpp: 'class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        \n    }\n};',
        java: 'class Solution {\n    public int search(int[] nums, int target) {\n        \n    }\n}'
      },
      hints: ['One half of the array will always be strictly sorted.', 'Check if left half (nums[low] <= nums[mid]) is sorted.', 'If sorted and target lies within [nums[low], nums[mid]], search left, otherwise search right.'],
      testCases: [{ input: { nums: [4, 5, 6, 7, 0, 1, 2], target: 0 }, expectedOutput: 4, isHidden: false }],
      timeComplexity: 'O(log N)',
      spaceComplexity: 'O(1)'
    },
    {
      id: 'dsa_35',
      title: 'Find Minimum in Rotated Sorted Array',
      slug: 'find-minimum-in-rotated-sorted-array',
      difficulty: 'medium',
      topic: 'Binary Search',
      description: 'Given the sorted rotated array `nums` of unique elements, return the minimum element of this array.',
      examples: [{ input: 'nums = [3,4,5,1,2]', output: '1', explanation: '1 is minimum.' }],
      constraints: ['1 <= nums.length <= 5000'],
      starterCode: {
        javascript: 'function findMin(nums) {\n  // Write code here\n}',
        python: 'def find_min(nums):\n    pass',
        cpp: 'class Solution {\npublic:\n    int findMin(vector<int>& nums) {\n        \n    }\n};',
        java: 'class Solution {\n    public int findMin(int[] nums) {\n        \n    }\n}'
      },
      hints: ['Compare nums[mid] with nums[high].', 'If nums[mid] > nums[high], minimum must be in right half (low = mid + 1).', 'Else minimum is in left half or is mid (high = mid).'],
      testCases: [{ input: { nums: [3, 4, 5, 1, 2] }, expectedOutput: 1, isHidden: false }],
      timeComplexity: 'O(log N)',
      spaceComplexity: 'O(1)'
    },
    {
      id: 'dsa_36',
      title: 'Koko Eating Bananas',
      slug: 'koko-eating-bananas',
      difficulty: 'medium',
      topic: 'Binary Search',
      description: 'Koko loves to eat bananas. Given `piles` and `h` hours, return the minimum integer `k` such that she can eat all bananas within `h` hours.',
      examples: [{ input: 'piles = [3,6,7,11], h = 8', output: '4', explanation: 'At speed 4 bananas/hr she eats in 8 hours.' }],
      constraints: ['1 <= piles.length <= 10^4', 'piles.length <= h <= 10^9'],
      starterCode: {
        javascript: 'function minEatingSpeed(piles, h) {\n  // Write code here\n}',
        python: 'def min_eating_speed(piles, h):\n    pass',
        cpp: 'class Solution {\npublic:\n    int minEatingSpeed(vector<int>& piles, int h) {\n        \n    }\n};',
        java: 'class Solution {\n    public int minEatingSpeed(int[] piles, int h) {\n        \n    }\n}'
      },
      hints: ['Binary search on the answer space: range of speeds is [1, max(piles)].', 'For candidate speed k, calculate total hours: sum(ceil(p / k)).', 'If total hours <= h, try smaller speed (high = mid); else increase speed (low = mid + 1).'],
      testCases: [{ input: { piles: [3, 6, 7, 11], h: 8 }, expectedOutput: 4, isHidden: false }],
      timeComplexity: 'O(N log(max(P)))',
      spaceComplexity: 'O(1)'
    },

    // Greedy (4)
    {
      id: 'dsa_37',
      title: 'Jump Game',
      slug: 'jump-game',
      difficulty: 'medium',
      topic: 'Greedy',
      description: 'You are given an integer array `nums`. You are initially positioned at the array\'s first index, and each element in the array represents your maximum jump length at that position. Return `true` if you can reach the last index, or `false` otherwise.',
      examples: [{ input: 'nums = [2,3,1,1,4]', output: 'true', explanation: 'Jump 1 step from index 0 to 1, then 3 steps to the last index.' }],
      constraints: ['1 <= nums.length <= 10^4'],
      starterCode: {
        javascript: 'function canJump(nums) {\n  // Write code here\n}',
        python: 'def can_jump(nums):\n    pass',
        cpp: 'class Solution {\npublic:\n    bool canJump(vector<int>& nums) {\n        \n    }\n};',
        java: 'class Solution {\n    public boolean canJump(int[] nums) {\n        \n    }\n}'
      },
      hints: ['Maintain the furthest reachable index `maxReach`.', 'At index i, if i > maxReach, return false.', 'Update maxReach = max(maxReach, i + nums[i]). If maxReach >= nums.length - 1, return true.'],
      testCases: [{ input: { nums: [2, 3, 1, 1, 4] }, expectedOutput: true, isHidden: false }, { input: { nums: [3, 2, 1, 0, 4] }, expectedOutput: false, isHidden: false }],
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)'
    },
    {
      id: 'dsa_38',
      title: 'Gas Station',
      slug: 'gas-station',
      difficulty: 'medium',
      topic: 'Greedy',
      description: 'There are `n` gas stations along a circular route, where the amount of gas at the `ith` station is `gas[i]`. You have a car with an unlimited gas tank and it costs `cost[i]` of gas to travel from the `ith` station to its next `(i + 1)th` station. Return the starting gas station\'s index if you can travel around the circuit once in the clockwise direction, otherwise return `-1`.',
      examples: [{ input: 'gas = [1,2,3,4,5], cost = [3,4,5,1,2]', output: '3', explanation: 'Start at index 3.' }],
      constraints: ['n == gas.length == cost.length', '1 <= n <= 10^5'],
      starterCode: {
        javascript: 'function canCompleteCircuit(gas, cost) {\n  // Write code here\n}',
        python: 'def can_complete_circuit(gas, cost):\n    pass',
        cpp: 'class Solution {\npublic:\n    int canCompleteCircuit(vector<int>& gas, vector<int>& cost) {\n        \n    }\n};',
        java: 'class Solution {\n    public int canCompleteCircuit(int[] gas, int[] cost) {\n        \n    }\n}'
      },
      hints: ['If total sum of gas < total sum of cost, completing the circuit is impossible (return -1).', 'Maintain tank = 0. Iterate stations: tank += gas[i] - cost[i].', 'If tank < 0, reset tank to 0 and set start = i + 1.'],
      testCases: [{ input: { gas: [1, 2, 3, 4, 5], cost: [3, 4, 5, 1, 2] }, expectedOutput: 3, isHidden: false }],
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)'
    },
    {
      id: 'dsa_39',
      title: 'Task Scheduler',
      slug: 'task-scheduler',
      difficulty: 'medium',
      topic: 'Greedy',
      description: 'Given a characters array `tasks`, representing the tasks a CPU needs to do, where each letter represents a different task. Tasks could be done in any order. Each task is done in one unit of time. For each unit of time, the CPU could complete either one task or just be idle. However, there is a non-negative integer `n` that represents the cooldown period between two same tasks. Return the least number of units of times that the CPU will take to finish all the given tasks.',
      examples: [{ input: 'tasks = ["A","A","A","B","B","B"], n = 2', output: '8', explanation: 'A -> B -> idle -> A -> B -> idle -> A -> B.' }],
      constraints: ['1 <= tasks.length <= 10^4', '0 <= n <= 100'],
      starterCode: {
        javascript: 'function leastInterval(tasks, n) {\n  // Write code here\n}',
        python: 'def least_interval(tasks, n):\n    pass',
        cpp: 'class Solution {\npublic:\n    int leastInterval(vector<char>& tasks, int n) {\n        \n    }\n};',
        java: 'class Solution {\n    public int leastInterval(char[] tasks, int n) {\n        \n    }\n}'
      },
      hints: ['Find the task with maximum frequency `maxFreq`.', 'Count how many tasks share this maximum frequency `maxCount`.', 'Formula: max(tasks.length, (maxFreq - 1) * (n + 1) + maxCount).'],
      testCases: [{ input: { tasks: ['A', 'A', 'A', 'B', 'B', 'B'], n: 2 }, expectedOutput: 8, isHidden: false }],
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(1)'
    },
    {
      id: 'dsa_40',
      title: 'Assign Cookies',
      slug: 'assign-cookies',
      difficulty: 'easy',
      topic: 'Greedy',
      description: 'Assume you are an awesome parent and want to give your children some cookies. Each child `i` has a greed factor `g[i]`, and each cookie `j` has a size `s[j]`. Maximize the number of satisfied children.',
      examples: [{ input: 'g = [1,2,3], s = [1,1]', output: '1', explanation: 'Only child with greed 1 can be satisfied.' }],
      constraints: ['1 <= g.length <= 3 * 10^4', '0 <= s.length <= 3 * 10^4'],
      starterCode: {
        javascript: 'function findContentChildren(g, s) {\n  // Write code here\n}',
        python: 'def find_content_children(g, s):\n    pass',
        cpp: 'class Solution {\npublic:\n    int findContentChildren(vector<int>& g, vector<int>& s) {\n        \n    }\n};',
        java: 'class Solution {\n    public int findContentChildren(int[] g, int[] s) {\n        \n    }\n}'
      },
      hints: ['Sort both greed array `g` and cookie size array `s`.', 'Greedily satisfy the child with the smallest greed using the smallest possible cookie that suffices.', 'Iterate with two pointers.'],
      testCases: [{ input: { g: [1, 2, 3], s: [1, 1] }, expectedOutput: 1, isHidden: false }],
      timeComplexity: 'O(N log N + M log M)',
      spaceComplexity: 'O(1)'
    }
  ];

  return problems;
}

// 3. CS MCQs & Concepts Seed (60 MCQs: 12 OOP, 12 DBMS, 12 OS, 12 CN, 12 SQL)
function generateCSData() {
  const subjects = {
    oop: {
      name: 'Object-Oriented Programming',
      concept: 'OOP is a programming paradigm based on the concept of "objects", which can contain data in the form of fields and code in the form of procedures. The 4 primary pillars are Encapsulation, Abstraction, Inheritance, and Polymorphism.',
      simpleExplanation: 'Encapsulation bundles data and methods while restricting direct access; Abstraction hides implementation complexity; Inheritance allows code reuse; Polymorphism lets entities take multiple forms through overloading and overriding.',
      example: 'Class Animal with method sound(); Dog extends Animal and overrides sound() to emit "Bark".',
      keyInterviewQuestions: [
        'Explain the difference between compile-time polymorphism (overloading) and runtime polymorphism (overriding).',
        'What is an abstract class versus an interface, and when should each be used?',
        'Explain the SOLID principles with practical software engineering examples.',
        'Why is composition often favored over class inheritance?'
      ],
      mcqs: [
        { id: 'cs_oop_1', question: 'Which OOP principle is demonstrated by hiding internal object states and exposing only necessary methods?', options: ['Encapsulation', 'Polymorphism', 'Inheritance', 'Cohesion'], correctOption: 0, explanation: 'Encapsulation restricts direct external modification of internal fields through access modifiers and getters/setters.' },
        { id: 'cs_oop_2', question: 'In Java/C++, what keyword is used to prevent a class from being subclassed or a method from being overridden?', options: ['final', 'static', 'const', 'abstract'], correctOption: 0, explanation: 'The `final` keyword in Java or `final` specifier in C++ disables subclassing and overriding.' },
        { id: 'cs_oop_3', question: 'Which of the following is true regarding multiple inheritance in Java classes?', options: ['Java does not support multiple class inheritance to prevent the Diamond Problem', 'Java supports multiple class inheritance natively with extends A, B', 'Java uses virtual inheritance for multiple class inheritance', 'Multiple inheritance is allowed only for abstract classes'], correctOption: 0, explanation: 'Java avoids ambiguity (the diamond problem) by disallowing multiple class inheritance, allowing multiple interface implementations instead.' },
        { id: 'cs_oop_4', question: 'Dynamic method dispatch in OOP is an implementation of:', options: ['Runtime Polymorphism', 'Compile-time Polymorphism', 'Data Hiding', 'Type Casting'], correctOption: 0, explanation: 'Dynamic method dispatch resolves the call to an overridden method at runtime based on the actual object instance.' },
        { id: 'cs_oop_5', question: 'The \'L\' in SOLID design principles stands for:', options: ['Liskov Substitution Principle', 'Linear Dependency Principle', 'Lazy Loading Principle', 'Loose Coupling Principle'], correctOption: 0, explanation: 'Liskov Substitution Principle states that derived classes must be substitutable for their base classes without altering program correctness.' },
        { id: 'cs_oop_6', question: 'What is the key difference between an Abstract Class and an Interface in modern OOP?', options: ['An abstract class can have instance fields and state constructors, whereas interfaces cannot hold instance state', 'Interfaces can have constructors', 'Abstract classes cannot have method implementations', 'Interfaces only allow private methods'], correctOption: 0, explanation: 'Abstract classes maintain state (constructors and non-static member variables), whereas interfaces define contracts without instance state.' },
        { id: 'cs_oop_7', question: 'A constructor in OOP:', options: ['Has no return type and initializes new object instances', 'Returns a reference to the class type', 'Must be private in all standard classes', 'Can be declared static and overridden'], correctOption: 0, explanation: 'Constructors are special member functions executed when an object is instantiated to initialize its state, having no explicit return type.' },
        { id: 'cs_oop_8', question: 'Which relationship is represented by \'has-a\'?', options: ['Composition/Aggregation', 'Inheritance', 'Generalization', 'Specialization'], correctOption: 0, explanation: 'A \'has-a\' relationship indicates composition or aggregation (e.g. A Car has an Engine), whereas \'is-a\' represents inheritance.' },
        { id: 'cs_oop_9', question: 'Method overloading occurs when:', options: ['Methods in the same class share a name but differ in parameter count or types', 'A subclass redefines a parent method with the exact same signature', 'Methods are declared static final', 'A method calls itself recursively'], correctOption: 0, explanation: 'Method overloading is static/compile-time polymorphism where methods in the same scope share names but different signatures.' },
        { id: 'cs_oop_10', question: 'What is the purpose of a destructor / finalize method?', options: ['To release resources (file handles, sockets, native memory) before object reclamation', 'To allocate memory for the object', 'To create a clone of the object', 'To serialize the object into JSON'], correctOption: 0, explanation: 'Destructors clean up system resources and unmanaged memory when an object lifecycle ends.' },
        { id: 'cs_oop_11', question: 'In the Singleton Design Pattern, the constructor must be:', options: ['Private', 'Public', 'Protected', 'Static'], correctOption: 0, explanation: 'A private constructor prevents external instantiations, forcing access through a single static getInstance() method.' },
        { id: 'cs_oop_12', question: 'Coupling in software architecture refers to:', options: ['The degree of direct dependency between software modules', 'The degree to which elements inside a single module belong together', 'The execution speed of functions', 'The number of lines of code in a class'], correctOption: 0, explanation: 'Coupling measures inter-module dependencies (low coupling is desired), while cohesion measures internal focus of a single module (high cohesion is desired).' }
      ]
    },
    dbms: {
      name: 'Database Management Systems',
      concept: 'DBMS manages structured data storage, retrieval, and transaction integrity. Core concepts include Relational Algebra, ACID properties, Normalization (1NF to BCNF), Indexing (B-Trees / LSM Trees), and Concurrency Control.',
      simpleExplanation: 'ACID guarantees reliable transactions: Atomicity (all or nothing), Consistency (preserves invariants), Isolation (concurrent safety), Durability (survives crashes). Normalization minimizes redundancy.',
      example: 'Bank transfer: debiting Account A and crediting Account B wrapped in a transaction with BEGIN TRANSACTION and COMMIT.',
      keyInterviewQuestions: [
        'Explain the ACID properties and transaction isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable).',
        'How does a B+ Tree index work, and why is it preferred over a Hash Index for range queries?',
        'Explain the difference between clustered and non-clustered indexes.',
        'What are deadlocks in DBMS and how are they prevented or resolved?'
      ],
      mcqs: [
        { id: 'cs_dbms_1', question: 'Which ACID property guarantees that all operations within a transaction are completed or none are applied?', options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'], correctOption: 0, explanation: 'Atomicity ensures that all transaction modifications are committed together or completely rolled back on error.' },
        { id: 'cs_dbms_2', question: 'Which normal form eliminates transitive functional dependencies?', options: ['3NF (Third Normal Form)', '2NF (Second Normal Form)', '1NF (First Normal Form)', 'BCNF (Boyce-Codd Normal Form)'], correctOption: 0, explanation: '3NF requires that a relation is in 2NF and no non-prime attribute is transitively dependent on the primary key.' },
        { id: 'cs_dbms_3', question: 'In a B+ Tree index used by relational databases, where are actual record pointers stored?', options: ['Only in the leaf nodes', 'In both internal and leaf nodes', 'Only in the root node', 'In separate hash buckets'], correctOption: 0, explanation: 'B+ Trees store all actual record pointers/data exclusively in leaf nodes linked sequentially, facilitating fast range scans.' },
        { id: 'cs_dbms_4', question: 'A dirty read occurs when a transaction reads:', options: ['Uncommitted changes made by another concurrent transaction', 'Data that was deleted two hours ago', 'Data through an un-indexed column', 'Cached queries from a replica'], correctOption: 0, explanation: 'Dirty reads happen in the READ UNCOMMITTED isolation level when Transaction B reads rows modified by Transaction A before A commits.' },
        { id: 'cs_dbms_5', question: 'Which index type physically dictates the ordering of rows on the underlying disk storage?', options: ['Clustered Index', 'Non-Clustered Index', 'Secondary Index', 'Bitmap Index'], correctOption: 0, explanation: 'A clustered index determines the physical order of data on the disk table; hence, only one clustered index can exist per table.' },
        { id: 'cs_dbms_6', question: 'Two-Phase Locking (2PL) protocol ensures:', options: ['Conflict Serializability', 'Deadlock freedom', 'Zero disk I/O', 'Immediate commit without logging'], correctOption: 0, explanation: '2PL (Growing phase where locks are acquired, Shrinking phase where locks are released) guarantees conflict-serializable transaction schedules.' },
        { id: 'cs_dbms_7', question: 'What is the purpose of Write-Ahead Logging (WAL) in databases?', options: ['To guarantee Durability and Crash Recovery before modifying actual data pages on disk', 'To speed up SQL syntax parsing', 'To format output tables into JSON', 'To enforce foreign key constraints'], correctOption: 0, explanation: 'WAL writes log changes sequentially to disk before flushing dirty memory pages, ensuring durability even upon sudden crash.' },
        { id: 'cs_dbms_8', question: 'In relational algebra, which operator selects rows that satisfy a specified condition?', options: ['Selection (σ)', 'Projection (π)', 'Cartesian Product (×)', 'Join (⋈)'], correctOption: 0, explanation: 'Selection (sigma σ) filters tuples/rows based on a predicate.' },
        { id: 'cs_dbms_9', question: 'Which anomaly is prevented under the Repeatable Read transaction isolation level?', options: ['Non-repeatable reads (fuzzy reads)', 'Phantom reads', 'Serialization failures', 'Write skew across multiple tables'], correctOption: 0, explanation: 'Repeatable Read guarantees that any row read during a transaction will retain the same values throughout that transaction.' },
        { id: 'cs_dbms_10', question: 'A Candidate Key is defined as:', options: ['A minimal Superkey capable of uniquely identifying every tuple', 'Any attribute that contains non-null values', 'A secondary foreign key', 'A key generated by auto-increment'], correctOption: 0, explanation: 'A candidate key is a minimal set of attributes that uniquely identifies a row with no redundant attributes.' },
        { id: 'cs_dbms_11', question: 'CAP Theorem states that a distributed data store can simultaneously provide at most two of which three guarantees?', options: ['Consistency, Availability, Partition Tolerance', 'Concurrency, Atomicity, Performance', 'Caching, Availability, Persistence', 'Capacity, Authorization, Privacy'], correctOption: 0, explanation: 'In the presence of network partitions (P), a distributed system must choose between Consistency (C) and Availability (A).' },
        { id: 'cs_dbms_12', question: 'What is the difference between TRUNCATE and DELETE in SQL DBMS?', options: ['TRUNCATE is a DDL operation that deallocates pages without row-by-row logging; DELETE is DML and logs each deleted row', 'DELETE is faster than TRUNCATE', 'TRUNCATE can be filtered with a WHERE clause', 'DELETE drops the table schema completely'], correctOption: 0, explanation: 'TRUNCATE quickly resets the table by deallocating data pages (DDL), whereas DELETE removes rows one by one with rollback logs.' }
      ]
    },
    os: {
      name: 'Operating Systems',
      concept: 'Operating Systems manage computer hardware, memory, process execution, and system resources. Key topics include Processes vs Threads, CPU Scheduling, Synchronization (Mutex, Semaphore), Deadlocks, Virtual Memory, and Paging.',
      simpleExplanation: 'A process is an executing program with isolated memory address space; threads share process memory. Virtual memory gives processes illusion of contiguous large memory using paging.',
      example: 'Producer-Consumer problem using Semaphores for buffer synchronization.',
      keyInterviewQuestions: [
        'Differentiate between a Process and a Thread in terms of memory layout and context switching overhead.',
        'Explain the 4 necessary conditions for Deadlock (Coffman conditions) and how to handle them.',
        'How does Virtual Memory and Paging work, and what causes Page Faults (Thrashing)?',
        'Compare Mutex vs Counting Semaphore.'
      ],
      mcqs: [
        { id: 'cs_os_1', question: 'Which of the following is NOT one of the 4 Coffman conditions for deadlock?', options: ['Preemption allowed', 'Mutual Exclusion', 'Hold and Wait', 'Circular Wait'], correctOption: 0, explanation: 'Deadlock requires NO PREEMPTION. If preemption is allowed, deadlocks cannot persist.' },
        { id: 'cs_os_2', question: 'What hardware component accelerates Virtual Address to Physical Address translation in Paging?', options: ['TLB (Translation Lookaside Buffer)', 'L1 Instruction Cache', 'ALU', 'Direct Memory Access Controller'], correctOption: 0, explanation: 'The TLB is a high-speed associative hardware cache that caches recent virtual-to-physical page translations.' },
        { id: 'cs_os_3', question: 'Thrashing occurs in an operating system when:', options: ['The CPU spends more time swapping pages in and out of disk than executing processes', 'A process enters an infinite loop', 'A deadlock occurs between two threads', 'The hard drive runs out of sectors'], correctOption: 0, explanation: 'Thrashing happens when processes lack sufficient frames, causing constant high page-fault rates and CPU underutilization.' },
        { id: 'cs_os_4', question: 'Which scheduling algorithm is non-preemptive and assigns CPU to the process with the smallest execution time?', options: ['Shortest Job First (SJF)', 'Round Robin (RR)', 'Shortest Remaining Time First (SRTF)', 'Multi-Level Feedback Queue'], correctOption: 0, explanation: 'Non-preemptive Shortest Job First schedules the task with shortest burst time to run until completion.' },
        { id: 'cs_os_5', question: 'What is the primary difference between a Mutex and a Counting Semaphore?', options: ['A mutex has ownership and can only be unlocked by the thread that locked it; a semaphore is a signaling mechanism', 'A mutex can be shared across multiple machines', 'Semaphores can only have value 0 or 1', 'Mutexes do not prevent race conditions'], correctOption: 0, explanation: 'A Mutex provides mutual exclusion with thread ownership, whereas a Counting Semaphore tracks resource units and allows cross-thread signaling.' },
        { id: 'cs_os_6', question: 'What is a Zombie Process in UNIX/Linux systems?', options: ['A process that has completed execution but still has an entry in the process table because its parent hasn\'t read its exit status', 'A process that runs in background indefinitely', 'A process whose parent was terminated', 'A process that consumes 100% CPU'], correctOption: 0, explanation: 'A zombie process has exited, but remains in the process table until its parent calls wait()/waitpid() to collect its termination status.' },
        { id: 'cs_os_7', question: 'What happens during a Context Switch?', options: ['The OS saves the CPU registers and Program Counter of the current process and loads the saved state of the next process', 'The OS deletes virtual memory tables', 'The OS reboots the CPU core', 'The OS compiles source code into machine instructions'], correctOption: 0, explanation: 'Context switching preserves the state (registers, stack pointer, PCB) of the active process and restores the target process state.' },
        { id: 'cs_os_8', question: 'Belady\'s Anomaly is observed in which page replacement algorithm?', options: ['FIFO (First-In, First-Out)', 'LRU (Least Recently Used)', 'Optimal Page Replacement', 'LFU (Least Frequently Used)'], correctOption: 0, explanation: 'Belady\'s Anomaly describes cases where increasing the number of page frames results in an INCREASE in the number of page faults under FIFO.' },
        { id: 'cs_os_9', question: 'Which system call in UNIX is used to create a new child process by cloning the calling process?', options: ['fork()', 'exec()', 'wait()', 'pthread_create()'], correctOption: 0, explanation: 'fork() creates a duplicate child process with separate copy-on-write address space.' },
        { id: 'cs_os_10', question: 'Banker\'s Algorithm is used for:', options: ['Deadlock Avoidance by testing safe states', 'CPU Scheduling for I/O bound tasks', 'File system defragmentation', 'Network packet routing'], correctOption: 0, explanation: 'Dijkstra\'s Banker\'s Algorithm simulates resource allocation to ensure the system never enters an unsafe state that could lead to deadlock.' },
        { id: 'cs_os_11', question: 'What is the function of the Spooler (Simultaneous Peripheral Operations On-Line)?', options: ['Buffer jobs on temporary storage (e.g., print queue) to decouple fast CPU from slow peripheral devices', 'Accelerate GPU rendering', 'Compress RAM contents', 'Prevent stack overflows'], correctOption: 0, explanation: 'Spooling queues I/O operations on disk buffers so the CPU can proceed without waiting for slower peripheral hardware.' },
        { id: 'cs_os_12', question: 'Which memory allocation scheme is prone to Internal Fragmentation?', options: ['Fixed-size Partitioning / Paging', 'Dynamic Partitioning / Segmentation', 'Virtual memory without paging', 'Buddy system with dynamic coalescing'], correctOption: 0, explanation: 'Paging and fixed-size partitions suffer from internal fragmentation when allocated page blocks exceed the actual memory payload requested.' }
      ]
    },
    cn: {
      name: 'Computer Networks',
      concept: 'Computer Networks cover communication protocols and data transmission across interconnected systems. Key models include OSI 7-Layer and TCP/IP, IP addressing & subnetting, TCP 3-way handshake & congestion control, UDP, DNS, HTTP/HTTPS, and SSL/TLS.',
      simpleExplanation: 'OSI breaks communication into Physical, Data Link, Network, Transport, Session, Presentation, Application layers. TCP guarantees reliable in-order stream delivery; UDP provides lightweight low-latency datagrams.',
      example: 'Browser typing https://google.com -> DNS Lookup -> TCP Handshake (SYN, SYN-ACK, ACK) -> TLS Exchange -> HTTP GET Request -> Response Rendering.',
      keyInterviewQuestions: [
        'Describe step-by-step what happens when you type a URL into a browser and press Enter.',
        'Explain the TCP 3-way handshake and 4-way termination handshake.',
        'Compare TCP vs UDP: packet headers, reliability, flow control, and ideal use cases.',
        'How does HTTPS establish secure encrypted communication (TLS Handshake)?'
      ],
      mcqs: [
        { id: 'cs_cn_1', question: 'Which layer of the OSI model is responsible for routing packets across intermediate networks using IP addresses?', options: ['Network Layer (Layer 3)', 'Transport Layer (Layer 4)', 'Data Link Layer (Layer 2)', 'Session Layer (Layer 5)'], correctOption: 0, explanation: 'The Network layer handles logical addressing (IPv4/IPv6) and path determination (routing).' },
        { id: 'cs_cn_2', question: 'What packets are exchanged during the standard TCP 3-Way Handshake connection establishment?', options: ['SYN -> SYN-ACK -> ACK', 'ACK -> SYN -> SYN-ACK', 'SYN -> ACK -> DATA', 'FIN -> ACK -> FIN-ACK'], correctOption: 0, explanation: 'Client sends SYN, server responds with SYN-ACK, and client replies with ACK to establish full-duplex TCP stream.' },
        { id: 'cs_cn_3', question: 'Which transport protocol is connectionless, has minimal 8-byte header overhead, and does NOT guarantee delivery order?', options: ['UDP (User Datagram Protocol)', 'TCP (Transmission Control Protocol)', 'SCTP', 'BGP'], correctOption: 0, explanation: 'UDP provides lightweight datagram service without handshakes, retransmissions, or ordering overhead.' },
        { id: 'cs_cn_4', question: 'What is the default port for secure HTTPS web traffic and standard unencrypted HTTP web traffic?', options: ['443 and 80', '8080 and 80', '22 and 21', '53 and 443'], correctOption: 0, explanation: 'HTTPS uses TCP port 443; plain HTTP operates on TCP port 80.' },
        { id: 'cs_cn_5', question: 'Which protocol translates domain names (e.g. example.com) into numerical IP addresses?', options: ['DNS (Domain Name System)', 'DHCP (Dynamic Host Configuration Protocol)', 'ARP (Address Resolution Protocol)', 'NAT (Network Address Translation)'], correctOption: 0, explanation: 'DNS is the distributed database system resolving human-readable hostnames to IP addresses.' },
        { id: 'cs_cn_6', question: 'Address Resolution Protocol (ARP) is used to map:', options: ['An IP address to a physical MAC address', 'A domain name to an IP address', 'A port number to a socket', 'A private IP to a public IP'], correctOption: 0, explanation: 'ARP resolves Layer 3 IP addresses to Layer 2 Ethernet MAC addresses on a local subnet.' },
        { id: 'cs_cn_7', question: 'In TCP Congestion Control, the phases in order are:', options: ['Slow Start, Congestion Avoidance, Fast Retransmit / Fast Recovery', 'Fast Recovery, Slow Start, Congestion Avoidance', 'Flow Control, Window Scaling, Termination', 'Polling, CSMA/CD, Token Ring'], correctOption: 0, explanation: 'TCP congestion control begins with Slow Start (exponential window growth), enters Congestion Avoidance upon reaching ssthresh, and uses Fast Retransmit/Recovery on duplicate ACKs.' },
        { id: 'cs_cn_8', question: 'What is the subnet mask for a CIDR /24 network?', options: ['255.255.255.0', '255.255.0.0', '255.0.0.0', '255.255.255.128'], correctOption: 0, explanation: 'A /24 subnet has 24 leading ones in binary (8+8+8), corresponding to 255.255.255.0 with 256 IP addresses (254 usable hosts).' },
        { id: 'cs_cn_9', question: 'Which HTTP status code indicates \'Unauthorized\' (authentication required)?', options: ['401', '403', '404', '502'], correctOption: 0, explanation: '401 indicates Unauthorized (authentication missing or invalid); 403 Forbidden indicates authenticated but lacking permission.' },
        { id: 'cs_cn_10', question: 'Which algorithm is used by Link-State Routing protocols like OSPF to compute shortest paths?', options: ['Dijkstra\'s Algorithm', 'Bellman-Ford Algorithm', 'Floyd-Warshall Algorithm', 'Kruskal\'s Algorithm'], correctOption: 0, explanation: 'OSPF uses Dijkstra\'s shortest path first (SPF) algorithm to calculate loop-free lowest cost paths across the network topology.' },
        { id: 'cs_cn_11', question: 'What is the primary function of NAT (Network Address Translation)?', options: ['To map multiple private local IP addresses to a single public IP address for internet routing', 'To encrypt web packets in transit', 'To speed up Ethernet switching', 'To assign MAC addresses to NICs'], correctOption: 0, explanation: 'NAT modifies IP address headers in transit to conserve public IPv4 addresses and allow private LANs to communicate externally.' },
        { id: 'cs_cn_12', question: 'How does TLS/SSL achieve both fast encryption speed and secure key exchange?', options: ['It uses Asymmetric Encryption for the initial handshake / key exchange, then switches to Symmetric Encryption for payload data transfer', 'It uses only Asymmetric RSA encryption for all payload data', 'It uses plaintext hashing without keys', 'It transmits private keys over unencrypted channels'], correctOption: 0, explanation: 'TLS combines the security of asymmetric cryptography (RSA / ECC) for identity verification and shared session key exchange with the high throughput of symmetric ciphers (AES-GCM).' }
      ]
    },
    sql: {
      name: 'SQL & Database Querying',
      concept: 'SQL (Structured Query Language) is the standard language for relational database definition, manipulation, and querying. Core topics include DDL/DML, JOIN operations (INNER, LEFT, RIGHT, FULL, CROSS), Aggregations & GROUP BY / HAVING, Subqueries, Window Functions (ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG), and CTEs (Common Table Expressions).',
      simpleExplanation: 'Joins combine records from multiple tables based on related keys. Window functions compute values across sets of rows without collapsing the result into a single row like GROUP BY does.',
      example: 'SELECT employee_id, salary, DENSE_RANK() OVER (PARTITION BY department_id ORDER BY salary DESC) as rank FROM employees;',
      keyInterviewQuestions: [
        'Explain the difference between WHERE and HAVING clauses in SQL.',
        'Compare RANK(), DENSE_RANK(), and ROW_NUMBER() window functions with an example.',
        'What is the difference between LEFT JOIN, RIGHT JOIN, and INNER JOIN?',
        'How do Common Table Expressions (CTEs) work, and how can recursive CTEs be used?'
      ],
      mcqs: [
        { id: 'cs_sql_1', question: 'What is the key difference between WHERE and HAVING clauses in SQL?', options: ['WHERE filters individual rows before aggregation; HAVING filters aggregated groups created by GROUP BY', 'WHERE is used after GROUP BY, while HAVING is used before', 'HAVING works on table definitions, WHERE works on views', 'There is no functional difference'], correctOption: 0, explanation: 'WHERE filters rows before grouping occurs; HAVING filters rows after aggregate calculations (e.g. HAVING COUNT(*) > 5).' },
        { id: 'cs_sql_2', question: 'Given scores [100, 100, 90, 80], what will DENSE_RANK() assign to the third score (90)?', options: ['2', '3', '1', '4'], correctOption: 0, explanation: 'DENSE_RANK() assigns consecutive rank numbers without gaps: 100 -> 1, 100 -> 1, 90 -> 2, 80 -> 3. (Standard RANK() would assign 3).' },
        { id: 'cs_sql_3', question: 'Which SQL join returns all rows from the left table and matched rows from the right table, filling with NULL when no match exists?', options: ['LEFT OUTER JOIN', 'INNER JOIN', 'CROSS JOIN', 'RIGHT OUTER JOIN'], correctOption: 0, explanation: 'LEFT JOIN keeps all rows from the left table and injects NULL values for non-matching right table columns.' },
        { id: 'cs_sql_4', question: 'What does the UNION operator do compared to UNION ALL?', options: ['UNION removes duplicate rows between result sets, whereas UNION ALL retains all rows including duplicates', 'UNION ALL sorts the output automatically', 'UNION only works on numbers', 'UNION combines columns rather than rows'], correctOption: 0, explanation: 'UNION executes a distinct deduplication pass across combined result sets, whereas UNION ALL simply concatenates sets without overhead.' },
        { id: 'cs_sql_5', question: 'Which window function accesses data from a subsequent row without requiring a self-join?', options: ['LEAD()', 'LAG()', 'FIRST_VALUE()', 'NTILE()'], correctOption: 0, explanation: 'LEAD() provides access to a row at a specified physical offset after the current row; LAG() accesses preceding rows.' },
        { id: 'cs_sql_6', question: 'What is a Common Table Expression (CTE) in SQL?', options: ['A named temporary result set defined within the execution scope of a single SELECT, INSERT, UPDATE, or DELETE using the WITH clause', 'A permanent database view stored on disk', 'A trigger attached to a table', 'An automated stored procedure'], correctOption: 0, explanation: 'A CTE (WITH cte_name AS (...)) creates a temporary named result set simplifying complex nested queries and recursive traversals.' },
        { id: 'cs_sql_7', question: 'Which SQL constraint ensures that all values in a column are distinct and cannot be NULL?', options: ['PRIMARY KEY', 'UNIQUE', 'CHECK', 'FOREIGN KEY'], correctOption: 0, explanation: 'PRIMARY KEY enforces both uniqueness and non-nullability (UNIQUE alone allows NULL in standard SQL).' },
        { id: 'cs_sql_8', question: 'What is the output of `SELECT NULL = NULL` in standard SQL boolean evaluation?', options: ['UNKNOWN / NULL (Three-valued logic)', 'TRUE', 'FALSE', 'Syntax Error'], correctOption: 0, explanation: 'In SQL three-valued logic (TRUE, FALSE, UNKNOWN), comparing NULL using equality yields UNKNOWN. `IS NULL` must be used instead.' },
        { id: 'cs_sql_9', question: 'Which statement correctly finds the second highest salary from an Employees table?', options: ['SELECT MAX(salary) FROM Employees WHERE salary < (SELECT MAX(salary) FROM Employees);', 'SELECT salary FROM Employees ORDER BY salary DESC LIMIT 1 OFFSET 2;', 'SELECT SECOND_MAX(salary) FROM Employees;', 'SELECT salary FROM Employees WHERE rank = 2;'], correctOption: 0, explanation: 'Filtering out the overall MAX salary and finding the MAX of the remaining yields the exact 2nd highest salary even with duplicate max values.' },
        { id: 'cs_sql_10', question: 'What does the COALESCE(val1, val2, val3) function do?', options: ['Returns the first non-null expression among its arguments', 'Converts all values to lowercase', 'Concatenates strings together', 'Calculates average of non-null values'], correctOption: 0, explanation: 'COALESCE evaluates arguments sequentially and returns the first expression that is not NULL.' },
        { id: 'cs_sql_11', question: 'What is a correlated subquery in SQL?', options: ['A subquery that uses values from the outer query and must be re-evaluated for each row processed by the outer query', 'A subquery executed only once before the main query', 'A query running in parallel across multiple CPU cores', 'A subquery joined using UNION'], correctOption: 0, explanation: 'A correlated subquery references columns from the outer query row, executing once for every row evaluated by the enclosing query.' },
        { id: 'cs_sql_12', question: 'In relational databases, what does the ON DELETE CASCADE foreign key action do?', options: ['Automatically deletes child table records when the referenced parent record is deleted', 'Throws an error preventing parent deletion', 'Sets the foreign key column in the child table to NULL', 'Marks the child row as inactive without deleting'], correctOption: 0, explanation: 'ON DELETE CASCADE propagates parent row deletion to all corresponding child rows to preserve referential integrity.' }
      ]
    }
  };

  return subjects;
}

// 4. Interview Questions Seed (40 Questions across 5 categories)
function generateInterviewQuestions() {
  return [
    // HR / Behavioral (8)
    {
      id: 'int_hr_1',
      role: 'All',
      category: 'HR/Behavioral',
      difficulty: 'easy',
      question: 'Tell me about yourself and walk me through your engineering journey.',
      coreConceptsExpected: ['Structured background summary', 'Key projects and technical stack', 'Problem solving passion', 'Why you want this role'],
      sampleAnswer: 'I am a passionate software engineer with a strong foundation in data structures, algorithms, and distributed systems. Over the course of my academics and projects, I built full-stack applications with Node.js and React, and optimized high-throughput APIs. I am excited to apply my problem-solving skills to real-world scaled engineering problems at your company.',
      evaluationCriteria: { technical: 20, clarity: 40, completeness: 40 }
    },
    {
      id: 'int_hr_2',
      role: 'All',
      category: 'HR/Behavioral',
      difficulty: 'medium',
      question: 'Describe a situation where you faced a difficult technical bug under tight deadlines. How did you resolve it?',
      coreConceptsExpected: ['STAR method (Situation, Task, Action, Result)', 'Root cause analysis', 'Debugging methodology', 'Communication and composure'],
      sampleAnswer: 'During our final project sprint, our payment webhook began timing out intermittently. Using structured logging and APM traces, I isolated the issue to a connection pool exhaustion in the database repository. I implemented exponential backoff retries and connection pooling limits, resolving the deadlock and delivering the milestone 1 day ahead of schedule.',
      evaluationCriteria: { technical: 30, clarity: 35, completeness: 35 }
    },
    {
      id: 'int_hr_3',
      role: 'All',
      category: 'HR/Behavioral',
      difficulty: 'medium',
      question: 'Tell me about a time you disagreed with a team member on a technical decision. How did you handle it?',
      coreConceptsExpected: ['Respectful debate', 'Data-driven decision making', 'Benchmarking / trade-off analysis', 'Commitment to the final outcome'],
      sampleAnswer: 'My teammate wanted to use MongoDB for a transactional ledger, whereas I proposed PostgreSQL. Rather than arguing subjectively, I created a benchmarking prototype and highlighted the strict ACID compliance requirements for financial transfers. We agreed on PostgreSQL, and the project shipped smoothly.',
      evaluationCriteria: { technical: 30, clarity: 35, completeness: 35 }
    },
    {
      id: 'int_hr_4',
      role: 'All',
      category: 'HR/Behavioral',
      difficulty: 'easy',
      question: 'Why do you want to join our company specifically?',
      coreConceptsExpected: ['Knowledge of company tech stack and products', 'Alignment with culture & mission', 'Career growth synergy'],
      sampleAnswer: 'I have closely followed your engineering blog and open-source contributions. The scale at which your platform handles millions of concurrent user transactions provides the exact engineering complexity where I want to grow and make an impact.',
      evaluationCriteria: { technical: 20, clarity: 40, completeness: 40 }
    },
    {
      id: 'int_hr_5',
      role: 'All',
      category: 'HR/Behavioral',
      difficulty: 'medium',
      question: 'Tell me about a project that failed or did not go as planned. What did you learn from it?',
      coreConceptsExpected: ['Accountability and humility', 'Root cause post-mortem', 'Key lessons learned', 'Preventative measures taken in future work'],
      sampleAnswer: 'In my initial project, I over-engineered a microservices architecture for a simple CRUD tool, leading to deployment overhead. I learned the critical value of YAGNI (You Aren\'t Gonna Need It) and starting with modular monoliths before distributed decomposition.',
      evaluationCriteria: { technical: 30, clarity: 35, completeness: 35 }
    },
    {
      id: 'int_hr_6',
      role: 'All',
      category: 'HR/Behavioral',
      difficulty: 'easy',
      question: 'Where do you see yourself in 3 to 5 years as an engineer?',
      coreConceptsExpected: ['Technical depth and ownership', 'System design expertise', 'Mentorship and leadership aspirations'],
      sampleAnswer: 'In 3-5 years, I see myself as a senior engineer who has deep domain expertise in distributed systems architecture, taking ownership of large-scale product features, and mentoring junior engineers in best coding practices.',
      evaluationCriteria: { technical: 20, clarity: 40, completeness: 40 }
    },
    {
      id: 'int_hr_7',
      role: 'All',
      category: 'HR/Behavioral',
      difficulty: 'medium',
      question: 'How do you prioritize your tasks when handling multiple competing deadlines?',
      coreConceptsExpected: ['Eisenhower Matrix / Impact vs Effort', 'Stakeholder communication', 'Focus & time blocking', 'Proactive risk mitigation'],
      sampleAnswer: 'I evaluate tasks based on business impact and dependencies. I break complex epics into small daily deliverables, communicate early with stakeholders if blockers arise, and maintain focused time-blocks for high-complexity code design.',
      evaluationCriteria: { technical: 20, clarity: 40, completeness: 40 }
    },
    {
      id: 'int_hr_8',
      role: 'All',
      category: 'HR/Behavioral',
      difficulty: 'medium',
      question: 'What is your strategy for continuously learning new technologies in our fast-evolving field?',
      coreConceptsExpected: ['Hands-on project building', 'Reading documentation & tech papers', 'Contributing to open source / community'],
      sampleAnswer: 'I follow a hands-on approach: whenever a new technology emerges, I read the official docs and immediately build a minimal production-ready micro-project to test its nuances, failure modes, and performance trade-offs.',
      evaluationCriteria: { technical: 25, clarity: 40, completeness: 35 }
    },

    // SDE General (8)
    {
      id: 'int_sde_1',
      role: 'SDE',
      category: 'SDE General',
      difficulty: 'medium',
      question: 'Explain how a Hash Table handles collisions and what the time complexities are in best vs worst case.',
      coreConceptsExpected: ['Hash function distribution', 'Chaining (Linked Lists / Red-Black Trees)', 'Open Addressing (Linear/Quadratic Probing)', 'O(1) average vs O(N) worst case with bad hash function'],
      sampleAnswer: 'A hash table computes a bucket index using a hash function. Collisions occur when different keys hash to the same bucket. They are resolved via Chaining (storing colliding nodes in linked lists or balanced trees like in Java 8 HashMap) or Open Addressing (probing next available slot). Lookup is average O(1), degrading to O(N) if all elements collide into a single bucket.',
      evaluationCriteria: { technical: 50, clarity: 30, completeness: 20 }
    },
    {
      id: 'int_sde_2',
      role: 'SDE',
      category: 'SDE General',
      difficulty: 'hard',
      question: 'How would you design a URL shortener system like TinyURL? Discuss database schema, hashing/encoding, and scaling.',
      coreConceptsExpected: ['Base62 encoding of auto-incrementing ID vs MD5/SHA-256 truncation', 'Database schema (id, long_url, short_code, created_at)', 'Caching (Redis) for hot URLs', 'Rate limiting and redirection (301 vs 302)'],
      sampleAnswer: 'To design TinyURL: generate a unique 64-bit integer ID and convert it to Base62 (a-z, A-Z, 0-9) yielding a 7-character string supporting 3.5 trillion URLs. Store mappings in an SQL or NoSQL table with an index on short_code. Use Redis cache for the top 20% read traffic. Return HTTP 302 (Temporary Redirect) to track click analytics.',
      evaluationCriteria: { technical: 50, clarity: 30, completeness: 20 }
    },
    {
      id: 'int_sde_3',
      role: 'SDE',
      category: 'SDE General',
      difficulty: 'medium',
      question: 'Explain the difference between process memory segments (Stack, Heap, Data, Code).',
      coreConceptsExpected: ['Stack: automatic allocation, local variables, LIFO execution frames', 'Heap: dynamic runtime allocation, manual/GC deallocation', 'Data/BSS: global and static variables', 'Code/Text: executable binary instructions'],
      sampleAnswer: 'The Stack stores function call frames, local variables, and return addresses with fast contiguous memory allocation. The Heap manages dynamically allocated objects at runtime (e.g. malloc / new) managed by garbage collection or manual free. The Data segment holds initialized/uninitialized static and global variables, and the Text segment holds compiled machine instructions.',
      evaluationCriteria: { technical: 45, clarity: 30, completeness: 25 }
    },
    {
      id: 'int_sde_4',
      role: 'SDE',
      category: 'SDE General',
      difficulty: 'medium',
      question: 'What is the difference between synchronous and asynchronous I/O? How does the Node.js Event Loop work?',
      coreConceptsExpected: ['Non-blocking I/O vs thread blocking', 'Event Loop phases: timers, pending callbacks, poll, check, close callbacks', 'Microtask queue (Promise, process.nextTick) vs Macrotask queue'],
      sampleAnswer: 'Synchronous I/O blocks the calling thread until data is returned. Asynchronous I/O registers a callback/promise and delegates execution to the OS kernel or libuv thread pool. The Node.js event loop continuously cycles through phases (timers, poll, check/setImmediate), processing microtask queues (Promises) after every operation.',
      evaluationCriteria: { technical: 45, clarity: 30, completeness: 25 }
    },
    {
      id: 'int_sde_5',
      role: 'SDE',
      category: 'SDE General',
      difficulty: 'hard',
      question: 'Design a Rate Limiter algorithm for an API gateway. Compare Token Bucket, Leaky Bucket, and Sliding Window Log.',
      coreConceptsExpected: ['Token Bucket (burst handling, refilling tokens)', 'Leaky Bucket (constant output rate)', 'Sliding Window Log / Sliding Window Counter (exact precision vs memory footprint)', 'Distributed rate limiting with Redis and Lua scripts'],
      sampleAnswer: 'Token Bucket maintains a token counter refilled at a constant rate up to capacity; requests consume tokens and allow short bursts. Sliding Window Counter divides time into small segments to prevent border bursts while keeping memory constant. In distributed systems, this is implemented using Redis with atomic Lua scripts.',
      evaluationCriteria: { technical: 50, clarity: 30, completeness: 20 }
    },
    {
      id: 'int_sde_6',
      role: 'SDE',
      category: 'SDE General',
      difficulty: 'medium',
      question: 'What are database indexing best practices and when does an index NOT get used by the query optimizer?',
      coreConceptsExpected: ['B+ Tree left-to-right composite index rule', 'Functions on indexed columns (e.g. UPPER(name)) causing full table scans', 'High selectivity vs low cardinality columns', 'Implicit type coercion bypassing indexes'],
      sampleAnswer: 'Indexes speed up lookups on high-cardinality columns. However, query optimizers ignore indexes when functions are applied to columns (e.g. WHERE YEAR(created_at) = 2024), when wildcards begin strings (LIKE \'%abc\'), when implicit type casting occurs, or when the table is so small that a table scan is cheaper.',
      evaluationCriteria: { technical: 45, clarity: 30, completeness: 25 }
    },
    {
      id: 'int_sde_7',
      role: 'SDE',
      category: 'SDE General',
      difficulty: 'medium',
      question: 'Explain what happens during Garbage Collection and compare Reference Counting vs Mark and Sweep.',
      coreConceptsExpected: ['Reference Counting limitation with circular references', 'Mark and Sweep root graph traversal', 'Generational GC (Young / Old generation) in V8 and JVM'],
      sampleAnswer: 'Reference counting increments/decrements a count when pointers reference an object, failing on cyclical graphs. Mark-and-Sweep starts from Root objects (global variables, active call stacks), marks all reachable objects, and sweeps away unreachable ones. Modern engines use Generational GC since most objects die young.',
      evaluationCriteria: { technical: 45, clarity: 30, completeness: 25 }
    },
    {
      id: 'int_sde_8',
      role: 'SDE',
      category: 'SDE General',
      difficulty: 'hard',
      question: 'How do you design a robust distributed cache invalidation strategy? Discuss Cache-Aside, Write-Through, and Write-Behind.',
      coreConceptsExpected: ['Cache-Aside (application reads cache, on miss reads DB and sets cache; updates write DB and evict cache)', 'Write-Through (write to cache and DB synchronously)', 'Write-Behind (write to cache immediately, async write to DB)', 'Thundering Herd and Cache Stampede mitigation (mutex / probabilistic early expiration)'],
      sampleAnswer: 'In Cache-Aside, application checks cache, loads from DB on miss, and deletes cache entries upon DB updates. Write-Through updates cache and DB together for strong consistency. To prevent Cache Stampedes when hot keys expire, we use distributed locks or probabilistically refresh keys before expiration.',
      evaluationCriteria: { technical: 50, clarity: 30, completeness: 20 }
    },

    // Frontend (8)
    {
      id: 'int_fe_1',
      role: 'Frontend',
      category: 'Frontend Engineering',
      difficulty: 'medium',
      question: 'Explain the Critical Rendering Path and how modern browsers render HTML, CSS, and JavaScript on screen.',
      coreConceptsExpected: ['DOM and CSSOM tree construction', 'Render Tree creation', 'Layout / Reflow phase', 'Paint and Compositing phase', 'Render-blocking CSS and JS execution'],
      sampleAnswer: 'The browser parses HTML to construct the DOM and CSS to construct the CSSOM. These merge into the Render Tree containing visible elements. The Layout phase calculates exact geometry and pixel coordinates, followed by Painting pixels onto layers, and Compositing layers on the GPU. Scripts without async/defer block HTML parsing.',
      evaluationCriteria: { technical: 50, clarity: 30, completeness: 20 }
    },
    {
      id: 'int_fe_2',
      role: 'Frontend',
      category: 'Frontend Engineering',
      difficulty: 'medium',
      question: 'Explain JavaScript Closures, Lexical Scoping, and practical use cases in real-world frontend applications.',
      coreConceptsExpected: ['Lexical environment preservation', 'Function bundled with references to outer state', 'Data privacy / encapsulation', 'Event handlers and memoization / currying'],
      sampleAnswer: 'A closure is the combination of a function bundled together with references to its surrounding lexical environment, allowing an inner function to access an outer function scope even after the outer function has returned. Common uses include creating private state, factory functions, debounce/throttle utilities, and event handlers.',
      evaluationCriteria: { technical: 45, clarity: 30, completeness: 25 }
    },
    {
      id: 'int_fe_3',
      role: 'Frontend',
      category: 'Frontend Engineering',
      difficulty: 'medium',
      question: 'What is the difference between Debouncing and Throttling? Provide code implementation details.',
      coreConceptsExpected: ['Debounce: delays execution until pause in invocations (e.g. search input)', 'Throttle: guarantees execution at most once per fixed time interval (e.g. scroll/resize)', 'ClearTimeout vs timestamp comparison'],
      sampleAnswer: 'Debouncing bunches multiple sequential events and only executes the function after a specified delay since the last call (ideal for search autocomplete). Throttling enforces a maximum frequency of executions over time (ideal for window resize and scroll listeners).',
      evaluationCriteria: { technical: 45, clarity: 30, completeness: 25 }
    },
    {
      id: 'int_fe_4',
      role: 'Frontend',
      category: 'Frontend Engineering',
      difficulty: 'hard',
      question: 'How does React Reconciliation and the Virtual DOM Diffing algorithm work? Explain the role of keys.',
      coreConceptsExpected: ['Virtual DOM tree representation', 'Heuristic O(N) diffing algorithm', 'Component element type comparisons', 'Unique stable keys preventing unnecessary re-mounts and state loss'],
      sampleAnswer: 'React maintains a Virtual DOM in memory. When state changes, a new tree is created and diffed against the previous tree using an O(N) heuristic. If element types differ, the old subtree is destroyed and rebuilt. Keys provide unique persistent identities to array items so React can identify insertions, moves, and deletions without re-rendering every item.',
      evaluationCriteria: { technical: 50, clarity: 30, completeness: 20 }
    },
    {
      id: 'int_fe_5',
      role: 'Frontend',
      category: 'Frontend Engineering',
      difficulty: 'medium',
      question: 'Explain Cross-Origin Resource Sharing (CORS), preflight OPTIONS requests, and how to fix CORS issues safely.',
      coreConceptsExpected: ['Same-Origin Policy (Protocol, Domain, Port)', 'Simple requests vs Preflight OPTIONS requests', 'Access-Control-Allow-Origin, Headers, Methods headers', 'Why client-side disabling is insecure and server configuration is proper'],
      sampleAnswer: 'CORS is a browser security mechanism enforcing the Same-Origin Policy. When a client makes a non-simple cross-origin request (custom headers, PUT/DELETE, JSON content-type), the browser sends a preflight OPTIONS request. The server must respond with matching Access-Control-Allow-Origin headers.',
      evaluationCriteria: { technical: 45, clarity: 30, completeness: 25 }
    },
    {
      id: 'int_fe_6',
      role: 'Frontend',
      category: 'Frontend Engineering',
      difficulty: 'medium',
      question: 'Compare Server-Side Rendering (SSR), Client-Side Rendering (CSR), and Static Site Generation (SSG) in terms of SEO, TTI, and TTFB.',
      coreConceptsExpected: ['CSR: fast transitions, poor initial TTFB/SEO without hydration', 'SSR: excellent SEO and fast FCP, higher TTFB server load', 'SSG: instant TTFB via CDN, static pre-building at compile time', 'Hydration cost'],
      sampleAnswer: 'CSR downloads minimal HTML and renders views in the browser via JavaScript, giving rich interactivity but delayed First Contentful Paint. SSR renders HTML on the server per request, boosting SEO and FCP with slightly higher TTFB. SSG pre-generates static HTML at build time for instant CDN delivery.',
      evaluationCriteria: { technical: 45, clarity: 30, completeness: 25 }
    },
    {
      id: 'int_fe_7',
      role: 'Frontend',
      category: 'Frontend Engineering',
      difficulty: 'hard',
      question: 'How do you optimize Core Web Vitals (LCP, INP/FID, CLS) on a high-traffic production web application?',
      coreConceptsExpected: ['LCP: image optimization (WebP/AVIF, priority loading, CDN)', 'INP: breaking long tasks with requestIdleCallback/web workers', 'CLS: reserving dimensions for images/ads, font display swap', 'Code splitting and bundle analysis'],
      sampleAnswer: 'To optimize LCP, preload hero images, use responsive modern image formats, and utilize edge CDNs. To improve INP, break long JavaScript tasks into smaller chunks and offload heavy computation to Web Workers. To eliminate CLS, always set explicit width and height attributes on images and embed elements.',
      evaluationCriteria: { technical: 50, clarity: 30, completeness: 20 }
    },
    {
      id: 'int_fe_8',
      role: 'Frontend',
      category: 'Frontend Engineering',
      difficulty: 'medium',
      question: 'Explain Web Security vulnerabilities: XSS (Cross-Site Scripting) and CSRF (Cross-Site Request Forgery) and their defenses.',
      coreConceptsExpected: ['Stored, Reflected, DOM XSS; input sanitization & Content Security Policy (CSP)', 'CSRF attacks leveraging ambient cookies', 'SameSite cookies, Anti-CSRF tokens, Custom headers'],
      sampleAnswer: 'XSS occurs when malicious scripts are injected into trusted sites; prevent it with output encoding, DOM sanitization, and Content Security Policy (CSP) headers. CSRF tricks authenticated users into submitting unauthorized commands; prevent it using SameSite=Strict/Lax cookies and anti-CSRF challenge tokens.',
      evaluationCriteria: { technical: 45, clarity: 30, completeness: 25 }
    },

    // Backend (8)
    {
      id: 'int_be_1',
      role: 'Backend',
      category: 'Backend Engineering',
      difficulty: 'medium',
      question: 'Explain the principles of RESTful API design, idempotent HTTP methods, and proper HTTP status code usage.',
      coreConceptsExpected: ['Resource-oriented URLs (nouns, plural)', 'Idempotency: GET, PUT, DELETE, HEAD vs Non-idempotent POST', 'Status codes: 200, 201, 204, 400, 401, 403, 404, 409, 422, 500'],
      sampleAnswer: 'REST organizes endpoints around resources with clear HTTP verbs. Idempotent methods (GET, PUT, DELETE) produce the exact same server state regardless of whether called once or ten times. POST creates new state. APIs must return semantic status codes like 201 for creation and 422 for validation errors.',
      evaluationCriteria: { technical: 45, clarity: 30, completeness: 25 }
    },
    {
      id: 'int_be_2',
      role: 'Backend',
      category: 'Backend Engineering',
      difficulty: 'hard',
      question: 'How do you implement scalable authentication and authorization? Compare JWT vs Session-based authentication.',
      coreConceptsExpected: ['Stateful sessions (server memory / Redis store, cookie revocation)', 'Stateless JWTs (header, payload, signature, expiration)', 'Refresh token rotation and revocation strategies', 'RBAC (Role Based Access Control)'],
      sampleAnswer: 'Session-based auth stores session IDs in Redis with server-side revocation capability. JWTs are stateless tokens signed with HMAC or RSA containing claims, reducing DB lookups on distributed microservices. Best practice is short-lived access tokens (15 mins) paired with rotating refresh tokens stored securely in HTTP-only cookies.',
      evaluationCriteria: { technical: 50, clarity: 30, completeness: 20 }
    },
    {
      id: 'int_be_3',
      role: 'Backend',
      category: 'Backend Engineering',
      difficulty: 'hard',
      question: 'How do message queues (Kafka / RabbitMQ) decouple backend services? Explain at-least-once vs exactly-once delivery.',
      coreConceptsExpected: ['Producer-Consumer / Pub-Sub pattern', 'Asynchronous processing and backpressure absorption', 'Consumer offsets, acknowledgments, dead letter queues (DLQ)', 'Idempotent consumers to handle at-least-once delivery'],
      sampleAnswer: 'Message queues decouple producers from consumers, buffering traffic spikes and enabling asynchronous background processing. Most distributed brokers guarantee at-least-once delivery. To achieve effective exactly-once processing, consumers must be implemented idempotently using deduplication keys or unique transaction IDs.',
      evaluationCriteria: { technical: 50, clarity: 30, completeness: 20 }
    },
    {
      id: 'int_be_4',
      role: 'Backend',
      category: 'Backend Engineering',
      difficulty: 'medium',
      question: 'Explain database connection pooling, why it is critical for backend scale, and what causes pool exhaustion.',
      coreConceptsExpected: ['TCP handshake and authentication overhead per DB connection', 'Fixed pool of pre-established reusable connections', 'Long-running queries and missing release calls causing starvation', 'Pool sizing guidelines'],
      sampleAnswer: 'Creating database connections requires costly TCP and TLS handshakes. Connection pooling maintains a pool of pre-warmed connections that workers borrow and return. Pool exhaustion happens when queries are slow, transactions remain uncommitted, or code fails to release connections back to the pool in finally blocks.',
      evaluationCriteria: { technical: 45, clarity: 30, completeness: 25 }
    },
    {
      id: 'int_be_5',
      role: 'Backend',
      category: 'Backend Engineering',
      difficulty: 'hard',
      question: 'How do you handle database migrations safely in zero-downtime production environments?',
      coreConceptsExpected: ['Expand and Contract / Blue-Green migration pattern', 'Never renaming/dropping columns in active use', 'Backwards-compatible schema changes', 'Async background data backfills before switching reads'],
      sampleAnswer: 'Zero-downtime migrations follow the Expand-and-Contract pattern: first add a new nullable column or table, update application code to write to both old and new schemas (dual-write), backfill historical records in background batches, update reads to the new column, and finally deprecate and drop the old column.',
      evaluationCriteria: { technical: 50, clarity: 30, completeness: 20 }
    },
    {
      id: 'int_be_6',
      role: 'Backend',
      category: 'Backend Engineering',
      difficulty: 'medium',
      question: 'What is the N+1 query problem in ORMs and how do you detect and fix it?',
      coreConceptsExpected: ['Executing 1 parent query followed by N child queries in loops', 'Eager loading with JOIN or IN clauses (e.g. includes/preload)', 'DataLoader pattern in GraphQL / Batch loading'],
      sampleAnswer: 'The N+1 problem occurs when an ORM fetches a list of N parent records, and then executes N individual queries to fetch child associations inside a loop. It is fixed by eager loading associations using JOINs or batching child lookups with an `IN (...)` query.',
      evaluationCriteria: { technical: 45, clarity: 30, completeness: 25 }
    },
    {
      id: 'int_be_7',
      role: 'Backend',
      category: 'Backend Engineering',
      difficulty: 'hard',
      question: 'Explain Distributed Transactions and the Saga Pattern (Choreography vs Orchestration).',
      coreConceptsExpected: ['Limitations of 2PC (Two-Phase Commit) in microservices', 'Compensating transactions on failure', 'Choreography (event-driven pub/sub)', 'Orchestration (centralized workflow coordinator)'],
      sampleAnswer: 'Distributed transactions across microservices cannot rely on standard ACID 2PC due to high latency and locking. The Saga pattern breaks transactions into a sequence of local transactions. If one step fails, the Saga executes compensating transactions backwards. Choreography uses event pub/sub, while Orchestration uses a central coordinator.',
      evaluationCriteria: { technical: 50, clarity: 30, completeness: 20 }
    },
    {
      id: 'int_be_8',
      role: 'Backend',
      category: 'Backend Engineering',
      difficulty: 'medium',
      question: 'How do you prevent SQL Injection and Prompt Injection attacks in production APIs?',
      coreConceptsExpected: ['Parameterized queries / prepared statements for SQL', 'Input validation with schemas like Zod', 'Prompt Injection: treating untrusted text as isolated data with delimiters, strict system instructions, few-shot boundaries'],
      sampleAnswer: 'For SQL injection, always use parameterized queries and prepared statements so user inputs are treated as literal values, never executable syntax. For prompt injection, enclose user text and uploaded documents in distinct delimiter tags (e.g. <user_data>), instruct the LLM explicitly to treat content strictly as raw payload, and validate all LLM outputs against strict schemas.',
      evaluationCriteria: { technical: 50, clarity: 30, completeness: 20 }
    },

    // AI-ML (8)
    {
      id: 'int_aiml_1',
      role: 'AI-ML',
      category: 'AI-ML Engineering',
      difficulty: 'medium',
      question: 'Explain the bias-variance tradeoff and how regularization (L1 Lasso vs L2 Ridge) helps combat overfitting.',
      coreConceptsExpected: ['High Bias (underfitting) vs High Variance (overfitting)', 'L1 Lasso: adds absolute value penalty leading to sparse feature selection', 'L2 Ridge: adds squared weight penalty shrinking weights towards zero', 'Cross-validation'],
      sampleAnswer: 'High bias causes underfitting from overly simplistic models; high variance causes overfitting by memorizing training noise. Regularization adds a penalty term to the loss function. L1 (Lasso) drives non-essential feature weights to exactly zero enabling feature selection. L2 (Ridge) penalizes large weights proportionally, smoothing model complexity.',
      evaluationCriteria: { technical: 50, clarity: 30, completeness: 20 }
    },
    {
      id: 'int_aiml_2',
      role: 'AI-ML',
      category: 'AI-ML Engineering',
      difficulty: 'hard',
      question: 'How does the Transformer Self-Attention mechanism work mathematically? Explain Query, Key, and Value matrices.',
      coreConceptsExpected: ['Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V', 'Dot product similarity scoring', 'Scaling factor sqrt(d_k) preventing vanishing gradients in softmax', 'Multi-Head Attention capturing diverse representation subspaces'],
      sampleAnswer: 'Self-attention maps input embeddings into Query (Q), Key (K), and Value (V) projections. The attention score between tokens is computed as softmax(Q * K^T / sqrt(d_k)). Multiplying this weight matrix by V creates contextualized representations. Multi-head attention allows the model to simultaneously attend to information from different representation subspaces.',
      evaluationCriteria: { technical: 50, clarity: 30, completeness: 20 }
    },
    {
      id: 'int_aiml_3',
      role: 'AI-ML',
      category: 'AI-ML Engineering',
      difficulty: 'medium',
      question: 'Explain Retrieval-Augmented Generation (RAG) architecture and how chunking strategies impact retrieval accuracy.',
      coreConceptsExpected: ['Embedding models and Vector Databases (cosine similarity / HNSW)', 'Chunk size and overlap trade-offs', 'Dense retrieval vs Hybrid search (BM25 + vector)', 'Re-ranking with Cross-Encoders'],
      sampleAnswer: 'RAG retrieves external knowledge chunks and injects them into LLM prompt context to ground generation in facts. Documents are chunked with overlap (e.g. 500 tokens with 50 token overlap). Chunks are embedded and indexed in a vector DB. Hybrid search combining BM25 keyword matching with dense vector similarity followed by a cross-encoder re-ranker yields highest retrieval accuracy.',
      evaluationCriteria: { technical: 50, clarity: 30, completeness: 20 }
    },
    {
      id: 'int_aiml_4',
      role: 'AI-ML',
      category: 'AI-ML Engineering',
      difficulty: 'medium',
      question: 'Compare Precision, Recall, F1-Score, and ROC-AUC. When is Accuracy misleading in classification tasks?',
      coreConceptsExpected: ['Accuracy paradox in imbalanced datasets (e.g. 99% negative fraud class)', 'Precision = TP / (TP + FP)', 'Recall = TP / (TP + FN)', 'F1-Score: harmonic mean of precision and recall', 'ROC-AUC: TPR vs FPR across thresholds'],
      sampleAnswer: 'Accuracy is misleading on imbalanced datasets where a model predicting only the majority class achieves 99% accuracy while failing completely. Precision measures the proportion of positive identifications that were actually correct. Recall measures the proportion of actual positives identified correctly. F1-score balances both via their harmonic mean.',
      evaluationCriteria: { technical: 45, clarity: 30, completeness: 25 }
    },
    {
      id: 'int_aiml_5',
      role: 'AI-ML',
      category: 'AI-ML Engineering',
      difficulty: 'hard',
      question: 'Explain Parameter-Efficient Fine-Tuning (PEFT) methods, specifically LoRA (Low-Rank Adaptation) and QLoRA.',
      coreConceptsExpected: ['Freezing pre-trained base model weights', 'Decomposing weight update matrix W = W0 + B * A where rank r << d', 'Drastic reduction in trainable parameters and VRAM requirements', '4-bit NormalFloat quantization in QLoRA'],
      sampleAnswer: 'Full fine-tuning of large models requires prohibitive GPU memory. LoRA freezes original base weights W0 and represents the update delta as a low-rank matrix product B * A of rank r (e.g. r=8). This reduces trainable parameters by 99% while retaining performance. QLoRA quantizes the frozen base model to 4-bit precision, enabling fine-tuning on consumer GPUs.',
      evaluationCriteria: { technical: 50, clarity: 30, completeness: 20 }
    },
    {
      id: 'int_aiml_6',
      role: 'AI-ML',
      category: 'AI-ML Engineering',
      difficulty: 'medium',
      question: 'What are the main causes of Gradient Vanishing and Gradient Exploding in deep neural networks, and how are they solved?',
      coreConceptsExpected: ['Chain rule multiplications with derivative values < 1 or > 1 across deep layers', 'Activation functions: ReLU / LeakyReLU vs Sigmoid/Tanh', 'Batch Normalization and Layer Normalization', 'Residual / Skip Connections (ResNets)', 'Gradient Clipping'],
      sampleAnswer: 'During backpropagation, repeated chain-rule multiplications through deep layers cause gradients to shrink exponentially (vanishing) or grow exponentially (exploding). Solutions include using non-saturating activations like ReLU, adding Skip Connections (ResNet) to allow gradients to flow unimpeded, Layer Normalization, and Gradient Clipping for exploding gradients.',
      evaluationCriteria: { technical: 45, clarity: 30, completeness: 25 }
    },
    {
      id: 'int_aiml_7',
      role: 'AI-ML',
      category: 'AI-ML Engineering',
      difficulty: 'medium',
      question: 'Explain the difference between Temperature, Top-p (Nucleus Sampling), and Top-k in LLM text generation decoding.',
      coreConceptsExpected: ['Temperature: scaling logits before softmax (lower = deterministic, higher = creative)', 'Top-k: sampling from top k highest probability tokens', 'Top-p: sampling from smallest set of tokens whose cumulative probability exceeds p'],
      sampleAnswer: 'Temperature divides logits by T before softmax: T near 0 makes greedy deterministic choices, while higher T flattens the distribution for creativity. Top-k filters to the top k candidate tokens. Top-p (nucleus sampling) dynamically selects the smallest subset of candidate tokens whose cumulative probability exceeds p, adapting vocabulary breadth to certainty.',
      evaluationCriteria: { technical: 45, clarity: 30, completeness: 25 }
    },
    {
      id: 'int_aiml_8',
      role: 'AI-ML',
      category: 'AI-ML Engineering',
      difficulty: 'hard',
      question: 'How do you evaluate generative AI applications in production beyond static benchmarks? Discuss LLM-as-a-Judge and guardrails.',
      coreConceptsExpected: ['LLM-as-a-Judge with calibrated rubric evaluation', 'Faithfulness, Answer Relevance, Context Recall (e.g. RAGAS metrics)', 'Deterministic guardrails (regex, toxicity classifiers, PII detection)', 'Human-in-the-loop validation'],
      sampleAnswer: 'Evaluating LLMs in production combines deterministic checks with LLM-as-a-Judge frameworks. We score generation on Faithfulness (hallucination detection against retrieved context), Relevance, and Groundedness using structured rubrics with few-shot calibration. Real-time guardrails sanitize PII and enforce safety boundaries before client response streaming.',
      evaluationCriteria: { technical: 50, clarity: 30, completeness: 20 }
    }
  ];
}

// 5. Companies Seed (6 Companies)
function generateCompanies() {
  return [
    {
      id: 'google',
      name: 'Google',
      tier: 'MAANG',
      source: 'PrepPilot Community Interview Submissions & Historical Hiring Archives',
      lastVerified: '2026-06-15',
      disclaimer: 'community-reported, verify on the official careers page',
      pattern: {
        rounds: 5,
        onlineAssessment: {
          durationMinutes: 90,
          aptitude: false,
          coding: true,
          questionsCount: 2,
          focusAreas: ['Graphs', 'Dynamic Programming', 'Complex Data Structures', 'Trees']
        },
        technicalInterview: {
          rounds: 4,
          focusAreas: ['Algorithms & Data Structures (DSA)', 'System Design (L4+)', 'Googliness & Leadership'],
          typicalQuestions: ['Word Ladder II', 'Longest Increasing Path in a Matrix', 'LRU Cache Design', 'Design a Distributed Web Crawler']
        }
      },
      recommendedTopics: ['Graphs', 'Dynamic Programming', 'Binary Search', 'Trees', 'System Design'],
      hiringProcess: [
        'Round 1: Online Assessment / Screening Code Signal (2 LeetCode Medium/Hard problems)',
        'Round 2: Technical DSA Interview 1 (Algorithms, Trees, Graphs)',
        'Round 3: Technical DSA Interview 2 (Advanced DP / Optimization)',
        'Round 4: Technical DSA Interview 3 or Low-Level Design',
        'Round 5: Googliness & Behavioral Leadership Interview'
      ]
    },
    {
      id: 'amazon',
      name: 'Amazon',
      tier: 'MAANG',
      source: 'PrepPilot Community Interview Submissions & Historical Hiring Archives',
      lastVerified: '2026-07-20',
      disclaimer: 'community-reported, verify on the official careers page',
      pattern: {
        rounds: 4,
        onlineAssessment: {
          durationMinutes: 90,
          aptitude: true,
          coding: true,
          questionsCount: 2,
          focusAreas: ['Arrays & Strings', 'Trees & BST', 'Work Styles Assessment (Leadership Principles)']
        },
        technicalInterview: {
          rounds: 3,
          focusAreas: ['16 Leadership Principles (STAR method required)', 'Data Structures (Trees, Heaps, HashMaps)', 'System Design & Object-Oriented Design'],
          typicalQuestions: ['Number of Islands', 'Course Schedule', 'Design Amazon Locker System', 'Customer Obsession STAR Scenarios']
        }
      },
      recommendedTopics: ['Trees', 'Graphs', 'Arrays', 'Leadership Principles', 'Object-Oriented Design'],
      hiringProcess: [
        'Round 1: Online Assessment (2 Coding Problems + Work Styles Behavioral Assessment)',
        'Round 2: Technical Interview (DSA + 2 Leadership Principles deep dives)',
        'Round 3: Technical Interview (Algorithms & Problem Solving + 2 LPs)',
        'Round 4: The Bar Raiser Round (System / LLD Design + Behavioral)'
      ]
    },
    {
      id: 'microsoft',
      name: 'Microsoft',
      tier: 'MAANG',
      source: 'PrepPilot Community Interview Submissions & Historical Hiring Archives',
      lastVerified: '2026-05-10',
      disclaimer: 'community-reported, verify on the official careers page',
      pattern: {
        rounds: 4,
        onlineAssessment: {
          durationMinutes: 70,
          aptitude: false,
          coding: true,
          questionsCount: 3,
          focusAreas: ['Arrays', 'Strings', 'Greedy', 'Linked Lists']
        },
        technicalInterview: {
          rounds: 3,
          focusAreas: ['Clean Coding & Code Quality', 'Data Structures (Linked Lists, Binary Trees, Stacks)', 'CS Fundamentals (OS, Threads, Memory)'],
          typicalQuestions: ['Reverse Nodes in k-Group', 'Validate Binary Search Tree', 'Design TinyURL / Rate Limiter', 'Explain Virtual Memory and Paging']
        }
      },
      recommendedTopics: ['Linked Lists', 'Trees', 'Strings', 'OS Fundamentals', 'OOP'],
      hiringProcess: [
        'Round 1: Codility Online Assessment (3 Medium Coding Challenges)',
        'Round 2: Technical Round 1 (Problem Solving & Code Modularity)',
        'Round 3: Technical Round 2 (Data Structures & CS Core OS/DBMS)',
        'Round 4: AA (As Appropriate / Partner Director Round) & Cultural Fit'
      ]
    },
    {
      id: 'tcs',
      name: 'TCS (Tata Consultancy Services - Ninja & Digital/Prime)',
      tier: 'Service',
      source: 'PrepPilot Community Interview Submissions & Historical Hiring Archives',
      lastVerified: '2026-08-01',
      disclaimer: 'community-reported, verify on the official careers page',
      pattern: {
        rounds: 3,
        onlineAssessment: {
          durationMinutes: 120,
          aptitude: true,
          coding: true,
          questionsCount: 2,
          focusAreas: ['Quantitative Aptitude', 'Logical Reasoning', 'Verbal Ability', 'Basic to Medium Coding (Arrays, Math, Strings)']
        },
        technicalInterview: {
          rounds: 2,
          focusAreas: ['Core Java / Python / C++', 'SQL Queries (Joins, Aggregates)', 'OOP Principles', 'Final Year Academic Project'],
          typicalQuestions: ['Explain Polymorphism with examples', 'Write SQL query for 2nd highest salary', 'Reverse a linked list', 'Difference between Process and Thread']
        }
      },
      recommendedTopics: ['Quantitative Aptitude', 'Logical Reasoning', 'SQL', 'OOP', 'Arrays'],
      hiringProcess: [
        'Round 1: TCS NQT National Qualifier Test (Quant, Verbal, Reasoning, Coding)',
        'Round 2: Technical Interview (Core CS, Coding, Project deep-dive)',
        'Round 3: Managerial & HR Interview (Communication, Willingness to relocate, Work ethics)'
      ]
    },
    {
      id: 'infosys',
      name: 'Infosys (Specialist Programmer & DSE / SE)',
      tier: 'Service',
      source: 'PrepPilot Community Interview Submissions & Historical Hiring Archives',
      lastVerified: '2026-08-14',
      disclaimer: 'community-reported, verify on the official careers page',
      pattern: {
        rounds: 3,
        onlineAssessment: {
          durationMinutes: 100,
          aptitude: true,
          coding: true,
          questionsCount: 3,
          focusAreas: ['Mathematical Aptitude', 'Data Interpretation', 'Dynamic Programming / Greedy (HackWithInfy / SP Track)']
        },
        technicalInterview: {
          rounds: 2,
          focusAreas: ['Data Structures (Arrays, Trees, Graphs)', 'DBMS & Normalization', 'Computer Networks (TCP/IP)', 'OOP Principles'],
          typicalQuestions: ['Explain 3NF Normalization', 'Implement Bubble vs Quick Sort', 'Explain OSI 7 Layers', 'Project architecture overview']
        }
      },
      recommendedTopics: ['Quantitative Aptitude', 'DBMS', 'Computer Networks', 'Dynamic Programming', 'Strings'],
      hiringProcess: [
        'Round 1: InfyTQ / Online Test (Aptitude & Coding questions)',
        'Round 2: Technical Interview (Algorithms, Data Structures, CS Fundamentals)',
        'Round 3: HR Interview (Behavioral, Teamwork, Relocation)'
      ]
    },
    {
      id: 'flipkart',
      name: 'Flipkart',
      tier: 'Tier-1',
      source: 'PrepPilot Community Interview Submissions & Historical Hiring Archives',
      lastVerified: '2026-06-30',
      disclaimer: 'community-reported, verify on the official careers page',
      pattern: {
        rounds: 4,
        onlineAssessment: {
          durationMinutes: 90,
          aptitude: false,
          coding: true,
          questionsCount: 3,
          focusAreas: ['Arrays', 'Dynamic Programming', 'Graph Algorithms', 'Trie / Segment Trees']
        },
        technicalInterview: {
          rounds: 3,
          focusAreas: ['Machine Coding Round (2 hours working object-oriented code with unit tests)', 'Data Structures & Algorithms', 'System Architecture & Problem Solving'],
          typicalQuestions: ['Machine Coding: Design Splitwise / Snake and Ladder / In-Memory Queue', 'Coin Change', 'Median from Data Stream', 'Design Flash Sale Inventory']
        }
      },
      recommendedTopics: ['Dynamic Programming', 'Graphs', 'Object-Oriented Design', 'Machine Coding', 'Arrays'],
      hiringProcess: [
        'Round 1: Online Coding Challenge (3 DSA Problems)',
        'Round 2: Machine Coding Round (90-120 mins live object-oriented implementation)',
        'Round 3: Problem Solving & Data Structures Round',
        'Round 4: Hiring Manager / Cultural Fit Round'
      ]
    }
  ];
}

async function main() {
  const dataDir = path.resolve(__dirname);
  await fs.mkdir(dataDir, { recursive: true });

  const aptitude = generateAptitudeQuestions();
  await fs.writeFile(path.join(dataDir, 'seedAptitude.json'), JSON.stringify(aptitude, null, 2), 'utf-8');
  console.log(`✅ Saved ${aptitude.length} Aptitude questions to seedAptitude.json`);

  const dsa = generateDSAProblems();
  await fs.writeFile(path.join(dataDir, 'seedDSA.json'), JSON.stringify(dsa, null, 2), 'utf-8');
  console.log(`✅ Saved ${dsa.length} DSA problems to seedDSA.json`);

  const cs = generateCSData();
  await fs.writeFile(path.join(dataDir, 'seedCS.json'), JSON.stringify(cs, null, 2), 'utf-8');
  console.log(`✅ Saved CS Fundamentals & MCQs to seedCS.json`);

  const interview = generateInterviewQuestions();
  await fs.writeFile(path.join(dataDir, 'seedInterview.json'), JSON.stringify(interview, null, 2), 'utf-8');
  console.log(`✅ Saved ${interview.length} Interview questions to seedInterview.json`);

  const companies = generateCompanies();
  await fs.writeFile(path.join(dataDir, 'seedCompanies.json'), JSON.stringify(companies, null, 2), 'utf-8');
  console.log(`✅ Saved ${companies.length} Companies to seedCompanies.json`);
}

main().catch(console.error);
