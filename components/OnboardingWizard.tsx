import React, { useState } from 'react';
import type { UserData } from '../types';

interface OnboardingWizardProps {
  onOnboardingComplete: (userData: UserData) => void;
}

const initialFormData: UserData = {
  name: '',
  age: 30,
  gender: 'male',
  weight_kg: 70,
  height_cm: 175,
  blood_type: 'A+',
  activity_level: 'moderate',
  chronic_conditions: [],
  allergies: [],
  dietary_preferences: [],
  goal: 'maintain_weight',
  resting_heart_rate: undefined,
  avg_steps_per_day: undefined,
  avg_sleep_hours: undefined,
};

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onOnboardingComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<UserData>(initialFormData);
  const totalSteps = 4;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let finalValue: string | number | undefined = value;
    if (type === 'number') {
        finalValue = value === '' ? undefined : Number(value);
    }
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const values = value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [name]: values }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOnboardingComplete(formData);
  };
  
  const inputClasses = "bg-[rgb(var(--color-surface-soft))] border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-primary))] text-sm rounded-lg focus:ring-[rgb(var(--color-primary))] focus:border-[rgb(var(--color-primary))] block w-full p-2.5";
  const buttonClasses = "w-full text-white bg-[rgb(var(--color-primary))] hover:opacity-90 font-bold rounded-lg text-sm px-5 py-3 text-center transition-opacity duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h2 className="text-2xl font-bold text-center">أهلاً بيك في NutriAI!</h2>
            <p className="text-center text-[rgb(var(--color-text-secondary))] mb-6">محتاجين نعرف عنك شوية حاجات عشان نساعدك توصل لهدفك.</p>
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-[rgb(var(--color-text-secondary))]">الاسم</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className={inputClasses} placeholder="اسمك إيه؟" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="block mb-2 text-sm font-medium text-[rgb(var(--color-text-secondary))]">العمر</label>
                <input type="number" id="age" name="age" value={formData.age} onChange={handleChange} className={inputClasses} required />
              </div>
              <div>
                <label htmlFor="gender" className="block mb-2 text-sm font-medium text-[rgb(var(--color-text-secondary))]">الجنس</label>
                <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className={inputClasses}>
                  <option value="male">ذكر</option>
                  <option value="female">أنثى</option>
                </select>
              </div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <h2 className="text-2xl font-bold text-center">مقاساتك 📏</h2>
            <p className="text-center text-[rgb(var(--color-text-secondary))] mb-6">ده هيساعدنا نحسب احتياجاتك بدقة.</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="weight_kg" className="block mb-2 text-sm font-medium text-[rgb(var(--color-text-secondary))]">الوزن (كجم)</label>
                <input type="number" id="weight_kg" name="weight_kg" value={formData.weight_kg} onChange={handleChange} className={inputClasses} required />
              </div>
              <div>
                <label htmlFor="height_cm" className="block mb-2 text-sm font-medium text-[rgb(var(--color-text-secondary))]">الطول (سم)</label>
                <input type="number" id="height_cm" name="height_cm" value={formData.height_cm} onChange={handleChange} className={inputClasses} required />
              </div>
            </div>
            <div>
                <label htmlFor="activity_level" className="block mb-2 text-sm font-medium text-[rgb(var(--color-text-secondary))]">مستوى النشاط</label>
                <select id="activity_level" name="activity_level" value={formData.activity_level} onChange={handleChange} className={inputClasses}>
                    <option value="sedentary">قليل الحركة (شغل مكتبي)</option>
                    <option value="light">نشاط خفيف (تمرين 1-3 أيام)</option>
                    <option value="moderate">نشاط متوسط (تمرين 3-5 أيام)</option>
                    <option value="active">نشيط (تمرين 6-7 أيام)</option>
                    <option value="very_active">نشيط جداً (تمرين شاق أو وظيفة بدنية)</option>
                </select>
            </div>
             <div>
                <label htmlFor="blood_type" className="block mb-2 text-sm font-medium text-[rgb(var(--color-text-secondary))]">فصيلة الدم</label>
                <input type="text" id="blood_type" name="blood_type" value={formData.blood_type} onChange={handleChange} className={inputClasses} placeholder="A+, O-, etc." required />
             </div>
          </>
        );
      case 3:
        return (
          <>
            <h2 className="text-2xl font-bold text-center">صحتك وأهدافك 🎯</h2>
            <p className="text-center text-[rgb(var(--color-text-secondary))] mb-6">آخر كام سؤال عشان الصورة تكمل.</p>
            <div>
              <label htmlFor="goal" className="block mb-2 text-sm font-medium text-[rgb(var(--color-text-secondary))]">هدفك الأساسي</label>
              <select id="goal" name="goal" value={formData.goal} onChange={handleChange} className={inputClasses}>
                <option value="lose_weight">خسارة الوزن</option>
                <option value="maintain_weight">الحفاظ على الوزن</option>
                <option value="gain_muscle">زيادة الكتلة العضلية</option>
              </select>
            </div>
            <div>
              <label htmlFor="allergies" className="block mb-2 text-sm font-medium text-[rgb(var(--color-text-secondary))]">عندك حساسية من أي أكل؟ (افصل بفاصلة)</label>
              <input type="text" id="allergies" name="allergies" value={formData.allergies.join(', ')} onChange={handleMultiSelectChange} className={inputClasses} placeholder="مثال: مكسرات, لاكتوز" />
            </div>
             <div>
              <label htmlFor="dietary_preferences" className="block mb-2 text-sm font-medium text-[rgb(var(--color-text-secondary))]">تفضيلات في الأكل؟ (افصل بفاصلة)</label>
              <input type="text" id="dietary_preferences" name="dietary_preferences" value={formData.dietary_preferences.join(', ')} onChange={handleMultiSelectChange} className={inputClasses} placeholder="مثال: نباتي, أكل بحري" />
            </div>
          </>
        );
       case 4:
         return (
           <>
            <h2 className="text-2xl font-bold text-center">بيانات إضافية</h2>
            <p className="text-center text-[rgb(var(--color-text-secondary))] mb-6">لو عندك أي أمراض مزمنة أو بيانات من ساعة ذكية، ممكن تضيفها.</p>
            <div>
              <label htmlFor="chronic_conditions" className="block mb-2 text-sm font-medium text-[rgb(var(--color-text-secondary))]">أمراض مزمنة؟ (افصل بفاصلة)</label>
              <input type="text" id="chronic_conditions" name="chronic_conditions" value={formData.chronic_conditions.join(', ')} onChange={handleMultiSelectChange} className={inputClasses} placeholder="مثال: سكر, ضغط" />
            </div>
            <div className="grid grid-cols-3 gap-4 pt-4">
               <div>
                <label htmlFor="resting_heart_rate" className="block mb-2 text-sm font-medium text-[rgb(var(--color-text-secondary))]">نبض الراحة</label>
                <input type="number" id="resting_heart_rate" name="resting_heart_rate" value={formData.resting_heart_rate || ''} onChange={handleChange} className={inputClasses} />
              </div>
               <div>
                <label htmlFor="avg_steps_per_day" className="block mb-2 text-sm font-medium text-[rgb(var(--color-text-secondary))]">متوسط الخطوات</label>
                <input type="number" id="avg_steps_per_day" name="avg_steps_per_day" value={formData.avg_steps_per_day || ''} onChange={handleChange} className={inputClasses} />
              </div>
               <div>
                <label htmlFor="avg_sleep_hours" className="block mb-2 text-sm font-medium text-[rgb(var(--color-text-secondary))]">ساعات النوم</label>
                <input type="number" id="avg_sleep_hours" name="avg_sleep_hours" value={formData.avg_sleep_hours || ''} onChange={handleChange} className={inputClasses} />
              </div>
            </div>
           </>
         )
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[rgb(var(--color-background))] to-[rgb(var(--color-surface))] flex flex-col items-center justify-center p-4">
       <div className="w-full max-w-lg mx-auto">
        <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-[rgb(var(--color-text-primary))]">
            <span className="text-[rgb(var(--color-primary))]">Nutri</span>AI
            </h1>
        </div>

        <div className="bg-[rgb(var(--color-surface))] p-6 sm:p-8 rounded-2xl shadow-2xl">
           {/* Progress Bar */}
           <div className="mb-6">
                <div className="relative pt-1">
                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-[rgb(var(--color-surface-soft))]">
                        <div style={{ width: `${(step / totalSteps) * 100}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[rgb(var(--color-primary))] transition-all duration-500"></div>
                    </div>
                </div>
                <p className="text-center text-sm text-[rgb(var(--color-text-secondary))]">خطوة {step} من {totalSteps}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="min-h-[260px] flex flex-col justify-center space-y-4">
                    {renderStepContent()}
                </div>
                
                <div className="flex items-center justify-between pt-4">
                    <button type="button" onClick={prevStep} disabled={step === 1} className="text-[rgb(var(--color-text-secondary))] bg-transparent hover:bg-[rgb(var(--color-surface-soft))] font-bold rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed">
                        السابق
                    </button>
                    {step < totalSteps ? (
                        <button type="button" onClick={nextStep} className={buttonClasses.replace('w-full', 'w-auto')}>
                            التالي
                        </button>
                    ) : (
                        <button type="submit" className={buttonClasses.replace('w-full', 'w-auto')}>
                            إنشاء ملفي الصحي
                        </button>
                    )}
                </div>
            </form>
        </div>
       </div>
    </div>
  );
};
