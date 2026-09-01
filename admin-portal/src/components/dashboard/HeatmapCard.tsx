'use client';

import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';

interface HeatmapCardProps {
  title?: string;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = ['12am', '2am', '4am', '6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm', '10pm'];

// 7 days x 12 intervals realistic traffic density
const HEATMAP_DATA: number[][] = [
  [12, 18, 15, 25, 60, 120, 190, 240, 180, 140, 95, 40],
  [28, 20, 24, 75, 290, 620, 890, 960, 880, 710, 390, 110],
  [35, 22, 28, 80, 310, 680, 940, 990, 910, 740, 420, 130],
  [32, 25, 22, 85, 330, 710, 960, 1020, 930, 780, 450, 140],
  [38, 28, 26, 82, 320, 670, 920, 950, 890, 730, 410, 125],
  [25, 20, 22, 70, 260, 560, 810, 850, 780, 610, 340, 100],
  [18, 15, 12, 30, 80, 160, 270, 310, 250, 180, 120, 50],
];

// 5-tier GitHub / Heatmap shade intensity scale matching 4.jpg & 1.jpg
function getCellShadeClass(val: number): { bg: string; border: string } {
  if (val < 50) {
    return {
      bg: 'bg-secondary/80 dark:bg-neutral-900/60 hover:bg-slate-200 dark:hover:bg-neutral-800',
      border: 'border-transparent',
    };
  }
  if (val < 200) {
    return {
      bg: 'bg-blue-100 dark:bg-blue-950/70 hover:bg-blue-200 dark:hover:bg-blue-900',
      border: 'border-blue-200/40 dark:border-blue-900/40',
    };
  }
  if (val < 400) {
    return {
      bg: 'bg-blue-300 dark:bg-blue-800/80 hover:bg-blue-400 dark:hover:bg-blue-700',
      border: 'border-blue-300/50 dark:border-blue-700/50',
    };
  }
  if (val < 700) {
    return {
      bg: 'bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-500',
      border: 'border-blue-500/60 dark:border-blue-500/60',
    };
  }
  return {
    bg: 'bg-blue-700 dark:bg-blue-500 hover:bg-blue-800 dark:hover:bg-blue-400 shadow-xs shadow-blue-500/30',
    border: 'border-blue-600 dark:border-blue-400',
  };
}

export const HeatmapCard: React.FC<HeatmapCardProps> = ({ title = "User by time of day" }) => {
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: string; val: number } | null>(null);

  return (
    <SpotlightCard
      color="#3b82f6"
      tiltMax={4}
      className="p-4 sm:p-6 flex flex-col justify-between h-full group"
    >
      {/* Card Header matching 1.jpg */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground font-heading">
            {title}
          </h3>
          <p className="text-[11px] text-muted-foreground font-medium">
            {hoveredCell
              ? `${hoveredCell.day} @ ${hoveredCell.hour}: ${hoveredCell.val.toLocaleString()} active leads`
              : 'Hourly lead & visitor traffic density (UTC)'}
          </p>
        </div>

        <button
          type="button"
          className="w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors cursor-pointer"
          title="More options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* GitHub-style Tiling Matrix Grid (4.jpg & 1.jpg style) */}
      <div className="overflow-x-auto my-auto py-1">
        <div className="min-w-[500px]">
          {/* Day rows + grid cells */}
          <div className="space-y-1.5">
            {DAYS.map((day, dIdx) => (
              <div key={day} className="grid grid-cols-[38px_repeat(12,1fr)] gap-1.5 items-center">
                <span className="text-[11px] font-semibold text-muted-foreground">{day}</span>
                {HEATMAP_DATA[dIdx].map((val, hIdx) => {
                  const { bg, border } = getCellShadeClass(val);
                  return (
                    <div
                      key={hIdx}
                      onMouseEnter={() => setHoveredCell({ day, hour: HOURS[hIdx], val })}
                      onMouseLeave={() => setHoveredCell(null)}
                      title={`${day} @ ${HOURS[hIdx]}: ${val} leads`}
                      className={`h-5 sm:h-5.5 rounded-[5px] border ${border} transition-all duration-150 transform-gpu hover:scale-115 hover:z-20 cursor-pointer ${bg}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Hour labels footer row */}
          <div className="grid grid-cols-[38px_repeat(12,1fr)] gap-1.5 mt-2.5 text-center">
            <div />
            {HOURS.map((h, idx) => (
              <div key={idx} className="text-[10px] font-medium text-muted-foreground truncate">
                {h}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gradient / Multi-Segment Density Bar Scale (matching 1.jpg bottom legend) */}
      <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between text-xs">
        <span className="text-[11px] font-bold text-muted-foreground">50</span>
        <div className="flex-1 mx-3 h-1.5 rounded-full bg-gradient-to-r from-slate-200 via-blue-300 to-blue-700 dark:from-slate-800 dark:via-blue-600 dark:to-blue-400 overflow-hidden" />
        <div className="flex items-center gap-6 text-[11px] font-bold text-muted-foreground">
          <span>200</span>
          <span>400</span>
          <span>600</span>
          <span className="text-foreground">800+</span>
        </div>
      </div>
    </SpotlightCard>
  );
};

export default HeatmapCard;
