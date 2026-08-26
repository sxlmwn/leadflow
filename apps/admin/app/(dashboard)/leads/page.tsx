'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAdmin } from '@/components/admin-context';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Filter,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Briefcase,
  FileCode2,
} from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';

// TODO: Manual edit/delete of lead records requires confirmation modal in future release

interface LeadItem {
  id: string;
  created_at: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  zip_code: string | null;
  score: number | null;
  score_breakdown: Record<string, unknown> | null;
  form_answers: Record<string, unknown> | null;
  subid_params: Record<string, unknown> | null;
  status: string;
  sold: boolean;
  sold_to_buyer_id: string | null;
  sold_at: string | null;
  dnc_flagged: boolean;
  dnc_scrub_passed: boolean;
  trustedform_cert_url: string | null;
  brand_id: string;
  brands?: { name: string; slug: string } | null;
  buyers?: { name: string } | null;
}

interface VerificationRow {
  id: string;
  check_type: string;
  provider: string;
  status: string;
  raw_response: Record<string, unknown>;
  created_at: string;
}

interface DeliveryRow {
  id: string;
  buyer_id: string;
  http_status: number;
  accepted: boolean;
  price_paid: number;
  converted: boolean;
  converted_at: string | null;
  conversion_value: number | null;
  response_payload: Record<string, unknown>;
  created_at: string;
  buyers?: { name: string } | null;
}

const PAGE_SIZE = 10;

export default function LeadsPage() {
  const { getDateBounds } = useAdmin();
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);

  // Filters
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [minScore, setMinScore] = useState<string>('');
  const [maxScore, setMaxScore] = useState<string>('');
  const [dncOnly, setDncOnly] = useState<boolean>(false);
  const [soldOnly, setSoldOnly] = useState<string>('all');

  // Brands list for filter dropdown
  const [brandsList, setBrandsList] = useState<{ id: string; name: string }[]>([]);

  // Selected lead for detail modal
  const [detailLead, setDetailLead] = useState<LeadItem | null>(null);
  const [verifLogs, setVerifLogs] = useState<VerificationRow[]>([]);
  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryRow[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [expandedJson, setExpandedJson] = useState<Record<string, boolean>>({});

  // Fetch available brands for filter
  useEffect(() => {
    supabase.from('brands').select('id, name').then(({ data }) => {
      setBrandsList(data || []);
    });
  }, []);

  // Fetch paginated leads
  useEffect(() => {
    let isMounted = true;

    async function loadLeads() {
      try {
        const { startDate, endDate } = getDateBounds();
        let query = supabase
          .from('leads')
          .select('*, brands(name, slug), buyers:sold_to_buyer_id(name)', { count: 'exact' });

        if (startDate) query = query.gte('created_at', startDate.toISOString());
        if (endDate) query = query.lte('created_at', endDate.toISOString());

        if (selectedBrand !== 'all') query = query.eq('brand_id', selectedBrand);
        if (selectedStatus !== 'all') query = query.eq('status', selectedStatus);
        if (minScore) query = query.gte('score', Number(minScore));
        if (maxScore) query = query.lte('score', Number(maxScore));
        if (dncOnly) query = query.eq('dnc_flagged', true);
        if (soldOnly === 'sold') query = query.eq('sold', true);
        if (soldOnly === 'unsold') query = query.eq('sold', false);

        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, count, error } = await query
          .order('created_at', { ascending: false })
          .range(from, to);

        if (!error && isMounted) {
          setLeads((data || []) as LeadItem[]);
          setTotalCount(count || 0);
        }
      } catch (err) {
        console.error('Error fetching leads:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadLeads();

    return () => {
      isMounted = false;
    };
  }, [getDateBounds, selectedBrand, selectedStatus, minScore, maxScore, dncOnly, soldOnly, page]);

  // Open detail view for lead
  const openLeadDetail = async (lead: LeadItem) => {
    setDetailLead(lead);
    setLoadingDetails(true);
    try {
      // Fetch verification results
      const { data: verifs } = await supabase
        .from('verification_results')
        .select('*')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: true });

      setVerifLogs((verifs || []) as VerificationRow[]);

      // Fetch buyer deliveries
      const { data: delivs } = await supabase
        .from('buyer_deliveries')
        .select('*, buyers(name)')
        .eq('lead_id', lead.id)
        .order('created_at', { ascending: true });

      setDeliveryLogs((delivs || []) as DeliveryRow[]);
    } catch (err) {
      console.error('Error loading lead details:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Lead Records & Verification Audit
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Server-side paginated lead database with full compliance and buyer delivery logs.
          </p>
        </div>
      </div>

      {/* Filter Controls Card */}
      <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mr-2">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </div>

          {/* Brand Selector */}
          <select
            value={selectedBrand}
            onChange={(e) => { setSelectedBrand(e.target.value); setPage(0); }}
            className="h-9 px-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Brands</option>
            {brandsList.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          {/* Status Selector */}
          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setPage(0); }}
            className="h-9 px-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="new">New</option>
            <option value="verified">Verified</option>
            <option value="sold">Sold</option>
            <option value="duplicate">Duplicate</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Sold Filter */}
          <select
            value={soldOnly}
            onChange={(e) => { setSoldOnly(e.target.value); setPage(0); }}
            className="h-9 px-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Monetization</option>
            <option value="sold">Sold Leads Only</option>
            <option value="unsold">Unsold Leads Only</option>
          </select>

          {/* Min Score Input */}
          <input
            type="number"
            placeholder="Min Score"
            value={minScore}
            onChange={(e) => { setMinScore(e.target.value); setPage(0); }}
            className="w-24 h-9 px-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
          />

          {/* Max Score Input */}
          <input
            type="number"
            placeholder="Max Score"
            value={maxScore}
            onChange={(e) => { setMaxScore(e.target.value); setPage(0); }}
            className="w-24 h-9 px-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
          />

          {/* DNC Only Toggle */}
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer ml-auto">
            <input
              type="checkbox"
              checked={dncOnly}
              onChange={(e) => { setDncOnly(e.target.checked); setPage(0); }}
              className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
            />
            <span>DNC-Flagged Only</span>
          </label>
        </div>
      </Card>

      {/* Main Data Table */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold">Leads Master Table</CardTitle>
            <CardDescription className="text-xs">Showing {totalCount} total records</CardDescription>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Contact Information</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>DNC Flag</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Monetization</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-36" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-14" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : leads.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-slate-500 text-sm">
                    No lead records match the selected filter criteria.
                  </TableCell>
                </TableRow>
              ) : (
                leads.map((lead) => {
                  const score = Number(lead.score || 0);
                  let scoreBadge = <Badge variant="destructive">{score}/100</Badge>;
                  if (score >= 70) scoreBadge = <Badge variant="success">{score}/100</Badge>;
                  else if (score >= 40) scoreBadge = <Badge variant="warning">{score}/100</Badge>;

                  return (
                    <TableRow
                      key={lead.id}
                      onClick={() => openLeadDetail(lead)}
                      className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    >
                      <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-400">
                        {formatDate(lead.created_at)}
                      </TableCell>
                      <TableCell className="font-bold text-slate-900 dark:text-white">
                        {lead.brands?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                          {lead.full_name || 'N/A'}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                          {lead.email} {lead.phone ? `• ${lead.phone}` : ''}
                        </div>
                      </TableCell>
                      <TableCell>{scoreBadge}</TableCell>
                      <TableCell>
                        {lead.dnc_flagged ? (
                          <Badge variant="destructive">DNC Flagged</Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-400">Clean</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="capitalize px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {lead.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {lead.sold ? (
                          <div>
                            <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Sold
                            </div>
                            {lead.buyers?.name && (
                              <div className="text-[10px] text-slate-400">
                                to {lead.buyers.name}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <XCircle className="w-3.5 h-3.5" /> Unsold
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 font-semibold text-xs">
                          Inspect <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination controls */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="text-slate-500 dark:text-slate-400">
            Page <strong className="text-slate-900 dark:text-white">{page + 1}</strong> of{' '}
            <strong className="text-slate-900 dark:text-white">{totalPages || 1}</strong> ({totalCount} items)
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Comprehensive Lead Inspection Modal */}
      {detailLead && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-3xl p-6 overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setDetailLead(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white font-bold"
            >
              ✕
            </button>

            {/* Modal Title */}
            <div className="flex items-center gap-3 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold">
                LD
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Lead Audit Inspection — {detailLead.full_name || 'Anonymous Lead'}
                </h2>
                <div className="text-xs font-mono text-slate-400">ID: {detailLead.id}</div>
              </div>
            </div>

            {loadingDetails ? (
              <div className="space-y-4 py-8">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              <div className="space-y-6 text-sm">
                {/* 1. Contact & Core Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400">Brand Domain</span>
                    <div className="font-bold text-slate-900 dark:text-white">{detailLead.brands?.name}</div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Score</span>
                    <div className="font-bold text-lg text-blue-600 dark:text-blue-400">{detailLead.score}/100</div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Email</span>
                    <div className="font-mono text-xs truncate">{detailLead.email || 'N/A'}</div>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400">Phone</span>
                    <div className="font-mono text-xs">{detailLead.phone || 'N/A'}</div>
                  </div>
                </div>

                {/* 2. Form Answers */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-blue-500" /> Submitted Form Answers
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    {detailLead.form_answers && Object.keys(detailLead.form_answers).length > 0 ? (
                      Object.entries(detailLead.form_answers).map(([key, val]) => (
                        <div key={key} className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <span className="font-semibold text-slate-500 capitalize">{key.replace(/_/g, ' ')}:</span>{' '}
                          <strong className="text-slate-900 dark:text-slate-100">{String(val)}</strong>
                        </div>
                      ))
                    ) : (
                      <div className="text-slate-400 italic">No custom form answers recorded.</div>
                    )}
                  </div>
                </div>

                {/* 3. Verification Logs Audit Trail */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Verification Audit Trail
                  </h3>
                  <div className="space-y-3">
                    {verifLogs.map((v) => (
                      <div key={v.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="font-bold capitalize text-slate-800 dark:text-slate-200">
                            {v.check_type} ({v.provider})
                          </div>
                          <Badge variant={v.status === 'passed' ? 'success' : 'destructive'}>
                            {v.status}
                          </Badge>
                        </div>
                        <button
                          onClick={() => setExpandedJson((prev) => ({ ...prev, [v.id]: !prev[v.id] }))}
                          className="text-blue-500 hover:underline text-[11px] font-semibold mt-1"
                        >
                          {expandedJson[v.id] ? 'Hide Raw Response ▲' : 'View Raw Response JSON ▼'}
                        </button>
                        {expandedJson[v.id] && (
                          <pre className="mt-2 p-3 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[10px] overflow-x-auto border border-slate-800">
                            {JSON.stringify(v.raw_response, null, 2)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Buyer Deliveries */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-amber-500" /> Buyer Offer Deliveries
                  </h3>
                  <div className="space-y-2 text-xs">
                    {deliveryLogs.length === 0 ? (
                      <div className="text-slate-400 italic">No buyer delivery attempts for this lead.</div>
                    ) : (
                      deliveryLogs.map((d) => (
                        <div key={d.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white">{d.buyers?.name || 'Buyer'}</span>
                            <span className="text-slate-400 text-[11px] ml-2">HTTP {d.http_status}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(d.price_paid)}
                            </span>
                            <Badge variant={d.accepted ? 'success' : 'outline'}>
                              {d.accepted ? 'Accepted (Won)' : 'Rejected'}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
