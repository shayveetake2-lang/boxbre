import React, { useCallback, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { NoiseOverlay } from './components/NoiseOverlay';
import { BoxVisualizer } from './components/BoxVisualizer';
import { ControlsDock } from './components/ControlsDock';
import { useBoxBreathing } from './hooks/useBoxBreathing';
import { useSoundEngine } from './hooks/useSoundEngine';
import { useInactivity } from './hooks/useInactivity';
import { useWakeLock } from './hooks/useWakeLock';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTheme } from './context/ThemeContext';

export const App: React.FC = () => {
  const { getPhaseTheme } = useTheme();

  // Sound engine with iOS Safari proactive unlocking
  const soundEngine = useSoundEngine();

  // Box Breathing deterministic engine
  const breathing = useBoxBreathing({
    initialSideDuration: 4,
    initialTargetDuration: 'infinite',
    onPhaseChange: (phase) => {
      soundEngine.playPhaseCue(phase);
    },
    onSecondTick: () => {
      soundEngine.playTick();
    },
  });

  const isRunning = breathing.state === 'RUNNING';
  const phaseTheme = getPhaseTheme(breathing.phase, isRunning);

  // Synchronize CSS variables for phase reactive elements
  useEffect(() => {
    document.documentElement.style.setProperty('--phase-color', phaseTheme.hex);
    document.documentElement.style.setProperty('--phase-glow', phaseTheme.glow);
    document.documentElement.style.setProperty('--phase-ambient', phaseTheme.ambient);
  }, [phaseTheme]);

  // Hardware-accelerated ambient scaling
  const p = breathing.phaseProgress * breathing.phaseProgress * (3 - 2 * breathing.phaseProgress);
  let ambientScale = 1.0;
  if (breathing.state === 'IDLE') {
    ambientScale = 1.0;
  } else if (breathing.phase === 'INHALE') {
    ambientScale = 0.95 + 0.35 * p;
  } else if (breathing.phase === 'HOLD_IN') {
    ambientScale = 1.30;
  } else if (breathing.phase === 'EXHALE') {
    ambientScale = 1.30 - 0.35 * p;
  } else if (breathing.phase === 'HOLD_OUT') {
    ambientScale = 0.95;
  }

  // Zen Mode: auto-fade HUD after 3 seconds of inactivity while running
  const isZenInactive = useInactivity(isRunning, 3000);

  // Screen WakeLock API: prevent display sleep during session
  useWakeLock(isRunning);

  // Keyboard Shortcuts: Space (Play/Pause), R (Reset), M (Mute), Up/Down (Pace)
  const handleIncreaseSide = useCallback(() => {
    breathing.updateSideDuration(breathing.sideDuration + 1);
  }, [breathing]);

  const handleDecreaseSide = useCallback(() => {
    breathing.updateSideDuration(breathing.sideDuration - 1);
  }, [breathing]);

  useKeyboardShortcuts({
    onTogglePlay: breathing.togglePlay,
    onReset: breathing.reset,
    onToggleMute: soundEngine.toggleMute,
    onIncreaseSideDuration: handleIncreaseSide,
    onDecreaseSideDuration: handleDecreaseSide,
    onToggleTick: soundEngine.toggleTick,
  });

  return (
    <div className="relative w-screen h-[100dvh] min-h-[100dvh] max-h-[100dvh] bg-[#09090B] text-[#F4F4F6] flex flex-col justify-between overflow-hidden select-none overscroll-none touch-manipulation pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]">
      {/* Zero-Jank Hardware-Accelerated Ambient Aura Backdrop */}
      <div
        className="fixed inset-0 pointer-events-none -z-10 overflow-hidden will-change-transform"
        style={{
          transform: `scale(${ambientScale})`,
          transition: isRunning ? 'none' : 'transform 0.8s ease-out',
        }}
        aria-hidden="true"
      >
        <div
          className="w-full h-full transition-[background] duration-700 ease-out"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${phaseTheme.ambient} 0%, transparent 68%)`,
          }}
        />
      </div>

      {/* Subtle Analog Film Texture */}
      <NoiseOverlay />

      {/* Top Status Bar (fades in Zen Mode) */}
      <div
        className={`w-full transition-opacity duration-700 z-30 shrink-0 ${
          isZenInactive ? 'opacity-15 hover:opacity-100' : 'opacity-100'
        }`}
      >
        <TopBar
          sessionElapsed={breathing.sessionElapsed}
          isRunning={isRunning}
          cyclesCompleted={breathing.completedCycles}
        />
      </div>

      {/* Central Precision Visualizer Stage (Interactive tap-to-toggle) */}
      <main className="flex-1 w-full flex flex-col items-center justify-center relative z-10 px-2 sm:px-4 my-auto overflow-hidden">
        <BoxVisualizer
          phase={breathing.phase}
          state={breathing.state}
          phaseProgress={breathing.phaseProgress}
          totalBoxProgress={breathing.totalBoxProgress}
          secondsRemainingInPhase={breathing.secondsRemainingInPhase}
          formattedSecondsRemaining={breathing.formattedSecondsRemaining}
          sideDuration={breathing.sideDuration}
          onTogglePlay={breathing.togglePlay}
        />
      </main>

      {/* Floating Bottom Control Dock */}
      <ControlsDock
        state={breathing.state}
        sideDuration={breathing.sideDuration}
        targetDuration={breathing.targetDuration}
        isMuted={soundEngine.isMuted}
        isTickEnabled={soundEngine.isTickEnabled}
        sessionElapsed={breathing.sessionElapsed}
        onTogglePlay={breathing.togglePlay}
        onReset={breathing.reset}
        onUpdateSideDuration={breathing.updateSideDuration}
        onSetTargetDuration={breathing.setTargetDuration}
        onToggleMute={soundEngine.toggleMute}
        onToggleTick={soundEngine.toggleTick}
        isZenActive={isZenInactive}
      />
    </div>
  );
};

export default App;
