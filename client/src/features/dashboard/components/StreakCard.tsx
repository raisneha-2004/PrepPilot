import React from 'react';
import { Flame, Trophy, Shield, Sparkles, Award } from 'lucide-react';
import { BentoCard } from './BentoCard';

interface StreakCardProps {
  streak?: number;
  longestStreak?: number;
  currentXp?: number;
  nextLevelXp?: number;
  level?: number;
  levelTitle?: string;
  streakFreezes?: number;
  className?: string;
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const STREAK_MILESTONES = [
  { days: 3, name: 'Bronze', tier: 'Bronze', icon: '🥉' },
  { days: 7, name: 'Silver', tier: 'Silver', icon: '🥈' },
  { days: 14, name: 'Gold', tier: 'Gold', icon: '🥇' },
  { days: 30, name: 'Platinum', tier: 'Platinum', icon: '⚡' },
  { days: 60, name: 'Diamond', tier: 'Diamond', icon: '💎' },
  { days: 100, name: 'Centurion', tier: 'Master', icon: '👑' }
];

export const StreakCard: React.FC<StreakCardProps> = ({
  streak = 6,
  longestStreak = 12,
  currentXp = 1450,
  nextLevelXp = 2000,
  level = 4,
  levelTitle = 'Problem Solver',
  streakFreezes = 1,
  className = ''
}) => {
  const xpNeeded = nextLevelXp - currentXp;
  const progressPct = Math.round((currentXp / nextLevelXp) * 100);

  // Milestone countdown
  const nextMilestone = STREAK_MILESTONES.find((m) => m.days > streak) || null;
  const daysUntilNext = nextMilestone ? nextMilestone.days - streak : 0;

  // Flame color & glow scaling with streak length
  const getFlameStyles = () => {
    if (streak >= 14) {
      return {
        boxBg: 'bg-rose-500/15 border-rose-500/30',
        flameColor: 'text-rose-400 fill-rose-400 drop-shadow-[0_0_14px_rgba(244,63,94,0.75)]',
        textColor: 'text-rose-200'
      };
    }
    if (streak >= 7) {
      return {
        boxBg: 'bg-orange-500/15 border-orange-500/30',
        flameColor: 'text-orange-400 fill-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.7)]',
        textColor: 'text-orange-200'
      };
    }
    if (streak >= 3) {
      return {
        boxBg: 'bg-amber-500/15 border-amber-500/30',
        flameColor: 'text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]',
        textColor: 'text-amber-200'
      };
    }
    if (streak > 0) {
      return {
        boxBg: 'bg-amber-500/10 border-amber-500/20',
        flameColor: 'text-amber-400 fill-amber-400/80',
        textColor: 'text-amber-200'
      };
    }
    return {
      boxBg: 'bg-slate-800/40 border-slate-700/40',
      flameColor: 'text-slate-400 fill-slate-500/40',
      textColor: 'text-slate-300'
    };
  };

  const flameTheme = getFlameStyles();

  return (
    <BentoCard
      title="Streak & XP Power"
      subtitle="Consistent Daily Habit"
      icon={Flame}
      iconColor="text-amber-400"
      delta={{ value: '+15 XP Daily Bonus', isPositive: true }}
      badge={{ text: `${streakFreezes} Freeze${streakFreezes === 1 ? '' : 's'} Ready`, variant: 'amber' }}
      actionText="View all badges & leaderboard"
      actionHref="/gamification"
      className={className}
    >
      <div className="space-y-4">
        {/* Streak Flame Big Display & 7-day Node Chain */}
        <div className={`${flameTheme.boxBg} border p-3.5 rounded-2xl space-y-3 transition-colors duration-300`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-xl bg-white/10 ${
                  streak > 0 ? 'motion-safe:animate-pulse motion-reduce:animate-none' : ''
                }`}
              >
                <Flame className={`w-5 h-5 ${flameTheme.flameColor}`} />
              </div>
              <div>
                <span
                  aria-live="polite"
                  className={`text-xl font-black font-heading ${flameTheme.textColor} tabular-nums block`}
                >
                  {streak} Days
                </span>
                <span className="text-[10px] text-amber-300/80 font-medium block">
                  Current Streak
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-main tabular-nums block">
                {longestStreak} Days
              </span>
              <span className="text-[10px] text-muted block">
                Best streak: {longestStreak} days
              </span>
            </div>
          </div>

          {/* Next Milestone Sub-banner */}
          <div className="flex items-center justify-between bg-black/20 px-2.5 py-1.5 rounded-lg border border-white/5 text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              {nextMilestone ? (
                <span>
                  <strong className="text-white font-semibold">{daysUntilNext} {daysUntilNext === 1 ? 'day' : 'days'}</strong> to {nextMilestone.name} badge ({nextMilestone.days}d)
                </span>
              ) : (
                <span className="text-amber-300 font-semibold">Centurion Milestone Achieved! 👑</span>
              )}
            </div>
            {streakFreezes > 0 && (
              <span
                title="Streak freeze protects your streak if you miss a day"
                className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20"
              >
                <Shield className="w-3 h-3" />
                {streakFreezes} Protected
              </span>
            )}
          </div>

          {/* 7-Day Dots Grid */}
          <div className="flex items-center justify-between pt-1 border-t border-white/10">
            {WEEKDAYS.map((day, idx) => {
              const isFilled = idx < streak % 7 || (streak >= 7 && idx <= 6);
              const isToday = idx === (new Date().getDay() + 6) % 7; // Monday = 0

              return (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="text-[9px] font-bold text-muted">{day}</span>
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                      isFilled
                        ? 'bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                        : isToday
                        ? 'border-2 border-amber-400 text-amber-300 motion-safe:animate-pulse motion-reduce:animate-none'
                        : 'bg-surface border border-subtle text-muted'
                    }`}
                  >
                    {isFilled ? '✓' : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Level XP Progress */}
        <div className="space-y-2 bg-surface p-3 rounded-2xl border border-subtle">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 font-bold text-main">
              <Trophy className="w-3.5 h-3.5 text-purple-400" />
              <span>Level {level}</span>
              <span className="text-muted font-normal text-[11px]">({levelTitle})</span>
            </div>
            <span className="text-purple-300 font-bold tabular-nums">
              {currentXp} / {nextLevelXp} XP
            </span>
          </div>

          <div className="h-2 w-full bg-surface-subtle rounded-full overflow-hidden border border-subtle">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <p className="text-[10px] text-muted flex items-center justify-between">
            <span>{xpNeeded} XP to Level {level + 1}</span>
            <span className="text-emerald-400 font-semibold">+15 XP Daily Challenge</span>
          </p>
        </div>
      </div>
    </BentoCard>
  );
};
