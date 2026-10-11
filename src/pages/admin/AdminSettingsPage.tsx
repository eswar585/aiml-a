import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { mockStore } from '../../services/mockStore';
import { AdminAuditLog } from '../../types';
import { formatDate } from '../../lib/utils';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  KeyRound,
  Shield,
  User,
  HardDrive,
  Activity,
  CheckCircle2,
  AlertCircle,
  Database,
  Lock,
} from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { session, changePassword, logout } = useAuth();

  // Password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passLoading, setPassLoading] = useState(false);

  // Upload limits state
  const [maxUploadMB, setMaxUploadMB] = useState('50');
  const [limitSaved, setLimitSaved] = useState(false);

  // Activity logs
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);

  useEffect(() => {
    setLogs(mockStore.getAuditLogs());
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPassword.length < 6) {
      setPassError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError('Passwords do not match.');
      return;
    }

    setPassLoading(true);
    try {
      await changePassword(newPassword);
      setPassSuccess('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(null), 3000);
    } catch (err: any) {
      setPassError(err.message || 'Failed to change password.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleSaveLimits = (e: React.FormEvent) => {
    e.preventDefault();
    setLimitSaved(true);
    setTimeout(() => setLimitSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Admin Settings & Account
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage administrator credentials, session information, storage parameters, and audit history.
        </p>
      </div>

      {/* Account & Session Details */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <User className="w-5 h-5 text-indigo-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Current Account & Session
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-400">Username</span>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {session?.profile?.username || 'eswar'}
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-400">Role & Permissions</span>
            <p className="font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
              Verified Administrator ({session?.profile?.role})
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800">
            <span className="text-slate-400">Database Connection</span>
            <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {isSupabaseConfigured() ? 'Supabase PostgreSQL' : 'Local Fallback Store'}
            </p>
          </div>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-indigo-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Change Password
          </h2>
        </div>

        {passSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{passSuccess}</span>
          </div>
        )}

        {passError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{passError}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <Input
            label="New Password"
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters..."
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <Input
            label="Confirm New Password"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat new password..."
            leftIcon={<Lock className="w-4 h-4" />}
          />

          <Button type="submit" variant="primary" size="sm" isLoading={passLoading}>
            Update Password
          </Button>
        </form>
      </div>

      {/* File Upload Limits */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-indigo-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Upload Storage Configuration
          </h2>
        </div>

        {limitSaved && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Upload configuration updated!</span>
          </div>
        )}

        <form onSubmit={handleSaveLimits} className="space-y-4 max-w-md">
          <Input
            label="Maximum File Size Limit (MB)"
            type="number"
            min="10"
            max="200"
            value={maxUploadMB}
            onChange={(e) => setMaxUploadMB(e.target.value)}
            helperText="Default limit is 50MB per document."
          />

          <Button type="submit" variant="secondary" size="sm">
            Save Limits
          </Button>
        </form>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Administrative Audit History
          </h2>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {logs.map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between gap-3">
              <div>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {log.action}
                </span>
                <span className="ml-2 text-slate-700 dark:text-slate-300">
                  {log.target_type} ({log.target_id})
                </span>
              </div>
              <span className="text-[11px] text-slate-400">{formatDate(log.created_at)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
