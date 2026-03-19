import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="
        relative flex items-center justify-center w-12 h-12 rounded-[14px] 
        bg-white/5 backdrop-blur-md border border-white/10 
        shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]
        hover:bg-white/10 hover:scale-105 transition-all duration-300
        dark:bg-slate-800/40 dark:border-white/5 dark:shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]
        group overflow-hidden
      "
      title={`Engage ${theme === 'light' ? 'Stealth' : 'Daylight'} Protocol`}
    >
      {/* Animation Magic: 
        We render BOTH icons on top of each other, but we rotate and fade them in/out based on the current theme state.
      */}
      
      {/* The Moon (Stealth Mode) */}
      <div 
        className={`absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          theme === 'dark' 
            ? 'opacity-100 rotate-0 scale-100 text-indigo-400' 
            : 'opacity-0 -rotate-90 scale-50 text-slate-400'
        }`}
      >
        <Moon size={20} strokeWidth={2.5} />
      </div>

      {/* The Sun (Daylight Mode) */}
      <div 
        className={`absolute transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          theme === 'light' 
            ? 'opacity-100 rotate-0 scale-100 text-amber-500' 
            : 'opacity-0 rotate-90 scale-50 text-slate-400'
        }`}
      >
        <Sun size={20} strokeWidth={2.5} />
      </div>

      {/* Tiny HUD Detail */}
      <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-indigo-500/50 
        dark:bg-emerald-400/50 group-hover:animate-ping" 
      />
    </button>
  );
};

export default ThemeToggle;
