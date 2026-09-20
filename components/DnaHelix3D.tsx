import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DnaHelix3DProps {
    position?: [number, number, number];
    scale?: number;
    active?: boolean;
    speed?: number;
    onClick?: () => void;
}

// Nucleotide base pair definitions
const BASE_COLORS = {
    A: '#06b6d4', // Adenine (Cyan)
    T: '#10b981', // Thymine (Emerald)
    G: '#a855f7', // Guanine (Purple)
    C: '#f43f5e', // Cytosine (Rose)
    backbone: '#38bdf8' // Phosphate-deoxyribose backbone
};

const BASE_PAIRS: Array<['A' | 'G', 'T' | 'C']> = [
    ['A', 'T'],
    ['G', 'C'],
    ['T', 'A'],
    ['C', 'G'],
    ['A', 'T'],
    ['C', 'G'],
    ['G', 'C'],
    ['T', 'A'],
    ['A', 'T'],
    ['G', 'C'],
    ['T', 'A'],
    ['C', 'G'],
    ['A', 'T'],
    ['G', 'C'],
    ['T', 'A'],
    ['C', 'G'],
];

export const DnaHelix3D: React.FC<DnaHelix3DProps> = ({
    position = [-2.4, 0, 0],
    scale = 0.85,
    active = true,
    speed = 1.2,
    onClick
}) => {
    const groupRef = useRef<THREE.Group>(null);
    const pedestalRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);

    // Number of base pairs along the helix
    const numPairs = 32;
    const height = 3.6;
    const radius = 0.42;
    const turns = 2.5;

    // Pre-calculate geometry nodes
    const { nodes, rungs } = useMemo(() => {
        const nodeList: Array<{ pos1: THREE.Vector3; pos2: THREE.Vector3; basePair: ['A' | 'G', 'T' | 'C'] }> = [];
        const rungList: Array<{
            center1: THREE.Vector3;
            center2: THREE.Vector3;
            rot1: THREE.Euler;
            rot2: THREE.Euler;
            color1: string;
            color2: string;
            length: number;
        }> = [];

        for (let i = 0; i < numPairs; i++) {
            const t = (i / numPairs) * turns * Math.PI * 2;
            const y = (i / numPairs) * height - height / 2;

            // Strand 1
            const x1 = Math.cos(t) * radius;
            const z1 = Math.sin(t) * radius;
            const pos1 = new THREE.Vector3(x1, y, z1);

            // Strand 2 (180 degrees out of phase)
            const x2 = Math.cos(t + Math.PI) * radius;
            const z2 = Math.sin(t + Math.PI) * radius;
            const pos2 = new THREE.Vector3(x2, y, z2);

            const pairIndex = i % BASE_PAIRS.length;
            const pair = BASE_PAIRS[pairIndex];
            nodeList.push({ pos1, pos2, basePair: pair });

            // Half-rungs meeting in center
            const mid = new THREE.Vector3((x1 + x2) / 2, y, (z1 + z2) / 2);
            const half1 = new THREE.Vector3().lerpVectors(pos1, mid, 0.5);
            const half2 = new THREE.Vector3().lerpVectors(pos2, mid, 0.5);

            // Angles
            const angle = Math.atan2(z2 - z1, x2 - x1);
            const rot = new THREE.Euler(0, -angle, Math.PI / 2);

            rungList.push({
                center1: half1,
                center2: half2,
                rot1: rot,
                rot2: rot,
                color1: BASE_COLORS[pair[0]],
                color2: BASE_COLORS[pair[1]],
                length: radius * 0.95
            });
        }

        return { nodes: nodeList, rungs: rungList };
    }, [numPairs, height, radius, turns]);

    // Animate helix rotation & floating levitation
    useFrame((state, delta) => {
        if (!groupRef.current) return;
        const t = state.clock.elapsedTime * speed;
        // Continuous axial rotation
        groupRef.current.rotation.y += delta * 0.8 * speed;
        // Gentle floating levitation
        groupRef.current.position.y = position[1] + Math.sin(t * 0.9) * 0.08;

        if (pedestalRef.current) {
            pedestalRef.current.rotation.y -= delta * 0.3;
        }
    });

    if (!active) return null;

    return (
        <group position={position} scale={hovered ? scale * 1.05 : scale}>
            {/* Main Rotating Helix Group */}
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
                {/* Nucleotide Spheres along Backbone */}
                {nodes.map((node, i) => (
                    <group key={`node-${i}`}>
                        {/* Strand 1 Backbone Sphere */}
                        <mesh position={node.pos1}>
                            <sphereGeometry args={[0.065, 12, 12]} />
                            <meshStandardMaterial
                                color={BASE_COLORS.backbone}
                                emissive={BASE_COLORS.backbone}
                                emissiveIntensity={hovered ? 0.9 : 0.5}
                                roughness={0.2}
                                metalness={0.8}
                            />
                        </mesh>

                        {/* Strand 2 Backbone Sphere */}
                        <mesh position={node.pos2}>
                            <sphereGeometry args={[0.065, 12, 12]} />
                            <meshStandardMaterial
                                color={BASE_COLORS.backbone}
                                emissive={BASE_COLORS.backbone}
                                emissiveIntensity={hovered ? 0.9 : 0.5}
                                roughness={0.2}
                                metalness={0.8}
                            />
                        </mesh>
                    </group>
                ))}

                {/* Base-Pair Connecting Hydrogen Rungs */}
                {rungs.map((rung, i) => (
                    <group key={`rung-${i}`}>
                        {/* Left Half Base (A or G) */}
                        <mesh position={rung.center1} rotation={rung.rot1}>
                            <cylinderGeometry args={[0.025, 0.025, rung.length, 8]} />
                            <meshStandardMaterial
                                color={rung.color1}
                                emissive={rung.color1}
                                emissiveIntensity={hovered ? 1.0 : 0.6}
                                roughness={0.3}
                                metalness={0.6}
                            />
                        </mesh>

                        {/* Right Half Base (T or C) */}
                        <mesh position={rung.center2} rotation={rung.rot2}>
                            <cylinderGeometry args={[0.025, 0.025, rung.length, 8]} />
                            <meshStandardMaterial
                                color={rung.color2}
                                emissive={rung.color2}
                                emissiveIntensity={hovered ? 1.0 : 0.6}
                                roughness={0.3}
                                metalness={0.6}
                            />
                        </mesh>

                        {/* Center Hydrogen Bond Dot */}
                        <mesh position={[(nodes[i].pos1.x + nodes[i].pos2.x) / 2, nodes[i].pos1.y, (nodes[i].pos1.z + nodes[i].pos2.z) / 2]}>
                            <sphereGeometry args={[0.028, 8, 8]} />
                            <meshBasicMaterial color="#ffffff" />
                        </mesh>
                    </group>
                ))}
            </group>

            {/* Holographic Projection Pedestal Floor Ring */}
            <group ref={pedestalRef} position={[0, -height / 2 - 0.25, 0]}>
                {/* Outer Ring */}
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.65, 0.72, 32]} />
                    <meshBasicMaterial color="#00f0ff" transparent opacity={0.4} side={THREE.DoubleSide} />
                </mesh>

                {/* Inner Ring */}
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.38, 0.42, 24]} />
                    <meshBasicMaterial color="#10b981" transparent opacity={0.6} side={THREE.DoubleSide} />
                </mesh>

                {/* Upward Light Beam */}
                <mesh position={[0, 0.4, 0]}>
                    <cylinderGeometry args={[0.5, 0.65, 0.8, 16, 1, true]} />
                    <meshBasicMaterial color="#00e5ff" transparent opacity={0.06} side={THREE.DoubleSide} />
                </mesh>
            </group>
        </group>
    );
};

export default DnaHelix3D;
