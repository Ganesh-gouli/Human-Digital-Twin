/**
 * LandmarkIndicator.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Medical Anatomical Landmark Engine – Outer Body Damage Indicator
 *
 * Renders a pulsing red medical-grade dot at the correct anatomical surface
 * position on Human.obj using the landmark database. Zero raycasting.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { HeatmapEffect } from '../types';
import { getLandmark, AnatomicalLandmark } from '../data/anatomicalLandmarks';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Convert Vec3 tuple to THREE.Vector3 */
function v3(t: [number, number, number]): THREE.Vector3 {
    return new THREE.Vector3(t[0], t[1], t[2]);
}

/**
 * Choose whether to show front or back landmark based on camera position.
 * If the camera is looking from the front (+Z side), prefer front landmark.
 * If from back (-Z side), prefer back landmark.
 * Posterior organs (preferBack=true) always use backPos unless unavailable.
 */
function chooseLandmarkPos(
    lm: AnatomicalLandmark,
    cameraWorldPos: THREE.Vector3,
    modelWorldMatrix: THREE.Matrix4
): THREE.Vector3 | null {
    // Bring camera into model-local space so we can check which side it is on
    const invModel = new THREE.Matrix4().copy(modelWorldMatrix).invert();
    const localCam = cameraWorldPos.clone().applyMatrix4(invModel);
    const cameraIsFront = localCam.z > 0; // positive Z = front of model

    if (lm.preferBack) {
        // Posterior organ: always try back first
        if (lm.backPos) return v3(lm.backPos);
        if (lm.frontPos) return v3(lm.frontPos);
    } else {
        if (cameraIsFront) {
            if (lm.frontPos) return v3(lm.frontPos);
            if (lm.backPos) return v3(lm.backPos);
        } else {
            if (lm.backPos) return v3(lm.backPos);
            if (lm.frontPos) return v3(lm.frontPos);
        }
    }
    return null;
}

// ── Pulsing Medical Dot ───────────────────────────────────────────────────────

interface LandmarkDotProps {
    intensity: number;
    radius: number;
    active: boolean;
    debugLabel?: string;
}

const LandmarkDot: React.FC<LandmarkDotProps> = ({ intensity, radius, active, debugLabel }) => {
    const groupRef = useRef<THREE.Group>(null);
    const dotRef = useRef<THREE.Mesh>(null);
    const ringRef = useRef<THREE.Mesh>(null);
    const ring2Ref = useRef<THREE.Mesh>(null);

    const dotRadius = radius * (0.6 + intensity * 0.4);       // 0.6–1.0× base
    const ringRadius = dotRadius * 1.5;
    const ring2Radius = dotRadius * 2.2;

    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.elapsedTime;
        const speed = 1.0 + intensity * 1.2;                   // faster for severe damage

        // Scale pulse: 1.0 → 1.08 → 1.0
        const pulse = 1.0 + Math.sin(t * speed * Math.PI * 2) * 0.05;

        if (dotRef.current) {
            const targetOp = active ? (0.80 + Math.sin(t * speed * Math.PI * 2) * 0.15) : 0;
            (dotRef.current.material as THREE.MeshBasicMaterial).opacity +=
                (targetOp - (dotRef.current.material as THREE.MeshBasicMaterial).opacity) * 0.08;
            dotRef.current.scale.setScalar(pulse);
        }
        if (ringRef.current) {
            const ringOp = active ? (0.35 + Math.sin(t * speed * Math.PI * 2 + 0.5) * 0.12) : 0;
            (ringRef.current.material as THREE.MeshBasicMaterial).opacity +=
                (ringOp - (ringRef.current.material as THREE.MeshBasicMaterial).opacity) * 0.06;
            ringRef.current.scale.setScalar(1.0 + Math.sin(t * speed * Math.PI * 2 + 0.8) * 0.08);
        }
        if (ring2Ref.current) {
            const r2Op = active ? (0.15 + Math.sin(t * speed * Math.PI * 2 + 1.2) * 0.08) : 0;
            (ring2Ref.current.material as THREE.MeshBasicMaterial).opacity +=
                (r2Op - (ring2Ref.current.material as THREE.MeshBasicMaterial).opacity) * 0.05;
            ring2Ref.current.scale.setScalar(1.0 + Math.sin(t * speed * Math.PI * 2 + 1.6) * 0.12);
        }
    });

    return (
        <group ref={groupRef}>
            {/* Core dot */}
            <mesh ref={dotRef}>
                <circleGeometry args={[dotRadius, 32]} />
                <meshBasicMaterial
                    color="#FF1A1A"
                    transparent
                    opacity={0.9}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                />
            </mesh>
            {/* Inner glow ring */}
            <mesh ref={ringRef}>
                <ringGeometry args={[dotRadius * 0.9, ringRadius, 48]} />
                <meshBasicMaterial
                    color="#FF3030"
                    transparent
                    opacity={0.35}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                />
            </mesh>
            {/* Outer soft halo */}
            <mesh ref={ring2Ref}>
                <ringGeometry args={[ringRadius, ring2Radius, 48]} />
                <meshBasicMaterial
                    color="#FF0000"
                    transparent
                    opacity={0.12}
                    depthWrite={false}
                    side={THREE.DoubleSide}
                />
            </mesh>
            {/* Debug label */}
            {debugLabel && (
                <Html distanceFactor={5} style={{ pointerEvents: 'none' }}>
                    <div style={{
                        background: 'rgba(220,38,38,0.85)',
                        color: 'white',
                        fontSize: '8px',
                        fontFamily: 'monospace',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        whiteSpace: 'nowrap',
                        border: '1px solid rgba(255,80,80,0.5)',
                        userSelect: 'none',
                    }}>
                        📍 {debugLabel}
                    </div>
                </Html>
            )}
        </group>
    );
};

// ── Orient group toward camera (billboard effect) ─────────────────────────────

const BillboardGroup: React.FC<{
    position: THREE.Vector3;
    normal: THREE.Vector3;
    children: React.ReactNode;
}> = ({ position, normal, children }) => {
    const groupRef = useRef<THREE.Group>(null);
    const { camera } = useThree();

    useFrame(() => {
        if (!groupRef.current) return;
        groupRef.current.position.copy(position);

        // Orient so the indicator faces the camera but lies on the surface
        const up = new THREE.Vector3(0, 1, 0);
        const lookDir = camera.position.clone().sub(position).normalize();
        // Blend between normal and camera direction for stable orientation
        const faceDir = normal.clone().lerp(lookDir, 0.3).normalize();
        const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), faceDir);
        groupRef.current.quaternion.copy(quat);
    });

    return <group ref={groupRef}>{children}</group>;
};

// ── Single Landmark Indicator ─────────────────────────────────────────────────

interface SingleLandmarkIndicatorProps {
    effect: HeatmapEffect;
    outerBodyRef: React.MutableRefObject<THREE.Group | null>;
    debugMode?: boolean;
}

const SingleLandmarkIndicator: React.FC<SingleLandmarkIndicatorProps> = ({
    effect,
    outerBodyRef,
    debugMode,
}) => {
    const { camera } = useThree();
    const positionRef = useRef<THREE.Vector3>(new THREE.Vector3());
    const normalRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 1));
    const readyRef = useRef(false);
    const [ready, setReady] = React.useState(false);

    const landmark = useMemo(() => getLandmark(effect.structure_name), [effect.structure_name]);

    useEffect(() => {
        readyRef.current = false;
        setReady(false);
    }, [effect.structure_name]);

    useFrame(() => {
        if (readyRef.current || !landmark) return;
        if (!outerBodyRef.current) return;

        outerBodyRef.current.updateMatrixWorld(true);
        const modelMatrix = outerBodyRef.current.matrixWorld;

        const localPos = chooseLandmarkPos(landmark, camera.position, modelMatrix);
        if (!localPos) return;

        // Transform local landmark position into world space
        const worldPos = localPos.clone().applyMatrix4(modelMatrix);
        positionRef.current.copy(worldPos);

        // Transform normal into world space
        const normalMatrix = new THREE.Matrix3().getNormalMatrix(modelMatrix);
        const worldNormal = v3(landmark.normal).applyMatrix3(normalMatrix).normalize();
        normalRef.current.copy(worldNormal);

        readyRef.current = true;
        setReady(true);
    });

    if (!landmark || !ready) return null;

    const intensity = typeof effect.intensity === 'number' ? effect.intensity : 0.8;
    const debugLabel = debugMode ? `${landmark.displayName} (${landmark.bodyRegion})` : undefined;

    return (
        <BillboardGroup position={positionRef.current} normal={normalRef.current}>
            <LandmarkDot
                intensity={intensity}
                radius={landmark.radius}
                active={true}
                debugLabel={debugLabel}
            />
        </BillboardGroup>
    );
};

// ── Landmark Indicators Container ─────────────────────────────────────────────

interface LandmarkIndicatorsProps {
    effects: HeatmapEffect[];
    outerBodyRef: React.MutableRefObject<THREE.Group | null>;
    debugMode?: boolean;
}

export const LandmarkIndicators: React.FC<LandmarkIndicatorsProps> = ({
    effects,
    outerBodyRef,
    debugMode,
}) => {
    const activeEffects = useMemo(() =>
        effects.filter(e => {
            const v = typeof e.intensity === 'number' ? e.intensity : 0.8;
            return v > 0.05 && getLandmark(e.structure_name) !== null;
        }),
        [effects]
    );

    return (
        <group>
            {activeEffects.map((effect, i) => (
                <SingleLandmarkIndicator
                    key={`${effect.structure_name}-${i}`}
                    effect={effect}
                    outerBodyRef={outerBodyRef}
                    debugMode={debugMode}
                />
            ))}
        </group>
    );
};

// ── Calibration Mode ──────────────────────────────────────────────────────────

interface CalibrationModeProps {
    active: boolean;
    outerBodyRef: React.MutableRefObject<THREE.Group | null>;
}

export const CalibrationMode: React.FC<CalibrationModeProps> = ({ active, outerBodyRef }) => {
    const { gl, camera, raycaster } = useThree();
    const [hitInfo, setHitInfo] = React.useState<{
        worldPos: THREE.Vector3;
        localPos: THREE.Vector3;
        normal: THREE.Vector3;
    } | null>(null);
    const markerRef = useRef<THREE.Mesh>(null);

    useEffect(() => {
        if (!active) return;

        const onClick = (e: MouseEvent) => {
            if (!outerBodyRef.current) return;
            const rect = gl.domElement.getBoundingClientRect();
            const mouse = new THREE.Vector2(
                ((e.clientX - rect.left) / rect.width) * 2 - 1,
                -((e.clientY - rect.top) / rect.height) * 2 + 1,
            );
            raycaster.setFromCamera(mouse, camera);
            const meshes: THREE.Mesh[] = [];
            outerBodyRef.current.traverse(c => {
                if ((c as THREE.Mesh).isMesh) meshes.push(c as THREE.Mesh);
            });
            const hits = raycaster.intersectObjects(meshes, false);
            if (!hits.length) return;

            const hit = hits[0];
            const worldPos = hit.point.clone();

            // Convert to model-local space
            outerBodyRef.current.updateMatrixWorld(true);
            const inv = new THREE.Matrix4().copy(outerBodyRef.current.matrixWorld).invert();
            const localPos = worldPos.clone().applyMatrix4(inv);

            // Face normal in local space
            const normalMatrix = new THREE.Matrix3().getNormalMatrix(hit.object.matrixWorld);
            const worldNormal = hit.face
                ? hit.face.normal.clone().applyMatrix3(normalMatrix).normalize()
                : new THREE.Vector3(0, 0, 1);
            const rootNM = new THREE.Matrix3().getNormalMatrix(inv);
            const localNormal = worldNormal.clone().applyMatrix3(rootNM).normalize();

            setHitInfo({ worldPos, localPos, normal: localNormal });
            console.log(
                `[Calibration] Local position: [${localPos.x.toFixed(4)}, ${localPos.y.toFixed(4)}, ${localPos.z.toFixed(4)}]`,
                `Normal: [${localNormal.x.toFixed(3)}, ${localNormal.y.toFixed(3)}, ${localNormal.z.toFixed(3)}]`
            );
        };

        gl.domElement.addEventListener('click', onClick);
        return () => gl.domElement.removeEventListener('click', onClick);
    }, [active, gl, camera, raycaster, outerBodyRef]);

    if (!active || !hitInfo) return null;

    return (
        <group>
            <mesh ref={markerRef} position={hitInfo.worldPos}>
                <sphereGeometry args={[0.025, 16, 16]} />
                <meshBasicMaterial color="#ff0" depthTest={false} />
            </mesh>
            <Html distanceFactor={4} position={hitInfo.worldPos} style={{ pointerEvents: 'none' }}>
                <div style={{
                    background: 'rgba(0,0,0,0.85)',
                    color: '#facc15',
                    fontSize: '9px',
                    fontFamily: 'monospace',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid rgba(250,204,21,0.4)',
                    whiteSpace: 'nowrap',
                    minWidth: '220px',
                    userSelect: 'text',
                }}>
                    <div style={{ color: '#86efac', marginBottom: 4, fontWeight: 'bold' }}>📍 Calibration Hit</div>
                    <div>frontPos: [{hitInfo.localPos.x.toFixed(4)}, {hitInfo.localPos.y.toFixed(4)}, {hitInfo.localPos.z.toFixed(4)}]</div>
                    <div style={{ color: '#93c5fd' }}>normal: [{hitInfo.normal.x.toFixed(3)}, {hitInfo.normal.y.toFixed(3)}, {hitInfo.normal.z.toFixed(3)}]</div>
                    <div style={{ color: '#a78bfa', marginTop: 4, fontSize: '8px' }}>See console for copyable values</div>
                </div>
            </Html>
        </group>
    );
};

export default LandmarkIndicators;
