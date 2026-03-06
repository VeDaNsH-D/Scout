import { useScrollReveal } from '../hooks/useScrollReveal';
import { useCountUp } from '../hooks/useCountUp';
import React from 'react';
const trustCards = [
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        title: 'Safety Controls',
        description: 'Built-in guardrails prevent over-sending. Domain warming, bounce handling, and spam-score monitoring are all automatic.',
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
        ),
        title: 'Smart Throttling',
        description: 'Sends are paced with randomized intervals to mimic natural human behavior. No two campaigns look the same.',
    },
    {
        icon: (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
                <path d="M7 14l3-3 2 2 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        title: 'Real-time Monitoring',
        description: 'Track deliverability, open rates, and replies in real time. Get instant alerts for anomalies or delivery issues.',
    },
];

function StatCounter({ value, suffix, label }) {
    const { count, ref } = useCountUp(value, 2000);
    return (
        <div className="text-center flex-1 md:flex-none md:w-auto w-[calc(50%-12px)]" ref={ref}>
            <div className="text-[3rem] font-extrabold tracking-[-0.03em] text-white bg-clip-text text-transparent bg-[linear-gradient(135deg,#ffffff_0%,#ffffffb3_100%)]">
                {count.toLocaleString()}{suffix}
            </div>
            <div className="text-sm text-white/45 mt-2 uppercase tracking-[0.05em] font-semibold">{label}</div>
        </div>
    );
}

export default function Trust() {
    const ref = useScrollReveal();

    return (
        <section className="section bg-transparent" id="trust" ref={ref}>
            <div className="container">
                <div className="text-center flex flex-col items-center mb-[96px] reveal">
                    <span className="section-label">Safety & control</span>
                    <h2 className="section-title">Automation that behaves<br />like a responsible human</h2>
                    <p className="section-subtitle">
                        Intelligent delays, throttling, and protections keep your domains healthy while campaigns run on autopilot.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-[72px]">
                    {trustCards.map((card, i) => (
                        <div
                            key={card.title}
                            className={`glass-panel p-8 md:p-12 transition-all duration-300 relative overflow-hidden group hover:shadow-[0_16px_48px_#000000cc,_0_0_40px_#a855f70d] hover:-translate-y-1 hover:border-white/20 before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:opacity-50 reveal reveal-delay-${i + 1}`}
                        >
                            <div className="w-[52px] h-[52px] flex items-center justify-center rounded-xl bg-white/5 text-[#f97316] mb-8 border border-white/10 shadow-[0_0_20px_#f973161a] transition-all duration-300">{card.icon}</div>
                            <h3 className="text-xl font-bold mb-2 tracking-[-0.02em] text-white">{card.title}</h3>
                            <p className="text-base text-white/70 leading-[1.6]">{card.description}</p>
                        </div>
                    ))}
                </div>

                {/* Compliance badges */}
                <div className="flex justify-center flex-wrap gap-4 mb-[72px] reveal reveal-delay-2">
                    <span className="glass-panel px-5 py-2 text-xs font-bold tracking-[0.05em] text-white/70 rounded-full">GDPR</span>
                    <span className="glass-panel px-5 py-2 text-xs font-bold tracking-[0.05em] text-white/70 rounded-full">SOC 2</span>
                    <span className="glass-panel px-5 py-2 text-xs font-bold tracking-[0.05em] text-white/70 rounded-full">CCPA</span>
                    <span className="glass-panel px-5 py-2 text-xs font-bold tracking-[0.05em] text-white/70 rounded-full">ISO 27001</span>
                </div>

                <div className="glass-panel flex flex-wrap md:flex-nowrap items-center justify-center gap-6 md:gap-12 py-12 px-8 rounded-2xl relative overflow-hidden before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:opacity-50 reveal reveal-delay-3">
                    <StatCounter value={99} suffix="%" label="Deliverability Rate" />
                    <div className="w-[1px] h-12 shrink-0 bg-white/10 max-md:hidden" />
                    <StatCounter value={500} suffix="K+" label="Messages Sent" />
                    <div className="w-[1px] h-12 shrink-0 bg-white/10 max-md:hidden" />
                    <StatCounter value={12} suffix="ms" label="Avg Response Time" />
                    <div className="w-[1px] h-12 shrink-0 bg-white/10 max-md:hidden" />
                    <StatCounter value={0} suffix="" label="Data Breaches" />
                </div>
            </div>
        </section>
    );
}
