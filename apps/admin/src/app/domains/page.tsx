'use client';

import React, { useState } from 'react';
import { Globe, Plus, ShieldCheck, ExternalLink } from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { AddDomainModal } from '@/components/domains/AddDomainModal';
import { AdminDomain, MOCK_DOMAINS } from '@/lib/data';

export default function DomainsPage() {
  const [domains, setDomains] = useState<AdminDomain[]>(MOCK_DOMAINS);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs shadow-blue-500/20 transition-all duration-200 cursor-pointer transform-gpu"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Domain</span>
        </button>
      </div>

      {/* Main Domains Table */}
      <div className="admin-card overflow-hidden transform-gpu">
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
                    <a
                      href={`https://${dom.domain}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline font-semibold transition-colors duration-200"
                    >
                      <span>Visit</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddDomainModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddDomain={handleAddDomain}
      />
    </AdminLayout>
  );
}
