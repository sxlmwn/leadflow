'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'motion/react';
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
import {
  Sidebar as AceternitySidebar,
  SidebarBody,
  SidebarLink,
  useSidebar
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

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
  const [open, setOpen] = React.useState(!collapsed);

  // Sync external collapsed prop with internal open state
  React.useEffect(() => {
    setOpen(!collapsed);
  }, [collapsed]);

  const handleToggle = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setOpen(!open);
    }
  };

  return (
    <AceternitySidebar open={open} setOpen={setOpen} animate={true}>
      <SidebarBody className="justify-between h-full p-0">
        <SidebarContent
          darkMode={darkMode}
          onToggleDarkMode={onToggleDarkMode}
          onToggleCollapse={handleToggle}
          isControlledCollapsed={collapsed}
        />
      </SidebarBody>
    </AceternitySidebar>
  );
};

interface SidebarContentProps {
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  onToggleCollapse?: () => void;
  isControlledCollapsed?: boolean;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  darkMode = false,
  onToggleDarkMode,
  onToggleCollapse,
  isControlledCollapsed = false,
}) => {
  const pathname = usePathname();
  const { open } = useSidebar();

  const navGroups = [
    {
      title: 'MAIN',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Leads', href: '/leads', icon: <Users className="w-4 h-4" /> },
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { label: 'Brands', href: '/brands', icon: <Building2 className="w-4 h-4" /> },
        { label: 'Buyers', href: '/buyers', icon: <Briefcase className="w-4 h-4" /> },
        { label: 'Domains', href: '/domains', icon: <Globe className="w-4 h-4" /> },
      ]
    },
    {
      title: 'AUDIT',
      items: [
        { label: 'Deliveries', href: '/deliveries', icon: <Send className="w-4 h-4" /> },
      ]
    }
  ];

  return (
    <div className="flex flex-col justify-between h-full w-full">
      {/* Top Header & Navigation Links */}
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className={cn("h-16 px-4 border-b border-border flex items-center overflow-hidden", open ? "justify-between" : "justify-center")}>
          <Link href="/dashboard" className="flex items-center gap-3 group overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 font-bold shadow-md shadow-blue-600/25 group-hover:scale-105 transition-transform duration-200">
              <Activity className="w-5 h-5 text-white" />
            </div>

            <motion.div
              animate={{
                display: open ? 'flex' : 'none',
                opacity: open ? 1 : 0,
              }}
              transition={{ duration: 0.18 }}
              className="flex-col truncate"
            >
              <span className="font-bold text-foreground tracking-tight text-base font-heading leading-tight truncate">
                Lead<span className="text-blue-600 dark:text-blue-400">Flow</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground truncate">
                Admin Portal
              </span>
            </motion.div>
          </Link>

          {/* Collapse / Pin Toggle Button */}
          {onToggleCollapse && (
            <motion.button
              animate={{
                display: open ? 'flex' : 'none',
                opacity: open ? 1 : 0,
              }}
              transition={{ duration: 0.15 }}
              onClick={onToggleCollapse}
              className="w-7 h-7 rounded-lg bg-secondary hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-border items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
              title={isControlledCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isControlledCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </motion.button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="p-3 space-y-5 overflow-y-auto max-h-[calc(100vh-190px)]">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <motion.h3
                animate={{
                  display: open ? 'block' : 'none',
                  opacity: open ? 1 : 0,
                }}
                transition={{ duration: 0.15 }}
                className="px-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 whitespace-pre truncate"
              >
                {group.title}
              </motion.h3>

              {group.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));

                return (
                  <SidebarLink
                    key={item.href}
                    link={{
                      label: item.label,
                      href: item.href,
                      icon: item.icon,
                      isActive,
                    }}
                    title={!open ? item.label : undefined}
                  />
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Controls: Theme Toggle & User Info */}
      <div className="p-3 border-t border-border bg-card/60 dark:bg-black/60 space-y-2">
        {onToggleDarkMode && (
          <button
            onClick={onToggleDarkMode}
            className={cn(
              "w-full flex items-center justify-between p-2 rounded-xl bg-card hover:bg-secondary dark:hover:bg-neutral-900 text-foreground border border-border text-xs font-semibold transition-all duration-200 cursor-pointer overflow-hidden",
              !open && "justify-center px-0"
            )}
            title="Toggle Light / Dark Mode"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 flex items-center justify-center shrink-0">
                {darkMode ? (
                  <Moon className="w-4 h-4 text-blue-400 shrink-0" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                )}
              </div>
              <motion.span
                animate={{
                  display: open ? 'inline-block' : 'none',
                  opacity: open ? 1 : 0,
                }}
                transition={{ duration: 0.15 }}
                className="truncate"
              >
                {darkMode ? 'Dark Mode' : 'Light Mode'}
              </motion.span>
            </div>

            <motion.span
              animate={{
                display: open ? 'inline-block' : 'none',
                opacity: open ? 1 : 0,
              }}
              transition={{ duration: 0.15 }}
              className="text-[10px] uppercase font-bold text-muted-foreground px-1.5 py-0.5 bg-secondary rounded border border-border"
            >
              {darkMode ? 'Dark' : 'Light'}
            </motion.span>
          </button>
        )}

        {/* User Card */}
        <div
          className={cn(
            "flex items-center p-1.5 rounded-xl border border-transparent hover:border-border transition-colors",
            open ? "justify-between" : "justify-center"
          )}
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs shrink-0">
              AD
            </div>

            <motion.div
              animate={{
                display: open ? 'flex' : 'none',
                opacity: open ? 1 : 0,
              }}
              transition={{ duration: 0.15 }}
              className="flex-col truncate"
            >
              <span className="text-xs font-semibold text-foreground truncate">Admin User</span>
              <span className="text-[10px] text-muted-foreground truncate">admin@leadflow.io</span>
            </motion.div>
          </div>

          <motion.div
            animate={{
              display: open ? 'flex' : 'none',
              opacity: open ? 1 : 0,
            }}
            transition={{ duration: 0.15 }}
            className="items-center gap-1"
          >
            <Link
              href="/settings"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Settings"
            >
              <Settings className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/login"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
