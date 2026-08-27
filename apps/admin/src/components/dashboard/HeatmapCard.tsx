'use client';

import React from 'react';

interface HeatmapCardProps {
  title?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = ['12am', '2am', '4am', '6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm', '10pm'];

const HEATMAP_DATA: number[][] = [
  [10, 15, 12, 20, 45, 90, 150, 180, 140, 110, 75, 30],
  [25, 18, 22, 65, 230, 520, 780, 840, 790, 610, 320, 95],
  [30, 20, 25, 70, 260, 590, 890, 920, 850, 680, 350, 110],
  [28, 22, 20, 75, 280, 610, 910, 950, 880, 710, 380, 120],
  [32, 25, 24, 72, 270, 580, 860, 890, 830, 660, 340, 105],
  [20, 18, 19, 60, 210, 490, 720, 750, 690, 520, 280, 85],
  [15, 12, 10, 25, 60, 120, 210, 240, 190, 140, 90, 40],
];

function getCellColorClass(val: number): string {
  if (val < 40) return 'bg-slate-100 dark:bg-zinc-800/80 text-slate-400 dark:text-zinc-500';
  if (val < 150) return 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-200';
  if (val < 350) return 'bg-blue-200 dark:bg-blue-900/90 text-blue-900 dark:text-blue-100';
  if (val < 600) return 'bg-blue-400 dark:bg-blue-600 text-white';
  if (val < 800) return 'bg-blue-600 dark:bg-blue-500 text-white font-medium';
  return 'bg-blue-700 dark:bg-blue-400 text-white dark:text-zinc-950 font-bold';
}

export const HeatmapCard: React.FC<HeatmapCardProps> = ({ title = "Leads by Time of Day" }) => {
  return (
    <div className="admin-card p-6 flex flex-col justify-between h-full">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 font-heading">{title}</h3>
          <p className="text-xs text-slate-400 dark:text-zinc-400 font-medium">Hourly lead density breakdown (UTC)</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/60 dark:border-zinc-700 px-2.5 py-1 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></span>
          <span>Live Aggregation</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto my-auto py-2">
        <div className="min-w-[540px]">
          {/* Hour labels header */}
          <div className="grid grid-cols-[48px_repeat(12,1fr)] gap-1.5 mb-2 text-center">
            <div className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">Day</div>
            {HOURS.map((h, idx) => (
              <div key={idx} className="text-[10px] font-semibold text-slate-400 dark:text-zinc-500">
                {h}
              </div>
            ))}
          </div>

          {/* Rows for each day */}
          <div className="space-y-1.5">
            {DAYS.map((day, dIdx) => (
              <div key={dIdx} className="grid grid-cols-[48px_repeat(12,1fr)] gap-1.5 items-center">
                <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 pl-1">{day}</span>
                {HEATMAP_DATA[dIdx].map((val, hIdx) => (
                  <div
                    key={hIdx}
                    title={`${day} @ ${HOURS[hIdx]}: ${val} leads`}
                    className={`h-7 rounded-lg transition-all duration-150 transform hover:scale-105 hover:z-10 flex items-center justify-center cursor-pointer ${getCellColorClass(
                      val
                    )}`}
                  >
                    <span className="text-[9px] opacity-0 hover:opacity-100 transition-opacity">
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend at Bottom (Gotics style from 2.jpg) */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
        <span className="font-medium text-[11px] text-slate-400 dark:text-zinc-500">Density Scale</span>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700"></span>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-zinc-300">50</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-blue-100 dark:bg-blue-950"></span>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-zinc-300">200</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-blue-300 dark:bg-blue-800"></span>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-zinc-300">400</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-blue-500 dark:bg-blue-600"></span>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-zinc-300">600</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-blue-700 dark:bg-blue-400"></span>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-zinc-300">800+</span>
          </div>
        </div>
      </div>
    </div>
  );
};
