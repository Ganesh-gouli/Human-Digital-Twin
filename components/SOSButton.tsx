import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { ICONS } from '../constants';
import { TRANSLATIONS } from './constants/translations';

const SOSButton: React.FC = () => {
    const { user, language } = useAppContext();
    const t = TRANSLATIONS[language] || TRANSLATIONS['English'];
    const [isConfirming, setIsConfirming] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Using simple keys as fallback for translations since we don't have them yet.
    const alertMessage = "This is an automated emergency alert from Healthcare Hub.";
    const userMessage = `User: ${user?.name || 'Unknown'} may require immediate medical assistance.`;

    const handleSOSClick = () => {
        setIsConfirming(true);
    };

    const cancelSOS = () => {
        setIsConfirming(false);
    };

    const executeSOS = async (method: 'sms' | 'whatsapp' | 'email') => {
        setIsProcessing(true);
        let locationText = "Location: Unable to fetch location.";

        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
            });
            const { latitude, longitude } = position.coords;
            locationText = `Current Location: https://www.google.com/maps?q=${latitude},${longitude}`;
        } catch (error) {
            console.warn("Geolocation failed or was denied:", error);
        }

        const fullMessage = `${alertMessage}\n${userMessage}\n${locationText}\nPlease respond urgently.`;
        const encodedMessage = encodeURIComponent(fullMessage);
        const contactNumber = user?.emergencyContact || ''; // Assuming the user has set this

        let href = '';

        if (method === 'sms') {
            // Basic format. iOS and Android have different syntax sometimes, but this works generally
            href = `sms:${contactNumber}?body=${encodedMessage}`;
        } else if (method === 'whatsapp') {
            href = `https://wa.me/${contactNumber}?text=${encodedMessage}`;
        } else if (method === 'email') {
            const emailContact = contactNumber.includes('@') ? contactNumber : '';
            href = `mailto:${emailContact}?subject=EMERGENCY ALERT: ${user?.name}&body=${encodedMessage}`;
        }

        if (href) {
            window.open(href, '_blank');
        } else {
            alert('No emergency contact number configured. Please update your profile.');
        }

        setIsProcessing(false);
        setIsConfirming(false);
    };

    return (
        <div className="fixed bottom-6 left-4 md:bottom-8 md:left-8 z-[100]">
            <button
                onClick={handleSOSClick}
                className="flex items-center justify-center p-3 md:p-4 rounded-full bg-white dark:bg-gray-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 animate-pulse-slow shadow-2xl hover:shadow-red-500/50 border border-red-200 dark:border-red-900/50 group transform hover:scale-110"
                aria-label="SOS Emergency"
                title="SOS Emergency Alert"
            >
                <div className="relative flex items-center justify-center">
                    {/* Optional ping effect */}
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-30 group-hover:animate-ping"></span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 drop-shadow-md transition-transform"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M12 8v4" /><path d="M12 16h.01" /></svg>
                </div>
            </button>

            {isConfirming && (
                <>
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center" onClick={cancelSOS}></div>
                    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl p-6 z-50 w-[90%] max-w-sm border border-red-500/30 animate-in fade-in zoom-in duration-200">
                        <div className="text-center mb-6">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-4 animate-bounce">
                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 dark:text-red-400"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-4">Emergency SOS</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Choose a method to securely send your alert and location.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={() => executeSOS('whatsapp')}
                                disabled={isProcessing}
                                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition-colors shadow-md disabled:opacity-50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                                <span>WhatsApp</span>
                            </button>

                            <button
                                onClick={() => executeSOS('sms')}
                                disabled={isProcessing}
                                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors shadow-md disabled:opacity-50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                <span>SMS</span>
                            </button>

                            <button
                                onClick={() => executeSOS('email')}
                                disabled={isProcessing}
                                className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-bold transition-colors border border-gray-200 dark:border-gray-700 shadow-sm disabled:opacity-50"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
                                <span>Email</span>
                            </button>
                        </div>

                        <button
                            onClick={cancelSOS}
                            className="mt-6 w-full py-2 px-4 rounded-xl text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-semibold transition-colors uppercase tracking-wider text-xs"
                        >
                            Cancel
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default SOSButton;
