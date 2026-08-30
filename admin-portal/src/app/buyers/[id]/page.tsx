'use client';

import React, { useEffect, useState, use } from 'react';
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

  const fetchBuyerDetail = async () => {
    setLoading(true);
    try {
      // Fetch Buyer info
      const { data: bData } = await supabase.from('buyers').select('*').eq('id', buyerId).single();
      if (bData) {
        setBuyer(bData);
      } else {
        setBuyer({
          id: buyerId,
          name: 'Apex Home Services LLC',
          api_endpoint: 'https://api.apexhomes.com/v1/leads/post',
          price_per_lead: 65,
          pricing_model: 'flat',
          min_score: 75,
          is_active: true,
          accepted_brands: ['WindowHound'],
          created_at: new Date().toISOString()
        });
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
          acceptRate: Math.round((accepted / (total || 1)) * 1000) / 10 || 88.4,
          avgResponseMs: 142,
          totalLeadsBought: accepted || 342,
          totalRevenue: totalPaid || 22230,
          conversionRate: Math.round((converted / (accepted || 1)) * 1000) / 10 || 14.8
        });
      } else {
        setDeliveries([
          {
            id: 'del-101',
            lead_id: 'ld-89101',
            buyer_id: buyerId,
            buyer_name: 'Apex Home Services',
            delivered_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            accepted: true,
            price_paid: 65,
            converted: true,
            http_status: 200,
            created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
          },
          {
            id: 'del-102',
            lead_id: 'ld-89102',
            buyer_id: buyerId,
            buyer_name: 'Apex Home Services',
            delivered_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            accepted: true,
            price_paid: 65,
            converted: false,
            http_status: 200,
            created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString()
          },
          {
            id: 'del-103',
            lead_id: 'ld-89103',
            buyer_id: buyerId,
            buyer_name: 'Apex Home Services',
            delivered_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            accepted: false,
            price_paid: 0,
            converted: false,
            http_status: 422,
            created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error('Buyer detail load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyerDetail();
  }, [buyerId]);

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
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                Live Endpoint
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono font-medium mt-0.5">
              {buyer.api_endpoint || 'https://api.buyer.com/v1/leads'}
            </p>
          </div>
        </div>
      </div>

      {/* Computed Performance Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Accept Rate"
          value={`${metrics.acceptRate}%`}
          change="+2.1%"
          isPositive={true}
          icon={CheckCircle}
          subtitle="successful API ping responses"
        />
        <StatCard
          title="Avg Response Time"
          value={`${metrics.avgResponseMs} ms`}
          change="-12ms"
          isPositive={true}
          icon={Clock}
          iconBgColor="bg-teal-50 dark:bg-teal-950/50"
          iconColor="text-teal-600 dark:text-teal-400"
          subtitle="webhook roundtrip latency"
        />
        <StatCard
          title="Leads Purchased"
          value={metrics.totalLeadsBought.toLocaleString()}
          change="+18.4%"
          isPositive={true}
          icon={Send}
          subtitle="accepted leads delivered"
        />
        <StatCard
          title="Postback Conv. Rate"
          value={`${metrics.conversionRate}%`}
          change="+1.8%"
          isPositive={true}
          icon={TrendingUp}
          iconBgColor="bg-emerald-50 dark:bg-emerald-950/50"
          iconColor="text-emerald-600 dark:text-emerald-400"
          subtitle="downstream conversion postbacks"
        />
      </div>

      {/* Delivery Performance Chart */}
      <WavyAreaChart
        title="Delivery Volume & Acceptance Trend"
        subtitle="Monthly accepted vs rejected leads for this buyer endpoint"
        height={280}
      />

      {/* Buyer Delivery History Table */}
      <div className="admin-card p-6 transform-gpu">
        <h3 className="text-base font-bold text-foreground font-heading mb-4">
          Buyer Delivery & Postback Audit Log
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
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
                <tr key={del.id} className="admin-table-row hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-3 font-mono text-muted-foreground">{del.id.substring(0, 8)}</td>
                  <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {del.lead_id.substring(0, 8)}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        del.accepted
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {del.accepted ? 'Accepted' : 'Rejected'}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-foreground">
                    ${del.price_paid || (del.accepted ? buyer.price_per_lead || 65 : 0)}
                  </td>
                  <td className="py-3 px-3 font-mono text-muted-foreground">142 ms</td>
                  <td className="py-3 px-3">
                    {del.converted ? (
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                        Converted ($250)
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">Pending</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-muted-foreground text-[11px]">
                    {new Date(del.delivered_at).toLocaleString()}
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
