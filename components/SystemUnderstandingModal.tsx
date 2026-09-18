import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { 
    Brain, Dna, Activity, Layers, ShieldCheck, Sparkles, X, 
    ChevronRight, ArrowRight, BookOpen, Hand, Search, CheckCircle2, 
    AlertTriangle, Zap, HelpCircle, ExternalLink, Play
} from 'lucide-react';
import { ExperimentDossier } from '../types';

export const SYSTEM_CASE_STUDIES: (Omit<ExperimentDossier, 'id' | 'timestamp'> & { 
    id: string; 
    category: string;
    subtitle: string; 
    keyTakeaway: string;
})[] = [
    {
        id: 'CASE-CARDIO-01',
        category: 'Cardiotoxicity & Nanomedicine',
        title: 'Comparative Cardiotoxicity Screen: Free Doxorubicin vs Pegylated Liposomal Carrier',
        subtitle: 'Evaluating cardiomyocyte sparing and mitochondrial ROS cascade reduction',
        investigator: 'Dr. Sarah Chen, Computational Oncology',
        type: 'DRUG_COMPARISON',
        targetCompound: 'Doxorubicin',
        secondaryCompound: 'Liposomal Doxorubicin',
        dosage: '60 mg/m² IV infusion',
        route: 'Intravenous (IV)',
        cohort: {
            age: 58,
            gender: 'female',
            weight: 62,
            genomicProfile: 'Normal CBR1 (Carbonyl Reductase)'
        },
        systemicRiskScore: 0.76,
        confidenceScore: 96.2,
        uncertaintyMargin: 3.2,
        organToxicities: [
            { organ: 'Heart', toxicity_level: 'severe', strain_score: 88, mechanism: 'Mitochondrial ROS cascade & Topoisomerase IIβ cleavage in cardiomyocytes', confidence: 0.98, toxic_threshold_exceeded: true },
            { organ: 'Bone Marrow', toxicity_level: 'high', strain_score: 82, mechanism: 'Hematopoietic stem cell mitotic arrest', confidence: 0.95, toxic_threshold_exceeded: true },
            { organ: 'Liver', toxicity_level: 'moderate', strain_score: 52, mechanism: 'Biliary clearance saturation', confidence: 0.92, toxic_threshold_exceeded: false },
            { organ: 'Kidneys', toxicity_level: 'low', strain_score: 24, mechanism: 'Minor renal tubular excretion', confidence: 0.90, toxic_threshold_exceeded: false }
        ],
        triageVerdict: 'CAUTION',
        validationStatus: 'Pending In-Vitro Assay',
        notes: 'Free Doxorubicin exceeds cardiac toxic threshold. In-silico liposomal formulation reduced cardiac accumulation by 64%. Recommend evaluating only liposomal candidate in wet-lab.',
        keyTakeaway: 'Shows how in-silico testing predicts that liposomal nanoparticle encapsulation drops cardiac strain from 88 to 28.'
    },
    {
        id: 'CASE-GENOMICS-02',
        category: 'Pharmacogenomics & Nephrology',
        title: 'Renal Perfusion & Mucosal Burden: High-Dose Ibuprofen in CYP2C9 Slow Metabolizer',
        subtitle: 'Understanding why patient genotype drastically spikes drug accumulation and organ injury',
        investigator: 'Dr. Marcus Brody, Clinical Pharmacogenomics',
        type: 'DRUG_SIMULATION',
        targetCompound: 'Ibuprofen',
        dosage: '800mg q8h',
        route: 'Oral',
        cohort: {
            age: 64,
            gender: 'male',
            weight: 81,
            genomicProfile: 'CYP2C9*3/*3 (Poor Metabolizer)'
        },
        systemicRiskScore: 0.68,
        confidenceScore: 95.8,
        uncertaintyMargin: 3.8,
        organToxicities: [
            { organ: 'Stomach', toxicity_level: 'severe', strain_score: 84, mechanism: 'Sustained suppression of gastric COX-1 and mucosal protective PGE2 synthesis', confidence: 0.97, toxic_threshold_exceeded: true },
            { organ: 'Kidneys', toxicity_level: 'high', strain_score: 76, mechanism: 'Prostaglandin-dependent afferent arteriolar vasoconstriction & GFR drop', confidence: 0.94, toxic_threshold_exceeded: true },
            { organ: 'Liver', toxicity_level: 'moderate', strain_score: 42, mechanism: 'Compensatory minor CYP2C8 oxidation burden', confidence: 0.91, toxic_threshold_exceeded: false }
        ],
        triageVerdict: 'CONTRAINDICATED',
        validationStatus: 'In-Silico Complete',
        notes: 'Simulated 3.4-fold higher AUC compared to normal metabolizers. Toxic threshold exceeded for gastric mucosa and renal filtration. Flagged as Contraindicated.',
        keyTakeaway: 'Demonstrates how calibrating the twin with poor metabolizer genetics warns researchers before toxic clinical overdoses.'
    },
    {
        id: 'CASE-VIRAL-03',
        category: 'Emerging Infectious Diseases',
        title: 'Preclinical In-Silico Assay: Remdesivir (GS-5734) vs SARS-CoV-2 Viral RNA Polymerase',
        subtitle: 'Target organ tropism and antiviral rescue dynamics',
        investigator: 'Dr. Alex Vance, In-Silico Virology Lab',
        type: 'DRUG_SIMULATION',
        targetCompound: 'Remdesivir',
        dosage: '200mg loading / 100mg daily',
        route: 'Intravenous (IV)',
        cohort: {
            age: 45,
            gender: 'male',
            weight: 74,
            genomicProfile: 'Standard (CYP3A4 Normal Metabolizer)'
        },
        systemicRiskScore: 0.32,
        confidenceScore: 94.6,
        uncertaintyMargin: 4.2,
        organToxicities: [
            { organ: 'Liver', toxicity_level: 'moderate', strain_score: 48, mechanism: 'Hepatic metabolite esterase activation with mild transaminase leakage', confidence: 0.94, toxic_threshold_exceeded: false },
            { organ: 'Kidneys', toxicity_level: 'moderate', strain_score: 38, mechanism: 'Glomerular filtration & SBECD cyclodextrin vehicle elimination', confidence: 0.91, toxic_threshold_exceeded: false },
            { organ: 'Lungs', toxicity_level: 'low', strain_score: 15, mechanism: 'Rapid pulmonary tissue partition & triphosphate conversion', confidence: 0.96, toxic_threshold_exceeded: false },
            { organ: 'Heart', toxicity_level: 'low', strain_score: 12, mechanism: 'Minimal hERG channel interaction', confidence: 0.95, toxic_threshold_exceeded: false }
        ],
        triageVerdict: 'RECOMMENDED',
        validationStatus: 'In-Silico Complete',
        notes: 'Simulated alveolar tissue concentration exceeds EC50 by 4.2x. Low cardiotoxicity risk. Safe to proceed directly to in-vitro Vero E6 assays.',
        keyTakeaway: 'Illustrates multi-organ antiviral screening to confirm pulmonary bioavailability without inducing severe cardiac strain.'
    }
];

export const GLOSSARY_TERMS = [
    {
        term: 'In-Silico Simulation',
        category: 'Core Concept',
        definition: 'Biological and biochemical experiments performed via high-performance computational models, tensor mathematics, and AI rather than living organisms or physical lab assays.'
    },
    {
        term: 'Digital Twin',
        category: 'Core Concept',
        definition: 'A dynamic, high-fidelity computational replica of a human subject that continuously updates its anatomical, metabolic, and organ-level states in response to simulated interventions.'
    },
    {
        term: 'Strain Score (0 - 100)',
        category: 'Metrics',
        definition: 'A normalized computational biomarker measuring cellular stress, receptor saturation, oxidative ROS formation, or clearance burden for a specific anatomical organ.'
    },
    {
        term: 'Toxic Threshold',
        category: 'Metrics',
        definition: 'The critical biochemical boundary beyond which homeostatic cellular recovery fails, leading to organ tissue toxicity or clinical adverse events.'
    },
    {
        term: 'Cmax & Tmax',
        category: 'Pharmacokinetics',
        definition: 'Cmax is the maximum drug concentration achieved in plasma/tissue; Tmax is the elapsed time post-administration required to reach that peak concentration.'
    },
    {
        term: 'Half-Life (t1/2)',
        category: 'Pharmacokinetics',
        definition: 'The duration required for the active concentration of the drug in the virtual subject’s body to decrease by 50% through metabolic transformation and excretion.'
    },
    {
        term: 'Bioavailability (F%)',
        category: 'Pharmacokinetics',
        definition: 'The fraction of an administered dose that reaches systemic circulation intact. Intravenous (IV) is 100%, while oral varies based on gastric stability and first-pass hepatic metabolism.'
    },
    {
        term: 'CYP450 Genomic Profile',
        category: 'Pharmacogenomics',
        definition: 'Cytochrome P450 hepatic enzymes (e.g. CYP2D6, CYP3A4, CYP2C9) responsible for metabolizing >70% of clinical pharmaceuticals. Variations dictate whether a patient is a Poor, Intermediate, or Rapid metabolizer.'
    },
    {
        term: 'Estimated GFR (eGFR / CrCl)',
        category: 'Physiology',
        definition: 'Glomerular Filtration Rate calculated via the Cockcroft-Gault formula (mL/min), representing kidney filtration capacity and determining renal elimination kinetics.'
    },
    {
        term: 'hERG Channel Affinity',
        category: 'Safety Biomarker',
        definition: 'In-silico evaluation of drug binding to the cardiac potassium channel (K_v 11.1). Blockade leads to dangerous QT prolongation and lethal ventricular arrhythmias (Torsades de Pointes).'
    },
    {
        term: 'In-Vitro Triage Verdict',
        category: 'Preclinical Workflow',
        definition: 'The final algorithmic recommendation (RECOMMENDED, CAUTION, CONTRAINDICATED) guiding wet-lab scientists on whether to invest resources in physical assays.'
    },
    {
        term: 'De Novo Molecular Enhancement',
        category: 'Medicinal Chemistry',
        definition: 'Proposing targeted chemical modifications (esterification, bioisostere replacement, PEGylation) to an existing compound to eliminate off-target organ toxicities.'
    }
];

export const ANATOMY_LAYERS_INFO = [
    {
        id: 'ORGAN_VIEW',
        name: 'Internal Organs Layer',
        icon: '🫀',
        accentColor: 'from-rose-500 to-red-600',
        borderColor: 'border-rose-500/30',
        textColor: 'text-rose-400',
        summary: 'Direct visual mapping of metabolic clearance, toxic strain, and receptor modulation across Brain, Heart, Liver, Kidneys, Stomach, Lungs, and Intestines.',
        biomarkers: [
            'Hepatic Phase-I/II CYP clearance burden',
            'Cardiomyocyte mitochondrial strain & hERG binding',
            'Renal glomerular filtration & tubular accumulation',
            'Gastric mucosal integrity & PGE2 prostaglandin levels'
        ],
        heatmapShader: 'Color-coded dynamic vertex shader mapping intensity (0.0 Blue = Low strain, 0.5 Green/Yellow = Moderate, 1.0 Red = Toxic threshold exceeded).'
    },
    {
        id: 'NERVOUS_VIEW',
        name: 'Central & Peripheral Nervous System',
        icon: '⚡',
        accentColor: 'from-amber-400 to-yellow-500',
        borderColor: 'border-amber-500/30',
        textColor: 'text-amber-400',
        summary: 'Blood-Brain Barrier (BBB) penetration kinetics, neurotransmitter modulation (GABA, Serotonin, Dopamine), and neurotoxicity indices.',
        biomarkers: [
            'LogBB (Blood-Brain Barrier partition coefficient)',
            'Central analgesia vs sedating neurodepression',
            'Hypothalamic thermoregulation & autonomic tone'
        ],
        heatmapShader: 'Glow pulses along neural pathways indicating synaptic transmission velocity and neurotransmitter saturation.'
    },
    {
        id: 'SKELETON_VIEW',
        name: 'Skeletal Framework & Bone Marrow',
        icon: '🦴',
        accentColor: 'from-cyan-400 to-blue-500',
        borderColor: 'border-cyan-500/30',
        textColor: 'text-cyan-400',
        summary: 'Bone mineral density interactions, calcium homeostasis, and hematopoietic stem cell myelosuppression in active marrow cavities.',
        biomarkers: [
            'Bone marrow hematopoietic cellularity',
            'Osteoblast vs osteoclast modulation',
            'Heavy metal and lipophilic mineral sequestration'
        ],
        heatmapShader: 'Sub-surface translucency highlighting cortical vs trabecular bone density and marrow suppression zones.'
    },
    {
        id: 'MUSCLE_VIEW',
        name: 'Musculoskeletal System',
        icon: '💪',
        accentColor: 'from-emerald-400 to-teal-500',
        borderColor: 'border-emerald-500/30',
        textColor: 'text-emerald-400',
        summary: 'Skeletal muscle perfusion, rhabdomyolysis / myopathy risk detection, and metabolic creatine kinase release.',
        biomarkers: [
            'Myocyte membrane stability and statin-induced strain',
            'Lactate accumulation and peripheral glycolysis',
            'Neuromuscular junction cholinergic activation'
        ],
        heatmapShader: 'Fascicle gradient mapping displaying localized tissue tension and hyperthermic metabolic exertion.'
    },
    {
        id: 'BODY_VIEW',
        name: 'Surface Body & Transdermal Barrier',
        icon: '🧍',
        accentColor: 'from-teal-400 to-cyan-400',
        borderColor: 'border-teal-500/30',
        textColor: 'text-teal-400',
        summary: 'Overall subject habitus, transdermal route absorption, cutaneous rash/erythema alerts, and systemic volume of distribution (V_d).',
        biomarkers: [
            'Stratum corneum penetration resistance',
            'Cutaneous hypersensitivity and mast cell degranulation',
            'Total body water and adipose partition volume'
        ],
        heatmapShader: 'Volumetric glassmorphic boundary rendering the subject habitus calibrated to real weight (kg) and height (cm).'
    }
];

const SystemUnderstandingModal: React.FC = () => {
    const { isGuideOpen, closeGuide, activeGuideTab, loadExperiment } = useAppContext();
    const [currentTab, setCurrentTab] = useState<string>(activeGuideTab || 'overview');
    const [searchQuery, setSearchQuery] = useState('');

    React.useEffect(() => {
        if (activeGuideTab) {
            setCurrentTab(activeGuideTab);
        }
    }, [activeGuideTab]);

    if (!isGuideOpen) return null;

    const filteredGlossary = GLOSSARY_TERMS.filter(item => 
        item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleLaunchCaseStudy = (study: typeof SYSTEM_CASE_STUDIES[0]) => {
        const fullDossier: ExperimentDossier = {
            ...study,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC'
        };
        loadExperiment(fullDossier);
        closeGuide();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fade-in font-sans">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/85 backdrop-blur-2xl transition-opacity"
                onClick={closeGuide}
            />

            {/* Modal Dialog */}
            <div className="relative z-10 w-full max-w-6xl max-h-[94vh] sm:max-h-[92vh] bg-[#070d19] border border-teal-500/30 rounded-3xl shadow-[0_0_80px_rgba(20,184,166,0.25)] flex flex-col overflow-hidden ring-1 ring-white/10">
                
                {/* Modal Header */}
                <div className="flex-shrink-0 px-4 py-3.5 sm:px-6 sm:py-5 border-b border-white/10 bg-gradient-to-r from-teal-950/40 via-slate-900/80 to-blue-950/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-[0_0_20px_rgba(45,212,191,0.4)] ring-1 ring-white/20 flex-shrink-0">
                            <Brain size={20} className="text-white drop-shadow" />
                        </div>
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <h2 className="text-base sm:text-2xl font-black tracking-tight text-white truncate">
                                    BioTwin System Architecture
                                </h2>
                                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-mono font-bold uppercase tracking-wider hidden sm:inline-block">
                                    In-Silico Core v2.4
                                </span>
                            </div>
                            <p className="text-[11px] sm:text-xs text-teal-300/80 font-medium mt-0.5 line-clamp-1 sm:line-clamp-none">
                                Everything you need to know about the science, mathematical models, 3D anatomy, and preclinical workflows.
                            </p>
                        </div>
                    </div>

                    <button 
                        onClick={closeGuide}
                        className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-all duration-200 cursor-pointer flex-shrink-0"
                        aria-label="Close Guide"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Navigation Tabs Bar */}
                <div className="flex-shrink-0 px-3 sm:px-6 bg-slate-950/60 border-b border-white/10 flex items-center gap-2 overflow-x-auto py-2.5 scrollbar-none">
                    {[
                        { id: 'overview', label: '🌟 Concept & Science', icon: '🧬' },
                        { id: 'pipeline', label: '⚡ 4-Stage Simulation Pipeline', icon: '🔄' },
                        { id: 'layers', label: '🧍 3D Anatomy & Layers', icon: '🫀' },
                        { id: 'casestudies', label: '🧪 1-Click Case Studies', icon: '🚀' },
                        { id: 'glossary', label: '📖 Metrics & Telemetry Decoder', icon: '📊' },
                        { id: 'gestures', label: '🎮 Controls & Gestures', icon: '🕹️' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setCurrentTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold tracking-wide whitespace-nowrap transition-all duration-200 cursor-pointer ${
                                currentTab === tab.id
                                    ? 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 border border-teal-500/40 shadow-[0_0_15px_rgba(20,184,166,0.15)]'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Modal Content Body */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-gray-200 scrollbar-thin scrollbar-thumb-teal-500/20 scrollbar-track-transparent">
                    
                    {/* TAB 1: OVERVIEW */}
                    {currentTab === 'overview' && (
                        <div className="space-y-8 animate-fade-in">
                            {/* Mission Banner */}
                            <div className="relative p-6 rounded-3xl bg-gradient-to-r from-teal-950/60 via-slate-900/80 to-cyan-950/40 border border-teal-500/30 overflow-hidden shadow-xl">
                                <div className="absolute -right-16 -top-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
                                <div className="relative z-10 max-w-3xl">
                                    <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
                                        The Core Scientific Mission
                                    </span>
                                    <h3 className="text-2xl sm:text-3xl font-black text-white mt-3 mb-2 leading-tight">
                                        “Test on a virtual human first, then validate in the real world.”
                                    </h3>
                                    <p className="text-sm text-teal-100/80 leading-relaxed font-light">
                                        Traditional pharmaceutical development takes 10 to 15 years and over $2.6 billion per drug, with an agonizing 
                                        <strong className="text-rose-400 font-semibold"> 90% failure rate in human clinical trials</strong>. 
                                        The Human Digital Twin platform introduces a high-dimensional computational in-silico sandbox where molecules, dosages, 
                                        and emerging pathogens can be simulated across calibrated patient cohorts before a single drop is tested in animals or humans.
                                    </p>
                                </div>
                            </div>

                            {/* Comparison Grid: In-Silico vs In-Vitro vs In-Vivo */}
                            <div>
                                <h4 className="text-sm font-bold uppercase tracking-wider text-teal-400 mb-3 flex items-center gap-2">
                                    <Activity size={16} />
                                    How BioTwin Fits Into Modern Biomedical Research
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                    <div className="p-5 rounded-2xl bg-teal-500/10 border border-teal-500/40 relative overflow-hidden shadow-lg">
                                        <div className="text-xs font-mono font-bold text-teal-400 mb-1">STAGE 0: IN-SILICO</div>
                                        <div className="text-base font-bold text-white mb-2">BioTwin Digital Twin</div>
                                        <ul className="text-xs text-teal-200/80 space-y-1.5 font-light">
                                            <li>⚡ Instant results (seconds)</li>
                                            <li>🧪 Multi-organ systemic interaction</li>
                                            <li>🧬 Patient-specific genomics & GFR</li>
                                            <li>🛡️ Zero biohazard or animal harm</li>
                                        </ul>
                                        <div className="mt-4 pt-3 border-t border-teal-500/20 text-[10px] font-mono text-teal-300 font-bold">
                                            Cost: ~$0.001 • Phase 0
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                                        <div className="text-xs font-mono font-bold text-gray-400 mb-1">STAGE 1: IN-VITRO</div>
                                        <div className="text-base font-bold text-white mb-2">Cell Culture Assays</div>
                                        <ul className="text-xs text-gray-400 space-y-1.5 font-light">
                                            <li>⏱️ Days to weeks</li>
                                            <li>🧫 Isolated petridish tissue</li>
                                            <li>⚠️ Misses systemic multi-organ loops</li>
                                            <li>💰 Moderate lab reagent cost</li>
                                        </ul>
                                        <div className="mt-4 pt-3 border-t border-white/5 text-[10px] font-mono text-gray-400">
                                            Cost: $10,000s • Assays
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                                        <div className="text-xs font-mono font-bold text-gray-400 mb-1">STAGE 2: IN-VIVO</div>
                                        <div className="text-base font-bold text-white mb-2">Preclinical Animal Tests</div>
                                        <ul className="text-xs text-gray-400 space-y-1.5 font-light">
                                            <li>⏱️ Months to years</li>
                                            <li>🐀 Interspecies translation gaps</li>
                                            <li>⚠️ 68% fail to predict human toxicity</li>
                                            <li>💰 High ethical & financial cost</li>
                                        </ul>
                                        <div className="mt-4 pt-3 border-t border-white/5 text-[10px] font-mono text-gray-400">
                                            Cost: $100,000s • Animal Models
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/10">
                                        <div className="text-xs font-mono font-bold text-gray-400 mb-1">STAGE 3: CLINICAL</div>
                                        <div className="text-base font-bold text-white mb-2">Human Clinical Trials</div>
                                        <ul className="text-xs text-gray-400 space-y-1.5 font-light">
                                            <li>⏱️ 5 to 10 years</li>
                                            <li>👥 Real patient volunteers</li>
                                            <li>⚠️ Extreme legal and health liabilities</li>
                                            <li>💰 Huge capital expenditure</li>
                                        </ul>
                                        <div className="mt-4 pt-3 border-t border-white/5 text-[10px] font-mono text-gray-400">
                                            Cost: $50M - $1B+ • Phases I - III
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 3 Core Pillars */}
                            <div>
                                <h4 className="text-sm font-bold uppercase tracking-wider text-teal-400 mb-3 flex items-center gap-2">
                                    <Layers size={16} />
                                    The Three Pillars of the BioTwin Platform
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-teal-500/30 transition-all">
                                        <div className="text-2xl mb-2">💊</div>
                                        <h5 className="text-base font-bold text-white mb-1.5">1. 3D Twin Pharmacokinetics</h5>
                                        <p className="text-xs text-gray-300 leading-relaxed font-light">
                                            Calculates ADME (Absorption, Distribution, Metabolism, Excretion), receptor interactions, and organ strain scores in real-time. Colored Three.js shaders visually illuminate organ toxicity hot spots directly on the 3D body.
                                        </p>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-rose-500/30 transition-all">
                                        <div className="text-2xl mb-2">🦠</div>
                                        <h5 className="text-base font-bold text-white mb-1.5">2. Emerging Disease Simulator</h5>
                                        <p className="text-xs text-gray-300 leading-relaxed font-light">
                                            Models viral and bacterial pathogens, entry organ tropism, systemic infection cascades, and symptom timelines. Evaluates therapeutic candidates and mRNA vaccine countermeasures safely with zero real-world contagion risk.
                                        </p>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/30 transition-all">
                                        <div className="text-2xl mb-2">⚗️</div>
                                        <h5 className="text-base font-bold text-white mb-1.5">3. Molecular Sparing & Synthesis</h5>
                                        <p className="text-xs text-gray-300 leading-relaxed font-light">
                                            When a compound triggers high organ toxicity (e.g. gastric mucosal bleeding or cardiac hERG strain), the platform calculates de novo molecular optimization proposals and chemical synthesis reaction steps to spare vulnerable organs.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TAB 2: 4-STAGE PIPELINE */}
                    {currentTab === 'pipeline' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-200/90 leading-relaxed">
                                <span className="font-bold text-teal-300 uppercase tracking-wider text-[10px] mr-1.5">Algorithmic Transparency:</span>
                                The BioTwin engine converts biological and biochemical knowledge into structured tensor predictions through a deterministic 4-stage pipeline:
                            </div>

                            <div className="space-y-4">
                                {[
                                    {
                                        step: '01',
                                        title: 'Target Compound or Pathogen Ingestion',
                                        badge: 'Input & Formulation',
                                        color: 'from-teal-500 to-cyan-500',
                                        details: 'The researcher supplies the target compound (e.g., Ibuprofen, Remdesivir, Doxorubicin) or disease candidate, specifying dosage (mg) and route of administration (Oral, IV, Inhalation, IM, Topical). The system retrieves SMILES strings, molecular weight, lipophilicity, and functional groups.',
                                        outputs: ['Chemical SMILES & IUPAC', 'Molecular Weight & LogP', 'Route Bioavailability Factor (F%)']
                                    },
                                    {
                                        step: '02',
                                        title: 'Virtual Subject Cohort Calibration',
                                        badge: 'Physiogenomic Calibration',
                                        color: 'from-cyan-500 to-blue-500',
                                        details: 'The simulation normalizes pharmacokinetics against the specific virtual twin subject. Renal excretion is scaled via Cockcroft-Gault estimated GFR (CrCl mL/min), while hepatic first-pass breakdown is modulated by the subject’s CYP450 genomic profile (e.g. CYP2D6*1/*1 Normal vs CYP2C9*3/*3 Poor Metabolizer).',
                                        outputs: ['Estimated GFR & Clearance Rate', 'CYP450 Oxidation Multiplier', 'Volume of Distribution (V_d)']
                                    },
                                    {
                                        step: '03',
                                        title: 'High-Dimensional In-Silico ADME & Tensor Modeling',
                                        badge: 'Pharmacokinetics / Dynamics',
                                        color: 'from-blue-500 to-purple-500',
                                        details: 'Calculates the full time-based concentration curve (0 min -> Onset -> Peak C_max -> Mid-duration -> End clearance). Generates organ-specific strain scores (0-100) based on receptor affinities, mitochondrial oxidative stress, and accumulation kinetics, flagging when toxic thresholds are breached.',
                                        outputs: ['Time-intensity curves (0min, onset, peak, end)', 'Organ Toxicity Strain Scores (0-100)', 'Toxic Threshold Exceeded Flags']
                                    },
                                    {
                                        step: '04',
                                        title: '3D Anatomical Projection & Preclinical Triage Verdict',
                                        badge: '3D Shader & Triage Report',
                                        color: 'from-purple-500 to-rose-500',
                                        details: 'The calculated strain scores drive the dynamic Three.js vertex shaders in real time, projecting visual heatmaps onto the 3D twin across the 5 anatomical layers. Concurrently, an algorithmic Research Triage Report synthesizes confidence scores, uncertainty margins, and verdicts (RECOMMENDED, CAUTION, CONTRAINDICATED).',
                                        outputs: ['Live Three.js Organ Heatmap Shading', 'Confidence & Uncertainty Margins (±%)', 'Preclinical In-Vitro Triage Dossier']
                                    }
                                ].map(item => (
                                    <div key={item.step} className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-teal-500/30 transition-all flex flex-col md:flex-row gap-5 items-start">
                                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${item.color} flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-lg`}>
                                            {item.step}
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h5 className="text-base font-bold text-white">{item.title}</h5>
                                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-teal-300">
                                                    {item.badge}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-300 leading-relaxed font-light">
                                                {item.details}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                                <span className="text-[10px] font-mono text-gray-400 font-bold uppercase">Calculated Vectors:</span>
                                                {item.outputs.map((out, idx) => (
                                                    <span key={idx} className="text-[11px] font-mono bg-teal-500/10 text-teal-300 border border-teal-500/20 px-2 py-0.5 rounded-md">
                                                        {out}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 3: 3D ANATOMY & LAYERS */}
                    {currentTab === 'layers' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-200/90 leading-relaxed">
                                <span className="font-bold text-teal-300 uppercase tracking-wider text-[10px] mr-1.5">3D Multi-Layer Architecture:</span>
                                The 3D Digital Twin renders five distinct anatomical systems. You can isolate or blend these layers using the layer toggle controls in the 3D lab:
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {ANATOMY_LAYERS_INFO.map(layer => (
                                    <div key={layer.id} className={`p-6 rounded-3xl bg-white/[0.02] border ${layer.borderColor} hover:bg-white/[0.04] transition-all space-y-3`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl">{layer.icon}</span>
                                                <div>
                                                    <h5 className="text-base font-bold text-white">{layer.name}</h5>
                                                    <span className={`text-[10px] font-mono font-bold ${layer.textColor}`}>
                                                        ID: {layer.id}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <p className="text-xs text-gray-300 leading-relaxed font-light">
                                            {layer.summary}
                                        </p>

                                        <div className="space-y-1.5 pt-2 border-t border-white/5">
                                            <div className="text-[10px] font-mono font-bold text-gray-400 uppercase">Key Simulated Biomarkers:</div>
                                            <ul className="text-xs text-gray-300 space-y-1 font-light">
                                                {layer.biomarkers.map((b, i) => (
                                                    <li key={i} className="flex items-center gap-1.5">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
                                                        <span>{b}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 text-[11px] text-teal-200/70 font-mono">
                                            <strong className="text-teal-300 font-semibold">Shader Behavior:</strong> {layer.heatmapShader}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 4: CASE STUDIES */}
                    {currentTab === 'casestudies' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-200/90 leading-relaxed flex items-center justify-between">
                                <div>
                                    <span className="font-bold text-teal-300 uppercase tracking-wider text-[10px] mr-1.5">Instant Verification:</span>
                                    Click any pre-configured case study below to immediately load its virtual cohort, compound dosage, and 3D simulation telemetry into the 3D Twin Lab!
                                </div>
                            </div>

                            <div className="space-y-4">
                                {SYSTEM_CASE_STUDIES.map(study => (
                                    <div 
                                        key={study.id}
                                        className="p-6 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-teal-400/40 transition-all group flex flex-col md:flex-row justify-between gap-5 items-start md:items-center"
                                    >
                                        <div className="space-y-2 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
                                                    {study.category}
                                                </span>
                                                <span className="text-[10px] font-mono text-gray-400">
                                                    Cohort: {study.cohort.age}y {study.cohort.gender} ({study.cohort.weight}kg)
                                                </span>
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                    study.triageVerdict === 'RECOMMENDED' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' :
                                                    study.triageVerdict === 'CAUTION' ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' :
                                                    'bg-rose-500/20 border-rose-500/40 text-rose-300'
                                                }`}>
                                                    Verdict: {study.triageVerdict}
                                                </span>
                                            </div>

                                            <h4 className="text-base sm:text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                                                {study.title}
                                            </h4>

                                            <p className="text-xs text-gray-300 leading-relaxed font-light">
                                                {study.notes}
                                            </p>

                                            <div className="p-2.5 rounded-xl bg-teal-950/30 border border-teal-500/20 text-xs text-teal-200 font-mono">
                                                💡 <strong className="text-teal-300">Key Scientific Takeaway:</strong> {study.keyTakeaway}
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleLaunchCaseStudy(study)}
                                            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(45,212,191,0.3)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2 flex-shrink-0 cursor-pointer"
                                        >
                                            <Play size={14} className="fill-current" />
                                            <span>Run in 3D Lab</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 5: GLOSSARY */}
                    {currentTab === 'glossary' && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Search bar */}
                            <div className="relative">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search any biomarker, pharmacokinetics acronym, or metric (e.g., GFR, CYP450, Cmax, hERG)..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/[0.04] border border-white/10 focus:border-teal-500/50 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-gray-400 outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredGlossary.map((item, idx) => (
                                    <div key={idx} className="p-5 rounded-2xl bg-white/[0.02] border border-white/10 hover:border-teal-500/30 transition-all space-y-1.5">
                                        <div className="flex items-center justify-between">
                                            <h5 className="text-sm font-bold text-teal-300">{item.term}</h5>
                                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-gray-400 border border-white/5">
                                                {item.category}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-300 leading-relaxed font-light">
                                            {item.definition}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* TAB 6: CONTROLS & GESTURES */}
                    {currentTab === 'gestures' && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-200/90 leading-relaxed">
                                <span className="font-bold text-teal-300 uppercase tracking-wider text-[10px] mr-1.5">Interaction Mechanics:</span>
                                The 3D Digital Twin supports both standard mouse/touch navigation and cutting-edge touchless webcam **MediaPipe Hand-Tracking Gestures**:
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Hand tracking card */}
                                <div className="p-6 rounded-3xl bg-white/[0.02] border border-purple-500/30 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                                            <Hand size={20} />
                                        </div>
                                        <div>
                                            <h5 className="text-base font-bold text-white">MediaPipe Hand-Tracking Gestures</h5>
                                            <p className="text-xs text-purple-300/80">Touchless sterile lab manipulation via webcam</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2 text-xs text-gray-300">
                                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                                            <span className="text-lg">🤏</span>
                                            <div>
                                                <strong className="text-white block">Index Finger Pinch (Thumb + Index)</strong>
                                                <span className="text-gray-400">Rotates the 3D twin smoothly in 360° space.</span>
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                                            <span className="text-lg">✊</span>
                                            <div>
                                                <strong className="text-white block">Closed Fist</strong>
                                                <span className="text-gray-400">Dynamic zoom-in / zoom-out into organ structures.</span>
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                                            <span className="text-lg">✋</span>
                                            <div>
                                                <strong className="text-white block">Open Palm</strong>
                                                <span className="text-gray-400">Centers and stabilizes the twin in resting anatomical posture.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mouse & keyboard controls */}
                                <div className="p-6 rounded-3xl bg-white/[0.02] border border-teal-500/30 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                                            <Activity size={20} />
                                        </div>
                                        <div>
                                            <h5 className="text-base font-bold text-white">Mouse & Viewport Controls</h5>
                                            <p className="text-xs text-teal-300/80">Precision inspection of anatomical meshes</p>
                                        </div>
                                    </div>

                                    <div className="space-y-3 pt-2 text-xs text-gray-300">
                                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                                            <span className="text-lg">🖱️</span>
                                            <div>
                                                <strong className="text-white block">Left-Click + Drag</strong>
                                                <span className="text-gray-400">Orbit camera around the twin from any angle.</span>
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                                            <span className="text-lg">📜</span>
                                            <div>
                                                <strong className="text-white block">Mouse Scroll Wheel</strong>
                                                <span className="text-gray-400">Smooth zoom from whole-body habitus down to cellular organs.</span>
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                                            <span className="text-lg">⏱️</span>
                                            <div>
                                                <strong className="text-white block">Time Scrubber Slider</strong>
                                                <span className="text-gray-400">Scrub across 0 min → Onset → Peak C_max → Mid-duration → Elimination.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>

                {/* Modal Footer */}
                <div className="flex-shrink-0 px-6 py-4 bg-slate-950/80 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                    <div className="text-gray-400 font-mono text-[11px] flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                        <span>BioTwin Preclinical Computational Engine • Calibrated to GFR & CYP450</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={closeGuide}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-bold text-xs shadow-lg transition-all duration-200 cursor-pointer"
                        >
                            Got It, Back to Twin Lab
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SystemUnderstandingModal;
