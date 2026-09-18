import React, { useState } from 'react';
import { 
    FlaskConical, 
    Sparkles, 
    Atom, 
    ArrowRight, 
    Check, 
    Copy, 
    ShieldCheck, 
    AlertTriangle, 
    Zap, 
    Undo2, 
    Clock, 
    TrendingUp, 
    Layers, 
    Percent, 
    Leaf 
} from 'lucide-react';
import { DrugAnalysisResult, MolecularEnhancementProposal, SynthesisReactionStep } from '../types';
import { getPlainEnglishEnhancementBenefit } from '../services/plainEnglishGuide';

interface Props {
    result: DrugAnalysisResult;
    onApplyEnhancement: (proposal: MolecularEnhancementProposal) => void;
    onRevertEnhancement?: () => void;
}

export const ChemicalSynthesisConsole: React.FC<Props> = ({
    result,
    onApplyEnhancement,
    onRevertEnhancement
}) => {
    const [copiedSmiles, setCopiedSmiles] = useState(false);
    const [selectedStep, setSelectedStep] = useState<number | null>(null);

    const pathway = result.synthesis_pathway;
    const enhancements = result.enhancement_proposals || [];

    const handleCopySmiles = () => {
        if (!result.smiles_string) return;
        navigator.clipboard.writeText(result.smiles_string);
        setCopiedSmiles(true);
        setTimeout(() => setCopiedSmiles(false), 2000);
    };

    return (
        <div className="space-y-4 animate-fade-in text-white/90">
            {/* Active Enhancement Notice Banner */}
            {result.is_enhanced_derivative && (
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-teal-950/60 to-cyan-950/80 border border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.15)] flex items-center justify-between gap-3 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                            <Sparkles size={18} className="animate-pulse" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
                                    Simulating Enhanced Derivative
                                </span>
                                <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-[9px] font-bold text-emerald-300 border border-emerald-500/30">
                                    In-Silico Active
                                </span>
                            </div>
                            <p className="text-xs text-white/80 font-medium mt-0.5">
                                {result.enhancement_applied || 'Molecular Optimization Applied'}
                            </p>
                        </div>
                    </div>
                    {onRevertEnhancement && (
                        <button
                            onClick={onRevertEnhancement}
                            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-[10px] font-black uppercase tracking-wider text-white transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
                        >
                            <Undo2 size={12} /> Revert to Parent
                        </button>
                    )}
                </div>
            )}

            {/* In Simple Words: Explainer Card for Normal People */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/50 via-teal-950/40 to-indigo-950/50 border border-teal-500/30 space-y-2 backdrop-blur-md shadow-lg">
                <div className="flex items-center gap-2">
                    <span className="text-base">💡</span>
                    <h4 className="text-xs font-black uppercase tracking-wider text-teal-300">
                        In Simple Words: How this medicine is made and improved
                    </h4>
                </div>
                <p className="text-xs text-gray-200 leading-relaxed">
                    <strong className="text-white">What is Chemical Synthesis?</strong> It is the step-by-step recipe scientists use in a laboratory to build this medicine molecule by molecule from safe, controlled starting materials.
                </p>
                <p className="text-xs text-gray-200 leading-relaxed pt-1.5 border-t border-white/5">
                    <strong className="text-white">Why AI Molecular Enhancement?</strong> Ordinary medicines can sometimes irritate your stomach, burden your liver, or strain your kidneys. Our AI tests modifying specific chemical groups so the medicine keeps its healing power while protecting your organs!
                </p>
            </div>

            {/* Chemical Structure Header Card */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl space-y-3 shadow-xl relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-start justify-between gap-2">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-md bg-rose-500/20 border border-rose-500/30 text-[9px] font-black text-rose-300 uppercase tracking-wider">
                                {result.category || 'Pharmaceutical Compound'}
                            </span>
                            {result.molecular_weight && (
                                <span className="text-[10px] text-white/40 font-mono">
                                    MW: {result.molecular_weight}
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl font-black tracking-tight text-white flex items-baseline gap-2">
                            {result.drug_name}
                            {result.chemical_formula && (
                                <span className="text-sm font-mono text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20">
                                    {result.chemical_formula}
                                </span>
                            )}
                        </h2>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                        <Atom size={20} />
                    </div>
                </div>

                {/* IUPAC Name */}
                {result.iupac_name && (
                    <div className="text-[11px] font-mono text-white/60 leading-relaxed bg-white/[0.02] p-2 rounded-xl border border-white/5">
                        <span className="text-white/30 uppercase text-[9px] font-bold block mb-0.5 font-sans">IUPAC Systematic Name</span>
                        {result.iupac_name}
                    </div>
                )}

                {/* SMILES notation */}
                {result.smiles_string && (
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/60 border border-white/10">
                        <div className="overflow-hidden">
                            <span className="text-[9px] uppercase font-bold text-white/30 block mb-0.5">SMILES Notation</span>
                            <span className="text-[11px] font-mono text-emerald-400 truncate block">
                                {result.smiles_string}
                            </span>
                        </div>
                        <button
                            onClick={handleCopySmiles}
                            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all flex items-center gap-1 text-[10px] font-bold flex-shrink-0"
                            title="Copy SMILES"
                        >
                            {copiedSmiles ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                            <span className="hidden sm:inline">{copiedSmiles ? 'Copied' : 'Copy'}</span>
                        </button>
                    </div>
                )}

                {/* Functional Groups Pills */}
                {result.functional_groups && result.functional_groups.length > 0 && (
                    <div>
                        <span className="text-[9px] uppercase font-bold text-white/30 block mb-1.5">Identified Functional Pharmacophores</span>
                        <div className="flex flex-wrap gap-1.5">
                            {result.functional_groups.map((group, idx) => (
                                <span
                                    key={idx}
                                    className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-semibold text-white/80 flex items-center gap-1.5"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                    {group}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Chemical Synthesis Pathway Section */}
            {pathway && (
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                <FlaskConical size={15} />
                            </div>
                            <div>
                                <h3 className="text-xs font-black uppercase tracking-widest text-white">
                                    Chemical Synthesis Pathway
                                </h3>
                                <p className="text-[10px] text-white/40">
                                    Preclinical precursor transformation & reaction pipeline
                                </p>
                            </div>
                        </div>

                        {pathway.total_yield_percent !== undefined && (
                            <div className="text-right">
                                <span className="text-[9px] uppercase text-white/40 font-bold block">Overall Yield</span>
                                <span className="text-sm font-black text-blue-400 font-mono">
                                    {pathway.total_yield_percent}%
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Precursor Chemical Reactants */}
                    {pathway.precursors && pathway.precursors.length > 0 && (
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-blue-300/60 block">
                                Starting Precursors & Catalysts
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                                {pathway.precursors.map((p, idx) => (
                                    <span
                                        key={idx}
                                        className="px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 text-[10px] font-medium text-blue-200 flex items-center gap-1"
                                    >
                                        <span>⚛️</span> {p}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step-by-Step Reaction Steps */}
                    {pathway.reaction_steps && pathway.reaction_steps.length > 0 && (
                        <div className="space-y-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-white/30 block">
                                Synthetic Reaction Steps ({pathway.reaction_steps.length})
                            </span>

                            <div className="space-y-2">
                                {pathway.reaction_steps.map((step) => {
                                    const isExpanded = selectedStep === step.step_number;
                                    return (
                                        <div
                                            key={step.step_number}
                                            onClick={() => setSelectedStep(isExpanded ? null : step.step_number)}
                                            className={`p-3 rounded-xl border transition-all cursor-pointer ${
                                                isExpanded
                                                    ? 'bg-blue-950/30 border-blue-500/40 shadow-lg shadow-blue-500/10'
                                                    : 'bg-white/[0.02] border-white/5 hover:border-white/15'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-5 h-5 rounded-md bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold flex items-center justify-center">
                                                        {step.step_number}
                                                    </span>
                                                    <span className="text-xs font-bold text-white">
                                                        {step.reaction_name}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                                                        {step.yield_percent}% yield
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Step Details */}
                                            <div className="mt-2 text-[11px] space-y-1">
                                                <div className="flex items-baseline gap-1.5 text-white/70">
                                                    <span className="text-white/30 text-[9px] uppercase font-bold font-mono">Reagents:</span>
                                                    <span>{step.reagents}</span>
                                                </div>

                                                {step.conditions && (
                                                    <div className="flex items-baseline gap-1.5 text-white/70">
                                                        <span className="text-white/30 text-[9px] uppercase font-bold font-mono">Conditions:</span>
                                                        <span className="text-cyan-300/80">{step.conditions}</span>
                                                    </div>
                                                )}

                                                <div className="flex items-baseline gap-1.5 text-white/90 font-medium">
                                                    <span className="text-white/30 text-[9px] uppercase font-bold font-mono">Product:</span>
                                                    <span className="text-rose-300 font-mono">{step.intermediate_product}</span>
                                                </div>

                                                {step.notes && (
                                                    <p className="text-[10px] text-white/50 italic pt-1 border-t border-white/5">
                                                        {step.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Synthesis Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-white/5">
                        {pathway.atom_economy && (
                            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                                <span className="text-[9px] uppercase text-white/40 font-bold block mb-0.5">Atom Economy</span>
                                <span className="text-xs font-bold text-cyan-300">{pathway.atom_economy}</span>
                            </div>
                        )}

                        {pathway.green_chemistry_score !== undefined && (
                            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                                <span className="text-[9px] uppercase text-white/40 font-bold block mb-0.5 flex items-center gap-1">
                                    <Leaf size={10} className="text-emerald-400" /> Green Score
                                </span>
                                <span className="text-xs font-bold text-emerald-400 font-mono">
                                    {pathway.green_chemistry_score} / 100
                                </span>
                            </div>
                        )}

                        {pathway.safety_hazard_notes && (
                            <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 col-span-2 sm:col-span-1">
                                <span className="text-[9px] uppercase text-amber-400 font-bold block mb-0.5 flex items-center gap-1">
                                    <AlertTriangle size={10} /> Safety Notice
                                </span>
                                <span className="text-[10px] text-amber-200/70 line-clamp-2">
                                    {pathway.safety_hazard_notes}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Molecular Enhancement Strategies Section */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl space-y-4 shadow-xl">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <Sparkles size={15} />
                        </div>
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-widest text-white">
                                Molecular Enhancement Opportunities
                            </h3>
                            <p className="text-[10px] text-white/40">
                                Structure-Activity Relationship (SAR) & organ-sparing derivatives
                            </p>
                        </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                        {enhancements.length} Strategies
                    </span>
                </div>

                {enhancements.length === 0 ? (
                    <div className="p-6 text-center rounded-xl bg-white/[0.02] border border-white/5">
                        <p className="text-xs text-white/40">No specific enhancement strategies proposed for this scaffold.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {enhancements.map((enh) => {
                            const isCurrentlyActive = result.is_enhanced_derivative && result.enhancement_applied === enh.strategy_name;

                            return (
                                <div
                                    key={enh.id}
                                    className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                                        isCurrentlyActive
                                            ? 'bg-emerald-950/40 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                                            : 'bg-white/[0.02] border-white/10 hover:border-emerald-500/30'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-[9px] font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                                                    <ShieldCheck size={10} /> {enh.target_organ_sparing}
                                                </span>
                                                <span className="text-[9px] text-white/40 font-semibold">
                                                    Feasibility: {enh.synthetic_feasibility}
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-bold text-white">
                                                {enh.strategy_name}
                                            </h4>
                                        </div>

                                        {enh.toxicity_reduction_percent && (
                                            <div className="text-right flex-shrink-0">
                                                <span className="text-[9px] uppercase text-emerald-400 font-bold block">Toxicity Drop</span>
                                                <span className="text-sm font-black text-emerald-400 font-mono">
                                                    -{enh.toxicity_reduction_percent}%
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Plain English Benefit Callout */}
                                    <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/25 text-xs text-teal-200 leading-relaxed flex items-start gap-2">
                                        <span className="text-sm pt-0.5">💡</span>
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-wider text-teal-300 block mb-0.5 font-sans">
                                                Plain English Benefit for You
                                            </span>
                                            <span>{getPlainEnglishEnhancementBenefit(enh.strategy_name, result.drug_name)}</span>
                                        </div>
                                    </div>

                                    {/* Modification detail */}
                                    <div className="p-2 rounded-lg bg-black/40 border border-white/5 text-[11px] font-mono text-cyan-200/90">
                                        <span className="text-white/30 text-[9px] uppercase block font-sans font-bold mb-0.5">Chemical Modification</span>
                                        {enh.chemical_modification}
                                    </div>

                                    {/* Pharmacological rationale */}
                                    <p className="text-xs text-white/70 leading-relaxed">
                                        {enh.pharmacological_rationale}
                                    </p>

                                    {/* Metrics & Simulation Button */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                                        <div className="flex items-center gap-3 text-[10px] text-white/50 font-mono">
                                            {enh.half_life_change && (
                                                <span className="flex items-center gap-1 text-white/70">
                                                    <Clock size={11} className="text-blue-400" /> {enh.half_life_change}
                                                </span>
                                            )}
                                            {enh.potency_delta && (
                                                <span className="flex items-center gap-1 text-white/70">
                                                    <TrendingUp size={11} className="text-emerald-400" /> {enh.potency_delta}
                                                </span>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => onApplyEnhancement(enh)}
                                            disabled={isCurrentlyActive}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md ${
                                                isCurrentlyActive
                                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default'
                                                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/20 hover:scale-105 active:scale-95'
                                            }`}
                                        >
                                            {isCurrentlyActive ? (
                                                <>
                                                    <Check size={12} /> Active on 3D Twin
                                                </>
                                            ) : (
                                                <>
                                                    <Zap size={12} /> Simulate on 3D Twin
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
export default ChemicalSynthesisConsole;
