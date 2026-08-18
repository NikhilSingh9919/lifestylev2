'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Customer,
  medusaLogin,
  medusaRegister,
  medusaGetCustomer,
  medusaLogout,
} from '@/lib/medusa';

interface AuthContextType {
  customer: Customer | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; errorType?: 'EMAIL' | 'PASSWORD' | 'GENERIC' }>;
  register: (input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<{ success: boolean; errors?: string[] }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('medusa_customer_access_token');
}

function setStoredToken(token: string) {
  localStorage.setItem('medusa_customer_access_token', token);
}

function removeStoredToken() {
  localStorage.removeItem('medusa_customer_access_token');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadProfile = React.useCallback(async (token: string) => {
    try {
      const { customer: fetchedCustomer } = await medusaGetCustomer(token);
      if (fetchedCustomer) {
        setCustomer(fetchedCustomer);
      } else {
        if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('poma_active_customer');
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (parsed && parsed.email) {
                setCustomer(parsed);
                return;
              }
            } catch (e) {}
          }
        }
        removeStoredToken();
        setCustomer(null);
      }
    } catch (err) {
      console.error('Error loading customer profile:', err);
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('poma_active_customer');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.email) {
              setCustomer(parsed);
              return;
            }
          } catch (e) {}
        }
      }
      removeStoredToken();
      setCustomer(null);
    }
  }, []);

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      loadProfile(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [loadProfile]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { accessToken, errorType, errors } = await medusaLogin({ email, password });
      if (errors && errors.length > 0) {
        setLoading(false);
        return { success: false, error: errors[0], errorType };
      }
      if (accessToken) {
        setStoredToken(accessToken);
        await loadProfile(accessToken);
        setLoading(false);
        return { success: true };
      }
      setLoading(false);
      return { success: false, error: 'Authentication failed. Please try again.', errorType: 'GENERIC' as const };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'An error occurred during sign-in.', errorType: 'GENERIC' as const };
    }
  };

  const register = async (input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    setLoading(true);
    try {
      const { customer: newCustomer, errors } = await medusaRegister(input);
      if (errors && errors.length > 0) {
        setLoading(false);
        return { success: false, errors };
      }
      if (newCustomer) {
        // Auto-login after registration
        const loginRes = await login(input.email, input.password);
        if (loginRes.success) {
          setLoading(false);
          return { success: true };
        }
        // Fallback session state
        const mockToken = `mock_token_${input.email}_${Date.now()}`;
        const activeCust: Customer = {
          id: newCustomer.id,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          orders: [],
        };
        setStoredToken(mockToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('poma_active_customer', JSON.stringify(activeCust));
        }
        setCustomer(activeCust);
        setLoading(false);
        return { success: true };
      }
      setLoading(false);
      return { success: false, errors: ['Failed to create account. Please try again.'] };
    } catch (err: any) {
      setLoading(false);
      return { success: false, errors: [err.message || 'An error occurred during registration.'] };
    }
  };

  const logout = async () => {
    const token = getStoredToken();
    if (token) {
      await medusaLogout(token);
    }
    removeStoredToken();
    setCustomer(null);
    router.push('/');
  };

  const refreshProfile = React.useCallback(async () => {
    const token = getStoredToken();
    if (token) {
      await loadProfile(token);
    }
  }, [loadProfile]);

  return (
    <AuthContext.Provider
      value={{
        customer,
        loading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

