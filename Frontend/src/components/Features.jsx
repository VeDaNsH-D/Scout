import { useScrollReveal } from '../hooks/useScrollReveal';
import React from 'react';
const features = [
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <rect x="3" y="6" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <rect x="17" y="6" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <rect x="10" y="16" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <path d="M11 10h6M14 14v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
        title: 'Drag-and-Drop Workflow Builder',
        description:
            'Design complex outreach sequences visually. Connect nodes, set delays, add conditions — no code required.',
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M14 3l3 6 6 1-4.5 4 1 6.5L14 18l-5.5 2.5 1-6.5L5 10l6-1 3-6z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
            </svg>
        ),
        title: 'AI-Powered Personalization',
        description:
            'Every message is uniquely crafted by AI using lead data — company info, role, recent activity — for genuine 1:1 outreach.',
    },
    {
        icon: (
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.5" />
                <path d="M14 8v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 21l-2 3M19 21l2 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
        title: 'Human-like Automation',
        description:
            'Intelligent delays, randomized timing, and behavioral simulation ensure your outreach never looks like a bot.',
    },
];

export default function Features() {
    const ref = useScrollReveal();

    return (
        <section className="section" id="features" ref={ref}>
            <div className="container">
                <div className="text-center flex flex-col items-center mb-[96px] reveal">
                    <span className="section-label">Platform</span>
                    <h2 className="section-title">Workflow automation built<br />for outbound teams at scale</h2>
                    <p className="section-subtitle">
                        Upload leads, design automated journeys, and let AI handle personalization and sending — all in one place.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((feat, i) => (
                        <div
                            key={feat.title}
                            className={`glass-panel reveal reveal-delay-${i + 1} p-12 transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 hover:shadow-[0_16px_48px_#000000cc,_0_0_40px_#a855f70d] hover:border-white/20 before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:opacity-50`}
                        >
                            <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white mb-8 transition-all duration-300 group-hover:scale-105 group-hover:border-[#f97316]/40 group-hover:shadow-[0_0_24px_#f9731633] group-hover:text-[#f97316]">
                                {feat.icon}
                            </div>
                            <h3 className="text-2xl font-bold mb-4 tracking-[-0.02em] text-white">{feat.title}</h3>
                            <p className="text-base text-white/70 leading-[1.6]">{feat.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
