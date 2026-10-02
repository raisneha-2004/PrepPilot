import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export interface MetricItem {
  key: string;
  label: string;
  score: number;
  weight?: number;
  metric?: string;
  status?: string;
}

export interface ReadinessRingProps {
  score?: number;
  size?: number;
  strokeWidth?: number;
  showBreakdown?: boolean;
  breakdown?: Record<string, any>;
  title?: string;
  disclaimer?: string;
  className?: string;
}

// Ease out cubic helper
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Hook to smoothly animate number from previous value to new value via requestAnimationFrame
 */
const useAnimatedScore = (targetVal: number, duration = 1600, isStarted = false) => {
  const [displayVal, setDisplayVal] = useState(0);
  const prevValRef = useRef(0);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isStarted) return;

    const startVal = prevValRef.current;
    const endVal = Math.round(targetVal);
    const startTime = performance.now();

    const updateScore = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = Math.round(startVal + (endVal - startVal) * eased);
      setDisplayVal(current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(updateScore);
      } else {
        prevValRef.current = endVal;
      }
    };

    animRef.current = requestAnimationFrame(updateScore);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [targetVal, duration, isStarted]);

  return displayVal;
};

/**
 * Individual Metric Row with staggered slide-in, scaleX bar fill, and synchronized number counter
 */
const MetricRow: React.FC<{
  metric: MetricItem;
  index: number;
  isStarted: boolean;
}> = ({ metric, index, isStarted }) => {
  const isInterview = metric.key.toLowerCase().includes('interview');
  const animatedScore = useAnimatedScore(metric.score, 1200, isStarted);

  // Colors: Indigo for Interview, Emerald for others
  const barColor = isInterview ? 'oklch(0.65 0.24 275)' : 'oklch(0.75 0.19 155)';
  const glowColor = isInterview
    ? 'rgba(99, 102, 241, 0.45)'
    : 'rgba(16, 185, 129, 0.45)';

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={isStarted ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
      transition={{
        duration: 0.5,
        delay: 0.2 + index * 0.12,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="flex items-center justify-between py-1.5 text-xs group"
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="w-1.5 h-1.5 rounded-full shrink-0"
          style={{ backgroundColor: barColor }}
        />
        <span className="font-medium text-main text-xs truncate">
          {metric.label}
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Progress Track */}
        <div className="w-24 sm:w-28 h-2 bg-surface rounded-full overflow-hidden border border-subtle p-[1px] relative">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isStarted ? Math.max(0, Math.min(1, metric.score / 100)) : 0 }}
            transition={{
              duration: 1.4,
              delay: 0.25 + index * 0.12,
              ease: [0.22, 1, 0.36, 1]
            }}
            style={{
              transformOrigin: 'left',
              backgroundColor: barColor,
              boxShadow: `0 0 8px ${glowColor}`
            }}
            className="h-full w-full rounded-full"
          />
        </div>

        {/* Tabular Score */}
        <span className="font-bold text-main font-heading w-8 text-right tabular-nums text-xs">
          {animatedScore}%
        </span>
      </div>
    </motion.div>
  );
};

export const ReadinessRing: React.FC<ReadinessRingProps> = ({
  score = 78,
  size = 175,
  strokeWidth = 14,
  showBreakdown = true,
  breakdown,
  title = 'Placement Readiness Index',
  disclaimer,
  className = ''
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [canHover, setCanHover] = useState(false);

  // Pointer spotlight coordinates
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-150, 150], [6, -6]), {
    stiffness: 220,
    damping: 20
  });
  const rotateY = useSpring(useTransform(mouseX, [-150, 150], [-6, 6]), {
    stiffness: 220,
    damping: 20
  });

  // Check hover capability on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia('(hover: hover) and (pointer: fine)');
      setCanHover(media.matches);
      const listener = (e: MediaQueryListEvent) => setCanHover(e.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, []);

  // IntersectionObserver to trigger animations when entering viewport (threshold: ~0.35, once)
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Animated Score via requestAnimationFrame
  const animatedScore = useAnimatedScore(score, 1600, isInView);

  // SVG Calculations
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // Rotate -90deg so 0 starts from 12 o'clock
  const strokeDashoffset = circumference - ((isInView ? score : 0) / 100) * circumference;

  // Normalized Metric Breakdown with Capitalized "DSA"
  const formattedMetrics: MetricItem[] = useMemo(() => {
    if (breakdown && Object.keys(breakdown).length > 0) {
      return Object.entries(breakdown).map(([key, item]) => {
        let label = key;
        if (key.toLowerCase() === 'dsa') label = 'DSA';
        else if (key === 'csCore') label = 'CS Core';
        else if (key.toLowerCase() === 'aptitude') label = 'Aptitude';
        else if (key.toLowerCase() === 'interview') label = 'Interview';
        else if (key.toLowerCase() === 'consistency') label = 'Consistency';
        else {
          label = key.charAt(0).toUpperCase() + key.slice(1);
        }

        return {
          key,
          label,
          score: typeof item === 'number' ? item : item.score ?? 0,
          weight: item.weight,
          metric: item.metric,
          status: item.status
        };
      });
    }

    // Default fallback breakdown metrics matching placement weights
    return [
      { key: 'dsa', label: 'DSA', score: 85 },
      { key: 'aptitude', label: 'Aptitude', score: 75 },
      { key: 'csCore', label: 'CS Core', score: 80 },
      { key: 'interview', label: 'Interview', score: 70 },
      { key: 'consistency', label: 'Consistency', score: 90 }
    ];
  }, [breakdown]);

  // Pointer interactions for 3D tilt & spotlight
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canHover || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    mouseX.set(x);
    mouseY.set(y);

    cardRef.current.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    cardRef.current.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  };

  const handlePointerLeave = () => {
    if (!canHover) return;
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={
        isInView
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: 16, scale: 0.98 }
      }
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      style={{
        rotateX: canHover ? rotateX : 0,
        rotateY: canHover ? rotateY : 0,
        transformStyle: 'preserve-3d',
        perspective: 1000
      }}
      className={`glass-panel p-6 flex flex-col justify-between relative overflow-hidden rounded-3xl border border-subtle transition-shadow duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 ${className}`}
    >
      {/* 1. Spotlight Glow following cursor (active on fine pointer) */}
      {canHover && (
        <div
          className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          style={{
            background:
              'radial-gradient(380px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(16, 185, 129, 0.08), transparent 75%)'
          }}
        />
      )}

      {/* 2. One-time Diagonal Shimmer Sweep across card when it appears */}
      {isInView && (
        <motion.div
          initial={{ x: '-150%', y: '-150%', opacity: 0.7 }}
          animate={{ x: '200%', y: '200%', opacity: 0 }}
          transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="absolute inset-0 pointer-events-none bg-gradient-to-br from-transparent via-white/12 to-transparent transform -rotate-12 z-20"
        />
      )}

      {/* Card Header with Pulsing Ping Status Dot */}
      <div className="flex items-center justify-between border-b border-subtle pb-3 relative z-10">
        <div className="flex items-center gap-2.5">
          {/* Status Dot with Ambient Pulsing Ping */}
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </span>

          <span className="text-xs font-bold font-heading text-main tracking-tight">
            {title}
          </span>
        </div>

        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
          Live Tracker
        </span>
      </div>

      {/* Circular Ring Container */}
      <div className="flex flex-col items-center justify-center relative my-4 z-10">
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          {/* 3. Ambient Motion: Slow Breathing Radial Glow behind the ring */}
          <motion.div
            animate={{
              scale: [1, 1.12, 1],
              opacity: [0.3, 0.48, 0.3]
            }}
            transition={{
              duration: 3.6,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute inset-2 rounded-full blur-xl pointer-events-none bg-emerald-500/30"
          />

          {/* SVG Circular Progress */}
          <svg
            width={size}
            height={size}
            className="transform -rotate-90 origin-center"
            style={{ overflow: 'visible' }}
          >
            {/* Background Track Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="var(--border-subtle)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Dynamic Progress Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="oklch(0.75 0.19 155)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              style={{
                filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.55))',
                transition: 'stroke-dashoffset 1.8s cubic-bezier(0.22, 1, 0.36, 1)'
              }}
            />
          </svg>

          {/* Center Score Number Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
            <div className="flex items-baseline justify-center">
              <span className="text-4xl font-black tracking-tight font-heading text-main tabular-nums">
                {animatedScore}
              </span>
              <span className="text-sm font-bold text-emerald-400 ml-0.5">%</span>
            </div>
            <span className="text-[10px] font-bold text-muted tracking-widest uppercase mt-0.5">
              READINESS
            </span>
          </div>
        </div>
      </div>

      {/* Metric Breakdown Rows */}
      {showBreakdown && (
        <div className="w-full space-y-1 relative z-10 pt-1 border-t border-subtle">
          {/* Renamed Column Header */}
          <div className="flex justify-between items-center text-[10px] font-bold tracking-wider text-muted uppercase pb-1.5 pt-1 border-b border-subtle/60">
            <span>METRIC</span>
            <span>SCORE</span>
          </div>

          <div className="space-y-0.5 pt-1">
            {formattedMetrics.map((metric, idx) => (
              <MetricRow
                key={metric.key}
                metric={metric}
                index={idx}
                isStarted={isInView}
              />
            ))}
          </div>
        </div>
      )}

      {/* Footer Disclaimer */}
      <p className="text-[10px] text-muted leading-relaxed border-t border-subtle pt-3 mt-3 text-center relative z-10">
        {disclaimer ||
          'Descriptive score of tracked preparation metrics only. Never presented as a selection probability.'}
      </p>
    </motion.div>
  );
};
