import React, { useState, useEffect } from 'react';
import { sfx } from '../services/soundEffects';

interface FuturisticHoloScannerProps {
    auraColor?: string; // 'cyan' | 'purple' | 'emerald' | 'amber'
    isScanningActive: boolean;
    onToggleScan: () => void;
}

export const FuturisticHoloScanner: React.FC<FuturisticHoloScannerProps> = ({
    auraColor = 'cyan',
    isScanningActive,
    onToggleScan,
}) => {
    const [scanProgress, setScanProgress] = useState(0);
    const [isDiagnosticPass, setIsDiagnosticPass] = useState(false);
    const [diagnosticStatus, setDiagnosticStatus] = useState<'IDLE' | 'ANALYZING' | 'LOCKED' | 'COMPLETE'>('IDLE');

    // Trigger full diagnostic laser sweep sequence
    const triggerFullDiagnostic = () => {
        if (isDiagnosticPass) return;
        setIsDiagnosticPass(true);
        setDiagnosticStatus('ANALYZING');
        sfx.playLaserSweep();

        let progress = 0;
        const interval = setInterval(() => {
            progress += 2.5;
            setScanProgress(Math.min(100, Math.round(progress)));

            if (progress >= 100) {
                clearInterval(interval);
                setDiagnosticStatus('COMPLETE');
                sfx.playOrganLock();
                setTimeout(() => {
                    setIsDiagnosticPass(false);
                    setDiagnosticStatus('IDLE');
                    setScanProgress(0);
                }, 1800);
            }
        }, 50);
    };

    const auraGradient = {
        cyan: 'from-cyan-500/0 via-cyan-400/30 to-cyan-500/0 border-cyan-400',
        purple: 'from-purple-500/0 via-purple-400/30 to-purple-500/0 border-purple-400',
        emerald: 'from-emerald-500/0 via-emerald-400/30 to-emerald-500/0 border-emerald-400',
        amber: 'from-amber-500/0 via-amber-400/30 to-amber-500/0 border-amber-400',
    }[auraColor] || 'from-cyan-500/0 via-cyan-400/30 to-cyan-500/0 border-cyan-400';

    const glowColor = {
        cyan: 'rgba(6,182,212,0.8)',
        purple: 'rgba(168,85,247,0.8)',
        emerald: 'rgba(16,185,129,0.8)',
        amber: 'rgba(245,158,11,0.8)',
    }[auraColor] || 'rgba(6,182,212,0.8)';

    return (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden select-none">
            {/* Ambient Holographic Scanning Grid Scanlines */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)',
                    backgroundSize: '100% 4px'
                }}
            />

            {/* Continuous Holographic Vertical Laser Beam (when scanner active) */}
            {isScanningActive && (
                <div
                    className={`absolute left-0 right-0 h-[2px] bg-gradient-to-r ${auraGradient} pointer-events-none`}
                    style={{
                        boxShadow: `0 0 15px ${glowColor}, 0 0 30px ${glowColor}`,
                        animation: 'holoScanSweep 6s ease-in-out infinite alternate',
                    }}
                >
                    {/* Center Reticle Tracker on the laser */}
                    <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full border border-white/60 flex items-center justify-center">
                            <span className="w-1 h-1 rounded-full bg-white animate-ping" />
                        </span>
                        <span className="text-[8px] font-mono font-bold tracking-widest text-cyan-300/80 bg-black/60 px-1.5 py-0.5 rounded border border-white/10 uppercase">
                            SCAN 98.4 GHz
                        </span>
                    </div>
                </div>
            )}

            {/* High-Velocity Diagnostic Laser Sweep Overdrive */}
            {isDiagnosticPass && (
                <div
                    className="absolute left-0 right-0 h-16 bg-gradient-to-b from-cyan-400/0 via-cyan-400/25 to-cyan-400/0 border-y border-cyan-300 pointer-events-none"
                    style={{
                        top: `${scanProgress}%`,
                        boxShadow: '0 0 40px rgba(6,182,212,0.6)',
                        transition: 'top 50ms linear'
                    }}
                >
                    <div className="absolute right-4 top-2 text-[9px] font-mono font-black text-cyan-300 tracking-wider">
                        PASS: {scanProgress}% // VOXEL SYNC
                    </div>
                </div>
            )}

            {/* Sci-Fi Caliper Scale (Right Side) */}
            <div className="absolute top-16 bottom-16 right-2 sm:right-4 w-6 flex flex-col justify-between items-end opacity-40 hover:opacity-90 transition-opacity pointer-events-none hidden md:flex font-mono text-[8px] text-cyan-400">
                <div className="flex items-center gap-1"><span>185cm</span><span className="w-2 h-[1px] bg-cyan-400" /></div>
                <div className="flex items-center gap-1"><span>150cm</span><span className="w-1.5 h-[1px] bg-cyan-400/60" /></div>
                <div className="flex items-center gap-1"><span>120cm</span><span className="w-2 h-[1px] bg-cyan-400" /></div>
                <div className="flex items-center gap-1"><span>090cm</span><span className="w-1.5 h-[1px] bg-cyan-400/60" /></div>
                <div className="flex items-center gap-1"><span>060cm</span><span className="w-2 h-[1px] bg-cyan-400" /></div>
                <div className="flex items-center gap-1"><span>030cm</span><span className="w-1.5 h-[1px] bg-cyan-400/60" /></div>
                <div className="flex items-center gap-1"><span>000cm</span><span className="w-2 h-[1px] bg-cyan-400" /></div>
            </div>

            {/* Corner Holographic Viewport Targeting Brackets */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-cyan-400/50 pointer-events-none" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-cyan-400/50 pointer-events-none" />
            <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-cyan-400/50 pointer-events-none" />
            <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-cyan-400/50 pointer-events-none" />

            {/* Diagnostic Sweep Trigger Button (Top Center HUD) */}
            <div className="absolute top-14 sm:top-4 left-1/2 -translate-x-1/2 pointer-events-auto z-20">
                {diagnosticStatus === 'ANALYZING' ? (
                    <div className="px-4 py-1.5 rounded-full bg-cyan-950/90 border border-cyan-400 text-cyan-300 font-mono text-[10px] font-black tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center gap-2 backdrop-blur-xl animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                        <span>BIO-SCAN IN PROGRESS // {scanProgress}%</span>
                    </div>
                ) : diagnosticStatus === 'COMPLETE' ? (
                    <div className="px-4 py-1.5 rounded-full bg-emerald-950/90 border border-emerald-400 text-emerald-300 font-mono text-[10px] font-black tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.5)] flex items-center gap-2 backdrop-blur-xl">
                        <span>✓ BIO-SCAN MATRIX VERIFIED (100%)</span>
                    </div>
                ) : (
                    <button
                        onClick={triggerFullDiagnostic}
                        className="group px-3.5 py-1.5 rounded-full bg-slate-950/80 hover:bg-cyan-950/90 border border-cyan-500/40 hover:border-cyan-400 text-cyan-400 hover:text-white font-mono text-[10px] font-bold tracking-wider backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                        title="Run Full-Body Holographic Bio-Diagnostic Laser Sweep"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 group-hover:animate-ping" />
                        <span>⚡ INITIATE BIO-SCAN</span>
                        <span className="text-[9px] text-white/30 font-mono">98.4GHz</span>
                    </button>
                )}
            </div>

            {/* Custom Keyframe Styles */}
            <style>{`
                @keyframes holoScanSweep {
                    0% { top: 8%; opacity: 0.8; }
                    50% { opacity: 1; }
                    100% { top: 92%; opacity: 0.8; }
                }
            `}</style>
        </div>
    );
};

export default FuturisticHoloScanner;
