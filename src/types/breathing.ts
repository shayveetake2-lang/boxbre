export type Phase = 'INHALE' | 'HOLD_IN' | 'EXHALE' | 'HOLD_OUT';

export type BreathingState = 'IDLE' | 'RUNNING' | 'PAUSED';

export type AccentTheme = 'dynamic' | 'orange' | 'sage' | 'alabaster';

export type SessionDurationPreset = 120 | 300 | 600 | 'infinite';

export interface PhaseColorConfig {
  hex: string;
  glow: string;
  ambient: string;
}

export interface PhaseConfig {
  name: Phase;
  label: string;
  side: 'top' | 'right' | 'bottom' | 'left';
  instruction: string;
  color: PhaseColorConfig;
}

export const IDLE_COLOR_CONFIG: PhaseColorConfig = {
  hex: '#E4E4E7',
  glow: 'rgba(228, 228, 231, 0.20)',
  ambient: 'rgba(228, 228, 231, 0.04)',
};

export const PHASE_CONFIGS: Record<Phase, PhaseConfig> = {
  INHALE: {
    name: 'INHALE',
    label: 'INHALE',
    side: 'top',
    instruction: 'Fill lungs slowly through nose',
    color: {
      hex: '#38BDF8',
      glow: 'rgba(56, 189, 248, 0.45)',
      ambient: 'rgba(56, 189, 248, 0.12)',
    },
  },
  HOLD_IN: {
    name: 'HOLD_IN',
    label: 'HOLD FULL',
    side: 'right',
    instruction: 'Maintain expansion, relax shoulders',
    color: {
      hex: '#34D399',
      glow: 'rgba(52, 211, 153, 0.45)',
      ambient: 'rgba(52, 211, 153, 0.12)',
    },
  },
  EXHALE: {
    name: 'EXHALE',
    label: 'EXHALE',
    side: 'bottom',
    instruction: 'Release air steadily and completely',
    color: {
      hex: '#FF6B4A',
      glow: 'rgba(255, 107, 74, 0.45)',
      ambient: 'rgba(255, 107, 74, 0.12)',
    },
  },
  HOLD_OUT: {
    name: 'HOLD_OUT',
    label: 'HOLD EMPTY',
    side: 'left',
    instruction: 'Rest in stillness before the next breath',
    color: {
      hex: '#818CF8',
      glow: 'rgba(129, 140, 248, 0.40)',
      ambient: 'rgba(129, 140, 248, 0.10)',
    },
  },
};

export const ORDERED_PHASES: Phase[] = ['INHALE', 'HOLD_IN', 'EXHALE', 'HOLD_OUT'];


