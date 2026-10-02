import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Compass,
  CalendarDays,
  Bot,
  Code2,
  BrainCircuit,
  Binary,
  Mic2,
  FileText,
  RotateCcw,
  Trophy,
  Zap,
  Building2,
  Settings,
  Sparkles,
  X
} from 'lucide-react';
import { SidebarItem } from './SidebarItem';
import { SidebarSection } from './SidebarSection';
import { SidebarProfileCard } from './SidebarProfileCard';
import { Logo } from '../Logo';
import './Sidebar.css';

export interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const NAV_CONFIG = [
  {
    title: 'Core Roadmap',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, accent: 'oklch(0.65 0.24 275)' },
      { to: '/assessment', label: 'Assessment', icon: Compass, accent: 'oklch(0.65 0.25 295)' },
      { to: '/planner', label: 'Study Planner', icon: CalendarDays, accent: 'oklch(0.70 0.18 220)' }
    ]
  },
  {
    title: 'AI & Practice',
    items: [
      { to: '/coach', label: 'AI Coach', icon: Bot, badge: 'Live', accent: 'oklch(0.75 0.19 155)' },
      { to: '/dsa', label: 'DSA Practice', icon: Code2, accent: 'oklch(0.72 0.18 195)' },
      { to: '/aptitude', label: 'Aptitude', icon: BrainCircuit, accent: 'oklch(0.78 0.17 65)' },
      { to: '/cs', label: 'CS Fundamentals', icon: Binary, accent: 'oklch(0.62 0.22 250)' },
      { to: '/interview', label: 'AI Mock Interview', icon: Mic2, accent: 'oklch(0.68 0.24 350)' },
      { to: '/resume', label: 'Resume Interview', icon: FileText, accent: 'oklch(0.72 0.20 45)' }
    ]
  },
  {
    title: 'Retention & Career',
    items: [
      { to: '/revision', label: 'Spaced Revision', icon: RotateCcw, badge: '5 due', accent: 'oklch(0.72 0.16 175)' },
      { to: '/daily', label: 'Daily Challenge', icon: Zap, badge: '3/7', accent: 'oklch(0.82 0.18 85)' },
      { to: '/companies', label: 'Company Mode', icon: Building2, accent: 'oklch(0.65 0.10 240)' },
      { to: '/gamification', label: 'Badges & XP', icon: Trophy, accent: 'oklch(0.65 0.24 15)' }
    ]
  },
  {
    title: 'System',
    items: [
      { to: '/settings', label: 'Settings', icon: Settings, accent: 'oklch(0.70 0.05 260)' }
    ]
  }
];

import { useAppStore } from '../../../store/useAppStore';

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const location = useLocation();
  const { isSidebarCollapsed, toggleSidebarCollapsed } = useAppStore();
  const isCollapsed = isSidebarCollapsed;
  const toggleCollapse = toggleSidebarCollapsed;

  // Close mobile drawer on route changes
  useEffect(() => {
    if (onClose) onClose();
  }, [location.pathname]);

  return (
    <>
      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 sidebar-glass border-r border-subtle flex flex-col justify-between transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        aria-label="Main Navigation"
      >
        {/* Aurora Glow Top & Bottom */}
        <div className="sidebar-aurora-glow-top" />
        <div className="sidebar-aurora-glow-bottom" />

        {/* 1. Brand / Header Bar (Sticky at Top) */}
        <div className="p-3 border-b border-subtle/80 flex items-center justify-between z-10 relative bg-surface/30 backdrop-blur-md">
          <Logo collapsed={isCollapsed} linkTo="/" />

          {/* Mobile Close Button */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-muted hover:text-main hover:bg-surface-subtle transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Scrollable Navigation Menu */}
        <div className="sidebar-scroll-container flex-1 py-3 px-2 space-y-4 z-10 relative">
          {NAV_CONFIG.map((section, sIdx) => (
            <SidebarSection
              key={section.title}
              title={section.title}
              isCollapsed={isCollapsed}
              defaultOpen={true}
            >
              {section.items.map((item, iIdx) => (
                <SidebarItem
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  icon={item.icon}
                  accent={item.accent}
                  badge={item.badge}
                  isCollapsed={isCollapsed}
                  onNavigate={onClose}
                  index={sIdx * 4 + iIdx}
                />
              ))}
            </SidebarSection>
          ))}
        </div>

        {/* 3. Pinned Bottom Profile & Utilities Card */}
        <SidebarProfileCard
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
        />
      </aside>
    </>
  );
};
