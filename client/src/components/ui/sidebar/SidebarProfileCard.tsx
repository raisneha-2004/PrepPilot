import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Flame,
  Moon,
  Sun,
  Settings,
  PanelLeftClose,
  PanelLeftOpen,
  Shield,
  Trophy,
  Sparkles
} from 'lucide-react';
import { useAppStore } from '../../../store/useAppStore';
import { useQuery } from '@tanstack/react-query';
import { readinessApi, gamificationApi } from '../../../lib/api/client';

export interface SidebarProfileCardProps {
  isCollapsed?: boolean;
  onToggleCollapse: () => void;
}

export const SidebarProfileCard: React.FC<SidebarProfileCardProps> = ({
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { theme, toggleTheme, profile } = useAppStore();

  const { data: readinessData } = useQuery({
    queryKey: ['readiness'],
    queryFn: readinessApi.getReadiness,
    staleTime: 60000
  });

  const { data: gamificationData } = useQuery({
    queryKey: ['gamification'],
    queryFn: gamificationApi.getStatus,
    staleTime: 60000
  });

  const readinessScore = readinessData?.readinessScore ?? 78;
  const currentStreak = gamificationData?.currentStreak ?? 6;
  const currentLevel = gamificationData?.level ?? 3;
  const currentXp = gamificationData?.currentXp ?? 1450;
  const nextLevelXp = gamificationData?.nextLevelXp ?? 2000;
  const xpPercentage = Math.min(100, Math.round((currentXp / nextLevelXp) * 100));

  // Circular Mini Progress Ring Parameters
  const radius = 13;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (readinessScore / 100) * circumference;

  // Initials
  const initials = profile.targetRole ? profile.targetRole.substring(0, 2) : 'SP';

  if (isCollapsed) {
    return (
      <div className="p-2 border-t border-subtle/80 flex flex-col items-center gap-2.5">
        {/* Compact Avatar with Mini Readiness Ring */}
        <Link
          to="/dashboard"
          title={`Placement Readiness: ${readinessScore}%`}
          className="relative group p-1 flex items-center justify-center"
        >
          <svg className="w-9 h-9 -rotate-90">
            <circle
              cx="18"
              cy="18"
              r={radius}
              stroke="var(--border-subtle)"
              strokeWidth="2.5"
              fill="transparent"
            />
            <circle
              cx="18"
              cy="18"
              r={radius}
              stroke="oklch(0.75 0.19 155)"
              strokeWidth="2.5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-main font-mono">
            {readinessScore}%
          </span>
        </Link>

        {/* Theme Toggle Button */}
        <button
          onClick={(e) => toggleTheme(e)}
          title="Toggle Theme"
          className="p-2 rounded-xl bg-surface-subtle border border-subtle text-muted hover:text-main hover:border-highlight transition-all"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
        </button>

        {/* Collapse / Expand Rail Toggle */}
        <button
          onClick={onToggleCollapse}
          title="Expand Sidebar"
          className="p-2 rounded-xl bg-surface-subtle border border-subtle text-muted hover:text-main hover:border-highlight transition-all"
        >
          <PanelLeftOpen className="w-4 h-4 text-indigo-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="p-3 border-t border-subtle/80 space-y-3 z-10 relative bg-surface/50 backdrop-blur-md">
      {/* Profile & XP Status Card */}
      <div className="p-3 rounded-2xl bg-surface-subtle border border-subtle space-y-2.5 relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-6 -right-6 w-16 h-16 rounded-full bg-indigo-500/10 blur-xl pointer-events-none" />

        <div className="flex items-center justify-between gap-2">
          {/* Avatar & Info */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs shadow-sm">
              {initials}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-main truncate font-heading">
                {profile.targetRole || 'Software Engineer'}
              </span>
              <span className="text-[10px] font-medium text-muted truncate">
                Level {currentLevel} Aspirant
              </span>
            </div>
          </div>

          {/* Mini SVG Readiness Ring */}
          <Link
            to="/dashboard"
            title={`Placement Readiness Score: ${readinessScore}%`}
            className="relative flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
          >
            <svg className="w-8 h-8 -rotate-90">
              <circle
                cx="16"
                cy="16"
                r="11"
                stroke="var(--border-subtle)"
                strokeWidth="2"
                fill="transparent"
              />
              <circle
                cx="16"
                cy="16"
                r="11"
                stroke="oklch(0.75 0.19 155)"
                strokeWidth="2"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 11}
                strokeDashoffset={(2 * Math.PI * 11) * (1 - readinessScore / 100)}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-emerald-400 font-mono">
              {readinessScore}%
            </span>
          </Link>
        </div>

        {/* XP Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-muted">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>{currentXp} XP</span>
            </span>
            <span>{nextLevelXp} XP</span>
          </div>
          <div className="w-full h-1.5 bg-surface rounded-full overflow-hidden border border-subtle/50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpPercentage}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full"
            />
          </div>
        </div>

        {/* Level & Streak Chips */}
        <div className="flex items-center justify-between pt-1 border-t border-subtle/60 text-[10px]">
          <span className="px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 font-bold border border-purple-500/25">
            Level {currentLevel}
          </span>
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-bold border border-amber-500/25">
            <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span>{currentStreak}d Streak</span>
          </span>
        </div>
      </div>

      {/* Bottom Utility Controls */}
      <div className="flex items-center justify-between px-1">
        {/* Theme Toggle */}
        <button
          onClick={(e) => toggleTheme(e)}
          className="p-2 rounded-xl bg-surface-subtle border border-subtle text-muted hover:text-main hover:border-highlight transition-all flex items-center gap-1.5 text-xs font-semibold"
          title="Toggle Dark / Light Theme"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] text-muted hidden sm:inline">Light</span>
            </>
          ) : (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px] text-muted hidden sm:inline">Dark</span>
            </>
          )}
        </button>

        {/* Settings Button */}
        <Link
          to="/settings"
          className="p-2 rounded-xl bg-surface-subtle border border-subtle text-muted hover:text-main hover:border-highlight transition-all"
          title="Settings"
        >
          <Settings className="w-3.5 h-3.5 text-muted" />
        </Link>

        {/* Collapse Sidebar Button */}
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-xl bg-surface-subtle border border-subtle text-muted hover:text-main hover:border-highlight transition-all"
          title="Collapse Sidebar"
        >
          <PanelLeftClose className="w-3.5 h-3.5 text-muted" />
        </button>
      </div>
    </div>
  );
};
