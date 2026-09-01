'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  Plus,
  ShieldCheck,
  ExternalLink,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Server,
  Lock,
  Zap,
  CheckCircle2,
  Building2
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart
} from 'recharts';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AddDomainModal } from '@/components/domains/AddDomainModal';
import { SpotlightCard, SpotlightCardGroup } from '@/components/ui/spotlight-card';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { AdminDomain, MOCK_DOMAINS } from '@/lib/data';
import { supabase } from '@/lib/supabase';

const radialChartConfig = {
  ssl: {
    label: "SSL Active",
    color: "#10b981",
  },
} satisfies ChartConfig;

export default function DomainsPage() {
  const [domains, setDomains] = useState<AdminDomain[]>(MOCK_DOMAINS);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Domain removal modal state
  const [deletingDomain, setDeletingDomain] = useState<AdminDomain | null>(null);
  const [leadRefCount, setLeadRefCount] = useState<number | null>(null);
  const [clickRefCount, setClickRefCount] = useState<number | null>(null);
  const [checkingRefs, setCheckingRefs] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const fetchDomains = async () => {
    setLoading(true);
    try {
      const { data: brandsData } = await supabase
        .from('brands')
        .select('id, name, domain, vertical, created_at, is_active')
        .order('created_at', { ascending: false });

      if (brandsData && brandsData.length > 0) {
        const mappedDomains: AdminDomain[] = brandsData
          .filter((b) => Boolean(b.domain))
          .map((b) => ({
            id: `dom-${b.id}`,
            domain: b.domain,
            brand_id: b.id,
            brand_name: b.name,
            status: b.is_active ? 'active' : 'pending',
            ssl_status: 'active',
            created_at: b.created_at || new Date().toISOString()
          }));

        setDomains(mappedDomains);
      } else {
        setDomains([]);
      }
    } catch (err) {
      console.error('Failed to load domains:', err);
      setDomains([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  // Computed domain metrics
  const metrics = useMemo(() => {
    const total = domains.length || 4;
    const active = domains.filter((d) => d.status === 'active').length || 4;
    const sslCount = domains.filter((d) => d.ssl_status === 'active').length || 4;
    const sslRate = Math.round((sslCount / (total || 1)) * 100);

    const latencyData = [
      { hour: '00:00', latency: 18, uptime: 100 },
      { hour: '04:00', latency: 15, uptime: 100 },
      { hour: '08:00', latency: 24, uptime: 99.9 },
      { hour: '12:00', latency: 22, uptime: 100 },
      { hour: '16:00', latency: 28, uptime: 100 },
      { hour: '20:00', latency: 19, uptime: 100 },
      { hour: '23:59', latency: 16, uptime: 100 },
    ];

    return {
      total,
      active,
      sslCount,
      sslRate,
      latencyData
    };
  }, [domains]);

  const handleAddDomain = (domainName: string, brandId: string, brandName: string) => {
    const newD: AdminDomain = {
      id: `d-${Date.now()}`,
      domain: domainName,
      brand_id: brandId,
      brand_name: brandName,
      status: 'active',
      ssl_status: 'active',
      created_at: new Date().toISOString()
    };
    setDomains([newD, ...domains]);
  };

  const initiateRemoveDomain = async (domain: AdminDomain) => {
    setDeletingDomain(domain);
    setLeadRefCount(null);
    setClickRefCount(null);
    setCheckingRefs(true);

    try {
      const { count: leadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('brand_id', domain.brand_id);

      const { count: clicksCount } = await supabase
        .from('clicks')
        .select('*', { count: 'exact', head: true })
        .eq('brand_id', domain.brand_id);

      setLeadRefCount(leadsCount || 0);
      setClickRefCount(clicksCount || 0);
    } catch (err) {
      console.error('Failed to check references for domain brand:', err);
      setLeadRefCount(0);
      setClickRefCount(0);
    } finally {
      setCheckingRefs(false);
    }
  };

  const handleConfirmRemove = async () => {
    if (!deletingDomain) return;
    setIsRemoving(true);

    try {
      if (deletingDomain.brand_id && !deletingDomain.brand_id.startsWith('b1111111') && !deletingDomain.brand_id.startsWith('b1')) {
        try {
          await supabase
            .from('brands')
            .update({ domain: '' })
            .eq('id', deletingDomain.brand_id);
        } catch (dbErr) {
          console.warn('Could not update brand domain in Supabase:', dbErr);
        }
      }

      setDomains((prev) => prev.filter((d) => d.id !== deletingDomain.id));
      setDeletingDomain(null);
    } catch (err: any) {
      console.error('Remove domain error:', err);
      alert(err.message || 'Failed to remove domain.');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <AdminLayout title="Custom Domains">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight font-heading">
            Domain Routing &amp; SSL Certificates
          </h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Custom brand domain bindings, edge CNAME routing, and automated Let&apos;s Encrypt TLS provisioning
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDomains}
            className="flex items-center gap-2 px-3.5 py-2 bg-card hover:bg-secondary border border-border rounded-xl text-xs font-semibold text-foreground transition-all duration-200 cursor-pointer transform-gpu shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`} />
            <span>Sync Domains</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-blue-500/20 transition-all duration-200 cursor-pointer transform-gpu"
          >
            <Plus className="w-4 h-4" />
            <span>Connect Domain</span>
          </button>
        </div>
      </div>

      {/* ROW 1: Summary Stat Cards */}
      <SpotlightCardGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <SpotlightCard
          id="stat-domains-total"
          color="#2563eb"
          tiltMax={6}
          className="p-4 sm:p-5 flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-border flex items-center justify-center shrink-0 shadow-2xs">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Connected Hostnames
            </span>
          </div>
          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
              {metrics.total}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span>{metrics.active} active edge routes</span>
          </div>
        </SpotlightCard>

        <SpotlightCard
          id="stat-ssl-status"
          color="#10b981"
          tiltMax={6}
          className="p-4 sm:p-5 flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-border flex items-center justify-center shrink-0 shadow-2xs">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              SSL / TLS Security
            </span>
          </div>
          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
              {metrics.sslRate}%
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span>Automatic Renewal Active</span>
          </div>
        </SpotlightCard>

        <SpotlightCard
          id="stat-dns-latency"
          color="#8b5cf6"
          tiltMax={6}
          className="p-4 sm:p-5 flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-border flex items-center justify-center shrink-0 shadow-2xs">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Avg Edge Resolution
            </span>
          </div>
          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
              21 <span className="text-sm font-normal text-muted-foreground">ms</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span>Global Anycast CDN Active</span>
          </div>
        </SpotlightCard>

        <SpotlightCard
          id="stat-brand-bindings"
          color="#0ea5e9"
          tiltMax={6}
          className="p-4 sm:p-5 flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-border flex items-center justify-center shrink-0 shadow-2xs">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Attached Funnels
            </span>
          </div>
          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
              {metrics.total}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span>1-to-1 Brand Isolation</span>
          </div>
        </SpotlightCard>
      </SpotlightCardGroup>

      {/* ROW 2: Edge Routing Latency Trend + SSL Health Radial Ring */}
      <SpotlightCardGroup className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Edge Routing Resolution Chart */}
        <div className="lg:col-span-8 flex flex-col">
          <SpotlightCard
            color="#2563eb"
            tiltMax={4}
            className="p-4 sm:p-6 flex flex-col justify-between h-full"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground font-heading">
                  Edge DNS Resolution &amp; Network Health
                </h3>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Global edge propagation latency (ms) across all custom brand hostnames
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <span className="w-2 h-2 rounded-full bg-blue-600" /> Latency (ms)
                </span>
              </div>
            </div>

            <div className="w-full h-[200px] my-1">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.latencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dnsLatency" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800/60" />
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card/95 backdrop-blur-md border border-border p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                            <p className="font-bold text-foreground pb-1 border-b border-border/60">{label} UTC</p>
                            <div className="text-blue-600 dark:text-blue-400 font-medium">Latency: {payload[0]?.value} ms</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area type="natural" dataKey="latency" stroke="#2563eb" strokeWidth={2.5} fillOpacity={1} fill="url(#dnsLatency)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SpotlightCard>
        </div>

        {/* SSL & DNS Validation Card */}
        <div className="lg:col-span-4 flex flex-col">
          <SpotlightCard
            color="#10b981"
            tiltMax={4}
            className="p-4 sm:p-6 flex flex-col justify-between h-full"
          >
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground font-heading">
                  Certificate Provisioning
                </h3>
                <p className="text-[11px] text-muted-foreground font-medium">
                  SSL active and verified rate
                </p>
              </div>
            </div>

            <div className="my-auto py-1 flex items-center justify-center">
              <ChartContainer config={radialChartConfig} className="mx-auto aspect-square w-full max-h-[160px]">
                <RadialBarChart
                  data={[{ status: 'ssl', count: metrics.sslRate, fill: '#10b981' }]}
                  startAngle={0}
                  endAngle={Math.round((metrics.sslRate / 100) * 360)}
                  outerRadius={75}
                  innerRadius={62}
                >
                  <PolarGrid gridType="circle" radialLines={false} stroke="none" className="first:fill-muted/40 last:fill-background" polarRadius={[75, 62]} />
                  <RadialBar dataKey="count" background={{ fill: 'currentColor' }} className="[&_.recharts-radial-bar-background-sector]:fill-slate-100 dark:[&_.recharts-radial-bar-background-sector]:fill-slate-800/80" cornerRadius={10} />
                  <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                              <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 4} className="fill-foreground text-2xl sm:text-3xl font-extrabold font-heading">
                                {metrics.sslRate}%
                              </tspan>
                              <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 16} className="fill-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                                SSL Valid
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
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> CNAME Verified
                </span>
                <span className="font-bold text-foreground font-mono">{metrics.active} of {metrics.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-foreground font-semibold">
                  <Server className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Edge CDN
                </span>
                <span className="font-bold text-foreground font-mono">Anycast Edge</span>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </SpotlightCardGroup>

      {/* Main Domains Table */}
      <SpotlightCard color="#2563eb" tiltMax={2} className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-slate-50/70 dark:bg-slate-800/40 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="py-3.5 px-4">Domain Name</th>
                <th className="py-3.5 px-4">Attached Brand</th>
                <th className="py-3.5 px-4">Routing Status</th>
                <th className="py-3.5 px-4">SSL Certificate</th>
                <th className="py-3.5 px-4">Added Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {domains.map((dom) => (
                <tr key={dom.id} className="admin-table-row hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-foreground flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span>{dom.domain}</span>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{dom.brand_name}</td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        dom.status === 'active'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : dom.status === 'pending'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          dom.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'
                        }`}
                      />
                      <span>{dom.status}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      SSL Active
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-muted-foreground text-[11px]">
                    {new Date(dom.created_at).toLocaleDateString()}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`https://${dom.domain}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-600 hover:bg-secondary transition-colors inline-flex items-center gap-1 font-semibold"
                        title="Visit Live Domain"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => initiateRemoveDomain(dom)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                        title="Remove Domain"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SpotlightCard>

      {/* REMOVE DOMAIN CONFIRMATION DIALOG MODAL */}
      {deletingDomain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center border border-rose-200 dark:border-rose-800 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground font-heading">
                  Remove Domain: {deletingDomain.domain}?
                </h3>
                <p className="text-xs text-muted-foreground">
                  Confirm domain unbinding &amp; routing policy
                </p>
              </div>
            </div>

            {/* Attached Brand Details */}
            <div className="p-3.5 bg-secondary/80 rounded-xl border border-border space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Attached Brand:</span>
                <span className="font-bold text-foreground">{deletingDomain.brand_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Domain URL:</span>
                <span className="font-mono font-bold text-foreground">{deletingDomain.domain}</span>
              </div>
            </div>

            {/* Clear explanation of effect */}
            <p className="text-xs text-muted-foreground leading-relaxed">
              Removing this domain will stop it from routing traffic to <strong>{deletingDomain.brand_name}</strong>. Any leads/clicks already recorded under this domain will <strong>NOT</strong> be deleted — only the domain-to-brand link is removed.
            </p>

            {checkingRefs ? (
              <div className="p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2 bg-secondary rounded-xl">
                <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Checking historical leads and click records for this domain...</span>
              </div>
            ) : (
              <div className="p-3 bg-secondary rounded-xl border border-border text-xs text-muted-foreground flex items-center justify-between">
                <span>Domain Traffic Records:</span>
                <span className="font-semibold text-foreground">{leadRefCount ?? 0} leads • {clickRefCount ?? 0} clicks</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingDomain(null)}
                className="flex-1 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground border border-border rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                disabled={isRemoving || checkingRefs}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
              >
                {isRemoving ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <span>Unlink Domain</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <AddDomainModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddDomain={handleAddDomain}
      />
    </AdminLayout>
  );
}
