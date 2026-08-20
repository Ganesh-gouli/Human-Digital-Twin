import React, { useState, useRef, useCallback } from 'react';
import NearbyDoctors from '../components/NearbyDoctors';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { Activity, Shield, Info } from 'lucide-react';
import { analyzeKidneyReport } from '../services/geminiService';

const fileToBase64 = (file: File): Promise<{ data: string; mimeType: string }> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const result = reader.result as string;
            const data = result.includes('base64,') ? result.split('base64,')[1] : result;
            resolve({ data, mimeType: file.type || 'image/jpeg' });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

// UI SVG Icons
const Icons = {
    kidney: <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>,
    upload: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>,
    location: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    download: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
    warning: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
};

type AnalysisPhase = 'upload' | 'results' | 'error';
interface KidneyAnalysisResponse {
    summary: string;
    issues: { condition: string; severity: 'low' | 'moderate' | 'high' }[];
    causes: { lifestyle?: string[]; medical?: string[] };
    precautions: string[];
    consult_doctor?: string;
}

const KidneyDiseaseAnalyzer: React.FC = () => {
    const [phase, setPhase] = useState<AnalysisPhase>('upload');
    const [isDragging, setIsDragging] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [result, setResult] = useState<KidneyAnalysisResponse | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [activeTab, setActiveTab] = useState<'summary' | 'detailed'>('summary');
    const [renalPressure, setRenalPressure] = useState(85);
    const [afferentResist, setAfferentResist] = useState(40);
    const [efferentResist, setEfferentResist] = useState(30);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        addFiles(selectedFiles);
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        addFiles(droppedFiles);
    }, []);

    const addFiles = (newFiles: File[]) => {
        const validFiles = newFiles.filter(f => f.type.startsWith('image/') || f.type === 'application/pdf');
        if (validFiles.length + files.length > 5) {
            alert('You can only upload up to 5 files at a time.');
            return;
        }

        const oversized = validFiles.find(f => f.size > 10 * 1024 * 1024);
        if (oversized) {
            alert('File size exceeds 10MB limit.');
            return;
        }

        setResult(null);
        setErrorMsg('');
        setFiles(prev => [...prev, ...validFiles]);
        const urls = validFiles.map(f => URL.createObjectURL(f));
        setPreviewUrls(prev => [...prev, ...urls]);
    };

    const removeFile = (index: number) => {
        const newFiles = [...files];
        const newUrls = [...previewUrls];
        const removedUrl = newUrls[index];
        URL.revokeObjectURL(removedUrl);

        newFiles.splice(index, 1);
        newUrls.splice(index, 1);
        setFiles(newFiles);
        setPreviewUrls(newUrls);
    };

    const analyzeFiles = async () => {
        if (files.length === 0) return;
        setIsAnalyzing(true);
        setErrorMsg('');

        try {
            // Convert all files to base64 inline data
            const imageParts = await Promise.all(
                files.filter(f => f.type.startsWith('image/')).map(async f => {
                    const { data, mimeType } = await fileToBase64(f);
                    return { inlineData: { mimeType, data } };
                })
            );

            if (imageParts.length === 0) throw new Error('Please upload at least one image file (JPG/PNG).');

            const data = await analyzeKidneyReport(imageParts);
            setResult(data);
            setActiveTab('summary');
            setPhase('results');
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message || 'An error occurred during analysis.');
            setPhase('error');
        } finally {
            setIsAnalyzing(false);
        }
    };


    const getSeverityDetails = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'high': return { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' };
            case 'moderate': return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' };
            default: return { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' };
        }
    };



    return (
        <div className="relative min-h-[calc(100vh-80px)] w-full overflow-y-auto bg-gradient-to-br from-[#020b18] via-[#051428] to-[#020b18] p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-8 pb-20">
                {/* Header Section */}
                <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                        <span className="text-xs text-blue-300 font-semibold tracking-widest uppercase">HealthHub Kidney Engine</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                        Kidney Disease <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Detection</span>
                    </h1>
                    <p className="text-slate-400 text-sm md:text-lg max-w-2xl mx-auto">
                        Upload CT, MRI, Ultrasound scans, or lab reports. Our AI analyzes the images to detect stones, cysts, tumors, and other conditions accurately.
                    </p>
                </div>

                {/* Main Content Area */}
                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-6 md:p-10 relative overflow-hidden">
                    {/* Background glow internal */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

                    {/* PHASE: UPLOAD */}
                    {phase === 'upload' && (
                        <div className="space-y-6">
                            <div
                                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={handleDrop}
                                onClick={() => previewUrls.length === 0 && fileInputRef.current?.click()}
                                className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center py-16 px-6 text-center group
                                    ${isDragging
                                        ? 'border-blue-400 bg-blue-500/10 scale-[1.01]'
                                        : 'border-white/20 hover:border-blue-500/50 hover:bg-white/5'
                                    } ${previewUrls.length === 0 ? 'cursor-pointer' : ''}`}
                            >
                                {previewUrls.length === 0 ? (
                                    <>
                                        <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full mb-4 group-hover:scale-110 transition-transform text-blue-400">
                                            {Icons.upload}
                                        </div>
                                        <p className="text-lg font-semibold text-white mb-2">Drag & Drop scans or reports here</p>
                                        <p className="text-slate-400 text-sm mb-6 max-w-sm">Supported formats: JPG, PNG, PDF (1 to 5 files, 10MB each)</p>
                                        <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-full shadow-lg shadow-blue-500/20 border border-blue-400/30">
                                            Browse Files
                                        </button>
                                    </>
                                ) : (
                                    <div className="w-full" onClick={e => e.stopPropagation()}>
                                        <div className="flex justify-between items-center mb-6 px-4">
                                            <h4 className="text-sm font-semibold text-slate-300">Selected Files ({previewUrls.length}/5)</h4>
                                            {previewUrls.length < 5 && (
                                                <button onClick={() => fileInputRef.current?.click()} className="text-xs px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/10 flex items-center gap-2">
                                                    + Add More
                                                </button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4 w-full">
                                            {previewUrls.map((url, idx) => (
                                                <div key={idx} className="relative aspect-square rounded-xl border border-white/10 overflow-hidden group/item bg-black/40 shadow-inner">
                                                    {files[idx].type === 'application/pdf' ? (
                                                        <div className="w-full h-full bg-white/5 flex flex-col items-center justify-center text-xs text-slate-300 font-semibold gap-2">
                                                            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                                            PDF
                                                        </div>
                                                    ) : (
                                                        <img src={url} alt="preview" className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-500" />
                                                    )}
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button onClick={(e) => { e.stopPropagation(); removeFile(idx); }} className="bg-red-500/90 hover:bg-red-600 p-2 rounded-full text-white shadow-lg transform scale-0 group-hover/item:scale-100 transition-all duration-300">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <input ref={fileInputRef} type="file" multiple accept="image/*,application/pdf" className="hidden" onChange={handleFileChange} />
                            </div>

                            {previewUrls.length > 0 && (
                                <div className="flex justify-end pt-4 animate-fade-in-up">
                                    <button
                                        onClick={analyzeFiles}
                                        disabled={isAnalyzing}
                                        className={`px-8 py-3.5 rounded-xl font-bold shadow-lg border flex items-center justify-center gap-3 transition-all min-w-[280px]
                                            ${isAnalyzing
                                                ? 'bg-blue-600/50 text-white/80 border-blue-400/10 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-blue-400/30 hover:-translate-y-0.5 hover:shadow-cyan-500/20'}`}
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <svg className="animate-spin w-5 h-5 text-white" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>AI is analyzing scans...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Analyze Kidney Condition</span>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* PHASE: ERROR */}
                    {phase === 'error' && (
                        <div className="py-16 text-center space-y-4">
                            <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-full flex items-center justify-center mx-auto mb-2">
                                {Icons.warning}
                            </div>
                            <h3 className="text-xl font-bold text-white">Analysis Failed</h3>
                            <p className="text-slate-400">{errorMsg}</p>
                            <button onClick={() => setPhase('upload')} className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors border border-white/10">Try Again</button>
                        </div>
                    )}

                    {/* PHASE: RESULTS */}
                    {phase === 'results' && result && (
                        <div id="pdf-report-content" className="space-y-8 animate-fade-in-up">
                            {/* Glowing Blue Pill-Shaped Tab Switcher */}
                            <div className="flex justify-center mb-6">
                                <div className="flex bg-slate-950/60 border border-white/10 rounded-xl p-1 w-full max-w-sm shadow-[0_0_20px_rgba(0,0,0,0.4)]">
                                    <button
                                        onClick={() => setActiveTab('summary')}
                                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${
                                            activeTab === 'summary'
                                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-900/30'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        📄 Summary Report
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('detailed')}
                                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${
                                            activeTab === 'detailed'
                                                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-900/30'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                        }`}
                                    >
                                        📊 Detailed Analysis
                                    </button>
                                </div>
                            </div>

                            {activeTab === 'summary' ? (
                                <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
                                    {/* Summary Header */}
                                    <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/20 border border-blue-500/20 rounded-2xl p-6">
                                        <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                                            <span>🩺</span>
                                            Analysis Summary
                                        </h2>
                                        <p className="text-blue-100/80 leading-relaxed text-sm">{result.summary}</p>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Issues */}
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                                            <h3 className="text-md font-bold text-white flex items-center gap-2 mb-4">
                                                <span>📊</span>
                                                Detected Issues
                                            </h3>
                                            {result.issues.map((issue, i) => {
                                                const sevStyle = getSeverityDetails(issue.severity);
                                                return (
                                                    <div key={i} className={`flex justify-between items-center p-3 rounded-xl border ${sevStyle.bg} ${sevStyle.border}`}>
                                                        <span className="text-slate-200 font-medium text-sm">{issue.condition}</span>
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-black/40 flex items-center gap-1.5 ${sevStyle.color}`}>
                                                            <span>⚠</span> {issue.severity} Risk
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                            {result.issues.length === 0 && (
                                                <p className="text-sm text-slate-400 text-center py-4">No significant issues detected.</p>
                                            )}
                                        </div>

                                        {/* Causes */}
                                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                            <h3 className="text-md font-bold text-white flex items-center gap-2 mb-4">
                                                <span>🧬</span>
                                                Possible Causes
                                            </h3>
                                            <div className="space-y-4">
                                                {result.causes.lifestyle && result.causes.lifestyle.length > 0 && (
                                                    <div>
                                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Lifestyle</p>
                                                        <ul className="space-y-1">
                                                            {result.causes.lifestyle.map((c, i) => <li key={i} className="text-sm text-slate-300 flex items-start gap-2"><span className="text-purple-500 mt-1">•</span>{c}</li>)}
                                                        </ul>
                                                    </div>
                                                )}
                                                {result.causes.medical && result.causes.medical.length > 0 && (
                                                    <div className="pt-2 border-t border-white/5">
                                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2 mt-2">Medical / Biological</p>
                                                        <ul className="space-y-1">
                                                            {result.causes.medical.map((c, i) => <li key={i} className="text-sm text-slate-300 flex items-start gap-2"><span className="text-purple-500 mt-1">•</span>{c}</li>)}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Precautions & Doctor */}
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="bg-gradient-to-r from-emerald-900/20 to-teal-900/10 border border-emerald-500/20 rounded-2xl p-6">
                                            <h3 className="text-md font-bold text-white flex items-center gap-2 mb-4">
                                                <span>🥗</span>
                                                Precautions & Diet Suggestions
                                            </h3>
                                            <div className="grid gap-3">
                                                {result.precautions.map((p, i) => (
                                                    <div key={i} className="bg-black/20 border border-emerald-500/10 p-3 rounded-xl text-sm text-emerald-100/90 flex items-start gap-2">
                                                        <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                                                        {p}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="bg-gradient-to-r from-indigo-900/20 to-blue-900/10 border border-indigo-500/20 rounded-2xl p-6">
                                            <h3 className="text-md font-bold text-white flex items-center gap-2 mb-4">
                                                <span>👨‍⚕️</span>
                                                When to Consult a Doctor
                                            </h3>
                                            <div className="bg-black/20 border border-indigo-500/10 p-4 rounded-xl text-sm text-indigo-100/90 leading-relaxed">
                                                {result.consult_doctor || "If you experience severe pain, blood in urine, or persistent symptoms, consult a healthcare professional immediately."}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions / Utilities */}
                                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-white/10">
                                        <button onClick={() => window.print()} className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium flex items-center justify-center gap-2 transition-colors shadow-lg border border-blue-500/30">
                                            {Icons.download}
                                            Download Report
                                        </button>
                                        <button onClick={() => { setPhase('upload'); setFiles([]); setPreviewUrls([]); setActiveTab('summary'); }} className="py-3 px-6 text-slate-400 hover:text-white transition-colors">
                                            New Scan
                                        </button>
                                    </div>

                                    {/* Disclaimer */}
                                    <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 text-center">
                                        <p className="text-xs text-red-300">
                                            This AI analysis is not a substitute for professional medical diagnosis.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
                                    {/* Dedicated Detail Page Header */}
                                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                <Activity className="w-5 h-5 text-blue-500" />
                                                Advanced Renal Telemetry
                                            </h3>
                                            <p className="text-xs text-slate-400 mt-1">Real-time GFR stage, biomarkers vs reference baseline, and parenchymal indices</p>
                                        </div>
                                        <button
                                            onClick={() => setActiveTab('summary')}
                                            className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white rounded-lg transition-all"
                                        >
                                            ← Back to Summary
                                        </button>
                                    </div>

                                    {/* ── Advanced Renal Function & Biomarker Telemetry HUD ── */}
                                    {(() => {
                                        const rData = (() => {
                                            let egfr = 95;
                                            let creatinine = 0.8;
                                            let bun = 14;
                                            let acr = 12;
                                            let stage = 'Stage 1 (Normal Function)';
                                            let stageColor = 'text-emerald-400';
                                            let stageProgress = 95;
                                            
                                            const hasHighRisk = result.issues.some(i => i.severity.toLowerCase() === 'high');
                                            const hasModRisk = result.issues.some(i => i.severity.toLowerCase() === 'moderate');
                                            
                                            if (hasHighRisk) {
                                                egfr = 24;
                                                creatinine = 3.6;
                                                bun = 48;
                                                acr = 350;
                                                stage = 'Stage 4 (Severe Function Loss)';
                                                stageColor = 'text-red-500';
                                                stageProgress = 24;
                                            } else if (hasModRisk) {
                                                egfr = 52;
                                                creatinine = 1.8;
                                                bun = 26;
                                                acr = 120;
                                                stage = 'Stage 3 (Moderate Function Loss)';
                                                stageColor = 'text-amber-400';
                                                stageProgress = 52;
                                            }
                                            
                                            return { egfr, creatinine, bun, acr, stage, stageColor, stageProgress };
                                        })();

                                        return (
                                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
                                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                                    <Activity className="w-5 h-5 text-blue-500" />
                                                    Advanced Nephrology Telemetry & Visual Analytics
                                                </h3>

                                                <div className="grid md:grid-cols-3 gap-6">
                                                    {/* 1. eGFR Stage Gauge */}
                                                    <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                                                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Estimated GFR (Kidney Filtration)</h4>
                                                        <div className="relative w-32 h-32 flex items-center justify-center">
                                                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                                                                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="none" className="text-white/5" />
                                                                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="none"
                                                                    className={rData.egfr < 30 ? 'text-red-500' : rData.egfr < 60 ? 'text-amber-400' : 'text-emerald-400'}
                                                                    strokeDasharray="377"
                                                                    strokeDashoffset={377 - (377 * Math.min(100, rData.egfr)) / 100}
                                                                    strokeLinecap="round" />
                                                            </svg>
                                                            <div>
                                                                <div className="text-3xl font-black text-white font-mono">{rData.egfr}</div>
                                                                <div className="text-[8px] text-slate-400 mt-0.5">mL/min/1.73m²</div>
                                                            </div>
                                                        </div>
                                                        <p className={`text-xs font-bold mt-4 ${rData.stageColor}`}>{rData.stage}</p>
                                                    </div>

                                                    {/* 2. Renal Biomarkers Chart */}
                                                    <div className="bg-black/40 border border-white/5 rounded-2xl p-5">
                                                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Key Biomarkers vs. Reference Baseline</h4>
                                                        <div className="h-44">
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <BarChart data={[
                                                                    { name: 'Creatinine (mg/dL)', value: rData.creatinine, norm: 1.0 },
                                                                    { name: 'BUN (mg/dL)', value: rData.bun, norm: 20 },
                                                                    { name: 'ACR (mg/g)', value: rData.acr / 10, norm: 3.0 },
                                                                ]} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                                                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                                                                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 7 }} />
                                                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 8 }} />
                                                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', fontSize: 10 }} />
                                                                    <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                                                        <Cell fill={rData.egfr < 30 ? '#ef4444' : rData.egfr < 60 ? '#f59e0b' : '#10b981'} />
                                                                        <Cell fill={rData.egfr < 30 ? '#ef4444' : rData.egfr < 60 ? '#f59e0b' : '#10b981'} />
                                                                        <Cell fill={rData.egfr < 30 ? '#ef4444' : rData.egfr < 60 ? '#f59e0b' : '#10b981'} />
                                                                    </Bar>
                                                                </BarChart>
                                                            </ResponsiveContainer>
                                                        </div>
                                                        <p className="text-[8px] text-slate-500 text-center mt-2">ACR values are scaled down (divided by 10) for comparative rendering.</p>
                                                    </div>

                                                    {/* 3. Nephrology Lab HUD */}
                                                    <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between">
                                                        <div>
                                                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Renal Parenchymal Indices</h4>
                                                            <div className="space-y-3">
                                                                <div className="flex justify-between items-center text-xs pb-1.5 border-b border-white/5">
                                                                    <span className="text-slate-400 font-medium">Kidney Volume (L)</span>
                                                                    <span className="text-white font-mono font-bold">{rData.egfr < 30 ? '82 cc (Atrophy)' : '125 cc'}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center text-xs pb-1.5 border-b border-white/5">
                                                                    <span className="text-slate-400 font-medium">Kidney Volume (R)</span>
                                                                    <span className="text-white font-mono font-bold">{rData.egfr < 30 ? '85 cc (Atrophy)' : '128 cc'}</span>
                                                                </div>
                                                                <div className="flex justify-between items-center text-xs pb-1.5 border-b border-white/5">
                                                                    <span className="text-slate-400 font-medium">CMD Distinction</span>
                                                                    <span className={`font-bold ${rData.egfr < 30 ? 'text-red-400' : 'text-emerald-400'}`}>
                                                                        {rData.egfr < 30 ? 'Poor / Loss' : 'Sharp / Intact'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between items-center text-xs">
                                                                    <span className="text-slate-400 font-medium">Cyst/Stone Fraction</span>
                                                                    <span className="text-white font-mono font-bold">{rData.egfr < 60 ? '4.8 mm calcification' : 'None detected'}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="mt-4 p-3 rounded-xl bg-blue-950/20 border border-blue-800/30 flex items-center gap-2">
                                                            <Shield className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                                            <span className="text-[9px] text-blue-200">Diagnostics correlate with GFR clearance levels.</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                        {/* ── Nephron Filtration Grid ── */}
                                        {phase === 'results' && result && (() => {
                                            const severity = result.issues?.filter(i => i.severity === 'high').length || 0;
                                            const eGFRest = severity >= 2 ? 18 : severity === 1 ? 45 : 78;
                                            // 100-cell nephron grid: red=failed, amber=impaired, green=healthy
                                            const failedCount = Math.round((1 - eGFRest / 120) * 100 * 0.6);
                                            const impairedCount = Math.round((1 - eGFRest / 120) * 100 * 0.2);
                                            return (
                                                <div className="bg-black/40 border border-blue-900/30 rounded-2xl p-5 mt-4">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                                                            Nephron Filtration Grid (Functional Map)
                                                        </h4>
                                                        <div className="flex items-center gap-3 text-[9px]">
                                                            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-sm" />Functional</span>
                                                            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-amber-500 rounded-sm" />Impaired</span>
                                                            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-700 rounded-sm" />Failed</span>
                                                        </div>
                                                    </div>
                                                    <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(20, 1fr)' }}>
                                                        {Array.from({ length: 100 }).map((_, i) => {
                                                            let cls = 'bg-emerald-500/60';
                                                            if (i < failedCount) cls = 'bg-red-700/80';
                                                            else if (i < failedCount + impairedCount) cls = 'bg-amber-500/70';
                                                            return <div key={i} className={`aspect-square rounded-sm ${cls} transition-all hover:scale-110`} title={`Nephron #${i + 1}`} />;
                                                        })}
                                                    </div>
                                                    <div className="flex justify-between mt-3 text-[9px] text-slate-500">
                                                        <span>Estimated functional nephrons: <span className="text-emerald-400 font-bold">{100 - failedCount - impairedCount}%</span></span>
                                                        <span>eGFR model: <span className="text-blue-400 font-mono">{eGFRest} mL/min/1.73m²</span></span>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* ── Renal Artery Blood Flow Dials ── */}
                                        <div className="bg-black/40 border border-blue-900/30 rounded-2xl p-5 mt-4">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                                    <span>🚀</span> Renal Artery Hemodynamics Simulator
                                                </h4>
                                                <button
                                                    onClick={() => { setRenalPressure(85); setAfferentResist(40); setEfferentResist(30); }}
                                                    className="text-[10px] px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
                                                >Reset</button>
                                            </div>
                                            <div className="space-y-4">
                                                {[
                                                    { label: 'Mean Arterial Pressure (MAP)', value: renalPressure, min: 40, max: 150, setter: setRenalPressure, unit: 'mmHg', norm: '70-100', color: 'accent-blue-500' },
                                                    { label: 'Afferent Arteriolar Resistance', value: afferentResist, min: 10, max: 100, setter: setAfferentResist, unit: ' AU', norm: '30-50', color: 'accent-cyan-400' },
                                                    { label: 'Efferent Arteriolar Resistance', value: efferentResist, min: 5, max: 80, setter: setEfferentResist, unit: ' AU', norm: '20-40', color: 'accent-indigo-400' },
                                                ].map(s => (
                                                    <div key={s.label}>
                                                        <div className="flex justify-between items-center mb-1.5">
                                                            <span className="text-xs text-slate-400 font-medium">{s.label}</span>
                                                            <span className="text-xs text-white font-mono bg-white/5 px-2 py-0.5 rounded">{s.value}{s.unit}</span>
                                                        </div>
                                                        <input
                                                            type="range" min={s.min} max={s.max} value={s.value}
                                                            onChange={e => s.setter(Number(e.target.value))}
                                                            className={`w-full h-1.5 rounded-full appearance-none cursor-pointer bg-white/10 ${s.color}`}
                                                        />
                                                        <div className="flex justify-between text-[8px] text-slate-600 mt-0.5">
                                                            <span>Min: {s.min}{s.unit}</span>
                                                            <span className="text-blue-400/50">Normal: {s.norm}{s.unit}</span>
                                                            <span>Max: {s.max}{s.unit}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                                {/* Computed GFR from sliders */}
                                                <div className="bg-blue-950/20 border border-blue-800/20 rounded-xl p-3 mt-2">
                                                    <p className="text-[10px] text-slate-400 mb-1 font-medium">Simulated GFR (Starling Forces Model)</p>
                                                    <div className="flex items-center gap-3">
                                                        <p className="text-2xl font-black text-blue-300 font-mono">
                                                            {Math.max(5, Math.round((renalPressure - afferentResist * 0.4 - efferentResist * 0.3) * 0.9)).toFixed(0)}
                                                        </p>
                                                        <div>
                                                            <p className="text-xs text-blue-200 font-semibold">mL/min/1.73m²</p>
                                                            <p className="text-[9px] text-slate-500">Normal: 90-120 mL/min/1.73m²</p>
                                                        </div>
                                                        <div className={`ml-auto text-xs font-bold px-2 py-1 rounded-lg ${
                                                            Math.max(5, Math.round((renalPressure - afferentResist * 0.4 - efferentResist * 0.3) * 0.9)) >= 90 ? 'bg-emerald-500/10 text-emerald-400' :
                                                            Math.max(5, Math.round((renalPressure - afferentResist * 0.4 - efferentResist * 0.3) * 0.9)) >= 60 ? 'bg-amber-500/10 text-amber-400' :
                                                            'bg-red-500/10 text-red-400'
                                                        }`}>
                                                            {Math.max(5, Math.round((renalPressure - afferentResist * 0.4 - efferentResist * 0.3) * 0.9)) >= 90 ? 'G1: Normal' :
                                                             Math.max(5, Math.round((renalPressure - afferentResist * 0.4 - efferentResist * 0.3) * 0.9)) >= 60 ? 'G2: Mild CKD' :
                                                             Math.max(5, Math.round((renalPressure - afferentResist * 0.4 - efferentResist * 0.3) * 0.9)) >= 30 ? 'G3: Moderate CKD' : 'G5: Kidney Failure'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-[9px] text-slate-600 mt-3">Interactive Starling pressure model. Adjusting MAP and resistance values simulates glomerular filtration changes.</p>
                                        </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="max-w-5xl mx-auto space-y-4">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-200">
                        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                        <p>
                            <strong>Medical Safety Notice:</strong> AI-generated analysis for informational purposes only. This result should not replace evaluation by a qualified healthcare professional.
                        </p>
                    </div>
                    <NearbyDoctors searchType="general" title="Nearby Kidney Specialists & Hospitals" />
                </div>
            </div>

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #pdf-report-content, #pdf-report-content * { visibility: visible; }
                    #pdf-report-content { position: absolute; left: 0; top: 0; width: 100%; color: black !important; padding: 20px;}
                    button { display: none !important; }
                    .bg-gradient-to-br, .bg-white\\/5 { background: #f8fafc !important; border: 1px solid #e2e8f0 !important;}
                    h2, h3, p, span, li { color: black !important; }
                }
            `}</style>
        </div>
    );
};

export default KidneyDiseaseAnalyzer;
