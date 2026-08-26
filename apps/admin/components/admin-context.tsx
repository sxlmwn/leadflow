'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export type DateRangePreset = 'today' | '7d' | '30d' | 'all' | 'custom';

export interface DateFilterBounds {
  startDate: Date | null;
  endDate: Date | null;
}

interface AdminContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  dateRange: DateRangePreset;
  setDateRange: (range: DateRangePreset) => void;
  customStartDate: string;
  setCustomStartDate: (date: string) => void;
  customEndDate: string;
  setCustomEndDate: (date: string) => void;
  getDateBounds: () => DateFilterBounds;
  user: unknown;
  logout: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('leadflow_theme') as 'light' | 'dark' | null;
      return savedTheme || 'light';
    }
    return 'light';
  });

  const [dateRange, setDateRange] = useState<DateRangePreset>('30d');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [user, setUser] = useState<unknown>(null);
  const router = useRouter();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('leadflow_theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const getDateBounds = (): DateFilterBounds => {
    const now = new Date();
    if (dateRange === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      return { startDate: start, endDate: null };
    }
    if (dateRange === '7d') {
      const start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { startDate: start, endDate: null };
    }
    if (dateRange === '30d') {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      return { startDate: start, endDate: null };
    }
    if (dateRange === 'custom') {
      const start = customStartDate ? new Date(customStartDate) : null;
      const end = customEndDate ? new Date(customEndDate) : null;
      return { startDate: start, endDate: end };
    }
    return { startDate: null, endDate: null };
  };

  return (
    <AdminContext.Provider
      value={{
        theme,
        toggleTheme,
        dateRange,
        setDateRange,
        customStartDate,
        setCustomStartDate,
        customEndDate,
        setCustomEndDate,
        getDateBounds,
        user,
        logout,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
