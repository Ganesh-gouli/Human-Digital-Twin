import { FoodItem } from '../types';

const USDA_API_KEY = import.meta.env.VITE_USDA_API_KEY;
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';

export interface USDANutrient {
    nutrientId: number;
    nutrientName: string;
    value: number;
    unitName: string;
}

export interface USDAFood {
    fdcId: number;
    description: string;
    foodNutrients: USDANutrient[];
    dataType?: string;
}

/**
 * Searches the USDA FoodData Central for a specific food item.
 * @param query The food name to search for (e.g., "Apple, raw")
 * @returns A normalized FoodItem if found, otherwise null.
 */
export const searchFoodNutrients = async (query: string): Promise<Partial<FoodItem> | null> => {
    if (!USDA_API_KEY || USDA_API_KEY.includes('<your')) {
        console.warn("USDA API Key missing or invalid.");
        return null;
    }

    try {
        console.log(`Searching USDA database for: ${query}...`);
        
        // We prioritize "Survey (FNDDS)" foods as they are more general and accurate for common meals.
        const response = await fetch(
            `${BASE_URL}/foods/search?query=${encodeURIComponent(query)}&api_key=${USDA_API_KEY}&pageSize=5&dataType=Survey (FNDDS),Foundation`
        );

        if (!response.ok) {
            throw new Error(`USDA API responded with ${response.status}`);
        }

        const data = await response.json();

        if (!data.foods || data.foods.length === 0) {
            console.log(`No USDA match found for: ${query}`);
            return null;
        }

        // Pick the first result as the most relevant match
        const food: USDAFood = data.foods[0];
        console.log(`Found USDA match: ${food.description}`);

        // Helper to extract a nutrient by ID or Name
        const getNutrient = (ids: number[]) => {
            const nutrient = food.foodNutrients.find(n => ids.includes(n.nutrientId));
            return nutrient ? nutrient.value : 0;
        };

        // Nutrient IDs from USDA FDC docs
        // 1008 (Legacy 208): Calories
        // 1003 (Legacy 203): Protein
        // 1005 (Legacy 205): Carbs
        // 1004 (Legacy 204): Fat
        // 1079 (Legacy 291): Fiber
        
        return {
            name: food.description,
            calories: getNutrient([1008, 208]),
            protein: getNutrient([1003, 203]),
            carbs: getNutrient([1005, 205]),
            fat: getNutrient([1004, 204]),
            fiber: getNutrient([1079, 291]),
            source: 'USDA',
            confidence: 100 // Data from official source
        };
    } catch (error) {
        console.error("USDA Search Error:", error);
        return null;
    }
};
