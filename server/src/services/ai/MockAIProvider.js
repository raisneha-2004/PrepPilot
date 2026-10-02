import { AIProvider } from './AIProvider.js';

export class MockAIProvider extends AIProvider {
  async generateText({ messages, systemPrompt, maxTokens = 1000, temperature = 0.7, onToken }) {
    const lastMsg = messages[messages.length - 1]?.content || '';
    let responseText = '';

    const isPlanner = systemPrompt?.includes('placement curriculum designer') || lastMsg.includes('candidate_profile');
    const isFeedback = systemPrompt?.includes('Senior Principal Software Engineer') || lastMsg.includes('user_submitted_code');
    const isInterviewQ = systemPrompt?.includes('Generate the next realistic interview question') || lastMsg.includes('previous_questions');
    const isInterviewEval = systemPrompt?.includes('evaluating a candidate\'s answer') || lastMsg.includes('candidate_answer');
    const isResume = systemPrompt?.includes('Principal Technical Recruiter') || lastMsg.includes('resume_extracted_text');

    if (isPlanner) {
      responseText = JSON.stringify({
        summary: 'Targeted preparation roadmap focusing on DSA optimization and CS fundamentals.',
        totalDays: 14,
        dailyHours: 3,
        days: Array.from({ length: 14 }, (_, i) => ({
          dayNumber: i + 1,
          dateOffsetDays: i,
          focusTopic: i % 2 === 0 ? 'Arrays & Two Pointers' : 'Trees & Binary Search',
          estimatedMinutes: 180,
          blocks: [
            {
              type: 'Learn',
              title: `Core Theory - Day ${i + 1}`,
              description: 'Review foundational patterns and standard complexity limits.',
              durationMinutes: 45,
              resources: ['PrepPilot Concept Notes', 'Visualgo Algorithm Visualizer']
            },
            {
              type: 'Practice',
              title: `Coding Practice - Day ${i + 1}`,
              description: 'Solve 2 medium problems focusing on optimal space & time.',
              durationMinutes: 75,
              problems: ['Two Sum', 'Maximum Subarray']
            },
            {
              type: 'Quiz',
              title: 'Checkpoint Quiz',
              description: '5 quick conceptual MCQs on today’s topic.',
              durationMinutes: 30
            },
            {
              type: 'Revision',
              title: 'Spaced Recall',
              description: 'Revise flashcards from 3 days ago.',
              durationMinutes: 30
            }
          ]
        }))
      });
    } else if (isFeedback) {
      responseText = JSON.stringify({
        verdict: 'Accepted',
        score: 92,
        timeComplexity: 'O(N)',
        spaceComplexity: 'O(1)',
        isOptimal: true,
        logicSummary: 'Your implementation correctly utilizes the two-pointer approach to solve the problem in linear time.',
        issues: [],
        improvements: ['Can add early boundary exit checks for empty input.'],
        betterApproach: 'Current solution is already optimal with O(N) time and O(1) auxiliary space.',
        sampleOptimizedCode: '// Clean optimal approach\nfunction solution(nums) {\n  return nums.length;\n}',
        encouragement: 'Great job! Your logic and complexity analysis are spot on for top tech interviews.'
      });
    } else if (isInterviewQ) {
      responseText = JSON.stringify({
        question: 'Explain how you would design an in-memory cache with an LRU eviction policy.',
        category: 'System Design',
        expectedCoreConcepts: ['Doubly Linked List + Hash Map', 'O(1) get and put', 'Node eviction and promotion'],
        hints: ['Consider which data structure gives O(1) arbitrary removal and insertion at head.']
      });
    } else if (isInterviewEval) {
      responseText = JSON.stringify({
        scores: {
          technicalCorrectness: 88,
          relevance: 90,
          clarity: 85,
          overallScore: 88
        },
        feedback: 'Strong understanding of the core data structure trade-offs. Well explained!',
        strengths: ['Mentioned combination of Doubly Linked List with Hash Map for O(1) operations.'],
        missingConcepts: ['Could have explicitly discussed thread-safety or concurrency locking.'],
        improvedSampleAnswer: 'An optimal LRU cache pairs a Hash Map with a Doubly Linked List. The map holds keys pointing to list nodes for O(1) lookup, while the list maintains access recency.',
        nextQuestion: {
          question: 'How would you ensure thread-safety when multiple concurrent requests access this cache?',
          category: 'Follow-up',
          expectedCoreConcepts: ['Read-Write Locks', 'Striped Locks / ConcurrentHashMap', 'Lock-Free data structures']
        }
      });
    } else if (isResume) {
      responseText = JSON.stringify({
        candidateName: 'Aditya Sharma',
        skills: {
          languages: ['JavaScript', 'Python', 'C++'],
          frameworks: ['React', 'Node.js', 'Express'],
          databases: ['PostgreSQL', 'Redis', 'MongoDB'],
          tools: ['Git', 'Docker', 'Postman']
        },
        projects: [
          {
            title: 'Real-Time Collaborative Code Editor',
            technologies: ['React', 'Node.js', 'Socket.io', 'Redis'],
            description: 'Full-duplex web application enabling simultaneous code editing with CRDT consistency.',
            highlight: 'Supported 50+ concurrent users per room with sub-50ms sync latency.'
          }
        ],
        experience: [
          {
            role: 'Software Engineering Intern',
            organization: 'Tech Innovations Labs',
            duration: 'May 2025 - July 2025',
            summary: 'Built REST microservices and optimized PostgreSQL query indexes.'
          }
        ],
        education: {
          degree: 'B.Tech in Computer Science and Engineering',
          institution: 'Apex Institute of Technology',
          year: '2026'
        },
        resumeReview: {
          score: 86,
          strengths: ['Clear project breakdown with quantifiable tech stack details', 'Strong core skill list'],
          improvements: ['Include more metrics on API throughput and latency reduction achievements']
        },
        tailoredInterviewQuestions: [
          {
            question: 'How did you handle concurrent conflict resolution in your collaborative code editor project?',
            targetedProjectOrTech: 'Real-Time Collaborative Code Editor',
            expectedKeyInsights: ['Operational Transformation (OT) vs CRDTs', 'Redis Pub/Sub broadcasting']
          },
          {
            question: 'How did you optimize slow queries in PostgreSQL during your internship?',
            targetedProjectOrTech: 'PostgreSQL / Tech Innovations Labs',
            expectedKeyInsights: ['EXPLAIN ANALYZE', 'B-Tree Indexing on foreign keys']
          }
        ]
      });
    } else {
      // Default coach text
      const isHinglish = /bhai|karo|kaise|kya|samjha|batao/i.test(lastMsg);
      if (isHinglish) {
        responseText = 'Bilkul! Placement preparation ke liye structured consistency sabse zaroori hai. Aap DSA ke core patterns (Two Pointers, Sliding Window, DFS/BFS) par focus karein aur daily 2-3 quality problems solve karein.';
      } else {
        responseText = 'Hello! I am your PrepPilot AI Coach. I am here to help you master Data Structures, Algorithms, CS fundamentals, and crack your technical placement interviews with confidence. What topic shall we tackle today?';
      }
    }

    if (typeof onToken === 'function') {
      const words = responseText.split(' ');
      for (const word of words) {
        onToken(`${word} `);
      }
    }

    return responseText;
  }
}
