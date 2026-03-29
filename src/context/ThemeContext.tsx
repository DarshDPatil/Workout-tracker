import React, { createContext, useContext, useEffect, useState } from 'react';

// 1. Define the types for TypeScript
type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

// 2. Create the Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 3. Create the Provider Component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check local storage first, if nothing is there, check the user's Windows/Mac system preference!
  const [theme, setTheme] = useState<Theme>('light');

  // 4. The effect that actually flips the switch on the HTML document
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove the old theme class and add the new one
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    // Save their choice to storage (optional, but we'll keep it so they can toggle during session)
    localStorage.setItem('tactical_theme', theme);
  }, [theme]);

  // 5. The toggle function we will attach to your button later
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 6. A custom hook so your other files can easily use this
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
