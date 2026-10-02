import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Zap,
  Calendar
} from 'lucide-react';
import { dailyApi } from '../../../lib/api/client';

interface DailyChallengeCardProps {
  completed?: boolean;
  currentStreak?: number;
  className?: string;
  onMilestoneUnlocked?: (badge: any) => void;
}

export const DailyChallengeCard: React.FC<DailyChallengeCardProps> = ({
  completed,
  currentStreak = 6,
  className = '',
  onMilestoneUnlocked
}) => {
  const { data: dailyData, isLoading } = useQuery({
    queryKey: ['dailyChallenge'],
    queryFn: () => dailyApi.getDaily(),
    staleTime: 60000
  });

  const isCompleted = completed !== undefined ? completed : Boolean(dailyData?.completed);
  const hour = new Date().getHours();
  const isEvening = hour >= 18; // After 6 PM local time
  const isStreakAtRisk = !isCompleted && isEvening;

  const challenge = dailyData?.featuredChallenge || {
    id: dailyData?.items?.dsa?.id || 'dsa_today',
    title: dailyData?.items?.dsa?.title || 'Optimal Two Sum & Subarray Sum Target',
    topic: `DSA - ${dailyData?.items?.dsa?.topic || 'Arrays & Hashing'}`,
    difficulty: dailyData?.items?.dsa?.difficulty || 'Medium',
    xpReward: 15,
    targetUrl: '/daily?daily=true'
  };

  const difficultyColors: Record<string, string> = {
    Easy: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    Medium: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    Hard: 'bg-rose-500/15 text-rose-300 border-rose-500/30'
  };

  const diffStyle = difficultyColors[challenge.difficulty] || difficultyColors.Medium;

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-6 relative overflow-hidden transition-all duration-300 shadow-xl ${
        isStreakAtRisk
          ? 'hover:border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.08)]'
          : isCompleted
          ? 'hover:border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.06)]'
          : 'hover:border-indigo-500/40 shadow-[0_0_25px_rgba(99,102,241,0.08)]'
      } ${className}`}
    >
      {/* Background Subtle Gradient Blobs */}
      <div
        className={`absolute -top-16 -right-16 w-36 h-36 rounded-full blur-2xl pointer-events-none transition-colors duration-500 ${
          isCompleted
            ? 'bg-emerald-500/10'
            : isStreakAtRisk
            ? 'bg-amber-500/15'
            : 'bg-indigo-500/15'
        }`}
      />

      {isCompleted ? (
        /* State 2: COMPLETED TODAY */
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            {/* Animated Checkmark Circle */}
            <div className="relative shrink-0">
              <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.35)]">
                <svg
                  className="w-7 h-7 text-emerald-400 motion-safe:animate-[drawCheck_0.6s_ease-out_forwards]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Completed Today
                </span>
                <span className="text-[11px] font-semibold text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2.5 py-0.5 rounded-full">
                  +{challenge.xpReward || 15} XP Earned
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold font-heading text-white">
                Today's challenge complete!
              </h3>
              <p className="text-xs sm:text-sm text-slate-300">
                You kept your <span className="font-semibold text-amber-300">{currentStreak}-day streak</span> alive! Come back tomorrow for a new one.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              disabled
              aria-disabled="true"
              aria-label="Today's challenge already completed"
              className="w-full md:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 text-slate-400 cursor-not-allowed flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Completed for Today</span>
            </button>
            <Link
              to="/daily?daily=true"
              className="text-xs font-medium text-slate-400 hover:text-slate-200 underline underline-offset-4 px-2 py-1 transition-colors"
            >
              Review
            </Link>
          </div>
        </div>
      ) : (
        /* State 1: NOT ATTEMPTED (With Optional Evening Streak-at-Risk Warning) */
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-3.5 flex-1 min-w-0">
            {/* Top Bar inside Card */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Today's Challenge</span>
              </span>

              {/* Reward Pill */}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-500/15 border border-purple-500/30 text-purple-300">
                <Zap className="w-3 h-3 text-purple-400 fill-purple-400" />
                <span>+{challenge.xpReward} XP</span>
              </span>

              {/* Streak At Risk Subtle Reminder (Evening) */}
              {isStreakAtRisk && (
                <span
                  role="status"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/35 text-amber-300 animate-pulse motion-reduce:animate-none"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>Streak at risk • Complete before midnight!</span>
                </span>
              )}
            </div>

            {/* Question Title & Meta */}
            <div className="space-y-1.5">
              <h3 className="text-lg sm:text-xl font-extrabold font-heading text-white tracking-tight line-clamp-1">
                {challenge.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Topic Tag */}
                <span className="px-2.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 font-medium">
                  {challenge.topic}
                </span>

                {/* Difficulty Badge */}
                <span className={`px-2.5 py-0.5 rounded-md border font-bold text-[11px] ${diffStyle}`}>
                  {challenge.difficulty}
                </span>

                {/* Estimated Time */}
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  <Clock className="w-3 h-3 text-slate-400" />
                  ~5-10 min
                </span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="shrink-0 flex items-center gap-3">
            <Link
              to="/daily?daily=true"
              aria-label={`Start Challenge: ${challenge.title}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 hover:from-indigo-600 hover:via-violet-600 hover:to-cyan-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.35)] transition-all duration-200 transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <span>Start Challenge</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
