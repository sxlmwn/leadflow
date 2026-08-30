'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Globe,
  Layers,
  ArrowRight,
  RefreshCw,
  Edit2,
  Trash2,
  AlertTriangle,
  ExternalLink,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  List
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { supabase } from '@/lib/supabase';
import { Brand } from '@/types';
import { MOCK_BRANDS } from '@/lib/data';

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Delete modal state
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);
  const [leadRefCount, setLeadRefCount] = useState<number | null>(null);
  const [clickRefCount, setClickRefCount] = useState<number | null>(null);
  const [checkingRefs, setCheckingRefs] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [forceDeleteText, setForceDeleteText] = useState('');

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setBrands(data as unknown as Brand[]);
      } else {
        setBrands(MOCK_BRANDS as unknown as Brand[]);
      }
    } catch (err) {
      console.error('Brands load error:', err);
      setBrands(MOCK_BRANDS as unknown as Brand[]);
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

  // Open Delete Modal and check references
  const initiateDelete = async (brand: Brand) => {
    setDeletingBrand(brand);
    setLeadRefCount(null);
    setClickRefCount(null);
    setForceDeleteText('');
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

  const handleConfirmDelete = async (force: boolean = false) => {
    if (!deletingBrand) return;
    setIsDeleting(true);

    try {
      if (force && (leadRefCount || 0) > 0) {
        // If there are leads, soft-delete by deactivating to preserve foreign keys
        await supabase.from('brands').update({ is_active: false }).eq('id', deletingBrand.id);
        setBrands(brands.map((b) => (b.id === deletingBrand.id ? { ...b, is_active: false } : b)));
      } else {
        const { error } = await supabase.from('brands').delete().eq('id', deletingBrand.id);
        if (error) throw error;
        setBrands(brands.filter((b) => b.id !== deletingBrand.id));
      }

      setDeletingBrand(null);
    } catch (err: any) {
      console.error('Delete brand error:', err);
      alert(err.message || 'Failed to delete brand.');
    } finally {
      setIsDeleting(false);
    }
  };

  const getQuestionCount = (brand: Brand) => {
    if (!brand.form_schema) return 0;
    if (brand.form_schema.steps && Array.isArray(brand.form_schema.steps)) {
      return brand.form_schema.steps.reduce(
        (acc: number, step: any) => acc + (step.fields?.length || 0),
        0
      );
    }
    if ((brand.form_schema as any).fields) {
      return (brand.form_schema as any).fields.length;
    }
    return 0;
  };

  return (
    <AdminLayout title="Brand Management">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight font-heading">
            Brand Funnels &amp; Vertical Assets
          </h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Configure visual themes, custom domain bindings, and form step schemas
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

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {brands.map((brand) => {
            const primaryColor = brand.theme_config?.primary_color || '#2563eb';
            const totalQuestions = getQuestionCount(brand);
            const totalSteps = brand.form_schema?.steps?.length || 1;

            return (
              <div
                key={brand.id}
                className="admin-card p-6 flex flex-col justify-between group transform-gpu"
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
                      <span
                        className={`w-2 h-2 rounded-full ${
                          brand.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                        }`}
                      />
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
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="admin-card overflow-hidden transform-gpu">
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
                {brands.map((brand) => {
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
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              brand.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
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
                })}
              </tbody>
            </table>
          </div>
        </div>
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
                  Confirm brand deletion policy &amp; foreign key safety
                </p>
              </div>
            </div>

            {checkingRefs ? (
              <div className="p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2 bg-secondary rounded-xl">
                <div className="w-3.5 h-3.5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Checking historical leads and click records...</span>
              </div>
            ) : (leadRefCount || 0) > 0 ? (
              /* Warning if leads exist */
              <div className="space-y-3">
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 text-xs leading-relaxed space-y-1.5">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Active Historical Records Detected</span>
                  </div>
                  <p>
                    This brand is associated with <strong>{leadRefCount} leads</strong> and <strong>{clickRefCount} click logs</strong>. Hard-deleting will break foreign key relationships or historical analytics.
                  </p>
                  <p className="font-semibold text-amber-900 dark:text-amber-200">
                    Recommended action: Safe Soft-Delete (Deactivate) to immediately stop all incoming traffic while preserving historical reports.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => handleConfirmDelete(true)}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    Deactivate Brand (Safe Soft-Delete)
                  </button>
                </div>
              </div>
            ) : (
              /* Safe to delete completely */
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  No historical leads or clicks are linked to <strong>{deletingBrand.name}</strong> ({deletingBrand.slug}). It will be permanently removed from the Supabase database.
                </p>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setDeletingBrand(null)}
                    className="px-4 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-secondary cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => handleConfirmDelete(false)}
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                  </button>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setDeletingBrand(null)}
                className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
