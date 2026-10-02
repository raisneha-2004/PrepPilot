import React, { useEffect, useRef } from 'react';
import { Award, Flame, X, Sparkles } from 'lucide-react';
import { useConfetti } from '../../hooks/useConfetti';

export interface MilestoneBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier?: string;
}

interface StreakMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  badge: MilestoneBadge | null;
  streak: number;
}

export const StreakMilestoneModal: React.FC<StreakMilestoneModalProps> = ({
  isOpen,
  onClose,
  badge,
  streak
}) => {
  const { triggerStars, triggerConfetti } = useConfetti();
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !badge) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      triggerStars();
      setTimeout(triggerConfetti, 300);
    }

    // Auto-focus action button
    const timer = setTimeout(() => {
      primaryButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, badge]);

  if (!isOpen || !badge) return null;

  const tierColors: Record<string, { bg: string; border: string; text: string; glow: string }> = {
    Bronze: {
      bg: 'bg-amber-950/40',
      border: 'border-amber-600/40',
      text: 'text-amber-400',
      glow: 'shadow-[0_0_30px_rgba(217,119,6,0.3)]'
    },
    Silver: {
      bg: 'bg-slate-800/60',
      border: 'border-slate-400/40',
      text: 'text-slate-200',
      glow: 'shadow-[0_0_30px_rgba(203,213,225,0.3)]'
    },
    Gold: {
      bg: 'bg-yellow-950/40',
      border: 'border-yellow-500/40',
      text: 'text-yellow-400',
      glow: 'shadow-[0_0_35px_rgba(234,179,8,0.35)]'
    },
    Platinum: {
      bg: 'bg-cyan-950/40',
      border: 'border-cyan-400/40',
      text: 'text-cyan-300',
      glow: 'shadow-[0_0_35px_rgba(6,182,212,0.35)]'
    },
    Diamond: {
      bg: 'bg-indigo-950/40',
      border: 'border-indigo-400/40',
      text: 'text-indigo-300',
      glow: 'shadow-[0_0_40px_rgba(99,102,241,0.4)]'
    },
    Master: {
      bg: 'bg-purple-950/40',
      border: 'border-purple-400/40',
      text: 'text-purple-300',
      glow: 'shadow-[0_0_40px_rgba(168,85,247,0.45)]'
    }
  };

  const style = (badge.tier && tierColors[badge.tier]) || tierColors.Silver;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="milestone-title"
      aria-describedby="milestone-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md rounded-3xl border border-white/15 bg-[#0d1222]/95 backdrop-blur-2xl p-6 sm:p-8 text-center shadow-2xl overflow-hidden motion-safe:animate-scale-in"
      >
        {/* Glow ambient background effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close milestone celebration"
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Milestone Flame & Badge Visual */}
        <div className="mx-auto w-24 h-24 mb-4 relative flex items-center justify-center">
          <div
            className={`w-20 h-20 rounded-2xl ${style.bg} border-2 ${style.border} ${style.glow} flex items-center justify-center text-4xl shadow-inner transition-transform duration-300 motion-safe:hover:scale-105`}
          >
            {badge.icon}
          </div>
          <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-amber-500 text-black shadow-lg">
            <Flame className="w-4 h-4 fill-black" />
          </div>
        </div>

        {/* Tier & Streak header */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 border border-white/10 mb-3 text-amber-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{badge.tier || 'Milestone'} Tier • {streak}-Day Streak</span>
        </div>

        <h3
          id="milestone-title"
          className="text-2xl sm:text-3xl font-extrabold font-heading text-white mb-2"
        >
          🔥 {badge.name} Unlocked!
        </h3>

        <p
          id="milestone-desc"
          className="text-sm text-slate-300 mb-6 leading-relaxed"
        >
          {badge.description}. Keep showing up every day to build unstoppable placement momentum!
        </p>

        {/* Rewards pill */}
        <div className="bg-white/[0.04] border border-white/10 rounded-xl p-3.5 mb-6 flex items-center justify-around text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Badge Tier</span>
            <span className={`font-bold ${style.text}`}>{badge.tier || 'Special'}</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <span className="text-slate-400 block text-[11px]">Bonus Freeze</span>
            <span className="font-bold text-emerald-400">+1 Streak Shield</span>
          </div>
          <div className="w-px h-8 bg-white/10" />
          <div>
            <span className="text-slate-400 block text-[11px]">Habit Score</span>
            <span className="font-bold text-cyan-300">Top 5%</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          ref={primaryButtonRef}
          onClick={onClose}
          aria-label="Continue preparation"
          className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-500 hover:from-indigo-600 hover:via-violet-600 hover:to-cyan-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
        >
          Keep Crushing It
        </button>
      </div>
    </div>
  );
};
