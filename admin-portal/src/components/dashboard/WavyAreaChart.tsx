'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
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
  reportHref?: string;
}

const MONTHLY_DATA = [
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

const DAILY_DATA = [
  { name: 'Mon', organic: 35, paid: 65, direct: 20 },
  { name: 'Tue', organic: 42, paid: 80, direct: 28 },
  { name: 'Wed', organic: 50, paid: 95, direct: 34 },
  { name: 'Thu', organic: 48, paid: 90, direct: 30 },
  { name: 'Fri', organic: 62, paid: 110, direct: 42 },
  { name: 'Sat', organic: 28, paid: 45, direct: 18 },
  { name: 'Sun', organic: 20, paid: 35, direct: 12 },
];

const YEARLY_DATA = [
  { name: '2023', organic: 2200, paid: 4100, direct: 1600 },
  { name: '2024', organic: 3100, paid: 5800, direct: 2400 },
  { name: '2025', organic: 4400, paid: 7900, direct: 3300 },
  { name: '2026', organic: 5800, paid: 9600, direct: 4200 },
];

export const WavyAreaChart: React.FC<WavyAreaChartProps> = ({
  title = "Lead Volume Over Time",
  subtitle = "Lead acquisition channels across paid, organic & direct traffic",
  height = 240,
  reportHref = "/leads"
}) => {
  const [timeframe, setTimeframe] = useState<'Day' | 'Month' | 'Year'>('Month');

  const chartData =
    timeframe === 'Day'
      ? DAILY_DATA
      : timeframe === 'Year'
      ? YEARLY_DATA
      : MONTHLY_DATA;

  return (
    <div className="admin-card p-4 sm:p-5 flex flex-col justify-between h-full group transform-gpu">
      {/* Top Header Row with Legend at Top-Right */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground font-heading">{title}</h3>
          <p className="text-[11px] text-muted-foreground font-medium">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500 shadow-2xs"></span>
            <span className="text-foreground font-semibold">Paid Traffic</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400 shadow-2xs"></span>
            <span className="text-foreground font-semibold">Organic</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500 dark:bg-sky-400 shadow-2xs"></span>
            <span className="text-foreground font-semibold">Direct</span>
          </div>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="colorOrganic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.01} />
              </linearGradient>
              <linearGradient id="colorDirect" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.01} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 14px -2px rgba(0, 0, 0, 0.08)',
                color: '#0f172a',
                fontSize: '11px',
                fontWeight: 600
              }}
            />

            <Area
              type="monotone"
              dataKey="paid"
              stroke="#2563eb"
              strokeWidth={2.2}
              fillOpacity={1}
              fill="url(#colorPaid)"
            />
            <Area
              type="monotone"
              dataKey="organic"
              stroke="#0d9488"
              strokeWidth={1.8}
              fillOpacity={1}
              fill="url(#colorOrganic)"
            />
            <Area
              type="monotone"
              dataKey="direct"
              stroke="#0284c7"
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#colorDirect)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Footer Bar: Day/Month/Year Toggles (Left) + View Report Link (Right) */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
        <div className="flex items-center bg-secondary p-0.5 rounded-lg border border-border">
          {(['Day', 'Month', 'Year'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTimeframe(t)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all duration-150 cursor-pointer ${
                timeframe === t
                  ? 'bg-card text-foreground shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
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
