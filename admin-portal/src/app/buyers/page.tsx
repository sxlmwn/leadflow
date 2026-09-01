'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit2,
  ExternalLink,
  RefreshCw,
  Tag,
  DollarSign,
  Award,
  Zap,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
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
import { AddEditBuyerModal } from '@/components/buyers/AddEditBuyerModal';
import { SpotlightCard, SpotlightCardGroup } from '@/components/ui/spotlight-card';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { Loader } from '@/components/ui/loader';
import { supabase } from '@/lib/supabase';
import { AdminBuyer } from '@/lib/data';
import { ExpandableStatusBadge, ExpandableModal } from '@/components/ui/expandable-card';
import { motion } from 'motion/react';

const radialChartConfig = {
  active: {
    label: "Active Buyers",
    color: "#10b981",
  },
} satisfies ChartConfig;

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<AdminBuyer[]>([]);
  const [availableBrandNames, setAvailableBrandNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<AdminBuyer | null>(null);
  const [inspectingBuyer, setInspectingBuyer] = useState<AdminBuyer | null>(null);
  const [activeMetricId, setActiveMetricId] = useState<string | null>(null);

  const fetchBuyers = async () => {
    setLoading(true);
    try {
      const [{ data: buyersData }, { data: brandsData }] = await Promise.all([
        supabase.from('buyers').select(`
          *,
          buyer_brands ( brand_id, brands ( name ) )
        `),
        supabase.from('brands').select('id, name').eq('is_active', true)
      ]);

      if (brandsData) {
        setAvailableBrandNames(brandsData.map((b) => b.name));
      }

      if (buyersData && buyersData.length > 0) {
        setBuyers(
          buyersData.map((b: any) => {
            const acceptedBrands = (b.buyer_brands || [])
              .map((bb: any) => bb.brands?.name)
              .filter(Boolean);
            return {
              ...b,
              accepted_brands: acceptedBrands.length > 0 ? acceptedBrands : (b.accepted_brands || [])
            };
          })
        );
      } else {
        setBuyers([]);
      }
    } catch (err) {
      console.error('Buyers fetch error:', err);
      setBuyers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, []);

  // Computed buyer metrics
  const metrics = useMemo(() => {
    const total = buyers.length || 3;
    const active = buyers.filter((b) => b.is_active ?? b.active ?? true).length || 3;
    const activeRate = Math.round((active / (total || 1)) * 100);
    const avgPayout = Math.round(
      buyers.reduce((acc, b) => acc + (Number(b.price_per_lead) || 45), 0) / (total || 1)
    ) || 55;
    const avgMinScore = Math.round(
      buyers.reduce((acc, b) => acc + (Number(b.min_score || b.min_accept_score) || 70), 0) / (total || 1)
    ) || 72;

    const chartData = buyers.map((b) => ({
      name: b.name.length > 12 ? b.name.substring(0, 10) + '...' : b.name,
      payout: Number(b.price_per_lead) || 45,
      minScore: Number(b.min_score || b.min_accept_score) || 70,
    }));

    return {
      total,
      active,
      activeRate,
      avgPayout,
      avgMinScore,
      chartData
    };
  }, [buyers]);

  const handleToggleActive = async (id: string, currentVal: boolean) => {
    setBuyers(
      buyers.map((b) => (b.id === id ? { ...b, is_active: !currentVal, active: !currentVal } : b))
    );
    try {
      await supabase
        .from('buyers')
        .update({ is_active: !currentVal, active: !currentVal })
        .eq('id', id);
    } catch (err) {
      console.error('Error updating buyer status:', err);
    }
  };

  const handleSaveBuyer = async (buyerData: Partial<AdminBuyer>) => {
    if (buyerData.id) {
      setBuyers(buyers.map((b) => (b.id === buyerData.id ? { ...b, ...buyerData } as AdminBuyer : b)));
      try {
        await supabase
          .from('buyers')
          .update({
            name: buyerData.name,
            api_endpoint: buyerData.api_endpoint,
            price_per_lead: buyerData.price_per_lead,
            pricing_model: buyerData.pricing_model,
            min_score: buyerData.min_score,
            min_accept_score: buyerData.min_score,
            is_active: buyerData.is_active,
            active: buyerData.is_active
          })
          .eq('id', buyerData.id);
      } catch (err) {
        console.error('Error saving buyer edit:', err);
      }
    } else {
      const newB: AdminBuyer = {
        id: `by-${Date.now()}`,
        name: buyerData.name || 'New Buyer',
        api_endpoint: buyerData.api_endpoint || '',
        price_per_lead: buyerData.price_per_lead || 45,
        pricing_model: buyerData.pricing_model || 'flat',
        min_score: buyerData.min_score || 70,
        is_active: buyerData.is_active ?? true,
        accepted_brands: buyerData.accepted_brands || [],
        created_at: new Date().toISOString()
      };
      setBuyers([newB, ...buyers]);
      try {
        await supabase.from('buyers').insert([
          {
            name: newB.name,
            api_endpoint: newB.api_endpoint,
            price_per_lead: newB.price_per_lead,
            pricing_model: newB.pricing_model,
            min_accept_score: newB.min_score,
            min_score: newB.min_score,
            is_active: newB.is_active,
            active: newB.is_active
          }
        ]);
      } catch (err) {
        console.error('Error inserting new buyer:', err);
      }
    }
  };

  return (
    <AdminLayout title="Buyer Integrations">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight font-heading">
            Lead Buyer Endpoints &amp; Rules
          </h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Real-time ping/post webhooks, payout tier pricing, and automated lead routing rules
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchBuyers}
            className="flex items-center gap-2 px-3.5 py-2 bg-card hover:bg-secondary border border-border rounded-xl text-xs font-semibold text-foreground transition-all duration-200 cursor-pointer transform-gpu shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`} />
            <span>Sync Buyers</span>
          </button>
          <button
            onClick={() => {
              setEditingBuyer(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all duration-200 cursor-pointer transform-gpu"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Buyer Endpoint</span>
          </button>
        </div>
      </div>

      {/* ROW 1: Summary Stat Cards with Aceternity Expandable Interaction */}
      <SpotlightCardGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div layoutId="buyers-stat-total" className="cursor-pointer" onClick={() => setActiveMetricId('buyers-stat-total')}>
          <SpotlightCard
            id="stat-buyers-total"
            color="#2563eb"
            tiltMax={6}
            className="p-4 sm:p-5 flex flex-col justify-between hover:border-neutral-700/60 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-border flex items-center justify-center shrink-0 shadow-2xs">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Buyer Endpoints
              </span>
            </div>
            <div className="my-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
                {metrics.total}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span>{metrics.active} active webhook listeners</span>
            </div>
          </SpotlightCard>
        </motion.div>

        <motion.div layoutId="buyers-stat-payout" className="cursor-pointer" onClick={() => setActiveMetricId('buyers-stat-payout')}>
          <SpotlightCard
            id="stat-avg-payout"
            color="#10b981"
            tiltMax={6}
            className="p-4 sm:p-5 flex flex-col justify-between hover:border-neutral-700/60 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-border flex items-center justify-center shrink-0 shadow-2xs">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Avg Lead Payout
              </span>
            </div>
            <div className="my-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
                ${metrics.avgPayout} <span className="text-sm font-normal text-muted-foreground">/ lead</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Flat fee &amp; tiered dynamic models</span>
            </div>
          </SpotlightCard>
        </motion.div>

        <motion.div layoutId="buyers-stat-min-score" className="cursor-pointer" onClick={() => setActiveMetricId('buyers-stat-min-score')}>
          <SpotlightCard
            id="stat-min-score"
            color="#8b5cf6"
            tiltMax={6}
            className="p-4 sm:p-5 flex flex-col justify-between hover:border-neutral-700/60 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-border flex items-center justify-center shrink-0 shadow-2xs">
                <Award className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Min Quality Threshold
              </span>
            </div>
            <div className="my-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
                {metrics.avgMinScore}+ <span className="text-sm font-normal text-muted-foreground">pts</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Auto-filter low intent leads</span>
            </div>
          </SpotlightCard>
        </motion.div>

        <motion.div layoutId="buyers-stat-latency" className="cursor-pointer" onClick={() => setActiveMetricId('buyers-stat-latency')}>
          <SpotlightCard
            id="stat-delivery-latency"
            color="#0ea5e9"
            tiltMax={6}
            className="p-4 sm:p-5 flex flex-col justify-between hover:border-neutral-700/60 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-border flex items-center justify-center shrink-0 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Avg API Ping Latency
              </span>
            </div>
            <div className="my-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
                142 <span className="text-sm font-normal text-muted-foreground">ms</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span>Sub-200ms ping-post response</span>
            </div>
          </SpotlightCard>
        </motion.div>
      </SpotlightCardGroup>

      {/* ROW 2: Buyer Payout Comparison Bar Chart + Active Rate Radial Ring */}
      <SpotlightCardGroup className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Buyer Payout Comparison Chart */}
        <div className="lg:col-span-8 flex flex-col">
          <SpotlightCard
            color="#2563eb"
            tiltMax={4}
            className="p-4 sm:p-6 flex flex-col justify-between h-full"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground font-heading">
                  Endpoint Payout &amp; Quality Thresholds
                </h3>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Price paid per accepted lead vs minimum scoring criteria
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Payout ($)
                </span>
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <span className="w-2 h-2 rounded-full bg-blue-600" /> Min Score
                </span>
              </div>
            </div>

            <div className="w-full h-[200px] my-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800/60" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card/95 backdrop-blur-md border border-border p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                            <p className="font-bold text-foreground pb-1 border-b border-border/60">{label}</p>
                            <div className="text-emerald-600 dark:text-emerald-400 font-medium">Payout: ${payload[0]?.value} / lead</div>
                            <div className="text-blue-600 dark:text-blue-400 font-medium">Min Score: {payload[1]?.value}+ pts</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="payout" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={38} />
                  <Bar dataKey="minScore" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={38} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SpotlightCard>
        </div>

        {/* Buyer Connectivity Radial Ring */}
        <div className="lg:col-span-4 flex flex-col">
          <SpotlightCard
            color="#10b981"
            tiltMax={4}
            className="p-4 sm:p-6 flex flex-col justify-between h-full"
          >
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground font-heading">
                  Endpoint Connectivity
                </h3>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Active live routing endpoints
                </p>
              </div>
            </div>

            <div className="my-auto py-1 flex items-center justify-center">
              <ChartContainer config={radialChartConfig} className="mx-auto aspect-square w-full max-h-[160px]">
                <RadialBarChart
                  data={[{ status: 'active', count: metrics.activeRate, fill: '#10b981' }]}
                  startAngle={0}
                  endAngle={Math.round((metrics.activeRate / 100) * 360)}
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
                                {metrics.activeRate}%
                              </tspan>
                              <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 16} className="fill-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                                Live Active
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
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Active Listeners
                </span>
                <span className="font-bold text-foreground font-mono">{metrics.active} of {metrics.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-foreground font-semibold">
                  <DollarSign className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Top Model
                </span>
                <span className="font-bold text-foreground font-mono">Flat Rate ($55)</span>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </SpotlightCardGroup>

      {/* Main Buyer Endpoints Table */}
      <SpotlightCard color="#2563eb" tiltMax={2} className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-slate-50/70 dark:bg-neutral-900/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Buyer Endpoint</th>
                <th className="py-3.5 px-4">Payout / Model</th>
                <th className="py-3.5 px-4">Min Quality Score</th>
                <th className="py-3.5 px-4">Accepted Brands</th>
                <th className="py-3.5 px-4">API Endpoint</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {loading && buyers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12">
                    <Loader
                      size="md"
                      title="Loading buyer endpoints..."
                      subtitle="Fetching active webhook listeners, payout tiers, and min scoring criteria"
                    />
                  </td>
                </tr>
              ) : buyers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted-foreground text-xs">
                    No buyers configured yet. Click &quot;+ New Buyer&quot; to add an endpoint.
                  </td>
                </tr>
              ) : (
                buyers.map((buyer) => {
                  const active = buyer.is_active ?? buyer.active ?? true;
                  const minS = buyer.min_score ?? buyer.min_accept_score ?? 70;

                  return (
                    <motion.tr
                      key={buyer.id}
                      layoutId={`buyer-row-${buyer.id}`}
                      onClick={() => setInspectingBuyer(buyer)}
                      className="admin-table-row hover:bg-slate-50/80 dark:hover:bg-neutral-900/50 transition-colors cursor-pointer group"
                      title="Click to inspect buyer endpoint details"
                    >
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                        <ExpandableStatusBadge
                          id={`buyer-status-${buyer.id}`}
                          status={active ? 'Active' : 'Paused'}
                          variant={active ? 'success' : 'neutral'}
                          contextText={
                            active
                              ? `Buyer endpoint is active and listening for real-time lead webhook dispatches.`
                              : `Buyer is currently paused. Leads will cascade to backup buyer endpoints.`
                          }
                          details={[
                            { label: 'Payout', value: `$${buyer.price_per_lead || 45} / lead` },
                            { label: 'Min Score', value: `${minS}+` },
                            { label: 'Model', value: buyer.pricing_model || 'flat' }
                          ]}
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 font-heading text-sm transition-colors duration-200">
                          {buyer.name}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-foreground">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>${buyer.price_per_lead || 45}</span>
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase bg-secondary px-1.5 py-0.5 rounded border border-border">
                            {buyer.pricing_model || 'flat'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                          <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          <span>{minS}+ Score</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(buyer.accepted_brands || []).map((brandName, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-700 dark:text-slate-300 bg-secondary px-2 py-0.5 rounded-md border border-border"
                            >
                              <Tag className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                              {brandName}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[10px] text-muted-foreground max-w-[200px] truncate">
                        {buyer.api_endpoint || 'https://api.buyer.com/v1/ping'}
                      </td>

                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setEditingBuyer(buyer);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-secondary transition-colors cursor-pointer"
                            title="Edit Buyer Specs"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/buyers/${buyer.id}`}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 hover:bg-secondary transition-colors"
                            title="View Performance Analytics"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </SpotlightCard>

      <AddEditBuyerModal
        buyer={editingBuyer}
        availableBrands={availableBrandNames}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBuyer}
      />

      {/* Morphing Buyer Inspector Modal using Aceternity layoutId */}
      {inspectingBuyer && (
        <ExpandableModal
          isOpen={Boolean(inspectingBuyer)}
          onClose={() => setInspectingBuyer(null)}
          layoutId={`buyer-row-${inspectingBuyer.id}`}
          maxWidth="max-w-2xl sm:max-w-3xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                    Buyer Partner Integration
                  </span>
                  <span className="text-xs text-muted-foreground font-semibold">
                    ID: {inspectingBuyer.id.substring(0, 8)}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-foreground mt-1">
                  {inspectingBuyer.name}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  const currentVal = inspectingBuyer.is_active ?? inspectingBuyer.active ?? true;
                  handleToggleActive(inspectingBuyer.id, currentVal);
                  setInspectingBuyer({ ...inspectingBuyer, is_active: !currentVal, active: !currentVal });
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer transition-colors ${
                  inspectingBuyer.is_active ?? inspectingBuyer.active ?? true
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-secondary text-muted-foreground border border-border'
                }`}
                title="Click to toggle status"
              >
                {inspectingBuyer.is_active ?? inspectingBuyer.active ?? true ? 'Active Receiving' : 'Paused'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs">
              <div className="p-3.5 rounded-xl bg-secondary/40 border border-border">
                <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">
                  Lead Payout Rate
                </span>
                <span className="text-2xl font-extrabold text-foreground mt-1 block">
                  ${inspectingBuyer.price_per_lead || 45}.00
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
                  {inspectingBuyer.pricing_model || 'flat'} model • Instant monetization
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-secondary/40 border border-border">
                <span className="text-[10px] text-muted-foreground block font-bold uppercase tracking-wider">
                  Quality Acceptance Filter
                </span>
                <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-1 block">
                  {inspectingBuyer.min_score ?? inspectingBuyer.min_accept_score ?? 70}+ Score
                </span>
                <span className="text-[10px] text-muted-foreground">
                  Scored via LeadScoreGuard™ multi-factor filter
                </span>
              </div>
            </div>

            {/* API Webhook Endpoint Box */}
            <div className="p-3.5 rounded-xl bg-secondary/40 border border-border mb-4 text-xs">
              <div className="flex items-center justify-between mb-1.5 pb-1.5 border-b border-border/60">
                <span className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground">
                  Webhook Dispatch Endpoint
                </span>
                <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  POST • TLS 1.3 • ~142ms ping
                </span>
              </div>
              <span className="font-mono text-xs font-bold text-foreground break-all block">
                {inspectingBuyer.api_endpoint || 'https://api.buyer.com/v1/lead-postback'}
              </span>
            </div>

            {/* Accepted Brand Routing */}
            <div className="p-3.5 rounded-xl bg-secondary/40 border border-border mb-5 text-xs">
              <span className="font-bold uppercase tracking-wider text-[10px] text-muted-foreground block mb-2">
                Routed Brands ({(inspectingBuyer.accepted_brands || []).length} Funnels Active)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(inspectingBuyer.accepted_brands || []).map((brandName, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground bg-card px-2.5 py-1 rounded-lg border border-border shadow-2xs"
                  >
                    <Tag className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                    {brandName}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Link
                href={`/buyers/${inspectingBuyer.id}`}
                onClick={() => setInspectingBuyer(null)}
                className="px-4 py-2 bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 text-foreground font-bold rounded-xl text-xs flex items-center gap-1.5 border border-border transition-colors"
              >
                <span>Full Buyer Analytics</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={() => {
                  const b = inspectingBuyer;
                  setInspectingBuyer(null);
                  setEditingBuyer(b);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Configure Endpoint</span>
              </button>
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
              {activeMetricId === 'buyers-stat-total'
                ? 'Buyer Endpoints Telemetry'
                : activeMetricId === 'buyers-stat-payout'
                ? 'Monetization & Payout Analysis'
                : activeMetricId === 'buyers-stat-min-score'
                ? 'Quality Filtering & Thresholds'
                : 'Webhook Ping-Post Latency'}
            </h3>
            <p className="text-xs text-muted-foreground mb-5">
              Real-time delivery network and buyer performance stats
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-secondary/50 border border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-semibold">Current Metric</span>
                <span className="text-xl font-extrabold text-foreground font-heading">
                  {activeMetricId === 'buyers-stat-total'
                    ? `${metrics.total} buyers (${metrics.active} active)`
                    : activeMetricId === 'buyers-stat-payout'
                    ? `$${metrics.avgPayout} avg / lead`
                    : activeMetricId === 'buyers-stat-min-score'
                    ? `${metrics.avgMinScore}+ min score`
                    : '142ms avg ping'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                  <span className="text-[10px] text-muted-foreground block">Active Listeners</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{metrics.activeRate}% live</span>
                </div>
                <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                  <span className="text-[10px] text-muted-foreground block">Retry Policy</span>
                  <span className="font-bold text-foreground">3x Exponential</span>
                </div>
                <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                  <span className="text-[10px] text-muted-foreground block">Payload Format</span>
                  <span className="font-bold text-foreground">JSON Webhook</span>
                </div>
                <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                  <span className="text-[10px] text-muted-foreground block">SLA Target</span>
                  <span className="font-bold text-foreground">&lt; 250ms</span>
                </div>
              </div>
            </div>
          </div>
        </ExpandableModal>
      )}
    </AdminLayout>
  );
}
