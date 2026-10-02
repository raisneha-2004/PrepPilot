import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../ui/Navbar';
import { Sidebar } from '../ui/Sidebar';
import { BottomTabBar } from '../ui/BottomTabBar';
import { CommandPalette } from '../ui/CommandPalette';
import { OfflineBanner } from '../ui/OfflineBanner';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { useSpotlight } from '../../hooks/useSpotlight';
import { Toaster } from 'sonner';

import { useAppStore } from '../../store/useAppStore';

export const AppLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isSidebarCollapsed } = useAppStore();
  useSpotlight();

  const isLandingPage = location.pathname === '/';
  const isOnboarding = location.pathname === '/onboarding';
  const isFullLayout = !isLandingPage && !isOnboarding;

  return (
    <div className="min-h-screen bg-base text-main relative flex flex-col selection:bg-indigo-500/25 selection:text-indigo-300">
      {/* Background Aurora Mesh & Spotlight */}
      <div className="aurora-canvas" />
      <div className="spotlight-overlay" />

      {/* Offline Banner */}
      <OfflineBanner />

      {/* Sticky Header */}
      <Navbar
        isMenuOpen={isMobileMenuOpen}
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Main Body */}
      <div className="flex-1 flex relative z-10 min-w-0">
        {/* Sidebar (only on internal dashboard/feature pages) */}
        {isFullLayout && (
          <Sidebar
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Dynamic Content Area */}
        <main
          className={`flex-1 w-full min-w-0 transition-all duration-300 ${
            isFullLayout ? (isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64') : ''
          } pb-20 lg:pb-12`}
        >
          <div className="w-full px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
            <ErrorBoundary>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      {isFullLayout && <BottomTabBar />}

      {/* Command Palette */}
      <CommandPalette />

      {/* Global Toast Provider */}
      <Toaster
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-main)',
            backdropFilter: 'blur(16px)'
          }
        }}
      />
    </div>
  );
};
