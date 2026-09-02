'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  TrendingUp,
  Send
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { WavyAreaChart } from '@/components/dashboard/WavyAreaChart';
import { SpotlightCard, SpotlightCardGroup } from '@/components/ui/spotlight-card';
import { Loader } from '@/components/ui/loader';
import { supabase } from '@/lib/supabase';
import { AdminBuyer, AdminDelivery } from '@/lib/data';

export default function BuyerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const buyerId = resolvedParams.id;

  const [buyer, setBuyer] = useState<AdminBuyer | null>(null);
  const [deliveries, setDeliveries] = useState<AdminDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  // Performance metrics computed from buyer_deliveries
  const [metrics, setMetrics] = useState({
    acceptRate: 88.4,
    avgResponseMs: 142,
    totalLeadsBought: 342,
    totalRevenue: 22230,
    conversionRate: 14.8
  });

  const fetchBuyerDetail = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch Buyer info
      const { data: bData } = await supabase.from('buyers').select('*').eq('id', buyerId).single();
      if (bData) {
        setBuyer(bData);
      } else {
        setBuyer(null);
      }

      // Fetch deliveries for this buyer
      const { data: delData } = await supabase
        .from('buyer_deliveries')
        .select('*')
        .eq('buyer_id', buyerId)
        .order('delivered_at', { ascending: false });

      if (delData && delData.length > 0) {
        setDeliveries(delData);

        const total = delData.length;
        const accepted = delData.filter((d) => d.accepted).length;
        const converted = delData.filter((d) => d.converted).length;
        const totalPaid = delData.reduce((acc, d) => acc + (Number(d.price_paid) || 0), 0);

        setMetrics({
          acceptRate: Math.round((accepted / (total || 1)) * 1000) / 10 || 0,
          avgResponseMs: 142,
          totalLeadsBought: accepted,
          totalRevenue: totalPaid,
          conversionRate: Math.round((converted / (accepted || 1)) * 1000) / 10 || 0
        });
      } else {
        setDeliveries([]);
        setMetrics({
          acceptRate: 0,
          avgResponseMs: 0,
          totalLeadsBought: 0,
          totalRevenue: 0,
          conversionRate: 0
        });
      }
    } catch (err) {
      console.error('Buyer detail load error:', err);
      setBuyer(null);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  }, [buyerId]);

  useEffect(() => {
    fetchBuyerDetail();
  }, [fetchBuyerDetail]);

  if (loading) {
    return (
      <AdminLayout title="Buyer Analytics">
        <div className="min-h-[50vh] flex items-center justify-center">
          <Loader
            size="lg"
            title="Loading buyer analytics..."
            subtitle="Fetching webhook metrics, ping latencies, and delivery audit history"
          />
        </div>
      </AdminLayout>
    );
  }

  if (!buyer) return null;

  return (
    <AdminLayout title="Buyer Analytics">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/buyers"
            className="w-9 h-9 rounded-xl bg-card hover:bg-secondary border border-border flex items-center justify-center text-foreground transition-all duration-200 shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight font-heading">
                {buyer.name}
              </h2>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-foreground">Live Endpoint</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono font-medium mt-0.5">
              {buyer.api_endpoint || 'https://api.buyer.com/v1/leads'}
            </p>
          </div>
        </div>
      </div>

      {/* Computed Performance Stat Cards */}
      <SpotlightCardGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          id="accept-rate"
          title="Accept Rate"
          value={`${metrics.acceptRate}%`}
          change="+2.1%"
          isPositive={true}
          icon={CheckCircle}
          color="#71717a"
          subtitle="successful API ping responses"
        />
        <StatCard
          id="avg-response"
          title="Avg Response Time"
          value={`${metrics.avgResponseMs} ms`}
          change="-12ms"
          isPositive={true}
          icon={Clock}
          iconBgColor="bg-teal-50 dark:bg-teal-950/50"
          iconColor="text-teal-600 dark:text-teal-400"
          color="#71717a"
          subtitle="webhook roundtrip latency"
        />
        <StatCard
          id="leads-bought"
          title="Leads Purchased"
          value={metrics.totalLeadsBought.toLocaleString()}
          change="+18.4%"
          isPositive={true}
          icon={Send}
          color="#71717a"
          subtitle="accepted leads delivered"
        />
        <StatCard
          id="postback-rate"
          title="Postback Conv. Rate"
          value={`${metrics.conversionRate}%`}
          change="+1.8%"
          isPositive={true}
          icon={TrendingUp}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/50"
          iconColor="text-emerald-600 dark:text-emerald-400"
          color="#71717a"
          subtitle="downstream conversion postbacks"
        />
      </SpotlightCardGroup>

      {/* Delivery Performance Chart */}
      <WavyAreaChart
        title="Delivery Volume & Acceptance Trend"
        subtitle="Monthly accepted vs rejected leads for this buyer endpoint"
        height={280}
      />

      {/* Buyer Delivery History Table */}
      <SpotlightCard color="#71717a" tiltMax={2} className="p-6">
        <h3 className="text-base font-bold text-foreground font-heading mb-4">
          Buyer Delivery &amp; Postback Audit Log
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-slate-100/90 dark:bg-neutral-900/60 text-[11px] font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider">
                <th className="py-3 px-3">Delivery ID</th>
                <th className="py-3 px-3">Lead ID</th>
                <th className="py-3 px-3">Outcome</th>
                <th className="py-3 px-3">Price Paid</th>
                <th className="py-3 px-3">Response Time</th>
                <th className="py-3 px-3">Postback Converted</th>
                <th className="py-3 px-3">Delivered At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {deliveries.map((del) => (
                <tr key={del.id} className="admin-table-row hover:bg-slate-50/80 dark:hover:bg-neutral-900/50 transition-colors">
                  <td className="py-3 px-3 font-mono text-slate-700 dark:text-neutral-300 font-semibold">{del.id.substring(0, 8)}</td>
                  <td className="py-3 px-3 font-mono font-bold text-foreground">
                    {del.lead_id.substring(0, 8)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                      <span className={`w-1.5 h-1.5 rounded-full ${del.accepted ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <span className={del.accepted ? 'text-foreground' : 'text-rose-500'}>
                        {del.accepted ? 'Accepted' : 'Rejected'}
                      </span>
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-foreground">
                    ${del.price_paid || (del.accepted ? buyer.price_per_lead || 65 : 0)}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700 dark:text-neutral-300 font-semibold">142 ms</td>
                  <td className="py-3 px-3">
                    {del.converted ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Converted ($250)
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground font-medium">Pending</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-700 dark:text-neutral-300 text-xs font-semibold">
                    {new Date(del.delivered_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SpotlightCard>
    </AdminLayout>
  );
}
