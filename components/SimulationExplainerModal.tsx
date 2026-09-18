import React from 'react';
import { DrugAnalysisResult, DiseaseSimulationResult, UserProfile } from '../types';
import { Brain, AlertTriangle, ShieldCheck, Activity, Dna, X, ChevronRight, Sparkles, HelpCircle } from 'lucide-react';

interface SimulationExplainerModalProps {
    isOpen: boolean;
    onClose: () => void;
    drugResult: DrugAnalysisResult | null;
    diseaseResult: DiseaseSimulationResult | null;
    mode: 'drug' | 'disease';
    user: UserProfile | null;
    onOpenFullGuide: (tab?: string) => void;
}

export const SimulationExplainerModal: React.FC<SimulationExplainerModalProps> = ({
    isOpen,
    onClose,
    drugResult,
    diseaseResult,
    mode,
    user,
    onOpenFullGuide
}) => {
    if (!isOpen) return null;

    const isDrug = mode === 'drug' && drugResult;
    const isDisease = mode === 'disease' && diseaseResult;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fade-in font-sans">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/80 backdrop-blur-xl transition-opacity"
                onClick={onClose}
            />

            {/* Modal Window */}
            <div className="relative z-10 w-full max-w-3xl max-h-[90vh] bg-[#070d19] border border-teal-500/30 rounded-3xl shadow-[0_0_60px_rgba(20,184,166,0.25)] flex flex-col overflow-hidden ring-1 ring-white/10">
                
                {/* Header */}
                <div className="flex-shrink-0 px-6 py-5 border-b border-white/10 bg-gradient-to-r from-teal-950/40 via-slate-900 to-cyan-950/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
                            <Sparkles size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg sm:text-xl font-black text-white">
                                    Simulation Deconstruction & Rationale
                                </h3>
                                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-mono font-bold uppercase">
                                    {isDrug ? drugResult?.drug_name : diseaseResult?.disease_name}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Plain-English scientific explanation of organ shaders, strain scores, and genomic responses.
                            </p>
                        </div>
                    </div>

                    <button 
                        onClick={onClose}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-all cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 text-gray-200 scrollbar-thin scrollbar-thumb-teal-500/20">
                    
                    {/* Primary Mechanism Summary */}
                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 space-y-2">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                            <Activity size={14} />
                            <span>1. Primary Biochemical Action</span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-light">
                            {isDrug 
                                ? (drugResult?.primary_mechanism || drugResult?.mechanism || 'Reversible receptor modulation and downstream enzymatic regulation.')
                                : (diseaseResult?.disease_injection?.spread_mechanism || 'Viral/bacterial cellular invasion triggering inflammatory cytokine cascades.')
                            }
                        </p>
                        {isDrug && drugResult?.pharmacokinetics && (
                            <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono text-teal-300/80 border-t border-white/5">
                                <span>Onset: ~{drugResult.pharmacokinetics.onset_minutes} min</span>
                                <span>Peak (Cmax): ~{drugResult.pharmacokinetics.peak_minutes} min</span>
                                <span>Duration: ~{drugResult.pharmacokinetics.duration_hours} hrs</span>
                                <span>Bioavailability: ~{drugResult.pharmacokinetics.bioavailability_estimate}%</span>
                            </div>
                        )}
                    </div>

                    {/* Why Organs Lit Up (Organ Strain Breakdown) */}
                    <div className="space-y-3">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                                <Brain size={14} />
                                2. Why Did These Organs Change Color?
                            </span>
                            <span className="text-gray-400 lowercase font-normal">
                                (color mapped to 0-100 strain index)
                            </span>
                        </div>

                        <div className="space-y-2.5">
                            {isDrug && (drugResult?.effects || drugResult?.heatmap_effects || []).slice(0, 5).map((eff: any, idx: number) => {
                                const organName = eff.structure_name || eff.organ || 'Target Tissue';
                                const strain = Math.round((eff.intensity || 0.5) * 100);
                                const isSevere = strain >= 70 || eff.toxic_threshold || eff.risk_level === 'severe' || eff.risk_level === 'high';
                                const isMod = strain >= 40 && strain < 70;

                                return (
                                    <div key={idx} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-white text-xs">{organName}</span>
                                                <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${
                                                    isSevere ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' :
                                                    isMod ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                                                    'bg-teal-500/20 text-teal-300 border-teal-500/30'
                                                }`}>
                                                    Strain: {strain}/100 • {eff.effect_type || eff.risk_level || 'Impact'}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-gray-400 leading-normal font-light">
                                                {eff.mechanism || eff.mechanism_hypothesis || eff.predicted_effect || 'Cellular metabolic processing.'}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}

                            {isDisease && diseaseResult?.disease_injection?.affected_organs?.map((org, idx) => (
                                <div key={idx} className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between">
                                    <span className="font-bold text-white text-xs">{org}</span>
                                    <span className="text-[10px] font-mono text-rose-300 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                                        Active Infection Tropism
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Genomic Twin Modulation */}
                    <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/20 space-y-2">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                            <Dna size={14} />
                            <span>3. How This Virtual Twin’s Genetics & Physiology Influenced The Run</span>
                        </div>
                        <p className="text-xs text-purple-200/90 leading-relaxed font-light">
                            Simulation was computed for subject <strong>{user?.name || 'Calibrated Twin'}</strong> (Age: {user?.age || 35}y, Weight: {user?.weight || 72}kg, Sex: {user?.gender?.toUpperCase() || 'MALE'}).
                        </p>
                        <ul className="text-xs text-purple-200/80 space-y-1 font-light pt-1">
                            <li>• <strong>CYP450 Kinetics:</strong> Modulated for {user?.cypProfile || 'CYP2D6 *1/*1 Normal'}. Affects hepatic first-pass rate and parent-drug half-life.</li>
                            <li>• <strong>Renal Clearance:</strong> Scaled to Cockcroft-Gault CrCl of {user?.estimatedGFR || 105} mL/min. Determines glomerular excretion rate and avoids drug accumulation.</li>
                        </ul>
                    </div>

                    {/* Preclinical Recommendation */}
                    <div className="p-5 rounded-2xl bg-teal-950/30 border border-teal-500/20 space-y-2">
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                            <ShieldCheck size={14} />
                            <span>4. Preclinical Action Recommendation</span>
                        </div>
                        <p className="text-xs text-teal-200/90 leading-relaxed font-light">
                            {isDrug && (drugResult?.system_wide_risk_score || 0) > 0.6 ? (
                                <span className="text-rose-300">
                                    ⚠️ High organ strain detected. Consider applying <strong>De Novo Molecular Optimization</strong> in the Chemical Synthesis Console to synthesize an organ-sparing derivative, or perform dedicated in-vitro cytotoxicity assays before animal dosing.
                                </span>
                            ) : (
                                <span>
                                    ✅ Acceptable therapeutic window. Low off-target toxicity profile indicates high safety priority for in-vitro confirmatory assays.
                                </span>
                            )}
                        </p>
                    </div>

                </div>

                {/* Footer */}
                <div className="flex-shrink-0 px-6 py-4 bg-slate-950/80 border-t border-white/10 flex items-center justify-between">
                    <button
                        onClick={() => {
                            onClose();
                            onOpenFullGuide('pipeline');
                        }}
                        className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1.5 font-bold transition-colors cursor-pointer"
                    >
                        <span>View Full 4-Stage Mathematical Pipeline</span>
                        <ChevronRight size={14} />
                    </button>

                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-all cursor-pointer"
                    >
                        Close Explainer
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SimulationExplainerModal;
