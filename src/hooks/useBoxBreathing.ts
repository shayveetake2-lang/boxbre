import { useCallback, useEffect, useRef, useState } from 'react';
import { BreathingState, ORDERED_PHASES, Phase, SessionDurationPreset } from '../types/breathing';

export interface UseBoxBreathingOptions {
  initialSideDuration?: number; // default 4s
  initialTargetDuration?: SessionDurationPreset; // default 'infinite'
  onPhaseChange?: (phase: Phase) => void;
  onSecondTick?: (second: number) => void;
  onSessionComplete?: () => void;
}

export interface UseBoxBreathingReturn {
  state: BreathingState;
  phase: Phase;
  phaseProgress: number; // 0.0 to 1.0
  totalBoxProgress: number; // 0.0 to 4.0
  secondsRemainingInPhase: number;
  formattedSecondsRemaining: {
    int: string;
    dec: string;
  };
  completedCycles: number;
  sessionElapsed: number; // seconds
  sideDuration: number;
  targetDuration: SessionDurationPreset;
  start: () => void;
  pause: () => void;
  togglePlay: () => void;
  reset: () => void;
  updateSideDuration: (seconds: number) => void;
  setTargetDuration: (duration: SessionDurationPreset) => void;
}

export const useBoxBreathing = (options: UseBoxBreathingOptions = {}): UseBoxBreathingReturn => {
  const {
    initialSideDuration = 4,
    initialTargetDuration = 'infinite',
    onPhaseChange,
    onSecondTick,
    onSessionComplete,
  } = options;

  const [state, setState] = useState<BreathingState>('IDLE');
  const [phase, setPhase] = useState<Phase>('INHALE');
  const [phaseProgress, setPhaseProgress] = useState<number>(0);
  const [totalBoxProgress, setTotalBoxProgress] = useState<number>(0);
  const [secondsRemainingInPhase, setSecondsRemainingInPhase] = useState<number>(initialSideDuration);
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [sessionElapsed, setSessionElapsed] = useState<number>(0);
  const [sideDuration, setSideDuration] = useState<number>(initialSideDuration);
  const [targetDuration, setTargetDurationState] = useState<SessionDurationPreset>(initialTargetDuration);

  // Timing references for zero-drift RAF loop
  const rafIdRef = useRef<number | null>(null);
  const sessionStartTimeRef = useRef<number>(0);
  const totalPausedDurationRef = useRef<number>(0);
  const pauseStartTimeRef = useRef<number>(0);
  const lastPhaseIndexRef = useRef<number>(0);
  const lastSecondRef = useRef<number>(-1);
  const sideDurationRef = useRef<number>(initialSideDuration);
  const targetDurationRef = useRef<SessionDurationPreset>(initialTargetDuration);
  const stateRef = useRef<BreathingState>('IDLE');

  // Callback refs to prevent re-attaching listeners
  const onPhaseChangeRef = useRef(onPhaseChange);
  const onSecondTickRef = useRef(onSecondTick);
  const onSessionCompleteRef = useRef(onSessionComplete);

  useEffect(() => {
    onPhaseChangeRef.current = onPhaseChange;
    onSecondTickRef.current = onSecondTick;
    onSessionCompleteRef.current = onSessionComplete;
  }, [onPhaseChange, onSecondTick, onSessionComplete]);

  useEffect(() => {
    sideDurationRef.current = sideDuration;
  }, [sideDuration]);

  useEffect(() => {
    targetDurationRef.current = targetDuration;
  }, [targetDuration]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // Main animation frame tick function
  const tick = useCallback(() => {
    if (stateRef.current !== 'RUNNING') return;

    const now = performance.now();
    const activeElapsedMs = Math.max(
      0,
      now - sessionStartTimeRef.current - totalPausedDurationRef.current
    );

    const currentSideDuration = sideDurationRef.current;
    const phaseDurationMs = currentSideDuration * 1000;
    const cycleDurationMs = phaseDurationMs * 4;

    // Total session elapsed time
    const totalElapsedSeconds = activeElapsedMs / 1000;
    setSessionElapsed(totalElapsedSeconds);

    // Check target session duration
    const currentTarget = targetDurationRef.current;
    if (currentTarget !== 'infinite' && totalElapsedSeconds >= currentTarget) {
      setState('PAUSED');
      stateRef.current = 'PAUSED';
      onSessionCompleteRef.current?.();
      return;
    }

    // Cycle & Phase calculations
    const cycles = Math.floor(activeElapsedMs / cycleDurationMs);
    const cycleElapsedMs = activeElapsedMs % cycleDurationMs;
    const phaseIndex = Math.min(3, Math.floor(cycleElapsedMs / phaseDurationMs));
    const phaseElapsedMs = cycleElapsedMs % phaseDurationMs;
    const progress = Math.min(1.0, Math.max(0.0, phaseElapsedMs / phaseDurationMs));
    const remainingMs = Math.max(0, phaseDurationMs - phaseElapsedMs);
    const remainingSeconds = remainingMs / 1000;

    // Detect phase transition
    if (phaseIndex !== lastPhaseIndexRef.current) {
      lastPhaseIndexRef.current = phaseIndex;
      const newPhase = ORDERED_PHASES[phaseIndex];
      setPhase(newPhase);
      onPhaseChangeRef.current?.(newPhase);
    }

    // Detect integer second ticks
    const currentCeilSecond = Math.ceil(remainingSeconds);
    if (currentCeilSecond !== lastSecondRef.current) {
      lastSecondRef.current = currentCeilSecond;
      onSecondTickRef.current?.(currentCeilSecond);
    }

    setCompletedCycles(cycles);
    setPhaseProgress(progress);
    setTotalBoxProgress(phaseIndex + progress);
    setSecondsRemainingInPhase(remainingSeconds);

    rafIdRef.current = requestAnimationFrame(tick);
  }, []);

  // Controls: Start
  const start = useCallback(() => {
    if (stateRef.current === 'RUNNING') return;

    const now = performance.now();
    if (stateRef.current === 'PAUSED') {
      // Resume from paused offset
      const pauseDuration = now - pauseStartTimeRef.current;
      totalPausedDurationRef.current += pauseDuration;
    } else {
      // Clean start from idle
      sessionStartTimeRef.current = now;
      totalPausedDurationRef.current = 0;
      lastPhaseIndexRef.current = 0;
      lastSecondRef.current = -1;
      setPhase('INHALE');
      onPhaseChangeRef.current?.('INHALE');
    }

    setState('RUNNING');
    stateRef.current = 'RUNNING';
    rafIdRef.current = requestAnimationFrame(tick);
  }, [tick]);

  // Controls: Pause
  const pause = useCallback(() => {
    if (stateRef.current !== 'RUNNING') return;

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    pauseStartTimeRef.current = performance.now();
    setState('PAUSED');
    stateRef.current = 'PAUSED';
  }, []);

  // Controls: Toggle Play
  const togglePlay = useCallback(() => {
    if (stateRef.current === 'RUNNING') {
      pause();
    } else {
      start();
    }
  }, [pause, start]);

  // Controls: Reset
  const reset = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    sessionStartTimeRef.current = 0;
    totalPausedDurationRef.current = 0;
    pauseStartTimeRef.current = 0;
    lastPhaseIndexRef.current = 0;
    lastSecondRef.current = -1;

    setState('IDLE');
    stateRef.current = 'IDLE';
    setPhase('INHALE');
    setPhaseProgress(0);
    setTotalBoxProgress(0);
    setSecondsRemainingInPhase(sideDurationRef.current);
    setCompletedCycles(0);
    setSessionElapsed(0);
  }, []);

  // Controls: Update Side Duration with smooth progress preservation
  const updateSideDuration = useCallback(
    (newSeconds: number) => {
      const clamped = Math.max(2, Math.min(15, Math.round(newSeconds)));
      if (clamped === sideDurationRef.current) return;

      const oldDuration = sideDurationRef.current;
      sideDurationRef.current = clamped;
      setSideDuration(clamped);

      if (stateRef.current === 'IDLE') {
        setSecondsRemainingInPhase(clamped);
      } else {
        // Adjust sessionStartTimeRef to preserve exact current phase progress without visual jitter
        const now = performance.now();
        const activeElapsedMs =
          stateRef.current === 'RUNNING'
            ? now - sessionStartTimeRef.current - totalPausedDurationRef.current
            : pauseStartTimeRef.current - sessionStartTimeRef.current - totalPausedDurationRef.current;

        const oldPhaseDurationMs = oldDuration * 1000;
        const oldCycleDurationMs = oldPhaseDurationMs * 4;
        const currentCycles = Math.floor(activeElapsedMs / oldCycleDurationMs);
        const currentCycleElapsed = activeElapsedMs % oldCycleDurationMs;
        const currentPhaseIdx = Math.floor(currentCycleElapsed / oldPhaseDurationMs);
        const currentPhaseProgress = (currentCycleElapsed % oldPhaseDurationMs) / oldPhaseDurationMs;

        const newPhaseDurationMs = clamped * 1000;
        const newCycleDurationMs = newPhaseDurationMs * 4;
        const newActiveElapsedMs =
          currentCycles * newCycleDurationMs +
          currentPhaseIdx * newPhaseDurationMs +
          currentPhaseProgress * newPhaseDurationMs;

        if (stateRef.current === 'RUNNING') {
          sessionStartTimeRef.current = now - totalPausedDurationRef.current - newActiveElapsedMs;
        } else {
          sessionStartTimeRef.current = pauseStartTimeRef.current - totalPausedDurationRef.current - newActiveElapsedMs;
        }
      }
    },
    []
  );

  const setTargetDuration = useCallback((duration: SessionDurationPreset) => {
    setTargetDurationState(duration);
    targetDurationRef.current = duration;
  }, []);

  // Handle Page Visibility API: ensure clock continuity when switching tabs
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab backgrounded: RAF throttles automatically. We record background time.
      } else {
        // Tab foregrounded: if running, RAF resumes with performance.now() keeping exact time
        if (stateRef.current === 'RUNNING') {
          if (rafIdRef.current !== null) {
            cancelAnimationFrame(rafIdRef.current);
          }
          rafIdRef.current = requestAnimationFrame(tick);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [tick]);

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  // Formatted seconds
  const formattedSecondsRemaining = {
    int: Math.ceil(secondsRemainingInPhase).toString(),
    dec: secondsRemainingInPhase.toFixed(1),
  };

  return {
    state,
    phase,
    phaseProgress,
    totalBoxProgress,
    secondsRemainingInPhase,
    formattedSecondsRemaining,
    completedCycles,
    sessionElapsed,
    sideDuration,
    targetDuration,
    start,
    pause,
    togglePlay,
    reset,
    updateSideDuration,
    setTargetDuration,
  };
};

