import { sanitizePromptData } from '../../../utils/tokenEstimator.js';

export function buildInterviewQuestionPrompt({ role, difficulty, previousQuestions = [], resumeContext = null, roundNumber = 1 }) {
  return `You are a Technical Interviewer at a top tier technology company.
Generate the next realistic interview question for a ${role} candidate (${difficulty} difficulty, Round ${roundNumber}).

PREVIOUS QUESTIONS ASKED IN THIS SESSION:
${sanitizePromptData(JSON.stringify(previousQuestions), 'previous_questions')}

CANDIDATE RESUME HIGHLIGHTS (IF ANY):
${sanitizePromptData(JSON.stringify(resumeContext || {}), 'resume_context')}

INSTRUCTIONS:
1. Generate an insightful, non-repetitive technical or behavioral question tailored to the role and difficulty.
2. If resume highlights exist, ask about one of their stated projects or technologies.
3. Return STRICT JSON with the schema:
{
  "question": "The interview question string",
  "category": "Data Structures" | "System Design" | "CS Core" | "Behavioral" | "Project Deep-dive",
  "expectedCoreConcepts": ["Key concept 1", "Key concept 2"],
  "hints": ["Helpful nudge if candidate gets stuck", "Second hint"]
}`;
}
