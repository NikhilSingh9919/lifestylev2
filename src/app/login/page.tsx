'use client';

import React, { useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

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
      window.location.href = redirect;
    }
  };

  return (
    <div className="min-h-[85vh] bg-neutral-50 text-neutral-900 flex items-center justify-center px-4 relative overflow-hidden font-sans py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-[460px] z-10"
      >
        {/* Simple Premium Container (Black card, 12px corners) */}
        <div className="bg-neutral-950 border border-white/10 rounded-xl p-8 sm:p-10 shadow-2xl relative text-white">
          
          {/* Header (Centered Logo) */}
          <div className="flex justify-center mb-8">
            <Image
              src="/logo.svg"
              alt="Poma Lifestyle Logo"
              width={160}
              height={44}
              className="h-[24px] md:h-[30px] w-auto"
              priority
            />
          </div>

          {/* Error Alert Box */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-semibold flex items-start gap-2"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
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
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-neutral-900 border border-white/10 rounded-full py-3.5 pl-11 pr-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all duration-300 font-sans"
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
                    alert('Password recovery is managed by Medusa. A reset link would be sent in production.');
                  }}
                  className="text-xs text-neutral-400 hover:text-white transition-colors duration-200 font-medium"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-neutral-900 border border-white/10 rounded-full py-3.5 pl-11 pr-11 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all duration-300 font-sans"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-500 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Login Button - Design System Style */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full relative flex items-center justify-center gap-2 py-3.5 px-4 rounded-full bg-white text-neutral-950 hover:bg-neutral-200 transition-all duration-300 font-semibold text-sm select-none disabled:opacity-50 cursor-pointer group shadow-md"
            >
              {isSubmitting || loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-950 border-t-transparent"></div>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>

          {/* Register Footer */}
          <div className="mt-8 text-center pt-6 border-t border-white/10 text-sm text-neutral-400">
            Don&apos;t have an account?{' '}
            <Link
              href={`/register?redirect=${encodeURIComponent(redirect)}`}
              className="text-white hover:underline font-semibold transition-colors duration-200"
            >
              Create one
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[85vh] bg-neutral-50 text-neutral-900 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-900 border-t-transparent" />
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
