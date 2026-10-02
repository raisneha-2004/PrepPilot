import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Trophy,
  Award,
  Flame,
  Zap,
  CheckCircle2,
  Lock,
  Sparkles,
  BarChart2
} from 'lucide-react';
import { gamificationApi } from '../../lib/api/client';
import { ShimmerCard } from '../../components/ui/LoadingSkeleton';

export const GamificationPage: React.FC = () => {
  const { data: gamification, isLoading } = useQuery({
    queryKey: ['gamification'],
    queryFn: gamificationApi.getStatus
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        <ShimmerCard className="h-32" />
        <ShimmerCard className="h-64" />
      </div>
    );
  }

  const level = gamification?.level || 4;
  const levelTitle = gamification?.title || 'Problem Solver';
  const xp = gamification?.currentXp || 1450;
  const nextLevelXp = gamification?.nextLevelXp || 2000;
  const progressPercent = gamification?.progressPercent || 45;
  const badges = gamification?.badges || [];
  const stats = gamification?.stats || {};

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Top Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl gradient-border-glow space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold">
              <Trophy className="w-4 h-4" />
              <span>Placement Preparation Mastery</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading text-main mt-1">
              Level {level} • {levelTitle}
            </h1>
            <p className="text-muted text-xs">
              Earn XP by solving DSA problems, reviewing flashcards, and taking AI mock interviews.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
              <div>
                <span className="text-[10px] text-amber-200/80 block">Current Streak</span>
                <span className="text-sm font-bold">{gamification?.currentStreak || 6} Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-muted">{xp} XP earned</span>
            <span className="text-purple-300 font-bold">{nextLevelXp - xp} XP to Level {level + 1}</span>
          </div>
          <div className="w-full h-3 bg-surface-subtle rounded-full overflow-hidden border border-subtle">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Lifetime Stats Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Questions Solved', val: stats.totalQuestionsSolved || 54, icon: CheckCircle2, color: 'text-emerald-400' },
          { label: 'DSA Solved', val: stats.dsaSolved || 18, icon: Zap, color: 'text-cyan-400' },
          { label: 'Aptitude Tests', val: stats.aptitudeSolved || 24, icon: Award, color: 'text-indigo-400' },
          { label: 'Mock Interviews', val: stats.mockInterviewsCompleted || 3, icon: Trophy, color: 'text-purple-400' }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="glass-card p-4 rounded-2xl text-center space-y-1">
              <Icon className={`w-5 h-5 mx-auto ${item.color}`} />
              <span className="text-2xl font-black font-heading text-main block">{item.val}</span>
              <span className="text-[11px] text-muted">{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* Badges Gallery */}
      <div className="glass-panel p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-subtle pb-3">
          <div>
            <h2 className="text-lg font-bold font-heading text-main">Placement Badges Gallery</h2>
            <p className="text-xs text-muted">Collect milestone badges across preparation categories.</p>
          </div>
          <span className="text-xs font-bold text-indigo-400">
            {badges.filter((b: any) => b.unlocked).length} / {badges.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges.map((b: any) => (
            <div
              key={b.id}
              className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all ${
                b.unlocked
                  ? 'border-indigo-500/30 bg-indigo-500/10 shadow-sm'
                  : 'border-subtle bg-surface-subtle/50 opacity-60'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-surface border border-subtle flex items-center justify-center text-2xl shrink-0">
                {b.icon || '🏅'}
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-main">{b.name}</span>
                  {!b.unlocked && <Lock className="w-3 h-3 text-muted" />}
                </div>
                <p className="text-muted text-[11px] leading-relaxed">{b.description}</p>
                <span className={`text-[10px] font-semibold inline-block ${b.unlocked ? 'text-emerald-400' : 'text-muted'}`}>
                  {b.unlocked ? '✓ Unlocked' : 'Locked Milestone'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
