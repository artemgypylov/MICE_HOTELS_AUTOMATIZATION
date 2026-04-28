import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { appwriteAuth, AppwriteUser, getUserRole } from '../services/appwriteAuth';

type AuthContextValue = {
  user: AppwriteUser | null;
  role: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (params: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppwriteUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const account = await appwriteAuth.me();
      setUser(account);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string) => {
    const account = await appwriteAuth.login(email, password);
    setUser(account);
  };

  const register = async (params: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    companyName?: string;
    phone?: string;
  }) => {
    const account = await appwriteAuth.register(params);
    setUser(account);
  };

  const logout = async () => {
    await appwriteAuth.logout();
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(() => {
    const role = getUserRole(user);
    return {
      user,
      role: user ? role : null,
      isAuthenticated: !!user,
      loading,
      login,
      register,
      logout,
      refreshUser,
    };
  }, [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
};
