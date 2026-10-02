import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface SidebarItemProps {
  to: string;
  label: string;
  icon: LucideIcon;
  accent: string;
  badge?: string;
  isCollapsed?: boolean;
  onNavigate?: () => void;
  index?: number;
}

export const SidebarItem: React.FC<SidebarItemProps> = ({
  to,
  label,
  icon: Icon,
  accent,
  badge,
  isCollapsed = false,
  onNavigate,
  index = 0
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const isLive = badge === 'Live';

  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ '--accent': accent } as React.CSSProperties}
      className={({ isActive }) =>
        `sidebar-item group relative flex items-center ${
          isCollapsed ? 'justify-center px-0 py-2.5 mx-auto w-11' : 'px-3 py-2.5'
        } rounded-2xl transition-all duration-200 select-none min-h-[44px] ${
          isActive ? 'sidebar-item-active text-main font-semibold' : 'text-muted hover:text-main'
        }`
      }
    >
      {({ isActive }) => (
        <>
          {/* Framer Motion Active Glass Sliding Pill */}
          {isActive && (
            <motion.div
              layoutId="sidebar-active-pill"
              className="sidebar-active-pill"
              transition={{
                type: 'spring',
                stiffness: 380,
                damping: 32,
                mass: 0.8
              }}
            >
              <div className="sidebar-active-indicator" />
            </motion.div>
          )}

          {/* Icon Tile */}
          <div className="sidebar-icon-tile z-10 relative">
            <Icon className="w-4 h-4" />
            {/* If collapsed and has badge, show small dot indicator on tile */}
            {isCollapsed && badge && (
              <span
                className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${
                  isLive ? 'bg-emerald-400' : 'bg-indigo-400'
                } border-2 border-base ring-1 ring-white/20`}
              />
            )}
          </div>

          {/* Label and Badge (When Expanded) */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-between flex-1 ml-3 z-10 overflow-hidden"
              >
                <span className="text-xs sm:text-sm font-medium tracking-tight truncate">
                  {label}
                </span>

                {/* Badges */}
                {badge && (
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {isLive ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        <span className="relative flex h-2 w-2">
                          <span className="live-dot-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                        </span>
                        <span>LIVE</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-surface-subtle text-muted/90 border border-subtle">
                        {badge}
                      </span>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Anchored Tooltip (When in Collapsed Rail Mode) */}
          {isCollapsed && isHovered && (
            <div className="sidebar-rail-tooltip animate-fadeIn flex items-center gap-2">
              <span>{label}</span>
              {badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                    isLive ? 'bg-emerald-500/30 text-emerald-300' : 'bg-surface-subtle text-muted'
                  }`}
                >
                  {badge}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </NavLink>
  );
};
