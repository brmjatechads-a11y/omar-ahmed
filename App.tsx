
import React, { useState, useCallback, useEffect } from 'react';
import {
  generateHealthProfile,
  generateWeeklyMealPlan,
  generateGroceryList,
} from './services/geminiService';
import type {
  UserData,
  HealthProfile,
  MealPlanRequestData,
  WeeklyMealPlan,
  GroceryList,
} from './types';

// Fix: remove .tsx extension from component imports
import { OnboardingWizard } from './components/OnboardingWizard';
import { SplashScreen } from './components/SplashScreen';
import { ProfileDisplay } from './components/ProfileDisplay';
import { RecipesView } from './components/RecipeForm'; // Updated to the new view component
import { MealPlanForm } from './components/MealPlanForm';
import { MealPlanDisplay } from './components/MealPlanDisplay';
import { ChatAssistant } from './components/ChatAssistant';
import { BottomNavBar } from './components/BottomNavBar';
import { DiaryView } from './components/DiaryView';
import { GroceryListDisplay } from './components/GroceryListDisplay';

type View = 'dashboard' | 'diary' | 'plans' | 'recipes';

const App: React.FC = () => {
  // Global state
  const [userData, setUserData] = useState<UserData | null>(null);
  const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Meal plan page state
  const [mealPlan, setMealPlan] = useState<WeeklyMealPlan | null>(null);
  const [isMealPlanLoading, setIsMealPlanLoading] = useState(false);
  const [mealPlanError, setMealPlanError] = useState<string | null>(null);
  
  // Grocery list state
  const [groceryList, setGroceryList] = useState<GroceryList | null>(null);
  const [isGroceryListLoading, setIsGroceryListLoading] = useState(false);
  const [groceryListError, setGroceryListError] = useState<string | null>(null);


  useEffect(() => {
    try {
      const savedUserData = localStorage.getItem('userData');
      const savedHealthProfile = localStorage.getItem('healthProfile');
      if (savedUserData && savedHealthProfile) {
        setUserData(JSON.parse(savedUserData));
        setHealthProfile(JSON.parse(savedHealthProfile));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
      localStorage.clear();
    } finally {
      setTimeout(() => setIsAppLoading(false), 2000); // Splash screen duration
    }
  }, []);
  
  // Theme management
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 6 || hour >= 19) { // Night time
        document.documentElement.classList.remove('light');
    } else { // Day time
        document.documentElement.classList.add('light');
    }
  }, []);

  const handleOnboardingComplete = useCallback(async (newUserData: UserData) => {
    setUserData(newUserData);
    setIsAppLoading(true); // Show a brief loading state
    try {
      const profile = await generateHealthProfile(newUserData);
      setHealthProfile(profile);
      localStorage.setItem('userData', JSON.stringify(newUserData));
      localStorage.setItem('healthProfile', JSON.stringify(profile));
    } catch (error) {
      console.error("Failed to generate health profile:", error);
      setUserData(null);
    } finally {
      setTimeout(() => setIsAppLoading(false), 1000);
    }
  }, []);

  const handleGenerateMealPlan = useCallback(async (data: MealPlanRequestData) => {
    if (!healthProfile) return;
    setIsMealPlanLoading(true);
    setMealPlanError(null);
    setMealPlan(null);
    setGroceryList(null); // Clear old grocery list
    try {
      const newPlan = await generateWeeklyMealPlan(healthProfile, data);
      setMealPlan(newPlan);
    } catch (error: any) {
      setMealPlanError(error.message || "An unknown error occurred.");
    } finally {
      setIsMealPlanLoading(false);
    }
  }, [healthProfile]);
  
  const handleGenerateGroceryList = useCallback(async () => {
    if (!mealPlan) return;
    setIsGroceryListLoading(true);
    setGroceryListError(null);
    setGroceryList(null);
    try {
        const newList = await generateGroceryList(mealPlan);
        setGroceryList(newList);
    } catch (error: any) {
        setGroceryListError(error.message || "An unknown error occurred.");
    } finally {
        setIsGroceryListLoading(false);
    }
}, [mealPlan]);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return healthProfile ? <ProfileDisplay profile={healthProfile} /> : null;
      case 'diary':
        return <DiaryView />;
      case 'recipes':
        return healthProfile ? <RecipesView healthProfile={healthProfile} /> : null;
      case 'plans':
        return (
            <>
                <MealPlanForm onSubmit={handleGenerateMealPlan} isLoading={isMealPlanLoading} />
                <MealPlanDisplay 
                    plan={mealPlan} 
                    isLoading={isMealPlanLoading} 
                    error={mealPlanError} 
                    onGenerateGroceryList={handleGenerateGroceryList}
                    isGroceryListLoading={isGroceryListLoading}
                />
                <GroceryListDisplay 
                    list={groceryList} 
                    isLoading={isGroceryListLoading} 
                    error={groceryListError} 
                />
            </>
        );
      default:
        return null;
    }
  };

  if (isAppLoading) {
    return <SplashScreen />;
  }

  if (!userData || !healthProfile) {
    return <OnboardingWizard onOnboardingComplete={handleOnboardingComplete} />;
  }
  
  return (
    <div className="text-[rgb(var(--color-text-primary))] min-h-screen font-sans">
      <main className="container mx-auto max-w-lg p-4 pb-28">
        <div className="space-y-6">
            {renderView()}
        </div>
      </main>
      <ChatAssistant isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} />
      <BottomNavBar currentView={currentView} onViewChange={setCurrentView} />
    </div>
  );
};

export default App;
