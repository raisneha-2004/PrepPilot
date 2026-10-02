# PrepPilot AI — Frontend Web Application

> Award-level, responsive 2026 AI placement preparation web application built with React 18, Vite, TypeScript, Tailwind CSS v4, Advanced CSS tokens (`@property`, OKLCH, View Transitions API), Monaco Code Studio, and Web Speech API.

---

## 🎨 Design System & Aesthetic

- **Theme**: Dark-first "Aurora + Glass" aesthetic with refined editorial typography.
- **Glassmorphism**: Layered glass cards with `backdrop-filter: blur(16px) saturate(160%)`, inner glow, and 1px subtle borders.
- **Interactive Lighting**:
  - CSS `@property` animated aurora mesh background canvas.
  - Interactive pointer-following spotlight (`--spotlight-x`, `--spotlight-y`).
- **View Transitions API**: Circular reveal animation originating from the clicked coordinates upon theme toggling.
- **Micro-interactions**: 3D perspective Tilt cards, magnetic pull buttons, SVG stroke-draw progress rings, shimmer skeletons, and celebratory confetti-lite.

---

## 📱 Navigation & Features

| Module | Route | Highlights |
|---|---|---|
| **Landing Page** | `/` | Hero with animated readiness ring, interactive 6-step flow, 3D feature cards |
| **Onboarding Wizard** | `/onboarding` | Multi-step role, timeline, skills, and target company configuration |
| **Placement Diagnostic** | `/assessment` | Sectioned timed test with question palette, mark-for-review, and radar skill matrix |
| **Bento Dashboard** | `/dashboard` | Placement Readiness index ring, streak counter, level progress, and weekly activity charts |
| **Study Planner** | `/planner` | Day-wise timeline with Learn/Practice/Quiz/Revision blocks, mark complete, and roadmap generator |
| **AI Coach Chat** | `/coach` | Full-screen SSE streaming chat with voice input, prompt suggestions, and markdown code formatting |
| **DSA Code Studio** | `/dsa` | 40 problems, topic filters, Monaco Editor, progressive hints 1-3, sandbox runner, and AI Big-O feedback |
| **Aptitude Practice** | `/aptitude` | 120+ questions, Practice mode (instant explanations) & Timed Exam mode |
| **CS Fundamentals** | `/cs` | OOP, DBMS, OS, CN, SQL theory, analogies, engineering examples, interview questions, and MCQs |
| **AI Mock Interview** | `/interview` | Voice/Text speech recognition with live transcripts, audio waveforms, per-answer scoring, and final reports |
| **Resume Interview** | `/resume` | PDF drag & drop upload, extracted skill/project chips, ATS audit, and tailored project questions |
| **Spaced Revision** | `/revision` | Leitner 5-box daily flashcard review queue (~10 mins) with promotion/reset mechanics |
| **Daily Challenge** | `/daily` | 2 Aptitude + 1 DSA + 3 CS MCQs + 1 Interview question per day with +100 XP bonus |
| **Company Mode** | `/companies` | Preparation resources for Google, Amazon, Microsoft, TCS, Infosys, and Flipkart |
| **Badges & XP** | `/gamification` | 10 level tiers, lifetime problem counters, and unlocked badges gallery |
| **System Settings** | `/settings` | Dark/Light theme, language preference, reduced motion, and JSON progress export/import |

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
cd client
npm install

# 2. Start local development server
npm run dev
```

App will run at `http://localhost:3000` and automatically proxies `/api` requests to the backend on `http://localhost:5000`.

---

## 🚢 Deployment (Vercel / Netlify)

1. Set **Root Directory**: `client`
2. Set **Build Command**: `npm run build`
3. Set **Output Directory**: `dist`
4. Set Environment Variable: `VITE_API_URL=https://your-backend-domain.com/api/v1`
