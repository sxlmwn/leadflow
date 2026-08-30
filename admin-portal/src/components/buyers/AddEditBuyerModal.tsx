'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Check } from 'lucide-react';
import { AdminBuyer } from '@/lib/data';

interface AddEditBuyerModalProps {
  buyer: AdminBuyer | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (buyerData: Partial<AdminBuyer>) => void;
}

export const AddEditBuyerModal: React.FC<AddEditBuyerModalProps> = ({
  buyer,
  isOpen,
  onClose,
  onSave
}) => {
  const [name, setName] = useState('');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [pricePerLead, setPricePerLead] = useState(45);
  const [pricingModel, setPricingModel] = useState<'flat' | 'tiered' | 'auction'>('flat');
  const [minScore, setMinScore] = useState(70);
  const [isActive, setIsActive] = useState(true);
  const [acceptedBrands, setAcceptedBrands] = useState<string[]>(['WindowHound', 'MedTrialMatch']);

  useEffect(() => {
    if (buyer) {
      setName(buyer.name || '');
      setApiEndpoint(buyer.api_endpoint || 'https://api.buyer-network.com/leads/v1/ping-post');
      setPricePerLead(buyer.price_per_lead || 45);
      setPricingModel(buyer.pricing_model || 'flat');
      setMinScore(buyer.min_score || buyer.min_accept_score || 70);
      setIsActive(buyer.is_active ?? buyer.active ?? true);
      setAcceptedBrands(buyer.accepted_brands || ['WindowHound', 'MedTrialMatch']);
    } else {
      setName('');
      setApiEndpoint('https://api.buyer-network.com/leads/v1/ping-post');
      setPricePerLead(45);
      setPricingModel('flat');
      setMinScore(70);
      setIsActive(true);
      setAcceptedBrands(['WindowHound', 'MedTrialMatch']);
    }
  }, [buyer, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: buyer?.id,
      name,
      api_endpoint: apiEndpoint,
      price_per_lead: Number(pricePerLead),
      pricing_model: pricingModel,
      min_score: Number(minScore),
      min_accept_score: Number(minScore),
      is_active: isActive,
      active: isActive,
      accepted_brands: acceptedBrands
    });
    onClose();
  };

  const toggleBrandChip = (bName: string) => {
    if (acceptedBrands.includes(bName)) {
      setAcceptedBrands(acceptedBrands.filter((b) => b !== bName));
    } else {
      setAcceptedBrands([...acceptedBrands, bName]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-foreground font-heading">
              {buyer ? `Edit Buyer Endpoint: ${buyer.name}` : 'Add New Buyer Endpoint'}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              Configure real-time ping/post pricing and delivery rules
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Buyer Company Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apex Home Services LLC"
              className="w-full px-3.5 py-2.5 bg-card border border-border focus:border-blue-500 rounded-xl outline-none font-semibold text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Webhook API Endpoint</label>
            <input
              type="url"
              required
              value={apiEndpoint}
              onChange={(e) => setApiEndpoint(e.target.value)}
              placeholder="https://api.buyer.com/v1/leads"
              className="w-full px-3.5 py-2.5 bg-card border border-border focus:border-blue-500 rounded-xl outline-none font-mono text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Payout Per Lead ($)</label>
              <input
                type="number"
                step="0.5"
                required
                value={pricePerLead}
                onChange={(e) => setPricePerLead(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-card border border-border focus:border-blue-500 rounded-xl outline-none font-bold text-foreground"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Pricing Model</label>
              <select
                value={pricingModel}
                onChange={(e) => setPricingModel(e.target.value as 'flat' | 'tiered' | 'auction')}
                className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl font-semibold text-foreground outline-none focus:border-blue-500"
              >
                <option value="flat">Flat Payout</option>
                <option value="tiered">Tiered Quality</option>
                <option value="auction">Real-time Auction</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Minimum Lead Score Requirement (0-100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-card border border-border rounded-xl font-bold text-foreground outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-2">Accepted Brands</label>
            <div className="flex flex-wrap gap-2">
              {['WindowHound', 'MedTrialMatch', 'ReliefOlogist'].map((bName) => {
                const selected = acceptedBrands.includes(bName);
                return (
                  <button
                    type="button"
                    key={bName}
                    onClick={() => toggleBrandChip(bName)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer ${
                      selected
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 shadow-2xs'
                        : 'bg-secondary border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {selected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                    <span>{bName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
              />
              <span className="text-xs font-bold text-foreground">
                Active &amp; Ready to Accept Delivery Ping
              </span>
            </label>
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs shadow-blue-500/20 transition-all duration-200 flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Buyer</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
