import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { isSupabaseConfigured } from '../../lib/supabase';
import {
  Shield,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  KeyRound,
  CheckCircle2,
} from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, changePassword } = useAuth();

  const [identifier, setIdentifier] = useState('eswar');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // First-time password reset modal
  const [showPasswordChangeModal, setShowPasswordChangeModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changePassError, setChangePassError] = useState<string | null>(null);
  const [changePassLoading, setChangePassLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/admin/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const sess = await login(identifier, password);
      if (sess.user.must_change_password) {
        setShowPasswordChangeModal(true);
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePassError(null);

    if (newPassword.length < 6) {
      setChangePassError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword === '123098') {
      setChangePassError('New password cannot be the temporary default password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setChangePassError('Passwords do not match.');
      return;
    }

    setChangePassLoading(true);
    try {
      await changePassword(newPassword);
      setShowPasswordChangeModal(false);
      navigate(from, { replace: true });
    } catch (err: any) {
      setChangePassError(err?.message || 'Failed to update password.');
    } finally {
      setChangePassLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        {/* Branding Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 p-[1.5px] mx-auto shadow-xl shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Shield className="w-7 h-7 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            AIML Hub Management
          </h1>
          <p className="text-xs text-slate-400">
            Authorized administrative access for Section A curriculum coordinators.
          </p>
        </div>

        {/* Status notice */}
        {!isSupabaseConfigured() && (
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
            <div>
              <span className="font-semibold">Setup Credentials Active:</span>
              <p className="mt-0.5 text-[11px] text-amber-200/80">
                Username: <code className="bg-amber-950/80 px-1 py-0.5 rounded">eswar</code> • Temporary password: <code className="bg-amber-950/80 px-1 py-0.5 rounded">123098</code>
              </p>
            </div>
          </div>
        )}

        {/* Login Form Box */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Admin Username or Email"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="eswar"
              leftIcon={<User className="w-4 h-4" />}
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  className="w-full rounded-xl border border-slate-750 bg-slate-950 px-3.5 py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={loading}
            >
              Sign In to Console
            </Button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-500">
          AIML Hub Portal &bull; B.Tech AIML (II Year, I Sem, Section A)
        </p>
      </div>

      {/* Required First-Time Password Change Modal */}
      <Modal
        isOpen={showPasswordChangeModal}
        onClose={() => {}}
        title={
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-indigo-400" />
            <span>Update Setup Password</span>
          </div>
        }
        description="For security compliance, please set a personal strong password before proceeding."
        maxWidth="md"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {changePassError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{changePassError}</span>
            </div>
          )}

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

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full"
              isLoading={changePassLoading}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Save New Password & Continue
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
