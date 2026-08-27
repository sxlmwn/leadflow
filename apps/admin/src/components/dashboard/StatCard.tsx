'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  subtitle?: string;
  iconBgColor?: string;
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  subtitle,
  iconBgColor = "bg-blue-50 dark:bg-blue-950/40",
  iconColor = "text-blue-600 dark:text-blue-400"
}) => {
  return (
    <div className="admin-card p-5 flex flex-col justify-between group">
      {/* Top row: Icon badge + Title + Change % */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl ${iconBgColor} ${iconColor} flex items-center justify-center font-semibold shrink-0`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
            {title}
          </span>
        </div>

        {change && (
          <div
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
              isPositive
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900/60'
                : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-900/60'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>{change}</span>
          </div>
        )}
      </div>

      {/* Main Big Number */}
      <div className="mt-4">
        <div className="text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-zinc-100 tracking-tight font-heading">
          {value}
        </div>
        {subtitle && (
          <p className="text-[11px] text-slate-400 dark:text-zinc-400 font-medium mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};
