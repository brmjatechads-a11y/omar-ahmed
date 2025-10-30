
import React, { useState } from 'react';
import type { MealPlanRequestData } from '../types.ts';
import { Spinner } from './Spinner.tsx';

interface MealPlanFormProps {
  onSubmit: (data: MealPlanRequestData) => void;
  isLoading: boolean;
}

export const MealPlanForm: React.FC<MealPlanFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<MealPlanRequestData>({
    cuisine_preferences: ['مصري', 'شامي'],
    budget_per_day: undefined,
  });
  
  const handleCuisineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const values = e.target.value.split(',').map(item => item.trim());
    setFormData(prev => ({...prev, cuisine_preferences: values}));
  }

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({...prev, budget_per_day: e.target.value ? Number(e.target.value) : undefined }));
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClasses = "bg-[rgb(var(--color-surface-soft))] border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-primary))] text-sm rounded-lg focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))] block w-full p-2.5";

  return (
    <div className="bg-[rgb(var(--color-surface))] p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-4">خطتك الأسبوعية 🗓️</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                <label htmlFor="cuisine_preferences" className="block mb-2 text-sm font-medium text-[rgb(var(--color-text-secondary))]">أنواع مطابخ تحبها</label>
                <input type="text" id="cuisine_preferences" name="cuisine_preferences" value={formData.cuisine_preferences.join(', ')} onChange={handleCuisineChange} className={inputClasses} placeholder="مثال: مصري, شامي (افصل بينهم بـ ,)" />
            </div>
             <div>
                <label htmlFor="budget_per_day" className="block mb-2 text-sm font-medium text-[rgb(var(--color-text-secondary))]">ميزانية اليوم (اختياري)</label>
                <input type="number" id="budget_per_day" name="budget_per_day" value={formData.budget_per_day || ''} onChange={handleBudgetChange} className={inputClasses} placeholder="مثال: 100" />
            </div>
            <button type="submit" disabled={isLoading} className="w-full text-white bg-[rgb(var(--color-primary))] hover:opacity-90 font-bold rounded-lg text-sm px-5 py-3 text-center transition-opacity duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoading ? <><Spinner /> بنجهز الخطة...</> : 'اعمل خطة الوجبات'}
            </button>
        </form>
    </div>
  );
};