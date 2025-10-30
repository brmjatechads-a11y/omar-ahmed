
import React, { useState } from 'react';
import type { WeeklyMealPlan, MealPlanDay } from '../types.ts';
import { Spinner } from './Spinner.tsx';

interface MealPlanDisplayProps {
  plan: WeeklyMealPlan | null;
  isLoading: boolean;
  error: string | null;
  onGenerateGroceryList: () => void;
  isGroceryListLoading: boolean;
}

const DayCard: React.FC<{ dayData: MealPlanDay, index: number }> = ({ dayData, index }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayName = days[dayData.day - 1] || `يوم ${dayData.day}`;

    const mealIcons: { [key: string]: string } = {
        breakfast: '☀️',
        lunch: ' OMEGA ',
        dinner: '🌙',
        snacks: '🍎'
    };

    return (
        <div className="perspective-1000" onClick={() => setIsFlipped(!isFlipped)} style={{animation: `fade-in-scale 0.5s ${index * 100}ms ease-out forwards`, opacity: 0}}>
            <div className={`relative w-full h-64 rounded-2xl shadow-lg cursor-pointer transition-transform duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front */}
                <div className="absolute w-full h-full backface-hidden bg-[rgb(var(--color-surface))] p-4 rounded-2xl flex flex-col justify-between border border-[rgb(var(--color-border))]">
                    <div>
                        <h4 className="font-bold text-xl text-center text-[rgb(var(--color-primary))]">{dayName}</h4>
                        <p className="text-xs text-center text-[rgb(var(--color-text-secondary))]">اضغط عشان تشوف التفاصيل</p>
                    </div>
                    <div className="text-center">
                        <p className="font-bold text-3xl text-[rgb(var(--color-secondary))]">{Math.round(dayData.total_calories)}</p>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))]">كالوري</p>
                    </div>
                     <div className="text-xs text-[rgb(var(--color-text-secondary))] flex justify-around">
                        <span>P: {Math.round(dayData.macros.protein_g)}g</span>
                        <span>C: {Math.round(dayData.macros.carbs_g)}g</span>
                        <span>F: {Math.round(dayData.macros.fat_g)}g</span>
                    </div>
                </div>
                {/* Back */}
                 <div className="absolute w-full h-full backface-hidden bg-[rgb(var(--color-surface-soft))] p-4 rounded-2xl rotate-y-180 border border-[rgb(var(--color-border))] overflow-y-auto scrollbar-thin">
                     <ul className="text-sm space-y-2 text-[rgb(var(--color-text-secondary))]">
                        <li><strong className="text-[rgb(var(--color-text-primary))]">{mealIcons.breakfast} الفطار:</strong> {dayData.meals.breakfast.name}</li>
                        <li><strong className="text-[rgb(var(--color-text-primary))]">{mealIcons.lunch} الغدا:</strong> {dayData.meals.lunch.name}</li>
                        <li><strong className="text-[rgb(var(--color-text-primary))]">{mealIcons.dinner} العشا:</strong> {dayData.meals.dinner.name}</li>
                        {dayData.meals.snacks.map((snack, i) => <li key={i}><strong className="text-[rgb(var(--color-text-primary))]">{mealIcons.snacks} سناك:</strong> {snack.name}</li>)}
                    </ul>
                </div>
            </div>
        </div>
    );
};


export const MealPlanDisplay: React.FC<MealPlanDisplayProps> = ({ plan, isLoading, error, onGenerateGroceryList, isGroceryListLoading }) => {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
          <Spinner />
          <p className="mt-4 text-lg text-[rgb(var(--color-text-secondary))]">بنعملك الخطة الأسبوعية...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full min-h-[300px] bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center">
          <p className="text-red-400"><strong>فيه مشكلة:</strong> {error}</p>
        </div>
      );
    }

    if (!plan) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
          <span className="text-5xl">🗓️</span>
          <p className="mt-4 text-xl text-[rgb(var(--color-text-secondary))]">خطتك الأسبوعية هتظهر هنا.</p>
          <p className="text-[rgb(var(--color-text-secondary))] opacity-70 mt-1">املأ الفورم عشان تبدأ.</p>
        </div>
      );
    }
    
    return (
        <div>
            <h3 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-4 text-center">خطتك الأسبوعية للوجبات</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {plan.map((day, index) => <DayCard key={day.day} dayData={day} index={index} />)}
            </div>
             <div className="mt-6 text-center">
                <button 
                    onClick={onGenerateGroceryList}
                    disabled={isGroceryListLoading}
                    className="w-full md:w-auto text-[rgb(var(--color-text-on-primary))] bg-[rgb(var(--color-secondary))] hover:opacity-90 font-bold rounded-lg text-sm px-8 py-3 text-center transition-opacity duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
                >
                    {isGroceryListLoading ? <><Spinner /> بنجهز القائمة...</> : '🛒 إنشاء قائمة المشتريات'}
                </button>
            </div>
        </div>
    );
  };
  
  return (
    <div className="fade-in">
      {renderContent()}
    </div>
  );
};
