'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAdmin } from '@/components/admin-context';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { ShieldCheck, Filter, ChevronLeft, ChevronRight, FileCode2 } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface VerificationRowItem {
  id: string;
  lead_id: string;
  check_type: string;
  provider: string;
  status: string;
  raw_response: Record<string, unknown>;
  created_at: string;
  leads?: {
    full_name: string | null;
    email: string | null;
    phone: string | null;
    brands?: { name: string } | null;
  } | null;
}

const PAGE_SIZE = 15;

export default function VerificationPage() {
  const { getDateBounds } = useAdmin();
  const [logs, setLogs] = useState<VerificationRowItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);

  // Filters
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadLogs() {
      try {
        const { startDate, endDate } = getDateBounds();
        let query = supabase
          .from('verification_results')
          .select('*, leads(full_name, email, phone, brands(name))', { count: 'exact' });

        if (startDate) query = query.gte('created_at', startDate.toISOString());
        if (endDate) query = query.lte('created_at', endDate.toISOString());

        if (selectedType !== 'all') query = query.eq('check_type', selectedType);
        if (selectedStatus !== 'all') query = query.eq('status', selectedStatus);

        const from = page * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;

        const { data, count, error } = await query
          .order('created_at', { ascending: false })
          .range(from, to);

        if (!error && isMounted) {
          setLogs((data || []) as VerificationRowItem[]);
          setTotalCount(count || 0);
        }
      } catch (err) {
        console.error('Error fetching verification logs:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadLogs();

    return () => {
      isMounted = false;
    };
  }, [getDateBounds, selectedType, selectedStatus, page]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
          <ShieldCheck className="w-7 h-7 text-emerald-500" />
          Verification Audit Trail
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Detailed raw response logs from TrustedForm certificate claims, DNC scrubbing, and scoring calculations.
        </p>
      </div>

      {/* Filters Card */}
      <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mr-2">
            <Filter className="w-3.5 h-3.5" /> Filter Logs:
          </div>

          <select
            value={selectedType}
            onChange={(e) => { setSelectedType(e.target.value); setPage(0); }}
            className="h-9 px-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Check Types</option>
            <option value="trustedform">TrustedForm</option>
            <option value="dnc_scrub">DNC Scrub</option>
            <option value="scoring">Internal Scorer</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => { setSelectedStatus(e.target.value); setPage(0); }}
            className="h-9 px-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-800 dark:text-slate-200"
          >
            <option value="all">All Statuses</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
            <option value="error">Error</option>
            <option value="skipped">Skipped</option>
          </select>
        </div>
      </Card>

      {/* Main Table */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-lg font-bold">Raw Audit Log Entries</CardTitle>
          <CardDescription className="text-xs">Showing {totalCount} total audit records</CardDescription>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Lead Contact</TableHead>
                <TableHead>Check Type</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Raw JSON</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-slate-500 text-sm">
                    No verification audit logs match the current filters.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const isExpanded = expandedId === log.id;
                  let badgeVariant: 'success' | 'destructive' | 'warning' | 'outline' = 'outline';
                  if (log.status === 'passed') badgeVariant = 'success';
                  else if (log.status === 'failed' || log.status === 'error') badgeVariant = 'destructive';
                  else if (log.status === 'skipped') badgeVariant = 'warning';

                  return (
                    <React.Fragment key={log.id}>
                      <TableRow className="cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : log.id)}>
                        <TableCell className="font-mono text-xs text-slate-500">
                          {formatDate(log.created_at)}
                        </TableCell>
                        <TableCell className="font-bold text-slate-900 dark:text-white">
                          {log.leads?.brands?.name || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {log.leads?.full_name || 'N/A'}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">
                            {log.leads?.email || log.leads?.phone || ''}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-xs">
                            {log.check_type}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 font-mono">
                          {log.provider}
                        </TableCell>
                        <TableCell>
                          <Badge variant={badgeVariant} className="capitalize">
                            {log.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="text-blue-500 text-xs">
                            <FileCode2 className="w-3.5 h-3.5 mr-1" />
                            {isExpanded ? 'Hide JSON ▲' : 'View JSON ▼'}
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Collapsible Formatted JSON Row */}
                      {isExpanded && (
                        <TableRow className="bg-slate-950/80 hover:bg-slate-950/80">
                          <TableCell colSpan={7} className="p-4">
                            <div className="text-xs font-bold text-slate-400 mb-2 font-mono flex items-center justify-between">
                              <span>Raw Payload Response — Log ID: {log.id}</span>
                              <span className="text-[10px] text-slate-500">Lead ID: {log.lead_id}</span>
                            </div>
                            <pre className="p-4 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
                              {JSON.stringify(log.raw_response, null, 2)}
                            </pre>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
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
            <strong className="text-slate-900 dark:text-white">{totalPages || 1}</strong> ({totalCount} logs)
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
    </div>
  );
}
