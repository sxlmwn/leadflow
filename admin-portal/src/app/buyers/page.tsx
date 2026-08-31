'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit2,
  ExternalLink,
  RefreshCw,
  Tag,
  DollarSign,
  Award
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AddEditBuyerModal } from '@/components/buyers/AddEditBuyerModal';
import { supabase } from '@/lib/supabase';
import { AdminBuyer } from '@/lib/data';

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<AdminBuyer[]>([]);
  const [availableBrandNames, setAvailableBrandNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBuyer, setEditingBuyer] = useState<AdminBuyer | null>(null);

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight font-heading">
            Lead Buyer Endpoints &amp; Rules
          </h2>
          <p className="text-xs text-muted-foreground font-medium mt-0.5">
            Manage ping/post endpoints, pricing caps, and acceptance score thresholds
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

      {/* Main Buyer Endpoints Table */}
      <div className="admin-card overflow-hidden transform-gpu">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-slate-50/70 dark:bg-slate-800/40 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
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
              {buyers.map((buyer) => {
                const active = buyer.is_active ?? buyer.active ?? true;
                const minS = buyer.min_score ?? buyer.min_accept_score ?? 70;

                return (
                  <tr key={buyer.id} className="admin-table-row hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleActive(buyer.id, active)}
                        className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-all duration-200 ${
                          active
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-secondary text-muted-foreground border border-border'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${active ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                        <span>{active ? 'Active' : 'Paused'}</span>
                      </button>
                    </td>

                    <td className="py-3.5 px-4">
                      <Link
                        href={`/buyers/${buyer.id}`}
                        className="font-bold text-foreground hover:text-blue-600 dark:hover:text-blue-400 font-heading text-sm transition-colors duration-200"
                      >
                        {buyer.name}
                      </Link>
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

                    <td className="py-3.5 px-4 text-right">
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
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AddEditBuyerModal
        buyer={editingBuyer}
        availableBrands={availableBrandNames}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBuyer}
      />
    </AdminLayout>
  );
}
