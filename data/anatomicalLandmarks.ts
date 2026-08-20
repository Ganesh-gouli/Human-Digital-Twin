/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Medical Anatomical Landmark Database
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Every landmark is stored in Human.obj LOCAL MODEL SPACE after normalization:
 *   - Model height = 4.0 units (head ≈ Y +1.9, feet ≈ Y -1.9)
 *   - Patient faces camera  → front = +Z, back = -Z
 *   - Patient anatomical RIGHT side = model +X
 *   - Patient anatomical LEFT  side = model -X
 *
 * Coordinate source: confirmed shader uniform positions in HumanModel
 *   (Brain 0,1.76,0.28  Heart -0.12,1.05,0.26  Liver 0.18,0.56,0.24 etc.)
 *   offset outward ~0.10 units to the skin surface.
 *
 * To recalibrate: enable Calibration Mode, click the outer body, paste coords.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export type BodyRegionId =
    | 'HEAD' | 'FACE' | 'NECK'
    | 'LEFT_CHEST' | 'RIGHT_CHEST' | 'CENTER_CHEST' | 'UPPER_BACK'
    | 'LEFT_UPPER_ABDOMEN' | 'RIGHT_UPPER_ABDOMEN' | 'UPPER_ABDOMEN'
    | 'LEFT_LOWER_BACK' | 'RIGHT_LOWER_BACK' | 'MIDDLE_BACK' | 'LOWER_BACK'
    | 'LEFT_FLANK' | 'RIGHT_FLANK'
    | 'LOWER_ABDOMEN' | 'PELVIS'
    | 'LEFT_HIP' | 'RIGHT_HIP'
    | 'LEFT_UPPER_ARM' | 'RIGHT_UPPER_ARM'
    | 'LEFT_FOREARM' | 'RIGHT_FOREARM'
    | 'LEFT_HAND' | 'RIGHT_HAND'
    | 'LEFT_THIGH' | 'RIGHT_THIGH'
    | 'LEFT_CALF' | 'RIGHT_CALF'
    | 'LEFT_FOOT' | 'RIGHT_FOOT';

/** A 3-component position/direction in model-local space: [x, y, z] */
export type Vec3 = [number, number, number];

export interface AnatomicalLandmark {
  organ: string;
  displayName: string;
  bodyRegion: BodyRegionId;
  frontPos: Vec3 | null;
  backPos: Vec3 | null;
  normal: Vec3;
  radius: number;
  forbiddenRegions: BodyRegionId[];
  preferBack: boolean;
}

export const ANATOMICAL_LANDMARKS: AnatomicalLandmark[] = [
  {
    organ: 'brain', displayName: 'Brain', bodyRegion: 'HEAD',
    frontPos: [0.0, 1.78, 0.18], backPos: [0.0, 1.76, -0.18],
    normal: [0.0, 0.1, 1.0], radius: 0.06, preferBack: false,
    forbiddenRegions: ['LOWER_ABDOMEN','PELVIS','LEFT_THIGH','RIGHT_THIGH','LEFT_CALF','RIGHT_CALF','LEFT_FOOT','RIGHT_FOOT','LEFT_UPPER_ARM','RIGHT_UPPER_ARM'],
  },
  {
    organ: 'eyes', displayName: 'Eyes', bodyRegion: 'FACE',
    frontPos: [0.06, 1.72, 0.19], backPos: null,
    normal: [0.0, 0.0, 1.0], radius: 0.03, preferBack: false,
    forbiddenRegions: ['LOWER_ABDOMEN','PELVIS','LEFT_THIGH','RIGHT_THIGH'],
  },
  {
    organ: 'thyroid', displayName: 'Thyroid', bodyRegion: 'NECK',
    frontPos: [0.0, 1.38, 0.14], backPos: null,
    normal: [0.0, 0.0, 1.0], radius: 0.03, preferBack: false,
    forbiddenRegions: ['LOWER_ABDOMEN','PELVIS','LEFT_THIGH','RIGHT_THIGH','HEAD'],
  },
  {
    organ: 'heart', displayName: 'Heart', bodyRegion: 'LEFT_CHEST',
    frontPos: [-0.14, 1.06, 0.19], backPos: [-0.10, 1.06, -0.18],
    normal: [-0.1, 0.0, 1.0], radius: 0.055, preferBack: false,
    forbiddenRegions: ['HEAD','NECK','LOWER_ABDOMEN','PELVIS','LEFT_THIGH','RIGHT_THIGH','LEFT_CALF','RIGHT_CALF','LEFT_FOOT','RIGHT_FOOT'],
  },
  {
    organ: 'left_lung', displayName: 'Left Lung', bodyRegion: 'LEFT_CHEST',
    frontPos: [-0.20, 0.96, 0.16], backPos: [-0.18, 0.96, -0.17],
    normal: [-0.3, 0.0, 0.95], radius: 0.055, preferBack: false,
    forbiddenRegions: ['HEAD','NECK','LOWER_ABDOMEN','PELVIS','LEFT_THIGH','RIGHT_THIGH'],
  },
  {
    organ: 'right_lung', displayName: 'Right Lung', bodyRegion: 'RIGHT_CHEST',
    frontPos: [0.22, 0.96, 0.16], backPos: [0.20, 0.96, -0.17],
    normal: [0.3, 0.0, 0.95], radius: 0.055, preferBack: false,
    forbiddenRegions: ['HEAD','NECK','LOWER_ABDOMEN','PELVIS','LEFT_THIGH','RIGHT_THIGH'],
  },
  {
    organ: 'lungs', displayName: 'Lungs', bodyRegion: 'CENTER_CHEST',
    frontPos: [0.0, 0.96, 0.19], backPos: [0.0, 0.96, -0.17],
    normal: [0.0, 0.0, 1.0], radius: 0.06, preferBack: false,
    forbiddenRegions: ['HEAD','NECK','LOWER_ABDOMEN','PELVIS','LEFT_THIGH','RIGHT_THIGH'],
  },
  {
    organ: 'liver', displayName: 'Liver', bodyRegion: 'RIGHT_UPPER_ABDOMEN',
    frontPos: [0.22, 0.56, 0.17], backPos: [0.18, 0.56, -0.16],
    normal: [0.15, 0.0, 1.0], radius: 0.06, preferBack: false,
    forbiddenRegions: ['HEAD','NECK','LEFT_CHEST','PELVIS','LEFT_THIGH','RIGHT_THIGH','LEFT_UPPER_ARM','RIGHT_UPPER_ARM'],
  },
  {
    organ: 'gallbladder', displayName: 'Gallbladder', bodyRegion: 'RIGHT_UPPER_ABDOMEN',
    frontPos: [0.20, 0.48, 0.17], backPos: null,
    normal: [0.1, 0.0, 1.0], radius: 0.04, preferBack: false,
    forbiddenRegions: ['HEAD','NECK','PELVIS','LEFT_THIGH','RIGHT_THIGH'],
  },
  {
    organ: 'stomach', displayName: 'Stomach', bodyRegion: 'LEFT_UPPER_ABDOMEN',
    frontPos: [-0.18, 0.52, 0.18], backPos: null,
    normal: [-0.1, 0.0, 1.0], radius: 0.055, preferBack: false,
    forbiddenRegions: ['HEAD','NECK','RIGHT_CHEST','PELVIS','LEFT_THIGH','RIGHT_THIGH'],
  },
  {
    organ: 'spleen', displayName: 'Spleen', bodyRegion: 'LEFT_UPPER_ABDOMEN',
    frontPos: [-0.22, 0.52, 0.15], backPos: [-0.20, 0.52, -0.15],
    normal: [-0.2, 0.0, 0.98], radius: 0.045, preferBack: false,
    forbiddenRegions: ['HEAD','NECK','RIGHT_CHEST','PELVIS','LEFT_THIGH','RIGHT_THIGH'],
  },
  {
    organ: 'pancreas', displayName: 'Pancreas', bodyRegion: 'UPPER_ABDOMEN',
    frontPos: [0.0, 0.48, 0.17], backPos: [0.0, 0.48, -0.16],
    normal: [0.0, 0.0, 1.0], radius: 0.04, preferBack: false,
    forbiddenRegions: ['HEAD','NECK','PELVIS','LEFT_THIGH','RIGHT_THIGH'],
  },
  {
    organ: 'adrenal', displayName: 'Adrenal Glands', bodyRegion: 'UPPER_ABDOMEN',
    frontPos: [0.0, 0.60, 0.17], backPos: [0.0, 0.60, -0.16],
    normal: [0.0, 0.0, 1.0], radius: 0.035, preferBack: false,
    forbiddenRegions: ['HEAD','NECK','PELVIS','LEFT_THIGH','RIGHT_THIGH'],
  },
  {
    organ: 'left_kidney', displayName: 'Left Kidney', bodyRegion: 'LEFT_LOWER_BACK',
    frontPos: [-0.22, 0.36, 0.13], backPos: [-0.18, 0.36, -0.17],
    normal: [-0.1, 0.0, -1.0], radius: 0.05, preferBack: true,
    forbiddenRegions: ['HEAD','NECK','CENTER_CHEST','PELVIS','LEFT_THIGH','RIGHT_THIGH'],
  },
  {
    organ: 'right_kidney', displayName: 'Right Kidney', bodyRegion: 'RIGHT_LOWER_BACK',
    frontPos: [0.22, 0.36, 0.13], backPos: [0.18, 0.36, -0.17],
    normal: [0.1, 0.0, -1.0], radius: 0.05, preferBack: true,
    forbiddenRegions: ['HEAD','NECK','CENTER_CHEST','PELVIS','LEFT_THIGH','RIGHT_THIGH'],
  },
  {
    organ: 'kidneys', displayName: 'Kidneys', bodyRegion: 'RIGHT_LOWER_BACK',
    frontPos: [0.20, 0.36, 0.13], backPos: [0.16, 0.36, -0.17],
    normal: [0.05, 0.0, -1.0], radius: 0.055, preferBack: true,
    forbiddenRegions: ['HEAD','NECK','CENTER_CHEST','PELVIS','LEFT_THIGH','RIGHT_THIGH'],
  },
  {
    organ: 'small_intestine', displayName: 'Small Intestine', bodyRegion: 'LOWER_ABDOMEN',
    frontPos: [0.0, 0.10, 0.18], backPos: null,
    normal: [0.0, 0.0, 1.0], radius: 0.055, preferBack: false,
    forbiddenRegions: ['HEAD','NECK','CENTER_CHEST','LEFT_THIGH','RIGHT_THIGH'],
  },
  {
    organ: 'large_intestine', displayName: 'Large Intestine', bodyRegion: 'LOWER_ABDOMEN',
    frontPos: [0.0, 0.05, 0.18], backPos: null,
    normal: [0.0, 0.0, 1.0], radius: 0.055, preferBack: false,
    forbiddenRegions: ['HEAD','NECK','CENTER_CHEST','LEFT_THIGH','RIGHT_THIGH'],
  },
  {
    organ: 'intestines', displayName: 'Intestines', bodyRegion: 'LOWER_ABDOMEN',
    frontPos: [0.0, 0.08, 0.18], backPos: null,
    normal: [0.0, 0.0, 1.0], radius: 0.06, preferBack: false,
    forbiddenRegions: ['HEAD','NECK','CENTER_CHEST','LEFT_THIGH','RIGHT_THIGH'],
  },
  {
    organ: 'bladder', displayName: 'Bladder', bodyRegion: 'PELVIS',
    frontPos: [0.0, -0.30, 0.16], backPos: null,
    normal: [0.0, -0.1, 1.0], radius: 0.045, preferBack: false,
    forbiddenRegions: ['HEAD','NECK','CENTER_CHEST','LEFT_THIGH','RIGHT_THIGH'],
  },
  {
    organ: 'uterus', displayName: 'Uterus/Reproductive', bodyRegion: 'PELVIS',
    frontPos: [0.0, -0.28, 0.16], backPos: null,
    normal: [0.0, 0.0, 1.0], radius: 0.045, preferBack: false,
    forbiddenRegions: ['HEAD','NECK','CENTER_CHEST'],
  },
  {
    organ: 'spine', displayName: 'Spine', bodyRegion: 'MIDDLE_BACK',
    frontPos: null, backPos: [0.0, 0.50, -0.17],
    normal: [0.0, 0.0, -1.0], radius: 0.04, preferBack: true,
    forbiddenRegions: ['HEAD','PELVIS','LEFT_THIGH','RIGHT_THIGH'],
  },
  {
    organ: 'nervous_system', displayName: 'Nervous System', bodyRegion: 'MIDDLE_BACK',
    frontPos: [0.0, 1.78, 0.18], backPos: [0.0, 0.66, -0.17],
    normal: [0.0, 0.0, -1.0], radius: 0.055, preferBack: true,
    forbiddenRegions: [],
  },
  {
    organ: 'skin', displayName: 'Skin', bodyRegion: 'CENTER_CHEST',
    frontPos: [0.0, 0.80, 0.19], backPos: [0.0, 0.80, -0.17],
    normal: [0.0, 0.0, 1.0], radius: 0.06, preferBack: false,
    forbiddenRegions: [],
  },
  {
    organ: 'muscles', displayName: 'Muscles', bodyRegion: 'CENTER_CHEST',
    frontPos: [0.0, 0.85, 0.19], backPos: [0.0, 0.80, -0.18],
    normal: [0.0, 0.0, 1.0], radius: 0.06, preferBack: false,
    forbiddenRegions: [],
  },
];

const _index: Map<string, AnatomicalLandmark> = new Map(
    ANATOMICAL_LANDMARKS.map(l => [l.organ, l])
);

export function getLandmark(organName: string): AnatomicalLandmark | null {
    const n = organName.toLowerCase().trim();
    if (_index.has(n)) return _index.get(n)!;

    if (n.includes('brain') || n.includes('cerebr') || n.includes('cns') || n.includes('cranial') || n.includes('encephal') || n.includes('cognitive'))
        return _index.get('brain')!;
    if (n.includes('eye') || n.includes('ocular') || n.includes('retina') || n.includes('optic'))
        return _index.get('eyes')!;
    if (n.includes('thyroid') || n.includes('parathyroid') || n.includes('larynx') || n.includes('trachea') || n.includes('throat') || n.includes('esophagus'))
        return _index.get('thyroid')!;
    if (n.includes('heart') || n.includes('cardiac') || n.includes('cardio') || n.includes('myocard') || n.includes('coronary') || n.includes('aorta') || n.includes('cardiovascular'))
        return _index.get('heart')!;
    if (n.includes('left') && (n.includes('lung') || n.includes('pulmonary')))
        return _index.get('left_lung')!;
    if (n.includes('right') && (n.includes('lung') || n.includes('pulmonary')))
        return _index.get('right_lung')!;
    if (n.includes('lung') || n.includes('pulmonary') || n.includes('respiratory') || n.includes('bronch') || n.includes('alveol') || n.includes('pleura') || n.includes('airway'))
        return _index.get('lungs')!;
    if (n.includes('liver') || n.includes('hepat') || n.includes('metabol'))
        return _index.get('liver')!;
    if (n.includes('gallbladder') || n.includes('gall bladder') || n.includes('biliary') || n.includes('bile'))
        return _index.get('gallbladder')!;
    if (n.includes('stomach') || n.includes('gastric') || n.includes('gastro') || n.includes('digestive'))
        return _index.get('stomach')!;
    if (n.includes('spleen') || n.includes('splenic'))
        return _index.get('spleen')!;
    if (n.includes('pancreas') || n.includes('pancreatic') || n.includes('insulin') || n.includes('endocrine'))
        return _index.get('pancreas')!;
    if (n.includes('adrenal') || n.includes('suprarenal') || n.includes('cortisol'))
        return _index.get('adrenal')!;
    if (n.includes('left') && (n.includes('kidney') || n.includes('renal')))
        return _index.get('left_kidney')!;
    if (n.includes('right') && (n.includes('kidney') || n.includes('renal')))
        return _index.get('right_kidney')!;
    if (n.includes('kidney') || n.includes('renal') || n.includes('nephr') || n.includes('urine') || n.includes('urinary'))
        return _index.get('kidneys')!;
    if (n.includes('small intestine') || n.includes('small bowel') || n.includes('duodenum') || n.includes('jejunum') || n.includes('ileum'))
        return _index.get('small_intestine')!;
    if (n.includes('large intestine') || n.includes('colon') || n.includes('cecum') || n.includes('sigmoid') || n.includes('rectum'))
        return _index.get('large_intestine')!;
    if (n.includes('intestine') || n.includes('bowel') || n.includes('gut') || n.includes('intestinal'))
        return _index.get('intestines')!;
    if (n.includes('bladder') || n.includes('ureter') || n.includes('urethra'))
        return _index.get('bladder')!;
    if (n.includes('uterus') || n.includes('ovary') || n.includes('prostate') || n.includes('pelvic') || n.includes('reproductive'))
        return _index.get('uterus')!;
    if (n.includes('spine') || n.includes('spinal') || n.includes('vertebr') || n.includes('lumbar'))
        return _index.get('spine')!;
    if (n.includes('nervous') || n.includes('neural') || n.includes('nerve'))
        return _index.get('nervous_system')!;
    if (n.includes('skin') || n.includes('integument') || n.includes('dermis') || n.includes('cutaneous'))
        return _index.get('skin')!;
    if (n.includes('muscle') || n.includes('musculo') || n.includes('skeletal') || n.includes('bone') || n.includes('joint'))
        return _index.get('muscles')!;

    return null;
}

export function validateLandmark(landmark: AnatomicalLandmark, chosenRegion: BodyRegionId): boolean {
    if (landmark.forbiddenRegions.includes(chosenRegion)) {
        console.warn(`[AnatomyEngine] VALIDATION FAILED: "${landmark.displayName}" must NOT appear in "${chosenRegion}".`);
        return false;
    }
    return true;
}
