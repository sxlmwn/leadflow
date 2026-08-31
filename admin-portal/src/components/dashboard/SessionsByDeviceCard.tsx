'use client';

import React from 'react';
import { MoreHorizontal, User, Laptop, Smartphone, Tablet } from 'lucide-react';

interface SessionsByDeviceCardProps {
  title?: string;
  totalVisitors?: number | string;
  breakdowns?: Array<{
    device: string;
    percentage: number;
    count?: number | string;
    icon: any;
    color: string;
  }>;
}

export const SessionsByDeviceCard: React.FC<SessionsByDeviceCardProps> = ({
  title = "Sessions by device",
  totalVisitors = "10,739",
  breakdowns = [
    {
      device: 'Desktop',
      percentage: 78.5,
      count: '8,430',
      icon: Laptop,
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      device: 'Mobile',
      percentage: 19.7,
      count: '2,115',
      icon: Smartphone,
      color: 'text-sky-500 dark:text-sky-400',
    },
    {
      device: 'Tablet',
      percentage: 1.8,
      count: '194',
      icon: Tablet,
      color: 'text-blue-300 dark:text-blue-200',
    },
  ]
}) => {
  // Circular Ring geometry parameters
  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = 78.5; // Main segment percentage
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="admin-card p-4 sm:p-6 flex flex-col justify-between h-full group shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm sm:text-base font-bold text-foreground font-heading">
          {title}
        </h3>
        <button
          type="button"
          className="w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary flex items-center justify-center transition-colors cursor-pointer"
          title="More options"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Center Circular Progress Ring with centered number & icon (matching 1.jpg) */}
      <div className="flex flex-col items-center justify-center py-3 relative">
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            className="transform -rotate-90 overflow-visible"
          >
            <defs>
              <linearGradient id="deviceRingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>

            {/* Background Track Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="currentColor"
              className="text-slate-100 dark:text-slate-800/80"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Main Progress Arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#deviceRingGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-700 ease-out"
            />
          </svg>

          {/* Centered Number + Label (matching 1.jpg exact layout) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
            <User className="w-4 h-4 text-blue-600 dark:text-blue-400 mb-1 opacity-90" />
            <span className="text-2xl sm:text-3xl font-extrabold text-foreground font-heading tracking-tight leading-none">
              {totalVisitors}
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground mt-1">
              Total visitor
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown List Rows (matching 1.jpg bottom list) */}
      <div className="mt-2 pt-3 border-t border-border/70 space-y-2.5">
        {breakdowns.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.device}
              className="flex items-center justify-between text-xs py-0.5 hover:bg-secondary/40 px-1 rounded-lg transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${b.color} shrink-0`} />
                <span className="text-xs font-semibold text-foreground">{b.device}</span>
              </div>
              <div className="flex items-center gap-2 font-mono">
                {b.count && <span className="text-[11px] text-muted-foreground hidden sm:inline">{b.count}</span>}
                <span className="text-xs font-bold text-foreground">{b.percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SessionsByDeviceCard;
