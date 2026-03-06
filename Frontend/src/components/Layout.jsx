import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout({ children }) {
  const location = useLocation();

  const isAuthPage = location.pathname === '/';
  const isWorkflowPage = location.pathname === '/workflows';

  if (isAuthPage) {
    return children;
  }

  // Workflows uses an immersive full-screen canvas with its own internal tooling UI.
  if (isWorkflowPage) {
    return (
      <div className="h-screen w-screen overflow-hidden bg-bg-primary text-text-primary">
        {children}
      </div>
    );
  }

  return (
    <div className="flex h-screen text-text-primary overflow-hidden"
      style={{
        background: `radial-gradient(circle at 20% 30%, rgba(255,140,0,0.18), transparent 50%),
                     radial-gradient(circle at 80% 70%, rgba(0,200,255,0.12), transparent 50%),
                     #050505`,
      }}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="border-b border-white/[0.06] bg-black/30 backdrop-blur-xl px-6 py-3 flex items-center justify-between relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/[0.03] to-transparent pointer-events-none" />
          <div className="flex items-center gap-3 relative z-10">
            <img src="/scout-logo.svg" alt="Scout" className="h-7 w-7 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
            <h1 className="text-xl font-semibold text-gradient-accent">Scout</h1>
          </div>
          <div className="flex items-center gap-3 relative z-10">
            <button className="p-2 hover:bg-white/[0.05] rounded-xl transition-all duration-200 text-white/40 hover:text-white/80">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
