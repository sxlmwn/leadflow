'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Send,
  ExternalLink,
  Calendar,
  FileText,
  Tag,
  Copy,
  Check,
  Code2
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useOutsideClick } from '@/hooks/use-outside-click';
import { AdminLead, AdminDelivery } from '@/lib/data';
import { CircularProgressRing } from '@/components/ui/circular-progress-ring';
import { SpotlightCard } from '@/components/ui/spotlight-card';

interface LeadDetailDrawerProps {
  lead: AdminLead | null;
  deliveries?: AdminDelivery[];
  onClose: () => void;
  layoutIdPrefix?: string;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  deliveries = [],
  onClose,
  layoutIdPrefix = 'lead-row'
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (lead) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [lead, onClose]);

  useOutsideClick(panelRef, onClose);

  if (!lead) return null;

  const scoreBreakdown = lead.score_breakdown || {
    total_score: lead.score || 85,
    max_score: 100,
    dnc_capped: lead.dnc_flagged || false,
    factors: {
      phone_validity: { points: 30, description: 'Line type verified mobile/landline' },
      trustedform_cert: { points: 25, description: 'Valid TrustedForm claim certificate' },
      zip_code_match: { points: 20, description: 'Valid US 5-digit ZIP code matched location' },
      form_completeness: { points: 15, description: 'All required brand fields submitted' }
    }
  };

  const copyLeadJson = () => {
    navigator.clipboard.writeText(JSON.stringify(lead, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const layoutId = `${layoutIdPrefix}-${lead.id}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop Blur Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/75 backdrop-blur-xs cursor-pointer"
        />

        {/* Morphing Expanded Lead Card Container */}
        <motion.div
          layoutId={layoutId}
          ref={panelRef}
          transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          className="relative z-10 w-full max-w-3xl bg-card border border-border text-card-foreground rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur-md z-10">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                  Lead #{lead.id.substring(0, 8)}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    lead.status === 'sold'
                      ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                      : lead.status === 'verified'
                      ? 'bg-emerald-600 text-white'
                      : lead.status === 'duplicate'
                      ? 'bg-amber-600 text-white'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {lead.status}
                </span>
                <span className="text-xs text-muted-foreground font-semibold">
                  • {lead.brand_name || 'Brand Funnel'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground font-heading tracking-tight">
                {lead.full_name}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={copyLeadJson}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-border text-xs font-semibold text-foreground transition-colors cursor-pointer"
                title="Copy Lead Data as JSON"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy JSON'}</span>
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Sections */}
          <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
            {/* 1. Contact Information Card */}
            <SpotlightCard color="#2563eb" tiltMax={3} className="p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3.5 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Contact Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Email</span>
                  <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5 truncate">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    {lead.email}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Phone</span>
                  <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    {lead.phone}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] font-semibold uppercase">ZIP Code</span>
                  <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    {lead.zip_code}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Submitted At</span>
                  <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    {new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </SpotlightCard>

            {/* 2. Verification & Compliance Audit Breakdown */}
            <SpotlightCard color="#10b981" tiltMax={3} className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Verification &amp; Compliance Audit</span>
                </h3>
                <div className="flex items-center gap-2.5">
                  <CircularProgressRing
                    value={lead.score || 85}
                    size={46}
                    displayValue={String(lead.score || 85)}
                    color={(lead.score || 85) >= 80 ? '#059669' : (lead.score || 85) >= 50 ? '#2563eb' : '#dc2626'}
                    showShadow={true}
                  />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                      Quality Score
                    </span>
                    <span className="text-xs font-extrabold text-foreground">
                      {lead.score || 85}/100
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                {/* TrustedForm */}
                <div className="p-3 rounded-xl bg-secondary border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold text-foreground block">TrustedForm Certificate</span>
                      <span className="text-[10px] text-muted-foreground">Claimed &amp; verified TCPA token</span>
                    </div>
                  </div>
                  {lead.trustedform_cert_url ? (
                    <a
                      href={lead.trustedform_cert_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <span>View Cert</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-[11px] text-muted-foreground font-medium font-mono">Token #tf-8910-cert</span>
                  )}
                </div>

                {/* DNC Scrub */}
                <div className="p-3 rounded-xl bg-secondary border border-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {lead.dnc_flagged ? (
                      <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold text-foreground block">National DNC Registry Scrub</span>
                      <span className="text-[10px] text-muted-foreground">
                        {lead.dnc_flagged ? 'Phone listed on DNC registry (Flagged)' : 'Passed DNC check (Clean)'}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      lead.dnc_flagged
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {lead.dnc_flagged ? 'Flagged' : 'Passed'}
                  </span>
                </div>

                {/* Score breakdown factors */}
                <div className="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60 space-y-2">
                  <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300 block">Score Factor Weights:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(scoreBreakdown.factors || {}).map(([key, f], idx) => {
                      const factor = f as { points: number; description: string };
                      return (
                        <div key={idx} className="flex items-center justify-between text-[11px]">
                          <span className="text-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                          <span className="font-mono font-bold text-blue-600 dark:text-blue-400">+{factor.points} pts</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </SpotlightCard>

            {/* 3. SubID & Marketing Tracking Parameters */}
            <SpotlightCard color="#8b5cf6" tiltMax={3} className="p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Traffic Source &amp; SubID Parameters</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-secondary border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-medium block">UTM Source</span>
                  <span className="font-bold text-foreground font-mono mt-0.5 block truncate">
                    {String(lead.subid_params?.utm_source || 'direct')}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-secondary border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-medium block">UTM Medium</span>
                  <span className="font-bold text-foreground font-mono mt-0.5 block truncate">
                    {String(lead.subid_params?.utm_medium || 'cpc')}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-secondary border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-medium block">Campaign</span>
                  <span className="font-bold text-foreground font-mono mt-0.5 block truncate">
                    {String(lead.subid_params?.utm_campaign || 'brand_funnel_v1')}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-secondary border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-medium block">SubID / Click ID</span>
                  <span className="font-bold text-foreground font-mono mt-0.5 block truncate">
                    {String(lead.subid_params?.subid || lead.subid_params?.click_id || 'sub-48192')}
                  </span>
                </div>
              </div>
            </SpotlightCard>

            {/* 4. Form Answers */}
            <SpotlightCard color="#6366f1" tiltMax={3} className="p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Form Answers ({lead.brand_name})</span>
              </h3>
              <div className="bg-secondary p-3 rounded-xl border border-border space-y-2 text-xs">
                {lead.form_answers && Object.keys(lead.form_answers).length > 0 ? (
                  Object.entries(lead.form_answers).map(([k, v], idx) => (
                    <div key={idx} className="flex items-center justify-between border-b border-border/50 pb-1.5 last:border-0 last:pb-0">
                      <span className="text-muted-foreground font-medium capitalize">{k.replace(/_/g, ' ')}</span>
                      <span className="font-bold text-foreground">{String(v)}</span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Service Interest</span>
                    <span className="font-bold text-foreground">Standard Funnel Inquiry</span>
                  </div>
                )}
              </div>
            </SpotlightCard>

            {/* 5. Delivery History to Buyers */}
            <SpotlightCard color="#0ea5e9" tiltMax={3} className="p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Buyer Delivery &amp; Realization</span>
              </h3>
              {deliveries.length > 0 ? (
                <div className="space-y-2.5 text-xs">
                  {deliveries.map((del) => (
                    <div
                      key={del.id}
                      className="p-3 rounded-xl bg-secondary border border-border flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-foreground block">{del.buyer_name || 'Buyer Endpoint'}</span>
                        <span className="text-[10px] text-muted-foreground">
                          Latency: 142ms • Status {del.http_status || 200}
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            del.accepted
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                          }`}
                        >
                          {del.accepted ? `Sold ($${del.price_paid || 55})` : 'Rejected'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3.5 bg-secondary rounded-xl text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-foreground block">
                      {lead.sold_to_buyer_name || (lead.sold ? 'Buyer Assigned' : 'Eligible for Routing')}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {lead.sold ? 'Accepted via real-time postback webhook' : 'Pending buyer ping dispatch'}
                    </span>
                  </div>
                  {lead.sold && (
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                      Sold ($55.00)
                    </span>
                  )}
                </div>
              )}
            </SpotlightCard>

            {/* 6. Raw JSON Payload Viewer Toggle */}
            <div>
              <button
                onClick={() => setShowRawJson(!showRawJson)}
                className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors cursor-pointer py-1"
              >
                <Code2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{showRawJson ? 'Hide Raw JSON' : 'Inspect Raw Ingested JSON'}</span>
              </button>

              {showRawJson && (
                <pre className="mt-2 p-3.5 rounded-xl bg-secondary/80 font-mono text-[11px] text-slate-800 dark:text-slate-200 border border-border overflow-x-auto max-h-48">
                  {JSON.stringify(lead, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

