'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  RefreshCw,
  ArrowUpRight,
  Award,
  ShieldAlert,
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatGridCard } from '@/components/dashboard/StatGridCard';
import { HeatmapCard } from '@/components/dashboard/HeatmapCard';
import { WavyAreaChart } from '@/components/dashboard/WavyAreaChart';
import { SessionsByDeviceCard } from '@/components/dashboard/SessionsByDeviceCard';
import { CircularProgressRing } from '@/components/ui/circular-progress-ring';
import { SpotlightCard, SpotlightCardGroup } from '@/components/ui/spotlight-card';
import { Loader } from '@/components/ui/loader';
import { supabase } from '@/lib/supabase';
import { AdminLead } from '@/lib/data';
import { LeadDetailDrawer } from '@/components/leads/LeadDetailDrawer';
import { ExpandableStatusBadge } from '@/components/ui/expandable-card';
import { motion } from 'motion/react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalLeadsToday: 0,
    soldPercent: 0,
    estRevenue: 0,
    activeBrands: 0,
    avgScore: 0,
    dncFlaggedCount: 0,
    totalVisitors: 0,
  });

  const [compliance, setCompliance] = useState({
    tcpaRate: 0,
    dncRate: 0,
    score80Rate: 0,
  });

  const [heatmapMatrix, setHeatmapMatrix] = useState<number[][]>(() =>
    Array(7).fill(0).map(() => Array(12).fill(0))
  );

  const [deviceStats, setDeviceStats] = useState({
    totalVisitors: 0,
    desktopCount: 0,
    mobileCount: 0,
    tabletCount: 0,
  });

  const [timeSeries, setTimeSeries] = useState<{
    weekly: Array<{ name: string; direct: number; links: number; search: number }>;
    monthly: Array<{ name: string; direct: number; links: number; search: number }>;
    yearly: Array<{ name: string; direct: number; links: number; search: number }>;
  }>({
    weekly: [],
    monthly: [],
    yearly: [],
  });

  const [recentLeads, setRecentLeads] = useState<AdminLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<AdminLead | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch real leads
      const { data: leadsData } = await supabase
        .from('leads')
        .select(`
          *,
          brands ( name ),
          buyers ( name )
        `)
        .order('created_at', { ascending: false });

      // 2. Fetch real brands
      const { data: brandsData } = await supabase
        .from('brands')
        .select('*');

      // 3. Fetch real buyer deliveries
      const { data: deliveriesData } = await supabase
        .from('buyer_deliveries')
        .select('*');

      // 4. Fetch real clicks
      const { data: clicksData } = await supabase
        .from('clicks')
        .select('*')
        .order('created_at', { ascending: false });

      const allLeads = leadsData || [];
      const allBrands = brandsData || [];
      const allDeliveries = deliveriesData || [];
      const allClicks = clicksData || [];

      // Format recent leads for the table
      const formattedLeads: AdminLead[] = allLeads.slice(0, 8).map((l: any) => ({
        ...l,
        brand_name: l.brands?.name || 'LeadFlow Default',
        sold_to_buyer_name: l.buyers?.name || (l.sold ? 'Buyer Assigned' : 'Pending Route'),
      }));
      setRecentLeads(formattedLeads);

      // Core Aggregations
      const totalLeads = allLeads.length;
      const soldLeads = allLeads.filter((l) => l.sold || l.status === 'sold').length;
      const soldPercent = totalLeads > 0 ? Math.round((soldLeads / totalLeads) * 1000) / 10 : 0;

      const deliveryRevenue = allDeliveries.reduce((acc, d) => acc + (Number(d.price_paid) || 0), 0);
      const leadRevenue = allLeads.reduce((acc, l) => acc + (l.sold ? (Number(l.price_sold) || 0) : 0), 0);
      const totalRevenue = deliveryRevenue + leadRevenue;

      const activeBrandsCount = allBrands.filter((b) => b.is_active).length;
      const dncFlagged = allLeads.filter((l) => l.dnc_flagged || l.dnc_scrub_passed === false).length;

      const scoredLeads = allLeads.filter((l) => l.score !== null && l.score !== undefined);
      const avgScore = scoredLeads.length > 0
        ? Math.round((scoredLeads.reduce((a, l) => a + Number(l.score), 0) / scoredLeads.length) * 10) / 10
        : 0;

      // Compliance rates
      const tcpaPassed = allLeads.filter((l) => l.trustedform_cert_url || l.status === 'verified' || l.status === 'sold').length;
      const tcpaRate = totalLeads > 0 ? Math.round((tcpaPassed / totalLeads) * 100) : 0;

      const dncPassed = allLeads.filter((l) => l.dnc_scrub_passed === true || (l.dnc_flagged === false && l.status !== 'rejected')).length;
      const dncRate = totalLeads > 0 ? Math.round((dncPassed / totalLeads) * 100) : 0;

      const score80Count = scoredLeads.filter((l) => Number(l.score) >= 80).length;
      const score80Rate = scoredLeads.length > 0 ? Math.round((score80Count / scoredLeads.length) * 100) : 0;

      setCompliance({ tcpaRate, dncRate, score80Rate });

      setStats({
        totalLeadsToday: totalLeads,
        soldPercent,
        estRevenue: totalRevenue,
        activeBrands: activeBrandsCount,
        avgScore,
        dncFlaggedCount: dncFlagged,
        totalVisitors: allClicks.length,
      });

      // 5. Heatmap matrix aggregation (7 days x 12 intervals)
      const matrix = Array(7).fill(0).map(() => Array(12).fill(0));
      const allEvents = [
        ...allClicks.map((c) => ({ date: new Date(c.created_at) })),
        ...allLeads.map((l) => ({ date: new Date(l.created_at) })),
      ];

      allEvents.forEach((ev) => {
        if (!isNaN(ev.date.getTime())) {
          const day = ev.date.getUTCDay(); // 0 = Sun, 6 = Sat
          const hourBucket = Math.min(Math.floor(ev.date.getUTCHours() / 2), 11);
          matrix[day][hourBucket]++;
        }
      });
      setHeatmapMatrix(matrix);

      // 6. Device Breakdown aggregation
      let desktop = 0;
      let mobile = 0;
      let tablet = 0;
      allClicks.forEach((c) => {
        const ua = c.user_agent || '';
        if (/tablet|ipad/i.test(ua)) tablet++;
        else if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua)) mobile++;
        else desktop++;
      });
      setDeviceStats({
        totalVisitors: allClicks.length,
        desktopCount: desktop,
        mobileCount: mobile,
        tabletCount: tablet,
      });

      // 7. Time Series aggregations for WavyAreaChart
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekBuckets: { [key: string]: { direct: number; links: number; search: number } } = {
        Mon: { direct: 0, links: 0, search: 0 },
        Tue: { direct: 0, links: 0, search: 0 },
        Wed: { direct: 0, links: 0, search: 0 },
        Thu: { direct: 0, links: 0, search: 0 },
        Fri: { direct: 0, links: 0, search: 0 },
        Sat: { direct: 0, links: 0, search: 0 },
        Sun: { direct: 0, links: 0, search: 0 },
      };

      allClicks.forEach((c) => {
        const d = new Date(c.created_at);
        if (!isNaN(d.getTime())) {
          const dName = dayNames[d.getUTCDay()];
          if (weekBuckets[dName]) {
            const hasRef = Boolean(c.referrer && !c.referrer.includes('localhost') && !c.referrer.includes('127.0.0.1'));
            if (hasRef) weekBuckets[dName].links++;
            else weekBuckets[dName].direct++;
            if (c.converted_lead_id) weekBuckets[dName].search++;
          }
        }
      });

      const weeklyArr = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
        name: day,
        ...weekBuckets[day],
      }));

      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthBuckets: { [key: string]: { direct: number; links: number; search: number } } = {};
      monthNames.forEach((m) => {
        monthBuckets[m] = { direct: 0, links: 0, search: 0 };
      });

      allClicks.forEach((c) => {
        const d = new Date(c.created_at);
        if (!isNaN(d.getTime())) {
          const mName = monthNames[d.getUTCMonth()];
          if (monthBuckets[mName]) {
            const hasRef = Boolean(c.referrer && !c.referrer.includes('localhost') && !c.referrer.includes('127.0.0.1'));
            if (hasRef) monthBuckets[mName].links++;
            else monthBuckets[mName].direct++;
            if (c.converted_lead_id) monthBuckets[mName].search++;
          }
        }
      });

      const monthlyArr = monthNames.map((m) => ({
        name: m,
        ...monthBuckets[m],
      }));

      const yearlyArr = [
        { name: '2024', direct: 0, links: 0, search: 0 },
        { name: '2025', direct: 0, links: 0, search: 0 },
        {
          name: '2026',
          direct: allClicks.filter((c) => !c.referrer).length,
          links: allClicks.filter((c) => c.referrer).length,
          search: allLeads.length,
        },
      ];

      setTimeSeries({
        weekly: weeklyArr,
        monthly: monthlyArr,
        yearly: yearlyArr,
      });
    } catch (err) {
      console.error('Dashboard load error:', err);
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
            Real-time analytics across all active brand funnels and buyer routing endpoints
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-card hover:bg-secondary border border-border rounded-xl text-xs font-semibold text-foreground shadow-2xs transition-all duration-200 cursor-pointer transform-gpu"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-foreground' : 'text-muted-foreground'}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* ROW 1: 2x2 Compact Stat Cards Grid + GitHub Heatmap */}
      <SpotlightCardGroup className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col">
          <StatGridCard stats={stats} />
        </div>

        <div className="lg:col-span-7 xl:col-span-7 flex flex-col">
          <HeatmapCard
            title="User by time of day"
            data={heatmapMatrix}
            totalEvents={deviceStats.totalVisitors + stats.totalLeadsToday}
          />
        </div>
      </SpotlightCardGroup>

      {/* ROW 2: Wave Chart + Sessions by Device */}
      <SpotlightCardGroup className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8 xl:col-span-8 flex flex-col">
          <WavyAreaChart
            title="New visitors"
            subtitle="Lead volume across direct, referral and organic acquisition channels"
            height={260}
            reportHref="/leads"
            weeklyData={timeSeries.weekly}
            monthlyData={timeSeries.monthly}
            yearlyData={timeSeries.yearly}
            totalConverted={stats.totalLeadsToday}
          />
        </div>

        <div className="lg:col-span-4 xl:col-span-4 flex flex-col">
          <SessionsByDeviceCard
            title="Sessions by device"
            totalVisitors={deviceStats.totalVisitors}
            desktopCount={deviceStats.desktopCount}
            mobileCount={deviceStats.mobileCount}
            tabletCount={deviceStats.tabletCount}
          />
        </div>
      </SpotlightCardGroup>

      {/* ROW 3: Recent Incoming Leads Table + Quality Compliance Guardrails */}
      <SpotlightCardGroup className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left: Recent Incoming Leads Table */}
        <div className="lg:col-span-8 xl:col-span-8 flex flex-col">
          <SpotlightCard
            color="#71717a"
            tiltMax={3}
            className="p-4 sm:p-6 flex flex-col justify-between h-full group"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground font-heading">
                  Recent Incoming Leads
                </h3>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Latest submissions across active brand funnels
                </p>
              </div>
              <Link
                href="/leads"
                className="flex items-center gap-1.5 text-xs font-bold text-foreground hover:text-foreground bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 px-3 py-1.5 rounded-xl border border-border transition-colors"
              >
                <span>View All Leads</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto my-auto -mx-2 sm:mx-0">
              <table className="w-full text-left text-xs min-w-[550px]">
                <thead>
                  <tr className="border-b border-border bg-slate-100/90 dark:bg-neutral-900/60 text-[11px] font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Lead ID</th>
                    <th className="py-2.5 px-3">Brand</th>
                    <th className="py-2.5 px-3">Contact</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Buyer Sold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-medium">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="py-8">
                        <Loader
                          size="sm"
                          title="Streaming recent leads..."
                          subtitle="Aggregating latest incoming submissions from active funnels"
                        />
                      </td>
                    </tr>
                  ) : recentLeads.length > 0 ? (
                    recentLeads.map((lead) => (
                      <motion.tr
                        key={lead.id}
                        layoutId={`dash-lead-${lead.id}`}
                        onClick={() => setSelectedLead(lead)}
                        className="admin-table-row hover:bg-slate-50/80 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer group"
                        title="Click to inspect lead"
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-foreground">
                          {lead.id.substring(0, 8)}
                        </td>
                        <td className="py-2.5 px-3 text-foreground font-bold">
                          {lead.brand_name}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex flex-col">
                            <span className="text-foreground font-bold">{lead.full_name || (lead.form_answers && Object.values(lead.form_answers)[0] ? String(Object.values(lead.form_answers)[0]) : 'Anonymous Lead')}</span>
                            <span className="text-[11px] text-slate-600 dark:text-neutral-400 font-medium">{lead.email || (lead.form_answers && Object.values(lead.form_answers)[1] ? String(Object.values(lead.form_answers)[1]) : 'No email provided')}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              (lead.score || 0) >= 80
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : (lead.score || 0) >= 50
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                                : (lead.score || 0) > 0
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                                : 'bg-secondary text-muted-foreground border border-border'
                            }`}
                          >
                            {lead.score !== null && lead.score !== undefined ? lead.score : 'N/A'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <ExpandableStatusBadge
                            id={`dash-lead-${lead.id}`}
                            status={lead.status || 'new'}
                            variant={lead.status === 'sold' ? 'info' : lead.status === 'verified' ? 'success' : 'warning'}
                            contextText={
                              lead.status === 'sold'
                                ? `Lead delivered and accepted by ${lead.sold_to_buyer_name || 'Buyer Assigned'} for $${Number(lead.price_sold || 0).toFixed(2)}.`
                                : lead.status === 'verified'
                                ? 'Lead passed Jornaya and TrustedForm compliance validation.'
                                : 'Lead ingested and awaiting buyer routing evaluation.'
                            }
                            details={[
                              { label: 'Brand', value: lead.brand_name || 'LeadFlow' },
                              { label: 'Score', value: lead.score ? `${lead.score}/100` : 'Unscored' },
                              { label: 'Ingested', value: new Date(lead.created_at).toLocaleDateString() }
                            ]}
                          />
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 dark:text-neutral-300 text-xs font-semibold">
                          {lead.sold_to_buyer_name || (lead.sold ? 'Buyer Assigned' : 'Unsold')}
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-muted-foreground text-xs">
                        No recent leads recorded yet. New leads from brand funnels will stream here live.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </SpotlightCard>
        </div>

        {/* Right: Quality & Compliance Guardrails */}
        <div className="lg:col-span-4 xl:col-span-4 flex flex-col">
          <SpotlightCard
            color="#71717a"
            tiltMax={4}
            className="p-4 sm:p-6 flex flex-col justify-between h-full group space-y-4"
          >
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground font-heading">
                  Quality &amp; Compliance
                </h3>
                <p className="text-[11px] text-muted-foreground font-medium">TCPA, DNC &amp; Scoring Guardrails</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-foreground font-semibold">Active</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-secondary/60 border border-border">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <Award className="w-3.5 h-3.5 text-foreground" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Avg Score</span>
                </div>
                <div className="text-xl font-extrabold text-foreground font-heading">
                  {stats.avgScore > 0 ? stats.avgScore : 0} <span className="text-xs text-muted-foreground font-normal">/ 100</span>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground mt-0.5 block">
                  {stats.totalLeadsToday > 0 ? 'Live database avg' : 'No scored leads yet'}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-secondary/60 border border-border">
                <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">DNC Flagged</span>
                </div>
                <div className="text-xl font-extrabold text-foreground font-heading">
                  {stats.dncFlaggedCount} <span className="text-xs text-muted-foreground font-normal">flagged</span>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground mt-0.5 block">
                  {stats.dncFlaggedCount > 0 ? 'DNC registry hit' : '0 blocked leads'}
                </span>
              </div>
            </div>

            {/* Mini Verification Rings */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Verification Compliance Rate
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-card/80 border border-border/80 shadow-2xs">
                  <CircularProgressRing
                    value={compliance.tcpaRate}
                    size={46}
                    color="#f4f4f5"
                    showShadow={false}
                  />
                  <span className="text-[11px] font-bold text-foreground mt-1.5">TCPA</span>
                  <span className="text-[10px] font-semibold text-foreground">{compliance.tcpaRate}%</span>
                </div>

                <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-card/80 border border-border/80 shadow-2xs">
                  <CircularProgressRing
                    value={compliance.dncRate}
                    size={46}
                    color="#d4d4d8"
                    showShadow={false}
                  />
                  <span className="text-[11px] font-bold text-foreground mt-1.5">DNC</span>
                  <span className="text-[10px] font-semibold text-foreground">{compliance.dncRate}%</span>
                </div>

                <div className="flex flex-col items-center text-center p-2.5 rounded-xl bg-card/80 border border-border/80 shadow-2xs">
                  <CircularProgressRing
                    value={compliance.score80Rate}
                    size={46}
                    color="#a1a1aa"
                    showShadow={false}
                  />
                  <span className="text-[11px] font-bold text-foreground mt-1.5">Score 80+</span>
                  <span className="text-[10px] font-semibold text-muted-foreground">{compliance.score80Rate}%</span>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </SpotlightCardGroup>

      {/* Expanded Lead Detail Drawer with Aceternity Motion */}
      <LeadDetailDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} layoutIdPrefix="dash-lead" />
    </AdminLayout>
  );
}
