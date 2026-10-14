import React, { createContext, useContext, useEffect, useState } from 'react';
import { AccentTheme } from '../types/breathing';

interface ThemeContextValue {
  theme: AccentTheme;
  setTheme: (theme: AccentTheme) => void;
  accentColor: string;
  accentGlow: string;
}

const THEME_COLORS: Record<AccentTheme, { hex: string; glow: string }> = {
  orange: {
    hex: '#FF4F00',
    glow: 'rgba(255, 79, 0, 0.45)',
  },
  sage: {
    hex: '#A3B19B',
    glow: 'rgba(163, 177, 155, 0.45)',
  },
  alabaster: {
    hex: '#F4F4F6',
    glow: 'rgba(244, 244, 246, 0.35)',
  },
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AccentTheme>(() => {
    try {
      const saved = localStorage.getItem('boxbre-theme') as AccentTheme | null;
      if (saved && ['orange', 'sage', 'alabaster'].includes(saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'orange';
  });

  const setTheme = (newTheme: AccentTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('boxbre-theme', newTheme);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const value: ThemeContextValue = {
    theme,
    setTheme,
    accentColor: THEME_COLORS[theme].hex,
    accentGlow: THEME_COLORS[theme].glow,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

