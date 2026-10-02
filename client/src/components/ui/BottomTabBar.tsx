import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Code2, Bot, Mic2, Trophy } from 'lucide-react';

export const BottomTabBar: React.FC = () => {
  const tabs = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/dsa', label: 'DSA', icon: Code2 },
    { to: '/coach', label: 'Coach', icon: Bot },
    { to: '/interview', label: 'Interview', icon: Mic2 },
    { to: '/gamification', label: 'Progress', icon: Trophy }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-xl border-t border-subtle px-2 py-1.5 flex items-center justify-around shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-indigo-400 font-semibold'
                  : 'text-muted hover:text-main'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};
