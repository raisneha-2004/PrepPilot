import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export interface LogoProps {
  className?: string;
  showText?: boolean;
  showSubtitle?: boolean;
  collapsed?: boolean;
  linkTo?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  showText = true,
  showSubtitle = true,
  collapsed = false,
  linkTo = '/',
  size = 'md'
}) => {
  const isSmall = size === 'sm';
  const isLarge = size === 'lg';

  const containerSize = isSmall ? 'w-8 h-8' : isLarge ? 'w-11 h-11' : 'w-10 h-10';
  const iconSize = isSmall ? 'w-4 h-4' : isLarge ? 'w-6 h-6' : 'w-[22px] h-[22px]';
  const titleSize = isSmall ? 'text-sm' : isLarge ? 'text-xl' : 'text-lg';
  const subtitleSize = isSmall ? 'text-[9px]' : 'text-xs';

  const logoContent = (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Hidden SVG Definition for Gradient Stroke */}
      <svg className="w-0 h-0 absolute pointer-events-none" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="preppilot-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
      </svg>

      {/* 40x40px Icon Container with Indigo/Cyan Gradient, Border, and Soft Glow */}
      <div
        className={`${containerSize} rounded-xl bg-gradient-to-br from-indigo-500/25 to-cyan-500/15 border border-indigo-400/40 shadow-[0_0_18px_-4px_rgba(99,102,241,0.5)] group-hover:shadow-[0_0_24px_-2px_rgba(99,102,241,0.7)] group-hover:border-indigo-400/60 transition-all duration-200 flex items-center justify-center shrink-0 relative`}
      >
        {/* Single Clean GraduationCap Icon with Indigo-Cyan Stroke & Hover Animation */}
        <GraduationCap
          stroke="url(#preppilot-logo-gradient)"
          strokeWidth={2.2}
          className={`${iconSize} text-indigo-300 group-hover:rotate-[5deg] group-hover:scale-105 motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100 transition-transform duration-200 ease-out shrink-0 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]`}
          aria-hidden="true"
        />
      </div>

      {/* Brand Text Content */}
      {showText && !collapsed && (
        <div className="flex flex-col min-w-0">
          <span
            className={`font-heading font-extrabold ${titleSize} tracking-tight bg-gradient-to-r from-white via-indigo-100 to-indigo-200 bg-clip-text text-transparent flex items-center gap-1.5 leading-tight`}
          >
            PrepPilot
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-md text-[10px] px-1.5 py-0.5 font-bold tracking-wide">
              AI
            </span>
          </span>
          {showSubtitle && (
            <span className={`${subtitleSize} text-slate-400 font-medium -mt-0.5 truncate`}>
              Placement Coach
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} aria-label="PrepPilot home" className="inline-flex items-center">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
};
