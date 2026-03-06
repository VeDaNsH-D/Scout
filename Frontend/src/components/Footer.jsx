import logoSvg from '../assets/logo.svg';
import React from 'react';
const footerLinks = {
    Product: ['Features', 'Pricing', 'Integrations', 'Changelog'],
    Resources: ['Documentation', 'API Reference', 'Blog', 'Community'],
    Company: ['About', 'Careers', 'Contact', 'Press'],
    Legal: ['Privacy', 'Terms', 'Security', 'GDPR'],
};

export default function Footer() {
    return (
        <footer className="pt-[120px] pb-16 border-t border-white/10 relative z-10 w-full overflow-hidden">
            <div className="container relative z-10 mx-auto w-full px-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-8 md:gap-12 mb-24">
                    <div className="max-md:max-w-full md:col-span-2 max-md:col-span-1">
                        <div className="flex items-center gap-2.5 text-lg font-bold tracking-tight mb-6 text-white">
                            <img src={logoSvg} alt="Scout logo" className="w-9 h-9 object-contain" />
                            <span>Scout</span>
                        </div>
                        <p className="text-sm text-white/45 leading-[1.6]">
                            AI-powered workflow automation for modern outreach teams.
                        </p>
                    </div>

                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div className="" key={category}>
                            <h4 className="text-sm font-bold mb-6 text-white">{category}</h4>
                            <ul className="flex flex-col gap-3">
                                {links.map((link) => (
                                    <li key={link}>
                                        <a href="#" className="text-sm text-white/45 transition-colors duration-150 hover:text-white">{link}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                <div className="flex items-center justify-between pt-8 border-t border-white/10 text-sm text-white/45 max-md:flex-col max-md:gap-6 max-md:text-center">
                    <span>© 2026 Scout. All rights reserved.</span>
                    <div className="flex gap-4">
                        <a href="#" aria-label="Twitter" className="flex items-center justify-center w-9 h-9 rounded-full text-white/45 bg-[#0a0a0f] border border-white/10 transition-all duration-150 hover:text-[#f97316] hover:bg-[#f97316]/10 hover:border-[#f97316]/30 hover:shadow-[0_0_15px_#f9731633] hover:-translate-y-0.5">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 4l11.733 16h4.267l-11.733-16z" />
                                <path d="M4 20l6.768-6.768M20 4l-6.768 6.768" />
                            </svg>
                        </a>
                        <a href="#" aria-label="LinkedIn" className="flex items-center justify-center w-9 h-9 rounded-full text-white/45 bg-[#0a0a0f] border border-white/10 transition-all duration-150 hover:text-[#f97316] hover:bg-[#f97316]/10 hover:border-[#f97316]/30 hover:shadow-[0_0_15px_#f9731633] hover:-translate-y-0.5">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <rect x="2" y="2" width="20" height="20" rx="4" />
                                <path d="M8 11v5M8 8v.01M12 16v-5c0-1.5 1-2 2-2s2 .5 2 2v5" />
                            </svg>
                        </a>
                        <a href="#" aria-label="GitHub" className="flex items-center justify-center w-9 h-9 rounded-full text-white/45 bg-[#0a0a0f] border border-white/10 transition-all duration-150 hover:text-[#f97316] hover:bg-[#f97316]/10 hover:border-[#f97316]/30 hover:shadow-[0_0_15px_#f9731633] hover:-translate-y-0.5">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7a3.37 3.37 0 00-.94 2.58V22" />
                            </svg>
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
