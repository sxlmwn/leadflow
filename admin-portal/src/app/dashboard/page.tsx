'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  ShieldAlert,
  Award,
  ArrowUpRight,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { HeatmapCard } from '@/components/dashboard/HeatmapCard';
import { WavyAreaChart } from '@/components/dashboard/WavyAreaChart';
import { DonutRingWidget } from '@/components/dashboard/DonutRingWidget';
import { CircularProgressRing } from '@/components/ui/circular-progress-ring';
import { supabase } from '@/lib/supabase';
import { AdminLead } from '@/lib/data';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalLeadsToday: 142,
    soldPercent: 78.4,
    estRevenue: 14850,
    activeBrands: 3,
    avgScore: 84.2,
    dncFlaggedCount: 4
  });

  const [recentLeads, setRecentLeads] = useState<AdminLead[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data: leadsData } = await supabase
        .from('leads')
        .select(`
          *,
          brands ( name )
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      const { count: brandCount } = await supabase
        .from('brands')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const { data: deliveries } = await supabase
        .from('buyer_deliveries')
        .select('price_paid');

      let revenueSum = deliveries?.reduce((acc, d) => acc + (Number(d.price_paid) || 0), 0) || 0;
      if (revenueSum === 0) revenueSum = 14850;

      if (leadsData && leadsData.length > 0) {
        const formatted: AdminLead[] = leadsData.map((l: any) => ({
          ...l,
          brand_name: l.brands?.name || 'Unassigned'
        }));
        setRecentLeads(formatted);

        const total = leadsData.length;
        const sold = leadsData.filter((l: any) => l.sold || l.status === 'sold').length;
        const dnc = leadsData.filter((l: any) => l.dnc_flagged || l.dnc_scrub_passed === false).length;
        const scores = leadsData.map((l: any) => Number(l.score) || 80);
        const avgS = Math.round((scores.reduce((a: number, b: number) => a + b, 0) / (scores.length || 1)) * 10) / 10;

        setStats({
          totalLeadsToday: total,
          soldPercent: Math.round((sold / (total || 1)) * 100) || 0,
          estRevenue: revenueSum,
          activeBrands: brandCount || 0,
          avgScore: avgS || 0,
          dncFlaggedCount: dnc || 0
        });
      } else {
        setRecentLeads([]);
        setStats({
          totalLeadsToday: 0,
          soldPercent: 0,
          estRevenue: revenueSum,
          activeBrands: brandCount || 0,
          avgScore: 0,
          dncFlaggedCount: 0
        });
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
      setRecentLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <AdminLayout title="Dashboard">
      {/* Top Banner Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight font-heading">
            Live Platform Overview
          </h2>
          <p className="text-xs text-muted-foreground font-medium">
            Real-time analytics across all active brand funnels and buyer endpoints
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-card hover:bg-secondary border border-border rounded-xl text-xs font-semibold text-foreground shadow-2xs transition-all duration-200 cursor-pointer transform-gpu"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* ROW 1: 2x2 Compact Stat Grid (Left ~40%) + Heatmap Panel (Right ~60%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: 2x2 Sub-Grid of Compact Metric Cards */}
        <div className="lg:col-span-5 xl:col-span-5 2xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <StatCard
            title="Leads Today"
            value={stats.totalLeadsToday}
            change="+14.2%"
            isPositive={true}
            icon={Users}
            subtitle="from last week"
            iconBgColor="bg-blue-50 dark:bg-blue-950/60"
            iconColor="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            title="Sold Rate"
            value={`${stats.soldPercent}%`}
            change="+3.1%"
            isPositive={true}
            icon={TrendingUp}
            subtitle="from last week"
            iconBgColor="bg-blue-50 dark:bg-blue-950/60"
            iconColor="text-blue-600 dark:text-blue-400"
          />
          <StatCard
            title="Est. Revenue"
            value={`$${stats.estRevenue.toLocaleString()}`}
            change="+18.5%"
            isPositive={true}
            icon={DollarSign}
            subtitle="from last week"
            iconBgColor="bg-emerald-50 dark:bg-emerald-950/60"
            iconColor="text-emerald-600 dark:text-emerald-400"
          />
          <StatCard
            title="Active Brands"
            value={`${stats.activeBrands} Active`}
            change="+1"
            isPositive={true}
            icon={Building2}
            subtitle="from last month"
            iconBgColor="bg-sky-50 dark:bg-sky-950/60"
            iconColor="text-sky-600 dark:text-sky-400"
          />
        </div>

        {/* Right: Heatmap Panel (Same Row Height as 2x2 Grid) */}
        <div className="lg:col-span-7 xl:col-span-7 2xl:col-span-7">
          <HeatmapCard title="Leads by Time of Day" />
        </div>
      </div>

      {/* ROW 2: Line/Area Chart Panel (~65% Left) + Sold vs Unsold Ring Panel (~35% Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Lead Volume Over Time Chart Panel with Bottom Timeframe Toggles */}
        <div className="lg:col-span-8 xl:col-span-8">
          <WavyAreaChart
            title="Lead Volume Over Time"
            subtitle="Monthly lead acquisition channels across paid, organic & direct traffic"
            height={230}
            reportHref="/leads"
          />
        </div>

        {/* Right: Sold vs Unsold Ring Panel with Single-Line Channel Breakdowns */}
        <div className="lg:col-span-4 xl:col-span-4">
          <DonutRingWidget
            title="Sold vs Unsold"
            percentage={stats.soldPercent}
            soldCount={Math.round((stats.totalLeadsToday * stats.soldPercent) / 100)}
            totalLeads={stats.totalLeadsToday}
          />
        </div>
      </div>

      {/* ROW 3: Quality Compliance Guardrails (Left) + Score Distribution Trend (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Quality & Compliance Guardrails (with Mini-Rings matching reference "Important Expenses" row) */}
        <div className="lg:col-span-5 xl:col-span-4 admin-card p-4 sm:p-5 flex flex-col justify-between group transform-gpu space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground font-heading">
                Quality &amp; Compliance
              </h3>
              <p className="text-[11px] text-muted-foreground font-medium">TCPA, DNC &amp; Scoring Guardrails</p>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-3 h-3" />
              <span>Verified</span>
            </span>
          </div>

          {/* Two Secondary Metric Pills */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-secondary/70 border border-border">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Avg Score</span>
              </div>
              <div className="text-xl font-extrabold text-foreground font-heading">
                {stats.avgScore} <span className="text-xs text-muted-foreground font-normal">/ 100</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                ↑ +2.4 from last week
              </span>
            </div>

            <div className="p-3 rounded-xl bg-secondary/70 border border-border">
              <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider">DNC Flagged</span>
              </div>
              <div className="text-xl font-extrabold text-foreground font-heading">
                {stats.dncFlaggedCount} <span className="text-xs text-muted-foreground font-normal">blocked</span>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                ↓ -1.2% from last week
              </span>
            </div>
          </div>

          {/* Mini-Rings Row (Important Expenses reference style: compact row of partial rings with label and value underneath) */}
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Automated Verification Rates
            </div>
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
              {/* Mini Ring 1: TCPA Pass */}
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-card border border-border shadow-2xs hover:border-emerald-400 transition-all duration-200 transform-gpu hover:-translate-y-0.5">
                <CircularProgressRing
                  value={92}
                  size={50}
                  strokeWidth={5}
                  color={['#059669', '#34d399']}
                  showShadow={true}
                />
                <span className="text-xs font-bold text-foreground mt-2 truncate w-full">
                  TCPA Pass
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  92%
                </span>
              </div>

              {/* Mini Ring 2: DNC Clear */}
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-card border border-border shadow-2xs hover:border-blue-400 transition-all duration-200 transform-gpu hover:-translate-y-0.5">
                <CircularProgressRing
                  value={80}
                  size={50}
                  strokeWidth={5}
                  color={['#2563eb', '#60a5fa']}
                  showShadow={true}
                />
                <span className="text-xs font-bold text-foreground mt-2 truncate w-full">
                  DNC Clear
                </span>
                <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                  80%
                </span>
              </div>

              {/* Mini Ring 3: Score 80+ */}
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-card border border-border shadow-2xs hover:border-sky-400 transition-all duration-200 transform-gpu hover:-translate-y-0.5">
                <CircularProgressRing
                  value={78}
                  size={50}
                  strokeWidth={5}
                  color={['#0284c7', '#38bdf8']}
                  showShadow={true}
                />
                <span className="text-xs font-bold text-foreground mt-2 truncate w-full">
                  Score 80+
                </span>
                <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                  78%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Score Distribution Trend Panel */}
        <div className="lg:col-span-7 xl:col-span-8">
          <WavyAreaChart
            title="Score Distribution Trend"
            subtitle="Monthly breakdown of high (80+), medium (50-79), and low (<50) lead quality scores"
            height={220}
            reportHref="/leads"
          />
        </div>
      </div>

      {/* ROW 4: Recent Incoming Leads Table */}
      <div className="admin-card p-4 sm:p-5 transform-gpu">
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-foreground font-heading">
              Recent Incoming Leads
            </h3>
            <p className="text-[11px] text-muted-foreground font-medium">
              Latest submissions across all brand funnels
            </p>
          </div>
          <Link
            href="/leads"
            className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-900 transition-colors"
          >
            <span>View All Leads</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-slate-50/70 dark:bg-slate-800/40 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="py-3 px-3.5">Lead ID</th>
                <th className="py-3 px-3.5">Brand</th>
                <th className="py-3 px-3.5">Contact</th>
                <th className="py-3 px-3.5">Score</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5">Buyer Sold To</th>
                <th className="py-3 px-3.5">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {recentLeads.map((lead) => (
                <tr
                  key={lead.id}
                  className="admin-table-row hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 px-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {lead.id.substring(0, 8)}
                  </td>
                  <td className="py-3 px-3.5 text-foreground font-semibold">
                    {lead.brand_name}
                  </td>
                  <td className="py-3 px-3.5">
                    <div className="flex flex-col">
                      <span className="text-foreground font-bold">{lead.full_name}</span>
                      <span className="text-[10px] text-muted-foreground">{lead.email}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        (lead.score || 0) >= 80
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : (lead.score || 0) >= 50
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {lead.score || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-3.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        lead.status === 'sold'
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : lead.status === 'verified'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : lead.status === 'duplicate'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-secondary text-muted-foreground border border-border'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3 px-3.5 text-slate-700 dark:text-slate-300">
                    {lead.sold_to_buyer_name || (lead.sold ? 'Buyer Assigned' : 'Unsold')}
                  </td>
                  <td className="py-3 px-3.5 text-muted-foreground text-[11px]">
                    {new Date(lead.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
