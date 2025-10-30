export interface UserData {
  name: string;
  age: number;
  gender: 'male' | 'female';
  weight_kg: number;
  height_cm: number;
  blood_type: string;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  chronic_conditions: string[];
  allergies: string[];
  dietary_preferences: string[];
  goal: 'lose_weight' | 'maintain_weight' | 'gain_muscle';
  blood_pressure?: string;
  fasting_glucose?: number;
  cholesterol_total?: number;
  // Wearable data is optional
  resting_heart_rate?: number;
  avg_steps_per_day?: number;
  avg_sleep_hours?: number;
}

export interface WearableData {
    resting_heart_rate: number;
    avg_steps_per_day: number;
    avg_sleep_hours: number;
}

export interface Meal {
    name: string;
    description: string;
    calories: number;
}

export interface HealthProfile {
  name: string;
  bmi: {
    value: number;
    category: string;
  };
  daily_calorie_needs: number;
  macronutrient_distribution: {
    protein_grams: number;
    carbs_grams: number;
    fat_grams: number;
  };
  hydration_liters: number;
  wearable_insights: string[];
  key_recommendations: string[];
  daily_nutrition_plan: {
    breakfast: Meal;
    lunch: Meal;
    dinner: Meal;
    snacks: Meal[];
  };
}

export interface MealPlanRequestData {
    cuisine_preferences: string[];
    budget_per_day?: number;
}

export interface MealPlanMeal {
    name: string;
    calories: number;
    protein_g: number;
}

export interface MealPlanDay {
    day: number;
    total_calories: number;
    macros: {
        protein_g: number;
        carbs_g: number;
        fat_g: number;
    };
    meals: {
        breakfast: MealPlanMeal;
        lunch: MealPlanMeal;
        dinner: MealPlanMeal;
        snacks: MealPlanMeal[];
    };
}

export type WeeklyMealPlan = MealPlanDay[];

export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

// --- New Types for Diary and Grocery List ---

export interface AnalyzedMeal {
    mealName: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    notes: string;
}
export interface MealLogEntry extends AnalyzedMeal {
    id: string; 
    timestamp: string;
    imageUrl?: string;
}

export interface GroceryListItem {
    name: string;
    quantity: string;
}
export interface GroceryListCategory {
    category: string;
    items: GroceryListItem[];
}
export type GroceryList = GroceryListCategory[];

// --- New Types for Reminders ---
export interface Reminder {
    enabled: boolean;
    time: string; // e.g., "13:00"
}
export interface ReminderSettings {
    breakfast: Reminder;
    lunch: Reminder;
    dinner: Reminder;
}

// --- New Types for Recipe Discovery ---
export interface SuggestedRecipe {
    name: string;
    description: string;
    calories: number;
}

export interface FullRecipe {
    name:string;
    description: string;
    servings: number;
    prep_time_minutes: number;
    cook_time_minutes: number;
    ingredients: { item: string; quantity: string }[];
    instructions: string[];
    nutritional_info: {
        calories: number;
        protein_g: number;
        carbs_g: number;
        fat_g: number;
    };
}
