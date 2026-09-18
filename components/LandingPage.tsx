import React, { useEffect, useState, useRef } from 'react';

interface LandingPageProps {
    onExplore: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onExplore }) => {
    // Sphere position state (smoothly interpolated)
    const [spherePos, setSpherePos] = useState({ x: 0, y: 0 });
    const targetPos = useRef({ x: 0, y: 0 });
    const requestRef = useRef<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Calculate mouse position relative to container center
            let moveX = (e.clientX - centerX) * 0.8;
            let moveY = (e.clientY - centerY) * 0.8;

            const maxOffset = 180;
            moveX = Math.max(-maxOffset, Math.min(maxOffset, moveX));
            moveY = Math.max(-maxOffset, Math.min(maxOffset, moveY));

            targetPos.current = { x: moveX, y: moveY };
        };

        const animate = () => {
            setSpherePos(prev => {
                const dx = targetPos.current.x - prev.x;
                const dy = targetPos.current.y - prev.y;
                return {
                    x: prev.x + dx * 0.1,
                    y: prev.y + dy * 0.1
                };
            });
            requestRef.current = requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', handleMouseMove);
        requestRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, []);

    const handleExploreClick = () => {
        setIsExiting(true);
        setTimeout(onExplore, 800);
    };

    return (
        <div className={`fixed inset-0 z-50 flex flex-col md:flex-row bg-[#020617] text-white overflow-hidden transition-opacity duration-1000 ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>

            {/* Background Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-teal-950/40 via-[#020617] to-black"></div>

            {/* Microdot Laboratory Grid Overlay */}
            <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#2dd4bf_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none"></div>

            {/* Content Container */}
            <div className="relative z-20 w-full md:w-1/2 flex flex-col justify-center px-8 md:px-20 h-full">
                <div className={`transition-all duration-1000 delay-300 ${isExiting ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'}`}>
                    
                    {/* Mission Tag */}
                    <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono font-semibold mb-6 tracking-wide shadow-[0_0_20px_rgba(45,212,191,0.15)]">
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                        VIRTUAL IN-SILICO RESEARCH PLATFORM
                    </div>

                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-5 bg-clip-text text-transparent bg-gradient-to-r from-teal-100 via-white to-teal-300 leading-tight">
                        Test on a virtual human first, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
                            then validate in the real world.
                        </span>
                    </h1>

                    <p className="text-base md:text-lg text-blue-100/70 max-w-xl font-light mb-8 leading-relaxed">
                        A computational research environment for scientists to simulate drug pharmacokinetics, predict organ-specific toxicities, and model emerging pandemic diseases safely before moving to real-world assays.
                    </p>

                    {/* Scientific Feature Highlights */}
                    <div className="grid grid-cols-2 gap-4 max-w-lg mb-9 text-xs text-teal-200/80 font-mono">
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                            <span className="text-teal-400">⚡</span> 3D Organ Toxicity Heatmap
                        </div>
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                            <span className="text-teal-400">🧬</span> CYP450 Genomic Metabolizers
                        </div>
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                            <span className="text-teal-400">🦠</span> Emerging Pandemic Modeling
                        </div>
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/[0.03] border border-white/10">
                            <span className="text-teal-400">📂</span> Preclinical Experiment Dossiers
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <button
                            onClick={handleExploreClick}
                            className="group relative px-8 py-4 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-bold rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 shadow-[0_0_30px_rgba(45,212,191,0.4)] active:scale-95 flex items-center gap-3"
                        >
                            <span className="relative z-10 flex items-center gap-2.5 font-bold tracking-wide">
                                Enter In-Silico AI Laboratory
                                <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </span>
                        </button>
                        <span className="text-[11px] text-white/40 font-mono">
                            Computational predictions • Not clinical advice
                        </span>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <div className="absolute bottom-10 left-1/2 md:left-20 transform -translate-x-1/2 md:translate-x-0 animate-bounce opacity-30">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                </div>
            </div>

            {/* 3D Visual Container (Right Side) */}
            <div className="absolute inset-0 md:relative w-full md:w-1/2 h-full flex items-center justify-center perspective-1000 pointer-events-none md:pointer-events-auto">
                <div
                    ref={containerRef}
                    className="relative w-[300px] h-[300px] md:w-[600px] md:h-[600px] flex items-center justify-center rounded-full overflow-hidden"
                >
                    {/* Glowing Sphere */}
                    <div
                        className={`absolute rounded-full transition-opacity duration-1000 ${isExiting ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`}
                        style={{
                            width: '400px',
                            height: '400px',
                            background: 'radial-gradient(circle at 30% 30%, #2dd4bf, #0f766e)',
                            transform: `translate(${spherePos.x}px, ${spherePos.y}px)`,
                            boxShadow: '0 0 140px rgba(45, 212, 191, 0.6), inset 0 0 70px rgba(0,0,0,0.6)',
                            zIndex: 0
                        }}
                    >
                        {/* Internal Light Reflection */}
                        <div className="absolute top-10 left-10 w-20 h-20 bg-white opacity-40 blur-xl rounded-full"></div>
                        <div className="absolute bottom-10 right-10 w-32 h-32 bg-emerald-950 opacity-60 blur-2xl rounded-full mix-blend-multiply"></div>
                    </div>

                    {/* Glass Slices Layer */}
                    <div className="absolute inset-0 w-full h-full flex flex-row justify-center items-center z-20 gap-2 pointer-events-none p-0">
                        {Array.from({ length: 23 }).map((_, i) => {
                            const distance = Math.abs(i - 11);
                            const widthFactor = Math.sqrt(12 * 12 - distance * distance);

                            return (
                                <div
                                    key={i}
                                    className={`relative transition-transform duration-1000 ${isExiting ? 'scale-y-0' : 'scale-y-100'}`}
                                    style={{
                                        height: '100%',
                                        flex: widthFactor,
                                        backdropFilter: 'blur(20px) saturate(180%)',
                                        background: 'linear-gradient(90deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
                                        borderLeft: '1px solid rgba(255,255,255,0.2)',
                                        borderRight: '1px solid rgba(255,255,255,0.05)',
                                        boxShadow: 'inset 0 0 12px rgba(0, 0, 0, 0.1)'
                                    }}
                                >
                                    <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px]"></div>
                                    <div className="absolute inset-y-0 left-0 w-[1px] bg-gradient-to-b from-transparent via-white/50 to-transparent opacity-60"></div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
