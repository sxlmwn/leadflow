'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, ArrowRight } from 'lucide-react';
import { ChartSwitcher, ChartSeries } from '@/components/ui/ChartSwitcher';

interface ChartDataPoint {
  name: string;
  direct: number;
  links: number;
  search: number;
}

interface WavyAreaChartProps {
  title?: string;
  subtitle?: string;
  height?: number;
  reportHref?: string;
  weeklyData?: ChartDataPoint[];
  monthlyData?: ChartDataPoint[];
  yearlyData?: ChartDataPoint[];
  totalConverted?: number;
}

const DEFAULT_MONTHLY: ChartDataPoint[] = [
  { name: 'Jan', direct: 0, links: 0, search: 0 },
  { name: 'Feb', direct: 0, links: 0, search: 0 },
  { name: 'Mar', direct: 0, links: 0, search: 0 },
  { name: 'Apr', direct: 0, links: 0, search: 0 },
  { name: 'May', direct: 0, links: 0, search: 0 },
  { name: 'Jun', direct: 0, links: 0, search: 0 },
  { name: 'Jul', direct: 0, links: 0, search: 0 },
  { name: 'Aug', direct: 0, links: 0, search: 0 },
  { name: 'Sep', direct: 0, links: 0, search: 0 },
  { name: 'Oct', direct: 0, links: 0, search: 0 },
  { name: 'Nov', direct: 0, links: 0, search: 0 },
  { name: 'Dec', direct: 0, links: 0, search: 0 },
];

const DEFAULT_WEEKLY: ChartDataPoint[] = [
  { name: 'Mon', direct: 0, links: 0, search: 0 },
  { name: 'Tue', direct: 0, links: 0, search: 0 },
  { name: 'Wed', direct: 0, links: 0, search: 0 },
  { name: 'Thu', direct: 0, links: 0, search: 0 },
  { name: 'Fri', direct: 0, links: 0, search: 0 },
  { name: 'Sat', direct: 0, links: 0, search: 0 },
  { name: 'Sun', direct: 0, links: 0, search: 0 },
];

const DEFAULT_YEARLY: ChartDataPoint[] = [
  { name: '2024', direct: 0, links: 0, search: 0 },
  { name: '2025', direct: 0, links: 0, search: 0 },
  { name: '2026', direct: 0, links: 0, search: 0 },
];

const SERIES: ChartSeries[] = [
  { key: 'direct', label: 'Direct Traffic', color: '#18181b' },
  { key: 'links', label: 'Referral Links', color: '#71717a' },
  { key: 'search', label: 'Search & Converted', color: '#a1a1aa' },
];

export const WavyAreaChart: React.FC<WavyAreaChartProps> = ({
  title = "New visitors",
  subtitle = "Lead volume & acquisition channels over time",
  height = 250,
  reportHref = "/leads",
  weeklyData,
  monthlyData,
  yearlyData,
  totalConverted: customTotalConverted,
}) => {
  const [timeframe, setTimeframe] = useState<'Week' | 'Month' | 'Year'>('Month');

  const chartData =
    timeframe === 'Week'
      ? (weeklyData && weeklyData.length > 0 ? weeklyData : DEFAULT_WEEKLY)
      : timeframe === 'Year'
      ? (yearlyData && yearlyData.length > 0 ? yearlyData : DEFAULT_YEARLY)
      : (monthlyData && monthlyData.length > 0 ? monthlyData : DEFAULT_MONTHLY);

  const totalDirect = chartData.reduce((acc, row) => acc + (row.direct || 0), 0);
  const totalLinks = chartData.reduce((acc, row) => acc + (row.links || 0), 0);
  const totalSearch = chartData.reduce((acc, row) => acc + (row.search || 0), 0);
  const totalTraffic = totalDirect + totalLinks + totalSearch;
  const converted = customTotalConverted ?? totalSearch;

  const funnelStages = [
    { label: 'All Visitors', value: totalTraffic, color: '#18181b' },
    { label: 'Direct Traffic', value: totalDirect, color: '#27272a' },
    { label: 'Referral Clicks', value: totalLinks, color: '#3f3f46' },
    { label: 'Search Queries', value: totalSearch, color: '#52525b' },
    { label: 'Converted Leads', value: converted, color: '#71717a' },
  ];

  return (
    <ChartSwitcher
      title={title}
      subtitle={subtitle}
      data={chartData}
      xAxisKey="name"
      series={SERIES}
      funnelStages={funnelStages}
      defaultMode="area"
      height={height}
      spotlightColor="#71717a"
      showLegend={false}
      headerRight={
        <div className="flex items-center gap-2">
          {/* Timeframe Toggle Pills */}
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
      }
      footer={
        <div className="mt-3 pt-3 border-t border-border/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-100 shadow-2xs"></span>
              <span className="text-muted-foreground font-semibold">Direct Traffic</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-600 dark:bg-zinc-400 shadow-2xs"></span>
              <span className="text-muted-foreground font-semibold">Referral Links</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600 shadow-2xs"></span>
              <span className="text-muted-foreground font-semibold">Search &amp; Converted</span>
            </div>
          </div>

          <Link
            href={reportHref}
            className="flex items-center gap-1 text-[11px] font-bold text-foreground hover:text-foreground transition-colors hover:underline"
          >
            <span>View report</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      }
    />
  );
};

export default WavyAreaChart;
