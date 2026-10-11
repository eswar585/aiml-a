import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Profile } from '../types';
import { mockStore } from './mockStore';

export interface AdminSession {
  user: {
    id: string;
    email: string;
    username: string;
    must_change_password?: boolean;
  };
  profile: Profile;
}

const LOCAL_ADMIN_KEY = 'aiml_hub_local_admin';
const LOCAL_ADMIN_PASS_KEY = 'aiml_hub_admin_password';

export const authService = {
  async getStoredSession(): Promise<AdminSession | null> {
    if (!isSupabaseConfigured()) {
      const stored = sessionStorage.getItem(LOCAL_ADMIN_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
      return null;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return null;

      // Verify admin profile in profiles table
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || !profile || profile.role !== 'admin') {
        await supabase.auth.signOut();
        return null;
      }

      return {
        user: {
          id: session.user.id,
          email: session.user.email || '',
          username: profile.username || 'eswar',
          must_change_password: Boolean(session.user.user_metadata?.must_change_password),
        },
        profile,
      };
    } catch {
      return null;
    }
  },

  async login(identifier: string, password: string): Promise<AdminSession> {
    const trimmedId = identifier.trim().toLowerCase();
    const trimmedPass = password.trim();

    if (!trimmedId || !trimmedPass) {
      throw new Error('Please enter both username/email and password.');
    }

    if (!isSupabaseConfigured()) {
      // Local fallback mode for testing
      const currentPassword = localStorage.getItem(LOCAL_ADMIN_PASS_KEY) || '123098';
      const isUsernameMatch = trimmedId === 'eswar' || trimmedId === 'eswar@aimlhub.internal' || trimmedId === 'admin';

      if (!isUsernameMatch) {
        throw new Error('Invalid credentials. Initial admin username is "eswar".');
      }

      if (trimmedPass !== currentPassword) {
        throw new Error('Incorrect password. (Initial setup password is "123098").');
      }

      const sessionData: AdminSession = {
        user: {
          id: 'admin-eswar-local',
          email: 'eswar@aimlhub.internal',
          username: 'eswar',
          must_change_password: currentPassword === '123098',
        },
        profile: {
          id: 'admin-eswar-local',
          username: 'eswar',
          display_name: 'Eswar (Administrator)',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };

      sessionStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(sessionData));
      mockStore.addAuditLog('ADMIN_LOGIN', 'auth', 'admin-eswar-local', { mode: 'offline_mock' });
      return sessionData;
    }

    // Live Supabase Auth
    let loginEmail = trimmedId;

    if (!trimmedId.includes('@')) {
      // Try resolving via RPC function
      try {
        const { data: resolvedEmail } = await supabase.rpc('get_auth_email_by_username', {
          p_username: trimmedId,
        });
        if (resolvedEmail) {
          loginEmail = resolvedEmail;
        } else {
          loginEmail = `${trimmedId}@aimlhub.internal`;
        }
      } catch {
        loginEmail = `${trimmedId}@aimlhub.internal`;
      }
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: trimmedPass,
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Invalid username or password.');
    }

    // Verify admin role in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      await supabase.auth.signOut();
      throw new Error('Access denied. Administrator privileges required.');
    }

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email || loginEmail,
        username: profile.username || trimmedId,
        must_change_password: Boolean(authData.user.user_metadata?.must_change_password),
      },
      profile,
    };
  },

  async changePassword(newPassword: string): Promise<void> {
    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    if (!isSupabaseConfigured()) {
      localStorage.setItem(LOCAL_ADMIN_PASS_KEY, newPassword);
      const stored = sessionStorage.getItem(LOCAL_ADMIN_KEY);
      if (stored) {
        const parsed: AdminSession = JSON.parse(stored);
        parsed.user.must_change_password = false;
        sessionStorage.setItem(LOCAL_ADMIN_KEY, JSON.stringify(parsed));
      }
      mockStore.addAuditLog('PASSWORD_CHANGED', 'auth', 'admin-eswar-local');
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
      data: { must_change_password: false },
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  async logout(): Promise<void> {
    if (!isSupabaseConfigured()) {
      sessionStorage.removeItem(LOCAL_ADMIN_KEY);
      return;
    }
    await supabase.auth.signOut();
  },
};
