import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, AdminSession } from '../services/authService';

interface AuthContextType {
  session: AdminSession | null;
  isAdmin: boolean;
  loading: boolean;
  login: (identifier: string, pass: string) => Promise<AdminSession>;
  changePassword: (newPass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    authService.getStoredSession()
      .then((sess) => {
        if (mounted) setSession(sess);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (identifier: string, pass: string): Promise<AdminSession> => {
    setLoading(true);
    try {
      const sess = await authService.login(identifier, pass);
      setSession(sess);
      return sess;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (newPass: string): Promise<void> => {
    await authService.changePassword(newPass);
    if (session) {
      setSession({
        ...session,
        user: { ...session.user, must_change_password: false },
      });
    }
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        isAdmin: Boolean(session?.profile?.role === 'admin'),
        loading,
        login,
        changePassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
