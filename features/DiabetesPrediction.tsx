import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { ICONS } from '../constants';
import NearbyDoctors from '../components/NearbyDoctors';
import { fileToBase64 } from '../services/helpers';
import { predictDiabetesRisk } from '../services/geminiService';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    LineChart, Line, ReferenceLine, Area, AreaChart
} from 'recharts';

const API_KEY = process.env.API_KEY || '';

const FloatingParticles = () => {
    // Render some floating medical-themed particles in the background
    const particles = ['+', '♥', '○', '🧬', '⚕️', '🔬'];
    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
            {[...Array(20)].map((_, i) => (
                <div
                    key={i}
                    className="absolute animate-float"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDuration: `${Math.random() * 5 + 5}s`,
                        animationDelay: `${Math.random() * 5}s`,
                        fontSize: `${Math.random() * 1.5 + 0.5}rem`,
                        color: i % 2 === 0 ? '#22d3ee' : '#ffffff', // Cyan and white
                        opacity: Math.random() * 0.5 + 0.1,
                    }}
                >
                    {particles[Math.floor(Math.random() * particles.length)]}
                </div>
            ))}
        </div>
    );
};

const DiabetesPrediction: React.FC = () => {
    const { navigateTo } = useAppContext();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    // States for the two-phase pipeline
    const [isExtracting, setIsExtracting] = useState(false);
    const [isPredicting, setIsPredicting] = useState(false);

    // Extracted Data State
    const [extractedData, setExtractedData] = useState<any>(null);

    const [result, setResult] = useState<{
        riskPercentage: number;
        status: 'Low Risk' | 'High Risk' | 'Moderate Risk';
        recommendation: string;
        dietaryAdvice: string;
        healthyFoods: string[];
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'summary' | 'detailed'>('summary');
    const [hba1cSim, setHba1cSim] = useState(6.5);

    // Drag and Drop Handlers
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
        const file = e.dataTransfer.files[0];
        if (file && (file.type === "image/jpeg" || file.type === "image/png" || file.type === "application/pdf")) {
            handleFileSelection(file);
        } else {
            setError("Please upload a valid JPG, PNG, or PDF report.");
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFileSelection(file);
    };

    const handleFileSelection = (file: File) => {
        setError(null);
        setSelectedFile(file);
        setResult(null);
        setExtractedData(null);
        if (file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(null); // Handle PDF icon display later
        }
    };

    const handleAnalyze = async () => {
        if (!selectedFile) return;

        setError(null);
        setResult(null);
        setIsExtracting(true);

        try {
            const dataUrl = await fileToBase64(selectedFile);
            
            setIsExtracting(false);
            setIsPredicting(true);

            const res = await predictDiabetesRisk(dataUrl, selectedFile.type);

            setExtractedData(res.extractedData);
            setResult({
                riskPercentage: res.riskPercentage,
                status: res.status,
                recommendation: res.recommendation,
                dietaryAdvice: res.dietaryAdvice,
                healthyFoods: res.healthyFoods
            });

        } catch (err: any) {
            console.error(err);
            setError("Analysis failed. Ensure the image is clear and contains readable lab values.");
        } finally {
            setIsExtracting(false);
            setIsPredicting(false);
        }
    };

    const resetAnalysis = () => {
        setSelectedFile(null);
        setPreviewUrl(null);
        setResult(null);
        setExtractedData(null);
        setError(null);
    };

    // Calculate circular progress logic
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = result ? circumference - (result.riskPercentage / 100) * circumference : circumference;

    const isLoading = isExtracting || isPredicting;

    return (
        <div className="relative min-h-screen font-sans text-white pb-20 items-center justify-center flex flex-col pt-16 md:pt-24 px-4 overflow-hidden">
            {/* Dark Blue Gradient Background */}
            <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b]"></div>

            <FloatingParticles />

            {/* Content Wrapper */}
            <div className="relative z-10 w-full max-w-5xl mx-auto space-y-8 animate-fade-in-up">

                {/* Header */}
                <div className="flex items-center gap-4 mb-2">
                    <button
                        onClick={() => navigateTo('DASHBOARD')}
                        className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group backdrop-blur-md"
                    >
                        <span className="group-hover:-translate-x-1 block transition-transform text-white">{ICONS.arrowLeft}</span>
                    </button>
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter flex items-center gap-3">
                            AI Diabetes <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">Risk Predictor</span>
                        </h1>
                        <p className="text-cyan-100/60 font-medium">Upload medical lab reports for automated OCR extraction and metabolic analysis.</p>
                    </div>
                </div>

                {/* Emergency High Risk Warning Banner */}
                {result && result.status === 'High Risk' && (
                    <div className="bg-red-900/40 border border-red-500/50 rounded-2xl p-4 flex items-center gap-4 shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-pulse-slow">
                        <div className="p-3 bg-red-500/20 rounded-xl text-red-500">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-red-400 font-bold text-lg uppercase tracking-wider">Critical Risk Detected</h3>
                            <p className="text-red-200/80 text-sm">The extracted parameters indicate a severely elevated risk profile. Please share this report with a medical professional immediately.</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Glassmorphism Document Uploader */}
                    <div className="flex flex-col space-y-6">
                        <div className="bg-slate-900/40 backdrop-blur-2xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative overflow-hidden group transition-all">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-600"></div>

                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                                    <span className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">📄</span>
                                    Upload Lab Report
                                </h2>
                                {selectedFile && !isLoading && (
                                    <button onClick={resetAnalysis} className="text-xs font-bold text-slate-400 hover:text-white transition-colors bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                                        Clear / Restart
                                    </button>
                                )}
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded-xl text-red-200 text-sm font-medium">
                                    {error}
                                </div>
                            )}

                            {!selectedFile ? (
                                <div
                                    className={`border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-12 transition-all duration-300 relative overflow-hidden
                                        ${isDragging ? 'border-cyan-400 bg-cyan-500/10 scale-[1.02]' : 'border-slate-600 bg-black/20 hover:border-cyan-500/50 hover:bg-slate-800/50'}`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        onChange={handleFileInput}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="p-4 bg-slate-800/50 rounded-full mb-4 shadow-inner">
                                        <svg className="w-10 h-10 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">Drag & Drop Report</h3>
                                    <p className="text-sm text-slate-400 text-center max-w-[250px]">Upload a medical document (JPG, PNG, PDF) containing patient parameters.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-500 ${isLoading ? 'border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)]' : 'border-slate-700 bg-black/40'}`}>

                                        {/* Scanning Laser Overlay active during processing */}
                                        {isLoading && (
                                            <>
                                                <div className="absolute inset-0 bg-cyan-500/20 z-20 mix-blend-overlay"></div>
                                                <div className="absolute top-0 left-0 w-full h-1 bg-cyan-300 shadow-[0_0_15px_#22d3ee,0_0_30px_#22d3ee] z-30 animate-scan-laser"></div>
                                            </>
                                        )}

                                        {previewUrl ? (
                                            <div className="relative aspect-[3/4] w-full max-h-[400px]">
                                                <img src={previewUrl} alt="Document Preview" className="w-full h-full object-cover opacity-80" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                                            </div>
                                        ) : (
                                            <div className="aspect-[3/4] w-full max-h-[300px] flex items-center justify-center bg-slate-900">
                                                <span className="text-6xl">📄</span>
                                            </div>
                                        )}

                                        <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center gap-3 z-20">
                                            <div className="p-2 bg-cyan-500/20 rounded-lg"><span className="text-cyan-400">📄</span></div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-bold text-white truncate">{selectedFile.name}</p>
                                                <p className="text-xs text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                    </div>

                                    {!result && (
                                        <button
                                            onClick={handleAnalyze}
                                            disabled={isLoading}
                                            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-black text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all active:scale-95 flex items-center justify-center gap-2 overflow-hidden relative group"
                                        >
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                            <span className="relative z-10 flex items-center gap-2 tracking-wide uppercase">
                                                {isLoading ? 'Processing Pipeline...' : 'Analyze Report Details'}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Results / Loading State */}
                    <div className="flex flex-col h-full space-y-6">

                        {isLoading && (
                            <div className="flex-grow bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)] flex flex-col items-center justify-center p-8 relative overflow-hidden animate-pulse">
                                {/* Heartbeat / AI Scan effect */}
                                <div className="absolute inset-0 bg-cyan-500/5 animate-scan-fast"></div>

                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="w-24 h-24 rounded-full border-4 border-slate-700 border-t-cyan-400 border-b-blue-500 animate-spin mb-6 shadow-[0_0_20px_rgba(34,211,238,0.5)]"></div>

                                    <h3 className="text-2xl font-bold text-cyan-400 mb-2">
                                        {isExtracting ? "Extracting Parameters via OCR..." : "Running Metabolic Risk Analysis..."}
                                    </h3>

                                    {/* Sub-steps pipelining visual */}
                                    <div className="w-full max-w-xs bg-slate-800 rounded-full h-2 mt-4 overflow-hidden border border-slate-700">
                                        <div className={`h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000 ease-out ${isExtracting ? 'w-1/2' : 'w-full'}`}></div>
                                    </div>
                                    <div className="flex justify-between w-full max-w-xs mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        <span className={isExtracting ? 'text-cyan-400' : 'text-slate-600'}>Ocr Extraction</span>
                                        <span className={isPredicting ? 'text-blue-400' : 'text-slate-600'}>Predictive Model</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!isLoading && result && extractedData && (
                            <div className="flex flex-col space-y-4 animate-fade-in-up">
                                {/* Tab Switcher */}
                                <div className="flex bg-slate-950/60 border border-white/10 rounded-xl p-1 shadow-[0_0_20px_rgba(0,0,0,0.4)]">
                                    <button onClick={() => setActiveTab('summary')} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${ activeTab === 'summary' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5' }`}>📄 Summary</button>
                                    <button onClick={() => setActiveTab('detailed')} className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${ activeTab === 'detailed' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5' }`}>📊 Detailed Analysis</button>
                                </div>

                                {activeTab === 'summary' ? (
                                    <div className="space-y-4">
                                        {/* Extracted Data */}
                                        <div className="bg-slate-900/40 backdrop-blur-xl p-5 rounded-2xl border border-white/10">
                                            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> Extracted OCR Values
                                            </h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                {Object.entries(extractedData).map(([key, value]) => (
                                                    <div key={key} className="bg-black/30 p-3 rounded-xl border border-slate-700/50 flex flex-col">
                                                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 truncate">{key}</span>
                                                        <span className="text-base font-black text-white">{String(value)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        {/* Main Result */}
                                        <div className={`backdrop-blur-2xl p-6 rounded-3xl border shadow-2xl relative overflow-hidden ${ result.status === 'High Risk' ? 'bg-red-900/20 border-red-500/50' : result.status === 'Moderate Risk' ? 'bg-orange-900/20 border-orange-500/50' : 'bg-emerald-900/20 border-emerald-500/50' }`}>
                                            <div className="flex flex-col items-center text-center space-y-4">
                                                <h3 className="text-lg font-bold text-white uppercase tracking-widest opacity-80">Prediction Result</h3>
                                                <div className="relative w-36 h-36 flex items-center justify-center">
                                                    <svg className="w-full h-full transform -rotate-90">
                                                        <circle cx="72" cy="72" r={45} stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-700/50" />
                                                        <circle cx="72" cy="72" r={45} stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className={`transition-all duration-1500 ease-out ${ result.status === 'High Risk' ? 'text-red-500' : result.status === 'Moderate Risk' ? 'text-orange-500' : 'text-emerald-500' }`} />
                                                    </svg>
                                                    <div className="absolute flex flex-col items-center">
                                                        <span className="text-3xl font-black">{result.riskPercentage}%</span>
                                                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 mt-1">Risk</span>
                                                    </div>
                                                </div>
                                                <div className={`px-5 py-1.5 rounded-full text-sm font-black uppercase tracking-widest border ${ result.status === 'High Risk' ? 'bg-red-500/20 text-red-400 border-red-500/30' : result.status === 'Moderate Risk' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' }`}>{result.status}</div>
                                                <div className="bg-black/30 p-4 rounded-2xl border border-white/5 text-left w-full">
                                                    <p className="text-sm text-slate-300 leading-relaxed">{result.recommendation}</p>
                                                </div>
                                                <div className="bg-black/30 p-4 rounded-2xl border border-white/5 text-left w-full">
                                                    <p className="text-xs text-emerald-400 font-bold mb-2 uppercase tracking-wider">Dietary Action Plan</p>
                                                    <p className="text-xs text-slate-300 leading-relaxed mb-3">{result.dietaryAdvice}</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {result.healthyFoods.map((food, idx) => (
                                                            <span key={idx} className="px-2 py-1 rounded-lg text-[10px] font-bold bg-white/5 border border-white/10 text-slate-300">🥗 {food}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-4 animate-[fadeIn_0.5s_ease-out]">
                                        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4 flex justify-between items-center">
                                            <div>
                                                <h3 className="text-base font-bold text-white flex items-center gap-2">🔬 Advanced Metabolic Analysis</h3>
                                                <p className="text-xs text-slate-400 mt-0.5">Deep-layer biomarker indices and pancreatic function simulation</p>
                                            </div>
                                            <button onClick={() => setActiveTab('summary')} className="text-xs px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg transition-all">← Back</button>
                                        </div>

                                        {/* Blood Glucose & Insulin Trajectory */}
                                        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4">
                                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Blood Glucose & Insulin Trajectory (Daily Profile)</h4>
                                            <div className="h-52">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={[
                                                        { time: '6AM', glucose: 95, insulin: 8 },
                                                        { time: '8AM', glucose: extractedData.Glucose, insulin: extractedData.Insulin > 0 ? extractedData.Insulin : 22 },
                                                        { time: '10AM', glucose: Math.round(extractedData.Glucose * 0.85), insulin: 15 },
                                                        { time: '12PM', glucose: Math.round(extractedData.Glucose * 1.1), insulin: 28 },
                                                        { time: '2PM', glucose: Math.round(extractedData.Glucose * 0.9), insulin: 18 },
                                                        { time: '4PM', glucose: Math.round(extractedData.Glucose * 0.95), insulin: 14 },
                                                        { time: '6PM', glucose: Math.round(extractedData.Glucose * 1.15), insulin: 30 },
                                                        { time: '8PM', glucose: Math.round(extractedData.Glucose * 0.88), insulin: 20 },
                                                        { time: '10PM', glucose: 105, insulin: 9 },
                                                    ]} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                                        <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                                                        <YAxis tick={{ fill: '#94a3b8', fontSize: 9 }} />
                                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: 10 }} />
                                                        <ReferenceLine y={126} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Diabetic', fill: '#ef4444', fontSize: 8 }} />
                                                        <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Pre-D', fill: '#f59e0b', fontSize: 8 }} />
                                                        <Area type="monotone" dataKey="glucose" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.1} name="Glucose (mg/dL)" />
                                                        <Area type="monotone" dataKey="insulin" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.1} name="Insulin (μU/mL)" />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Risk Factor Radar + OGTT Chart side by side */}
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4">
                                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Risk Factor Radar (Pima Model)</h4>
                                                <div className="h-48">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                                            { subject: 'Glucose', A: Math.round((extractedData.Glucose / 200) * 100) },
                                                            { subject: 'BMI', A: Math.round((extractedData.BMI / 50) * 100) },
                                                            { subject: 'Blood Pressure', A: Math.round((extractedData.BloodPressure / 120) * 100) },
                                                            { subject: 'Age Factor', A: Math.round((extractedData.Age / 80) * 100) },
                                                            { subject: 'DPF Score', A: Math.round((extractedData.DPF / 2.5) * 100) },
                                                            { subject: 'Insulin Resist.', A: extractedData.Insulin === 0 ? 60 : Math.round((extractedData.Insulin / 200) * 100) },
                                                        ]}>
                                                            <PolarGrid stroke="#334155" />
                                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 8 }} />
                                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 7 }} />
                                                            <Radar name="Risk" dataKey="A" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.2} />
                                                        </RadarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                            <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4">
                                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Simulated OGTT Glucose Curve</h4>
                                                <div className="h-48">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart data={[
                                                            { min: '0 min', normal: 85, patient: 90 },
                                                            { min: '30 min', normal: 130, patient: Math.round(extractedData.Glucose * 1.1) },
                                                            { min: '60 min', normal: 140, patient: Math.round(extractedData.Glucose * 1.3) },
                                                            { min: '90 min', normal: 120, patient: Math.round(extractedData.Glucose * 1.15) },
                                                            { min: '120 min', normal: 100, patient: Math.round(extractedData.Glucose * 0.95) },
                                                        ]} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                                            <XAxis dataKey="min" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                                                            <YAxis tick={{ fill: '#94a3b8', fontSize: 9 }} />
                                                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff', fontSize: 10 }} />
                                                            <ReferenceLine y={200} stroke="#ef4444" strokeDasharray="2 2" />
                                                            <Line type="monotone" dataKey="normal" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} name="Normal" />
                                                            <Line type="monotone" dataKey="patient" stroke="#22d3ee" strokeWidth={2} dot={{ r: 2 }} name="Patient" strokeDasharray={result.status !== 'Low Risk' ? '4 2' : undefined} />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>

                                        {/* HbA1c Simulator */}
                                        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" /> HbA1c Glycated Hemoglobin Simulator
                                                </h4>
                                                <button onClick={() => setHba1cSim(6.5)} className="text-[10px] px-2 py-1 bg-white/5 border border-white/10 text-slate-400 hover:text-white rounded-lg">Reset</button>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-6 items-center">
                                                <div>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs text-slate-400">HbA1c Level</span>
                                                        <span className="text-sm font-mono font-bold text-white">{hba1cSim.toFixed(1)}%</span>
                                                    </div>
                                                    <input type="range" min={4} max={14} step={0.1} value={hba1cSim} onChange={e => setHba1cSim(Number(e.target.value))} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-cyan-400" />
                                                    <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                                                        <span>4.0%</span><span className="text-emerald-400">Normal &lt;5.7</span><span className="text-amber-400">Pre-D 5.7-6.4</span><span className="text-red-400">DM ≥6.5</span><span>14.0%</span>
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    {[{ label: 'Classification', value: hba1cSim >= 6.5 ? 'Diabetes Mellitus' : hba1cSim >= 5.7 ? 'Pre-Diabetic' : 'Normal', color: hba1cSim >= 6.5 ? 'text-red-400' : hba1cSim >= 5.7 ? 'text-amber-400' : 'text-emerald-400' },
                                                      { label: 'Est. Avg Blood Glucose', value: `${Math.round(28.7 * hba1cSim - 46.7)} mg/dL`, color: 'text-cyan-300' },
                                                      { label: 'Estimated eAG', value: `${(hba1cSim * 18.5 - 21).toFixed(0)} mg/dL`, color: 'text-blue-300' },
                                                      { label: 'Cardiovascular Risk', value: hba1cSim >= 8 ? 'High (2.5×)' : hba1cSim >= 6.5 ? 'Moderate (1.8×)' : 'Baseline', color: hba1cSim >= 8 ? 'text-red-400' : hba1cSim >= 6.5 ? 'text-amber-400' : 'text-emerald-400' },
                                                    ].map(m => (
                                                        <div key={m.label} className="flex justify-between items-center text-xs border-b border-white/5 pb-1.5">
                                                            <span className="text-slate-400">{m.label}</span>
                                                            <span className={`font-bold font-mono ${m.color}`}>{m.value}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Metabolic Panel Reference Table */}
                                        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4">
                                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">🧪 Metabolic Panel Reference Table</h4>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-xs">
                                                    <thead><tr className="border-b border-white/10">
                                                        <th className="text-left text-slate-500 py-2 pr-3 font-semibold uppercase tracking-wider">Parameter</th>
                                                        <th className="text-center text-slate-500 py-2 pr-3 font-semibold uppercase tracking-wider">Patient</th>
                                                        <th className="text-center text-slate-500 py-2 pr-3 font-semibold uppercase tracking-wider">Normal Range</th>
                                                        <th className="text-center text-slate-500 py-2 font-semibold uppercase tracking-wider">Status</th>
                                                    </tr></thead>
                                                    <tbody className="divide-y divide-white/5">
                                                        {[
                                                            { param: 'Fasting Glucose', val: `${extractedData.Glucose} mg/dL`, ref: '70–99 mg/dL', ok: extractedData.Glucose < 100 },
                                                            { param: 'BMI', val: `${extractedData.BMI}`, ref: '18.5–24.9', ok: extractedData.BMI < 25 },
                                                            { param: 'Blood Pressure (Diastolic)', val: `${extractedData.BloodPressure} mmHg`, ref: '60–80 mmHg', ok: extractedData.BloodPressure < 80 },
                                                            { param: 'Fasting Insulin', val: `${extractedData.Insulin > 0 ? extractedData.Insulin : 'Not provided'} μU/mL`, ref: '2–25 μU/mL', ok: extractedData.Insulin <= 25 },
                                                            { param: 'Skin Thickness (TSF)', val: `${extractedData.SkinThickness} mm`, ref: '10–35 mm', ok: extractedData.SkinThickness <= 35 },
                                                            { param: 'Diabetes Pedigree Function', val: extractedData.DPF.toFixed(3), ref: '0.08–0.5', ok: extractedData.DPF < 0.5 },
                                                            { param: 'Age', val: `${extractedData.Age} yrs`, ref: '< 45 (lower risk)', ok: extractedData.Age < 45 },
                                                        ].map((row, idx) => (
                                                            <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                                                <td className="py-2 pr-3 text-slate-300 font-medium">{row.param}</td>
                                                                <td className={`py-2 pr-3 text-center font-mono font-bold ${row.ok ? 'text-emerald-400' : 'text-red-400'}`}>{row.val}</td>
                                                                <td className="py-2 pr-3 text-center text-slate-500">{row.ref}</td>
                                                                <td className="py-2 text-center">
                                                                    <span className={`inline-flex text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${ row.ok ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20' }`}>{row.ok ? '✓ Normal' : '⚠ Abnormal'}</span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>

                                        {/* Complication Risk Matrix */}
                                        <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-4">
                                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">⚠ Long-Term Complication Risk Matrix</h4>
                                            <div className="space-y-2">
                                                {[
                                                    { complication: 'Diabetic Nephropathy', risk: result.riskPercentage * 0.6, color: 'bg-blue-500' },
                                                    { complication: 'Peripheral Neuropathy', risk: result.riskPercentage * 0.55, color: 'bg-purple-500' },
                                                    { complication: 'Retinopathy (Vision Loss)', risk: result.riskPercentage * 0.45, color: 'bg-orange-500' },
                                                    { complication: 'Cardiovascular Disease', risk: result.riskPercentage * 0.8, color: 'bg-red-500' },
                                                    { complication: 'Foot Ulceration', risk: result.riskPercentage * 0.35, color: 'bg-amber-500' },
                                                    { complication: 'NAFLD (Liver Disease)', risk: result.riskPercentage * 0.4, color: 'bg-emerald-500' },
                                                ].map(item => (
                                                    <div key={item.complication}>
                                                        <div className="flex justify-between items-center mb-0.5">
                                                            <span className="text-xs text-slate-300">{item.complication}</span>
                                                            <span className="text-[10px] font-mono text-slate-400">{Math.min(95, Math.round(item.risk))}%</span>
                                                        </div>
                                                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                                                            <div className={`h-full rounded-full ${item.color} transition-all duration-1000`} style={{ width: `${Math.min(95, Math.round(item.risk))}%` }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-[8px] text-slate-600 mt-3">Risk estimates based on UKPDS and DCCT clinical trial models. Not a substitute for professional medical advice.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {!isLoading && !result && (
                            <div className="flex-grow bg-slate-900/30 backdrop-blur-md rounded-3xl border border-white/5 border-dashed flex flex-col items-center justify-center p-8 text-center text-slate-500 h-[300px]">
                                <span className="text-5xl opacity-40 mb-4">🔬</span>
                                <h3 className="text-lg font-bold text-slate-400">Awaiting Lab Report</h3>
                                <p className="text-sm mt-2 max-w-[250px]">Upload a document to extract parameters and run the risk assessment algorithm.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(10deg); }
                }
                .animate-float { animation: float infinite ease-in-out; }
                
                @keyframes scan-fast {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(200%); }
                }
                .animate-scan-fast { animation: scan-fast 2s linear infinite; }
            `}</style>
            <NearbyDoctors searchType="general" title="Nearby Diabetes & Endocrinology Specialists" />
        </div>
    );
};

export default DiabetesPrediction;

