import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, AuthUser } from '../services/auth';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string, companyName?: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const profile = await authService.getProfile(session.user.id);
      if (profile) setUser(profile);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const profile = await authService.getProfile(session.user.id);
          if (profile) {
            if (profile.blocked) {
              await supabase.auth.signOut();
              setUser(null);
            } else {
              setUser(profile);
            }
          }
        }
      } catch {
        // Session invalid
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
      (async () => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await authService.getProfile(session.user.id);
          if (profile && !profile.blocked) {
            setUser(profile);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { user: profile } = await authService.login(email, password);
    setUser(profile);
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    companyName?: string,
    phone?: string
  ) => {
    await authService.register(email, password, {
      first_name: firstName,
      last_name: lastName,
      company_name: companyName,
      phone,
    });
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      const profile = await authService.getProfile(session.user.id);
      if (profile) setUser(profile);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      login,
      register,
      logout,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
