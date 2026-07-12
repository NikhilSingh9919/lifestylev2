'use client';

import React, { useState, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, Mail, User, ArrowRight, Lock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

function RegisterFormContent() {
  const { register, customer, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/account';

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

    if (!firstName || !lastName || !email || !password) {
      setErrors(['Please fill in all fields.']);
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setErrors(['Password must be at least 6 characters long.']);
      setIsSubmitting(false);
      return;
    }

    const res = await register({ firstName, lastName, email, password });
    if (!res.success) {
      setErrors(res.errors || ['An error occurred during account creation.']);
      setIsSubmitting(false);
    } else {
      router.push(redirect);
    }
  };

  return (
    <div className="min-h-[85vh] bg-neutral-50 text-neutral-900 flex items-center justify-center px-4 relative overflow-hidden font-sans py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-[500px] z-10"
      >
        {/* Simple Premium Container (Black card, 12px corners) */}
        <div className="bg-neutral-950 border border-white/10 rounded-xl p-8 sm:p-10 shadow-2xl relative text-white">
          
          {/* Header (Centered Logo & Subtitle) */}
          <div className="flex flex-col items-center mb-8">
            <Image
              src="/logo.svg"
              alt="Poma Lifestyle Logo"
              width={160}
              height={44}
              className="h-[24px] md:h-[30px] w-auto mb-3"
              priority
            />
            <p className="text-sm text-neutral-400 font-medium">
              Join the PomaLifestyle
            </p>
          </div>

          {/* Errors Alert Box */}
          {errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 rounded-xl bg-red-950/20 border border-red-500/20 text-red-400 text-xs font-semibold space-y-1.5"
            >
              {errors.map((err, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                  <span>{err}</span>
                </div>
              ))}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  First Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    className="w-full bg-neutral-900 border border-white/10 rounded-full py-2.5 pl-9 pr-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all duration-300 font-sans"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-500">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    className="w-full bg-neutral-900 border border-white/10 rounded-full py-2.5 pl-9 pr-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all duration-300 font-sans"
                    required
                  />
                </div>
              </div>
            </div>

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
              <label className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">
                Password
              </label>
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
              <p className="text-[10px] text-neutral-400 mt-1.5 leading-normal">
                The password must be at least six characters.
              </p>
            </div>

            {/* Submit Button - Design System Style */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full relative flex items-center justify-center gap-2 py-3.5 px-4 rounded-full bg-white text-neutral-950 hover:bg-neutral-200 transition-all duration-300 font-semibold text-sm select-none disabled:opacity-50 cursor-pointer group shadow-md mt-2"
            >
              {isSubmitting || loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-neutral-950 border-t-transparent"></div>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </button>
          </form>

          {/* Login Footer */}
          <div className="mt-8 text-center pt-6 border-t border-white/10 text-sm text-neutral-400">
            Already have an account?{' '}
            <Link
              href={`/login?redirect=${encodeURIComponent(redirect)}`}
              className="text-white hover:underline font-semibold transition-colors duration-200"
            >
              Sign in
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
      <div className="min-h-[85vh] bg-neutral-50 text-neutral-900 flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-neutral-900 border-t-transparent" />
      </div>
    }>
      <RegisterFormContent />
    </Suspense>
  );
}
