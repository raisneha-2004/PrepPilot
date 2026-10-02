import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Flame,
  Moon,
  Sun,
  Search,
  Menu,
  X,
  Shield,
  Bell,
  User,
  Settings,
  Calendar,
  RotateCcw,
  LogOut,
  CheckCircle2,
  ExternalLink,
  Target,
  Zap,
  LogIn
} from 'lucide-react';
import { toast } from 'sonner';
import { useAppStore } from '../../store/useAppStore';
import { useQuery } from '@tanstack/react-query';
import { readinessApi, gamificationApi } from '../../lib/api/client';
import { Logo } from './Logo';

export interface NavbarProps {
  onMenuToggle?: () => void;
  isMenuOpen?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle, isMenuOpen }) => {
  const {
    theme,
    toggleTheme,
    toggleCommandPalette,
    isSidebarCollapsed,
    profile,
    user,
    isAuthenticated,
    logout,
    resetAllData
  } = useAppStore();
  const location = useLocation();
  const navigate = useNavigate();

  // State for dropdowns
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const isLandingPage = location.pathname === '/';
  const isOnboarding = location.pathname === '/onboarding';
  const isFullLayout = !isLandingPage && !isOnboarding;

  // Detect OS for keyboard shortcut hint (Cmd+K vs Ctrl+K)
  useEffect(() => {
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      const platform = (navigator as any)?.userAgentData?.platform || navigator?.platform || '';
      setIsMac(/Mac|iPhone|iPod|iPad/i.test(platform));
    }
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Close dropdowns on route change
  useEffect(() => {
    setIsNotificationsOpen(false);
    setIsProfileMenuOpen(false);
  }, [location.pathname]);

  // Fetch live stats
  const { data: readinessData } = useQuery({
    queryKey: ['readiness'],
    queryFn: readinessApi.getReadiness,
    staleTime: 60000
  });

  const { data: gamificationData } = useQuery({
    queryKey: ['gamification'],
    queryFn: gamificationApi.getStatus,
    staleTime: 60000
  });

  const score = readinessData?.readinessScore ?? 78;
  const streak = gamificationData?.currentStreak ?? 6;
  const xp = gamificationData?.currentXp ?? 1450;

  // Mini circular SVG parameters for Readiness chip
  const ringRadius = 6;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (score / 100) * ringCircumference;

  // Dynamic initials for avatar
  const getInitials = () => {
    if (user?.name && user.name.trim().length > 0) {
      const parts = user.name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return profile.targetRole ? profile.targetRole.substring(0, 2).toUpperCase() : 'SP';
  };

  const initials = getInitials();

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-[#0a0d18]/85 dark:bg-[#0a0d18]/85 bg-white/85 backdrop-blur-xl border-b border-white/10 dark:border-white/10 border-slate-200/80 shadow-[0_1px_0_rgba(255,255,255,0.04),0_8px_24px_-12px_rgba(0,0,0,0.6)] transition-all duration-300">
      <div
        className={`w-full h-full flex items-center justify-between gap-2 sm:gap-4 px-4 sm:px-6 lg:px-8 pr-4 sm:pr-6 lg:pr-8 transition-all duration-300 ${
          isFullLayout ? (isSidebarCollapsed ? 'lg:pl-24' : 'lg:pl-72') : 'max-w-7xl mx-auto'
        }`}
      >
        {/* Left: Mobile Hamburger & Logo (Only when sidebar is not visible on desktop, or on mobile) */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile Drawer Hamburger */}
          {isFullLayout && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden h-9 w-9 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none shrink-0"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}

          {/* High-Contrast Brand Logo (Shown on mobile / landing page) */}
          <div className={isFullLayout ? 'lg:hidden' : 'shrink-0'}>
            <Logo linkTo="/" />
          </div>
        </div>

        {/* Center: Search / Command Palette Bar */}
        <div className="flex-1 min-w-0 max-w-md hidden md:flex items-center">
          <button
            type="button"
            onClick={toggleCommandPalette}
            className="w-full min-w-0 h-10 rounded-xl bg-white/5 dark:bg-white/5 bg-slate-100 border border-white/10 dark:border-white/10 border-slate-200 hover:border-indigo-500/50 hover:bg-white/10 dark:hover:bg-white/10 focus-visible:border-indigo-500/60 focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:outline-none transition-all duration-150 flex items-center justify-between px-3.5 group select-none shadow-inner"
            aria-label="Search modules, problems, or commands"
          >
            <div className="flex items-center gap-2.5 text-slate-400 dark:text-slate-400 text-slate-500 truncate min-w-0">
              <Search className="w-4 h-4 text-indigo-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-normal truncate">
                Search modules, problems, or commands...
              </span>
            </div>
            <kbd className="hidden xl:inline-flex shrink-0 items-center gap-0.5 px-2 py-0.5 rounded-md bg-white/10 dark:bg-white/10 border border-white/10 text-slate-300 dark:text-slate-300 text-xs font-mono font-medium shadow-xs">
              {isMac ? '⌘K' : 'Ctrl K'}
            </kbd>
          </button>
        </div>

        {/* Right: Stat Chips, Theme, Notifications & User Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto">
          {/* Mobile Search Icon Button (< 768px) */}
          <button
            type="button"
            onClick={toggleCommandPalette}
            className="md:hidden h-9 w-9 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none shrink-0"
            aria-label="Open Command Palette"
          >
            <Search className="w-4 h-4 text-indigo-400" />
          </button>

          {/* Stat Chips Group with flex-nowrap & overflow fallback */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-nowrap py-1 shrink-0">
            {/* Stat Chip 1: Readiness Score */}
            <Link
              to="/dashboard"
              title="Placement readiness score – based on tracked practice"
              className={`${
                isAuthenticated ? 'hidden md:flex' : 'hidden lg:flex'
              } h-9 px-2.5 sm:px-3 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 text-indigo-300 text-xs sm:text-sm font-semibold items-center gap-1.5 sm:gap-2 transition-all duration-150 hover:-translate-y-px shadow-xs shrink-0 whitespace-nowrap`}
            >
              <div className="relative flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 -rotate-90">
                  <circle
                    cx="8"
                    cy="8"
                    r={ringRadius}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="transparent"
                    className="opacity-25"
                  />
                  <circle
                    cx="8"
                    cy="8"
                    r={ringRadius}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="transparent"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                  />
                </svg>
                <Shield className="w-2.5 h-2.5 text-indigo-400 absolute" />
              </div>
              <span>
                {score}%<span className="hidden xl:inline font-normal text-xs text-indigo-300/80 ml-1">Ready</span>
              </span>
            </Link>

            {/* Stat Chip 2: Daily Streak */}
            <Link
              to="/daily"
              title="Daily streak – practice today to keep it"
              className={`${
                isAuthenticated ? 'hidden sm:flex' : 'hidden xl:flex'
              } h-9 px-2.5 sm:px-3 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/25 text-amber-300 text-xs sm:text-sm font-semibold items-center gap-1.5 transition-all duration-150 hover:-translate-y-px shadow-xs shrink-0 whitespace-nowrap`}
            >
              <Flame
                className={`w-4 h-4 text-amber-400 fill-amber-400 shrink-0 ${
                  streak > 0 ? 'drop-shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse' : 'opacity-60'
                }`}
              />
              <span>
                {streak}<span className="hidden xl:inline font-normal text-xs text-amber-300/80 ml-1">{streak === 1 ? 'day' : 'days'}</span>
              </span>
            </Link>

            {/* Stat Chip 3: XP Badge */}
            <Link
              to="/gamification"
              title="Total XP earned across placement challenges"
              className="hidden lg:flex h-9 px-2.5 sm:px-3 rounded-full bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/25 text-purple-300 text-xs sm:text-sm font-semibold items-center gap-1.5 transition-all duration-150 hover:-translate-y-px shadow-xs shrink-0 whitespace-nowrap"
            >
              <Zap className="w-4 h-4 text-purple-400 fill-purple-400/50 shrink-0" />
              <span>
                {xp}<span className="hidden xl:inline font-normal text-xs text-purple-300/80 ml-1">XP</span>
              </span>
            </Link>
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-white/15 hidden sm:block shrink-0" />

          {/* Action 1: Theme Toggle */}
          <button
            type="button"
            onClick={(e) => toggleTheme(e)}
            className="h-9 w-9 rounded-full bg-white/5 dark:bg-white/5 bg-slate-100 border border-white/10 dark:border-white/10 border-slate-200 text-slate-300 dark:text-slate-300 text-slate-700 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-150 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none shrink-0"
            title="Toggle theme (Light / Dark)"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform duration-300" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500 hover:-rotate-12 transition-transform duration-300" />
            )}
          </button>

          {/* Action 2: Notifications Bell (Only when logged in or default preview) */}
          {isAuthenticated && (
            <div className="relative shrink-0" ref={notificationsRef}>
              <button
                type="button"
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="h-9 w-9 rounded-full bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-150 flex items-center justify-center relative focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                title="Notifications & Updates"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-indigo-400 absolute top-2 right-2 ring-2 ring-[#0a0d18] animate-ping" />
                <span className="w-2 h-2 rounded-full bg-indigo-500 absolute top-2 right-2 ring-2 ring-[#0a0d18]" />
              </button>

              {/* Notifications Menu */}
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#0f172a]/95 backdrop-blur-2xl border border-white/15 p-4 shadow-2xl z-50 space-y-3"
                  >
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <span className="text-xs font-bold text-main uppercase tracking-wider">
                        Notifications
                      </span>
                      <span className="text-[10px] text-indigo-400 font-semibold cursor-pointer hover:underline">
                        Mark all read
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-surface-subtle border border-subtle flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-semibold text-main">Daily Challenge Ready</p>
                          <p className="text-[11px] text-muted">Solve today's 3-question drill to keep your {streak}d streak alive.</p>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-surface-subtle border border-subtle flex items-start gap-2.5">
                        <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                          <Sparkles className="w-3.5 h-3.5" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="font-semibold text-main">Diagnostic Calibrated</p>
                          <p className="text-[11px] text-muted">Your Placement Readiness is at {score}%. Review weak topics in Planner.</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Action 3: Logged-in Avatar Menu vs Logged-out Login Button */}
          {isAuthenticated ? (
            <div className="relative shrink-0" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-600 to-cyan-400 p-0.5 ring-1 ring-white/20 hover:scale-105 transition-transform duration-150 flex items-center justify-center focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
                title={`Logged in as ${user?.name || 'Candidate'}`}
                aria-label="User Account Menu"
              >
                <div className="w-full h-full bg-[#0a0d18] rounded-full flex items-center justify-center text-xs font-bold text-white font-mono">
                  {initials}
                </div>
              </button>

              {/* Profile Menu Dropdown */}
              <AnimatePresence>
                {isProfileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#0f172a]/95 backdrop-blur-2xl border border-white/15 p-2.5 shadow-2xl z-50 space-y-2"
                  >
                    {/* Header Info */}
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-xs font-bold text-main font-heading truncate">
                        {user?.name || 'Candidate'}
                      </p>
                      <p className="text-[11px] text-indigo-400 truncate">
                        {user?.email || `${profile.targetRole || 'Software Engineer'} Track`}
                      </p>
                    </div>

                    {/* Links */}
                    <div className="space-y-0.5 text-xs">
                      <button
                        onClick={() => {
                          navigate('/settings');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-left"
                      >
                        <User className="w-4 h-4 text-indigo-400" />
                        <span>Profile Details</span>
                      </button>

                      <button
                        onClick={() => {
                          navigate('/planner');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-left"
                      >
                        <Calendar className="w-4 h-4 text-indigo-400" />
                        <span>Study Planner</span>
                      </button>

                      <button
                        onClick={() => {
                          navigate('/revision');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-left"
                      >
                        <RotateCcw className="w-4 h-4 text-teal-400" />
                        <span>Spaced Revision</span>
                      </button>

                      <button
                        onClick={() => {
                          navigate('/settings');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-left"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Preferences & Settings</span>
                      </button>
                    </div>

                    {/* Logout Action */}
                    <div className="pt-1 border-t border-white/10">
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileMenuOpen(false);
                          toast.success('Logged out successfully');
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-300 hover:text-rose-200 hover:bg-rose-500/15 transition-colors text-left text-xs font-semibold"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/login"
                className="h-9 px-3.5 sm:px-4 rounded-full bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all duration-150 hover:-translate-y-px shadow-sm shadow-indigo-500/25 shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Login</span>
              </Link>
              <Link
                to="/login?mode=signup"
                className="hidden sm:inline-flex h-9 px-3.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-slate-200 text-xs sm:text-sm font-semibold items-center transition-all duration-150 hover:-translate-y-px shrink-0"
              >
                <span>Sign up</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
