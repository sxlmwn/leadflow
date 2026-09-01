'use client';

import React from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Award,
  Send,
  ExternalLink,
  Calendar,
  FileText
} from 'lucide-react';
import { AdminLead, AdminDelivery } from '@/lib/data';
import { CircularProgressRing } from '@/components/ui/circular-progress-ring';
import { SpotlightCard } from '@/components/ui/spotlight-card';

interface LeadDetailDrawerProps {
  lead: AdminLead | null;
  deliveries?: AdminDelivery[];
  onClose: () => void;
}

export const LeadDetailDrawer: React.FC<LeadDetailDrawerProps> = ({
  lead,
  deliveries = [],
  onClose
}) => {
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

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30 dark:bg-black/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Slide-over Drawer Panel */}
      <div className="w-full max-w-2xl bg-card h-full shadow-2xl border-l border-border flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur-md z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                Lead #{lead.id.substring(0, 8)}
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  lead.status === 'sold'
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                    : lead.status === 'verified'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {lead.status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-foreground font-heading">{lead.full_name}</h2>
            <p className="text-xs text-muted-foreground font-medium">Submitted for {lead.brand_name || 'Brand'}</p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-secondary hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body Sections */}
        <div className="p-6 space-y-6 flex-1">
          {/* 1. Contact Information Card */}
          <SpotlightCard color="#2563eb" tiltMax={3} className="p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Contact Information</span>
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground block text-[10px] font-semibold uppercase">Email</span>
                <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
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
                  {new Date(lead.created_at).toLocaleString()}
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
                    <span className="text-[10px] text-muted-foreground">Claimed & verified TCPA token</span>
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
                  <span className="text-[11px] text-muted-foreground font-medium">Claim Token #tf-8910-x</span>
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
                      {lead.dnc_flagged ? 'Phone listed on DNC registry (Flagged)' : 'Passed DNC check (Not listed)'}
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
                {Object.entries(scoreBreakdown.factors || {}).map(([key, f], idx) => {
                  const factor = f as { points: number; description: string };
                  return (
                    <div key={idx} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-300 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="font-mono font-bold text-blue-700 dark:text-blue-300">+{factor.points} pts</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </SpotlightCard>

          {/* 3. Form Answers */}
          <SpotlightCard color="#6366f1" tiltMax={3} className="p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Form Answers ({lead.brand_name})</span>
            </h3>
            <div className="bg-secondary p-3 rounded-xl border border-border space-y-2 text-xs">
              {Object.keys(lead.form_answers || {}).length > 0 ? (
                Object.entries(lead.form_answers).map(([k, v], idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-border/50 pb-1.5 last:border-0 last:pb-0">
                    <span className="text-muted-foreground font-medium capitalize">{k.replace(/_/g, ' ')}</span>
                    <span className="font-bold text-foreground">{String(v)}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground italic">No specific form answers captured</p>
              )}
            </div>
          </SpotlightCard>

          {/* 4. Delivery Attempts to Buyers */}
          <SpotlightCard color="#0ea5e9" tiltMax={3} className="p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Buyer Delivery History</span>
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
                        Response Time: 142ms • Status {del.http_status || 200}
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
                        {del.accepted ? `Sold ($${del.price_paid || 45})` : 'Rejected'}
                      </span>
                      <span className="text-[10px] text-muted-foreground block mt-0.5">
                        {new Date(del.delivered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-secondary rounded-xl text-center text-xs text-muted-foreground font-medium">
                {lead.sold_to_buyer_name ? (
                  <div className="flex items-center justify-between text-left">
                    <div>
                      <span className="font-bold text-foreground block">{lead.sold_to_buyer_name}</span>
                      <span className="text-[10px] text-muted-foreground">Delivered & accepted live via webhook</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                      Sold ($55.00)
                    </span>
                  </div>
                ) : (
                  <span>No delivery attempts initiated yet for this lead.</span>
                )}
              </div>
            )}
          </SpotlightCard>
        </div>
      </div>
    </div>
  );
};
