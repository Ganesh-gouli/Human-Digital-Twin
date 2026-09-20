import React, { useState, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import DnaHelix3D from './DnaHelix3D';
import MolecularModel3D from './MolecularModel3D';

interface FuturisticBiomolecularPodProps {
    mode?: 'drug' | 'disease';
    drugName?: string;
    diseaseName?: string;
    cureProgress?: number;
    initialTab?: 'dna' | 'molecule';
    onClose?: () => void;
}

export const FuturisticBiomolecularPod: React.FC<FuturisticBiomolecularPodProps> = ({
    mode = 'drug',
    drugName = 'Active Compound',
    diseaseName = 'Pathogen Virion',
    cureProgress = 0,
    initialTab = 'dna',
    onClose
}) => {
    const [activeModel, setActiveModel] = useState<'dna' | 'molecule'>(initialTab);
    const [isMinimized, setIsMinimized] = useState(false);
    const [autoRotate, setAutoRotate] = useState(true);
    const orbitRef = useRef<any>(null);

    return (
        <div className="absolute top-16 sm:top-24 left-2 sm:left-4 z-30 pointer-events-auto no-print select-none transition-all duration-300 max-w-[calc(100vw-1rem)]">
            {isMinimized ? (
                /* ── Minimized Floating Cyber Pill ── */
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsMinimized(false)}
                        className="flex items-center gap-2.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-2xl bg-slate-950/90 border border-cyan-500/40 text-cyan-300 hover:text-white backdrop-blur-2xl shadow-[0_0_24px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 transition-all text-xs font-bold cursor-pointer group"
                    >
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#06b6d4]" />
                        <span>{activeModel === 'dna' ? '🧬 3D DNA' : mode === 'disease' ? '🦠 3D Pathogen' : '⚛️ 3D Molecule'}</span>
                        <span className="text-[10px] text-cyan-400 group-hover:translate-y-[-1px] transition-transform">▲ Expand</span>
                    </button>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl bg-slate-950/80 border border-white/10 text-white/40 hover:text-white text-xs cursor-pointer"
                            title="Close Pod"
                        >
                            ✕
                        </button>
                    )}
                </div>
            ) : (
                /* ── Futuristic Holographic 3D Space Card ── */
                <div className="w-[270px] sm:w-[300px] rounded-3xl bg-slate-950/90 backdrop-blur-2xl border border-cyan-500/35 shadow-[0_0_40px_rgba(6,182,212,0.2)] overflow-hidden relative group">
                    {/* Sci-Fi Decorative Corner Crosshairs */}
                    <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400/80 pointer-events-none" />
                    <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400/80 pointer-events-none" />
                    <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-400/80 pointer-events-none" />
                    <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400/80 pointer-events-none" />

                    {/* Cyber Header Bar */}
                    <div className="px-3.5 pt-3 pb-2 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-cyan-950/30 via-transparent to-transparent">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
                            </span>
                            <div>
                                <h4 className="text-[11px] font-black uppercase tracking-wider text-cyan-300 leading-tight">
                                    Sub-Scale 3D Space
                                </h4>
                                <span className="text-[8px] font-mono text-white/40 tracking-widest block uppercase">
                                    {activeModel === 'dna' ? 'Genomic Core' : mode === 'disease' ? 'Viral Architecture' : 'Molecular Ligand'}
                                </span>
                            </div>
                        </div>

                        {/* Top Controls: Rotate & Minimize */}
                        <div className="flex items-center gap-1.5">
                            <button
                                onClick={() => setAutoRotate(v => !v)}
                                className={`p-1 rounded-lg border text-[10px] transition-all cursor-pointer ${
                                    autoRotate
                                        ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                                        : 'bg-white/5 border-white/10 text-white/40 hover:text-white'
                                }`}
                                title={autoRotate ? "Pause 3D auto-spin" : "Play 3D auto-spin"}
                            >
                                {autoRotate ? '⏸' : '▶'}
                            </button>
                            <button
                                onClick={() => {
                                    if (orbitRef.current) {
                                        orbitRef.current.reset();
                                    }
                                }}
                                className="p-1 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white text-[10px] transition-all cursor-pointer"
                                title="Reset 3D camera"
                            >
                                ↺
                            </button>
                            <button
                                onClick={() => setIsMinimized(true)}
                                className="p-1 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white text-[10px] transition-all cursor-pointer"
                                title="Minimize Pod"
                            >
                                —
                            </button>
                            {onClose && (
                                <button
                                    onClick={onClose}
                                    className="p-1 rounded-lg bg-white/5 border border-white/10 text-white/40 hover:text-white text-[10px] transition-all cursor-pointer"
                                    title="Close 3D Pod"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Model Switcher Tabs */}
                    <div className="p-1.5 bg-black/40 flex items-center gap-1 border-b border-white/5">
                        <button
                            onClick={() => setActiveModel('dna')}
                            className={`flex-1 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                activeModel === 'dna'
                                    ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                                    : 'text-white/40 hover:text-white/80 border border-transparent'
                            }`}
                        >
                            <span>🧬</span>
                            <span>DNA Helix</span>
                        </button>

                        <button
                            onClick={() => setActiveModel('molecule')}
                            className={`flex-1 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                activeModel === 'molecule'
                                    ? (mode === 'disease'
                                        ? 'bg-rose-500/25 text-rose-200 border border-rose-400/50 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                                        : 'bg-purple-500/25 text-purple-200 border border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.3)]')
                                    : 'text-white/40 hover:text-white/80 border border-transparent'
                            }`}
                        >
                            <span>{mode === 'disease' ? '🦠' : '⚛️'}</span>
                            <span>{mode === 'disease' ? 'Pathogen' : 'Molecule'}</span>
                        </button>
                    </div>

                    {/* ── Dedicated 3D Canvas Space ── */}
                    <div className="w-full h-[210px] sm:h-[230px] relative bg-gradient-to-b from-[#020617] via-[#050c1e] to-[#020617] overflow-hidden">
                        {/* Background Holographic Grid / Scanlines */}
                        <div
                            className="absolute inset-0 pointer-events-none opacity-20"
                            style={{
                                backgroundImage: `
                                    linear-gradient(rgba(6,182,212,0.2) 1px, transparent 1px),
                                    linear-gradient(90deg, rgba(6,182,212,0.2) 1px, transparent 1px)
                                `,
                                backgroundSize: '24px 24px'
                            }}
                        />

                        <Canvas camera={{ position: [0, 0, 4.3], fov: 42 }}>
                            <ambientLight intensity={0.8} color="#ffffff" />
                            <pointLight position={[5, 5, 5]} intensity={1.5} color="#38bdf8" />
                            <pointLight position={[-5, -5, -5]} intensity={1.2} color="#a855f7" />
                            <spotLight position={[0, 4, 2]} angle={0.5} penumbra={0.8} intensity={2} color="#ffffff" />

                            <Suspense fallback={null}>
                                {activeModel === 'dna' ? (
                                    <DnaHelix3D position={[0, 0, 0]} scale={0.92} speed={autoRotate ? 1.0 : 0} />
                                ) : (
                                    <MolecularModel3D
                                        position={[0, 0, 0]}
                                        scale={0.95}
                                        mode={mode === 'disease' ? 'pathogen' : 'molecule'}
                                        speed={autoRotate ? 1.0 : 0}
                                    />
                                )}
                            </Suspense>

                            <OrbitControls
                                ref={orbitRef}
                                enablePan={false}
                                minDistance={2.5}
                                maxDistance={7.5}
                                autoRotate={autoRotate}
                                autoRotateSpeed={1.2}
                                enableDamping
                                dampingFactor={0.08}
                            />
                            <Environment preset="city" blur={1} />
                        </Canvas>

                        {/* Interactive Drag Hint */}
                        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 pointer-events-none px-2 py-0.5 rounded-full bg-black/50 border border-white/5 backdrop-blur-sm">
                            <span className="text-[8px] font-mono text-white/30 tracking-wider">Drag to rotate 3D view</span>
                        </div>
                    </div>

                    {/* ── Telemetry HUD Readout Footer ── */}
                    <div className="p-3 bg-slate-950/95 border-t border-white/10 text-xs space-y-1.5">
                        {activeModel === 'dna' ? (
                            <>
                                <div className="flex items-center justify-between text-[9px] font-mono">
                                    <span className="text-cyan-400 font-bold">DNA Helix (GRCh38)</span>
                                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">99.8% Match</span>
                                </div>
                                <div className="grid grid-cols-2 gap-1 text-[8px] font-mono">
                                    <div className="bg-white/5 p-1 rounded border border-white/5 text-white/70">
                                        <strong className="text-cyan-300">A-T:</strong> 58.2%
                                    </div>
                                    <div className="bg-white/5 p-1 rounded border border-white/5 text-white/70">
                                        <strong className="text-purple-300">G-C:</strong> 41.8%
                                    </div>
                                </div>
                                <div className="text-[8px] font-mono text-white/30 truncate">
                                    Seq: 5'-ATTGCCGAATTCGGCTA-3'
                                </div>
                            </>
                        ) : mode === 'disease' ? (
                            <>
                                <div className="flex items-center justify-between text-[9px] font-mono">
                                    <span className="text-rose-400 font-bold truncate max-w-[170px]">{diseaseName}</span>
                                    <span className="text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">Spike Virion</span>
                                </div>
                                <div className="grid grid-cols-2 gap-1 text-[8px] font-mono">
                                    <div className="bg-white/5 p-1 rounded border border-white/5 text-white/70">
                                        <strong className="text-rose-300">Symmetry:</strong> Icosahedral
                                    </div>
                                    <div className="bg-white/5 p-1 rounded border border-white/5 text-white/70">
                                        <strong className="text-emerald-300">Neutralized:</strong> {cureProgress}%
                                    </div>
                                </div>
                                <div className="text-[8px] font-mono text-white/30 truncate">
                                    Capsid: 30 Surface Glycoproteins
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center justify-between text-[9px] font-mono">
                                    <span className="text-purple-300 font-bold truncate max-w-[170px]">{drugName}</span>
                                    <span className="text-sky-400 font-bold bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20">Active Ligand</span>
                                </div>
                                <div className="grid grid-cols-2 gap-1 text-[8px] font-mono">
                                    <div className="bg-white/5 p-1 rounded border border-white/5 text-white/70">
                                        <strong className="text-sky-300">Valence:</strong> sp² Hybrid
                                    </div>
                                    <div className="bg-white/5 p-1 rounded border border-white/5 text-white/70">
                                        <strong className="text-rose-300">Affinity:</strong> 94.2 nM
                                    </div>
                                </div>
                                <div className="text-[8px] font-mono text-white/30 truncate">
                                    Orbitals: 3 Quantum Valence Rings
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FuturisticBiomolecularPod;
