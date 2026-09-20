import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Heart, Activity, Volume2, VolumeX, Play, Pause, AlertCircle, X, ShieldAlert, Zap, Info } from 'lucide-react';

export type RhythmType = 'NORMAL' | 'TACHYCARDIA' | 'BRADYCARDIA' | 'QT_PROLONGED' | 'ARRHYTHMIA';

interface BioTelemetryProps {
    isOpen: boolean;
    onClose: () => void;
    activeDrugName?: string;
    cardiacStrainScore?: number; // 0 - 100 from drug effect
}

const RHYTHM_CONFIGS: Record<RhythmType, {
    label: string;
    bpm: number;
    description: string;
    prInterval: number; // ms
    qrsDuration: number; // ms
    qtInterval: number; // ms
    riskLevel: 'NORMAL' | 'ELEVATED' | 'HIGH';
    audioGain: number;
}> = {
    NORMAL: {
        label: 'Normal Sinus Rhythm',
        bpm: 72,
        description: 'Hemodynamically stable cardiac output. Clean S1/S2 heart sound acoustics without murmurs.',
        prInterval: 140,
        qrsDuration: 85,
        qtInterval: 390,
        riskLevel: 'NORMAL',
        audioGain: 0.8
    },
    TACHYCARDIA: {
        label: 'Sinus Tachycardia',
        bpm: 118,
        description: 'Elevated sympathetic tone or stimulant response. Shortened diastolic filling interval.',
        prInterval: 120,
        qrsDuration: 82,
        qtInterval: 330,
        riskLevel: 'ELEVATED',
        audioGain: 0.95
    },
    BRADYCARDIA: {
        label: 'Sinus Bradycardia',
        bpm: 46,
        description: 'Parasympathetic surge or beta-blocker/nodal suppression. Extended stroke volume.',
        prInterval: 165,
        qrsDuration: 90,
        qtInterval: 440,
        riskLevel: 'ELEVATED',
        audioGain: 0.85
    },
    QT_PROLONGED: {
        label: 'Drug-Induced QT Prolongation',
        bpm: 76,
        description: 'hERG cardiac potassium channel block. High risk for Torsades de Pointes polymorphic ventricular tachycardia.',
        prInterval: 155,
        qrsDuration: 105,
        qtInterval: 510, // Dangerously prolonged
        riskLevel: 'HIGH',
        audioGain: 0.9
    },
    ARRHYTHMIA: {
        label: 'Atrial Arrhythmia / Premature Ventricular Contractions',
        bpm: 92,
        description: 'Irregular ventricular rhythm secondary to myocardial irritation or systemic inflammatory response.',
        prInterval: 130,
        qrsDuration: 120,
        qtInterval: 430,
        riskLevel: 'HIGH',
        audioGain: 1.0
    }
};

export const BioTelemetryAuscultator: React.FC<BioTelemetryProps> = ({
    isOpen,
    onClose,
    activeDrugName = 'Candidate Compound',
    cardiacStrainScore = 24
}) => {
    // Determine initial rhythm based on cardiac strain score
    const initialRhythm: RhythmType = cardiacStrainScore > 70 
        ? 'QT_PROLONGED' 
        : cardiacStrainScore > 45 
            ? 'TACHYCARDIA' 
            : 'NORMAL';

    const [currentRhythm, setCurrentRhythm] = useState<RhythmType>(initialRhythm);
    const [isPlayingSound, setIsPlayingSound] = useState(false);
    const [volume, setVolume] = useState(0.5);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const intervalTimerRef = useRef<any>(null);
    const animationFrameRef = useRef<number | null>(null);

    const currentConfig = RHYTHM_CONFIGS[currentRhythm];

    // ── Web Audio API Cardiac Sound Synthesizer ────────────────────────
    const playHeartbeatSound = useCallback(() => {
        try {
            if (!audioCtxRef.current) {
                const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                audioCtxRef.current = new AudioCtx();
            }

            const ctx = audioCtxRef.current;
            if (ctx.state === 'suspended') {
                ctx.resume();
            }

            const now = ctx.currentTime;

            // Master Gain
            if (!gainNodeRef.current) {
                gainNodeRef.current = ctx.createGain();
                gainNodeRef.current.connect(ctx.destination);
            }
            gainNodeRef.current.gain.setValueAtTime(volume * currentConfig.audioGain, now);

            // S1 Sound ("Lub" - Mitral/Tricuspid closure)
            // Low-frequency resonant pulse (50-60 Hz)
            const s1Osc = ctx.createOscillator();
            const s1Gain = ctx.createGain();
            const s1Filter = ctx.createBiquadFilter();

            s1Filter.type = 'lowpass';
            s1Filter.frequency.setValueAtTime(75, now);

            s1Osc.type = 'sine';
            s1Osc.frequency.setValueAtTime(55, now);
            s1Osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

            s1Gain.gain.setValueAtTime(0.001, now);
            s1Gain.gain.exponentialRampToValueAtTime(0.7, now + 0.02);
            s1Gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

            s1Osc.connect(s1Filter);
            s1Filter.connect(s1Gain);
            s1Gain.connect(gainNodeRef.current);

            s1Osc.start(now);
            s1Osc.stop(now + 0.15);

            // S2 Sound ("Dub" - Aortic/Pulmonic closure)
            // Slightly higher frequency, crisper (80-95 Hz), occurs ~0.24s after S1
            const s2Time = now + 0.24;
            const s2Osc = ctx.createOscillator();
            const s2Gain = ctx.createGain();
            const s2Filter = ctx.createBiquadFilter();

            s2Filter.type = 'bandpass';
            s2Filter.frequency.setValueAtTime(90, s2Time);
            s2Filter.Q.setValueAtTime(2.0, s2Time);

            s2Osc.type = 'sine';
            s2Osc.frequency.setValueAtTime(80, s2Time);
            s2Osc.frequency.exponentialRampToValueAtTime(50, s2Time + 0.09);

            s2Gain.gain.setValueAtTime(0.001, s2Time);
            s2Gain.gain.exponentialRampToValueAtTime(0.55, s2Time + 0.015);
            s2Gain.gain.exponentialRampToValueAtTime(0.001, s2Time + 0.10);

            s2Osc.connect(s2Filter);
            s2Filter.connect(s2Gain);
            s2Gain.connect(gainNodeRef.current);

            s2Osc.start(s2Time);
            s2Osc.stop(s2Time + 0.12);

            // Optional Systolic Murmur / Arrhythmia bruit noise if high risk
            if (currentRhythm === 'ARRHYTHMIA' || currentRhythm === 'QT_PROLONGED') {
                const bufferSize = ctx.sampleRate * 0.18;
                const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
                const output = noiseBuffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    output[i] = Math.random() * 2 - 1;
                }
                const whiteNoise = ctx.createBufferSource();
                whiteNoise.buffer = noiseBuffer;

                const murmurFilter = ctx.createBiquadFilter();
                murmurFilter.type = 'bandpass';
                murmurFilter.frequency.setValueAtTime(140, now + 0.05);

                const murmurGain = ctx.createGain();
                murmurGain.gain.setValueAtTime(0.001, now + 0.05);
                murmurGain.gain.linearRampToValueAtTime(0.08, now + 0.10);
                murmurGain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

                whiteNoise.connect(murmurFilter);
                murmurFilter.connect(murmurGain);
                murmurGain.connect(gainNodeRef.current);

                whiteNoise.start(now + 0.05);
                whiteNoise.stop(now + 0.24);
            }
        } catch (e) {
            console.warn('Audio synthesis warning:', e);
        }
    }, [currentConfig.audioGain, currentRhythm, volume]);

    // Audio Interval Loop
    useEffect(() => {
        if (intervalTimerRef.current) clearInterval(intervalTimerRef.current);

        if (isPlayingSound) {
            const beatIntervalMs = (60 / currentConfig.bpm) * 1000;
            playHeartbeatSound();
            intervalTimerRef.current = setInterval(playHeartbeatSound, beatIntervalMs);
        }

        return () => {
            if (intervalTimerRef.current) clearInterval(intervalTimerRef.current);
        };
    }, [isPlayingSound, currentConfig.bpm, playHeartbeatSound]);

    // Cleanup audio context on unmount
    useEffect(() => {
        return () => {
            if (intervalTimerRef.current) clearInterval(intervalTimerRef.current);
            if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
                audioCtxRef.current.close().catch(() => {});
            }
        };
    }, []);

    // ── 60 FPS HTML5 Canvas Real-Time ECG Renderer ─────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
        let height = (canvas.height = canvas.parentElement?.clientHeight || 200);

        let x = 0;
        let t = 0;
        const points: Array<{ x: number; y: number }> = [];
        const maxPoints = Math.floor(width);

        const render = () => {
            // Background Grid (Medical Phosphor Green/Teal)
            ctx.fillStyle = '#020b14';
            ctx.fillRect(0, 0, width, height);

            // Draw ECG Medical Grid Lines
            ctx.lineWidth = 1;
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
            const gridSize = 20;

            for (let gx = 0; gx < width; gx += gridSize) {
                ctx.beginPath();
                ctx.moveTo(gx, 0);
                ctx.lineTo(gx, height);
                ctx.stroke();
            }
            for (let gy = 0; gy < height; gy += gridSize) {
                ctx.beginPath();
                ctx.moveTo(0, gy);
                ctx.lineTo(width, gy);
                ctx.stroke();
            }

            // High-density major grid lines
            ctx.strokeStyle = 'rgba(6, 182, 212, 0.16)';
            for (let gx = 0; gx < width; gx += gridSize * 5) {
                ctx.beginPath();
                ctx.moveTo(gx, 0);
                ctx.lineTo(gx, height);
                ctx.stroke();
            }
            for (let gy = 0; gy < height; gy += gridSize * 5) {
                ctx.beginPath();
                ctx.moveTo(0, gy);
                ctx.lineTo(width, gy);
                ctx.stroke();
            }

            // Calculate P-Q-R-S-T cardiac voltage at current position
            const beatPeriod = (60 / currentConfig.bpm) * 60; // frames per beat
            const phase = (t % beatPeriod) / beatPeriod; // 0 to 1

            let voltage = 0;
            const midY = height / 2;

            if (phase >= 0.08 && phase < 0.18) {
                // P-wave (Atrial depolarization)
                const pPhase = (phase - 0.08) / 0.10;
                voltage = Math.sin(pPhase * Math.PI) * 16;
            } else if (phase >= 0.22 && phase < 0.26) {
                // Q-wave (Septal depolarization dip)
                voltage = -14;
            } else if (phase >= 0.26 && phase < 0.32) {
                // R-wave (Main Ventricular Depolarization Spike)
                const rPhase = (phase - 0.26) / 0.06;
                voltage = Math.sin(rPhase * Math.PI) * 85;
            } else if (phase >= 0.32 && phase < 0.36) {
                // S-wave (Late ventricular depolarization dip)
                voltage = -24;
            } else if (phase >= 0.44 && phase < (currentRhythm === 'QT_PROLONGED' ? 0.72 : 0.58)) {
                // T-wave (Ventricular Repolarization)
                const tEnd = currentRhythm === 'QT_PROLONGED' ? 0.72 : 0.58;
                const tPhase = (phase - 0.44) / (tEnd - 0.44);
                // In QT prolongation, T wave is wider and delayed
                voltage = Math.sin(tPhase * Math.PI) * (currentRhythm === 'QT_PROLONGED' ? 26 : 20);
            }

            // Add slight physiological baseline noise
            const noise = (Math.random() - 0.5) * 2;
            const currentY = midY - voltage + noise;

            points.push({ x, y: currentY });
            if (points.length > maxPoints) {
                points.shift();
            }

            // Render ECG Waveform with Phosphor Trail
            ctx.shadowColor = currentConfig.riskLevel === 'HIGH' ? '#f43f5e' : '#06b6d4';
            ctx.shadowBlur = 10;
            ctx.lineWidth = 2.2;
            ctx.strokeStyle = currentConfig.riskLevel === 'HIGH' ? '#fb7185' : '#22d3ee';

            ctx.beginPath();
            for (let i = 0; i < points.length; i++) {
                const pt = points[i];
                if (i === 0) {
                    ctx.moveTo(pt.x, pt.y);
                } else {
                    ctx.lineTo(pt.x, pt.y);
                }
            }
            ctx.stroke();

            // Render glowing scan head cursor
            if (points.length > 0) {
                const head = points[points.length - 1];
                ctx.fillStyle = '#ffffff';
                ctx.shadowColor = '#ffffff';
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.arc(head.x, head.y, 4, 0, Math.PI * 2);
                ctx.fill();
            }

            x = (x + 2) % width;
            if (x === 0) {
                points.length = 0;
            }
            t++;

            animationFrameRef.current = requestAnimationFrame(render);
        };

        render();

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [currentConfig.bpm, currentConfig.riskLevel, currentRhythm]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-fade-in select-none">
            <div className="relative w-full max-w-4xl bg-slate-900/95 border border-cyan-500/30 rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.25)] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                            <Activity size={22} className="animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-black text-white">Acoustic Bio-Telemetry & ECG Auscultator</h3>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${
                                    currentConfig.riskLevel === 'HIGH' 
                                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                                        : currentConfig.riskLevel === 'ELEVATED'
                                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                                }`}>
                                    {currentConfig.riskLevel} CARDIO-RISK
                                </span>
                            </div>
                            <p className="text-[11px] text-cyan-200/60 font-mono">
                                In-Silico Stethoscope · Compound: <strong className="text-white">{activeDrugName}</strong>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-100 border border-rose-500/30 transition-all cursor-pointer"
                        title="Close"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Canvas Oscilloscope Viewport */}
                <div className="p-4 sm:p-6 space-y-4">
                    <div className="relative w-full h-48 sm:h-56 rounded-2xl overflow-hidden border border-cyan-500/30 shadow-inner bg-[#020b14]">
                        <canvas ref={canvasRef} className="w-full h-full block" />

                        {/* Telemetry Overlays on Canvas */}
                        <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 font-mono text-xs">
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                            <span className="text-gray-400">LEAD II:</span>
                            <span className="text-white font-bold">{currentConfig.bpm} BPM</span>
                        </div>

                        <div className="absolute top-3 right-3 flex items-center gap-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10 font-mono text-[10px] text-gray-300">
                            <span>PR: <strong className="text-white">{currentConfig.prInterval}ms</strong></span>
                            <span>QRS: <strong className="text-white">{currentConfig.qrsDuration}ms</strong></span>
                            <span className={currentConfig.qtInterval > 460 ? 'text-rose-400 font-bold' : ''}>
                                QTc: <strong className={currentConfig.qtInterval > 460 ? 'text-rose-400' : 'text-white'}>{currentConfig.qtInterval}ms</strong>
                            </span>
                        </div>
                    </div>

                    {/* Stethoscope Audio Control Bar */}
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 flex flex-wrap items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setIsPlayingSound(v => !v)}
                                className={`px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
                                    isPlayingSound
                                        ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30'
                                        : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/30'
                                }`}
                            >
                                {isPlayingSound ? <Pause size={15} /> : <Play size={15} />}
                                <span>{isPlayingSound ? 'Mute Stethoscope' : 'Listen Stethoscope'}</span>
                            </button>

                            <div className="flex items-center gap-2">
                                <Volume2 size={16} className="text-gray-400" />
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={volume}
                                    onChange={e => setVolume(Number(e.target.value))}
                                    className="w-24 accent-cyan-400 h-1.5 bg-white/10 rounded-full cursor-pointer"
                                />
                            </div>
                        </div>

                        {/* Audio Status Banner */}
                        <div className="text-[11px] font-mono text-gray-300 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${isPlayingSound ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
                            <span>{isPlayingSound ? 'Synthesizing Acoustic S1/S2 Valves' : 'Auscultation Inactive'}</span>
                        </div>
                    </div>

                    {/* Rhythm Preset Switcher Tabs */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                            Simulated Cardiac Pathophysiology Mode
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                            {(Object.keys(RHYTHM_CONFIGS) as RhythmType[]).map((rKey) => {
                                const cfg = RHYTHM_CONFIGS[rKey];
                                const isSelected = currentRhythm === rKey;
                                return (
                                    <button
                                        key={rKey}
                                        onClick={() => setCurrentRhythm(rKey)}
                                        className={`p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                                            isSelected
                                                ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                                                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between text-[11px] font-bold">
                                            <span>{cfg.label.split(' ')[0]}</span>
                                            <span className="font-mono text-[9px] opacity-70">{cfg.bpm}BPM</span>
                                        </div>
                                        <p className="text-[9px] truncate opacity-60 mt-0.5">{cfg.label}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Pathophysiology Clinical Insight Box */}
                    <div className="p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs space-y-1">
                        <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-[11px]">
                            <Info size={14} />
                            <span>Clinical Acoustic Note: {currentConfig.label}</span>
                        </div>
                        <p className="text-gray-300 text-[11px] leading-relaxed">
                            {currentConfig.description}
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default BioTelemetryAuscultator;
