import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { BreathingState, PHASE_CONFIGS, Phase } from '../types/breathing';

interface BoxVisualizerProps {
  phase: Phase;
  state: BreathingState;
  phaseProgress: number; // 0.0 to 1.0
  totalBoxProgress: number; // 0.0 to 4.0
  secondsRemainingInPhase: number;
  formattedSecondsRemaining: {
    int: string;
    dec: string;
  };
  sideDuration: number;
  onTogglePlay?: () => void;
}

// EaseInOut cubic smoothstep
const smoothstep = (t: number): number => {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped * clamped * (3 - 2 * clamped);
};

export const BoxVisualizer: React.FC<BoxVisualizerProps> = ({
  phase,
  state,
  phaseProgress,
  totalBoxProgress,
  formattedSecondsRemaining,
  sideDuration,
  onTogglePlay,
}) => {
  const { getPhaseTheme } = useTheme();
  const phaseTheme = getPhaseTheme(phase, state === 'RUNNING');
  const activeColor = phaseTheme.hex;
  const activeGlow = phaseTheme.glow;

  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState<number>(1078.8);
  const [puckPos, setPuckPos] = useState<{ x: number; y: number }>({ x: 64, y: 40 });

  // Outer Box Dimensions in SVG viewbox (360 x 360)
  // Box spans from x: 40..320, y: 40..320, with corner radius rx: 24
  // Starting point: (64, 40) at top-left
  const pathD = `
    M 64 40
    L 296 40
    A 24 24 0 0 1 320 64
    L 320 296
    A 24 24 0 0 1 296 320
    L 64 320
    A 24 24 0 0 1 40 296
    L 40 64
    A 24 24 0 0 1 64 40
    Z
  `.trim();

  // Initialize total length
  useEffect(() => {
    if (pathRef.current) {
      const len = pathRef.current.getTotalLength();
      if (len > 0) {
        setPathLength(len);
      }
    }
  }, []);

  // Update puck coordinates on path continuously
  useEffect(() => {
    if (!pathRef.current) return;
    const progressFrac = (totalBoxProgress % 4.0) / 4.0;
    const distance = progressFrac * pathLength;
    try {
      const point = pathRef.current.getPointAtLength(distance);
      setPuckPos({ x: point.x, y: point.y });
    } catch {
      // fallback
    }
  }, [totalBoxProgress, pathLength]);

  // Compute Inner Core Expansion Scale (0.55 to 0.92)
  let coreScale = 0.55;
  const p = smoothstep(phaseProgress);

  if (state === 'IDLE') {
    coreScale = 0.55;
  } else if (phase === 'INHALE') {
    coreScale = 0.55 + (0.92 - 0.55) * p;
  } else if (phase === 'HOLD_IN') {
    // Gentle micro-pulse while holding full lungs
    const pulse = Math.sin(phaseProgress * Math.PI * 2) * 0.015;
    coreScale = 0.92 + pulse;
  } else if (phase === 'EXHALE') {
    coreScale = 0.92 - (0.92 - 0.55) * p;
  } else if (phase === 'HOLD_OUT') {
    // Rest empty
    coreScale = 0.55;
  }

  // Active stroke dash offset calculation
  const progressRatio = state === 'IDLE' ? 0 : (totalBoxProgress % 4.0) / 4.0;
  const strokeDashoffset = pathLength * (1 - progressRatio);

  const phaseConfig = PHASE_CONFIGS[phase];

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-full select-none">
      {/* 1. Action Header Above the Box (Fixed Height to Prevent Vertical Layout Shift) */}
      <div className="h-20 sm:h-28 flex flex-col items-center justify-center text-center px-4 select-none mb-1 sm:mb-3 shrink-0">
        <h2
          className="font-mono text-3xl sm:text-5xl lg:text-6xl font-light tracking-[0.25em] uppercase transition-colors duration-700"
          style={{
            color: activeColor,
            textShadow: state === 'RUNNING' ? `0 0 24px ${activeGlow}` : 'none',
          }}
        >
          {state === 'IDLE' ? 'READY' : phaseConfig.label}
        </h2>
        <p className="font-sans text-xs sm:text-sm text-zinc-400 tracking-wider font-normal mt-1.5 sm:mt-2 transition-opacity duration-500 max-w-xs sm:max-w-md">
          {state === 'IDLE' ? 'Tap box or press Space to start' : phaseConfig.instruction}
        </p>
      </div>

      {/* 2. Precision Box Visualizer Stage */}
      <div
        onClick={onTogglePlay}
        role="button"
        tabIndex={0}
        aria-label={state === 'RUNNING' ? 'Pause breathing session' : 'Start breathing session'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onTogglePlay?.();
          }
        }}
        className="relative flex flex-col items-center justify-center w-[min(320px,84vw,42dvh)] h-[min(320px,84vw,42dvh)] sm:w-[min(420px,76vw,46dvh)] sm:h-[min(420px,76vw,46dvh)] lg:w-[min(500px,65vw,50dvh)] lg:h-[min(500px,65vw,50dvh)] xl:w-[min(560px,60vw,54dvh)] xl:h-[min(560px,60vw,54dvh)] mx-auto p-2 sm:p-4 select-none cursor-pointer active:scale-[0.985] transition-transform duration-100 outline-none focus-visible:ring-1 focus-visible:ring-white/20 rounded-3xl"
      >
        {/* Precision corner ticks (outer bounding box markers) */}
        <div className="absolute top-1 left-1 sm:top-2 sm:left-2 w-3 sm:w-3.5 h-3 sm:h-3.5 border-t border-l border-white/20" />
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 w-3 sm:w-3.5 h-3 sm:h-3.5 border-t border-r border-white/20" />
        <div className="absolute bottom-1 left-1 sm:bottom-2 sm:left-2 w-3 sm:w-3.5 h-3 sm:h-3.5 border-b border-l border-white/20" />
        <div className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-3 sm:w-3.5 h-3 sm:h-3.5 border-b border-r border-white/20" />

        {/* Axis alignment crosshairs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-1.5 sm:h-2 bg-white/20" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-1.5 sm:h-2 bg-white/20" />
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-px w-1.5 sm:w-2 bg-white/20" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-px w-1.5 sm:w-2 bg-white/20" />

        {/* Main Precision SVG Canvas */}
        <div className="relative w-full h-full flex items-center justify-center">
          <svg
            viewBox="0 0 360 360"
            className="w-full h-full overflow-visible pointer-events-none"
            aria-hidden="true"
          >
            <defs>
              {/* Filter for glowing reticle puck */}
              <filter id="puckGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Filter for active glowing trace path */}
              <filter id="traceGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Dim background baseline track */}
            <path
              d={pathD}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="2"
              strokeLinecap="round"
            />

            {/* Subtle perimeter tick marks at 25%, 50%, 75% of each edge */}
            {/* Top Edge ticks */}
            <line x1="120" y1="36" x2="120" y2="44" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <line x1="180" y1="34" x2="180" y2="46" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <line x1="240" y1="36" x2="240" y2="44" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

            {/* Right Edge ticks */}
            <line x1="316" y1="120" x2="324" y2="120" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <line x1="314" y1="180" x2="326" y2="180" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <line x1="316" y1="240" x2="324" y2="240" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

            {/* Bottom Edge ticks */}
            <line x1="240" y1="316" x2="240" y2="324" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <line x1="180" y1="314" x2="180" y2="326" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <line x1="120" y1="316" x2="120" y2="324" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

            {/* Left Edge ticks */}
            <line x1="36" y1="240" x2="44" y2="240" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <line x1="34" y1="180" x2="46" y2="180" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <line x1="36" y1="120" x2="44" y2="120" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />

            {/* Active Glowing Path */}
            <path
              ref={pathRef}
              d={pathD}
              fill="none"
              stroke={activeColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={pathLength}
              strokeDashoffset={strokeDashoffset}
              filter="url(#traceGlow)"
              className="transition-[stroke] duration-700 ease-out"
            />

            {/* Active Glowing Reticle Puck */}
            <g transform={`translate(${puckPos.x}, ${puckPos.y})`}>
              {/* Outer soft glow ring */}
              <circle
                r="7"
                fill={activeColor}
                opacity="0.35"
                filter="url(#puckGlow)"
                className="transition-[fill] duration-700 ease-out"
              />
              {/* Crisp center pip */}
              <circle
                r="3.5"
                fill="#FFFFFF"
                stroke={activeColor}
                strokeWidth="1.5"
                className="transition-[stroke] duration-700 ease-out"
              />
            </g>
          </svg>

          {/* Inner Breathing Core Layer (Diaphragm Glassmorphism) */}
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none will-change-transform"
            style={{
              transform: `scale(${coreScale})`,
              transition: state === 'IDLE' ? 'transform 0.5s ease-out' : 'none',
            }}
          >
            {/* Layer 1: Frosted Ambient Glow */}
            <div
              className="w-44 h-44 sm:w-60 sm:h-60 rounded-[24px] sm:rounded-[32px] border border-white/10 backdrop-blur-md flex items-center justify-center transition-all duration-700"
              style={{
                background: `radial-gradient(circle at center, ${activeColor}22 0%, rgba(18, 18, 21, 0.75) 75%)`,
                boxShadow: `0 0 45px ${activeGlow}`,
              }}
            >
              {/* Layer 2: Inner Chamfered Ring */}
              <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-[18px] sm:rounded-[24px] border border-white/10 flex items-center justify-center bg-black/20" />
            </div>
          </div>

          {/* Center Precision HUD Readout (Clean Countdown & Seconds) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none text-center px-4">
            {state === 'IDLE' ? (
              <div className="flex flex-col items-center gap-1">
                <div className="flex items-baseline font-mono font-extralight text-zinc-100 tabular-nums tracking-tighter leading-none">
                  <span className="text-6xl sm:text-8xl">{sideDuration.toFixed(0)}</span>
                  <span className="text-xl sm:text-2xl text-zinc-500 font-normal ml-1">s</span>
                </div>
                <span className="font-mono text-[10px] sm:text-xs uppercase tracking-[0.2em] text-zinc-400 mt-1">
                  {sideDuration * 4}s / cycle
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="flex items-baseline font-mono font-extralight text-zinc-100 tabular-nums tracking-tighter leading-none">
                  <span className="text-6xl sm:text-8xl sm:leading-none">
                    {formattedSecondsRemaining.dec}
                  </span>
                  <span className="text-xl sm:text-2xl text-zinc-500 font-normal ml-1">s</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

