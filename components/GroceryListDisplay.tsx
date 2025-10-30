
import React, { useState } from 'react';
import type { GroceryList } from '../types.ts';
import { Spinner } from './Spinner.tsx';

interface GroceryListDisplayProps {
  list: GroceryList | null;
  isLoading: boolean;
  error: string | null;
}

export const GroceryListDisplay: React.FC<GroceryListDisplayProps> = ({ list, isLoading, error }) => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());

  const handleToggleItem = (itemName: string) => {
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return newSet;
    });
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
          <Spinner />
          <p className="mt-4 text-lg text-[rgb(var(--color-text-secondary))]">بنحضرلك قايمة المشتريات...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full min-h-[200px] bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center">
          <p className="text-red-400"><strong>فيه مشكلة:</strong> {error}</p>
        </div>
      );
    }

    if (!list) {
      return null; // Don't show anything if there's no list and not loading/error
    }
    
    if (list.length === 0) {
        return <p className="text-center text-[rgb(var(--color-text-secondary))] mt-4">القائمة فاضية.</p>
    }

    return (
        <div className="space-y-4">
            {list.map((category, index) => (
                <div key={index}>
                    <h4 className="text-lg font-bold text-[rgb(var(--color-primary))] border-b-2 border-[rgb(var(--color-border))] pb-2 mb-2">{category.category}</h4>
                    <ul className="space-y-2">
                        {category.items.map((item, itemIndex) => {
                             const uniqueId = `${category.category}-${item.name}-${itemIndex}`;
                             const isChecked = checkedItems.has(uniqueId);
                             return (
                                <li key={uniqueId} className="flex items-center">
                                    <input
                                        id={uniqueId}
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => handleToggleItem(uniqueId)}
                                        className="w-5 h-5 accent-[rgb(var(--color-primary))] bg-gray-100 border-gray-300 rounded focus:ring-transparent mr-3"
                                    />
                                    <label htmlFor={uniqueId} className={`flex-grow text-sm ${isChecked ? 'line-through text-[rgb(var(--color-text-secondary))]' : 'text-[rgb(var(--color-text-primary))]'}`}>
                                        <span className="font-semibold">{item.name}</span>
                                        <span className="text-xs text-[rgb(var(--color-text-secondary))]"> ({item.quantity})</span>
                                    </label>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            ))}
        </div>
    );
  };
  
  return (
    <div className="bg-[rgb(var(--color-surface))] p-6 rounded-2xl shadow-lg fade-in">
        <h3 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] mb-4 text-center">قائمة المشتريات 🛒</h3>
      {renderContent()}
    </div>
  );
};
