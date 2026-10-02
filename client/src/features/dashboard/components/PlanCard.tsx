import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, CheckCircle2, Circle, Clock, ArrowRight, BookOpen, Code, CheckSquare, RotateCcw } from 'lucide-react';
import { BentoCard } from './BentoCard';

interface PlanBlock {
  id: string;
  type: 'Learn' | 'Practice' | 'Quiz' | 'Revision';
  title: string;
  durationMinutes: number;
  completed: boolean;
}

interface PlanCardProps {
  dayNumber?: number;
  focusTopic?: string;
  totalMinutes?: number;
  completedMinutes?: number;
  blocks?: PlanBlock[];
  className?: string;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  dayNumber = 4,
  focusTopic = 'Arrays & Two Pointers',
  totalMinutes = 180,
  completedMinutes = 120,
  blocks = [
    { id: 'b1', type: 'Learn', title: 'Two-Pointer Technique & Sliding Window Foundations', durationMinutes: 45, completed: true },
    { id: 'b2', type: 'Practice', title: 'Solve Container With Most Water & 3Sum', durationMinutes: 75, completed: true },
    { id: 'b3', type: 'Quiz', title: 'Speed Checkpoint: 5 Time Complexity MCQs', durationMinutes: 30, completed: false },
    { id: 'b4', type: 'Revision', title: 'Review 5 Spaced Repetition Flashcards', durationMinutes: 30, completed: false }
  ],
  className = ''
}) => {
  const [taskList, setTaskList] = useState<PlanBlock[]>(blocks);

  const toggleTask = (id: string) => {
    setTaskList((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const completedCount = taskList.filter((t) => t.completed).length;
  const progressPct = Math.round((completedCount / taskList.length) * 100);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Learn':
        return <BookOpen className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Practice':
        return <Code className="w-3.5 h-3.5 text-indigo-400" />;
      case 'Quiz':
        return <CheckSquare className="w-3.5 h-3.5 text-amber-400" />;
      case 'Revision':
      default:
        return <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <BentoCard
      title={`Day ${dayNumber} Plan`}
      subtitle={focusTopic}
      icon={CalendarDays}
      iconColor="text-cyan-400"
      delta={{ value: `+${completedCount}/${taskList.length} done`, isPositive: true }}
      badge={{ text: 'Personalized', variant: 'cyan' }}
      actionText="View full 14-day roadmap"
      actionHref="/planner"
      className={className}
    >
      <div className="space-y-4">
        {/* Progress Bar & Time */}
        <div className="space-y-1.5 bg-surface-subtle p-3 rounded-2xl border border-subtle">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-main flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{completedMinutes} / {totalMinutes} mins target</span>
            </span>
            <span className="font-bold text-cyan-300 tabular-nums">
              {progressPct}% Completed
            </span>
          </div>
          <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-subtle">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Interactive Task Blocks */}
        <div className="space-y-2">
          {taskList.map((block) => (
            <div
              key={block.id}
              onClick={() => toggleTask(block.id)}
              className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                block.completed
                  ? 'bg-surface/60 border-subtle text-muted'
                  : 'bg-surface border-subtle/80 hover:border-highlight text-main shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  aria-label={block.completed ? 'Mark incomplete' : 'Mark complete'}
                  className="shrink-0 text-muted hover:text-emerald-400 transition-colors"
                >
                  {block.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 fill-emerald-500/20" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted/60" />
                  )}
                </button>
                <div className="min-w-0">
                  <p
                    className={`text-xs font-medium truncate ${
                      block.completed ? 'line-through text-muted' : 'text-main'
                    }`}
                  >
                    {block.title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-2">
                <div className="p-1 rounded-md bg-surface-subtle">
                  {getTypeIcon(block.type)}
                </div>
                <span className="text-[11px] font-semibold text-muted tabular-nums">
                  {block.durationMinutes}m
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </BentoCard>
  );
};
