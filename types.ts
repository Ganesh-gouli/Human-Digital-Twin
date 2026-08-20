
export type Gender = 'male' | 'female' | 'other';

export interface UserProfile {
    name: string;
    email: string;
    age: number;
    gender: Gender;
    height: number; // in cm
    weight: number; // in kg
    bmi: number;
    password?: string;
    emergencyContact?: string;
}

export type Page = 'DASHBOARD' | 'DIET_PLANNER' | 'REPORT_ANALYZER' | 'CALORIE_COUNTER' | 'EXERCISE_CORNER' | 'TODAYS_GOAL' | 'LOCATION_TRACKER' | 'EDIT_PROFILE' | 'ACTIVITY_TRACKER' | 'GYM_MANAGEMENT' | 'MEDICAL_IMAGING' | 'DRUG_VISUALIZER' | 'SKIN_DETECTION' | 'DIABETES_PREDICTION' | 'HEART_DISEASE_ANALYZER' | 'KIDNEY_DISEASE_ANALYZER' | 'CANCER_DETECTION' | 'QUANTUM_PULSE' | 'YOGA_POSE_DETECTOR';

export interface CatalogExercise {
    id: string;
    name: string;
    muscles: string[]; // Primary muscles targeted
    equipment: string[];
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    imageUrl?: string;
    videoUrl?: string;
    description?: string;
}

export interface LoggedFood {
    name: string;
    calories: number;
    source: 'plan' | 'counter';
}

export interface DailyLog {
    date: string;
    caloriesIn: number; // For graph - only from 'counter' source
    caloriesOut: number;
    loggedFoods: LoggedFood[];
}

export interface MealOption {
    name: string;
    calories: number;
    description: string;
}

export interface Meal {
    breakfast: MealOption[];
    lunch: MealOption[];
    snacks: MealOption[];
    dinner: MealOption[];
}

export interface DietPlan {
    mealPlan: Meal;
    reasoning: string;
    healthRecommendations: string[];
    foodsToInclude: string[];
    foodsToAvoid: string[];
    precautions: string[];
    exerciseRoutine: Exercise[];
    lifestyleModifications: string[];
}

export interface ReportAnalysis extends DietPlan {
    reportSummary: string;
    patientInfo: {
        name: string;
        age: number;
        gender: string;
        reportDate: string;
    };
    actionPlan: string[];
    treatmentRecommendations: string[];
    problemExplanation: string;
    keyRecommendations: string[];
}

export interface IdentifiedFood {
    id: string;
    name: string;
    weight: number;
    cookingMethod: string; // Added for accuracy
}

export interface FoodItem {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    source: 'USDA' | 'AI' | 'USER';
    confidence?: number; // AI's confidence in its own estimation
    healthVerdict?: string; // New field for health pros/cons
}

export interface CalorieAnalysisResult {
    foodItems: FoodItem[];
    accuracy: number;
}

export interface Exercise {
    name: string;
    reps: string;
    sets: number;
    caloriesBurnedPerSet: number;
    youtubeQuery: string;
    videoScript: string;
    steps: string[];
    modifications?: string[];
}


export interface WorkoutRoutine {
    warmUp: Exercise[];
    mainWorkout: Exercise[];
    coolDown: Exercise[];
}

export interface SingleExerciseInfo {
    name: string;
    youtubeQuery: string;
    steps: string[];
    tips: string[];
}

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export interface HealthServiceLocation {
    name: string;
    address: string;
    mapsUri: string;
    latitude: number;
    longitude: number;
    rating?: number;
}

export interface NearbyHealthServices {
    hospitals: HealthServiceLocation[];
    clinics: HealthServiceLocation[];
    medicalStores: HealthServiceLocation[];
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

export interface DrugAnalysisResult {
    drug_name: string;
    category: string;
    pharmacokinetics: Pharmacokinetics;
    pharmacodynamics: Pharmacodynamics;
    heatmap_effects: HeatmapEffect[];
    time_based_intensity: TimeBasedIntensity;
    system_wide_risk_score: number;
    interaction_risk_flag: boolean;
    genomic_warnings?: string[];

    // Legacy fields that might still be used elsewhere or in mock data
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

// Legacy interface kept for backward compatibility with Mock Data and other components
export interface DrugOrganEffect {
    organ: string;
    system: string;
    predicted_effect: string;
    mechanism_hypothesis: string;
    intensity: number;
    type: DrugEffectType;
    onset?: number;
    duration?: number;
    confidence_score: number;
}

export interface SkinAnalysisResult {
    diseaseName: string;
    causes: string[];
    homeRemedies: string[];
    medicalTreatments: string[];
    severity: 'Mild' | 'Moderate' | 'Serious';
    explanation: string;
    disclaimer: string;
    abcdScores?: { asymmetry: number; border: number; color: number; diameter: number; evolution: number };
    dermalInfiltration?: { epidermis: number; dermis: number; subcutaneous: number };
    skinMetrics?: { melaninIndex: number; hydration: number; erythemaIndex: number; barrierHealth: number };
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