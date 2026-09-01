'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Building2,
  Briefcase,
  Globe,
  Send,
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  Activity,
  Sun,
  Moon
} from 'lucide-react';

interface SidebarProps {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed = false,
  onToggleCollapse,
  darkMode = false,
  onToggleDarkMode
}) => {
  const pathname = usePathname();

  const navGroups = [
    {
      title: 'MAIN',
      items: [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Leads', href: '/leads', icon: Users },
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { name: 'Brands', href: '/brands', icon: Building2 },
        { name: 'Buyers', href: '/buyers', icon: Briefcase },
        { name: 'Domains', href: '/domains', icon: Globe },
      ]
    },
    {
      title: 'AUDIT',
      items: [
        { name: 'Deliveries', href: '/deliveries', icon: Send },
      ]
    }
  ];

  return (
    <aside
      className={`bg-card border-r border-border flex flex-col justify-between transition-all duration-200 ease-in-out shrink-0 select-none z-30 transform-gpu ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div>
        <div className="h-16 px-5 border-b border-border flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 font-bold shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform duration-200 transform-gpu">
              <Activity className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-foreground tracking-tight text-base font-heading leading-tight">
                  Lead<span className="text-blue-600 dark:text-blue-400">Flow</span>
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Admin Portal
                </span>
              </div>
            )}
          </Link>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="w-7 h-7 rounded-lg bg-secondary hover:bg-slate-200 dark:hover:bg-neutral-800 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer transform-gpu"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="p-3 space-y-6 overflow-y-auto max-h-[calc(100vh-190px)]">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              {!collapsed && (
                <h3 className="px-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  {group.title}
                </h3>
              )}
              {group.items.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.name : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 transform-gpu group ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold border border-blue-100 dark:border-blue-900/50 shadow-2xs'
                        : 'text-muted-foreground hover:bg-secondary dark:hover:bg-neutral-900 hover:text-foreground border border-transparent'
                    } ${collapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-colors duration-200 ${
                        isActive ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground group-hover:text-foreground'
                      }`}
                    />
                    {!collapsed && <span className="truncate">{item.name}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Sidebar Bottom: Light/Dark Switcher + User Profile */}
      <div className="p-3 border-t border-border bg-card/50 dark:bg-black/50 space-y-2">
        {onToggleDarkMode && (
          <button
            onClick={onToggleDarkMode}
            className={`w-full flex items-center justify-between p-2 rounded-xl bg-card hover:bg-secondary dark:hover:bg-neutral-900 text-foreground border border-border text-xs font-semibold transition-all duration-200 cursor-pointer ${
              collapsed ? 'justify-center' : ''
            }`}
            title="Toggle Light / Dark Mode"
          >
            <div className="flex items-center gap-2">
              {darkMode ? (
                <Moon className="w-4 h-4 text-blue-400" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              {!collapsed && <span>{darkMode ? 'Dark Mode' : 'Light Mode'}</span>}
            </div>
            {!collapsed && (
              <span className="text-[10px] uppercase font-bold text-muted-foreground px-1.5 py-0.5 bg-secondary rounded border border-border">
                {darkMode ? 'Dark' : 'Light'}
              </span>
            )}
          </button>
        )}

        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between px-1 py-1'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
              AD
            </div>
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="text-xs font-semibold text-foreground truncate">Admin User</span>
                <span className="text-[10px] text-muted-foreground truncate">admin@leadflow.io</span>
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="flex items-center gap-1">
              <Link
                href="/settings"
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
