import React from 'react';
import { motion } from 'framer-motion';

interface DashboardShellProps {
  children: React.ReactNode;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  return (
    <div className="space-y-6 sm:space-y-8 relative pb-12">
      {/* Background Subtle Aurora & Vignette Mesh */}
      <div className="absolute top-10 left-10 w-[500px] h-[500px] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-80 right-10 w-[450px] h-[450px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute bottom-20 left-1/3 w-[400px] h-[400px] bg-amber-500/4 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* Main Content */}
      <div className="relative z-10 space-y-6 sm:space-y-8">
        {children}
      </div>
    </div>
  );
};
