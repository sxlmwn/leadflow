'use client';

import React from 'react';
import { Users, DollarSign, TrendingUp, Building2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { SpotlightCard, SpotlightCardGroup } from '@/components/ui/spotlight-card';

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
      color: '#2563eb', // Royal Blue
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
      color: '#10b981', // Emerald Green
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'conv_rate',
      label: 'Conv Rate',
      value: `${stats.soldPercent ? stats.soldPercent : 2.85}%`,
      change: '+3.44%',
      isPositive: true,
      subtitle: 'from last week',
      icon: TrendingUp,
      color: '#8b5cf6', // Violet/Purple
      iconBg: 'bg-purple-50 dark:bg-purple-950/60',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      id: 'active_brands',
      label: 'Active Brands',
      value: `${stats.activeBrands ? stats.activeBrands : 3}`,
      change: '+1.89%',
      isPositive: true,
      subtitle: 'from last week',
      icon: Building2,
      color: '#0ea5e9', // Sky Blue
      iconBg: 'bg-sky-50 dark:bg-sky-950/60',
      iconColor: 'text-sky-600 dark:text-sky-400',
    },
  ];

  return (
    <SpotlightCardGroup className="grid grid-cols-2 gap-3.5 h-full">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <SpotlightCard
            key={item.id}
            id={item.id}
            color={item.color}
            tiltMax={8}
            className="p-4 sm:p-5 flex flex-col justify-between h-full"
          >
            {/* Top: Circular Icon Badge */}
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`w-7 h-7 rounded-full ${item.iconBg} ${item.iconColor} border border-border/60 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-110 transition-transform duration-200`}
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
          </SpotlightCard>
        );
      })}
    </SpotlightCardGroup>
  );
};

export default StatGridCard;
