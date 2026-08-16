'use client';

import React, { useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function RegisterFormContent() {
  const { register, customer, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (customer) {
      router.push(redirect);
    }
  }, [customer, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setIsSubmitting(true);

    if (!fullName || !email || !password) {
      setErrors(['Please fill in all required fields.']);
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword && confirmPassword) {
      setErrors(['Passwords do not match.']);
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setErrors(['Password must be at least 6 characters long.']);
      setIsSubmitting(false);
      return;
    }

    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || nameParts[0] || '';

    const res = await register({ firstName, lastName, email, password });
    if (!res.success) {
      setErrors(res.errors || ['An error occurred during account creation.']);
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

      {/* Right side - Register Form */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-10 my-auto"
      >
        <div className="w-full max-w-[420px] flex flex-col items-start text-left">
          {/* Header */}
          <div className="w-full text-left mb-4 lg:mb-6">
            <h1 className="text-[24px] sm:text-[28px] lg:text-[32px] font-semibold text-white tracking-tight font-sans leading-tight text-left">
              Sign up with pomalifestyle
            </h1>
          </div>

          {/* Errors Alert Box */}
          {errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full mb-3 p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs font-semibold space-y-1 text-left"
            >
              {errors.map((err, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 flex-shrink-0" />
                  <span>{err}</span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="w-full space-y-[20px] text-left">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5 text-left">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full h-[48px] bg-[#121212] border border-white/10 rounded-xl px-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all font-sans"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5 text-left">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Type your email"
                className="w-full h-[48px] bg-[#121212] border border-white/10 rounded-xl px-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all font-sans"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5 text-left">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-[48px] bg-[#121212] border border-white/10 rounded-xl px-4 pr-11 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all font-sans"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1.5 text-left">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-[48px] bg-[#121212] border border-white/10 rounded-xl px-4 pr-11 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Create Account Button (Homepage style) */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full inline-flex items-center justify-center py-3.5 px-8 rounded-full bg-white text-[#111111] text-sm sm:text-base font-bold hover:bg-neutral-200 transition-colors shadow-lg cursor-pointer font-sans disabled:opacity-50 mt-4"
            >
              {isSubmitting || loading ? 'Creating Account...' : 'Create Your Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-left text-sm text-neutral-400 font-sans w-full">
            Do you have an account?{' '}
            <Link
              href={`/login?redirect=${encodeURIComponent(redirect)}`}
              className="text-blue-400 hover:underline font-semibold transition-colors ml-1"
            >
              Log In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-140px)] bg-black text-white flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    }>
      <RegisterFormContent />
    </Suspense>
  );
}
