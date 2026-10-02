import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Target,
  Database,
  GitBranch,
  Calculator,
  Mic2,
  Zap,
  Check,
  CheckSquare
} from 'lucide-react';

interface TopicCalibration {
  id: string;
  name: string;
  target: number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  barColor: string;
  textColor: string;
}

const TOPICS: TopicCalibration[] = [
  {
    id: 'dbms',
    name: 'DBMS & Indexing',
    target: 45,
    icon: Database,
    iconColor: 'text-amber-400/80',
    barColor: 'bg-amber-400',
    textColor: 'text-amber-400'
  },
  {
    id: 'graphs',
    name: 'Graphs & BFS/DFS',
    target: 52,
    icon: GitBranch,
    iconColor: 'text-indigo-400/80',
    barColor: 'bg-indigo-400',
    textColor: 'text-indigo-400'
  },
  {
    id: 'aptitude',
    name: 'Quantitative Aptitude',
    target: 68,
    icon: Calculator,
    iconColor: 'text-cyan-400/80',
    barColor: 'bg-cyan-400',
    textColor: 'text-cyan-400'
  }
];

interface ActionTask {
  id: string;
  text: string;
  time: string;
  timeColor: string;
  isVoice?: boolean;
}

const ACTION_TASKS: ActionTask[] = [
  {
    id: 'task-1',
    text: 'Solve 2 Graph Traversal problems',
    time: '25 min',
    timeColor: 'text-emerald-400'
  },
  {
    id: 'task-2',
    text: 'Review DBMS B+ Tree indexing',
    time: '15 min',
    timeColor: 'text-indigo-400'
  },
  {
    id: 'task-3',
    text: 'Voice mock: OS Concurrency & Deadlocks',
    time: '10 min',
    timeColor: 'text-cyan-400',
    isVoice: true
  }
];

export const HeroPreviewCard: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();

  // Task checklist interactive completion state
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    'task-1': false,
    'task-2': false,
    'task-3': false
  });

  // Highlight flash state for recently toggled task
  const [justCompletedId, setJustCompletedId] = useState<string | null>(null);

  const toggleTask = (id: string) => {
    setCompletedTasks((prev) => {
      const isNowCompleted = !prev[id];
      if (isNowCompleted) {
        setJustCompletedId(id);
        setTimeout(() => setJustCompletedId(null), 700);
      }
      return {
        ...prev,
        [id]: isNowCompleted
      };
    });
  };

  const completedCount = Object.values(completedTasks).filter(Boolean).length;

  // Count up readiness score from 0 to 72%
  const [readinessScore, setReadinessScore] = useState<number>(0);

  useEffect(() => {
    if (prefersReducedMotion) {
      setReadinessScore(72);
      return;
    }

    const duration = 1200; // 1.2s in sync with stroke animation
    const startTime = performance.now();
    const target = 72;

    const animateCount = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out
      const ease = 1 - Math.pow(1 - progress, 3);
      setReadinessScore(Math.round(ease * target));

      if (progress < 1) {
        requestAnimationFrame(animateCount);
      }
    };

    const frameId = requestAnimationFrame(animateCount);
    return () => cancelAnimationFrame(frameId);
  }, [prefersReducedMotion]);

  // Count up weak topic progress bars in sync with their staggered delays
  const [topicScores, setTopicScores] = useState<number[]>([0, 0, 0]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setTopicScores(TOPICS.map((t) => t.target));
      return;
    }

    const delays = [200, 350, 500]; // 150ms stagger
    const duration = 800; // 800ms duration each
    const startTime = performance.now();

    const animateTopics = (now: number) => {
      const elapsed = now - startTime;
      const newScores = TOPICS.map((topic, i) => {
        const itemElapsed = Math.max(0, elapsed - delays[i]);
        const progress = Math.min(itemElapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        return Math.round(ease * topic.target);
      });

      setTopicScores(newScores);

      if (elapsed < Math.max(...delays) + duration) {
        requestAnimationFrame(animateTopics);
      }
    };

    const frameId = requestAnimationFrame(animateTopics);
    return () => cancelAnimationFrame(frameId);
  }, [prefersReducedMotion]);

  // SVG Geometry for Radial Ring
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76
  const targetOffset = circumference * (1 - 0.72);

  return (
    <motion.div
      initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.36, 1] }}
      className="relative w-full max-w-lg mx-auto lg:max-w-none flex justify-center lg:justify-end"
    >
      {/* Soft Ambient Outer Glow Backdrop */}
      <div
        className="absolute -inset-2 bg-gradient-to-tr from-indigo-600/25 via-purple-600/15 to-cyan-500/25 rounded-3xl blur-2xl -z-10 opacity-70"
        aria-hidden="true"
      />

      {/* Floating Badge 1: Mock Interview Live (Top-Right) */}
      <motion.div
        animate={prefersReducedMotion ? {} : { y: [-3, 3, -3] }}
        transition={{ repeat: Infinity, duration: 4.5, ease: 'easeInOut' }}
        className="absolute -top-3.5 right-4 sm:right-6 px-3 py-1.5 rounded-full bg-[#0a0d18]/95 backdrop-blur-md border border-cyan-500/30 text-xs font-semibold text-white shadow-[0_0_20px_rgba(34,211,238,0.25)] flex items-center gap-2 z-20"
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
        </span>
        <Mic2 className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
        <span className="tracking-tight text-[11px] sm:text-xs">Mock Interview: Live</span>
      </motion.div>

      {/* Main Glass Dashboard Card */}
      <div className="w-full rounded-2xl bg-white/[0.04] dark:bg-white/[0.04] border border-white/10 backdrop-blur-xl p-5 sm:p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_10px_40px_-15px_rgba(0,0,0,0.5)] relative text-left overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            <span className="text-xs font-bold text-white tracking-wide uppercase">
              Diagnostic Overview
            </span>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            Target: SDE-1
          </span>
        </div>

        {/* Section 1: Overview Ring & Calibration Staggered Container */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
          {/* Readiness Circular Progress (72%) */}
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: prefersReducedMotion ? 0 : 0.1 }}
            className="sm:col-span-5 flex flex-col items-center justify-center p-3 rounded-xl bg-white/[0.03] border border-white/5 relative"
          >
            {/* Soft Pulsing Glow Behind the Ring */}
            <motion.div
              animate={
                prefersReducedMotion
                  ? { opacity: 0.25 }
                  : { opacity: [0.15, 0.35, 0.15], scale: [0.92, 1.06, 0.92] }
              }
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute w-20 h-20 bg-indigo-500/30 rounded-full blur-xl pointer-events-none -z-10"
              aria-hidden="true"
            />

            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg
                className="w-24 h-24 -rotate-90"
                viewBox="0 0 96 96"
                role="progressbar"
                aria-valuenow={readinessScore}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Diagnostic Placement Index Readiness"
              >
                <defs>
                  {/* Rotating Gradient for alive organic feel */}
                  <linearGradient
                    id="hero-ring-gradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    {!prefersReducedMotion && (
                      <animateTransform
                        attributeName="gradientTransform"
                        type="rotate"
                        from="0 48 48"
                        to="360 48 48"
                        dur="20s"
                        repeatCount="indefinite"
                      />
                    )}
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="50%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#22d3ee" />
                  </linearGradient>
                </defs>

                {/* Base Outer Track */}
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="7"
                  fill="transparent"
                  className="text-white/10"
                />

                {/* Thin Inner Concentric Calibration Ring for Depth */}
                <circle
                  cx="48"
                  cy="48"
                  r="30"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  fill="transparent"
                  className="text-white/15"
                />

                {/* Animated Gradient Progress Stroke */}
                <motion.circle
                  cx="48"
                  cy="48"
                  r={radius}
                  stroke="url(#hero-ring-gradient)"
                  strokeWidth="7"
                  fill="transparent"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: targetOffset }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 1.2,
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  strokeLinecap="round"
                />
              </svg>

              {/* Number and Ready Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold font-mono text-white">
                  {readinessScore}%
                </span>
                <motion.span
                  initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: prefersReducedMotion ? 0 : 1.0, duration: 0.4 }}
                  className="text-[9px] text-slate-400 font-semibold tracking-wider uppercase"
                >
                  Ready
                </motion.span>
              </div>
            </div>

            <motion.span
              initial={{ opacity: prefersReducedMotion ? 1 : 0, y: prefersReducedMotion ? 0 : 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : 1.1, duration: 0.4 }}
              className="text-[11px] font-medium text-slate-300 mt-2"
            >
              Placement Index
            </motion.span>
          </motion.div>

          {/* Section 2: Priority Calibration Panel */}
          <motion.div
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: prefersReducedMotion ? 0 : 0.2 }}
            className="sm:col-span-7 space-y-2.5"
          >
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-md bg-indigo-500/15 border border-indigo-400/25 text-indigo-400 flex items-center justify-center shrink-0">
                  <Target className="w-3.5 h-3.5" aria-hidden="true" />
                </div>
                Priority Calibration
              </span>
              <span className="text-[10px] text-slate-400">Weak Topics</span>
            </div>

            {/* Topic Bars with Staggered Mount Animation and Hover Tooltip */}
            <div className="space-y-1.5 text-xs">
              {TOPICS.map((topic, index) => {
                const TopicIcon = topic.icon;
                const score = topicScores[index];
                const delays = [0.2, 0.35, 0.5];

                return (
                  <div
                    key={topic.id}
                    className="group relative p-1.5 rounded-lg hover:bg-white/5 transition-all duration-150 cursor-pointer"
                  >
                    {/* Tooltip on Hover */}
                    <div className="absolute right-0 -top-6 opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none z-20 px-2 py-0.5 rounded bg-slate-900/95 border border-white/10 text-[10px] text-slate-200 shadow-md whitespace-nowrap">
                      {topic.target}% mastery — click to practice
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-300 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <TopicIcon className={`w-3.5 h-3.5 ${topic.iconColor} shrink-0`} aria-hidden="true" />
                        <span className="truncate group-hover:text-white transition-colors">
                          {topic.name}
                        </span>
                      </div>
                      <span className={`font-mono ${topic.textColor} font-semibold shrink-0 ml-2`}>
                        {score}%
                      </span>
                    </div>

                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${topic.target}%` }}
                        transition={{
                          delay: prefersReducedMotion ? 0 : delays[index],
                          duration: prefersReducedMotion ? 0 : 0.8,
                          ease: [0.16, 1, 0.3, 1]
                        }}
                        className={`h-full ${topic.barColor} rounded-full`}
                        role="progressbar"
                        aria-valuenow={score}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`${topic.name} mastery`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Section 3: Today's Action Plan with Live Task Progress */}
        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: prefersReducedMotion ? 0 : 0.3 }}
          className="mt-5 pt-4 border-t border-white/5 space-y-2.5"
        >
          {/* Action Plan Header with Counter & Day Indicator */}
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-indigo-400" aria-hidden="true" />
              Today's Action Plan
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-indigo-300">
                {completedCount}/3 done
              </span>
              <span className="text-slate-500 text-[10px]">·</span>
              <span className="text-[10px] text-indigo-300 font-mono">Day 14 of 45</span>
            </div>
          </div>

          {/* Thin Animated Task Completion Progress Line */}
          <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${(completedCount / 3) * 100}%` }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.35, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 rounded-full"
              role="progressbar"
              aria-valuenow={completedCount}
              aria-valuemin={0}
              aria-valuemax={3}
              aria-label="Tasks completed today"
            />
          </div>

          {/* Interactive Action Plan Task Rows */}
          <div className="space-y-1.5 text-[11px] text-slate-300 pt-1">
            {ACTION_TASKS.map((task, index) => {
              const isDone = !!completedTasks[task.id];
              const isFlashing = justCompletedId === task.id;

              const borderAccent = task.isVoice ? 'border-l-2 border-l-cyan-400' : '';
              const bgState = isFlashing
                ? 'bg-emerald-500/15 border-emerald-500/30'
                : isDone
                ? 'bg-white/[0.02] border-white/5 opacity-80'
                : 'bg-white/[0.04] border-white/5';

              return (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-2 rounded-lg border transition-all duration-200 flex items-center justify-between gap-2.5 cursor-pointer hover:bg-white/[0.05] hover:-translate-y-px ${borderAccent} ${bgState}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Custom Styled Accessible Checkbox */}
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isDone}
                      aria-label={`Mark task ${index + 1}: ${task.text} as ${isDone ? 'incomplete' : 'complete'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTask(task.id);
                      }}
                      className={`w-4 h-4 rounded-md flex items-center justify-center border transition-all duration-200 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:outline-none shrink-0 ${
                        isDone
                          ? 'bg-gradient-to-tr from-indigo-500 to-violet-600 border-indigo-400 text-white shadow-xs'
                          : 'border-white/20 bg-white/5 hover:border-indigo-400/50 text-transparent'
                      }`}
                    >
                      <Check
                        className={`w-3 h-3 stroke-[3] transition-transform duration-150 ${
                          isDone ? 'scale-100' : 'scale-0'
                        }`}
                        aria-hidden="true"
                      />
                    </button>

                    {/* Task Title with Distinguishing Voice Icon if Voice Mock */}
                    <div className="flex items-center gap-1.5 min-w-0">
                      {task.isVoice && (
                        <Mic2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" aria-hidden="true" />
                      )}
                      <span
                        className={`truncate transition-all duration-200 ${
                          isDone ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {index + 1}. {task.text}
                      </span>
                    </div>
                  </div>

                  {/* Time Estimate or Completed Checkmark Badge */}
                  <div className="shrink-0 ml-2">
                    {isDone ? (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-semibold flex items-center gap-1">
                        <Check className="w-2.5 h-2.5 stroke-[2.5]" aria-hidden="true" />
                        Done
                      </span>
                    ) : (
                      <span className={`text-[10px] font-semibold ${task.timeColor}`}>
                        {task.time}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Floating Badge 2: +120 XP Today (Bottom-Left) */}
      <motion.div
        animate={prefersReducedMotion ? {} : { y: [3, -3, 3] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        className="hidden sm:flex absolute -bottom-3.5 left-4 sm:-left-3 px-3 py-1.5 rounded-full bg-[#0a0d18]/95 backdrop-blur-md border border-purple-500/30 text-xs font-semibold text-purple-200 shadow-[0_0_20px_rgba(168,85,247,0.25)] items-center gap-1.5 z-20"
      >
        <Zap className="w-4 h-4 text-purple-400 fill-purple-400/40" aria-hidden="true" />
        <span className="font-mono font-bold">+120 XP</span>
        <span className="text-slate-400 text-[10px]">Today</span>
      </motion.div>
    </motion.div>
  );
};
