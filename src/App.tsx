import React, { useCallback } from 'react';
import { TopBar } from './components/TopBar';
import { NoiseOverlay } from './components/NoiseOverlay';
import { BoxVisualizer } from './components/BoxVisualizer';
import { ControlsDock } from './components/ControlsDock';
import { useBoxBreathing } from './hooks/useBoxBreathing';
import { useSoundEngine } from './hooks/useSoundEngine';
import { useInactivity } from './hooks/useInactivity';
import { useWakeLock } from './hooks/useWakeLock';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export const App: React.FC = () => {
  // Sound engine
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
    <div className="relative w-screen h-screen bg-[#09090B] text-[#F4F4F6] flex flex-col justify-between overflow-hidden">
      {/* Subtle Analog Film Texture */}
      <NoiseOverlay />

      {/* Top Status Bar (fades in Zen Mode) */}
      <div
        className={`w-full transition-opacity duration-700 z-30 ${
          isZenInactive ? 'opacity-15 hover:opacity-100' : 'opacity-100'
        }`}
      >
        <TopBar
          sessionElapsed={breathing.sessionElapsed}
          isRunning={isRunning}
          cyclesCompleted={breathing.completedCycles}
        />
      </div>

      {/* Central Precision Visualizer Stage (~80% Viewport Height) */}
      <main className="flex-1 w-full flex items-center justify-center relative z-10 px-4">
        <BoxVisualizer
          phase={breathing.phase}
          state={breathing.state}
          phaseProgress={breathing.phaseProgress}
          totalBoxProgress={breathing.totalBoxProgress}
          secondsRemainingInPhase={breathing.secondsRemainingInPhase}
          formattedSecondsRemaining={breathing.formattedSecondsRemaining}
          sideDuration={breathing.sideDuration}
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

