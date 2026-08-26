'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAdmin } from '@/components/admin-context';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Users,
  ShieldCheck,
  DollarSign,
  UserX,
  TrendingUp,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

interface LeadRow {
  id: string;
  created_at: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  score: number | null;
  status: string;
  sold: boolean;
  dnc_flagged: boolean;
  brand_id: string;
  brands?: { name: string; slug: string } | null;
}

export default function DashboardPage() {
  const { getDateBounds, dateRange } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [totalLeads, setTotalLeads] = useState(0);
  const [passRate, setPassRate] = useState(0);
  const [soldCount, setSoldCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [dncCount, setDncCount] = useState(0);

  // Sparkline data
  const [sparklineData, setSparklineData] = useState<{ date: string; leads: number }[]>([]);
  // Score Distribution
  const [scoreDist, setScoreDist] = useState<{ bucket: string; count: number }[]>([]);
  // Buyer Acceptance
  const [buyerAcceptance, setBuyerAcceptance] = useState<{ name: string; value: number }[]>([]);
  // Leads by Brand
  const [brandDist, setBrandDist] = useState<{ name: string; count: number }[]>([]);

  // Recent leads
  const [recentLeads, setRecentLeads] = useState<LeadRow[]>([]);
  const [selectedLead, setSelectedLead] = useState<LeadRow | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const { startDate, endDate } = getDateBounds();

        // Base leads query
        let leadsQuery = supabase.from('leads').select('*, brands(name, slug)');
        if (startDate) leadsQuery = leadsQuery.gte('created_at', startDate.toISOString());
        if (endDate) leadsQuery = leadsQuery.lte('created_at', endDate.toISOString());

        const { data: leadsData } = await leadsQuery.order('created_at', { ascending: false });
        if (!isMounted) return;

        const leads = (leadsData || []) as LeadRow[];

        setTotalLeads(leads.length);

        // Stat: DNC Count & Sold Count
        const dnc = leads.filter((l) => l.dnc_flagged).length;
        setDncCount(dnc);

        const sold = leads.filter((l) => l.sold).length;
        setSoldCount(sold);

        // Stat: Verification Pass Rate
        let verifQuery = supabase.from('verification_results').select('lead_id, status');
        if (startDate) verifQuery = verifQuery.gte('created_at', startDate.toISOString());

        const { data: verifData } = await verifQuery;
        if (!isMounted) return;

        const totalVerifs = verifData?.length || 0;
        const passedVerifs = verifData?.filter((v) => v.status === 'passed').length || 0;
        setPassRate(totalVerifs > 0 ? Math.round((passedVerifs / totalVerifs) * 100) : 0);

        // Stat: Revenue from buyer_deliveries
        let delivQuery = supabase.from('buyer_deliveries').select('accepted, price_paid, created_at');
        if (startDate) delivQuery = delivQuery.gte('created_at', startDate.toISOString());

        const { data: delivData } = await delivQuery;
        if (!isMounted) return;

        const totalRev = (delivData || []).reduce((acc, curr) => acc + Number(curr.price_paid || 0), 0);
        setRevenue(totalRev);

        // Buyer Acceptance Chart (Accepted vs Rejected)
        const acceptedCount = (delivData || []).filter((d) => d.accepted).length;
        const rejectedCount = (delivData || []).filter((d) => !d.accepted).length;
        setBuyerAcceptance([
          { name: 'Accepted', value: acceptedCount },
          { name: 'Rejected', value: rejectedCount },
        ]);

        // Score Distribution Buckets (0-20, 21-40, 41-60, 61-80, 81-100)
        const buckets = { '0-20': 0, '21-40': 0, '41-60': 0, '61-80': 0, '81-100': 0 };
        leads.forEach((l) => {
          const s = Number(l.score || 0);
          if (s <= 20) buckets['0-20']++;
          else if (s <= 40) buckets['21-40']++;
          else if (s <= 60) buckets['41-60']++;
          else if (s <= 80) buckets['61-80']++;
          else buckets['81-100']++;
        });
        setScoreDist([
          { bucket: '0-20', count: buckets['0-20'] },
          { bucket: '21-40', count: buckets['21-40'] },
          { bucket: '41-60', count: buckets['41-60'] },
          { bucket: '61-80', count: buckets['61-80'] },
          { bucket: '81-100', count: buckets['81-100'] },
        ]);

        // Leads by Brand
        const brandCounts: Record<string, number> = {};
        leads.forEach((l) => {
          const brandName = l.brands?.name || 'Unknown';
          brandCounts[brandName] = (brandCounts[brandName] || 0) + 1;
        });
        setBrandDist(
          Object.entries(brandCounts).map(([name, count]) => ({ name, count }))
        );

        // Sparkline by Date
        const dailyMap: Record<string, number> = {};
        leads.forEach((l) => {
          const day = new Date(l.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          dailyMap[day] = (dailyMap[day] || 0) + 1;
        });
        const sparklineArr = Object.entries(dailyMap)
          .reverse()
          .map(([date, leadsCount]) => ({ date, leads: leadsCount }));
        setSparklineData(sparklineArr.slice(-10));

        // Recent 15 Leads
        setRecentLeads(leads.slice(0, 15));
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [getDateBounds, dateRange]);

  // Soft pastel chart color palette matching reference design
  const PIE_PASTEL_COLORS = ['#6ee7b7', '#fca5a5']; // Soft mint green for Accepted, soft coral for Rejected

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Executive Operations Overview
        </h1>
        <p className="text-xs text-slate-400 font-medium mt-1">
          Real-time lead telemetry, verification scoring, and buyer monetization metrics.
        </p>
      </div>

      {/* Top Stat Cards Grid matching reference softness */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Stat 1: Total Leads */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Leads
            </span>
            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-24 mt-3" />
          ) : (
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalLeads}</div>
              <div className="w-20 h-7">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sparklineData}>
                    <Line type="monotone" dataKey="leads" stroke="#60a5fa" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          <div className="text-xs text-slate-400 font-medium mt-3 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Captured in timeframe</span>
          </div>
        </Card>

        {/* Stat 2: Verification Pass Rate */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Verification Pass Rate
            </span>
            <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-24 mt-3" />
          ) : (
            <div className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">
              {passRate}%
            </div>
          )}
          <div className="text-xs text-slate-400 font-medium mt-3">
            TrustedForm + DNC clean
          </div>
        </Card>

        {/* Stat 3: Leads Sold & Revenue */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Revenue & Monetization
            </span>
            <div className="w-9 h-9 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-32 mt-3" />
          ) : (
            <div className="mt-3 flex items-baseline justify-between">
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {formatCurrency(revenue)}
              </div>
              <div className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                {soldCount} Sold
              </div>
            </div>
          )}
          <div className="text-xs text-slate-400 font-medium mt-3">
            Sum of buyer delivery payouts
          </div>
        </Card>

        {/* Stat 4: DNC-Flagged Count */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              DNC Flagged Leads
            </span>
            <div className="w-9 h-9 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          {loading ? (
            <Skeleton className="h-8 w-24 mt-3" />
          ) : (
            <div className="mt-3 text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              {dncCount}
            </div>
          )}
          <div className="text-xs text-slate-400 font-medium mt-3">
            Blocked from delivery gate
          </div>
        </Card>
      </div>

      {/* Row 2: Soft Pastel Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Score Distribution */}
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white">
              Score Distribution
            </CardTitle>
            <CardDescription className="text-xs font-medium text-slate-400">
              Lead quality breakdown in timeframe
            </CardDescription>
          </CardHeader>
          <div className="h-56 w-full pt-2">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDist}>
                  <XAxis dataKey="bucket" stroke="#94a3b8" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '16px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#93c5fd" radius={[10, 10, 10, 10]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        {/* Chart 2: Buyer Acceptance Rate */}
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white">
              Buyer Acceptance Rate
            </CardTitle>
            <CardDescription className="text-xs font-medium text-slate-400">
              Accepted vs rejected offer deliveries
            </CardDescription>
          </CardHeader>
          <div className="h-56 w-full flex items-center justify-center">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={buyerAcceptance}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {buyerAcceptance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_PASTEL_COLORS[index % PIE_PASTEL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '16px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex items-center justify-center gap-6 text-xs mt-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#6ee7b7]" />
              <span className="font-medium text-slate-600 dark:text-slate-300">Accepted ({buyerAcceptance[0]?.value || 0})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#fca5a5]" />
              <span className="font-medium text-slate-600 dark:text-slate-300">Rejected ({buyerAcceptance[1]?.value || 0})</span>
            </div>
          </div>
        </Card>

        {/* Chart 3: Leads by Brand */}
        <Card className="p-6">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="text-base font-extrabold text-slate-900 dark:text-white">
              Leads by Brand
            </CardTitle>
            <CardDescription className="text-xs font-medium text-slate-400">
              Lead volume per brand domain
            </CardDescription>
          </CardHeader>
          <div className="h-56 w-full pt-2">
            {loading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={brandDist} layout="vertical">
                  <XAxis type="number" stroke="#94a3b8" fontSize={11} allowDecimals={false} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} width={100} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '16px', fontSize: '12px' }}
                  />
                  <Bar dataKey="count" fill="#c084fc" radius={[10, 10, 10, 10]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Row 3: Recent Leads Table matching soft design */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-5 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-extrabold text-slate-900 dark:text-white">
              Recent Lead Activity
            </CardTitle>
            <CardDescription className="text-xs font-medium text-slate-400">
              Most recent lead submissions
            </CardDescription>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-slate-100 dark:border-slate-800">
                <TableHead className="text-xs font-bold text-slate-400">Submitted</TableHead>
                <TableHead className="text-xs font-bold text-slate-400">Brand</TableHead>
                <TableHead className="text-xs font-bold text-slate-400">Contact Information</TableHead>
                <TableHead className="text-xs font-bold text-slate-400">Score</TableHead>
                <TableHead className="text-xs font-bold text-slate-400">Status</TableHead>
                <TableHead className="text-xs font-bold text-slate-400">Monetization</TableHead>
                <TableHead className="text-right text-xs font-bold text-slate-400">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : recentLeads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-slate-400 text-xs">
                    No recent leads found in this timeframe.
                  </TableCell>
                </TableRow>
              ) : (
                recentLeads.map((lead) => {
                  const score = Number(lead.score || 0);
                  let scoreBadge = <Badge variant="destructive">{score}/100</Badge>;
                  if (score >= 70) scoreBadge = <Badge variant="success">{score}/100</Badge>;
                  else if (score >= 40) scoreBadge = <Badge variant="warning">{score}/100</Badge>;

                  return (
                    <TableRow
                      key={lead.id}
                      className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/60 transition-colors"
                      onClick={() => setSelectedLead(lead)}
                    >
                      <TableCell className="font-mono text-xs text-slate-500">
                        {formatDate(lead.created_at)}
                      </TableCell>
                      <TableCell className="font-bold text-xs text-slate-900 dark:text-white">
                        {lead.brands?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {lead.full_name || 'N/A'}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {lead.email || lead.phone || 'No contact info'}
                        </div>
                      </TableCell>
                      <TableCell>{scoreBadge}</TableCell>
                      <TableCell>
                        <span className="capitalize px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {lead.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {lead.sold ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Sold
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <XCircle className="w-3.5 h-3.5" /> Unsold
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <button className="text-slate-600 dark:text-slate-400 hover:text-slate-900 text-xs font-semibold inline-flex items-center gap-1">
                          Details <ExternalLink className="w-3 h-3" />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Lead Detail Side Modal Drawer */}
      {selectedLead && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-end p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl h-full rounded-3xl p-6 overflow-y-auto shadow-2xl relative animate-in slide-in-from-right duration-200">
            <button
              onClick={() => setSelectedLead(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold text-xs"
            >
              ✕
            </button>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">
              Lead Details
            </h2>
            <div className="text-xs font-mono text-slate-400 mb-6">ID: {selectedLead.id}</div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">Brand</span>
                  <div className="font-extrabold text-slate-900 dark:text-white">{selectedLead.brands?.name}</div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">Score</span>
                  <div className="font-extrabold text-slate-900 dark:text-white">{selectedLead.score}/100</div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">Full Name</span>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedLead.full_name || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">Email</span>
                  <div className="font-mono text-xs">{selectedLead.email || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">Phone</span>
                  <div className="font-mono text-xs">{selectedLead.phone || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 font-medium">DNC Flagged</span>
                  <div className="font-bold text-rose-500">{selectedLead.dnc_flagged ? 'Yes' : 'No'}</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
                <div className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">Monetization Status</div>
                <div className="flex items-center justify-between">
                  <span>Sold to Buyer:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedLead.sold ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
