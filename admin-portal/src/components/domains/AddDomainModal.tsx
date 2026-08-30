'use client';

import React, { useState } from 'react';
import { X, Globe, CheckCircle2, ArrowRight, Copy, Check, ShieldCheck, AlertCircle } from 'lucide-react';

import { AdminBrand, MOCK_BRANDS } from '@/lib/data';

interface AddDomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDomain: (domain: string, brandId: string, brandName: string) => void;
  availableBrands?: { id: string; name: string; vertical?: string }[];
}

export const AddDomainModal: React.FC<AddDomainModalProps> = ({
  isOpen,
  onClose,
  onAddDomain,
  availableBrands
}) => {
  const brandList = availableBrands && availableBrands.length > 0
    ? availableBrands
    : MOCK_BRANDS.map((b) => ({ id: b.id, name: b.name, vertical: b.vertical }));

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [domainInput, setDomainInput] = useState('');
  const [selectedBrand, setSelectedBrand] = useState(brandList[0] || { id: 'b1', name: 'WindowHound' });
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setStep(3);
    }, 1500);
  };

  const handleFinish = () => {
    onAddDomain(domainInput, selectedBrand.id, selectedBrand.name);
    onClose();
    setStep(1);
    setDomainInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                Vercel Domain Manager
              </span>
              <span className="text-xs font-semibold text-muted-foreground">Step {step} of 3</span>
            </div>
            <h3 className="text-lg font-bold text-foreground font-heading">
              Connect Custom Funnel Domain
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="px-6 py-3 bg-secondary/60 border-b border-border flex items-center justify-between text-xs font-semibold text-muted-foreground">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}`}>
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
              1
            </span>
            <span>Domain Name</span>
          </div>
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}`}>
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-muted-foreground'
              }`}
            >
              2
            </span>
            <span>DNS Verification</span>
          </div>
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-blue-600 dark:text-blue-400 font-bold' : ''}`}>
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-muted-foreground'
              }`}
            >
              3
            </span>
            <span>SSL Provisioned</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 text-xs">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Domain Name URL
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    placeholder="e.g. quote.windowhound.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-card border border-border focus:border-blue-500 rounded-xl font-mono text-sm outline-none text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Enter apex domain or subdomain to route traffic to a brand funnel.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">
                  Attach Brand Funnel
                </label>
                <select
                  value={selectedBrand.id}
                  onChange={(e) => {
                    const b = brandList.find((item) => item.id === e.target.value);
                    if (b) setSelectedBrand(b);
                  }}
                  className="w-full p-2.5 bg-card border border-border rounded-xl font-semibold text-foreground outline-none focus:border-blue-500"
                >
                  {brandList.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name} {brand.vertical ? `(${brand.vertical})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                disabled={!domainInput.trim()}
                onClick={() => setStep(2)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs shadow-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <span>Continue to DNS Configuration</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Add these DNS records in your domain registrar (GoDaddy, Namecheap, Cloudflare).</span>
              </div>

              {/* Vercel DNS Records Table */}
              <div className="border border-border rounded-xl overflow-hidden font-mono text-[11px]">
                <div className="bg-secondary p-2.5 font-sans font-bold text-foreground border-b border-border flex justify-between">
                  <span>Record 1: CNAME</span>
                  <button
                    onClick={() => handleCopy('cname.vercel-dns.com', 'cname')}
                    className="text-blue-600 dark:text-blue-400 flex items-center gap-1 font-sans text-xs hover:underline cursor-pointer"
                  >
                    {copiedType === 'cname' ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedType === 'cname' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-3 bg-card space-y-1">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Type: CNAME</span>
                    <span>Name: @ / www</span>
                  </div>
                  <div className="text-foreground font-bold">Value: cname.vercel-dns.com</div>
                </div>
              </div>

              <div className="border border-border rounded-xl overflow-hidden font-mono text-[11px]">
                <div className="bg-secondary p-2.5 font-sans font-bold text-foreground border-b border-border flex justify-between">
                  <span>Record 2: A Record (Apex)</span>
                  <button
                    onClick={() => handleCopy('76.76.21.21', 'arecord')}
                    className="text-blue-600 dark:text-blue-400 flex items-center gap-1 font-sans text-xs hover:underline cursor-pointer"
                  >
                    {copiedType === 'arecord' ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedType === 'arecord' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-3 bg-card space-y-1">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Type: A</span>
                    <span>Name: @</span>
                  </div>
                  <div className="text-foreground font-bold">Value: 76.76.21.21</div>
                </div>
              </div>

              <button
                type="button"
                disabled={verifying}
                onClick={handleVerify}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {verifying ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying DNS propagation via Vercel API...</span>
                  </span>
                ) : (
                  <>
                    <span>Verify DNS Records Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-6 space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-2xs border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-bold text-foreground font-heading">
                  Domain Successfully Connected!
                </h4>
                <p className="text-xs text-muted-foreground font-mono mt-1">
                  {domainInput || 'quote.windowhound.com'} → {selectedBrand.name}
                </p>
              </div>

              <div className="p-3 bg-secondary rounded-xl border border-border text-xs text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Let&apos;s Encrypt SSL certificate automatically issued &amp; active</span>
              </div>

              <button
                type="button"
                onClick={handleFinish}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all duration-200 cursor-pointer mt-4"
              >
                Return to Domains Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
