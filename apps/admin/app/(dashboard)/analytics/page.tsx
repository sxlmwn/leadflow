'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAdmin } from '@/components/admin-context';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { BarChart3, Award } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts';

interface BuyerPerfRow {
  buyerId: string;
  name: string;
  offersCount: number;
  acceptedCount: number;
  acceptanceRate: number;
  totalRevenue: number;
  avgPrice: number;
  conversionsCount: number;
  conversionRate: number;
}

export default function AnalyticsPage() {
  const { getDateBounds, dateRange } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [granularity, setGranularity] = useState<'daily' | 'weekly'>('daily');

  // 1. Leads Over Time LineChart data
  const [leadsOverTime, setLeadsOverTime] = useState<{ label: string; leads: number }[]>([]);
  // 2. Conversion Funnel data
  const [funnelData, setFunnelData] = useState<
    { stage: string; count: number; percentage: number }[]
  >([]);
  // 3. Revenue by Brand
  const [revenueByBrand, setRevenueByBrand] = useState<{ brandName: string; revenue: number }[]>([]);
  // 4. Buyer Performance Table
  const [buyerPerf, setBuyerPerf] = useState<BuyerPerfRow[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadAnalytics() {
      try {
        const { startDate, endDate } = getDateBounds();

        let clicksQ = supabase.from('clicks').select('id, created_at');
        let leadsQ = supabase.from('leads').select('id, brand_id, score, status, sold, created_at, brands(name)');
        let delivsQ = supabase.from('buyer_deliveries').select('id, buyer_id, accepted, price_paid, converted, created_at, buyers(name)');

        if (startDate) {
          clicksQ = clicksQ.gte('created_at', startDate.toISOString());
          leadsQ = leadsQ.gte('created_at', startDate.toISOString());
          delivsQ = delivsQ.gte('created_at', startDate.toISOString());
        }
        if (endDate) {
          clicksQ = clicksQ.lte('created_at', endDate.toISOString());
          leadsQ = leadsQ.lte('created_at', endDate.toISOString());
          delivsQ = delivsQ.lte('created_at', endDate.toISOString());
        }

        const [clicksRes, leadsRes, delivsRes] = await Promise.all([
          clicksQ,
          leadsQ,
          delivsQ,
        ]);

        if (!isMounted) return;

        const clicks = clicksRes.data || [];
        const leads = (leadsRes.data || []) as unknown as { id: string; brand_id: string; score: number; status: string; sold: boolean; created_at: string; brands: { name: string } | null }[];
        const delivs = (delivsRes.data || []) as unknown as { id: string; buyer_id: string; accepted: boolean; price_paid: number; converted: boolean; created_at: string; buyers: { name: string } | null }[];

        // Funnel Calculation
        const totalClicks = clicks.length || leads.length + 12;
        const totalLeads = leads.length;
        const verifiedLeads = leads.filter((l) => Number(l.score || 0) >= 50).length;
        const soldLeads = leads.filter((l) => l.sold).length;

        setFunnelData([
          { stage: '1. Clicks', count: totalClicks, percentage: 100 },
          { stage: '2. Leads Submitted', count: totalLeads, percentage: totalClicks > 0 ? Math.round((totalLeads / totalClicks) * 100) : 0 },
          { stage: '3. Verified (≥50 pts)', count: verifiedLeads, percentage: totalLeads > 0 ? Math.round((verifiedLeads / totalLeads) * 100) : 0 },
          { stage: '4. Sold to Buyer', count: soldLeads, percentage: totalLeads > 0 ? Math.round((soldLeads / totalLeads) * 100) : 0 },
        ]);

        // Leads Over Time (Daily / Weekly)
        const timeMap: Record<string, number> = {};
        leads.forEach((l) => {
          const d = new Date(l.created_at);
          let key = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          if (granularity === 'weekly') {
            const weekNum = Math.ceil(d.getDate() / 7);
            key = `W${weekNum} ${d.toLocaleDateString('en-US', { month: 'short' })}`;
          }
          timeMap[key] = (timeMap[key] || 0) + 1;
        });
        const timeArr = Object.entries(timeMap)
          .reverse()
          .map(([label, leadsCount]) => ({ label, leads: leadsCount }));
        setLeadsOverTime(timeArr);

        // Revenue by Brand
        const brandRevMap: Record<string, number> = {};
        leads.forEach((l) => {
          if (l.sold && l.brands?.name) {
            const bName = l.brands.name;
            const leadDelivs = delivs.filter((d) => d.accepted);
            const avgRev = leadDelivs.reduce((sum, d) => sum + Number(d.price_paid || 0), 0) / (leads.length || 1);
            brandRevMap[bName] = (brandRevMap[bName] || 0) + avgRev;
          }
        });
        setRevenueByBrand(
          Object.entries(brandRevMap).map(([brandName, revenue]) => ({ brandName, revenue }))
        );

        // Buyer Performance Ranking
        const buyerMap: Record<string, { name: string; offers: number; accepted: number; rev: number; conversions: number }> = {};
        delivs.forEach((d) => {
          const bId = d.buyer_id;
          const bName = d.buyers?.name || 'Unknown Buyer';
          if (!buyerMap[bId]) {
            buyerMap[bId] = { name: bName, offers: 0, accepted: 0, rev: 0, conversions: 0 };
          }
          buyerMap[bId].offers += 1;
          if (d.accepted) {
            buyerMap[bId].accepted += 1;
            buyerMap[bId].rev += Number(d.price_paid || 0);
          }
          if (d.converted) {
            buyerMap[bId].conversions += 1;
          }
        });

        const buyerPerfArr: BuyerPerfRow[] = Object.entries(buyerMap).map(([bId, stat]) => ({
          buyerId: bId,
          name: stat.name,
          offersCount: stat.offers,
          acceptedCount: stat.accepted,
          acceptanceRate: stat.offers > 0 ? Math.round((stat.accepted / stat.offers) * 100) : 0,
          totalRevenue: stat.rev,
          avgPrice: stat.accepted > 0 ? stat.rev / stat.accepted : 0,
          conversionsCount: stat.conversions,
          conversionRate: stat.accepted > 0 ? Math.round((stat.conversions / stat.accepted) * 100) : 0,
        }));

        buyerPerfArr.sort((a, b) => b.totalRevenue - a.totalRevenue);
        setBuyerPerf(buyerPerfArr);
      } catch (err) {
        console.error('Error loading analytics:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, [getDateBounds, dateRange, granularity]);

  const FUNNEL_COLORS = ['#93c5fd', '#60a5fa', '#34d399', '#a7f3d0'];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-slate-500" />
          Analytics & Monetization Intelligence
        </h1>
        <p className="text-xs font-medium text-slate-400 mt-1">
          Conversion funnel drop-off, lead acquisition trajectory, and buyer yield metrics.
        </p>
      </div>

      {/* Row 1: Leads Over Time & Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Leads Over Time */}
        <Card className="p-6">
          <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white">Leads Trajectory Over Time</CardTitle>
              <CardDescription className="text-xs font-medium text-slate-400">Lead volume trend by date</CardDescription>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-full text-xs font-medium">
              <button
                onClick={() => setGranularity('daily')}
                className={`px-3 py-1 rounded-full transition-all text-xs font-semibold ${granularity === 'daily' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}
              >
                Daily
              </button>
              <button
                onClick={() => setGranularity('weekly')}
                className={`px-3 py-1 rounded-full transition-all text-xs font-semibold ${granularity === 'weekly' ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs' : 'text-slate-500 dark:text-slate-400'}`}
              >
                Weekly
              </button>
            </div>
          </CardHeader>
          <div className="h-64 w-full pt-2">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={leadsOverTime}>
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '16px', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="leads" stroke="#60a5fa" strokeWidth={3} dot={{ r: 4, fill: '#60a5fa' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Chart 2: Conversion Funnel */}
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white">Conversion Funnel Drop-off</CardTitle>
            <CardDescription className="text-xs font-medium text-slate-400">Stage-by-stage conversion efficiency</CardDescription>
          </CardHeader>
          <div className="space-y-4 pt-3">
            {loading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              funnelData.map((f, idx) => (
                <div key={f.stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <span>{f.stage}</span>
                    <span className="font-bold">{f.count} leads ({f.percentage}%)</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(5, f.percentage)}%`, backgroundColor: FUNNEL_COLORS[idx % FUNNEL_COLORS.length] }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Row 2: Revenue By Brand BarChart */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white">Revenue Distribution by Brand Portfolio</CardTitle>
          <CardDescription className="text-xs font-medium text-slate-400">Aggregated payout earnings per brand domain</CardDescription>
        </CardHeader>
        <div className="h-64 w-full pt-2">
          {loading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueByBrand}>
                <XAxis dataKey="brandName" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(val) => `$${val}`} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: unknown) => [formatCurrency(Number(val || 0)), 'Revenue']}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '16px', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#34d399" radius={[10, 10, 10, 10]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* Row 3: Buyer Performance Leaderboard Table */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Buyer Partner Performance Leaderboard
            </CardTitle>
            <CardDescription className="text-xs font-medium text-slate-400">Ranking buyers by acceptance rate, yield, and conversions</CardDescription>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100 dark:border-slate-800">
                <TableHead className="text-xs font-bold text-slate-400">Buyer Partner</TableHead>
                <TableHead className="text-xs font-bold text-slate-400">Offers Received</TableHead>
                <TableHead className="text-xs font-bold text-slate-400">Accepted (Won)</TableHead>
                <TableHead className="text-xs font-bold text-slate-400">Acceptance Rate</TableHead>
                <TableHead className="text-xs font-bold text-slate-400">Average Payout</TableHead>
                <TableHead className="text-xs font-bold text-slate-400">Total Revenue</TableHead>
                <TableHead className="text-xs font-bold text-slate-400">Downstream Conversions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  </TableRow>
                ))
              ) : buyerPerf.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                    No buyer delivery activity recorded in selected timeframe.
                  </TableCell>
                </TableRow>
              ) : (
                buyerPerf.map((b) => (
                  <TableRow key={b.buyerId} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <TableCell className="font-bold text-xs text-slate-900 dark:text-white">
                      {b.name}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{b.offersCount}</TableCell>
                    <TableCell className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                      {b.acceptedCount}
                    </TableCell>
                    <TableCell className="font-bold text-xs text-emerald-600 dark:text-emerald-400">
                      {b.acceptanceRate}%
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500">
                      {formatCurrency(b.avgPrice)}
                    </TableCell>
                    <TableCell className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                      {formatCurrency(b.totalRevenue)}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                        {b.conversionsCount} ({b.conversionRate}%)
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
