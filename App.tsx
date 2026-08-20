
import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Login from './features/Login';
import Dashboard from './features/Dashboard';
import DietPlanner from './features/DietPlanner';
import ReportAnalyzer from './features/ReportAnalyzer';
import CalorieCounter from './features/CalorieCounter';
import ExerciseCorner from './features/ExerciseCorner';
import TodaysGoal from './features/TodaysGoal';
import Layout from './components/Layout';
import LocationTracker from './features/LocationTracker';
import ActivityTracker from './features/ActivityTracker';
import GymManagement from './features/GymManagement';
import MedicalImaging from './features/MedicalImaging';
import DrugImpactVisualizer from './features/DrugImpactVisualizer';
import SkinDetection from './features/SkinDetection';
import DiabetesPrediction from './features/DiabetesPrediction';
import HeartDiseaseAnalyzer from './features/HeartDiseaseAnalyzer';
import KidneyDiseaseAnalyzer from './features/KidneyDiseaseAnalyzer';
import CancerDetection from './features/CancerDetection';
import ExerciseFormMonitor from './features/ExerciseFormMonitor';
import QuantumPulse from './features/QuantumPulse';
import YogaPoseDetector from './features/YogaPoseDetector';

const AppContent: React.FC = () => {
    const { user, currentPage } = useAppContext();

    if (!user) {
        return <Login />;
    }

    const renderPage = () => {
        switch (currentPage) {
            case 'DASHBOARD':
                return <Dashboard />;
            case 'DIET_PLANNER':
                return <DietPlanner />;
            case 'REPORT_ANALYZER':
                return <ReportAnalyzer />;
            case 'CALORIE_COUNTER':
                return <CalorieCounter />;
            case 'EXERCISE_CORNER':
                return <ExerciseCorner />;
            case 'TODAYS_GOAL':
                return <TodaysGoal />;
            case 'LOCATION_TRACKER':
                return <LocationTracker />;
            case 'ACTIVITY_TRACKER':
                return <ActivityTracker />;
            case 'GYM_MANAGEMENT':
                return <GymManagement />;
            case 'MEDICAL_IMAGING':
                return <MedicalImaging />;
            case 'DRUG_VISUALIZER':
                return <DrugImpactVisualizer />;
            case 'SKIN_DETECTION':
                return <SkinDetection />;
            case 'DIABETES_PREDICTION':
                return <DiabetesPrediction />;
            case 'HEART_DISEASE_ANALYZER':
                return <HeartDiseaseAnalyzer />;
            case 'KIDNEY_DISEASE_ANALYZER':
                return <KidneyDiseaseAnalyzer />;
            case 'CANCER_DETECTION':
                return <CancerDetection />;
            case 'QUANTUM_PULSE':
                return <QuantumPulse />;
            case 'YOGA_POSE_DETECTOR':
                return <YogaPoseDetector />;
            case 'EDIT_PROFILE':
                return <Login />;
            default:
                return <Dashboard />;
        }
    };

    return <Layout>{renderPage()}</Layout>;
};

const App: React.FC = () => {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
};

export default App;