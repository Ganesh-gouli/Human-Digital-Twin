import React, { useState } from 'react';
import { Dna, Sliders, ShieldAlert, Check, RefreshCw, X, AlertTriangle, ArrowRight, User } from 'lucide-react';

export interface PharmacogenomicProfile {
    cyp2d6: 'NORMAL' | 'POOR' | 'INTERMEDIATE' | 'ULTRARAPID';
    cyp3a4: 'NORMAL' | 'INHIBITED' | 'INDUCED';
    egfr: number; // mL/min/1.73m² (15 to 120)
    ageCohort: 'PEDIATRIC' | 'ADULT' | 'GERIATRIC';
    toxicityMultiplier: number; // 0.5x to 3.5x
    halfLifeMultiplier: number;
    recommendedDoseAdjustment: string;
}

interface PharmacogenomicMutatorProps {
    isOpen: boolean;
    onClose: () => void;
    currentProfile: PharmacogenomicProfile;
    onApplyProfile: (newProfile: PharmacogenomicProfile) => void;
    activeDrugName?: string;
}

export const DEFAULT_PHARMACOGENOMIC_PROFILE: PharmacogenomicProfile = {
    cyp2d6: 'NORMAL',
    cyp3a4: 'NORMAL',
    egfr: 105,
    ageCohort: 'ADULT',
    toxicityMultiplier: 1.0,
    halfLifeMultiplier: 1.0,
    recommendedDoseAdjustment: 'Standard 100% Recommended Preclinical Dose'
};

export function calculatePharmacogenomicMultipliers(
    cyp2d6: PharmacogenomicProfile['cyp2d6'],
    cyp3a4: PharmacogenomicProfile['cyp3a4'],
    egfr: number,
    ageCohort: PharmacogenomicProfile['ageCohort']
): { toxicityMultiplier: number; halfLifeMultiplier: number; recommendedDoseAdjustment: string } {
    let tox = 1.0;
    let tHalf = 1.0;

    // CYP2D6 Polymorphism
    if (cyp2d6 === 'POOR') {
        tox += 0.75;
        tHalf += 0.85;
    } else if (cyp2d6 === 'INTERMEDIATE') {
        tox += 0.25;
        tHalf += 0.30;
    } else if (cyp2d6 === 'ULTRARAPID') {
        tox -= 0.30;
        tHalf -= 0.40;
    }

    // CYP3A4 Status
    if (cyp3a4 === 'INHIBITED') {
        tox += 0.60;
        tHalf += 0.50;
    } else if (cyp3a4 === 'INDUCED') {
        tox -= 0.25;
        tHalf -= 0.30;
    }

    // Renal Function (eGFR)
    if (egfr < 30) {
        tox += 1.10;
        tHalf += 0.90;
    } else if (egfr < 60) {
        tox += 0.45;
        tHalf += 0.40;
    }

    // Age Cohort
    if (ageCohort === 'GERIATRIC') {
        tox += 0.35;
        tHalf += 0.30;
    } else if (ageCohort === 'PEDIATRIC') {
        tox += 0.20;
    }

    tox = Math.max(0.4, Number(tox.toFixed(2)));
    tHalf = Math.max(0.4, Number(tHalf.toFixed(2)));

    let doseRecommendation = 'Standard Preclinical Dosage (100%)';
    if (tox > 2.0) {
        doseRecommendation = 'Critical Dose Reduction Needed: Administer 30% - 40% of Standard Dose';
    } else if (tox > 1.4) {
        doseRecommendation = 'Moderate Dose Reduction: Administer 60% - 75% of Standard Dose';
    } else if (tox < 0.75) {
        doseRecommendation = 'Rapid Clearance: May require 125% - 150% Dose for Therapeutic Window';
    }

    return {
        toxicityMultiplier: tox,
        halfLifeMultiplier: tHalf,
        recommendedDoseAdjustment: doseRecommendation
    };
}

export const PharmacogenomicMutatorModal: React.FC<PharmacogenomicMutatorProps> = ({
    isOpen,
    onClose,
    currentProfile,
    onApplyProfile,
    activeDrugName = 'Active Compound'
}) => {
    const [cyp2d6, setCyp2d6] = useState(currentProfile.cyp2d6);
    const [cyp3a4, setCyp3a4] = useState(currentProfile.cyp3a4);
    const [egfr, setEgfr] = useState(currentProfile.egfr);
    const [ageCohort, setAgeCohort] = useState(currentProfile.ageCohort);

    const calculated = calculatePharmacogenomicMultipliers(cyp2d6, cyp3a4, egfr, ageCohort);

    const handleApply = () => {
        onApplyProfile({
            cyp2d6,
            cyp3a4,
            egfr,
            ageCohort,
            ...calculated
        });
        onClose();
    };

    const handleReset = () => {
        setCyp2d6(DEFAULT_PHARMACOGENOMIC_PROFILE.cyp2d6);
        setCyp3a4(DEFAULT_PHARMACOGENOMIC_PROFILE.cyp3a4);
        setEgfr(DEFAULT_PHARMACOGENOMIC_PROFILE.egfr);
        setAgeCohort(DEFAULT_PHARMACOGENOMIC_PROFILE.ageCohort);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-fade-in select-none">
            <div className="relative w-full max-w-2xl bg-slate-900/95 border border-purple-500/30 rounded-3xl shadow-[0_0_60px_rgba(168,85,247,0.25)] overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                            <Dna size={22} className="animate-spin-slow" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-black text-white">Pharmacogenomic Patient Mutator</h3>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                    CYP450 & eGFR Engine
                                </span>
                            </div>
                            <p className="text-[11px] text-purple-200/60 font-mono">
                                Calibrating Virtual Cohort for: <strong className="text-white">{activeDrugName}</strong>
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

                {/* Body Settings */}
                <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar space-y-6">

                    {/* Age Cohort Switcher */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                            1. Virtual Patient Demographic Cohort
                        </label>
                        <div className="grid grid-cols-3 gap-2.5">
                            {[
                                { id: 'PEDIATRIC', label: 'Pediatric', detail: '6 yrs (Immature Liver Enzymes)' },
                                { id: 'ADULT', label: 'Young Adult', detail: '25-45 yrs (Baseline Physiological Homeostasis)' },
                                { id: 'GERIATRIC', label: 'Geriatric', detail: '78 yrs (Reduced Renal/Hepatic Clearance)' }
                            ].map(cohort => (
                                <button
                                    key={cohort.id}
                                    onClick={() => setAgeCohort(cohort.id as any)}
                                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                                        ageCohort === cohort.id
                                            ? 'bg-purple-500/20 border-purple-400 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                                    }`}
                                >
                                    <div className="flex items-center justify-between font-bold text-xs">
                                        <span>{cohort.label}</span>
                                        {ageCohort === cohort.id && <Check size={14} className="text-purple-400" />}
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1 leading-snug">{cohort.detail}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CYP2D6 Polymorphism */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">
                                2. Cytochrome P450 2D6 (CYP2D6) Genotype
                            </label>
                            <span className="text-[10px] font-mono text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                                Hepatic Clearance Locus
                            </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                                { id: 'POOR', label: 'Poor Metabolizer', allele: '*4/*4 (Zero Active Enzyme)' },
                                { id: 'INTERMEDIATE', label: 'Intermediate', allele: '*1/*4 (Reduced Activity)' },
                                { id: 'NORMAL', label: 'Normal / Extensive', allele: '*1/*1 (Wild Type)' },
                                { id: 'ULTRARAPID', label: 'Ultrarapid', allele: '*1xN (Gene Duplication)' }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setCyp2d6(item.id as any)}
                                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                        cyp2d6 === item.id
                                            ? 'bg-purple-500/25 border-purple-400 text-white'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                                    }`}
                                >
                                    <span className="text-xs font-bold block">{item.label}</span>
                                    <span className="text-[9px] text-gray-400 font-mono block mt-0.5">{item.allele}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CYP3A4 Activity */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                            3. Cytochrome P450 3A4 (CYP3A4) Metabolic Flux
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { id: 'INHIBITED', label: 'Inhibited (Grapefruit / Ketoconazole)', tag: 'High Bioaccumulation Risk' },
                                { id: 'NORMAL', label: 'Normal Physiological Baseline', tag: 'Standard First-Pass Metabolism' },
                                { id: 'INDUCED', label: 'Induced (Rifampin / St. John’s Wort)', tag: 'Sub-Therapeutic Risk' }
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setCyp3a4(item.id as any)}
                                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                                        cyp3a4 === item.id
                                            ? 'bg-purple-500/25 border-purple-400 text-white'
                                            : 'bg-white/5 border-white/10 text-gray-400 hover:text-white'
                                    }`}
                                >
                                    <span className="text-xs font-bold block">{item.label.split(' ')[0]}</span>
                                    <span className="text-[9px] text-gray-400 block mt-0.5">{item.tag}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Renal Function (eGFR) */}
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                        <div className="flex justify-between items-center">
                            <div>
                                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                                    4. Renal Glomerular Filtration Rate (eGFR)
                                </span>
                                <p className="text-[10px] text-gray-400">Kidney Clearance Capacity</p>
                            </div>
                            <span className={`text-base font-black font-mono px-3 py-1 rounded-xl border ${
                                egfr < 30 
                                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                                    : egfr < 60 
                                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                            }`}>
                                {egfr} <span className="text-[10px] font-normal">mL/min</span>
                            </span>
                        </div>

                        <input
                            type="range"
                            min="15"
                            max="125"
                            step="5"
                            value={egfr}
                            onChange={e => setEgfr(Number(e.target.value))}
                            className="w-full accent-purple-400 h-2 bg-white/10 rounded-full cursor-pointer"
                        />

                        <div className="flex justify-between text-[9px] font-mono text-gray-400">
                            <span>Severe Renal (&lt;30)</span>
                            <span>Moderate (30-59)</span>
                            <span>Mild (60-89)</span>
                            <span>Normal (90+)</span>
                        </div>
                    </div>

                    {/* Real-Time Mathematical Telemetry Forecast */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-950 to-purple-950/40 border border-purple-500/30 space-y-3">
                        <span className="text-[10px] font-mono font-bold text-purple-300 uppercase tracking-widest block">
                            ⚡ In-Silico Pharmacokinetic Impact Prediction
                        </span>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                                <span className="text-[9px] text-gray-400 block">Systemic Toxicity Multiplier</span>
                                <span className={`text-base font-black font-mono ${calculated.toxicityMultiplier > 1.5 ? 'text-rose-400' : 'text-purple-300'}`}>
                                    {calculated.toxicityMultiplier}x
                                </span>
                            </div>

                            <div className="p-2.5 bg-black/40 rounded-xl border border-white/5">
                                <span className="text-[9px] text-gray-400 block">Biological Half-Life (t½)</span>
                                <span className="text-base font-black font-mono text-cyan-300">
                                    {calculated.halfLifeMultiplier}x
                                </span>
                            </div>

                            <div className="p-2.5 bg-black/40 rounded-xl border border-white/5 col-span-2 sm:col-span-1">
                                <span className="text-[9px] text-gray-400 block">Virtual Subject Status</span>
                                <span className="text-xs font-bold text-white truncate block">
                                    {cyp2d6 === 'POOR' || egfr < 30 ? 'High Vulnerability' : 'Standard Cohort'}
                                </span>
                            </div>
                        </div>

                        <p className="text-[11px] text-purple-200/90 font-medium italic border-t border-white/10 pt-2">
                            {calculated.recommendedDoseAdjustment}
                        </p>
                    </div>

                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between px-5 py-4 border-t border-white/10 bg-slate-950/80">
                    <button
                        onClick={handleReset}
                        className="px-3 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                        <RefreshCw size={14} />
                        <span>Reset to Standard Twin</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleApply}
                            className="px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all cursor-pointer flex items-center gap-2"
                        >
                            <span>Apply to 3D Digital Twin</span>
                            <ArrowRight size={14} />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PharmacogenomicMutatorModal;
