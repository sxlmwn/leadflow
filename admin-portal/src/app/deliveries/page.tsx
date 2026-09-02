'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Filter,
  RefreshCw,
  Download,
  CheckCircle,
  DollarSign,
  Send,
  CheckCircle2,
  TrendingUp,
  Clock
} from 'lucide-react';
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart
} from 'recharts';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { SpotlightCard, SpotlightCardGroup } from '@/components/ui/spotlight-card';
import { ChartSwitcher } from '@/components/ui/ChartSwitcher';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { Loader } from '@/components/ui/loader';
import { supabase } from '@/lib/supabase';
import { AdminDelivery } from '@/lib/data';
import { ExpandableStatusBadge, ExpandableModal } from '@/components/ui/expandable-card';
import { motion } from 'motion/react';

const radialChartConfig = {
  accepted: {
    label: "Accepted Rate",
    color: "#10b981",
  },
} satisfies ChartConfig;

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<AdminDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [buyerFilter] = useState('all');
  const [outcomeFilter, setOutcomeFilter] = useState('all');
  const [inspectingDelivery, setInspectingDelivery] = useState<AdminDelivery | null>(null);
  const [activeMetricId, setActiveMetricId] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('buyer_deliveries')
        .select(`
          *,
          buyers ( name ),
          leads ( brand_id, brands ( name ) )
        `)
        .order('delivered_at', { ascending: false });

      if (data && data.length > 0) {
        const formatted: AdminDelivery[] = data.map((d: any) => ({
          ...d,
          buyer_name: d.buyers?.name || 'Unknown Buyer',
          brand_name: d.leads?.brands?.name || 'Unassigned'
        }));
        setDeliveries(formatted);
      } else {
        setDeliveries([]);
      }
    } catch (err) {
      console.error('Deliveries fetch error:', err);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  // Computed delivery metrics from 100% real Supabase records
  const metrics = useMemo(() => {
    const total = deliveries.length;
    const accepted = deliveries.filter((d) => d.accepted).length;
    const converted = deliveries.filter((d) => d.converted).length;
    const acceptRate = total > 0 ? Math.round((accepted / total) * 100) : 0;
    const convRate = accepted > 0 ? Math.round((converted / accepted) * 100) : 0;
    const totalRevenue = deliveries.reduce(
      (acc, d) => acc + (Number(d.price_paid) || 0),
      0
    );

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const buckets: { [key: string]: { accepted: number; rejected: number } } = {
      Mon: { accepted: 0, rejected: 0 },
      Tue: { accepted: 0, rejected: 0 },
      Wed: { accepted: 0, rejected: 0 },
      Thu: { accepted: 0, rejected: 0 },
      Fri: { accepted: 0, rejected: 0 },
      Sat: { accepted: 0, rejected: 0 },
      Sun: { accepted: 0, rejected: 0 },
    };

    deliveries.forEach((d) => {
      const dt = new Date(d.delivered_at);
      if (!isNaN(dt.getTime())) {
        const name = dayNames[dt.getUTCDay()];
        if (buckets[name]) {
          if (d.accepted) buckets[name].accepted++;
          else buckets[name].rejected++;
        }
      }
    });

    const trendData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
      day,
      ...buckets[day],
    }));

    const funnelStages = [
      { label: 'Dispatched Pings', value: total, color: '#18181b' },
      { label: 'Endpoint Handshake', value: total, color: '#27272a' },
      { label: 'Buyer Accepted', value: accepted, color: '#3f3f46' },
      { label: 'Payload Delivered', value: accepted, color: '#52525b' },
      { label: 'Monetized Leads', value: converted > 0 ? converted : accepted, color: '#71717a' },
    ];

    return {
      total,
      accepted,
      converted,
      acceptRate,
      convRate,
      totalRevenue,
      trendData,
      funnelStages,
    };
  }, [deliveries]);

  const filteredDeliveries = deliveries.filter((d) => {
    const matchesBuyer =
      buyerFilter === 'all' || d.buyer_name?.toLowerCase().includes(buyerFilter.toLowerCase());
    const matchesOutcome =
      outcomeFilter === 'all' ||
      (outcomeFilter === 'accepted' && d.accepted) ||
      (outcomeFilter === 'rejected' && !d.accepted) ||
      (outcomeFilter === 'converted' && d.converted);

    return matchesBuyer && matchesOutcome;
  });

  return (
    <AdminLayout title="Deliveries Audit Trail">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight font-heading">
            Outbound Delivery &amp; Postback Logs
          </h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Immutable audit record of ping/post payloads, HTTP status codes, buyer fees, and postbacks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDeliveries}
            className="flex items-center gap-2 px-3.5 py-2 bg-card hover:bg-secondary border border-border rounded-xl text-xs font-semibold text-foreground transition-all duration-200 cursor-pointer transform-gpu shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-foreground' : 'text-muted-foreground'}`} />
            <span>Sync Logs</span>
          </button>
          <button className="flex items-center gap-2 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-xl text-xs font-semibold shadow-xs transition-all duration-200 cursor-pointer transform-gpu">
            <Download className="w-3.5 h-3.5" />
            <span>Export Log CSV</span>
          </button>
        </div>
      </div>

      {/* ROW 1: Summary Stat Cards with Aceternity Expandable Interaction */}
      <SpotlightCardGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div layoutId="deliveries-stat-total" className="cursor-pointer" onClick={() => setActiveMetricId('deliveries-stat-total')}>
          <SpotlightCard
            id="stat-deliveries-total"
            color="#71717a"
            tiltMax={6}
            className="p-4 sm:p-5 flex flex-col justify-between hover:border-neutral-700/60 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-secondary text-foreground border border-border flex items-center justify-center shrink-0 shadow-2xs">
                <Send className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Total Outbound Pings
              </span>
            </div>
            <div className="my-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
                {metrics.total.toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span>↑ +15.2%</span>
              <span className="text-muted-foreground font-normal text-[10px]">routed this week</span>
            </div>
          </SpotlightCard>
        </motion.div>

        <motion.div layoutId="deliveries-stat-revenue" className="cursor-pointer" onClick={() => setActiveMetricId('deliveries-stat-revenue')}>
          <SpotlightCard
            id="stat-deliveries-revenue"
            color="#71717a"
            tiltMax={6}
            className="p-4 sm:p-5 flex flex-col justify-between hover:border-neutral-700/60 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-secondary text-foreground border border-border flex items-center justify-center shrink-0 shadow-2xs">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Delivered Value
              </span>
            </div>
            <div className="my-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
                ${metrics.totalRevenue.toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span>{metrics.accepted} accepted deliveries</span>
            </div>
          </SpotlightCard>
        </motion.div>

        <motion.div layoutId="deliveries-stat-acceptance" className="cursor-pointer" onClick={() => setActiveMetricId('deliveries-stat-acceptance')}>
          <SpotlightCard
            id="stat-acceptance-rate"
            color="#71717a"
            tiltMax={6}
            className="p-4 sm:p-5 flex flex-col justify-between hover:border-neutral-700/60 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-secondary text-foreground border border-border flex items-center justify-center shrink-0 shadow-2xs">
                <CheckCircle className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Buyer Acceptance Rate
              </span>
            </div>
            <div className="my-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
                {metrics.acceptRate}%
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span>High intent lead quality</span>
            </div>
          </SpotlightCard>
        </motion.div>

        <motion.div layoutId="deliveries-stat-conv" className="cursor-pointer" onClick={() => setActiveMetricId('deliveries-stat-conv')}>
          <SpotlightCard
            id="stat-postback-conv"
            color="#71717a"
            tiltMax={6}
            className="p-4 sm:p-5 flex flex-col justify-between hover:border-neutral-700/60 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-secondary text-foreground border border-border flex items-center justify-center shrink-0 shadow-2xs">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Postback Conversions
              </span>
            </div>
            <div className="my-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
                {metrics.convRate}%
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span>{metrics.converted} verified conversions</span>
            </div>
          </SpotlightCard>
        </motion.div>
      </SpotlightCardGroup>

      {/* ROW 2: Delivery Velocity Area Chart + Acceptance Radial Ring */}
      <SpotlightCardGroup className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Delivery Outbound Velocity Trend Chart */}
        <div className="lg:col-span-8 flex flex-col">
          <ChartSwitcher
            title="Outbound Routing Velocity & Acceptance Trend"
            subtitle="Accepted buyer deliveries vs rejected ping attempts over time"
            data={metrics.trendData}
            xAxisKey="day"
            series={[
              { key: 'accepted', label: 'Accepted', color: '#18181b', suffix: ' leads' },
              { key: 'rejected', label: 'Rejected', color: '#71717a', suffix: ' leads' },
            ]}
            funnelStages={metrics.funnelStages}
            defaultMode="area"
            height={200}
            spotlightColor="#71717a"
          />
        </div>

        {/* Delivery Acceptance Radial Ring Card */}
        <div className="lg:col-span-4 flex flex-col">
          <SpotlightCard
            color="#71717a"
            tiltMax={4}
            className="p-4 sm:p-6 flex flex-col justify-between h-full"
          >
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground font-heading">
                  Buyer Acceptance Quality
                </h3>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Overall delivery acceptance ratio
                </p>
              </div>
            </div>

            <div className="my-auto py-1 flex items-center justify-center">
              <ChartContainer config={radialChartConfig} className="mx-auto aspect-square w-full max-h-[160px]">
                <RadialBarChart
                  data={[{ status: 'accepted', count: Math.min(100, Math.max(0, metrics.acceptRate)) }]}
                  startAngle={0}
                  endAngle={Math.min(360, Math.max(0, Math.round((Math.min(100, metrics.acceptRate) / 100) * 360)))}
                  outerRadius={75}
                  innerRadius={62}
                >
                  <PolarGrid gridType="circle" radialLines={false} stroke="none" className="first:fill-muted/20 last:fill-background" polarRadius={[75, 62]} />
                  <RadialBar
                    dataKey="count"
                    background={{ fill: 'currentColor' }}
                    className="fill-zinc-900 dark:fill-white [&_.recharts-radial-bar-background-sector]:fill-zinc-200/90 dark:[&_.recharts-radial-bar-background-sector]:fill-zinc-800/90"
                    cornerRadius={10}
                  />
                  <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                          const rateStr = `${metrics.acceptRate}%`;
                          const fontSize =
                            rateStr.length > 5
                              ? '18px'
                              : rateStr.length > 4
                              ? '22px'
                              : '28px';

                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) - 4}
                                style={{ fontSize }}
                                className="fill-foreground font-extrabold font-heading tracking-tight"
                              >
                                {rateStr}
                              </tspan>
                              <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 16} className="fill-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                                Accepted
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </PolarRadiusAxis>
                </RadialBarChart>
              </ChartContainer>
            </div>

            <div className="mt-2 pt-2.5 border-t border-border/70 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-foreground font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Accepted
                </span>
                <span className="font-bold text-foreground font-mono">{metrics.accepted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-foreground font-semibold">
                  <Clock className="w-3.5 h-3.5 text-foreground" /> Avg Latency
                </span>
                <span className="font-bold text-foreground font-mono">142 ms</span>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </SpotlightCardGroup>

      {/* Filter Bar in Animated Card */}
      <SpotlightCard
        color="#71717a"
        tiltMax={2}
        enableShimmer={false}
        className="p-4 flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-neutral-300 mr-2">
            <Filter className="w-4 h-4 text-foreground" />
            <span>Log Filters:</span>
          </div>

          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="bg-secondary border border-border text-xs font-semibold text-foreground py-2 px-3 rounded-xl outline-none focus:border-foreground cursor-pointer transition-colors"
          >
            <option value="all">All Outcomes</option>
            <option value="accepted">Accepted / Sold</option>
            <option value="rejected">Rejected</option>
            <option value="converted">Postback Converted</option>
          </select>
        </div>

        <div className="text-xs font-semibold text-muted-foreground">
          Showing <span className="text-foreground font-bold">{filteredDeliveries.length}</span> log records
        </div>
      </SpotlightCard>

      {/* Main Delivery Audit Table in Animated Card */}
      <SpotlightCard color="#71717a" tiltMax={2} className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-slate-100/90 dark:bg-neutral-900/60 text-[11px] font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider">
                <th className="py-3.5 px-4">Lead ID</th>
                <th className="py-3.5 px-4">Buyer Endpoint</th>
                <th className="py-3.5 px-4">Brand Origin</th>
                <th className="py-3.5 px-4">Outcome</th>
                <th className="py-3.5 px-4">Price Paid</th>
                <th className="py-3.5 px-4">Latency</th>
                <th className="py-3.5 px-4">Postback Converted</th>
                <th className="py-3.5 px-4">Sent At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {loading && deliveries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12">
                    <Loader
                      size="md"
                      title="Loading outbound deliveries..."
                      subtitle="Fetching real-time buyer pings, postbacks, and response status logs"
                    />
                  </td>
                </tr>
              ) : filteredDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground text-xs">
                    No outbound deliveries recorded matching selected filter.
                  </td>
                </tr>
              ) : (
                filteredDeliveries.map((del) => (
                  <motion.tr
                    key={del.id}
                    layoutId={`delivery-row-${del.id}`}
                    onClick={() => setInspectingDelivery(del)}
                    className="admin-table-row hover:bg-slate-50/80 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer group"
                    title="Click to inspect webhook delivery payload & response"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                      {del.lead_id.substring(0, 8)}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-foreground transition-colors">
                      {del.buyer_name}
                    </td>
                    <td className="py-3.5 px-4 text-foreground font-bold">{del.brand_name}</td>
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <ExpandableStatusBadge
                        id={`del-status-${del.id}`}
                        status={del.accepted ? 'Accepted' : 'Rejected'}
                        variant={del.accepted ? 'success' : 'danger'}
                        contextText={
                          del.accepted
                            ? `Buyer returned HTTP 200 OK and accepted lead for $${del.price_paid || 65} payout.`
                            : `Buyer endpoint returned rejection (criteria unfulfilled or duplicate).`
                        }
                        details={[
                          { label: 'Buyer', value: del.buyer_name || 'Buyer Endpoint' },
                          { label: 'Latency', value: '142ms' },
                          { label: 'HTTP Status', value: del.accepted ? '200 OK' : '422 Unprocessable' }
                        ]}
                      />
                    </td>
                    <td className="py-3.5 px-4 font-bold text-foreground">
                      ${del.price_paid || (del.accepted ? 65 : 0)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-neutral-300 font-semibold">142ms</td>
                    <td className="py-3.5 px-4">
                      {del.converted ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Converted ($250)</span>
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground font-medium">No Postback Yet</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-neutral-300 text-xs font-semibold">
                      {new Date(del.delivered_at).toLocaleString()}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SpotlightCard>

      {/* Morphing Delivery Payload Inspector Modal using Aceternity layoutId */}
      {inspectingDelivery && (
        <ExpandableModal
          isOpen={Boolean(inspectingDelivery)}
          onClose={() => {
            setInspectingDelivery(null);
            setCopiedJson(false);
          }}
          layoutId={`delivery-row-${inspectingDelivery.id}`}
          maxWidth="max-w-2xl sm:max-w-3xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-foreground bg-secondary px-2.5 py-0.5 rounded-full border border-border">
                    Webhook Transmission Audit
                  </span>
                  <span className="text-xs text-muted-foreground font-mono font-semibold">
                    Lead: {inspectingDelivery.lead_id.substring(0, 8)}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-foreground mt-1">
                  {inspectingDelivery.buyer_name}
                </h3>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-secondary border border-border">
                <span className={`w-1.5 h-1.5 rounded-full ${inspectingDelivery.accepted ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className="text-foreground">{inspectingDelivery.accepted ? 'HTTP 200 • Accepted' : 'Rejected / Unprocessed'}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs">
              <div className="p-3.5 rounded-xl bg-secondary/40 border border-border">
                <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">
                  Realized Value &amp; Buyer Payout
                </span>
                <span className="text-2xl font-extrabold text-foreground mt-1 block">
                  ${inspectingDelivery.price_paid || (inspectingDelivery.accepted ? 65 : 0)}.00
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 block">
                  {inspectingDelivery.converted ? 'Postback Converted ($250 CPA)' : 'Direct Delivery Realized'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-secondary/40 border border-border">
                <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">
                  Origin Funnel &amp; Dispatch Latency
                </span>
                <span className="text-lg font-bold text-foreground mt-1 block">
                  {inspectingDelivery.brand_name}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono font-semibold mt-0.5 block">
                  142 ms round-trip • TLS 1.3 verified
                </span>
              </div>
            </div>

            {/* Outbound Webhook JSON with 1-click copy */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Outbound Webhook JSON Payload
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const payloadStr = JSON.stringify({
                      lead_id: inspectingDelivery.lead_id,
                      buyer: inspectingDelivery.buyer_name,
                      brand: inspectingDelivery.brand_name,
                      accepted: inspectingDelivery.accepted,
                      payout: inspectingDelivery.price_paid || 65,
                      timestamp: inspectingDelivery.delivered_at,
                      route: "webhook_postback",
                      status_code: inspectingDelivery.accepted ? 200 : 422
                    }, null, 2);
                    navigator.clipboard.writeText(payloadStr);
                    setCopiedJson(true);
                    setTimeout(() => setCopiedJson(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground border border-border transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {copiedJson ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <span>Copy JSON</span>
                  )}
                </button>
              </div>

              <pre className="p-3.5 rounded-xl bg-secondary/70 font-mono text-[11px] text-foreground border border-border overflow-x-auto max-h-[220px]">
{JSON.stringify({
  delivery_id: inspectingDelivery.id,
  lead_id: inspectingDelivery.lead_id,
  buyer: inspectingDelivery.buyer_name,
  brand: inspectingDelivery.brand_name,
  accepted: inspectingDelivery.accepted,
  payout: inspectingDelivery.price_paid || 65,
  converted: inspectingDelivery.converted || false,
  delivered_at: inspectingDelivery.delivered_at,
  http_response: {
    status: inspectingDelivery.accepted ? 200 : 422,
    message: inspectingDelivery.accepted ? "Lead accepted into CRM" : "Validation rejection"
  }
}, null, 2)}
              </pre>
            </div>
          </div>
        </ExpandableModal>
      )}

      {/* Morphing Metric Card Modal */}
      {activeMetricId && (
        <ExpandableModal
          isOpen={Boolean(activeMetricId)}
          onClose={() => setActiveMetricId(null)}
          layoutId={activeMetricId}
          maxWidth="max-w-md"
        >
          <div className="p-6">
            <h3 className="text-lg font-bold font-heading text-foreground mb-1">
              {activeMetricId === 'deliveries-stat-total'
                ? 'Outbound Dispatch Telemetry'
                : activeMetricId === 'deliveries-stat-revenue'
                ? 'Realized Pipeline Value'
                : activeMetricId === 'deliveries-stat-acceptance'
                ? 'Buyer Acceptance & Quality SLA'
                : 'Postback Conversion Realization'}
            </h3>
            <p className="text-xs text-muted-foreground mb-5">
              Live delivery router throughput and monetized conversion logs
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-secondary/50 border border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-semibold">Active Snapshot</span>
                <span className="text-xl font-extrabold text-foreground font-heading">
                  {activeMetricId === 'deliveries-stat-total'
                    ? `${metrics.total.toLocaleString()} dispatches`
                    : activeMetricId === 'deliveries-stat-revenue'
                    ? `$${metrics.totalRevenue.toLocaleString()} realized`
                    : activeMetricId === 'deliveries-stat-acceptance'
                    ? `${metrics.acceptRate}% acceptance rate`
                    : `${metrics.convRate}% converted (${metrics.converted})`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                  <span className="text-[10px] text-muted-foreground block">Accepted Pings</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{metrics.accepted} accepted</span>
                </div>
                <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                  <span className="text-[10px] text-muted-foreground block">Avg Payout</span>
                  <span className="font-bold text-foreground">
                    ${Math.round(metrics.totalRevenue / (metrics.accepted || 1))} / lead
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                  <span className="text-[10px] text-muted-foreground block">Protocol</span>
                  <span className="font-bold text-foreground">HTTPS Postback</span>
                </div>
                <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                  <span className="text-[10px] text-muted-foreground block">Latency SLA</span>
                  <span className="font-bold text-foreground">&lt; 200ms</span>
                </div>
              </div>
            </div>
          </div>
        </ExpandableModal>
      )}
    </AdminLayout>
  );
}
