
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import type {
  UserData,
  HealthProfile,
  MealPlanRequestData,
  WeeklyMealPlan,
  GroceryList,
  AnalyzedMeal,
  SuggestedRecipe,
  FullRecipe,
} from './types';

// Fix: Initialize GoogleGenAI client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Chat instance for the assistant
let chat: Chat | null = null;

const getChat = () => {
    if (!chat) {
        chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: 'You are Sarah, a friendly and helpful AI nutrition assistant for an app called NutriAI. Your responses should be in Arabic, specifically Egyptian dialect. Keep your answers concise, helpful, and encouraging. You can help with nutrition questions, recipe ideas, and general health tips related to the user\'s profile, although you don\'t have direct access to it unless they provide it in the chat.',
            },
        });
    }
    return chat;
};

// Function to generate the user's health profile
export const generateHealthProfile = async (userData: UserData): Promise<HealthProfile> => {
    const model = 'gemini-2.5-pro'; // Use a more advanced model for complex analysis

    const prompt = `
    Based on the following user data, generate a comprehensive and personalized health profile. The output must be a valid JSON object.
    
    User Data:
    ${JSON.stringify(userData, null, 2)}
    
    The JSON output should strictly follow this structure:
    {
      "name": "string",
      "bmi": { "value": number, "category": "string (e.g., 'Normal weight')" },
      "daily_calorie_needs": number,
      "macronutrient_distribution": { "protein_grams": number, "carbs_grams": number, "fat_grams": number },
      "hydration_liters": number,
      "wearable_insights": ["string"],
      "key_recommendations": ["string"],
      "daily_nutrition_plan": {
        "breakfast": { "name": "string", "description": "string", "calories": number },
        "lunch": { "name": "string", "description": "string", "calories": number },
        "dinner": { "name": "string", "description": "string", "calories": number },
        "snacks": [{ "name": "string", "description": "string", "calories": number }]
      }
    }

    Instructions:
    1. Calculate BMI and determine the category (Underweight, Normal weight, Overweight, Obesity).
    2. Estimate daily calorie needs using a standard formula like Mifflin-St Jeor, considering the activity level.
    3. Distribute macronutrients based on the user's goal (e.g., higher protein for muscle gain).
    4. Provide 2-3 key, actionable recommendations.
    5. If wearable data is available, provide 1-2 insights based on it. If not, make the array empty.
    6. Suggest a simple, balanced daily nutrition plan with approximate calories.
    7. All text content (like recommendations, meal names, descriptions) should be in Arabic.
    `;
    
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
        }
    });

    try {
        const text = response.text.trim();
        return JSON.parse(text) as HealthProfile;
    } catch (e) {
        console.error("Failed to parse health profile JSON:", response.text);
        throw new Error("Could not generate health profile. The model returned an invalid format.");
    }
};


// Function to generate a weekly meal plan
export const generateWeeklyMealPlan = async (
    healthProfile: HealthProfile,
    requestData: MealPlanRequestData
): Promise<WeeklyMealPlan> => {
    const model = 'gemini-2.5-flash';

    const prompt = `
    Create a 7-day weekly meal plan in Arabic for a user with the following health profile and preferences. The output must be a valid JSON array.

    Health Profile Summary:
    - Daily Calorie Goal: ${healthProfile.daily_calorie_needs}
    - Daily Macros: Protein ${healthProfile.macronutrient_distribution.protein_grams}g, Carbs ${healthProfile.macronutrient_distribution.carbs_grams}g, Fat ${healthProfile.macronutrient_distribution.fat_grams}g
    - Key Recommendations: ${healthProfile.key_recommendations.join(', ')}

    User Preferences:
    - Cuisine Preferences: ${requestData.cuisine_preferences.join(', ')}
    - Budget per day: ${requestData.budget_per_day ? `${requestData.budget_per_day} EGP` : 'Not specified'}

    The JSON output must be an array of 7 day objects, strictly following this structure for each day:
    [
      {
        "day": 1,
        "total_calories": number,
        "macros": { "protein_g": number, "carbs_g": number, "fat_g": number },
        "meals": {
          "breakfast": { "name": "string", "calories": number, "protein_g": number },
          "lunch": { "name": "string", "calories": number, "protein_g": number },
          "dinner": { "name": "string", "calories": number, "protein_g": number },
          "snacks": [{ "name": "string", "calories": number, "protein_g": number }]
        }
      },
      ...
    ]

    Instructions:
    1. The plan must be for 7 days.
    2. The meal names should be in Arabic.
    3. The total calories for each day should be close to the user's daily goal.
    4. Ensure the variety of meals and adherence to cuisine preferences.
    5. If a budget is specified, suggest cost-effective meals.
    `;

    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
        },
    });
    
    try {
        const text = response.text.trim();
        const plan = JSON.parse(text);
        if (Array.isArray(plan) && plan.length > 0) {
            return plan as WeeklyMealPlan;
        }
        throw new Error("Invalid meal plan format received.");
    } catch (e) {
        console.error("Failed to parse weekly meal plan JSON:", response.text);
        throw new Error("Could not generate meal plan. The model returned an invalid format.");
    }
};

// Function to generate a grocery list from a meal plan
export const generateGroceryList = async (mealPlan: WeeklyMealPlan): Promise<GroceryList> => {
    const model = 'gemini-2.5-flash';

    const prompt = `
    Based on the following 7-day meal plan, create a categorized grocery list in Arabic. The output must be a valid JSON array.

    Meal Plan:
    ${JSON.stringify(mealPlan.map(day => day.meals), null, 2)}

    The JSON output should be an array of category objects, strictly following this structure:
    [
      {
        "category": "string (e.g., 'الخضروات', 'البروتين', 'البقوليات والحبوب')",
        "items": [
          { "name": "string", "quantity": "string (e.g., '500 جرام', '2 حبة', '1 علبة')" }
        ]
      }
    ]
    
    Instructions:
    1. Consolidate ingredients from the entire week.
    2. Estimate reasonable quantities for one person for a week.
    3. Categorize items logically (e.g., Vegetables, Fruits, Protein, Dairy, Grains, Spices, etc.).
    4. All text (category names, item names) should be in Arabic.
    `;
    
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
        },
    });

    try {
        const text = response.text.trim();
        return JSON.parse(text) as GroceryList;
    } catch (e) {
        console.error("Failed to parse grocery list JSON:", response.text);
        throw new Error("Could not generate grocery list. The model returned an invalid format.");
    }
};

// Function to analyze a meal from an image
export const analyzeMealImage = async (base64Image: string, mimeType: string): Promise<AnalyzedMeal> => {
    const model = 'gemini-2.5-pro'; // Using pro for better image analysis

    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    const textPart = {
      text: `Analyze this image of a meal. Identify the food items and provide an estimated nutritional breakdown. Respond ONLY with a valid JSON object in Arabic with the following structure:
      {
        "mealName": "string",
        "calories": number,
        "protein_g": number,
        "carbs_g": number,
        "fat_g": number,
        "notes": "string (briefly describe the main components of the meal)"
      }`
    };

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: { parts: [imagePart, textPart] },
        config: {
            responseMimeType: "application/json",
        },
    });

    try {
        const text = response.text.trim();
        return JSON.parse(text) as AnalyzedMeal;
    } catch (e) {
        console.error("Failed to parse meal analysis JSON:", response.text);
        throw new Error("Could not analyze the meal. The model returned an invalid format.");
    }
};

// --- Recipe Discovery Functions ---

export const getSuggestedRecipes = async (cuisine: string, healthProfile: HealthProfile): Promise<SuggestedRecipe[]> => {
    const model = 'gemini-2.5-flash';
    const prompt = `
    Suggest 3-5 healthy recipes in Arabic for a user based on their health profile and selected cuisine.
    The output must be a valid JSON array of objects.
    
    User Profile Summary:
    - Daily Calorie Goal: ${healthProfile.daily_calorie_needs}
    - Goal: ${healthProfile.key_recommendations.join(', ')}
    
    Selected Cuisine: ${cuisine}
    
    The JSON output must be an array of recipe objects, strictly following this structure:
    [
      {
        "name": "string",
        "description": "string (brief, appealing description)",
        "calories": number
      }
    ]
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
        },
    });

    try {
        const text = response.text.trim();
        return JSON.parse(text) as SuggestedRecipe[];
    } catch (e) {
        console.error("Failed to parse suggested recipes JSON:", response.text);
        throw new Error("Could not get recipe suggestions.");
    }
};

export const getRecipeDetails = async (recipeName: string, healthProfile: HealthProfile): Promise<FullRecipe> => {
    const model = 'gemini-2.5-flash';
    const prompt = `
    Provide a full, detailed recipe in Arabic for "${recipeName}".
    The recipe should be adapted to be healthy and suitable for a user with a daily calorie goal of around ${healthProfile.daily_calorie_needs}.
    The output must be a single valid JSON object.
    
    The JSON output must strictly follow this structure:
    {
      "name": "string",
      "description": "string",
      "servings": number,
      "prep_time_minutes": number,
      "cook_time_minutes": number,
      "ingredients": [
        { "item": "string", "quantity": "string" }
      ],
      "instructions": ["string"],
      "nutritional_info": {
        "calories": number,
        "protein_g": number,
        "carbs_g": number,
        "fat_g": number
      }
    }
    `;

    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
        },
    });

    try {
        const text = response.text.trim();
        return JSON.parse(text) as FullRecipe;
    } catch (e) {
        console.error("Failed to parse recipe details JSON:", response.text);
        throw new Error("Could not get recipe details.");
    }
};

// --- Chat Assistant Function ---

export const sendMessageStream = async (message: string) => {
    const chatSession = getChat();
    // The chunk type is AsyncGenerator<GenerateContentResponse>.
    const result = await chatSession.sendMessageStream(message);
    return result;
};
