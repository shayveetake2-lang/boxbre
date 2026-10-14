import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Minus,
  Plus,
  Clock,
  Sparkles,
  ChevronUp,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { BreathingState, SessionDurationPreset } from '../types/breathing';

interface ControlsDockProps {
  state: BreathingState;
  sideDuration: number;
  targetDuration: SessionDurationPreset;
  isMuted: boolean;
  isTickEnabled: boolean;
  sessionElapsed: number;
  onTogglePlay: () => void;
  onReset: () => void;
  onUpdateSideDuration: (sec: number) => void;
  onSetTargetDuration: (dur: SessionDurationPreset) => void;
  onToggleMute: () => void;
  onToggleTick: () => void;
  isZenActive: boolean;
}

export const ControlsDock: React.FC<ControlsDockProps> = ({
  state,
  sideDuration,
  targetDuration,
  isMuted,
  isTickEnabled,
  sessionElapsed,
  onTogglePlay,
  onReset,
  onUpdateSideDuration,
  onSetTargetDuration,
  onToggleMute,
  onToggleTick,
  isZenActive,
}) => {
  const { accentColor } = useTheme();
  const [showDrawer, setShowDrawer] = useState(false);

  const presets = [
    { sec: 4, label: 'Standard' },
    { sec: 5, label: 'Deep' },
    { sec: 7, label: 'Advanced' },
  ];

  const durationOptions: { dur: SessionDurationPreset; label: string }[] = [
    { dur: 120, label: '2m' },
    { dur: 300, label: '5m' },
    { dur: 600, label: '10m' },
    { dur: 'infinite', label: '∞' },
  ];

  // Calculate target progress percentage
  let targetProgressPercent = 0;
  if (targetDuration !== 'infinite') {
    targetProgressPercent = Math.min(100, (sessionElapsed / targetDuration) * 100);
  }

  return (
    <footer
      className={`fixed bottom-[max(1.25rem,env(safe-area-inset-bottom,1.25rem))] left-1/2 -translate-x-1/2 z-30 transition-all duration-700 w-full max-w-fit px-3 sm:px-4 ${
        isZenActive
          ? 'opacity-15 hover:opacity-100'
          : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center gap-1.5 sm:gap-2">
        {/* Expandable Drawer for Presets & Target Duration */}
        {showDrawer && (
          <div className="w-full max-w-sm sm:max-w-md mb-1 backdrop-blur-xl bg-zinc-950/85 border border-white/10 rounded-2xl p-3 sm:p-4 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            {/* Quick Presets */}
            <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-white/5">
              <span className="font-mono text-[9px] sm:text-[10px] tracking-widest text-zinc-400 uppercase">
                PACE PRESETS
              </span>
              <div className="flex items-center gap-1 sm:gap-1.5">
                {presets.map((p) => (
                  <button
                    key={p.sec}
                    onClick={() => onUpdateSideDuration(p.sec)}
                    className={`px-2 sm:px-2.5 py-1 rounded-full font-mono text-[10px] sm:text-[11px] min-h-[32px] sm:min-h-auto transition-all ${
                      sideDuration === p.sec
                        ? 'bg-white/15 text-white font-medium border border-white/20'
                        : 'bg-white/5 text-zinc-400 hover:text-white border border-transparent'
                    }`}
                  >
                    {p.sec}s <span className="text-[8px] sm:text-[9px] opacity-60 font-sans">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Session Duration Selector */}
            <div className="flex items-center justify-between pt-2.5 sm:pt-3">
              <span className="font-mono text-[9px] sm:text-[10px] tracking-widest text-zinc-400 uppercase">
                EXERCISE TARGET
              </span>
              <div className="flex items-center gap-1 sm:gap-1.5">
                {durationOptions.map((opt) => (
                  <button
                    key={String(opt.dur)}
                    onClick={() => onSetTargetDuration(opt.dur)}
                    className={`px-2.5 sm:px-3 py-1 rounded-full font-mono text-[10px] sm:text-[11px] min-h-[32px] sm:min-h-auto transition-all ${
                      targetDuration === opt.dur
                        ? 'bg-white/15 text-white font-medium border border-white/20'
                        : 'bg-white/5 text-zinc-400 hover:text-white border border-transparent'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Floating Main Capsule Dock */}
        <div className="backdrop-blur-md bg-zinc-900/70 border border-white/10 rounded-full px-3 py-2 sm:px-5 sm:py-2.5 flex items-center gap-2 sm:gap-4 shadow-2xl">
          {/* Side Duration Stepper */}
          <div className="flex items-center gap-1.5 sm:gap-2 pr-2 sm:pr-3 border-r border-white/10">
            <button
              onClick={() => onUpdateSideDuration(sideDuration - 1)}
              disabled={sideDuration <= 2}
              className="tactile-button w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none border border-white/5 flex items-center justify-center text-zinc-300"
              aria-label="Decrease side duration"
            >
              <Minus className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
            </button>

            <div className="flex flex-col items-center min-w-[44px] sm:min-w-[50px]">
              <span className="font-mono text-xs sm:text-sm tabular-nums font-medium text-zinc-100">
                {sideDuration.toFixed(1)}s
              </span>
              <span className="font-mono text-[8px] sm:text-[9px] text-zinc-500 tabular-nums tracking-tighter">
                {sideDuration * 4}s/box
              </span>
            </div>

            <button
              onClick={() => onUpdateSideDuration(sideDuration + 1)}
              disabled={sideDuration >= 15}
              className="tactile-button w-8 h-8 sm:w-7 sm:h-7 rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:pointer-events-none border border-white/5 flex items-center justify-center text-zinc-300"
              aria-label="Increase side duration"
            >
              <Plus className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
            </button>
          </div>

          {/* Primary Play / Pause Button */}
          <button
            onClick={onTogglePlay}
            className="tactile-button relative w-11 h-11 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-200"
            style={{
              backgroundColor: accentColor,
              boxShadow: `0 0 18px ${accentColor}45`,
            }}
            aria-label={state === 'RUNNING' ? 'Pause session' : 'Start breathing session'}
          >
            {state === 'RUNNING' ? (
              <Pause className="w-4 h-4 fill-black text-black" />
            ) : (
              <Play className="w-4 h-4 fill-black text-black ml-0.5" />
            )}
          </button>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="tactile-button w-9 h-9 sm:w-8 sm:h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            aria-label="Reset session"
            title="Reset (R)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Audio Mute Switch */}
          <button
            onClick={onToggleMute}
            className={`tactile-button w-9 h-9 sm:w-8 sm:h-8 rounded-full border border-white/5 flex items-center justify-center transition-colors ${
              isMuted
                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white'
            }`}
            aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
            title="Audio (M)"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          {/* Metronome Watch Tick Toggle */}
          <button
            onClick={onToggleTick}
            className={`tactile-button w-9 h-9 sm:w-8 sm:h-8 rounded-full border border-white/5 flex items-center justify-center transition-colors ${
              isTickEnabled
                ? 'bg-white/20 text-white'
                : 'bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-zinc-300'
            }`}
            aria-label={isTickEnabled ? 'Disable 1s metronome tick' : 'Enable 1s metronome tick'}
            title="1s Metronome Tick"
          >
            <Clock className="w-3.5 h-3.5" />
          </button>

          {/* Settings Drawer Toggle */}
          <button
            onClick={() => setShowDrawer(!showDrawer)}
            className={`tactile-button w-8 h-8 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-transform ${
              showDrawer ? 'rotate-180 text-white bg-white/10' : 'text-zinc-500 hover:text-zinc-300'
            }`}
            aria-label="Toggle settings drawer"
            title="Pace presets and target duration"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          {/* Zen Mode Status Indicator (Desktop only) */}
          <div className="hidden lg:flex items-center gap-1 pl-2 text-zinc-500 font-mono text-[9px] tracking-wider uppercase border-l border-white/10">
            <Sparkles className="w-2.5 h-2.5 text-zinc-400" />
            <span>ZEN</span>
          </div>
        </div>

        {/* Target Progress Bar (if timed session active) */}
        {targetDuration !== 'infinite' && (
          <div className="w-40 sm:w-48 h-1 bg-white/5 rounded-full overflow-hidden mt-0.5 border border-white/5">
            <div
              className="h-full transition-all duration-300 rounded-full"
              style={{
                width: `${targetProgressPercent}%`,
                backgroundColor: accentColor,
              }}
            />
          </div>
        )}
      </div>
    </footer>
  );
};
