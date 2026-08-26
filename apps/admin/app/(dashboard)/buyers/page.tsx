'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Plus,
  Building2,
  Trash2,
  Edit,
  AlertTriangle,
} from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { formatCurrency } from '@/lib/utils';

interface BuyerItem {
  id: string;
  name: string;
  api_endpoint: string | null;
  api_key_encrypted: string | null;
  price_per_lead: number | null;
  pricing_model: string | null;
  min_accept_score: number | null;
  min_score: number | null;
  is_active: boolean;
  active: boolean;
  created_at: string;
  linkedBrandIds?: string[];
  linkedBrandNames?: string[];
}

interface BrandOption {
  id: string;
  name: string;
}

const buyerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  api_endpoint: z.string().url('Must be a valid URL').or(z.literal('')),
  price_per_lead: z.number().min(0, 'Price must be >= 0'),
  pricing_model: z.enum(['flat', 'tiered', 'auction']),
  min_score: z.number().min(0).max(100),
  active: z.boolean(),
  brand_ids: z.array(z.string()),
});

type BuyerFormValues = z.infer<typeof buyerSchema>;

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<BuyerItem[]>([]);
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<BuyerItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    control,
    formState: { errors },
  } = useForm<BuyerFormValues>({
    resolver: zodResolver(buyerSchema),
    defaultValues: {
      name: '',
      api_endpoint: '',
      price_per_lead: 15,
      pricing_model: 'flat',
      min_score: 50,
      active: true,
      brand_ids: [],
    },
  });

  const selectedBrandIds = useWatch({ control, name: 'brand_ids' }) || [];

  const refreshBuyers = async () => {
    try {
      const { data: buyersData } = await supabase.from('buyers').select('*').order('created_at', { ascending: false });
      const { data: brandsData } = await supabase.from('brands').select('id, name').order('name');
      const { data: bbData } = await supabase.from('buyer_brands').select('buyer_id, brand_id');

      setBrands(brandsData || []);

      const brandsMap: Record<string, string> = {};
      (brandsData || []).forEach((b) => (brandsMap[b.id] = b.name));

      const processedBuyers: BuyerItem[] = (buyersData || []).map((buyer) => {
        const linkedIds = (bbData || [])
          .filter((bb) => bb.buyer_id === buyer.id)
          .map((bb) => bb.brand_id);
        const linkedNames = linkedIds.map((id) => brandsMap[id] || 'Unknown');

        return {
          ...buyer,
          active: buyer.active !== undefined ? buyer.active : buyer.is_active,
          min_score: buyer.min_score !== undefined ? buyer.min_score : (buyer.min_accept_score || 0),
          linkedBrandIds: linkedIds,
          linkedBrandNames: linkedNames,
        };
      });

      setBuyers(processedBuyers);
    } catch (err) {
      console.error('Error refreshing buyers:', err);
    }
  };

  // Fetch Buyers and linked brands
  useEffect(() => {
    let isMounted = true;

    async function loadBuyers() {
      try {
        const { data: buyersData } = await supabase.from('buyers').select('*').order('created_at', { ascending: false });
        const { data: brandsData } = await supabase.from('brands').select('id, name').order('name');
        const { data: bbData } = await supabase.from('buyer_brands').select('buyer_id, brand_id');

        if (!isMounted) return;
        setBrands(brandsData || []);

        const brandsMap: Record<string, string> = {};
        (brandsData || []).forEach((b) => (brandsMap[b.id] = b.name));

        const processedBuyers: BuyerItem[] = (buyersData || []).map((buyer) => {
          const linkedIds = (bbData || [])
            .filter((bb) => bb.buyer_id === buyer.id)
            .map((bb) => bb.brand_id);
          const linkedNames = linkedIds.map((id) => brandsMap[id] || 'Unknown');

          return {
            ...buyer,
            active: buyer.active !== undefined ? buyer.active : buyer.is_active,
            min_score: buyer.min_score !== undefined ? buyer.min_score : (buyer.min_accept_score || 0),
            linkedBrandIds: linkedIds,
            linkedBrandNames: linkedNames,
          };
        });

        setBuyers(processedBuyers);
      } catch (err) {
        console.error('Error fetching buyers:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadBuyers();

    return () => {
      isMounted = false;
    };
  }, []);

  // Inline Toggle Active Switch
  const toggleActiveInline = async (buyer: BuyerItem) => {
    const nextActive = !buyer.active;
    setBuyers((prev) =>
      prev.map((b) => (b.id === buyer.id ? { ...b, active: nextActive, is_active: nextActive } : b))
    );

    try {
      await supabase
        .from('buyers')
        .update({ active: nextActive, is_active: nextActive })
        .eq('id', buyer.id);
    } catch (err) {
      console.error('Error updating active state:', err);
      setBuyers((prev) =>
        prev.map((b) => (b.id === buyer.id ? { ...b, active: buyer.active, is_active: buyer.active } : b))
      );
    }
  };

  // Open Add Dialog
  const handleOpenAdd = () => {
    setEditingBuyer(null);
    reset({
      name: '',
      api_endpoint: 'http://localhost:3000/api/dev/mock-buyer?mode=accept',
      price_per_lead: 25,
      pricing_model: 'flat',
      min_score: 50,
      active: true,
      brand_ids: brands.map((b) => b.id),
    });
    setDialogOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (buyer: BuyerItem) => {
    setEditingBuyer(buyer);
    reset({
      name: buyer.name,
      api_endpoint: buyer.api_endpoint || '',
      price_per_lead: Number(buyer.price_per_lead || 0),
      pricing_model: (buyer.pricing_model as 'flat' | 'tiered' | 'auction') || 'flat',
      min_score: Number(buyer.min_score || 0),
      active: buyer.active,
      brand_ids: buyer.linkedBrandIds || [],
    });
    setDialogOpen(true);
  };

  // Save Buyer (Create or Update)
  const onSubmit = async (values: BuyerFormValues) => {
    setSaving(true);
    try {
      let buyerId = editingBuyer?.id;

      if (editingBuyer) {
        await supabase
          .from('buyers')
          .update({
            name: values.name,
            api_endpoint: values.api_endpoint || null,
            price_per_lead: values.price_per_lead,
            pricing_model: values.pricing_model,
            min_score: values.min_score,
            min_accept_score: values.min_score,
            active: values.active,
            is_active: values.active,
          })
          .eq('id', editingBuyer.id);
      } else {
        const { data: newBuyer, error } = await supabase
          .from('buyers')
          .insert({
            name: values.name,
            api_endpoint: values.api_endpoint || null,
            price_per_lead: values.price_per_lead,
            pricing_model: values.pricing_model,
            min_score: values.min_score,
            min_accept_score: values.min_score,
            active: values.active,
            is_active: values.active,
          })
          .select('id')
          .single();

        if (error) throw error;
        buyerId = newBuyer.id;
      }

      if (buyerId) {
        await supabase.from('buyer_brands').delete().eq('buyer_id', buyerId);
        if (values.brand_ids.length > 0) {
          const links = values.brand_ids.map((bId) => ({
            buyer_id: buyerId as string,
            brand_id: bId,
          }));
          await supabase.from('buyer_brands').insert(links);
        }
      }

      setDialogOpen(false);
      refreshBuyers();
    } catch (err) {
      console.error('Error saving buyer:', err);
    } finally {
      setSaving(false);
    }
  };

  // Confirm Delete Buyer
  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await supabase.from('buyer_brands').delete().eq('buyer_id', deleteId);
      await supabase.from('buyers').delete().eq('id', deleteId);
      setDeleteId(null);
      refreshBuyers();
    } catch (err) {
      console.error('Error deleting buyer:', err);
    }
  };

  const toggleBrandSelection = (bId: string) => {
    const current = getValues('brand_ids') || [];
    if (current.includes(bId)) {
      setValue('brand_ids', current.filter((id) => id !== bId));
    } else {
      setValue('brand_ids', [...current, bId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Lead Buyer Partners & API Routing
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage buyer payout contracts, min score thresholds, and brand associations.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="rounded-xl font-bold">
          <Plus className="w-4 h-4 mr-1" /> Add Buyer Partner
        </Button>
      </div>

      {/* Main Table */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-lg font-bold">Active Buyer Directory</CardTitle>
          <CardDescription className="text-xs">Configured lead buyers and price rules</CardDescription>
        </CardHeader>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Buyer Partner</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Pricing Model</TableHead>
                <TableHead>Payout / Lead</TableHead>
                <TableHead>Min Score</TableHead>
                <TableHead>Linked Brands</TableHead>
                <TableHead>Active Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : buyers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-slate-500 text-sm">
                    No buyers configured yet. Click &quot;Add Buyer Partner&quot; to configure your first buyer.
                  </TableCell>
                </TableRow>
              ) : (
                buyers.map((buyer) => (
                  <TableRow key={buyer.id}>
                    <TableCell className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <span>{buyer.name}</span>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-slate-500 max-w-[200px] truncate" title={buyer.api_endpoint || ''}>
                      {buyer.api_endpoint || 'No Endpoint Configured'}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {buyer.pricing_model || 'flat'}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(Number(buyer.price_per_lead || 0))}
                    </TableCell>
                    <TableCell className="font-bold text-xs text-slate-700 dark:text-slate-300">
                      ≥ {buyer.min_score || 0} pts
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {buyer.linkedBrandNames && buyer.linkedBrandNames.length > 0 ? (
                          buyer.linkedBrandNames.map((bName) => (
                            <Badge key={bName} variant="outline" className="text-[10px]">
                              {bName}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400 italic">None</span>
                        )}
                      </div>
                    </TableCell>
                    {/* Inline Active Switch */}
                    <TableCell>
                      <button
                        onClick={() => toggleActiveInline(buyer)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                          buyer.active ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            buyer.active ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(buyer)} title="Edit Buyer">
                          <Edit className="w-4 h-4 text-slate-500 hover:text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteId(buyer.id)} title="Delete Buyer">
                          <Trash2 className="w-4 h-4 text-slate-500 hover:text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Add / Edit Buyer Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setDialogOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
            >
              ✕
            </button>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-1">
              {editingBuyer ? 'Edit Buyer Partner' : 'Add Buyer Partner'}
            </h2>
            <p className="text-xs text-slate-500 mb-5">Configure webhook endpoint, min score, and associated brands.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Buyer Name
                </label>
                <input
                  {...register('name')}
                  placeholder="e.g. HomeImprovement Pro Inc."
                  className="w-full h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500"
                />
                {errors.name && <span className="text-red-500 text-[10px]">{errors.name.message}</span>}
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  API Webhook Endpoint
                </label>
                <input
                  {...register('api_endpoint')}
                  placeholder="https://api.buyer.com/v1/leads"
                  className="w-full h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-blue-500"
                />
                {errors.api_endpoint && (
                  <span className="text-red-500 text-[10px]">{errors.api_endpoint.message}</span>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Pricing Model
                  </label>
                  <select
                    {...register('pricing_model')}
                    className="w-full h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="flat">Flat</option>
                    <option value="tiered">Tiered</option>
                    <option value="auction">Auction</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Price / Lead ($)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    {...register('price_per_lead', { valueAsNumber: true })}
                    className="w-full h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Min Score Threshold
                  </label>
                  <input
                    type="number"
                    {...register('min_score', { valueAsNumber: true })}
                    className="w-full h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white text-xs font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Linked Brands Multi-Select */}
              <div>
                <label className="block font-semibold mb-2 text-slate-700 dark:text-slate-300">
                  Accepted Brand Portfolios
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {brands.map((brand) => {
                    const isChecked = selectedBrandIds.includes(brand.id);
                    return (
                      <button
                        type="button"
                        key={brand.id}
                        onClick={() => toggleBrandSelection(brand.id)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                          isChecked
                            ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 font-bold'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span>{brand.name}</span>
                        {isChecked && <span className="text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Partner Active</span>
                <input
                  type="checkbox"
                  {...register('active')}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="font-bold">
                  {saving ? 'Saving...' : editingBuyer ? 'Update Buyer' : 'Create Buyer'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Delete Dialog */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Buyer Partner?</h3>
            <p className="text-xs text-slate-500">
              This action cannot be undone. All brand associations for this buyer will be permanently removed.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button variant="outline" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete} className="font-bold">
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
