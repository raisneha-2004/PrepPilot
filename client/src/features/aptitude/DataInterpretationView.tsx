import React from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';
import { Table, BarChart2, PieChart as PieIcon, LineChart as LineIcon } from 'lucide-react';

export interface DatasetSpec {
  type: 'table' | 'bar' | 'pie' | 'line';
  title: string;
  columns?: string[];
  data: any[];
}

const PIE_COLORS = [
  'oklch(0.65 0.24 275)',
  'oklch(0.75 0.19 155)',
  'oklch(0.72 0.18 195)',
  'oklch(0.78 0.17 65)',
  'oklch(0.65 0.22 25)'
];

export const DataInterpretationView: React.FC<{ dataset?: DatasetSpec }> = ({ dataset }) => {
  if (!dataset || !dataset.data || dataset.data.length === 0) return null;

  return (
    <div className="p-4 rounded-2xl bg-surface-subtle border border-subtle space-y-3 my-4">
      <div className="flex items-center gap-2 text-xs font-bold text-main border-b border-subtle pb-2">
        {dataset.type === 'table' && <Table className="w-4 h-4 text-cyan-400" />}
        {dataset.type === 'bar' && <BarChart2 className="w-4 h-4 text-indigo-400" />}
        {dataset.type === 'pie' && <PieIcon className="w-4 h-4 text-emerald-400" />}
        {dataset.type === 'line' && <LineIcon className="w-4 h-4 text-amber-400" />}
        <span className="truncate">{dataset.title}</span>
      </div>

      {/* 1. Table View */}
      {dataset.type === 'table' && (
        <div className="overflow-x-auto rounded-xl border border-subtle/80 bg-surface">
          <table className="w-full text-xs text-left">
            <thead className="bg-surface-elevated text-muted uppercase text-[10px] font-bold border-b border-subtle">
              <tr>
                {(dataset.columns || Object.keys(dataset.data[0] || {})).map((col) => (
                  <th key={col} className="px-3 py-2 whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle/60">
              {dataset.data.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-surface-subtle transition-colors">
                  {(dataset.columns || Object.keys(row)).map((col) => (
                    <td key={col} className="px-3 py-2 font-medium text-main tabular-nums whitespace-nowrap">
                      {typeof row[col] === 'number' ? `$${row[col]}M` : row[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. Bar Chart View */}
      {dataset.type === 'bar' && (
        <div className="h-52 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataset.data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" strokeOpacity={0.5} vertical={false} />
              <XAxis dataKey="Year" tickLine={false} axisLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass-panel p-2.5 rounded-xl border border-subtle text-xs space-y-1 shadow-lg">
                        <p className="font-bold text-main">{label}</p>
                        {payload.map((p, idx) => (
                          <p key={idx} style={{ color: p.color }} className="font-semibold">
                            {p.name}: {p.value}
                          </p>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
              <Bar dataKey="Placed Candidates" fill="oklch(0.75 0.19 155)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Total Candidates" fill="oklch(0.65 0.24 275 / 0.5)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 3. Pie Chart View */}
      {dataset.type === 'pie' && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
          <div className="h-44 w-44 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dataset.data}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="percentage"
                  nameKey="category"
                >
                  {dataset.data.map((_, idx) => (
                    <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="glass-panel p-2 rounded-xl border border-subtle text-xs shadow-lg">
                          <p className="font-bold text-main">{d.category}</p>
                          <p className="text-emerald-400 font-semibold">{d.percentage}% (${d.value}k/mo)</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {dataset.data.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                />
                <span className="text-muted font-medium truncate max-w-[180px]">{item.category}:</span>
                <span className="font-bold text-main tabular-nums">{item.percentage}%</span>
                <span className="text-muted/70 text-[10px]">(${item.value}k)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
