import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { GOOGLE_AUTH_URL } from '../config/api';
import logo from '../assets/logo.svg';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Signup() {
  const navigate = useNavigate();
  const { register, error: authError } = useAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    company_name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.full_name.trim() || !formData.company_name.trim() || !formData.email.trim() || !formData.password) {
      setError('Full name, company name, email, and password are required');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center text-white overflow-hidden"
      style={{ background: '#050505' }}
    >
      {/* Ambient glow orbs — matches landing page */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-[30%] -left-[15%] h-[700px] w-[700px] rounded-full bg-[#ff7a18] opacity-[0.045] blur-[140px]" />
        <div className="absolute -bottom-[25%] -right-[10%] h-[600px] w-[600px] rounded-full bg-[#a855f7] opacity-[0.04] blur-[130px]" />
        <div className="absolute top-[20%] right-[5%] h-[400px] w-[400px] rounded-full bg-[#4cc9f0] opacity-[0.025] blur-[120px]" />
      </div>

      {/* Back to home */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Home
      </Link>

      {/* Card */}
      <motion.div
        initial="hidden"
        animate="visible"
        className="relative z-10 w-full max-w-md mx-4 my-12"
      >
        {/* Logo + brand */}
        <motion.div variants={fadeUp} custom={0} className="mb-8 flex flex-col items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={logo} alt="Scout" className="h-8 w-8 object-contain" />
            <span className="text-xl font-semibold tracking-tight text-white">Scout</span>
          </Link>
        </motion.div>

        <motion.div
          variants={fadeUp}
          custom={1}
          className="rounded-3xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-8 md:p-10 shadow-[0_14px_32px_rgba(0,0,0,0.28)]"
        >
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-semibold tracking-[-0.02em] bg-gradient-to-b from-white to-[#a1a1aa] bg-clip-text text-transparent">
              Create your account
            </h1>
            <p className="mt-2 text-sm text-white/50">
              Start automating your outreach in a few clicks.
            </p>
          </div>

          {(error || authError) && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
            >
              {error || authError}
            </motion.div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-[0.12em] text-white/40" htmlFor="full_name">
                  Full name
                </label>
                <input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-[#ff7a18]/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-[#ff7a18]/30"
                  placeholder="Ada Lovelace"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium uppercase tracking-[0.12em] text-white/40" htmlFor="company_name">
                  Company
                </label>
                <input
                  id="company_name"
                  type="text"
                  value={formData.company_name}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-[#ff7a18]/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-[#ff7a18]/30"
                  placeholder="Acme Inc."
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-[0.12em] text-white/40" htmlFor="email">
                Work email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-[#ff7a18]/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-[#ff7a18]/30"
                placeholder="you@company.com"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium uppercase tracking-[0.12em] text-white/40" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-all focus:border-[#ff7a18]/50 focus:bg-white/[0.06] focus:ring-1 focus:ring-[#ff7a18]/30"
                placeholder="At least 8 characters"
                required
                minLength={8}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 rounded-xl bg-gradient-to-r from-[#ff7a18] to-[#ffc371] px-5 py-3 text-sm font-semibold text-[#1a1208] shadow-[0_0_24px_rgba(255,122,24,0.35)] transition-all hover:shadow-[0_0_36px_rgba(255,122,24,0.5)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[0_0_24px_rgba(255,122,24,0.35)] disabled:hover:scale-100"
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#0d0d0d] px-3 text-xs text-white/30">or</span>
            </div>
          </div>

          {/* Google OAuth */}
          <a
            href={GOOGLE_AUTH_URL}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.1] bg-white/[0.04] px-5 py-3 text-sm font-medium text-white transition-all hover:bg-white/[0.08] hover:border-white/[0.15]"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </a>

          <p className="mt-6 text-center text-sm text-white/40">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#ffc371] transition-colors hover:text-[#ff7a18]">
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center text-[11px] text-white/25">
            By continuing you agree to our Terms and acknowledge our Privacy Policy.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

