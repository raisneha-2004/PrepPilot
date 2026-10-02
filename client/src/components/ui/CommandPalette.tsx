import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
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
  Zap,
  Building2,
  Trophy,
  Settings,
  X
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

const COMMAND_ITEMS = [
  { id: 'dash', title: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', category: 'Navigation' },
  { id: 'assess', title: 'Diagnostic Assessment', icon: Compass, path: '/assessment', category: 'Navigation' },
  { id: 'plan', title: 'Study Planner', icon: CalendarDays, path: '/planner', category: 'Navigation' },
  { id: 'coach', title: 'AI Coach Chat', icon: Bot, path: '/coach', category: 'AI & Mentorship' },
  { id: 'dsa', title: 'DSA Practice Problems', icon: Code2, path: '/dsa', category: 'Practice' },
  { id: 'apt', title: 'Aptitude Tests', icon: BrainCircuit, path: '/aptitude', category: 'Practice' },
  { id: 'cs', title: 'CS Core Fundamentals', icon: Binary, path: '/cs', category: 'Practice' },
  { id: 'mock', title: 'AI Mock Technical Interview', icon: Mic2, path: '/interview', category: 'AI & Mentorship' },
  { id: 'resume', title: 'Resume Parsing & Questions', icon: FileText, path: '/resume', category: 'Career' },
  { id: 'rev', title: 'Spaced Repetition Review', icon: RotateCcw, path: '/revision', category: 'Practice' },
  { id: 'daily', title: 'Daily Placement Challenge', icon: Zap, path: '/daily', category: 'Practice' },
  { id: 'comp', title: 'Company Specific Patterns', icon: Building2, path: '/companies', category: 'Career' },
  { id: 'gam', title: 'Gamification & Badges', icon: Trophy, path: '/gamification', category: 'Progress' },
  { id: 'set', title: 'System Settings', icon: Settings, path: '/settings', category: 'System' }
];

export const CommandPalette: React.FC = () => {
  const { isCommandPaletteOpen, setCommandPaletteOpen } = useAppStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      } else if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  const filtered = COMMAND_ITEMS.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    setCommandPaletteOpen(false);
    navigate(path);
  };

  const handleKeyNavigation = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      handleSelect(filtered[selectedIndex].path);
    }
  };

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandPaletteOpen(false)}
            className="fixed inset-0 bg-black/65 backdrop-blur-md"
          />

          {/* Dialog */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl glass-panel shadow-2xl border border-subtle overflow-hidden z-10"
          >
            {/* Input bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-subtle gap-3">
              <Search className="w-5 h-5 text-indigo-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyNavigation}
                placeholder="Search modules, actions, or interview tracks..."
                className="w-full bg-transparent text-sm text-main placeholder:text-muted outline-none"
              />
              <button
                onClick={() => setCommandPaletteOpen(false)}
                className="p-1 rounded-lg text-muted hover:text-main hover:bg-surface-subtle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted">
                  No matching module found for "{query}"
                </div>
              ) : (
                filtered.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = idx === selectedIndex;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.path)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-colors text-left ${
                        isSelected
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'text-main hover:bg-surface-subtle border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-muted'}`} />
                        <span className="font-medium">{item.title}</span>
                      </div>
                      <span className="text-xs text-muted/80">{item.category}</span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 border-t border-subtle bg-surface-subtle/50 flex items-center justify-between text-[11px] text-muted">
              <span>Use <kbd className="font-mono">↑</kbd> <kbd className="font-mono">↓</kbd> to navigate</span>
              <span><kbd className="font-mono">ESC</kbd> to close</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
