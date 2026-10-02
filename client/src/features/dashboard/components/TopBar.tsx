import React from 'react';
import { Flame, Award, Sparkles, Command, Calendar } from 'lucide-react';

interface TopBarProps {
  candidateName?: string;
  streak?: number;
  level?: number;
  levelTitle?: string;
  currentXp?: number;
  nextLevelXp?: number;
  progressPercent?: number;
  onOpenCommandPalette?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  candidateName = 'Sneha',
  streak = 6,
  level = 4,
  levelTitle = 'Problem Solver',
  currentXp = 1450,
  nextLevelXp = 2000,
  progressPercent = 45,
  onOpenCommandPalette
}) => {
  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Formatted today's date
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date());

  return (
    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 glass-card p-6 rounded-[24px] border border-subtle relative overflow-hidden">
      {/* Aurora subtle radial backdrop */}
      <div className="absolute top-0 right-1/4 w-96 h-32 bg-indigo-500/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-0 right-10 w-64 h-24 bg-amber-500/8 blur-3xl pointer-events-none rounded-full" />

      {/* Left: Greeting, Date & Motivation */}
      <div className="space-y-1 relative z-10">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>{todayFormatted}</span>
          <span className="text-muted">•</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Placement Sprint Mode</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-main">
          {getGreeting()},{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-cyan-400 bg-clip-text text-transparent">
            {candidateName}
          </span>
        </h1>

        <p className="text-xs text-muted max-w-xl leading-relaxed">
          You're on track with a <strong className="text-main font-semibold">{streak}-day preparation streak</strong>. Complete today's DSA Two-Pointer workout to reach Level {level + 1}!
        </p>
      </div>

      {/* Right: Streak & XP Chips + Quick Search */}
      <div className="flex flex-wrap items-center gap-3 relative z-10 w-full lg:w-auto justify-start lg:justify-end">
        {/* Streak Flame Chip (Amber role) */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 shadow-sm shadow-amber-500/5">
          <div className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400">
            <Flame className="w-4 h-4 fill-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-black font-heading tabular-nums text-amber-200">
                {streak} Days
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-1 rounded-full">
                +1 today
              </span>
            </div>
            <span className="text-[10px] text-amber-300/70 block leading-tight">Current Streak</span>
          </div>
        </div>

        {/* XP & Level Chip */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 shadow-sm shadow-indigo-500/5">
          <div className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-400">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black font-heading text-indigo-200">
                Lvl {level}
              </span>
              <span className="text-[10px] text-muted tabular-nums">
                {currentXp} / {nextLevelXp} XP
              </span>
            </div>
            <span className="text-[10px] text-indigo-300/70 block leading-tight truncate max-w-[90px]">
              {levelTitle}
            </span>
          </div>
        </div>

        {/* Cmd/Ctrl+K Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-surface border border-subtle text-muted hover:text-main hover:border-highlight transition-all text-xs font-medium group"
          aria-label="Open Command Palette"
        >
          <Command className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span className="hidden md:inline">Quick Jump</span>
          <kbd className="px-1.5 py-0.5 rounded bg-surface-subtle border border-subtle text-[10px] text-faint font-mono">
            ⌘K
          </kbd>
        </button>
      </div>
    </div>
  );
};
