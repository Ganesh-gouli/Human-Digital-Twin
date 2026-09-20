import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MolecularModel3DProps {
    position?: [number, number, number];
    scale?: number;
    active?: boolean;
    mode?: 'molecule' | 'pathogen';
    speed?: number;
    onClick?: () => void;
}

// Atom types & CPK colors
interface Atom {
    pos: THREE.Vector3;
    element: 'C' | 'N' | 'O' | 'H' | 'P';
    color: string;
    radius: number;
}

interface Bond {
    start: THREE.Vector3;
    end: THREE.Vector3;
    order: 1 | 2;
}

export const MolecularModel3D: React.FC<MolecularModel3DProps> = ({
    position = [2.4, 0, 0],
    scale = 0.85,
    active = true,
    mode = 'molecule',
    speed = 1.0,
    onClick
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const orbitalRing1 = useRef<THREE.Group>(null);
    const orbitalRing2 = useRef<THREE.Group>(null);
    const orbitalRing3 = useRef<THREE.Group>(null);
    const pedestalRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);

    // ── Generate Molecular Structure ──
    const { atoms, bonds } = useMemo(() => {
        const atomList: Atom[] = [];
        const bondList: Bond[] = [];

        // Benzene ring core (6 carbons)
        const ringRadius = 0.65;
        const ringPositions: THREE.Vector3[] = [];
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const p = new THREE.Vector3(Math.cos(angle) * ringRadius, Math.sin(angle) * ringRadius, 0);
            ringPositions.push(p);
            atomList.push({
                pos: p,
                element: 'C',
                color: '#38bdf8', // Cyber Cyan Carbon
                radius: 0.12
            });
        }

        // Ring bonds
        for (let i = 0; i < 6; i++) {
            const next = (i + 1) % 6;
            bondList.push({
                start: ringPositions[i],
                end: ringPositions[next],
                order: i % 2 === 0 ? 2 : 1
            });
        }

        // Functional branches
        // Branch 1: Carboxyl group at top (O=C-OH)
        const cTop = new THREE.Vector3(0, ringRadius + 0.55, 0.1);
        atomList.push({ pos: cTop, element: 'C', color: '#38bdf8', radius: 0.11 });
        bondList.push({ start: ringPositions[1], end: cTop, order: 1 });

        const oDouble = new THREE.Vector3(0.45, ringRadius + 0.85, 0.2);
        atomList.push({ pos: oDouble, element: 'O', color: '#f43f5e', radius: 0.14 });
        bondList.push({ start: cTop, end: oDouble, order: 2 });

        const oSingle = new THREE.Vector3(-0.45, ringRadius + 0.85, -0.1);
        atomList.push({ pos: oSingle, element: 'O', color: '#f43f5e', radius: 0.13 });
        bondList.push({ start: cTop, end: oSingle, order: 1 });

        const h1 = new THREE.Vector3(-0.65, ringRadius + 1.15, -0.15);
        atomList.push({ pos: h1, element: 'H', color: '#f8fafc', radius: 0.08 });
        bondList.push({ start: oSingle, end: h1, order: 1 });

        // Branch 2: Amine group at bottom right (NH2)
        const nPos = new THREE.Vector3(ringRadius + 0.5, -ringRadius * 0.5, 0.15);
        atomList.push({ pos: nPos, element: 'N', color: '#818cf8', radius: 0.13 });
        bondList.push({ start: ringPositions[0], end: nPos, order: 1 });

        const h2 = new THREE.Vector3(ringRadius + 0.85, -ringRadius * 0.4, 0.35);
        atomList.push({ pos: h2, element: 'H', color: '#f8fafc', radius: 0.08 });
        bondList.push({ start: nPos, end: h2, order: 1 });

        const h3 = new THREE.Vector3(ringRadius + 0.75, -ringRadius * 0.9, -0.1);
        atomList.push({ pos: h3, element: 'H', color: '#f8fafc', radius: 0.08 });
        bondList.push({ start: nPos, end: h3, order: 1 });

        // Branch 3: Phosphate group at bottom left
        const pPos = new THREE.Vector3(-ringRadius - 0.5, -ringRadius * 0.5, -0.15);
        atomList.push({ pos: pPos, element: 'P', color: '#fbbf24', radius: 0.15 });
        bondList.push({ start: ringPositions[4], end: pPos, order: 1 });

        const oP1 = new THREE.Vector3(-ringRadius - 0.9, -ringRadius * 0.2, 0.1);
        atomList.push({ pos: oP1, element: 'O', color: '#f43f5e', radius: 0.12 });
        bondList.push({ start: pPos, end: oP1, order: 2 });

        const oP2 = new THREE.Vector3(-ringRadius - 0.75, -ringRadius * 0.95, -0.35);
        atomList.push({ pos: oP2, element: 'O', color: '#f43f5e', radius: 0.12 });
        bondList.push({ start: pPos, end: oP2, order: 1 });

        return { atoms: atomList, bonds: bondList };
    }, []);

    // ── Generate Viral Pathogen Spikes (For Pathogen mode) ──
    const pathogenSpikes = useMemo(() => {
        const spikes: Array<{ dir: THREE.Vector3; rot: THREE.Euler; length: number }> = [];
        const count = 30;
        for (let i = 0; i < count; i++) {
            const phi = Math.acos(-1 + (2 * i) / count);
            const theta = Math.sqrt(count * Math.PI) * phi;
            const x = Math.cos(theta) * Math.sin(phi);
            const y = Math.sin(theta) * Math.sin(phi);
            const z = Math.cos(phi);

            const dir = new THREE.Vector3(x, y, z).normalize();
            const rot = new THREE.Euler(
                Math.atan2(Math.sqrt(x * x + y * y), z),
                0,
                Math.atan2(y, x)
            );
            spikes.push({ dir, rot, length: 0.35 });
        }
        return spikes;
    }, []);

    // Animation: Multi-axis 3D tumbling & quantum electron orbital spin
    useFrame((state, delta) => {
        if (!groupRef.current) return;
        const t = state.clock.elapsedTime * speed;

        // Smooth tumbling rotation
        groupRef.current.rotation.y += delta * 0.6 * speed;
        groupRef.current.rotation.x = Math.sin(t * 0.4) * 0.15;
        // Floating levitation
        groupRef.current.position.y = position[1] + Math.sin(t * 0.8 + 1.0) * 0.08;

        // Orbiting electron rings
        if (orbitalRing1.current) orbitalRing1.current.rotation.z += delta * 1.8 * speed;
        if (orbitalRing2.current) orbitalRing2.current.rotation.y += delta * 1.4 * speed;
        if (orbitalRing3.current) orbitalRing3.current.rotation.x += delta * 2.2 * speed;

        if (pedestalRef.current) pedestalRef.current.rotation.y += delta * 0.3;
    });

    if (!active) return null;

    return (
        <group position={position} scale={hovered ? scale * 1.05 : scale}>
            {/* Main Interactive Model */}
            <group
                ref={groupRef}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick?.();
                }}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHovered(true);
                    document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                    setHovered(false);
                    document.body.style.cursor = 'auto';
                }}
            >
                {mode === 'molecule' ? (
                    // ── 3D Quantum Molecular Drug Ligand ──
                    <group>
                        {/* Atoms */}
                        {atoms.map((atom, i) => (
                            <mesh key={`atom-${i}`} position={atom.pos}>
                                <sphereGeometry args={[atom.radius, 16, 16]} />
                                <meshStandardMaterial
                                    color={atom.color}
                                    emissive={atom.color}
                                    emissiveIntensity={hovered ? 0.8 : 0.45}
                                    roughness={0.15}
                                    metalness={0.7}
                                />
                            </mesh>
                        ))}

                        {/* Covalent Bond Cylinders */}
                        {bonds.map((bond, i) => {
                            const mid = new THREE.Vector3().addVectors(bond.start, bond.end).multiplyScalar(0.5);
                            const length = bond.start.distanceTo(bond.end);
                            const orientation = new THREE.Matrix4();
                            orientation.lookAt(bond.start, bond.end, new THREE.Vector3(0, 1, 0));

                            const rot = new THREE.Euler().setFromRotationMatrix(orientation);

                            return (
                                <group key={`bond-${i}`} position={mid} rotation={rot}>
                                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                                        <cylinderGeometry args={[bond.order === 2 ? 0.04 : 0.03, bond.order === 2 ? 0.04 : 0.03, length, 8]} />
                                        <meshStandardMaterial
                                            color="#94a3b8"
                                            emissive="#38bdf8"
                                            emissiveIntensity={hovered ? 0.6 : 0.25}
                                            roughness={0.2}
                                            metalness={0.8}
                                        />
                                    </mesh>
                                </group>
                            );
                        })}

                        {/* Quantum Electron Valence Probability Rings */}
                        <group ref={orbitalRing1} rotation={[Math.PI / 4, 0, 0]}>
                            <mesh>
                                <torusGeometry args={[1.5, 0.015, 12, 48]} />
                                <meshBasicMaterial color="#00f0ff" transparent opacity={0.4} />
                            </mesh>
                            {/* Electron Bead */}
                            <mesh position={[1.5, 0, 0]}>
                                <sphereGeometry args={[0.045, 8, 8]} />
                                <meshBasicMaterial color="#ffffff" />
                            </mesh>
                        </group>

                        <group ref={orbitalRing2} rotation={[0, Math.PI / 3, Math.PI / 6]}>
                            <mesh>
                                <torusGeometry args={[1.65, 0.015, 12, 48]} />
                                <meshBasicMaterial color="#10b981" transparent opacity={0.35} />
                            </mesh>
                            <mesh position={[0, 1.65, 0]}>
                                <sphereGeometry args={[0.045, 8, 8]} />
                                <meshBasicMaterial color="#a7f3d0" />
                            </mesh>
                        </group>

                        <group ref={orbitalRing3} rotation={[Math.PI / 2.5, Math.PI / 4, 0]}>
                            <mesh>
                                <torusGeometry args={[1.4, 0.015, 12, 48]} />
                                <meshBasicMaterial color="#a855f7" transparent opacity={0.35} />
                            </mesh>
                            <mesh position={[0, 0, 1.4]}>
                                <sphereGeometry args={[0.045, 8, 8]} />
                                <meshBasicMaterial color="#e9d5ff" />
                            </mesh>
                        </group>
                    </group>
                ) : (
                    // ── 3D Viral Pathogen & Capsid Core ──
                    <group>
                        {/* Central Viral Lipid Membrane Envelope */}
                        <mesh>
                            <icosahedronGeometry args={[0.75, 2]} />
                            <meshStandardMaterial
                                color="#f43f5e"
                                emissive="#881337"
                                emissiveIntensity={0.6}
                                roughness={0.3}
                                metalness={0.6}
                                wireframe={false}
                            />
                        </mesh>

                        {/* Inner Capsid Glow */}
                        <mesh>
                            <sphereGeometry args={[0.5, 16, 16]} />
                            <meshStandardMaterial
                                color="#fb7185"
                                emissive="#fb7185"
                                emissiveIntensity={0.8}
                                transparent
                                opacity={0.85}
                            />
                        </mesh>

                        {/* Glycoprotein Receptor Spikes */}
                        {pathogenSpikes.map((spike, i) => {
                            const spikeBase = spike.dir.clone().multiplyScalar(0.72);
                            const spikeTip = spike.dir.clone().multiplyScalar(0.72 + spike.length);
                            return (
                                <group key={`spike-${i}`}>
                                    {/* Spike Stalk */}
                                    <mesh position={spikeBase.clone().lerp(spikeTip, 0.5)}>
                                        <sphereGeometry args={[0.04, 8, 8]} />
                                        <meshStandardMaterial color="#fda4af" emissive="#f43f5e" emissiveIntensity={0.6} />
                                    </mesh>
                                    {/* Spike Knob Head */}
                                    <mesh position={spikeTip}>
                                        <sphereGeometry args={[0.075, 12, 12]} />
                                        <meshStandardMaterial
                                            color="#e11d48"
                                            emissive="#ff0055"
                                            emissiveIntensity={hovered ? 1.0 : 0.7}
                                            roughness={0.2}
                                        />
                                    </mesh>
                                </group>
                            );
                        })}
                    </group>
                )}
            </group>

            {/* Holographic Projection Pedestal Floor Ring */}
            <group ref={pedestalRef} position={[0, -2.0, 0]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.65, 0.72, 32]} />
                    <meshBasicMaterial color={mode === 'molecule' ? '#38bdf8' : '#f43f5e'} transparent opacity={0.4} side={THREE.DoubleSide} />
                </mesh>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.38, 0.42, 24]} />
                    <meshBasicMaterial color={mode === 'molecule' ? '#818cf8' : '#fb7185'} transparent opacity={0.6} side={THREE.DoubleSide} />
                </mesh>
                <mesh position={[0, 0.4, 0]}>
                    <cylinderGeometry args={[0.5, 0.65, 0.8, 16, 1, true]} />
                    <meshBasicMaterial color={mode === 'molecule' ? '#38bdf8' : '#f43f5e'} transparent opacity={0.06} side={THREE.DoubleSide} />
                </mesh>
            </group>
        </group>
    );
};

export default MolecularModel3D;
