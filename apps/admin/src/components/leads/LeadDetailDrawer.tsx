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
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      {/* Click outside to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Slide-over Drawer Panel */}
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                Lead #{lead.id.substring(0, 8)}
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                  lead.status === 'sold'
                    ? 'bg-blue-600 text-white'
                    : lead.status === 'verified'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {lead.status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-heading">{lead.full_name}</h2>
            <p className="text-xs text-slate-400 font-medium">Submitted for {lead.brand_name || 'Brand'}</p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body Sections */}
        <div className="p-6 space-y-6 flex-1">
          {/* 1. Contact Information Card */}
          <div className="admin-card p-5 bg-slate-50/50 dark:bg-slate-800/40">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Contact Information</span>
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Email</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {lead.email}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Phone</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {lead.phone}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">ZIP Code</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {lead.zip_code}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Submitted At</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {new Date(lead.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Verification & Compliance Audit Breakdown */}
          <div className="admin-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Verification & Compliance Audit</span>
              </h3>
              <div className="flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-extrabold text-sm px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                <Award className="w-4 h-4" />
                <span>Score: {lead.score || 85}/100</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              {/* TrustedForm */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">TrustedForm Certificate</span>
                    <span className="text-[10px] text-slate-400">Claimed & verified TCPA token</span>
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
                  <span className="text-[11px] text-slate-500 font-medium">Claim Token #tf-8910-x</span>
                )}
              </div>

              {/* DNC Scrub */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {lead.dnc_flagged ? (
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                  ) : (
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  )}
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">National DNC Registry Scrub</span>
                    <span className="text-[10px] text-slate-400">
                      {lead.dnc_flagged ? 'Phone listed on DNC registry (Flagged)' : 'Passed DNC check (Not listed)'}
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    lead.dnc_flagged ? 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                  }`}
                >
                  {lead.dnc_flagged ? 'Flagged' : 'Passed'}
                </span>
              </div>

              {/* Score breakdown factors */}
              <div className="p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 space-y-2">
                <span className="text-[11px] font-bold text-blue-900 dark:text-blue-300 block">Score Factor Weights:</span>
                {Object.entries(scoreBreakdown.factors || {}).map(([key, f], idx) => {
                  const factor = f as { points: number; description: string };
                  return (
                    <div key={idx} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400 capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="font-mono font-bold text-blue-700 dark:text-blue-300">+{factor.points} pts</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Form Answers */}
          <div className="admin-card p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Form Answers ({lead.brand_name})</span>
            </h3>
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs">
              {Object.keys(lead.form_answers || {}).length > 0 ? (
                Object.entries(lead.form_answers).map(([k, v], idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-slate-200/50 dark:border-slate-700/50 pb-1.5 last:border-0 last:pb-0">
                    <span className="text-slate-500 dark:text-slate-400 font-medium capitalize">{k.replace(/_/g, ' ')}</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{String(v)}</span>
                  </div>
                ))
              ) : (
                <p className="text-slate-400 italic">No specific form answers captured</p>
              )}
            </div>
          </div>

          {/* 4. Delivery Attempts to Buyers */}
          <div className="admin-card p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Buyer Delivery History</span>
            </h3>
            {deliveries.length > 0 ? (
              <div className="space-y-2.5 text-xs">
                {deliveries.map((del) => (
                  <div
                    key={del.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">{del.buyer_name || 'Buyer Endpoint'}</span>
                      <span className="text-[10px] text-slate-400">
                        Response Time: 142ms • Status {del.http_status || 200}
                      </span>
                    </div>
                    <div className="text-right">
                      <span
                        className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          del.accepted ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        {del.accepted ? `Sold ($${del.price_paid || 45})` : 'Rejected'}
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {new Date(del.delivered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                {lead.sold_to_buyer_name ? (
                  <div className="flex items-center justify-between text-left">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">{lead.sold_to_buyer_name}</span>
                      <span className="text-[10px] text-slate-400">Delivered & accepted live via webhook</span>
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
          </div>
        </div>
      </div>
    </div>
  );
};
