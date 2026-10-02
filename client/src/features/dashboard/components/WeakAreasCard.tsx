import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { BentoCard } from './BentoCard';

interface WeakAreaItem {
  id: string;
  topic: string;
  reason: string;
  accuracy: number;
  priority: 'High' | 'Medium' | 'Low';
  actionUrl: string;
}

interface WeakAreasCardProps {
  items?: WeakAreaItem[];
  className?: string;
}

const defaultWeakAreas: WeakAreaItem[] = [
  {
    id: 'w1',
    topic: 'Dynamic Programming — Knapsack',
    reason: '3 mistakes in the last 5 days',
    accuracy: 42,
    priority: 'High',
    actionUrl: '/dsa'
  },
  {
    id: 'w2',
    topic: 'OS: Mutex vs Semaphore',
    reason: '2 incorrect attempts in CS quiz',
    accuracy: 50,
    priority: 'High',
    actionUrl: '/cs'
  },
  {
    id: 'w3',
    topic: 'Aptitude: Probability & Bayes',
    reason: 'Low speed score (1.8m/q)',
    accuracy: 55,
    priority: 'Medium',
    actionUrl: '/aptitude'
  }
];

export const WeakAreasCard: React.FC<WeakAreasCardProps> = ({
  items = defaultWeakAreas,
  className = ''
}) => {
  return (
    <BentoCard
      title="Focus & Weak Spots"
      subtitle="Prioritized for high ROI"
      icon={AlertTriangle}
      iconColor="text-rose-400"
      badge={{ text: `${items.length} Needs Attention`, variant: 'rose' }}
      actionText="Open AI Coach diagnostic"
      actionHref="/coach"
      className={className}
    >
      <div className="space-y-2.5">
        {items.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-xs font-semibold text-main">No critical weak spots!</p>
            <p className="text-[11px] text-muted">Take more assessments to reveal precision weak areas.</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-2xl bg-surface border border-subtle hover:border-rose-500/30 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      item.priority === 'High' ? 'bg-rose-400' : 'bg-amber-400'
                    }`}
                  />
                  <p className="text-xs font-bold text-main truncate tracking-tight">
                    {item.topic}
                  </p>
                </div>
                <p className="text-[10px] text-rose-300/80 truncate">
                  {item.reason}
                </p>
              </div>

              <Link
                to={item.actionUrl}
                className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 transition-all shrink-0 flex items-center gap-1 group-hover:translate-x-0.5"
              >
                <span>Practice</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))
        )}
      </div>
    </BentoCard>
  );
};
