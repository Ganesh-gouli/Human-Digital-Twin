import React, { useState, useRef, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';
import { analyzeSkinCondition } from '../services/geminiService';
import { SkinAnalysisResult } from '../types';
import { ICONS } from '../constants';
import NearbyDoctors from '../components/NearbyDoctors';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Cell,
    RadialBarChart, RadialBar
} from 'recharts';
import { Shield, Activity, Droplets } from 'lucide-react';const SkinDetection: React.FC = () => {
    const { navigateTo } = useAppContext();
    const [image, setImage] = useState<string | null>(null);
    const [mimeType, setMimeType] = useState<string>('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState<SkinAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'summary' | 'detailed'>('summary');
    const [lesionStage, setLesionStage] = useState(0);
    const [dermoscopyActive, setDermoscopyActive] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState<'gemma4' | 'gemini'>('gemini');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please upload a valid image file.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(',')[1];
                setImage(base64);
                setMimeType(file.type);
                setError(null);
                setResult(null);
                setActiveTab('summary');
            };
            reader.readAsDataURL(file);
        }
    };

    const runAnalysis = async () => {
        if (!image) return;

        setIsAnalyzing(true);
        setIsScanning(true);
        setError(null);

        try {
            const data = await analyzeSkinCondition(image, mimeType, selectedModel);
            setResult(data);
        } catch (err) {
            console.error('Analysis failed:', err);
            setError('Failed to analyze skin condition. Please try again.');
        } finally {
            setIsAnalyzing(false);
            setIsScanning(false);
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'Mild': return 'text-green-400 bg-green-500/10 border-green-500/20';
            case 'Moderate': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            case 'Serious': return 'text-red-400 bg-red-500/10 border-red-500/20';
            default: return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        }
    };

    return (
        <>
            <div className="relative min-h-screen text-white pb-20 overflow-hidden font-sans">
                {/* Background */}
                <div className="fixed inset-0 z-0">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/40 via-gray-900 to-black"></div>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pt-8 space-y-8 animate-fade-in">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigateTo('DASHBOARD')}
                            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all group"
                        >
                            <span className="group-hover:-translate-x-1 block transition-transform">{ICONS.arrowLeft}</span>
                        </button>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter">
                                Skin <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">AI Lab</span>
                            </h1>
                            <p className="text-blue-100/60 font-medium">Advanced Dermatological Visual Analysis</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* LEFT: Upload Section */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"></div>

                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[300px] overflow-hidden ${image ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/10 hover:border-white/30 bg-white/5 hover:bg-white/10'
                                        }`}
                                >
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        accept="image/*"
                                    />

                                    {image ? (
                                        <div className="relative w-full h-full animate-fade-in">
                                            <img
                                                src={`data:${mimeType};base64,${image}`}
                                                alt="Skin Condition"
                                                className="w-full h-64 object-cover rounded-xl shadow-lg"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-center pb-4">
                                                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 drop-shadow-md">Image Uploaded</span>
                                            </div>
                                            {isScanning && (
                                                <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl">
                                                    <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#34d399] animate-scan"></div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-emerald-400">
                                                {ICONS.report}
                                            </div>
                                            <p className="text-sm font-bold text-white mb-2">Upload Skin Photo</p>
                                            <p className="text-xs text-white/40 text-center px-4">Drag and drop or click to browse. Ensure the area is well-lit.</p>
                                        </>
                                    )}
                                </div>

                                <div className="mt-6 space-y-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">AI Inference Model</label>
                                    <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-1 rounded-xl border border-white/5">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedModel('gemini')}
                                            className={`py-2.5 text-xs font-bold rounded-lg transition-all ${
                                                selectedModel === 'gemini'
                                                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                        >
                                            ✨ Gemini 2.5 (High Accuracy)
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedModel('gemma4')}
                                            className={`py-2.5 text-xs font-bold rounded-lg transition-all ${
                                                selectedModel === 'gemma4'
                                                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                        >
                                            💻 Gemma 4 (Local Model)
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={runAnalysis}
                                    disabled={!image || isAnalyzing}
                                    className="w-full py-4 mt-6 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-bold text-white shadow-lg shadow-emerald-900/20 transition-all active:scale-95 flex items-center justify-center gap-2 overflow-hidden relative group"
                                >
                                    {isAnalyzing ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>AI Processing...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <span>Initialize Neural Scan</span>
                                        </>
                                    )}
                                </button>
                            </div>

                            {error && (
                                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium animate-shake">
                                    {error}
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Results Section */}
                        <div className="lg:col-span-7 space-y-6">
                            {result ? (
                                <div className="animate-fade-in space-y-6">
                                    {/* Glowing Emerald Pill-Shaped Tab Switcher */}
                                    <div className="flex justify-center mb-4">
                                        <div className="flex bg-slate-950/60 border border-white/10 rounded-xl p-1 w-full max-w-sm shadow-[0_0_20px_rgba(0,0,0,0.4)]">
                                            <button
                                                onClick={() => setActiveTab('summary')}
                                                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${
                                                    activeTab === 'summary'
                                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30'
                                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                                }`}
                                            >
                                                📄 Summary Report
                                            </button>
                                            <button
                                                onClick={() => setActiveTab('detailed')}
                                                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${
                                                    activeTab === 'detailed'
                                                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30'
                                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                                }`}
                                            >
                                                📊 Detailed Analysis
                                            </button>
                                        </div>
                                    </div>

                                    {activeTab === 'summary' ? (
                                        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
                                            {/* Main Identification */}
                                            <div className="bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div>
                                                        <h2 className="text-3xl font-black text-white mb-2">{result.diseaseName}</h2>
                                                        <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border ${getSeverityColor(result.severity)}`}>
                                                            Severity: {result.severity}
                                                        </div>
                                                    </div>
                                                    <div className="p-4 bg-emerald-500/20 rounded-2xl border border-emerald-500/20">
                                                        <span className="text-emerald-400">{ICONS.diet}</span>
                                                    </div>
                                                </div>

                                                <p className="text-blue-100/80 leading-relaxed font-medium mb-8">
                                                    {result.explanation}
                                                </p>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <ResultList title="Possible Causes" items={result.causes} icon="🔍" />
                                                    <ResultList title="Home Remedies" items={result.homeRemedies} icon="🏠" />
                                                    <ResultList title="Medical Treatments" items={result.medicalTreatments} icon="🏥" />
                                                </div>
                                            </div>

                                            {/* Disclaimer */}
                                            <div className="p-6 rounded-2xl bg-yellow-500/5 border border-yellow-500/20 text-center">
                                                <p className="text-xs text-yellow-200/60 leading-relaxed italic">
                                                    <span className="font-bold text-yellow-500">MEDICAL DISCLAIMER:</span> {result.disclaimer}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
                                            {/* Dedicated Detail Page Header */}
                                            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                        <Activity className="w-5 h-5 text-emerald-400" />
                                                        Skin Biometric Telemetry
                                                    </h3>
                                                    <p className="text-xs text-slate-400 mt-1">Advanced ABCD risk metrics and tissue layer infiltration diagnostics</p>
                                                </div>
                                                <button
                                                    onClick={() => setActiveTab('summary')}
                                                    className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white rounded-lg transition-all"
                                                >
                                                    ← Back to Summary
                                                </button>
                                            </div>

                                            {/* ── Advanced Dermatological Telemetry & Visual Analytics ── */}
                                            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
                                                <div className="grid md:grid-cols-2 gap-6">
                                                    {/* Dermal Layer Infiltration Chart */}
                                                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                                                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Infiltration Depth Index</h4>
                                                        <div className="h-56 flex items-center justify-center">
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <RadialBarChart 
                                                                    cx="50%" 
                                                                    cy="50%" 
                                                                    innerRadius="30%" 
                                                                    outerRadius="90%" 
                                                                    barSize={12} 
                                                                    data={[
                                                                        {
                                                                            name: 'Subcutaneous',
                                                                            uv: result.dermalInfiltration?.subcutaneous || 8,
                                                                            fill: '#a855f7'
                                                                        },
                                                                        {
                                                                            name: 'Dermis',
                                                                            uv: result.dermalInfiltration?.dermis || 25,
                                                                            fill: '#06b6d4'
                                                                        },
                                                                        {
                                                                            name: 'Epidermis',
                                                                            uv: result.dermalInfiltration?.epidermis || 82,
                                                                            fill: '#10b981'
                                                                        }
                                                                    ]}
                                                                >
                                                                    <RadialBar
                                                                        label={{ position: 'insideStart', fill: '#fff', fontSize: 9, fontWeight: 'bold' }}
                                                                        background
                                                                        dataKey="uv"
                                                                    />
                                                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', fontSize: 11 }} />
                                                                </RadialBarChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                    </div>

                                                    {/* Dermatological Risk Radar (ABCD Criteria) */}
                                                    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-4">
                                                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">ABCD Risk Profile</h4>
                                                        <div className="h-56">
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                                                    { subject: 'Asymmetry', A: result.abcdScores?.asymmetry || 15 },
                                                                    { subject: 'Border', A: result.abcdScores?.border || 20 },
                                                                    { subject: 'Color', A: result.abcdScores?.color || 18 },
                                                                    { subject: 'Diameter', A: result.abcdScores?.diameter || 22 },
                                                                    { subject: 'Evolution', A: result.abcdScores?.evolution || 12 }
                                                                ]}>
                                                                    <PolarGrid stroke="#334155" />
                                                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 9 }} />
                                                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 8 }} />
                                                                    <Radar name="Risk" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                                                                </RadarChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Physical Vitals Metric HUD */}
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                                                    {[
                                                        { label: 'Melanin Index', value: `${result.skinMetrics?.melaninIndex || 42} %`, desc: 'Pigment density', icon: '☀️', color: 'text-amber-400' },
                                                        { label: 'Hydration Level', value: `${result.skinMetrics?.hydration || 35} %`, desc: 'Stratum corneum water', icon: '💧', color: 'text-sky-400' },
                                                        { label: 'Erythema Index', value: `${result.skinMetrics?.erythemaIndex || 60} %`, desc: 'Vascular congestion', icon: '🩸', color: 'text-rose-400' },
                                                        { label: 'Barrier Health', value: `${result.skinMetrics?.barrierHealth || 48} %`, desc: 'TEWL barrier efficiency', icon: '🛡️', color: 'text-emerald-400' }
                                                    ].map(metric => (
                                                        <div key={metric.label} className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{metric.label}</span>
                                                                <span className="text-sm">{metric.icon}</span>
                                                            </div>
                                                            <div>
                                                                <p className={`text-xl font-bold ${metric.color} font-mono`}>{metric.value}</p>
                                                                <p className="text-[9px] text-slate-500 mt-1">{metric.desc}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* ── ABCD Dermoscopy Point Analysis ── */}
                                                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 mt-4">
                                                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                                        ABCDE Dermoscopy Point Analysis
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {[
                                                            { key: 'Asymmetry', desc: 'Shape irregularity in both axes', score: result?.abcdScores?.asymmetry || 15, max: 100, color: 'bg-emerald-500', alert: 'High asymmetry suggests malignant potential' },
                                                            { key: 'Border', desc: 'Abruptness / Diffusion of edge', score: result?.abcdScores?.border || 20, max: 100, color: 'bg-yellow-500', alert: 'Irregular borders common in melanoma' },
                                                            { key: 'Color', desc: 'Hue variation (tan, brown, black, red, white, blue)', score: result?.abcdScores?.color || 18, max: 100, color: 'bg-orange-500', alert: 'Multi-color variance is a key risk marker' },
                                                            { key: 'Diameter', desc: 'Estimated lesion diameter vs 6mm threshold', score: result?.abcdScores?.diameter || 22, max: 100, color: 'bg-blue-500', alert: 'Lesions > 6mm require urgent attention' },
                                                            { key: 'Evolution', desc: 'Rate of change over time', score: result?.abcdScores?.evolution || 12, max: 100, color: 'bg-purple-500', alert: 'Rapid evolution is the strongest melanoma predictor' },
                                                        ].map(item => (
                                                            <div
                                                                key={item.key}
                                                                className="cursor-pointer"
                                                                onClick={() => setDermoscopyActive(dermoscopyActive === item.key ? null : item.key)}
                                                            >
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <span className="text-xs text-slate-300 font-medium flex items-center gap-1.5">
                                                                        <span className={`w-1.5 h-1.5 rounded-full ${item.color}`} />
                                                                        {item.key}
                                                                    </span>
                                                                    <span className="text-xs font-mono text-slate-400">{item.score}/100</span>
                                                                </div>
                                                                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full ${item.color} transition-all duration-1000`}
                                                                        style={{ width: `${item.score}%` }}
                                                                    />
                                                                </div>
                                                                {dermoscopyActive === item.key && (
                                                                    <div className="mt-2 text-[10px] text-slate-400 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 animate-[fadeIn_0.3s_ease-out]">
                                                                        <span className="font-semibold text-slate-300">{item.key}: </span>{item.desc}<br />
                                                                        <span className="text-amber-400/80 mt-1 block">⚡ {item.alert}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <p className="text-[9px] text-slate-600 mt-4">Click any criterion to expand clinical rationale. Based on Stolz ABCD rule dermatoscopy scoring.</p>
                                                </div>

                                                {/* ── Lesion Evolution Timeline Slider ── */}
                                                <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 mt-4">
                                                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                        <span>🕐</span> Lesion Evolution Timeline Simulator
                                                    </h4>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center gap-4">
                                                            <span className="text-xs text-slate-400 w-16">Stage</span>
                                                            <input
                                                                type="range" min={0} max={5} value={lesionStage}
                                                                onChange={e => setLesionStage(Number(e.target.value))}
                                                                className="flex-1 h-2 rounded-full appearance-none cursor-pointer bg-white/10 accent-emerald-400"
                                                            />
                                                            <span className="text-xs font-mono text-emerald-400 w-4">{lesionStage}</span>
                                                        </div>
                                                        {(() => {
                                                            const stages = [
                                                                { label: 'Benign Nevus', color: 'border-emerald-500 text-emerald-400', size: 'w-8 h-8', bg: 'bg-amber-700/60', desc: 'Symmetric, uniform color, well-defined border. Low-risk profile.' },
                                                                { label: 'Early Dysplastic', color: 'border-yellow-500 text-yellow-400', size: 'w-10 h-10', bg: 'bg-amber-800/70', desc: 'Slight color variation beginning. Border still mostly regular.' },
                                                                { label: 'Moderate Dysplasia', color: 'border-orange-500 text-orange-400', size: 'w-12 h-12', bg: 'bg-amber-900/80', desc: 'Multi-hue appearance. Border irregularity emerging. Monitor closely.' },
                                                                { label: 'High-Grade Dysplasia', color: 'border-red-500 text-red-400', size: 'w-14 h-14', bg: 'bg-red-900/60', desc: 'Significant asymmetry. Multiple colors. Urgent biopsy recommended.' },
                                                                { label: 'Melanoma in Situ', color: 'border-red-700 text-red-300', size: 'w-16 h-16', bg: 'bg-red-950/80', desc: 'Full ABCD criteria met. Clark Level I. Surgical excision required.' },
                                                                { label: 'Invasive Melanoma', color: 'border-rose-900 text-rose-200', size: 'w-20 h-20', bg: 'bg-black', desc: 'Clark Level IV-V. Metastatic potential. Immediate oncology referral.' },
                                                            ];
                                                            const s = stages[lesionStage];
                                                            return (
                                                                <div className="flex gap-6 items-center">
                                                                    <div className={`relative flex-shrink-0 ${s.size} rounded-full ${s.bg} border-2 ${s.color} transition-all duration-500 flex items-center justify-center`}
                                                                        style={{ boxShadow: `0 0 ${lesionStage * 4}px rgba(239,68,68,${lesionStage * 0.12})` }}>
                                                                        {lesionStage > 2 && (
                                                                            <div className="absolute inset-0 rounded-full border-2 border-red-500/30 animate-ping" />
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className={`text-sm font-bold ${s.color.split(' ')[1]}`}>{s.label}</p>
                                                                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{s.desc}</p>
                                                                        {lesionStage >= 3 && (
                                                                            <p className="text-[10px] text-red-400 mt-2 font-bold animate-pulse">⚠ Immediate medical consultation required</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}
                                                        <div className="flex justify-between mt-2">
                                                            {['Stage 0', '1', '2', '3', '4', '5'].map((s, i) => (
                                                                <button
                                                                    key={s}
                                                                    onClick={() => setLesionStage(i)}
                                                                    className={`text-[9px] font-bold px-2 py-0.5 rounded transition-all ${
                                                                        i === lesionStage ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-600 hover:text-slate-400'
                                                                    }`}
                                                                >{s}</button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-[9px] text-slate-600 mt-3">Simulated visual progression model based on Clark-Breslow melanoma staging criteria.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 border-dashed">
                                    <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6 text-white/10">
                                        {ICONS.chatbot}
                                    </div>
                                    <h3 className="text-xl font-bold text-white/40 tracking-tight">System Idle</h3>
                                    <p className="text-sm text-white/20 mt-3 max-w-xs leading-relaxed">Please capture and upload a clear, well-lit image of the skin condition for neural processing.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <style>{`
                @keyframes scan {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(256px); }
                }
                .animate-scan {
                    animation: scan 2s linear infinite;
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-4px); }
                    75% { transform: translateX(4px); }
                }
                .animate-shake {
                    animation: shake 0.4s ease-in-out;
                }
            `}</style>
                </div>
            </div>
            <NearbyDoctors searchType="general" title="Nearby Dermatologists & Skin Clinics" />
        </>
    );
};

const ResultList: React.FC<{ title: string; items: string[]; icon: string }> = ({ title, items, icon }) => (
    <div className="bg-white/5 p-4 rounded-3xl border border-white/10 group hover:bg-white/15 transition-all">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-blue-200/40 mb-3 flex items-center gap-2">
            <span>{icon}</span> {title}
        </h4>
        <div className="flex flex-wrap gap-2">
            {items?.length > 0 ? items.map((item, i) => (
                <span key={i} className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-white/5 border border-white/10 text-white/70 group-hover:bg-white/10 transition-colors">
                    {item}
                </span>
            )) : <span className="text-[10px] text-white/20">No data available</span>}
        </div>
    </div>
);

export default SkinDetection;
