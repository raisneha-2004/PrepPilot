import { sanitizePromptData } from '../../../utils/tokenEstimator.js';

export function buildDSAFeedbackPrompt({ problemTitle, problemDescription, language, userCode, testResults, userMessage = '' }) {
  return `You are a Senior Principal Software Engineer conducting a thorough code review for a technical coding interview.

PROBLEM DETAILS:
Title: ${problemTitle}
Description:
${problemDescription}

SUBMITTED SOLUTION:
Language: ${language}
${sanitizePromptData(userCode, 'user_submitted_code')}

TEST EXECUTION OUTCOME:
${sanitizePromptData(JSON.stringify(testResults || {}), 'test_results')}

OPTIONAL CANDIDATE QUESTION / NOTE:
${sanitizePromptData(userMessage, 'candidate_notes')}

INSTRUCTIONS:
1. Detect candidate's language (English, Hindi, Hinglish) from candidate notes or default to clean English. Provide explanations matching their tone.
2. Evaluate:
   - Correctness and logical flaws or edge-case oversights.
   - Time Complexity (Big-O analysis) & Space Complexity (Auxiliary memory).
   - Code cleanliness, naming conventions, and idiomatic practices for ${language}.
   - Suggestions for alternative/optimal algorithmic approaches (e.g. Hash Map vs Two Pointers, DP state reduction).
3. Return STRICT JSON with this schema:
{
  "verdict": "Accepted" | "Wrong Answer" | "Time Limit Exceeded" | "Compile Error" | "Needs Improvement",
  "score": number, // 0 to 100
  "timeComplexity": "O(N)",
  "spaceComplexity": "O(1)",
  "isOptimal": boolean,
  "logicSummary": "Brief overview of what the code does",
  "issues": ["Identified bug 1", "Edge case missed"],
  "improvements": ["How to optimize memory or lines of code"],
  "betterApproach": "Explanation of the optimal algorithm if current is suboptimal",
  "sampleOptimizedCode": "Clean code string in the same language showing the optimal approach",
  "encouragement": "Positive motivating takeaway for the candidate"
}`;
}
