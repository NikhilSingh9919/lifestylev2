'use client';

import React, { useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

function LoginFormContent() {
  const { login, customer, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (customer) {
      router.push(redirect);
    }
  }, [customer, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (!email || !password) {
      setError('Please fill in all fields.');
      setIsSubmitting(false);
      return;
    }

    const res = await login(email, password);
    if (!res.success) {
      setError(res.error || 'Invalid credentials.');
      setIsSubmitting(false);
    } else {
      router.push(redirect);
    }
  };

  return (
    <div className="min-h-[85vh] bg-[#0A0A0A] text-white flex items-center justify-center px-4 relative overflow-hidden font-sans py-16">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-indigo-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[350px] h-[350px] rounded-full bg-violet-900/10 blur-[100px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-[460px] z-10"
      >
        {/* Glassmorphic Container */}
        <div className="bg-[#111111]/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 sm:p-10 shadow-2xl relative">
          
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center justify-center p-3 rounded-full bg-white/5 border border-white/10 mb-4"
            >
              <Lock className="h-6 w-6 text-indigo-400" />
            </motion.div>
            <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-neutral-100 to-neutral-400 bg-clip-text text-transparent">
              Welcome Back
            </h2>
            <p className="text-sm text-neutral-400 mt-2 font-medium">
              Access your premium lifestyle portal
            </p>
          </div>

          {/* Error Alert Box */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-semibold flex items-start gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-neutral-900/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300 font-sans"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Password
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password recovery is managed by Shopify. A reset link would be sent in production.');
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors duration-200"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-900/50 border border-white/10 rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all duration-300 font-sans"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-white text-[#111111] hover:bg-neutral-200 transition-all duration-300 font-bold text-sm select-none disabled:opacity-50 cursor-pointer group shadow-lg shadow-white/5"
            >
              {isSubmitting || loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent"></div>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>

          {/* Register Footer */}
          <div className="mt-8 text-center pt-6 border-t border-white/5 text-sm text-neutral-400">
            Don&apos;t have an account?{' '}
            <Link
              href={`/register?redirect=${encodeURIComponent(redirect)}`}
              className="text-white hover:text-indigo-400 hover:underline font-semibold transition-colors duration-200"
            >
              Create one
            </Link>
          </div>
        </div>

        {/* Test Sandbox Credentials Helper pill */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 backdrop-blur-md text-indigo-300 text-xs flex flex-col gap-1.5"
        >
          <div className="flex items-center gap-1.5 font-bold uppercase text-[10px] tracking-wider text-indigo-400">
            <ShieldCheck className="h-4 w-4" />
            Sandbox Developer Notice
          </div>
          <p className="leading-relaxed">
            The storefront is currently configured in sandbox mode. You can log in using the preloaded sandbox user credentials:
          </p>
          <div className="font-mono bg-black/40 rounded-lg p-2.5 mt-1 border border-white/5 space-y-1 select-all">
            <div><span className="text-indigo-400">Email:</span> test@example.com</div>
            <div><span className="text-indigo-400">Pass:</span> password123</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[85vh] bg-[#0A0A0A] text-white flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
