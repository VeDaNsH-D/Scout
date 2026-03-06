import React from 'react';

export default function Signup() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary text-text-primary px-4">
      <div className="w-full max-w-md bg-bg-card border border-border-card rounded-2xl p-8 shadow-xl space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="text-sm text-text-secondary">
            Start automating your outreach in a few clicks.
          </p>
        </div>

        <form className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-text-secondary" htmlFor="name">
              Full name
            </label>
            <input
              id="name"
              type="text"
              className="w-full rounded-lg border border-border-subtle bg-bg-secondary px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="Ada Lovelace"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-text-secondary" htmlFor="email">
              Work email
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-lg border border-border-subtle bg-bg-secondary px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="you@company.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-text-secondary" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-lg border border-border-subtle bg-bg-secondary px-3 py-2 text-sm outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="At least 8 characters"
            />
          </div>

          <button
            type="submit"
            className="w-full mt-2 inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-accent text-text-inverse font-semibold text-sm hover:bg-accent-hover transition"
          >
            Sign up
          </button>
        </form>

        <p className="text-xs text-text-muted text-center">
          By continuing you agree to our Terms and acknowledge our Privacy Policy.
        </p>
      </div>
    </div>
  );
}

