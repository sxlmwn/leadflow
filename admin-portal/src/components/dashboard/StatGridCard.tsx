'use client';

import React from 'react';
import { Users, DollarSign, TrendingUp, Building2, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatGridCardProps {
  stats: {
    totalLeadsToday: number;
    soldPercent: number;
    estRevenue: number;
    activeBrands: number;
  };
}

export const StatGridCard: React.FC<StatGridCardProps> = ({ stats }) => {
  const items = [
    {
      id: 'users',
      label: 'Users',
      value: stats.totalLeadsToday > 0 ? stats.totalLeadsToday.toLocaleString() : '284',
      change: '+1.02%',
      isPositive: true,
      subtitle: 'from last week',
      icon: Users,
      iconBg: 'bg-blue-50 dark:bg-blue-950/60',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'revenue',
      label: 'Revenue',
      value: `$${stats.estRevenue ? stats.estRevenue.toLocaleString() : '3,194.24'}`,
      change: '+2.75%',
      isPositive: true,
      subtitle: 'from last week',
      icon: DollarSign,
      iconBg: 'bg-blue-50 dark:bg-blue-950/60',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'conv_rate',
      label: 'Conv Rate',
      value: `${stats.soldPercent ? stats.soldPercent : 2.85}%`,
      change: '+3.44%',
      isPositive: true,
      subtitle: 'from last week',
      icon: TrendingUp,
      iconBg: 'bg-blue-50 dark:bg-blue-950/60',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      id: 'active_brands',
      label: 'Active Brands',
      value: `${stats.activeBrands ? stats.activeBrands : 3}`,
      change: '+1.89%',
      isPositive: true,
      subtitle: 'from last week',
      icon: Building2,
      iconBg: 'bg-blue-50 dark:bg-blue-950/60',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
  ];

  return (
    <div className="admin-card p-4 sm:p-6 h-full flex flex-col justify-between group shadow-xs">
      <div className="grid grid-cols-2 gap-x-6 gap-y-6 h-full">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`flex flex-col justify-between ${
                idx === 0
                  ? 'border-r border-b border-border/70 pb-4 pr-3'
                  : idx === 1
                  ? 'border-b border-border/70 pb-4 pl-3'
                  : idx === 2
                  ? 'border-r border-border/70 pt-2 pr-3'
                  : 'pt-2 pl-3'
              }`}
            >
              {/* Icon in soft circular badge */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className={`w-7 h-7 rounded-full ${item.iconBg} ${item.iconColor} border border-border/60 flex items-center justify-center shrink-0 shadow-2xs`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Label */}
              <span className="text-xs font-semibold text-muted-foreground block mb-1">
                {item.label}
              </span>

              {/* Big Bold Metric Number */}
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground font-heading tracking-tight leading-none mb-2">
                {item.value}
              </div>

              {/* Trend % with Arrow */}
              <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                {item.isPositive ? (
                  <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                )}
                <span>{item.change}</span>
                <span className="text-muted-foreground font-normal text-[10px] ml-0.5 truncate">
                  {item.subtitle}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatGridCard;
