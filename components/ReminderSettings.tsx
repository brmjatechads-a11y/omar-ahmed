import React from 'react';
// Fix: Renamed imported type to avoid conflict with the component name.
import type { ReminderSettings as ReminderSettingsType } from '../types.ts';

interface ReminderSettingsProps {
  settings: ReminderSettingsType;
  onSettingsChange: (newSettings: ReminderSettingsType) => void;
  onClose: () => void;
}

type MealKey = keyof ReminderSettingsType;

export const ReminderSettings: React.FC<ReminderSettingsProps> = ({ settings, onSettingsChange, onClose }) => {
  
  const handleToggle = async (meal: MealKey) => {
    const newSettings = { ...settings };
    const currentReminder = newSettings[meal];
    
    // If we are enabling it and permission has not been granted yet
    if (!currentReminder.enabled && Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('تم رفض إذن الإشعارات. لن تتمكن من تلقي تذكيرات. يمكنك تغيير هذا من إعدادات المتصفح.');
        return; // Don't enable if permission is denied
      }
    }
    
    newSettings[meal].enabled = !currentReminder.enabled;
    onSettingsChange(newSettings);
  };

  const handleTimeChange = (meal: MealKey, time: string) => {
    const newSettings = { ...settings };
    newSettings[meal].time = time;
    onSettingsChange(newSettings);
  };

  const ReminderRow: React.FC<{ meal: MealKey; label: string; icon: string }> = ({ meal, label, icon }) => {
    const reminder = settings[meal];
    return (
      <div className="flex items-center justify-between py-3">
        <div className="flex items-center">
          <span className="text-2xl mr-3">{icon}</span>
          <span className="font-semibold text-[rgb(var(--color-text-primary))]">{label}</span>
        </div>
        <div className="flex items-center space-x-2 space-x-reverse">
          <input 
            type="time" 
            value={reminder.time}
            onChange={(e) => handleTimeChange(meal, e.target.value)}
            disabled={!reminder.enabled}
            className="bg-[rgb(var(--color-surface-soft))] border border-[rgb(var(--color-border))] text-[rgb(var(--color-text-primary))] text-sm rounded-lg p-1.5 disabled:opacity-50"
          />
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={reminder.enabled}
              onChange={() => handleToggle(meal)}
              className="sr-only peer" 
            />
            <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-[rgb(var(--color-primary))] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[rgb(var(--color-primary))]"></div>
          </label>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center fade-in" onClick={onClose}>
      <div className="bg-[rgb(var(--color-surface))] p-6 rounded-2xl shadow-lg w-full max-w-sm m-4 slide-in-bottom" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-[rgb(var(--color-text-primary))]">إعدادات التذكير ⏰</h2>
            <button onClick={onClose} className="text-2xl text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]">&times;</button>
        </div>
        <p className="text-sm text-[rgb(var(--color-text-secondary))] mb-4">
            قم بتفعيل الإشعارات لتذكيرك بتسجيل وجباتك في الأوقات التي تحددها.
        </p>
        <div className="divide-y divide-[rgb(var(--color-border))]">
          <ReminderRow meal="breakfast" label="الفطار" icon="☀️" />
          <ReminderRow meal="lunch" label="الغدا" icon=" OMEGA " />
          <ReminderRow meal="dinner" label="العشا" icon="🌙" />
        </div>
      </div>
    </div>
  );
};