import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { AccentTheme } from '../types/breathing';

interface TopBarProps {
  sessionElapsed: number; // in seconds
  isRunning: boolean;
  cyclesCompleted: number;
}

export const TopBar: React.FC<TopBarProps> = ({ sessionElapsed, isRunning, cyclesCompleted }) => {
  const { theme, setTheme } = useTheme();

  const formatElapsed = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const themes: { id: AccentTheme; label: string; bg?: string; style?: React.CSSProperties }[] = [
    {
      id: 'dynamic',
      label: 'Dynamic Phase Colors',
      style: {
        background: 'conic-gradient(from 0deg, #38BDF8, #34D399, #FF6B4A, #818CF8, #38BDF8)',
      },
    },
    { id: 'orange', label: 'Orange', bg: 'bg-[#FF4F00]' },
    { id: 'sage', label: 'Sage', bg: 'bg-[#A3B19B]' },
    { id: 'alabaster', label: 'Alabaster', bg: 'bg-[#F4F4F6]' },
  ];

  return (
    <header className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between z-30 transition-opacity duration-700 select-none">
      {/* Brand & Live LED */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-zinc-950/40 backdrop-blur-sm">
          <span
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{
              backgroundColor: isRunning ? 'var(--phase-color)' : '#52525B',
              boxShadow: isRunning ? '0 0 8px var(--phase-color)' : 'none',
            }}
          />
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-zinc-400 font-medium">
            BOX // BREATHE
          </span>
        </div>

        {cyclesCompleted > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/5 bg-zinc-950/20 text-zinc-500 font-mono text-[10px] tracking-wider uppercase">
            <span>CYCLE</span>
            <span className="text-zinc-200 tabular-nums font-semibold">{cyclesCompleted}</span>
          </div>
        )}
      </div>

      {/* Right Controls: Theme Swatches + Session Timer */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Accent Selector */}
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-white/5 bg-zinc-950/40 backdrop-blur-sm">
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              aria-label={`Switch theme to ${t.label}`}
              title={t.label}
              style={t.style}
              className={`w-3.5 h-3.5 rounded-full ${t.bg || ''} transition-all duration-150 relative ${
                theme === t.id
                  ? 'ring-2 ring-white/60 scale-110'
                  : 'opacity-40 hover:opacity-80 scale-90'
              }`}
            />
          ))}
        </div>

        {/* Tabular Session Timer */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 bg-zinc-950/40 backdrop-blur-sm">
          <span className="font-mono text-[10px] tracking-widest text-zinc-500 uppercase">
            TIME
          </span>
          <span className="font-mono text-xs tabular-nums text-zinc-200 font-medium tracking-tight">
            {formatElapsed(sessionElapsed)}
          </span>
        </div>
      </div>
    </header>
  );
};


