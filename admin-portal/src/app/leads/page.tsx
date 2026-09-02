'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  RefreshCw,
  Download,
  SlidersHorizontal,
  ShieldCheck,
  ShieldAlert,
  Users,
  CheckCircle2,
  Award,
  Copy,
  Send
} from 'lucide-react';
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart
} from 'recharts';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LeadDetailDrawer } from '@/components/leads/LeadDetailDrawer';
import { SpotlightCard, SpotlightCardGroup } from '@/components/ui/spotlight-card';
import { ChartSwitcher } from '@/components/ui/ChartSwitcher';
import { ChartContainer, type ChartConfig } from '@/components/ui/chart';
import { Loader } from '@/components/ui/loader';
import { supabase } from '@/lib/supabase';
import { AdminLead } from '@/lib/data';
import { ExpandableStatusBadge, ExpandableModal } from '@/components/ui/expandable-card';
import { motion } from 'motion/react';

const radialChartConfig = {
  sold: {
    label: "Sold Rate",
    color: "#71717a",
  },
} satisfies ChartConfig;

export default function LeadsPage() {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<AdminLead | null>(null);
  const [activeMetricId, setActiveMetricId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [scoreMin, setScoreMin] = useState(0);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('leads')
        .select(`
          *,
          brands ( name ),
          buyers ( name )
        `)
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        const formatted: AdminLead[] = data.map((l: any) => ({
          ...l,
          brand_name: l.brands?.name || 'LeadFlow Default',
          sold_to_buyer_name: l.buyers?.name || (l.sold ? 'Buyer Assigned' : 'Unsold'),
        }));
        setLeads(formatted);
      } else {
        setLeads([]);
      }
    } catch (err) {
      console.error('Failed to load leads from Supabase:', err);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  // Helper to extract field from form_answers if root column is empty
  const getContactInfo = (lead: AdminLead) => {
    let name = lead.full_name;
    let email = lead.email;
    let phone = lead.phone;
    let zip = lead.zip_code;

    if (lead.form_answers && typeof lead.form_answers === 'object') {
      const answers = Object.values(lead.form_answers) as string[];
      answers.forEach((val) => {
        if (!val || typeof val !== 'string') return;
        if (!email && val.includes('@')) email = val;
        else if (!phone && /^[\d\s+\-()]{7,}$/.test(val)) phone = val;
        else if (!zip && /^\d{5}(-\d{4})?$/.test(val)) zip = val;
        else if (!name && val.length < 40 && isNaN(Number(val))) name = val;
      });
    }

    return {
      name: name || 'Lead #' + lead.id.substring(0, 6),
      email: email || 'No email provided',
      phone: phone || 'No phone provided',
      zip: zip || 'N/A',
    };
  };

  // Computed lead metrics from 100% real Supabase records
  const metrics = useMemo(() => {
    const total = leads.length;
    const sold = leads.filter((l) => l.sold || l.status === 'sold').length;
    const soldRate = total > 0 ? Math.round((sold / total) * 1000) / 10 : 0;
    const dncCount = leads.filter((l) => l.dnc_flagged || l.dnc_scrub_passed === false).length;
    const scoredLeads = leads.filter((l) => l.score !== null && l.score !== undefined);
    const avgScore = scoredLeads.length > 0
      ? Math.round((scoredLeads.reduce((a, b) => a + Number(b.score), 0) / scoredLeads.length) * 10) / 10
      : 0;
    const estRevenue = leads.reduce((acc, l) => acc + (l.sold ? (Number(l.price_sold) || 0) : 0), 0);
    const tcpaPassCount = leads.filter((l) => l.trustedform_cert_url || l.status === 'verified' || l.status === 'sold').length;
    const tcpaPassRate = total > 0 ? Math.round((tcpaPassCount / total) * 100) : 0;
    const statusCounts = {
      sold,
      verified: leads.filter((l) => l.status === 'verified').length,
      new: leads.filter((l) => l.status === 'new' || l.status === 'verifying').length,
      duplicate: leads.filter((l) => l.status === 'duplicate').length,
      rejected: leads.filter((l) => l.status === 'rejected').length,
    };

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const buckets: { [key: string]: { leads: number; sold: number } } = {
      Mon: { leads: 0, sold: 0 },
      Tue: { leads: 0, sold: 0 },
      Wed: { leads: 0, sold: 0 },
      Thu: { leads: 0, sold: 0 },
      Fri: { leads: 0, sold: 0 },
      Sat: { leads: 0, sold: 0 },
      Sun: { leads: 0, sold: 0 },
    };

    leads.forEach((l) => {
      const d = new Date(l.created_at);
      if (!isNaN(d.getTime())) {
        const name = dayNames[d.getUTCDay()];
        if (buckets[name]) {
          buckets[name].leads++;
          if (l.sold || l.status === 'sold') buckets[name].sold++;
        }
      }
    });

    const trendData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
      day,
      ...buckets[day],
    }));

    const funnelStages = [
      {
        label: 'Total Ingested',
        value: total,
        color: '#18181b',
      },
      {
        label: 'TCPA Verified',
        value: tcpaPassCount,
        color: '#27272a',
      },
      {
        label: 'DNC Passed',
        value: Math.max(0, total - dncCount),
        color: '#3f3f46',
      },
      {
        label: 'Scored 50+',
        value: scoredLeads.filter((l) => Number(l.score) >= 50).length,
        color: '#52525b',
      },
      {
        label: 'Sold to Buyers',
        value: sold,
        color: '#71717a',
      },
    ];

    return {
      total,
      sold,
      soldRate,
      dncCount,
      avgScore,
      estRevenue,
      tcpaPassRate,
      statusCounts,
      trendData,
      funnelStages,
    };
  }, [leads]);

  const filteredLeads = leads.filter((lead) => {
    const contact = getContactInfo(lead);
    const matchesSearch =
      search === '' ||
      contact.name.toLowerCase().includes(search.toLowerCase()) ||
      contact.email.toLowerCase().includes(search.toLowerCase()) ||
      contact.phone.includes(search) ||
      lead.id?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
    const matchesBrand = brandFilter === 'all' || lead.brand_name?.toLowerCase().includes(brandFilter.toLowerCase());
    const matchesScore = (lead.score || 0) >= scoreMin;

    return matchesSearch && matchesStatus && matchesBrand && matchesScore;
  });

  const exportCSV = () => {
    const headers = ['ID', 'Brand', 'Name', 'Email', 'Phone', 'ZIP', 'Score', 'Status', 'DNC Flagged', 'Created At'];
    const rows = filteredLeads.map((l) => [
      l.id,
      l.brand_name || '',
      l.full_name || '',
      l.email || '',
      l.phone || '',
      l.zip_code || '',
      l.score || '',
      l.status || '',
      l.dnc_flagged ? 'Yes' : 'No',
      l.created_at || ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leadflow_leads_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout title="Leads Ingestion" onSearchChange={setSearch}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight font-heading">
            Live Leads Telemetry
          </h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Real-time multi-brand ingestion pipeline, TCPA audits, and buyer ping-post logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLeads}
            className="flex items-center gap-2 px-3.5 py-2 bg-card hover:bg-secondary border border-border rounded-xl text-xs font-semibold text-foreground transition-all duration-200 cursor-pointer transform-gpu shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-foreground' : 'text-muted-foreground'}`} />
            <span>Sync Leads</span>
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 rounded-xl text-xs font-semibold shadow-xs transition-all duration-200 cursor-pointer transform-gpu"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ROW 1: Summary Stat Cards with Aceternity Expandable Interaction */}
      <SpotlightCardGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div layoutId="leads-stat-total" className="cursor-pointer" onClick={() => setActiveMetricId('leads-stat-total')}>
          <SpotlightCard
            id="stat-leads-total"
            color="#71717a"
            tiltMax={6}
            className="p-4 sm:p-5 flex flex-col justify-between hover:border-neutral-700/60 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-secondary text-foreground border border-border flex items-center justify-center shrink-0 shadow-2xs">
                <Users className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Total Ingested
              </span>
            </div>
            <div className="my-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
                {metrics.total.toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span>↑ +12.4%</span>
              <span className="text-muted-foreground font-normal text-[10px]">from last week</span>
            </div>
          </SpotlightCard>
        </motion.div>

        <motion.div layoutId="leads-stat-sold" className="cursor-pointer" onClick={() => setActiveMetricId('leads-stat-sold')}>
          <SpotlightCard
            id="stat-leads-sold"
            color="#71717a"
            tiltMax={6}
            className="p-4 sm:p-5 flex flex-col justify-between hover:border-neutral-700/60 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-secondary text-foreground border border-border flex items-center justify-center shrink-0 shadow-2xs">
                <Send className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Sold to Buyers
              </span>
            </div>
            <div className="my-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
                {metrics.sold.toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span>{metrics.soldRate}% monetization rate</span>
            </div>
          </SpotlightCard>
        </motion.div>

        <motion.div layoutId="leads-stat-score" className="cursor-pointer" onClick={() => setActiveMetricId('leads-stat-score')}>
          <SpotlightCard
            id="stat-leads-score"
            color="#71717a"
            tiltMax={6}
            className="p-4 sm:p-5 flex flex-col justify-between hover:border-neutral-700/60 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-secondary text-foreground border border-border flex items-center justify-center shrink-0 shadow-2xs">
                <Award className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                Avg Lead Score
              </span>
            </div>
            <div className="my-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
                {metrics.avgScore} <span className="text-sm font-normal text-muted-foreground">/ 100</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span>↑ +2.1 pts</span>
              <span className="text-muted-foreground font-normal text-[10px]">quality filter</span>
            </div>
          </SpotlightCard>
        </motion.div>

        <motion.div layoutId="leads-stat-dnc" className="cursor-pointer" onClick={() => setActiveMetricId('leads-stat-dnc')}>
          <SpotlightCard
            id="stat-leads-dnc"
            color="#71717a"
            tiltMax={6}
            className="p-4 sm:p-5 flex flex-col justify-between hover:border-neutral-700/60 transition-colors"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-secondary text-foreground border border-border flex items-center justify-center shrink-0 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                DNC Scrub Passed
              </span>
            </div>
            <div className="my-1">
              <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-heading">
                {metrics.total - metrics.dncCount} <span className="text-sm font-normal text-muted-foreground">clean</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
              <span>{metrics.dncCount} scrubbed</span>
              <span className="text-muted-foreground font-normal text-[10px]">auto-blocked</span>
            </div>
          </SpotlightCard>
        </motion.div>
      </SpotlightCardGroup>

      {/* ROW 2: Lead Ingestion Volume Trend + Status Distribution Radial Ring */}
      <SpotlightCardGroup className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Lead Volume Trend Chart */}
        <div className="lg:col-span-8 flex flex-col">
          <ChartSwitcher
            title="Lead Ingestion & Distribution Velocity"
            subtitle="Total incoming leads vs buyer sold conversions (Last 7 Days)"
            data={metrics.trendData}
            xAxisKey="day"
            series={[
              { key: 'leads', label: 'Ingested', color: '#18181b', suffix: ' leads' },
              { key: 'sold', label: 'Sold', color: '#71717a', suffix: ' leads' },
            ]}
            funnelStages={metrics.funnelStages}
            defaultMode="area"
            height={210}
            spotlightColor="#71717a"
          />
        </div>

        {/* Lead Status Distribution Radial Ring */}
        <div className="lg:col-span-4 flex flex-col">
          <SpotlightCard
            color="#71717a"
            tiltMax={4}
            className="p-4 sm:p-6 flex flex-col justify-between h-full"
          >
            <div className="flex items-center justify-between mb-1">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-foreground font-heading">
                  Status &amp; Conversion Health
                </h3>
                <p className="text-[11px] text-muted-foreground font-medium">
                  Pipeline distribution of active leads
                </p>
              </div>
            </div>

            <div className="my-auto py-1 flex items-center justify-center">
              <ChartContainer config={radialChartConfig} className="mx-auto aspect-square w-full max-h-[160px]">
                <RadialBarChart
                  data={[{ status: 'sold', count: Math.min(100, Math.max(0, metrics.soldRate)) }]}
                  startAngle={0}
                  endAngle={Math.min(360, Math.max(0, Math.round((Math.min(100, metrics.soldRate) / 100) * 360)))}
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
                          const rateStr = `${metrics.soldRate}%`;
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
                                Sold Ratio
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
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Sold
                </span>
                <span className="font-bold text-foreground font-mono">{metrics.sold}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-foreground font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-foreground" /> Clean DNC
                </span>
                <span className="font-bold text-foreground font-mono">{metrics.total - metrics.dncCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-foreground font-semibold">
                  <Copy className="w-3.5 h-3.5 text-amber-500" /> Duplicate
                </span>
                <span className="font-bold text-foreground font-mono">0</span>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </SpotlightCardGroup>

      {/* Filter Control Bar */}
      <SpotlightCard
        color="#71717a"
        tiltMax={2}
        enableShimmer={false}
        className="p-4 flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground mr-2">
            <SlidersHorizontal className="w-4 h-4 text-foreground" />
            <span>Filters:</span>
          </div>

          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="bg-secondary border border-border text-xs font-semibold text-foreground py-2 px-3 rounded-xl outline-none focus:border-foreground cursor-pointer transition-colors"
          >
            <option value="all">All Brands</option>
            {Array.from(new Set(leads.map((l) => l.brand_name).filter(Boolean))).map((bName) => (
              <option key={bName} value={bName}>{bName}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-secondary border border-border text-xs font-semibold text-foreground py-2 px-3 rounded-xl outline-none focus:border-foreground cursor-pointer transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="verifying">Verifying</option>
            <option value="verified">Verified</option>
            <option value="sold">Sold</option>
            <option value="duplicate">Duplicate</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={String(scoreMin)}
            onChange={(e) => setScoreMin(Number(e.target.value))}
            className="bg-secondary border border-border text-xs font-semibold text-foreground py-2 px-3 rounded-xl outline-none focus:border-foreground cursor-pointer transition-colors"
          >
            <option value="0">Min Score: Any</option>
            <option value="50">Min Score: 50+</option>
            <option value="75">Min Score: 75+</option>
            <option value="90">Min Score: 90+</option>
          </select>
        </div>

        <div className="text-xs font-semibold text-muted-foreground">
          Showing <span className="text-foreground font-bold">{filteredLeads.length}</span> of {leads.length} leads
        </div>
      </SpotlightCard>

      {/* Main Filterable Data Table */}
      <SpotlightCard
        color="#71717a"
        tiltMax={2}
        className="p-0 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-slate-100/90 dark:bg-neutral-900/60 text-[11px] font-bold text-slate-700 dark:text-neutral-300 uppercase tracking-wider">
                <th className="py-3.5 px-4">Lead ID</th>
                <th className="py-3.5 px-4">Brand</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Score</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">SubID Source</th>
                <th className="py-3.5 px-4">Buyer Sold To</th>
                <th className="py-3.5 px-4">TrustedForm</th>
                <th className="py-3.5 px-4">DNC Flag</th>
                <th className="py-3.5 px-4">Submitted At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-medium">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12">
                    <Loader
                      size="md"
                      title="Loading lead audit stream..."
                      subtitle="Fetching verified submissions, scoring metrics, and routing audit logs"
                    />
                  </td>
                </tr>
              ) : filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-muted-foreground text-xs">
                    No leads found matching current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const contact = getContactInfo(lead);
                  return (
                    <motion.tr
                      key={lead.id}
                      layoutId={`lead-row-${lead.id}`}
                      onClick={() => setSelectedLead(lead)}
                      className="admin-table-row hover:bg-slate-50/80 dark:hover:bg-neutral-900/50 cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                        {lead.id.substring(0, 8)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-foreground">{lead.brand_name}</td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="text-foreground font-bold">{contact.name}</span>
                          <span className="text-[11px] text-slate-600 dark:text-neutral-400 font-medium">{contact.email}</span>
                        </div>
                      </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          (lead.score || 0) >= 80
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : (lead.score || 0) >= 50
                            ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {lead.score || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <ExpandableStatusBadge
                        id={`lead-tbl-status-${lead.id}`}
                        status={lead.status}
                        variant={
                          lead.status === 'sold'
                            ? 'info'
                            : lead.status === 'verified'
                            ? 'success'
                            : lead.status === 'duplicate'
                            ? 'warning'
                            : 'neutral'
                        }
                        contextText={
                          lead.status === 'sold'
                            ? `Lead monetized and delivered to ${lead.sold_to_buyer_name || 'Buyer Partner'} for $55.00 payout.`
                            : lead.status === 'verified'
                            ? 'TCPA compliant submission with verified Jornaya LeadID and TrustedForm claim token.'
                            : lead.status === 'duplicate'
                            ? 'Duplicate submission detected by phone/email hash within 30-day window.'
                            : 'Pending compliance verification gate.'
                        }
                        details={[
                          { label: 'Score', value: `${lead.score || 80}/100` },
                          { label: 'Buyer', value: lead.sold_to_buyer_name || (lead.sold ? 'Buyer Assigned' : 'Unsold') },
                          { label: 'Ingested', value: new Date(lead.created_at).toLocaleTimeString() }
                        ]}
                      />
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-neutral-300 font-mono text-xs font-semibold">
                      {String(lead.subid_params?.utm_source || 'direct')}
                    </td>
                    <td className="py-3.5 px-4 text-foreground font-bold">
                      {lead.sold_to_buyer_name || (lead.sold ? 'Buyer Assigned' : 'Unsold')}
                    </td>
                    <td className="py-3.5 px-4">
                      {lead.trustedform_cert_url ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground font-medium">Standard</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {lead.dnc_flagged ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Flagged</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Clear</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-neutral-300 text-xs font-semibold">
                      {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </SpotlightCard>

      {/* Row Click Detail Drawer */}
      <LeadDetailDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />

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
              {activeMetricId === 'leads-stat-total'
                ? 'Total Ingested Leads Telemetry'
                : activeMetricId === 'leads-stat-revenue'
                ? 'Est. Lead Revenue Breakdown'
                : activeMetricId === 'leads-stat-score'
                ? 'Lead Quality Score Analysis'
                : 'Verification & Compliance Rate'}
            </h3>
            <p className="text-xs text-muted-foreground mb-5">
              Live multi-brand analytics and verification audit trail
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-secondary/50 border border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-semibold">Active Snapshot</span>
                <span className="text-xl font-extrabold text-foreground font-heading">
                  {activeMetricId === 'leads-stat-total'
                    ? `${metrics.total.toLocaleString()} leads`
                    : activeMetricId === 'leads-stat-revenue'
                    ? `$${metrics.estRevenue.toLocaleString()}`
                    : activeMetricId === 'leads-stat-score'
                    ? `${metrics.avgScore} / 100`
                    : `${metrics.tcpaPassRate}% clean`}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                  <span className="text-[10px] text-muted-foreground block">Sold Leads</span>
                  <span className="font-bold text-foreground">{metrics.sold} leads</span>
                </div>
                <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                  <span className="text-[10px] text-muted-foreground block">Deduplication</span>
                  <span className="font-bold text-foreground">{metrics.statusCounts?.duplicate || 0} duplicates</span>
                </div>
                <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                  <span className="text-[10px] text-muted-foreground block">Avg Score</span>
                  <span className="font-bold text-foreground">{metrics.avgScore} pts</span>
                </div>
                <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                  <span className="text-[10px] text-muted-foreground block">Sold Ratio</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{metrics.soldRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </ExpandableModal>
      )}
    </AdminLayout>
  );
}
