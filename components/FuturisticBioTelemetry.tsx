import React, { useState, useEffect, useRef } from 'react';
import { sfx } from '../services/soundEffects';

interface FuturisticBioTelemetryProps {
    auraColor?: string; // 'cyan' | 'purple' | 'emerald' | 'amber'
    heartRate?: number;
    toxicityLevel?: 'LOW' | 'MODERATE' | 'HIGH';
}

export const FuturisticBioTelemetry: React.FC<FuturisticBioTelemetryProps> = ({
    auraColor = 'cyan',
    heartRate = 72,
    toxicityLevel = 'LOW',
}) => {
    const [isMinimized, setIsMinimized] = useState(false);
    const [liveBpm, setLiveBpm] = useState(heartRate);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Dynamic micro-fluctuations in heart rate
    useEffect(() => {
        const interval = setInterval(() => {
            const jitter = Math.floor(Math.random() * 5) - 2; // -2 to +2
            setLiveBpm(Math.max(55, Math.min(130, heartRate + jitter)));
        }, 2200);
        return () => clearInterval(interval);
    }, [heartRate]);

    // Live HTML5 Canvas ECG Sine & EEG Pulse Wave
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let offset = 0;

        const renderWave = () => {
            offset += 1.8;
            const width = canvas.width;
            const height = canvas.height;

            ctx.clearRect(0, 0, width, height);

            // Background subtle grid
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            for (let x = 0; x < width; x += 16) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
            for (let y = 0; y < height; y += 14) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }

            // Draw ECG Wave
            ctx.beginPath();
            ctx.lineWidth = 1.8;
            ctx.strokeStyle = auraColor === 'purple' ? '#c084fc' : auraColor === 'emerald' ? '#34d399' : auraColor === 'amber' ? '#fbbf24' : '#38bdf8';
            ctx.shadowBlur = 6;
            ctx.shadowColor = ctx.strokeStyle;

            const midY = height * 0.42;

            for (let x = 0; x < width; x++) {
                const pos = (x + offset) % 180;
                let yOffset = 0;

                // Authentic P-Q-R-S-T wave simulation
                if (pos > 30 && pos < 45) {
                    // P wave
                    yOffset = -Math.sin((pos - 30) * (Math.PI / 15)) * 4;
                } else if (pos >= 50 && pos < 55) {
                    // Q dip
                    yOffset = 3;
                } else if (pos >= 55 && pos < 62) {
                    // R peak spike
                    yOffset = -height * 0.32;
                } else if (pos >= 62 && pos < 68) {
                    // S dip
                    yOffset = 6;
                } else if (pos >= 80 && pos < 105) {
                    // T wave
                    yOffset = -Math.sin((pos - 80) * (Math.PI / 25)) * 7;
                }

                const y = midY + yOffset;
                if (x === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();

            // Draw Secondary EEG Brainwave line
            ctx.beginPath();
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(168, 85, 247, 0.45)';
            ctx.shadowBlur = 3;
            ctx.shadowColor = '#a855f7';

            const eegMidY = height * 0.78;
            for (let x = 0; x < width; x++) {
                const eegY = eegMidY + Math.sin((x * 0.12) + (offset * 0.08)) * 3 + Math.cos((x * 0.05) - (offset * 0.05)) * 2;
                if (x === 0) ctx.moveTo(x, eegY);
                else ctx.lineTo(x, eegY);
            }
            ctx.stroke();

            animationFrameId = requestAnimationFrame(renderWave);
        };

        renderWave();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [auraColor]);

    const borderGlow = {
        cyan: 'border-cyan-500/35 shadow-[0_0_30px_rgba(6,182,212,0.2)]',
        purple: 'border-purple-500/35 shadow-[0_0_30px_rgba(168,85,247,0.2)]',
        emerald: 'border-emerald-500/35 shadow-[0_0_30px_rgba(16,185,129,0.2)]',
        amber: 'border-amber-500/35 shadow-[0_0_30px_rgba(245,158,11,0.2)]',
    }[auraColor] || 'border-cyan-500/35 shadow-[0_0_30px_rgba(6,182,212,0.2)]';

    return (
        <div className="absolute top-16 sm:top-24 right-2 sm:right-6 z-30 pointer-events-auto no-print select-none transition-all duration-300">
            {isMinimized ? (
                /* Minimized Cyber Pill */
                <button
                    onClick={() => {
                        setIsMinimized(false);
                        sfx.playCyberBeep(1100, 0.05);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-950/90 border border-cyan-500/40 text-cyan-300 hover:text-white backdrop-blur-2xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 transition-all text-[11px] font-bold cursor-pointer group"
                    title="Expand Live Quantum Bio-Telemetry HUD"
                >
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]" />
                    <span className="font-mono">{liveBpm} BPM</span>
                    <span className="text-[10px] text-cyan-400 group-hover:translate-y-[-1px] transition-transform">▲ Telemetry</span>
                </button>
            ) : (
                /* Expanded Cyber HUD Telemetry Card */
                <div className={`w-[220px] sm:w-[250px] rounded-2xl bg-slate-950/92 backdrop-blur-2xl border ${borderGlow} overflow-hidden`}>
                    {/* Header */}
                    <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-cyan-950/40 via-transparent to-transparent">
                        <div className="flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300">
                                Quantum Telemetry
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-[8px] font-mono text-white/40 tracking-wider">LIVE</span>
                            <button
                                onClick={() => {
                                    setIsMinimized(true);
                                    sfx.playCyberBeep(750, 0.04);
                                }}
                                className="p-0.5 px-1 rounded bg-white/5 hover:bg-white/10 text-white/40 hover:text-white text-[9px] transition-all cursor-pointer"
                                title="Minimize Telemetry"
                            >
                                —
                            </button>
                        </div>
                    </div>

                    {/* Live ECG & EEG Canvas Visualizer */}
                    <div className="relative w-full h-[72px] bg-black/70 border-b border-white/5">
                        <canvas
                            ref={canvasRef}
                            width={250}
                            height={72}
                            className="w-full h-full block"
                        />
                        <div className="absolute top-1 left-2 pointer-events-none flex items-center gap-2">
                            <span className="text-[8px] font-mono font-bold text-cyan-400/80">ECG // LEAD II</span>
                            <span className="text-[8px] font-mono font-bold text-purple-400/80">EEG // ALPHA</span>
                        </div>
                    </div>

                    {/* Bio-Metrics Matrix Grid */}
                    <div className="p-2.5 grid grid-cols-2 gap-1.5 text-[9px] font-mono">
                        <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
                            <div className="text-white/40 text-[8px] uppercase">Heart Rate</div>
                            <div className="text-rose-400 font-bold text-xs flex items-center gap-1">
                                <span>{liveBpm}</span>
                                <span className="text-[8px] text-white/40">BPM</span>
                            </div>
                        </div>

                        <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
                            <div className="text-white/40 text-[8px] uppercase">SpO2 Oxygen</div>
                            <div className="text-cyan-400 font-bold text-xs flex items-center gap-1">
                                <span>98.7</span>
                                <span className="text-[8px] text-white/40">%</span>
                            </div>
                        </div>

                        <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
                            <div className="text-white/40 text-[8px] uppercase">Core Temp</div>
                            <div className="text-amber-400 font-bold text-[10px]">36.8°C</div>
                        </div>

                        <div className="bg-white/5 p-1.5 rounded-lg border border-white/5">
                            <div className="text-white/40 text-[8px] uppercase">ATP Flux</div>
                            <div className="text-emerald-400 font-bold text-[10px]">4.8 mmol/s</div>
                        </div>
                    </div>

                    {/* Vitals Telemetry Footer */}
                    <div className="px-2.5 py-1.5 bg-black/40 border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-white/40">
                        <span>LATENCY: 0.38ms</span>
                        <span className="text-emerald-400 font-bold">VOXEL SYNC OK</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FuturisticBioTelemetry;
