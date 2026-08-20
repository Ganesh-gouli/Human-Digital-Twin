import React, { useState, useEffect } from 'react';

interface StorySceneProps {
    gameState: 'idle' | 'entering' | 'transforming' | 'exiting';
}

const StoryScene: React.FC<StorySceneProps> = ({ gameState }) => {
    // Door glow intensity based on state
    const getDoorGlow = () => {
        switch (gameState) {
            case 'idle': return 'drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]';
            case 'entering': return 'drop-shadow-[0_0_30px_rgba(255,255,255,0.6)]';
            case 'transforming': return 'drop-shadow-[0_0_60px_rgba(0,255,255,0.8)]';
            case 'exiting': return 'drop-shadow-[0_0_40px_rgba(255,255,255,0.5)]';
            default: return '';
        }
    };

    return (
        <div
            className="relative w-full h-[500px] flex items-end justify-center perspective-1000"
            style={{
                maskImage: 'radial-gradient(circle at center bottom, black 40%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(circle at center bottom, black 40%, transparent 100%)'
            }}
        >

            {/* Ambient Floor Glow */}
            <div className={`absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-teal-500/20 to-transparent transition-opacity duration-1000 ${gameState === 'transforming' ? 'opacity-100' : 'opacity-30'}`}></div>

            {/* The Door */}
            <div className={`relative z-10 transition-all duration-1000 transform ${getDoorGlow()}`}>
                <svg width="240" height="360" viewBox="0 0 240 360" className="transition-transform duration-1000">
                    <defs>
                        <linearGradient id="doorLight" x1="0.5" y1="0" x2="0.5" y2="1">
                            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                            <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.2" />
                        </linearGradient>
                        <filter id="doorBlur">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
                        </filter>
                    </defs>

                    {/* Door Frame */}
                    <rect x="10" y="10" width="220" height="350" fill="#1e293b" rx="5" />
                    <rect x="25" y="25" width="190" height="335" fill="#0f172a" stroke="#334155" strokeWidth="2" />

                    {/* Inner Light (The Portal) */}
                    <rect
                        x="30" y="30" width="180" height="330"
                        fill="url(#doorLight)"
                        className={`transition-opacity duration-1000 ${gameState === 'idle' ? 'opacity-30' : 'opacity-90'}`}
                    />

                    {/* Door Ajar Line */}
                    <line x1="210" y1="30" x2="210" y2="360" stroke="#000" strokeWidth="2" opacity="0.5" />
                </svg>
            </div>

            {/* Character Container */}
            <div className="absolute bottom-10 z-20 flex justify-center items-end w-40 h-80">

                {/* Office Man (Visible in 'idle' and 'entering') */}
                <div
                    className={`absolute bottom-0 transition-all duration-1000
                        ${gameState === 'idle' ? 'opacity-100 animate-float' : ''}
                        ${gameState === 'entering' ? 'animate-enter' : ''}
                        ${gameState === 'transforming' || gameState === 'exiting' ? 'opacity-0 scale-75' : ''}
                    `}
                >
                    <svg width="150" height="300" viewBox="0 0 150 300">
                        {/* Custom Character based on user image */}
                        <g id="office-man-custom">
                            {/* Legs & Trousers (Blue) */}
                            <path d="M55 200 L55 300 L70 300 L70 200 Z" fill="#1e3a8a" />
                            <path d="M80 200 L80 300 L95 300 L95 200 Z" fill="#1e3a8a" />

                            {/* Shoes (Brown) */}
                            <path d="M53 300 L72 300 L75 310 L50 310 Z" fill="#5D4037" />
                            <path d="M78 300 L97 300 L100 310 L75 310 Z" fill="#5D4037" />

                            {/* Torso (Green Long Sleeve Shirt) */}
                            <path d="M45 90 Q75 300 105 90 L105 200 L45 200 Z" fill="#84cc16" /> {/* Main Body */}

                            {/* Sleeves */}
                            <path d="M45 90 L35 200 L50 200 L55 110 Z" fill="#84cc16" /> {/* Left Arm */}
                            <path d="M105 90 L115 200 L100 200 L95 110 Z" fill="#84cc16" /> {/* Right Arm */}

                            {/* Hands (Skin Tone) */}
                            <path d="M35 200 Q30 220 40 225 Q50 220 50 200" fill="#fcd34d" />
                            <path d="M115 200 Q120 220 110 225 Q100 220 100 200" fill="#fcd34d" />

                            {/* Neck */}
                            <rect x="68" y="80" width="14" height="15" fill="#fcd34d" />

                            {/* Head */}
                            <g transform="translate(75, 60)">
                                {/* Face Shape */}
                                <path d="M-22 -20 Q-25 20 0 35 Q25 20 22 -20 Q22 -45 -22 -45" fill="#fcd34d" />

                                {/* Hair (Brown, Side Part) */}
                                <path d="M-25 -30 Q-30 -60 0 -65 Q30 -60 25 -30 Q25 -10 20 -15 Q10 -5 0 -15 Q-10 -5 -20 -15 Q-25 -10 -25 -30" fill="#8B4513" />
                                <path d="M-20 -50 Q0 -65 20 -50" fill="none" stroke="#5D4037" strokeWidth="1" /> {/* Textual Detail */}

                                {/* Eyes (Simple, Friendly) */}
                                <circle cx="-8" cy="-5" r="2.5" fill="#374151" />
                                <circle cx="8" cy="-5" r="2.5" fill="#374151" />

                                {/* Eyebrows */}
                                <path d="M-12 -12 Q-8 -15 -4 -12" stroke="#5D4037" strokeWidth="1.5" fill="none" />
                                <path d="M4 -12 Q8 -15 12 -12" stroke="#5D4037" strokeWidth="1.5" fill="none" />

                                {/* Nose */}
                                <path d="M-1 0 L2 8 L-1 8" fill="none" stroke="#d97706" strokeWidth="1" opacity="0.5" />

                                {/* Smile */}
                                <path d="M-5 18 Q0 22 5 18" stroke="#be123c" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                            </g>
                        </g>
                    </svg>
                </div>

                {/* Doctor (Visible in 'exiting') */}
                <div
                    className={`absolute bottom-0 transition-opacity duration-1000
                        ${gameState === 'exiting' ? 'opacity-100 animate-exit' : 'opacity-0'}
                    `}
                >
                    <svg width="180" height="320" viewBox="0 0 180 320">
                        {/* Doctor Character based on image */}
                        <g id="doctor-custom">
                            <defs>
                                <linearGradient id="coatShade" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="#f3f4f6" />
                                    <stop offset="100%" stopColor="#e5e7eb" />
                                </linearGradient>
                            </defs>

                            {/* Legs & Trousers */}
                            <path d="M65 220 L65 320 L85 320 L85 220 Z" fill="#1e293b" /> {/* Dark Trousers */}
                            <path d="M95 220 L95 320 L115 320 L115 220 Z" fill="#1e293b" />

                            {/* Torso / Lab Coat Body */}
                            <path d="M45 120 Q90 300 135 120 L135 250 L45 250 Z" fill="url(#coatShade)" stroke="#d1d5db" />
                            <line x1="90" y1="120" x2="90" y2="250" stroke="#d1d5db" />

                            {/* Shirt & Tie Area */}
                            <path d="M90 120 L75 80 L105 80 Z" fill="#3b82f6" /> {/* Blue Shirt */}
                            <path d="M85 80 L95 80 L92 110 L88 110 Z" fill="#1e3a8a" /> {/* Dark Tie */}

                            {/* Neck */}
                            <rect x="80" y="70" width="20" height="15" fill="#fcd34d" /> {/* Fair/Tan Skin */}

                            {/* Head */}
                            <g transform="translate(90, 50)">
                                {/* Face Shape - more angular jaw */}
                                <path d="M-25 -20 Q-27 20 0 35 Q27 20 25 -20 Q25 -40 -25 -40" fill="#fcd34d" />

                                {/* Hair - Brown Spiky Quiff */}
                                <path d="M-28 -25 Q-35 -50 0 -55 Q35 -50 28 -25 Q25 -10 20 -15 Q10 -5 0 -15 Q-10 -5 -20 -15 Q-25 -10 -28 -25" fill="#5D4037" />
                                <path d="M0 -55 Q10 -70 20 -60 Q10 -55 0 -55" fill="#5D4037" /> {/* Spikes */}

                                {/* Glasses - Thick Black Frames */}
                                <g stroke="#1f2937" strokeWidth="2.5" fill="none">
                                    <rect x="-22" y="-12" width="18" height="12" rx="2" fill="rgba(255,255,255,0.2)" />
                                    <rect x="4" y="-12" width="18" height="12" rx="2" fill="rgba(255,255,255,0.2)" />
                                    <line x1="-4" y1="-6" x2="4" y2="-6" strokeWidth="2" /> {/* Bridge */}
                                </g>

                                {/* Eyes */}
                                <g fill="#374151">
                                    <circle cx="-13" cy="-6" r="2.5" />
                                    <circle cx="13" cy="-6" r="2.5" />
                                </g>
                                {/* Eyebrows */}
                                <path d="M-22 -18 Q-13 -22 -4 -18" stroke="#5D4037" strokeWidth="2" fill="none" />
                                <path d="M4 -18 Q13 -22 22 -18" stroke="#5D4037" strokeWidth="2" fill="none" />

                                {/* Smile - Confident */}
                                <path d="M-8 15 Q0 20 8 15" stroke="#be123c" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                            </g>

                            {/* Stethoscope around neck */}
                            <path d="M70 120 C70 180 110 180 110 120" fill="none" stroke="#1f2937" strokeWidth="3" />
                            <circle cx="70" cy="170" r="5" fill="#9ca3af" stroke="#4b5563" strokeWidth="1" />

                            {/* Hands in Pockets / Folded */}
                            <path d="M45 200 Q40 220 55 230" fill="none" stroke="#d1d5db" strokeWidth="2" />
                            <path d="M135 200 Q140 220 125 230" fill="none" stroke="#d1d5db" strokeWidth="2" />
                        </g>
                    </svg>
                </div>

                {/* Light Burst Effect (During Transformation) */}
                <div className={`absolute top-0 w-64 h-64 bg-cyan-400/50 rounded-full blur-[80px] transition-all duration-500 ${gameState === 'transforming' ? 'opacity-100 scale-150' : 'opacity-0 scale-50'}`}></div>

            </div>
        </div>
    );
};

export default StoryScene;
