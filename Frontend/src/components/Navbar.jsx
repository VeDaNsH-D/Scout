import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logoPng from '../assets/logo.svg';
import React from 'react';
export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [mobileOpen]);

    return (
        <nav className={`fixed top-6 left-0 right-0 z-[1000] flex justify-center transition-all duration-300 pointer-events-none max-lg:top-0 max-lg:p-4`}>
            <div className={`pointer-events-auto flex items-center justify-between gap-8 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full transition-all duration-300 max-lg:w-full max-lg:rounded-2xl max-lg:px-5 max-lg:py-3 ${scrolled
                ? 'bg-[#141419]/60 border-white/20 shadow-[0_10px_40px_#00000080] py-1.5 pl-5 pr-2.5'
                : 'py-2 pl-6 pr-3'
                }`}>
                <Link to="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-white z-[1002]">
                    <img src={logoPng} alt="NODEtorious logo" className="w-8 h-8 object-contain shrink-0" />
                    <span>NODEtorious</span>
                </Link>

                <div className={`flex items-center gap-6 max-lg:fixed max-lg:inset-0 max-lg:flex-col max-lg:justify-center max-lg:gap-12 max-lg:bg-[#0a0a0f]/98 max-lg:backdrop-blur-2xl max-lg:transition-transform max-lg:duration-500 max-lg:z-[999] ${mobileOpen ? 'max-lg:translate-x-0' : 'max-lg:translate-x-full'
                    }`}>
                    {['Features', 'Workflow', 'Dashboard', 'How It Works', 'Security'].map((item) => {
                        const href = `#${item.toLowerCase().replace(/\s+/g, '')}`;
                        return (
                            <a
                                key={item}
                                href={href}
                                onClick={() => setMobileOpen(false)}
                                className="text-sm font-medium text-white/70 hover:text-white transition-colors max-lg:text-2xl max-lg:font-semibold max-lg:text-white"
                            >
                                {item}
                            </a>
                        );
                    })}
                </div>

                <div className="flex items-center gap-4">
                    <a href="#cta" className="hidden lg:inline-flex px-5 py-2 text-sm font-semibold bg-white/5 border border-white/10 text-white rounded-full transition-all hover:bg-white/10 hover:border-white/20">
                        Get Started ✨
                    </a>
                    <Link
                        to="/dashboard"
                        className="hidden lg:inline-flex px-5 py-2 text-sm font-semibold bg-[#f97316] text-[#080810] rounded-full shadow-[0_0_24px_#f9731666] transition-all hover:bg-[#fb923c] hover:shadow-[0_0_40px_#f9731699]"
                    >
                        Open App
                    </Link>
                    <button
                        className="hidden max-lg:flex flex-col justify-center gap-[5px] w-8 h-8 cursor-pointer bg-transparent border-none z-[1001]"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        <span className={`block w-full h-[2px] bg-white rounded-sm transition-all duration-300 ${mobileOpen ? 'translate-y-[7px] rotate-45' : ''}`} />
                        <span className={`block w-full h-[2px] bg-white rounded-sm transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
                        <span className={`block w-full h-[2px] bg-white rounded-sm transition-all duration-300 ${mobileOpen ? '-translate-y-[7px] -rotate-45' : ''}`} />
                    </button>
                </div>
            </div>
        </nav>
    );
}
