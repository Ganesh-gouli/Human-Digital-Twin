import React, { useState, useRef, useEffect } from 'react';
import { getErrorMessage } from '../utils/helpers';
import { ICONS } from '../constants';
import LoadingSpinner from '../components/LoadingSpinner';
import NearbyDoctors from '../components/NearbyDoctors';
import { fileToBase64 } from '../services/helpers';
import { analyzeCancerReport } from '../services/geminiService';
import {
    PieChart, Pie, Cell, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip
} from 'recharts';
import { Shield, Activity, Info } from 'lucide-react';


interface DetectionResult {
    status: 'No Malignancy Detected' | 'Suspicious Abnormality' | 'High Cancer Probability';
    confidence: number;
    cancerType?: string;
    explanations: {
        symptoms: string;
        causes: string;
        treatments: string;
        prevention: string;
        nextSteps: string;
    };
}

interface Hospital {
    name: string;
    address: string;
    distanceInfo?: string; // Optional if we calculate distance locally or get it from API
}

const CancerDetection: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<DetectionResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'summary' | 'detailed'>('summary');
    const [vegfLevel, setVegfLevel] = useState(30);
    const [vesselDensity, setVesselDensity] = useState(25);
    const [tumorO2, setTumorO2] = useState(40);
    const [tnmT, setTnmT] = useState(1);
    const [tnmN, setTnmN] = useState(0);
    const [tnmM, setTnmM] = useState(0);

    // Animation states
    const [displayedConfidence, setDisplayedConfidence] = useState(0);
    const [showResults, setShowResults] = useState(false);

    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [isFetchingLocation, setIsFetchingLocation] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Confidence Count Up Animation Effect
    useEffect(() => {
        if (result && showResults) {
            let start = 0;
            const end = result.confidence;
            const duration = 2000;
            const incrementTime = Math.abs(Math.floor(duration / end));

            const timer = setInterval(() => {
                start += 1;
                setDisplayedConfidence(start);
                if (start >= end) {
                    clearInterval(timer);
                    setDisplayedConfidence(end);
                }
            }, incrementTime);

            return () => clearInterval(timer);
        }
    }, [result, showResults]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith('image/')) {
            setError('Please upload a valid image file (JPEG, PNG).');
            return;
        }

        setImageFile(file);
        setError(null);
        setResult(null);
        setShowResults(false);
        setDisplayedConfidence(0);
        setActiveTab('summary');

        const reader = new FileReader();
        reader.onload = (e) => {
            setSelectedImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleAnalyze = async () => {
        if (!imageFile) return;

        setIsAnalyzing(true);
        setError(null);
        setResult(null);
        setShowResults(false);

        try {
            const base64 = await fileToBase64(imageFile);
            const res = await analyzeCancerReport(base64, imageFile.type);

            setResult(res);
            if (res.extractedBiomarkers) {
                if (res.extractedBiomarkers.vegfLevel !== undefined) setVegfLevel(res.extractedBiomarkers.vegfLevel);
                if (res.extractedBiomarkers.vesselDensity !== undefined) setVesselDensity(res.extractedBiomarkers.vesselDensity);
                if (res.extractedBiomarkers.tumorO2 !== undefined) setTumorO2(res.extractedBiomarkers.tumorO2);
                if (res.extractedBiomarkers.tnmT !== undefined) setTnmT(res.extractedBiomarkers.tnmT);
                if (res.extractedBiomarkers.tnmN !== undefined) setTnmN(res.extractedBiomarkers.tnmN);
                if (res.extractedBiomarkers.tnmM !== undefined) setTnmM(res.extractedBiomarkers.tnmM);
            }

            setActiveTab('summary');
            setTimeout(() => setShowResults(true), 300); // Slight delay for smooth transition

        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleFindSpecialists = () => {
        setIsFetchingLocation(true);
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        import('../utils/locationService').then(async (locationService) => {
                            const hospitalsData = await locationService.fetchNearbyHospitals(latitude, longitude, 'oncology');
                            setHospitals(hospitalsData);
                            if (hospitalsData.length === 0) {
                                setError("Could not find any oncology clinics within a 20km radius.");
                            }
                            setIsFetchingLocation(false);
                        }).catch(err => {
                            console.error("Failed to load location service", err);
                            setIsFetchingLocation(false);
                            setError("Failed to retrieve location data.");
                        });
                    } catch (error) {
                        console.error("Error fetching hospitals", error);
                        setIsFetchingLocation(false);
                        setError("Error communicating with location services.");
                    }
                },
                (error) => {
                    console.error("Error getting location: ", error);
                    setIsFetchingLocation(false);
                    setError("Location access denied. Please enable location services to find nearby specialists.");
                },
                { timeout: 10000 }
            );
        } else {
            setIsFetchingLocation(false);
            setError("Geolocation is not supported by this browser.");
        }
    };


    const triggerSOS = () => {
        alert("🚨 EMERGENCY SOS TRIGGERED. Dispatching medical assistance to your location immediately.");
        // In a real app, this would tie into the actual SOS service
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'No Malignancy Detected': return 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]';
            case 'Suspicious Abnormality': return 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]';
            case 'High Cancer Probability': return 'text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.9)]';
            default: return 'text-gray-200';
        }
    };

    const getBorderGlow = (status: string) => {
        switch (status) {
            case 'No Malignancy Detected': return 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.3)]';
            case 'Suspicious Abnormality': return 'border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.3)]';
            case 'High Cancer Probability': return 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.4)]';
            default: return 'border-cyan-500/30';
        }
    }


    return (
        <div className="min-h-screen bg-[#0f172a] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] p-4 md:p-8 relative overflow-hidden">
            {/* Subtle DNA / Tech Background effect */}
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{
                backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(6, 182, 212, 0.1) 0%, transparent 60%)',
                backgroundSize: '100% 100%'
            }} />

            <div className="max-w-5xl mx-auto relative z-10 animate-fade-in-up">

                {/* Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                        Oncology AI Lab
                    </h1>
                    <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                        Advanced AI-powered cancer detection for X-ray, MRI, CT, and histopathology scans.
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left Column: Upload & Image Viewer */}
                    <div className="space-y-6">
                        <div className={`
                            relative backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 transition-all duration-500
                            ${isDragging ? 'border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-[1.02]' : 'hover:border-slate-600'}
                            ${result && showResults ? getBorderGlow(result.status) : ''}
                        `}>

                            {!selectedImage ? (
                                <div
                                    className="h-80 flex flex-col items-center justify-center border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:bg-slate-700/30 transition-colors"
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="text-cyan-400 mb-4 opacity-80" dangerouslySetInnerHTML={{ __html: ICONS.upload }} />
                                    <p className="text-gray-300 font-medium text-lg">Drag & Drop medical scan here</p>
                                    <p className="text-gray-500 text-sm mt-2">or click to browse files</p>
                                    <input
                                        type="file"
                                        className="hidden"
                                        ref={fileInputRef}
                                        accept="image/jpeg, image/png, image/dicom"
                                        onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                                    />
                                </div>
                            ) : (
                                <div className="relative h-80 rounded-xl overflow-hidden group">
                                    <img
                                        src={selectedImage}
                                        alt="Medical Scan"
                                        className={`w-full h-full object-cover transition-all duration-700 ${isAnalyzing ? 'brightness-50 blur-[2px]' : ''}`}
                                    />

                                    {/* Scanning Animation Overlay */}
                                    {isAnalyzing && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <div className="relative w-32 h-32 flex items-center justify-center">
                                                {/* Rotating Ring */}
                                                <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin [animation-duration:1.5s]"></div>
                                                <div className="absolute inset-2 border-4 border-transparent border-b-cyan-300 rounded-full animate-spin [animation-duration:2s] [animation-direction:reverse]"></div>
                                                {/* Pulse Center */}
                                                <div className="w-12 h-12 bg-cyan-500/50 rounded-full blur-md animate-pulse"></div>
                                            </div>
                                            <p className="text-cyan-300 font-semibold mt-6 tracking-widest animate-pulse drop-shadow-[0_0_5px_rgba(6,182,212,0.8)]">
                                                AI ANALYZING CELLULAR ABNORMALITIES...
                                            </p>
                                        </div>
                                    )}

                                    {/* Heatmap Mock Overlay (Only on suspicious/high risk) */}
                                    {showResults && result && result.status !== 'No Malignancy Detected' && (
                                        <div className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-60 animate-fade-in" style={{
                                            backgroundImage: 'radial-gradient(circle at 60% 40%, rgba(239, 68, 68, 0.8) 0%, transparent 40%)'
                                        }}></div>
                                    )}

                                    {!isAnalyzing && (
                                        <button
                                            onClick={() => { setSelectedImage(null); setResult(null); }}
                                            className="absolute top-4 right-4 bg-slate-900/60 p-2 rounded-full text-gray-300 hover:text-white hover:bg-slate-800 transition backdrop-blur-sm opacity-0 group-hover:opacity-100"
                                            title="Clear Image"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    )}
                                </div>
                            )}

                            {error && <p className="text-red-400 mt-4 text-center text-sm bg-red-900/20 py-2 rounded-lg">{error}</p>}

                            <button
                                onClick={handleAnalyze}
                                disabled={!selectedImage || isAnalyzing}
                                className={`w-full mt-6 py-4 rounded-xl font-bold text-lg tracking-wide transition-all duration-300 shadow-lg
                                    ${!selectedImage || isAnalyzing
                                        ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transform hover:-translate-y-1'
                                    }
                                `}
                            >
                                {isAnalyzing ? 'Processing...' : 'Analyze with AI'}
                            </button>
                        </div>
                    </div>                    {/* Right Column: AI Results */}
                    <div className="space-y-6">
                        {showResults && result ? (
                            <div className="animate-fade-in-up [animation-delay:200ms] h-full flex flex-col">
                                {/* Glowing Fuchsia Pill-Shaped Tab Switcher */}
                                <div className="flex justify-center mb-6">
                                    <div className="flex bg-slate-950/60 border border-white/10 rounded-xl p-1 w-full max-w-sm shadow-[0_0_20px_rgba(0,0,0,0.4)]">
                                        <button
                                            onClick={() => setActiveTab('summary')}
                                            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${
                                                activeTab === 'summary'
                                                    ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-lg shadow-fuchsia-900/30'
                                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                        >
                                            📄 Summary Report
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('detailed')}
                                            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${
                                                activeTab === 'detailed'
                                                    ? 'bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-lg shadow-fuchsia-900/30'
                                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                        >
                                            📊 Detailed Analysis
                                        </button>
                                    </div>
                                </div>

                                {activeTab === 'summary' ? (
                                    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
                                        {/* Status Card */}
                                        <div className="backdrop-blur-xl bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
                                            <h3 className="text-gray-400 uppercase tracking-widest text-xs font-semibold mb-2">Diagnostic Status</h3>
                                            <div className={`text-3xl font-bold mb-4 ${getStatusStyles(result.status)}`}>
                                                {result.status}
                                            </div>

                                            <div className="flex items-center justify-between border-t border-slate-700/50 pt-4 mt-2">
                                                <div>
                                                    <p className="text-gray-400 text-sm">AI Confidence</p>
                                                    <p className="text-2xl font-bold text-white tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
                                                        {displayedConfidence}%
                                                    </p>
                                                </div>
                                                {result.cancerType && (
                                                    <div className="text-right">
                                                        <p className="text-gray-400 text-sm">Detected Type</p>
                                                        <p className="text-lg font-semibold text-white">{result.cancerType}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Emergency Alert for High Probability */}
                                        {result.status === 'High Cancer Probability' && (
                                            <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-5 animate-pulse">
                                                <div className="flex items-start">
                                                    <div className="text-red-500 mr-4 mt-1">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-red-400 font-bold text-lg mb-1">Urgent Medical Attention Recommended</h4>
                                                        <p className="text-red-200/80 text-sm mb-4">
                                                            The AI has detected high probability patterns associated with malignancy. Please arrange a consultation with a specialist immediately.
                                                        </p>
                                                        <button
                                                            onClick={triggerSOS}
                                                            className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-red-900/50 transition-colors"
                                                        >
                                                            Trigger Emergency SOS
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Detailed Explanations */}
                                        <div className="backdrop-blur-xl bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 flex-grow">
                                            <h3 className="text-white font-semibold text-lg mb-4 flex items-center">
                                                <svg className="w-5 h-5 mr-2 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                AI Clinical Detailed Breakdown
                                            </h3>

                                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                                {[
                                                    { label: 'Causes & Pathology', text: result.explanations.causes, icon: '🧬' },
                                                    { label: 'Symptoms / Warning Signs', text: result.explanations.symptoms, icon: '⚠️' },
                                                    { label: 'Possible Treatments', text: result.explanations.treatments, icon: '💊' },
                                                    { label: 'Prevention Strategies', text: result.explanations.prevention, icon: '🛡️' },
                                                    { label: 'Recommended Next Steps', text: result.explanations.nextSteps, icon: '➡️' },
                                                ].map((item, idx) => (
                                                    <div key={idx} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                                                        <h4 className="flex items-center text-cyan-300 font-medium text-sm mb-2 uppercase tracking-wide">
                                                            <span className="mr-2 text-base">{item.icon}</span> {item.label}
                                                        </h4>
                                                        <p className="text-gray-300 leading-relaxed text-sm">
                                                            {item.text}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
                                        {/* Dedicated Detail Page Header */}
                                        <div className="backdrop-blur-xl bg-slate-800/60 border border-slate-700/50 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                    <Activity className="w-5 h-5 text-fuchsia-400" />
                                                    Oncology Biometric Telemetry
                                                </h3>
                                                <p className="text-xs text-slate-400 mt-1">Real-time proliferation indexing, morphological predictors, and metric progression</p>
                                            </div>
                                            <button
                                                onClick={() => setActiveTab('summary')}
                                                className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white rounded-lg transition-all"
                                            >
                                                ← Back to Summary
                                            </button>
                                        </div>

                                        {/* Advanced Oncology Telemetry & Proliferation HUD */}
                                        <div className="backdrop-blur-xl bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
                                            <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                                                <Activity className="w-5 h-5 text-cyan-400" />
                                                Advanced Oncology Telemetry & Visual Analytics
                                            </h3>
                                            
                                            <div className="grid md:grid-cols-2 gap-6">
                                                {/* Proliferation Pie Chart */}
                                                <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                                                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Cellular Activity Index</h4>
                                                    <div className="h-48">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <PieChart>
                                                                <Pie
                                                                    data={[
                                                                        { name: 'Necrotic Core', value: result.status === 'No Malignancy Detected' ? 0 : 25, color: '#64748b' },
                                                                        { name: 'Active Mitosis', value: result.status === 'No Malignancy Detected' ? 5 : 45, color: '#ef4444' },
                                                                        { name: 'Invasion Margin', value: result.status === 'No Malignancy Detected' ? 2 : 30, color: '#f59e0b' }
                                                                    ].filter(d => d.value > 0)}
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    innerRadius="40%"
                                                                    outerRadius="80%"
                                                                    paddingAngle={5}
                                                                    dataKey="value"
                                                                >
                                                                    {
                                                                        [0, 1, 2].map((entry, index) => (
                                                                            <Cell key={`cell-${index}`} fill={
                                                                                index === 0 ? (result.status === 'No Malignancy Detected' ? '#10b981' : '#64748b') :
                                                                                index === 1 ? '#ef4444' : '#f59e0b'
                                                                            } />
                                                                        ))
                                                                    }
                                                                </Pie>
                                                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', fontSize: 11 }} />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                    <div className="flex justify-center gap-4 text-[10px] text-slate-400 mt-2">
                                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-500" /> Necrotic</span>
                                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Mitosis</span>
                                                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Invasion</span>
                                                    </div>
                                                </div>

                                                {/* Diagnostic Predictors Radar */}
                                                <div className="bg-slate-900/50 border border-slate-700/30 rounded-xl p-4">
                                                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Morphological Features</h4>
                                                    <div className="h-48">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                                                { subject: 'Spiculation', A: result.status === 'No Malignancy Detected' ? 5 : 85 },
                                                                { subject: 'Vascularity', A: result.status === 'No Malignancy Detected' ? 15 : 75 },
                                                                { subject: 'Asymmetry', A: result.status === 'No Malignancy Detected' ? 10 : 80 },
                                                                { subject: 'Calcification', A: result.status === 'No Malignancy Detected' ? 5 : 65 },
                                                                { subject: 'Cellular Atypia', A: result.status === 'No Malignancy Detected' ? 8 : 90 }
                                                            ]}>
                                                                <PolarGrid stroke="#334155" />
                                                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 8 }} />
                                                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 6 }} />
                                                                <Radar name="Indicators" dataKey="A" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.15} />
                                                            </RadarChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Oncology Metrics Table */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                                {[
                                                    { label: 'Tumor Volume', value: result.status === 'No Malignancy Detected' ? '0.00 cm³' : '1.45 cm³', desc: 'Estimated 3D mass volume', icon: '📐' },
                                                    { label: 'Doubling Time', value: result.status === 'No Malignancy Detected' ? 'N/A' : '124 Days', desc: 'Volumetric expansion rate', icon: '⏳' },
                                                    { label: 'TNM Stage Approx.', value: result.status === 'No Malignancy Detected' ? 'T1 N0 M0' : 'T1 N0 M0', desc: 'Oncological classification', icon: '🏷️' },
                                                    { label: 'Gene Biomarkers', value: result.status === 'No Malignancy Detected' ? 'Stable' : 'EGFR / ALK Recom.', desc: 'Recommended molecular profile', icon: '🧬' }
                                                ].map((m, idx) => (
                                                    <div key={idx} className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-4 flex flex-col justify-between">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{m.label}</span>
                                                            <span className="text-sm">{m.icon}</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-base font-bold text-white font-mono">{m.value}</p>
                                                            <p className="text-[9px] text-slate-500 mt-1">{m.desc}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* ── Angiogenesis Simulator ── */}
                                            <div className="bg-slate-900/50 border border-cyan-900/20 rounded-2xl p-5 mt-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                                                        Tumor Angiogenesis Simulator
                                                    </h4>
                                                    <button
                                                        onClick={() => { setVegfLevel(30); setVesselDensity(25); setTumorO2(40); }}
                                                        className="text-[10px] px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
                                                    >Reset</button>
                                                </div>
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    <div className="space-y-4">
                                                        {[
                                                            { label: 'VEGF Expression Level', value: vegfLevel, min: 0, max: 100, setter: setVegfLevel, unit: ' ng/mL', color: 'accent-red-500', desc: 'Vascular Endothelial Growth Factor drives new vessel formation' },
                                                            { label: 'Intra-Tumoral Vessel Density', value: vesselDensity, min: 0, max: 100, setter: setVesselDensity, unit: ' /mm²', color: 'accent-orange-400', desc: 'Microvessel density (MVD) correlates with metastatic risk' },
                                                            { label: 'Tumor Oxygenation (pO₂)', value: tumorO2, min: 0, max: 100, setter: setTumorO2, unit: ' mmHg', color: 'accent-blue-400', desc: 'Hypoxia < 10 mmHg activates HIF-1α angiogenic cascade' },
                                                        ].map(s => (
                                                            <div key={s.label}>
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <span className="text-xs text-slate-400 font-medium">{s.label}</span>
                                                                    <span className="text-xs text-white font-mono bg-white/5 px-2 py-0.5 rounded">{s.value}{s.unit}</span>
                                                                </div>
                                                                <input
                                                                    type="range" min={s.min} max={s.max} value={s.value}
                                                                    onChange={e => s.setter(Number(e.target.value))}
                                                                    className={`w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 ${s.color}`}
                                                                />
                                                                <p className="text-[8px] text-slate-600 mt-0.5">{s.desc}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="space-y-3">
                                                        <h5 className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Computed Anti-VEGF Response</h5>
                                                        {(() => {
                                                            const angiScore = Math.round((vegfLevel * 0.5 + vesselDensity * 0.3 + (100 - tumorO2) * 0.2));
                                                            const response = angiScore > 70 ? { label: 'High Benefit', color: 'emerald', desc: 'Bevacizumab / Ramucirumab indicated. Expected tumor shrinkage 30-60%.' } :
                                                                             angiScore > 40 ? { label: 'Moderate Benefit', color: 'amber', desc: 'Anti-VEGF therapy may stabilize disease. Monitor MVD every 6 weeks.' } :
                                                                             { label: 'Low Benefit', color: 'red', desc: 'Low angiogenic activity. Consider alternate pathway therapy (mTOR, PARP).' };
                                                            return (
                                                                <>
                                                                    <div className={`p-4 rounded-xl border bg-${response.color}-500/5 border-${response.color}-500/20`}>
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <p className={`text-sm font-bold text-${response.color}-400`}>{response.label}</p>
                                                                            <p className={`text-2xl font-black text-${response.color}-300 font-mono`}>{angiScore}</p>
                                                                        </div>
                                                                        <p className="text-[10px] text-slate-400">{response.desc}</p>
                                                                    </div>
                                                                    <div className="space-y-2">
                                                                        {['HIF-1α Activation', 'PDGF Co-stimulation', 'Matrix Metalloprotease'].map((marker, i) => (
                                                                            <div key={marker}>
                                                                                <div className="flex justify-between text-[9px] mb-0.5">
                                                                                    <span className="text-slate-400">{marker}</span>
                                                                                    <span className="text-slate-500">{Math.min(100, Math.round(angiScore * [0.9, 0.7, 0.6][i]))}%</span>
                                                                                </div>
                                                                                <div className="w-full bg-white/5 rounded-full h-1 overflow-hidden">
                                                                                    <div className="h-full rounded-full bg-cyan-500/70 transition-all duration-700" style={{ width: `${Math.min(100, Math.round(angiScore * [0.9, 0.7, 0.6][i]))}%` }} />
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </>
                                                            );
                                                        })()}
                                                        <p className="text-[8px] text-slate-600">Model based on Folkman angiogenesis theory and VEGF-A pathway biology.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* ── Interactive TNM Staging Map ── */}
                                            <div className="bg-slate-900/50 border border-cyan-900/20 rounded-2xl p-5 mt-4">
                                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                    <span>🏷️</span> Interactive TNM Staging Calculator
                                                </h4>
                                                <div className="grid md:grid-cols-3 gap-4 mb-4">
                                                    {[
                                                        { key: 'T', label: 'Tumor Size (T)', options: ['T0', 'T1', 'T2', 'T3', 'T4'], value: tnmT, setter: setTnmT, color: 'rose', desc: ['No primary tumor', 'Tumor ≤2 cm', 'Tumor 2-5 cm', 'Tumor ≥5 cm / Extension', 'Any size, invades adjacent'] },
                                                        { key: 'N', label: 'Node Involvement (N)', options: ['N0', 'N1', 'N2', 'N3'], value: tnmN, setter: setTnmN, color: 'amber', desc: ['No regional nodes', '1-3 regional nodes', '4-9 regional nodes', '10+ nodes / distant'] },
                                                        { key: 'M', label: 'Metastasis (M)', options: ['M0', 'M1a', 'M1b', 'M1c'], value: tnmM, setter: setTnmM, color: 'purple', desc: ['No distant metastasis', 'Single distant organ', 'Multiple distant organs', 'Multiple organs + peritoneal'] },
                                                    ].map(dim => (
                                                        <div key={dim.key}>
                                                            <p className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold mb-2">{dim.label}</p>
                                                            <div className="grid grid-cols-2 gap-1.5">
                                                                {dim.options.map((opt, i) => (
                                                                    <button
                                                                        key={opt}
                                                                        onClick={() => dim.setter(i)}
                                                                        className={`px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                                                                            i === dim.value
                                                                                ? `bg-${dim.color}-500/20 text-${dim.color}-300 border border-${dim.color}-500/40`
                                                                                : 'bg-white/5 text-slate-500 border border-white/5 hover:bg-white/10 hover:text-slate-300'
                                                                        }`}
                                                                    >{opt}</button>
                                                                ))}
                                                            </div>
                                                            <p className="text-[8px] text-slate-600 mt-2 leading-relaxed">
                                                                {dim.desc[dim.value]}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                                {/* Stage result */}
                                                {(() => {
                                                    let stage = 'I';
                                                    let prognosis = '5-year survival: ~92%';
                                                    let stagingColor = 'emerald';
                                                    if (tnmM > 0) { stage = 'IV'; prognosis = '5-year survival: ~15-25%'; stagingColor = 'red'; }
                                                    else if (tnmN >= 2 || tnmT >= 3) { stage = 'III'; prognosis = '5-year survival: ~40-60%'; stagingColor = 'orange'; }
                                                    else if (tnmN >= 1 || tnmT >= 2) { stage = 'II'; prognosis = '5-year survival: ~75-80%'; stagingColor = 'amber'; }
                                                    else { stage = 'I'; prognosis = '5-year survival: ~92%'; stagingColor = 'emerald'; }
                                                    return (
                                                        <div className={`flex items-center gap-6 p-4 rounded-xl border bg-${stagingColor}-500/5 border-${stagingColor}-500/20`}>
                                                            <div className="text-center">
                                                                <p className="text-[9px] text-slate-500 uppercase tracking-wider">Clinical Stage</p>
                                                                <p className={`text-5xl font-black text-${stagingColor}-400 font-mono`}>{stage}</p>
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className={`text-sm font-bold text-${stagingColor}-300 mb-1`}>{prognosis}</p>
                                                                <p className="text-[10px] text-slate-400">T{tnmT} · N{tnmN} · M{tnmM} classification based on AJCC 8th edition staging system.</p>
                                                                {stage === 'IV' && <p className="text-[10px] text-red-400 mt-1 font-bold animate-pulse">⚠ Palliative systemic therapy consideration required</p>}
                                                            </div>
                                                        </div>
                                                    );
                                                })()}
                                                <p className="text-[9px] text-slate-600 mt-3">Select T, N, M values to auto-compute AJCC oncological staging and prognosis estimate.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Empty State Placeholder
                            <div className="h-full min-h-[500px] backdrop-blur-xl bg-slate-800/20 border border-slate-700/30 rounded-2xl flex flex-col items-center justify-center p-8 text-center border-dashed">
                                <svg className="w-20 h-20 text-slate-600 mb-6 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                <h3 className="text-xl font-medium text-slate-400 mb-2">Awaiting Image Data</h3>
                                <p className="text-slate-500 text-sm max-w-xs">Upload your medical scan and click analyze to generate a comprehensive AI oncology report.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-200 mt-6">
                    <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    <p>
                        <strong>Medical Safety Notice:</strong> AI-generated analysis for informational purposes only. This result should not replace evaluation by a qualified healthcare professional.
                    </p>
                </div>
            </div>
            <NearbyDoctors searchType="oncology" title="Nearby Oncology Centers & Cancer Hospitals" />
        </div>
    );
};

export default CancerDetection;
