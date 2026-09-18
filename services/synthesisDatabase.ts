import { DrugAnalysisResult, ChemicalSynthesisPathway, MolecularEnhancementProposal, HeatmapEffect } from '../types';

export interface PresetMolecularCard {
    id: string;
    name: string;
    formula: string;
    category: string;
    iupac: string;
    molecularWeight: string;
    targetOrganSparing: string;
    description: string;
    svgFormula: string; // SVG inline drawing of skeletal formula
}

export const PRESET_MOLECULAR_CARDS: PresetMolecularCard[] = [
    {
        id: 'ibuprofen',
        name: 'Ibuprofen',
        formula: 'C₁₃H₁₈O₂',
        category: 'NSAID / Cyclooxygenase Inhibitor',
        iupac: '2-[4-(2-methylpropyl)phenyl]propanoic acid',
        molecularWeight: '206.29 g/mol',
        targetOrganSparing: 'Stomach Sparing (GI Mucosa)',
        description: 'Standard analgesic/anti-inflammatory NSAID. High gastric erosion risk due to local acidic micro-corrosion.',
        svgFormula: `<svg viewBox="0 0 240 100" class="w-full h-full stroke-rose-400 fill-none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <!-- Isobutyl group -->
            <path d="M 20 65 L 40 50 L 40 25 M 40 50 L 60 65" />
            <!-- Benzene ring -->
            <polygon points="60,65 85,50 110,65 110,95 85,110 60,95" transform="translate(10,-10) scale(0.85)" />
            <!-- Double bonds inside benzene -->
            <line x1="72" y1="46" x2="93" y2="34" stroke-width="1.8" />
            <line x1="114" y1="58" x2="114" y2="82" stroke-width="1.8" />
            <line x1="72" y1="94" x2="93" y2="106" stroke-width="1.8" />
            <!-- Propanoic acid chain -->
            <path d="M 125 50 L 145 35 L 145 15 M 145 35 L 170 50 L 195 35" />
            <line x1="168" y1="50" x2="168" y2="75" stroke-width="2.5" />
            <line x1="172" y1="50" x2="172" y2="75" stroke-width="2.5" />
            <text x="163" y="90" fill="#f43f5e" stroke="none" font-size="12" font-family="monospace" font-weight="bold">O</text>
            <text x="198" y="38" fill="#f43f5e" stroke="none" font-size="12" font-family="monospace" font-weight="bold">OH</text>
        </svg>`
    },
    {
        id: 'aspirin',
        name: 'Aspirin',
        formula: 'C₉H₈O₄',
        category: 'Salicylate / Antiplatelet Agent',
        iupac: '2-acetyloxybenzoic acid',
        molecularWeight: '180.16 g/mol',
        targetOrganSparing: 'Stomach & Vascular Endothelium',
        description: 'Irreversible platelet COX-1 inhibitor with high ulceration risk mitigated via phospho-ester derivatives.',
        svgFormula: `<svg viewBox="0 0 240 100" class="w-full h-full stroke-emerald-400 fill-none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <!-- Benzene ring -->
            <polygon points="50,50 75,35 100,50 100,80 75,95 50,80" />
            <line x1="60" y1="47" x2="80" y2="35" stroke-width="1.8" />
            <line x1="95" y1="55" x2="95" y2="75" stroke-width="1.8" />
            <line x1="60" y1="83" x2="80" y2="95" stroke-width="1.8" />
            <!-- Carboxylic acid -->
            <path d="M 100 50 L 125 35 L 150 50" />
            <line x1="123" y1="35" x2="123" y2="15" stroke-width="2.5" />
            <line x1="127" y1="35" x2="127" y2="15" stroke-width="2.5" />
            <text x="119" y="12" fill="#10b981" stroke="none" font-size="11" font-family="monospace" font-weight="bold">O</text>
            <text x="154" y="54" fill="#10b981" stroke="none" font-size="11" font-family="monospace" font-weight="bold">OH</text>
            <!-- Acetoxy ester -->
            <path d="M 100 80 L 125 90 L 145 80 L 170 90" />
            <line x1="143" y1="80" x2="143" y2="60" stroke-width="2.5" />
            <line x1="147" y1="80" x2="147" y2="60" stroke-width="2.5" />
            <text x="139" y="55" fill="#10b981" stroke="none" font-size="11" font-family="monospace" font-weight="bold">O</text>
        </svg>`
    },
    {
        id: 'metformin',
        name: 'Metformin',
        formula: 'C₄H₁₁N₅',
        category: 'Biguanide Antihyperglycemic',
        iupac: '3-(diaminomethylidene)-1,1-dimethylguanidine',
        molecularWeight: '129.16 g/mol',
        targetOrganSparing: 'Kidneys & Intestines (Lactic Acidosis Sparing)',
        description: 'First-line type 2 diabetes agent targeting mitochondrial Complex I and AMPK phosphorylation.',
        svgFormula: `<svg viewBox="0 0 240 100" class="w-full h-full stroke-cyan-400 fill-none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <!-- Dimethylamino group -->
            <path d="M 25 35 L 50 50 L 25 65" />
            <text x="52" y="54" fill="#06b6d4" stroke="none" font-size="13" font-family="monospace" font-weight="bold">N</text>
            <!-- Biguanide backbone -->
            <path d="M 68 50 L 95 50" />
            <line x1="93" y1="50" x2="93" y2="25" stroke-width="2.5" />
            <line x1="97" y1="50" x2="97" y2="25" stroke-width="2.5" />
            <text x="89" y="20" fill="#06b6d4" stroke="none" font-size="11" font-family="monospace" font-weight="bold">NH</text>
            <path d="M 95 50 L 120 65" />
            <text x="122" y="70" fill="#06b6d4" stroke="none" font-size="12" font-family="monospace" font-weight="bold">NH</text>
            <path d="M 142 65 L 165 50" />
            <line x1="163" y1="50" x2="163" y2="25" stroke-width="2.5" />
            <line x1="167" y1="50" x2="167" y2="25" stroke-width="2.5" />
            <text x="159" y="20" fill="#06b6d4" stroke="none" font-size="11" font-family="monospace" font-weight="bold">NH</text>
            <path d="M 165 50 L 195 65" />
            <text x="198" y="70" fill="#06b6d4" stroke="none" font-size="12" font-family="monospace" font-weight="bold">NH₂</text>
        </svg>`
    },
    {
        id: 'paracetamol',
        name: 'Paracetamol',
        formula: 'C₈H₉NO₂',
        category: 'Aniline Analgesic / Antipyretic',
        iupac: 'N-(4-hydroxyphenyl)acetamide',
        molecularWeight: '151.16 g/mol',
        targetOrganSparing: 'Liver (Hepatotoxic NAPQI Elimination)',
        description: 'Ubiquitous central antipyretic. Overdose generates toxic reactive intermediate NAPQI depleting hepatic glutathione.',
        svgFormula: `<svg viewBox="0 0 240 100" class="w-full h-full stroke-amber-400 fill-none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <!-- Phenolic OH -->
            <text x="20" y="55" fill="#f59e0b" stroke="none" font-size="12" font-family="monospace" font-weight="bold">HO</text>
            <path d="M 45 50 L 70 50" />
            <!-- Benzene ring -->
            <polygon points="70,50 95,35 120,50 120,80 95,95 70,80" />
            <line x1="80" y1="47" x2="100" y2="35" stroke-width="1.8" />
            <line x1="115" y1="55" x2="115" y2="75" stroke-width="1.8" />
            <line x1="80" y1="83" x2="100" y2="95" stroke-width="1.8" />
            <!-- Amide linkage -->
            <path d="M 120 50 L 145 50" />
            <text x="148" y="54" fill="#f59e0b" stroke="none" font-size="12" font-family="monospace" font-weight="bold">NH</text>
            <path d="M 172 50 L 195 50 L 220 35" />
            <line x1="193" y1="50" x2="193" y2="75" stroke-width="2.5" />
            <line x1="197" y1="50" x2="197" y2="75" stroke-width="2.5" />
            <text x="189" y="90" fill="#f59e0b" stroke="none" font-size="12" font-family="monospace" font-weight="bold">O</text>
        </svg>`
    },
    {
        id: 'remdesivir',
        name: 'Remdesivir',
        formula: 'C₂₇H₃₅N₆O₈P',
        category: 'ProTide Nucleoside RNA Polymerase Inhibitor',
        iupac: '2-ethylbutyl (2S)-2-[[[(2R,3S,4R,5R)-5-(4-aminopyrrolo[2,1-f][1,2,4]triazin-7-yl)-5-cyano-3,4-dihydroxyoxolan-2-yl]methoxy-phenoxyphosphoryl]amino]propanoate',
        molecularWeight: '602.58 g/mol',
        targetOrganSparing: 'Lungs & Kidneys (Deuterated Spine)',
        description: 'Broad-spectrum antiviral nucleoside phosphoramidate prodrug that terminates nascent viral RNA replication chains.',
        svgFormula: `<svg viewBox="0 0 240 100" class="w-full h-full stroke-violet-400 fill-none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <!-- Nucleobase -->
            <polygon points="30,40 50,25 70,40 70,65 50,80 30,65" />
            <polygon points="70,40 90,30 105,50 90,70 70,65" />
            <!-- Ribose ring -->
            <path d="M 105 50 L 130 50 L 145 35 L 145 65 Z" />
            <!-- Phosphoramidate ester tail -->
            <path d="M 145 50 L 175 50" />
            <circle cx="185" cy="50" r="10" stroke-width="2" />
            <text x="181" y="55" fill="#8b5cf6" stroke="none" font-size="12" font-family="monospace" font-weight="bold">P</text>
            <path d="M 195 50 L 225 35 M 195 50 L 225 65" />
        </svg>`
    },
    {
        id: 'doxorubicin',
        name: 'Doxorubicin',
        formula: 'C₂₇H₂₉NO₁₁',
        category: 'Anthracycline Topoisomerase II Poison',
        iupac: '(7S,9S)-7-[(2R,4S,5S,6S)-4-amino-5-hydroxy-6-methyloxan-2-yl]oxy-6,9,11-trihydroxy-9-(2-hydroxyacetyl)-4-methoxy-8,10-dihydro-7H-tetracene-5,12-dione',
        molecularWeight: '543.52 g/mol',
        targetOrganSparing: 'Heart (Cardiotoxicity Prevention)',
        description: 'Potent chemotherapy anthracycline. Severe cumulative cardiotoxicity prevented through PEGylated nano-liposomal bio-conjugation.',
        svgFormula: `<svg viewBox="0 0 240 100" class="w-full h-full stroke-fuchsia-400 fill-none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <!-- 4 fused anthraquinone rings -->
            <polygon points="20,40 38,28 56,40 56,65 38,77 20,65" />
            <polygon points="56,40 74,28 92,40 92,65 74,77 56,65" />
            <polygon points="92,40 110,28 128,40 128,65 110,77 92,65" />
            <polygon points="128,40 146,28 164,40 164,65 146,77 128,65" />
            <!-- Quinone oxygens -->
            <line x1="74" y1="28" x2="74" y2="12" stroke-width="2" />
            <line x1="110" y1="77" x2="110" y2="92" stroke-width="2" />
            <!-- Amino sugar (daunosamine) link -->
            <path d="M 146 65 L 160 85 L 185 85 L 195 70 L 185 55 Z" />
            <text x="198" y="75" fill="#d946ef" stroke="none" font-size="10" font-family="monospace" font-weight="bold">NH₂</text>
        </svg>`
    }
];

export const PRESET_SYNTHESIS_DB: Record<string, DrugAnalysisResult> = {
    'ibuprofen': {
        drug_name: 'Ibuprofen',
        category: 'NSAID (Propionic Acid Derivative)',
        chemical_formula: 'C₁₃H₁₈O₂',
        iupac_name: '2-[4-(2-methylpropyl)phenyl]propanoic acid',
        smiles_string: 'CC(C)CC1=CC=C(C=C1)C(C)C(=O)O',
        functional_groups: ['Carboxylic Acid (-COOH)', 'Isobutyl Alkyl Group', 'Para-substituted Benzene Ring'],
        molecular_weight: '206.29 g/mol',
        half_life: '1.8 - 2.0 hours',
        bioavailability: '80 - 100% (Oral)',
        peak_concentration_time: '1 - 2 hours',
        system_wide_risk_score: 0.32,
        confidence_score: 96,
        uncertainty_margin: 3.8,
        primary_mechanism: 'Reversible non-selective inhibition of cyclooxygenase enzymes (COX-1 & COX-2), down-regulating arachidonic acid conversion into pro-inflammatory prostaglandins.',
        pharmacokinetics: { onset_minutes: 30, peak_minutes: 90, duration_hours: 6, bioavailability_estimate: 0.92 },
        pharmacodynamics: { primary_mechanism: 'COX-1 / COX-2 catalytic site steric blockade', receptor_targets: ['COX-1 (PTGS1)', 'COX-2 (PTGS2)'], enzyme_inhibition_percent: 88 },
        synthesis_pathway: {
            precursors: ['Isobutylbenzene', 'Acetic Anhydride', 'Carbon Monoxide (CO)', 'Anhydrous Aluminum Chloride (AlCl₃)'],
            reaction_steps: [
                {
                    step_number: 1,
                    reaction_name: 'Friedel-Crafts Acylation',
                    reagents: 'Anhydrous AlCl₃ catalyst / CS₂ or Nitrobenzene solvent',
                    conditions: '0°C to 25°C under dry N₂ atmosphere for 2.5 hours',
                    intermediate_product: '4-Isobutylacetophenone',
                    yield_percent: 91,
                    notes: 'Exothermic electrophilic aromatic substitution with high para-regioselectivity (>98%).'
                },
                {
                    step_number: 2,
                    reaction_name: 'Catalytic Hydrogenation / Carbonyl Reduction',
                    reagents: 'Raney Nickel catalyst or NaBH₄ in absolute ethanol',
                    conditions: '40°C, 3 atm H₂ pressure for 3 hours',
                    intermediate_product: '1-(4-Isobutylphenyl)ethanol',
                    yield_percent: 96,
                    notes: 'Quantitative reduction of the aryl ketone to secondary alcohol intermediate.'
                },
                {
                    step_number: 3,
                    reaction_name: 'Palladium-Catalyzed Carbonylation (BHC Catalytic Process)',
                    reagents: 'Pd(PPh₃)₂Cl₂ catalyst, carbon monoxide gas, aqueous HCl promoter',
                    conditions: '130°C, 50 atm CO pressure',
                    intermediate_product: 'Ibuprofen (Crude Racemate)',
                    yield_percent: 96,
                    notes: 'High atom-efficiency catalytic carbonylation avoiding hazardous chlorinated organic waste.'
                }
            ],
            total_yield_percent: 84,
            atom_economy: '77% (BHC Catalytic Route, vs 40% Boots classic route)',
            green_chemistry_score: 88,
            safety_hazard_notes: 'Exothermic acylation phase requires controlled feed; carbonylation uses pressurized toxic CO.'
        },
        enhancement_proposals: [
            {
                id: 'enh-ibu-1',
                strategy_name: 'Gastric-Sparing Tetrazole Bio-Isostere',
                chemical_modification: 'Isosteric replacement of terminal carboxylic acid (-COOH) with 5-substituted 1H-tetrazole ring',
                pharmacological_rationale: 'Maintains identical planar negative electrostatic distribution for COX-2 binding pocket while eliminating local acidic micro-corrosion of gastric mucosal epithelium.',
                target_organ_sparing: 'Stomach (Mucosal Erosion reduced by 68%)',
                toxicity_reduction_percent: 68,
                half_life_change: 'Extended from 1.9h to 4.2h',
                potency_delta: '+18% COX-2 selectivity',
                synthetic_feasibility: 'High',
                modified_chemical_formula: 'C₁₃H₁₈N₄'
            },
            {
                id: 'enh-ibu-2',
                strategy_name: 'Metabolic Alpha-Fluorination',
                chemical_modification: 'Introduction of single fluorine atom at the alpha-methyl propionic carbon',
                pharmacological_rationale: 'Fluorine electronegativity sterically hinders phase I CYP2C9 oxidative hydroxylation without disrupting pharmacophore binding, prolonging therapeutic residence time.',
                target_organ_sparing: 'Kidneys (-42% peak renal filtration burden)',
                toxicity_reduction_percent: 42,
                half_life_change: 'Extended from 1.9h to 5.6h',
                potency_delta: '+8% anti-inflammatory duration',
                synthetic_feasibility: 'Moderate',
                modified_chemical_formula: 'C₁₃H₁₇FO₂'
            },
            {
                id: 'enh-ibu-3',
                strategy_name: 'NO-Donating Ester Prodrug (Nitro-Ibuprofen)',
                chemical_modification: 'Covalent conjugation of 4-(nitrooxy)butyl ester moiety to the carboxylate terminus',
                pharmacological_rationale: 'Systemic hydrolytic release of nitric oxide (NO) stimulates gastric mucosal blood flow and bicarbonate mucus secretion, neutralizing NSAID-induced enteropathy.',
                target_organ_sparing: 'Stomach & Intestines (-85% ulceration index)',
                toxicity_reduction_percent: 85,
                half_life_change: 'Sustained release over 10 hours',
                potency_delta: 'Preserved antipyretic/analgesic profile',
                synthetic_feasibility: 'High',
                modified_chemical_formula: 'C₁₇H₂₅NO₅'
            }
        ],
        effects: [
            { layer: 'ORGAN_VIEW', structure_name: 'CNS Impact', effect_type: 'Primary Therapeutic', mechanism: 'Inhibition of central pain receptors & thermal regulation in hypothalamus.', intensity: 0.54, risk_level: 'low', confidence_score: 0.95, toxic_threshold: false, accumulation_factor: 0.2, dose_dependency_factor: 0.6 },
            { layer: 'ORGAN_VIEW', structure_name: 'Liver', effect_type: 'Metabolism', mechanism: 'Hepatic CYP2C9 and CYP2C8 first-pass oxidation and clearance.', intensity: 0.36, risk_level: 'low', confidence_score: 0.92, toxic_threshold: false, accumulation_factor: 0.1, dose_dependency_factor: 0.4 },
            { layer: 'ORGAN_VIEW', structure_name: 'Stomach', effect_type: 'Adverse Effect Risk', mechanism: 'Suppression of protective gastric prostaglandins causing mucosal sensitivity.', intensity: 0.62, risk_level: 'moderate', confidence_score: 0.88, toxic_threshold: false, accumulation_factor: 0.3, dose_dependency_factor: 0.7 },
            { layer: 'ORGAN_VIEW', structure_name: 'Kidneys', effect_type: 'Excretion', mechanism: 'Renal hemodynamic modulation and metabolite clearance.', intensity: 0.48, risk_level: 'moderate', confidence_score: 0.85, toxic_threshold: false, accumulation_factor: 0.2, dose_dependency_factor: 0.5 }
        ],
        heatmap_effects: [
            { layer: 'ORGAN_VIEW', structure_name: 'Brain', effect_type: 'Therapeutic', mechanism: 'Central pain inhibition', intensity: 0.54, risk_level: 'low', confidence_score: 0.95, toxic_threshold: false, accumulation_factor: 0.2, dose_dependency_factor: 0.6 },
            { layer: 'ORGAN_VIEW', structure_name: 'Liver', effect_type: 'Metabolism', mechanism: 'CYP2C9 clearance', intensity: 0.36, risk_level: 'low', confidence_score: 0.92, toxic_threshold: false, accumulation_factor: 0.1, dose_dependency_factor: 0.4 },
            { layer: 'ORGAN_VIEW', structure_name: 'Stomach', effect_type: 'Side Effect', mechanism: 'Gastric acid sensitivity & mucosal erosion', intensity: 0.62, risk_level: 'moderate', confidence_score: 0.88, toxic_threshold: false, accumulation_factor: 0.3, dose_dependency_factor: 0.7 },
            { layer: 'ORGAN_VIEW', structure_name: 'Kidneys', effect_type: 'Clearance', mechanism: 'Renal excretion & prostaglandin filtration', intensity: 0.48, risk_level: 'moderate', confidence_score: 0.85, toxic_threshold: false, accumulation_factor: 0.2, dose_dependency_factor: 0.5 }
        ],
        time_based_intensity: { '0 min': 0.1, 'onset': 0.5, 'peak': 1.0, 'mid duration': 0.7, 'end duration': 0.2 }
    },

    'aspirin': {
        drug_name: 'Aspirin',
        category: 'Salicylate / Platelet Aggregation Inhibitor',
        chemical_formula: 'C₉H₈O₄',
        iupac_name: '2-acetyloxybenzoic acid',
        smiles_string: 'CC(=O)OC1=CC=CC=C1C(=O)O',
        functional_groups: ['Ester Linkage (-COO-)', 'Carboxylic Acid (-COOH)', 'Ortho-substituted Benzene Core'],
        molecular_weight: '180.16 g/mol',
        half_life: '15 - 20 minutes (Salicylate: 2 - 3 hours)',
        bioavailability: '50 - 75% (Oral)',
        peak_concentration_time: '1 - 2 hours',
        system_wide_risk_score: 0.35,
        confidence_score: 97,
        uncertainty_margin: 3.2,
        primary_mechanism: 'Irreversible covalent acetylation of Ser-529 residue in platelet cyclooxygenase-1 (COX-1), permanently suppressing thromboxane A2 biosynthesis.',
        pharmacokinetics: { onset_minutes: 20, peak_minutes: 60, duration_hours: 8, bioavailability_estimate: 0.70 },
        pharmacodynamics: { primary_mechanism: 'Irreversible Ser-529 acetylation of COX-1', receptor_targets: ['COX-1 (PTGS1)', 'Platelet TXA2 Synthase'], enzyme_inhibition_percent: 94 },
        synthesis_pathway: {
            precursors: ['Salicylic Acid', 'Acetic Anhydride', 'Phosphoric Acid (85% H₃PO₄ catalyst)'],
            reaction_steps: [
                {
                    step_number: 1,
                    reaction_name: 'Acid-Catalyzed O-Acylation / Esterification',
                    reagents: '85% H₃PO₄ catalyst, Acetic Anhydride',
                    conditions: '85-90°C heating for 25 minutes in water bath',
                    intermediate_product: 'Crude Acetylsalicylic Acid',
                    yield_percent: 94,
                    notes: 'Electrophilic attack of acetylium ion onto phenolic hydroxyl oxygen.'
                },
                {
                    step_number: 2,
                    reaction_name: 'Quenching and Aqueous Crystallization',
                    reagents: 'Chilled deionized H₂O, ice bath',
                    conditions: '0-4°C slow crystallization',
                    intermediate_product: 'Crystalline Aspirin precipitate',
                    yield_percent: 92,
                    notes: 'Precipitates acetylsalicylic acid while hydrolyzing unreacted acetic anhydride to water-soluble acetic acid.'
                },
                {
                    step_number: 3,
                    reaction_name: 'Ethanol-Water Recrystallization & Vacuum Drying',
                    reagents: 'Warm Ethanol / Water (1:2 ratio)',
                    conditions: 'Warm dissolution at 60°C, cooling to 5°C',
                    intermediate_product: 'Pure Pharmaceutical Grade Aspirin',
                    yield_percent: 95,
                    notes: 'Removes trace unreacted salicylic acid to below USP standard (<0.1%).'
                }
            ],
            total_yield_percent: 82,
            atom_economy: '64% (byproduct acetic acid recoverable)',
            green_chemistry_score: 86,
            safety_hazard_notes: 'Corrosive acetic anhydride vapors require fume evacuation.'
        },
        enhancement_proposals: [
            {
                id: 'enh-asp-1',
                strategy_name: 'Phospho-Aspirin (MDC-22 Spacer)',
                chemical_modification: 'Conjugation of diethylphosphate ester moiety to the phenolic/aromatic backbone',
                pharmacological_rationale: 'Completely prevents direct gastric contact irritation and suppresses COX-1-mediated mucosal microhemorrhage by 82% while fully maintaining platelet anti-thrombotic suppression.',
                target_organ_sparing: 'Stomach (-82% mucosal bleeding risk)',
                toxicity_reduction_percent: 82,
                half_life_change: 'Extended to 4.5h',
                potency_delta: '+25% cardioprotective margin',
                synthetic_feasibility: 'High',
                modified_chemical_formula: 'C₁₃H₁₇O₇P'
            },
            {
                id: 'enh-asp-2',
                strategy_name: 'Nitro-Aspirin (NCX-4016 Endothelial Protector)',
                chemical_modification: 'Insertion of nitric oxide-releasing (NO) linker onto carboxyl group',
                pharmacological_rationale: 'Generates microvascular vasodilation in gastric mucosal vessels and coronary arteries, eliminating microvascular ischemia and gastric ulceration.',
                target_organ_sparing: 'Stomach & Heart (-75% vascular strain)',
                toxicity_reduction_percent: 75,
                half_life_change: 'Circulating NO donor for 6h',
                potency_delta: 'Enhanced antithrombotic profile',
                synthetic_feasibility: 'Moderate',
                modified_chemical_formula: 'C₁₄H₁₅NO₇'
            }
        ],
        effects: [
            { layer: 'ORGAN_VIEW', structure_name: 'Heart', effect_type: 'Primary Therapeutic', mechanism: 'Inhibition of platelet aggregation and cardioprotective antithrombotic action.', intensity: 0.78, risk_level: 'low', confidence_score: 0.96, toxic_threshold: false, accumulation_factor: 0.1, dose_dependency_factor: 0.8 },
            { layer: 'ORGAN_VIEW', structure_name: 'Stomach', effect_type: 'Side Effect', mechanism: 'Direct irritation of mucosal barrier and inhibition of protective prostanoids.', intensity: 0.65, risk_level: 'moderate', confidence_score: 0.90, toxic_threshold: false, accumulation_factor: 0.3, dose_dependency_factor: 0.6 },
            { layer: 'ORGAN_VIEW', structure_name: 'Liver', effect_type: 'Clearance', mechanism: 'Hepatic conjugation to salicyluric acid.', intensity: 0.35, risk_level: 'low', confidence_score: 0.89, toxic_threshold: false, accumulation_factor: 0.1, dose_dependency_factor: 0.4 }
        ],
        heatmap_effects: [
            { layer: 'ORGAN_VIEW', structure_name: 'Heart', effect_type: 'Cardiovascular', mechanism: 'Antiplatelet thrombosis prevention', intensity: 0.78, risk_level: 'low', confidence_score: 0.96, toxic_threshold: false, accumulation_factor: 0.1, dose_dependency_factor: 0.8 },
            { layer: 'ORGAN_VIEW', structure_name: 'Stomach', effect_type: 'Gastric Mucosal Burden', mechanism: 'Inhibition of protective prostaglandins', intensity: 0.65, risk_level: 'moderate', confidence_score: 0.90, toxic_threshold: false, accumulation_factor: 0.3, dose_dependency_factor: 0.6 },
            { layer: 'ORGAN_VIEW', structure_name: 'Liver', effect_type: 'Hepatic Conjugation', mechanism: 'Phase II salicyluric acid clearance', intensity: 0.35, risk_level: 'low', confidence_score: 0.89, toxic_threshold: false, accumulation_factor: 0.1, dose_dependency_factor: 0.4 }
        ],
        time_based_intensity: { '0 min': 0.15, 'onset': 0.6, 'peak': 1.0, 'mid duration': 0.65, 'end duration': 0.25 }
    },

    'metformin': {
        drug_name: 'Metformin',
        category: 'Biguanide Antihyperglycemic Agent',
        chemical_formula: 'C₄H₁₁N₅',
        iupac_name: '3-(diaminomethylidene)-1,1-dimethylguanidine',
        smiles_string: 'CN(C)C(=N)N=C(N)N',
        functional_groups: ['Biguanide Pharmacophore', 'Dimethylamino Subunit', 'Guanidine Imines'],
        molecular_weight: '129.16 g/mol (HCl salt: 165.62 g/mol)',
        half_life: '4.0 - 8.7 hours',
        bioavailability: '50 - 60%',
        peak_concentration_time: '2 - 3 hours',
        system_wide_risk_score: 0.26,
        confidence_score: 95,
        uncertainty_margin: 4.1,
        primary_mechanism: 'Inhibition of mitochondrial respiratory chain Complex I in hepatocytes, triggering AMP-activated protein kinase (AMPK) activation and suppressing hepatic gluconeogenesis.',
        pharmacokinetics: { onset_minutes: 60, peak_minutes: 150, duration_hours: 12, bioavailability_estimate: 0.55 },
        pharmacodynamics: { primary_mechanism: 'Mitochondrial Complex I allosteric inhibition and AMPK activation', receptor_targets: ['Mitochondrial Complex I', 'AMPK', 'LKB1'], enzyme_inhibition_percent: 75 },
        synthesis_pathway: {
            precursors: ['Dimethylamine Hydrochloride', '2-Cyanoguanidine (Dicyandiamide)'],
            reaction_steps: [
                {
                    step_number: 1,
                    reaction_name: 'Thermal Nucleophilic Addition Condensation',
                    reagents: 'Toluene or xylene solvent, heat reflux',
                    conditions: '135-140°C under reflux for 4 hours',
                    intermediate_product: 'Crude Metformin Monohydrochloride Base',
                    yield_percent: 94,
                    notes: 'Nucleophilic attack of secondary dimethylamine nitrogen onto cyano-carbon of dicyandiamide with 100% atom addition.'
                },
                {
                    step_number: 2,
                    reaction_name: 'Isopropanol Decolorization and Crystallization',
                    reagents: 'Isopropanol, activated charcoal, filtered hot',
                    conditions: 'Cooled slowly to 10°C for crystal formation',
                    intermediate_product: 'Metformin Hydrochloride (USP White Crystals)',
                    yield_percent: 92,
                    notes: 'Purifies the biguanide salt to >99.8% pharmaceutical purity.'
                }
            ],
            total_yield_percent: 86,
            atom_economy: '100% (Stoichiometric addition reaction, 0 waste byproducts)',
            green_chemistry_score: 94,
            safety_hazard_notes: 'Dimethylamine gas condensation requires refrigerated chilling loop.'
        },
        enhancement_proposals: [
            {
                id: 'enh-met-1',
                strategy_name: 'Mitochondrial-Targeted Mito-Metformin (TPP+ Conjugate)',
                chemical_modification: 'Conjugation of lipophilic triphenylphosphonium (TPP+) cation via alkyl linker',
                pharmacological_rationale: 'Drives 1,000-fold selective accumulation within mitochondrial matrix of target hepatocytes and tumor cells, reducing required clinical dosage 20-fold and completely abolishing systemic lactic acidosis threshold.',
                target_organ_sparing: 'Kidneys & Muscles (-55% metabolic strain)',
                toxicity_reduction_percent: 55,
                half_life_change: 'Prolonged intracellular retention',
                potency_delta: '100x Complex I inhibition efficiency',
                synthetic_feasibility: 'Moderate',
                modified_chemical_formula: 'C₂₃H₂₇N₅P⁺'
            },
            {
                id: 'enh-met-2',
                strategy_name: 'Lipophilic Octyl-Biguanide Derivative',
                chemical_modification: 'Substitution of dimethyl group with octyl lipophilic hydrocarbon chain',
                pharmacological_rationale: 'Improves membrane transport across intestinal enterocytes, eliminating unabsorbed osmotic drag responsible for gastrointestinal cramping and diarrhea.',
                target_organ_sparing: 'Intestines (-70% gastrointestinal distress)',
                toxicity_reduction_percent: 70,
                half_life_change: 'Extended to 12h',
                potency_delta: '+30% cellular uptake',
                synthetic_feasibility: 'High',
                modified_chemical_formula: 'C₁₀H₂₃N₅'
            }
        ],
        effects: [
            { layer: 'ORGAN_VIEW', structure_name: 'Liver', effect_type: 'Primary Therapeutic', mechanism: 'Mitochondrial Complex I suppression & AMPK activation arresting gluconeogenesis.', intensity: 0.84, risk_level: 'low', confidence_score: 0.98, toxic_threshold: false, accumulation_factor: 0.3, dose_dependency_factor: 0.8 },
            { layer: 'ORGAN_VIEW', structure_name: 'Kidneys', effect_type: 'Excretion', mechanism: 'Active organic cation transporter OCT2 renal tubular filtration.', intensity: 0.58, risk_level: 'moderate', confidence_score: 0.94, toxic_threshold: false, accumulation_factor: 0.2, dose_dependency_factor: 0.7 },
            { layer: 'ORGAN_VIEW', structure_name: 'Intestines', effect_type: 'Secondary Action', mechanism: 'Increased anaerobic glucose utilization and GLP-1 secretion.', intensity: 0.52, risk_level: 'moderate', confidence_score: 0.91, toxic_threshold: false, accumulation_factor: 0.4, dose_dependency_factor: 0.6 }
        ],
        heatmap_effects: [
            { layer: 'ORGAN_VIEW', structure_name: 'Liver', effect_type: 'Therapeutic Target', mechanism: 'AMPK phosphorylation & gluconeogenesis inhibition', intensity: 0.84, risk_level: 'low', confidence_score: 0.98, toxic_threshold: false, accumulation_factor: 0.3, dose_dependency_factor: 0.8 },
            { layer: 'ORGAN_VIEW', structure_name: 'Kidneys', effect_type: 'Renal Clearance', mechanism: 'Active tubular secretion via OCT2', intensity: 0.58, risk_level: 'moderate', confidence_score: 0.94, toxic_threshold: false, accumulation_factor: 0.2, dose_dependency_factor: 0.7 },
            { layer: 'ORGAN_VIEW', structure_name: 'Intestines', effect_type: 'Enteric Glucose Uptake', mechanism: 'Microbiome & GLP-1 elevation', intensity: 0.52, risk_level: 'moderate', confidence_score: 0.91, toxic_threshold: false, accumulation_factor: 0.4, dose_dependency_factor: 0.6 }
        ],
        time_based_intensity: { '0 min': 0.1, 'onset': 0.4, 'peak': 1.0, 'mid duration': 0.8, 'end duration': 0.3 }
    },

    'paracetamol': {
        drug_name: 'Paracetamol',
        category: 'Aniline Analgesic / Antipyretic',
        chemical_formula: 'C₈H₉NO₂',
        iupac_name: 'N-(4-hydroxyphenyl)acetamide',
        smiles_string: 'CC(=O)NC1=CC=C(O)C=C1',
        functional_groups: ['Phenolic Hydroxyl (-OH)', 'Secondary Amide (-NH-CO-)', 'Para-substituted Benzene Ring'],
        molecular_weight: '151.16 g/mol',
        half_life: '2.0 - 3.0 hours',
        bioavailability: '70 - 90%',
        peak_concentration_time: '30 - 60 minutes',
        system_wide_risk_score: 0.28,
        confidence_score: 96,
        uncertainty_margin: 3.5,
        primary_mechanism: 'Central nervous system prostaglandin synthase inhibition and active metabolite AM404 cannabinoid interaction; metabolized via CYP2E1 to reactive NAPQI.',
        pharmacokinetics: { onset_minutes: 20, peak_minutes: 45, duration_hours: 5, bioavailability_estimate: 0.85 },
        pharmacodynamics: { primary_mechanism: 'Hypothalamic heat-regulation center modulation and peroxidase catalysis inhibition', receptor_targets: ['COX-3 / Variant COX-1', 'TRPV1', 'CB1 (via AM404)'], enzyme_inhibition_percent: 72 },
        synthesis_pathway: {
            precursors: ['4-Aminophenol', 'Acetic Anhydride', 'Aqueous Sodium Acetate buffer'],
            reaction_steps: [
                {
                    step_number: 1,
                    reaction_name: 'Nucleophilic Acylation of Amino Group',
                    reagents: 'Acetic anhydride in aqueous sodium acetate buffer',
                    conditions: 'Stirred at 90°C for 30 minutes',
                    intermediate_product: 'Crude N-(4-hydroxyphenyl)acetamide',
                    yield_percent: 91,
                    notes: 'Chemoselective N-acylation over O-acylation due to higher nucleophilicity of nitrogen.'
                },
                {
                    step_number: 2,
                    reaction_name: 'Decolorization and Aqueous Recrystallization',
                    reagents: 'Activated charcoal, boiling water',
                    conditions: 'Hot filtration, slow cooling to 5°C',
                    intermediate_product: 'Pharmaceutical Grade Paracetamol Crystals',
                    yield_percent: 87,
                    notes: 'Eliminates colored aminophenol oxidation oligomers.'
                }
            ],
            total_yield_percent: 79,
            atom_economy: '60% (acetic acid byproduct)',
            green_chemistry_score: 84,
            safety_hazard_notes: '4-Aminophenol is skin-sensitizing; requires strict aqueous containment.'
        },
        enhancement_proposals: [
            {
                id: 'enh-para-1',
                strategy_name: 'Glutathione-Sparing Prodrug (Paracetamol-NAC Linker)',
                chemical_modification: 'Esterification with N-acetylcysteine (NAC) auxiliary moiety',
                pharmacological_rationale: 'Enzymatically releases stoichiometric intracellular glutathione donor concurrently with paracetamol, instantaneously conjugating reactive NAPQI intermediate and eliminating acute hepatotoxicity.',
                target_organ_sparing: 'Liver (-85% hepatotoxicity risk)',
                toxicity_reduction_percent: 85,
                half_life_change: 'Steady release over 6h',
                potency_delta: 'Preserved analgesia',
                synthetic_feasibility: 'High',
                modified_chemical_formula: 'C₁₃H₁₆N₂O₄S'
            },
            {
                id: 'enh-para-2',
                strategy_name: '3,5-Dimethylated Acetaminophen Analog',
                chemical_modification: 'Steric di-methylation flanking the phenolic hydroxyl ring',
                pharmacological_rationale: 'Sterically shields the phenolic group from CYP2E1-mediated oxidation into toxic N-acetyl-p-benzoquinone imine (NAPQI), diverting metabolism safely into non-toxic glucuronidation.',
                target_organ_sparing: 'Liver (-92% toxic metabolite formation)',
                toxicity_reduction_percent: 92,
                half_life_change: 'Extended from 2.5h to 4.8h',
                potency_delta: 'Full antipyretic retention',
                synthetic_feasibility: 'Complex',
                modified_chemical_formula: 'C₁₀H₁₃NO₂'
            }
        ],
        effects: [
            { layer: 'ORGAN_VIEW', structure_name: 'Brain', effect_type: 'Primary Therapeutic', mechanism: 'Hypothalamic heat-regulation center modulation and central analgesia.', intensity: 0.72, risk_level: 'low', confidence_score: 0.95, toxic_threshold: false, accumulation_factor: 0.1, dose_dependency_factor: 0.6 },
            { layer: 'ORGAN_VIEW', structure_name: 'Liver', effect_type: 'Metabolism', mechanism: 'Hepatic glucuronidation and CYP2E1 reactive metabolite (NAPQI) glutathione clearance.', intensity: 0.68, risk_level: 'moderate', confidence_score: 0.93, toxic_threshold: false, accumulation_factor: 0.4, dose_dependency_factor: 0.8 }
        ],
        heatmap_effects: [
            { layer: 'ORGAN_VIEW', structure_name: 'Brain', effect_type: 'Therapeutic Analgesia', mechanism: 'Central cannabinoid & hypothalamic thermoregulation', intensity: 0.72, risk_level: 'low', confidence_score: 0.95, toxic_threshold: false, accumulation_factor: 0.1, dose_dependency_factor: 0.6 },
            { layer: 'ORGAN_VIEW', structure_name: 'Liver', effect_type: 'Hepatic Biotransformation', mechanism: 'CYP2E1 transformation & NAPQI clearance burden', intensity: 0.68, risk_level: 'moderate', confidence_score: 0.93, toxic_threshold: false, accumulation_factor: 0.4, dose_dependency_factor: 0.8 }
        ],
        time_based_intensity: { '0 min': 0.15, 'onset': 0.6, 'peak': 1.0, 'mid duration': 0.7, 'end duration': 0.2 }
    },

    'remdesivir': {
        drug_name: 'Remdesivir',
        category: 'ProTide Nucleoside RNA Polymerase Inhibitor',
        chemical_formula: 'C₂₇H₃₅N₆O₈P',
        iupac_name: '2-ethylbutyl (2S)-2-[[[(2R,3S,4R,5R)-5-(4-aminopyrrolo[2,1-f][1,2,4]triazin-7-yl)-5-cyano-3,4-dihydroxyoxolan-2-yl]methoxy-phenoxyphosphoryl]amino]propanoate',
        smiles_string: 'CCC(CC)COC(=O)C(C)NP(=O)(OCC1C(C(C(O1)(C#N)C2=CC=C3N2N=CN=C3N)O)O)OC4=CC=CC=C4',
        functional_groups: ['Pyrrolotriazine Ribosyl Core', 'Phosphoramidate Prodrug Linker', 'Cyano Group (-CN)', 'Ethylbutyl Ester'],
        molecular_weight: '602.58 g/mol',
        half_life: '1.0 hour (Active NTP metabolite: 20 - 25 hours)',
        bioavailability: 'Intravenous Only (Prodrug bypass)',
        peak_concentration_time: '1.5 - 2 hours',
        system_wide_risk_score: 0.42,
        confidence_score: 93,
        uncertainty_margin: 4.8,
        primary_mechanism: 'Intracellularly metabolized into active nucleoside triphosphate (GS-441524-NTP) which competitively incorporates into viral RdRp, causing delayed RNA chain termination at position i+3.',
        pharmacokinetics: { onset_minutes: 45, peak_minutes: 120, duration_hours: 24, bioavailability_estimate: 1.0 },
        pharmacodynamics: { primary_mechanism: 'Viral RNA-dependent RNA polymerase delayed chain termination', receptor_targets: ['Viral RdRp (NSP12)', 'Intracellular CES1/Cathepsin A'], enzyme_inhibition_percent: 91 },
        synthesis_pathway: {
            precursors: ['Pyrrolotriazine ribosyl core', 'Alanine 2-ethylbutyl chloridate', 'tert-Butyl magnesium chloride base'],
            reaction_steps: [
                {
                    step_number: 1,
                    reaction_name: 'Chiral Phosphoramidate Coupling',
                    reagents: 't-BuMgCl base in anhydrous THF',
                    conditions: '-10°C to 0°C under argon atmosphere',
                    intermediate_product: 'Crude Remdesivir Phosphoramidate Diastereomer Mixture',
                    yield_percent: 82,
                    notes: 'Stereoselective phosphorylation of the 5-hydroxyl group on ribose core.'
                },
                {
                    step_number: 2,
                    reaction_name: 'Chiral Resolution and Crystallization',
                    reagents: 'Diisopropyl ether / acetonitrile co-solvent',
                    conditions: 'Crystallization at 20°C',
                    intermediate_product: 'Remdesivir Pure Sp-Diastereomer',
                    yield_percent: 75,
                    notes: 'Isolates the single active (Sp) stereoisomer required for clinical antiviral potency.'
                }
            ],
            total_yield_percent: 61,
            atom_economy: '52%',
            green_chemistry_score: 76,
            safety_hazard_notes: 'Organophosphorus chloridate reagents require inert gas handling.'
        },
        enhancement_proposals: [
            {
                id: 'enh-rem-1',
                strategy_name: 'Deuterated 1-Ribosyl Phosphoramidate Spine',
                chemical_modification: 'Stereoselective deuteration at C-1 prime and chiral phosphorus center',
                pharmacological_rationale: 'Deuterium kinetic isotope effect slows hydrolytic cleavage by plasma carboxylesterases, increasing intact pulmonary alveolar lung tissue penetration by 2.4x and sparing renal excretion load.',
                target_organ_sparing: 'Kidneys & Liver (-48% organ clearance burden)',
                toxicity_reduction_percent: 48,
                half_life_change: 'Extended to 18h',
                potency_delta: '+60% intracellular triphosphate generation in lung',
                synthetic_feasibility: 'Moderate',
                modified_chemical_formula: 'C₂₇H₃₃D₂N₆O₈P'
            }
        ],
        effects: [
            { layer: 'ORGAN_VIEW', structure_name: 'Lungs', effect_type: 'Primary Antiviral Target', mechanism: 'High intracellular accumulation of active nucleoside triphosphate in alveolar epithelial cells.', intensity: 0.88, risk_level: 'low', confidence_score: 0.95, toxic_threshold: false, accumulation_factor: 0.5, dose_dependency_factor: 0.85 },
            { layer: 'ORGAN_VIEW', structure_name: 'Liver', effect_type: 'Metabolism', mechanism: 'Hepatic carboxylesterase 1 (CES1) and Cathepsin A prodrug cleavage with mild transaminase elevation.', intensity: 0.65, risk_level: 'moderate', confidence_score: 0.91, toxic_threshold: false, accumulation_factor: 0.3, dose_dependency_factor: 0.7 },
            { layer: 'ORGAN_VIEW', structure_name: 'Kidneys', effect_type: 'Excretion', mechanism: 'Glomerular filtration of cyclodextrin solubilizing excipient (SBECD) and nucleoside metabolites.', intensity: 0.58, risk_level: 'moderate', confidence_score: 0.89, toxic_threshold: false, accumulation_factor: 0.2, dose_dependency_factor: 0.6 }
        ],
        heatmap_effects: [
            { layer: 'ORGAN_VIEW', structure_name: 'Lungs', effect_type: 'Antiviral Pulmonary Site', mechanism: 'Intracellular RdRp termination', intensity: 0.88, risk_level: 'low', confidence_score: 0.95, toxic_threshold: false, accumulation_factor: 0.5, dose_dependency_factor: 0.85 },
            { layer: 'ORGAN_VIEW', structure_name: 'Liver', effect_type: 'Hepatic Prodrug Processing', mechanism: 'Transaminase elevation potential', intensity: 0.65, risk_level: 'moderate', confidence_score: 0.91, toxic_threshold: false, accumulation_factor: 0.3, dose_dependency_factor: 0.7 },
            { layer: 'ORGAN_VIEW', structure_name: 'Kidneys', effect_type: 'Renal Clearance', mechanism: 'SBECD excipient filtration load', intensity: 0.58, risk_level: 'moderate', confidence_score: 0.89, toxic_threshold: false, accumulation_factor: 0.2, dose_dependency_factor: 0.6 }
        ],
        time_based_intensity: { '0 min': 0.1, 'onset': 0.5, 'peak': 1.0, 'mid duration': 0.75, 'end duration': 0.3 }
    },

    'doxorubicin': {
        drug_name: 'Doxorubicin',
        category: 'Anthracycline Topoisomerase II Inhibitor',
        chemical_formula: 'C₂₇H₂₉NO₁₁',
        iupac_name: '(7S,9S)-7-[(2R,4S,5S,6S)-4-amino-5-hydroxy-6-methyloxan-2-yl]oxy-6,9,11-trihydroxy-9-(2-hydroxyacetyl)-4-methoxy-8,10-dihydro-7H-tetracene-5,12-dione',
        smiles_string: 'CC1C(C(CC(O1)OC2CC(CC3=C2C(=C4C(=C3O)C(=O)C5=C(C4=O)C(=CC=C5)OC)O)(C(=O)CO)O)N)O',
        functional_groups: ['Tetracyclic Anthraquinone Core', 'Daunosamine Amino Sugar', 'Quinone/Hydroquinone Redox Center', 'Alpha-Hydroxyketone'],
        molecular_weight: '543.52 g/mol',
        half_life: '20 - 48 hours (Triphasic elimination)',
        bioavailability: 'Intravenous Only',
        peak_concentration_time: 'Immediate post-infusion',
        system_wide_risk_score: 0.78,
        confidence_score: 95,
        uncertainty_margin: 4.2,
        primary_mechanism: 'Intercalation between DNA base pairs and inhibition of topoisomerase II-alpha, generating double-strand DNA breaks; creates iron-catalyzed free radical oxygen species causing cumulative myocardial damage.',
        pharmacokinetics: { onset_minutes: 15, peak_minutes: 30, duration_hours: 48, bioavailability_estimate: 1.0 },
        pharmacodynamics: { primary_mechanism: 'DNA intercalation and Topoisomerase II catalytic poison', receptor_targets: ['Topoisomerase II-alpha', 'Topoisomerase II-beta', 'DNA Cleavage Complex'], enzyme_inhibition_percent: 96 },
        synthesis_pathway: {
            precursors: ['Daunorubicin fermentation precursor', 'Bromine in 1,4-dioxane', 'Sodium Formate / Methanol'],
            reaction_steps: [
                {
                    step_number: 1,
                    reaction_name: 'Regioselective 14-Bromination',
                    reagents: 'Bromine in anhydrous 1,4-dioxane / methanol mixture',
                    conditions: '20°C for 2 hours in darkness',
                    intermediate_product: '14-Bromodaunorubicin Hydrobromide',
                    yield_percent: 88,
                    notes: 'Bromination selectively functionalizes the C-14 methyl position.'
                },
                {
                    step_number: 2,
                    reaction_name: 'Nucleophilic Substitution with Formate',
                    reagents: 'Sodium formate in acetone / water',
                    conditions: 'Reflux at 50°C for 4 hours',
                    intermediate_product: '14-Formyloxydoxorubicin',
                    yield_percent: 84,
                    notes: 'Displaces the 14-bromo atom with oxygen-containing formate nucleophile.'
                },
                {
                    step_number: 3,
                    reaction_name: 'Mild Alkaline Hydrolysis and Acid Salt Formation',
                    reagents: 'Dilute aqueous NaHCO₃ followed by dilute HCl',
                    conditions: '0°C to 15°C, pH 3.5 crystallization',
                    intermediate_product: 'Doxorubicin Hydrochloride',
                    yield_percent: 89,
                    notes: 'Cleaves formate ester to generate primary alcohol at C-14.'
                }
            ],
            total_yield_percent: 66,
            atom_economy: '58%',
            green_chemistry_score: 72,
            safety_hazard_notes: 'Potent cytotoxic mutagen; requires Class II cytotoxic containment.'
        },
        enhancement_proposals: [
            {
                id: 'enh-dox-1',
                strategy_name: 'PEGylated Stealth Liposomal Formulation (Cardioprotective Shell)',
                chemical_modification: 'Steric nano-encapsulation inside methoxypolyethylene glycol (MPEG-DSPE) lipid bilayer (Doxil formulation)',
                pharmacological_rationale: 'Steric hydration barrier prevents tight myocardial endothelial extravasation, reducing cardiac accumulation by 75% and virtually eliminating congestive cardiomyopathy risk while preserving EPR tumor delivery.',
                target_organ_sparing: 'Heart (-75% myocardial strain & cardiomyopathy risk)',
                toxicity_reduction_percent: 75,
                half_life_change: 'Circulation time extended from 10 min to 55 hours',
                potency_delta: 'Maintained antineoplastic potency',
                synthetic_feasibility: 'High',
                modified_chemical_formula: 'C₂₇H₂₉NO₁₁·[PEG-Lipid]'
            }
        ],
        effects: [
            { layer: 'ORGAN_VIEW', structure_name: 'Heart', effect_type: 'High Cardiotoxicity Risk', mechanism: 'Iron-catalyzed reactive oxygen species (ROS) formation, sarcoplasmic reticulum calcium overload, and cardiomyocyte apoptosis.', intensity: 0.88, risk_level: 'severe', confidence_score: 0.98, toxic_threshold: true, accumulation_factor: 0.8, dose_dependency_factor: 0.95 },
            { layer: 'ORGAN_VIEW', structure_name: 'Liver', effect_type: 'Hepatic Clearance', mechanism: 'Aldoketoreductase transformation into active doxorubicinol metabolite.', intensity: 0.72, risk_level: 'high', confidence_score: 0.92, toxic_threshold: false, accumulation_factor: 0.4, dose_dependency_factor: 0.7 },
            { layer: 'ORGAN_VIEW', structure_name: 'Kidneys', effect_type: 'Minor Excretion', mechanism: 'Secondary renal elimination of conjugated glucuronides.', intensity: 0.45, risk_level: 'moderate', confidence_score: 0.88, toxic_threshold: false, accumulation_factor: 0.2, dose_dependency_factor: 0.5 }
        ],
        heatmap_effects: [
            { layer: 'ORGAN_VIEW', structure_name: 'Heart', effect_type: 'Severe Myocardial Burden', mechanism: 'Topoisomerase II-beta mediated cardiomyocyte toxicity & ROS damage', intensity: 0.88, risk_level: 'severe', confidence_score: 0.98, toxic_threshold: true, accumulation_factor: 0.8, dose_dependency_factor: 0.95 },
            { layer: 'ORGAN_VIEW', structure_name: 'Liver', effect_type: 'Hepatic Metabolism', mechanism: 'Aldoketoreductase doxorubicinol formation', intensity: 0.72, risk_level: 'high', confidence_score: 0.92, toxic_threshold: false, accumulation_factor: 0.4, dose_dependency_factor: 0.7 },
            { layer: 'ORGAN_VIEW', structure_name: 'Kidneys', effect_type: 'Renal Clearance', mechanism: 'Metabolite excretion', intensity: 0.45, risk_level: 'moderate', confidence_score: 0.88, toxic_threshold: false, accumulation_factor: 0.2, dose_dependency_factor: 0.5 }
        ],
        time_based_intensity: { '0 min': 0.2, 'onset': 0.7, 'peak': 1.0, 'mid duration': 0.85, 'end duration': 0.4 }
    }
};

/**
 * Applies a molecular enhancement strategy to simulate an optimized drug derivative in-silico
 */
export function applyMolecularEnhancement(
    baseResult: DrugAnalysisResult,
    enhancement: MolecularEnhancementProposal
): DrugAnalysisResult {
    const cloned: DrugAnalysisResult = JSON.parse(JSON.stringify(baseResult));

    cloned.is_enhanced_derivative = true;
    cloned.parent_drug_name = baseResult.parent_drug_name || baseResult.drug_name;
    cloned.enhancement_applied = enhancement.strategy_name;
    cloned.drug_name = `${baseResult.parent_drug_name || baseResult.drug_name} [${enhancement.strategy_name.split(' ')[0]}]`;
    if (enhancement.modified_chemical_formula) {
        cloned.chemical_formula = enhancement.modified_chemical_formula;
    }

    // Determine target organ from target_organ_sparing string (e.g. "Stomach", "Heart", "Liver", "Kidneys")
    const targetOrganMatch = enhancement.target_organ_sparing.match(/(Stomach|Heart|Liver|Kidneys|Kidney|Lungs|Brain|Intestines)/i);
    const targetOrgan = targetOrganMatch ? targetOrganMatch[1].toLowerCase() : '';

    const reductionFraction = Math.min(0.85, (enhancement.toxicity_reduction_percent || 50) / 100);

    // Optimize heatmap effects
    if (cloned.heatmap_effects) {
        cloned.heatmap_effects = cloned.heatmap_effects.map(effect => {
            const isTarget = targetOrgan && effect.structure_name.toLowerCase().includes(targetOrgan);
            if (isTarget) {
                const newIntensity = Math.max(0.12, +(effect.intensity * (1 - reductionFraction)).toFixed(2));
                return {
                    ...effect,
                    intensity: newIntensity,
                    risk_level: newIntensity < 0.35 ? 'low' : (newIntensity < 0.65 ? 'moderate' : 'high'),
                    toxic_threshold: false,
                    mechanism: `${effect.mechanism} (Protected: ${enhancement.strategy_name})`
                };
            }
            return effect;
        });
    }

    // Optimize organ effects list
    if (cloned.effects) {
        cloned.effects = cloned.effects.map(effect => {
            const structure = effect.structure_name || effect.organ || '';
            const isTarget = targetOrgan && structure.toLowerCase().includes(targetOrgan);
            if (isTarget) {
                const newIntensity = Math.max(0.12, +(effect.intensity * (1 - reductionFraction)).toFixed(2));
                return {
                    ...effect,
                    intensity: newIntensity,
                    risk_level: newIntensity < 0.35 ? 'low' : (newIntensity < 0.65 ? 'moderate' : 'high'),
                    toxic_threshold: false,
                    mechanism: `${effect.mechanism} (Mitigated via ${enhancement.strategy_name})`
                };
            }
            return effect;
        });
    }

    // Adjust system wide risk score
    cloned.system_wide_risk_score = Math.max(0.15, +(cloned.system_wide_risk_score * (1 - reductionFraction * 0.5)).toFixed(2));

    // Update pharmacokinetics if extended half-life
    if (cloned.pharmacokinetics && enhancement.half_life_change) {
        cloned.pharmacokinetics.duration_hours = Math.round(cloned.pharmacokinetics.duration_hours * 1.5);
    }

    return cloned;
}

/**
 * Fallback synthesizer for arbitrary compounds
 */
export function generateGenericSynthesisAndEnhancement(compoundName: string): Partial<DrugAnalysisResult> {
    const cleanName = compoundName || 'Novel Molecular Candidate';
    return {
        chemical_formula: 'C₁₆H₂₂N₂O₃',
        iupac_name: `(2S)-2-amino-3-[4-(2-hydroxypropan-2-yl)phenyl]propanoic acid derivative of ${cleanName}`,
        smiles_string: 'CC(C)(C1=CC=C(C=C1)CC(C(=O)O)N)O',
        functional_groups: ['Aromatic Benzene Core', 'Secondary Amine', 'Hydroxyl Group (-OH)', 'Carboxylic Acid'],
        molecular_weight: '298.36 g/mol',
        synthesis_pathway: {
            precursors: ['Functionalized Phenyl Precursor', 'Ethyl Chloroformate', 'Sodium Cyanoborohydride (NaBH₃CN)'],
            reaction_steps: [
                {
                    step_number: 1,
                    reaction_name: 'Electrophilic Carbo-Functionalization',
                    reagents: 'Lewis acid catalyst (ZnCl₂) in dichloromethane',
                    conditions: '25°C, 3 hours under inert gas',
                    intermediate_product: 'Protected Aryl Ester Intermediate',
                    yield_percent: 88,
                    notes: 'Regioselective coupling to establish core pharmacophore.'
                },
                {
                    step_number: 2,
                    reaction_name: 'Reductive Amination & Deprotection',
                    reagents: 'NaBH₃CN, ammonium acetate in methanol, followed by 1M LiOH',
                    conditions: 'Stir at room temperature for 5 hours',
                    intermediate_product: 'Purified Free Base Target',
                    yield_percent: 85,
                    notes: 'Facile deprotection yielding the biologically active enantiomer.'
                }
            ],
            total_yield_percent: 75,
            atom_economy: '68%',
            green_chemistry_score: 82,
            safety_hazard_notes: 'Standard organic solvent flammability precautions; cyanoborohydride waste handled in alkaline bleach.'
        },
        enhancement_proposals: [
            {
                id: 'enh-gen-1',
                strategy_name: 'Fluorinated Metabolic Blockade',
                chemical_modification: 'Mono-fluorination on para-aromatic position to block CYP oxidative clearing',
                pharmacological_rationale: 'Extends in-vivo half-life by preventing rapid Phase I aromatic hydroxylation, reducing liver metabolic strain.',
                target_organ_sparing: 'Liver (-50% CYP metabolic turnover load)',
                toxicity_reduction_percent: 50,
                half_life_change: 'Extended from 3.2h to 7.5h',
                potency_delta: '+20% target receptor residence time',
                synthetic_feasibility: 'High',
                modified_chemical_formula: 'C₁₆H₂₁FN₂O₃'
            },
            {
                id: 'enh-gen-2',
                strategy_name: 'Bio-Isosteric Phosphonate Swap',
                chemical_modification: 'Replacement of labile carboxylate with phosphonate bio-isostere',
                pharmacological_rationale: 'Retains electrostatic binding to target active site while mitigating acidic gastrointestinal ulceration.',
                target_organ_sparing: 'Stomach & Kidneys (-60% tissue strain)',
                toxicity_reduction_percent: 60,
                half_life_change: 'Sustained systemic exposure',
                potency_delta: 'Preserved sub-nanomolar affinity',
                synthetic_feasibility: 'Moderate',
                modified_chemical_formula: 'C₁₅H₂₃N₂O₅P'
            }
        ]
    };
}
