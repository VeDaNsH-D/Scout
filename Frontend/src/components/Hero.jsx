import { useEffect, useRef } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';
import React from 'react';

export default function Hero() {
    const canvasRef = useRef(null);
    const heroRef = useScrollReveal();

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const particles = [];
        for (let i = 0; i < 150; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 1.5,
                opacity: Math.random(),
                speedX: (Math.random() - 0.5) * 0.2,
                speedY: (Math.random() - 0.5) * 0.2
            });
        }

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.speedX; p.y += p.speedY;
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255,255,255,${p.opacity * 0.5})`;
                ctx.fill();
            });
            animationFrameId = requestAnimationFrame(render);
        };
        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    /* ─── layout constants (all in px, relative to 1100-wide viewBox) ─── */
    // People circle  : cx=190, cy=220
    // Clock circle   : cx=182, cy=350
    // Hub square     : x=310, y=196, w=52, h=52 → center 336,222
    // Diamonds       : x=470  y=152 / 217 / 282
    // Pills left edge: x=492  width=296  heights: top=134,mid=199,bot=264 (each h=58)
    // Pill right edge: x=788
    // Sent circle    : cx=840, cy=168
    // Check circle   : cx=840, cy=280
    // Shield circle  : cx=898, cy=224
    // Right diamond  : cx=954, cy=224
    // Dashboard panel: right=28, top=10, w=120, h=114
    // Waveform       : center-x=590, bottom=28, w=340, h=60

    return (
        <section
            className="relative min-h-screen flex items-center justify-center pt-[160px] pb-[80px] overflow-hidden bg-transparent max-md:pt-[120px] max-md:pb-[60px]"
            id="hero"
            ref={heroRef}
        >
            <canvas ref={canvasRef} className="starfield" />

            <div className="absolute inset-0 pointer-events-none overflow-hidden z-[-1]">
                <div className="absolute w-[800px] h-[800px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle,#f973161f_0%,#a855f70d_40%,transparent_70%)]" />
            </div>

            <div className="relative z-10 text-center flex flex-col items-center w-full max-w-[1200px] mx-auto px-8">

                {/* Badge */}
                <div className="reveal inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-semibold text-white/70 mb-8 backdrop-blur-md">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="var(--color-accent)"><circle cx="12" cy="12" r="8" /></svg>
                    <span>AI-powered outreach automation ↗</span>
                </div>

                {/* Headline */}
                <h1 className="reveal reveal-delay-1 text-[4.5rem] max-md:text-[2.75rem] font-bold leading-[1.1] tracking-tight text-white mb-4 drop-shadow-[0_4px_24px_#00000080]">
                    Automate every step<br />of your outbound workflows.
                </h1>

                <p className="reveal reveal-delay-2 text-lg text-white/70 max-w-[640px] leading-[1.6] mb-12">
                    Upload structured lead data, visually design multi-step outreach sequences, and let AI generate
                    human-sounding, personalized messages at scale — with built-in safety, throttling, and real-time monitoring.
                </p>

                <div className="reveal reveal-delay-3 flex flex-col items-center gap-4">
                    <a href="#cta" className="inline-flex items-center justify-center px-10 py-[14px] text-base font-semibold text-white bg-white/5 border border-white/10 rounded-full relative overflow-hidden shadow-[0_0_30px_#f9731626] backdrop-blur-md transition-all duration-300 hover:shadow-[0_0_50px_#f9731666] hover:border-[#f97316]/50 hover:-translate-y-[2px] before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_center,#f973164d_0%,transparent_60%)] before:opacity-50">
                        <span className="relative z-10">Start building a workflow</span>
                    </a>
                    <span className="text-xs text-white/50 uppercase tracking-[0.2em]">
                        AI personalization · Intelligent delays · Safe at scale
                    </span>
                </div>

                {/* ═══════════ WORKFLOW DIAGRAM ═══════════ */}
                <div className="reveal reveal-delay-4 relative mt-14 max-md:hidden mx-auto" style={{ width: 1100, maxWidth: '100%', height: 460 }}>
                    <style>{`
                        @keyframes _dash  { to { stroke-dashoffset: -20; } }
                        @keyframes _glow  { 0%,100%{opacity:.45;transform:scale(1);box-shadow:0 0 5px #f9731680;}50%{opacity:1;transform:scale(1.6);box-shadow:0 0 14px #f97316f2,0 0 28px #f9731666;} }
                        @keyframes _blink { 0%,100%{opacity:1;}50%{opacity:.25;} }
                        @keyframes _bar   { 0%,100%{transform:scaleY(1);}50%{transform:scaleY(.28);} }

                        ._g  { background:#161620c7; border:1px solid #ffffff1a; backdrop-filter:blur(22px); }
                        ._go { background:linear-gradient(108deg,#823008f2 0%,#261006f2 100%); border:1px solid #f9731680; backdrop-filter:blur(22px); box-shadow:0 0 48px #f9731621; }
                        ._gg { background:linear-gradient(108deg,#104824d1 0%,#08120ce6 100%); border:1px solid #22c55e6b; backdrop-filter:blur(22px); }

                        .n   { position:absolute; display:flex; align-items:center; justify-content:center; }
                        .pill{ position:absolute; display:flex; align-items:center; border-radius:999px; }
                        .dia { position:absolute; width:12px; height:12px; background:#f97316eb; transform:rotate(45deg); box-shadow:0 0 9px #f97316bf,0 0 22px #f9731661; }
                        .tdot{ position:absolute; border-radius:50%; background:#f97316; animation:_glow 2s ease-in-out infinite; }
                        .blink-o{ animation:_blink 1.6s ease-in-out infinite; }
                        .blink-g{ animation:_blink 2.1s ease-in-out infinite; }
                        .fl  { animation:_dash  1s linear infinite; }
                        .fls { animation:_dash 1.8s linear infinite; }
                    `}</style>

                    {/* ── SVG connections ── */}
                    <svg className="absolute inset-0 w-full h-full"
                        viewBox="0 0 1100 460" preserveAspectRatio="xMidYMid meet"
                        style={{ zIndex: 1 }}>
                        <defs>
                            <filter id="lg" x="-60%" y="-60%" width="220%" height="220%">
                                <feGaussianBlur stdDeviation="2.6" result="b" />
                                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
                            </filter>
                        </defs>

                        {/* People → Hub */}
                        <path d="M 220 220 L 308 222"
                            stroke="#f973168c" strokeWidth="1.4" strokeDasharray="5 4" fill="none" filter="url(#lg)" className="fl" />

                        {/* Clock → Hub */}
                        <path d="M 214 348 C 258 348 292 268 308 234"
                            stroke="#f973166b" strokeWidth="1.4" strokeDasharray="5 4" fill="none" filter="url(#lg)" className="fls" />

                        {/* Hub → Upload diamond */}
                        <path d="M 364 210 C 408 210 428 157 466 157"
                            stroke="#f9731685" strokeWidth="1.4" strokeDasharray="5 4" fill="none" filter="url(#lg)" className="fl" />

                        {/* Hub → AI diamond (solid main) */}
                        <path d="M 364 222 L 466 222"
                            stroke="#f97316e6" strokeWidth="1.7" fill="none" filter="url(#lg)" />

                        {/* Hub → Schedule diamond */}
                        <path d="M 364 234 C 408 234 428 282 466 282"
                            stroke="#f9731685" strokeWidth="1.4" strokeDasharray="5 4" fill="none" filter="url(#lg)" className="fl" />

                        {/* Upload pill → Sent circle */}
                        <path d="M 792 163 C 822 163 832 178 848 183"
                            stroke="#f9731661" strokeWidth="1.3" strokeDasharray="5 4" fill="none" filter="url(#lg)" />

                        {/* Schedule pill → Check circle */}
                        <path d="M 792 288 C 822 288 832 272 848 267"
                            stroke="#f9731661" strokeWidth="1.3" strokeDasharray="5 4" fill="none" filter="url(#lg)" />

                        {/* Cluster → right diamond */}
                        <path d="M 920 225 L 960 225"
                            stroke="#f97316a6" strokeWidth="1.4" fill="none" filter="url(#lg)" />

                        {/* Right diamond → dashboard panel */}
                        <path d="M 976 219 C 1012 190 1036 120 1060 94"
                            stroke="#f973166b" strokeWidth="1.4" strokeDasharray="5 4" fill="none" filter="url(#lg)" className="fls" />

                        {/* Hub → waveform (bottom) */}
                        <path d="M 346 242 C 394 296 490 372 592 390"
                            stroke="#f9731647" strokeWidth="1.3" strokeDasharray="5 4" fill="none" filter="url(#lg)" className="fls" />

                        {/* Travel glow dots */}
                        <circle cx="416" cy="210" r="3.8" fill="#f97316f2" filter="url(#lg)" />
                        <circle cx="416" cy="222" r="3.8" fill="#f97316f2" filter="url(#lg)" />
                        <circle cx="416" cy="282" r="3.8" fill="#f97316f2" filter="url(#lg)" />
                        <circle cx="264" cy="340" r="3.2" fill="#f97316bf" filter="url(#lg)" />
                    </svg>

                    {/* ── DOM NODES ── */}
                    <div className="absolute inset-0" style={{ zIndex: 2 }}>

                        {/* People circle */}
                        <div className="n _g" style={{ width: 64, height: 64, borderRadius: '50%', top: 188, left: 148 }}>
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ffffff85" strokeWidth="1.5">
                                <circle cx="9" cy="7" r="3" /><path d="M3 21v-1a6 6 0 016-6h0a6 6 0 016 6v1" />
                                <circle cx="17" cy="9" r="2.5" /><path d="M21 21v-1a4 4 0 00-3-3.87" />
                            </svg>
                        </div>

                        {/* Clock circle */}
                        <div className="n _g" style={{ width: 66, height: 66, borderRadius: '50%', top: 315, left: 144 }}>
                            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#f97316eb" strokeWidth="1.7">
                                <circle cx="12" cy="12" r="9" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                        </div>

                        {/* Hub square — 2×2 grid */}
                        <div className="n _g" style={{ width: 54, height: 54, borderRadius: 15, top: 195, left: 308 }}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff99" strokeWidth="1.6">
                                <rect x="3" y="3" width="8" height="8" rx="1.5" />
                                <rect x="13" y="3" width="8" height="8" rx="1.5" />
                                <rect x="3" y="13" width="8" height="8" rx="1.5" />
                                <rect x="13" y="13" width="8" height="8" rx="1.5" />
                            </svg>
                        </div>

                        {/* Diamonds */}
                        <div className="dia" style={{ top: 151, left: 462 }} />
                        <div className="dia" style={{ top: 216, left: 462 }} />
                        <div className="dia" style={{ top: 276, left: 462 }} />

                        {/* ─── PILL 1: Upload Leads ─── */}
                        <div className="pill _g" style={{ top: 130, left: 486, width: 308, height: 62, padding: '0 22px', gap: 16, boxShadow: '0 10px 36px #00000080' }}>
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#ffffff9e" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                            <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', flex: 1, letterSpacing: '-.015em' }}>Upload Leads</span>
                            <span style={{ fontSize: 12, color: '#ffffff59', fontWeight: 500 }}>CSV / CRM</span>
                        </div>

                        {/* ─── PILL 2: AI Personalize ─── */}
                        <div className="pill _go" style={{ top: 196, left: 486, width: 308, height: 62, padding: '0 22px', gap: 16 }}>
                            {/* Stacked-layers icon */}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316ff" strokeWidth="2.1">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                <path d="M2 12l10 5 10-5" />
                                <path d="M2 17l10 5 10-5" />
                            </svg>
                            <span style={{ fontSize: 17, fontWeight: 800, color: '#fff', flex: 1, letterSpacing: '-.015em' }}>AI Personalize</span>
                            {/* ⚡ badge */}
                            <div style={{ width: 30, height: 30, borderRadius: '50%', background: '#ffffff1f', border: '1px solid #ffffff2e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚡</div>
                        </div>

                        {/* ─── PILL 3: Smart Schedule ─── */}
                        <div className="pill _g" style={{ top: 262, left: 486, width: 308, height: 62, padding: '0 22px', gap: 16, boxShadow: '0 10px 36px #00000080' }}>
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#ffffff9e" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <span style={{ fontSize: 16, fontWeight: 700, color: '#fff', flex: 1, letterSpacing: '-.015em' }}>Smart Schedule</span>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 7px #22c55ed9', flexShrink: 0 }} className="blink-g" />
                        </div>

                        {/* Right: Sent (paper-plane) circle */}
                        <div className="n _g" style={{ width: 42, height: 42, borderRadius: '50%', top: 162, left: 844 }}>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f97316eb" strokeWidth="2">
                                <path d="M22 2L11 13" /><path d="M22 2L15 22 11 13 2 9l20-7z" />
                            </svg>
                        </div>

                        {/* 3.2k msgs/day badge */}
                        <div className="_g" style={{ position: 'absolute', top: 110, left: 660, padding: '6px 11px', borderRadius: 9, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316', boxShadow: '0 0 7px #f97316d9', flexShrink: 0 }} className="blink-o" />
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffffc7', whiteSpace: 'nowrap' }}>3.2k msgs/day</span>
                        </div>

                        {/* Right: Check circle */}
                        <div className="n _g" style={{ width: 42, height: 42, borderRadius: '50%', top: 248, left: 844 }}>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#22c55eeb" strokeWidth="2.3">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>

                        {/* Shield circle */}
                        <div className="n _g" style={{ width: 44, height: 44, borderRadius: '50%', top: 203, left: 898 }}>
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#ffffff7a" strokeWidth="1.8">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            </svg>
                        </div>

                        {/* Right diamond */}
                        <div className="dia" style={{ top: 219, left: 956 }} />

                        {/* 38% reply rate badge */}
                        <div className="_gg" style={{ position: 'absolute', top: 310, left: 686, padding: '7px 12px', borderRadius: 9, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 7px #22c55ed9', flexShrink: 0 }} className="blink-g" />
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffffd1', whiteSpace: 'nowrap' }}>38% reply rate</span>
                        </div>

                        {/* ─── TOP-RIGHT: Dashboard panel ─── */}
                        <div className="_g" style={{
                            position: 'absolute', top: 10, right: 24,
                            width: 126, height: 118, borderRadius: 20,
                            padding: '16px 16px 12px',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4
                        }}>
                            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-.03em', lineHeight: 1 }}>94.2%</div>
                            <div style={{ fontSize: 9, fontWeight: 700, color: '#ffffff61', textTransform: 'uppercase', letterSpacing: '.1em' }}>Delivered</div>
                            {/* Bar chart — last 3 bars orange like screenshot */}
                            <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 32, marginTop: 6 }}>
                                {[9, 15, 11, 20, 14, 28, 22].map((h, i) => (
                                    <div key={i} style={{
                                        width: 9, height: h, borderRadius: 3,
                                        background: i >= 4 ? `rgba(249,115,22,${.55 + i * .18})` : '#ffffff29'
                                    }} />
                                ))}
                            </div>
                        </div>

                        {/* ─── BOTTOM: Live waveform card ─── */}
                        <div className="pill _g" style={{
                            top: 360, left: 376,
                            width: 346, height: 62,
                            padding: '0 20px', gap: 14,
                            boxShadow: '0 10px 36px #0000008c'
                        }}>
                            {/* Orange avatar */}
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                                background: 'radial-gradient(circle at 38% 32%,#f97316 0%,#7c2800 65%,#1a0800 100%)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffffe6" strokeWidth="2.2">
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                </svg>
                            </div>
                            {/* Waveform bars */}
                            <div style={{ display: 'flex', gap: 2.5, alignItems: 'center', flex: 1, height: 30 }}>
                                {[6, 13, 8, 20, 14, 24, 18, 10, 22, 15, 8, 18, 12, 6, 20, 11, 24, 15, 9, 17].map((h, i) => (
                                    <div key={i} style={{
                                        width: 3.2, height: h, borderRadius: 2, flexShrink: 0,
                                        animation: `_bar ${.5 + (i % 5) * .11}s ease-in-out infinite alternate`,
                                        animationDelay: `${i * .065}s`,
                                        background: i <= 12
                                            ? 'linear-gradient(to top,#f97316,#fde68a)'
                                            : '#ffffff1c',
                                        boxShadow: i <= 12 ? '0 0 3px #f9731673' : 'none'
                                    }} />
                                ))}
                            </div>
                            {/* LIVE */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
                                <div style={{ width: 9, height: 9, borderRadius: '50%', background: '#f97316', boxShadow: '0 0 7px #f97316d9', flexShrink: 0 }} className="blink-o" />
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#ffffff85', letterSpacing: '.1em' }}>LIVE</span>
                            </div>
                        </div>

                        {/* Animated travel glow dots */}
                        {[
                            { top: 216, left: 282, delay: '0s' },
                            { top: 154, left: 294, delay: '.38s' },
                            { top: 278, left: 294, delay: '.76s' },
                            { top: 336, left: 192, delay: '1.1s' },
                        ].map((d, i) => (
                            <div key={i} className="tdot" style={{ width: 7, height: 7, top: d.top, left: d.left, animationDelay: d.delay }} />
                        ))}

                    </div>
                </div>

                {/* Social proof */}
                <div className="reveal reveal-delay-4 mt-8 text-center pt-8 border-t border-white/10 w-full">
                    <div className="flex items-center gap-12 flex-wrap justify-center">
                        {['Linear', 'CIRCUS', 'MERCURY', 'remotemiro', 'BB', 'datatr'].map(n => (
                            <span key={n} className="text-lg font-extrabold text-white/45 tracking-tight opacity-50 transition-opacity duration-300 hover:opacity-80">{n}</span>
                        ))}
                    </div>
                </div>

            </div>
        </section>
    );
}