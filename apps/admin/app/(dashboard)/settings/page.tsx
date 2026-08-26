'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAdmin } from '@/components/admin-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, Lock, User, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAdmin();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updating, setUpdating] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setUpdating(true);
    setMsg(null);

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setMsg({ type: 'error', text: error.message });
      } else {
        setMsg({ type: 'success', text: 'Password updated successfully!' });
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: unknown) {
      const error = err as Error;
      setMsg({ type: 'error', text: error.message || 'Failed to update password.' });
    } finally {
      setUpdating(false);
    }
  };

  const userEmail = (user as { email?: string })?.email || 'ibrahim@risenresults.com';

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="w-7 h-7 text-slate-500" />
          Admin Platform Settings
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage operational security credentials and team permissions.
        </p>
      </div>

      {/* Profile Info */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <User className="w-4.5 h-4.5 text-blue-500" /> Account Identity
          </CardTitle>
          <CardDescription className="text-xs">Logged-in administrator credentials</CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-2 text-xs space-y-2">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500">Administrator Email</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{userEmail}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-slate-500">Role & Access</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">Super Administrator (Owner)</span>
          </div>
        </CardContent>
      </Card>

      {/* Change Password Form */}
      <Card className="p-6">
        <CardHeader className="p-0 pb-4">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Lock className="w-4.5 h-4.5 text-blue-500" /> Security & Password
          </CardTitle>
          <CardDescription className="text-xs">Update your Supabase authentication password</CardDescription>
        </CardHeader>

        <CardContent className="p-0 pt-2">
          {msg && (
            <div
              className={`mb-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
                msg.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-900 text-emerald-300'
                  : 'bg-red-950/60 border-red-900 text-red-300'
              }`}
            >
              {msg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
              <span>{msg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-900 dark:text-white"
              />
            </div>

            <Button type="submit" disabled={updating} className="rounded-xl font-bold">
              {updating ? 'Updating Password...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Staff Management Placeholder */}
      {/* TODO: Multi-user admin staff management coming in future release */}
      <Card className="p-6 border-dashed opacity-60">
        <CardHeader className="p-0 pb-2">
          <CardTitle className="text-sm font-bold text-slate-400">
            Multi-User Staff Management (Coming Soon)
          </CardTitle>
          <CardDescription className="text-xs">
            {/* TODO: Multi-user admin staff management coming in future release */}
            Granular team invite links and role-based permissions (RBAC) will be configured in a future release.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
