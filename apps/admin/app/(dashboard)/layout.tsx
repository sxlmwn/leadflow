'use client';

import React from 'react';
import { AdminProvider } from '@/components/admin-context';
import { Sidebar } from '@/components/sidebar';
import { Topbar } from '@/components/topbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <div className="flex min-h-screen bg-[#F4F5F9] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />
          <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AdminProvider>
  );
}
