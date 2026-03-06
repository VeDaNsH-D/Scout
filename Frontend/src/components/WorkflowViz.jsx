import { useScrollReveal } from '../hooks/useScrollReveal';
import React from 'react';
const nodes = [
    { id: 1, label: 'Upload Leads', emoji: '📤', desc: 'Ingest structured CSVs or sync your CRM' },
    { id: 2, label: 'Visual Workflow', emoji: '🧩', desc: 'Drag, drop, and connect multi-step journeys' },
    { id: 3, label: 'AI Personalization', emoji: '✨', desc: 'Generate human-like copy for every lead' },
    { id: 4, label: 'Safe Sending', emoji: '⏱️', desc: 'Randomized delays and throttling to mimic humans' },
    { id: 5, label: 'Monitor & Optimize', emoji: '📈', desc: 'Track replies, progression, and performance live' },
];

export default function WorkflowViz() {
    const ref = useScrollReveal();

    return (
        <section className="bg-transparent section" id="workflow" ref={ref}>
            <style>{`
            @keyframes line-flow {
                0% { left: 0; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { left: calc(100% - 100px); opacity: 0; }
            }
            `}</style>
            <div className="container">
                <div className="text-center flex flex-col items-center mb-[96px] reveal">
                    <span className="section-label">Workflows</span>
                    <h2 className="section-title">Design once, let the<br />automation run for you</h2>
                    <p className="section-subtitle">
                        Visually configure how leads are contacted, nurtured, and followed up — then let the engine execute every step.
                    </p>
                </div>

                <div className="relative flex items-start justify-between gap-4 py-12 max-md:flex-col max-md:items-center max-md:gap-6 reveal">
                    <div className="absolute top-[74px] left-[40px] right-[40px] h-[1px] bg-white/10 z-0 max-md:hidden after:content-[''] after:absolute after:-top-[1px] after:left-0 after:w-[100px] after:h-[3px] after:bg-[#f97316] after:shadow-[0_0_20px_#f97316cc,_0_0_40px_#f9731666] after:rounded-[4px] after:animate-[line-flow_4s_ease-in-out_infinite]" />
                    {nodes.map((node, i) => (
                        <div
                            key={node.id}
                            className={`flex-1 flex flex-col items-center text-center relative z-10 group max-md:w-full max-md:max-w-[320px] reveal reveal-delay-${i + 1}`}
                        >
                            <div className="w-[56px] h-[56px] rounded-full bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center mb-6 transition-all duration-300 group-hover:border-[#f97316]/50 group-hover:bg-[#f97316]/10 group-hover:shadow-[0_0_30px_#f9731633] group-hover:scale-110">
                                <span className="text-[24px]">{node.emoji}</span>
                            </div>
                            <div className="glass-panel p-6 w-full transition-all duration-300 relative overflow-hidden group-hover:shadow-[0_16px_48px_#000000cc,_0_0_40px_#a855f70d] group-hover:-translate-y-1 group-hover:border-white/20 before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:opacity-50">
                                <h4 className="text-base font-bold mb-[6px] text-white">{node.label}</h4>
                                <p className="text-sm text-white/70 leading-[1.6]">{node.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
