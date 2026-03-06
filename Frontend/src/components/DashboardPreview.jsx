import { useScrollReveal } from '../hooks/useScrollReveal';
import React from 'react';
export default function DashboardPreview() {
    const ref = useScrollReveal();

    return (
        <section className="section bg-transparent" id="dashboard" ref={ref}>
            <style>{`
            @keyframes bar-grow {
                from { height: 0; }
            }
            `}</style>
            <div className="container">
                <div className="text-center flex flex-col items-center mb-[96px] reveal">
                    <span className="section-label">Monitoring</span>
                    <h2 className="section-title">Real-time visibility into<br />every automated sequence</h2>
                    <p className="section-subtitle">
                        See leads processed, messages sent, reply rates, and workflow progression in one place — no more guessing what&apos;s working.
                    </p>
                </div>

                {/* Stats bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-[96px] reveal">
                    <div className="glass-panel p-12 text-left relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_#000000cc,_0_0_30px_#a855f70d] hover:border-white/20 before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:opacity-50">
                        <span className="block text-sm text-white/70 mb-2 uppercase tracking-[0.05em] font-semibold">Increase in response rates</span>
                        <span className="text-[3.5rem] font-extrabold tracking-[-0.04em] text-white leading-none bg-clip-text text-transparent bg-[linear-gradient(135deg,#ffffff_0%,#ffffffb3_100%)]">70%</span>
                    </div>
                    <div className="glass-panel p-12 text-left relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_#000000cc,_0_0_30px_#a855f70d] hover:border-white/20 before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:opacity-50">
                        <span className="block text-sm text-white/70 mb-2 uppercase tracking-[0.05em] font-semibold">Faster campaign setup</span>
                        <span className="text-[3.5rem] font-extrabold tracking-[-0.04em] text-white leading-none bg-clip-text text-transparent bg-[linear-gradient(135deg,#ffffff_0%,#ffffffb3_100%)]">4x</span>
                    </div>
                    <div className="glass-panel p-12 text-left relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_48px_#000000cc,_0_0_30px_#a855f70d] hover:border-white/20 before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:opacity-50">
                        <span className="block text-sm text-white/70 mb-2 uppercase tracking-[0.05em] font-semibold">Lower cost per lead</span>
                        <span className="text-[3.5rem] font-extrabold tracking-[-0.04em] text-white leading-none bg-clip-text text-transparent bg-[linear-gradient(135deg,#ffffff_0%,#ffffffb3_100%)]">64%</span>
                    </div>
                </div>

                <div className="reveal reveal-delay-1">
                    <div className="glass-panel flex overflow-hidden min-h-[480px] font-sans max-md:flex-col max-md:min-h-0">
                        {/* Sidebar */}
                        <div className="w-[220px] shrink-0 p-6 bg-[#0a0a0f]/50 border-r border-white/10 max-md:w-full max-md:border-r-0 max-md:border-b max-md:p-4">
                            <div className="flex items-center gap-2 text-sm font-bold mb-12 text-white max-md:mb-6">
                                <div className="w-2.5 h-2.5 rounded bg-[#f97316] shadow-[0_0_10px_#f97316]" />
                                <span>NODEtorious</span>
                            </div>
                            <div className="flex flex-col gap-2 max-md:flex-row max-md:overflow-x-auto">
                                <div className="flex items-center gap-3 py-2.5 px-3.5 text-sm rounded-lg cursor-pointer transition-all duration-150 max-md:whitespace-nowrap max-md:text-xs bg-[#f97316]/10 text-[#f97316] font-semibold border border-[#f97316]/20">
                                    <span>📊</span> Dashboard
                                </div>
                                <div className="flex items-center gap-3 py-2.5 px-3.5 text-sm text-white/45 rounded-lg cursor-pointer transition-all duration-150 hover:text-white hover:bg-white/5 max-md:whitespace-nowrap max-md:text-xs"><span>📧</span> Campaigns</div>
                                <div className="flex items-center gap-3 py-2.5 px-3.5 text-sm text-white/45 rounded-lg cursor-pointer transition-all duration-150 hover:text-white hover:bg-white/5 max-md:whitespace-nowrap max-md:text-xs"><span>👥</span> Leads</div>
                                <div className="flex items-center gap-3 py-2.5 px-3.5 text-sm text-white/45 rounded-lg cursor-pointer transition-all duration-150 hover:text-white hover:bg-white/5 max-md:whitespace-nowrap max-md:text-xs"><span>⚡</span> Workflows</div>
                                <div className="flex items-center gap-3 py-2.5 px-3.5 text-sm text-white/45 rounded-lg cursor-pointer transition-all duration-150 hover:text-white hover:bg-white/5 max-md:whitespace-nowrap max-md:text-xs"><span>⚙️</span> Settings</div>
                            </div>
                        </div>

                        {/* Main content */}
                        <div className="flex-1 p-8 flex flex-col gap-8 bg-black/20 max-md:p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                                    <div className="flex justify-between text-xs text-white/45 mb-2">
                                        <span>Leads Processed</span>
                                        <span className="text-[#4ade80] font-semibold">+12.5%</span>
                                    </div>
                                    <div className="text-2xl font-extrabold tracking-[-0.02em] mb-4 text-white">24,847</div>
                                    <div className="h-1 rounded-sm bg-white/10 overflow-hidden">
                                        <div className="h-full rounded-sm bg-white" style={{ width: '78%' }} />
                                    </div>
                                </div>

                                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                                    <div className="flex justify-between text-xs text-white/45 mb-2">
                                        <span>Emails Sent</span>
                                        <span className="text-[#4ade80] font-semibold">+8.3%</span>
                                    </div>
                                    <div className="text-2xl font-extrabold tracking-[-0.02em] mb-4 text-white">18,392</div>
                                    <div className="h-1 rounded-sm bg-white/10 overflow-hidden">
                                        <div className="h-full rounded-sm bg-[#3b82f6] shadow-[0_0_10px_#3b82f6]" style={{ width: '65%' }} />
                                    </div>
                                </div>

                                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                                    <div className="flex justify-between text-xs text-white/45 mb-2">
                                        <span>Reply Rate</span>
                                        <span className="text-[#4ade80] font-semibold">+3.1%</span>
                                    </div>
                                    <div className="text-2xl font-extrabold tracking-[-0.02em] mb-4 text-white">34.7%</div>
                                    <div className="h-1 rounded-sm bg-white/10 overflow-hidden">
                                        <div className="h-full rounded-sm bg-[#4ade80] shadow-[0_0_10px_#4ade80]" style={{ width: '35%' }} />
                                    </div>
                                </div>
                            </div>

                            {/* Chart */}
                            <div className="flex-1 p-8 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md max-md:p-4">
                                <div className="flex justify-between items-center mb-8 max-md:flex-col max-md:gap-4 max-md:items-start">
                                    <h4 className="text-sm font-bold text-white">Campaign Performance</h4>
                                    <div className="flex gap-6 text-xs text-white/45 flex-wrap">
                                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block bg-white shadow-[0_0_8px_#ffffff80]" /> Sent</span>
                                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block bg-white/30" /> Opened</span>
                                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full inline-block bg-[#f97316] shadow-[0_0_8px_#f97316]" /> Replied</span>
                                    </div>
                                </div>
                                <div className="flex items-end justify-between gap-6 min-h-[160px] max-md:gap-2">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                                        const h = [65, 80, 55, 90, 75, 40, 70];
                                        const o = [45, 55, 38, 65, 50, 28, 48];
                                        const r = [20, 28, 18, 35, 25, 12, 22];
                                        return (
                                            <div className="flex-1 flex flex-col items-center gap-2" key={day}>
                                                <div className="flex items-end gap-1 w-full h-[140px] max-md:gap-0.5">
                                                    <div className="flex-1 rounded-t animate-[bar-grow_1.2s_cubic-bezier(0.16,1,0.3,1)_both] bg-white" style={{ height: `${h[i]}%` }} />
                                                    <div className="flex-1 rounded-t animate-[bar-grow_1.2s_cubic-bezier(0.16,1,0.3,1)_both] bg-white/30" style={{ height: `${o[i]}%` }} />
                                                    <div className="flex-1 rounded-t animate-[bar-grow_1.2s_cubic-bezier(0.16,1,0.3,1)_both] bg-[#f97316] shadow-[0_0_15px_#f9731666]" style={{ height: `${r[i]}%` }} />
                                                </div>
                                                <span className="text-xs text-white/45 font-medium">{day}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
