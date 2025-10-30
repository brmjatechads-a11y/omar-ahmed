
import React from 'react';
import { Spinner } from './Spinner.tsx';

interface RecipeDisplayProps {
    recipe: string | null;
    isLoading: boolean;
    error: string | null;
    onGenerateProduct: (recipe: string, portion: string, packaging: string) => void;
}

const FormattedRecipe = ({ text }: { text: string }) => {
    const lines = text.split('\n').filter(line => line.trim() !== '');
    const title = lines.find(line => line.startsWith('# '))?.substring(2) || 'وصفة جديدة';

    return (
        <div className="space-y-3 text-[rgb(var(--color-text-secondary))]">
             <h2 className="text-2xl font-bold text-[rgb(var(--color-text-primary))] pb-2 border-b border-[rgb(var(--color-border))]">{title}</h2>
            {lines.slice(1).map((line, index) => {
                if (line.startsWith('## ')) {
                     return <h3 key={index} className="text-xl font-semibold text-[rgb(var(--color-primary))] pt-2">{line.substring(3)}</h3>;
                }
                if (line.startsWith('* ') || line.startsWith('- ')) {
                    return <p key={index} className="flex items-start"><span className="text-[rgb(var(--color-secondary))] mr-2 mt-1.5 flex-shrink-0">•</span><span>{line.substring(2)}</span></p>
                }
                 if (/^\d+\./.test(line)) {
                     return <p key={index} className="flex items-start"><span className="text-[rgb(var(--color-text-secondary))] mr-2 font-bold">{line.match(/^\d+\./)?.[0]}</span><span>{line.substring(line.indexOf('.') + 1).trim()}</span></p>;
                 }
                return <p key={index}>{line}</p>;
            })}
        </div>
    );
};

export const RecipeDisplay: React.FC<RecipeDisplayProps> = ({ recipe, isLoading, error }) => {
    
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px]">
                    <Spinner />
                    <p className="mt-4 text-lg text-[rgb(var(--color-text-secondary))]">بنحضرلك الوصفة...</p>
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

        if (!recipe) {
            return (
                <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                     <span className="text-5xl">🍳</span>
                    <p className="mt-4 text-xl text-[rgb(var(--color-text-secondary))]">وصفتك الجديدة هتظهر هنا.</p>
                    <p className="text-[rgb(var(--color-text-secondary))] opacity-70 mt-1">املأ الفورم اللي فوق عشان تبدأ.</p>
                </div>
            );
        }

        return <FormattedRecipe text={recipe} />;
    }


    return (
        <div className="bg-[rgb(var(--color-surface))] p-6 rounded-2xl shadow-lg fade-in">
           {renderContent()}
        </div>
    );
};