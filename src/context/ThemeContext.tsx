import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AccentTheme, IDLE_COLOR_CONFIG, PHASE_CONFIGS, Phase, PhaseColorConfig } from '../types/breathing';

interface ThemeContextValue {
  theme: AccentTheme;
  setTheme: (theme: AccentTheme) => void;
  accentColor: string;
  accentGlow: string;
  accentAmbient: string;
  getPhaseTheme: (phase: Phase, isActive: boolean) => PhaseColorConfig;
}

const THEME_STATIC_CONFIGS: Record<Exclude<AccentTheme, 'dynamic'>, PhaseColorConfig> = {
  orange: {
    hex: '#FF4F00',
    glow: 'rgba(255, 79, 0, 0.45)',
    ambient: 'rgba(255, 79, 0, 0.12)',
  },
  sage: {
    hex: '#A3B19B',
    glow: 'rgba(163, 177, 155, 0.45)',
    ambient: 'rgba(163, 177, 155, 0.12)',
  },
  alabaster: {
    hex: '#F4F4F6',
    glow: 'rgba(244, 244, 246, 0.35)',
    ambient: 'rgba(244, 244, 246, 0.10)',
  },
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AccentTheme>(() => {
    try {
      const saved = localStorage.getItem('boxbre-theme') as AccentTheme | null;
      if (saved && ['dynamic', 'orange', 'sage', 'alabaster'].includes(saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'dynamic';
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

  const getPhaseTheme = useCallback(
    (phase: Phase, isActive: boolean): PhaseColorConfig => {
      if (theme === 'dynamic') {
        return isActive ? PHASE_CONFIGS[phase].color : IDLE_COLOR_CONFIG;
      }
      return THEME_STATIC_CONFIGS[theme];
    },
    [theme]
  );

  const currentStatic = theme === 'dynamic' ? IDLE_COLOR_CONFIG : THEME_STATIC_CONFIGS[theme];

  const value: ThemeContextValue = {
    theme,
    setTheme,
    accentColor: currentStatic.hex,
    accentGlow: currentStatic.glow,
    accentAmbient: currentStatic.ambient,
    getPhaseTheme,
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


