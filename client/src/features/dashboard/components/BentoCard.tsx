import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, RefreshCw, AlertCircle } from 'lucide-react';

export interface DeltaBadge {
  value: string;
  isPositive?: boolean;
  label?: string;
}

export interface BentoCardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  iconColor?: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
  delta?: DeltaBadge;
  badge?: {
    text: string;
    variant?: 'emerald' | 'indigo' | 'amber' | 'rose' | 'cyan';
  };
  className?: string;
  enableTilt?: boolean;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  children,
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-indigo-400',
  actionText,
  actionHref,
  onAction,
  delta,
  badge,
  className = '',
  enableTilt = false,
  isLoading = false,
  error = null,
  onRetry
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [canHover, setCanHover] = useState(false);

  // Mouse tilt variables
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-120, 120], [4, -4]), { stiffness: 250, damping: 25 });
  const rotateY = useSpring(useTransform(mouseX, [-120, 120], [-4, 4]), { stiffness: 250, damping: 25 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(hover: hover) and (pointer: fine)');
      setCanHover(media.matches);
    }
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canHover || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (enableTilt) {
      mouseX.set(x - rect.width / 2);
      mouseY.set(y - rect.height / 2);
    }

    cardRef.current.style.setProperty('--spotlight-x', `${x}px`);
    cardRef.current.style.setProperty('--spotlight-y', `${y}px`);
  };

  const handlePointerLeave = () => {
    if (!canHover) return;
    if (enableTilt) {
      mouseX.set(0);
      mouseY.set(0);
    }
  };

  const getBadgeClass = (variant = 'indigo') => {
    switch (variant) {
      case 'emerald':
        return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300';
      case 'amber':
        return 'bg-amber-500/15 border-amber-500/30 text-amber-300';
      case 'rose':
        return 'bg-rose-500/15 border-rose-500/30 text-rose-300';
      case 'cyan':
        return 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300';
      case 'indigo':
      default:
        return 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300';
    }
  };

  return (
    <motion.div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      style={{
        rotateX: enableTilt && canHover ? rotateX : 0,
        rotateY: enableTilt && canHover ? rotateY : 0,
        transformStyle: 'preserve-3d',
        perspective: 1000
      }}
      className={`glass-panel p-6 flex flex-col justify-between relative overflow-hidden rounded-[24px] border border-subtle transition-all duration-300 hover:border-highlight hover:shadow-xl hover:shadow-indigo-500/5 group @container ${className}`}
    >
      {/* Dynamic Cursor Spotlight */}
      {canHover && (
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(400px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), rgba(99, 102, 241, 0.07), transparent 80%)'
          }}
        />
      )}

      {/* Header if Title or Icons are provided */}
      {(title || Icon || badge || delta) && (
        <div className="flex items-start justify-between gap-3 border-b border-subtle/70 pb-3 mb-4 relative z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <div className={`p-2 rounded-xl bg-surface border border-subtle shrink-0 ${iconColor}`}>
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <h2 className="text-sm font-bold font-heading text-main truncate tracking-tight">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-[11px] text-muted truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {delta && (
              <span
                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold font-heading tabular-nums border ${
                  delta.isPositive !== false
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                {delta.isPositive !== false ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                <span>{delta.value}</span>
                {delta.label && <span className="text-muted/80 font-normal ml-0.5">{delta.label}</span>}
              </span>
            )}

            {badge && (
              <span
                className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${getBadgeClass(
                  badge.variant
                )}`}
              >
                {badge.text}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Card Content / Loading / Error State */}
      <div className="flex-1 relative z-10 flex flex-col justify-between">
        {isLoading ? (
          <div className="space-y-3 py-4 animate-pulse">
            <div className="h-4 bg-surface-subtle rounded-md w-3/4" />
            <div className="h-16 bg-surface-subtle rounded-xl w-full" />
            <div className="h-4 bg-surface-subtle rounded-md w-1/2" />
          </div>
        ) : error ? (
          <div className="py-6 flex flex-col items-center justify-center text-center space-y-2.5">
            <AlertCircle className="w-6 h-6 text-rose-400" />
            <p className="text-xs text-rose-300 font-medium">{error}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-surface border border-subtle text-main hover:bg-surface-elevated transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            )}
          </div>
        ) : (
          children
        )}
      </div>

      {/* Footer Clear Action Link if provided */}
      {actionText && (
        <div className="pt-3.5 mt-3.5 border-t border-subtle/70 flex items-center justify-between text-xs relative z-10">
          {actionHref ? (
            <a
              href={actionHref}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 transition-colors group-hover:translate-x-0.5 duration-200"
            >
              <span>{actionText}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          ) : (
            <button
              onClick={onAction}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 transition-colors"
            >
              <span>{actionText}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};
