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
    <header className="h-16 bg-card border-b border-border px-3.5 sm:px-6 flex items-center justify-between sticky top-0 z-20 transition-colors duration-200 gap-2 sm:gap-4">
      {/* Title / Search */}
      <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0 max-w-xl">
        <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight font-heading hidden sm:block shrink-0 truncate">
          {title}
        </h1>

        <div className="relative flex-1 min-w-0 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search leads, brands, buyers..."
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 bg-secondary focus:bg-card border border-border focus:border-foreground rounded-xl text-xs text-foreground outline-none transition-all duration-200 placeholder:text-muted-foreground focus:ring-2 focus:ring-foreground/20 min-h-[38px]"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* Dark Mode Quick Toggle */}
        {onToggleDarkMode && (
          <button
            onClick={onToggleDarkMode}
            className="min-w-[40px] min-h-[40px] p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary border border-border transition-colors cursor-pointer flex items-center justify-center"
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        )}

        {/* Status Indicator */}
        <div className="hidden xl:flex items-center gap-2 text-xs font-medium text-muted-foreground px-2.5 py-1 bg-secondary/80 border border-border rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span className="text-foreground font-semibold">System Operational</span>
        </div>

        {/* Notification Bell */}
        <button
          className="min-w-[40px] min-h-[40px] relative p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary border border-border transition-colors cursor-pointer flex items-center justify-center"
          title="Notifications"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-card"></span>
        </button>

        {/* User Pill */}
        <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-secondary border border-border text-foreground font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
            AD
          </div>
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-bold text-foreground leading-tight">Admin User</span>
            <span className="text-[10px] font-medium text-muted-foreground">Super Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};
