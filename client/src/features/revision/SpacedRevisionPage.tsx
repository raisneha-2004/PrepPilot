import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import { revisionApi } from '../../lib/api/client';
import { ShimmerCard } from '../../components/ui/LoadingSkeleton';
import { useConfetti } from '../../hooks/useConfetti';
import { toast } from 'sonner';

export const SpacedRevisionPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { triggerConfetti } = useConfetti();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const { data: revisionData, isLoading } = useQuery({
    queryKey: ['todayRevision'],
    queryFn: revisionApi.getTodayDue
  });

  const recordMutation = useMutation({
    mutationFn: (payload: { topic: string; questionId?: string; isCorrect: boolean }) =>
      revisionApi.recordReview(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['todayRevision'] });
      queryClient.invalidateQueries({ queryKey: ['gamification'] });
      if (data.isCorrect) {
        toast.success(`Promoted to Box ${data.promotedToBox}! Next review in ${data.nextReviewInDays} days.`);
      } else {
        toast.info('Reset to Box 1 for review tomorrow.');
      }
    }
  });

  const questions = revisionData?.questions || [];
  const currentQ = questions[currentIndex];

  const handleAnswer = (isCorrect: boolean) => {
    if (!currentQ) return;

    recordMutation.mutate({
      topic: currentQ.topic,
      questionId: currentQ.id,
      isCorrect
    });

    if (currentIndex < questions.length - 1) {
      setIsFlipped(false);
      setCurrentIndex(currentIndex + 1);
    } else {
      setSessionCompleted(true);
      triggerConfetti();
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto py-8 space-y-6">
        <ShimmerCard className="h-28" />
        <ShimmerCard className="h-80" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6 space-y-6">
      {/* Top Header */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl gradient-border-glow space-y-3 text-center sm:text-left">
        <div className="flex items-center justify-center sm:justify-start gap-2 text-amber-400 text-xs font-semibold">
          <RotateCcw className="w-4 h-4" />
          <span>Leitner / SM-2 Spaced Repetition</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-heading text-main">
          Daily Placement Flashcards
        </h1>
        <p className="text-muted text-xs max-w-xl">
          Review 5 algorithm and CS concepts daily (~10 mins). Correct responses are scheduled further into the future to optimize long-term placement recall.
        </p>
      </div>

      {/* Leitner Box Schedule Guide */}
      <div className="grid grid-cols-5 gap-2 text-center text-xs">
        {[
          { box: 'Box 1', interval: '1 Day', color: 'border-rose-500/30 bg-rose-500/10 text-rose-300' },
          { box: 'Box 2', interval: '3 Days', color: 'border-amber-500/30 bg-amber-500/10 text-amber-300' },
          { box: 'Box 3', interval: '7 Days', color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300' },
          { box: 'Box 4', interval: '14 Days', color: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300' },
          { box: 'Box 5', interval: '30 Days', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' }
        ].map((b, i) => (
          <div key={i} className={`p-2 rounded-xl border ${b.color}`}>
            <span className="font-bold text-[10px] block">{b.box}</span>
            <span className="text-[10px] text-muted">{b.interval}</span>
          </div>
        ))}
      </div>

      {/* Active Flashcard */}
      {!sessionCompleted && currentQ && (
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs text-muted">
            <span>Card {currentIndex + 1} of {questions.length}</span>
            <span className="font-bold text-indigo-300">{currentQ.topic}</span>
          </div>

          <motion.div
            layout
            onClick={() => setIsFlipped(!isFlipped)}
            className="glass-panel p-8 min-h-[260px] rounded-3xl cursor-pointer flex flex-col justify-between space-y-4 border border-subtle hover:border-highlight transition-all select-none"
          >
            <div className="space-y-3">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-subtle text-muted uppercase">
                {isFlipped ? 'Answer & Explanation' : 'Question Prompt (Tap to flip)'}
              </span>

              <p className="text-base font-bold text-main leading-relaxed">
                {currentQ.question}
              </p>

              {!isFlipped ? (
                <div className="space-y-1.5 pt-2">
                  {currentQ.options?.map((opt: string, i: number) => (
                    <div key={i} className="p-2.5 rounded-xl bg-surface-subtle border border-subtle text-xs text-muted">
                      <span className="font-bold mr-1.5">{String.fromCharCode(65 + i)}.</span>
                      <span>{opt}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/25 space-y-1 text-xs">
                  <span className="font-bold text-indigo-300 block">Explanation:</span>
                  <p className="text-main leading-relaxed">
                    Reviewing the core invariant ensures you avoid standard edge case failures during technical rounds.
                  </p>
                </div>
              )}
            </div>

            <div className="text-center pt-2 text-[11px] text-muted">
              {isFlipped ? 'Rate your recall accuracy below:' : 'Tap card to reveal answer and explanation'}
            </div>
          </motion.div>

          {/* Action Buttons */}
          {isFlipped && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => handleAnswer(false)}
                className="btn-secondary py-3 text-xs border-rose-500/40 text-rose-300 hover:bg-rose-500/15"
              >
                <XCircle className="w-4 h-4 text-rose-400" />
                <span>Missed it (Reset Box 1)</span>
              </button>

              <button
                onClick={() => handleAnswer(true)}
                className="btn-primary py-3 text-xs bg-gradient-to-r from-emerald-500 to-teal-500"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Got it Right (+40 XP)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Session Completed State */}
      {sessionCompleted && (
        <div className="glass-panel p-8 text-center space-y-4 rounded-3xl">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <Award className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black font-heading text-main">
            Daily Spaced Revision Completed!
          </h2>
          <p className="text-xs text-muted max-w-sm mx-auto">
            Great job! You reviewed 5 placement flashcards today. Your next set of cards is scheduled for tomorrow.
          </p>
          <button
            onClick={() => {
              setSessionCompleted(false);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className="btn-primary px-6 py-2.5 text-xs mx-auto"
          >
            <span>Review Again</span>
          </button>
        </div>
      )}
    </div>
  );
};
