'use client';

import React, { useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
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
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (customer) {
      router.push(redirect);
    }
  }, [customer, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setPasswordError(null);
    setIsSubmitting(true);

    let hasValidationError = false;
    if (!email) {
      setEmailError('email does not exist.');
      hasValidationError = true;
    }
    if (!password) {
      setPasswordError('password is wrong.');
      hasValidationError = true;
    }

    if (hasValidationError) {
      setIsSubmitting(false);
      return;
    }

    const res = await login(email, password);
    if (!res.success) {
      if (res.errorType === 'EMAIL' || res.error?.toLowerCase().includes('email') || res.error?.toLowerCase().includes('exist')) {
        setEmailError('email does not exist.');
      } else {
        setPasswordError('password is wrong.');
      }
      setIsSubmitting(false);
    } else {
      window.location.href = redirect;
    }
  };

  return (
    <div className="w-full flex-grow min-h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] bg-black text-white flex flex-col lg:flex-row items-center justify-between p-4 lg:p-6 font-sans overflow-hidden">
      {/* Left side - Rounded Hero Image Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full lg:w-1/2 h-[320px] lg:h-full rounded-[24px] lg:rounded-[32px] overflow-hidden bg-neutral-900 border border-white/10 flex-shrink-0"
      >
        <Image
          src="/Banner - pomafloss - Black & White Hero Banner.webp"
          alt="Poma Lifestyle Hero"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Ambient Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
      </motion.div>

      {/* Right side - Login Form */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 xl:p-16 my-auto"
      >
        <div className="w-full max-w-[420px] flex flex-col items-start text-left">
          {/* Header */}
          <div className="w-full text-left mb-6 lg:mb-8">
            <h1 className="text-[24px] sm:text-[28px] lg:text-[32px] font-semibold text-white tracking-tight font-sans leading-tight text-left">
              Login with pomalifestyle
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-[20px] text-left">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5 text-left">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                placeholder="Type your email"
                className={`w-full h-[48px] bg-[#121212] border ${emailError ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-white focus:ring-white'} rounded-xl px-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 transition-all font-sans`}
              />
              {emailError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 font-medium mt-1.5 text-left flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  <span>{emailError}</span>
                </motion.p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-medium text-neutral-300">
                  Password
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password recovery is managed by Medusa. A reset link would be sent in production.');
                  }}
                  className="text-xs text-neutral-400 hover:text-white transition-colors font-medium"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                  placeholder="••••••••"
                  className={`w-full h-[48px] bg-[#121212] border ${passwordError ? 'border-red-500/80 focus:border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-white focus:ring-white'} rounded-xl px-4 pr-11 text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-1 transition-all font-sans`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {passwordError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-xs text-red-400 font-medium mt-1.5 text-left flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                  <span>{passwordError}</span>
                </motion.p>
              )}
            </div>

            {/* Login Button (Homepage style) */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full inline-flex items-center justify-center py-3.5 px-8 rounded-full bg-white text-[#111111] text-sm sm:text-base font-bold hover:bg-neutral-200 transition-colors shadow-lg cursor-pointer font-sans disabled:opacity-50 mt-6"
            >
              {isSubmitting || loading ? 'Logging In...' : 'Log In'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-left text-sm text-neutral-400 font-sans w-full">
            Don&apos;t have an account?{' '}
            <Link
              href={`/register?redirect=${encodeURIComponent(redirect)}`}
              className="text-blue-400 hover:underline font-semibold transition-colors ml-1"
            >
              Sign Up
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
      <div className="min-h-[calc(100vh-140px)] bg-black text-white flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    }>
      <LoginFormContent />
    </Suspense>
  );
}
