'use client';

import React, { useState } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Maximize2,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { SpotlightCard, SpotlightCardGroup } from '@/components/ui/spotlight-card';
import { ExpandableModal } from '@/components/ui/expandable-card';
import Link from 'next/link';

interface StatGridCardProps {
  stats: {
    totalLeadsToday: number;
    soldPercent: number;
    estRevenue: number;
    activeBrands: number;
    totalVisitors?: number;
    dncFlaggedCount?: number;
  };
}

export const StatGridCard: React.FC<StatGridCardProps> = ({ stats }) => {
  const [activeModalId, setActiveModalId] = useState<string | null>(null);

  const totalVisitors = stats.totalVisitors ?? (stats.totalLeadsToday > 0 ? stats.totalLeadsToday : 0);

  const items = [
    {
      id: 'stat-users',
      label: 'Ingested Leads',
      value: stats.totalLeadsToday.toLocaleString(),
      change: stats.totalLeadsToday > 0 ? 'Live database' : 'No records yet',
      isPositive: stats.totalLeadsToday > 0,
      subtitle: 'total leads',
      icon: Users,
      color: '#71717a',
      iconBg: 'bg-secondary',
      iconColor: 'text-foreground',
      detailedTitle: 'Lead Ingestion Telemetry',
      deepDive: [
        { label: 'Total Ingested Leads', value: `${stats.totalLeadsToday} leads`, change: 'Real database' },
        { label: 'Total Visitor Clicks', value: `${totalVisitors} clicks`, change: 'Tracking logs' },
        { label: 'Active Funnel Brands', value: `${stats.activeBrands} brands`, change: 'Live schema' },
        { label: 'Flagged / Blocked', value: `${stats.dncFlaggedCount || 0} leads`, change: 'DNC Guard' },
      ],
      actionHref: '/leads',
      actionText: 'Inspect Live Leads',
    },
    {
      id: 'stat-revenue',
      label: 'Revenue',
      value: `$${Number(stats.estRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: stats.estRevenue > 0 ? 'Gross realized' : '$0.00 realized',
      isPositive: stats.estRevenue > 0,
      subtitle: 'total sold',
      icon: DollarSign,
      color: '#71717a',
      iconBg: 'bg-secondary',
      iconColor: 'text-foreground',
      detailedTitle: 'Revenue & Buyer Monetization',
      deepDive: [
        { label: 'Gross Sold Revenue', value: `$${Number(stats.estRevenue || 0).toFixed(2)}`, change: 'Buyer deliveries' },
        { label: 'Sold Conversion Ratio', value: `${stats.soldPercent.toFixed(1)}%`, change: 'Sold rate' },
        { label: 'Active Brands Monitored', value: `${stats.activeBrands}`, change: 'Funnels active' },
        { label: 'Ingested Lead Volume', value: `${stats.totalLeadsToday}`, change: 'Submissions' },
      ],
      actionHref: '/deliveries',
      actionText: 'View Buyer Deliveries',
    },
    {
      id: 'stat-conv-rate',
      label: 'Conv Rate',
      value: `${stats.soldPercent.toFixed(1)}%`,
      change: stats.soldPercent > 0 ? 'Conversion health' : '0.0% converted',
      isPositive: stats.soldPercent > 0,
      subtitle: 'sold / ingested',
      icon: TrendingUp,
      color: '#71717a',
      iconBg: 'bg-secondary',
      iconColor: 'text-foreground',
      detailedTitle: 'Conversion Pipeline Health',
      deepDive: [
        { label: 'Buyer Sold Rate', value: `${stats.soldPercent.toFixed(1)}%`, change: 'Sold conversions' },
        { label: 'Total Ingested Leads', value: `${stats.totalLeadsToday}`, change: 'Real database' },
        { label: 'Active Brands', value: `${stats.activeBrands}`, change: 'Live funnels' },
        { label: 'DNC Scrubbed / Filtered', value: `${stats.dncFlaggedCount || 0}`, change: 'Compliance check' },
      ],
      actionHref: '/leads',
      actionText: 'View Conversion Audits',
    },
    {
      id: 'stat-active-brands',
      label: 'Active Brands',
      value: `${stats.activeBrands}`,
      change: stats.activeBrands > 0 ? 'Active in system' : 'None active',
      isPositive: stats.activeBrands > 0,
      subtitle: 'live funnels',
      icon: Building2,
      color: '#71717a',
      iconBg: 'bg-secondary',
      iconColor: 'text-foreground',
      detailedTitle: 'Brand Network Infrastructure',
      deepDive: [
        { label: 'Live Funnel Brands', value: `${stats.activeBrands} brands`, change: 'Real-time sync' },
        { label: 'Total Submissions', value: `${stats.totalLeadsToday} leads`, change: 'All-time leads' },
        { label: 'Visitor Sessions', value: `${totalVisitors} clicks`, change: 'Click tracker' },
        { label: 'Gross Revenue', value: `$${Number(stats.estRevenue || 0).toFixed(2)}`, change: 'Payout sum' },
      ],
      actionHref: '/brands',
      actionText: 'Manage Brand Funnels',
    },
  ];

  const activeItem = items.find((i) => i.id === activeModalId);

  return (
    <>
      <SpotlightCardGroup className="grid grid-cols-2 gap-3.5 h-full">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.id}
              layoutId={item.id}
              onClick={() => setActiveModalId(item.id)}
              className="h-full cursor-pointer group"
            >
              <SpotlightCard
                id={item.id}
                color={item.color}
                tiltMax={8}
                className="p-4 sm:p-5 flex flex-col justify-between h-full group-hover:border-neutral-700/60 transition-all duration-200"
              >
                {/* Top: Circular Icon Badge + Expand hint */}
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-7 h-7 rounded-full ${item.iconBg} ${item.iconColor} border border-border/60 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-110 transition-transform duration-200`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md text-muted-foreground hover:text-foreground">
                    <Maximize2 className="w-3 h-3" />
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
            </motion.div>
          );
        })}
      </SpotlightCardGroup>

      {/* Morphing Expandable Modal using Aceternity shared-element layoutId */}
      {activeItem && (
        <ExpandableModal
          isOpen={Boolean(activeModalId)}
          onClose={() => setActiveModalId(null)}
          layoutId={activeItem.id}
          maxWidth="max-w-lg"
        >
          <div className="p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className={`w-10 h-10 rounded-xl ${activeItem.iconBg} ${activeItem.iconColor} border border-border/60 flex items-center justify-center shrink-0`}>
                <activeItem.icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-heading text-foreground">{activeItem.detailedTitle}</h3>
                <p className="text-xs text-muted-foreground">Live real-time telemetry from LeadFlow Core</p>
              </div>
            </div>

            {/* Current Value Highlight */}
            <div className="p-4 rounded-xl bg-secondary/50 border border-border flex items-center justify-between mb-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Current Aggregation
                </span>
                <span className="text-3xl font-extrabold font-heading text-foreground mt-0.5 block">
                  {activeItem.value}
                </span>
              </div>
              <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                {activeItem.change} {activeItem.subtitle}
              </div>
            </div>

            {/* Metric Deep Dive Grid */}
            <div className="space-y-2 mb-6">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                Telemetry Breakdown
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                {activeItem.deepDive.map((d, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-secondary/30 border border-border">
                    <span className="text-[10px] text-muted-foreground block font-medium">{d.label}</span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-sm font-bold text-foreground">{d.value}</span>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{d.change}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Action Navigation */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <span className="text-[11px] text-muted-foreground">Updated in real-time</span>
              <Link
                href={activeItem.actionHref}
                onClick={() => setActiveModalId(null)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-xs font-bold transition-colors shadow-xs"
              >
                <span>{activeItem.actionText}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </ExpandableModal>
      )}
    </>
  );
};

export default StatGridCard;
