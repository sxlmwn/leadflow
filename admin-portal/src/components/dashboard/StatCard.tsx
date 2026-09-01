'use client';

import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { SpotlightCard } from '@/components/ui/spotlight-card';

interface StatCardProps {
  id?: string;
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  icon: LucideIcon;
  subtitle?: string;
  iconBgColor?: string;
  iconColor?: string;
  color?: string;
  compact?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  id,
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  subtitle = 'from last week',
  iconBgColor = 'bg-blue-50 dark:bg-blue-950/60',
  iconColor = 'text-blue-600 dark:text-blue-400',
  color = '#2563eb',
}) => {
  return (
    <SpotlightCard
      id={id || title}
      color={color}
      tiltMax={7}
      className="p-4 sm:p-5 flex flex-col justify-between h-full group"
    >
      {/* Top: Circular Icon Badge + Caption Label */}
      <div className="flex items-center gap-2 mb-1.5">
        <div
          className={`w-7 h-7 rounded-full ${iconBgColor} ${iconColor} border border-border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200 shadow-2xs`}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider truncate">
          {title}
        </span>
      </div>

      {/* Middle: Large Bold Number */}
      <div className="my-1">
        <div className="text-2xl sm:text-[26px] font-extrabold text-foreground tracking-tight font-heading group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
          {value}
        </div>
      </div>

      {/* Bottom: Trend Indicator Line */}
      <div className="flex items-center gap-1.5 text-[11px] font-semibold mt-1">
        {change && (
          <span
            className={`inline-flex items-center gap-0.5 font-bold ${
              isPositive
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{change}</span>
          </span>
        )}
        <span className="text-muted-foreground text-[10px] sm:text-[11px] font-medium truncate">
          {subtitle}
        </span>
      </div>
    </SpotlightCard>
  );
};

export default StatCard;
