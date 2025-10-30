
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
// Fix: remove .ts extension from module imports
import type { MealLogEntry, AnalyzedMeal, HealthProfile, ReminderSettings } from '../types';
import { analyzeMealImage } from '../services/geminiService';
import { Spinner } from './Spinner';
import { ReminderSettings as ReminderSettingsModal } from './ReminderSettings';

const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const getTodayKey = () => new Date().toISOString().split('T')[0];

const defaultReminders: ReminderSettings = {
    breakfast: { enabled: false, time: '08:00' },
    lunch: { enabled: false, time: '13:00' },
    dinner: { enabled: false, time: '19:00' },
};

export const DiaryView: React.FC = () => {
    const [dailyLog, setDailyLog] = useState<MealLogEntry[]>([]);
    const [healthProfile, setHealthProfile] = useState<HealthProfile | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<AnalyzedMeal | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // New states for reminders
    const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(defaultReminders);
    const [showReminderSettings, setShowReminderSettings] = useState(false);
    const timeoutIdsRef = useRef<number[]>([]);

    // Scheduling logic
    const scheduleNotifications = useCallback((settings: ReminderSettings) => {
        // Clear any existing timeouts
        timeoutIdsRef.current.forEach(clearTimeout);
        timeoutIdsRef.current = [];

        if (Notification.permission !== 'granted') {
            return;
        }

        const now = new Date();

        (Object.keys(settings) as Array<keyof ReminderSettings>).forEach((meal) => {
            const reminder = settings[meal];
            if (reminder.enabled) {
                const [hours, minutes] = reminder.time.split(':').map(Number);
                const reminderTime = new Date();
                reminderTime.setHours(hours, minutes, 0, 0);

                if (reminderTime > now) {
                    const delay = reminderTime.getTime() - now.getTime();
                    const mealLabels: { [key: string]: string } = {
                        breakfast: 'الفطار',
                        lunch: 'الغدا',
                        dinner: 'العشا'
                    };
                    const mealLabel = mealLabels[meal] || 'وجبتك';

                    const timeoutId = window.setTimeout(() => {
                        new Notification('NutriAI - تذكير بالوجبة', {
                            body: `🔔 وقت ${mealLabel}! لا تنس تسجيل وجبتك للحفاظ على تقدمك.`,
                        });
                    }, delay);
                    timeoutIdsRef.current.push(timeoutId);
                }
            }
        });
    }, []);

    // Load data and schedule initial notifications
    useEffect(() => {
        try {
            const savedProfile = localStorage.getItem('healthProfile');
            if (savedProfile) setHealthProfile(JSON.parse(savedProfile));

            const todayKey = getTodayKey();
            const savedLog = localStorage.getItem(`diary_${todayKey}`);
            if (savedLog) setDailyLog(JSON.parse(savedLog));
            
            const savedReminders = localStorage.getItem('reminderSettings');
            const currentSettings = savedReminders ? JSON.parse(savedReminders) : defaultReminders;
            setReminderSettings(currentSettings);
            scheduleNotifications(currentSettings);

        } catch (e) {
            console.error("Failed to load data from localStorage", e);
        }
        
        return () => {
             timeoutIdsRef.current.forEach(clearTimeout);
        }
    }, [scheduleNotifications]);
    
    const handleSettingsChange = (newSettings: ReminderSettings) => {
        setReminderSettings(newSettings);
        localStorage.setItem('reminderSettings', JSON.stringify(newSettings));
        scheduleNotifications(newSettings);
    };

    const totalCaloriesToday = useMemo(() => {
        return dailyLog.reduce((sum, entry) => sum + entry.calories, 0);
    }, [dailyLog]);
    
    const calorieGoal = healthProfile?.daily_calorie_needs || 2000;
    const calorieProgress = Math.min((totalCaloriesToday / calorieGoal) * 100, 100);

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setPreviewUrl(URL.createObjectURL(file));
        setAnalysis(null);
        setError(null);
        setIsLoading(true);

        try {
            const base64Image = await blobToBase64(file);
            const result = await analyzeMealImage(base64Image, file.type);
            setAnalysis(result);
        } catch (err: any) {
            setError(err.message || 'فشل تحليل الصورة. حاول مرة أخرى.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAddToLog = () => {
        if (!analysis || !previewUrl) return;

        const newEntry: MealLogEntry = {
            ...analysis,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            imageUrl: previewUrl,
        };
        
        const updatedLog = [...dailyLog, newEntry];
        setDailyLog(updatedLog);
        
        const todayKey = getTodayKey();
        localStorage.setItem(`diary_${todayKey}`, JSON.stringify(updatedLog));

        setAnalysis(null);
        setPreviewUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="space-y-6 fade-in">
             {showReminderSettings && (
                <ReminderSettingsModal 
                    settings={reminderSettings}
                    onSettingsChange={handleSettingsChange}
                    onClose={() => setShowReminderSettings(false)}
                />
            )}
            <div className="flex justify-between items-center">
                 <h1 className="text-3xl font-bold text-[rgb(var(--color-text-primary))]">يومياتي 📸</h1>
                 <button 
                    onClick={() => setShowReminderSettings(true)} 
                    className="text-2xl p-2 rounded-full text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-surface-soft))] transition-colors" 
                    aria-label="إعدادات التذكير"
                >
                    ⚙️
                </button>
            </div>
            
            {/* Calorie Tracker */}
            <div className="bg-[rgb(var(--color-surface))] p-4 rounded-2xl shadow-lg">
                <div className="flex justify-between items-baseline mb-2">
                    <span className="font-bold text-lg">سعرات اليوم</span>
                    <span className="font-bold text-lg text-[rgb(var(--color-primary))]">{Math.round(totalCaloriesToday)} / <span className="text-sm text-[rgb(var(--color-text-secondary))]">{Math.round(calorieGoal)} كالوري</span></span>
                </div>
                <div className="w-full bg-[rgb(var(--color-surface-soft))] rounded-full h-2.5">
                    <div className="bg-[rgb(var(--color-primary))] h-2.5 rounded-full transition-all duration-500" style={{ width: `${calorieProgress}%` }}></div>
                </div>
            </div>

            {/* Meal Analysis Section */}
            <div className="bg-[rgb(var(--color-surface))] p-6 rounded-2xl shadow-lg text-center">
                <input type="file" accept="image/*" capture="environment" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
                {!previewUrl && (
                    <button onClick={() => fileInputRef.current?.click()} className="w-full text-white bg-[rgb(var(--color-primary))] hover:opacity-90 font-bold rounded-lg text-sm px-5 py-3 text-center transition-opacity duration-200">
                        + إضافة وجبة جديدة
                    </button>
                )}
                
                {previewUrl && (
                    <div className="space-y-4">
                        <img src={previewUrl} alt="Preview" className="rounded-lg max-h-60 mx-auto" />
                        
                        {isLoading && <div className="flex items-center justify-center"><Spinner /> <span className="mr-2">جاري تحليل الوجبة...</span></div>}
                        {error && <p className="text-red-400">{error}</p>}

                        {analysis && (
                            <div className="text-right space-y-3 slide-in-bottom">
                                <h3 className="text-xl font-bold text-center text-[rgb(var(--color-secondary))]">{analysis.mealName}</h3>
                                <p className="text-sm text-[rgb(var(--color-text-secondary))]"><strong className="text-[rgb(var(--color-text-primary))]">مكونات:</strong> {analysis.notes}</p>
                                <div className="flex justify-around text-center pt-2 border-t border-[rgb(var(--color-border))]">
                                    <div><p className="font-bold text-lg">{Math.round(analysis.calories)}</p><p className="text-xs">كالوري</p></div>
                                    <div><p className="font-bold text-lg">{Math.round(analysis.protein_g)}g</p><p className="text-xs">بروتين</p></div>
                                    <div><p className="font-bold text-lg">{Math.round(analysis.carbs_g)}g</p><p className="text-xs">كارب</p></div>
                                    <div><p className="font-bold text-lg">{Math.round(analysis.fat_g)}g</p><p className="text-xs">دهون</p></div>
                                </div>
                                <button onClick={handleAddToLog} className="w-full text-white bg-[rgb(var(--color-primary))] hover:opacity-90 font-bold rounded-lg text-sm px-5 py-3 text-center">
                                    إضافة للسجل
                                </button>
                                <button onClick={() => { setPreviewUrl(null); setAnalysis(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="w-full text-[rgb(var(--color-text-secondary))] mt-2 text-sm">
                                    إلغاء
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {/* Daily Log Display */}
            <div className="space-y-3">
                 <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))]">سجل اليوم</h2>
                 {dailyLog.length > 0 ? (
                    dailyLog.map(entry => (
                        <div key={entry.id} className="bg-[rgb(var(--color-surface))] p-3 rounded-xl flex items-center space-x-4 space-x-reverse shadow">
                            {entry.imageUrl && <img src={entry.imageUrl} alt={entry.mealName} className="w-16 h-16 rounded-lg object-cover" />}
                            <div className="flex-grow">
                                <p className="font-bold">{entry.mealName}</p>
                                <p className="text-xs text-[rgb(var(--color-text-secondary))]">{new Date(entry.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-[rgb(var(--color-primary))]">{Math.round(entry.calories)}</p>
                                <p className="text-xs text-[rgb(var(--color-text-secondary))]">كالوري</p>
                            </div>
                        </div>
                    )).reverse()
                 ) : (
                    <div className="text-center py-8">
                        <p className="text-[rgb(var(--color-text-secondary))]">لم تسجل أي وجبات اليوم.</p>
                        <p className="text-sm text-[rgb(var(--color-text-secondary))] opacity-70">ابدأ بالضغط على "إضافة وجبة جديدة".</p>
                    </div>
                 )}
            </div>
        </div>
    );
};
