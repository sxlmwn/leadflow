'use client';

import React, { useEffect, useState } from 'react';
import {
  Download,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { LeadDetailDrawer } from '@/components/leads/LeadDetailDrawer';
import { supabase } from '@/lib/supabase';
import { AdminLead } from '@/lib/data';

export default function LeadsPage() {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<AdminLead | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [minScoreFilter, setMinScoreFilter] = useState('0');

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('leads')
        .select(`
          *,
          brands ( name, slug )
        `)
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        const formatted: AdminLead[] = data.map((l: any) => ({
          ...l,
          brand_name: l.brands?.name || 'WindowHound'
        }));
        setLeads(formatted);
      } else {
        setLeads([
          {
            id: 'ld-1001-a',
            brand_id: 'b1',
            brand_name: 'WindowHound',
            full_name: 'Arthur Pendelton',
            email: 'arthur.p@gmail.com',
            phone: '(555) 234-5678',
            zip_code: '90210',
            form_answers: { window_count: '4-9 Windows', project_type: 'Replacement' },
            subid_params: { utm_source: 'google_cpc', campaign: 'windows_la' },
            status: 'sold',
            is_duplicate: false,
            score: 94,
            trustedform_cert_url: 'https://cert.trustedform.com/2891x',
            dnc_flagged: false,
            sold: true,
            sold_to_buyer_name: 'Apex Home Services',
            created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString()
          },
          {
            id: 'ld-1002-b',
            brand_id: 'b2',
            brand_name: 'MedTrialMatch',
            full_name: 'Sophia Loren',
            email: 'sophia@yahoo.com',
            phone: '(555) 987-6543',
            zip_code: '30301',
            form_answers: { condition: 'Asthma', age: '31-50' },
            subid_params: { utm_source: 'fb_ads', campaign: 'clinical_trials' },
            status: 'sold',
            is_duplicate: false,
            score: 89,
            trustedform_cert_url: 'https://cert.trustedform.com/9812y',
            dnc_flagged: false,
            sold: true,
            sold_to_buyer_name: 'Clinical Health Research',
            created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString()
          },
          {
            id: 'ld-1003-c',
            brand_id: 'b3',
            brand_name: 'ReliefOlogist',
            full_name: 'Brandon Vance',
            email: 'bvance@outlook.com',
            phone: '(555) 345-6789',
            zip_code: '75001',
            form_answers: { pain_area: 'Back/Spine', severity: 'Severe (7-10)' },
            subid_params: { utm_source: 'tiktok', campaign: 'pain_relief' },
            status: 'verified',
            is_duplicate: false,
            score: 78,
            trustedform_cert_url: 'https://cert.trustedform.com/7712z',
            dnc_flagged: false,
            sold: false,
            created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString()
          },
          {
            id: 'ld-1004-d',
            brand_id: 'b1',
            brand_name: 'WindowHound',
            full_name: 'Elena Rostova',
            email: 'elena@gmail.com',
            phone: '(555) 456-7890',
            zip_code: '60601',
            form_answers: { window_count: '10+ Windows' },
            subid_params: { utm_source: 'bing_cpc' },
            status: 'duplicate',
            is_duplicate: true,
            score: 42,
            dnc_flagged: false,
            sold: false,
            created_at: new Date(Date.now() - 1000 * 60 * 150).toISOString()
          },
          {
            id: 'ld-1005-e',
            brand_id: 'b2',
            brand_name: 'MedTrialMatch',
            full_name: 'George Washington',
            email: 'gwash@mtvernon.org',
            phone: '(555) 567-8901',
            zip_code: '22121',
            form_answers: { condition: 'Migraine' },
            subid_params: { utm_source: 'google_search' },
            status: 'rejected',
            is_duplicate: false,
            score: 25,
            dnc_flagged: true,
            sold: false,
            created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error('Leads fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.brand_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesBrand = brandFilter === 'all' || lead.brand_name?.toLowerCase() === brandFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || lead.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesScore = (lead.score || 0) >= Number(minScoreFilter);

    return matchesSearch && matchesBrand && matchesStatus && matchesScore;
  });

  return (
    <AdminLayout title="Lead Management Audit" onSearchChange={setSearchQuery}>
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-heading">
            All Inbound Leads
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Filter, inspect compliance certificates, and view buyer distribution logs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLeads}
            className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
            <span>Sync Leads</span>
          </button>
          <button className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer">
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="admin-card p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Filters:</span>
          </div>

          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 py-2 px-3 rounded-xl outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Brands</option>
            <option value="WindowHound">WindowHound</option>
            <option value="MedTrialMatch">MedTrialMatch</option>
            <option value="ReliefOlogist">ReliefOlogist</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 py-2 px-3 rounded-xl outline-none focus:border-blue-500 cursor-pointer"
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
            value={minScoreFilter}
            onChange={(e) => setMinScoreFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 py-2 px-3 rounded-xl outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="0">Min Score: Any</option>
            <option value="50">Min Score: 50+</option>
            <option value="75">Min Score: 75+</option>
            <option value="90">Min Score: 90+</option>
          </select>
        </div>

        <div className="text-xs font-semibold text-slate-400">
          Showing <span className="text-slate-900 dark:text-slate-100 font-bold">{filteredLeads.length}</span> of {leads.length} leads
        </div>
      </div>

      {/* Main Filterable Data Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
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
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredLeads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className="hover:bg-blue-50/50 dark:hover:bg-blue-950/40 cursor-pointer transition-colors group"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                    {lead.id.substring(0, 8)}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">{lead.brand_name}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="text-slate-900 dark:text-slate-100 font-bold">{lead.full_name}</span>
                      <span className="text-[10px] text-slate-400">{lead.email}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-extrabold ${
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
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        lead.status === 'sold'
                          ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : lead.status === 'verified'
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                          : lead.status === 'duplicate'
                          ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    {String(lead.subid_params?.utm_source || 'direct')}
                  </td>
                  <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 font-semibold">
                    {lead.sold_to_buyer_name || (lead.sold ? 'Buyer Assigned' : 'Unsold')}
                  </td>
                  <td className="py-3.5 px-4">
                    {lead.trustedform_cert_url ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Standard</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {lead.dnc_flagged ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">
                        <ShieldAlert className="w-3 h-3" />
                        Flagged
                      </span>
                    ) : (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Clear</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row Click Detail Drawer */}
      <LeadDetailDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </AdminLayout>
  );
}
