'use client';

import React from 'react';
import { CircularProgressRing } from '@/components/ui/circular-progress-ring';
import { MoreHorizontal, Home, Stethoscope, HeartPulse } from 'lucide-react';

interface DonutRingWidgetProps {
  title?: string;
  percentage?: number;
  label?: string;
  soldCount?: number;
  unsoldCount?: number;
  totalLeads?: number;
  breakdowns?: Array<{
    name: string;
    percent: string;
    leads: string;
    color: string;
    icon?: any;
  }>;
}

export const DonutRingWidget: React.FC<DonutRingWidgetProps> = ({
  title = "Sold vs Unsold",
  percentage = 78,
  label = "Sold Ratio",
  soldCount = 111,
  totalLeads = 142,
  breakdowns
}) => {
  const brandBreakdowns = breakdowns || [
    {
      name: 'Direct Funnel Leads',
      percent: '55%',
      leads: `${Math.round(soldCount * 0.55)} leads`,
      color: 'bg-zinc-900 dark:bg-zinc-100',
      icon: Home,
    },
    {
      name: 'Partner Network',
      percent: '30%',
      leads: `${Math.round(soldCount * 0.30)} leads`,
      color: 'bg-zinc-600 dark:bg-zinc-400',
      icon: Stethoscope,
    },
    {
      name: 'Organic / Referral',
      percent: '15%',
      leads: `${Math.round(soldCount * 0.15)} leads`,
      color: 'bg-zinc-400 dark:bg-zinc-600',
      icon: HeartPulse,
    },
  ];

  return (
    <div className="admin-card p-4 sm:p-5 flex flex-col justify-between h-full group transform-gpu">
      {/* Card Header matching Readiness reference: Section Title (Left) + More Menu (Right) */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground font-heading">{title}</h3>
          <p className="text-[11px] text-muted-foreground font-medium">Conversion distribution</p>
        </div>
        <button
          type="button"
          className="w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors cursor-pointer"
          title="More options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Big Center Progress Ring (Readiness Style: Physical Dial, Rounded Stroke, Caption on Top, Bold Number Below) */}
      <div className="py-3 flex flex-col items-center justify-center">
        <CircularProgressRing
          value={percentage}
          size={144}
          strokeWidth={11}
          label={label}
          displayValue={`${Math.round(percentage)}%`}
          subtitle={`${soldCount} / ${totalLeads} sold`}
          color={['#18181b', '#71717a']}
          showShadow={true}
        />
      </div>

      {/* Channel Breakdown Rows (Clean single-line format) */}
      <div className="mt-2 pt-3 border-t border-border space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 flex items-center justify-between">
          <span>Channel Breakdown</span>
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">+8.4% WoW</span>
        </div>
        {brandBreakdowns.map((b, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-1 text-xs hover:bg-secondary/60 px-1.5 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${b.color} shadow-2xs`} />
              <span className="text-xs font-semibold text-foreground truncate max-w-[150px] sm:max-w-[170px]">
                {b.name}
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="text-muted-foreground">{b.leads}</span>
              <span className="font-bold text-foreground">{b.percent}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutRingWidget;
