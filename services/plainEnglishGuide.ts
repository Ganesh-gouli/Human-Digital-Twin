export interface PlainEnglishDrugInfo {
    simpleName: string;
    whatItIs: string;
    howItWorks: string;
    overallSafety: 'Safe' | 'Caution' | 'High Risk';
    safetySummary: string;
    bodyJourney: {
        stepNumber: number;
        title: string;
        timeframe: string;
        description: string;
        icon: string;
    }[];
    organSimpleImpact: {
        organName: string;
        icon: string;
        statusColor: 'green' | 'yellow' | 'red';
        statusText: string;
        simpleExplanation: string;
        actionTip: string;
    }[];
    foodAndLifestyleTips: string[];
    warningsForNormalPeople: string[];
}

export const PLAIN_ENGLISH_DRUG_DATABASE: Record<string, PlainEnglishDrugInfo> = {
    'ibuprofen': {
        simpleName: 'Ibuprofen (Advil, Motrin)',
        whatItIs: 'A common, over-the-counter medicine for pain, fever, and swelling.',
        howItWorks: 'When you are hurt or sick, your body makes chemicals that cause pain and fever. Ibuprofen blocks these chemicals so you feel relief and swelling goes down.',
        overallSafety: 'Safe',
        safetySummary: 'Generally safe and effective for adults when taken with food or milk.',
        bodyJourney: [
            {
                stepNumber: 1,
                title: 'Swallowed & Absorbed',
                timeframe: 'First 20 - 30 minutes',
                description: 'The pill dissolves in your stomach and enters your bloodstream.',
                icon: '🥤'
            },
            {
                stepNumber: 2,
                title: 'Maximum Pain Relief',
                timeframe: '1 to 2 hours',
                description: 'It reaches full strength in your blood and blocks pain signals at the source.',
                icon: '⚡'
            },
            {
                stepNumber: 3,
                title: 'Naturally Cleansed',
                timeframe: '4 to 6 hours',
                description: 'Your liver safely processes it, and your kidneys wash it out in your urine.',
                icon: '🚰'
            }
        ],
        organSimpleImpact: [
            {
                organName: 'Head & Brain',
                icon: '🧠',
                statusColor: 'green',
                statusText: 'Active Pain Relief',
                simpleExplanation: 'Blocks headache signals and resets your body thermostat to cool down fever.',
                actionTip: 'No action needed; this is the main benefit.'
            },
            {
                organName: 'Stomach',
                icon: '🫃',
                statusColor: 'yellow',
                statusText: 'Needs Food Protection',
                simpleExplanation: 'Can irritate your stomach wall if taken empty, causing heartburn or acid feeling.',
                actionTip: 'Always take with a meal, a snack, or a glass of milk!'
            },
            {
                organName: 'Kidneys',
                icon: '🫘',
                statusColor: 'green',
                statusText: 'Normal Filtration',
                simpleExplanation: 'Flushes the medicine out of your body into urine.',
                actionTip: 'Drink a glass of water when taking your dose.'
            },
            {
                organName: 'Liver',
                icon: '🫁',
                statusColor: 'green',
                statusText: 'Smooth Processing',
                simpleExplanation: 'Breaks down the medicine easily without overload at normal doses.',
                actionTip: 'Avoid drinking heavy alcohol with painkillers.'
            }
        ],
        foodAndLifestyleTips: [
            'Best taken right after eating breakfast, lunch, or dinner.',
            'Drink at least one full glass of water with each tablet.',
            'Wait at least 4 to 6 hours before taking another dose.'
        ],
        warningsForNormalPeople: [
            'Do not take on an empty stomach if you get heartburn easily.',
            'If you have kidney disease or stomach ulcers, check with a doctor first.'
        ]
    },

    'aspirin': {
        simpleName: 'Aspirin (Disprin, Bayer)',
        whatItIs: 'A classic pain reliever and heart-protecting blood thinner.',
        howItWorks: 'It stops pain and prevents blood cells from clumping together. Doctors often recommend low doses to protect against heart attacks and blood clots.',
        overallSafety: 'Caution',
        safetySummary: 'Great for heart health and headaches, but must be taken carefully to prevent stomach bleeding.',
        bodyJourney: [
            {
                stepNumber: 1,
                title: 'Quick Absorption',
                timeframe: '15 - 20 minutes',
                description: 'Rapidly absorbed into your blood from your stomach and upper intestine.',
                icon: '🥤'
            },
            {
                stepNumber: 2,
                title: 'Heart & Blood Protection',
                timeframe: '1 hour',
                description: 'Stops blood cells from sticking together, keeping arteries open and flowing smoothly.',
                icon: '❤️'
            },
            {
                stepNumber: 3,
                title: 'Liver Clearance',
                timeframe: '2 to 3 hours',
                description: 'The liver transforms it into harmless water-soluble products.',
                icon: '🚰'
            }
        ],
        organSimpleImpact: [
            {
                organName: 'Heart & Blood',
                icon: '❤️',
                statusColor: 'green',
                statusText: 'Cardioprotective',
                simpleExplanation: 'Thins the blood slightly to prevent harmful clots from blocking heart arteries.',
                actionTip: 'Follow doctor recommended low-dose for heart protection.'
            },
            {
                organName: 'Stomach',
                icon: '🫃',
                statusColor: 'yellow',
                statusText: 'Sensitive Area',
                simpleExplanation: 'Directly irritates the delicate stomach lining and increases stomach acid.',
                actionTip: 'Never take on an empty stomach! Use coated tablets if possible.'
            },
            {
                organName: 'Liver',
                icon: '🫁',
                statusColor: 'green',
                statusText: 'Normal Clearance',
                simpleExplanation: 'Clears the salicylate out of your system safely.',
                actionTip: 'Safe at standard doses.'
            }
        ],
        foodAndLifestyleTips: [
            'Always eat food or drink milk before taking Aspirin.',
            'Never give Aspirin to children or teenagers with viral fevers (like the flu).'
        ],
        warningsForNormalPeople: [
            'Watch out for stomach upset or black stools which can indicate bleeding.',
            'Inform your dentist or surgeon you take Aspirin before any procedure.'
        ]
    },

    'metformin': {
        simpleName: 'Metformin (Glucophage)',
        whatItIs: 'The world’s most trusted first-choice medicine for Type 2 Diabetes.',
        howItWorks: 'It helps your body use insulin better and tells your liver not to dump excess sugar into your blood after meals.',
        overallSafety: 'Safe',
        safetySummary: 'Very safe for long-term daily use; controls blood sugar without causing unexpected sugar crashes.',
        bodyJourney: [
            {
                stepNumber: 1,
                title: 'Gentle Intestinal Uptake',
                timeframe: '1 to 2 hours',
                description: 'Absorbed through your intestines, helping to slow down sugar absorption from meals.',
                icon: '🥗'
            },
            {
                stepNumber: 2,
                title: 'Liver Sugar Balancing',
                timeframe: '2 to 3 hours',
                description: 'Reaches the liver and activates cellular energy switches (AMPK) to block sugar production.',
                icon: '⚡'
            },
            {
                stepNumber: 3,
                title: 'Kidney Excretion',
                timeframe: '6 to 12 hours',
                description: 'Exits unchanged through the kidneys into your urine.',
                icon: '🚰'
            }
        ],
        organSimpleImpact: [
            {
                organName: 'Liver',
                icon: '🫁',
                statusColor: 'green',
                statusText: 'Primary Sugar Controller',
                simpleExplanation: 'Stops the liver from making unwanted extra glucose when you are resting.',
                actionTip: 'Helps keep your morning fasting blood sugar low.'
            },
            {
                organName: 'Intestines',
                icon: '🌀',
                statusColor: 'yellow',
                statusText: 'Possible Loose Tummy',
                simpleExplanation: 'Can cause temporary loose stools, gas, or mild cramps when you first start taking it.',
                actionTip: 'Take right with the first bite of your meal to prevent tummy upset!'
            },
            {
                organName: 'Kidneys',
                icon: '🫘',
                statusColor: 'green',
                statusText: 'Filters Sugar & Medicine',
                simpleExplanation: 'Kidneys filter it cleanly. Must have healthy kidney function.',
                actionTip: 'Drink plenty of water and do routine kidney checkups.'
            }
        ],
        foodAndLifestyleTips: [
            'Always take during or right at the end of a meal to avoid stomach discomfort.',
            'Regular walking for 15-30 minutes after meals boosts Metformin power significantly.'
        ],
        warningsForNormalPeople: [
            'Avoid heavy drinking of alcohol as it can increase the risk of a rare acid buildup.',
            'Tell your doctor if you need an X-ray with contrast dye.'
        ]
    },

    'paracetamol': {
        simpleName: 'Paracetamol / Acetaminophen (Tylenol, Dolo, Crocin)',
        whatItIs: 'The everyday family medicine for high fever and gentle pain relief.',
        howItWorks: 'It works directly inside the brain’s heat and pain centers to cool you down and soothe headaches, sore throats, or tooth pain.',
        overallSafety: 'Safe',
        safetySummary: 'Very gentle on the stomach! Safe for children, pregnant mothers, and seniors when taken at proper doses.',
        bodyJourney: [
            {
                stepNumber: 1,
                title: 'Fast Absorption',
                timeframe: '15 - 30 minutes',
                description: 'Goes down easily and absorbs faster than most other pain medicines.',
                icon: '⚡'
            },
            {
                stepNumber: 2,
                title: 'Fever Reduction',
                timeframe: '30 to 60 minutes',
                description: 'Resets the brain thermometer so you start sweating gently and fever breaks.',
                icon: '🌡️'
            },
            {
                stepNumber: 3,
                title: 'Liver Breakdown',
                timeframe: '3 to 4 hours',
                description: 'The liver converts it safely into harmless waste.',
                icon: '🚰'
            }
        ],
        organSimpleImpact: [
            {
                organName: 'Head & Brain',
                icon: '🧠',
                statusColor: 'green',
                statusText: 'Cools Fever & Pain',
                simpleExplanation: 'Excellent soothing relief for headaches and body temperatures.',
                actionTip: 'Great choice when you cannot take NSAIDs due to stomach ulcers.'
            },
            {
                organName: 'Stomach',
                icon: '🫃',
                statusColor: 'green',
                statusText: 'Very Gentle',
                simpleExplanation: 'Does NOT cause stomach ulcers or stomach burning like Ibuprofen does.',
                actionTip: 'Can be taken with or without food safely.'
            },
            {
                organName: 'Liver',
                icon: '🫁',
                statusColor: 'yellow',
                statusText: 'Do Not Overdose!',
                simpleExplanation: 'Safe at normal doses, but taking too many pills can severely damage the liver.',
                actionTip: 'Never take more than 4,000 mg (8 standard 500mg pills) in 24 hours!'
            }
        ],
        foodAndLifestyleTips: [
            'Can be taken on an empty stomach or with a snack.',
            'Do not take multiple cold/flu syrups at the same time without checking if they already contain paracetamol.'
        ],
        warningsForNormalPeople: [
            'Never drink alcohol while taking high doses of paracetamol.',
            'Keep out of reach of children and stick strictly to the dosage clock.'
        ]
    },

    'remdesivir': {
        simpleName: 'Remdesivir (Veklury)',
        whatItIs: 'An antiviral hospital medicine given by IV injection to fight severe respiratory viruses.',
        howItWorks: 'It acts like a broken building brick that tricks viruses when they try to multiply inside your lungs, stopping the infection.',
        overallSafety: 'Caution',
        safetySummary: 'Used in clinical care under doctor supervision. Monitored with routine blood tests.',
        bodyJourney: [
            {
                stepNumber: 1,
                title: 'Direct IV Infusion',
                timeframe: '30 - 60 minutes',
                description: 'Given through a drip directly into the bloodstream for 100% absorption.',
                icon: '💉'
            },
            {
                stepNumber: 2,
                title: 'Lung Protection',
                timeframe: '2 to 4 hours',
                description: 'Concentrates inside infected lung cells to halt virus copying.',
                icon: '🫁'
            },
            {
                stepNumber: 3,
                title: 'Excretion',
                timeframe: '12 to 24 hours',
                description: 'Metabolized and cleared through urine.',
                icon: '🚰'
            }
        ],
        organSimpleImpact: [
            {
                organName: 'Lungs',
                icon: '💨',
                statusColor: 'green',
                statusText: 'Virus Blockade',
                simpleExplanation: 'Protects delicate lung air sacs from viral destruction.',
                actionTip: 'Primary treatment site.'
            },
            {
                organName: 'Liver & Kidneys',
                icon: '🫘',
                statusColor: 'yellow',
                statusText: 'Monitored by Doctors',
                simpleExplanation: 'Hospital team checks liver enzymes and kidney filtration to ensure safety.',
                actionTip: 'Doctors adjust dosage based on daily blood tests.'
            }
        ],
        foodAndLifestyleTips: [
            'Administered only by trained medical nurses and doctors in clinical facilities.'
        ],
        warningsForNormalPeople: [
            'Not an over-the-counter pill; used strictly during hospital admissions.'
        ]
    },

    'doxorubicin': {
        simpleName: 'Doxorubicin (Adriamycin)',
        whatItIs: 'A powerful chemotherapy cancer medication.',
        howItWorks: 'It destroys rapidly dividing cancer cells by tangling their DNA so they cannot survive.',
        overallSafety: 'High Risk',
        safetySummary: 'Extremely potent cancer fighter. Hospital teams protect your heart and blood counts throughout treatment.',
        bodyJourney: [
            {
                stepNumber: 1,
                title: 'Specialized IV Injection',
                timeframe: 'Direct infusion',
                description: 'Injected through an IV line by an oncology nurse in a specialized unit.',
                icon: '💉'
            },
            {
                stepNumber: 2,
                title: 'Targeting Cancer Cells',
                timeframe: '12 to 24 hours',
                description: 'Traps cancer DNA and stops tumors from growing.',
                icon: '🛡️'
            },
            {
                stepNumber: 3,
                title: 'Elimination',
                timeframe: '1 to 2 days',
                description: 'Gradually cleared through bile and urine (turns urine reddish for a day or two).',
                icon: '🚰'
            }
        ],
        organSimpleImpact: [
            {
                organName: 'Tumor / Cells',
                icon: '🛡️',
                statusColor: 'green',
                statusText: 'Fights Malignancy',
                simpleExplanation: 'Strong therapeutic tumor destruction.',
                actionTip: 'Main therapeutic goal.'
            },
            {
                organName: 'Heart',
                icon: '❤️',
                statusColor: 'red',
                statusText: 'Needs Heart Shielding',
                simpleExplanation: 'Can strain heart muscle over time. The AI proposes liposomal nanocarriers to protect the heart.',
                actionTip: 'Oncologists track heart function (ECHO/MUGA scans) closely.'
            }
        ],
        foodAndLifestyleTips: [
            'Drink plenty of fluids and rest. Red-tinted urine for 24-48 hours is normal and harmless.'
        ],
        warningsForNormalPeople: [
            'Hospital treatment only. AI proposes enhanced liposomal packaging to make it 75% safer on the heart!'
        ]
    }
};

/**
 * Fallback generator for unknown or custom entered medicines
 */
export function getPlainEnglishForDrug(drugName: string): PlainEnglishDrugInfo {
    const key = (drugName || '').toLowerCase().trim();
    for (const [k, val] of Object.entries(PLAIN_ENGLISH_DRUG_DATABASE)) {
        if (key.includes(k) || k.includes(key)) {
            return val;
        }
    }

    // Smart default
    return {
        simpleName: `${drugName || 'This Medicine'}`,
        whatItIs: `A therapeutic compound investigated for health benefits and symptom relief.`,
        howItWorks: `It interacts with cellular receptors in your body to regulate symptoms, balance biochemical signals, and support healing.`,
        overallSafety: 'Caution',
        safetySummary: 'Take with care. Consult the simple organ impact guide below to see how it affects your body.',
        bodyJourney: [
            {
                stepNumber: 1,
                title: 'Enters Your System',
                timeframe: 'First 30 minutes',
                description: 'The medicine dissolves and enters your bloodstream.',
                icon: '🥤'
            },
            {
                stepNumber: 2,
                title: 'Reaches Target Areas',
                timeframe: '1 to 3 hours',
                description: 'Travels through blood vessels to where your body needs it most.',
                icon: '⚡'
            },
            {
                stepNumber: 3,
                title: 'Leaves Your Body',
                timeframe: '6 to 12 hours',
                description: 'Your liver and kidneys filter it out safely into urine.',
                icon: '🚰'
            }
        ],
        organSimpleImpact: [
            {
                organName: 'Target Organs',
                icon: '🎯',
                statusColor: 'green',
                statusText: 'Active Benefit',
                simpleExplanation: 'Engages target tissues to provide symptom relief.',
                actionTip: 'Follow standard dosage directions.'
            },
            {
                organName: 'Stomach & Gut',
                icon: '🫃',
                statusColor: 'yellow',
                statusText: 'Take with Food',
                simpleExplanation: 'Taking any pill with food helps protect your stomach from acid discomfort.',
                actionTip: 'Have a light meal or glass of water with your dose.'
            },
            {
                organName: 'Kidneys & Liver',
                icon: '🫘',
                statusColor: 'green',
                statusText: 'Filtration Hub',
                simpleExplanation: 'Cleans and removes the medicine from your body over time.',
                actionTip: 'Drink plenty of water throughout the day.'
            }
        ],
        foodAndLifestyleTips: [
            'Take with a full glass of water.',
            'Read the packaging label carefully for proper dose timing.'
        ],
        warningsForNormalPeople: [
            'Do not exceed the recommended dose.',
            'Always inform your doctor or pharmacist about other pills you take.'
        ]
    };
}

/**
 * Returns an everyday plain-English explanation of what an AI chemical modification does for normal people
 */
export function getPlainEnglishEnhancementBenefit(strategyName: string, drugName?: string): string {
    const s = (strategyName || '').toLowerCase();
    const d = (drugName || '').toLowerCase();

    if (s.includes('nitro') || s.includes('no-donating') || s.includes('gi-sparing') || s.includes('mucosal') || (d.includes('ibuprofen') && s.includes('stomach'))) {
        return '🛡️ Stomach Shield: We added a natural protective nitric-oxide shield to the pill so it relieves pain and swelling without burning your stomach lining or causing ulcers.';
    }
    if (s.includes('phospho') || (d.includes('aspirin') && s.includes('phospho'))) {
        return '❤️ Heart Guard: Protects your heart and blood vessels from dangerous clots while cutting stomach bleeding risks by up to 80%.';
    }
    if (s.includes('prodrug') || s.includes('cyclic') || s.includes('gut') || (d.includes('metformin') && s.includes('prodrug'))) {
        return '⚡ Gentle on Your Tummy: Absorbed smoothly in the intestines to control blood sugar while eliminating common cramps, gas, and loose bowels.';
    }
    if (s.includes('glutathione') || s.includes('cysteine') || s.includes('hepatoprotective') || (d.includes('paracetamol') && s.includes('liver'))) {
        return '🫁 Liver Armor: Neutralizes toxic breakdown products instantly, keeping your liver safe even during high or continuous fever relief.';
    }
    if (s.includes('deuterated') || (d.includes('remdesivir') && s.includes('deuterated'))) {
        return '💨 Lung Reinforcement: Chemically strengthens the antiviral molecule so it lasts twice as long inside infected lung cells with fewer hospital injections.';
    }
    if (s.includes('liposomal') || s.includes('pegylated') || (d.includes('doxorubicin') && s.includes('liposomal'))) {
        return '❤️ Heart Protection Armor: Wraps the strong chemotherapy inside microscopic protective bubbles that deliver medicine directly to cancer tumors while shielding heart muscles.';
    }
    if (s.includes('cardio') || s.includes('heart')) {
        return '❤️ Heart Protection: Redesigns the chemical structure to prevent heart muscle strain while keeping full therapeutic power.';
    }
    if (s.includes('renal') || s.includes('kidney')) {
        return '🫘 Kidney Relief: Helps your kidneys filter the compound cleanly without buildup or strain.';
    }
    if (s.includes('liver') || s.includes('hepatic')) {
        return '🫁 Liver Friendly: Breaks down smoothly in your liver without generating toxic stress.';
    }

    return '✨ Organ-Sparing Upgrade: Tweaks the molecular shape to maximize healing power while protecting your stomach, liver, and kidneys from unwanted side effects.';
}

