'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  onSearchChange?: (val: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  title = "Dashboard",
  onSearchChange
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('leadflow_admin_theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
      localStorage.setItem('leadflow_admin_theme', 'light');
    } else {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
      localStorage.setItem('leadflow_admin_theme', 'dark');
    }
  };

  return (
    <div className="min-h-screen flex bg-background text-foreground font-sans relative selection:bg-blue-500 selection:text-white transition-colors duration-200">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[100vw] h-[50vh] bg-blue-500/[0.02] dark:hidden blur-[120px] rounded-full" />
      </div>

      {/* Collapsible Left Sidebar */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden relative z-10">
        <TopBar
          title={title}
          onSearchChange={onSearchChange}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6 animate-page-in">
          {children}
        </main>
      </div>
    </div>
  );
};
