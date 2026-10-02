import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Code2,
  HelpCircle,
  RotateCcw,
  Clock,
  RefreshCw,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { plannerApi } from '../../lib/api/client';
import { useAppStore } from '../../store/useAppStore';
import { ShimmerCard } from '../../components/ui/LoadingSkeleton';
import { useConfetti } from '../../hooks/useConfetti';
import { toast } from 'sonner';

export const StudyPlannerPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { profile } = useAppStore();
  const { triggerConfetti } = useConfetti();
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  const { data: plan, isLoading } = useQuery({
    queryKey: ['studyPlan'],
    queryFn: plannerApi.getPlan
  });

  const regenerateMutation = useMutation({
    mutationFn: () =>
      plannerApi.generatePlan({
        targetRole: profile.targetRole,
        experienceLevel: profile.experienceLevel,
        dailyHours: profile.dailyHours,
        preferredLanguage: profile.preferredLanguage
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyPlan'] });
      triggerConfetti();
      toast.success('Generated fresh adaptive placement roadmap!');
    },
    onError: () => toast.error('Failed to regenerate plan from server. Using offline roadmap.')
  });

  const toggleDayMutation = useMutation({
    mutationFn: ({ dayId, completed }: { dayId: string; completed: boolean }) =>
      plannerApi.updateDay(dayId, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['studyPlan'] });
      toast.success('Day status updated!');
    }
  });

  if (isLoading || regenerateMutation.isPending) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-6">
        <ShimmerCard className="h-28" />
        <ShimmerCard className="h-32" />
        <ShimmerCard className="h-32" />
        <ShimmerCard className="h-32" />
      </div>
    );
  }

  const days = plan?.days || [];
  const completedCount = days.filter((d: any) => d.completed).length;
  const progressPercent = Math.round((completedCount / (days.length || 1)) * 100);

  const getBlockIcon = (type: string) => {
    switch (type) {
      case 'Learn': return <BookOpen className="w-4 h-4 text-indigo-400" />;
      case 'Practice': return <Code2 className="w-4 h-4 text-cyan-400" />;
      case 'Quiz': return <HelpCircle className="w-4 h-4 text-amber-400" />;
      case 'Revision': return <RotateCcw className="w-4 h-4 text-rose-400" />;
      default: return <Clock className="w-4 h-4 text-muted" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Top Banner */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl gradient-border-glow space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
              <CalendarDays className="w-4 h-4" />
              <span>Personalized {days.length}-Day Placement Roadmap</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading text-main">
              Day-Wise Preparation Curriculum
            </h1>
            <p className="text-muted text-xs max-w-xl">
              {plan?.summary || 'Structured daily roadmap balancing conceptual foundations, algorithmic coding, quizzes, and spaced review.'}
            </p>
          </div>

          <button
            onClick={() => regenerateMutation.mutate()}
            disabled={regenerateMutation.isPending}
            className="btn-secondary text-xs px-4 py-2.5 self-start sm:self-auto shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${regenerateMutation.isPending ? 'animate-spin' : ''}`} />
            <span>Regenerate Roadmap</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="pt-2 space-y-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted font-medium">Roadmap Progress</span>
            <span className="font-bold text-indigo-300">{completedCount} of {days.length} Days Completed ({progressPercent}%)</span>
          </div>
          <div className="w-full h-2 bg-surface-subtle rounded-full overflow-hidden border border-subtle">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Days Timeline */}
      <div className="space-y-4">
        {days.map((day: any) => {
          const isExpanded = expandedDay === day.dayNumber;
          return (
            <motion.div
              key={day.id || day.dayNumber}
              layout
              className={`glass-card rounded-2xl overflow-hidden transition-all border ${
                day.completed
                  ? 'border-emerald-500/30 bg-emerald-950/5'
                  : 'border-subtle hover:border-highlight'
              }`}
            >
              {/* Day Header Accordion Toggle */}
              <div
                onClick={() => setExpandedDay(isExpanded ? null : day.dayNumber)}
                className="p-5 flex items-center justify-between cursor-pointer select-none gap-4"
              >
                <div className="flex items-center gap-4">
                  {/* Completion Toggle */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDayMutation.mutate({
                        dayId: day.id || `day_${day.dayNumber}`,
                        completed: !day.completed
                      });
                    }}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center border transition-all ${
                      day.completed
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                        : 'border-subtle bg-surface-subtle text-muted hover:border-emerald-400'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-400">
                        Day {day.dayNumber}
                      </span>
                      <span className="text-xs text-muted">•</span>
                      <span className="text-xs text-muted">{day.estimatedMinutes || 180} mins</span>
                    </div>
                    <h3 className={`text-base font-bold font-heading ${day.completed ? 'line-through text-muted' : 'text-main'}`}>
                      {day.focusTopic}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="hidden sm:inline-flex text-[11px] font-semibold px-2.5 py-1 rounded-full bg-surface-subtle border border-subtle text-muted">
                    {day.blocks?.length || 4} Blocks
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted" /> : <ChevronDown className="w-4 h-4 text-muted" />}
                </div>
              </div>

              {/* Day 4 Blocks Details */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-subtle space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(day.blocks || []).map((block: any, bIdx: number) => (
                      <div
                        key={bIdx}
                        className="p-4 rounded-xl bg-surface-subtle border border-subtle space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-bold text-main">
                            {getBlockIcon(block.type)}
                            <span>{block.type}: {block.title}</span>
                          </div>
                          <span className="text-[10px] text-muted font-mono">{block.durationMinutes}m</span>
                        </div>
                        <p className="text-muted text-[11px] leading-relaxed">
                          {block.description}
                        </p>
                        {block.problems && block.problems.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {block.problems.map((p: string, pIdx: number) => (
                              <span key={pIdx} className="px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[10px] font-mono">
                                💻 {p}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
