'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAdmin, DateRangePreset } from './admin-context';
import { Search, Sun, Moon, LogOut, Calendar } from 'lucide-react';
import { Button } from './ui/button';

const routeNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/leads': 'Leads Overview',
  '/buyers': 'Buyer Management',
  '/brands': 'Brands & Form Builder',
  '/verification': 'Verification Audit Logs',
  '/analytics': 'Analytics & Performance',
  '/settings': 'Admin Settings',
};

export function Topbar() {
  const pathname = usePathname();
  const {
    theme,
    toggleTheme,
    dateRange,
    setDateRange,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    logout,
  } = useAdmin();

  const currentTitle = routeNames[pathname] || 'Admin';

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 px-6 flex items-center justify-between">
      {/* Left: Breadcrumbs & Page Title */}
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        <span className="font-semibold text-slate-800 dark:text-slate-100">{currentTitle}</span>
      </div>

      {/* Right Controls: Search, Date Filter, Theme Toggle, User Profile */}
      <div className="flex items-center gap-3">
        {/* Global Search Input (Placeholder for global search feature) */}
        {/* TODO: global search functionality coming in future release */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads, buyers..."
            className="w-56 h-9 pl-9 pr-3 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            onChange={() => {
              // TODO: Wire global search handler
            }}
          />
        </div>

        {/* Global Date Range Picker Component */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-medium border border-slate-200 dark:border-slate-700/60">
          <Calendar className="w-3.5 h-3.5 ml-1.5 text-slate-400" />
          {(['today', '7d', '30d', 'all', 'custom'] as DateRangePreset[]).map((preset) => (
            <button
              key={preset}
              onClick={() => setDateRange(preset)}
              className={`px-2.5 py-1 rounded-lg transition-all capitalize ${
                dateRange === preset
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Custom Date Inputs if 'custom' is selected */}
        {dateRange === 'custom' && (
          <div className="flex items-center gap-1 text-xs">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="h-8 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="h-8 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs"
            />
          </div>
        )}

        {/* Theme Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="rounded-xl"
        >
          {theme === 'dark' ? (
            <Sun className="w-4.5 h-4.5 text-amber-400" />
          ) : (
            <Moon className="w-4.5 h-4.5 text-slate-700" />
          )}
        </Button>

        {/* User Signout Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Log out</span>
        </Button>
      </div>
    </header>
  );
}
