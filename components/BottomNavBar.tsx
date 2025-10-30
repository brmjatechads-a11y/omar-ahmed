
import React from 'react';

type View = 'dashboard' | 'diary' | 'plans' | 'recipes';

interface BottomNavBarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const NavItem: React.FC<{
    label: string;
    view: View;
    currentView: View;
    onViewChange: (view: View) => void;
    icon: (active: boolean) => React.ReactNode;
}> = ({ label, view, currentView, onViewChange, icon }) => {
    const isActive = currentView === view;
    return (
        <button
            onClick={() => onViewChange(view)}
            className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-xs transition-all duration-300 transform ${isActive ? 'text-[rgb(var(--color-primary))]' : 'text-[rgb(var(--color-text-secondary))] hover:text-[rgb(var(--color-text-primary))]'}`}
        >
            <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>
             {icon(isActive)}
            </div>
            <span className={`mt-1 font-bold ${isActive ? 'opacity-100' : 'opacity-70'}`}>{label}</span>
        </button>
    );
};

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ currentView, onViewChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[rgb(var(--color-surface))] border-t border-[rgb(var(--color-border))] z-30">
      <div className="flex justify-around max-w-lg mx-auto">
        <NavItem label="ملفي الصحي" view="dashboard" currentView={currentView} onViewChange={onViewChange}
            icon={(active) => <svg xmlns="http://www.w.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 4h6v6h-6z" /><path d="M14 4h6v6h-6z" /><path d="M4 14h6v6h-6z" /><path d="M17 17m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M14 7h6" /><path d="M7 4v6" /><path d="M20 14h-3.5" /><path d="M4 17h6.5" /><path d="M17 4v3.5" /><path d="M7 14v-3.5" /></svg>}
        />
        <NavItem label="يومياتي" view="diary" currentView={currentView} onViewChange={onViewChange}
            icon={(active) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" /><path d="M3 6l0 13" /><path d="M12 6l0 13" /><path d="M21 6l0 13" /></svg>}
        />
         <NavItem label="الخطط" view="plans" currentView={currentView} onViewChange={onViewChange}
            icon={(active) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15 21h-9a3 3 0 0 1 -3 -3v-12a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v9" /><path d="M3 10h18" /><path d="M7 3v7" /><path d="M11 3v7" /><path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M20.2 20.2l1.8 1.8" /></svg>}
        />
        <NavItem label="الوصفات" view="recipes" currentView={currentView} onViewChange={onViewChange}
            icon={(active) => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 6.253v13m0 -13c-1.168 -.777 -2.754 -1.253 -4.5 -1.253c-1.746 0 -3.332 .477 -4.5 1.253v13c1.168 .777 2.754 1.253 4.5 1.253s3.332 -.477 4.5 -1.253m0 -13c1.168 -.777 2.754 -1.253 4.5 -1.253c1.746 0 3.332 .477 4.5 1.253v13c-1.168 .777 -2.754 -1.253 -4.5 -1.253s-3.332 .477 -4.5 1.253" /></svg>}
        />
      </div>
    </nav>
  );
};
