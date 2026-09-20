import React from 'react';
import { sfx } from '../services/soundEffects';

interface HoloTargetReticlesProps {
    selectedOrgan: string | null;
    onSelectOrgan: (organ: string) => void;
    auraColor?: string;
}

const TARGET_ORGAN_NODES = [
    { id: 'brain', name: 'Brain', label: 'Cerebral Cortex', icon: '🧠', tag: 'NEURO-01' },
    { id: 'heart', name: 'Heart', label: 'Cardiac Core', icon: '🫀', tag: 'CARDIO-02' },
    { id: 'lungs', name: 'Lungs', label: 'Pulmonary Lobes', icon: '🫁', tag: 'PULMO-03' },
    { id: 'liver', name: 'Liver', label: 'Hepatic Matrix', icon: '🧪', tag: 'HEPAT-04' },
    { id: 'kidneys', name: 'Kidneys', label: 'Renal Complex', icon: '🫘', tag: 'RENAL-05' },
    { id: 'stomach', name: 'Stomach', label: 'Gastric Center', icon: '🥣', tag: 'GASTR-06' },
];

export const HoloTargetReticles: React.FC<HoloTargetReticlesProps> = ({
    selectedOrgan,
    onSelectOrgan,
    auraColor = 'cyan'
}) => {
    return (
        <div className="absolute top-2 sm:top-4 right-1/2 translate-x-1/2 sm:translate-x-0 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 z-20 pointer-events-auto no-print">
            {/* Holographic Fast Target Cluster */}
            <div className="flex items-center gap-1 sm:gap-1.5 p-1 bg-slate-950/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_0_25px_rgba(0,0,0,0.8)] overflow-x-auto max-w-[calc(100vw-2rem)]">
                <span className="text-[8px] font-mono text-cyan-400/70 uppercase tracking-widest px-2 font-bold hidden md:inline">
                    TARGET LOC:
                </span>

                {TARGET_ORGAN_NODES.map((node) => {
                    const isSelected = selectedOrgan?.toLowerCase() === node.name.toLowerCase() ||
                                       selectedOrgan?.toLowerCase() === node.id.toLowerCase();
                    return (
                        <button
                            key={node.id}
                            onClick={() => {
                                sfx.playOrganLock();
                                onSelectOrgan(node.name);
                            }}
                            className={`px-2 py-1 rounded-xl text-[9px] font-mono font-bold transition-all duration-300 flex items-center gap-1 cursor-pointer whitespace-nowrap ${
                                isSelected
                                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105'
                                    : 'bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border border-transparent'
                            }`}
                            title={`Lock onto ${node.label} (${node.tag})`}
                        >
                            <span>{node.icon}</span>
                            <span className="hidden sm:inline">{node.name}</span>
                            {isSelected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default HoloTargetReticles;
