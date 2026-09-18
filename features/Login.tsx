import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Gender } from '../types';
import LandingPage from '../components/LandingPage';
import SplineScene from '@splinetool/react-spline';

const Login: React.FC = () => {
    const { login, user, currentPage } = useAppContext();
    const isEditMode = currentPage === 'EDIT_PROFILE' && user;

    // Show landing page on fresh entry if not editing profile
    const [showLanding, setShowLanding] = useState(!isEditMode);

    const [name, setName] = useState(isEditMode ? user.name : 'Dr. Alex Vance');
    const [email, setEmail] = useState(isEditMode ? user.email || '' : 'alex.vance@biotwin-institute.org');
    const [age, setAge] = useState(isEditMode && user.age ? user.age.toString() : '35');
    const [gender, setGender] = useState<Gender>(isEditMode ? user.gender : 'male');
    const [height, setHeight] = useState(isEditMode ? user.height.toString() : '178');
    const [weight, setWeight] = useState(isEditMode ? user.weight.toString() : '72');
    const [institution, setInstitution] = useState(isEditMode ? user.institution || '' : 'BioTwin Computational Pharmacology Lab');
    const [cypProfile, setCypProfile] = useState(isEditMode ? user.cypProfile || '' : 'Standard (Normal CYP2D6/CYP3A4)');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (isEditMode && user) {
            setName(user.name);
            setEmail(user.email || '');
            setAge(user.age ? user.age.toString() : '35');
            setGender(user.gender || 'male');
            setHeight(user.height ? user.height.toString() : '178');
            setWeight(user.weight ? user.weight.toString() : '72');
            setInstitution(user.institution || 'BioTwin Computational Pharmacology Lab');
            setCypProfile(user.cypProfile || 'Standard (Normal CYP2D6/CYP3A4)');
        }
    }, [user, isEditMode]);

    // Mouse Parallax State
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const { clientX, clientY } = e;
            const x = (clientX / window.innerWidth - 0.5) * 30;
            const y = (clientY / window.innerHeight - 0.5) * 30;
            setMousePos({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleContinue = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email) {
            setError('Please provide Investigator Name and Institutional Email.');
            return;
        }

        setError('');
        setIsProcessing(true);

        setTimeout(() => {
            login({
                name,
                email,
                age: age ? parseInt(age, 10) : 35,
                gender,
                height: height ? parseFloat(height) : 175,
                weight: weight ? parseFloat(weight) : 70,
                institution,
                cypProfile,
                estimatedGFR: 105
            });
            setIsProcessing(false);
        }, 500);
    };

    return (
        <>
            {showLanding && <LandingPage onExplore={() => setShowLanding(false)} />}

            <div className={`min-h-screen relative flex items-center justify-center md:justify-end md:pr-[8%] overflow-hidden font-sans selection:bg-teal-500/30 selection:text-white transition-opacity duration-1000 ${showLanding ? 'opacity-0' : 'opacity-100'}`}>

                {/* Laboratory Background */}
                <div
                    className="absolute inset-0 z-0 bg-cover bg-center overflow-hidden"
                    style={{
                        backgroundImage: `url('/bg-login.jpeg')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: '#050a14',
                        transform: `scale(1.04) translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`,
                        transition: 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)'
                    }}
                >
                    <div className="absolute inset-0 bg-[#030712]/75 backdrop-blur-[10px]"></div>
                    <div className="absolute top-[15%] left-[20%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[130px] pointer-events-none"></div>
                    <div className="absolute bottom-[10%] right-[10%] w-[550px] h-[550px] bg-cyan-600/10 rounded-full blur-[140px] pointer-events-none"></div>
                </div>

                {/* 3D Visual Layer */}
                <div className="absolute left-0 md:left-[2%] lg:left-[4%] top-0 bottom-0 w-[52%] hidden md:flex items-center justify-center pointer-events-auto">
                    <div
                        className="w-full h-[600px] xl:h-[700px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                        style={{
                            transform: `perspective(1000px) rotateY(${Math.max(Math.min(mousePos.x * 0.2, 5), -5)}deg) rotateX(${Math.max(Math.min(mousePos.y * -0.15, 4), -4)}deg)`,
                            transition: 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)'
                        }}
                    >
                        <SplineScene
                            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
                            className="w-full h-full rounded-2xl overflow-hidden"
                        />
                    </div>
                </div>

                {/* Calibration Box */}
                <div className="relative z-10 w-full max-w-[480px] px-6 my-8">
                    <div className="bg-[#0b1120]/90 backdrop-blur-2xl border border-white/15 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.1)] p-8 md:p-9 transition-all">

                        <div className="mb-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 text-[11px] font-mono font-bold uppercase tracking-wider mb-2.5">
                                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                                {isEditMode ? 'Subject Twin Calibration' : 'In-Silico Environment Initialization'}
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                                {isEditMode ? "Calibrate Virtual Twin" : "Investigator Calibration"}
                            </h2>
                            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                Calibrate the computational subject model for pharmacokinetics, volume of distribution ($V_d$), and metabolic clearance.
                            </p>
                        </div>

                        <form onSubmit={handleContinue} className="space-y-4">
                            {error && (
                                <div className="bg-red-500/15 border border-red-500/30 text-red-300 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
                                    <span>⚠️</span> {error}
                                </div>
                            )}

                            {/* Investigator Info */}
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400/90 mb-1">
                                        Principal Investigator
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/40 focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none"
                                        placeholder="Dr. Full Name"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400/90 mb-1">
                                        Institutional Email / Affiliation
                                    </label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/40 focus:border-teal-400 focus:ring-2 focus:ring-teal-500/20 transition-all outline-none"
                                        placeholder="investigator@institution.org"
                                    />
                                </div>
                            </div>

                            {/* Twin Subject Calibration Divider */}
                            <div className="pt-2 border-t border-white/10">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400/90 block mb-2">
                                    Virtual Human Subject Parameters
                                </span>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <label className="block text-[9px] text-gray-400 font-mono mb-1">Subject Age (Years)</label>
                                        <input
                                            type="number"
                                            value={age}
                                            onChange={(e) => setAge(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/40 focus:border-teal-400 outline-none"
                                            placeholder="35"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] text-gray-400 font-mono mb-1">Biological Sex</label>
                                        <select
                                            value={gender}
                                            onChange={(e) => setGender(e.target.value as Gender)}
                                            className="w-full bg-[#0a1120] border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:border-teal-400 outline-none cursor-pointer"
                                        >
                                            <option value="male">Male (Standard)</option>
                                            <option value="female">Female (Standard)</option>
                                            <option value="other">Non-binary Cohort</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div>
                                        <label className="block text-[9px] text-gray-400 font-mono mb-1">Height (cm) - Vd Calc</label>
                                        <input
                                            type="number"
                                            value={height}
                                            onChange={(e) => setHeight(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/40 focus:border-teal-400 outline-none"
                                            placeholder="178"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[9px] text-gray-400 font-mono mb-1">Body Mass (kg) - Clear. Calc</label>
                                        <input
                                            type="number"
                                            value={weight}
                                            onChange={(e) => setWeight(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/40 focus:border-teal-400 outline-none"
                                            placeholder="72"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[9px] text-gray-400 font-mono mb-1">CYP450 Genomic Metabolizer Status</label>
                                    <select
                                        value={cypProfile}
                                        onChange={(e) => setCypProfile(e.target.value)}
                                        className="w-full bg-[#0a1120] border border-white/10 rounded-xl px-3 py-2 text-xs text-teal-300 focus:border-teal-400 outline-none cursor-pointer"
                                    >
                                        <option value="Standard (Normal CYP2D6/CYP3A4)">Standard (Extensive / Normal Metabolizer)</option>
                                        <option value="CYP2D6 Poor Metabolizer">CYP2D6 Poor Metabolizer (High Accumulation Risk)</option>
                                        <option value="CYP2C9*3 Intermediate">CYP2C9*3 Intermediate (Delayed NSAID Clearance)</option>
                                        <option value="CYP1A2 Rapid Metabolizer">CYP1A2 Ultra-Rapid Metabolizer</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="w-full h-12 mt-4 bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-600 hover:from-teal-400 hover:to-cyan-500 text-slate-950 font-black rounded-xl text-sm transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(45,212,191,0.35)] active:scale-95 disabled:opacity-50"
                            >
                                {isProcessing ? (
                                    <span className="flex items-center gap-2 text-slate-900">
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                        </svg>
                                        Calibrating Virtual Twin...
                                    </span>
                                ) : (
                                    <>
                                        <span>{isEditMode ? "Save Twin Calibration" : "Initialize Virtual Twin Environment"}</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;
