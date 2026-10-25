import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserProfile } from '../types';
import { api } from '../api';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string, lang?: string) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('lunelle_auth_token');
    if (token) {
      api.getMe()
        .then(res => {
          setUser(res.user);
          setProfile(res.profile);
        })
        .catch(() => {
          localStorage.removeItem('lunelle_auth_token');
          setUser(null);
          setProfile(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    localStorage.setItem('lunelle_auth_token', res.token);
    setUser(res.user);
    setProfile(res.profile);
  };

  const register = async (email: string, password: string, name?: string, lang?: string) => {
    const res = await api.register({ email, password, preferred_name: name, preferred_language: lang });
    localStorage.setItem('lunelle_auth_token', res.token);
    setUser(res.user);
    setProfile(res.profile);
  };

  const logout = () => {
    localStorage.removeItem('lunelle_auth_token');
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    const res = await api.updateProfile(updates);
    if (res.success && res.profile) {
      setProfile(res.profile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
