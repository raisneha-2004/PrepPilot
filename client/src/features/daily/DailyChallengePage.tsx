import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Zap,
  CheckCircle2,
  BrainCircuit,
  Code2,
  Binary,
  Mic2,
  Award,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { dailyApi } from '../../lib/api/client';
import { ShimmerCard } from '../../components/ui/LoadingSkeleton';
import { useConfetti } from '../../hooks/useConfetti';
import { toast } from 'sonner';
import { StreakMilestoneModal } from '../../components/ui/StreakMilestoneModal';

export const DailyChallengePage: React.FC = () => {
  const queryClient = useQueryClient();
  const { triggerConfetti } = useConfetti();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [unlockedMilestone, setUnlockedMilestone] = useState<any>(null);

  const { data: dailyData, isLoading } = useQuery({
    queryKey: ['dailyChallenge'],
    queryFn: () => dailyApi.getDaily()
  });

  const completeMutation = useMutation({
    mutationFn: (answersList: any[]) => dailyApi.completeDaily({ answers: answersList }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dailyChallenge'] });
      queryClient.invalidateQueries({ queryKey: ['gamification'] });
      triggerConfetti();

      // Check for newly unlocked milestone badges
      const streakBadge = data?.gamification?.newlyUnlockedBadges?.find((b: any) =>
        b.id.startsWith('streak_')
      );
      if (streakBadge) {
        setUnlockedMilestone({
          ...streakBadge,
          currentStreak: data?.gamification?.currentStreak
        });
      }

      toast.success(`Daily Challenge Completed! +${data.xpEarned || 100} XP Earned!`);
    }
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-8 space-y-6">
        <ShimmerCard className="h-28" />
        <ShimmerCard className="h-64" />
      </div>
    );
  }

  const items = dailyData?.items;
  const isCompleted = dailyData?.completed;

  const handleSelectAnswer = (qId: string, optIdx: number) => {
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmit = () => {
    const formatted = Object.entries(answers).map(([questionId, selectedOption]) => ({
      questionId,
      selectedOption
    }));

    completeMutation.mutate(formatted);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-6">
      {/* Top Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl gradient-border-glow space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold">
            <Zap className="w-4 h-4" />
            <span>Daily Placement Workout</span>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/25">
            +100 XP
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-heading text-main">
          Daily Placement Challenge
        </h1>
        <p className="text-muted text-xs">
          2 Aptitude + 1 DSA Intuition + 3 CS MCQs + 1 Interview Question generated deterministically for today.
        </p>
      </div>

      {isCompleted ? (
        <div className="glass-panel p-8 text-center space-y-4 rounded-3xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <Award className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black font-heading text-main">
            Daily Challenge Completed!
          </h2>
          <p className="text-xs text-muted max-w-sm mx-auto">
            You've collected today's 100 XP bonus and kept your streak alive. Come back tomorrow for a fresh placement workout!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section 1: Aptitude (2 Questions) */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <span className="text-xs font-bold text-main flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-indigo-400" />
              <span>Section 1: Aptitude (2 Questions)</span>
            </span>

            {(items?.aptitude || []).map((q: any, i: number) => (
              <div key={q.id} className="p-4 rounded-xl bg-surface-subtle border border-subtle space-y-3 text-xs">
                <p className="font-semibold text-main">Q{i + 1}: {q.question}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt: string, optIdx: number) => (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectAnswer(q.id, optIdx)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        answers[q.id] === optIdx
                          ? 'border-indigo-500 bg-indigo-500/15 text-indigo-200 font-bold'
                          : 'border-subtle bg-surface text-muted hover:text-main'
                      }`}
                    >
                      <span className="font-bold mr-1">{String.fromCharCode(65 + optIdx)}.</span>
                      <span>{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Section 2: DSA Problem (1 Question) */}
          {items?.dsa && (
            <div className="glass-panel p-6 rounded-2xl space-y-3 text-xs">
              <span className="font-bold text-main flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Section 2: Daily DSA Problem • {items.dsa.title}</span>
              </span>
              <p className="text-muted leading-relaxed">{items.dsa.description}</p>
              <div className="flex items-center gap-2 pt-2">
                <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 font-bold text-[10px]">
                  Topic: {items.dsa.topic}
                </span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-bold text-[10px]">
                  Difficulty: {items.dsa.difficulty}
                </span>
              </div>
            </div>
          )}

          {/* Section 3: CS MCQs (3 Questions) */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <span className="text-xs font-bold text-main flex items-center gap-1.5">
              <Binary className="w-4 h-4 text-amber-400" />
              <span>Section 3: Core CS MCQs (3 Questions)</span>
            </span>

            {(items?.csMCQs || []).map((q: any, i: number) => (
              <div key={q.id} className="p-4 rounded-xl bg-surface-subtle border border-subtle space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-main">Q{i + 1}: {q.question}</p>
                  <span className="text-[10px] text-muted font-bold uppercase">{q.subject}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {q.options.map((opt: string, optIdx: number) => (
                    <button
                      key={optIdx}
                      onClick={() => handleSelectAnswer(q.id, optIdx)}
                      className={`p-2.5 rounded-lg border text-left transition-all ${
                        answers[q.id] === optIdx
                          ? 'border-indigo-500 bg-indigo-500/15 text-indigo-200 font-bold'
                          : 'border-subtle bg-surface text-muted hover:text-main'
                      }`}
                    >
                      <span className="font-bold mr-1">{String.fromCharCode(65 + optIdx)}.</span>
                      <span>{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Section 4: Daily Interview Question */}
          {items?.interviewQuestion && (
            <div className="glass-panel p-6 rounded-2xl space-y-2 text-xs">
              <span className="font-bold text-main flex items-center gap-1.5">
                <Mic2 className="w-4 h-4 text-rose-400" />
                <span>Section 4: Placement Interview Question</span>
              </span>
              <p className="font-semibold text-main text-sm pt-1">{items.interviewQuestion.question}</p>
              <p className="text-muted text-[11px]">Reflect on this question before your upcoming mock rounds.</p>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={completeMutation.isPending}
            className="btn-primary w-full py-3.5 text-xs bg-gradient-to-r from-emerald-500 to-teal-500"
          >
            <span>{completeMutation.isPending ? 'Submitting...' : 'Complete Daily Challenge (+100 XP)'}</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Streak Milestone Celebration Modal */}
      <StreakMilestoneModal
        isOpen={Boolean(unlockedMilestone)}
        badge={unlockedMilestone}
        streak={unlockedMilestone?.currentStreak || 7}
        onClose={() => setUnlockedMilestone(null)}
      />
    </div>
  );
};

