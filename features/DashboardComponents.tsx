import React from 'react';

export const LiquidGlassCard = ({ children, className = '', containerClassName = '' }: { children: React.ReactNode, className?: string, containerClassName?: string }) => {
    const cardRef = React.useRef<HTMLDivElement>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        cardRef.current.style.setProperty('--x', `${x}px`);
        cardRef.current.style.setProperty('--y', `${y}px`);
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMouseMove}
            className={`group relative overflow-hidden rounded-[24px] border border-white/10 hover:border-white/20 bg-white/[0.03] backdrop-blur-[30px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.2)] transition-all duration-500 ${containerClassName}`}
        >
            <div className="pointer-events-none absolute -inset-px rounded-[24px] opacity-0 transition duration-500 group-hover:opacity-100 z-0" style={{ background: 'radial-gradient(600px circle at var(--x, 50%) var(--y, 50%), rgba(45,212,191,0.15), transparent 40%)' }}></div>
            <div className={`relative z-10 w-full h-full ${className}`}>
                {children}
            </div>
        </div>
    );
};
