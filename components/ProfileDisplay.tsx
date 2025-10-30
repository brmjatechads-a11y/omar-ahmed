
import React from 'react';
import type { HealthProfile } from '../types';

interface ProfileDisplayProps {
  profile: HealthProfile;
}

const StatCard: React.FC<{ label: string; value: string | number; unit?: string, icon: string }> = ({ label, value, unit, icon }) => (
    <div className="bg-[rgb(var(--color-surface-soft))] p-4 rounded-xl flex items-center space-x-3 space-x-reverse">
        <div className="text-3xl">{icon}</div>
        <div>
            <p className="text-sm text-[rgb(var(--color-text-secondary))]">{label}</p>
            <p className="text-lg font-bold text-[rgb(var(--color-text-primary))]">
                {value} <span className="text-sm font-normal">{unit}</span>
            </p>
        </div>
    </div>
);


const MacroDisplay: React.FC<{ label: string; grams: number; color: string }> = ({ label, grams, color }) => (
    <div className="flex flex-col items-center">
        <p className="font-bold text-xl" style={{ color }}>{Math.round(grams)}g</p>
        <p className="text-xs text-[rgb(var(--color-text-secondary))]">{label}</p>
    </div>
);


export const ProfileDisplay: React.FC<ProfileDisplayProps> = ({ profile }) => {
  return (
    <div className="space-y-6 fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))]">أهلاً، {profile.name}!</h1>
        <p className="text-[rgb(var(--color-text-secondary))]">ده ملخص ملفك الصحي اليومي.</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="السعرات الحرارية" value={Math.round(profile.daily_calorie_needs)} unit="كالوري" icon="🔥" />
        <StatCard label="مؤشر كتلة الجسم" value={profile.bmi.value.toFixed(1)} unit={profile.bmi.category} icon="📊" />
        <StatCard label="الترطيب اليومي" value={profile.hydration_liters} unit="لتر" icon="💧" />
        <StatCard label="الهدف" value={profile.key_recommendations[0]?.split(' ')[0] || "صحة عامة"} unit="" icon="🎯"/>
      </div>

      {/* Macronutrients */}
      <div className="bg-[rgb(var(--color-surface))] p-4 rounded-2xl shadow-lg">
        <h2 className="text-lg font-bold mb-3 text-center">احتياجك من المغذيات الكبرى</h2>
        <div className="flex justify-around">
            <MacroDisplay label="بروتين" grams={profile.macronutrient_distribution.protein_grams} color="rgb(var(--color-secondary))" />
            <MacroDisplay label="كربوهيدرات" grams={profile.macronutrient_distribution.carbs_grams} color="rgb(var(--color-primary))" />
            <MacroDisplay label="دهون" grams={profile.macronutrient_distribution.fat_grams} color="#FBBF24" />
        </div>
      </div>
      
      {/* Key Recommendations */}
       {profile.key_recommendations && profile.key_recommendations.length > 0 && (
         <div className="bg-[rgb(var(--color-surface))] p-4 rounded-2xl shadow-lg">
            <h2 className="text-lg font-bold mb-2">أهم النصايح ليك</h2>
            <ul className="space-y-2 list-disc list-inside text-[rgb(var(--color-text-secondary))]">
                {profile.key_recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
            </ul>
        </div>
       )}

      {/* Wearable Insights */}
      {profile.wearable_insights && profile.wearable_insights.length > 0 && (
        <div className="bg-[rgb(var(--color-surface))] p-4 rounded-2xl shadow-lg">
            <h2 className="text-lg font-bold mb-2">تحليلات من ساعتك الذكية ⌚</h2>
             <ul className="space-y-2 list-disc list-inside text-[rgb(var(--color-text-secondary))]">
                {profile.wearable_insights.map((insight, i) => <li key={i}>{insight}</li>)}
            </ul>
        </div>
      )}

      {/* Daily Nutrition Plan */}
      <div className="bg-[rgb(var(--color-surface))] p-4 rounded-2xl shadow-lg">
        <h2 className="text-lg font-bold mb-3 text-center">خطة تغذية مقترحة لليوم</h2>
        <div className="space-y-3">
          <div className="bg-[rgb(var(--color-surface-soft))] p-3 rounded-lg">
            <p><strong className="text-[rgb(var(--color-text-primary))]">☀️ الفطار:</strong> {profile.daily_nutrition_plan.breakfast.name} <span className="text-xs text-[rgb(var(--color-text-secondary))]">({Math.round(profile.daily_nutrition_plan.breakfast.calories)} كالوري)</span></p>
            <p className="text-sm text-[rgb(var(--color-text-secondary))] pr-6">{profile.daily_nutrition_plan.breakfast.description}</p>
          </div>
          <div className="bg-[rgb(var(--color-surface-soft))] p-3 rounded-lg">
             <p><strong className="text-[rgb(var(--color-text-primary))]"> OMEGA  الغدا:</strong> {profile.daily_nutrition_plan.lunch.name} <span className="text-xs text-[rgb(var(--color-text-secondary))]">({Math.round(profile.daily_nutrition_plan.lunch.calories)} كالوري)</span></p>
             <p className="text-sm text-[rgb(var(--color-text-secondary))] pr-6">{profile.daily_nutrition_plan.lunch.description}</p>
          </div>
          <div className="bg-[rgb(var(--color-surface-soft))] p-3 rounded-lg">
             <p><strong className="text-[rgb(var(--color-text-primary))]">🌙 العشا:</strong> {profile.daily_nutrition_plan.dinner.name} <span className="text-xs text-[rgb(var(--color-text-secondary))]">({Math.round(profile.daily_nutrition_plan.dinner.calories)} كالوري)</span></p>
             <p className="text-sm text-[rgb(var(--color-text-secondary))] pr-6">{profile.daily_nutrition_plan.dinner.description}</p>
          </div>
           {profile.daily_nutrition_plan.snacks.map((snack, i) => (
             <div key={i} className="bg-[rgb(var(--color-surface-soft))] p-3 rounded-lg">
                <p><strong className="text-[rgb(var(--color-text-primary))]">🍎 سناك:</strong> {snack.name} <span className="text-xs text-[rgb(var(--color-text-secondary))]">({Math.round(snack.calories)} كالوري)</span></p>
                <p className="text-sm text-[rgb(var(--color-text-secondary))] pr-6">{snack.description}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
