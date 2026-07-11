'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Customer,
  shopifyLogin,
  shopifyRegister,
  shopifyGetCustomer,
  shopifyLogout,
} from '@/lib/shopify';

interface AuthContextType {
  customer: Customer | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadProfile = async (token: string) => {
    try {
      const { customer: fetchedCustomer, errors } = await shopifyGetCustomer(token);
      if (errors || !fetchedCustomer) {
        localStorage.removeItem('shopify_customer_access_token');
        setCustomer(null);
      } else {
        setCustomer(fetchedCustomer);
      }
    } catch (err) {
      console.error('Error loading Shopify customer profile:', err);
      localStorage.removeItem('shopify_customer_access_token');
      setCustomer(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('shopify_customer_access_token');
    if (token) {
      loadProfile(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { accessToken, errors } = await shopifyLogin({ email, password });
      if (errors && errors.length > 0) {
        setLoading(false);
        return { success: false, error: errors[0] };
      }
      if (accessToken) {
        localStorage.setItem('shopify_customer_access_token', accessToken);
        await loadProfile(accessToken);
        setLoading(false);
        return { success: true };
      }
      setLoading(false);
      return { success: false, error: 'Authentication failed. Please try again.' };
    } catch (err: any) {
      setLoading(false);
      return { success: false, error: err.message || 'An error occurred during sign-in.' };
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
      const { customer: newCustomer, errors } = await shopifyRegister(input);
      if (errors && errors.length > 0) {
        setLoading(false);
        return { success: false, errors };
      }
      if (newCustomer) {
        // Auto-login after registration
        const loginRes = await login(input.email, input.password);
        setLoading(false);
        return { success: loginRes.success, errors: loginRes.error ? [loginRes.error] : [] };
      }
      setLoading(false);
      return { success: false, errors: ['Failed to create account. Please try again.'] };
    } catch (err: any) {
      setLoading(false);
      return { success: false, errors: [err.message || 'An error occurred during registration.'] };
    }
  };

  const logout = async () => {
    const token = localStorage.getItem('shopify_customer_access_token');
    if (token) {
      await shopifyLogout(token);
    }
    localStorage.removeItem('shopify_customer_access_token');
    setCustomer(null);
    router.push('/');
  };

  const refreshProfile = async () => {
    const token = localStorage.getItem('shopify_customer_access_token');
    if (token) {
      await loadProfile(token);
    }
  };

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
