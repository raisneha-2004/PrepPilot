import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Code2, Clock, CheckCircle2 } from 'lucide-react';

interface ContinueCardProps {
  topic?: string;
  subtopic?: string;
  questionsLeft?: number;
  estimatedMinutes?: number;
  progressPercent?: number;
  targetHref?: string;
  className?: string;
}

export const ContinueCard: React.FC<ContinueCardProps> = ({
  topic = 'Data Structures & Algorithms',
  subtopic = 'Arrays: Two Pointers — Container With Most Water',
  questionsLeft = 3,
  estimatedMinutes = 45,
  progressPercent = 65,
  targetHref = '/dsa',
  className = ''
}) => {
  return (
    <div className={`relative overflow-hidden rounded-[24px] p-6 glass-card border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-surface to-surface-elevated shadow-xl shadow-indigo-950/20 ${className}`}>
      {/* Aurora spotlight shimmer background */}
      <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-indigo-500/10 via-cyan-500/5 to-transparent pointer-events-none" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
        <div className="space-y-2 max-w-2xl">
          {/* Tag Pill */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 border border-indigo-500/40 text-indigo-300">
              <Code2 className="w-3.5 h-3.5" />
              <span>Continue Where You Left Off</span>
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>~{estimatedMinutes} mins remaining</span>
            </span>
          </div>

          {/* Heading */}
          <div>
            <h2 className="text-lg sm:text-xl font-black font-heading text-main tracking-tight">
              {subtopic}
            </h2>
            <p className="text-xs text-muted mt-0.5">
              {topic} • <span className="text-indigo-300 font-semibold">{questionsLeft} questions left</span> to complete today's placement practice block.
            </p>
          </div>

          {/* Inline Micro Progress */}
          <div className="flex items-center gap-3 pt-1">
            <div className="w-36 sm:w-48 h-2 bg-surface-subtle rounded-full overflow-hidden border border-subtle relative">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-xs font-bold text-main tabular-nums">
              {progressPercent}% Done
            </span>
          </div>
        </div>

        {/* Primary Action Button */}
        <Link to={targetHref} className="w-full md:w-auto shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-primary w-full md:w-auto px-6 py-3 text-xs sm:text-sm font-bold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Resume Practice</span>
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </Link>
      </div>
    </div>
  );
};
