export type Gender = 'male' | 'female' | 'other';

export interface UserProfile {
    name: string; // Investigator name
    email: string; // Investigator email / institution
    age: number; // Subject age
    gender: Gender; // Subject biological sex
    height: number; // in cm
    weight: number; // in kg
    bmi: number;
    institution?: string;
    cypProfile?: string; // e.g. 'Normal (CYP2D6*1/*1)'
    estimatedGFR?: number; // mL/min (e.g. 105)
    password?: string;
}

export type Page = 'DASHBOARD' | 'DRUG_VISUALIZER' | 'EDIT_PROFILE';

export interface OrganToxicityScore {
    organ: string;
    toxicity_level: 'low' | 'moderate' | 'high' | 'severe';
    strain_score: number; // 0 - 100
    mechanism: string;
    confidence: number;
    toxic_threshold_exceeded: boolean;
}

export interface ResearchTriageRecommendation {
    verdict: 'HIGH_PRIORITY_IN_VITRO' | 'MONITOR_CLOSELY' | 'HIGH_TOXIC_RISK';
    recommendation_title: string;
    summary: string;
    vulnerable_organs: string[];
    mitigation_notes: string;
}

export interface ExperimentDossier {
    id: string;
    timestamp: string;
    title: string;
    investigator: string;
    type: 'DRUG_SIMULATION' | 'DISEASE_PATHOGEN_SIMULATION' | 'DRUG_COMPARISON';
    targetCompound: string;
    secondaryCompound?: string;
    dosage: string;
    route: string;
    cohort: {
        age: number;
        gender: Gender;
        weight: number;
        genomicProfile: string;
    };
    systemicRiskScore: number;
    confidenceScore: number; // 0 - 100
    uncertaintyMargin: number; // e.g. 4.8 (%)
    organToxicities: OrganToxicityScore[];
    triageVerdict: 'RECOMMENDED' | 'CAUTION' | 'CONTRAINDICATED';
    validationStatus: 'In-Silico Complete' | 'Pending In-Vitro Assay' | 'Assay Confirmed';
    notes: string;
    simulationData?: any; // Cached drug/disease result for 1-click reload
}

// Backward compatibility helper types
export interface LoggedFood {
    name: string;
    calories: number;
    source: 'plan' | 'counter';
}

export interface DailyLog {
    date: string;
    caloriesIn: number;
    caloriesOut: number;
    loggedFoods: LoggedFood[];
}

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export interface Pharmacokinetics {
    onset_minutes: number;
    peak_minutes: number;
    duration_hours: number;
    bioavailability_estimate: number;
}

export interface Pharmacodynamics {
    primary_mechanism: string;
    receptor_targets?: string[];
    enzyme_inhibition_percent?: number;
}

export interface HeatmapEffect {
    layer: 'ORGAN_VIEW' | 'SKELETON_VIEW';
    structure_name: string;
    effect_type: string;
    mechanism: string;
    intensity: number;
    risk_level: 'low' | 'moderate' | 'high' | 'severe';
    confidence_score: number;
    toxic_threshold: boolean;
    accumulation_factor: number;
    dose_dependency_factor: number;
}

export interface TimeBasedIntensity {
    "0 min": number;
    "onset": number;
    "peak": number;
    "mid duration": number;
    "end duration": number;
}

export interface SynthesisReactionStep {
    step_number: number;
    reaction_name: string;
    reagents: string;
    conditions?: string;
    intermediate_product: string;
    yield_percent: number;
    notes?: string;
}

export interface ChemicalSynthesisPathway {
    precursors: string[];
    reaction_steps: SynthesisReactionStep[];
    total_yield_percent: number;
    atom_economy?: string;
    green_chemistry_score?: number; // 0 - 100
    safety_hazard_notes?: string;
}

export interface MolecularEnhancementProposal {
    id: string;
    strategy_name: string;
    chemical_modification: string;
    pharmacological_rationale: string;
    target_organ_sparing: string; // e.g. "Stomach (reduces mucosal toxicity by 65%)"
    toxicity_reduction_percent: number; // e.g. 65
    half_life_change?: string; // e.g. "Extended from 1.9h to 5.2h"
    potency_delta?: string; // e.g. "+15% COX-2 selectivity"
    synthetic_feasibility: 'High' | 'Moderate' | 'Complex';
    modified_chemical_formula?: string;
}

export interface DrugAnalysisResult {
    drug_name: string;
    category?: string;
    chemical_formula?: string;
    iupac_name?: string;
    smiles_string?: string;
    functional_groups?: string[];
    synthesis_pathway?: ChemicalSynthesisPathway;
    enhancement_proposals?: MolecularEnhancementProposal[];
    is_enhanced_derivative?: boolean;
    parent_drug_name?: string;
    enhancement_applied?: string;
    pharmacokinetics?: Pharmacokinetics;
    pharmacodynamics?: Pharmacodynamics;
    heatmap_effects: HeatmapEffect[];
    time_based_intensity: TimeBasedIntensity;
    system_wide_risk_score: number;
    confidence_score?: number;
    uncertainty_margin?: number;
    interaction_risk_flag?: boolean;
    genomic_warnings?: string[];

    // Optional / legacy fields
    primary_mechanism?: string;
    molecular_weight?: string;
    half_life?: string;
    bioavailability?: string;
    peak_concentration_time?: string;
    effects?: DrugOrganEffect[];
    mechanism?: string;
    short_term_effects?: string[];
    long_term_effects?: string[];
    side_effects?: string[];
    contraindications?: string[];
    detailed_explanation?: string;
    risk_level?: string;
    dose_dependency_factor?: number;
}

export type DrugEffectType = 'therapeutic' | 'stimulation' | 'suppression' | 'toxicity' | 'side-effect' | 'relief';

export interface DrugOrganEffect {
    layer?: 'ORGAN_VIEW' | 'SKELETON_VIEW' | string;
    structure_name?: string;
    effect_type?: string;
    mechanism?: string;
    organ?: string;
    system?: string;
    predicted_effect?: string;
    mechanism_hypothesis?: string;
    intensity: number;
    type?: DrugEffectType | string;
    onset?: number;
    duration?: number;
    confidence_score: number;
    risk_level?: string;
    toxic_threshold?: boolean;
    accumulation_factor?: number;
    dose_dependency_factor?: number;
}

export interface DiseaseTimelineEntry {
    time: string;
    description: string;
    organs_active: string[];
}

export interface DiseaseMedication {
    name: string;
    type: string;
    dosage_range: string;
    purpose: string;
}

export interface VaccineInfo {
    exists: boolean;
    vaccineName: string;
    mechanism: string;
    efficacy: number;
    side_effects: string[];
}

export interface DiseaseSimulationResult {
    disease_name: string;
    severity: 'mild' | 'moderate' | 'severe';
    ai_confidence_score: number;
    uncertainty_margin?: number;
    disease_injection: {
        entry_point: string;
        spread_mechanism: string;
        affected_organs: string[];
        affected_systems: string[];
    };
    body_impact: {
        timeline: DiseaseTimelineEntry[];
        biological_changes: string[];
    };
    symptoms: {
        early_stage: string[];
        advanced_stage: string[];
    };
    treatment: {
        medications: DiseaseMedication[];
        non_pharmacological: string[];
    };
    drug_response_simulation: {
        recovery_timeline: string;
        body_response_steps: string[];
        possible_side_effects: string[];
    };
    health_outcome: {
        recovery_probability_treated: number;
        recovery_probability_untreated: number;
        risk_level: 'low' | 'medium' | 'high';
        untreated_consequences: string[];
        treated_prognosis: string;
    };
    heatmap_effects: HeatmapEffect[];
}