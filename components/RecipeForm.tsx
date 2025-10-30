
import React, { useState, useCallback } from 'react';
// Fix: remove .ts extension from module imports
import { getSuggestedRecipes, getRecipeDetails } from '../services/geminiService';
import type { HealthProfile, SuggestedRecipe, FullRecipe } from '../types';
import { Spinner } from './Spinner';

interface RecipesViewProps {
  healthProfile: HealthProfile;
}

const cuisines = [
  { name: 'مصري', icon: '🇪🇬' },
  { name: 'شامي', icon: '🇱🇧' },
  { name: 'إيطالي', icon: '🇮🇹' },
  { name: 'آسيوي', icon: '🍜' },
];

export const RecipesView: React.FC<RecipesViewProps> = ({ healthProfile }) => {
  const [view, setView] = useState<'cuisines' | 'list' | 'details'>('cuisines');
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [suggestedRecipes, setSuggestedRecipes] = useState<SuggestedRecipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<FullRecipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCuisineSelect = useCallback(async (cuisine: string) => {
    setView('list');
    setSelectedCuisine(cuisine);
    setIsLoading(true);
    setError(null);
    setSuggestedRecipes([]);
    try {
      const recipes = await getSuggestedRecipes(cuisine, healthProfile);
      setSuggestedRecipes(recipes);
    } catch (err: any) {
      setError('حدث خطأ أثناء جلب الوصفات. حاول مرة أخرى.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [healthProfile]);

  const handleRecipeSelect = useCallback(async (recipeName: string) => {
    setView('details');
    setIsLoading(true);
    setError(null);
    setSelectedRecipe(null);
    try {
      const details = await getRecipeDetails(recipeName, healthProfile);
      setSelectedRecipe(details);
    } catch (err: any) {
      setError('حدث خطأ أثناء جلب تفاصيل الوصفة.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [healthProfile]);
  
  const handleWhatsAppShare = () => {
    if (!selectedRecipe) return;

    const header = `🛒 *قائمة مشتريات لوصفة: ${selectedRecipe.name}* 🛒\n\n`;
    const ingredientsList = selectedRecipe.ingredients
        .map(ing => `- ${ing.item} (${ing.quantity})`)
        .join('\n');
    const fullMessage = header + ingredientsList;
    const encodedMessage = encodeURIComponent(fullMessage);
    
    // In a real mobile app, you might check for the app's availability.
    // For web, this will open a new tab to WhatsApp Web.
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
};


  const handleBack = () => {
    setError(null);
    if (view === 'details') {
      setView('list');
      setSelectedRecipe(null);
    } else if (view === 'list') {
      setView('cuisines');
      setSelectedCuisine(null);
      setSuggestedRecipes([]);
    }
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <Spinner />
          <p className="mt-4 text-lg text-[rgb(var(--color-text-secondary))]">
            {view === 'list' ? 'بنحضرلك اقتراحات...' : 'جاري تحميل الوصفة...'}
          </p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-8 bg-red-900/20 rounded-xl">
          <p className="text-red-400">{error}</p>
          <button onClick={handleBack} className="mt-4 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] px-4 py-2 rounded-lg">
            الرجوع
          </button>
        </div>
      );
    }

    if (view === 'details' && selectedRecipe) {
      return (
        <div className="fade-in space-y-4">
          <h2 className="text-3xl font-bold text-center text-[rgb(var(--color-secondary))]">{selectedRecipe.name}</h2>
          <p className="text-center text-[rgb(var(--color-text-secondary))]">{selectedRecipe.description}</p>
          
          <div className="flex justify-around text-center p-3 bg-[rgb(var(--color-surface-soft))] rounded-xl">
            <div><p className="font-bold">{selectedRecipe.servings}</p><p className="text-xs">أفراد</p></div>
            <div><p className="font-bold">{selectedRecipe.prep_time_minutes}</p><p className="text-xs">دقيقة تحضير</p></div>
            <div><p className="font-bold">{selectedRecipe.cook_time_minutes}</p><p className="text-xs">دقيقة طبخ</p></div>
            <div><p className="font-bold">{Math.round(selectedRecipe.nutritional_info.calories)}</p><p className="text-xs">كالوري</p></div>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-[rgb(var(--color-primary))] mb-2">المقادير</h3>
            <ul className="space-y-1 list-disc list-inside bg-[rgb(var(--color-surface-soft))] p-4 rounded-xl">
              {selectedRecipe.ingredients.map((ing, i) => <li key={i}><span className="font-semibold">{ing.item}:</span> {ing.quantity}</li>)}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-[rgb(var(--color-primary))] mb-2">طريقة التحضير</h3>
            <ol className="space-y-2">
              {selectedRecipe.instructions.map((step, i) => <li key={i} className="flex items-start"><span className="bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] rounded-full w-6 h-6 text-sm flex items-center justify-center font-bold flex-shrink-0 mr-3">{i+1}</span>{step}</li>)}
            </ol>
          </div>
          
          <button onClick={handleWhatsAppShare} className="w-full flex items-center justify-center gap-2 text-white bg-green-500 hover:bg-green-600 font-bold rounded-lg text-sm px-5 py-3 text-center transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M16.75 13.99c-.221.124-1.31.651-1.514.726-.204.075-.35.124-.496-.124-.147-.248-.568-.726-.693-.874-.124-.148-.248-.173-.372-.124-.124.049-.519.248-.644.297-.124.049-.248.075-.323.025-.074-.05-.323-.124-.595-.372-.272-.248-.92-.823-1.045-.971-.124-.148-.025-.223.049-.272.075-.05.148-.124.223-.198.074-.075.099-.124.148-.223.05-.099.025-.173-.025-.223-.05-.05-.496-.595-.693-.823-.174-.2-.372-.173-.496-.173-.124 0-.272 0-.372.025s-.372.173-.47.372c-.099.198-.372.47-.372.92 0 .449.372 1.044.421 1.119.05.074.744.97 1.794 1.567.248.148.421.223.644.297.272.075.47.049.644-.025.198-.074.595-.248.693-.47.1-.223.1-.421.074-.47s-.05-.074-.099-.124zM12.001 2.003c-5.522 0-9.998 4.477-9.998 9.998 0 1.77.462 3.439 1.289 4.887l-1.289 4.717 4.814-1.256c1.397.777 2.969 1.211 4.597 1.211 5.523 0 9.999-4.477 9.999-9.998s-4.476-9.999-9.999-9.999zm0 18.25c-1.489 0-2.93-.389-4.199-1.109l-.3-.176-3.111.812.826-3.022-.19-.31c-.785-1.29-1.212-2.79-1.212-4.372 0-4.542 3.693-8.235 8.237-8.235 4.543 0 8.237 3.693 8.237 8.235s-3.694 8.235-8.237 8.235z"/></svg>
            إرسال المكونات عبر واتساب
          </button>
        </div>
      );
    }
    
    if (view === 'list') {
      return (
        <div className="fade-in space-y-4">
          <h2 className="text-3xl font-bold text-center">وصفات {selectedCuisine}</h2>
          {suggestedRecipes.map((recipe, index) => (
            <div 
              key={index} 
              onClick={() => handleRecipeSelect(recipe.name)}
              className="bg-[rgb(var(--color-surface-soft))] p-4 rounded-xl cursor-pointer hover:bg-[rgb(var(--color-border))] transition-colors"
            >
              <h3 className="font-bold text-lg text-[rgb(var(--color-primary))]">{recipe.name}</h3>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">{recipe.description}</p>
              <p className="text-xs text-right font-semibold text-[rgb(var(--color-secondary))]">~{Math.round(recipe.calories)} كالوري</p>
            </div>
          ))}
        </div>
      );
    }

    // Default to 'cuisines' view
    return (
      <div className="fade-in space-y-4">
        <h2 className="text-3xl font-bold text-center">اكتشف وصفات جديدة 🍳</h2>
        <p className="text-center text-[rgb(var(--color-text-secondary))]">اختار نوع المطبخ اللي تحبه عشان نقترحلك وصفات صحية مخصوص ليك.</p>
        <div className="grid grid-cols-2 gap-4">
          {cuisines.map(cuisine => (
            <button 
              key={cuisine.name} 
              onClick={() => handleCuisineSelect(cuisine.name)}
              className="bg-[rgb(var(--color-surface-soft))] p-6 rounded-2xl flex flex-col items-center justify-center space-y-2 hover:scale-105 hover:bg-[rgb(var(--color-surface))] transition-transform duration-300 shadow"
            >
              <span className="text-4xl">{cuisine.icon}</span>
              <span className="font-bold text-lg">{cuisine.name}</span>
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="bg-[rgb(var(--color-surface))] p-4 sm:p-6 rounded-2xl shadow-lg">
      {(view === 'list' || view === 'details') && (
        <button onClick={handleBack} className="mb-4 text-sm text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]">
          &larr; رجوع
        </button>
      )}
      {renderContent()}
    </div>
  );
};
