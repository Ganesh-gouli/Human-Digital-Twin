import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { ICONS } from '../constants';
import Chatbot from './Chatbot';
import SystemUnderstandingModal from './SystemUnderstandingModal';

const ThemeToggleButton: React.FC = () => {
    const { isDarkMode, toggleDarkMode } = useAppContext();

    return (
        <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 border border-white/10"
            aria-label="Toggle dark mode"
        >
            {isDarkMode ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            )}
        </button>
    );
};

const ProfileMenu: React.FC = () => {
    const { user, navigateTo, logout } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2.5 cursor-pointer p-1.5 px-2.5 rounded-xl bg-white/[0.04] hover:bg-white/10 transition-colors duration-200 border border-white/10"
            >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shadow-sm ring-1 ring-white/20">
                    {user?.name?.charAt(0)?.toUpperCase() || 'R'}
                </div>
                <div className="hidden md:block text-left">
                    <p className="text-xs font-bold text-white leading-none truncate max-w-[130px]">{user?.name || 'Lead Investigator'}</p>
                    <p className="text-[10px] text-teal-400 font-mono mt-0.5">Twin: {user?.age || 35}y • {user?.weight || 70}kg</p>
                </div>
                <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-[#0a0f1d] rounded-2xl shadow-2xl border border-white/15 py-2.5 z-50 transform origin-top-right transition-all backdrop-blur-xl">
                    <div className="px-4 py-2.5 border-b border-white/10">
                        <div className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">Investigator Profile</div>
                        <p className="text-sm font-bold text-white truncate mt-0.5">{user?.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user?.email || user?.institution || 'BioTwin Research Fellow'}</p>
                        <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-300 font-mono">
                            <span>Subject: {user?.gender}</span>
                            <span>CrCl: {user?.estimatedGFR || 105} mL/min</span>
                        </div>
                    </div>
                    <button
                        onClick={() => { navigateTo('EDIT_PROFILE'); setIsOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-xs text-gray-300 hover:bg-teal-500/10 hover:text-teal-300 flex items-center space-x-2.5 transition-colors"
                    >
                        {ICONS.edit}
                        <span>Calibrate Virtual Subject</span>
                    </button>
                    <button
                        onClick={() => { logout(); setIsOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center space-x-2.5 transition-colors"
                    >
                        {ICONS.logout}
                        <span>Exit Laboratory</span>
                    </button>
                </div>
            )}
        </div>
    );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, currentPage, navigateTo, dailyLog, language, setLanguage, openGuide } = useAppContext();
    const [isChatOpen, setIsChatOpen] = useState(false);

    // Close chatbot and stop audio when navigating to a different page
    useEffect(() => {
        setIsChatOpen(false);
        window.speechSynthesis.cancel();
    }, [currentPage]);

    return (
        <div className="min-h-screen bg-[#030712] text-gray-100 font-sans transition-colors duration-300 selection:bg-teal-500/30 selection:text-teal-200">
            {/* Background glow effects */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-teal-500/10 blur-[130px]"></div>
                <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] rounded-full bg-cyan-600/10 blur-[120px]"></div>
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[400px] rounded-full bg-blue-600/5 blur-[150px]"></div>
                {/* Microdot matrix */}
                <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]"></div>
            </div>

            {/* Scientific Navigation Header */}
            <header className="fixed top-0 left-0 right-0 z-40 transition-all duration-300">
                <div className="absolute inset-0 bg-[#030712]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl"></div>
                <div className="container mx-auto px-3 sm:px-4 py-2 relative flex justify-between items-center max-w-7xl">
                    {/* Brand */}
                    <div
                        className="flex items-center space-x-2.5 cursor-pointer group"
                        onClick={() => navigateTo('DRUG_VISUALIZER')}
                    >
                        <div className="bg-gradient-to-br from-teal-500 via-cyan-600 to-blue-600 text-white p-2 rounded-xl shadow-lg shadow-teal-500/25 ring-1 ring-white/20 group-hover:scale-105 transition-transform duration-300 flex-shrink-0">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-base md:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                                    BioTwin <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-mono font-bold tracking-wider">AI RESEARCH LAB</span>
                                </span>
                            </div>
                            <p className="text-[10px] text-teal-300/80 font-medium tracking-wide hidden sm:block">
                                Test on a virtual human first, then validate in the real world.
                            </p>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center space-x-2 md:space-x-3">
                        <button
                            onClick={() => openGuide('overview')}
                            className="flex items-center space-x-1.5 text-xs font-bold px-3 py-2 rounded-xl transition-all bg-gradient-to-r from-teal-500/15 via-cyan-500/15 to-blue-500/15 text-teal-300 border border-teal-500/40 hover:border-teal-300 hover:shadow-[0_0_15px_rgba(45,212,191,0.25)] hover:scale-105 active:scale-95 cursor-pointer"
                            title="Open System Architecture & How BioTwin Works Guide"
                        >
                            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                            <span className="flex items-center gap-1">
                                <span>💡</span>
                                <span className="hidden sm:inline">How BioTwin Works</span>
                                <span className="sm:hidden">Guide</span>
                            </span>
                        </button>

                        <button
                            onClick={() => navigateTo('DRUG_VISUALIZER')}
                            className={`flex items-center space-x-2 text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer ${
                                currentPage === 'DRUG_VISUALIZER'
                                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-[0_0_15px_rgba(20,184,166,0.2)]'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5" />
                            </svg>
                            <span className="hidden sm:inline">3D Twin Lab</span>
                        </button>

                        <button
                            onClick={() => navigateTo('DASHBOARD')}
                            className={`flex items-center space-x-2 text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer ${
                                currentPage === 'DASHBOARD'
                                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-[0_0_15px_rgba(20,184,166,0.2)]'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            <span className="hidden sm:inline">Executive Hub</span>
                        </button>

                        <div className="h-5 w-px bg-white/10 hidden md:block"></div>
                        <ThemeToggleButton />
                        <ProfileMenu />
                    </div>
                </div>
            </header>

            {/* Scientific Validation Banner */}
            <div className="fixed top-[58px] sm:top-[62px] left-0 right-0 z-30 bg-black/40 border-b border-teal-500/20 backdrop-blur-md py-1.5 px-4 text-center">
                <p className="text-[10px] sm:text-[11px] font-medium text-teal-300/90 tracking-wide flex items-center justify-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse flex-shrink-0"></span>
                    <span className="font-bold text-white uppercase tracking-wider text-[9px] bg-teal-500/20 px-1.5 py-0.5 rounded border border-teal-500/30 flex-shrink-0">In-Silico Environment</span>
                    <span className="hidden sm:inline">Computational prediction for candidate screening. Empirical validation in wet-lab assays & clinical trials is required.</span>
                    <span className="sm:hidden truncate">Computational candidate screening. Wet-lab validation required.</span>
                </p>
            </div>

            <main className="relative container mx-auto p-3 sm:p-4 pt-24 sm:pt-28 md:p-6 md:pt-32 pb-24 md:pb-6 z-10 max-w-7xl">
                {children}
            </main>

            {/* Mobile Bottom Navigation Bar (Only for phones < md) */}
            <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#070d19]/95 backdrop-blur-2xl border-t border-white/10 px-6 py-2 flex items-center justify-around shadow-[0_-10px_30px_rgba(0,0,0,0.7)] md:hidden pb-safe">
                <button
                    onClick={() => navigateTo('DRUG_VISUALIZER')}
                    className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
                        currentPage === 'DRUG_VISUALIZER'
                            ? 'text-teal-300 font-bold scale-105'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <span className="text-lg">🧬</span>
                    <span className="text-[10px] tracking-wide">3D Twin</span>
                </button>

                <button
                    onClick={() => navigateTo('DASHBOARD')}
                    className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all cursor-pointer ${
                        currentPage === 'DASHBOARD'
                            ? 'text-teal-300 font-bold scale-105'
                            : 'text-gray-400 hover:text-white'
                    }`}
                >
                    <span className="text-lg">📊</span>
                    <span className="text-[10px] tracking-wide">Executive</span>
                </button>

                <button
                    onClick={() => openGuide('overview')}
                    className="flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl text-teal-400 transition-all active:scale-95 cursor-pointer"
                >
                    <span className="text-lg">💡</span>
                    <span className="text-[10px] tracking-wide font-bold">Guide</span>
                </button>
            </nav>

            {/* AI Research Assistant Chatbot Button */}
            {user && currentPage !== 'EDIT_PROFILE' && (
                <>
                    <button
                        onClick={() => setIsChatOpen(prev => !prev)}
                        className="fixed bottom-20 right-4 md:bottom-8 md:right-8 group z-[100] flex items-center gap-3 cursor-pointer"
                        aria-label="Open AI Research Assistant"
                    >
                        <div className="hidden md:flex items-center gap-2 bg-[#0a0f1d]/90 backdrop-blur-md border border-teal-500/30 text-teal-300 px-3.5 py-2 rounded-full shadow-xl text-xs font-bold tracking-wide opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                            AI Research Assistant
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-teal-400 rounded-2xl blur-md opacity-40 group-hover:opacity-80 animate-pulse"></div>
                            <div className="relative bg-gradient-to-tr from-teal-600 via-cyan-600 to-blue-600 text-white p-3 md:p-4 rounded-2xl shadow-2xl hover:shadow-teal-500/50 transform hover:scale-105 transition-all duration-300 ring-1 ring-white/30">
                                {ICONS.chatbot}
                            </div>
                        </div>
                    </button>

                    <Chatbot
                        isOpen={isChatOpen}
                        onClose={() => setIsChatOpen(false)}
                        user={user}
                        contextData={{ dailyLog }}
                        language={language}
                        setLanguage={setLanguage}
                        mode="dashboard"
                    />
                </>
            )}

            {/* Global BioTwin System Understanding & Architecture Modal */}
            <SystemUnderstandingModal />
        </div>
    );
};

export default Layout;
