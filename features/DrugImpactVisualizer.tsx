import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Brain, Search, Info, Shield, Layers, Camera, FileText, Mic, MicOff, Syringe, Activity, AlertTriangle, Heart, Clock, Zap, ChevronRight, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useAppContext } from '../context/AppContext';
import { analyzeDrugImpact, analyzeDrugSynthesis, simulateDiseaseImpact, analyzeClinicalTestFile, findOrGenerateVaccine, checkMultiInteraction, InteractionCheckResult } from '../services/geminiService';
import { DrugAnalysisResult, HeatmapEffect, DiseaseSimulationResult, VaccineInfo } from '../types';
import { ICONS } from '../constants';
import DrugHeatmap3D from '../components/DrugHeatmap3D';
import DrugOrganPanel from '../components/DrugOrganPanel';
import HandTrackingOverlay from '../components/HandTrackingOverlay';
import ErrorBoundary from '../components/ErrorBoundary';

// ─── Heatmap color legend ──────────────────────────────────────────────────────
const HeatmapLegend: React.FC = () => (
    <div className="flex items-center gap-3 px-4 py-2 bg-black/30 rounded-xl border border-white/10 backdrop-blur-md">
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Intensity</span>
        <div className="flex items-center h-3 flex-1 rounded-full overflow-hidden">
            <div className="h-full w-full" style={{
                background: 'linear-gradient(to right, #3b82f6, #06b6d4, #22c55e, #eab308, #f97316, #ef4444)'
            }} />
        </div>
        <div className="flex gap-3 text-[10px] font-semibold">
            <span className="text-blue-400">Low</span>
            <span className="text-yellow-400">Mod</span>
            <span className="text-red-400">High</span>
        </div>
    </div>
);

// ─── Quick drug presets ─────────────────────────────────────────────────────────
const DRUG_PRESETS = [
    { name: 'Ibuprofen', icon: '💊' },
    { name: 'Metformin', icon: '🩸' },
    { name: 'Aspirin', icon: '❤️' },
    { name: 'Paracetamol', icon: '🌡️' },
    { name: 'Alcohol', icon: '🍺' },
    { name: 'Caffeine', icon: '☕' },
];

const PRESET_PHARMA_CACHE: Record<string, DrugAnalysisResult> = {
    'Ibuprofen': {
        drug_name: 'Ibuprofen',
        risk_level: 'low',
        primary_mechanism: 'Non-selective reversible inhibition of cyclooxygenase (COX-1 and COX-2) enzymes reducing prostaglandin synthesis.',
        molecular_weight: '206.29 g/mol',
        half_life: '1.8 - 2.0 hours',
        bioavailability: '80 - 100% (Oral)',
        peak_concentration_time: '1 - 2 hours',
        system_wide_risk_score: 0.28,
        effects: [
            { layer: 'ORGAN_VIEW', structure_name: 'CNS Impact', effect_type: 'Primary Therapeutic', mechanism: 'Inhibition of central pain receptors & thermal regulation in hypothalamus.', intensity: 0.54, risk_level: 'low', confidence_score: 0.95, toxic_threshold: false, accumulation_factor: 0.2, dose_dependency_factor: 0.6 },
            { layer: 'ORGAN_VIEW', structure_name: 'Liver', effect_type: 'Metabolism', mechanism: 'Hepatic CYP2C9 and CYP2C8 first-pass oxidation and clearance.', intensity: 0.36, risk_level: 'low', confidence_score: 0.92, toxic_threshold: false, accumulation_factor: 0.1, dose_dependency_factor: 0.4 },
            { layer: 'ORGAN_VIEW', structure_name: 'Stomach', effect_type: 'Adverse Effect Risk', mechanism: 'Suppression of protective gastric prostaglandins causing mucosal sensitivity.', intensity: 0.62, risk_level: 'moderate', confidence_score: 0.88, toxic_threshold: false, accumulation_factor: 0.3, dose_dependency_factor: 0.7 },
            { layer: 'ORGAN_VIEW', structure_name: 'Kidney', effect_type: 'Excretion', mechanism: 'Renal hemodynamic modulation and metabolite clearance.', intensity: 0.48, risk_level: 'moderate', confidence_score: 0.85, toxic_threshold: false, accumulation_factor: 0.2, dose_dependency_factor: 0.5 }
        ],
        heatmap_effects: [
            { layer: 'ORGAN_VIEW', structure_name: 'CNS Impact', effect_type: 'Therapeutic', mechanism: 'Central pain inhibition', intensity: 0.54, risk_level: 'low', confidence_score: 0.95, toxic_threshold: false, accumulation_factor: 0.2, dose_dependency_factor: 0.6 },
            { layer: 'ORGAN_VIEW', structure_name: 'Liver', effect_type: 'Metabolism', mechanism: 'CYP2C9 clearance', intensity: 0.36, risk_level: 'low', confidence_score: 0.92, toxic_threshold: false, accumulation_factor: 0.1, dose_dependency_factor: 0.4 },
            { layer: 'ORGAN_VIEW', structure_name: 'Stomach', effect_type: 'Side Effect', mechanism: 'Gastric acid sensitivity', intensity: 0.62, risk_level: 'moderate', confidence_score: 0.88, toxic_threshold: false, accumulation_factor: 0.3, dose_dependency_factor: 0.7 },
            { layer: 'ORGAN_VIEW', structure_name: 'Kidney', effect_type: 'Clearance', mechanism: 'Renal excretion', intensity: 0.48, risk_level: 'moderate', confidence_score: 0.85, toxic_threshold: false, accumulation_factor: 0.2, dose_dependency_factor: 0.5 }
        ],
        time_based_intensity: { '0 min': 0.1, 'onset': 0.5, 'peak': 1.0, 'mid duration': 0.7, 'end duration': 0.2 }
    },
    'Aspirin': {
        drug_name: 'Aspirin',
        risk_level: 'low',
        primary_mechanism: 'Irreversible acetylation of platelet cyclooxygenase-1 (COX-1) suppressing thromboxane A2.',
        molecular_weight: '180.16 g/mol',
        half_life: '15 - 20 minutes (Salicylate: 2-3 hours)',
        bioavailability: '50 - 75% (Oral)',
        peak_concentration_time: '1 - 2 hours',
        system_wide_risk_score: 0.35,
        effects: [
            { layer: 'ORGAN_VIEW', structure_name: 'Heart', effect_type: 'Primary Therapeutic', mechanism: 'Inhibition of platelet aggregation and cardioprotective antithrombotic action.', intensity: 0.78, risk_level: 'low', confidence_score: 0.96, toxic_threshold: false, accumulation_factor: 0.1, dose_dependency_factor: 0.8 },
            { layer: 'ORGAN_VIEW', structure_name: 'Stomach', effect_type: 'Side Effect', mechanism: 'Direct irritation of mucosal barrier and inhibition of protective prostanoids.', intensity: 0.58, risk_level: 'moderate', confidence_score: 0.90, toxic_threshold: false, accumulation_factor: 0.3, dose_dependency_factor: 0.6 },
            { layer: 'ORGAN_VIEW', structure_name: 'Liver', effect_type: 'Clearance', mechanism: 'Hepatic conjugation to salicyluric acid.', intensity: 0.35, risk_level: 'low', confidence_score: 0.89, toxic_threshold: false, accumulation_factor: 0.1, dose_dependency_factor: 0.4 }
        ],
        heatmap_effects: [
            { layer: 'ORGAN_VIEW', structure_name: 'Heart', effect_type: 'Cardiovascular', mechanism: 'Antiplatelet effect', intensity: 0.78, risk_level: 'low', confidence_score: 0.96, toxic_threshold: false, accumulation_factor: 0.1, dose_dependency_factor: 0.8 },
            { layer: 'ORGAN_VIEW', structure_name: 'Stomach', effect_type: 'Gastric Effect', mechanism: 'Mucosal irritation', intensity: 0.58, risk_level: 'moderate', confidence_score: 0.90, toxic_threshold: false, accumulation_factor: 0.3, dose_dependency_factor: 0.6 },
            { layer: 'ORGAN_VIEW', structure_name: 'Liver', effect_type: 'Hepatic', mechanism: 'Salicylate metabolism', intensity: 0.35, risk_level: 'low', confidence_score: 0.89, toxic_threshold: false, accumulation_factor: 0.1, dose_dependency_factor: 0.4 }
        ],
        time_based_intensity: { '0 min': 0.15, 'onset': 0.6, 'peak': 1.0, 'mid duration': 0.65, 'end duration': 0.25 }
    },
    'Paracetamol': {
        drug_name: 'Paracetamol',
        risk_level: 'low',
        primary_mechanism: 'Central nervous system prostaglandin synthase inhibition and active metabolite AM404 cannabinoid interaction.',
        molecular_weight: '151.16 g/mol',
        half_life: '2.0 - 3.0 hours',
        bioavailability: '70 - 90%',
        peak_concentration_time: '30 - 60 minutes',
        system_wide_risk_score: 0.25,
        effects: [
            { layer: 'ORGAN_VIEW', structure_name: 'Brain', effect_type: 'Primary Therapeutic', mechanism: 'Hypothalamic heat-regulation center modulation and central analgesia.', intensity: 0.72, risk_level: 'low', confidence_score: 0.95, toxic_threshold: false, accumulation_factor: 0.1, dose_dependency_factor: 0.6 },
            { layer: 'ORGAN_VIEW', structure_name: 'Liver', effect_type: 'Metabolism', mechanism: 'Hepatic glucuronidation and CYP2E1 reactive metabolite (NAPQI) glutathione clearance.', intensity: 0.68, risk_level: 'moderate', confidence_score: 0.93, toxic_threshold: false, accumulation_factor: 0.4, dose_dependency_factor: 0.8 }
        ],
        heatmap_effects: [
            { layer: 'ORGAN_VIEW', structure_name: 'Brain', effect_type: 'Analgesia', mechanism: 'Central pain relief', intensity: 0.72, risk_level: 'low', confidence_score: 0.95, toxic_threshold: false, accumulation_factor: 0.1, dose_dependency_factor: 0.6 },
            { layer: 'ORGAN_VIEW', structure_name: 'Liver', effect_type: 'Hepatic Clearance', mechanism: 'CYP2E1 glutathione conjugation', intensity: 0.68, risk_level: 'moderate', confidence_score: 0.93, toxic_threshold: false, accumulation_factor: 0.4, dose_dependency_factor: 0.8 }
        ],
        time_based_intensity: { '0 min': 0.1, 'onset': 0.6, 'peak': 1.0, 'mid duration': 0.7, 'end duration': 0.2 }
    },
    'Metformin': {
        drug_name: 'Metformin',
        risk_level: 'low',
        primary_mechanism: 'Activation of AMP-activated protein kinase (AMPK) reducing hepatic glucose output and increasing insulin sensitivity.',
        molecular_weight: '129.16 g/mol',
        half_life: '4.0 - 8.7 hours',
        bioavailability: '50 - 60%',
        peak_concentration_time: '2 - 3 hours',
        system_wide_risk_score: 0.22,
        effects: [
            { layer: 'ORGAN_VIEW', structure_name: 'Liver', effect_type: 'Primary Therapeutic', mechanism: 'Suppression of gluconeogenesis genes and mitochondrial respiratory chain complex I.', intensity: 0.84, risk_level: 'low', confidence_score: 0.96, toxic_threshold: false, accumulation_factor: 0.2, dose_dependency_factor: 0.7 },
            { layer: 'ORGAN_VIEW', structure_name: 'Intestines', effect_type: 'Therapeutic / Side Effect', mechanism: 'Increased glucose utilization and GLP-1 hormone stimulation in intestinal enterocytes.', intensity: 0.62, risk_level: 'low', confidence_score: 0.90, toxic_threshold: false, accumulation_factor: 0.1, dose_dependency_factor: 0.5 },
            { layer: 'ORGAN_VIEW', structure_name: 'Kidney', effect_type: 'Excretion', mechanism: 'Active tubular secretion without hepatic modification.', intensity: 0.45, risk_level: 'moderate', confidence_score: 0.91, toxic_threshold: false, accumulation_factor: 0.3, dose_dependency_factor: 0.6 }
        ],
        heatmap_effects: [
            { layer: 'ORGAN_VIEW', structure_name: 'Liver', effect_type: 'Glycemic Control', mechanism: 'AMPK activation', intensity: 0.84, risk_level: 'low', confidence_score: 0.96, toxic_threshold: false, accumulation_factor: 0.2, dose_dependency_factor: 0.7 },
            { layer: 'ORGAN_VIEW', structure_name: 'Intestines', effect_type: 'GLP-1 Modulation', mechanism: 'Gut glucose uptake', intensity: 0.62, risk_level: 'low', confidence_score: 0.90, toxic_threshold: false, accumulation_factor: 0.1, dose_dependency_factor: 0.5 },
            { layer: 'ORGAN_VIEW', structure_name: 'Kidney', effect_type: 'Tubular Secretion', mechanism: 'Renal elimination', intensity: 0.45, risk_level: 'moderate', confidence_score: 0.91, toxic_threshold: false, accumulation_factor: 0.3, dose_dependency_factor: 0.6 }
        ],
        time_based_intensity: { '0 min': 0.1, 'onset': 0.4, 'peak': 1.0, 'mid duration': 0.8, 'end duration': 0.3 }
    },
    'Alcohol': {
        drug_name: 'Alcohol (Ethanol)',
        risk_level: 'high',
        primary_mechanism: 'Positive allosteric modulation of GABA-A receptors and inhibition of NMDA glutamate receptors.',
        molecular_weight: '46.07 g/mol',
        half_life: 'Zero-order elimination (7-10 g/hr)',
        bioavailability: '80 - 100%',
        peak_concentration_time: '30 - 90 minutes',
        system_wide_risk_score: 0.75,
        effects: [
            { layer: 'ORGAN_VIEW', structure_name: 'Brain', effect_type: 'Neurodepression', mechanism: 'Cerebral cortex disinhibition, cerebellar ataxia, and hippocampal memory disruption.', intensity: 0.88, risk_level: 'high', confidence_score: 0.98, toxic_threshold: true, accumulation_factor: 0.6, dose_dependency_factor: 0.9 },
            { layer: 'ORGAN_VIEW', structure_name: 'Liver', effect_type: 'Hepatic Burden', mechanism: 'Enzymatic oxidation via Alcohol Dehydrogenase producing toxic acetaldehyde.', intensity: 0.92, risk_level: 'severe', confidence_score: 0.98, toxic_threshold: true, accumulation_factor: 0.8, dose_dependency_factor: 0.9 },
            { layer: 'ORGAN_VIEW', structure_name: 'Stomach', effect_type: 'Gastric Irritation', mechanism: 'Gastric acid hypersecretion and mucosal inflammation.', intensity: 0.65, risk_level: 'moderate', confidence_score: 0.90, toxic_threshold: false, accumulation_factor: 0.4, dose_dependency_factor: 0.7 }
        ],
        heatmap_effects: [
            { layer: 'ORGAN_VIEW', structure_name: 'Brain', effect_type: 'CNS Depression', mechanism: 'GABA-A enhancement', intensity: 0.88, risk_level: 'high', confidence_score: 0.98, toxic_threshold: true, accumulation_factor: 0.6, dose_dependency_factor: 0.9 },
            { layer: 'ORGAN_VIEW', structure_name: 'Liver', effect_type: 'Oxidative Stress', mechanism: 'Acetaldehyde generation', intensity: 0.92, risk_level: 'severe', confidence_score: 0.98, toxic_threshold: true, accumulation_factor: 0.8, dose_dependency_factor: 0.9 },
            { layer: 'ORGAN_VIEW', structure_name: 'Stomach', effect_type: 'Irritation', mechanism: 'Gastritis potential', intensity: 0.65, risk_level: 'moderate', confidence_score: 0.90, toxic_threshold: false, accumulation_factor: 0.4, dose_dependency_factor: 0.7 }
        ],
        time_based_intensity: { '0 min': 0.2, 'onset': 0.7, 'peak': 1.0, 'mid duration': 0.7, 'end duration': 0.3 }
    },
    'Caffeine': {
        drug_name: 'Caffeine',
        risk_level: 'low',
        primary_mechanism: 'Non-selective competitive antagonism of A1 and A2A adenosine receptors stimulating dopaminergic neurotransmission.',
        molecular_weight: '194.19 g/mol',
        half_life: '3.0 - 5.0 hours',
        bioavailability: '99% (Rapid)',
        peak_concentration_time: '30 - 60 minutes',
        system_wide_risk_score: 0.20,
        effects: [
            { layer: 'ORGAN_VIEW', structure_name: 'Brain', effect_type: 'CNS Stimulation', mechanism: 'Blockade of drowsiness-inducing adenosine and increased alertness.', intensity: 0.86, risk_level: 'low', confidence_score: 0.96, toxic_threshold: false, accumulation_factor: 0.2, dose_dependency_factor: 0.7 },
            { layer: 'ORGAN_VIEW', structure_name: 'Heart', effect_type: 'Cardiovascular Stimulation', mechanism: 'Increased intracellular cAMP via phosphodiesterase inhibition elevating heart rate.', intensity: 0.64, risk_level: 'moderate', confidence_score: 0.92, toxic_threshold: false, accumulation_factor: 0.2, dose_dependency_factor: 0.6 },
            { layer: 'ORGAN_VIEW', structure_name: 'Kidney', effect_type: 'Mild Diuresis', mechanism: 'Adenosine receptor blockade in proximal tubules enhancing sodium clearance.', intensity: 0.38, risk_level: 'low', confidence_score: 0.85, toxic_threshold: false, accumulation_factor: 0.1, dose_dependency_factor: 0.4 }
        ],
        heatmap_effects: [
            { layer: 'ORGAN_VIEW', structure_name: 'Brain', effect_type: 'Alertness', mechanism: 'Adenosine antagonism', intensity: 0.86, risk_level: 'low', confidence_score: 0.96, toxic_threshold: false, accumulation_factor: 0.2, dose_dependency_factor: 0.7 },
            { layer: 'ORGAN_VIEW', structure_name: 'Heart', effect_type: 'Tachycardia Risk', mechanism: 'cAMP elevation', intensity: 0.64, risk_level: 'moderate', confidence_score: 0.92, toxic_threshold: false, accumulation_factor: 0.2, dose_dependency_factor: 0.6 },
            { layer: 'ORGAN_VIEW', structure_name: 'Kidney', effect_type: 'Diuretic Effect', mechanism: 'Renal blood flow increase', intensity: 0.38, risk_level: 'low', confidence_score: 0.85, toxic_threshold: false, accumulation_factor: 0.1, dose_dependency_factor: 0.4 }
        ],
        time_based_intensity: { '0 min': 0.2, 'onset': 0.8, 'peak': 1.0, 'mid duration': 0.7, 'end duration': 0.3 }
    }
};

const ROUTES = ['Oral', 'Intravenous (IV)', 'Intramuscular (IM)', 'Topical', 'Inhalation', 'Sublingual'];

// ─── Disease presets ────────────────────────────────────────────────────────────
const DISEASE_PRESETS = [
    { name: 'Influenza', icon: '🦠', color: 'from-yellow-500 to-orange-500' },
    { name: 'COVID-19', icon: '🔴', color: 'from-red-500 to-rose-600' },
    { name: 'Diabetes Type 2', icon: '🩸', color: 'from-blue-500 to-cyan-500' },
    { name: 'Hypertension', icon: '❤️', color: 'from-rose-500 to-pink-600' },
    { name: 'Tuberculosis', icon: '🫁', color: 'from-amber-500 to-yellow-600' },
    { name: 'Malaria', icon: '🦟', color: 'from-green-500 to-emerald-600' },
    { name: 'Hepatitis B', icon: '🫀', color: 'from-purple-500 to-violet-600' },
    { name: 'Pneumonia', icon: '💨', color: 'from-sky-500 to-blue-600' },
    { name: 'Dengue Fever', icon: '🌡️', color: 'from-orange-500 to-red-500' },
];

// ─── Risk color helper ────────────────────────────────────────────────────────
const getRiskColor = (risk: string) => {
    switch (risk) {
        case 'low': return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
        case 'medium': case 'moderate': return 'text-yellow-400 bg-yellow-500/15 border-yellow-500/30';
        case 'high': return 'text-orange-400 bg-orange-500/15 border-orange-500/30';
        case 'severe': return 'text-red-400 bg-red-500/15 border-red-500/30';
        default: return 'text-white/50 bg-white/5 border-white/10';
    }
};

const ORGAN_ICONS: Record<string, string> = {
    'Brain': '🧠', 'Heart': '❤️', 'Liver': '🫁', 'Kidney': '🫘',
    'Lungs': '💨', 'Stomach': '🫃', 'Nervous System': '⚡', 'Muscles': '💪',
    'Skin': '🫀', 'Intestines': '🌀',
};

interface InteractionCheckerPanelProps {
    result: InteractionCheckResult | null;
    isLoading: boolean;
    selectedOrgan: string | null;
    onOrganSelect: (organ: string) => void;
    drugs: string[];
    foods: string[];
    diseases: string[];
}

const InteractionCheckerPanel: React.FC<InteractionCheckerPanelProps> = ({
    result, isLoading, selectedOrgan, onOrganSelect, drugs, foods, diseases
}) => {
    const getRatingDetails = (rating: 'A' | 'B' | 'C' | 'D' | 'F') => {
        switch (rating) {
            case 'A': return { color: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', label: 'Optimal Safety (A)', glow: 'shadow-[0_0_20px_rgba(16,185,129,0.15)]' };
            case 'B': return { color: 'text-sky-400', border: 'border-sky-500/20', bg: 'bg-sky-500/5', label: 'Minor Warnings (B)', glow: 'shadow-[0_0_20px_rgba(14,165,233,0.15)]' };
            case 'C': return { color: 'text-yellow-400', border: 'border-yellow-500/20', bg: 'bg-yellow-500/5', label: 'Moderate Caution (C)', glow: 'shadow-[0_0_20px_rgba(234,179,8,0.15)]' };
            case 'D': return { color: 'text-orange-400', border: 'border-orange-500/20', bg: 'bg-orange-500/5', label: 'High Interaction Risk (D)', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.15)]' };
            case 'F': return { color: 'text-rose-400', border: 'border-rose-500/30', bg: 'bg-rose-500/10', label: 'Contraindicated (F)', glow: 'shadow-[0_0_25px_rgba(244,63,94,0.25)] animate-pulse' };
        }
    };

    const getSeverityBadge = (sev: string) => {
        switch (sev.toLowerCase()) {
            case 'low': return 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400';
            case 'moderate': return 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400';
            case 'high': return 'bg-orange-500/10 border border-orange-500/20 text-orange-400';
            case 'severe': return 'bg-rose-500/15 border border-rose-500/30 text-rose-400 animate-pulse';
            default: return 'bg-white/5 border border-white/10 text-white/50';
        }
    };

    const getStrainColor = (level: string) => {
        switch (level.toLowerCase()) {
            case 'high': return 'bg-rose-500';
            case 'moderate': return 'bg-orange-500';
            case 'low': return 'bg-yellow-500';
            default: return 'bg-emerald-500/30';
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white/[0.01]">
                <div className="w-12 h-12 border-2 border-purple-500/30 border-t-purple-400 rounded-full animate-spin mb-4" />
                <h3 className="text-sm font-black text-purple-300 uppercase tracking-widest mb-1.5">Analyzing Safety Matrix</h3>
                <p className="text-xs text-white/30 leading-relaxed max-w-[200px]">Evaluating receptor sites, enzyme inhibition, and organ clearances...</p>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-white/[0.01]">
                <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center mb-5 text-3xl shadow-lg">🧬</div>
                <h3 className="text-sm font-black text-white/60 mb-2 uppercase tracking-wider">Ready to check interactions</h3>
                <p className="text-xs text-white/30 leading-relaxed max-w-[220px]">
                    Build a combination of drugs, food, and health factors, then run safety check to analyze warnings.
                </p>
            </div>
        );
    }

    const ratingInfo = getRatingDetails(result.safetyRating) || { color: 'text-white', border: 'border-white/10', bg: 'bg-white/5', label: 'Unknown Rating', glow: '' };

    return (
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 custom-scrollbar text-white">
            {/* Safety Rating Card */}
            <div className={`p-5 rounded-2xl border ${ratingInfo.bg} ${ratingInfo.border} ${ratingInfo.glow} relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-xl bg-black/45 border ${ratingInfo.border} flex items-center justify-center text-3xl font-black ${ratingInfo.color}`}>
                        {result.safetyRating}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-[9px] font-black uppercase tracking-widest text-purple-300 mb-0.5">Bio-safety profile</div>
                        <h4 className="text-xs font-black text-white">{ratingInfo.label}</h4>
                        <p className="text-[10px] text-white/60 leading-normal mt-1">{result.summary}</p>
                    </div>
                </div>
            </div>

            {/* Organ Strain Breakdown */}
            <div>
                <h4 className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <Activity size={12} className="text-purple-400" /> Target Organ strain indicators
                </h4>
                <div className="grid grid-cols-1 gap-2">
                    {result.organStrain.map((strain: any) => {
                        const isSelected = selectedOrgan?.toLowerCase() === strain.organName.toLowerCase();
                        return (
                            <button
                                key={strain.organName}
                                onClick={() => onOrganSelect(strain.organName)}
                                className={`w-full text-left p-3 rounded-xl border transition-all hover:scale-[1.01] flex flex-col gap-2
                                    ${isSelected
                                        ? 'bg-purple-500/10 border-purple-500/35 shadow-inner'
                                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'}`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-black text-white/90 flex items-center gap-1.5">
                                        <span>{ORGAN_ICONS[strain.organName] || '🫁'}</span>
                                        {strain.organName}
                                    </span>
                                    <span className={`text-[8px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/5`}>
                                        {strain.strainLevel} Strain
                                    </span>
                                </div>
                                <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${getStrainColor(strain.strainLevel)} transition-all duration-1000`}
                                        style={{ width: strain.strainLevel === 'high' ? '90%' : strain.strainLevel === 'moderate' ? '60%' : strain.strainLevel === 'low' ? '30%' : '5%' }}
                                    />
                                </div>
                                <p className="text-[10px] text-white/55 leading-relaxed">{strain.explanation}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Interaction Warnings Matrix */}
            <div>
                <h4 className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <AlertTriangle size={12} className="text-rose-400" /> Interaction Warning Matrix
                </h4>
                <div className="space-y-3">
                    {result.interactions.map((inter: any, idx: number) => (
                        <div key={idx} className="p-4 bg-white/[0.02] border border-white/5 rounded-xl space-y-3 shadow-lg">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-[9px] font-bold text-purple-300 uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-lg">
                                    {inter.type}
                                </span>
                                <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full ${getSeverityBadge(inter.severity)}`}>
                                    {inter.severity} severity
                                </span>
                            </div>
                            <div>
                                <h5 className="text-xs font-black text-white/95 flex items-center gap-1.5">
                                    {inter.subjectA} <span className="text-white/30 font-light">↔</span> {inter.subjectB}
                                </h5>
                                <p className="text-[10px] text-white/50 mt-1 leading-normal">
                                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-wider mr-1">Mechanism:</span>
                                    {inter.mechanism}
                                </p>
                            </div>
                            <div className="p-2.5 rounded-lg bg-black/20 border border-white/5 text-[10px] text-emerald-300/90 leading-relaxed font-semibold">
                                <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">Clinical advice</span>
                                {inter.clinicalAdvice}
                            </div>
                        </div>
                    ))}
                    {result.interactions.length === 0 && (
                        <div className="p-4 text-center rounded-xl border border-white/5 bg-white/[0.01] text-xs text-white/35 italic">
                            No significant drug, diet, or comorbidity interactions detected.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ─── Animated radial progress ─────────────────────────────────────────────────
const RadialProgress: React.FC<{ value: number; color: string; label: string; size?: number }> = ({ value, color, label, size = 80 }) => {
    const r = (size - 10) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (value / 100) * circ;
    return (
        <div className="flex flex-col items-center gap-1.5">
            <svg width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={6} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
                    strokeDasharray={circ} strokeDashoffset={offset}
                    strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
                    style={{ transition: 'stroke-dashoffset 1.2s ease' }}
                />
                <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fill="white" fontSize={size < 70 ? 11 : 14} fontWeight="bold">{value}%</text>
            </svg>
            <span className="text-[10px] text-white/50 text-center leading-tight">{label}</span>
        </div>
    );
};

const checkIsOrganInfected = (organName: string, activeSet: Set<string> | string[]) => {
    const name = organName.toLowerCase().trim();
    const activeArr = Array.isArray(activeSet) ? activeSet.map(o => o.toLowerCase()) : Array.from(activeSet).map(o => o.toLowerCase());
    if (activeArr.includes(name)) return true;
    if (activeArr.some(org => name.includes(org) || org.includes(name))) return true;

    const synonyms: Record<string, string[]> = {
        'lungs': ['lung', 'respiratory', 'pulmonary', 'alveol', 'bronch', 'throat', 'airway'],
        'heart': ['cardiac', 'cardio', 'circulatory', 'blood', 'vessel', 'myocard', 'coronary', 'cardiovascular'],
        'brain': ['cns', 'nervous', 'neural', 'cerebral', 'cognitive', 'head', 'encephal', 'spinal'],
        'liver': ['hepatic', 'metabolic', 'hepat'],
        'kidney': ['kidney', 'kidneys', 'renal', 'nephr', 'filtration', 'urine', 'urinary'],
        'stomach': ['gastric', 'gi ', 'gastro', 'digestive', 'gut', 'abdomen'],
        'intestines': ['intestines', 'intestinal', 'colon', 'bowel', 'gut', 'digestive'],
        'muscles': ['muscle', 'skeletal', 'bone', 'joint', 'motor'],
        'skin': ['skin', 'dermal', 'epiderm', 'cutaneous', 'integumentary']
    };

    for (const [key, list] of Object.entries(synonyms)) {
        if (name.includes(key.toLowerCase()) || key.toLowerCase().includes(name)) {
            if (activeArr.some(org =>
                list.some(syn => org.includes(syn) || syn.includes(org))
            )) {
                return true;
            }
        }
    }
    return false;
};

// ─── Main component ─────────────────────────────────────────────────────────────
export const DrugImpactVisualizer = () => {
    const { navigateTo } = useAppContext();

    // ─── Top-level tab ────────────────────────────────────────────────
    const [activeTab, setActiveTab] = useState<'drug' | 'disease'>('drug');

    // ─── Disease Simulator State ──────────────────────────────────────
    const [diseaseName, setDiseaseName] = useState('Influenza');
    const [diseaseAge, setDiseaseAge] = useState<number | ''>('');
    const [diseaseSeverity, setDiseaseSeverity] = useState<'mild' | 'moderate' | 'severe'>('moderate');
    const [diseaseResult, setDiseaseResult] = useState<DiseaseSimulationResult | null>(null);
    const [diseaseLoading, setDiseaseLoading] = useState(false);
    const [diseaseError, setDiseaseError] = useState<string | null>(null);

    // Multi-Drug / Cocktail state variables
    const [selectedMedsForCocktail, setSelectedMedsForCocktail] = useState<string[]>([]);
    const [injectedDrugs, setInjectedDrugs] = useState<string[]>([]);
    const [injecting, setInjecting] = useState(false);
    const [cureProgress, setCureProgress] = useState(0);
    const [injectionLog, setInjectionLog] = useState<string[]>([]);
    const [activeSection, setActiveSection] = useState<'injection' | 'symptoms' | 'treatment' | 'response' | 'outcome'>('injection');
    const [diseaseSelectedOrgan, setDiseaseSelectedOrgan] = useState<string | null>(null);

    // Pathogen Mutators & Timeline state variables
    const [mutatorInfectivity, setMutatorInfectivity] = useState<number>(2.0);
    const [mutatorIncubationSpeed, setMutatorIncubationSpeed] = useState<number>(1.0);
    const [mutatorImmuneStrength, setMutatorImmuneStrength] = useState<number>(100);
    const [timelineStepIndex, setTimelineStepIndex] = useState<number>(0);
    const [isAutoplayActive, setIsAutoplayActive] = useState<boolean>(false);

    // File upload & Vaccine states
    const [diseaseFile, setDiseaseFile] = useState<File | null>(null);
    const [isUploadingDiseaseFile, setIsUploadingDiseaseFile] = useState(false);
    const [vaccineInfo, setVaccineInfo] = useState<VaccineInfo | null>(null);
    const [isSearchingVaccine, setIsSearchingVaccine] = useState(false);
    const [selectedVaccineCodons, setSelectedVaccineCodons] = useState<string[]>(['Spike Glycoprotein (S)']);
    const [customVaccineName, setCustomVaccineName] = useState('BioNTech-mRNA-01');

    // Inputs
    const [analysisMode, setAnalysisMode] = useState<'text' | 'image'>('text');
    const [drugName, setDrugName] = useState('Ibuprofen');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [dosage, setDosage] = useState(400);      // mg
    const [route, setRoute] = useState('Oral');
    const [age, setAge] = useState<number | ''>('');
    const [weight, setWeight] = useState<number | ''>('');
    const [genomicProfile, setGenomicProfile] = useState('Standard (Normal Metabolizer)');
    const [timePhase, setTimePhase] = useState<'0 min' | 'onset' | 'peak' | 'mid duration' | 'end duration'>('peak');

    // State
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<DrugAnalysisResult | null>(() => PRESET_PHARMA_CACHE['Ibuprofen'] || null);
    const [error, setError] = useState<string | null>(null);
    const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);

    // Comparison mode
    const [compareMode, setCompareMode] = useState(false);
    const [drugName2, setDrugName2] = useState('');
    const [result2, setResult2] = useState<DrugAnalysisResult | null>(null);
    const [isLoading2, setIsLoading2] = useState(false);

    const [viewMode, setViewMode] = useState<'BODY' | 'SKELETON' | 'ORGANS' | 'MUSCLES' | 'NERVOUS_GLB'>('BODY');

    // Multi-Drug / Food / Disease Interaction checker state variables
    const [interactionDrugs, setInteractionDrugs] = useState<string[]>(['Ibuprofen']);
    const [interactionFoods, setInteractionFoods] = useState<string[]>(['Grapefruit juice']);
    const [interactionDiseases, setInteractionDiseases] = useState<string[]>(['Chronic Kidney Disease']);
    const [interactionResult, setInteractionResult] = useState<InteractionCheckResult | null>(null);
    const [isCheckingInteractions, setIsCheckingInteractions] = useState(false);
    const [interactionError, setInteractionError] = useState<string | null>(null);
    const [newDrugInput, setNewDrugInput] = useState('');
    const [newFoodInput, setNewFoodInput] = useState('');
    const [newDiseaseInput, setNewDiseaseInput] = useState('');
    const [isInteractionMode, setIsInteractionMode] = useState(false);

    // Voice Command State
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    // Hand Tracking State
    const [isHandTrackingActive, setIsHandTrackingActive] = useState(false);
    const [handRotationDelta, setHandRotationDelta] = useState<{ x: number, y: number }>({ x: 0, y: 0 });
    const [handDragDelta, setHandDragDelta] = useState<{ x: number, y: number } | undefined>(undefined);
    const [handZoomDelta, setHandZoomDelta] = useState<number>(0);
    const [cameraResetFlag, setCameraResetFlag] = useState(0);
    const [debugRegions, setDebugRegions] = useState(false);
    const [calibrationMode, setCalibrationMode] = useState(false);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ─── Web Speech API (Voice Commands) ─────────────
    useEffect(() => {
        // @ts-ignore
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (e: any) => {
            console.error('Speech recognition error', e);
            setIsListening(false);
        };

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            console.log("Voice Command:", transcript);

            if (transcript.includes('analyze') || transcript.includes('check')) {
                const words = transcript.split(' ');
                const target = words[words.length - 1];
                if (target && target.length > 2) {
                    setDrugName(target);
                    setTimeout(() => {
                        const analyzeBtn = document.getElementById('run-analysis-btn');
                        if (analyzeBtn) analyzeBtn.click();
                    }, 500);
                }
            }

            // Physical Inputs
            else if (transcript.includes('dosage') || transcript.includes('dose')) {
                const match = transcript.match(/\d+/);
                if (match) setDosage(Number(match[0]));
            }
            else if (transcript.includes('age')) {
                const match = transcript.match(/\d+/);
                if (match) setAge(Number(match[0]));
            }
            else if (transcript.includes('weight')) {
                const match = transcript.match(/\d+/);
                if (match) setWeight(Number(match[0]));
            }

            // Route of Administration
            else if (transcript.includes('oral') || transcript.includes('by mouth')) setRoute('Oral');
            else if (transcript.includes('iv') || transcript.includes('intravenous')) setRoute('Intravenous');
            else if (transcript.includes('im') || transcript.includes('intramuscular')) setRoute('Intramuscular');
            else if (transcript.includes('subcutaneous')) setRoute('Subcutaneous');
            else if (transcript.includes('topical')) setRoute('Topical');
            else if (transcript.includes('inhalation')) setRoute('Inhalation');

            // Metabolic Profile
            else if (transcript.includes('ultra rapid') || transcript.includes('ultrarapid') || transcript.includes('ultra-rapid')) setGenomicProfile('Ultra-Rapid Metabolizer');
            else if (transcript.includes('extensive') || transcript.includes('normal')) setGenomicProfile('Standard (Normal Metabolizer)');
            else if (transcript.includes('intermediate')) setGenomicProfile('Intermediate Metabolizer');
            else if (transcript.includes('poor metabolizer') || transcript.includes('slow metabolizer')) setGenomicProfile('Poor Metabolizer');

            // View Controls
            else if (transcript.includes('show liver') || transcript.includes('liver')) setSelectedOrgan('Liver');
            else if (transcript.includes('show heart') || transcript.includes('heart')) setSelectedOrgan('Heart');
            else if (transcript.includes('show brain') || transcript.includes('brain')) setSelectedOrgan('Brain');
            else if (transcript.includes('skeleton') || transcript.includes('bones')) setViewMode('SKELETON');
            else if (transcript.includes('body') || transcript.includes('flesh')) setViewMode('BODY');

        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Timeline autoplay loop
    useEffect(() => {
        if (!isAutoplayActive || !diseaseResult) return;
        const timelineLength = diseaseResult.body_impact.timeline.length;
        if (timelineLength <= 1) return;

        const interval = setInterval(() => {
            setTimelineStepIndex(prev => (prev + 1) % timelineLength);
        }, 2500);

        return () => clearInterval(interval);
    }, [isAutoplayActive, diseaseResult]);

    const toggleVoice = () => {
        if (isListening) {
            recognitionRef.current?.stop();
        } else {
            recognitionRef.current?.start();
        }
    };

    // ─── Derive HeatmapEffect[] from result ─────────────
    const uniqueEffects = useMemo((): HeatmapEffect[] => {
        if (!result) return [];
        let effects: HeatmapEffect[] = [];
        if (Array.isArray(result.heatmap_effects)) effects = result.heatmap_effects;
        else if (Array.isArray(result.effects)) effects = result.effects as unknown as HeatmapEffect[];

        if (result.time_based_intensity && result.time_based_intensity[timePhase] !== undefined) {
            const multiplier = result.time_based_intensity[timePhase];
            return effects.map(e => ({ ...e, intensity: e.intensity * multiplier }));
        }
        return effects;
    }, [result, timePhase]);

    const uniqueEffects2 = useMemo((): HeatmapEffect[] => {
        if (!result2) return [];
        let _effects: HeatmapEffect[] = [];
        if (Array.isArray(result2.heatmap_effects)) _effects = result2.heatmap_effects;
        else if (Array.isArray(result2.effects)) _effects = result2.effects as unknown as HeatmapEffect[];

        if (result2.time_based_intensity && result2.time_based_intensity[timePhase] !== undefined) {
            const multiplier = result2.time_based_intensity[timePhase];
            return _effects.map(e => ({ ...e, intensity: e.intensity * multiplier }));
        }
        return _effects;
    }, [result2, timePhase]);

    const interactionHeatmapEffects = useMemo((): HeatmapEffect[] => {
        if (!isInteractionMode || !interactionResult) return [];
        return interactionResult.organStrain.map(strain => {
            const level = strain.strainLevel.toLowerCase();
            const intensity = level === 'high' ? 0.9 : level === 'moderate' ? 0.65 : level === 'low' ? 0.35 : 0.05;
            const risk_level = level === 'high' ? 'high' : level === 'moderate' ? 'moderate' : 'low';
            return {
                layer: 'ORGAN_VIEW',
                structure_name: strain.organName,
                effect_type: 'Systemic Strain',
                mechanism: strain.explanation,
                intensity,
                risk_level,
                confidence_score: 0.9,
                toxic_threshold: level === 'high',
                accumulation_factor: 0.5,
                dose_dependency_factor: 0.5
            };
        });
    }, [isInteractionMode, interactionResult]);

    const handleCheckInteractions = async () => {
        if (interactionDrugs.length === 0) {
            setInteractionError("Please add at least one drug compound to analyze.");
            return;
        }
        setIsCheckingInteractions(true);
        setInteractionError(null);
        try {
            const res = await checkMultiInteraction(interactionDrugs, interactionFoods, interactionDiseases);
            setInteractionResult(res);
            setViewMode('ORGANS');
        } catch (err: any) {
            console.error(err);
            setInteractionError("Failed to check safety interactions. Please verify API configuration.");
        } finally {
            setIsCheckingInteractions(false);
        }
    };

    const computedRiskLevel = useMemo((): 'low' | 'moderate' | 'high' | 'severe' => {
        if (!result) return 'moderate';
        if (result.system_wide_risk_score !== undefined) {
            if (result.system_wide_risk_score < 0.3) return 'low';
            if (result.system_wide_risk_score < 0.6) return 'moderate';
            if (result.system_wide_risk_score < 0.85) return 'high';
            return 'severe';
        }
        const r = result.risk_level?.toLowerCase();
        if (r === 'low' || r === 'moderate' || r === 'high' || r === 'severe') return r;
        return 'moderate';
    }, [result]);

    // ─── Analysis ─────────────────────────────────────────────────────────────
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async (overrideDrugName?: string) => {
        const targetDrug = (overrideDrugName || drugName).trim();
        if (analysisMode === 'text') {
            if (!targetDrug) return;
            
            // Check instant pre-computed cache first (0ms latency)
            const cached = PRESET_PHARMA_CACHE[targetDrug];
            if (cached) {
                setResult(cached);
                setError(null);
                setSelectedOrgan(null);
                return;
            }

            setIsLoading(true);
            setError(null);
            setSelectedOrgan(null);
            try {
                const res = await analyzeDrugImpact(
                    targetDrug,
                    `${dosage}mg`,
                    age || undefined,
                    route,
                    weight || undefined,
                    genomicProfile
                );
                if (res) {
                    setResult(res);
                }
            } catch (err) {
                console.error("Analysis failed", err);
                setError('Analysis failed. Please check your network and try again.');
            } finally {
                setIsLoading(false);
            }
        } else {
            if (!imagePreview) return;
            setIsLoading(true);
            setError(null);
            setSelectedOrgan(null);
            try {
                const res = await analyzeDrugSynthesis(
                    imagePreview,
                    `${dosage}mg`,
                    age || undefined,
                    route,
                    weight || undefined
                );
                if (res) {
                    setResult(res);
                    // Update drugname so the UI header matches the inferred drug
                    setDrugName(res.drug_name || 'Inferred Structure');
                }
            } catch (err) {
                console.error("Image Analysis failed", err);
                setError('Image analysis failed. Please check your network and try again.');
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleAnalyze2 = async () => {
        if (!drugName2.trim()) return;
        setIsLoading2(true);
        setResult2(null);
        try {
            const data = await analyzeDrugImpact(
                drugName2,
                `${dosage}mg`,
                age || undefined,
                route,
                weight || undefined,
                genomicProfile
            );
            setResult2(data);
        } catch (err) {
            console.error('Drug analysis failed:', err);
            // No specific error state for second drug, just log
        } finally {
            setIsLoading2(false);
        }
    }

    // Dosage slider re-triggers analysis with debounce
    const handleDosageChange = (v: number) => {
        setDosage(v);
        if (!result) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => handleAnalyze(), 800);
    };

    // ─── Disease simulation handler ───────────────────────────────────
    const handleDiseaseSimulate = async () => {
        if (!diseaseName.trim()) return;
        setDiseaseLoading(true);
        setDiseaseResult(null);
        setDiseaseError(null);
        setInjectedDrugs([]);
        setSelectedMedsForCocktail([]);
        setCureProgress(0);
        setInjectionLog([]);
        setDiseaseSelectedOrgan(null);
        try {
            const res = await simulateDiseaseImpact(
                diseaseName,
                diseaseAge || 'Adult',
                diseaseSeverity,
                {
                    infectivity: mutatorInfectivity,
                    incubationSpeed: mutatorIncubationSpeed,
                    immuneStrength: mutatorImmuneStrength
                }
            );
            setDiseaseResult(res);
            setTimelineStepIndex(res.body_impact.timeline.length - 1);
            setIsAutoplayActive(false);
            setActiveSection('injection');
        } catch (err) {
            console.error('Disease simulation failed', err);
            setDiseaseError('Simulation failed. Please try again.');
        } finally {
            setDiseaseLoading(false);
        }
    };

    const handleDiseaseFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setDiseaseFile(file);
        setIsUploadingDiseaseFile(true);
        setDiseaseResult(null);
        setDiseaseError(null);
        setInjectedDrugs([]);
        setSelectedMedsForCocktail([]);
        setCureProgress(0);
        setInjectionLog([]);
        setVaccineInfo(null);

        try {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const base64data = reader.result as string;
                const res = await analyzeClinicalTestFile(base64data, file.type);
                setDiseaseResult(res);
                setDiseaseName(res.disease_name);
                if (res.severity) {
                    setDiseaseSeverity(res.severity as any);
                }
                setTimelineStepIndex(res.body_impact.timeline.length - 1);
                setIsAutoplayActive(false);
                setActiveSection('injection');
                setIsUploadingDiseaseFile(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('File parsing failed', err);
            setDiseaseError('Failed to parse clinical document.');
            setIsUploadingDiseaseFile(false);
        }
    };

    // Unified Therapy Cocktails administration system
    const runAdministration = useCallback(async (medList: string[]) => {
        if (injecting || medList.length === 0) return;
        setInjectedDrugs(medList);
        setInjecting(true);
        setCureProgress(0);
        setInjectionLog([]);

        // Compute efficacy on the fly for the medList
        const meds = medList.map(name => {
            const diseaseMed = diseaseResult?.treatment.medications.find(m => m.name === name);
            if (diseaseMed) return { name, type: diseaseMed.type, baseEff: diseaseMed.type === 'Antibiotic' || diseaseMed.type === 'Antiviral' ? 0.75 : diseaseMed.type === 'NSAID' ? 0.6 : 0.5 };
            if (vaccineInfo && vaccineInfo.vaccineName === name) return { name, type: 'Vaccine', baseEff: vaccineInfo.efficacy / 100 };
            return { name, type: 'Supportive', baseEff: 0.4 };
        });

        const types = meds.map(m => m.type);
        const uniqueTypes = new Set(types);
        const hasClash = types.length !== uniqueTypes.size;

        let product = 1;
        meds.forEach(m => { product *= (1 - m.baseEff); });
        let combinedEfficacy = 1 - product;

        let synergyBonus = 0;
        if (uniqueTypes.size >= 2) {
            if (uniqueTypes.has('Antibiotic') && uniqueTypes.has('NSAID')) synergyBonus += 12;
            if (uniqueTypes.has('Antipyretic') && uniqueTypes.has('NSAID')) synergyBonus += 5;
            if (uniqueTypes.has('Vaccine') && uniqueTypes.size >= 2) synergyBonus += 15;
        }

        let finalEfficacy = Math.round(combinedEfficacy * 100) + synergyBonus;
        if (hasClash) finalEfficacy = Math.max(10, finalEfficacy - 15);
        finalEfficacy = Math.min(98, Math.max(5, finalEfficacy));

        const targetCure = finalEfficacy;
        setInjectionLog([`💉 Administering Therapy: ${medList.join(' + ')}...`]);
        await new Promise(r => setTimeout(r, 800));

        const steps: string[] = [];
        steps.push(`Absorption Phase: Compounds distributed into systemic circulation.`);

        if (types.includes('Vaccine')) {
            steps.push(`Vaccine component: Active antigens mapped by helper T-cells.`);
        }
        if (types.includes('Antibiotic') || types.includes('Antiviral')) {
            steps.push(`Antimicrobial agent: Inhibiting pathogen transcription and metabolic replication.`);
        }
        if (types.includes('NSAID')) {
            steps.push(`NSAID component: Downregulating inflammatory prostaglandins in peripheral tissues.`);
        }
        if (types.includes('Antipyretic')) {
            steps.push(`Antipyretic action: Re-calibrating hypothalamic set point to reduce core temperature.`);
        }

        if (synergyBonus > 0) {
            steps.push(`Synergy Detected: Combined action increases pathogencidal efficiency by ${synergyBonus}%!`);
        }
        if (hasClash) {
            steps.push(`ALERT: Metabolic pathway overlap. Increased strain on hepatic filtration networks.`);
        }

        steps.push(`Resolution Phase: Pathogen replication arrested. Cellular homeostasis restoring.`);

        for (let i = 0; i < steps.length; i++) {
            setInjectionLog(prev => [...prev, '⚡ ' + steps[i]]);
            await new Promise(r => setTimeout(r, 900));
            const progress = Math.round(((i + 1) / steps.length) * targetCure);
            setCureProgress(progress);
        }

        setInjectionLog(prev => [...prev, `✅ Therapy Cycle complete. Clearance level: ${targetCure}% achieved.`]);
        setInjecting(false);
    }, [diseaseResult, vaccineInfo, injecting]);

    const handleInjectDrug = async (drugName: string) => {
        setSelectedMedsForCocktail([drugName]);
        await runAdministration([drugName]);
    };

    const handleAdministerCocktail = async () => {
        await runAdministration(selectedMedsForCocktail);
    };

    const toggleMedSelection = (name: string) => {
        setSelectedMedsForCocktail(prev =>
            prev.includes(name) ? prev.filter(x => x !== name) : [...prev, name]
        );
    };

    const handleVaccineSearch = async () => {
        if (!diseaseName || !diseaseResult) return;
        setIsSearchingVaccine(true);
        try {
            const result = await findOrGenerateVaccine(diseaseResult.disease_name);
            setVaccineInfo(result);
        } catch (error) {
            console.error("Failed to search/generate vaccine", error);
        } finally {
            setIsSearchingVaccine(false);
        }
    };

    // Cocktail Analysis Memoizer
    const cocktailAnalysis = useMemo(() => {
        if (selectedMedsForCocktail.length === 0) {
            return { efficacy: 0, hasClash: false, clashWarning: '', synergyBonus: 0 };
        }

        const meds = selectedMedsForCocktail.map(name => {
            const diseaseMed = diseaseResult?.treatment.medications.find(m => m.name === name);
            if (diseaseMed) return { name, type: diseaseMed.type, baseEff: diseaseMed.type === 'Antibiotic' || diseaseMed.type === 'Antiviral' ? 0.75 : diseaseMed.type === 'NSAID' ? 0.6 : 0.5 };
            if (vaccineInfo && vaccineInfo.vaccineName === name) return { name, type: 'Vaccine', baseEff: vaccineInfo.efficacy / 100 };
            return { name, type: 'Supportive', baseEff: 0.4 };
        });

        const types = meds.map(m => m.type);
        const uniqueTypes = new Set(types);
        const hasClash = types.length !== uniqueTypes.size;

        let clashWarning = '';
        if (hasClash) {
            const duplicates = types.filter((t, index) => types.indexOf(t) !== index);
            const duplicateType = duplicates[0];
            clashWarning = `Multiple medications of class '${duplicateType}' combined. Risk of therapeutic duplication and systemic organ toxicity (liver/renal strain).`;
        }

        let product = 1;
        meds.forEach(m => { product *= (1 - m.baseEff); });
        let combinedEfficacy = 1 - product;

        let synergyBonus = 0;
        if (uniqueTypes.size >= 2) {
            if (uniqueTypes.has('Antibiotic') && uniqueTypes.has('NSAID')) synergyBonus += 12;
            if (uniqueTypes.has('Antipyretic') && uniqueTypes.has('NSAID')) synergyBonus += 5;
            if (uniqueTypes.has('Vaccine') && uniqueTypes.size >= 2) synergyBonus += 15;
        }

        let finalEfficacy = Math.round(combinedEfficacy * 100) + synergyBonus;
        if (hasClash) finalEfficacy = Math.max(10, finalEfficacy - 15);
        finalEfficacy = Math.min(98, Math.max(5, finalEfficacy));

        return {
            efficacy: finalEfficacy,
            hasClash,
            clashWarning,
            synergyBonus
        };
    }, [selectedMedsForCocktail, diseaseResult, vaccineInfo]);

    // Biometrics dynamic chart data generator
    const biometricChartData = useMemo(() => {
        if (!diseaseResult) return [];

        const baseSeverityMult = diseaseSeverity === 'mild' ? 0.6 : diseaseSeverity === 'moderate' ? 0.9 : 1.3;
        const infectivityMult = mutatorInfectivity / 2.0;
        const immuneMult = mutatorImmuneStrength / 100;

        const totalClearance = cureProgress;
        const hasClash = selectedMedsForCocktail.length > 1 && cocktailAnalysis.hasClash;

        const dataPoints = [];
        const steps = 8;

        for (let i = 0; i < steps; i++) {
            const timeLabel = `T+${Math.round(i * (14 / (steps - 1)))}d`;
            let pathogen = 0;
            let immune = 0;
            let stress = 0;

            if (i === 0) {
                pathogen = 15;
                immune = 10;
                stress = 5;
            } else if (i === 1) {
                pathogen = 45 * infectivityMult;
                immune = 30 * immuneMult;
                stress = 25 * baseSeverityMult;
            } else if (i === 2) {
                pathogen = 85 * infectivityMult;
                immune = 65 * immuneMult;
                stress = 60 * baseSeverityMult;
            } else if (i === 3) {
                pathogen = 95 * infectivityMult;
                immune = 90 * immuneMult;
                stress = 80 * baseSeverityMult;
            } else {
                const decay = Math.exp(-(i - 3) * 0.4);
                pathogen = 95 * infectivityMult * decay;
                immune = 90 * immuneMult * Math.exp(-(i - 3) * 0.2);
                stress = 80 * baseSeverityMult * decay;
            }

            if (totalClearance > 0 && i >= 2) {
                const treatmentFactor = totalClearance / 100;
                const timeProgress = (i - 2) / (steps - 3);

                pathogen = pathogen * Math.exp(-timeProgress * 3.5 * treatmentFactor);
                immune = immune * Math.exp(-timeProgress * 2.2 * treatmentFactor);

                let toxicityStrain = 0;
                if (hasClash && i >= 3 && i <= 6) {
                    const peakFactor = Math.sin((i - 3) * Math.PI / 3);
                    toxicityStrain = 25 * peakFactor;
                }
                stress = stress * Math.exp(-timeProgress * 2.5 * treatmentFactor) + toxicityStrain;
            }

            dataPoints.push({
                name: timeLabel,
                pathogen: Math.max(0, Math.min(100, Math.round(pathogen))),
                immune: Math.max(0, Math.min(100, Math.round(immune))),
                stress: Math.max(0, Math.min(100, Math.round(stress)))
            });
        }
        return dataPoints;
    }, [diseaseResult, diseaseSeverity, mutatorInfectivity, mutatorIncubationSpeed, mutatorImmuneStrength, cureProgress, selectedMedsForCocktail, cocktailAnalysis]);


    // ─── Disease heatmap effects with active propagation ─────────────
    const diseaseHeatmapEffects = useMemo((): HeatmapEffect[] => {
        if (!diseaseResult) return [];
        let effectsArray: HeatmapEffect[] = [];
        if (Array.isArray(diseaseResult.heatmap_effects)) {
            effectsArray = diseaseResult.heatmap_effects;
        } else if (Array.isArray((diseaseResult as any).effects)) {
            effectsArray = (diseaseResult as any).effects;
        }

        const mult = diseaseSeverity === 'mild' ? 0.5 : diseaseSeverity === 'moderate' ? 0.8 : 1.0;

        const timeline = diseaseResult.body_impact.timeline;
        if (!timeline || timeline.length === 0) {
            return effectsArray.map(e => ({ ...e, intensity: Math.min((e.intensity || 0) * mult, 1) }));
        }

        // Gather infected organs up to the current timeline step
        const infected = new Set<string>();
        for (let i = 0; i <= timelineStepIndex && i < timeline.length; i++) {
            if (timeline[i]?.organs_active) {
                timeline[i].organs_active.forEach(o => infected.add(o.toLowerCase()));
            }
        }

        const currentActive = new Set<string>();
        if (timeline[timelineStepIndex]?.organs_active) {
            timeline[timelineStepIndex].organs_active.forEach(o => currentActive.add(o.toLowerCase()));
        }

        return effectsArray.map(e => {
            const isInfected = checkIsOrganInfected(e.structure_name, infected);
            if (!isInfected) {
                return { ...e, intensity: 0 };
            }

            const isCurrentlyActive = checkIsOrganInfected(e.structure_name, currentActive);
            const propagationScale = isCurrentlyActive ? 1.0 : 0.6;

            return {
                ...e,
                intensity: Math.min((e.intensity || 0) * mult * propagationScale, 1)
            };
        });
    }, [diseaseResult, diseaseSeverity, timelineStepIndex]);

    // ─── After drug injection, reduce disease heatmap ────────────────
    const treatedHeatmapEffects = useMemo((): HeatmapEffect[] => {
        if (!diseaseResult || cureProgress === 0) return diseaseHeatmapEffects;
        const reductionFactor = 1 - (cureProgress / 100);
        return diseaseHeatmapEffects.map(e => ({ ...e, intensity: e.intensity * reductionFactor }));
    }, [diseaseHeatmapEffects, cureProgress]);

    // ─── Live Patient Vitals dynamic calculation ─────────────────────
    const patientVitals = useMemo(() => {
        if (!diseaseResult) return { temperature: 37.0, bpm: 75, respiration: 16 };

        let temp = 37.0;
        let bpm = 75;
        let resp = 16;

        const currentEntry = diseaseResult.body_impact.timeline[timelineStepIndex];
        const currentDataPoint = biometricChartData[Math.min(timelineStepIndex, biometricChartData.length - 1)];
        const pathogenLoad = currentDataPoint ? currentDataPoint.pathogen : 50;
        const stress = currentDataPoint ? currentDataPoint.stress : 50;

        temp += (pathogenLoad / 100) * 3.2;
        bpm += (pathogenLoad / 100) * 45;

        const hasPulmonaryInvolvement = diseaseResult.disease_injection.affected_organs.some(o => o.toLowerCase().includes('lung')) || (currentEntry?.organs_active.some(o => o.toLowerCase().includes('lung')));
        resp += (stress / 100) * 10;
        if (hasPulmonaryInvolvement) {
            resp += (pathogenLoad / 100) * 8;
        }

        const activeAntipyretic = injectedDrugs.some(d => d.toLowerCase().includes('paracetamol') || d.toLowerCase().includes('ibuprofen') || d.toLowerCase().includes('aspirin'));
        if (activeAntipyretic && cureProgress > 0) {
            const reliefFactor = cureProgress / 100;
            temp = temp - (temp - 37.0) * reliefFactor * 0.85;
            bpm = bpm - (bpm - 75) * reliefFactor * 0.75;
            resp = resp - (resp - 16) * reliefFactor * 0.5;
        }

        if (cureProgress > 0) {
            const reliefFactor = cureProgress / 100;
            temp = temp - (temp - 37.0) * reliefFactor * 0.5;
            bpm = bpm - (bpm - 75) * reliefFactor * 0.4;
            resp = resp - (resp - 16) * reliefFactor * 0.4;
        }

        return {
            temperature: parseFloat(temp.toFixed(1)),
            bpm: Math.round(bpm),
            respiration: Math.round(resp)
        };
    }, [diseaseResult, timelineStepIndex, biometricChartData, injectedDrugs, cureProgress]);

    // ─── Organ diagnostics calculator ───────────────────────────────
    const organDiagnostics = useMemo(() => {
        if (!diseaseSelectedOrgan || !diseaseResult) {
            return { saturation: 0, tdiPercent: 0, tdiLevel: 'Normal', bioavailability: 0, prognosis: '' };
        }

        const organ = diseaseSelectedOrgan.toLowerCase();
        const currentEntry = diseaseResult.body_impact.timeline[timelineStepIndex];
        const isCurrentlyInfected = currentEntry ? checkIsOrganInfected(diseaseSelectedOrgan, currentEntry.organs_active) : false;

        let wasInfectedInPast = false;
        for (let i = 0; i < timelineStepIndex; i++) {
            const entry = diseaseResult.body_impact.timeline[i];
            if (entry && checkIsOrganInfected(diseaseSelectedOrgan, entry.organs_active)) {
                wasInfectedInPast = true;
                break;
            }
        }

        let baseSat = 0;
        if (isCurrentlyInfected) {
            baseSat = 65 + (diseaseSeverity === 'mild' ? 0 : diseaseSeverity === 'moderate' ? 15 : 25) + Math.min(10, mutatorInfectivity * 2);
        } else if (wasInfectedInPast) {
            baseSat = 35 + (diseaseSeverity === 'mild' ? 0 : diseaseSeverity === 'moderate' ? 10 : 20);
        }

        const saturation = Math.round(baseSat * (1 - cureProgress / 100));
        const tdiPercent = Math.round(baseSat * 0.8 * (1 - cureProgress / 140));

        let tdiLevel = 'Healthy / Normal';
        if (tdiPercent > 0) {
            if (tdiPercent < 25) tdiLevel = 'Mild localized inflammatory response';
            else if (tdiPercent < 55) tdiLevel = 'Moderate acute congestion and swelling';
            else if (tdiPercent < 80) tdiLevel = 'High severe cellular injury with fibrotic remodeling risk';
            else tdiLevel = 'Critical necrotic tissue breakdown warning';
        }

        let bioavailability = 0;
        if (cureProgress > 0) {
            if (route.toLowerCase().includes('iv')) bioavailability = 95 + Math.floor(Math.random() * 4);
            else if (route.toLowerCase().includes('inhalation') && organ.includes('lung')) bioavailability = 92 + Math.floor(Math.random() * 6);
            else if (route.toLowerCase().includes('im')) bioavailability = 82 + Math.floor(Math.random() * 6);
            else if (route.toLowerCase().includes('sublingual')) bioavailability = 75 + Math.floor(Math.random() * 6);
            else if (route.toLowerCase().includes('oral')) bioavailability = 62 + Math.floor(Math.random() * 8);
            else bioavailability = 50 + Math.floor(Math.random() * 10);
        }

        let prognosis = 'Physiological structures within baseline limits.';
        if (saturation > 0) {
            if (organ.includes('lung')) {
                prognosis = 'Potential alveolar collapse and oxygen diffusion impairment. Monitor O2 saturation.';
            } else if (organ.includes('heart')) {
                prognosis = 'Myocarditis risk. Elevated cardiac strain and microvascular injury detected.';
            } else if (organ.includes('brain')) {
                prognosis = 'Systemic microglial activation, cognitive fatigue, and neural pathway stress.';
            } else if (organ.includes('liver')) {
                prognosis = 'Hepatic enzyme elevation and metabolic detoxification overload.';
            } else if (organ.includes('kidney')) {
                prognosis = 'Glomerular filtration rate delay. Acute toxicity accumulation warning.';
            } else {
                prognosis = 'Local tissue swelling, immune leukocyte infiltration, and minor cellular injury.';
            }
            if (cureProgress > 50) {
                prognosis += ' (Resolving under active therapy)';
            }
        }

        return {
            saturation: Math.min(100, Math.max(0, saturation)),
            tdiPercent: Math.min(100, Math.max(0, tdiPercent)),
            tdiLevel,
            bioavailability: Math.min(100, bioavailability),
            prognosis
        };
    }, [diseaseSelectedOrgan, diseaseResult, timelineStepIndex, diseaseSeverity, mutatorInfectivity, cureProgress, route]);

    // ─── Patient Case File diagnostic export ─────────────────────────
    const handleExportCaseFile = useCallback(() => {
        if (!diseaseResult) return;

        const dateStr = new Date().toISOString().split('T')[0];
        const timeStr = new Date().toLocaleTimeString();

        let report = `======================================================================
CLINICAL PATHOLOGY DIAGNOSTIC REPORT
======================================================================
Generated: ${dateStr} at ${timeStr}
Case File ID: ID-${Math.floor(100000 + Math.random() * 900000)}
Patient Profile Age: ${diseaseAge || 'Standard Adult'}
Disease Identity: ${diseaseResult.disease_name}
Initial Pathology Severity: ${diseaseSeverity.toUpperCase()}
AI Diagnostic Confidence: ${diseaseResult.ai_confidence_score}%
----------------------------------------------------------------------

PATHOGEN MUTATOR PROFILE:
- Infectivity (R0): ${mutatorInfectivity.toFixed(1)}
- Incubation Speed: ${mutatorIncubationSpeed.toFixed(1)}x
- Host Immune Strength: ${mutatorImmuneStrength}%

ENTRY VECTOR & SYSTEMIC IMPACT:
- Entry Point: ${diseaseResult.disease_injection.entry_point}
- Spread Mechanism: ${diseaseResult.disease_injection.spread_mechanism}
- Affected Systems: ${diseaseResult.disease_injection.affected_systems.join(', ')}
- Affected Organs: ${diseaseResult.disease_injection.affected_organs.join(', ')}

----------------------------------------------------------------------
THERAPEUTIC ADMINISTRATION INTERVENTION:
- Injected Compounds: ${injectedDrugs.length > 0 ? injectedDrugs.join(' + ') : 'None (No active intervention)'}
- Combined Therapy Efficacy: ${cureProgress}% Achieved
- Clinical Response Log:
${injectionLog.length > 0
                ? injectionLog.map((log, idx) => `  [${idx + 1}] ${log}`).join('\n')
                : '  No active treatment cycles logged.'}

----------------------------------------------------------------------
SIMULATION OUTCOMES:
- Recovery Probability (Treated): ${diseaseResult.health_outcome.recovery_probability_treated}%
- Recovery Probability (Untreated): ${diseaseResult.health_outcome.recovery_probability_untreated}%
- Final Systemic Risk Level: ${diseaseResult.health_outcome.risk_level.toUpperCase()}
- Treated Prognosis: ${diseaseResult.health_outcome.treated_prognosis}
- Untreated Clinical Consequences:
${diseaseResult.health_outcome.untreated_consequences.map(c => `  - ${c}`).join('\n')}

======================================================================
This document is a simulated educational clinical report.
======================================================================`;

        const blob = new Blob([report], { type: 'text/plain;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Patient_Case_File_${diseaseResult.disease_name.replace(/\\s+/g, '_')}.txt`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, [diseaseResult, diseaseAge, diseaseSeverity, mutatorInfectivity, mutatorIncubationSpeed, mutatorImmuneStrength, injectedDrugs, cureProgress, injectionLog]);

    return (
        <div className="drug-impact-container fixed inset-0 z-[100] flex flex-col bg-slate-950 text-white font-sans overflow-hidden">
            {/* Holographic Glowing Background Layer */}
            <div className="absolute inset-0 z-0">
                {/* Space Grid Overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.02)_1px,_transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] opacity-30" />
                {/* Noise texture overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay pointer-events-none" />
                {/* Glow Spheres */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-r from-rose-500/10 to-transparent rounded-full blur-[140px] -translate-x-1/2 -translate-y-1/2 animate-[pulse_6s_ease-in-out_infinite]" />
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-l from-purple-500/10 to-transparent rounded-full blur-[140px] translate-x-1/2 -translate-y-1/2 animate-[pulse_8s_ease-in-out_infinite_1s]" />
                <div className="absolute bottom-0 left-1/3 w-[600px] h-[600px] bg-gradient-to-t from-blue-500/5 to-transparent rounded-full blur-[160px] translate-y-1/2" />
            </div>

            <div className="relative z-10 flex flex-col h-full">
                {/* ── Top Command Bar ──────────────────────────────────────────────── */}
                <div className="flex-shrink-0 flex items-center justify-between px-6 py-4
                    border-b border-white/10 bg-slate-950/40 backdrop-blur-xl shadow-2xl relative">
                    {/* Glowing bottom edge line */}
                    <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

                    <div className="flex items-center gap-4">
                        <button onClick={() => navigateTo('DASHBOARD')}
                            className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/10 hover:border-white/20 hover:scale-105 active:scale-95
                                transition-all group flex items-center justify-center shadow-lg">
                            <span className="group-hover:-translate-x-0.5 block transition-transform text-white/80 group-hover:text-white">
                                {ICONS.arrowLeft}
                            </span>
                        </button>
                        <div>
                            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
                                <Brain className="text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)] animate-pulse" size={20} />
                                <span>{activeTab === 'drug' ? 'Drug' : 'Disease'}</span>{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-400 to-indigo-400 font-extrabold">
                                    {activeTab === 'drug' ? 'Impact Visualizer' : 'Injection Simulator'}
                                </span>
                            </h1>
                            <p className="text-[10px] text-blue-300/40 uppercase tracking-widest font-bold mt-0.5">
                                {activeTab === 'drug' ? 'AI-powered 3D pharmacological bio-heatmap' : 'Real-time pathogen spread simulation'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 no-print">
                        {activeTab === 'drug' && (
                            <>
                                <HeatmapLegend />
                                <button
                                    onClick={() => { setCompareMode(v => !v); setResult2(null); setDrugName2(''); }}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all duration-300 hover:scale-105 active:scale-95 shadow-md flex items-center gap-1.5
                                        ${compareMode
                                            ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.2)]'
                                            : 'bg-white/[0.03] border-white/10 text-white/60 hover:text-white hover:border-white/20'}`}>
                                    <span>⚖</span> {compareMode ? 'Exit Compare' : 'Compare Drugs'}
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => window.print()}
                            className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 hover:scale-105 active:scale-95 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 shadow-lg flex items-center gap-1.5">
                            <span>📄</span> Export PDF
                        </button>
                    </div>
                </div>

                {/* ── Main Layout ──────────────────────────────────────────── */}
                {activeTab === 'disease' ? (
                    /* ═══════════════════════════════════════════════════════════
                       DISEASE INJECTION SIMULATOR
                    ═══════════════════════════════════════════════════════════ */
                    <div className="flex flex-1 overflow-hidden">
                        {/* LEFT PANEL — Disease Inputs */}
                        <div className="w-76 flex-shrink-0 flex flex-col border-r border-white/10 bg-slate-950/20 backdrop-blur-sm overflow-y-auto no-print">
                            <div className="p-5 space-y-6">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Select Target Disease</label>
                                    </div>
                                    <input
                                        type="text"
                                        value={diseaseName}
                                        onChange={e => setDiseaseName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && handleDiseaseSimulate()}
                                        placeholder="Enter disease (e.g. COVID-19)..."
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 placeholder:text-white/20 text-sm transition-all shadow-inner focus:border-emerald-500/30"
                                    />

                                    {/* Glassmorphic Dropzone Uploader */}
                                    <div className="relative mt-3 group">
                                        <input
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            onChange={handleDiseaseFileUpload}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                            disabled={isUploadingDiseaseFile}
                                        />
                                        <div className={`w-full flex flex-col items-center justify-center gap-1.5 rounded-2xl p-4 text-xs font-bold transition-all border border-dashed shadow-inner
                                            ${isUploadingDiseaseFile
                                                ? 'bg-emerald-900/10 border-emerald-500/20 text-emerald-500/50 cursor-not-allowed'
                                                : 'bg-white/[0.02] border-white/10 text-emerald-300/80 hover:bg-white/[0.05] hover:border-emerald-500/30 group-hover:scale-[1.01]'}`}>
                                            {isUploadingDiseaseFile ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-400 rounded-full animate-spin" />
                                                    Parsing Medical File...
                                                </div>
                                            ) : (
                                                <>
                                                    <FileText size={18} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                                                    <span>Upload Diagnosis PDF / Report</span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Disease Presets */}
                                <div>
                                    <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2.5">Biological Presets</p>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {DISEASE_PRESETS.map(d => (
                                            <button
                                                key={d.name}
                                                onClick={() => setDiseaseName(d.name)}
                                                className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl text-[9px] font-black tracking-tight border transition-all hover:scale-[1.03] active:scale-95 relative overflow-hidden group
                                                    ${diseaseName === d.name
                                                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                                                        : 'bg-white/[0.02] border-white/10 text-white/40 hover:bg-white/[0.06] hover:text-white'}`}>
                                                <span className="text-lg mb-1 group-hover:scale-110 transition-transform">{d.icon}</span>
                                                <span className="leading-tight text-center">{d.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Patient Age */}
                                <div>
                                    <label className="block text-[10px] font-bold text-blue-300/60 uppercase tracking-widest mb-1.5">Patient Profile Age</label>
                                    <input
                                        type="number" min={0} max={120}
                                        value={diseaseAge}
                                        onChange={e => setDiseaseAge(e.target.value ? parseInt(e.target.value) : '')}
                                        placeholder="Standard Adult"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 placeholder:text-white/20 transition-all"
                                    />
                                </div>

                                {/* Severity */}
                                <div>
                                    <label className="block text-[10px] font-bold text-blue-300/60 uppercase tracking-widest mb-2.5">Pathogen Severity</label>
                                    <div className="grid grid-cols-3 gap-1.5">
                                        {(['mild', 'moderate', 'severe'] as const).map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setDiseaseSeverity(s)}
                                                className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all
                                                    ${diseaseSeverity === s
                                                        ? s === 'mild' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                                                            : s === 'moderate' ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300 shadow-[0_0_10px_rgba(234,179,8,0.1)]'
                                                                : 'bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.1)]'
                                                        : 'bg-white/[0.02] border-white/10 text-white/40 hover:text-white hover:border-white/20'}`}>
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Pathogen Mutators Slider Panel */}
                                <div className="p-4 bg-white/[0.02] border border-white/10 rounded-2xl space-y-4">
                                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                        🧬 Mutate Pathogen Profile
                                    </h4>
                                    <div>
                                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                                            <span className="text-white/60 font-semibold">Infectivity (R0)</span>
                                            <span className="font-mono font-bold text-emerald-300">{mutatorInfectivity.toFixed(1)}</span>
                                        </div>
                                        <input
                                            type="range" min={1.0} max={5.0} step={0.1}
                                            value={mutatorInfectivity}
                                            onChange={e => setMutatorInfectivity(Number(e.target.value))}
                                            className="w-full accent-emerald-500 cursor-pointer h-1 bg-white/10 rounded-full animate-pulse-slow"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                                            <span className="text-white/60 font-semibold">Incubation Speed</span>
                                            <span className="font-mono font-bold text-emerald-300">{mutatorIncubationSpeed.toFixed(1)}x</span>
                                        </div>
                                        <input
                                            type="range" min={0.5} max={3.0} step={0.1}
                                            value={mutatorIncubationSpeed}
                                            onChange={e => setMutatorIncubationSpeed(Number(e.target.value))}
                                            className="w-full accent-emerald-500 cursor-pointer h-1 bg-white/10 rounded-full animate-pulse-slow"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                                            <span className="text-white/60 font-semibold">Host Immune Strength</span>
                                            <span className="font-mono font-bold text-emerald-300">{mutatorImmuneStrength}%</span>
                                        </div>
                                        <input
                                            type="range" min={20} max={150} step={5}
                                            value={mutatorImmuneStrength}
                                            onChange={e => setMutatorImmuneStrength(Number(e.target.value))}
                                            className="w-full accent-emerald-500 cursor-pointer h-1 bg-white/10 rounded-full animate-pulse-slow"
                                        />
                                    </div>
                                </div>

                                {/* Run Simulation */}
                                <button
                                    onClick={handleDiseaseSimulate}
                                    disabled={diseaseLoading || !diseaseName.trim()}
                                    className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-98 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {diseaseLoading ? (
                                        <span className="flex items-center gap-2 animate-pulse">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Simulating...
                                        </span>
                                    ) : (
                                        <><Activity size={16} /> Run Pathology Simulation</>
                                    )}
                                </button>

                                {diseaseError && (
                                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs animate-shake">{diseaseError}</div>
                                )}
                            </div>
                        </div>

                        {/* CENTER — 3D Body View */}
                        <div className="flex-1 relative overflow-hidden bg-gradient-to-b from-black via-slate-950/60 to-black">
                            <ErrorBoundary fallbackTitle="Disease View 3D Error">
                                <DrugHeatmap3D
                                    effects={cureProgress > 0 ? treatedHeatmapEffects : diseaseHeatmapEffects}
                                    selectedOrgan={diseaseSelectedOrgan}
                                    isGlassMode={false}
                                    showBody={viewMode === 'BODY'}
                                    showSkeleton={viewMode === 'SKELETON'}
                                    showOrgans={viewMode === 'ORGANS'}
                                    showMuscles={viewMode === 'MUSCLES'}
                                    showNervousGLB={viewMode === 'NERVOUS_GLB'}
                                    onOrganSelect={setDiseaseSelectedOrgan}
                                    isAnalyzing={diseaseLoading}
                                    isCuring={injecting}
                                    cureProgress={cureProgress}
                                    handRotationDelta={handRotationDelta}
                                    handZoomDelta={handZoomDelta}
                                    handDragDelta={handDragDelta}
                                    resetCameraFlag={cameraResetFlag}
                                />
                            </ErrorBoundary>

                            <HandTrackingOverlay
                                isActive={isHandTrackingActive}
                                onRotate={(x, y) => setHandRotationDelta({ x, y })}
                                onZoom={(delta) => setHandZoomDelta(delta)}
                                onResetView={() => {
                                    setHandRotationDelta({ x: 0, y: 0 });
                                    setHandDragDelta(undefined);
                                    setHandZoomDelta(0);
                                    setCameraResetFlag(v => v + 1);
                                }}
                                onToggleView={() => setViewMode(v => v === 'BODY' ? 'SKELETON' : 'BODY')}
                            />

                            {/* Organ Pathology Diagnostics HUD Overlay */}
                            {diseaseSelectedOrgan && diseaseResult && (
                                <div className="absolute top-24 right-6 z-20 w-80 bg-slate-950/90 border border-emerald-500/30 rounded-2xl p-4 backdrop-blur-md shadow-[0_0_30px_rgba(16,185,129,0.2)] space-y-3 animate-fade-in no-print">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                        <span className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                                            {diseaseSelectedOrgan} Diagnostics HUD
                                        </span>
                                        <button
                                            onClick={() => setDiseaseSelectedOrgan(null)}
                                            className="text-white/40 hover:text-white text-xs font-bold transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {/* Local Saturation */}
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="text-white/50 font-bold uppercase tracking-wider">Pathogen Saturation</span>
                                            <span className="font-mono font-bold text-rose-400">{organDiagnostics.saturation}%</span>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-full h-1.5 border border-white/5">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-orange-500 to-rose-500 transition-all duration-500"
                                                style={{ width: `${organDiagnostics.saturation}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Tissue Damage Index */}
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between text-[10px]">
                                            <span className="text-white/50 font-bold uppercase tracking-wider">Tissue Damage Index (TDI)</span>
                                            <span className="font-mono font-bold text-yellow-400">{organDiagnostics.tdiPercent}%</span>
                                        </div>
                                        <div className="w-full bg-white/5 rounded-full h-1.5 border border-white/5">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
                                                style={{ width: `${organDiagnostics.tdiPercent}%` }}
                                            />
                                        </div>
                                        <p className="text-[9px] text-white/60 font-semibold">{organDiagnostics.tdiLevel}</p>
                                    </div>

                                    {/* Bioavailability */}
                                    <div className="p-2 bg-black/40 border border-white/5 rounded-xl space-y-1 text-[10px]">
                                        <span className="text-white/40 font-bold uppercase tracking-wider block text-[8px]">Local Drug Bioavailability</span>
                                        <div className="flex items-center justify-between">
                                            <span className="text-white/80 font-bold">{organDiagnostics.bioavailability}%</span>
                                            <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.2 rounded font-mono">
                                                {route} Route
                                            </span>
                                        </div>
                                    </div>

                                    {/* Complication Prognosis */}
                                    <div className="p-2.5 bg-rose-500/5 border border-rose-500/10 rounded-xl space-y-1">
                                        <span className="text-[9px] text-rose-300 font-black uppercase tracking-widest block">Prognosis / Complications</span>
                                        <p className="text-[10px] text-white/80 leading-normal font-semibold">
                                            {organDiagnostics.prognosis}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* View selector (float top-right) */}
                            <div className="absolute top-1 right-6 left-auto z-30 flex gap-3 no-print">
                                <div className="flex bg-slate-950/80 rounded-2xl p-1.5 border border-white/10 backdrop-blur-xl shadow-2xl">
                                    <button
                                        onClick={() => setViewMode('BODY')}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300
                                            ${viewMode === 'BODY'
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                : 'text-white/40 hover:text-white'}`}>
                                        🧍 Anatomy
                                    </button>
                                    <button
                                        onClick={() => setViewMode('MUSCLES')}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300
                                            ${viewMode === 'MUSCLES'
                                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                                : 'text-white/40 hover:text-white'}`}>
                                        💪 Muscles
                                    </button>
                                    <button
                                        onClick={() => setViewMode('NERVOUS_GLB')}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300
                                            ${viewMode === 'NERVOUS_GLB'
                                                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                                                : 'text-white/40 hover:text-white'}`}>
                                        💜 Nerve (GLB)
                                    </button>
                                    <button
                                        onClick={() => setViewMode('SKELETON')}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300
                                            ${viewMode === 'SKELETON'
                                                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                                                : 'text-white/40 hover:text-white'}`}>
                                        🦴 Skeletal
                                    </button>
                                    <button
                                        onClick={() => setViewMode('ORGANS')}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300
                                            ${viewMode === 'ORGANS'
                                                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                                                : 'text-white/40 hover:text-white'}`}>
                                        🫀 Organs
                                    </button>
                                </div>
                            </div>

                            {/* Disease info card overlay (top-left) */}
                            {diseaseResult && (
                                <div className="absolute top-6 left-6 z-20 space-y-3 max-w-[280px]">
                                    <div className="bg-slate-950/80 border border-white/10 rounded-2xl p-4 backdrop-blur-md shadow-2xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none" />
                                        <div className="flex items-start gap-3">
                                            <div className="text-3xl bg-black/40 w-12 h-12 rounded-xl flex items-center justify-center border border-white/5">🦠</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-black text-white text-sm tracking-tight truncate">{diseaseResult.disease_name}</p>
                                                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border uppercase tracking-wider ${getRiskColor(diseaseResult.severity)}`}>
                                                        {diseaseResult.severity}
                                                    </span>
                                                    <span className="text-[9px] text-white/40 font-mono">Conf: {diseaseResult.ai_confidence_score}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cure progress bar */}
                                    {cureProgress > 0 && (
                                        <div className="bg-slate-950/80 border border-emerald-500/20 rounded-2xl p-4 backdrop-blur-md shadow-2xl">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1"><Syringe size={10} /> Therapy Response</span>
                                                <span className="text-sm font-mono font-black text-emerald-400">{cureProgress}%</span>
                                            </div>
                                            <div className="w-full bg-white/5 rounded-full h-2 p-[1px] border border-white/5">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                                                    style={{ width: `${cureProgress}%` }}
                                                />
                                            </div>
                                            <p className="text-[9px] text-white/40 mt-1.5">Treated with: <strong className="text-white/80">{injectedDrugs.join(' + ')}</strong></p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Pathogen Timeline Scrubber (float bottom center) */}
                            {diseaseResult && !diseaseLoading && (
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-slate-950/90 p-4 rounded-2xl border border-white/10 backdrop-blur-md flex flex-col shadow-2xl shadow-black/80 max-w-[420px] w-full no-print">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                                            <Clock size={11} /> Pathogen Spread Timeline
                                        </span>
                                        <span className="text-white font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                            {diseaseResult.body_impact.timeline[timelineStepIndex]?.time || 'Day 1'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setIsAutoplayActive(v => !v)}
                                            className={`p-2 rounded-xl border transition-all duration-300 ${isAutoplayActive ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 animate-pulse' : 'bg-white/5 border-white/10 text-white/70 hover:text-white'}`}
                                            title={isAutoplayActive ? "Pause Autoplay" : "Play Autoplay"}
                                        >
                                            {isAutoplayActive ? '⏸' : '▶'}
                                        </button>

                                        <input
                                            type="range"
                                            min={0}
                                            max={diseaseResult.body_impact.timeline.length - 1}
                                            step={1}
                                            value={timelineStepIndex}
                                            onChange={e => {
                                                setTimelineStepIndex(Number(e.target.value));
                                                setIsAutoplayActive(false);
                                            }}
                                            className="flex-grow accent-emerald-500 cursor-pointer h-1.5 bg-white/5 rounded-full"
                                        />
                                    </div>

                                    <div className="flex justify-between text-[8px] font-mono text-white/30 mt-1.5 px-1">
                                        {diseaseResult.body_impact.timeline.map((entry, idx) => (
                                            <span
                                                key={idx}
                                                onClick={() => {
                                                    setTimelineStepIndex(idx);
                                                    setIsAutoplayActive(false);
                                                }}
                                                className={`cursor-pointer transition-all hover:text-emerald-400 ${idx === timelineStepIndex ? 'text-emerald-400 font-bold' : ''}`}
                                            >
                                                {entry.time.split(' ')[1] || entry.time}
                                            </span>
                                        ))}
                                    </div>

                                    <p className="text-[9px] text-white/70 mt-2 border-t border-white/5 pt-1.5 italic font-medium leading-tight truncate">
                                        Spread front: {diseaseResult.body_impact.timeline[timelineStepIndex]?.organs_active.join(', ') || 'None'} - {diseaseResult.body_impact.timeline[timelineStepIndex]?.description}
                                    </p>
                                </div>
                            )}

                            {/* Affected organs floating badges */}
                            {diseaseResult && !diseaseLoading && (
                                <div className="absolute bottom-32 left-6 z-20 flex flex-wrap gap-2 max-w-[240px]">
                                    {diseaseResult.disease_injection.affected_organs.map((organ, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setDiseaseSelectedOrgan(diseaseSelectedOrgan === organ ? null : organ)}
                                            className={`px-3.5 py-2 rounded-xl text-[10px] font-black border transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-1.5 shadow-md
                                                ${diseaseSelectedOrgan === organ
                                                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-200 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                                                    : 'bg-slate-950/80 border-white/10 text-white/50 hover:border-rose-500/30 hover:text-white'}`}>
                                            <span>🎯</span> {organ}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Loading overlay */}
                            {diseaseLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-md z-30">
                                    <div className="bg-slate-950/80 border border-white/10 p-8 rounded-3xl text-center shadow-2xl relative overflow-hidden max-w-[280px]">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                                        <div className="text-6xl mb-4 animate-[bounce_2s_infinite]">🦠</div>
                                        <p className="text-base font-black text-emerald-400 tracking-tight uppercase animate-pulse">Running Diagnostic</p>
                                        <p className="text-[10px] text-white/40 mt-1.5 uppercase font-mono tracking-widest">Bio-AI Pathogen Simulator</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT PANEL — Analysis Results */}
                        <div className="w-96 flex-shrink-0 border-l border-white/10 bg-slate-950/20 backdrop-blur-sm overflow-hidden flex flex-col">
                            {/* Mode Tab Switcher */}
                            <div className="flex-shrink-0 p-4 border-b border-white/10 bg-white/[0.02]">
                                <div className="flex bg-black/60 rounded-2xl p-1.5 border border-white/10 shadow-2xl">
                                    <button
                                        onClick={() => setActiveTab('drug')}
                                        className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5
                                            ${(activeTab as string) === 'drug' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20 shadow-inner' : 'text-white/40 hover:text-white'}`}>
                                        <Search size={12} /> Pharmacological
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('disease')}
                                        className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5
                                            ${(activeTab as string) === 'disease' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-inner' : 'text-white/40 hover:text-white'}`}>
                                        <Syringe size={12} /> Pathogen Simulator
                                    </button>
                                </div>
                            </div>

                            {diseaseResult ? (
                                <div className="flex flex-col h-full overflow-hidden">
                                    {/* Section Tabs */}
                                    <div className="flex-shrink-0 px-4 pt-4">
                                        <div className="flex gap-1 bg-black/40 rounded-xl p-1 border border-white/5 flex-wrap">
                                            {([
                                                { id: 'injection', label: 'Spread', short: 'Spread' },
                                                { id: 'symptoms', label: 'Symptoms', short: 'Symptoms' },
                                                { id: 'treatment', label: 'Medication', short: 'Medication' },
                                                { id: 'response', label: 'Drug Response', short: 'Response' },
                                                { id: 'outcome', label: 'Sim Outcome', short: 'Outcome' },
                                            ] as const).map(sect => (
                                                <button
                                                    key={sect.id}
                                                    onClick={() => setActiveSection(sect.id)}
                                                    className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all border border-transparent
                                                        ${activeSection === sect.id ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20 shadow-md' : 'text-white/40 hover:text-white/70'}`}>
                                                    {sect.short}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Section Content */}
                                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 custom-scrollbar">

                                        {/* ── DISEASE INJECTION ── */}
                                        {activeSection === 'injection' && (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-rose-500/[0.02] border border-white/5 rounded-2xl shadow-lg">
                                                    <h4 className="text-[10px] font-black text-rose-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                        <Target size={12} className="text-rose-400" /> Disease Entry Vector
                                                    </h4>
                                                    <div className="space-y-2.5">
                                                        <div className="flex items-start gap-2 bg-black/25 p-2 rounded-xl border border-white/5">
                                                            <span className="text-[9px] font-bold text-white/30 w-16 uppercase tracking-wider mt-0.5">Entry Pt</span>
                                                            <span className="text-xs text-white/80 font-medium">{diseaseResult.disease_injection.entry_point}</span>
                                                        </div>
                                                        <div className="flex items-start gap-2 bg-black/25 p-2 rounded-xl border border-white/5">
                                                            <span className="text-[9px] font-bold text-white/30 w-16 uppercase tracking-wider mt-0.5">Spread</span>
                                                            <span className="text-xs text-white/80 font-medium">{diseaseResult.disease_injection.spread_mechanism}</span>
                                                        </div>
                                                        <div className="flex items-start gap-2 bg-black/25 p-2 rounded-xl border border-white/5">
                                                            <span className="text-[9px] font-bold text-white/30 w-16 uppercase tracking-wider mt-0.5">Systems</span>
                                                            <span className="text-xs text-white/80 font-medium">{diseaseResult.disease_injection.affected_systems.join(', ')}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Timeline */}
                                                <div>
                                                    <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-3.5 flex items-center gap-1.5">
                                                        <Clock size={12} className="text-blue-400" /> Pathological Timeline
                                                    </h4>
                                                    <div className="relative ml-2.5">
                                                        <div className="absolute left-0 top-1 bottom-1 w-[2px] bg-gradient-to-b from-rose-500 via-orange-500 to-yellow-500 opacity-20" />
                                                        {diseaseResult.body_impact.timeline.map((entry, i) => (
                                                            <div key={i} className="relative pl-6 pb-5 last:pb-0 group">
                                                                <div className="absolute left-[-4px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-900 border-2 border-rose-500 group-hover:scale-125 transition-transform" />
                                                                <div className="text-[9px] font-bold text-rose-300 mb-0.5 uppercase font-mono">{entry.time}</div>
                                                                <p className="text-xs text-white/70 leading-relaxed font-medium">{entry.description}</p>
                                                                {entry.organs_active.length > 0 && (
                                                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                                                        {entry.organs_active.map((o, j) => (
                                                                            <span key={j} className="text-[9px] bg-rose-500/10 border border-rose-500/20 text-rose-300 px-2 py-0.5 rounded-lg font-bold">{o}</span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Biological Changes */}
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                                    <h4 className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                        <Zap size={12} className="text-yellow-400" /> Host Biological Changes
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {diseaseResult.body_impact.biological_changes.map((c, i) => (
                                                            <li key={i} className="text-xs text-white/70 flex items-start gap-2 leading-relaxed">
                                                                <span className="text-yellow-400 mt-1 text-[10px]">◈</span>
                                                                <span>{c}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        {/* ── SYMPTOMS ── */}
                                        {activeSection === 'symptoms' && (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-yellow-500/[0.02] border border-yellow-500/10 rounded-2xl shadow-lg">
                                                    <h4 className="text-[10px] font-black text-yellow-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                        <span>🤒</span> Early Stage Diagnostics
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {diseaseResult.symptoms.early_stage.map((s, i) => (
                                                            <li key={i} className="text-xs text-white/80 flex items-start gap-2.5 leading-relaxed bg-black/20 p-2 rounded-xl border border-white/5">
                                                                <span className="text-yellow-400 mt-0.5">•</span>
                                                                <span>{s}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="p-4 bg-rose-500/[0.02] border border-rose-500/10 rounded-2xl shadow-lg">
                                                    <h4 className="text-[10px] font-black text-rose-300 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                        <span>⚠️</span> Late Stage Advanced Manifestations
                                                    </h4>
                                                    <ul className="space-y-2">
                                                        {diseaseResult.symptoms.advanced_stage.map((s, i) => (
                                                            <li key={i} className="text-xs text-white/80 flex items-start gap-2.5 leading-relaxed bg-black/20 p-2 rounded-xl border border-white/5">
                                                                <span className="text-rose-400 mt-0.5">•</span>
                                                                <span>{s}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        {/* ── TREATMENT / DRUG RECOMMENDATIONS ── */}
                                        {activeSection === 'treatment' && (
                                            <div className="space-y-4">
                                                <div>
                                                    <h4 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                        <span>💊</span> Target Recommendations
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {diseaseResult.treatment.medications.map((med, i) => {
                                                            const isSelected = selectedMedsForCocktail.includes(med.name);
                                                            const isCurrentlyInjected = injectedDrugs.includes(med.name) && cureProgress > 0;
                                                            return (
                                                                <div key={i} className="p-4 bg-blue-500/[0.02] border border-white/10 rounded-2xl relative overflow-hidden group hover:border-blue-500/20 transition-all duration-300">
                                                                    <div className="absolute top-0 right-0 w-12 h-12 bg-blue-500/5 rounded-full -translate-y-2 translate-x-2 group-hover:bg-blue-500/10 transition-colors" />
                                                                    <div className="flex items-start justify-between gap-3">
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm font-black text-white tracking-tight truncate">{med.name}</p>
                                                                            <div className="flex items-center gap-2 mt-1">
                                                                                <span className="text-[9px] bg-blue-500/10 border border-blue-500/20 text-blue-300 px-2 py-0.5 rounded-lg font-bold">{med.type}</span>
                                                                                <span className="text-[9px] text-blue-300/60 font-mono">📏 {med.dosage_range}</span>
                                                                            </div>
                                                                            <p className="text-xs text-white/60 mt-2.5 leading-normal">{med.purpose}</p>
                                                                        </div>

                                                                        <div className="flex flex-col gap-2">
                                                                            <button
                                                                                onClick={() => toggleMedSelection(med.name)}
                                                                                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1 active:scale-95 shadow-md
                                                                                    ${isSelected
                                                                                        ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                                                                                        : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20'}`}
                                                                            >
                                                                                {isSelected ? '✓ Selected' : '+ Select'}
                                                                            </button>

                                                                            <button
                                                                                onClick={() => handleInjectDrug(med.name)}
                                                                                disabled={injecting}
                                                                                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1 active:scale-95 shadow-md
                                                                                    ${isCurrentlyInjected
                                                                                        ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                                                                                        : 'bg-gradient-to-r from-rose-500 to-orange-500 text-white hover:shadow-lg hover:shadow-rose-500/15'}
                                                                                    disabled:opacity-50`}
                                                                            >
                                                                                <Syringe size={8} />
                                                                                {isCurrentlyInjected ? `${cureProgress}%` : 'Inject'}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>

                                                {/* Vaccine Protocol */}
                                                <div className="p-4 bg-purple-500/[0.02] border border-purple-500/20 rounded-2xl space-y-4 shadow-lg relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
                                                    <h4 className="text-[10px] font-black text-purple-300 uppercase tracking-widest flex items-center gap-1.5">
                                                        <span>🧬</span> mRNA Vaccine Synthesizer Console
                                                    </h4>

                                                    {/* Codon Targeting Grid */}
                                                    <div className="space-y-2">
                                                        <span className="text-[9px] text-white/50 font-bold uppercase tracking-wider block">Codon Target Matrix</span>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            {[
                                                                { id: 'S', label: 'Spike Glycoprotein (S)', eff: 60, desc: '+60% eff, local arm swelling' },
                                                                { id: 'E', label: 'Envelope Protein (E)', eff: 15, desc: '+15% eff, systemic fatigue' },
                                                                { id: 'N', label: 'Nucleocapsid Protein (N)', eff: 20, desc: '+20% eff, mild fever' },
                                                                { id: 'M', label: 'Membrane Protein (M)', eff: 10, desc: '+10% eff, minimal risk' },
                                                            ].map(codon => {
                                                                const isSelected = selectedVaccineCodons.includes(codon.label);
                                                                return (
                                                                    <button
                                                                        key={codon.id}
                                                                        onClick={() => {
                                                                            setSelectedVaccineCodons(prev =>
                                                                                prev.includes(codon.label)
                                                                                    ? prev.filter(x => x !== codon.label)
                                                                                    : [...prev, codon.label]
                                                                            );
                                                                        }}
                                                                        className={`p-2 rounded-xl text-left border transition-all duration-300 active:scale-95 flex flex-col justify-between h-[64px]
                                                                            ${isSelected
                                                                                ? 'bg-purple-500/20 border-purple-500/40 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
                                                                                : 'bg-white/5 border border-white/10 text-white/50 hover:border-purple-500/20'}`}
                                                                    >
                                                                        <div className="flex items-center justify-between w-full">
                                                                            <span className="text-[10px] font-black">{codon.id}</span>
                                                                            <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-purple-400' : 'bg-white/20'}`} />
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-[9px] font-black leading-tight truncate">{codon.label.split(' ')[0]}</p>
                                                                            <p className="text-[8px] opacity-65 leading-none mt-0.5">{codon.desc.split(',')[0]}</p>
                                                                        </div>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>

                                                    {/* Custom Vaccine Name */}
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] text-white/50 font-bold uppercase tracking-wider block">Vaccine Protocol Name</label>
                                                        <input
                                                            type="text"
                                                            value={customVaccineName}
                                                            onChange={e => setCustomVaccineName(e.target.value)}
                                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                                                            placeholder="e.g. BioNTech-mRNA-01..."
                                                        />
                                                    </div>

                                                    {/* Synth Efficacy & Side Effects Panel */}
                                                    <div className="p-3 bg-black/40 border border-white/5 rounded-xl space-y-2 text-[10px]">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-white/40 font-bold uppercase tracking-wider">Estimated Efficacy</span>
                                                            <span className="font-mono font-black text-purple-400">
                                                                {selectedVaccineCodons.reduce((acc, label) => {
                                                                    if (label.startsWith('Spike')) return acc + 60;
                                                                    if (label.startsWith('Envelope')) return acc + 15;
                                                                    if (label.startsWith('Nucleocapsid')) return acc + 20;
                                                                    if (label.startsWith('Membrane')) return acc + 10;
                                                                    return acc;
                                                                }, 0)}%
                                                            </span>
                                                        </div>
                                                        <div className="space-y-0.5">
                                                            <span className="text-white/40 font-bold uppercase tracking-wider">Projected Risks</span>
                                                            <p className="text-[9px] text-rose-300 font-semibold leading-normal">
                                                                {(() => {
                                                                    const sideEffects: string[] = [];
                                                                    selectedVaccineCodons.forEach(label => {
                                                                        if (label.startsWith('Spike')) sideEffects.push("Local arm swelling");
                                                                        if (label.startsWith('Envelope')) sideEffects.push("Systemic fatigue");
                                                                        if (label.startsWith('Nucleocapsid')) sideEffects.push("Mild fever");
                                                                    });
                                                                    if (sideEffects.length === 0) return "Minimal side-effects";
                                                                    return sideEffects.join(', ');
                                                                })()}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            onClick={() => {
                                                                const eff = selectedVaccineCodons.reduce((acc, label) => {
                                                                    if (label.startsWith('Spike')) return acc + 60;
                                                                    if (label.startsWith('Envelope')) return acc + 15;
                                                                    if (label.startsWith('Nucleocapsid')) return acc + 20;
                                                                    if (label.startsWith('Membrane')) return acc + 10;
                                                                    return acc;
                                                                }, 0);
                                                                const sideEffects: string[] = [];
                                                                selectedVaccineCodons.forEach(label => {
                                                                    if (label.startsWith('Spike')) sideEffects.push("Local arm swelling");
                                                                    if (label.startsWith('Envelope')) sideEffects.push("Systemic fatigue");
                                                                    if (label.startsWith('Nucleocapsid')) sideEffects.push("Mild fever");
                                                                });
                                                                if (sideEffects.length === 0) sideEffects.push("Minimal side-effects");

                                                                setVaccineInfo({
                                                                    vaccineName: customVaccineName || 'Custom-mRNA',
                                                                    exists: false,
                                                                    mechanism: `Custom mRNA-based synthesized protocol targeting codons: ${selectedVaccineCodons.join(', ')}.`,
                                                                    efficacy: Math.min(99, Math.max(5, eff)),
                                                                    side_effects: sideEffects
                                                                });
                                                            }}
                                                            disabled={selectedVaccineCodons.length === 0}
                                                            className="py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-purple-600 hover:bg-purple-500 text-white transition-all active:scale-95 shadow-md disabled:opacity-40"
                                                        >
                                                            ⚡ Synthesize
                                                        </button>

                                                        {vaccineInfo && (
                                                            <button
                                                                onClick={() => toggleMedSelection(vaccineInfo.vaccineName)}
                                                                className={`py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1 active:scale-95 shadow-md
                                                                    ${selectedMedsForCocktail.includes(vaccineInfo.vaccineName)
                                                                        ? 'bg-purple-500/25 border border-purple-500/40 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
                                                                        : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:border-white/20'}`}
                                                            >
                                                                {selectedMedsForCocktail.includes(vaccineInfo.vaccineName) ? '✓ Selected' : '+ Select'}
                                                            </button>
                                                        )}
                                                    </div>

                                                    {vaccineInfo && (
                                                        <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl space-y-1 mt-2">
                                                            <p className="text-[10px] font-black text-purple-300">Registered: {vaccineInfo.vaccineName}</p>
                                                            <p className="text-[9px] text-white/70 leading-normal">{vaccineInfo.mechanism}</p>
                                                            <div className="flex gap-2 mt-2">
                                                                <button
                                                                    onClick={() => handleInjectDrug(vaccineInfo.vaccineName)}
                                                                    disabled={injecting}
                                                                    className={`w-full py-1 rounded bg-gradient-to-r from-purple-600 to-indigo-500 text-white text-[9px] font-bold uppercase tracking-wider hover:scale-[1.02] disabled:opacity-50`}
                                                                >
                                                                    {injectedDrugs.includes(vaccineInfo.vaccineName) && cureProgress > 0 ? `Injected (${cureProgress}%)` : `Direct Inject`}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Combination Therapy Cocktail Builder Dashboard */}
                                                {selectedMedsForCocktail.length > 0 && (
                                                    <div className="p-4 bg-slate-950/80 border border-emerald-500/30 rounded-2xl shadow-2xl space-y-3 mt-4 animate-fade-in-up">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                                                                🧪 Combined Cocktail Builder
                                                            </span>
                                                            <span className="text-[9px] text-white/40 font-mono">
                                                                {selectedMedsForCocktail.length} Selected
                                                            </span>
                                                        </div>

                                                        <div className="flex flex-wrap gap-1.5">
                                                            {selectedMedsForCocktail.map(med => (
                                                                <span key={med} className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1">
                                                                    {med}
                                                                    <button onClick={() => toggleMedSelection(med)} className="hover:text-red-400 font-extrabold text-[8px] ml-1">×</button>
                                                                </span>
                                                            ))}
                                                        </div>

                                                        {/* Clashing Drugs Warnings */}
                                                        {cocktailAnalysis.hasClash && (
                                                            <div className="p-2.5 bg-rose-950/40 border border-rose-500/30 rounded-xl flex items-start gap-2 text-[10px] text-rose-300">
                                                                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                                                                <div>
                                                                    <p className="font-bold uppercase tracking-wider text-[9px]">Drug interaction warning</p>
                                                                    <p className="opacity-90 mt-0.5 leading-normal">{cocktailAnalysis.clashWarning}</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Combined metrics */}
                                                        <div className="flex items-center justify-between border-t border-white/5 pt-3">
                                                            <div>
                                                                <p className="text-[9px] text-white/40 uppercase font-bold tracking-wider">Estimated Efficacy</p>
                                                                <p className="text-lg font-mono font-black text-emerald-400 flex items-center gap-1.5">
                                                                    {cocktailAnalysis.efficacy}%
                                                                    {cocktailAnalysis.synergyBonus > 0 && (
                                                                        <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                                                                            +{cocktailAnalysis.synergyBonus}% Synergy
                                                                        </span>
                                                                    )}
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={handleAdministerCocktail}
                                                                disabled={injecting}
                                                                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:from-emerald-500 hover:to-teal-400 hover:scale-[1.03] active:scale-95 disabled:opacity-50 flex items-center gap-1.5 shadow-lg shadow-emerald-500/10"
                                                            >
                                                                <Syringe size={12} /> Inject Cocktail
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Non-pharmacological */}
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                                    <h4 className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-3">🏥 Supportive Therapies</h4>
                                                    <ul className="space-y-2">
                                                        {diseaseResult.treatment.non_pharmacological.map((t, i) => (
                                                            <li key={i} className="text-xs text-white/70 flex items-start gap-2.5 leading-normal">
                                                                <span className="text-teal-400 mt-0.5">✓</span>
                                                                <span>{t}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        )}

                                        {/* ── DRUG RESPONSE AFTER INJECTION ── */}
                                        {activeSection === 'response' && (
                                            <div className="space-y-4">
                                                {/* Live Biometrics Chart */}
                                                <div className="p-4 bg-black/40 border border-white/10 rounded-2xl shadow-inner space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                                                            📈 Biometric System Dynamics
                                                        </h4>
                                                        {cureProgress > 0 ? (
                                                            <span className="text-[8px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-lg uppercase tracking-wider">
                                                                Therapy Active
                                                            </span>
                                                        ) : (
                                                            <span className="text-[8px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 px-1.5 py-0.5 rounded-lg uppercase tracking-wider">
                                                                Untreated Path
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="h-44 w-full">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <LineChart data={biometricChartData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                                                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff0a" vertical={false} />
                                                                <XAxis dataKey="name" stroke="#ffffff40" fontSize={9} tickLine={false} />
                                                                <YAxis stroke="#ffffff40" fontSize={9} tickLine={false} domain={[0, 100]} />
                                                                <Tooltip
                                                                    contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: 10 }}
                                                                    itemStyle={{ padding: '2px 0' }}
                                                                />
                                                                <Legend iconSize={8} wrapperStyle={{ fontSize: 9, paddingTop: 6 }} />
                                                                <Line type="monotone" name="Pathogen Load" dataKey="pathogen" stroke="#f43f5e" strokeWidth={2} dot={false} />
                                                                <Line type="monotone" name="Immune Activation" dataKey="immune" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                                                <Line type="monotone" name="Organ Stress" dataKey="stress" stroke="#f59e0b" strokeWidth={2} dot={false} />

                                                                {diseaseResult.body_impact.timeline.length > 0 && (
                                                                    <ReferenceLine
                                                                        x={biometricChartData[Math.min(timelineStepIndex, biometricChartData.length - 1)]?.name}
                                                                        stroke="#10b981"
                                                                        strokeDasharray="3 3"
                                                                        label={{ value: 'Now', fill: '#10b981', fontSize: 8, position: 'top' }}
                                                                    />
                                                                )}
                                                            </LineChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>

                                                {/* Glowing Vitals Cockpit HUD */}
                                                <div className="grid grid-cols-3 gap-2 p-3 bg-black/40 border border-white/10 rounded-2xl shadow-inner animate-fade-in">
                                                    {/* Temperature Dial */}
                                                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
                                                        <span className="text-[8px] font-bold text-white/40 uppercase tracking-wider mb-1">Temperature</span>
                                                        <span className={`text-xs font-mono font-black ${patientVitals.temperature >= 38.5 ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]' : 'text-emerald-400'}`}>
                                                            {patientVitals.temperature}°C
                                                        </span>
                                                        <span className="text-[8px] text-white/30 mt-1 font-bold">
                                                            {patientVitals.temperature >= 38.5 ? '🌡️ FEVER' : '🟢 NORMAL'}
                                                        </span>
                                                    </div>

                                                    {/* BPM Heart Rate Dial */}
                                                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
                                                        <span className="text-[8px] font-bold text-white/40 uppercase tracking-wider mb-1">Heart Rate</span>
                                                        <div className="flex items-center gap-1 justify-center">
                                                            <Heart
                                                                size={10}
                                                                className="text-rose-500 fill-rose-500 animate-heartbeat flex-shrink-0"
                                                                style={{ animationDuration: `${Math.max(0.3, Math.min(1.5, 60 / patientVitals.bpm))}s` }}
                                                            />
                                                            <span className={`text-xs font-mono font-black ${patientVitals.bpm >= 100 ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.3)]' : 'text-emerald-400'}`}>
                                                                {patientVitals.bpm}
                                                            </span>
                                                        </div>
                                                        <span className="text-[8px] text-white/30 mt-1 font-bold">
                                                            {patientVitals.bpm >= 100 ? '⚠️ TACHY' : '🟢 STABLE'}
                                                        </span>
                                                    </div>

                                                    {/* Respiration Dial */}
                                                    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/[0.02] border border-white/5 relative overflow-hidden">
                                                        <span className="text-[8px] font-bold text-white/40 uppercase tracking-wider mb-1">Respiration</span>
                                                        <span className={`text-xs font-mono font-black ${patientVitals.respiration >= 22 ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.3)]' : 'text-emerald-400'}`}>
                                                            {patientVitals.respiration} <span className="text-[8px] font-semibold text-white/40">br/m</span>
                                                        </span>
                                                        <span className="text-[8px] text-white/30 mt-1 font-bold font-mono">
                                                            {patientVitals.respiration >= 22 ? '⚠️ ELEV' : '🟢 STABLE'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {cureProgress === 0 && !injecting && (
                                                    <div className="p-6 text-center rounded-2xl bg-white/[0.01] border border-white/5">
                                                        <div className="text-5xl mb-3">💉</div>
                                                        <p className="text-xs font-bold text-white/50">Bio-Treatment Cycle Idle</p>
                                                        <p className="text-[10px] text-white/30 mt-2 leading-relaxed">Navigate to the Medication tab and choose compounds to simulate live responses.</p>
                                                    </div>
                                                )}

                                                {injectionLog.length > 0 && (
                                                    <div className="p-4 bg-black/40 border border-emerald-500/10 rounded-2xl shadow-inner">
                                                        <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                                            <Activity size={12} /> Live Biometric Log
                                                        </h4>
                                                        <div className="space-y-2 font-mono">
                                                            {injectionLog.map((log, i) => (
                                                                <div key={i} className="text-[10px] text-white/80 flex items-start gap-1.5 animate-fade-in">
                                                                    <span className="text-emerald-400 flex-shrink-0">[{i + 1}]</span>
                                                                    <span>{log}</span>
                                                                </div>
                                                            ))}
                                                            {injecting && (
                                                                <div className="flex items-center gap-2 text-[10px] text-emerald-400 animate-pulse">
                                                                    <div className="w-3 h-3 border border-emerald-400 border-t-transparent rounded-full animate-spin" />
                                                                    Processing cellular response...
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {cureProgress > 0 && (
                                                    <div className="space-y-3">
                                                        <div className="p-4 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-2xl">
                                                            <div className="flex items-center justify-between mb-2.5">
                                                                <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Therapy Clearance</h4>
                                                                <span className="text-lg font-mono font-black text-emerald-400">{cureProgress}%</span>
                                                            </div>
                                                            <div className="w-full bg-white/5 rounded-full h-2.5 p-[1px] border border-white/5 mb-2">
                                                                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-300 transition-all duration-700 shadow-[0_0_8px_rgba(52,211,153,0.3)]"
                                                                    style={{ width: `${cureProgress}%` }} />
                                                            </div>
                                                            <p className="text-[9px] text-white/40">{injectedDrugs.join(' + ')} — calculated clearance inside {diseaseResult.drug_response_simulation.recovery_timeline}</p>
                                                        </div>

                                                        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                                            <h4 className="text-[10px] font-black text-yellow-400 uppercase tracking-widest mb-3">⚠️ Side-Effect Warnings</h4>
                                                            <ul className="space-y-2">
                                                                {diseaseResult.drug_response_simulation.possible_side_effects.map((se, i) => (
                                                                    <li key={i} className="text-xs text-white/70 flex items-start gap-2 leading-relaxed">
                                                                        <span className="text-yellow-400 mt-0.5">!</span>
                                                                        <span>{se}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* ── HEALTH OUTCOME ── */}
                                        {activeSection === 'outcome' && (
                                            <div className="space-y-4">
                                                {/* Radial gauges */}
                                                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                                                    <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-4">📊 Recovery Probabilities</h4>
                                                    <div className="flex justify-around items-center">
                                                        <RadialProgress
                                                            value={diseaseResult.health_outcome.recovery_probability_treated}
                                                            color="#10b981"
                                                            label="Treated Protocol"
                                                        />
                                                        <RadialProgress
                                                            value={diseaseResult.health_outcome.recovery_probability_untreated}
                                                            color="#f43f5e"
                                                            label="No Intervention"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Risk level */}
                                                <div className={`p-3.5 rounded-2xl border flex items-center gap-3 shadow-md ${getRiskColor(diseaseResult.health_outcome.risk_level)}`}>
                                                    <AlertTriangle size={18} />
                                                    <div>
                                                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">Systemic Risk</p>
                                                        <p className="text-xs font-black capitalize">{diseaseResult.health_outcome.risk_level}</p>
                                                    </div>
                                                </div>

                                                {/* Treated prognosis */}
                                                <div className="p-4 bg-emerald-500/[0.02] border border-emerald-500/10 rounded-2xl">
                                                    <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1.5">Treated Prognosis</h4>
                                                    <p className="text-xs text-white/80 leading-relaxed font-medium">{diseaseResult.health_outcome.treated_prognosis}</p>
                                                </div>

                                                {/* Untreated consequences */}
                                                <div className="p-4 bg-rose-500/[0.02] border border-rose-500/10 rounded-2xl">
                                                    <h4 className="text-[10px] font-black text-rose-300 uppercase tracking-widest mb-3">If Left Untreated</h4>
                                                    <ul className="space-y-2">
                                                        {diseaseResult.health_outcome.untreated_consequences.map((c, i) => (
                                                            <li key={i} className="text-xs text-white/70 flex items-start gap-2 leading-relaxed">
                                                                <span className="text-rose-400 mt-1 text-[10px]">▸</span>
                                                                <span>{c}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>

                                                {/* Disclaimer */}
                                                <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/10">
                                                    <p className="text-[9px] text-amber-300/60 leading-relaxed font-medium">⚠️ Educational projection model only. Always refer to hospital caregivers and professional consultations.</p>
                                                </div>

                                                {/* Case File Diagnostic Export Button */}
                                                <button
                                                    onClick={handleExportCaseFile}
                                                    className="w-full py-3 rounded-2xl font-black text-xs uppercase tracking-widest text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 shadow-lg transition-all hover:scale-[1.02] active:scale-98 flex items-center justify-center gap-2"
                                                >
                                                    <FileText size={14} /> Export Patient Case File (.txt)
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white/[0.01]">
                                    <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center mb-5 text-3xl shadow-lg">🦠</div>
                                    <h3 className="text-sm font-black text-white/60 mb-2 uppercase tracking-wider">Select a Pathogen</h3>
                                    <p className="text-xs text-white/30 leading-relaxed max-w-[200px]">
                                        Choose a biological preset or input a condition to run the live spread projection.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* ═══════════════════════════════════════════════════════════
                       DRUG IMPACT VISUALIZER
                    ═══════════════════════════════════════════════════════════ */
                    <div className="flex flex-1 overflow-hidden">
                        {/* LEFT PANEL — Inputs */}
                        <div className="w-76 flex-shrink-0 flex flex-col border-r border-white/10 bg-slate-950/20 backdrop-blur-sm overflow-y-auto no-print">
                            {isInteractionMode ? (
                                <div className="p-5 space-y-6">
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                            <h3 className="text-[10px] font-black text-purple-300 uppercase tracking-widest">AI Safety sequencer</h3>
                                        </div>
                                        <h2 className="text-sm font-black text-white/90">Interaction Builder</h2>
                                        <p className="text-[9px] text-white/40 leading-normal mt-1">Cross-check pharmacology combinations between concurrent drugs, diets, and conditions.</p>
                                    </div>

                                    {/* DRUGS LIST */}
                                    <div className="space-y-2">
                                        <label className="block text-[9px] font-black text-rose-300 uppercase tracking-widest">Active Drugs</label>
                                        <div className="flex gap-1 flex-wrap max-h-24 overflow-y-auto custom-scrollbar p-1 bg-black/25 rounded-xl border border-white/5">
                                            {interactionDrugs.map(d => (
                                                <span key={d} className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded-md text-[10px] font-bold text-rose-300">
                                                    {d}
                                                    <button onClick={() => setInteractionDrugs(prev => prev.filter(x => x !== d))} className="hover:text-white font-mono text-[9px]">×</button>
                                                </span>
                                            ))}
                                            {interactionDrugs.length === 0 && <span className="text-[9px] text-white/20 italic p-1">No drugs added</span>}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newDrugInput}
                                                onChange={e => setNewDrugInput(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter' && newDrugInput.trim()) {
                                                        const val = newDrugInput.trim();
                                                        if (!interactionDrugs.includes(val)) setInteractionDrugs(prev => [...prev, val]);
                                                        setNewDrugInput('');
                                                    }
                                                }}
                                                placeholder="Add drug (e.g. Aspirin)..."
                                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-rose-500/50 placeholder:text-white/20"
                                            />
                                            <button
                                                onClick={() => {
                                                    if (newDrugInput.trim()) {
                                                        const val = newDrugInput.trim();
                                                        if (!interactionDrugs.includes(val)) setInteractionDrugs(prev => [...prev, val]);
                                                        setNewDrugInput('');
                                                    }
                                                }}
                                                className="px-2.5 bg-rose-500/20 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-bold hover:bg-rose-500/30 transition-all"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    {/* FOODS LIST */}
                                    <div className="space-y-2">
                                        <label className="block text-[9px] font-black text-sky-300 uppercase tracking-widest">Diet / Food Factors</label>
                                        <div className="flex gap-1 flex-wrap max-h-24 overflow-y-auto custom-scrollbar p-1 bg-black/25 rounded-xl border border-white/5">
                                            {interactionFoods.map(f => (
                                                <span key={f} className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 rounded-md text-[10px] font-bold text-sky-300">
                                                    {f}
                                                    <button onClick={() => setInteractionFoods(prev => prev.filter(x => x !== f))} className="hover:text-white font-mono text-[9px]">×</button>
                                                </span>
                                            ))}
                                            {interactionFoods.length === 0 && <span className="text-[9px] text-white/20 italic p-1">No dietary factors</span>}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newFoodInput}
                                                onChange={e => setNewFoodInput(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter' && newFoodInput.trim()) {
                                                        const val = newFoodInput.trim();
                                                        if (!interactionFoods.includes(val)) setInteractionFoods(prev => [...prev, val]);
                                                        setNewFoodInput('');
                                                    }
                                                }}
                                                placeholder="Add food (e.g. Milk)..."
                                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-sky-500/50 placeholder:text-white/20"
                                            />
                                            <button
                                                onClick={() => {
                                                    if (newFoodInput.trim()) {
                                                        const val = newFoodInput.trim();
                                                        if (!interactionFoods.includes(val)) setInteractionFoods(prev => [...prev, val]);
                                                        setNewFoodInput('');
                                                    }
                                                }}
                                                className="px-2.5 bg-sky-500/20 border border-sky-500/30 rounded-xl text-sky-300 text-xs font-bold hover:bg-sky-500/30 transition-all"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    {/* DISEASES LIST */}
                                    <div className="space-y-2">
                                        <label className="block text-[9px] font-black text-emerald-300 uppercase tracking-widest">Co-existing Illnesses</label>
                                        <div className="flex gap-1 flex-wrap max-h-24 overflow-y-auto custom-scrollbar p-1 bg-black/25 rounded-xl border border-white/5">
                                            {interactionDiseases.map(d => (
                                                <span key={d} className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-[10px] font-bold text-emerald-300">
                                                    {d}
                                                    <button onClick={() => setInteractionDiseases(prev => prev.filter(x => x !== d))} className="hover:text-white font-mono text-[9px]">×</button>
                                                </span>
                                            ))}
                                            {interactionDiseases.length === 0 && <span className="text-[9px] text-white/20 italic p-1">No diseases added</span>}
                                        </div>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newDiseaseInput}
                                                onChange={e => setNewDiseaseInput(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter' && newDiseaseInput.trim()) {
                                                        const val = newDiseaseInput.trim();
                                                        if (!interactionDiseases.includes(val)) setInteractionDiseases(prev => [...prev, val]);
                                                        setNewDiseaseInput('');
                                                    }
                                                }}
                                                placeholder="Add disease (e.g. Asthma)..."
                                                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/50 placeholder:text-white/20"
                                            />
                                            <button
                                                onClick={() => {
                                                    if (newDiseaseInput.trim()) {
                                                        const val = newDiseaseInput.trim();
                                                        if (!interactionDiseases.includes(val)) setInteractionDiseases(prev => [...prev, val]);
                                                        setNewDiseaseInput('');
                                                    }
                                                }}
                                                className="px-2.5 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 transition-all"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>

                                    {/* Action button */}
                                    <button
                                        onClick={handleCheckInteractions}
                                        disabled={isCheckingInteractions || interactionDrugs.length === 0}
                                        className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest text-white bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 hover:scale-[1.02] active:scale-98 shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {isCheckingInteractions ? (
                                            <span className="flex items-center gap-2 animate-pulse">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Scanning Matrix...
                                            </span>
                                        ) : (
                                            <>🧬 Run AI Safety Analysis</>
                                        )}
                                    </button>

                                    {interactionError && (
                                        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center font-semibold">{interactionError}</div>
                                    )}
                                </div>
                            ) : (
                                <div className="p-5 space-y-6">
                                    {/* Mode Selector Switch */}
                                    <div className="flex bg-black/40 rounded-2xl p-1.5 border border-white/10 shadow-inner">
                                        <button
                                            onClick={() => setAnalysisMode('text')}
                                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5
                                                ${analysisMode === 'text' ? 'bg-white/10 text-white shadow-md' : 'text-white/40 hover:text-white/70'}`}
                                        >
                                            <FileText size={12} /> Text Search
                                        </button>
                                        <button
                                            onClick={() => setAnalysisMode('image')}
                                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-1.5
                                                ${analysisMode === 'image' ? 'bg-white/10 text-white shadow-md' : 'text-white/40 hover:text-white/70'}`}
                                        >
                                            <Camera size={12} /> Molecular Scan
                                        </button>
                                    </div>

                                    {/* Inputs */}
                                    {analysisMode === 'text' ? (
                                        <div>
                                            <label className="block text-[10px] font-bold text-blue-300/60 uppercase tracking-widest mb-2">Drug Compound</label>
                                            <input
                                                type="text"
                                                value={drugName}
                                                onChange={e => setDrugName(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
                                                placeholder="Enter drug name (e.g. Ibuprofen)..."
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40 placeholder:text-white/20 text-sm transition-all shadow-inner focus:border-rose-500/30"
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-[10px] font-bold text-blue-300/60 uppercase tracking-widest mb-2">Molecular Formula</label>
                                            <div className="relative border border-dashed border-white/15 rounded-2xl bg-black/40 hover:bg-white/[0.04] transition-all duration-300 group">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                                />
                                                <div className="p-6 flex flex-col items-center justify-center text-center">
                                                    {imagePreview ? (
                                                        <div className="relative">
                                                            <img src={imagePreview} alt="Formula" className="h-20 object-contain rounded-lg mb-2 opacity-90 mix-blend-screen" />
                                                        </div>
                                                    ) : (
                                                        <Camera size={26} className="text-white/20 mb-2.5 group-hover:text-rose-400 group-hover:scale-110 transition-transform" />
                                                    )}
                                                    <p className="text-xs font-bold text-white/50">
                                                        {imageFile ? imageFile.name : 'Upload chemical image'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Quick Presets */}
                                    {analysisMode === 'text' && (
                                        <div>
                                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2.5">Compound Library</p>
                                            <div className="grid grid-cols-3 gap-1.5">
                                                {DRUG_PRESETS.map(p => (
                                                    <button
                                                        key={p.name}
                                                        onClick={() => {
                                                            setDrugName(p.name);
                                                            handleAnalyze(p.name);
                                                        }}
                                                        className={`flex flex-col items-center py-2 px-1 rounded-xl text-[9px] font-black tracking-tight border transition-all hover:scale-[1.03] active:scale-95 relative overflow-hidden group
                                                            ${drugName === p.name
                                                                ? 'bg-rose-500/10 border-rose-500/40 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                                                                : 'bg-white/[0.02] border-white/10 text-white/40 hover:bg-white/[0.06] hover:text-white'}`}>
                                                        <span className="text-lg mb-0.5 group-hover:scale-115 transition-transform">{p.icon}</span>
                                                        <span>{p.name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Dosage Slider */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1.5">
                                            <label className="text-[10px] font-bold text-blue-300/60 uppercase tracking-widest">Active Dosage</label>
                                            <span className="text-xs font-mono font-black text-white bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{dosage} mg</span>
                                        </div>
                                        <input
                                            type="range" min={1} max={2000} step={1}
                                            value={dosage}
                                            onChange={e => handleDosageChange(Number(e.target.value))}
                                            className="w-full accent-rose-500 cursor-pointer h-1.5 bg-white/5 rounded-full"
                                        />
                                        <div className="flex justify-between text-[8px] font-mono text-white/30 mt-1">
                                            <span>1 mg</span><span>2000 mg</span>
                                        </div>
                                    </div>

                                    {/* Custom Option Cards */}
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-[10px] font-bold text-blue-300/60 uppercase tracking-widest mb-1.5">Route of Action</label>
                                            <select
                                                value={route}
                                                onChange={e => setRoute(e.target.value)}
                                                className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-2.5 text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/40 [&>option]:text-gray-900 transition-all font-semibold">
                                                {ROUTES.map(r => <option key={r}>{r}</option>)}
                                            </select>
                                        </div>

                                        {/* Genomics profile container */}
                                        <div className="p-4 bg-purple-500/[0.02] border border-purple-500/20 rounded-2xl relative overflow-hidden group shadow-lg">
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
                                            <label className="block text-[9px] font-black text-purple-300 uppercase tracking-widest mb-2 flex items-center gap-1">
                                                🧬 Genomic Sequencer Profile
                                                <span className="text-[8px] bg-purple-500/20 px-1.5 py-0.2 rounded font-bold">4D</span>
                                            </label>
                                            <select
                                                value={genomicProfile}
                                                onChange={e => setGenomicProfile(e.target.value)}
                                                className="w-full bg-black/40 border border-purple-500/30 rounded-xl px-3 py-2 text-white text-[10px] font-bold focus:outline-none focus:ring-2 focus:ring-purple-500/40 [&>option]:text-gray-900 transition-all shadow-inner">
                                                <option>Standard (Normal Metabolizer)</option>
                                                <option>CYP450 Poor Metabolizer</option>
                                                <option>CYP450 Ultra-Rapid Metabolizer</option>
                                                <option>Renal Impairment Marker</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Patient Profile */}
                                    <div className="grid grid-cols-2 gap-3 border-t border-white/5 pt-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-blue-300/60 uppercase tracking-widest mb-1">Age</label>
                                            <input
                                                type="number" min={0} max={120}
                                                value={age}
                                                onChange={e => setAge(e.target.value ? parseInt(e.target.value) : '')}
                                                placeholder="yrs"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/40 placeholder:text-white/20 transition-all font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-blue-300/60 uppercase tracking-widest mb-1">Weight</label>
                                            <input
                                                type="number" min={0} max={300}
                                                value={weight}
                                                onChange={e => setWeight(e.target.value ? parseInt(e.target.value) : '')}
                                                placeholder="kg"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/40 placeholder:text-white/20 transition-all font-mono"
                                            />
                                        </div>
                                    </div>

                                    {/* Voice & Gesture Grid */}
                                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                                        <button
                                            onClick={() => setIsHandTrackingActive(v => !v)}
                                            className={`px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border duration-300 flex flex-col items-center justify-center gap-1.5 shadow-md
                                                ${isHandTrackingActive
                                                    ? 'bg-sky-500/10 border-sky-500/30 text-sky-300 shadow-[0_0_12px_rgba(14,165,233,0.2)] animate-pulse'
                                                    : 'bg-white/[0.02] border-white/10 text-white/50 hover:bg-white/[0.06] hover:text-white'}`}>
                                            <Camera size={14} className="group-hover:scale-110" />
                                            <span>{isHandTrackingActive ? 'Tracking On' : 'Gestures Off'}</span>
                                        </button>
                                        <button
                                            onClick={toggleVoice}
                                            className={`px-3 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all border duration-300 flex flex-col items-center justify-center gap-1.5 shadow-md
                                                ${isListening
                                                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.2)] animate-pulse'
                                                    : 'bg-white/[0.02] border-white/10 text-white/50 hover:bg-white/[0.06] hover:text-white'}`}>
                                            {isListening ? <Mic size={14} /> : <MicOff size={14} />}
                                            <span>{isListening ? 'Listening' : 'Voice Off'}</span>
                                        </button>
                                    </div>

                                    {/* Primary Run Button */}
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={isLoading || (analysisMode === 'text' ? !drugName.trim() : !imageFile)}
                                        className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-rose-500 to-pink-500 hover:from-rose-500 hover:to-pink-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl font-black uppercase tracking-widest text-white shadow-lg shadow-rose-500/20 transition-all text-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-98"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center gap-2 animate-pulse">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Sequencing...
                                            </span>
                                        ) : (
                                            <>🧬 Run AI Pharmacology Scan</>
                                        )}
                                    </button>

                                    {/* Compare mode selector */}
                                    {compareMode && (
                                        <div className="pt-4 border-t border-purple-500/20 space-y-3">
                                            <p className="text-[10px] font-black text-purple-300 uppercase tracking-widest">Compare Compound 2</p>
                                            <input
                                                type="text"
                                                value={drugName2}
                                                onChange={e => setDrugName2(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleAnalyze2()}
                                                placeholder="Enter drug 2 name (e.g. Aspirin)..."
                                                className="w-full bg-black/40 border border-purple-500/20 rounded-2xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 placeholder:text-white/20 text-sm focus:border-purple-500/30"
                                            />
                                            <button
                                                onClick={handleAnalyze2}
                                                disabled={isLoading2 || !drugName2.trim()}
                                                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-500 hover:from-purple-500 hover:to-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed rounded-2xl font-black uppercase tracking-wider text-white shadow-lg transition-all text-xs"
                                            >
                                                {isLoading2 ? '⏳ Sequencing...' : '⚖ Cross-Compare'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* CENTER — 3D Viewer(s) */}
                        <div className={`flex-1 flex flex-col ${compareMode ? 'divide-x divide-white/10' : ''} overflow-hidden relative`}>
                            {/* View selectors */}
                            <div className="absolute top-1 right-6 left-auto z-30 flex gap-3 no-print">
                                <div className="flex bg-slate-950/80 rounded-2xl p-1.5 border border-white/10 backdrop-blur-xl shadow-2xl">
                                    <button
                                        onClick={() => setViewMode('BODY')}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300
                                            ${viewMode === 'BODY'
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                                                : 'text-white/40 hover:text-white'}`}>
                                        🧍 Anatomy
                                    </button>
                                    <button
                                        onClick={() => setViewMode('MUSCLES')}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300
                                            ${viewMode === 'MUSCLES'
                                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                                                : 'text-white/40 hover:text-white'}`}>
                                        💪 Muscles
                                    </button>
                                    <button
                                        onClick={() => setViewMode('NERVOUS_GLB')}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300
                                            ${viewMode === 'NERVOUS_GLB'
                                                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                                                : 'text-white/40 hover:text-white'}`}>
                                        💜 Nerve (GLB)
                                    </button>
                                    <button
                                        onClick={() => setViewMode('SKELETON')}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300
                                            ${viewMode === 'SKELETON'
                                                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/20'
                                                : 'text-white/40 hover:text-white'}`}>
                                        🦴 Skeletal
                                    </button>
                                    <button
                                        onClick={() => setViewMode('ORGANS')}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300
                                            ${viewMode === 'ORGANS'
                                                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                                                : 'text-white/40 hover:text-white'}`}>
                                        🫀 Organs
                                    </button>
                                </div>
                                <button
                                    onClick={() => setDebugRegions(v => !v)}
                                    className={`px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 border backdrop-blur-xl shadow-2xl
                                        ${debugRegions
                                            ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-lg shadow-amber-500/20'
                                            : 'bg-slate-950/80 border-white/10 text-white/40 hover:text-white'}`}
                                >
                                    🛠 Debug Regions
                                </button>
                                <button
                                    onClick={() => setCalibrationMode(v => !v)}
                                    className={`px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 border backdrop-blur-xl shadow-2xl
                                        ${calibrationMode
                                            ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
                                            : 'bg-slate-950/80 border-white/10 text-white/40 hover:text-white'}`}
                                >
                                    🎯 Calibrate Landmarks
                                </button>
                            </div>

                            {/* Temporal Scrubbing Control */}
                            {result && result.time_based_intensity && (
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-slate-950/90 p-4 rounded-2xl border border-white/10 backdrop-blur-md flex flex-col shadow-2xl shadow-black/80 max-w-[280px] w-full">
                                    <label className="text-[9px] font-black text-sky-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                                        <span>⏱ Temporal Scrubbing (4D)</span>
                                        <span className="text-white font-mono text-[10px] bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">{timePhase.toUpperCase()}</span>
                                    </label>
                                    <input
                                        type="range" min={0} max={4} step={1}
                                        value={['0 min', 'onset', 'peak', 'mid duration', 'end duration'].indexOf(timePhase)}
                                        onChange={e => {
                                            const phases = ['0 min', 'onset', 'peak', 'mid duration', 'end duration'] as const;
                                            setTimePhase(phases[Number(e.target.value)]);
                                        }}
                                        className="w-full accent-sky-500 cursor-pointer h-1.5 bg-white/5 rounded-full mt-2"
                                    />
                                    <div className="flex justify-between text-[8px] font-mono text-white/30 mt-2">
                                        <span>T+0</span>
                                        <span>ONSET</span>
                                        <span>PEAK</span>
                                        <span>MID</span>
                                        <span>END</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex-1 flex overflow-hidden">
                                {/* Primary drug view */}
                                <div className="flex-1 relative">
                                    {compareMode && result && (
                                        <div className="absolute top-6 left-6 z-20 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider text-rose-300 shadow-md">
                                            {result.drug_name}
                                        </div>
                                    )}
                                    <ErrorBoundary fallbackTitle="Pharmacology 3D Error">
                                        <DrugHeatmap3D
                                            effects={isInteractionMode ? interactionHeatmapEffects : uniqueEffects}
                                            selectedOrgan={selectedOrgan}
                                            isGlassMode={false}
                                            showBody={viewMode === 'BODY'}
                                            showSkeleton={viewMode === 'SKELETON'}
                                            showOrgans={viewMode === 'ORGANS'}
                                            showMuscles={viewMode === 'MUSCLES'}
                                            showNervousGLB={viewMode === 'NERVOUS_GLB'}
                                            onOrganSelect={setSelectedOrgan}
                                            isAnalyzing={isLoading}
                                            handRotationDelta={handRotationDelta}
                                            handZoomDelta={handZoomDelta}
                                            handDragDelta={handDragDelta}
                                            resetCameraFlag={cameraResetFlag}
                                            debugMode={debugRegions}
                                            calibrationMode={calibrationMode}
                                        />
                                    </ErrorBoundary>
                                </div>

                                {/* Compare view */}
                                {compareMode && (
                                    <div className="flex-1 relative bg-black/20">
                                        {result2 && (
                                            <div className="absolute top-6 left-6 z-20 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-xl text-[10px] font-black uppercase tracking-wider text-purple-300 shadow-md">
                                                {result2.drug_name}
                                            </div>
                                        )}
                                        <ErrorBoundary fallbackTitle="Compare 3D View Error">
                                            <DrugHeatmap3D
                                                effects={uniqueEffects2}
                                                selectedOrgan={selectedOrgan}
                                                isGlassMode={false}
                                                showBody={viewMode === 'BODY'}
                                                showSkeleton={viewMode === 'SKELETON'}
                                                showOrgans={viewMode === 'ORGANS'}
                                                showMuscles={viewMode === 'MUSCLES'}
                                                showNervousGLB={viewMode === 'NERVOUS_GLB'}
                                                onOrganSelect={setSelectedOrgan}
                                                isAnalyzing={isLoading2}
                                                handRotationDelta={handRotationDelta}
                                                handZoomDelta={handZoomDelta}
                                                handDragDelta={handDragDelta}
                                                resetCameraFlag={cameraResetFlag}
                                                debugMode={debugRegions}
                                                calibrationMode={calibrationMode}
                                            />
                                        </ErrorBoundary>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT PANEL — Effect Details */}
                        <div className="w-96 flex-shrink-0 border-l border-white/10 bg-slate-950/20 backdrop-blur-sm overflow-hidden flex flex-col">
                            {/* Tab selector */}
                            <div className="flex-shrink-0 p-4 border-b border-white/10 bg-white/[0.02]">
                                <div className="flex bg-black/60 rounded-2xl p-1.5 border border-white/10 shadow-2xl">
                                    <button
                                        onClick={() => setActiveTab('drug')}
                                        className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5
                                            ${(activeTab as string) === 'drug' ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20 shadow-inner' : 'text-white/40 hover:text-white'}`}>
                                        <Search size={12} /> Pharmacological
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('disease')}
                                        className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5
                                            ${(activeTab as string) === 'disease' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-inner' : 'text-white/40 hover:text-white'}`}>
                                        <Syringe size={12} /> Pathogen Simulator
                                    </button>
                                </div>
                            </div>

                            {activeTab === 'drug' && (
                                <div className="flex-shrink-0 px-4 pb-3 pt-1 border-b border-white/5 bg-white/[0.01]">
                                    <div className="flex bg-black/45 rounded-xl p-1 border border-white/5">
                                        <button
                                            onClick={() => setIsInteractionMode(false)}
                                            className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1
                                                ${!isInteractionMode ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' : 'text-white/40 hover:text-white'}`}
                                        >
                                            💊 Bio-Map details
                                        </button>
                                        <button
                                            onClick={() => setIsInteractionMode(true)}
                                            className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all flex items-center justify-center gap-1
                                                ${isInteractionMode ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' : 'text-white/40 hover:text-white'}`}
                                        >
                                            🧬 Interaction matrix
                                        </button>
                                    </div>
                                </div>
                            )}

                            {isInteractionMode ? (
                                <InteractionCheckerPanel
                                    result={interactionResult}
                                    isLoading={isCheckingInteractions}
                                    selectedOrgan={selectedOrgan}
                                    onOrganSelect={setSelectedOrgan}
                                    drugs={interactionDrugs}
                                    foods={interactionFoods}
                                    diseases={interactionDiseases}
                                />
                            ) : result ? (
                                <>
                                    <DrugOrganPanel
                                        effects={uniqueEffects}
                                        mechanism={result.mechanism || 'Mechanism details not available.'}
                                        shortTermEffects={Array.isArray(result.short_term_effects) ? result.short_term_effects : []}
                                        sideEffects={Array.isArray(result.side_effects) ? result.side_effects : []}
                                        contraindications={Array.isArray(result.contraindications) ? result.contraindications : []}
                                        longTermEffects={Array.isArray(result.long_term_effects) ? result.long_term_effects : []}
                                        riskLevel={computedRiskLevel}
                                        doseDependencyFactor={result.dose_dependency_factor}
                                        drugName={result.drug_name || drugName}
                                        category={result.category || 'Medication'}
                                        pharmacokinetics={result.pharmacokinetics}
                                        pharmacodynamics={result.pharmacodynamics}
                                        interactionRiskFlag={result.interaction_risk_flag}
                                        selectedOrgan={selectedOrgan}
                                        onOrganSelect={setSelectedOrgan}
                                    />

                                    {/* Genomic Warnings Rendering */}
                                    {result.genomic_warnings && result.genomic_warnings.length > 0 && (
                                        <div className="absolute bottom-4 left-4 right-4 bg-rose-950/90 border border-rose-500/30 p-4 rounded-2xl shadow-[0_10px_35px_rgba(244,63,94,0.15)] backdrop-blur-xl animate-fade-in-up">
                                            <h4 className="text-[10px] font-black text-rose-300 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                                                <span>🧬</span> Pharmacogenomic Alert
                                            </h4>
                                            <ul className="space-y-1.5">
                                                {result.genomic_warnings.map((w, idx) => (
                                                    <li key={idx} className="text-xs font-semibold text-white/95 leading-normal flex items-start gap-2">
                                                        <span className="text-rose-400 mt-0.5">•</span>
                                                        <span>{w}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-white/[0.01]">
                                    <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-center mb-5 text-3xl shadow-lg">💊</div>
                                    <h3 className="text-sm font-black text-white/60 mb-2 uppercase tracking-wider">Ready for Synthesis</h3>
                                    <p className="text-xs text-white/30 leading-relaxed max-w-[200px]">
                                        Enter an active compound compound library search to map full systemic impact indicators.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Immersive Scan holographic animation overlay */}
            {(isLoading || isLoading2) && (
                <div className="fixed inset-0 z-[150] pointer-events-auto overflow-hidden flex flex-col items-center justify-center">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md transition-all duration-500" />

                    {/* Glowing spinner graphic */}
                    <div className="relative z-10 flex flex-col items-center max-w-[320px]">
                        <div className="relative w-48 h-48 mb-6">
                            {/* Hexagon grid background */}
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+CjxwYXRoIGQ9Ik0wIDEwbTEwLTEwbDEwIDEwbS0xMCAxMGwxMC0xMCIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMSkiIGZpbGw9Im5vbmUiLz4KPC9zdmc+')] opacity-30 [mask-image:radial-gradient(circle_at_center,black_40%,transparent_100%)]" />

                            <div className="absolute inset-0 border-2 border-t-rose-500 border-r-rose-500/20 border-b-transparent border-l-transparent rounded-full animate-[spin_1.5s_linear_infinite]" />
                            <div className="absolute inset-2 border border-t-transparent border-r-transparent border-b-purple-500 border-l-purple-500/20 rounded-full animate-[spin_2.5s_linear_infinite_reverse]" />
                            <div className="absolute inset-4 border border-t-sky-500/30 border-b-transparent rounded-full animate-[spin_4s_linear_infinite]" />

                            {/* Center symbol */}
                            <div className="absolute inset-0 flex items-center justify-center text-4xl animate-[pulse_1s_ease-in-out_infinite]">
                                💊
                            </div>

                            {/* Scanning laser line mapping */}
                            <div className="absolute left-0 w-full h-[1.5px] bg-rose-400 shadow-[0_0_12px_#f43f5e] animate-scan-bounce" />
                        </div>

                        <div className="bg-slate-950/80 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl px-6 py-4 text-center w-full">
                            <h2 className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-purple-400 uppercase tracking-widest mb-1.5">
                                Mapping Pharmacology
                            </h2>
                            <div className="flex items-center justify-center gap-1">
                                <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                            <p className="mt-3 text-[9px] font-mono text-blue-200/50 uppercase tracking-widest truncate">
                                Analyzing: {isLoading2 ? drugName2 : drugName}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Global style overrides */}
            <style>{`
                @keyframes scan-bounce {
                    0% { top: 10%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 90%; opacity: 0; }
                }
                .animate-scan-bounce { animation: scan-bounce 2.2s ease-in-out infinite alternate; }
                
                @keyframes heartbeat {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.15); }
                }
                .animate-heartbeat { animation: heartbeat 0.8s ease-in-out infinite; }
                
                ::-webkit-scrollbar { width: 4px; height: 4px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
                ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }

                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .no-print {
                        display: none !important;
                    }
                    .drug-impact-container {
                        position: relative !important;
                        background: white !important;
                        color: black !important;
                        overflow: visible !important;
                    }
                    .drug-impact-container * {
                        visibility: visible;
                    }
                    .flex-1 {
                        border: none !important;
                        background: transparent !important;
                    }
                    .text-white { color: black !important; }
                    div[class*="text-white/50"], div[class*="text-blue-100/60"] { color: #4b5563 !important; }
                    div[class*="bg-black/"], div[class*="bg-white/"] { background: #f3f4f6 !important; border-color: #e5e7eb !important; }
                    .text-transparent { background: none !important; -webkit-text-fill-color: black !important; color: black !important; }
                    .overflow-y-auto { overflow: visible !important; height: auto !important; }
                    div[class*="z-0"] { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default DrugImpactVisualizer;
