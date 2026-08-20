import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Sparkles, ContactShadows, useGLTF, Html, useProgress } from '@react-three/drei';
import * as THREE from 'three';
import { OBJLoader, SkeletonUtils } from 'three-stdlib';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { HeatmapEffect } from '../types';
import gsap from 'gsap';
import { LandmarkIndicators, CalibrationMode } from './LandmarkIndicator';

// Preload GLB models globally to prevent reloading on component re-mount
try {
    useGLTF.preload('/Inner organs.glb');
    useGLTF.preload('/human_anatomy_by_tripo.glb');
    useGLTF.preload('/nervous.glb');
} catch (e) {
    console.warn("GLTF preloading warning:", e);
}

const CanvasLoaderFallback: React.FC = () => {
    const { progress } = useProgress();
    return (
        <Html center>
            <div className="flex flex-col items-center justify-center p-5 bg-slate-950/85 backdrop-blur-xl rounded-2xl border border-white/15 text-center shadow-2xl min-w-[220px] pointer-events-none select-none">
                <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mb-3" />
                <span className="text-xs font-black text-emerald-300 uppercase tracking-widest">
                    Loading 3D Anatomy... {Math.round(progress)}%
                </span>
                <div className="w-full bg-white/10 rounded-full h-1.5 mt-3 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
            </div>
        </Html>
    );
};

// ─── Base color (matches Iron Man Hologram) ───────────────────────────────────
const BASE_COLOR = new THREE.Color('#00ffff');

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

// ─── Heatmap color: intensity → yellow (low) → orange → red (high) ───────────
function heatColor(t: number): THREE.Color {
    t = Math.max(0, Math.min(1, t));
    const c = new THREE.Color();
    if (t < 0.4) {
        // light yellow → orange
        c.setRGB(1.0, 1.0 - t * 0.5, 0.2 - t * 0.2);
    } else if (t < 0.75) {
        // orange → deep orange
        const s = (t - 0.4) / 0.35;
        c.setRGB(1.0, 0.8 - s * 0.45, 0.05);
    } else {
        // deep orange → red
        const s = (t - 0.75) / 0.25;
        c.setRGB(1.0, 0.35 - s * 0.35, 0.0);
    }
    return c;
}

function heatLabelColor(v: number) {
    if (v < 0.35) return { text: 'Low', hex: '#facc15' };
    if (v < 0.65) return { text: 'Moderate', hex: '#f97316' };
    return { text: 'High', hex: '#ef4444' };
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
                             totalEmissiveRadiance += vec3(1.0, 0.18, 0.18) * glow * uDamageIntensity * 3.0;
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

const IndicatorMarker = ({ normal, active, onFadeEnd, isOuterBody }: { normal: THREE.Vector3; active: boolean; onFadeEnd?: () => void; isOuterBody?: boolean }) => {
    const dotRef = useRef<THREE.Mesh>(null);
    const ringRef = useRef<THREE.Mesh>(null);
    const groupRef = useRef<THREE.Group>(null);
    const scaleVal = useRef(0);
    const opacityVal = useRef(0);

    const q = useMemo(() => {
        const up = new THREE.Vector3(0, 0, 1);
        return new THREE.Quaternion().setFromUnitVectors(up, normal);
    }, [normal]);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        const target = active ? 1 : 0;
        const prevOpacity = opacityVal.current;
        scaleVal.current = THREE.MathUtils.lerp(scaleVal.current, target, delta * 5);
        opacityVal.current = THREE.MathUtils.lerp(opacityVal.current, target, delta * 5);

        if (!active && prevOpacity > 0.01 && opacityVal.current <= 0.01) {
            onFadeEnd?.();
        }

        const worldPos = new THREE.Vector3();
        groupRef.current.getWorldPosition(worldPos);
        const dist = state.camera.position.distanceTo(worldPos);
        
        if (isOuterBody) {
            // Smooth opacity animation (40% to 100% to 40%)
            const time = state.clock.elapsedTime;
            const pulseCycle = (Math.sin(time * 3.0) + 1.0) / 2.0; // 0.0 to 1.0
            const opacity = (0.4 + pulseCycle * 0.6) * opacityVal.current;
            const scalePulse = 1.0 + pulseCycle * 0.05; // 1.0 to 1.05

            // Standard basic scale without screen distance compensation so it zooms naturally
            groupRef.current.scale.setScalar(scaleVal.current * scalePulse);

            if (dotRef.current) {
                const mat = dotRef.current.material as THREE.MeshBasicMaterial;
                if (mat) mat.opacity = opacity * 0.9;
            }
            if (ringRef.current) {
                const mat = ringRef.current.material as THREE.MeshBasicMaterial;
                if (mat) mat.opacity = opacity * 0.3; // subtle outer halo
            }
        } else {
            // Keep the previous distance-based scaling & ring pulsing for internal views
            const baseScale = dist * 0.012; 
            groupRef.current.scale.setScalar(scaleVal.current * baseScale);

            const time = state.clock.elapsedTime;
            const blinkCycle = (Math.sin(time * (2 * Math.PI / 0.7)) + 1) / 2; // 0.0 to 1.0
            const dotOpacity = (0.4 + blinkCycle * 0.6) * opacityVal.current;
            
            if (dotRef.current) {
                const mat = dotRef.current.material as THREE.MeshBasicMaterial;
                if (mat) mat.opacity = dotOpacity;
            }

            const ringCycle = (time % 1.0) / 1.0; // 0.0 to 1.0
            const ringScale = 1.0 + ringCycle * 0.8; // 1.0 to 1.8
            const ringOpacity = (0.6 * (1.0 - ringCycle)) * opacityVal.current; // 0.6 to 0.0

            if (ringRef.current) {
                ringRef.current.scale.setScalar(ringScale);
                const mat = ringRef.current.material as THREE.MeshBasicMaterial;
                if (mat) mat.opacity = ringOpacity;
            }
        }
    });

    const offset = useMemo(() => normal.clone().multiplyScalar(0.015), [normal]);

    return (
        <group ref={groupRef} quaternion={q} position={offset}>
            {isOuterBody ? (
                <>
                    {/* Medical Pulsing Heat Dot */}
                    <mesh ref={dotRef}>
                        <circleGeometry args={[0.04, 32]} />
                        <meshBasicMaterial
                            color="#FF1E1E"
                            transparent
                            depthWrite={false}
                            opacity={0.8}
                        />
                    </mesh>
                    {/* Subtle outer heat halo */}
                    <mesh ref={ringRef}>
                        <circleGeometry args={[0.08, 32]} />
                        <meshBasicMaterial
                            color="#FF1E1E"
                            transparent
                            depthWrite={false}
                            opacity={0.25}
                        />
                    </mesh>
                </>
            ) : (
                <>
                    {/* Original concentric visual indicators */}
                    <mesh ref={dotRef}>
                        <circleGeometry args={[0.3, 32]} />
                        <meshBasicMaterial
                            color="#FF3030"
                            transparent
                            depthWrite={false}
                            blending={THREE.AdditiveBlending}
                        />
                    </mesh>
                    <mesh ref={ringRef}>
                        <ringGeometry args={[0.35, 0.4, 32]} />
                        <meshBasicMaterial
                            color="#FF3030"
                            transparent
                            depthWrite={false}
                            blending={THREE.AdditiveBlending}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                </>
            )}
        </group>
    );
};

// DamageIndicator is now used only for the INTERNAL anatomy view.
// Outer body indicators are handled by LandmarkIndicators (see LandmarkIndicator.tsx).
const DamageIndicator = ({ effect, active, onFadeEnd, debugMode }: { effect: HeatmapEffect; active: boolean; onFadeEnd?: () => void; debugMode?: boolean }) => {
    const result = useMemo(() => getEffectPos(effect), [effect]);
    const { scene } = useThree();
    const [projected, setProjected] = useState<{ pos: THREE.Vector3; normal: THREE.Vector3 } | null>(null);
    const projectedRef = useRef<boolean>(false);

    useEffect(() => {
        projectedRef.current = false;
        setProjected(null);
    }, [result]);

    useFrame(() => {
        if (projectedRef.current || !result) return;


        // Collect all non-indicator meshes for internal organ raycasting
        const targetMeshes: THREE.Mesh[] = [];
        scene.traverse(child => {
            if ((child as THREE.Mesh).isMesh && child.visible) {
                const n = (child.name || '').toLowerCase();
                const isVisual = n.includes('ring') || n.includes('hud') || n.includes('indicator') || n.includes('sparkles') || n.includes('line');
                // DamageIndicator is now internal-only: use all non-outer-body meshes
                if (!isVisual && !child.userData.isOuterBody) {
                    targetMeshes.push(child as THREE.Mesh);
                }
            }
        });

        if (targetMeshes.length === 0) return; // Wait for meshes to load

        let rotator: THREE.Object3D | null = null;
        scene.traverse(child => {
            if (child.name === 'scene-rotator-group') {
                rotator = child;
            }
        });

        // Traverse and locate the actual organ mesh in the scene matching our target organ
        let organMesh: THREE.Mesh | null = null;
        scene.traverse(child => {
            if (!organMesh && (child as THREE.Mesh).isMesh) {
                const n = child.name || '';
                const isSkinOrMuscle = n.toLowerCase().includes('human') || n.toLowerCase().includes('body') || n.toLowerCase().includes('skin');
                if (!isSkinOrMuscle && matchOrganName(n, effect.structure_name)) {
                    organMesh = child as THREE.Mesh;
                }
            }
        });

        // Compute dynamic geometry center of the organ mesh in rotator's local coordinate system
        const localOrganCenter = new THREE.Vector3();
        if (organMesh) {
            if (!organMesh.geometry.boundingBox) {
                organMesh.geometry.computeBoundingBox();
            }
            const localBBoxCenter = organMesh.geometry.boundingBox!.getCenter(new THREE.Vector3());
            const worldOrganCenter = localBBoxCenter.clone().applyMatrix4(organMesh.matrixWorld);
            localOrganCenter.copy(worldOrganCenter);
            if (rotator) {
                const inv = new THREE.Matrix4().copy(rotator.matrixWorld).invert();
                localOrganCenter.applyMatrix4(inv);
            }
        } else {
            localOrganCenter.copy(result.pos);
        }

        const isPosterior = result.normal.z < 0;
        const localRayOrigin = new THREE.Vector3(
            localOrganCenter.x,
            localOrganCenter.y,
            isPosterior ? -3.0 : 3.0
        );
        const localRayDir = new THREE.Vector3(0, 0, isPosterior ? 1 : -1);

        const worldRayOrigin = localRayOrigin.clone();
        const worldRayDir = localRayDir.clone();

        if (rotator) {
            rotator.updateMatrixWorld(true);
            worldRayOrigin.applyMatrix4(rotator.matrixWorld);
            const normalMatrix = new THREE.Matrix3().getNormalMatrix(rotator.matrixWorld);
            worldRayDir.applyMatrix3(normalMatrix).normalize();
        }

        // Temporarily set all target materials to DoubleSide to ensure we intersect front- and back-faces (posterior/anterior)
        const originalSides = new Map<THREE.Material, THREE.Side>();
        targetMeshes.forEach(mesh => {
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach(mat => {
                originalSides.set(mat, mat.side);
                mat.side = THREE.DoubleSide;
            });
        });

        const raycaster = new THREE.Raycaster();
        raycaster.set(worldRayOrigin, worldRayDir);
        const intersects = raycaster.intersectObjects(targetMeshes, true);

        // Restore original material side configurations
        targetMeshes.forEach(mesh => {
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach(mat => {
                const orig = originalSides.get(mat);
                if (orig !== undefined) mat.side = orig;
            });
        });

        if (intersects.length > 0) {
            const hit = intersects[0];
            const hitPoint = hit.point.clone();
            
            const normalMatrix = new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld);
            const worldNormal = hit.face ? hit.face.normal.clone().applyMatrix3(normalMatrix).normalize() : result.normal;
            
            const localPos = hitPoint.clone();
            const localNormal = worldNormal.clone();
            
            if (rotator) {
                const inv = new THREE.Matrix4().copy(rotator.matrixWorld).invert();
                localPos.applyMatrix4(inv);
                const invNormalMatrix = new THREE.Matrix3().getNormalMatrix(inv);
                localNormal.applyMatrix3(invNormalMatrix).normalize();
            }
            
            setProjected({ pos: localPos, normal: localNormal });
            projectedRef.current = true;
        } else {
            setProjected({ pos: result.pos, normal: result.normal });
            projectedRef.current = true;
        }
    });

    if (!result || !projected) return null;

    const { pos, normal } = projected;

    return (
        <group>
            {/* Actual Damage Indicator Spot */}
            <group position={pos}>
                <IndicatorMarker normal={normal} active={active} onFadeEnd={onFadeEnd} isOuterBody={false} />
            </group>

            {/* Debug Mode Overlays: Projection Ray Line + Surface Normal Line */}
            {debugMode && (
                <group>
                    {/* Orange projection ray path */}
                    <line>
                        <bufferGeometry attach="geometry" onUpdate={self => self.setFromPoints([result.pos, pos])} />
                        <lineBasicMaterial color="#f59e0b" depthTest={false} transparent opacity={0.7} />
                    </line>
                    {/* Green normal vector line */}
                    <line>
                        <bufferGeometry attach="geometry" onUpdate={self => self.setFromPoints([pos, pos.clone().add(normal.clone().multiplyScalar(0.25))])} />
                        <lineBasicMaterial color="#10b981" depthTest={false} />
                    </line>
                    {/* Yellow organ anchor marker */}
                    <mesh position={result.pos}>
                        <sphereGeometry args={[0.015, 8, 8]} />
                        <meshBasicMaterial color="#fbbf24" depthTest={false} />
                    </mesh>
                </group>
            )}
        </group>
    );
};

// DamageIndicators is only used for INTERNAL anatomy views.
const DamageIndicators = ({ effects = [], debugMode }: { effects?: HeatmapEffect[]; debugMode?: boolean }) => {
    const [activeList, setActiveList] = useState<{ effect: HeatmapEffect; isFadingOut: boolean }[]>([]);

    useEffect(() => {
        setActiveList(prev => {
            const nextActive = effects.filter(e => {
                const val = (e.intensity !== undefined && e.intensity !== null) ? Number(e.intensity) : 0.8;
                return val > 0.05;
            });

            const newList = [...prev];

            newList.forEach(item => {
                const exists = nextActive.some(e => e.structure_name === item.effect.structure_name);
                if (!exists) {
                    item.isFadingOut = true;
                } else {
                    const matching = nextActive.find(e => e.structure_name === item.effect.structure_name);
                    if (matching) {
                        item.effect = matching;
                        item.isFadingOut = false;
                    }
                }
            });

            nextActive.forEach(e => {
                const exists = newList.some(item => item.effect.structure_name === e.structure_name);
                if (!exists) {
                    newList.push({ effect: e, isFadingOut: false });
                }
            });

            return newList;
        });
    }, [effects]);

    const handleFadeEnd = useCallback((structureName: string) => {
        setActiveList(prev => prev.filter(item => !(item.effect.structure_name === structureName && item.isFadingOut)));
    }, []);

    return (
        <group>
            {activeList.map((item, idx) => (
                <DamageIndicator
                    key={`${item.effect.structure_name}-${idx}`}
                    effect={item.effect}
                    active={!item.isFadingOut}
                    onFadeEnd={() => handleFadeEnd(item.effect.structure_name)}
                    debugMode={debugMode}
                />
            ))}
        </group>
    );
};

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

const CameraSetup: React.FC<{ resetCameraFlag?: number }> = ({ resetCameraFlag }) => {
    const { camera } = useThree();
    useEffect(() => {
        const perspectiveCamera = camera as THREE.PerspectiveCamera;
        const fov = perspectiveCamera.fov * (Math.PI / 180);
        const distance = 4.0 / (2 * Math.tan(fov / 2));
        camera.position.set(0, 0, distance * 1.15);
        camera.lookAt(0, 0, 0);
        camera.updateProjectionMatrix();
    }, [camera, resetCameraFlag]);
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
    const obj = useLoader(OBJLoader, '/Human.obj');
    const groupRef = useRef<THREE.Group>(null);
    const { camera, gl, raycaster, scene } = useThree();

    const registry = useAnatomyHighlighter(obj, effects, isGlassMode);

    const mat = useMemo(() => {
        if (isGlassMode) {
            return new THREE.ShaderMaterial({
                uniforms: {
                    p: { value: 3.0 },
                    glowColor: { value: new THREE.Color(0.2, 0.4, 0.8) },
                    viewVector: { value: camera.position },
                    uBrainPos: { value: new THREE.Vector3(0, 1.76, 0.28) },
                    uBrainIntensity: { value: 0.0 },
                    uHeartPos: { value: new THREE.Vector3(-0.12, 1.05, 0.26) },
                    uHeartIntensity: { value: 0.0 },
                    uLungsPos: { value: new THREE.Vector3(0.15, 0.96, 0.24) },
                    uLungsIntensity: { value: 0.0 },
                    uLiverPos: { value: new THREE.Vector3(0.18, 0.56, 0.24) },
                    uLiverIntensity: { value: 0.0 },
                    uStomachPos: { value: new THREE.Vector3(-0.18, 0.52, 0.26) },
                    uStomachIntensity: { value: 0.0 },
                    uKidneyPos: { value: new THREE.Vector3(0.15, 0.36, -0.22) },
                    uKidneyIntensity: { value: 0.0 },
                    uIntestinesPos: { value: new THREE.Vector3(0.0, 0.1, 0.26) },
                    uIntestinesIntensity: { value: 0.0 },
                    uNervousPos: { value: new THREE.Vector3(0.0, 0.66, -0.22) },
                    uNervousIntensity: { value: 0.0 },
                },
                vertexShader: `
                    uniform vec3 viewVector;
                    varying float intensity;
                    varying vec3 vLocalPosition;
                    void main() {
                        vLocalPosition = position;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        vec3 actual_normal = vec3(modelMatrix * vec4(normal, 0.0));
                        intensity = pow(1.0 - abs(dot(normalize(viewVector), normalize(actual_normal))), 3.0);
                    }
                `,
                fragmentShader: `
                    uniform vec3 glowColor;
                    varying float intensity;
                    varying vec3 vLocalPosition;
                    
                    uniform vec3 uBrainPos; uniform float uBrainIntensity;
                    uniform vec3 uHeartPos; uniform float uHeartIntensity;
                    uniform vec3 uLungsPos; uniform float uLungsIntensity;
                    uniform vec3 uLiverPos; uniform float uLiverIntensity;
                    uniform vec3 uStomachPos; uniform float uStomachIntensity;
                    uniform vec3 uKidneyPos; uniform float uKidneyIntensity;
                    uniform vec3 uIntestinesPos; uniform float uIntestinesIntensity;
                    uniform vec3 uNervousPos; uniform float uNervousIntensity;

                    vec3 calculateHeatMapColor(float heat) {
                        vec3 colLow = vec3(0.0, 0.82, 1.0);    // 🔵 Low impact
                        vec3 colMod = vec3(0.06, 0.78, 0.45);  // 🟢 Moderate
                        vec3 colSig = vec3(0.96, 0.75, 0.04);  // 🟡 Significant
                        vec3 colHigh = vec3(0.95, 0.15, 0.20); // 🔴 High impact

                        if (heat < 0.33) {
                            return mix(colLow, colMod, heat / 0.33);
                        } else if (heat < 0.66) {
                            return mix(colMod, colSig, (heat - 0.33) / 0.33);
                        } else {
                            return mix(colSig, colHigh, clamp((heat - 0.66) / 0.34, 0.0, 1.0));
                        }
                    }

                    void main() {
                        vec3 finalGlow = glowColor * intensity * 1.5;
                        
                        float brainGlow = smoothstep(0.48, 0.0, distance(vLocalPosition, uBrainPos)) * uBrainIntensity;
                        float heartGlow = smoothstep(0.48, 0.0, distance(vLocalPosition, uHeartPos)) * uHeartIntensity;
                        float lungsGlow = smoothstep(0.48, 0.0, distance(vLocalPosition, uLungsPos)) * uLungsIntensity;
                        float liverGlow = smoothstep(0.48, 0.0, distance(vLocalPosition, uLiverPos)) * uLiverIntensity;
                        float stomachGlow = smoothstep(0.48, 0.0, distance(vLocalPosition, uStomachPos)) * uStomachIntensity;
                        float kidneyGlow = smoothstep(0.48, 0.0, distance(vLocalPosition, uKidneyPos)) * uKidneyIntensity;
                        float intestinesGlow = smoothstep(0.48, 0.0, distance(vLocalPosition, uIntestinesPos)) * uIntestinesIntensity;
                        float nervousGlow = smoothstep(0.48, 0.0, distance(vLocalPosition, uNervousPos)) * uNervousIntensity;

                        float maxHeat = max(max(max(brainGlow, heartGlow), max(lungsGlow, liverGlow)),
                                            max(max(stomachGlow, kidneyGlow), max(intestinesGlow, nervousGlow)));

                        if (maxHeat > 0.01) {
                            vec3 heatColor = calculateHeatMapColor(maxHeat);
                            finalGlow = mix(finalGlow, heatColor * 2.2, smoothstep(0.01, 0.7, maxHeat));
                        }

                        gl_FragColor = vec4(finalGlow, clamp(intensity * 0.8 + 0.1 + maxHeat * 0.4, 0.0, 1.0));
                    }
                `,
                side: THREE.BackSide,
                blending: THREE.AdditiveBlending,
                transparent: true,
                depthWrite: false
            });
        }

        const physicalMat = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(0xd0e6f2),
            roughness: 0.8,
            metalness: 0.1,
            clearcoat: 0.3,
            transparent: true,
            opacity: 1.0,
            side: THREE.DoubleSide
        });

        physicalMat.onBeforeCompile = (shader) => {
            shader.uniforms.uBrainPos = { value: new THREE.Vector3(0, 1.76, 0.28) };
            shader.uniforms.uBrainIntensity = { value: 0.0 };
            shader.uniforms.uHeartPos = { value: new THREE.Vector3(-0.12, 1.05, 0.26) };
            shader.uniforms.uHeartIntensity = { value: 0.0 };
            shader.uniforms.uLungsPos = { value: new THREE.Vector3(0.15, 0.96, 0.24) };
            shader.uniforms.uLungsIntensity = { value: 0.0 };
            shader.uniforms.uLiverPos = { value: new THREE.Vector3(0.18, 0.56, 0.24) };
            shader.uniforms.uLiverIntensity = { value: 0.0 };
            shader.uniforms.uStomachPos = { value: new THREE.Vector3(-0.18, 0.52, 0.26) };
            shader.uniforms.uStomachIntensity = { value: 0.0 };
            shader.uniforms.uKidneyPos = { value: new THREE.Vector3(0.15, 0.36, -0.22) };
            shader.uniforms.uKidneyIntensity = { value: 0.0 };
            shader.uniforms.uIntestinesPos = { value: new THREE.Vector3(0.0, 0.1, 0.26) };
            shader.uniforms.uIntestinesIntensity = { value: 0.0 };
            shader.uniforms.uNervousPos = { value: new THREE.Vector3(0.0, 0.66, -0.22) };
            shader.uniforms.uNervousIntensity = { value: 0.0 };

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
                 uniform vec3 uBrainPos; uniform float uBrainIntensity;
                 uniform vec3 uHeartPos; uniform float uHeartIntensity;
                 uniform vec3 uLungsPos; uniform float uLungsIntensity;
                 uniform vec3 uLiverPos; uniform float uLiverIntensity;
                 uniform vec3 uStomachPos; uniform float uStomachIntensity;
                 uniform vec3 uKidneyPos; uniform float uKidneyIntensity;
                 uniform vec3 uIntestinesPos; uniform float uIntestinesIntensity;
                 uniform vec3 uNervousPos; uniform float uNervousIntensity;

                 vec3 calculateHeatMapColor(float heat) {
                     vec3 colLow = vec3(0.0, 0.82, 1.0);    // 🔵 Low impact
                     vec3 colMod = vec3(0.06, 0.78, 0.45);  // 🟢 Moderate
                     vec3 colSig = vec3(0.96, 0.75, 0.04);  // 🟡 Significant
                     vec3 colHigh = vec3(0.95, 0.15, 0.20); // 🔴 High impact

                     if (heat < 0.33) {
                         return mix(colLow, colMod, heat / 0.33);
                     } else if (heat < 0.66) {
                         return mix(colMod, colSig, (heat - 0.33) / 0.33);
                     } else {
                         return mix(colSig, colHigh, clamp((heat - 0.66) / 0.34, 0.0, 1.0));
                     }
                 }`
            );

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <emissivemap_fragment>',
                `#include <emissivemap_fragment>
                 float brainGlow = smoothstep(0.48, 0.0, distance(vLocalPosition, uBrainPos)) * uBrainIntensity;
                 float heartGlow = smoothstep(0.48, 0.0, distance(vLocalPosition, uHeartPos)) * uHeartIntensity;
                 float lungsGlow = smoothstep(0.48, 0.0, distance(vLocalPosition, uLungsPos)) * uLungsIntensity;
                 float liverGlow = smoothstep(0.48, 0.0, distance(vLocalPosition, uLiverPos)) * uLiverIntensity;
                 float stomachGlow = smoothstep(0.48, 0.0, distance(vLocalPosition, uStomachPos)) * uStomachIntensity;
                 float kidneyGlow = smoothstep(0.48, 0.0, distance(vLocalPosition, uKidneyPos)) * uKidneyIntensity;
                 float intestinesGlow = smoothstep(0.48, 0.0, distance(vLocalPosition, uIntestinesPos)) * uIntestinesIntensity;
                 float nervousGlow = smoothstep(0.48, 0.0, distance(vLocalPosition, uNervousPos)) * uNervousIntensity;

                 float maxHeat = max(max(max(brainGlow, heartGlow), max(lungsGlow, liverGlow)),
                                     max(max(stomachGlow, kidneyGlow), max(intestinesGlow, nervousGlow)));

                 if (maxHeat > 0.01) {
                     vec3 heatColor = calculateHeatMapColor(maxHeat);
                     diffuseColor.rgb = mix(diffuseColor.rgb, heatColor, smoothstep(0.01, 0.7, maxHeat) * 0.85);
                     totalEmissiveRadiance += heatColor * (maxHeat * 3.0 + pow(maxHeat, 2.0) * 2.0);
                 }`
            );

            physicalMat.userData.shaderUniforms = shader.uniforms;
        };

        return physicalMat;
    }, [isGlassMode]);

    useMemo(() => {
        obj.traverse(child => {
            const mesh = child as THREE.Mesh;
            if (!mesh.isMesh) return;
            mesh.name = "outer-body-skin";
            mesh.userData.isOuterBody = true;
            mesh.material = mat;
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

        // Expose the outer body group for landmark projection
        if (outerBodyGroupRef && groupRef.current) {
            outerBodyGroupRef.current = groupRef.current;
        }
    }, [obj, outerBodyGroupRef]);

    useFrame((state) => {
        if (isGlassMode && mat instanceof THREE.ShaderMaterial) {
            mat.uniforms.viewVector.value.copy(camera.position);
        }

        const time = state.clock.elapsedTime;
        const pulse = (Math.sin(time * (2 * Math.PI / 0.7)) + 1.0) / 2.0;

        const intensities: Record<string, number> = {
            Brain: 0, Heart: 0, Lungs: 0, Liver: 0, Stomach: 0, Kidney: 0, Intestines: 0, Nervous: 0
        };

        effects.forEach(e => {
            const name = e.structure_name.toLowerCase();
            const intensity = e.intensity || 0.8;
            if (intensity > 0.05) {
                if (name.includes('brain') || name.includes('cns') || name.includes('skull')) {
                    intensities.Brain = Math.max(intensities.Brain, intensity);
                } else if (name.includes('heart') || name.includes('cardiac')) {
                    intensities.Heart = Math.max(intensities.Heart, intensity);
                } else if (name.includes('lung') || name.includes('pulmonary') || name.includes('ribs')) {
                    intensities.Lungs = Math.max(intensities.Lungs, intensity);
                } else if (name.includes('liver') || name.includes('hepatic')) {
                    intensities.Liver = Math.max(intensities.Liver, intensity);
                } else if (name.includes('stomach') || name.includes('gastric')) {
                    intensities.Stomach = Math.max(intensities.Stomach, intensity);
                } else if (name.includes('kidney') || name.includes('renal')) {
                    intensities.Kidney = Math.max(intensities.Kidney, intensity);
                } else if (name.includes('intestine') || name.includes('colon') || name.includes('gut')) {
                    intensities.Intestines = Math.max(intensities.Intestines, intensity);
                } else if (name.includes('spine') || name.includes('nervous') || name.includes('spinal')) {
                    intensities.Nervous = Math.max(intensities.Nervous, intensity);
                }
            }
        });

        const uniforms = isGlassMode 
            ? (mat as THREE.ShaderMaterial).uniforms 
            : (mat as any).userData?.shaderUniforms;

        if (uniforms) {
            uniforms.uBrainIntensity.value = intensities.Brain * pulse;
            uniforms.uHeartIntensity.value = intensities.Heart * pulse;
            uniforms.uLungsIntensity.value = intensities.Lungs * pulse;
            uniforms.uLiverIntensity.value = intensities.Liver * pulse;
            uniforms.uStomachIntensity.value = intensities.Stomach * pulse;
            uniforms.uKidneyIntensity.value = intensities.Kidney * pulse;
            uniforms.uIntestinesIntensity.value = intensities.Intestines * pulse;
            uniforms.uNervousIntensity.value = intensities.Nervous * pulse;
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
        const hitMesh = hits[0].object;

        for (const [organName, parts] of Object.entries(registry.current)) {
            if (parts.some(p => p.mesh === hitMesh || p.mesh.uuid === hitMesh.uuid)) {
                return organName;
            }
        }
        return null;
    }, [obj, camera, raycaster, gl, registry]);

    useEffect(() => {
        const el = gl.domElement;
        let last: string | null = null;
        const onMove = (e: PointerEvent) => {
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
    const obj = useLoader(OBJLoader, '/skeleton.obj');
    const groupRef = useRef<THREE.Group>(null);
    const { camera, gl, raycaster } = useThree();

    const registry = useAnatomyHighlighter(obj, effects, isGlassMode);

    const mat = useMemo(() => {
        return new THREE.MeshStandardMaterial({
            color: new THREE.Color('#e0e0e0'),
            roughness: 0.8,
            metalness: 0.1,
            wireframe: false,
            transparent: true,
            opacity: isGlassMode ? 0.3 : 1.0,
            side: THREE.DoubleSide
        });
    }, [isGlassMode]);

    useMemo(() => {
        obj.traverse(child => {
            const mesh = child as THREE.Mesh;
            if (!mesh.isMesh) return;
            mesh.material = mat;
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
        obj.updateMatrixWorld();
    }, [obj]);

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
        const hitMesh = hits[0].object;

        for (const [organName, parts] of Object.entries(registry.current)) {
            if (parts.some(p => p.mesh === hitMesh || p.mesh.uuid === hitMesh.uuid)) {
                return organName;
            }
        }
        return null;
    }, [obj, camera, raycaster, gl, registry]);

    useEffect(() => {
        const el = gl.domElement;
        let last: string | null = null;
        const onMove = (e: PointerEvent) => {
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

    return <group ref={groupRef} visible={visible}><primitive object={obj} /></group>;
});

const InnerOrgansModel: React.FC<HumanModelProps> = React.memo(({ effects = [], isGlassMode, onOrganHover, onOrganClick, visible = true }) => {
    const { scene } = useGLTF('/Inner organs.glb');
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
        const onMove = (e: PointerEvent) => {
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

const normalizeModel = (model: THREE.Object3D) => {
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

    // Rotate target model 90 degrees around Y axis to face the camera
    model.rotation.set(0, Math.PI / 2, 0);
    model.updateMatrixWorld(true);

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
        normalizeModel(cloned);
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
        const onMove = (e: PointerEvent) => {
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
        normalizeModel(cloned);
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
        const onMove = (e: PointerEvent) => {
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
        camera.position.set(0, 0, 5);
        controls.target.set(0, 0, 0);
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

    const organEffects = useMemo(() => effects.filter(e => e.layer !== 'SKELETON_VIEW'), [effects]);
    const skeletonEffects = useMemo(() => effects.filter(e => e.layer === 'SKELETON_VIEW'), [effects]);

    return (
        <div className="relative w-full h-full select-none">
            {/* ── Three.js Canvas ── */}
            <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 45 }}>
                <fog attach="fog" args={['#000000', 10, 25]} />

                {/* Lighting — exact match to MedicalModel3D */}
                <ambientLight intensity={0.7} color="#ffffff" />
                <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1}
                    intensity={1.2} castShadow shadow-mapSize={[780, 780]} color="#ffffff" />
                <pointLight position={[-10, 0, -10]} intensity={1.5} color="#3b82f6" />
                <spotLight position={[0, 5, -5]} intensity={2} color="#06b6d4" />

                <CameraSetup resetCameraFlag={resetCameraFlag} />
                <SceneRotator>
                    <React.Suspense fallback={<CanvasLoaderFallback />}>
                        {(showBody || (!showOrgans && !showSkeleton && !showMuscles && !showNervousGLB)) && (
                            <HumanModel
                                effects={organEffects}
                                isGlassMode={showOrgans ? true : isGlassMode}
                                onOrganHover={setHoveredOrgan}
                                onOrganClick={onOrganSelect}
                                outerBodyGroupRef={outerBodyGroupRef}
                            />
                        )}
                        {showOrgans && (
                            <InnerOrgansModel
                                effects={organEffects}
                                isGlassMode={false}
                                onOrganHover={setHoveredOrgan}
                                onOrganClick={onOrganSelect}
                                visible={showOrgans}
                            />
                        )}
                        {showSkeleton && (
                            <SkeletonModel
                                effects={skeletonEffects}
                                isGlassMode={isGlassMode}
                                onOrganHover={setHoveredOrgan}
                                onOrganClick={onOrganSelect}
                                visible={showSkeleton}
                            />
                        )}
                        {showMuscles && (
                            <MusclesModel
                                effects={organEffects}
                                isGlassMode={isGlassMode}
                                onOrganHover={setHoveredOrgan}
                                onOrganClick={onOrganSelect}
                            />
                        )}
                        {showNervousGLB && (
                            <NervousGLBModel
                                effects={organEffects}
                                isGlassMode={isGlassMode}
                                onOrganHover={setHoveredOrgan}
                                onOrganClick={onOrganSelect}
                            />
                        )}
                    </React.Suspense>

                    {/* Calibration tool: active only when calibrationMode is enabled */}
                    {calibrationMode && (
                        <CalibrationMode active={calibrationMode} outerBodyRef={outerBodyGroupRef} />
                    )}
                </SceneRotator>

                {/* Simulated Pharmacokinetics Drug Flow Particles */}
                <PharmacokineticsFlow active={organEffects.length > 0 || skeletonEffects.length > 0} />

                {/* Reactive sparkles: more intense drugs mean faster, denser, and sharper colored sparkles */}
                <Sparkles
                    count={maxIntensity > 0 ? 30 + Math.floor(maxIntensity * 70) : 30}
                    scale={8}
                    size={maxIntensity > 0 ? 2 + maxIntensity * 3 : 2}
                    speed={maxIntensity > 0 ? 0.5 + maxIntensity * 1.5 : 0.5}
                    opacity={0.4 + (maxIntensity * 0.4)}
                    color={maxIntensity > 0.7 ? "#fca5a5" : maxIntensity > 0.4 ? "#fde047" : "#bae6fd"}
                />
                <Environment preset="city" blur={1} />
                <ContactShadows resolution={512} scale={20} blur={2} opacity={0.4} far={10} color="#082f49" />

                <OrbitControls
                    ref={orbitRef}
                    enablePan={false}
                    minDistance={2}
                    maxDistance={12}
                    autoRotate={true}
                    autoRotateSpeed={0.8}
                    enableDamping
                    dampingFactor={0.08}
                />
                <GestureController orbitRef={orbitRef} rotationDelta={handRotationDelta} dragDelta={handDragDelta} zoomDelta={handZoomDelta} resetFlag={resetCameraFlag} />
            </Canvas>

            {/* ── 4-Tier Surface Heat-Map Impact Legend ───────────────────── */}
            {effects.length > 0 && (
                <div className="absolute top-4 left-4 z-20 bg-slate-950/85 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 shadow-2xl text-xs space-y-2 select-none min-w-[210px]">
                    <div className="flex items-center gap-2 font-bold text-white/90 text-[11px] uppercase tracking-wider border-b border-white/10 pb-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Surface Impact Heat-Map
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[10px]">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#00d2ff] shadow-[0_0_8px_#00d2ff]" />
                            <span className="text-slate-300">🔵 Low Impact</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]" />
                            <span className="text-slate-300">🟢 Moderate</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]" />
                            <span className="text-slate-300">🟡 Significant</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444] shadow-[0_0_8px_#ef4444]" />
                            <span className="text-slate-300">🔴 High Impact</span>
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

            {/* ── Bottom controls ───────────────────────────────────────── */}
            {effects.length > 0 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                    <button
                        onClick={() => onOrganSelect('')}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-bold border border-white/15
                            bg-black/40 text-white/50 hover:text-white hover:border-white/35 transition-all backdrop-blur-sm">
                        ↺ Reset View
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

            {/* ── Idle hint ─────────────────────────────────────────────── */}
            {effects.length === 0 && !isAnalyzing && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none z-10">
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
