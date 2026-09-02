'use client';

import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';

interface HeatmapCardProps {
  title?: string;
  data?: number[][];
  totalEvents?: number;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const HOURS = ['12am', '2am', '4am', '6am', '8am', '10am', '12pm', '2pm', '4pm', '6pm', '8pm', '10pm'];

const EMPTY_HEATMAP: number[][] = Array(7).fill(0).map(() => Array(12).fill(0));

export const HeatmapCard: React.FC<HeatmapCardProps> = ({
  title = "User by time of day",
  data = EMPTY_HEATMAP,
  totalEvents = 0,
}) => {
  const [hoveredCell, setHoveredCell] = useState<{ day: string; hour: string; val: number } | null>(null);

  // Compute max value in data to scale shade intensity dynamically
  const maxVal = Math.max(...data.map(row => Math.max(...row)), 0);

  function getCellShade(val: number): { bg: string; border: string } {
    if (val <= 0 || maxVal === 0) {
      return {
        bg: 'bg-slate-100 hover:bg-slate-200/90 dark:bg-white/[0.04] dark:hover:bg-white/[0.08]',
        border: 'border-slate-200/60 dark:border-white/[0.06]',
      };
    }
    const ratio = val / maxVal;
    if (ratio <= 0.25) {
      return {
        bg: 'bg-zinc-300 hover:bg-zinc-400 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-foreground dark:text-zinc-300',
        border: 'border-zinc-400/50 dark:border-zinc-700',
      };
    }
    if (ratio <= 0.5) {
      return {
        bg: 'bg-zinc-500 hover:bg-zinc-600 dark:bg-zinc-600 dark:hover:bg-zinc-500 text-white dark:text-zinc-100',
        border: 'border-zinc-600/60 dark:border-zinc-500',
      };
    }
    if (ratio <= 0.75) {
      return {
        bg: 'bg-zinc-700 hover:bg-zinc-800 dark:bg-zinc-400 dark:hover:bg-zinc-300 text-white dark:text-zinc-900',
        border: 'border-zinc-800/80 dark:border-zinc-300',
      };
    }
    return {
      bg: 'bg-zinc-950 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs dark:shadow-[0_0_12px_rgba(255,255,255,0.3)]',
      border: 'border-black dark:border-white',
    };
  }

  const t1 = Math.max(1, Math.round(maxVal * 0.25));
  const t2 = Math.max(2, Math.round(maxVal * 0.5));
  const t3 = Math.max(3, Math.round(maxVal * 0.75));

  return (
    <SpotlightCard
      color="#71717a"
      tiltMax={4}
      className="p-4 sm:p-6 flex flex-col justify-between h-full group"
    >
      {/* Card Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foreground font-heading">
            {title}
          </h3>
          <p className="text-[11px] text-muted-foreground font-medium">
            {hoveredCell
              ? `${hoveredCell.day} @ ${hoveredCell.hour}: ${hoveredCell.val.toLocaleString()} events`
              : totalEvents > 0
              ? `${totalEvents.toLocaleString()} real activity events mapped by UTC hour`
              : 'Hourly lead & visitor traffic density (UTC)'}
          </p>
        </div>

        <button
          type="button"
          className="min-w-[36px] min-h-[36px] rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors cursor-pointer"
          title="More options"
          aria-label="More options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* GitHub-style Tiling Matrix Grid */}
      <div className="overflow-x-auto my-auto py-1">
        <div className="min-w-[480px]">
          {/* Day rows + grid cells */}
          <div className="space-y-1.5">
            {DAYS.map((day, dIdx) => (
              <div key={day} className="grid grid-cols-[38px_repeat(12,1fr)] gap-1.5 items-center">
                <span className="text-[11px] font-semibold text-muted-foreground">{day}</span>
                {(data[dIdx] || Array(12).fill(0)).map((val, hIdx) => {
                  const { bg, border } = getCellShade(val);
                  return (
                    <div
                      key={hIdx}
                      onMouseEnter={() => setHoveredCell({ day, hour: HOURS[hIdx], val })}
                      onMouseLeave={() => setHoveredCell(null)}
                      title={`${day} @ ${HOURS[hIdx]}: ${val} event${val === 1 ? '' : 's'}`}
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

      {/* Dynamic Density Stepped Legend */}
      <div className="mt-4 pt-3 border-t border-border/70 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-muted-foreground">Activity:</span>
          <span className="text-[10px] font-semibold text-muted-foreground">0</span>
        </div>
        <div className="flex-1 mx-3 flex items-center justify-center gap-1.5 max-w-[200px]">
          <div className="h-3.5 flex-1 rounded-[4px] bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.06]" title="0 events (None)" />
          <div className="h-3.5 flex-1 rounded-[4px] bg-zinc-300 dark:bg-zinc-800 border border-zinc-400/50 dark:border-zinc-700" title={`1 - ${t1} events (Low)`} />
          <div className="h-3.5 flex-1 rounded-[4px] bg-zinc-500 dark:bg-zinc-600 border border-zinc-600/60 dark:border-zinc-500" title={`${t1 + 1} - ${t2} events (Medium)`} />
          <div className="h-3.5 flex-1 rounded-[4px] bg-zinc-700 dark:bg-zinc-400 border border-zinc-800/80 dark:border-zinc-300" title={`${t2 + 1} - ${t3} events (High)`} />
          <div className="h-3.5 flex-1 rounded-[4px] bg-zinc-950 dark:bg-white border border-black dark:border-white shadow-xs dark:shadow-[0_0_8px_rgba(255,255,255,0.3)]" title={`${t3 + 1}+ events (Peak)`} />
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground">
          <span>Peak</span>
          <span className="text-foreground ml-0.5">({maxVal > 0 ? `${maxVal}+` : '4+'})</span>
        </div>
      </div>
    </SpotlightCard>
  );
};

export default HeatmapCard;
