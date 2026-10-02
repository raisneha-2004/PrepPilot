import React from 'react';
import { Mic2, Play, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { BentoCard } from './BentoCard';

interface ActivityItem {
  id: string;
  title: string;
  timeAgo: string;
  type: 'interview' | 'dsa' | 'quiz';
}

const recentActivities: ActivityItem[] = [
  { id: 'a1', title: 'Solved Two Sum (O(N) Optimal)', timeAgo: '2 hours ago', type: 'dsa' },
  { id: 'a2', title: 'Completed OS Concurrency Quiz (80%)', timeAgo: 'Yesterday', type: 'quiz' },
  { id: 'a3', title: 'Completed SDE Mock Interview #3', timeAgo: '2 days ago', type: 'interview' }
];

export const ActivityTimeline: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <BentoCard
      title="Mock Interview & Activity"
      subtitle="AI Voice & Verification Stream"
      icon={Mic2}
      iconColor="text-indigo-400"
      badge={{ text: 'Voice AI Ready', variant: 'indigo' }}
      actionText="Start AI Mock Interview session"
      actionHref="/interview"
      className={className}
    >
      <div className="space-y-3">
        {/* Next Recommended Session Spotlight */}
        <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Recommended Next Step</span>
            </span>
            <span className="text-[10px] text-muted flex items-center gap-1">
              <Clock className="w-3 h-3 text-indigo-300" />
              <span>~25 min</span>
            </span>
          </div>

          <div>
            <h4 className="text-xs font-bold text-main">
              SDE Full-Stack Behavioral + System Design
            </h4>
            <p className="text-[11px] text-muted mt-0.5">
              Live conversational AI with speech synthesis and instant feedback report.
            </p>
          </div>
        </div>

        {/* Timeline Items */}
        <div className="space-y-1.5 border-t border-subtle/80 pt-2">
          <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
            Recent Timeline
          </span>

          {recentActivities.map((act) => (
            <div
              key={act.id}
              className="flex items-center justify-between p-1.5 text-xs text-muted hover:text-main transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate text-xs font-medium text-main">{act.title}</span>
              </div>
              <span className="text-[10px] text-muted shrink-0 tabular-nums ml-2">
                {act.timeAgo}
              </span>
            </div>
          ))}
        </div>
      </div>
    </BentoCard>
  );
};
