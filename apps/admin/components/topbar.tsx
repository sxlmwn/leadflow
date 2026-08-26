'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useAdmin, DateRangePreset } from './admin-context';
import { Search, Sun, Moon, LogOut, Calendar } from 'lucide-react';
import { Button } from './ui/button';

const routeNames: Record<string, string> = {
  '/dashboard': 'Executive Overview',
  '/leads': 'Lead Database & Audit',
  '/buyers': 'Buyer Partners & Routing',
  '/brands': 'Brands & Form Builder',
  '/verification': 'Verification Logs',
  '/analytics': 'Analytics & Yield',
  '/settings': 'Platform Settings',
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

  const currentTitle = routeNames[pathname] || 'Admin Dashboard';

  return (
    <header className="w-full shrink-0 bg-white/90 dark:bg-slate-900/90 border-b border-slate-200/60 dark:border-slate-800/80 backdrop-blur-md px-6 py-3.5 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4 shadow-xs">
      {/* Left: Breadcrumb / Route Title */}
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
          {currentTitle}
        </h1>
      </div>

      {/* Right Controls: Search, Date Range Filter, Theme Switch, Logout */}
      <div className="flex flex-wrap items-center gap-3 ml-auto">
        {/* Search Input */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search leads, buyers..."
            className="w-52 h-9 pl-9 pr-3 text-xs rounded-full bg-slate-100 dark:bg-slate-800/80 border-none text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all"
          />
        </div>

        {/* Date Range Pills matching reference design */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-full text-xs font-medium border border-slate-200/50 dark:border-slate-700/50">
          <Calendar className="w-3.5 h-3.5 ml-2 mr-1 text-slate-400" />
          {(['today', '7d', '30d', 'all', 'custom'] as DateRangePreset[]).map((preset) => (
            <button
              key={preset}
              onClick={() => setDateRange(preset)}
              className={`px-3 py-1 rounded-full transition-all capitalize text-xs font-semibold ${
                dateRange === preset
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>

        {/* Custom Date Bounds */}
        {dateRange === 'custom' && (
          <div className="flex items-center gap-1.5 text-xs">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="h-8 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs"
            />
            <span className="text-slate-400">-</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="h-8 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs"
            />
          </div>
        )}

        {/* Theme Switcher */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="rounded-full w-9 h-9 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </Button>

        {/* Logout */}
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="rounded-full border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 font-medium text-xs px-3.5"
        >
          <LogOut className="w-3.5 h-3.5 mr-1" />
          <span className="hidden sm:inline">Log out</span>
        </Button>
      </div>
    </header>
  );
}
