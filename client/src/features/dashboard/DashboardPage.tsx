import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, type Variants } from 'framer-motion';
import { Shield } from 'lucide-react';
import {
  readinessApi,
  gamificationApi,
  revisionApi,
  dailyApi,
  profileApi,
  plannerApi
} from '../../lib/api/client';
import { DashboardShell } from './components/DashboardShell';
import { TopBar } from './components/TopBar';
import { ContinueCard } from './components/ContinueCard';
import { ReadinessCard } from './components/ReadinessCard';
import { PlanCard } from './components/PlanCard';
import { StreakCard } from './components/StreakCard';
import { RadarCard } from './components/RadarCard';
import { ProgressChart } from './components/ProgressChart';
import { WeakAreasCard } from './components/WeakAreasCard';
import { DailyChallengeCard } from './components/DailyChallengeCard';
import { RevisionCard } from './components/RevisionCard';
import { ActivityTimeline } from './components/ActivityTimeline';
import { StreakMilestoneModal, type MilestoneBadge } from '../../components/ui/StreakMilestoneModal';

// Framer motion variants with 70ms stagger
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.05
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const
    }
  }
};

export const DashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [celebrationBadge, setCelebrationBadge] = useState<MilestoneBadge | null>(null);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: profileApi.getProfile
  });

  const { data: readiness } = useQuery({
    queryKey: ['readiness'],
    queryFn: readinessApi.getReadiness
  });

  const { data: gamification } = useQuery({
    queryKey: ['gamification'],
    queryFn: gamificationApi.getStatus
  });

  const { data: revision } = useQuery({
    queryKey: ['todayRevision'],
    queryFn: revisionApi.getTodayDue
  });

  const { data: daily } = useQuery({
    queryKey: ['dailyChallenge'],
    queryFn: () => dailyApi.getDaily()
  });

  const { data: planner } = useQuery({
    queryKey: ['planner'],
    queryFn: plannerApi.getPlan
  });

  // Candidate metrics & fallbacks
  const candidateName = profile?.targetRole ? 'Sneha' : 'Candidate';
  const score = readiness?.readinessScore ?? 78;
  const streak = gamification?.currentStreak ?? 6;
  const longestStreak = gamification?.longestStreak ?? 12;
  const streakFreezes = gamification?.streakFreezes ?? 1;
  const level = gamification?.level ?? 4;
  const levelTitle = gamification?.title ?? 'Problem Solver';
  const currentXp = gamification?.currentXp ?? 1450;
  const nextLevelXp = gamification?.nextLevelXp ?? 2000;
  const progressPercent = gamification?.progressPercent ?? 45;

  const handleOpenCommandPalette = () => {
    // Trigger command palette keyboard shortcut event
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, metaKey: true }));
  };

  const handleDismissFreezeNotice = async () => {
    await gamificationApi.dismissFreezeNotice();
    queryClient.invalidateQueries({ queryKey: ['gamification'] });
  };

  return (
    <DashboardShell>
      {/* Celebratory Milestone Modal */}
      <StreakMilestoneModal
        isOpen={Boolean(celebrationBadge)}
        badge={celebrationBadge}
        streak={streak}
        onClose={() => setCelebrationBadge(null)}
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 sm:space-y-8"
      >
        {/* Top Greeting & Stats Bar */}
        <motion.div variants={itemVariants}>
          <TopBar
            candidateName={candidateName}
            streak={streak}
            level={level}
            levelTitle={levelTitle}
            currentXp={currentXp}
            nextLevelXp={nextLevelXp}
            progressPercent={progressPercent}
            onOpenCommandPalette={handleOpenCommandPalette}
          />
        </motion.div>

        {/* Streak Freeze Protected Banner (If freeze was automatically used) */}
        {gamification?.freezeUsedNotice && (
          <motion.div variants={itemVariants}>
            <div
              role="alert"
              className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Streak Freeze Active</h4>
                  <p className="text-xs text-emerald-200/90">{gamification.freezeUsedNotice}</p>
                </div>
              </div>
              <button
                onClick={handleDismissFreezeNotice}
                aria-label="Dismiss streak freeze notice"
                className="self-end sm:self-center px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 transition-colors"
              >
                Dismiss Notice
              </button>
            </div>
          </motion.div>
        )}

        {/* Daily Challenge & Continue Where You Left Off */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-7 flex flex-col">
            <DailyChallengeCard
              currentStreak={streak}
              className="h-full"
              onMilestoneUnlocked={(b) => setCelebrationBadge(b)}
            />
          </div>
          <div className="lg:col-span-5 flex flex-col">
            <ContinueCard
              topic="Data Structures & Algorithms"
              subtopic="Arrays & Two Pointers: Container With Most Water"
              questionsLeft={3}
              estimatedMinutes={45}
              progressPercent={65}
              targetHref="/dsa"
              className="h-full"
            />
          </div>
        </motion.div>

        {/* ROW 1: [Readiness 4 cols] [Today's Plan 5 cols] [Streak + XP 3 cols] */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
        >
          {/* Placement Readiness Ring Card (4 cols) */}
          <div className="lg:col-span-4 flex flex-col">
            <ReadinessCard
              score={score}
              breakdown={readiness?.breakdown}
              disclaimer={readiness?.disclaimer}
              className="h-full"
            />
          </div>

          {/* Today's Plan (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <PlanCard
              dayNumber={4}
              focusTopic="Arrays & Two Pointers"
              totalMinutes={180}
              completedMinutes={120}
              className="h-full"
            />
          </div>

          {/* Streak & XP (3 cols) */}
          <div className="lg:col-span-3 flex flex-col">
            <StreakCard
              streak={streak}
              longestStreak={longestStreak}
              streakFreezes={streakFreezes}
              currentXp={currentXp}
              nextLevelXp={nextLevelXp}
              level={level}
              levelTitle={levelTitle}
              className="h-full"
            />
          </div>
        </motion.div>

        {/* ROW 2: [Skill Radar 4 cols] [Velocity Chart 5 cols] [Weak Areas 3 cols] */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
        >
          {/* Skill Radar Chart (4 cols) */}
          <div className="lg:col-span-4 flex flex-col">
            <RadarCard className="h-full" />
          </div>

          {/* Progress Over Time Chart (5 cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <ProgressChart className="h-full" />
          </div>

          {/* Weak Areas Prioritized (3 cols) */}
          <div className="lg:col-span-3 flex flex-col">
            <WeakAreasCard className="h-full" />
          </div>
        </motion.div>

        {/* ROW 3: [Daily Challenge 4 cols] [Revision Queue 4 cols] [Activity Timeline 4 cols] */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch"
        >
          {/* Daily Challenge (4 cols) */}
          <div className="lg:col-span-4 flex flex-col">
            <DailyChallengeCard completed={daily?.completed} className="h-full" />
          </div>

          {/* Spaced Revision Queue (4 cols) */}
          <div className="lg:col-span-4 flex flex-col">
            <RevisionCard dueCount={revision?.dueCount ?? 5} className="h-full" />
          </div>

          {/* Upcoming Interview / Activity Timeline (4 cols) */}
          <div className="md:col-span-2 lg:col-span-4 flex flex-col">
            <ActivityTimeline className="h-full" />
          </div>
        </motion.div>
      </motion.div>
    </DashboardShell>
  );
};
