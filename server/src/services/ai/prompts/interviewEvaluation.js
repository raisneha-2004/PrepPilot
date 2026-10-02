import { sanitizePromptData } from '../../../utils/tokenEstimator.js';

export function buildInterviewEvaluationPrompt({ question, expectedConcepts = [], candidateAnswer, role, difficulty, questionNumber = 1 }) {
  return `You are an Interviewer evaluating a candidate's answer during a mock technical interview for a ${role} position (${difficulty} level).

INTERVIEW QUESTION:
${question}

CORE CONCEPTS EXPECTED:
${JSON.stringify(expectedConcepts)}

CANDIDATE'S ANSWER (TYPED OR SPEECH-TO-TEXT):
${sanitizePromptData(candidateAnswer, 'candidate_answer')}

INSTRUCTIONS:
1. Detect the candidate's language (English, Hindi, Hinglish) and tailor your feedback and improved sample answer in that matching natural language.
2. Evaluate:
   - Technical Correctness (0-100)
   - Relevance (0-100)
   - Clarity & Communication (0-100)
   - Identify missing concepts or inaccuracies.
   - Craft a high-impact, improved sample answer demonstrating ideal interview delivery.
   - Formulate the next sequential follow-up or next topic interview question.
3. Return STRICT JSON with the schema:
{
  "scores": {
    "technicalCorrectness": number,
    "relevance": number,
    "clarity": number,
    "overallScore": number
  },
  "feedback": "Concise feedback summary in candidate's language",
  "strengths": ["Strong point 1", "Strong point 2"],
  "missingConcepts": ["Important missed concept or edge case"],
  "improvedSampleAnswer": "A polished, structured answer that an ideal candidate would say",
  "nextQuestion": {
    "question": "Next interview question string",
    "category": "Follow-up" | "System Design" | "Algorithms" | "CS Core" | "Behavioral",
    "expectedCoreConcepts": ["Key concept 1", "Key concept 2"]
  }
}`;
}
