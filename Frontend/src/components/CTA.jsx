import { useScrollReveal } from '../hooks/useScrollReveal';
import { Link } from 'react-router-dom';
import React from 'react';
export default function CTA() {
    const ref = useScrollReveal();

    return (
        <section className="text-center relative pb-32" id="cta" ref={ref}>
            <div className="container">
                <div className="glass-panel relative flex flex-col items-center py-32 px-8 rounded-3xl overflow-hidden z-10 before:absolute before:inset-0 before:-z-10 before:bg-[radial-gradient(circle_at_center,#f9731626_0%,transparent_70%)] before:pointer-events-none after:absolute after:inset-x-0 after:top-0 after:h-[1px] after:bg-gradient-to-r after:from-transparent after:via-white/40 after:to-transparent after:opacity-60 max-md:py-24 max-md:px-6 reveal">
                    <span className="section-label">Get Started</span>
                    <h2 className="text-[3rem] max-md:text-[2rem] font-bold leading-[1.1] tracking-[-0.04em] mb-6 text-white drop-shadow-[0_4px_20px_#00000080]">
                        Ready to transform<br />your outreach?
                    </h2>
                    <p className="text-xl text-white/70 max-w-[520px] leading-[1.6] mb-12">
                        Join thousands of teams using NODEtorious to automate personalized
                        outreach and close more deals, faster.
                    </p>
                    <div className="flex flex-col items-center gap-4">
                        <Link
                            to="/signup"
                            className="inline-flex items-center gap-2 px-10 py-[18px] text-lg bg-[#f97316] text-[#080810] rounded-full shadow-[0_0_40px_#f9731666] transition-all duration-300 font-bold hover:bg-[#fb923c] hover:shadow-[0_0_60px_#f9731699] hover:-translate-y-0.5"
                        >
                            Start Automating Outreach
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M3 8h10m0 0L9 4m4 4L9 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </Link>
                        <a
                            href="/extension/intelligence-scout-extension.zip"
                            className="inline-flex items-center gap-2 px-5 py-2 text-sm rounded-full border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition"
                        >
                            <span>Download Intelligence Scout Extension</span>
                        </a>
                        <span className="text-sm text-white/45 mt-1">
                            Works in Chromium-based browsers (Chrome, Edge, Brave, Arc) via “Load unpacked”.
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
