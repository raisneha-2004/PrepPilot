import { sanitizePromptData } from '../../../utils/tokenEstimator.js';

export function buildPlannerPrompt({
  targetRole,
  experienceLevel,
  daysLeft,
  dailyHours,
  currentSkills = [],
  targetCompanies = [],
  assessmentResults = null,
  preferredLanguage = 'English'
}) {
  const profileSummary = JSON.stringify({
    targetRole,
    experienceLevel,
    daysLeft,
    dailyHours,
    currentSkills,
    targetCompanies,
    assessmentResults
  });

  return `You are an expert placement curriculum designer.
Generate a structured, day-wise personalized study plan for a candidate preparing for technical campus/off-campus placements.

CANDIDATE PROFILE:
${sanitizePromptData(profileSummary, 'candidate_profile')}

LANGUAGE REQUIREMENT:
Generate titles, descriptions, and notes in the requested language/style: ${preferredLanguage} (English, Hindi, or Hinglish as requested).

CONSTRAINTS & RULES:
1. Plan duration: Create exactly ${Math.min(Math.max(Number(daysLeft) || 14, 1), 30)} day plans (capped to max 30 days for initial roadmap).
2. Each day MUST contain 4 distinct structured blocks matching the user's daily hours (${dailyHours}h):
   - "Learn" block (concept study, reading documentation, core theory)
   - "Practice" block (coding problems or aptitude problem sets)
   - "Quiz" block (MCQs or quick recall questions)
   - "Revision" block (spaced review of previous days' topics)
3. Prioritize the candidate's weak areas identified in their assessment results and align with their target companies.
4. Output MUST be ONLY valid JSON matching this schema:
{
  "summary": "High-level strategy summary string",
  "totalDays": number,
  "dailyHours": number,
  "days": [
    {
      "dayNumber": 1,
      "dateOffsetDays": 0,
      "focusTopic": "Topic name (e.g. Arrays & Two Pointers)",
      "estimatedMinutes": 180,
      "blocks": [
        {
          "type": "Learn",
          "title": "Title of concept",
          "description": "Specific subtopics and learning goals",
          "durationMinutes": 45,
          "resources": ["Topic documentation", "Video tutorial guide"]
        },
        {
          "type": "Practice",
          "title": "Problem set title",
          "description": "Specific problems to solve",
          "durationMinutes": 75,
          "problems": ["Two Sum", "Best Time to Buy Stock"]
        },
        {
          "type": "Quiz",
          "title": "Quick checkpoint",
          "description": "5-10 quick MCQs on topic",
          "durationMinutes": 30
        },
        {
          "type": "Revision",
          "title": "Spaced Revision",
          "description": "Review yesterday flashcards and formula sheet",
          "durationMinutes": 30
        }
      ]
    }
  ]
}`;
}
