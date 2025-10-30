import React, { useState, useEffect } from 'react';

const motivationalQuotes = [
    "كل خطوة صغيرة تقربك من هدفك الكبير.",
    "صحتك هي أغلى استثمار في حياتك.",
    "التغذية السليمة هي أساس الطاقة والنشاط.",
    "القوة لا تأتي من القدرة الجسدية، بل من الإرادة التي لا تقهر.",
    "استمع لجسدك، فهو يخبرك بما يحتاجه.",
    "اليوم هو أفضل يوم لتبدأ حياة صحية.",
];

export const SplashScreen: React.FC = () => {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    // Select a random quote when the component mounts
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setQuote(motivationalQuotes[randomIndex]);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[rgb(var(--color-background))] to-[rgb(var(--color-surface))] flex flex-col items-center justify-center z-50">
      <div className="text-center fade-in-scale">
        <div className="flex items-center justify-center space-x-2 text-5xl md:text-6xl font-extrabold text-[rgb(var(--color-text-primary))]">
          <span className="text-[rgb(var(--color-primary))]">Nutri</span>
          <span>AI</span>
        </div>
        <p className="text-[rgb(var(--color-text-secondary))] mt-4 fade-in min-h-[24px]" style={{ animationDelay: '0.5s' }}>
            {quote}
        </p>
        <div className="mt-8 flex items-center justify-center space-x-2 space-x-reverse text-[rgb(var(--color-text-secondary))] fade-in" style={{ animationDelay: '1s' }}>
             <div className="w-2.5 h-2.5 bg-[rgb(var(--color-primary))] rounded-full animate-pulse" style={{animationDelay: '0s'}}></div>
             <div className="w-2.5 h-2.5 bg-[rgb(var(--color-primary))] rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
             <div className="w-2.5 h-2.5 bg-[rgb(var(--color-primary))] rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
             <span className="text-sm">جاري التحميل...</span>
        </div>
      </div>
    </div>
  );
};