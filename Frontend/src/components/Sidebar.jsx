import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ open, onToggle }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [hoveredItem, setHoveredItem] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      label: 'Dashboard', path: '/dashboard',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
      ),
    },
    {
      label: 'Workflow Builder', path: '/workflows',
      icon: (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM9 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M7 10v2a2 2 0 002 2h1m8-4v2a2 2 0 01-2 2h-1" />
        </>
      ),
    },
    {
      label: 'Lead Upload', path: '/leads',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      ),
    },
    {
      label: 'Campaign Monitor', path: '/campaigns',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      ),
    },
    {
      label: 'AI Generator', path: '/ai-generator',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      ),
    },
    {
      label: 'Lead Analyzer', path: '/lead-analyzer',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M10 21h4M12 3a8 8 0 018 8c0 2.5-1.5 4.5-3 6l-1 2H8l-1-2c-1.5-1.5-3-3.5-3-6a8 8 0 018-8z" />
      ),
    },
    {
      label: 'AI Chatbot', path: '/chatbot',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      ),
    },
    {
      label: 'Settings', path: '/settings',
      icon: (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      ),
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div
      className="w-[72px] bg-black/40 backdrop-blur-xl border-r border-white/[0.06] flex flex-col h-screen relative"
    >
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 -left-10 w-40 h-40 bg-orange-500/[0.06] rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-10 w-40 h-40 bg-blue-500/[0.04] rounded-full blur-3xl" />
      </div>

      {/* Logo */}
      <div className="p-4 flex items-center justify-center border-b border-white/[0.06] relative z-10">
        <img src="/scout-logo.svg" alt="Scout" className="h-7 w-7 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto relative z-10">
        {menuItems.map((item) => (
          <div key={item.path} className="relative">
            <Link
              to={item.path}
              onMouseEnter={() => setHoveredItem(item.path)}
              onMouseLeave={() => setHoveredItem(null)}
              className={`flex items-center justify-center w-full p-2.5 rounded-xl transition-all duration-200 relative group
                ${isActive(item.path)
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-400/30 shadow-[0_0_15px_rgba(249,115,22,0.2)]'
                  : 'text-white/40 hover:text-white/80 hover:bg-white/[0.05] border border-transparent'
                }`}
            >
              {isActive(item.path) && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[1px] w-[3px] h-5 bg-orange-400 rounded-r-full shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
              )}
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {item.icon}
              </svg>
            </Link>

            {/* Hover tooltip */}
            {hoveredItem === item.path && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-black/80 backdrop-blur-lg border border-white/10 rounded-lg text-xs text-white whitespace-nowrap z-50 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                {item.label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-black/80" />
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/[0.06] flex flex-col items-center gap-2 relative z-10">
        <ProfileAvatar user={user} size="w-8 h-8" />
        <button
          onClick={handleLogout}
          className="p-2 text-white/30 hover:text-orange-400 hover:bg-orange-500/10 rounded-xl transition-all duration-200"
          title="Logout"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function ProfileAvatar({ user, size = 'w-8 h-8' }) {
  if (user?.profile_picture) {
    return (
      <img
        src={user.profile_picture}
        alt=""
        className={`${size} rounded-full object-cover flex-shrink-0 ring-2 ring-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.15)]`}
        referrerPolicy="no-referrer"
      />
    );
  }

  const initials = (user?.full_name || user?.name || user?.email || '?')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className={`${size} rounded-full bg-orange-500/15 text-orange-400 flex items-center justify-center flex-shrink-0 text-xs font-bold ring-2 ring-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.15)]`}>
      {initials}
    </div>
  );
}
