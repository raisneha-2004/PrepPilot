import React, { useState } from 'react';
import { TrendingUp, Activity } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { BentoCard } from './BentoCard';

const data7d = [
  { day: 'Mon', problems: 4, minutes: 65, readiness: 72 },
  { day: 'Tue', problems: 6, minutes: 90, readiness: 74 },
  { day: 'Wed', problems: 3, minutes: 45, readiness: 74 },
  { day: 'Thu', problems: 8, minutes: 120, readiness: 76 },
  { day: 'Fri', problems: 5, minutes: 75, readiness: 77 },
  { day: 'Sat', problems: 9, minutes: 140, readiness: 78 },
  { day: 'Sun', problems: 7, minutes: 110, readiness: 78 }
];

const data30d = [
  { day: 'W1', problems: 22, minutes: 420, readiness: 62 },
  { day: 'W2', problems: 28, minutes: 540, readiness: 68 },
  { day: 'W3', problems: 35, minutes: 630, readiness: 73 },
  { day: 'W4', problems: 42, minutes: 710, readiness: 78 }
];

interface ProgressChartProps {
  className?: string;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({ className = '' }) => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d'>('7d');
  const activeData = timeframe === '7d' ? data7d : data30d;

  return (
    <BentoCard
      title="Preparation Velocity"
      subtitle="Study minutes & problems solved"
      icon={Activity}
      iconColor="text-emerald-400"
      delta={{ value: '+6.8% this week', isPositive: true }}
      className={className}
    >
      <div className="space-y-3">
        {/* Toggle Pills & Top Stats */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-[10px] text-muted block">Total Minutes</span>
              <span className="text-sm font-black font-heading text-main tabular-nums">
                {timeframe === '7d' ? '645 mins' : '2,300 mins'}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-muted block">Problems Solved</span>
              <span className="text-sm font-black font-heading text-emerald-400 tabular-nums">
                {timeframe === '7d' ? '42 problems' : '127 problems'}
              </span>
            </div>
          </div>

          {/* Timeframe Switcher */}
          <div className="flex items-center p-0.5 rounded-xl bg-surface-subtle border border-subtle text-xs">
            <button
              onClick={() => setTimeframe('7d')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                timeframe === '7d'
                  ? 'bg-surface text-main shadow-xs border border-subtle/80'
                  : 'text-muted hover:text-main'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeframe('30d')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                timeframe === '30d'
                  ? 'bg-surface text-main shadow-xs border border-subtle/80'
                  : 'text-muted hover:text-main'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.75 0.19 155)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="oklch(0.75 0.19 155)" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="minutesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.65 0.24 275)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="oklch(0.65 0.24 275)" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" strokeOpacity={0.4} vertical={false} />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--text-muted)', fontSize: 11, fontWeight: 500 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass-panel p-2.5 rounded-xl border border-subtle text-xs space-y-1 shadow-lg">
                        <p className="font-bold text-main">{label}</p>
                        <p className="text-emerald-400 font-semibold">{payload[0]?.value} Problems</p>
                        <p className="text-indigo-400 font-semibold">{payload[1]?.value} Minutes Study</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="problems"
                stroke="oklch(0.75 0.19 155)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#velocityGradient)"
              />
              <Area
                type="monotone"
                dataKey="minutes"
                stroke="oklch(0.65 0.24 275)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#minutesGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </BentoCard>
  );
};
