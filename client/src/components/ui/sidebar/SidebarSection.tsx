import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export interface SidebarSectionProps {
  title: string;
  isCollapsed?: boolean;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const SidebarSection: React.FC<SidebarSectionProps> = ({
  title,
  isCollapsed = false,
  children,
  defaultOpen = true
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  if (isCollapsed) {
    return (
      <div className="space-y-1.5 py-1">
        <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent mx-auto my-2" />
        <div className="space-y-1">{children}</div>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Section Header with Gradient Line and Animated Chevron */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-1.5 text-left group select-none"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 flex-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-muted/70 group-hover:text-muted transition-colors">
            {title}
          </span>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-indigo-500/20 via-white/10 to-transparent" />
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 0 : -90 }}
          transition={{ duration: 0.2 }}
          className="text-muted/60 group-hover:text-muted ml-2"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </motion.div>
      </button>

      {/* Accordion Content */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden space-y-0.5"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
