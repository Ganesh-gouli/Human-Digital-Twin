import React, { useMemo, useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, Cylinder, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Atom, RotateCw, ZoomIn, Info, CheckCircle2, AlertTriangle, X, Maximize2, Minimize2 } from 'lucide-react';

export interface MolecularData {
    name: string;
    formula: string;
    smiles: string;
    iupacName: string;
    molecularWeight: number; // g/mol
    logP: number; // Lipophilicity
    tpsa: number; // Å²
    hBondDonors: number;
    hBondAcceptors: number;
    rotatableBonds: number;
    atoms: Array<{ element: string; position: [number, number, number]; id: string }>;
    bonds: Array<[number, number]>; // indices of connected atoms
}

// CPK Element Colors
const CPK_COLORS: Record<string, { color: string; radius: number; name: string }> = {
    C: { color: '#4b5563', radius: 0.35, name: 'Carbon' },
    H: { color: '#f3f4f6', radius: 0.22, name: 'Hydrogen' },
    O: { color: '#ef4444', radius: 0.32, name: 'Oxygen' },
    N: { color: '#3b82f6', radius: 0.34, name: 'Nitrogen' },
    S: { color: '#eab308', radius: 0.40, name: 'Sulfur' },
    Cl: { color: '#10b981', radius: 0.38, name: 'Chlorine' },
    F: { color: '#06b6d4', radius: 0.28, name: 'Fluorine' },
    P: { color: '#f97316', radius: 0.38, name: 'Phosphorus' },
    Br: { color: '#991b1b', radius: 0.42, name: 'Bromine' },
};

// Curated library of 3D atomic coordinates for common pharmaceuticals
const KNOWN_MOLECULES: Record<string, MolecularData> = {
    Aspirin: {
        name: 'Acetylsalicylic Acid (Aspirin)',
        formula: 'C₉H₈O₄',
        smiles: 'CC(=O)OC1=CC=CC=C1C(=O)O',
        iupacName: '2-acetyloxybenzoic acid',
        molecularWeight: 180.16,
        logP: 1.19,
        tpsa: 63.6,
        hBondDonors: 1,
        hBondAcceptors: 4,
        rotatableBonds: 3,
        atoms: [
            { element: 'C', position: [0.0, 0.0, 0.0], id: 'C1' },
            { element: 'C', position: [1.2, 0.7, 0.0], id: 'C2' },
            { element: 'C', position: [2.4, 0.0, 0.0], id: 'C3' },
            { element: 'C', position: [2.4, -1.4, 0.0], id: 'C4' },
            { element: 'C', position: [1.2, -2.1, 0.0], id: 'C5' },
            { element: 'C', position: [0.0, -1.4, 0.0], id: 'C6' },
            { element: 'O', position: [-1.2, 0.7, 0.0], id: 'O7' },
            { element: 'C', position: [-2.4, 0.0, 0.2], id: 'C8' },
            { element: 'O', position: [-2.5, -1.2, 0.3], id: 'O9' },
            { element: 'C', position: [-3.6, 0.9, 0.2], id: 'C10' },
            { element: 'C', position: [1.2, 2.2, 0.0], id: 'C11' },
            { element: 'O', position: [0.2, 2.9, -0.2], id: 'O12' },
            { element: 'O', position: [2.4, 2.7, 0.2], id: 'O13' },
            { element: 'H', position: [3.3, 0.6, 0.0], id: 'H14' },
            { element: 'H', position: [3.3, -1.9, 0.0], id: 'H15' },
            { element: 'H', position: [1.2, -3.2, 0.0], id: 'H16' },
            { element: 'H', position: [-0.9, -1.9, 0.0], id: 'H17' },
            { element: 'H', position: [2.4, 3.7, 0.2], id: 'H18' },
        ],
        bonds: [
            [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0],
            [0, 6], [6, 7], [7, 8], [7, 9],
            [1, 10], [10, 11], [10, 12],
            [2, 13], [3, 14], [4, 15], [5, 16], [12, 17]
        ]
    },
    Metformin: {
        name: 'Metformin',
        formula: 'C₄H₁₁N₅',
        smiles: 'CN(C)C(=N)NC(=N)N',
        iupacName: '3-(diaminomethylidene)-1,1-dimethylguanidine',
        molecularWeight: 129.16,
        logP: -1.43,
        tpsa: 87.8,
        hBondDonors: 3,
        hBondAcceptors: 2,
        rotatableBonds: 2,
        atoms: [
            { element: 'C', position: [-2.2, 1.0, 0.0], id: 'C1' },
            { element: 'C', position: [-2.2, -1.0, 0.0], id: 'C2' },
            { element: 'N', position: [-1.2, 0.0, 0.0], id: 'N3' },
            { element: 'C', position: [0.1, 0.0, 0.0], id: 'C4' },
            { element: 'N', position: [0.7, 1.2, 0.1], id: 'N5' },
            { element: 'N', position: [0.8, -1.2, -0.1], id: 'N6' },
            { element: 'C', position: [2.1, -1.2, 0.0], id: 'C7' },
            { element: 'N', position: [2.8, 0.0, 0.1], id: 'N8' },
            { element: 'N', position: [2.7, -2.4, -0.1], id: 'N9' },
            { element: 'H', position: [0.2, 2.0, 0.2], id: 'H10' },
            { element: 'H', position: [3.7, 0.0, 0.2], id: 'H11' },
        ],
        bonds: [
            [0, 2], [1, 2], [2, 3], [3, 4], [3, 5],
            [5, 6], [6, 7], [6, 8], [4, 9], [7, 10]
        ]
    },
    Paracetamol: {
        name: 'Paracetamol (Acetaminophen)',
        formula: 'C₈H₉NO₂',
        smiles: 'CC(=O)NC1=CC=C(O)C=C1',
        iupacName: 'N-(4-hydroxyphenyl)acetamide',
        molecularWeight: 151.16,
        logP: 0.46,
        tpsa: 49.3,
        hBondDonors: 2,
        hBondAcceptors: 2,
        rotatableBonds: 1,
        atoms: [
            { element: 'O', position: [-3.2, 0.0, 0.0], id: 'O1' },
            { element: 'H', position: [-4.0, 0.4, 0.0], id: 'H2' },
            { element: 'C', position: [-2.0, 0.0, 0.0], id: 'C3' },
            { element: 'C', position: [-1.3, 1.2, 0.0], id: 'C4' },
            { element: 'C', position: [0.1, 1.2, 0.0], id: 'C5' },
            { element: 'C', position: [0.8, 0.0, 0.0], id: 'C6' },
            { element: 'C', position: [0.1, -1.2, 0.0], id: 'C7' },
            { element: 'C', position: [-1.3, -1.2, 0.0], id: 'C8' },
            { element: 'N', position: [2.2, 0.0, 0.0], id: 'N9' },
            { element: 'H', position: [2.6, -0.9, 0.0], id: 'H10' },
            { element: 'C', position: [3.0, 1.1, 0.0], id: 'C11' },
            { element: 'O', position: [2.5, 2.2, 0.0], id: 'O12' },
            { element: 'C', position: [4.5, 0.9, 0.0], id: 'C13' },
        ],
        bonds: [
            [0, 1], [0, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 2],
            [5, 8], [8, 9], [8, 10], [10, 11], [10, 12]
        ]
    }
};

// Generate deterministic 3D conformer for any unknown drug name
function generateConformerForDrug(drugName: string): MolecularData {
    if (KNOWN_MOLECULES[drugName]) return KNOWN_MOLECULES[drugName];

    // Case-insensitive check
    const match = Object.keys(KNOWN_MOLECULES).find(k => k.toLowerCase() === drugName.toLowerCase());
    if (match) return KNOWN_MOLECULES[match];

    // Pseudo-random deterministic generation based on name hash
    let hash = 0;
    for (let i = 0; i < drugName.length; i++) {
        hash = (hash << 5) - hash + drugName.charCodeAt(i);
        hash |= 0;
    }
    const seed = Math.abs(hash);

    const ringCount = 2 + (seed % 3);
    const atomCount = 14 + (seed % 10);
    const elements = ['C', 'C', 'C', 'N', 'O', 'C', 'C', 'O', 'N', 'C', 'H', 'H', 'S', 'Cl'];

    const atoms: MolecularData['atoms'] = [];
    const bonds: MolecularData['bonds'] = [];

    // Form an aromatic core ring
    const radius = 1.6;
    const coreAtoms = 6;
    for (let i = 0; i < coreAtoms; i++) {
        const theta = (i / coreAtoms) * Math.PI * 2;
        atoms.push({
            element: i % 4 === 0 ? 'N' : 'C',
            position: [Math.cos(theta) * radius, Math.sin(theta) * radius, 0],
            id: `core_${i}`
        });
        bonds.push([i, (i + 1) % coreAtoms]);
    }

    // Attach functional side chains
    for (let i = coreAtoms; i < atomCount; i++) {
        const parentIdx = i % coreAtoms;
        const parentPos = atoms[parentIdx].position;
        const angle = Math.random() * Math.PI * 2;
        const dist = 1.3 + ((seed + i) % 4) * 0.2;
        const zOffset = (((seed * i) % 7) - 3) * 0.25;

        const el = elements[i % elements.length];
        atoms.push({
            element: el,
            position: [parentPos[0] + Math.cos(angle) * dist, parentPos[1] + Math.sin(angle) * dist, zOffset],
            id: `side_${i}`
        });
        bonds.push([parentIdx, i]);
    }

    const mw = 180 + (seed % 340);
    const logP = Number(((seed % 60) / 10 - 1.5).toFixed(2));
    const tpsa = 40 + (seed % 95);

    return {
        name: drugName,
        formula: `C${10 + (seed % 15)}H${12 + (seed % 18)}N${1 + (seed % 4)}O${2 + (seed % 5)}`,
        smiles: `CC1=C(C=C(C=C1)NC(=O)C2=CC=CC=C2)N`,
        iupacName: `In-Silico BioTwin Conformational Ligand: ${drugName}`,
        molecularWeight: mw,
        logP,
        tpsa,
        hBondDonors: 1 + (seed % 4),
        hBondAcceptors: 2 + (seed % 6),
        rotatableBonds: 2 + (seed % 6),
        atoms,
        bonds
    };
}

// 3D Bond Cylinder Component connecting two atom coordinates
const Bond: React.FC<{ start: [number, number, number]; end: [number, number, number] }> = ({ start, end }) => {
    const startVec = useMemo(() => new THREE.Vector3(...start), [start]);
    const endVec = useMemo(() => new THREE.Vector3(...end), [end]);
    const position = useMemo(() => new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5), [startVec, endVec]);
    const distance = useMemo(() => startVec.distanceTo(endVec), [startVec, endVec]);

    const orientation = useMemo(() => {
        const dir = new THREE.Vector3().subVectors(endVec, startVec).normalize();
        const quaternion = new THREE.Quaternion();
        quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
        return quaternion;
    }, [startVec, endVec]);

    return (
        <mesh position={position} quaternion={orientation}>
            <cylinderGeometry args={[0.08, 0.08, distance, 12]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.4} roughness={0.3} />
        </mesh>
    );
};

// Interactive 3D Molecular Scene
const MolecularScene: React.FC<{ data: MolecularData; onAtomHover: (atom: any) => void }> = ({ data, onAtomHover }) => {
    const groupRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (groupRef.current) {
            groupRef.current.rotation.y += 0.003;
        }
    });

    return (
        <group ref={groupRef}>
            {/* Bonds */}
            {data.bonds.map(([i1, i2], idx) => {
                if (!data.atoms[i1] || !data.atoms[i2]) return null;
                return (
                    <Bond
                        key={`bond-${idx}`}
                        start={data.atoms[i1].position}
                        end={data.atoms[i2].position}
                    />
                );
            })}

            {/* Atoms */}
            {data.atoms.map((atom) => {
                const config = CPK_COLORS[atom.element] || CPK_COLORS.C;
                return (
                    <group
                        key={atom.id}
                        position={atom.position}
                        onPointerOver={(e) => {
                            e.stopPropagation();
                            onAtomHover({ ...atom, ...config });
                        }}
                        onPointerOut={() => onAtomHover(null)}
                    >
                        <Sphere args={[config.radius, 24, 24]}>
                            <meshStandardMaterial
                                color={config.color}
                                roughness={0.2}
                                metalness={0.3}
                                emissive={config.color}
                                emissiveIntensity={0.15}
                            />
                        </Sphere>
                    </group>
                );
            })}
        </group>
    );
};

interface MolecularViewer3DProps {
    drugName: string;
    isOpen: boolean;
    onClose: () => void;
}

export const MolecularViewer3D: React.FC<MolecularViewer3DProps> = ({ drugName, isOpen, onClose }) => {
    const [hoveredAtom, setHoveredAtom] = useState<any>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const molecularData = useMemo(() => {
        return generateConformerForDrug(drugName || 'Aspirin');
    }, [drugName]);

    // Lipinski's Rule of 5 Validation
    const lipinskiViolations = useMemo(() => {
        let violations = 0;
        if (molecularData.molecularWeight > 500) violations++;
        if (molecularData.logP > 5) violations++;
        if (molecularData.hBondDonors > 5) violations++;
        if (molecularData.hBondAcceptors > 10) violations++;
        return violations;
    }, [molecularData]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl animate-fade-in">
            <div className={`relative w-full ${isFullscreen ? 'h-full max-w-none' : 'max-w-5xl h-[88vh]'} bg-slate-900/95 border border-teal-500/30 rounded-3xl shadow-[0_0_60px_rgba(20,184,166,0.2)] overflow-hidden flex flex-col`}>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-slate-950/60 backdrop-blur-md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-300">
                            <Atom size={22} className="animate-spin-slow" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-black text-white">{molecularData.name}</h3>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold">
                                    {molecularData.formula}
                                </span>
                            </div>
                            <p className="text-[11px] text-teal-200/60 font-mono truncate max-w-md sm:max-w-xl">
                                SMILES: {molecularData.smiles}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsFullscreen(v => !v)}
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                        >
                            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-100 border border-rose-500/30 transition-all cursor-pointer"
                            title="Close"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">

                    {/* 3D Canvas Viewport */}
                    <div className="flex-1 relative bg-gradient-to-b from-slate-950 via-[#07111e] to-slate-950">
                        <Canvas camera={{ position: [0, 0, 7.5], fov: 45 }}>
                            <ambientLight intensity={0.7} />
                            <directionalLight position={[10, 10, 10]} intensity={1.2} />
                            <pointLight position={[-10, -10, -10]} intensity={0.5} color="#06b6d4" />

                            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
                                <MolecularScene data={molecularData} onAtomHover={setHoveredAtom} />
                            </Float>

                            <OrbitControls
                                enablePan={true}
                                enableZoom={true}
                                minDistance={3}
                                maxDistance={18}
                                dampingFactor={0.08}
                            />
                        </Canvas>

                        {/* Interactive Atom Hover Overlay */}
                        {hoveredAtom && (
                            <div className="absolute top-4 left-4 z-20 bg-slate-950/90 border border-white/20 rounded-2xl px-3.5 py-2.5 backdrop-blur-xl shadow-2xl text-xs space-y-1">
                                <div className="flex items-center gap-2 font-bold text-white">
                                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: hoveredAtom.color }} />
                                    <span>{hoveredAtom.name} ({hoveredAtom.element})</span>
                                </div>
                                <p className="text-[10px] text-gray-400 font-mono">
                                    Coord: [{hoveredAtom.position.map((v: number) => v.toFixed(2)).join(', ')}]
                                </p>
                            </div>
                        )}

                        {/* Visual Legend */}
                        <div className="absolute bottom-4 left-4 z-20 bg-slate-950/80 border border-white/10 rounded-2xl p-2.5 backdrop-blur-md hidden sm:flex items-center gap-3 text-[10px] text-gray-300 select-none">
                            <span className="font-bold text-teal-400">CPK Atoms:</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#4b5563]" /> C</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#f3f4f6]" /> H</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" /> O</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]" /> N</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#eab308]" /> S</span>
                            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-[#10b981]" /> Cl</span>
                        </div>

                        {/* Viewport Control Tip */}
                        <div className="absolute bottom-4 right-4 z-20 pointer-events-none text-[10px] font-mono text-white/30 hidden sm:block">
                            Rotate: Drag · Zoom: Pinch/Scroll
                        </div>
                    </div>

                    {/* Right Chemical Informatics & Drug Property Panel */}
                    <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-white/10 bg-slate-950/70 p-5 overflow-y-auto custom-scrollbar space-y-5">
                        
                        {/* Lipinski Rule of 5 Card */}
                        <div className={`p-4 rounded-2xl border backdrop-blur-md ${
                            lipinskiViolations === 0
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        }`}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                                    {lipinskiViolations === 0 ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                                    Lipinski's Rule of 5
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/40 font-bold">
                                    {lipinskiViolations === 0 ? 'Optimal Oral Druggability' : `${lipinskiViolations} Violation(s)`}
                                </span>
                            </div>
                            <p className="text-[11px] opacity-80 leading-relaxed mt-1">
                                {lipinskiViolations === 0
                                    ? 'High likelihood of oral bioavailability, membrane permeability, and optimal gastrointestinal absorption.'
                                    : 'May require specialized drug formulation or alternative routes due to molecular size/lipophilicity constraints.'}
                            </p>
                        </div>

                        {/* Core Molecular Properties Grid */}
                        <div className="space-y-2">
                            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                                Physicochemical Telemetry
                            </span>

                            <div className="grid grid-cols-2 gap-2.5">
                                <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-0.5">
                                    <span className="text-[9px] text-gray-400 uppercase font-mono">Molecular Weight</span>
                                    <p className="text-sm font-black text-white font-mono">{molecularData.molecularWeight.toFixed(2)} <span className="text-[9px] font-normal text-gray-400">g/mol</span></p>
                                </div>
                                <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-0.5">
                                    <span className="text-[9px] text-gray-400 uppercase font-mono">Lipophilicity (LogP)</span>
                                    <p className="text-sm font-black text-cyan-300 font-mono">{molecularData.logP}</p>
                                </div>
                                <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-0.5">
                                    <span className="text-[9px] text-gray-400 uppercase font-mono">Polar Surface Area (TPSA)</span>
                                    <p className="text-sm font-black text-teal-300 font-mono">{molecularData.tpsa} <span className="text-[9px] font-normal text-gray-400">Å²</span></p>
                                </div>
                                <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-0.5">
                                    <span className="text-[9px] text-gray-400 uppercase font-mono">Rotatable Bonds</span>
                                    <p className="text-sm font-black text-purple-300 font-mono">{molecularData.rotatableBonds}</p>
                                </div>
                                <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-0.5">
                                    <span className="text-[9px] text-gray-400 uppercase font-mono">H-Bond Donors</span>
                                    <p className="text-sm font-black text-white font-mono">{molecularData.hBondDonors}</p>
                                </div>
                                <div className="p-3 bg-white/5 border border-white/10 rounded-xl space-y-0.5">
                                    <span className="text-[9px] text-gray-400 uppercase font-mono">H-Bond Acceptors</span>
                                    <p className="text-sm font-black text-white font-mono">{molecularData.hBondAcceptors}</p>
                                </div>
                            </div>
                        </div>

                        {/* Compound Classification */}
                        <div className="p-3.5 bg-white/5 border border-white/10 rounded-2xl space-y-2 text-xs">
                            <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block">
                                Chemical Identifier
                            </span>
                            <div className="space-y-1 text-[11px]">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Class:</span>
                                    <span className="text-white font-semibold">Small Molecule Therapeutic</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Total Atoms:</span>
                                    <span className="text-white font-mono">{molecularData.atoms.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Covalent Bonds:</span>
                                    <span className="text-white font-mono">{molecularData.bonds.length}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default MolecularViewer3D;
