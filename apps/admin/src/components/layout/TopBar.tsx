'use client';

import React from 'react';
import { Search, Bell, Sun, Moon } from 'lucide-react';

interface TopBarProps {
  title?: string;
  onSearchChange?: (val: string) => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  title = "Dashboard",
  onSearchChange,
  darkMode = false,
  onToggleDarkMode
}) => {
  return (
    <header className="h-16 bg-white dark:bg-zinc-900 border-b border-slate-200/80 dark:border-zinc-800 px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Title / Search */}
      <div className="flex items-center gap-6 flex-1 max-w-xl">
        <h1 className="text-xl font-bold text-slate-900 dark:text-zinc-100 tracking-tight font-heading hidden sm:block shrink-0">
          {title}
        </h1>

        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search leads, brands, buyers, domains..."
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-zinc-800 focus:bg-white dark:focus:bg-zinc-900 border border-slate-200 dark:border-zinc-700 focus:border-blue-500 rounded-xl text-xs text-slate-800 dark:text-zinc-100 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Dark Mode Quick Toggle */}
        {onToggleDarkMode && (
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>
        )}

        {/* Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 rounded-full border border-emerald-200/60 dark:border-emerald-900/60 text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>System Healthy</span>
        </div>

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-xl text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-zinc-900"></span>
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-zinc-800">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
            AD
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 leading-tight">Admin User</span>
            <span className="text-[10px] font-medium text-slate-400 dark:text-zinc-500">Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};
