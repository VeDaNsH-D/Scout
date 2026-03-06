import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-primary px-4">
      <div className="w-full max-w-md bg-bg-card border border-border-card rounded-2xl p-8 shadow-xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-text-secondary">
            Start automating your outreach in a few clicks.
          </p>
        </div>

        {(error || authError) && (
          <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {error || authError}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-secondary" htmlFor="full_name">
              Full name
            </label>
            <input
              id="full_name"
              type="text"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full rounded-lg border border-border-subtle bg-bg-secondary px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="Ada Lovelace"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-text-secondary" htmlFor="company_name">
              Company name
            </label>
            <input
              id="company_name"
              type="text"
              value={formData.company_name}
              onChange={handleChange}
              className="w-full rounded-lg border border-border-subtle bg-bg-secondary px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="Acme Inc."
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-text-secondary" htmlFor="email">
              Work email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-border-subtle bg-bg-secondary px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="you@company.com"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-text-secondary" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-lg border border-border-subtle bg-bg-secondary px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="At least 8 characters"
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-accent text-text-inverse font-semibold text-sm hover:bg-accent-hover transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-subtle" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-bg-card px-2 text-text-muted">or</span>
          </div>
        </div>

        <a
          href="/auth/google"
          className="w-full inline-flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-border-subtle bg-bg-secondary text-text-primary font-medium text-sm hover:bg-bg-card transition"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </a>

        <p className="text-sm text-text-muted text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-accent hover:text-accent-hover font-semibold">
            Sign in
          </Link>
        </p>

        <p className="text-xs text-text-muted text-center">
          By continuing you agree to our Terms and acknowledge our Privacy Policy.
        </p>
      </div>
    </div>
  );
}

