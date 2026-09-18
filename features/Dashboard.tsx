import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { ExperimentDossier } from '../types';
import { generateHealthTip } from '../services/geminiService';
import { LiquidGlassCard } from './DashboardComponents';

export { LiquidGlassCard };

export const Dashboard: React.FC = () => {
    const { user, navigateTo, savedExperiments, loadExperiment, language, openGuide } = useAppContext();
    const [researchInsight, setResearchInsight] = useState<string>('');
    const [isLoadingInsight, setIsLoadingInsight] = useState(false);

    useEffect(() => {
        setIsLoadingInsight(true);
        generateHealthTip(language)
            .then(insight => setResearchInsight(insight))
            .catch(() => setResearchInsight("Preclinical In-Silico Rule: Evaluating multi-organ CYP450 clearance and hERG channel affinity computationally avoids 68% of Phase-I preclinical animal and human adverse reactions."))
            .finally(() => setIsLoadingInsight(false));
    }, [language]);

    const getVerdictBadge = (verdict: string) => {
        switch (verdict) {
            case 'RECOMMENDED':
                return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300';
            case 'CAUTION':
                return 'bg-amber-500/15 border-amber-500/30 text-amber-300';
            case 'CONTRAINDICATED':
                return 'bg-rose-500/15 border-rose-500/30 text-rose-300';
            default:
                return 'bg-teal-500/15 border-teal-500/30 text-teal-300';
        }
    };

    return (
        <div className="relative min-h-screen text-white pb-24 font-sans selection:bg-teal-500/30 selection:text-white space-y-9 animate-fade-in">

            {/* Background Atmosphere */}
            <div className="fixed inset-0 z-0 bg-[#030712] overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[140px]"></div>
                <div className="absolute top-[30%] right-[-10%] w-[50%] h-[50%] bg-cyan-600/10 rounded-full blur-[150px]"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[140px]"></div>
            </div>

            {/* Laboratory Hero Section */}
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-2">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 text-xs font-mono font-bold tracking-wider mb-2">
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                        IN-SILICO PRECLINICAL RESEARCH STATION
                    </div>
                    <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                        Executive Research Hub
                    </h1>
                    <p className="text-sm md:text-base text-teal-200/70 mt-1 max-w-2xl font-light">
                        <span className="font-semibold text-teal-300">“Test on a virtual human first, then validate in the real world.”</span>
                        {' '}Simulate drug kinetics, evaluate multi-organ toxicities, and screen emerging disease candidates in-silico.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => openGuide('overview')}
                        className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500/15 to-cyan-500/15 hover:from-teal-500/25 hover:to-cyan-500/25 text-teal-300 border border-teal-500/40 font-bold text-xs shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
                        <span>💡</span>
                        <span>How BioTwin Works</span>
                    </button>

                    <button
                        onClick={() => navigateTo('DRUG_VISUALIZER')}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(45,212,191,0.3)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
                        <span>Launch 3D Twin Lab</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </button>
                </div>
            </div>

            {/* Platform Orientation & System Understanding Interactive Banner */}
            <div className="relative z-10 p-6 rounded-3xl bg-gradient-to-r from-teal-950/40 via-[#070e1b] to-blue-950/30 border border-teal-500/30 backdrop-blur-xl shadow-xl space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">
                                BioTwin Understanding Center
                            </span>
                        </div>
                        <h3 className="text-lg font-black text-white">
                            New to the BioTwin Digital Twin Platform?
                        </h3>
                        <p className="text-xs text-gray-300 font-light max-w-2xl">
                            Understand the underlying mathematics, 4-stage simulation pipeline, 5 anatomical 3D layers, and try guided preclinical case studies with a single click.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => openGuide('pipeline')}
                            className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-teal-500/20 text-gray-300 hover:text-teal-300 border border-white/10 hover:border-teal-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <span>⚡</span>
                            <span>4-Stage Pipeline</span>
                        </button>

                        <button
                            onClick={() => openGuide('layers')}
                            className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-teal-500/20 text-gray-300 hover:text-teal-300 border border-white/10 hover:border-teal-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <span>🧍</span>
                            <span>3D Anatomy Layers</span>
                        </button>

                        <button
                            onClick={() => openGuide('casestudies')}
                            className="px-3 py-2 rounded-xl bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 border border-teal-500/40 text-xs font-bold transition-all hover:scale-105 flex items-center gap-1.5 cursor-pointer shadow-[0_0_12px_rgba(20,184,166,0.2)]"
                        >
                            <span>🧪</span>
                            <span>1-Click Case Studies</span>
                        </button>

                        <button
                            onClick={() => openGuide('glossary')}
                            className="px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-teal-500/20 text-gray-300 hover:text-teal-300 border border-white/10 hover:border-teal-500/30 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <span>📖</span>
                            <span>Metrics Decoder</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Validation Notice Box */}
            <div className="relative z-10 p-4 rounded-2xl bg-teal-950/30 border border-teal-500/20 backdrop-blur-md flex items-center gap-4">
                <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="text-xs text-teal-200/80 leading-relaxed">
                    <span className="font-bold text-white uppercase tracking-wider text-[10px] mr-1.5">Preclinical Protocol Notice:</span>
                    All computational predictions are intended to safely prioritize therapeutic candidates, elucidate organ-specific mechanisms, and identify toxic thresholds. Empirical laboratory validation (in-vitro assays and clinical trials) remains mandatory.
                </div>
            </div>

            {/* Virtual Twin Subject Telemetry Grid */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Twin Profile */}
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md relative overflow-hidden">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400 mb-1">Active Subject Twin</div>
                    <div className="text-2xl font-black text-white">{user?.name || 'Dr. Alex Vance'}</div>
                    <div className="text-xs text-gray-400 mt-1">
                        {user?.age || 35} yrs • {user?.gender?.toUpperCase() || 'MALE'} • {user?.weight || 72} kg
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-teal-300/80 font-mono">
                        <span>Body Surface: ~1.88 m²</span>
                        <span>Vd: ~43.2 L</span>
                    </div>
                </div>

                {/* Clearance & Organ Telemetry */}
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md relative overflow-hidden">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 mb-1">Renal & Hepatic Clearance</div>
                    <div className="text-2xl font-black text-white">{user?.estimatedGFR || 105} <span className="text-sm font-medium text-gray-400">mL/min</span></div>
                    <div className="text-xs text-gray-400 mt-1">
                        Est. Creatinine Clearance (Cockcroft-Gault)
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-cyan-300/80 font-mono">
                        <span>Status: Normal Excretion</span>
                        <span>Stage: G1</span>
                    </div>
                </div>

                {/* Genomic Metabolizer Phenotype */}
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md relative overflow-hidden">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 mb-1">CYP450 Genomic Profile</div>
                    <div className="text-lg font-black text-white truncate">{user?.cypProfile || 'CYP2D6 *1/*1 Normal'}</div>
                    <div className="text-xs text-gray-400 mt-1">
                        Hepatic phase-I oxidation kinetics
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-purple-300/80 font-mono">
                        <span>First-pass: Standard</span>
                        <span>Accumulation: Low</span>
                    </div>
                </div>

                {/* In-Silico Experiment Counter */}
                <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md relative overflow-hidden">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 mb-1">Dossiers Recorded</div>
                    <div className="text-2xl font-black text-white">{savedExperiments.length} <span className="text-sm font-medium text-gray-400">Experiments</span></div>
                    <div className="text-xs text-gray-400 mt-1">
                        Preclinical candidate simulations saved
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-emerald-300/80 font-mono">
                        <span>Confidence: ~94.5%</span>
                        <span>Uncertainty: ±4.2%</span>
                    </div>
                </div>
            </div>

            {/* Scientific Workspaces Grid (Core Features) */}
            <div className="relative z-10 space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                    <span className="w-1.5 h-6 bg-teal-400 rounded-full"></span>
                    Primary Research Workspaces
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Workspace 1: 3D Twin Drug Impact Visualizer */}
                    <div
                        onClick={() => navigateTo('DRUG_VISUALIZER')}
                        className="group p-6 rounded-3xl bg-gradient-to-br from-teal-900/20 via-white/[0.02] to-cyan-900/10 border border-teal-500/20 hover:border-teal-400/50 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(20,184,166,0.15)] cursor-pointer flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                                🧬
                            </div>
                            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400 mb-1">Flagship Engine</div>
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-teal-300 transition-colors">
                                3D Human Digital Twin & Drug Impact
                            </h3>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Real-time pharmacokinetic simulation across 5 anatomical layers (Body, Muscles, Nerves, Skeleton, Organs). Calculate organ-specific toxicity heatmaps, receptor kinetics, and accumulation factors.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-teal-300">
                            <span>Open 3D Simulator</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                    </div>

                    {/* Workspace 2: Pandemic & Emerging Disease Modeling */}
                    <div
                        onClick={() => navigateTo('DRUG_VISUALIZER')}
                        className="group p-6 rounded-3xl bg-gradient-to-br from-rose-900/20 via-white/[0.02] to-amber-900/10 border border-rose-500/20 hover:border-rose-400/50 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(244,63,94,0.15)] cursor-pointer flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                                🦠
                            </div>
                            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400 mb-1">Pandemic Rapid Response</div>
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-rose-300 transition-colors">
                                Emerging Disease & Pathogen Simulator
                            </h3>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Safe computational modeling of viral and bacterial pathogen spread ($R_0$, organ tropism, and timeline progression). Evaluate candidate antivirals, therapeutic cocktails, and mRNA vaccine codons.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-rose-300">
                            <span>Launch Disease Lab</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                    </div>

                    {/* Workspace 3: Candidate Cross-Comparison Matrix */}
                    <div
                        onClick={() => navigateTo('DRUG_VISUALIZER')}
                        className="group p-6 rounded-3xl bg-gradient-to-br from-blue-900/20 via-white/[0.02] to-purple-900/10 border border-blue-500/20 hover:border-blue-400/50 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_rgba(59,130,246,0.15)] cursor-pointer flex flex-col justify-between"
                    >
                        <div>
                            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                                ⚖️
                            </div>
                            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-400 mb-1">Comparative Pharmacology</div>
                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                                Candidate Cross-Comparison Matrix
                            </h3>
                            <p className="text-xs text-gray-400 leading-relaxed">
                                Side-by-side comparative toxicity and efficacy analysis. Determine whether Candidate A offers a safer therapeutic index than Candidate B before initiating expensive animal studies.
                            </p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-blue-300">
                            <span>Compare Candidates</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Saved Preclinical Virtual Experiment Dossiers */}
            <div className="relative z-10 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                        <span className="w-1.5 h-6 bg-cyan-400 rounded-full"></span>
                        Preclinical Virtual Experiment Dossiers ({savedExperiments.length})
                    </h2>
                    <span className="text-xs text-gray-400 font-mono">
                        Saved in-silico simulation runs
                    </span>
                </div>

                <div className="space-y-3">
                    {savedExperiments.map((exp: ExperimentDossier) => (
                        <div
                            key={exp.id}
                            className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-teal-500/30 backdrop-blur-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                        >
                            <div className="space-y-1.5 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-gray-300">
                                        {exp.id}
                                    </span>
                                    <span className="text-[10px] font-mono text-gray-400">
                                        {exp.timestamp}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getVerdictBadge(exp.triageVerdict)}`}>
                                        {exp.triageVerdict}
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20">
                                        Confidence: {exp.confidenceScore}% (±{exp.uncertaintyMargin}%)
                                    </span>
                                </div>

                                <h4 className="text-sm md:text-base font-bold text-white flex items-center gap-2">
                                    {exp.title}
                                </h4>

                                <div className="text-xs text-gray-400 flex flex-wrap items-center gap-x-4 gap-y-1">
                                    <span>Target: <strong className="text-teal-300">{exp.targetCompound}</strong></span>
                                    {exp.secondaryCompound && <span>vs <strong className="text-blue-300">{exp.secondaryCompound}</strong></span>}
                                    <span>Dose: {exp.dosage}</span>
                                    <span>Route: {exp.route}</span>
                                    <span>Subject: {exp.cohort.age}y {exp.cohort.gender}</span>
                                </div>

                                <p className="text-xs text-gray-300/80 italic pt-1">
                                    "{exp.notes}"
                                </p>
                            </div>

                            {/* Organ Strain Badges */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                <div className="flex flex-wrap gap-1.5">
                                    {exp.organToxicities.slice(0, 3).map((tox, i) => (
                                        <span
                                            key={i}
                                            className={`text-[10px] font-mono px-2 py-1 rounded-lg border ${
                                                tox.toxicity_level === 'severe' || tox.toxicity_level === 'high'
                                                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                                                    : tox.toxicity_level === 'moderate'
                                                    ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                                                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                                            }`}
                                        >
                                            {tox.organ}: {tox.strain_score}/100
                                        </span>
                                    ))}
                                </div>

                                <button
                                    onClick={() => loadExperiment(exp)}
                                    className="px-4 py-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 shadow-sm"
                                >
                                    <span>Load in 3D Twin</span>
                                    <span>→</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Scientific Insight Section */}
            <div className="relative z-10 p-6 rounded-3xl bg-gradient-to-r from-teal-950/40 via-cyan-950/30 to-blue-950/40 border border-teal-500/20 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center gap-5">
                <div className="p-3.5 rounded-2xl bg-teal-500/20 border border-teal-500/30 text-teal-300 text-2xl flex-shrink-0">
                    💡
                </div>
                <div className="flex-1 space-y-1">
                    <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">
                        In-Silico Pharmacology Directive
                    </div>
                    <p className="text-sm font-serif italic text-white/90 leading-relaxed">
                        "{researchInsight || "Preclinical in-silico screening allows computational elimination of toxic candidate molecules before sacrificing laboratory animals or advancing to costly human trials."}"
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
