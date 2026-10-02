# PrepPilot AI — Backend API

> Production-grade, AI-powered placement preparation API engineered for high-throughput candidate assessment, dynamic study roadmaps, DSA code feedback, AI mock interviews, spaced repetition, and readiness scoring.

---

## 🏗️ Architecture & Stack

- **Runtime**: Node.js 20+ (ES Modules `"type": "module"`)
- **Web Framework**: Express.js
- **Validation**: Zod (strict schema validation on all inputs and AI outputs)
- **Security**: Helmet, CORS allowlist, Express Rate Limiter, prompt-injection defense with delimiter isolation
- **Logging**: Pino structured JSON logger with PII and credential redaction
- **Storage**: Pluggable JSON Repository Layer with atomic writes and concurrency queues (easily swappable with MongoDB, PostgreSQL, or Supabase)
- **AI Abstraction Layer**: `AIProvider` interface supporting Google Gemini, OpenAI, Anthropic, and Mock providers with automated retry on JSON schema failure, timeouts, and rate limits
- **Testing**: Vitest & Supertest (Unit & Integration tests)
- **Documentation**: Interactive OpenAPI 3.0 Swagger documentation at `/docs`

---

## 📁 Directory Structure

```
server/
├── src/
│   ├── app.js                   # Express application setup, middlewares & routing
│   ├── server.js                # Server entry point & graceful shutdown
│   ├── config/
│   │   ├── env.js               # Environment variables validated with Zod
│   │   ├── constants.js         # Roles, gamification XP tables, badges, Leitner intervals
│   │   └── swaggerSpec.js       # OpenAPI 3.0 specification
│   ├── controllers/             # Request handlers for all 14 modules
│   ├── data/                    # Seed datasets (120 Aptitude, 40 DSA, 60 CS MCQs, 40 Interviews, 6 Companies)
│   ├── middleware/              # Error handler, rate limiters, auth, upload, validation
│   ├── repositories/            # Storage repository layer with atomic temp+rename
│   ├── services/
│   │   ├── ai/                  # AI Provider abstraction, prompts, and implementations
│   │   ├── ProfileService.js
│   │   ├── AssessmentService.js
│   │   ├── PlannerService.js
│   │   ├── CoachService.js
│   │   ├── DSAService.js
│   │   ├── AptitudeService.js
│   │   ├── CSService.js
│   │   ├── InterviewService.js
│   │   ├── ResumeService.js
│   │   ├── RevisionService.js
│   │   ├── ReadinessService.js
│   │   ├── GamificationService.js
│   │   ├── DailyService.js
│   │   └── CompanyService.js
│   └── utils/                   # Logger, errors, response envelopes, token estimators
├── tests/                       # Vitest suites
├── .env.example
├── package.json
└── README.md
```

---

## 🚀 Quick Start

### 1. Installation

```bash
cd server
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

### 3. Run Development Server

```bash
npm run dev
```

The server starts on `http://localhost:5000`.  
Visit **`http://localhost:5000/docs`** to explore interactive Swagger documentation.

### 4. Run Test Suite

```bash
npm test
```

---

## ⚙️ Environment Variables

| Variable | Type | Default | Description |
|---|---|---|---|
| `NODE_ENV` | String | `development` | Application environment (`development`, `test`, `production`) |
| `PORT` | Number | `5000` | HTTP port |
| `HOST` | String | `0.0.0.0` | Bind host address |
| `CORS_ORIGIN` | String | `*` | Allowed CORS origins (comma-separated or `*`) |
| `STORAGE_DIR` | String | `./data/storage` | Directory where JSON repository files are persisted |
| `AI_PROVIDER` | String | `mock` | Active provider: `gemini`, `openai`, `anthropic`, `mock` |
| `AI_API_KEY` | String | `mock-key` | Secret key for AI provider (never exposed to client) |
| `AI_MODEL` | String | `gemini-1.5-flash` | Model identifier |
| `AI_REQUEST_TIMEOUT_MS`| Number | `30000` | AbortController timeout in ms |
| `AI_MAX_RETRIES` | Number | `2` | Number of retries on transient AI errors |
| `RATE_LIMIT_WINDOW_MS` | Number | `900000` | 15-minute sliding rate limit window |
| `RATE_LIMIT_MAX` | Number | `300` | Max general API requests per window |
| `AI_RATE_LIMIT_MAX` | Number | `30` | Max AI generation requests per window |
| `JUDGE0_ENABLED` | Boolean | `false` | Enable Judge0 remote code execution |
| `JUDGE0_API_KEY` | String | `""` | RapidAPI / Judge0 API Key |
| `JUDGE0_API_URL` | String | `https://judge0-ce.p.rapidapi.com` | Judge0 Endpoint |
| `LOG_LEVEL` | String | `info` | Pino log level (`info`, `debug`, `warn`, `error`) |

---

## 🧠 AI Layer & Prompt Security

1. **Abstraction Interface**: `AIProvider` defines `generateText` and `generateJSON`. All AI interactions pass through this contract.
2. **Strict JSON & Self-Correction**: `generateJSON` demands strict JSON, validates outputs against Zod schemas, and retries automatically if formatting fails.
3. **Prompt Injection Defense**: Untrusted user inputs and resume texts are enclosed in structured XML boundary tags (`<user_data>...</user_data>`), neutralizing malicious instruction overrides.
4. **Multilingual Adaptation**: Prompts are tuned to respond fluently in English, Hindi, or Hinglish based on candidate tone and preferences.

---

## 💻 Code Execution Architecture

PrepPilot backend does **NOT** execute arbitrary user code using server `eval()` or `child_process`. Code execution is decoupled:

1. **Client-side Execution (Recommended Default)**:
   - The frontend executes user JavaScript solutions in a sandboxed Web Worker in the browser.
   - Outputs and runtime traces are submitted to `POST /api/v1/dsa/problems/:id/feedback` for AI complexity and logic review.
2. **Judge0 API Integration (Feature Flagged)**:
   - Set `JUDGE0_ENABLED=true` and provide `JUDGE0_API_KEY` in `.env`.
   - The API will proxy compilation and multi-language execution (C++, Python, Java, JS) to Judge0.

---

## 📊 Placement Readiness Score (Formula)

The **Placement Readiness Score** is a descriptive metric reflecting tracked preparation metrics:

$$\text{Readiness} = (0.30 \times \text{DSA}) + (0.20 \times \text{Aptitude}) + (0.20 \times \text{CS Core}) + (0.20 \times \text{Mock Interview}) + (0.10 \times \text{Consistency})$$

> **Notice**: This score is a descriptive index of preparation activity and test performance. It does not represent a statistical probability of job selection.

---

## 📡 API Modules & `curl` Examples

All requests accept the `X-User-Id` header (or auto-generate a UUID if omitted).

### 1. Onboarding & Profile

```bash
# Save profile
curl -X POST http://localhost:5000/api/v1/profile \
  -H "Content-Type: application/json" \
  -H "X-User-Id: demo-user-123" \
  -d '{
    "targetRole": "SDE",
    "experienceLevel": "fresher",
    "placementDate": "2026-12-01",
    "dailyHours": 3,
    "currentSkills": ["Java", "JavaScript", "SQL"],
    "targetCompanies": ["Google", "Amazon"],
    "preferredLanguage": "English"
  }'

# Get profile
curl http://localhost:5000/api/v1/profile -H "X-User-Id: demo-user-123"
```

### 2. Diagnostic Assessment

```bash
# Fetch questions
curl "http://localhost:5000/api/v1/assessment/questions?sections=aptitude,dsa,oop,dbms&count=10" \
  -H "X-User-Id: demo-user-123"

# Submit answers
curl -X POST http://localhost:5000/api/v1/assessment/submit \
  -H "Content-Type: application/json" \
  -H "X-User-Id: demo-user-123" \
  -d '{
    "answers": [
      { "questionId": "apt_1", "section": "aptitude", "selectedOption": 0 },
      { "questionId": "cs_oop_1", "section": "oop", "selectedOption": 0 }
    ],
    "timeTakenSeconds": 180
  }'
```

### 3. Study Planner

```bash
# Generate AI Plan
curl -X POST http://localhost:5000/api/v1/planner/generate \
  -H "Content-Type: application/json" \
  -H "X-User-Id: demo-user-123" \
  -d '{
    "targetRole": "SDE",
    "daysLeft": 14,
    "dailyHours": 3
  }'

# Mark Day Complete
curl -X PATCH http://localhost:5000/api/v1/planner/day/day_1 \
  -H "Content-Type: application/json" \
  -H "X-User-Id: demo-user-123" \
  -d '{ "completed": true }'
```

### 4. AI Coach (SSE Streaming)

```bash
# Stream message
curl -N -X POST http://localhost:5000/api/v1/coach/message \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -H "X-User-Id: demo-user-123" \
  -d '{ "message": "Bhai binary search me infinite loop kab banta hai?", "stream": true }'
```

### 5. DSA Practice

```bash
# Get topics
curl http://localhost:5000/api/v1/dsa/topics -H "X-User-Id: demo-user-123"

# Get problems
curl "http://localhost:5000/api/v1/dsa/problems?topic=Arrays&difficulty=easy" -H "X-User-Id: demo-user-123"

# Get hint level 1
curl -X POST http://localhost:5000/api/v1/dsa/problems/dsa_1/hint \
  -H "Content-Type: application/json" \
  -H "X-User-Id: demo-user-123" \
  -d '{ "level": 1 }'

# AI Code Review
curl -X POST http://localhost:5000/api/v1/dsa/problems/dsa_1/feedback \
  -H "Content-Type: application/json" \
  -H "X-User-Id: demo-user-123" \
  -d '{
    "language": "javascript",
    "code": "function twoSum(nums, target) { const map = new Map(); for (let i = 0; i < nums.length; i++) { const diff = target - nums[i]; if (map.has(diff)) return [map.get(diff), i]; map.set(nums[i], i); } return []; }"
  }'
```

### 6. Aptitude Practice & Exam

```bash
curl "http://localhost:5000/api/v1/aptitude/questions?topic=Quantitative%20Aptitude&mode=practice&count=5" \
  -H "X-User-Id: demo-user-123"
```

### 7. CS Fundamentals

```bash
curl http://localhost:5000/api/v1/cs/dbms -H "X-User-Id: demo-user-123"
```

### 8. Mock Interview

```bash
# Start
curl -X POST http://localhost:5000/api/v1/interview/start \
  -H "Content-Type: application/json" \
  -H "X-User-Id: demo-user-123" \
  -d '{ "role": "SDE", "difficulty": "medium" }'

# Submit Answer
curl -X POST http://localhost:5000/api/v1/interview/<INTERVIEW_ID>/answer \
  -H "Content-Type: application/json" \
  -H "X-User-Id: demo-user-123" \
  -d '{ "candidateAnswer": "We combine a doubly linked list with a hash map to achieve O(1) get and put operations." }'
```

### 9. Resume Parsing & Targeted Questions

```bash
curl -X POST http://localhost:5000/api/v1/resume/upload \
  -H "X-User-Id: demo-user-123" \
  -F "resume=@/path/to/resume.pdf" \
  -F "targetRole=SDE"
```

### 10. Spaced Revision

```bash
# Record review
curl -X POST http://localhost:5000/api/v1/revision/record \
  -H "Content-Type: application/json" \
  -H "X-User-Id: demo-user-123" \
  -d '{ "topic": "Dynamic Programming", "isCorrect": true }'

# Get due today
curl http://localhost:5000/api/v1/revision/today -H "X-User-Id: demo-user-123"
```

### 11. Readiness & Progress

```bash
curl http://localhost:5000/api/v1/readiness -H "X-User-Id: demo-user-123"
curl http://localhost:5000/api/v1/progress -H "X-User-Id: demo-user-123"
```

### 12. Gamification

```bash
curl http://localhost:5000/api/v1/gamification -H "X-User-Id: demo-user-123"
```

### 13. Daily Challenge

```bash
curl http://localhost:5000/api/v1/daily -H "X-User-Id: demo-user-123"
```

### 14. Company Mode

```bash
curl http://localhost:5000/api/v1/companies -H "X-User-Id: demo-user-123"
curl http://localhost:5000/api/v1/companies/google -H "X-User-Id: demo-user-123"
```

---

## 🚢 Deployment Notes

### Deploying to Render

1. Create a **Web Service** pointing to the repository.
2. Configure **Root Directory** as `server`.
3. Set **Build Command**: `npm install`.
4. Set **Start Command**: `npm start`.
5. Under Environment Variables, add:
   - `NODE_ENV=production`
   - `PORT=10000`
   - `AI_PROVIDER=gemini` (or `openai` / `anthropic`)
   - `AI_API_KEY=<your_api_key>`
   - `AI_MODEL=gemini-1.5-flash`
   - `STORAGE_DIR=/var/data/storage` (Attach a persistent disk for multi-instance restarts)

### Deploying to Railway

1. Click **New Project** -> Deploy from GitHub repo.
2. Set root directory to `server`.
3. Add environment variables (`AI_PROVIDER`, `AI_API_KEY`, `AI_MODEL`, `PORT`).
4. Railway automatically detects `npm start` and exposes the port.

---

## 🛡️ License

MIT License. Engineered with ❤️ for placement aspirants by the PrepPilot AI Team.
