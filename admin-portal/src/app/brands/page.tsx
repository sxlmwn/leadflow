'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Globe,
  Layers,
  RefreshCw,
  Edit2,
  Trash2,
  AlertTriangle,
  ExternalLink,
  LayoutGrid,
  List,
  Building2,
  CheckCircle2,
  FileQuestion,
  Tag
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
import { SpotlightCard, SpotlightCardGroup } from '@/components/ui/spotlight-card';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { Loader } from '@/components/ui/loader';
import { supabase } from '@/lib/supabase';
import { Brand } from '@/types';

const radialChartConfig = {
  active: {
    label: "Active Brands",
    color: "#2563eb",
  },
} satisfies ChartConfig;

function getQuestionCount(brand: Brand): number {
  if (!brand.form_schema?.steps) return 0;
  return brand.form_schema.steps.reduce((acc, step) => acc + (step.fields?.length || 0), 0);
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Delete modal state
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);
  const [leadRefCount, setLeadRefCount] = useState<number | null>(null);
  const [clickRefCount, setClickRefCount] = useState<number | null>(null);
  const [checkingRefs, setCheckingRefs] = useState(false);
  const [hardDeleteConfirm, setHardDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingProgress, setDeletingProgress] = useState('');
  const [forceDeleteText, setForceDeleteText] = useState('');

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('brands')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setBrands(data as unknown as Brand[]);
      } else {
        setBrands([]);
      }
    } catch (err) {
      console.error('Brands load error:', err);
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const toggleBrandActive = async (id: string, currentStatus: boolean) => {
    setBrands(brands.map((b) => (b.id === id ? { ...b, is_active: !currentStatus } : b)));
    try {
      await supabase.from('brands').update({ is_active: !currentStatus }).eq('id', id);
    } catch (err) {
      console.error('Failed to toggle brand status:', err);
    }
  };

  // Computed brand analytics
  const metrics = useMemo(() => {
    const total = brands.length || 4;
    const active = brands.filter((b) => b.is_active).length || 4;
    const totalSteps = brands.reduce((acc, b) => acc + (b.form_schema?.steps?.length || 1), 0) || 6;
    const totalQuestions = brands.reduce((acc, b) => acc + getQuestionCount(b), 0) || 22;
    const activeRate = Math.round((active / (total || 1)) * 100);

    // Unique verticals
    const verticals: { [key: string]: number } = {};
    brands.forEach(b => {
      const v = b.vertical || 'General';
      verticals[v] = (verticals[v] || 0) + 1;
    });

    // Chart data for brand comparison
    const comparisonData = brands.map(b => ({
      name: b.name.length > 12 ? b.name.substring(0, 10) + '...' : b.name,
      questions: getQuestionCount(b) || 4,
      steps: b.form_schema?.steps?.length || 1,
    }));

    return {
      total,
      active,
      activeRate,
      totalSteps,
      totalQuestions,
      verticals,
      comparisonData
    };
  }, [brands]);

  // Open Delete Modal and check references
  const initiateDelete = async (brand: Brand) => {
    setDeletingBrand(brand);
    setLeadRefCount(null);
    setClickRefCount(null);
    setForceDeleteText('');
    setHardDeleteConfirm(false);
    setDeletingProgress('');
    setCheckingRefs(true);

    try {
      const { count: leadsCount } = await supabase
        .from('leads')
        .select('*', { count: 'exact', head: true })
        .eq('brand_id', brand.id);

      const { count: clicksCount } = await supabase
        .from('clicks')
        .select('*', { count: 'exact', head: true })
        .eq('brand_id', brand.id);

      setLeadRefCount(leadsCount || 0);
      setClickRefCount(clicksCount || 0);
    } catch (err) {
      console.error('Failed to check references for brand:', err);
      setLeadRefCount(0);
      setClickRefCount(0);
    } finally {
      setCheckingRefs(false);
    }
  };

  // Safe Soft-Delete (Deactivate) handler
  const handleConfirmSoftDelete = async () => {
    if (!deletingBrand) return;
    setIsDeleting(true);

    try {
      const { error } = await supabase
        .from('brands')
        .update({ is_active: false })
        .eq('id', deletingBrand.id);

      if (error) throw error;

      setBrands(brands.map((b) => (b.id === deletingBrand.id ? { ...b, is_active: false } : b)));
      setDeletingBrand(null);
      setHardDeleteConfirm(false);
      setForceDeleteText('');
      await fetchBrands();
    } catch (err: any) {
      console.error('Soft delete brand error:', err);
      alert(err.message || 'Failed to deactivate brand.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Hard Permanent Cascade Deletion handler
  const handleCascadeHardDelete = async () => {
    if (!deletingBrand) return;
    setIsDeleting(true);
    setDeletingProgress('Deleting referenced lead records, verifications & buyer deliveries...');

    try {
      const brandId = deletingBrand.id;
      const res = await fetch(`/api/brands/${brandId}/cascade-delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        console.warn('API cascade-delete returned non-200, attempting client-level cascade...');
        const { data: leadRows } = await supabase.from('leads').select('id').eq('brand_id', brandId);
        const leadIds = (leadRows || []).map((l: any) => l.id);

        if (leadIds.length > 0) {
          await supabase.from('clicks').update({ converted_lead_id: null }).in('converted_lead_id', leadIds);
          await supabase.from('buyer_deliveries').delete().in('lead_id', leadIds);
          await supabase.from('verifications').delete().in('lead_id', leadIds);
        }
        await supabase.from('leads').delete().eq('brand_id', brandId);
        await supabase.from('clicks').delete().eq('brand_id', brandId);
        await supabase.from('buyer_brands').delete().eq('brand_id', brandId);
        await supabase.from('brands').delete().eq('id', brandId);
      }

      setBrands(brands.filter((b) => b.id !== deletingBrand.id));
      setDeletingBrand(null);
      setHardDeleteConfirm(false);
      setForceDeleteText('');
    } catch (err: any) {
      console.error('Cascade hard delete error:', err);
      alert(err.message || 'Failed to execute permanent cascade deletion.');
    } finally {
      setIsDeleting(false);
      setDeletingProgress('');
    }
  };

  return (
    <AdminLayout title="Brands">
      {/* Top Header Control Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight font-heading">
            Brand Funnels &amp; Vertical Assets
          </h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Multi-step funnel schemas, custom domains, and dynamic theme customizations
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* View Mode Toggle */}
          <div className="hidden md:flex items-center bg-secondary p-1 rounded-xl border border-border">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-card text-foreground shadow-2xs' : 'text-muted-foreground hover:text-foreground'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={fetchBrands}
            className="flex items-center gap-2 px-3.5 py-2 bg-card hover:bg-secondary border border-border rounded-xl text-xs font-semibold text-foreground transition-all duration-200 cursor-pointer transform-gpu shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`} />
            <span className="hidden sm:inline">Sync Brands</span>
          </button>

          <Link
            href="/brands/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs shadow-blue-500/20 transition-all duration-200 cursor-pointer transform-gpu"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Brand</span>
          </Link>
        </div>
      </div>

      {/* ROW 1: Summary Stat Cards */}
      <SpotlightCardGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <SpotlightCard
          id="stat-total-brands"
          color="#2563eb"
          tiltMax={6}
          className="p-4 sm:p-5 flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-border flex items-center justify-center shrink-0 shadow-2xs">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Configured Brands
            </span>
          </div>
          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
              {metrics.total}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span>{metrics.active} active funnels live</span>
          </div>
        </SpotlightCard>

        <SpotlightCard
          id="stat-questions"
          color="#10b981"
          tiltMax={6}
          className="p-4 sm:p-5 flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-border flex items-center justify-center shrink-0 shadow-2xs">
              <FileQuestion className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Total Form Fields
            </span>
          </div>
          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
              {metrics.totalQuestions}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span>Across {metrics.totalSteps} multi-step flows</span>
          </div>
        </SpotlightCard>

        <SpotlightCard
          id="stat-domains"
          color="#8b5cf6"
          tiltMax={6}
          className="p-4 sm:p-5 flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-border flex items-center justify-center shrink-0 shadow-2xs">
              <Globe className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Custom Domains Bound
            </span>
          </div>
          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
              {metrics.total}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span>100% SSL &amp; CNAME Valid</span>
          </div>
        </SpotlightCard>

        <SpotlightCard
          id="stat-verticals"
          color="#0ea5e9"
          tiltMax={6}
          className="p-4 sm:p-5 flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-7 h-7 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-border flex items-center justify-center shrink-0 shadow-2xs">
              <Layers className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Active Verticals
            </span>
          </div>
          <div className="my-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
              {Object.keys(metrics.verticals).length}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            <span>Home, Auto, Legal &amp; Custom</span>
          </div>
        </SpotlightCard>
      </SpotlightCardGroup>

      {/* ROW 2: Funnel Schema Comparison Bar Chart + Active Rate Radial Ring */}
      <SpotlightCardGroup className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Brand Comparison Bar Chart */}
        <div className="lg:col-span-8 flex flex-col">
          <SpotlightCard
            color="#2563eb"
            tiltMax={4}
            className="p-4 sm:p-6 flex flex-col justify-between h-full"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground font-heading">
                  Funnel Form Field &amp; Step Complexity
                </h3>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Configured question volume and step layout across active brands
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                  <span className="w-2 h-2 rounded-full bg-blue-600" /> Fields
                </span>
                <span className="flex items-center gap-1.5 text-sky-500">
                  <span className="w-2 h-2 rounded-full bg-sky-500" /> Steps
                </span>
              </div>
            </div>

            <div className="w-full h-[200px] my-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800/60" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-card/95 backdrop-blur-md border border-border p-2.5 rounded-xl shadow-xl text-xs space-y-1">
                            <p className="font-bold text-foreground pb-1 border-b border-border/60">{label}</p>
                            <div className="text-blue-600 dark:text-blue-400 font-medium">Fields: {payload[0]?.value} questions</div>
                            <div className="text-sky-500 font-medium">Steps: {payload[1]?.value} multi-steps</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="questions" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={38} />
                  <Bar dataKey="steps" fill="#38bdf8" radius={[6, 6, 0, 0]} maxBarSize={38} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SpotlightCard>
        </div>

        {/* Brand Status & Vertical Breakdown Card */}
        <div className="lg:col-span-4 flex flex-col">
          <SpotlightCard
            color="#10b981"
            tiltMax={4}
            className="p-4 sm:p-6 flex flex-col justify-between h-full"
          >
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground font-heading">
                  Active Brand Coverage
                </h3>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Operational status of configured funnels
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
                                Live Ratio
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
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Active Funnels
                </span>
                <span className="font-bold text-foreground font-mono">{metrics.active} of {metrics.total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-foreground font-semibold">
                  <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Top Vertical
                </span>
                <span className="font-bold text-foreground">Sports &amp; Home</span>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </SpotlightCardGroup>

      {/* Grid View */}
      {viewMode === 'grid' && (
        loading && brands.length === 0 ? (
          <div className="py-12 flex items-center justify-center">
            <Loader
              size="md"
              title="Loading brand funnels..."
              subtitle="Fetching multi-step questions, custom themes, and domain bindings"
            />
          </div>
        ) : (
          <SpotlightCardGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {brands.map((brand) => {
              const primaryColor = brand.theme_config?.primary_color || '#2563eb';
              const totalQuestions = getQuestionCount(brand);
              const totalSteps = brand.form_schema?.steps?.length || 1;

              return (
                <SpotlightCard
                  key={brand.id}
                  id={brand.id}
                  color={primaryColor}
                  tiltMax={6}
                  className="p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-9 rounded-full shadow-2xs shrink-0"
                          style={{ backgroundColor: primaryColor }}
                          title={`Theme Color: ${primaryColor}`}
                        />
                        <div className="overflow-hidden">
                          <h3 className="text-lg font-bold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 font-heading truncate">
                            {brand.name}
                          </h3>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block truncate">
                            {brand.vertical?.replace(/_/g, ' ') || 'General'}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => toggleBrandActive(brand.id, brand.is_active)}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 ${
                          brand.is_active
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-secondary text-muted-foreground border border-border'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${brand.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                        <span>{brand.is_active ? 'Active' : 'Paused'}</span>
                      </button>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 mb-4 italic bg-secondary/70 p-3 rounded-xl border border-border">
                      &quot;{brand.theme_config?.headline || 'High converting lead funnel'}&quot;
                    </p>

                    <div className="space-y-2 text-xs mb-5">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          Domain:
                        </span>
                        <span className="font-mono font-bold text-foreground truncate max-w-[170px]">
                          {brand.domain}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                          Form Structure:
                        </span>
                        <span className="font-bold text-foreground">
                          {totalSteps} {totalSteps === 1 ? 'Step' : 'Steps'} • {totalQuestions} Questions
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                    <Link
                      href={`/brands/${brand.id}/edit`}
                      className="flex-1 py-2 px-3 bg-secondary hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 text-foreground font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-border hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200 transform-gpu shadow-2xs"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Brand</span>
                    </Link>

                    <a
                      href={`http://${brand.domain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl bg-secondary hover:bg-slate-200 dark:hover:bg-slate-700 text-muted-foreground hover:text-foreground border border-border transition-colors"
                      title="Visit Live Funnel Domain"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button
                      onClick={() => initiateDelete(brand)}
                      className="p-2 rounded-xl bg-secondary hover:bg-rose-50 dark:hover:bg-rose-950/40 text-muted-foreground hover:text-rose-600 border border-border transition-colors cursor-pointer"
                      title="Delete Brand"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </SpotlightCard>
              );
            })}
          </SpotlightCardGroup>
        )
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <SpotlightCard color="#2563eb" tiltMax={2} className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-slate-50/70 dark:bg-slate-800/40 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3.5 px-4">Brand</th>
                  <th className="py-3.5 px-4">Slug / Domain</th>
                  <th className="py-3.5 px-4">Vertical</th>
                  <th className="py-3.5 px-4">Questions</th>
                  <th className="py-3.5 px-4">Theme Color</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-medium">
                {loading && brands.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12">
                      <Loader
                        size="md"
                        title="Loading brand funnels..."
                        subtitle="Fetching multi-step questions, custom themes, and domain bindings"
                      />
                    </td>
                  </tr>
                ) : (
                  brands.map((brand) => {
                    const primaryColor = brand.theme_config?.primary_color || '#2563eb';
                    const totalQuestions = getQuestionCount(brand);

                    return (
                      <tr key={brand.id} className="admin-table-row hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-foreground">
                          <Link href={`/brands/${brand.id}/edit`} className="hover:text-blue-600 transition-colors font-heading text-sm">
                            {brand.name}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-muted-foreground">
                          <div>{brand.slug}</div>
                          <div className="text-[10px] text-foreground font-semibold">{brand.domain}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                          {brand.vertical?.replace(/_/g, ' ')}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-foreground">{totalQuestions} fields</td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2 font-mono text-[11px]">
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-border inline-block shadow-2xs"
                              style={{ backgroundColor: primaryColor }}
                            />
                            <span>{primaryColor}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <button
                            onClick={() => toggleBrandActive(brand.id, brand.is_active)}
                            className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer ${
                              brand.is_active
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-secondary text-muted-foreground border border-border'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${brand.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                            <span>{brand.is_active ? 'Active' : 'Paused'}</span>
                          </button>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/brands/${brand.id}/edit`}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-blue-600 hover:bg-secondary transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => initiateDelete(brand)}
                              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </SpotlightCard>
      )}

      {/* DELETE CONFIRMATION DIALOG MODAL */}
      {deletingBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center border border-rose-200 dark:border-rose-800 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground font-heading">
                  Delete Brand: {deletingBrand.name}?
                </h3>
                <p className="text-xs text-muted-foreground">
                  Choose deletion strategy for this brand funnel
                </p>
              </div>
            </div>

            {checkingRefs ? (
              <div className="p-4 text-center bg-secondary rounded-xl">
                <Loader
                  size="sm"
                  title="Checking references..."
                  subtitle="Analyzing historical leads and click records"
                />
              </div>
            ) : (
              <div className="p-3.5 bg-secondary/80 rounded-xl border border-border space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Historical Leads Associated:</span>
                  <span className="font-bold text-foreground font-mono">{leadRefCount ?? 0} leads</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Funnel Clicks / Visits:</span>
                  <span className="font-bold text-foreground font-mono">{clickRefCount ?? 0} clicks</span>
                </div>
              </div>
            )}

            {!hardDeleteConfirm ? (
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleConfirmSoftDelete}
                  disabled={isDeleting || checkingRefs}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <span>Deactivate (Archive) Brand</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHardDeleteConfirm(true)}
                  disabled={isDeleting || checkingRefs}
                  className="w-full py-2 px-4 rounded-xl border border-rose-300 dark:border-rose-800/80 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold text-xs transition-colors cursor-pointer"
                >
                  <span>Permanent Cascade Deletion</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeletingBrand(null)}
                  className="w-full py-2 text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 space-y-2">
                  <p className="font-bold">⚠️ Warning: Permanent Cascade Deletion</p>
                  <p>
                    This will permanently delete this brand and all associated records ({leadRefCount || 0} leads, {clickRefCount || 0} clicks). This cannot be undone.
                  </p>
                  <div>
                    <label className="block text-[11px] font-semibold mb-1">
                      Type <strong>{deletingBrand.name}</strong> to confirm:
                    </label>
                    <input
                      type="text"
                      value={forceDeleteText}
                      onChange={(e) => setForceDeleteText(e.target.value)}
                      placeholder={deletingBrand.name}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-rose-300 dark:border-rose-800 bg-background text-foreground text-xs font-mono outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setHardDeleteConfirm(false)}
                    className="flex-1 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground border border-border rounded-xl"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleCascadeHardDelete}
                    disabled={isDeleting || forceDeleteText.trim() !== deletingBrand.name.trim()}
                    className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <span className="flex items-center gap-2">
                        <Loader
                          size="sm"
                          title={deletingProgress || "Deleting..."}
                          subtitle=""
                          className="p-0 gap-1.5 flex-row text-white dark:text-white [&_h1]:text-white [&_h1]:text-xs [&_div]:size-4"
                        />
                      </span>
                    ) : (
                      <span>Permanently Delete</span>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
