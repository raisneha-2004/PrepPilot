import React from 'react';
import { RotateCcw, Brain, Clock, CheckCircle2 } from 'lucide-react';
import { BentoCard } from './BentoCard';

interface RevisionCardProps {
  dueCount?: number;
  totalCards?: number;
  retentionScore?: number;
  className?: string;
}

const previewFlashcards = [
  { id: 'f1', topic: 'Two Sum & HashMap Invariants', box: 2, interval: '3d' },
  { id: 'f2', topic: 'ACID Transactions & Isolation Levels', box: 1, interval: '1d' },
  { id: 'f3', topic: 'Binary Tree In-Order Iterative', box: 3, interval: '7d' }
];

export const RevisionCard: React.FC<RevisionCardProps> = ({
  dueCount = 5,
  totalCards = 38,
  retentionScore = 88,
  className = ''
}) => {
  return (
    <BentoCard
      title="Spaced Revision Queue"
      subtitle="Leitner SM-2 Active Recall"
      icon={RotateCcw}
      iconColor="text-emerald-400"
      delta={{ value: '88% retention', isPositive: true }}
      badge={{ text: `${dueCount} Due Today`, variant: 'emerald' }}
      actionText="Launch flashcard session (~10 min)"
      actionHref="/revision"
      className={className}
    >
      <div className="space-y-3">
        {/* Retention Banner */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
              Memory Decay Guard
            </span>
            <span className="text-xs font-bold text-main">
              {dueCount} Flashcards ready for review
            </span>
          </div>

          <div className="text-right">
            <span className="text-lg font-black font-heading text-emerald-300 tabular-nums">
              {retentionScore}%
            </span>
            <span className="text-[10px] text-muted block">Estimated Retention</span>
          </div>
        </div>

        {/* Due Cards Sample */}
        <div className="space-y-1.5">
          {previewFlashcards.map((card) => (
            <div
              key={card.id}
              className="flex items-center justify-between p-2 rounded-xl bg-surface border border-subtle/80 text-xs"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Brain className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <p className="font-medium text-main truncate">{card.topic}</p>
              </div>

              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface-subtle text-muted border border-subtle shrink-0">
                Box {card.box} • {card.interval}
              </span>
            </div>
          ))}
        </div>
      </div>
    </BentoCard>
  );
};
