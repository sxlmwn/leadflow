'use client';

import React from 'react';
import { GlowProgressRing } from '@/components/common/GlowProgressRing';

interface DonutRingWidgetProps {
  title?: string;
  percentage?: number;
  label?: string;
  soldCount?: number;
  unsoldCount?: number;
  totalLeads?: number;
}

export const DonutRingWidget: React.FC<DonutRingWidgetProps> = ({
  title = "Sold vs Unsold",
  percentage = 78,
  label = "SOLD RATIO",
  soldCount = 111,
  totalLeads = 142
}) => {
  return (
    <div className="admin-card p-6 flex flex-col justify-between h-full space-y-5">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 font-heading">{title}</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">Real-time distribution ratio</p>
        </div>
        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/60">
          <span>+8.4% WoW</span>
        </div>
      </div>

      {/* Main Large Blue Glowing Ring (Reference 3.jpg READINESS Style) */}
      <div className="py-2 flex flex-col items-center justify-center">
        <GlowProgressRing
          percentage={percentage}
          size={144}
          strokeWidth={11}
          label={label}
          valueText={`${percentage}%`}
          subtitle={`${soldCount} sold`}
          gradientColors={['#2563eb', '#60a5fa']}
        />
      </div>

      {/* Three Smaller Glowing Rings in a Row (Reference 3.jpg Food / Taxi / Gifts Style) */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
          Quality Verification Rings
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {/* Green Ring Card */}
          <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60">
            <GlowProgressRing
              percentage={92}
              size={48}
              strokeWidth={5}
              showCenterText={false}
              gradientColors={['#10b981', '#34d399']}
            />
            <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 mt-2">
              TCPA Pass
            </span>
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">92%</span>
          </div>

          {/* Blue Ring Card */}
          <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60">
            <GlowProgressRing
              percentage={80}
              size={48}
              strokeWidth={5}
              showCenterText={false}
              gradientColors={['#2563eb', '#60a5fa']}
            />
            <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 mt-2">
              DNC Clear
            </span>
            <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">80%</span>
          </div>

          {/* Purple Ring Card */}
          <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200/60 dark:border-zinc-700/60">
            <GlowProgressRing
              percentage={78}
              size={48}
              strokeWidth={5}
              showCenterText={false}
              gradientColors={['#8b5cf6', '#c4b5fd']}
            />
            <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200 mt-2">
              Score 80+
            </span>
            <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400">78%</span>
          </div>
        </div>
      </div>

      {/* Two Side-by-Side Stat Pills Below */}
      <div className="pt-2 grid grid-cols-2 gap-3 text-center">
        <div className="p-3 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            SOLD LEADS
          </span>
          <span className="text-lg font-extrabold text-slate-900 dark:text-zinc-100 font-heading mt-0.5 block">
            {soldCount.toLocaleString()}
          </span>
        </div>
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700/60">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-400">
            TOTAL LEADS
          </span>
          <span className="text-lg font-extrabold text-slate-800 dark:text-zinc-200 font-heading mt-0.5 block">
            {totalLeads.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};
