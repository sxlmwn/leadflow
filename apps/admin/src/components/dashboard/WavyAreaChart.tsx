'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

interface WavyAreaChartProps {
  title?: string;
  subtitle?: string;
  height?: number;
}

const SAMPLE_WAVY_DATA = [
  { name: 'Jan', organic: 140, paid: 280, direct: 90 },
  { name: 'Feb', organic: 190, paid: 320, direct: 130 },
  { name: 'Mar', organic: 170, paid: 310, direct: 110 },
  { name: 'Apr', organic: 240, paid: 420, direct: 180 },
  { name: 'May', organic: 210, paid: 390, direct: 150 },
  { name: 'Jun', organic: 340, paid: 560, direct: 260 },
  { name: 'Jul', organic: 290, paid: 480, direct: 220 },
  { name: 'Aug', organic: 380, paid: 640, direct: 310 },
  { name: 'Sep', organic: 310, paid: 530, direct: 250 },
  { name: 'Oct', organic: 420, paid: 680, direct: 340 },
  { name: 'Nov', organic: 360, paid: 590, direct: 290 },
  { name: 'Dec', organic: 450, paid: 730, direct: 380 },
];

export const WavyAreaChart: React.FC<WavyAreaChartProps> = ({
  title = "Lead Volume Over Time",
  subtitle = "Monthly lead acquisition across all active channels",
  height = 300
}) => {
  return (
    <div className="admin-card p-6 flex flex-col justify-between h-full">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 font-heading">{title}</h3>
          <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400"></span>
            <span className="text-slate-600 dark:text-zinc-300 font-medium">Paid Traffic</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
            <span className="text-slate-600 dark:text-zinc-300 font-medium">Organic</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
            <span className="text-slate-600 dark:text-zinc-300 font-medium">Direct</span>
          </div>
        </div>
      </div>

      {/* Recharts Wavy Fluid Layer Area Chart */}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={SAMPLE_WAVY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="colorOrganic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="colorDirect" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(113, 113, 122, 0.15)" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717a', fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717a', fontSize: 11 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(24, 24, 27, 0.95)',
                borderRadius: '12px',
                border: '1px solid rgba(39, 39, 42, 0.8)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                color: '#f4f4f5',
                fontSize: '12px',
                fontWeight: 600
              }}
            />

            <Area
              type="monotone"
              dataKey="paid"
              stroke="#2563eb"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorPaid)"
            />
            <Area
              type="monotone"
              dataKey="organic"
              stroke="#0d9488"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorOrganic)"
            />
            <Area
              type="monotone"
              dataKey="direct"
              stroke="#818cf8"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorDirect)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
