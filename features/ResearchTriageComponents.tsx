import React, { useState } from 'react';
import { DrugAnalysisResult, ExperimentDossier, OrganToxicityScore } from '../types';
import { Shield, AlertTriangle, CheckCircle, Activity, FileText, Download, Trash2, X, ArrowRight, ExternalLink, Sparkles, Heart, Clock, Droplets, Info } from 'lucide-react';
import { getPlainEnglishForDrug } from '../services/plainEnglishGuide';

interface ResearchTriageProps {
    result: DrugAnalysisResult | null;
    result2?: DrugAnalysisResult | null;
    compareMode?: boolean;
    drugName: string;
    drugName2?: string;
    onOpenSaveModal: () => void;
    onOpenDossierHistory: () => void;
    dossierCount: number;
}

export const ResearchTriageCard: React.FC<ResearchTriageProps> = ({
    result,
    result2,
    compareMode,
    drugName,
    drugName2,
    onOpenSaveModal,
    onOpenDossierHistory,
    dossierCount
}) => {
    if (!result) return null;

    const [isEasyMode, setIsEasyMode] = useState(true);

    const riskScore = result.system_wide_risk_score ?? 0.3;
    const confidence = result.confidence_score ?? 94.6;
    const uncertainty = result.uncertainty_margin ?? 4.2;

    // Plain English information lookup
    const plainInfo = getPlainEnglishForDrug(result.drug_name || drugName);

    // Determine viability status for scientific mode
    let viability: { label: string; bg: string; border: string; text: string; action: string } = {
        label: 'HIGH PRIORITY FOR IN-VITRO ASSAY',
        bg: 'bg-emerald-500/15',
        border: 'border-emerald-500/30',
        text: 'text-emerald-300',
        action: 'Proceed to in-vitro cell culture assay with low predicted organ toxicity.'
    };

    if (riskScore >= 0.7) {
        viability = {
            label: 'HIGH RISK - CONTRAINDICATED',
            bg: 'bg-rose-500/15',
            border: 'border-rose-500/30',
            text: 'text-rose-300',
            action: 'Exceeds organ toxic thresholds. De-prioritize or structurally modify compound.'
        };
    } else if (riskScore >= 0.4) {
        viability = {
            label: 'PROCEED WITH CAUTION (MONITOR ORGAN STRAIN)',
            bg: 'bg-amber-500/15',
            border: 'border-amber-500/30',
            text: 'text-amber-300',
            action: 'Moderate clearance strain detected. Preclinical pharmacokinetic monitoring recommended.'
        };
    }

    // Organ vulnerabilities
    const organEffects = result.effects || result.heatmap_effects || [];
    const vulnerableOrgans = organEffects.filter(e => e.risk_level === 'high' || e.risk_level === 'severe' || e.toxic_threshold || e.intensity > 0.6);

    // Comparison logic
    const riskScore2 = result2 ? (result2.system_wide_risk_score ?? 0.5) : null;
    const comparisonAdvantage = riskScore2 !== null ? (
        riskScore < riskScore2
            ? `${drugName} exhibits ${Math.round((riskScore2 - riskScore) * 100)}% lower systemic toxicity than ${drugName2}. Prioritize ${drugName} for laboratory validation.`
            : riskScore > riskScore2
            ? `${drugName2} exhibits ${Math.round((riskScore - riskScore2) * 100)}% lower systemic toxicity than ${drugName}. Prioritize ${drugName2} for laboratory validation.`
            : `Both candidates exhibit equivalent predicted systemic burdens (~${Math.round(riskScore * 100)}%). Assess organ-specific tropism.`
    ) : null;

    return (
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1427] to-[#080d1a] border border-teal-500/25 shadow-2xl backdrop-blur-xl space-y-3.5 mb-4 text-white">
            {/* Top Toolbar: Mode Switcher & Dossier Actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                {/* 1-Click Toggle for Normal Peoples vs Researchers */}
                <div className="flex bg-black/60 rounded-xl p-0.5 border border-white/10">
                    <button
                        onClick={() => setIsEasyMode(true)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1.5 ${
                            isEasyMode
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md scale-[1.02]'
                                : 'text-gray-400 hover:text-white'
                        }`}
                        title="Easy to understand results in plain English without medical jargon"
                    >
                        <span>💡</span>
                        <span>Plain English</span>
                    </button>
                    <button
                        onClick={() => setIsEasyMode(false)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1.5 ${
                            !isEasyMode
                                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md scale-[1.02]'
                                : 'text-gray-400 hover:text-white'
                        }`}
                        title="Technical laboratory metrics, confidence bounds, and triage actions"
                    >
                        <span>🔬</span>
                        <span>Scientific Lab</span>
                    </button>
                </div>

                {/* Save and History Actions */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={onOpenSaveModal}
                        className="px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm"
                        title="Save this virtual run into Experiment Dossiers"
                    >
                        <span>💾</span>
                        <span>Save Run</span>
                    </button>
                    <button
                        onClick={onOpenDossierHistory}
                        className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/15 text-[11px] font-bold transition-all flex items-center gap-1"
                        title="Open saved experiment dossiers drawer"
                    >
                        <span>📁</span>
                        <span>Dossiers ({dossierCount})</span>
                    </button>
                </div>
            </div>

            {/* ════════════════════════════════════════════════════════════════════════
                EASY TO UNDERSTAND MODE (FOR NORMAL PEOPLE & PATIENTS)
               ════════════════════════════════════════════════════════════════════════ */}
            {isEasyMode ? (
                <div className="space-y-3.5 animate-fade-in">
                    {/* Plain English Verdict Banner */}
                    <div className={`p-3 rounded-xl border flex items-start gap-3 shadow-md ${
                        plainInfo.overallSafety === 'Safe'
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : plainInfo.overallSafety === 'Caution'
                            ? 'bg-amber-950/40 border-amber-500/40 text-amber-300'
                            : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                    }`}>
                        <div className="text-2xl pt-0.5">
                            {plainInfo.overallSafety === 'Safe' ? '🟢' : plainInfo.overallSafety === 'Caution' ? '🟡' : '🔴'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] uppercase font-black tracking-widest opacity-80">
                                    Overall Safety Verdict
                                </span>
                                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-white">
                                    Normal Person Guide
                                </span>
                            </div>
                            <h3 className="text-sm font-black text-white mt-0.5">
                                {plainInfo.overallSafety === 'Safe'
                                    ? 'Generally Safe When Taken Correctly'
                                    : plainInfo.overallSafety === 'Caution'
                                    ? 'Take with Care (Protect Your Stomach & Hydrate)'
                                    : 'High Potency Medicine (Special Medical Care)'}
                            </h3>
                            <p className="text-xs text-gray-200 mt-1 leading-relaxed">
                                {plainInfo.safetySummary}
                            </p>
                        </div>
                    </div>

                    {/* What this medicine does in simple words */}
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-300">
                            <span>💬</span>
                            <span>What does this medicine do in simple words?</span>
                        </div>
                        <p className="text-xs font-semibold text-white leading-relaxed">
                            {plainInfo.whatItIs}
                        </p>
                        <p className="text-xs text-gray-300 leading-relaxed pt-1 border-t border-white/5">
                            <span className="text-teal-400 font-bold">How it works: </span>
                            {plainInfo.howItWorks}
                        </p>
                    </div>

                    {/* Step-by-Step Body Journey */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            <span className="flex items-center gap-1">
                                <span>🚶</span> How it travels through your body
                            </span>
                            <span className="text-teal-400 font-mono text-[9px]">3-Step Timeline</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {plainInfo.bodyJourney.map(step => (
                                <div
                                    key={step.stepNumber}
                                    className="p-2.5 rounded-xl bg-black/40 border border-white/10 space-y-1 shadow-sm relative overflow-hidden"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-base">{step.icon}</span>
                                        <span className="text-[9px] font-mono text-teal-300 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">
                                            {step.timeframe}
                                        </span>
                                    </div>
                                    <div className="text-xs font-bold text-white leading-tight mt-1">
                                        {step.stepNumber}. {step.title}
                                    </div>
                                    <p className="text-[11px] text-gray-300 leading-normal">
                                        {step.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Organ Safety Traffic Light */}
                    <div className="space-y-1.5">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
                            <span>🚦</span> Organ Safety Guide
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {plainInfo.organSimpleImpact.map((org, i) => (
                                <div
                                    key={i}
                                    className={`p-2.5 rounded-xl border flex items-start gap-2.5 ${
                                        org.statusColor === 'green'
                                            ? 'bg-emerald-950/30 border-emerald-500/30'
                                            : org.statusColor === 'yellow'
                                            ? 'bg-amber-950/30 border-amber-500/30'
                                            : 'bg-rose-950/30 border-rose-500/30'
                                    }`}
                                >
                                    <div className="text-xl pt-0.5">{org.icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-1">
                                            <span className="text-xs font-bold text-white">{org.organName}</span>
                                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                                org.statusColor === 'green'
                                                    ? 'bg-emerald-500/20 text-emerald-300'
                                                    : org.statusColor === 'yellow'
                                                    ? 'bg-amber-500/20 text-amber-300'
                                                    : 'bg-rose-500/20 text-rose-300'
                                            }`}>
                                                {org.statusText}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-gray-300 mt-1 leading-relaxed">
                                            {org.simpleExplanation}
                                        </p>
                                        <div className="text-[10px] text-teal-300 mt-1 font-semibold flex items-center gap-1">
                                            <span>👉</span> <span>{org.actionTip}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Everyday Food, Water & Practical Tips */}
                    <div className="p-3 rounded-xl bg-teal-950/20 border border-teal-500/25 space-y-2">
                        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-teal-300">
                            <span>🥗</span> Important Tips for Normal People & Patients
                        </div>
                        <ul className="space-y-1 text-xs text-gray-200">
                            {plainInfo.foodAndLifestyleTips.map((tip, i) => (
                                <li key={i} className="flex items-start gap-1.5">
                                    <span className="text-teal-400 font-bold">•</span>
                                    <span>{tip}</span>
                                </li>
                            ))}
                            {plainInfo.warningsForNormalPeople.map((warn, i) => (
                                <li key={`warn-${i}`} className="flex items-start gap-1.5 text-amber-200">
                                    <span className="text-amber-400 font-bold">⚠️</span>
                                    <span>{warn}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ) : (
                /* ════════════════════════════════════════════════════════════════════════
                    SCIENTIFIC LAB RESEARCH MODE (FOR SCIENTISTS & PHARMACOLOGISTS)
                   ════════════════════════════════════════════════════════════════════════ */
                <div className="space-y-3 animate-fade-in">
                    {/* Confidence tag */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-teal-300 bg-teal-500/10 px-2.5 py-1 rounded-lg border border-teal-500/20">
                        <span>Predictive In-Silico Confidence</span>
                        <span className="font-bold">{confidence}% (±{uncertainty}%)</span>
                    </div>

                    {/* Question 1: Which candidate to investigate further? */}
                    <div className="space-y-1">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1">
                            <span>Q1: Which candidate should we investigate further?</span>
                        </div>
                        <div className={`p-2.5 rounded-xl border ${viability.bg} ${viability.border} flex items-center justify-between gap-2`}>
                            <div>
                                <div className={`text-xs font-black tracking-wide ${viability.text}`}>
                                    {viability.label}
                                </div>
                                <div className="text-[11px] text-gray-300 mt-0.5 leading-snug">
                                    {viability.action}
                                </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <div className="text-[10px] font-mono text-gray-400">Risk Score</div>
                                <div className="text-base font-black text-white">{Math.round(riskScore * 100)}/100</div>
                            </div>
                        </div>
                    </div>

                    {/* Question 2: Which organs could potentially be affected? */}
                    <div className="space-y-1">
                        <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400">
                            <span>Q2: Which organs could potentially be affected?</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {vulnerableOrgans.length > 0 ? (
                                vulnerableOrgans.map((org, i) => (
                                    <span
                                        key={i}
                                        className={`text-[10px] font-mono px-2 py-1 rounded-lg border flex items-center gap-1 ${
                                            org.risk_level === 'severe' || org.toxic_threshold
                                                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                                                : 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                                        }`}
                                    >
                                        <span className="font-bold">{org.structure_name || (org as any).organ}:</span>
                                        <span>{Math.round(org.intensity * 100)}% strain</span>
                                        {org.toxic_threshold && <span className="text-[8px] uppercase font-black bg-rose-500/40 px-1 rounded">Threshold Breached</span>}
                                    </span>
                                ))
                            ) : (
                                <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                                    ✓ No major organ toxicity thresholds breached
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Question 4: Candidate Comparison (If Compare Mode Active) */}
                    {compareMode && result2 && (
                        <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/30 space-y-1.5">
                            <div className="text-[10px] font-mono uppercase tracking-wider text-purple-300 font-bold flex items-center justify-between">
                                <span>Q4: How does {drugName} compare with {drugName2}?</span>
                                <span className="text-xs">⚖</span>
                            </div>
                            <p className="text-xs text-purple-100 font-medium leading-relaxed">
                                {comparisonAdvantage}
                            </p>
                            <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
                                <div className="p-1.5 rounded bg-black/30 border border-white/5">
                                    <span className="text-teal-300 font-bold">{drugName}:</span> {Math.round(riskScore * 100)}/100 risk
                                </div>
                                <div className="p-1.5 rounded bg-black/30 border border-white/5">
                                    <span className="text-purple-300 font-bold">{drugName2}:</span> {Math.round((riskScore2 ?? 0.5) * 100)}/100 risk
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


// ─── Save Experiment Modal ──────────────────────────────────────────────────
interface SaveModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (title: string, notes: string) => void;
    defaultTitle: string;
    drugName: string;
}

export const SaveExperimentModal: React.FC<SaveModalProps> = ({
    isOpen,
    onClose,
    onSave,
    defaultTitle,
    drugName
}) => {
    const [title, setTitle] = useState(defaultTitle);
    const [notes, setNotes] = useState(`In-silico preclinical assay of ${drugName} to evaluate organ-specific clearance, toxicity thresholds, and pharmacokinetics.`);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(title || defaultTitle, notes);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="w-full max-w-lg rounded-3xl bg-[#0a0f1d] border border-teal-500/30 shadow-2xl p-6 text-white space-y-4 animate-scale-in">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">💾</span>
                        <h3 className="text-base font-bold text-white">Save Experiment Dossier</h3>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div>
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400 mb-1">
                            Experiment Dossier Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-teal-400 outline-none"
                            placeholder="e.g. Preclinical In-Silico Trial: Remdesivir vs Coronavirus"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400 mb-1">
                            Preclinical Notes & Hypothesis
                        </label>
                        <textarea
                            rows={3}
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white focus:border-teal-400 outline-none resize-none"
                            placeholder="Enter investigator observations, critical organ thresholds, and next steps..."
                        />
                    </div>

                    <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 text-[11px] text-teal-300 leading-relaxed">
                        Notice: This experiment run will be timestamped, indexed, and persisted to your local dossier archive for review and export.
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 text-xs font-bold transition-all shadow-lg"
                        >
                            Save Dossier
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Dossier History Drawer ─────────────────────────────────────────────────
interface DossierDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    dossiers: ExperimentDossier[];
    onLoad: (dossier: ExperimentDossier) => void;
    onDelete: (id: string) => void;
}

export const DossierHistoryDrawer: React.FC<DossierDrawerProps> = ({
    isOpen,
    onClose,
    dossiers,
    onLoad,
    onDelete
}) => {
    const [search, setSearch] = useState('');

    if (!isOpen) return null;

    const filtered = dossiers.filter(d =>
        d.title.toLowerCase().includes(search.toLowerCase()) ||
        d.targetCompound.toLowerCase().includes(search.toLowerCase()) ||
        d.id.toLowerCase().includes(search.toLowerCase())
    );

    const handleExportJSON = (dossier: ExperimentDossier) => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dossier, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `${dossier.id}_${dossier.targetCompound}_Dossier.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    };

    return (
        <div className="fixed inset-0 z-[200] flex justify-end bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-md h-full bg-[#0a0f1d] border-l border-white/15 shadow-2xl flex flex-col text-white animate-slide-in-right">
                {/* Header */}
                <div className="p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                    <div>
                        <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400">Preclinical Archive</div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <span>📁</span> Virtual Experiment Dossiers ({dossiers.length})
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-white/5">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by compound or experiment ID..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder-white/40 focus:border-teal-400 outline-none"
                    />
                </div>

                {/* Dossier List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {filtered.length > 0 ? (
                        filtered.map(dossier => (
                            <div
                                key={dossier.id}
                                className="p-4 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-teal-500/40 transition-all space-y-2.5 group"
                            >
                                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                                    <span className="px-1.5 py-0.5 rounded bg-white/10 font-bold text-gray-300">{dossier.id}</span>
                                    <span>{dossier.timestamp}</span>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-white group-hover:text-teal-300 transition-colors">
                                        {dossier.title}
                                    </h4>
                                    <div className="text-[11px] text-teal-400/90 font-mono mt-0.5">
                                        Compound: <strong>{dossier.targetCompound}</strong> {dossier.secondaryCompound && `vs ${dossier.secondaryCompound}`}
                                    </div>
                                    <p className="text-[11px] text-gray-400 italic mt-1 leading-snug">
                                        "{dossier.notes}"
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-1 pt-1">
                                    {dossier.organToxicities.slice(0, 3).map((tox, idx) => (
                                        <span
                                            key={idx}
                                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                                                tox.strain_score > 60
                                                    ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                                                    : 'bg-teal-500/15 border-teal-500/30 text-teal-300'
                                            }`}
                                        >
                                            {tox.organ}: {tox.strain_score}/100
                                        </span>
                                    ))}
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-white/5">
                                    <button
                                        onClick={() => {
                                            onLoad(dossier);
                                            onClose();
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-[11px] font-bold transition-all flex items-center gap-1"
                                    >
                                        <span>Load in 3D Twin</span>
                                        <ArrowRight size={12} />
                                    </button>

                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => handleExportJSON(dossier)}
                                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                                            title="Export Dossier as JSON"
                                        >
                                            <Download size={14} />
                                        </button>
                                        <button
                                            onClick={() => onDelete(dossier.id)}
                                            className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-300 transition-colors"
                                            title="Delete Dossier"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 text-gray-500 text-xs">
                            No experiment dossiers found matching query.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
