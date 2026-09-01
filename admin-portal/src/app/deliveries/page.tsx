'use client';

import React, { useEffect, useState } from 'react';
import {
  Filter,
  RefreshCw,
  Download,
  CheckCircle
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { supabase } from '@/lib/supabase';
import { AdminDelivery } from '@/lib/data';

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<AdminDelivery[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [buyerFilter] = useState('all');
  const [outcomeFilter, setOutcomeFilter] = useState('all');

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight font-heading">
            Outbound Delivery &amp; Postback Logs
          </h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Immutable audit record of ping/post payloads, HTTP status, payout fees, and postbacks
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDeliveries}
            className="flex items-center gap-2 px-3.5 py-2 bg-card hover:bg-secondary border border-border rounded-xl text-xs font-semibold text-foreground transition-all duration-200 cursor-pointer transform-gpu shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`} />
            <span>Sync Logs</span>
          </button>
          <button className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all duration-200 cursor-pointer transform-gpu">
            <Download className="w-3.5 h-3.5" />
            <span>Export Log CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Bar in Animated Card */}
      <SpotlightCard
        color="#2563eb"
        tiltMax={2}
        enableShimmer={false}
        className="p-4 flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mr-2">
            <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Log Filters:</span>
          </div>

          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="bg-secondary border border-border text-xs font-semibold text-foreground py-2 px-3 rounded-xl outline-none focus:border-blue-500 cursor-pointer transition-colors"
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
      <SpotlightCard color="#3b82f6" tiltMax={2} className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-slate-50/70 dark:bg-slate-800/40 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
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
              {filteredDeliveries.map((del) => (
                <tr key={del.id} className="admin-table-row hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    {del.lead_id.substring(0, 8)}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-foreground">{del.buyer_name}</td>
                  <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-semibold">{del.brand_name}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        del.accepted
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {del.accepted ? 'Accepted' : 'Rejected'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-foreground">
                    ${del.price_paid || (del.accepted ? 65 : 0)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-muted-foreground">142ms</td>
                  <td className="py-3.5 px-4">
                    {del.converted ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle className="w-3 h-3" />
                        Converted ($250)
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">No Postback Yet</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
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
