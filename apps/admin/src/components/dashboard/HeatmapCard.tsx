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
  if (val < 40) return 'bg-slate-100 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700';
  if (val < 150) return 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-900';
  if (val < 350) return 'bg-blue-200 dark:bg-blue-900/90 text-blue-900 dark:text-blue-100 hover:bg-blue-300 dark:hover:bg-blue-800';
  if (val < 600) return 'bg-blue-500 dark:bg-blue-600 text-white hover:bg-blue-600 shadow-2xs';
  if (val < 800) return 'bg-blue-600 dark:bg-blue-500 text-white font-medium hover:bg-blue-700 shadow-xs';
  return 'bg-blue-700 dark:bg-blue-400 text-white dark:text-slate-950 font-bold hover:bg-blue-800 shadow-sm';
}

export const HeatmapCard: React.FC<HeatmapCardProps> = ({ title = "Leads by Time of Day" }) => {
  return (
    <div className="admin-card p-4 sm:p-5 flex flex-col justify-between h-full group transform-gpu">
      {/* Card Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground font-heading">{title}</h3>
          <p className="text-[11px] text-muted-foreground font-medium">Hourly lead volume density (UTC)</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/60 px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></span>
          <span>Live Aggregation</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto my-auto py-1">
        <div className="min-w-[480px]">
          {/* Hour labels header */}
          <div className="grid grid-cols-[40px_repeat(12,1fr)] gap-1 mb-1.5 text-center">
            <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Day</div>
            {HOURS.map((h, idx) => (
              <div key={idx} className="text-[9px] font-semibold text-muted-foreground">
                {h}
              </div>
            ))}
          </div>

          {/* Rows for each day */}
          <div className="space-y-1">
            {DAYS.map((day, dIdx) => (
              <div key={dIdx} className="grid grid-cols-[40px_repeat(12,1fr)] gap-1 items-center">
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 pl-0.5">{day}</span>
                {HEATMAP_DATA[dIdx].map((val, hIdx) => (
                  <div
                    key={hIdx}
                    title={`${day} @ ${HOURS[hIdx]}: ${val} leads`}
                    className={`h-6 sm:h-6.5 rounded-md transition-all duration-150 transform-gpu hover:scale-105 hover:z-10 flex items-center justify-center cursor-pointer ${getCellColorClass(
                      val
                    )}`}
                  >
                    <span className="text-[8px] opacity-0 hover:opacity-100 transition-opacity font-bold">
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compact Dot-Size Scale Legend */}
      <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">
          Density Scale
        </span>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            <span className="text-[10px] font-semibold text-foreground">&lt;40</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-200 dark:bg-blue-900"></span>
            <span className="text-[10px] font-semibold text-foreground">150</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-400 dark:bg-blue-600"></span>
            <span className="text-[10px] font-semibold text-foreground">350</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-500"></span>
            <span className="text-[10px] font-semibold text-foreground">600</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded-full bg-blue-700 dark:bg-blue-400 shadow-2xs"></span>
            <span className="text-[10px] font-semibold text-foreground">800+</span>
          </div>
        </div>
      </div>
    </div>
  );
};
