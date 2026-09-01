'use client';

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Plus,
  ShieldCheck,
  ExternalLink,
  Trash2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AddDomainModal } from '@/components/domains/AddDomainModal';
import { SpotlightCard } from '@/components/ui/spotlight-card';
import { AdminDomain, MOCK_DOMAINS } from '@/lib/data';
import { supabase } from '@/lib/supabase';

export default function DomainsPage() {
  const [domains, setDomains] = useState<AdminDomain[]>(MOCK_DOMAINS);
  const [brands, setBrands] = useState<{ id: string; name: string; vertical?: string }[]>([]);
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
      // Query brands from Supabase to derive active domain bindings
      const { data: brandsData } = await supabase
        .from('brands')
        .select('id, name, domain, vertical, created_at, is_active')
        .order('created_at', { ascending: false });

      if (brandsData && brandsData.length > 0) {
        setBrands(brandsData.map((b) => ({ id: b.id, name: b.name, vertical: b.vertical })));
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

  // Open Remove Domain Confirmation Modal and check historical lead & click references
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

  /**
   * Handles the removal of a custom domain.
   *
   * NOTE: Removing a domain here only affects the `brands` / `domains` table mapping
   * in our database (unlinking the domain from the attached brand). It does NOT
   * cascade-delete any historical leads or click records, nor does it affect
   * the Vercel-level domain attachment in Vercel DNS/CLI.
   */
  const handleConfirmRemove = async () => {
    if (!deletingDomain) return;
    setIsRemoving(true);

    try {
      // 1. If linked to an existing brand record in Supabase, unlink the domain on the brand
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

      // 2. Remove domain entry from local UI list
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight font-heading">
            Domain Routing &amp; SSL Certificates
          </h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Manage custom brand domains, CNAME routing, and automatic SSL provisioning
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={fetchDomains}
            className="flex items-center gap-2 px-3.5 py-2 bg-card hover:bg-secondary border border-border rounded-xl text-xs font-semibold text-foreground transition-all duration-200 cursor-pointer transform-gpu shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}`} />
            <span className="hidden sm:inline">Sync Domains</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all duration-200 cursor-pointer transform-gpu"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Domain</span>
          </button>
        </div>
      </div>

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
            ) : (leadRefCount || 0) > 0 || (clickRefCount || 0) > 0 ? (
              /* Warning if historical records exist */
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 text-xs leading-relaxed space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                  <span>Active Historical Records Detected</span>
                </div>
                <p>
                  This domain&apos;s attached brand (<strong>{deletingDomain.brand_name}</strong>) is associated with <strong>{leadRefCount ?? 0} leads</strong> and <strong>{clickRefCount ?? 0} click logs</strong>.
                </p>
                <p className="text-[11px] text-amber-900 dark:text-amber-200">
                  Removal will strictly unbind the domain routing. All historical records remain intact in your database and reports.
                </p>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>No active leads or click logs currently tied to this domain. Safe to remove.</span>
              </div>
            )}

            <p className="text-[11px] text-muted-foreground italic">
              Note: Removing a domain here only affects the database routing mapping in LeadFlow. It does not delete historical records or alter Vercel DNS attachments.
            </p>

            {/* Two Explicit Choices */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-border">
              <button
                type="button"
                disabled={isRemoving}
                onClick={() => setDeletingDomain(null)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-secondary transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRemoving || checkingRefs}
                onClick={handleConfirmRemove}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all duration-200 cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isRemoving ? 'Removing...' : 'Remove Domain'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <AddDomainModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddDomain={handleAddDomain}
        availableBrands={brands}
      />
    </AdminLayout>
  );
}
