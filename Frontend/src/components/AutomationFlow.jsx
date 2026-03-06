import { useScrollReveal } from '../hooks/useScrollReveal';
import React from 'react';
const steps = [
    {
        number: '01',
        title: 'Upload Leads',
        description: 'Import your lead list via CSV, connect your CRM, or use our API. We automatically deduplicate and validate every record.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 16V4m0 0L8 8m4-4l4 4M4 17v2a1 1 0 001 1h14a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        number: '02',
        title: 'Build Workflow',
        description: 'Drag and drop nodes to build your outreach sequence. Set delays, add conditions, create branches — all visually.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <rect x="8" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 7h4M11.5 10v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
    },
    {
        number: '03',
        title: 'AI Personalization',
        description: 'Our AI analyzes each lead — their role, company, industry, recent activity — and generates uniquely personalized messages.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l2.4 5 5.6 1-4 3.5 1 5.5-5-2.5-5 2.5 1-5.5-4-3.5 5.6-1L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
        ),
    },
    {
        number: '04',
        title: 'Automated Outreach',
        description: 'Messages are sent with intelligent delays, randomized timing, and human-like behavior patterns. Sit back and watch replies roll in.',
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
        ),
    },
];

export default function AutomationFlow() {
    const ref = useScrollReveal();

    return (
        <section className="section bg-transparent" id="automation" ref={ref}>
            <div className="container">
                <div className="text-center flex flex-col items-center mb-[96px] reveal">
                    <span className="section-label">How it works</span>
                    <h2 className="section-title">From CSV upload to<br />fully automated outreach</h2>
                    <p className="section-subtitle">
                        Configure once: the platform handles AI message generation, scheduling, follow-ups, and safety — end to end.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-[960px] mx-auto">
                    {steps.map((step, i) => (
                        <div
                            key={step.number}
                            className={`flex gap-6 items-start reveal reveal-delay-${i + 1}`}
                        >
                            <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-lg text-base font-extrabold bg-white text-[#080810] shadow-[0_0_20px_#ffffff4d]">{step.number}</div>
                            <div className="glass-panel flex-1 p-8 md:p-12 transition-all duration-300 relative overflow-hidden group hover:shadow-[0_16px_48px_#000000cc,_0_0_40px_#a855f70d] hover:-translate-y-1 hover:border-white/20 before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:opacity-50">
                                <div className="w-[52px] h-[52px] flex items-center justify-center rounded-xl bg-white/5 text-[#f97316] mb-6 border border-white/10 transition-all duration-300 group-hover:bg-[#f97316]/10 group-hover:border-[#f97316]/30 group-hover:shadow-[0_0_20px_#f9731633] group-hover:scale-105">{step.icon}</div>
                                <h3 className="text-xl font-bold mb-2 tracking-[-0.02em] text-white">{step.title}</h3>
                                <p className="text-base text-white/70 leading-[1.6]">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
