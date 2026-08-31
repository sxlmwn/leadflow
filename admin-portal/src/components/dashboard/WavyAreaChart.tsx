'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, ArrowRight } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface WavyAreaChartProps {
  title?: string;
  subtitle?: string;
  height?: number;
  reportHref?: string;
}

// Smooth multi-peak dataset matching the flowing waves in 2.jpg
const MONTHLY_DATA = [
  { name: 'Jan, 18', direct: 180, links: 120, search: 90 },
  { name: 'Feb, 18', direct: 260, links: 220, search: 160 },
  { name: 'Mar, 18', direct: 210, links: 180, search: 140 },
  { name: 'Apr, 18', direct: 290, links: 270, search: 190 },
  { name: 'May, 18', direct: 360, links: 310, search: 220 },
  { name: 'Jun, 18', direct: 420, links: 370, search: 280 },
  { name: 'Jul, 18', direct: 330, links: 280, search: 210 },
  { name: 'Aug, 18', direct: 480, links: 390, search: 310 },
  { name: 'Sep, 18', direct: 410, links: 340, search: 260 },
  { name: 'Oct, 18', direct: 520, links: 430, search: 350 },
  { name: 'Nov, 18', direct: 460, links: 380, search: 290 },
  { name: 'Dec, 18', direct: 580, links: 490, search: 390 },
];

const WEEKLY_DATA = [
  { name: 'Mon', direct: 70, links: 50, search: 35 },
  { name: 'Tue', direct: 110, links: 85, search: 60 },
  { name: 'Wed', direct: 95, links: 75, search: 50 },
  { name: 'Thu', direct: 140, links: 110, search: 80 },
  { name: 'Fri', direct: 160, links: 130, search: 95 },
  { name: 'Sat', direct: 85, links: 65, search: 45 },
  { name: 'Sun', direct: 60, links: 45, search: 30 },
];

const YEARLY_DATA = [
  { name: '2023', direct: 2800, links: 2100, search: 1500 },
  { name: '2024', direct: 4200, links: 3300, search: 2400 },
  { name: '2025', direct: 6100, links: 4900, search: 3600 },
  { name: '2026', direct: 8400, links: 6800, search: 5100 },
];

export const WavyAreaChart: React.FC<WavyAreaChartProps> = ({
  title = "New visitors",
  subtitle = "Lead volume & acquisition channels over time",
  height = 250,
  reportHref = "/leads"
}) => {
  const [timeframe, setTimeframe] = useState<'Week' | 'Month' | 'Year'>('Month');

  const chartData =
    timeframe === 'Week'
      ? WEEKLY_DATA
      : timeframe === 'Year'
      ? YEARLY_DATA
      : MONTHLY_DATA;

  return (
    <div className="admin-card p-4 sm:p-6 flex flex-col justify-between h-full group shadow-xs">
      {/* Top Header Row matching 2.jpg: Title (Left) + Timeframe Pills + More Menu (Right) */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground font-heading">{title}</h3>
          {subtitle && <p className="text-[11px] text-muted-foreground font-medium">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe Toggle Pills (2.jpg style) */}
          <div className="flex items-center gap-1 bg-secondary/80 p-0.5 rounded-xl border border-border/70">
            {(['Week', 'Month', 'Year'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-150 cursor-pointer ${
                  timeframe === t
                    ? 'bg-card text-foreground shadow-2xs border border-border/80'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors cursor-pointer"
            title="More options"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Recharts Flowing Organic Wave Area Chart (matching 2.jpg) */}
      <div style={{ width: '100%', height }} className="my-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 12, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {/* Layer 1 Gradient: Deep Blue Wave */}
              <linearGradient id="wavePaid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity={0.45} />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#2563eb" stopOpacity={0.01} />
              </linearGradient>

              {/* Layer 2 Gradient: Sky/Cyan Wave */}
              <linearGradient id="waveOrganic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.38} />
                <stop offset="50%" stopColor="#38bdf8" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.01} />
              </linearGradient>

              {/* Layer 3 Gradient: Indigo Wave */}
              <linearGradient id="waveDirect" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="50%" stopColor="#818cf8" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            {/* Soft, minimal gridlines (matching 2.jpg - no harsh dark grid) */}
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="#e2e8f0"
              className="dark:stroke-slate-800/60"
            />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
              dy={6}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10, fontWeight: 500 }}
              dx={-4}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-card/95 backdrop-blur-md border border-border p-3 rounded-2xl shadow-xl text-xs space-y-1.5 min-w-[140px]">
                      <p className="font-bold text-foreground pb-1 border-b border-border/60">{label}</p>
                      <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 font-medium">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span> Direct login
                        </span>
                        <span className="font-bold">{payload[0]?.value}</span>
                      </div>
                      <div className="flex items-center justify-between text-sky-500 dark:text-sky-400 font-medium">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-sky-500"></span> Links to sites
                        </span>
                        <span className="font-bold">{payload[1]?.value}</span>
                      </div>
                      <div className="flex items-center justify-between text-indigo-500 dark:text-indigo-400 font-medium">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Direct search
                        </span>
                        <span className="font-bold">{payload[2]?.value}</span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {/* Smooth flowing organic overlapping wave areas with type="natural" */}
            <Area
              type="natural"
              dataKey="direct"
              stroke="#2563eb"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#wavePaid)"
            />
            <Area
              type="natural"
              dataKey="links"
              stroke="#0ea5e9"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#waveOrganic)"
            />
            <Area
              type="natural"
              dataKey="search"
              stroke="#6366f1"
              strokeWidth={1.8}
              fillOpacity={1}
              fill="url(#waveDirect)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Minimal Colored Dot Legend matching 2.jpg */}
      <div className="mt-3 pt-3 border-t border-border/70 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 shadow-2xs"></span>
            <span className="text-muted-foreground font-semibold">Direct login</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500 shadow-2xs"></span>
            <span className="text-muted-foreground font-semibold">Links to sites</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-2xs"></span>
            <span className="text-muted-foreground font-semibold">Direct search</span>
          </div>
        </div>

        <Link
          href={reportHref}
          className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <span>View report</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default WavyAreaChart;
