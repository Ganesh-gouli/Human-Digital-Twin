import React, { useRef, useEffect } from 'react';
import { HeatmapEffect, DrugEffectType, Pharmacokinetics, Pharmacodynamics } from '../types';
import { Activity, Clock, ShieldAlert, AlertTriangle, Heart, Pill, Sparkles, ChevronRight, Ban, HelpCircle } from 'lucide-react';

const TYPE_CONFIG: Record<DrugEffectType, { label: string; color: string; bg: string; border: string; glow: string }> = {
    therapeutic: { label: 'Therapeutic', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]' },
    stimulation: { label: 'Stimulation', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', glow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]' },
    suppression: { label: 'Suppression', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]' },
    toxicity: { label: 'Toxicity', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', glow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)]' },
    'side-effect': { label: 'Side Effect', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]' },
    relief: { label: 'Relief', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', glow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]' },
};

const ORGAN_ICONS: Record<string, string> = {
    'Brain': '🧠', 'Heart': '❤️', 'Liver': '🫁', 'Kidney': '🫘',
    'Lungs': '💨', 'Stomach': '🫃', 'Nervous System': '⚡', 'Muscles': '💪',
    'Skin': '🫀', 'Intestines': '🌀',
};

// Intensity → gradient bar color stops (matches 3D heatmap)
function intensityGradient(v: number): string {
    if (v < 0.25) return 'from-blue-500 to-cyan-400';
    if (v < 0.5) return 'from-cyan-400 to-emerald-400';
    if (v < 0.75) return 'from-yellow-400 to-orange-500';
    return 'from-orange-500 to-rose-600';
}

function intensityLabel(v: number): { text: string; color: string } {
    if (v < 0.3) return { text: 'Low Intensity', color: 'text-blue-400' };
    if (v < 0.55) return { text: 'Moderate', color: 'text-yellow-400' };
    if (v < 0.8) return { text: 'High Impact', color: 'text-orange-400' };
    return { text: 'Critical Toxicity', color: 'text-rose-500' };
}

interface DrugOrganPanelProps {
    effects: HeatmapEffect[];
    mechanism: string;
    shortTermEffects: string[];
    sideEffects: string[];
    contraindications: string[];
    longTermEffects: string[];
    riskLevel: 'low' | 'moderate' | 'high' | 'severe';
    doseDependencyFactor?: number;
    drugName: string;
    category: string;
    pharmacokinetics?: Pharmacokinetics;
    pharmacodynamics?: Pharmacodynamics;
    interactionRiskFlag?: boolean;
    selectedOrgan: string | null;
    onOrganSelect: (organ: string) => void;
}

const DrugOrganPanel: React.FC<DrugOrganPanelProps> = ({
    effects, mechanism, shortTermEffects, sideEffects, contraindications, longTermEffects,
    riskLevel, doseDependencyFactor, drugName, category, pharmacokinetics, pharmacodynamics, interactionRiskFlag, selectedOrgan, onOrganSelect
}) => {
    const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

    // Auto-scroll to selected organ card
    useEffect(() => {
        if (selectedOrgan && cardRefs.current[selectedOrgan]) {
            cardRefs.current[selectedOrgan]?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [selectedOrgan]);

    const normalizedRisk = riskLevel
        ? (riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1).toLowerCase()) as 'Low' | 'Moderate' | 'High' | 'Severe'
        : 'Moderate'; // default

    const riskConfig = {
        Low: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)]' },
        Moderate: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', glow: 'shadow-[0_0_15px_rgba(234,179,8,0.1)]' },
        High: { color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.15)]' },
        Severe: { color: 'text-rose-400', bg: 'bg-rose-500/15 border-rose-500/30', border: 'border-rose-500/40', glow: 'shadow-[0_0_20px_rgba(244,63,94,0.25)] animate-pulse' },
    }[normalizedRisk] || { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20', glow: '' };

    return (
        <div className="flex flex-col h-full overflow-hidden text-white">
            {/* Drug header */}
            <div className="flex-shrink-0 p-5 border-b border-white/10 bg-black/40 backdrop-blur-md">
                <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-200 tracking-tight truncate max-w-[200px]" title={drugName}>{drugName}</h3>
                            <span className="text-[10px] text-blue-300 font-bold px-2 py-0.5 bg-blue-500/10 rounded-full border border-blue-500/20 uppercase tracking-wider">
                                {category}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {doseDependencyFactor !== undefined && (
                                <span className="text-[10px] text-purple-300 font-bold px-2.5 py-0.5 bg-purple-500/10 rounded-full border border-purple-500/20 flex items-center gap-1">
                                    <Activity size={10} /> Dose Dp: {doseDependencyFactor.toFixed(1)}
                                </span>
                            )}
                            {interactionRiskFlag && (
                                <span className="text-[10px] text-rose-300 font-bold px-2.5 py-0.5 bg-rose-500/15 rounded-full border border-rose-500/30 animate-pulse flex items-center gap-1 shadow-[0_0_10px_rgba(244,63,94,0.1)]">
                                    <AlertTriangle size={10} /> Interaction Risk
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider border ${riskConfig.bg} ${riskConfig.color} ${riskConfig.border} ${riskConfig.glow}`}>
                            <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                            {normalizedRisk} Risk
                        </div>
                    </div>
                </div>
                
                <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 shadow-inner">
                    <p className="text-xs text-blue-200/80 leading-relaxed font-medium">
                        <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest block mb-1">Primary Mechanism of Action</span>
                        {pharmacodynamics?.primary_mechanism || mechanism}
                    </p>
                </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 custom-scrollbar">

                {/* Pharmacokinetics Timeline */}
                {pharmacokinetics && (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 relative overflow-hidden shadow-lg">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                            <Clock size={12} className="text-blue-400" /> Pharmacokinetics Profile
                        </p>

                        <div className="flex items-center justify-between relative mt-2 mb-4 px-2">
                            <div className="absolute top-1/2 left-6 right-6 h-0.5 bg-white/5 -translate-y-1/2 rounded-full" />
                            <div className="absolute top-1/2 left-6 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 -translate-y-1/2 rounded-full shadow-[0_0_8px_#3b82f6]" style={{ width: '70%' }} />

                            <div className="z-10 flex flex-col items-center">
                                <div className="w-5 h-5 rounded-full bg-blue-900/80 border-2 border-blue-400 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.6)] hover:scale-110 transition-transform">
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                                </div>
                                <span className="text-[9px] font-bold text-blue-300 mt-1.5 uppercase">Onset</span>
                                <span className="text-[10px] text-white font-mono mt-0.5">{pharmacokinetics.onset_minutes}m</span>
                            </div>
                            <div className="z-10 flex flex-col items-center">
                                <div className="w-5 h-5 rounded-full bg-purple-900/80 border-2 border-purple-400 flex items-center justify-center shadow-[0_0_12px_rgba(168,85,247,0.6)] hover:scale-110 transition-transform">
                                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full" />
                                </div>
                                <span className="text-[9px] font-bold text-purple-300 mt-1.5 uppercase">Peak</span>
                                <span className="text-[10px] text-white font-mono mt-0.5">{pharmacokinetics.peak_minutes}m</span>
                            </div>
                            <div className="z-10 flex flex-col items-center">
                                <div className="w-5 h-5 rounded-full bg-slate-900 border-2 border-white/20 flex items-center justify-center hover:scale-110 transition-transform">
                                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full" />
                                </div>
                                <span className="text-[9px] font-bold text-white/40 mt-1.5 uppercase">Duration</span>
                                <span className="text-[10px] text-white/80 font-mono mt-0.5">{pharmacokinetics.duration_hours}h</span>
                            </div>
                        </div>

                        {pharmacokinetics.bioavailability_estimate !== undefined && (
                            <div className="mt-4 pt-3 border-t border-white/5 flex items-center gap-3">
                                <span className="text-[9px] text-white/50 uppercase tracking-wider font-bold w-24">Bioavailability</span>
                                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden p-[1px]">
                                    <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.3)]" style={{ width: `${pharmacokinetics.bioavailability_estimate * 100}%` }} />
                                </div>
                                <span className="text-xs font-mono font-bold text-emerald-400">{(pharmacokinetics.bioavailability_estimate * 100).toFixed(0)}%</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Pharmacodynamics (Receptors & Enzymes) */}
                {pharmacodynamics && (pharmacodynamics.receptor_targets?.length || pharmacodynamics.enzyme_inhibition_percent) && (
                    <div className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 shadow-lg">
                        <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest flex items-center gap-1.5 mb-3.5">
                            <Sparkles size={12} className="text-purple-400" /> Pharmacodynamics Target Map
                        </p>

                        {pharmacodynamics.receptor_targets && pharmacodynamics.receptor_targets.length > 0 && (
                            <div className="mb-4">
                                <span className="text-[9px] text-white/40 uppercase tracking-wider font-bold block mb-2">Receptor Affinity Targets</span>
                                <div className="flex flex-wrap gap-2">
                                    {pharmacodynamics.receptor_targets.map((rt, i) => (
                                        <span key={i} className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs rounded-xl font-bold hover:bg-purple-500/20 hover:border-purple-500/40 transition-colors shadow-sm">
                                            🧬 {rt}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {pharmacodynamics.enzyme_inhibition_percent !== undefined && (
                            <div className="flex items-center justify-between p-3 rounded-xl bg-black/30 border border-white/5">
                                <span className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Enzyme Inhibition Rate</span>
                                <div className="flex items-center gap-3">
                                    <div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-rose-500" style={{ width: `${pharmacodynamics.enzyme_inhibition_percent}%` }} />
                                    </div>
                                    <span className="text-xs font-mono font-black text-rose-400">{pharmacodynamics.enzyme_inhibition_percent}%</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Organ effect cards */}
                {effects.length > 0 && (
                    <div className="space-y-2.5">
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
                            <Activity size={12} className="text-blue-400" /> Impacted Organ Mapping
                        </p>
                        {effects
                            .slice()
                            .sort((a, b) => b.intensity - a.intensity)
                            .map(e => {
                                const normalizedType = e.effect_type?.toLowerCase() as DrugEffectType;
                                const tc = TYPE_CONFIG[normalizedType] || TYPE_CONFIG['side-effect'];
                                const { text: iLabel, color: iColor } = intensityLabel(e.intensity);
                                const isSelected = selectedOrgan === e.structure_name;
                                return (
                                    <div
                                        key={e.structure_name + e.layer}
                                        ref={el => { cardRefs.current[e.structure_name] = el; }}
                                        onClick={() => onOrganSelect(e.structure_name)}
                                        className={`p-4 rounded-2xl border cursor-pointer transition-all duration-300 relative overflow-hidden group
                                            ${isSelected
                                                ? 'bg-gradient-to-br from-white/[0.08] to-white/[0.02] border-white/30 shadow-2xl scale-[1.02] translate-x-1'
                                                : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/20 hover:scale-[1.01]'
                                            }`}
                                    >
                                        {/* Dynamic glowing strip for selection */}
                                        {isSelected && (
                                            <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-gradient-to-b from-blue-400 to-purple-500 shadow-[0_0_10px_#3b82f6]" />
                                        )}
                                        
                                        <div className="flex items-center gap-3 mb-2.5">
                                            <span className="text-2xl bg-black/40 w-10 h-10 rounded-xl flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform">
                                                {ORGAN_ICONS[e.structure_name] || (e.layer === 'SKELETON_VIEW' ? '🦴' : '🫀')}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="font-black text-white text-sm tracking-tight">{e.structure_name}</p>
                                                    <span className="text-[8px] bg-white/10 text-white/50 px-1.5 py-0.2 rounded font-bold uppercase tracking-widest">{e.layer.replace('_VIEW', '')}</span>
                                                </div>
                                                <p className="text-[11px] text-blue-300/60 mt-0.5 leading-tight truncate">{e.effect_type}</p>
                                            </div>
                                            <span className={`flex-shrink-0 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-xl border ${tc.bg} ${tc.color} ${tc.border} ${tc.glow}`}>
                                                {tc.label}
                                            </span>
                                        </div>

                                        {e.mechanism && (
                                            <div className="mb-3 p-2.5 bg-black/40 rounded-xl border border-white/5">
                                                <p className="text-[10px] text-white/70 leading-relaxed">
                                                    <span className="text-white/30 font-bold uppercase tracking-wider text-[8px] mr-1 block">Cellular Pathway</span>
                                                    {e.mechanism}
                                                </p>
                                            </div>
                                        )}

                                        {/* Intensity bar */}
                                        <div className="space-y-1">
                                            <div className="flex justify-between items-center text-[9px]">
                                                <span className={`font-bold uppercase tracking-wider ${iColor}`}>{iLabel}</span>
                                                <div className="flex items-center gap-2">
                                                    {e.confidence_score !== undefined && (
                                                        <span className="text-[8px] px-1 rounded bg-white/5 border border-white/5 text-white/40" title={`AI Confidence: ${(e.confidence_score * 100).toFixed(0)}%`}>
                                                            Conf: {(e.confidence_score * 100).toFixed(0)}%
                                                        </span>
                                                    )}
                                                    <span className={`font-mono font-black ${iColor}`}>
                                                        {(e.intensity * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden p-[1px]">
                                                <div
                                                    className={`h-full rounded-full bg-gradient-to-r ${intensityGradient(e.intensity)} shadow-[0_0_8px_rgba(251,191,36,0.2)] transition-all duration-1000`}
                                                    style={{ width: `${e.intensity * 100}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Risk Level / Toxic Threshold */}
                                        {(e.risk_level || e.toxic_threshold) && (
                                            <div className="flex gap-3 mt-3 pt-2 border-t border-white/5">
                                                {e.risk_level && (
                                                    <span className="text-[10px] text-white/50 flex items-center gap-1.5">
                                                        <HelpCircle size={10} className="text-white/40" /> Risk: <strong className="text-white/80 uppercase">{e.risk_level}</strong>
                                                    </span>
                                                )}
                                                {e.toxic_threshold && (
                                                    <span className="text-[10px] text-rose-400 flex items-center gap-1.5 font-bold animate-pulse">
                                                        <Ban size={10} /> Toxic Threshold Reached
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                    </div>
                )}

                {/* Short-term */}
                {shortTermEffects.length > 0 && (
                    <InfoList title="Short-term Effects" icon="⏱" items={shortTermEffects} color="blue" />
                )}

                {/* Side Effects */}
                {sideEffects.length > 0 && (
                    <InfoList title="Common Side Effects" icon="💊" items={sideEffects} color="yellow" />
                )}

                {/* Long-term */}
                {longTermEffects.length > 0 && (
                    <InfoList title="Long-term Risks" icon="⚠️" items={longTermEffects} color="orange" />
                )}

                {/* Contraindications */}
                {contraindications.length > 0 && (
                    <InfoList title="Contraindications" icon="⛔" items={contraindications} color="red" />
                )}
            </div>
        </div >
    );
};

const InfoList: React.FC<{ title: string; icon: string; items: string[]; color: string }> = ({ title, icon, items, color }) => {
    const colorMap: Record<string, string> = {
        blue: 'text-blue-300/60 bg-blue-500/5 border-blue-500/10 shadow-[inset_0_0_20px_rgba(59,130,246,0.02)]',
        yellow: 'text-yellow-300/60 bg-yellow-500/5 border-yellow-500/10 shadow-[inset_0_0_20px_rgba(234,179,8,0.02)]',
        orange: 'text-orange-300/60 bg-orange-500/5 border-orange-500/10 shadow-[inset_0_0_20px_rgba(249,115,22,0.02)]',
        red: 'text-red-300/70 bg-red-500/5 border-red-500/10 shadow-[inset_0_0_20px_rgba(239,68,68,0.02)]',
    };

    // Base colors for badges
    const badgeMap: Record<string, string> = {
        blue: 'bg-blue-500/10 border-blue-500/20 text-blue-300 group-hover:bg-blue-500/20 group-hover:border-blue-500/40 group-hover:text-blue-200',
        yellow: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300 group-hover:bg-yellow-500/20 group-hover:border-yellow-500/40 group-hover:text-yellow-200',
        orange: 'bg-orange-500/10 border-orange-500/20 text-orange-300 group-hover:bg-orange-500/20 group-hover:border-orange-500/40 group-hover:text-orange-200',
        red: 'bg-red-500/10 border-red-500/20 text-red-300 group-hover:bg-red-500/20 group-hover:border-red-500/40 group-hover:text-red-200',
    };

    // Severity indicator within the badge
    const severityMap: Record<string, { label: string, dot: string }> = {
        blue: { label: 'Notice', dot: 'bg-blue-400' },
        yellow: { label: 'Mild', dot: 'bg-yellow-400' },
        orange: { label: 'Warn', dot: 'bg-orange-400' },
        red: { label: 'Critical', dot: 'bg-rose-500 animate-pulse' },
    };

    return (
        <div className={`p-4 rounded-2xl border ${colorMap[color]} transition-all duration-300`}>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2 opacity-80 text-white">
                <span className="text-sm bg-black/40 w-7 h-7 rounded-lg flex items-center justify-center border border-white/5">{icon}</span>
                {title}
            </p>
            <div className="flex flex-col gap-2">
                {items.map((item, i) => (
                    <div key={i} className="group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-black/20 border border-white/5 hover:border-white/10 hover:bg-black/35 transition-all duration-200 cursor-default">
                        <span className="text-white/80 group-hover:text-white transition-colors">{item}</span>

                        <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all ${badgeMap[color]}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${severityMap[color].dot}`} />
                            {severityMap[color].label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DrugOrganPanel;
