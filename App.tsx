import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Login from './features/Login';
import Dashboard from './features/Dashboard';
import DrugImpactVisualizer from './features/DrugImpactVisualizer';
import Layout from './components/Layout';

const AppContent: React.FC = () => {
    const { user, currentPage } = useAppContext();

    if (!user) {
        return <Login />;
    }

    const renderPage = () => {
        switch (currentPage) {
            case 'DASHBOARD':
                return <Dashboard />;
            case 'DRUG_VISUALIZER':
                return <DrugImpactVisualizer />;
            case 'EDIT_PROFILE':
                return <Login />;
            default:
                return <DrugImpactVisualizer />;
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