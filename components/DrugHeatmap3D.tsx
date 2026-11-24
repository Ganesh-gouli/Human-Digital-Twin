import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Sparkles, ContactShadows, useGLTF, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { HeatmapEffect } from '../types';
import gsap from 'gsap';
import { LandmarkIndicators, CalibrationMode } from './LandmarkIndicator';

// Configure local Draco decoder and preload only the primary Digital Twin model
try {
    useGLTF.setDecoderPath('/draco/gltf/');
    useGLTF.preload('/Human.glb');
} catch (e) {
    console.warn("GLTF preloading warning:", e);
}

const CanvasLoaderFallback: React.FC<{ label?: string }> = ({ label = '3D Anatomy' }) => {
    const { progress } = useProgress();
    const [smoothProgress, setSmoothProgress] = useState(25);

    useEffect(() => {
        const interval = setInterval(() => {
            setSmoothProgress(prev => {
                const target = Math.max(prev, Math.round(progress));
                if (target > prev) {
                    return Math.min(100, prev + Math.max(1, Math.ceil((target - prev) * 0.35)));
                }
                if (prev < 90) return prev + 2;
                if (prev < 98) return prev + 1;
                return prev;
            });
        }, 60);
        return () => clearInterval(interval);
    }, [progress]);

    const displayProgress = Math.min(100, Math.max(smoothProgress, Math.round(progress)));

    return (
        <Html center>
            <div className="flex flex-col items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl rounded-2xl border border-cyan-500/30 text-center shadow-[0_0_50px_rgba(6,182,212,0.25)] min-w-[260px] pointer-events-none select-none">
                <div className="relative mb-3 flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
                    <span className="absolute text-[10px] font-mono font-bold text-cyan-300">
                        {displayProgress}%
                    </span>
                </div>
                <span className="text-xs font-black text-cyan-300 uppercase tracking-widest mb-1">
                    Loading {label}
                </span>
                <span className="text-[10px] text-gray-400 font-mono mb-3">
                    {displayProgress < 50 ? 'Streaming 3D Geometry...' : displayProgress < 85 ? 'Compiling Hologram Shaders...' : 'Finalizing Digital Twin...'}
                </span>
                <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden border border-cyan-500/20">
                    <div
                        className="bg-gradient-to-r from-teal-400 via-cyan-400 to-blue-500 h-full transition-all duration-300 shadow-[0_0_12px_#22d3ee]"
                        style={{ width: `${displayProgress}%` }}
                    />
                </div>
            </div>
        </Html>
    );
};

// ─── Base color (matches Iron Man Hologram) ───────────────────────────────────
const BASE_COLOR = new THREE.Color('#00ffff');

// ─── Holographic Chamber Floor ────────────────────────────────────────────────
const HolographicChamberFloor: React.FC = () => {
    return (
        <group position={[0, -2.15, 0]}>
            {/* Fine cyber grid */}
            <gridHelper args={[8, 16, '#06b6d4', '#0369a1']}>
                <meshBasicMaterial transparent opacity={0.12} />
            </gridHelper>
            {/* Outer concentric glowing ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                <ringGeometry args={[1.7, 1.73, 64]} />
                <meshBasicMaterial color="#06b6d4" transparent opacity={0.35} side={THREE.DoubleSide} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
                <ringGeometry args={[2.5, 2.52, 64]} />
                <meshBasicMaterial color="#0284c7" transparent opacity={0.2} side={THREE.DoubleSide} />
            </mesh>
            {/* Ground radial glow */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
                <circleGeometry args={[2.8, 64]} />
                <meshBasicMaterial color="#06b6d4" transparent opacity={0.03} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
};

// ─── Organ synonym definitions ────────────────────────────────────────────────
const ORGAN_SYNONYMS: Record<string, string[]> = {
    'Lungs': ['lung', 'lungs', 'respiratory', 'pulmonary', 'alveol', 'bronch', 'throat', 'airway'],
    'Heart': ['heart', 'cardiac', 'cardio', 'circulatory', 'blood', 'vessel', 'myocard', 'coronary', 'cardiovascular'],
    'Brain': ['brain', 'cns', 'neural', 'cerebral', 'cognitive', 'head', 'encephal'],
    'Nervous System': ['nervous', 'spinal', 'nervous system'],
    'Liver': ['liver', 'hepatic', 'metabolic', 'hepat'],
    'Kidney': ['kidney', 'kidneys', 'renal', 'nephr', 'filtration', 'urine', 'urinary'],
    'Stomach': ['stomach', 'gastric', 'gi', 'gastro', 'digestive', 'abdomen'],
    'Intestines': ['intestines', 'intestinal', 'colon', 'bowel', 'gut'],
    'Muscles': ['muscle', 'muscles', 'skeletal', 'bone', 'joint', 'motor'],
    'Skin': ['skin', 'dermal', 'epiderm', 'cutaneous', 'integumentary']
};

// ─── Landmark Engine replaced the old region-bucket system ───────────────────
// See: data/anatomicalLandmarks.ts + components/LandmarkIndicator.tsx


function matchOrganName(structureName: string, organKey: string): boolean {
    const sn = (structureName || '').toLowerCase().trim();
    const ok = organKey.toLowerCase();
    
    const list = ORGAN_SYNONYMS[organKey];
    if (list && list.some(syn => sn === syn || sn.includes(syn) || syn.includes(sn))) {
        return true;
    }
    
    return sn === ok || sn.includes(ok) || ok.includes(sn);
}

// ─── Surface Heatmap 4-Tier Color Ramp: ───────────────────────────────────────
// Low (< 0.33): vec3(0.0, 0.85, 1.0) (#00d9ff Cyan/Blue)
// Moderate (0.33 - 0.66): vec3(0.08, 0.92, 0.45) (#14eb73 Emerald Green)
// Significant (0.66 - 0.85): vec3(0.98, 0.78, 0.05) (#fac70d Amber Yellow)
// High (> 0.85): vec3(0.98, 0.15, 0.20) (#fa2633 Crimson Red)
function heatColor(t: number): THREE.Color {
    t = Math.max(0, Math.min(1, t));
    const c = new THREE.Color();
    if (t < 0.33) {
        return c.set('#00d9ff');
    } else if (t < 0.66) {
        const s = (t - 0.33) / 0.33;
        return c.lerpColors(new THREE.Color('#00d9ff'), new THREE.Color('#14eb73'), s);
    } else if (t < 0.85) {
        const s = (t - 0.66) / 0.19;
        return c.lerpColors(new THREE.Color('#14eb73'), new THREE.Color('#fac70d'), s);
    } else {
        const s = Math.min(1, (t - 0.85) / 0.15);
        return c.lerpColors(new THREE.Color('#fac70d'), new THREE.Color('#fa2633'), s);
    }
}

// ─── UI Severity Legend Colors: ──────────────────────────────────────────────
// Low: #facc15 (Yellow), Moderate: #f97316 (Orange), High: #ef4444 (Bright Red), Critical: #991b1b (Deep Red)
function heatLabelColor(v: number) {
    if (v < 0.33) return { text: 'Low Impact', hex: '#facc15' };
    if (v < 0.66) return { text: 'Moderate Impact', hex: '#f97316' };
    if (v < 0.85) return { text: 'High Impact', hex: '#ef4444' };
    return { text: 'Critical Impact', hex: '#991b1b' };
}

// ─── Organ bounding-box zones (Y = bottom→top fraction of model) ──────────────
interface OrganZone {
    yMin: number; yMax: number;
    xMin?: number; xMax?: number; // normalized -0.5–0.5
}

const ORGAN_ZONES: Record<string, OrganZone> = {
    'Brain': { yMin: 0.88, yMax: 1.00 },
    'Nervous System': { yMin: 0.00, yMax: 1.00 },
    'Lungs': { yMin: 0.68, yMax: 0.83 },
    'Heart': { yMin: 0.70, yMax: 0.81, xMin: -0.18, xMax: 0.04 },
    'Liver': { yMin: 0.57, yMax: 0.71, xMin: 0.00, xMax: 0.22 },
    'Stomach': { yMin: 0.57, yMax: 0.69, xMin: -0.22, xMax: 0.04 },
    'Kidney': { yMin: 0.52, yMax: 0.66 },
    'Intestines': { yMin: 0.36, yMax: 0.56 },
    'Muscles': { yMin: 0.00, yMax: 1.00 },
    'Skin': { yMin: 0.00, yMax: 1.00 },
};

function norm(v: number, min: number, max: number) {
    const r = max - min;
    return r === 0 ? 0 : (v - min) / r;
}

const SKELETON_ZONES: Record<string, OrganZone> = {
    'Skull': { yMin: 0.88, yMax: 1.00 },
    'Spine': { yMin: 0.45, yMax: 0.88 },
    'Ribs': { yMin: 0.60, yMax: 0.85 },
    'Pelvis': { yMin: 0.40, yMax: 0.55 },
    'Femur': { yMin: 0.15, yMax: 0.45 },
    'Humerus': { yMin: 0.60, yMax: 0.80 },
};

const ORGAN_ICONS: Record<string, string> = {
    'Brain': '🧠', 'Heart': '❤️', 'Liver': '🟤', 'Kidney': '🫘',
    'Lungs': '💨', 'Stomach': '🫃', 'Nervous System': '⚡',
    'Muscles': '💪', 'Skin': '🫀', 'Intestines': '🌀',
};

interface AnchorInfo {
    pos: THREE.Vector3;
    normal: THREE.Vector3;
}

function getOrganAnchor(structureName: string): AnchorInfo {
    const name = (structureName || '').toLowerCase();
    
    let pos = new THREE.Vector3(0, 0, 0);
    let normal = new THREE.Vector3(0, 0, 1);

    if (name.includes('brain') || name.includes('cns') || name.includes('skull')) {
        pos.set(0, 1.76, 0.28);
        normal.set(0, 0.2, 0.98);
    } else if (name.includes('heart') || name.includes('cardiac')) {
        pos.set(-0.12, 1.05, 0.26);
        normal.set(-0.3, 0.1, 0.95);
    } else if (name.includes('lung') || name.includes('pulmonary') || name.includes('ribs')) {
        pos.set(0.15, 0.96, 0.24);
        normal.set(0.3, 0.0, 0.95);
    } else if (name.includes('liver') || name.includes('hepatic')) {
        pos.set(0.18, 0.56, 0.24);
        normal.set(0.3, -0.1, 0.95);
    } else if (name.includes('stomach') || name.includes('gastric')) {
        pos.set(-0.18, 0.52, 0.26);
        normal.set(-0.3, -0.1, 0.95);
    } else if (name.includes('kidney') || name.includes('renal')) {
        pos.set(0.15, 0.36, -0.22);
        normal.set(0.3, 0.0, -0.95);
    } else if (name.includes('intestine') || name.includes('colon') || name.includes('gut')) {
        pos.set(0.0, 0.1, 0.26);
        normal.set(0.0, -0.2, 0.98);
    } else if (name.includes('spine') || name.includes('nervous') || name.includes('spinal')) {
        pos.set(0.0, 0.66, -0.22);
        normal.set(0.0, 0.0, -1.0);
    } else if (name.includes('pelvis')) {
        pos.set(0.15, -0.1, 0.18);
        normal.set(0.3, 0.0, 0.95);
    } else if (name.includes('femur')) {
        pos.set(0.2, -0.8, 0.15);
        normal.set(0.3, 0.0, 0.95);
    } else if (name.includes('humerus')) {
        pos.set(0.45, 0.8, 0.12);
        normal.set(0.8, 0.0, 0.6);
    } else if (name.includes('muscle')) {
        pos.set(-0.2, 0.0, 0.25);
        normal.set(-0.2, 0.0, 0.98);
    } else if (name.includes('skin') || name.includes('dermal')) {
        pos.set(0.0, 0.0, 0.35);
        normal.set(0.0, 0.0, 1.0);
    }

    return { pos, normal: normal.normalize() };
}

function getEffectPos(e: HeatmapEffect): { pos: THREE.Vector3; normal: THREE.Vector3; name: string } | null {
    const organKey = Object.keys(ORGAN_ZONES).find(k => matchOrganName(e.structure_name, k));
    if (organKey) {
        const anchor = getOrganAnchor(organKey);
        return { pos: anchor.pos, normal: anchor.normal, name: organKey };
    }
    const skeletonKey = Object.keys(SKELETON_ZONES).find(k => k.toLowerCase() === (e.structure_name || '').toLowerCase());
    if (skeletonKey) {
        const anchor = getOrganAnchor(skeletonKey);
        return { pos: anchor.pos, normal: anchor.normal, name: skeletonKey };
    }
    return null;
}

function getSeverityColor(intensity: number): THREE.Color {
    if (intensity < 0.35) return new THREE.Color('#facc15'); // Low -> Yellow
    if (intensity < 0.65) return new THREE.Color('#f97316'); // Medium -> Orange
    if (intensity < 0.85) return new THREE.Color('#ef4444'); // High -> Bright Red
    return new THREE.Color('#991b1b'); // Critical -> Deep Red
}

function recognizeOrgan(mesh: THREE.Mesh, modelBBox: THREE.Box3, modelSize: THREE.Vector3): string | null {
    const meshName = (mesh.name || '').toLowerCase().trim();
    
    // 1. Direct name match checks
    for (const organKey of Object.keys(ORGAN_ZONES)) {
        if (matchOrganName(meshName, organKey)) return organKey;
    }
    for (const skeletonKey of Object.keys(SKELETON_ZONES)) {
        if (meshName.includes(skeletonKey.toLowerCase())) return skeletonKey;
    }

    // 2. Spatial bounding box heuristics
    if (!mesh.geometry) return null;
    if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
    const meshBBox = mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld);
    const meshCenter = meshBBox.getCenter(new THREE.Vector3());
    
    // Normalized height (0.0 to 1.0) and x, z relative offsets
    const relativeY = norm(meshCenter.y, modelBBox.min.y, modelBBox.min.y + modelSize.y);
    const relativeX = (meshCenter.x - modelBBox.min.x) / (modelSize.x || 1) - 0.5; // -0.5 to 0.5
    const relativeZ = (meshCenter.z - modelBBox.min.z) / (modelSize.z || 1) - 0.5; // -0.5 to 0.5
    
    const meshSize = meshBBox.getSize(new THREE.Vector3());
    const volumeRatio = (meshSize.x * meshSize.y * meshSize.z) / (modelSize.x * modelSize.y * modelSize.z || 1);

    // Brain: top of the head
    if (relativeY > 0.88 && Math.abs(relativeX) < 0.15) {
        return 'Brain';
    }
    // Heart: upper-middle chest, slightly left
    if (relativeY > 0.68 && relativeY < 0.83 && relativeX < 0.05 && relativeX > -0.22 && relativeZ > 0.0) {
        if (volumeRatio < 0.05) return 'Heart';
    }
    // Liver: middle torso, right side
    if (relativeY > 0.55 && relativeY < 0.72 && relativeX > 0.0 && relativeX < 0.25) {
        if (volumeRatio < 0.1) return 'Liver';
    }
    // Stomach: middle torso, left side
    if (relativeY > 0.55 && relativeY < 0.70 && relativeX < 0.05 && relativeX > -0.25) {
        if (volumeRatio < 0.08) return 'Stomach';
    }
    // Kidneys: mid-back
    if (relativeY > 0.50 && relativeY < 0.68 && relativeZ < -0.05) {
        if (volumeRatio < 0.03) return 'Kidney';
    }
    // Lungs: chest
    if (relativeY > 0.65 && relativeY < 0.85 && Math.abs(relativeX) < 0.3) {
        if (volumeRatio > 0.02 && volumeRatio < 0.15) return 'Lungs';
    }
    // Intestines: lower abdomen
    if (relativeY > 0.34 && relativeY < 0.57 && Math.abs(relativeX) < 0.22) {
        if (volumeRatio > 0.05) return 'Intestines';
    }
    // Nervous System / Spine: center back
    if (relativeY > 0.35 && relativeY < 0.88 && Math.abs(relativeX) < 0.08 && relativeZ < -0.05) {
        return 'Nervous System';
    }
    
    return null;
}

interface RegisteredPart {
    mesh: THREE.Mesh;
    name: string;
    uuid: string;
    parent: THREE.Object3D | null;
    bbox: THREE.Box3;
    bsphere: THREE.Sphere;
    center: THREE.Vector3;
    worldPos: THREE.Vector3;
    material: THREE.Material | THREE.Material[];
    visibility: boolean;
    originalOpacity: number;
    originalTransparent: boolean;
}

function useAnatomyHighlighter(
    sceneObject: THREE.Object3D,
    effects: HeatmapEffect[] = [],
    isGlassMode: boolean
) {
    const registryRef = useRef<Record<string, RegisteredPart[]>>({});
    const isCompiledRef = useRef(false);

    // 1. Traverse and build the registry ONCE on mount or when sceneObject changes
    useEffect(() => {
        if (!sceneObject) return;
        
        // Reset compiled flag
        isCompiledRef.current = false;
        registryRef.current = {};

        // Compute overall bounding box of the model for spatial heuristics
        sceneObject.updateMatrixWorld(true);
        const modelBox = new THREE.Box3().setFromObject(sceneObject);
        const modelSize = modelBox.getSize(new THREE.Vector3());

        const tempRegistry: Record<string, RegisteredPart[]> = {};

        sceneObject.traverse((child) => {
            const mesh = child as THREE.Mesh;
            if (!mesh.isMesh) return;

            // Clone materials so we can mutate uniforms individually without side-effects
            if (mesh.material) {
                if (Array.isArray(mesh.material)) {
                    mesh.material = mesh.material.map(m => m.clone());
                } else {
                    mesh.material = mesh.material.clone();
                }
            }

            // Identify which organ this mesh belongs to using our heuristics
            const organName = recognizeOrgan(mesh, modelBox, modelSize);
            if (!organName) return;

            // Compute local bounding box & bounding sphere
            if (!mesh.geometry.boundingBox) mesh.geometry.computeBoundingBox();
            if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
            const bbox = mesh.geometry.boundingBox.clone();
            const bsphere = mesh.geometry.boundingSphere.clone();
            const center = bbox.getCenter(new THREE.Vector3());

            // Compute world position
            const worldPos = new THREE.Vector3();
            mesh.getWorldPosition(worldPos);

            // Prepare shader injection on standard materials
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach(mat => {
                const stdMat = mat as THREE.MeshStandardMaterial;
                
                // Inject custom uniforms & logic
                stdMat.onBeforeCompile = (shader) => {
                    shader.uniforms.uDamagePos = { value: center };
                    shader.uniforms.uDamageIntensity = { value: 0.0 };
                    shader.uniforms.uDamageRadius = { value: 5.0 }; // Default to whole organ

                    shader.vertexShader = shader.vertexShader.replace(
                        '#include <common>',
                        `#include <common>
                         varying vec3 vLocalPosition;`
                    );
                    shader.vertexShader = shader.vertexShader.replace(
                        '#include <begin_vertex>',
                        `#include <begin_vertex>
                         vLocalPosition = position;`
                    );

                    shader.fragmentShader = shader.fragmentShader.replace(
                        '#include <common>',
                        `#include <common>
                         varying vec3 vLocalPosition;
                         uniform vec3 uDamagePos;
                         uniform float uDamageIntensity;
                         uniform float uDamageRadius;`
                    );
                    shader.fragmentShader = shader.fragmentShader.replace(
                        '#include <emissivemap_fragment>',
                        `#include <emissivemap_fragment>
                         if (uDamageIntensity > 0.01) {
                             float dist = distance(vLocalPosition, uDamagePos);
                             float glow = smoothstep(uDamageRadius, 0.0, dist);
                             vec3 dmgCore = mix(vec3(1.0, 0.86, 0.0), vec3(0.96, 0.08, 0.10), smoothstep(0.25, 0.70, uDamageIntensity));
                             vec3 outerWhite = vec3(0.96, 0.98, 1.0);
                             float coreTransition = smoothstep(0.20, 0.65, glow);
                             vec3 finalDmgColor = mix(outerWhite, dmgCore, coreTransition);
                             totalEmissiveRadiance += finalDmgColor * glow * uDamageIntensity * 2.2;
                         }`
                    );
                    
                    stdMat.userData.shaderUniforms = shader.uniforms;
                };
            });

            const originalOpacity = Array.isArray(mesh.material)
                ? (mesh.material[0] as THREE.Material).opacity
                : mesh.material.opacity;

            const originalTransparent = Array.isArray(mesh.material)
                ? (mesh.material[0] as THREE.Material).transparent
                : mesh.material.transparent;

            const part: RegisteredPart = {
                mesh,
                name: organName,
                uuid: mesh.uuid,
                parent: mesh.parent,
                bbox,
                bsphere,
                center,
                worldPos,
                material: mesh.material,
                visibility: mesh.visible,
                originalOpacity: originalOpacity ?? 1.0,
                originalTransparent: originalTransparent ?? false
            };

            if (!tempRegistry[organName]) {
                tempRegistry[organName] = [];
            }
            tempRegistry[organName].push(part);
        });

        registryRef.current = tempRegistry;
        isCompiledRef.current = true;

        // Restore original material states on cleanup
        return () => {
            Object.values(registryRef.current).forEach(parts => {
                parts.forEach(p => {
                    const mats = Array.isArray(p.mesh.material) ? p.mesh.material : [p.mesh.material];
                    mats.forEach(mat => {
                        const stdMat = mat as THREE.MeshStandardMaterial;
                        if (stdMat.userData.shaderUniforms) {
                            stdMat.userData.shaderUniforms.uDamageIntensity.value = 0.0;
                        }
                        stdMat.opacity = p.originalOpacity;
                        stdMat.transparent = p.originalTransparent;
                    });
                });
            });
        };
    }, [sceneObject]);

    // 2. Pulse logic in useFrame
    useFrame((state) => {
        if (!isCompiledRef.current || !registryRef.current) return;

        const time = state.clock.elapsedTime;
        // 700ms pulse duration: Math.sin(time * (2 * Math.PI / 0.7))
        const pulse = (Math.sin(time * (2 * Math.PI / 0.7)) + 1.0) / 2.0;

        // Group active effects by structure name
        const activeEffectsMap: Record<string, HeatmapEffect> = {};
        effects.forEach(e => {
            if (e.intensity > 0.05) {
                const key = Object.keys(ORGAN_ZONES).find(k => matchOrganName(e.structure_name, k)) || e.structure_name;
                activeEffectsMap[key] = e;
            }
        });

        // Update each registered organ part
        Object.entries(registryRef.current).forEach(([organName, parts]) => {
            const effect = activeEffectsMap[organName];
            const isAffected = !!effect;

            parts.forEach(p => {
                const mats = Array.isArray(p.mesh.material) ? p.mesh.material : [p.mesh.material];
                mats.forEach(mat => {
                    const stdMat = mat as THREE.MeshStandardMaterial;
                    const uniforms = stdMat.userData.shaderUniforms;

                    if (isAffected) {
                        // Apply pulse emissive intensity
                        if (uniforms) {
                            uniforms.uDamageIntensity.value = pulse * effect.intensity;
                            uniforms.uDamageRadius.value = 5.0; // Highlight whole mesh
                            uniforms.uDamagePos.value.copy(p.center);
                        } else {
                            if (stdMat.emissive) {
                                stdMat.emissive.setRGB(1.0, 0.18, 0.18);
                                stdMat.emissiveIntensity = pulse * effect.intensity * 2.0;
                            }
                        }

                        // Apply soft opacity pulse
                        stdMat.transparent = true;
                        stdMat.opacity = THREE.MathUtils.lerp(p.originalOpacity * 0.4, p.originalOpacity, pulse);
                    } else {
                        // Reset to original state
                        if (uniforms) {
                            uniforms.uDamageIntensity.value = 0.0;
                        } else if (stdMat.emissive) {
                            stdMat.emissive.setHex(0x000000);
                            stdMat.emissiveIntensity = 0.0;
                        }
                        
                        // Restore opacity
                        stdMat.opacity = isGlassMode ? 0.3 : p.originalOpacity;
                        stdMat.transparent = isGlassMode ? true : p.originalTransparent;
                    }
                });
            });
        });
    });

    return registryRef;
}

const IndicatorMarker = () => null;

// DamageIndicator disabled - outer damage indicators removed
const DamageIndicator = () => null;

// DamageIndicators disabled - outer and extra damage indicators removed
const DamageIndicators = () => null;

// ─── Inner model — MeshPhysicalMaterial + per-vertex heatmap color ────────────
interface HumanModelProps {
    effects: HeatmapEffect[];
    isGlassMode: boolean;
    onOrganHover: (organ: string | null) => void;
    onOrganClick: (organ: string) => void;
    isExploded?: boolean;
    visible?: boolean;
    /** Ref that receives the outer body group (used by LandmarkIndicators) */
    outerBodyGroupRef?: React.MutableRefObject<THREE.Group | null>;
}

const CameraSetup: React.FC<{ resetCameraFlag?: number; orbitRef?: React.RefObject<any> }> = ({ resetCameraFlag, orbitRef }) => {
    const { camera, size } = useThree();
    useEffect(() => {
        const perspectiveCamera = camera as THREE.PerspectiveCamera;
        const fov = perspectiveCamera.fov * (Math.PI / 180);
        const isMobile = size.width < 768;
        // 1.48 zoom margin on mobile gives generous breathing room for the full model from head to toes
        const zoomMargin = isMobile ? 1.48 : 1.25;
        const distance = (4.0 / (2 * Math.tan(fov / 2))) * zoomMargin;
        // Offset target downwards so the 3D model appears slightly higher in the viewport,
        // leaving the foot side completely free from bottom overlays!
        const targetY = isMobile ? -0.20 : 0;
        camera.position.set(0, targetY, distance);
        camera.lookAt(0, targetY, 0);
        camera.updateProjectionMatrix();

        if (orbitRef?.current) {
            orbitRef.current.target.set(0, targetY, 0);
            orbitRef.current.update();
        }
    }, [camera, size.width, size.height, resetCameraFlag, orbitRef]);
    return null;
};

const SceneRotator: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const groupRef = useRef<THREE.Group>(null);
    useFrame(() => {
        if (groupRef.current) groupRef.current.rotation.y += 0.002;
    });
    return <group ref={groupRef} name="scene-rotator-group">{children}</group>;
};

const HumanModel: React.FC<HumanModelProps> = React.memo(({ effects = [], isGlassMode, onOrganHover, onOrganClick, isExploded, outerBodyGroupRef }) => {
    const { scene } = useGLTF('/Human.glb');
    const obj = useMemo(() => {
        const cloned = SkeletonUtils.clone(scene);
        cloned.traverse(child => {
            const mesh = child as THREE.Mesh;
            if (mesh.isMesh && mesh.geometry) {
                mesh.geometry.computeVertexNormals();
                if (mesh.geometry.attributes.normal) {
                    mesh.geometry.attributes.normal.needsUpdate = true;
                }
            }
        });
        return cloned;
    }, [scene]);
    const groupRef = useRef<THREE.Group>(null);
    const { camera, gl, raycaster } = useThree();

    const mat = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                uIsGlassMode: { value: isGlassMode ? 1.0 : 0.0 },
                uGlowColor: { value: new THREE.Color(0.2, 0.5, 0.95) }, // #3380f2
                // Solid Mode: #8ec5d6 (vibrant medical slate cyan with high contrast on dark grids), Glass Mode: #00ffff
                uBaseColor: { value: new THREE.Color(isGlassMode ? '#00ffff' : '#8ec5d6') },
                uTime: { value: 0.0 },
                uPulse: { value: 1.0 },

                // Center and scale calculated from geometry
                uModelCenter: { value: new THREE.Vector3(0, 0, 0) },
                uModelScale: { value: 1.0 },

                // Brain: Bilateral temples / both sides of head (not forehead)
                uBrainPos: { value: new THREE.Vector3(0.17, 1.84, 0.03) },
                uBrainIntensity: { value: 0.0 },
                uBrainRadius: { value: 0.17 },

                // Heart: Left mid-thorax anterior
                uHeartPos: { value: new THREE.Vector3(-0.14, 0.94, 0.16) },
                uHeartIntensity: { value: 0.0 },
                uHeartRadius: { value: 0.24 },

                // Lungs: Bilateral chest lobes
                uLungsPos: { value: new THREE.Vector3(0.24, 0.95, 0.10) },
                uLungsIntensity: { value: 0.0 },
                uLungsRadius: { value: 0.25 },

                // Liver: Right upper quadrant under ribs
                uLiverPos: { value: new THREE.Vector3(0.22, 0.50, 0.15) },
                uLiverIntensity: { value: 0.0 },
                uLiverRadius: { value: 0.26 },

                // Stomach: Left upper quadrant
                uStomachPos: { value: new THREE.Vector3(-0.18, 0.50, 0.15) },
                uStomachIntensity: { value: 0.0 },
                uStomachRadius: { value: 0.24 },

                // Kidneys: Posterior lumbar flanks
                uKidneyPos: { value: new THREE.Vector3(0.20, 0.28, -0.14) },
                uKidneyIntensity: { value: 0.0 },
                uKidneyRadius: { value: 0.20 },

                // Intestines: Lower central abdomen / umbilical
                uIntestinesPos: { value: new THREE.Vector3(0.0, 0.04, 0.16) },
                uIntestinesIntensity: { value: 0.0 },
                uIntestinesRadius: { value: 0.28 },

                // Nervous System: Dorsal spinal cord
                uNervousPos: { value: new THREE.Vector3(0.0, 0.65, -0.16) },
                uNervousIntensity: { value: 0.0 },
                uNervousRadius: { value: 0.20 },
            },
            vertexShader: `
                #ifdef GL_ES
                precision highp float;
                #endif

                uniform vec3 uModelCenter;
                uniform float uModelScale;

                varying vec3 vNormalizedPos;
                varying vec3 vNormal;
                varying vec3 vViewDir;

                void main() {
                    vNormalizedPos = (position - uModelCenter) * uModelScale;

                    // Robust normal handling: if normal buffer attribute is missing or degenerate, fallback to radial position direction
                    vec3 n = normal;
                    if (dot(n, n) < 0.0001) {
                        n = normalize(position - uModelCenter + vec3(0.0001));
                    }
                    vec3 transformedNormal = normalMatrix * n;
                    float nLen = length(transformedNormal);
                    vNormal = nLen > 0.0001 ? (transformedNormal / nLen) : vec3(0.0, 1.0, 0.0);

                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    vec3 vdir = -mvPosition.xyz;
                    float vLen = length(vdir);
                    vViewDir = vLen > 0.0001 ? (vdir / vLen) : vec3(0.0, 0.0, 1.0);

                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                #ifdef GL_ES
                precision highp float;
                #endif

                uniform float uIsGlassMode;
                uniform vec3 uGlowColor;
                uniform vec3 uBaseColor;
                uniform float uTime;
                uniform float uPulse;

                uniform vec3 uBrainPos; uniform float uBrainIntensity; uniform float uBrainRadius;
                uniform vec3 uHeartPos; uniform float uHeartIntensity; uniform float uHeartRadius;
                uniform vec3 uLungsPos; uniform float uLungsIntensity; uniform float uLungsRadius;
                uniform vec3 uLiverPos; uniform float uLiverIntensity; uniform float uLiverRadius;
                uniform vec3 uStomachPos; uniform float uStomachIntensity; uniform float uStomachRadius;
                uniform vec3 uKidneyPos; uniform float uKidneyIntensity; uniform float uKidneyRadius;
                uniform vec3 uIntestinesPos; uniform float uIntestinesIntensity; uniform float uIntestinesRadius;
                uniform vec3 uNervousPos; uniform float uNervousIntensity; uniform float uNervousRadius;

                varying vec3 vNormalizedPos;
                varying vec3 vNormal;
                varying vec3 vViewDir;

                // Safe normalization guaranteed never to return NaN or divide by zero
                vec3 safeNormalize(vec3 v, vec3 fallback) {
                    float d = dot(v, v);
                    return d > 0.00001 ? v * inversesqrt(d) : fallback;
                }

                // Damage Indicator Color Ramp:
                // Less effect -> Pure vibrant Yellow (#facc15)
                // Moderate effect -> Warm Orange (#f97316)
                // More effect -> Pure vibrant Red (#ef4444) to Deep Crimson (#991b1b)
                vec3 calculateHeatMapColor(float heat) {
                    vec3 colYellow = vec3(1.0, 0.86, 0.0);   // 🟡 Less effect: Yellow
                    vec3 colOrange = vec3(1.0, 0.45, 0.0);   // 🟠 Moderate effect: Orange
                    vec3 colRed    = vec3(0.96, 0.08, 0.10); // 🔴 More effect: Red
                    vec3 colDarkRed= vec3(0.80, 0.02, 0.04); // 🔴 Critical effect: Deep Red

                    if (heat < 0.32) {
                        return colYellow;
                    } else if (heat < 0.55) {
                        return mix(colYellow, colOrange, (heat - 0.32) / 0.23);
                    } else if (heat < 0.80) {
                        return mix(colOrange, colRed, (heat - 0.55) / 0.25);
                    } else {
                        return mix(colRed, colDarkRed, clamp((heat - 0.80) / 0.20, 0.0, 1.0));
                    }
                }

                void main() {
                    vec3 N = safeNormalize(vNormal, vec3(0.0, 0.0, 1.0));
                    #if defined(GL_OES_standard_derivatives) || __VERSION__ >= 300
                    if (dot(vNormal, vNormal) < 0.01) {
                        N = safeNormalize(cross(dFdx(vNormalizedPos), dFdy(vNormalizedPos)), vec3(0.0, 0.0, 1.0));
                    }
                    #endif
                    if (!gl_FrontFacing) N = -N;

                    vec3 V = safeNormalize(vViewDir, vec3(0.0, 0.0, 1.0));

                    // Accurate Anatomical Heat Calculations in model local space
                    // Brain: Bilateral on both sides of head (temples / lateral cranium, not forehead)
                    float dBrain = max(
                        smoothstep(uBrainRadius, 0.04, distance(vNormalizedPos, uBrainPos)),
                        smoothstep(uBrainRadius, 0.04, distance(vNormalizedPos, vec3(-uBrainPos.x, uBrainPos.y, uBrainPos.z)))
                    );
                    float dHeart = smoothstep(uHeartRadius, 0.0, distance(vNormalizedPos, uHeartPos));
                    float dLungs = max(
                        smoothstep(uLungsRadius, 0.0, distance(vNormalizedPos, uLungsPos)),
                        smoothstep(uLungsRadius, 0.0, distance(vNormalizedPos, vec3(-uLungsPos.x, uLungsPos.y, uLungsPos.z)))
                    );
                    float dLiver = smoothstep(uLiverRadius, 0.0, distance(vNormalizedPos, uLiverPos));
                    float dStomach = smoothstep(uStomachRadius, 0.0, distance(vNormalizedPos, uStomachPos));
                    float dKidney = max(
                        smoothstep(uKidneyRadius, 0.0, distance(vNormalizedPos, uKidneyPos)),
                        smoothstep(uKidneyRadius, 0.0, distance(vNormalizedPos, vec3(-uKidneyPos.x, uKidneyPos.y, uKidneyPos.z)))
                    );
                    float dIntestines = smoothstep(uIntestinesRadius, 0.0, distance(vNormalizedPos, uIntestinesPos));
                    float dNervous = smoothstep(uNervousRadius, 0.0, distance(vNormalizedPos, uNervousPos));

                    float brainHeat = dBrain * uBrainIntensity;
                    float heartHeat = dHeart * uHeartIntensity;
                    float lungsHeat = dLungs * uLungsIntensity;
                    float liverHeat = dLiver * uLiverIntensity;
                    float stomachHeat = dStomach * uStomachIntensity;
                    float kidneyHeat = dKidney * uKidneyIntensity;
                    float intestinesHeat = dIntestines * uIntestinesIntensity;
                    float nervousHeat = dNervous * uNervousIntensity;

                    float maxHeat = max(max(max(brainHeat, heartHeat), max(lungsHeat, liverHeat)),
                                        max(max(stomachHeat, kidneyHeat), max(intestinesHeat, nervousHeat)));

                    // Normalized radial factor (1.0 at center, 0.0 at outer boundary of active organ):
                    float maxRadial = max(max(max(dBrain * step(0.01, uBrainIntensity), dHeart * step(0.01, uHeartIntensity)),
                                              max(dLungs * step(0.01, uLungsIntensity), dLiver * step(0.01, uLiverIntensity))),
                                          max(max(dStomach * step(0.01, uStomachIntensity), dKidney * step(0.01, uKidneyIntensity)),
                                              max(dIntestines * step(0.01, uIntestinesIntensity), dNervous * step(0.01, uNervousIntensity))));

                    // ── Dual Directional Light Shading & Base Skin Material ───────
                    vec3 lightDir1 = normalize(vec3(0.60, 1.20, 1.00));
                    vec3 lightDir2 = normalize(vec3(-0.80, 0.40, 0.60));
                    float diff1 = max(dot(N, lightDir1), 0.0);
                    float diff2 = max(dot(N, lightDir2), 0.0);

                    // Fresnel rim reflection: clamp prevents NaN from pow(0, x) or pow(<0, x)
                    float NdotV = clamp(dot(N, V), 0.0, 1.0);
                    float fresnel = pow(clamp(1.0 - NdotV, 0.0, 1.0), 2.2);
                    float rim = fresnel * 0.25;

                    // Solid Mode: Base color + ambient floor (0.50) + dual directional lights + Fresnel rim
                    vec3 baseLighting = vec3(0.50) + (diff1 * 0.50 + diff2 * 0.25) * vec3(0.92, 0.95, 1.0);
                    vec3 finalColor = uBaseColor * baseLighting + vec3(rim);

                    // Blend damage indicator: middle yellow or red based on damage severity, surrounded by a soft whitish transition:
                    if (maxHeat > 0.01) {
                        // Middle core color based on damage level: Yellow for less damage, Red for high damage
                        vec3 middleColor = calculateHeatMapColor(maxHeat);
                        // Outer surrounding color: soft luminous whitish transition
                        vec3 outerWhite = vec3(0.96, 0.98, 1.0);

                        // Radial transition from outer whitish rim to middle yellow/red core:
                        float coreTransition = smoothstep(0.20, 0.68, maxRadial);
                        vec3 indicatorColor = mix(outerWhite, middleColor, coreTransition);

                        // Smooth blend onto model surface
                        float blendWeight = smoothstep(0.01, 0.28, maxHeat);
                        vec3 litIndicator = indicatorColor * (0.85 + 0.35 * diff1);
                        finalColor = mix(finalColor, litIndicator, blendWeight * 0.95);

                        // Emissive radiance: gentle glow in middle, soft white aura at outer rim
                        vec3 glow = indicatorColor * (maxHeat * 0.70 + pow(maxHeat, 2.0) * 0.35);
                        finalColor += glow;

                        // In the middle core, cap blue channel to preserve rich yellow/red chroma;
                        // on the outer rim, allow full blue to keep the white halo luminous and clean:
                        float maxBlue = mix(1.0, min(finalColor.r, finalColor.g) * 0.15, coreTransition);
                        finalColor.b = min(finalColor.b, maxBlue);
                    }

                    if (uIsGlassMode > 0.5) {
                        // Glass/Holo Mode: Base color, glow color vec3(0.2, 0.5, 0.95)
                        float holoFresnel = fresnel * 1.8;
                        vec3 holoColor = uBaseColor * 0.35 + uGlowColor * holoFresnel;
                        if (maxHeat > 0.01) {
                            vec3 middleColor = calculateHeatMapColor(maxHeat);
                            vec3 outerWhite = vec3(0.96, 0.98, 1.0);
                            float coreTransition = smoothstep(0.20, 0.68, maxRadial);
                            vec3 indicatorColor = mix(outerWhite, middleColor, coreTransition);

                            float blendWeight = smoothstep(0.01, 0.35, maxHeat);
                            holoColor = mix(holoColor, indicatorColor * 1.25, blendWeight * 0.95);

                            float maxBlue = mix(1.0, min(holoColor.r, holoColor.g) * 0.15, coreTransition);
                            holoColor.b = min(holoColor.b, maxBlue);
                        }
                        float alpha = clamp(holoFresnel * 0.65 + 0.15 + maxHeat * 0.45, 0.0, 1.0);
                        gl_FragColor = vec4(holoColor, alpha);
                    } else {
                        // Solid Mode: Clean, bright anatomical model
                        gl_FragColor = vec4(finalColor, 1.0);
                    }
                }
            `,
            side: THREE.DoubleSide,
            transparent: isGlassMode,
            depthWrite: !isGlassMode,
            depthTest: true
        });
    }, [isGlassMode]);

    useEffect(() => {
        if (mat && mat.uniforms) {
            mat.uniforms.uIsGlassMode.value = isGlassMode ? 1.0 : 0.0;
            mat.uniforms.uBaseColor.value.set(isGlassMode ? '#00ffff' : '#8ec5d6');
            mat.transparent = isGlassMode;
            mat.depthWrite = !isGlassMode;
            mat.needsUpdate = true;
        }
    }, [isGlassMode, mat]);

    useMemo(() => {
        obj.traverse(child => {
            const mesh = child as THREE.Mesh;
            if (!mesh.isMesh) return;
            mesh.name = "outer-body-skin";
            mesh.userData.isOuterBody = true;
            if (mesh.geometry) {
                if (!mesh.geometry.attributes.normal) {
                    mesh.geometry.computeVertexNormals();
                }
                if (mesh.geometry.attributes.normal) {
                    mesh.geometry.attributes.normal.needsUpdate = true;
                }
            }
            mesh.material = mat;
            mesh.material.needsUpdate = true;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
        });
    }, [obj, mat]);

    useEffect(() => {
        obj.position.set(0, 0, 0);
        obj.scale.setScalar(1);
        obj.updateMatrixWorld();

        const box = new THREE.Box3().setFromObject(obj);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const s = 4.0 / (maxDim || 1);
        obj.scale.setScalar(s);

        obj.position.set(-center.x * s, -center.y * s, -center.z * s);
        obj.updateMatrixWorld(true);

        // Feed geometry center and scale to shader uniforms
        if (mat && mat.uniforms) {
            mat.uniforms.uModelCenter.value.copy(center);
            mat.uniforms.uModelScale.value = s;
        }

        // Expose the outer body group for landmark projection
        if (outerBodyGroupRef && groupRef.current) {
            outerBodyGroupRef.current = groupRef.current;
        }
    }, [obj, mat, outerBodyGroupRef]);

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        // Rhythmic organic blinking pulse matching the medical scan image (breathing curve 0.72 - 1.0)
        const blink = 0.86 + 0.14 * Math.sin(time * 3.2);

        const intensities: Record<string, number> = {
            Brain: 0, Heart: 0, Lungs: 0, Liver: 0, Stomach: 0, Kidney: 0, Intestines: 0, Nervous: 0
        };

        effects.forEach(e => {
            const name = (e.structure_name || (e as any).organ || (e as any).target || (e as any).name || '').toLowerCase();
            const effectType = ((e as any).effect_type || '').toLowerCase();
            const mechanism = ((e as any).mechanism || '').toLowerCase();
            const combined = `${name} ${effectType} ${mechanism}`;
            const intensity = e.intensity !== undefined && e.intensity !== null ? Number(e.intensity) : 0.8;
            if (intensity > 0.01) {
                if (
                    combined.includes('brain') ||
                    combined.includes('cns') ||
                    combined.includes('head') ||
                    combined.includes('skull') ||
                    combined.includes('cranial') ||
                    combined.includes('neuro') ||
                    combined.includes('synap') ||
                    combined.includes('central nervous') ||
                    combined.includes('cerebr') ||
                    combined.includes('cerebell') ||
                    combined.includes('cortex') ||
                    combined.includes('mening') ||
                    combined.includes('hypothalam') ||
                    combined.includes('mental') ||
                    combined.includes('psych') ||
                    combined.includes('cognit') ||
                    combined.includes('memory') ||
                    combined.includes('headache') ||
                    combined.includes('migraine') ||
                    combined.includes('dizz') ||
                    combined.includes('sedat') ||
                    combined.includes('sleep') ||
                    combined.includes('alert') ||
                    combined.includes('drows') ||
                    (name.includes('nervous') && !name.includes('spine'))
                ) {
                    intensities.Brain = Math.max(intensities.Brain, intensity);
                }
                if (name.includes('heart') || name.includes('cardiac') || name.includes('cardio') || name.includes('vascular') || name.includes('arter') || name.includes('blood pressure') || name.includes('circulat')) {
                    intensities.Heart = Math.max(intensities.Heart, intensity);
                }
                if (name.includes('lung') || name.includes('pulmonary') || name.includes('ribs') || name.includes('respiratory') || name.includes('bronch') || name.includes('alveol') || name.includes('breath') || name.includes('airway')) {
                    intensities.Lungs = Math.max(intensities.Lungs, intensity);
                }
                if (name.includes('liver') || name.includes('hepatic') || name.includes('metabol') || name.includes('first-pass') || name.includes('clearance') || name.includes('cyp') || name.includes('bile')) {
                    intensities.Liver = Math.max(intensities.Liver, intensity);
                }
                if (name.includes('stomach') || name.includes('gastric') || name.includes('digest') || name.includes('acid') || name.includes('ulcer') || name.includes('peptic') || name.includes('mucosa') || name.includes('gi') || name.includes('gastro')) {
                    intensities.Stomach = Math.max(intensities.Stomach, intensity);
                }
                if (name.includes('kidney') || name.includes('renal') || name.includes('nephr') || name.includes('filtration') || name.includes('glomerul') || name.includes('urinar') || name.includes('excret')) {
                    intensities.Kidney = Math.max(intensities.Kidney, intensity);
                }
                if (name.includes('intestine') || name.includes('colon') || name.includes('gut') || name.includes('bowel') || name.includes('enteric') || name.includes('absorp') || name.includes('microbio') || name.includes('abdom') || name.includes('belly')) {
                    intensities.Intestines = Math.max(intensities.Intestines, intensity);
                }
                if (name.includes('spine') || name.includes('nervous') || name.includes('spinal') || name.includes('vertebra') || name.includes('back') || name.includes('cord')) {
                    intensities.Nervous = Math.max(intensities.Nervous, intensity);
                }
            }
        });

        if (mat && mat.uniforms) {
            if (mat.uniforms.uTime) mat.uniforms.uTime.value = time;
            if (mat.uniforms.uPulse) mat.uniforms.uPulse.value = blink;
            if (mat.uniforms.uBrainIntensity) mat.uniforms.uBrainIntensity.value = intensities.Brain * blink;
            if (mat.uniforms.uHeartIntensity) mat.uniforms.uHeartIntensity.value = intensities.Heart * blink;
            if (mat.uniforms.uLungsIntensity) mat.uniforms.uLungsIntensity.value = intensities.Lungs * blink;
            if (mat.uniforms.uLiverIntensity) mat.uniforms.uLiverIntensity.value = intensities.Liver * blink;
            if (mat.uniforms.uStomachIntensity) mat.uniforms.uStomachIntensity.value = intensities.Stomach * blink;
            if (mat.uniforms.uKidneyIntensity) mat.uniforms.uKidneyIntensity.value = intensities.Kidney * blink;
            if (mat.uniforms.uIntestinesIntensity) mat.uniforms.uIntestinesIntensity.value = intensities.Intestines * blink;
            if (mat.uniforms.uNervousIntensity) mat.uniforms.uNervousIntensity.value = intensities.Nervous * blink;
        }
    });

    const getOrgan = useCallback((e: PointerEvent): string | null => {
        const rect = gl.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            -((e.clientY - rect.top) / rect.height) * 2 + 1,
        );
        raycaster.setFromCamera(mouse, camera);
        const hits: THREE.Intersection[] = [];
        obj.traverse(c => { if ((c as THREE.Mesh).isMesh) hits.push(...raycaster.intersectObject(c, false)); });
        if (!hits.length) return null;
        hits.sort((a, b) => a.distance - b.distance);
        const p = hits[0].point;

        // Instant normalized anatomical height determination
        if (p.y > 1.35) return 'Brain';
        if (p.y > 0.75 && p.y <= 1.35) return p.x < 0 ? 'Heart' : 'Lungs';
        if (p.y > 0.35 && p.y <= 0.75) return p.x > 0 ? 'Liver' : 'Stomach';
        if (p.y > 0.10 && p.y <= 0.35) return p.z < 0 ? 'Kidney' : 'Liver';
        if (p.y > -0.30 && p.y <= 0.10) return 'Intestines';
        return null;
    }, [obj, camera, raycaster, gl]);

    useEffect(() => {
        const el = gl.domElement;
        let last: string | null = null;
        let lastTime = 0;
        const onMove = (e: PointerEvent) => {
            // NEVER raycast during touch drags on mobile (touch screens have no hover)
            if (e.pointerType === 'touch') return;
            const now = performance.now();
            if (now - lastTime < 50) return; // throttle mouse move to 20fps
            lastTime = now;
            const o = getOrgan(e);
            if (o !== last) { last = o; onOrganHover(o); }
        };
        const onClick = (e: PointerEvent) => {
            const o = getOrgan(e);
            if (o) onOrganClick(o);
        };
        el.addEventListener('pointermove', onMove);
        el.addEventListener('click', onClick as EventListener);
        return () => {
            el.removeEventListener('pointermove', onMove);
            el.removeEventListener('click', onClick as EventListener);
        };
    }, [gl, getOrgan, onOrganHover, onOrganClick]);

    return <group ref={groupRef}><primitive object={obj} /></group>;
});

const SkeletonModel: React.FC<HumanModelProps> = React.memo(({ effects = [], isGlassMode, onOrganHover, onOrganClick, visible = true }) => {
    const { scene } = useGLTF('/skeleton.glb');
    const groupRef = useRef<THREE.Group>(null);
    const { camera, gl, raycaster } = useThree();

    const clonedScene = useMemo(() => {
        const cloned = SkeletonUtils.clone(scene);
        return cloned;
    }, [scene]);

    const registry = useAnatomyHighlighter(clonedScene, effects, isGlassMode);

    const mat = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: new THREE.Color('#e8ecf0'),
            roughness: 0.6,
            metalness: 0.1,
            wireframe: false,
            transparent: true,
            opacity: isGlassMode ? 0.35 : 1.0,
            side: THREE.DoubleSide
        });
    }, [isGlassMode]);

    useMemo(() => {
        clonedScene.traverse(child => {
            const mesh = child as THREE.Mesh;
            if (!mesh.isMesh) return;
            mesh.material = mat;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
        });
    }, [clonedScene, mat]);

    useEffect(() => {
        clonedScene.position.set(0, 0, 0);
        clonedScene.scale.setScalar(1);
        clonedScene.updateMatrixWorld();

        const box = new THREE.Box3().setFromObject(clonedScene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const s = 4.0 / (maxDim || 1);
        clonedScene.scale.setScalar(s);

        clonedScene.position.set(-center.x * s, -center.y * s, -center.z * s);
        clonedScene.updateMatrixWorld();
    }, [clonedScene]);

    const getOrgan = useCallback((e: PointerEvent): string | null => {
        const rect = gl.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            -((e.clientY - rect.top) / rect.height) * 2 + 1,
        );
        raycaster.setFromCamera(mouse, camera);
        const hits: THREE.Intersection[] = [];
        clonedScene.traverse(c => { if ((c as THREE.Mesh).isMesh) hits.push(...raycaster.intersectObject(c, false)); });
        if (!hits.length) return null;
        hits.sort((a, b) => a.distance - b.distance);
        const hitMesh = hits[0].object;

        for (const [organName, parts] of Object.entries(registry.current)) {
            if (parts.some(p => p.mesh === hitMesh || p.mesh.uuid === hitMesh.uuid)) {
                return organName;
            }
        }
        return null;
    }, [clonedScene, camera, raycaster, gl, registry]);

    useEffect(() => {
        const el = gl.domElement;
        let last: string | null = null;
        let lastTime = 0;
        const onMove = (e: PointerEvent) => {
            // NEVER raycast during touch drags on mobile (touch screens have no hover)
            if (e.pointerType === 'touch') return;
            const now = performance.now();
            if (now - lastTime < 50) return; // throttle mouse move to 20fps
            lastTime = now;
            const o = getOrgan(e);
            if (o !== last) { last = o; onOrganHover(o); }
        };
        const onClick = (e: PointerEvent) => {
            const o = getOrgan(e);
            if (o) onOrganClick(o);
        };
        el.addEventListener('pointermove', onMove);
        el.addEventListener('click', onClick as EventListener);
        return () => {
            el.removeEventListener('pointermove', onMove);
            el.removeEventListener('click', onClick as EventListener);
        };
    }, [gl, getOrgan, onOrganHover, onOrganClick]);

    return <group ref={groupRef} visible={visible}><primitive object={clonedScene} /></group>;
});

const InnerOrgansModel: React.FC<HumanModelProps> = React.memo(({ effects = [], isGlassMode, onOrganHover, onOrganClick, visible = true }) => {
    const { scene } = useGLTF('/inner_organs.glb');
    const groupRef = useRef<THREE.Group>(null);
    const { camera, gl, raycaster } = useThree();

    const clonedScene = useMemo(() => scene.clone(), [scene]);
    const registry = useAnatomyHighlighter(clonedScene, effects, isGlassMode);

    useEffect(() => {
        clonedScene.position.set(0, 0, 0);
        clonedScene.scale.setScalar(1);
        clonedScene.updateMatrixWorld();

        const box = new THREE.Box3().setFromObject(clonedScene);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        const maxDim = Math.max(size.x, size.y, size.z);
        const s = (4.0 / (maxDim || 1)) * 0.70; 
        clonedScene.scale.setScalar(s);
        clonedScene.position.set(-center.x * s, (-center.y * s) + 0.35, (-center.z * s) - 0.05);
        clonedScene.updateMatrixWorld();
    }, [clonedScene]);

    const getOrgan = useCallback((e: PointerEvent): string | null => {
        const rect = gl.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            -((e.clientY - rect.top) / rect.height) * 2 + 1,
        );
        raycaster.setFromCamera(mouse, camera);
        const hits: THREE.Intersection[] = [];
        clonedScene.traverse(c => { if ((c as THREE.Mesh).isMesh) hits.push(...raycaster.intersectObject(c, false)); });
        if (!hits.length) return null;
        hits.sort((a, b) => a.distance - b.distance);
        const hitMesh = hits[0].object;

        for (const [organName, parts] of Object.entries(registry.current)) {
            if (parts.some(p => p.mesh === hitMesh || p.mesh.uuid === hitMesh.uuid)) {
                return organName;
            }
        }
        return null;
    }, [clonedScene, camera, raycaster, gl, registry]);

    useEffect(() => {
        const el = gl.domElement;
        let last: string | null = null;
        let lastTime = 0;
        const onMove = (e: PointerEvent) => {
            // NEVER raycast during touch drags on mobile (touch screens have no hover)
            if (e.pointerType === 'touch') return;
            const now = performance.now();
            if (now - lastTime < 50) return; // throttle mouse move to 20fps
            lastTime = now;
            const o = getOrgan(e);
            if (o !== last) { last = o; onOrganHover(o); }
        };
        const onClick = (e: PointerEvent) => {
            const o = getOrgan(e);
            if (o) onOrganClick(o);
        };
        el.addEventListener('pointermove', onMove);
        el.addEventListener('click', onClick as EventListener);
        return () => {
            el.removeEventListener('pointermove', onMove);
            el.removeEventListener('click', onClick as EventListener);
        };
    }, [gl, getOrgan, onOrganHover, onOrganClick]);

    return <group ref={groupRef} visible={visible}><primitive object={clonedScene} /></group>;
});

const getMeshOnlyBoundingBox = (object: THREE.Object3D) => {
    const box = new THREE.Box3();
    let hasMesh = false;

    // Ensure local matrices are up to date
    object.updateMatrixWorld(true);

    object.traverse((child: any) => {
        // Collect only actual visible meshes, ignoring helpers, bones, armature, empty groups, animation nodes
        if (child.isMesh && child.visible) {
            const name = (child.name || '').toLowerCase();
            if (
                name.includes('helper') || 
                name.includes('bone') || 
                name.includes('armature') || 
                name.includes('collider') || 
                child.type === 'Bone'
            ) {
                return;
            }

            // Verify parent chain to ignore custom bone shape meshes
            let parent = child.parent;
            let isBoneChild = false;
            while (parent && parent !== object) {
                if (parent.isBone || (parent.name || '').toLowerCase().includes('bone') || parent.type === 'Bone') {
                    isBoneChild = true;
                    break;
                }
                parent = parent.parent;
            }
            if (isBoneChild) return;

            const geom = child.geometry;
            if (geom) {
                if (!geom.boundingBox) geom.computeBoundingBox();
                if (geom.boundingBox) {
                    const tempBox = geom.boundingBox.clone();
                    tempBox.applyMatrix4(child.matrixWorld);
                    if (!hasMesh) {
                        box.copy(tempBox);
                        hasMesh = true;
                    } else {
                        box.union(tempBox);
                    }
                }
            }
        }
    });

    return { box, hasMesh };
};

const normalizeModel = (model: THREE.Object3D, rotateY: number = 0) => {
    // 1. Reset target model transforms before measuring
    model.position.set(0, 0, 0);
    model.rotation.set(0, 0, 0);
    model.scale.setScalar(1);
    model.updateMatrixWorld(true);

    const targetHeight = 4.0; // Standard Anatomy visual height

    // Compute target model bounding box using mesh-only bounds
    const modelBoxResult = getMeshOnlyBoundingBox(model);
    const modelSize = modelBoxResult.box.getSize(new THREE.Vector3());

    // Scale target model to match the reference visual height
    const modelScale = targetHeight / (modelSize.y || 1);
    model.scale.setScalar(modelScale);

    // Rotate target model around Y axis if required (e.g. Tripo model faces X)
    if (rotateY !== 0) {
        model.rotation.set(0, rotateY, 0);
        model.updateMatrixWorld(true);
    }

    // Measure the center of the rotated and scaled meshes
    const rotatedBoxResult = getMeshOnlyBoundingBox(model);
    const rotatedCenter = rotatedBoxResult.box.getCenter(new THREE.Vector3());

    // Position it so the center of the meshes is exactly at the world origin
    model.position.set(-rotatedCenter.x, -rotatedCenter.y, -rotatedCenter.z);
    model.updateMatrixWorld(true);
};

const MusclesModel: React.FC<HumanModelProps> = React.memo(({ effects = [], isGlassMode, onOrganHover, onOrganClick }) => {
    const { scene: gltfScene } = useGLTF('/human_anatomy_by_tripo.glb');
    const groupRef = useRef<THREE.Group>(null);
    const { camera, gl, raycaster } = useThree();

    const clonedScene = useMemo(() => {
        const cloned = SkeletonUtils.clone(gltfScene);
        cloned.traverse(child => {
            if ((child as THREE.Mesh).isMesh) {
                child.name = "outer-body-muscles";
                child.userData.isOuterBody = true;
            }
        });
        normalizeModel(cloned, Math.PI / 2);
        return cloned;
    }, [gltfScene]);

    const registry = useAnatomyHighlighter(clonedScene, effects, isGlassMode);

    const getOrgan = useCallback((e: PointerEvent): string | null => {
        const rect = gl.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            -((e.clientY - rect.top) / rect.height) * 2 + 1,
        );
        raycaster.setFromCamera(mouse, camera);
        const hits: THREE.Intersection[] = [];
        clonedScene.traverse(c => { if ((c as THREE.Mesh).isMesh) hits.push(...raycaster.intersectObject(c, false)); });
        if (!hits.length) return null;
        hits.sort((a, b) => a.distance - b.distance);
        const hitMesh = hits[0].object;

        for (const [organName, parts] of Object.entries(registry.current)) {
            if (parts.some(p => p.mesh === hitMesh || p.mesh.uuid === hitMesh.uuid)) {
                return organName;
            }
        }
        return null;
    }, [clonedScene, camera, raycaster, gl, registry]);

    useEffect(() => {
        const el = gl.domElement;
        let last: string | null = null;
        let lastTime = 0;
        const onMove = (e: PointerEvent) => {
            // NEVER raycast during touch drags on mobile (touch screens have no hover)
            if (e.pointerType === 'touch') return;
            const now = performance.now();
            if (now - lastTime < 50) return; // throttle mouse move to 20fps
            lastTime = now;
            const o = getOrgan(e);
            if (o !== last) { last = o; onOrganHover(o); }
        };
        const onClick = (e: PointerEvent) => {
            const o = getOrgan(e);
            if (o) onOrganClick(o);
        };
        el.addEventListener('pointermove', onMove);
        el.addEventListener('click', onClick as EventListener);
        return () => {
            el.removeEventListener('pointermove', onMove);
            el.removeEventListener('click', onClick as EventListener);
        };
    }, [gl, getOrgan, onOrganHover, onOrganClick]);

    return <group ref={groupRef}><primitive object={clonedScene} /></group>;
});


// ---------------------------------------------------------------------------
// NervousGLBModel — renders /nervous.glb with ZERO material mutation.
// All embedded materials, textures, transparency, opacity, roughness,
// metalness, emissive, alpha and vertex-colors are kept exactly as authored.
// Only scale + position are normalised so the model fits the shared camera.
// ---------------------------------------------------------------------------
const NervousGLBModel: React.FC<HumanModelProps> = React.memo(({ effects = [], isGlassMode, onOrganHover, onOrganClick }) => {
    const { scene } = useGLTF('/nervous.glb');
    const groupRef = useRef<THREE.Group>(null);
    const { camera, gl, raycaster } = useThree();

    const clonedScene = useMemo(() => {
        const cloned = SkeletonUtils.clone(scene);
        cloned.traverse(child => {
            const mesh = child as THREE.Mesh;
            if (mesh.isMesh) {
                mesh.castShadow = true;
                mesh.receiveShadow = true;
            }
        });
        normalizeModel(cloned, 0);
        return cloned;
    }, [scene]);

    const registry = useAnatomyHighlighter(clonedScene, effects, isGlassMode);

    const getOrgan = useCallback((e: PointerEvent): string | null => {
        const rect = gl.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((e.clientX - rect.left) / rect.width) * 2 - 1,
            -((e.clientY - rect.top) / rect.height) * 2 + 1,
        );
        raycaster.setFromCamera(mouse, camera);
        const hits: THREE.Intersection[] = [];
        clonedScene.traverse(c => { if ((c as THREE.Mesh).isMesh) hits.push(...raycaster.intersectObject(c, false)); });
        if (!hits.length) return null;
        hits.sort((a, b) => a.distance - b.distance);
        const hitMesh = hits[0].object;

        for (const [organName, parts] of Object.entries(registry.current)) {
            if (parts.some(p => p.mesh === hitMesh || p.mesh.uuid === hitMesh.uuid)) {
                return organName;
            }
        }
        return null;
    }, [clonedScene, camera, raycaster, gl, registry]);

    useEffect(() => {
        const el = gl.domElement;
        let last: string | null = null;
        let lastTime = 0;
        const onMove = (e: PointerEvent) => {
            if (e.pointerType === 'touch') return;
            const now = performance.now();
            if (now - lastTime < 50) return;
            lastTime = now;
            const o = getOrgan(e);
            if (o !== last) { last = o; onOrganHover?.(o); }
        };
        const onClick = (e: PointerEvent) => {
            const o = getOrgan(e);
            if (o) onOrganClick?.(o);
        };
        el.addEventListener('pointermove', onMove);
        el.addEventListener('click', onClick as EventListener);
        return () => {
            el.removeEventListener('pointermove', onMove);
            el.removeEventListener('click', onClick as EventListener);
        };
    }, [gl, getOrgan, onOrganHover, onOrganClick]);

    return <group ref={groupRef}><primitive object={clonedScene} /></group>;
});

export interface DrugHeatmap3DProps {
    effects: HeatmapEffect[];
    selectedOrgan: string | null;
    isGlassMode: boolean;
    showSkeleton: boolean;
    showBody: boolean;
    showOrgans?: boolean;
    showMuscles?: boolean;
    showNervousGLB?: boolean;
    onOrganSelect: (organ: string) => void;
    isAnalyzing?: boolean;
    isCuring?: boolean;
    cureProgress?: number;
    handRotationDelta?: { x: number; y: number };
    handDragDelta?: { x: number; y: number };
    handZoomDelta?: number;
    resetCameraFlag?: number;
    debugMode?: boolean;
    /** When true, shows calibration click-to-coordinate tool on outer body */
    calibrationMode?: boolean;
}

const DebugRegionsOverlay = ({ debugMode }: { debugMode?: boolean }) => {
    const { scene } = useThree();
    const [regionsData, setRegionsData] = useState<{ name: string; pos: THREE.Vector3; color: string }[]>([]);

    useEffect(() => {
        if (!debugMode) {
            setRegionsData([]);
            return;
        }

        const interval = setInterval(() => {
            const regions = scene.userData.bodyRegions;
            if (regions) {
                const centers: { name: string; pos: THREE.Vector3; color: string }[] = [];
                Object.entries(regions).forEach(([name, vertices]: [string, any[]]) => {
                    if (vertices.length > 0) {
                        const sum = new THREE.Vector3();
                        vertices.forEach(v => sum.add(v.pos));
                        sum.divideScalar(vertices.length);
                        centers.push({ name, pos: sum, color: getRegionColor(name) });
                    }
                });
                setRegionsData(centers);
                clearInterval(interval);
            }
        }, 500);

        return () => clearInterval(interval);
    }, [debugMode, scene]);

    if (!debugMode) return null;

    return (
        <group>
            {regionsData.map(rc => (
                <group key={rc.name} position={rc.pos}>
                    <mesh>
                        <sphereGeometry args={[0.02, 16, 16]} />
                        <meshBasicMaterial color={rc.color} depthTest={false} transparent opacity={0.8} />
                    </mesh>
                    <Html distanceFactor={4} style={{ pointerEvents: 'none' }}>
                        <div 
                            style={{ backgroundColor: rc.color + '22', borderColor: rc.color + '66' }}
                            className="border text-[8px] text-white px-1.5 py-0.5 rounded font-mono font-bold whitespace-nowrap shadow-md uppercase tracking-wider scale-75 select-none"
                        >
                            {rc.name}
                        </div>
                    </Html>
                </group>
            ))}
        </group>
    );
};

function getRegionColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
}

const RotatingHUD = () => {
    const ring1Ref = useRef<THREE.Mesh>(null);
    const ring2Ref = useRef<THREE.Mesh>(null);
    const ring3Ref = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const time = state.clock.elapsedTime;
        if (ring1Ref.current) {
            ring1Ref.current.rotation.z = time * 0.2;
            ring1Ref.current.rotation.x = Math.PI / 2;
        }
        if (ring2Ref.current) {
            ring2Ref.current.rotation.z = -time * 0.15;
            ring2Ref.current.rotation.x = Math.PI / 2 + 0.1;
        }
        if (ring3Ref.current) {
            ring3Ref.current.rotation.z = time * 0.1;
            ring3Ref.current.rotation.x = Math.PI / 2 - 0.1;
        }
    });

    return (
        <group position={[0, -0.2, 0]}>
            <mesh ref={ring1Ref}>
                <ringGeometry args={[1.5, 1.52, 64]} />
                <meshBasicMaterial color="#00ffff" transparent opacity={0.3} side={THREE.DoubleSide} />
            </mesh>
            <mesh ref={ring2Ref}>
                <ringGeometry args={[1.8, 1.83, 64]} />
                <meshBasicMaterial color="#3b82f6" transparent opacity={0.2} side={THREE.DoubleSide} />
            </mesh>
            <mesh ref={ring3Ref}>
                <ringGeometry args={[2.2, 2.22, 128, 1, 0, Math.PI * 1.5]} />
                <meshBasicMaterial color="#00ffff" transparent opacity={0.4} side={THREE.DoubleSide} />
            </mesh>
        </group>
    );
};

const PharmacokineticsFlow = ({ active }: { active: boolean }) => {
    const particlesRef = useRef<THREE.Points>(null);
    const particleCount = 400;

    // Path points from mouth -> throat -> stomach -> liver
    const curve = useMemo(() => {
        return new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 1.6, 0.4),    // Mouth
            new THREE.Vector3(0, 1.2, 0.2),    // Throat
            new THREE.Vector3(0, 0.5, 0.3),    // Stomach
            new THREE.Vector3(0.3, 0.2, 0.2),  // Liver
            new THREE.Vector3(-0.2, -0.1, 0.2),// Intestines
            new THREE.Vector3(0, -0.8, 0.1)    // Dispersion
        ]);
    }, []);

    const positions = useMemo(() => {
        const arr = new Float32Array(particleCount * 3);
        // Initialization (all start at mouth)
        for (let i = 0; i < particleCount; i++) {
            arr[i * 3] = 0; arr[i * 3 + 1] = 1.6; arr[i * 3 + 2] = 0.4;
        }
        return arr;
    }, [particleCount]);

    // Randomize start delays so particles flow continuously
    const progressRef = useRef(new Float32Array(particleCount).map(() => -Math.random() * 3));

    useFrame((state, delta) => {
        if (!active || !particlesRef.current) return;
        const pts = particlesRef.current.geometry.attributes.position.array as Float32Array;
        const speeds = progressRef.current;

        for (let i = 0; i < particleCount; i++) {
            speeds[i] += delta * 0.15; // Slow travel down the body
            if (speeds[i] > 1) { speeds[i] = -Math.random(); } // Reset and delay

            if (speeds[i] >= 0) {
                const pt = curve.getPointAt(speeds[i]);
                // Increasing scatter as it gets deeper into the body
                const scatter = 0.08 * (1 - Math.pow(1 - speeds[i], 3));
                pts[i * 3] = pt.x + (Math.random() - 0.5) * scatter;
                pts[i * 3 + 1] = pt.y + (Math.random() - 0.5) * scatter;
                pts[i * 3 + 2] = pt.z + (Math.random() - 0.5) * scatter;
            } else {
                pts[i * 3] = 0; pts[i * 3 + 1] = 1.6; pts[i * 3 + 2] = 0.4; // Hide at mouth
            }
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
    });

    if (!active) return null;

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particleCount}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.02}
                color="#00ffff"
                transparent
                opacity={0.9}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                sizeAttenuation={true}
            />
        </points>
    );
};

const GestureController = ({ orbitRef, rotationDelta, zoomDelta, dragDelta, resetFlag }: { orbitRef: React.RefObject<any>, rotationDelta?: { x: number, y: number }, zoomDelta?: number, dragDelta?: { x: number, y: number }, resetFlag?: number }) => {
    const { camera } = useThree();

    // 1. Zoom Logic (Pinch or Swipe Depth)
    useEffect(() => {
        if (!orbitRef.current || !zoomDelta || zoomDelta === 0) return;
        const controls = orbitRef.current;
        const target = controls.target;
        const dist = camera.position.distanceTo(target);
        const newDist = Math.max(2, Math.min(12, dist + zoomDelta));
        const dir = new THREE.Vector3().subVectors(camera.position, target).normalize();
        camera.position.copy(target).add(dir.multiplyScalar(newDist));
        controls.update();
    }, [zoomDelta, camera, orbitRef]);

    // 2. Drag Logic
    useEffect(() => {
        if (!orbitRef.current || !dragDelta) return;
        if (dragDelta.x !== 0 || dragDelta.y !== 0) {
            const controls = orbitRef.current;
            controls.enablePan = true;
            controls.target.x -= dragDelta.x * 0.05;
            controls.target.y += dragDelta.y * 0.05;
            controls.update();
        }
    }, [dragDelta, orbitRef]);

    // 3. Rotation Logic (Point Finger)
    useEffect(() => {
        if (!orbitRef.current || !rotationDelta) return;
        if (rotationDelta.x !== 0 || rotationDelta.y !== 0) {
            const controls = orbitRef.current;

            controls.setAzimuthalAngle(controls.getAzimuthalAngle() - (rotationDelta.x * 3.0));
            controls.setPolarAngle(controls.getPolarAngle() - (rotationDelta.y * 3.0));

            controls.update();
        }
    }, [rotationDelta, orbitRef]);

    // 4. Reset Camera Logic (Five Fingers)
    useEffect(() => {
        if (!orbitRef.current || !resetFlag) return;
        const controls = orbitRef.current;
        controls.reset();
        const perspectiveCamera = camera as THREE.PerspectiveCamera;
        const fov = perspectiveCamera.fov * (Math.PI / 180);
        const isMobile = window.innerWidth < 768;
        const zoomMargin = isMobile ? 1.48 : 1.25;
        const distance = (4.0 / (2 * Math.tan(fov / 2))) * zoomMargin;
        const targetY = isMobile ? -0.20 : 0;
        camera.position.set(0, targetY, distance);
        controls.target.set(0, targetY, 0);
        camera.updateProjectionMatrix();
        controls.update();
    }, [resetFlag, camera, orbitRef]);

    return null;
};

const DrugHeatmap3D: React.FC<DrugHeatmap3DProps> = ({
    effects = [], selectedOrgan, isGlassMode, showSkeleton, showBody, showOrgans, showMuscles, showNervousGLB, onOrganSelect, isAnalyzing, isCuring, cureProgress = 0, handRotationDelta, handDragDelta, handZoomDelta, resetCameraFlag, debugMode, calibrationMode
}) => {
    // Ref for the outer body group — shared with LandmarkIndicators
    const outerBodyGroupRef = useRef<THREE.Group | null>(null);
    const orbitRef = useRef<any>(null);
    const [hoveredOrgan, setHoveredOrgan] = useState<string | null>(null);
    const hoveredEffect = useMemo(() => {
        if (!hoveredOrgan) return null;
        if (ORGAN_ZONES[hoveredOrgan]) {
            return effects.find(e => matchOrganName(e.structure_name, hoveredOrgan));
        }
        return effects.find(e => (e.structure_name || '').toLowerCase() === hoveredOrgan.toLowerCase());
    }, [effects, hoveredOrgan]);

    // Calculate max intensity to drive sparkle reactivity
    const maxIntensity = useMemo(() => {
        return effects.length > 0 ? Math.max(...effects.map(e => e.intensity)) : 0;
    }, [effects]);

    // Background Sparkles: Color transitions from #bae6fd (low) -> #fde047 (mid) -> #fca5a5 (high)
    const sparkleColor = useMemo(() => {
        if (maxIntensity > 0.66) {
            const t = Math.min(1, (maxIntensity - 0.66) / 0.34);
            return '#' + new THREE.Color('#fde047').lerp(new THREE.Color('#fca5a5'), t).getHexString();
        } else if (maxIntensity > 0.33) {
            const t = (maxIntensity - 0.33) / 0.33;
            return '#' + new THREE.Color('#bae6fd').lerp(new THREE.Color('#fde047'), t).getHexString();
        } else {
            return '#bae6fd';
        }
    }, [maxIntensity]);

    const organEffects = useMemo(() => effects.filter(e => e.layer !== 'SKELETON_VIEW'), [effects]);
    const skeletonEffects = useMemo(() => effects.filter(e => e.layer === 'SKELETON_VIEW'), [effects]);

    const isMobile = useMemo(() => {
        if (typeof window === 'undefined') return false;
        return window.innerWidth < 768 || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    }, []);

    // Idle-preload common secondary layers in background after initial digital twin is interactive
    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                useGLTF.preload('/skeleton.glb');
                useGLTF.preload('/inner_organs.glb');
            } catch {}
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="relative w-full h-full select-none">
            {/* ── Three.js Canvas ── */}
            <Canvas
                shadows={!isMobile}
                dpr={isMobile ? 1 : [1, 2]}
                camera={{ position: [0, -0.2, 6.6], fov: 45 }}
                gl={{ powerPreference: 'high-performance', antialias: !isMobile }}
            >
                <fog attach="fog" args={['#000000', 10, 25]} />

                {/* ── Scene Lighting ── */}
                {/* Ambient light: #ffffff (intensity 0.7) */}
                <ambientLight intensity={0.7} color="#ffffff" />
                {/* SpotLight: position [10, 10, 10], color #ffffff (intensity 1.2) */}
                <spotLight position={[10, 10, 10]} intensity={1.2} color="#ffffff" castShadow angle={0.6} penumbra={0.5} />
                {/* PointLight: position [-10, 0, -10], color #3b82f6 (intensity 1.5) */}
                <pointLight position={[-10, 0, -10]} intensity={1.5} color="#3b82f6" />
                {/* Accent SpotLight: position [0, 5, -5], color #06b6d4 (intensity 2.0) */}
                <spotLight position={[0, 5, -5]} intensity={2.0} color="#06b6d4" angle={0.8} penumbra={0.5} />

                <CameraSetup resetCameraFlag={resetCameraFlag} orbitRef={orbitRef} />
                <SceneRotator>
                    {(showBody || (!showOrgans && !showSkeleton && !showMuscles && !showNervousGLB)) && (
                        <React.Suspense fallback={<CanvasLoaderFallback label="Digital Twin Hologram" />}>
                            <HumanModel
                                effects={organEffects}
                                isGlassMode={showOrgans ? true : isGlassMode}
                                onOrganHover={setHoveredOrgan}
                                onOrganClick={onOrganSelect}
                                outerBodyGroupRef={outerBodyGroupRef}
                            />
                        </React.Suspense>
                    )}

                    {showOrgans && (
                        <React.Suspense fallback={<CanvasLoaderFallback label="Internal Organs" />}>
                            <InnerOrgansModel
                                effects={organEffects}
                                isGlassMode={false}
                                onOrganHover={setHoveredOrgan}
                                onOrganClick={onOrganSelect}
                                visible={showOrgans}
                            />
                        </React.Suspense>
                    )}
                    {showSkeleton && (
                        <React.Suspense fallback={<CanvasLoaderFallback label="Skeletal Anatomy" />}>
                            <SkeletonModel
                                effects={skeletonEffects}
                                isGlassMode={isGlassMode}
                                onOrganHover={setHoveredOrgan}
                                onOrganClick={onOrganSelect}
                                visible={showSkeleton}
                            />
                        </React.Suspense>
                    )}
                    {showMuscles && (
                        <React.Suspense fallback={<CanvasLoaderFallback label="Musculoskeletal Model" />}>
                            <MusclesModel
                                effects={organEffects}
                                isGlassMode={isGlassMode}
                                onOrganHover={setHoveredOrgan}
                                onOrganClick={onOrganSelect}
                            />
                        </React.Suspense>
                    )}
                    {showNervousGLB && (
                        <React.Suspense fallback={<CanvasLoaderFallback label="Nervous System" />}>
                            <NervousGLBModel
                                effects={organEffects}
                                isGlassMode={isGlassMode}
                                onOrganHover={setHoveredOrgan}
                                onOrganClick={onOrganSelect}
                            />
                        </React.Suspense>
                    )}

                    {/* Calibration tool: active only when calibrationMode is enabled */}
                    {calibrationMode && (
                        <CalibrationMode active={calibrationMode} outerBodyRef={outerBodyGroupRef} />
                    )}
                </SceneRotator>

                {/* Simulated Pharmacokinetics Drug Flow Particles */}
                <PharmacokineticsFlow active={organEffects.length > 0 || skeletonEffects.length > 0} />

                {/* Reactive sparkles: Color transitions from #bae6fd (low) -> #fde047 (mid) -> #fca5a5 (high) */}
                <Sparkles
                    count={isMobile ? 15 : (maxIntensity > 0 ? 35 + Math.floor(maxIntensity * 65) : 30)}
                    scale={8}
                    size={maxIntensity > 0 ? 2 + maxIntensity * 3 : 2}
                    speed={maxIntensity > 0 ? 0.5 + maxIntensity * 1.5 : 0.5}
                    opacity={0.4 + (maxIntensity * 0.4)}
                    color={sparkleColor}
                />
                {/* Holographic Chamber Floor */}
                <HolographicChamberFloor />

                <React.Suspense fallback={null}>
                    <Environment preset="city" blur={1} />
                </React.Suspense>
                {/* ContactShadows: color #082f49, opacity 0.4, blur 2 */}
                <ContactShadows resolution={isMobile ? 256 : 512} scale={20} blur={2} opacity={0.4} far={10} color="#082f49" />

                {/* Controlled Scientific Bloom on desktop (bypassed on mobile to prevent GPU thermal throttling and lag) */}
                {!isMobile && (
                    <EffectComposer multisampling={0}>
                        <Bloom luminanceThreshold={0.75} luminanceSmoothing={0.65} intensity={0.25} />
                    </EffectComposer>
                )}

                <OrbitControls
                    ref={orbitRef}
                    enablePan={false}
                    minDistance={2}
                    maxDistance={12}
                    autoRotate={true}
                    autoRotateSpeed={0.8}
                    enableDamping
                    dampingFactor={0.08}
                    target={[0, -0.2, 0]}
                    touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
                />
                <GestureController orbitRef={orbitRef} rotationDelta={handRotationDelta} dragDelta={handDragDelta} zoomDelta={handZoomDelta} resetFlag={resetCameraFlag} />
            </Canvas>

            {/* ── UI Severity Legend ───────────────────── */}
            {effects.length > 0 && (
                <div className="absolute top-4 left-4 z-20 bg-slate-950/85 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 shadow-2xl text-xs space-y-2 select-none min-w-[210px] hidden lg:block">
                    <div className="flex items-center gap-2 font-bold text-white/90 text-[11px] uppercase tracking-wider border-b border-white/10 pb-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#facc15] animate-pulse" />
                        Damage Severity Legend
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#facc15] shadow-[0_0_8px_#facc15]" />
                            <span className="text-slate-300">Low</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#f97316] shadow-[0_0_8px_#f97316]" />
                            <span className="text-slate-300">Moderate</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444]" />
                            <span className="text-slate-300">High</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#991b1b] shadow-[0_0_8px_#991b1b]" />
                            <span className="text-slate-300">Critical</span>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Hover tooltip ─────────────────────────────────────────── */}
            {hoveredOrgan && hoveredEffect && (() => {
                const { text, hex } = heatLabelColor(hoveredEffect.intensity);
                return (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none
                        bg-black/85 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-3.5
                        shadow-2xl min-w-[210px] text-center">
                        <p className="text-base font-black text-white flex items-center justify-center gap-2">
                            <span>{ORGAN_ICONS[hoveredOrgan] ?? '🫀'}</span> {hoveredOrgan}
                        </p>
                        <p className="text-xs text-blue-200/70 mt-0.5">{hoveredEffect.effect_type} {hoveredEffect.mechanism && ` - ${hoveredEffect.mechanism}`}</p>
                        <div className="mt-2.5 h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${hoveredEffect.intensity * 100}%`,
                                    background: `linear-gradient(to right, #facc15, ${hex})`
                                }} />
                        </div>
                        <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[10px] text-white/40">Intensity</span>
                            <span className="text-xs font-bold" style={{ color: hex }}>
                                {text} · {(hoveredEffect.intensity * 100).toFixed(0)}%
                            </span>
                        </div>
                        {/* No longer using per-effect onset since it is now in pharmacokinetics, but we can display the risk level */}
                        {hoveredEffect.risk_level && (
                            <p className="text-[10px] text-white/30 mt-1">
                                Risk: {hoveredEffect.risk_level.toUpperCase()}
                            </p>
                        )}
                    </div>
                );
            })()}

            {/* ── Selected Organ Clear control (anchored to top right, away from model feet and bottom controls) ── */}
            {selectedOrgan && (
                <div className="absolute top-14 right-4 sm:right-6 z-20 flex items-center gap-2">
                    <button
                        onClick={() => onOrganSelect('')}
                        className="px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl text-[10px] sm:text-[11px] font-bold border border-white/20
                            bg-black/60 text-white/80 hover:text-white hover:border-white/40 transition-all backdrop-blur-md shadow-lg flex items-center gap-1.5 cursor-pointer">
                        <span>✕</span> Clear Selection
                    </button>
                </div>
            )}

            {/* ── Scan animation while analyzing or curing ───────────────────────── */}
            {(isAnalyzing || isCuring) && (
                <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                    <div className={`absolute top-0 left-0 w-full h-[2px] animate-scan
                        ${isCuring 
                            ? 'bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_24px_#10b981]' 
                            : 'bg-gradient-to-r from-transparent via-rose-400 to-transparent shadow-[0_0_24px_#f43f5e]'}`} />
                    <div className={`absolute inset-0 animate-pulse ${isCuring ? 'bg-emerald-500/5' : 'bg-rose-500/5'}`} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className={`bg-black/75 backdrop-blur-md rounded-2xl px-6 py-4 flex items-center gap-3 border
                            ${isCuring ? 'border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]' : 'border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.2)]'}`}>
                            <div className={`w-4 h-4 border-2 rounded-full animate-spin
                                ${isCuring ? 'border-emerald-400/30 border-t-emerald-400' : 'border-rose-400/30 border-t-rose-400'}`} />
                            <span className={`font-bold text-sm ${isCuring ? 'text-emerald-300' : 'text-rose-300'}`}>
                                {isCuring ? `Neutralizing Pathogen: ${cureProgress}%` : 'Analyzing Pharmacology...'}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Idle hint (hidden on mobile to keep foot area 100% clear) ── */}
            {effects.length === 0 && !isAnalyzing && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none z-10 hidden sm:block">
                    <p className="text-white/15 text-[10px] font-mono uppercase tracking-[0.2em] animate-pulse">
                        Select a drug · run analysis
                    </p>
                </div>
            )}

            <style>{`
                @keyframes scan { 0%{top:0} 100%{top:100%} }
                .animate-scan { animation: scan 2.2s linear infinite; }
            `}</style>
        </div>
    );
};

export default DrugHeatmap3D;
