import React from 'react';
import { Compass, Sparkles } from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { BentoCard } from './BentoCard';

interface RadarCardProps {
  data?: { subject: string; score: number; benchmark: number }[];
  className?: string;
}

const defaultRadarData = [
  { subject: 'DSA', score: 85, benchmark: 80 },
  { subject: 'Core CS', score: 80, benchmark: 75 },
  { subject: 'Aptitude', score: 75, benchmark: 70 },
  { subject: 'System Design', score: 65, benchmark: 70 },
  { subject: 'Interview', score: 72, benchmark: 75 },
  { subject: 'Speed', score: 88, benchmark: 80 }
];

export const RadarCard: React.FC<RadarCardProps> = ({
  data = defaultRadarData,
  className = ''
}) => {
  return (
    <BentoCard
      title="Skill Domain Radar"
      subtitle="Placement Competency Balance"
      icon={Compass}
      iconColor="text-indigo-400"
      delta={{ value: '+5.2% balance', isPositive: true }}
      badge={{ text: 'Multi-Axis', variant: 'indigo' }}
      actionText="Take full skill assessment"
      actionHref="/assessment"
      className={className}
    >
      <div className="space-y-2">
        {/* Radar Chart Container */}
        <div className="h-56 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid stroke="var(--border-subtle)" strokeOpacity={0.6} />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 600 }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="glass-panel p-2.5 rounded-xl border border-subtle text-xs space-y-1 shadow-lg">
                        <p className="font-bold text-main">{d.subject}</p>
                        <p className="text-indigo-400 font-semibold">Your Score: {d.score}%</p>
                        <p className="text-muted text-[11px]">Benchmark: {d.benchmark}%</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {/* Benchmark Layer */}
              <Radar
                name="Benchmark"
                dataKey="benchmark"
                stroke="oklch(0.50 0.05 260)"
                fill="oklch(0.50 0.05 260)"
                fillOpacity={0.12}
                strokeDasharray="3 3"
              />
              {/* Candidate Layer */}
              <Radar
                name="Candidate"
                dataKey="score"
                stroke="oklch(0.65 0.24 275)"
                fill="oklch(0.65 0.24 275)"
                fillOpacity={0.4}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend / Metrics summary */}
        <div className="flex items-center justify-between text-[11px] text-muted pt-1 border-t border-subtle">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_6px_rgba(99,102,241,0.6)]" />
            <span className="text-main font-medium">Your Profile</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-500 border border-dashed border-slate-400" />
            <span>Target Benchmark</span>
          </div>
        </div>
      </div>
    </BentoCard>
  );
};
