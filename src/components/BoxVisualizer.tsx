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
}) => {
  const { accentColor, accentGlow } = useTheme();

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
    <div className="relative flex flex-col items-center justify-center w-full max-w-[420px] aspect-square mx-auto p-4 select-none">
      {/* Precision corner ticks (outer bounding box markers) */}
      <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t border-l border-white/20" />
      <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t border-r border-white/20" />
      <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b border-l border-white/20" />
      <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b border-r border-white/20" />

      {/* Axis alignment crosshairs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-2 bg-white/20" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-2 bg-white/20" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 h-px w-2 bg-white/20" />
      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-px w-2 bg-white/20" />

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
            stroke={accentColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={pathLength}
            strokeDashoffset={strokeDashoffset}
            filter="url(#traceGlow)"
            className="transition-[stroke] duration-300"
          />

          {/* Active Glowing Reticle Puck */}
          <g transform={`translate(${puckPos.x}, ${puckPos.y})`}>
            {/* Outer soft glow ring */}
            <circle
              r="7"
              fill={accentColor}
              opacity="0.35"
              filter="url(#puckGlow)"
            />
            {/* Crisp center pip */}
            <circle
              r="3.5"
              fill="#FFFFFF"
              stroke={accentColor}
              strokeWidth="1.5"
            />
          </g>
        </svg>

        {/* Inner Breathing Core Layer (Diaphragm Glassmorphism) */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{
            transform: `scale(${coreScale})`,
            transition: state === 'IDLE' ? 'transform 0.5s ease-out' : 'none',
          }}
        >
          {/* Layer 1: Frosted Ambient Glow */}
          <div
            className="w-56 h-56 rounded-[28px] border border-white/10 backdrop-blur-md flex items-center justify-center transition-colors duration-500"
            style={{
              background: `radial-gradient(circle at center, ${accentColor}18 0%, rgba(18, 18, 21, 0.75) 75%)`,
              boxShadow: `0 0 40px ${accentGlow}`,
            }}
          >
            {/* Layer 2: Inner Chamfered Ring */}
            <div className="w-40 h-40 rounded-[20px] border border-white/10 flex items-center justify-center bg-black/20" />
          </div>
        </div>

        {/* Center Precision HUD Readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none text-center">
          {/* Phase Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-white/10 bg-zinc-950/70 backdrop-blur-md mb-2 shadow-sm">
            <span
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor: state === 'RUNNING' ? accentColor : '#71717A',
                boxShadow: state === 'RUNNING' ? `0 0 8px ${accentColor}` : 'none',
              }}
            />
            <span className="font-mono text-[11px] tracking-[0.25em] uppercase font-semibold text-zinc-300">
              {state === 'IDLE' ? 'READY' : phaseConfig.label}
            </span>
          </div>

          {/* Large Tabular Monospace Number */}
          <div className="flex items-baseline font-mono font-light text-zinc-100 tabular-nums tracking-tighter leading-none my-1">
            <span className="text-6xl sm:text-7xl font-extralight">
              {state === 'IDLE'
                ? sideDuration.toFixed(0)
                : formattedSecondsRemaining.dec}
            </span>
            <span className="text-lg text-zinc-500 font-normal ml-1">s</span>
          </div>

          {/* Micro-Instruction */}
          <p className="font-sans text-[11px] text-zinc-400 font-normal tracking-wide max-w-[200px] mt-2 transition-opacity duration-300">
            {state === 'IDLE' ? 'Press Start or Space' : phaseConfig.instruction}
          </p>
        </div>
      </div>
    </div>
  );
};

