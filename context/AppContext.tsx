import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { UserProfile, Page, DailyLog, LoggedFood, ExperimentDossier } from '../types';
import { registerUser, logUserActivity } from '../services/userService';

interface ResearchInsightData {
    text: string;
    language: string;
}

interface AppContextType {
    user: UserProfile | null;
    currentPage: Page;
    dailyLog: DailyLog;
    logHistory: DailyLog[];
    isDarkMode: boolean;
    healthTipData: ResearchInsightData | null;
    language: string;
    savedExperiments: ExperimentDossier[];
    activeDossier: ExperimentDossier | null;
    isGuideOpen: boolean;
    activeGuideTab: string;
    openGuide: (tab?: string) => void;
    closeGuide: () => void;
    login: (profile: Omit<UserProfile, 'bmi'>) => void;
    logout: () => void;
    navigateTo: (page: Page) => void;
    addFoodItems: (items: Omit<LoggedFood, 'source'>[], source: LoggedFood['source']) => void;
    removeFoodItem: (itemToRemove: LoggedFood) => void;
    addCaloriesOut: (amount: number) => void;
    toggleDarkMode: () => void;
    setHealthTipData: (data: ResearchInsightData) => void;
    setLanguage: (lang: string) => void;
    saveExperiment: (dossier: ExperimentDossier) => void;
    deleteExperiment: (id: string) => void;
    loadExperiment: (dossier: ExperimentDossier) => void;
    clearActiveDossier: () => void;
    activeScientificModal: 'MOLECULAR' | 'TELEMETRY' | 'GENOME' | 'QUANTUM' | 'RWE' | null;
    openScientificModal: (modal: 'MOLECULAR' | 'TELEMETRY' | 'GENOME' | 'QUANTUM' | 'RWE' | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const getTodayString = () => new Date().toISOString().split('T')[0];

const INITIAL_DOSSIERS: ExperimentDossier[] = [
    {
        id: 'EXP-2026-089',
        timestamp: '2026-09-12 14:30 UTC',
        title: 'Preclinical In-Silico Assay: Remdesivir (GS-5734) vs SARS-CoV-2 Viral RNA Polymerase',
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
        notes: 'Simulated alveolar tissue concentration exceeds EC50 by 4.2x. Low cardiotoxicity risk. Proceed to in-vitro Vero E6 cell culture assay.'
    },
    {
        id: 'EXP-2026-090',
        timestamp: '2026-09-13 09:15 UTC',
        title: 'Comparative Cardiotoxicity Screen: Free Doxorubicin vs Pegylated Liposomal Carrier',
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
        notes: 'Free Doxorubicin exceeds cardiac toxic threshold. In-silico liposomal formulation reduced cardiac accumulation by 64%. Recommend evaluating only liposomal candidate in wet-lab.'
    },
    {
        id: 'EXP-2026-091',
        timestamp: '2026-09-14 11:40 UTC',
        title: 'Renal Perfusion & Mucosal Burden: High-Dose Ibuprofen in CYP2C9 Slow Metabolizer',
        investigator: 'Dr. Marcus Webb, Molecular Pharmacology',
        type: 'DRUG_SIMULATION',
        targetCompound: 'Ibuprofen',
        dosage: '800 mg Oral TID',
        route: 'Oral',
        cohort: {
            age: 68,
            gender: 'male',
            weight: 79,
            genomicProfile: 'CYP2C9*3 Intermediate Metabolizer'
        },
        systemicRiskScore: 0.58,
        confidenceScore: 93.1,
        uncertaintyMargin: 5.4,
        organToxicities: [
            { organ: 'Kidneys', toxicity_level: 'high', strain_score: 74, mechanism: 'Afferent arteriolar vasoconstriction via COX-2 renal prostaglandin suppression', confidence: 0.94, toxic_threshold_exceeded: true },
            { organ: 'Stomach', toxicity_level: 'moderate', strain_score: 66, mechanism: 'Depletion of cytoprotective PGE2 and mucosal bicarbonate barrier', confidence: 0.92, toxic_threshold_exceeded: false },
            { organ: 'Liver', toxicity_level: 'low', strain_score: 32, mechanism: 'Delayed CYP2C9 clearance elevating plasma AUC by 42%', confidence: 0.90, toxic_threshold_exceeded: false }
        ],
        triageVerdict: 'CAUTION',
        validationStatus: 'In-Silico Complete',
        notes: 'CYP2C9*3 allele slows elimination kinetics, causing systemic accumulation that significantly strains renal perfusion. Reduce simulated dosage to 400mg.'
    }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(() => {
        const saved = localStorage.getItem('biotwin_investigator_profile');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { /* ignore */ }
        }
        return null;
    });

    const [currentPage, setCurrentPage] = useState<Page>('DRUG_VISUALIZER');
    const [logHistory, setLogHistory] = useState<DailyLog[]>([]);
    const [isDarkMode, setIsDarkMode] = useState(true); // Default to sleek dark mode for laboratory feel
    const [healthTipData, setHealthTipData] = useState<ResearchInsightData | null>(null);
    const [language, setLanguage] = useState('English');

    // Virtual Experiment Dossiers
    const [savedExperiments, setSavedExperiments] = useState<ExperimentDossier[]>(() => {
        const saved = localStorage.getItem('biotwin_experiment_dossiers');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch (e) {
                console.error('Failed to parse saved experiment dossiers:', e);
            }
        }
        return INITIAL_DOSSIERS;
    });

    const [activeDossier, setActiveDossier] = useState<ExperimentDossier | null>(null);
    const [isGuideOpen, setIsGuideOpen] = useState(false);
    const [activeGuideTab, setActiveGuideTab] = useState('overview');
    const [activeScientificModal, setActiveScientificModal] = useState<'MOLECULAR' | 'TELEMETRY' | 'GENOME' | 'QUANTUM' | 'RWE' | null>(null);

    // Persist dossiers to localStorage
    useEffect(() => {
        try {
            localStorage.setItem('biotwin_experiment_dossiers', JSON.stringify(savedExperiments));
        } catch (e) {
            console.error('Failed to persist experiment dossiers:', e);
        }
    }, [savedExperiments]);

    // Dark mode class application
    useEffect(() => {
        const root = window.document.documentElement;
        if (isDarkMode) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [isDarkMode]);

    const todayLog = logHistory.find(log => log.date === getTodayString()) || {
        date: getTodayString(),
        caloriesIn: 0,
        caloriesOut: 0,
        loggedFoods: []
    };

    const login = (profile: Omit<UserProfile, 'bmi'>) => {
        const heightInMeters = profile.height > 0 ? profile.height / 100 : 1.75;
        const weight = profile.weight > 0 ? profile.weight : 70;
        const bmi = parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(1));
        const newUser: UserProfile = {
            ...profile,
            bmi,
            institution: profile.institution || 'In-Silico Research Institute',
            cypProfile: profile.cypProfile || 'Standard (Normal Metabolizer)',
            estimatedGFR: profile.estimatedGFR || 105
        };
        setUser(newUser);
        try {
            localStorage.setItem('biotwin_investigator_profile', JSON.stringify(newUser));
        } catch (e) { /* ignore */ }

        setCurrentPage('DRUG_VISUALIZER');

        if (newUser.email) {
            registerUser(newUser.name, newUser.email, "");
        }
    };

    const logout = () => {
        setUser(null);
        try {
            localStorage.removeItem('biotwin_investigator_profile');
        } catch (e) { /* ignore */ }
        setCurrentPage('DRUG_VISUALIZER');
        setHealthTipData(null);
    };

    const navigateTo = (page: Page) => {
        setCurrentPage(page);
    };

    const saveExperiment = useCallback((dossier: ExperimentDossier) => {
        setSavedExperiments(prev => {
            const existsIndex = prev.findIndex(item => item.id === dossier.id);
            if (existsIndex > -1) {
                const updated = [...prev];
                updated[existsIndex] = dossier;
                return updated;
            }
            return [dossier, ...prev];
        });
    }, []);

    const deleteExperiment = useCallback((id: string) => {
        setSavedExperiments(prev => prev.filter(item => item.id !== id));
        if (activeDossier?.id === id) {
            setActiveDossier(null);
        }
    }, [activeDossier]);

    const loadExperiment = useCallback((dossier: ExperimentDossier) => {
        setActiveDossier(dossier);
        setCurrentPage('DRUG_VISUALIZER');
    }, []);

    const clearActiveDossier = useCallback(() => {
        setActiveDossier(null);
    }, []);

    const updateLogHistory = (updatedLog: DailyLog) => {
        setLogHistory(prev => {
            const existingIndex = prev.findIndex(log => log.date === updatedLog.date);
            let newHistory = [...prev];
            if (existingIndex > -1) {
                newHistory[existingIndex] = updatedLog;
            } else {
                newHistory.push(updatedLog);
            }
            return newHistory.slice(-7);
        });
    };

    const addFoodItems = useCallback((items: Omit<LoggedFood, 'source'>[], source: LoggedFood['source']) => {
        const itemsWithSource: LoggedFood[] = items.map(item => ({ ...item, source }));
        const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);

        const updatedLog = {
            ...todayLog,
            caloriesIn: todayLog.caloriesIn + (source === 'counter' ? totalCalories : 0),
            loggedFoods: [...todayLog.loggedFoods, ...itemsWithSource],
        };
        updateLogHistory(updatedLog);

        if (user?.email) {
            logUserActivity(user.email, 'food', { items: itemsWithSource, totalCalories });
        }
    }, [todayLog, user]);

    const removeFoodItem = useCallback((itemToRemove: LoggedFood) => {
        const indexToRemove = todayLog.loggedFoods.findIndex(
            item => item.name === itemToRemove.name && item.calories === itemToRemove.calories && item.source === itemToRemove.source
        );

        if (indexToRemove > -1) {
            const newLoggedFoods = [...todayLog.loggedFoods];
            newLoggedFoods.splice(indexToRemove, 1);

            const updatedLog = {
                ...todayLog,
                caloriesIn: todayLog.caloriesIn - (itemToRemove.source === 'counter' ? itemToRemove.calories : 0),
                loggedFoods: newLoggedFoods,
            };
            updateLogHistory(updatedLog);
        }
    }, [todayLog]);

    const addCaloriesOut = useCallback((amount: number) => {
        const updatedLog = { ...todayLog, caloriesOut: todayLog.caloriesOut + amount };
        updateLogHistory(updatedLog);
    }, [todayLog]);

    const toggleDarkMode = useCallback(() => {
        setIsDarkMode(prev => !prev);
    }, []);

    const openGuide = useCallback((tab?: string) => {
        if (tab) setActiveGuideTab(tab);
        setIsGuideOpen(true);
    }, []);

    const closeGuide = useCallback(() => {
        setIsGuideOpen(false);
    }, []);

    return (
        <AppContext.Provider value={{
            user,
            currentPage,
            dailyLog: todayLog,
            logHistory,
            isDarkMode,
            healthTipData,
            language,
            savedExperiments,
            activeDossier,
            isGuideOpen,
            activeGuideTab,
            openGuide,
            closeGuide,
            login,
            logout,
            navigateTo,
            addFoodItems,
            removeFoodItem,
            addCaloriesOut,
            toggleDarkMode,
            setHealthTipData,
            setLanguage,
            saveExperiment,
            deleteExperiment,
            loadExperiment,
            clearActiveDossier
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
