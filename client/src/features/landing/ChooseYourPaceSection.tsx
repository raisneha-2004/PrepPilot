import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Clock,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Code2,
  Zap,
  Mic2,
  Calendar,
  Sparkles
} from 'lucide-react';

interface TaskItem {
  type: 'Learn' | 'Practice' | 'Quiz' | 'Mock';
  title: string;
}

interface DayPlan {
  label: string;
  tasks: [TaskItem, TaskItem];
  time: string;
}

interface PlanOption {
  id: string;
  tabLabel: string;
  planName: string;
  description: string;
  effort: string;
  buttonText: string;
  slug: string;
  highlights: [string, string, string];
  readiness: number;
  sampleDays: [DayPlan, DayPlan, DayPlan];
}

const PLANS: PlanOption[] = [
  {
    id: '3months',
    tabLabel: '3+ Months',
    planName: 'Deep Prep Plan',
    description: 'Full DSA patterns, Core CS revision, projects and resume polish, and weekly mock interviews.',
    effort: '~2 hrs/day',
    buttonText: 'Start Deep Prep Plan',
    slug: 'deep-prep',
    highlights: [
      'Comprehensive coverage across 75+ DSA patterns & Core CS',
      'End-to-end resume audit, project defense & system design',
      'Weekly 1-on-1 AI voice mock interviews with deep debriefs'
    ],
    readiness: 94,
    sampleDays: [
      {
        label: 'Day 1',
        tasks: [
          { type: 'Learn', title: 'Binary Trees & BFS/DFS' },
          { type: 'Practice', title: '3 Medium Tree Problems' }
        ],
        time: '2 hrs'
      },
      {
        label: 'Day 2',
        tasks: [
          { type: 'Learn', title: 'OS Concurrency & Locks' },
          { type: 'Quiz', title: 'Core CS 15-Q Diagnostic' }
        ],
        time: '2 hrs'
      },
      {
        label: 'Day 3',
        tasks: [
          { type: 'Practice', title: 'System Design: Cache Tier' },
          { type: 'Mock', title: 'AI Technical Interview' }
        ],
        time: '2 hrs'
      }
    ]
  },
  {
    id: '1month',
    tabLabel: '1 Month',
    planName: 'Focused Sprint',
    description: 'Top 20 DSA patterns, aptitude practice, and 2 mock interviews per week on your weak areas only.',
    effort: '~3 hrs/day',
    buttonText: 'Start Focused Sprint',
    slug: 'sprint',
    highlights: [
      'Top 20 high-frequency DSA placement patterns & algorithms',
      'Targeted diagnostic drills focused solely on your weak areas',
      '2 AI voice mock interviews per week with clarity scoring'
    ],
    readiness: 88,
    sampleDays: [
      {
        label: 'Day 1',
        tasks: [
          { type: 'Learn', title: 'Sliding Window & DP Patterns' },
          { type: 'Practice', title: '4 High-Yield Questions' }
        ],
        time: '3 hrs'
      },
      {
        label: 'Day 2',
        tasks: [
          { type: 'Quiz', title: 'Aptitude & Speed Math' },
          { type: 'Practice', title: 'Company-Specific Problems' }
        ],
        time: '3 hrs'
      },
      {
        label: 'Day 3',
        tasks: [
          { type: 'Mock', title: 'Voice Mock: Tech & Logic' },
          { type: 'Practice', title: 'Weak Area Revision Drill' }
        ],
        time: '3 hrs'
      }
    ]
  },
  {
    id: '1week',
    tabLabel: '1 Week',
    planName: 'Crash Course',
    description: 'Most-asked questions, quick aptitude tricks, HR and resume answers, and one full mock interview.',
    effort: '~5 hrs/day',
    buttonText: 'Start Crash Course',
    slug: 'crash',
    highlights: [
      'Top 30 most-asked interview coding problems & patterns',
      'Quick-fire aptitude shortcuts, speed math & formula sheets',
      'HR storytelling frameworks plus 1 full simulated mock interview'
    ],
    readiness: 74,
    sampleDays: [
      {
        label: 'Day 1',
        tasks: [
          { type: 'Learn', title: 'Top 30 High-Yield Questions' },
          { type: 'Practice', title: 'Speed Coding Blitz (5 Qs)' }
        ],
        time: '5 hrs'
      },
      {
        label: 'Day 2',
        tasks: [
          { type: 'Quiz', title: 'Rapid Aptitude Shortcuts' },
          { type: 'Learn', title: 'HR & Resume Defense Prep' }
        ],
        time: '5 hrs'
      },
      {
        label: 'Day 3',
        tasks: [
          { type: 'Mock', title: 'Full Voice Simulation' },
          { type: 'Practice', title: 'Final Review & Cheat Sheets' }
        ],
        time: '5 hrs'
      }
    ]
  }
];

const TASK_CONFIG: Record<
  TaskItem['type'],
  { icon: React.ComponentType<{ className?: string }>; style: string }
> = {
  Learn: {
    icon: BookOpen,
    style: 'bg-cyan-500/10 text-cyan-300 border-cyan-400/25'
  },
  Practice: {
    icon: Code2,
    style: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/25'
  },
  Quiz: {
    icon: Zap,
    style: 'bg-amber-500/10 text-amber-300 border-amber-400/25'
  },
  Mock: {
    icon: Mic2,
    style: 'bg-violet-500/10 text-violet-300 border-violet-400/25'
  }
};

export const ChooseYourPaceSection: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('1month');
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const activePlan = PLANS.find((p) => p.id === selectedPlanId) || PLANS[1];
  const activeIndex = PLANS.findIndex((p) => p.id === selectedPlanId);

  // Handle keyboard navigation between tabs (ARIA pattern)
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex: number | null = null;

    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % PLANS.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + PLANS.length) % PLANS.length;
    } else if (e.key === 'Home') {
      nextIndex = 0;
    } else if (e.key === 'End') {
      nextIndex = PLANS.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      setSelectedPlanId(PLANS[nextIndex].id);
      tabRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <section
      aria-label="Choose your pace"
      className="py-20 lg:py-28 relative overflow-hidden w-full"
    >
      {/* Background radial glow & masked dot grid texture */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none -z-10 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]"
        aria-hidden="true"
      />

      <div className="max-w-5xl mx-auto px-6 w-full">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center text-balance flex flex-col items-center">
          <span className="text-xs font-bold text-indigo-400 tracking-widest uppercase inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
            CHOOSE YOUR PACE
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white tracking-tight text-balance">
            How Much Time Do You Have Before Placements?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed text-balance mt-4">
            Pick your timeline and see the kind of plan PrepPilot builds for you.
          </p>
        </div>

        {/* Segmented Tab Control */}
        <div className="mt-8 mb-10 flex justify-center w-full">
          <div
            role="tablist"
            aria-label="Preparation timeline options"
            className="w-full sm:w-auto inline-flex rounded-full bg-white/5 border border-white/10 p-1 backdrop-blur-md shadow-inner"
          >
            {PLANS.map((plan, index) => {
              const isSelected = plan.id === selectedPlanId;
              return (
                <button
                  key={plan.id}
                  ref={(el) => (tabRefs.current[index] = el)}
                  role="tab"
                  id={`tab-${plan.id}`}
                  aria-selected={isSelected}
                  aria-controls={`panel-${plan.id}`}
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => setSelectedPlanId(plan.id)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={`flex-1 sm:flex-initial min-h-[48px] sm:min-h-0 px-4 sm:px-6 py-2.5 sm:py-2 text-sm font-semibold rounded-full transition-all duration-200 cursor-pointer select-none flex items-center justify-center focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none ${
                    isSelected
                      ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  {plan.tabLabel}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Panel with 250ms Animated Transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activePlan.id}
            role="tabpanel"
            id={`panel-${activePlan.id}`}
            aria-labelledby={`tab-${activePlan.id}`}
            tabIndex={0}
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -10 }}
            transition={{
              duration: prefersReducedMotion ? 0 : 0.25,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch focus-visible:outline-none"
          >
            {/* Left Column: Plan Summary Card */}
            <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 sm:p-8 hover:border-indigo-400/40 transition-colors duration-300 flex flex-col justify-between shadow-xl">
              {/* Soft Indigo Glow Behind Card */}
              <div
                className="absolute -top-10 -left-10 w-44 h-44 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10"
                aria-hidden="true"
              />

              <div className="space-y-4">
                {/* Plan Title & Effort Pill */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-2xl font-bold text-white tracking-tight">
                    {activePlan.planName}
                  </h3>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/25 text-indigo-300 text-xs sm:text-sm font-medium">
                    <Clock className="w-3.5 h-3.5 text-indigo-400 shrink-0" aria-hidden="true" />
                    <span>{activePlan.effort}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed text-balance">
                  {activePlan.description}
                </p>

                {/* 3 Check-list Highlights */}
                <div className="pt-2">
                  <ul className="space-y-2.5" aria-label="Plan highlights">
                    {activePlan.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                        <CheckCircle2
                          className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span className="leading-snug">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Primary Action Button */}
              <div className="pt-6 mt-6 border-t border-white/10">
                <Link
                  to={`/assessment?plan=${activePlan.slug}`}
                  className="group min-h-[48px] h-12 rounded-xl px-6 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-[0_8px_30px_-8px_rgba(99,102,241,0.6)] hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none transition-all duration-200 cursor-pointer w-full"
                >
                  <span>{activePlan.buttonText}</span>
                  <ArrowRight
                    className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                    aria-hidden="true"
                  />
                </Link>
              </div>
            </div>

            {/* Right Column: Sample Week Preview Card */}
            <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 sm:p-8 hover:border-indigo-400/40 transition-colors duration-300 flex flex-col justify-between shadow-xl">
              {/* Soft Subtle Glow Behind Card */}
              <div
                className="absolute -top-10 -right-10 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10"
                aria-hidden="true"
              />

              <div>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-indigo-400" aria-hidden="true" />
                    <span className="text-sm font-semibold text-white tracking-wide">
                      Sample week
                    </span>
                  </div>
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                    Example
                  </span>
                </div>

                {/* Day 1, Day 2, Day 3 Rows */}
                <div className="space-y-3">
                  {activePlan.sampleDays.map((day) => (
                    <div
                      key={day.label}
                      className="p-3 sm:p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/10 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xs font-mono font-bold text-indigo-300 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 shrink-0">
                          {day.label}
                        </span>
                        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                          {day.tasks.map((task, tIdx) => {
                            const conf = TASK_CONFIG[task.type];
                            const TaskIcon = conf.icon;
                            return (
                              <div
                                key={tIdx}
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${conf.style}`}
                              >
                                <TaskIcon className="w-3 h-3 shrink-0" aria-hidden="true" />
                                <span className="truncate max-w-[125px] sm:max-w-[155px]">
                                  {task.title}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center text-xs font-mono text-slate-400 shrink-0 self-end sm:self-center">
                        <Clock className="w-3 h-3 text-slate-500 mr-1" aria-hidden="true" />
                        <span>{day.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Readiness Progress Bar at Bottom */}
              <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-medium">Readiness after this plan</span>
                  <span className="font-mono font-semibold text-indigo-300">
                    {activePlan.readiness}%{' '}
                    <span className="text-slate-500 font-normal text-[11px]">(Example)</span>
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden p-0.5">
                  <motion.div
                    key={`${activePlan.id}-progress`}
                    initial={{ width: 0 }}
                    animate={{ width: `${activePlan.readiness}%` }}
                    transition={{
                      duration: prefersReducedMotion ? 0 : 0.6,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400"
                    role="progressbar"
                    aria-valuenow={activePlan.readiness}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label="Readiness after this plan"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Footer Line with Diagnostic Link */}
        <p className="text-center text-sm text-slate-400 mt-8 text-balance">
          Not sure?{' '}
          <Link
            to="/assessment"
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4 font-medium transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none rounded-xs"
          >
            take the 45-minute diagnostic
          </Link>{' '}
          and let PrepPilot choose for you.
        </p>
      </div>
    </section>
  );
};
