export type Phase = 'INHALE' | 'HOLD_IN' | 'EXHALE' | 'HOLD_OUT';

export type BreathingState = 'IDLE' | 'RUNNING' | 'PAUSED';

export type AccentTheme = 'orange' | 'sage' | 'alabaster';

export type SessionDurationPreset = 120 | 300 | 600 | 'infinite';

export interface PhaseConfig {
  name: Phase;
  label: string;
  side: 'top' | 'right' | 'bottom' | 'left';
  instruction: string;
}

export const PHASE_CONFIGS: Record<Phase, PhaseConfig> = {
  INHALE: {
    name: 'INHALE',
    label: 'INHALE',
    side: 'top',
    instruction: 'Fill lungs slowly through nose',
  },
  HOLD_IN: {
    name: 'HOLD_IN',
    label: 'HOLD',
    side: 'right',
    instruction: 'Suspend breath with full lungs',
  },
  EXHALE: {
    name: 'EXHALE',
    label: 'EXHALE',
    side: 'bottom',
    instruction: 'Release breath gently through mouth',
  },
  HOLD_OUT: {
    name: 'HOLD_OUT',
    label: 'HOLD',
    side: 'left',
    instruction: 'Rest empty before next breath',
  },
};

export const ORDERED_PHASES: Phase[] = ['INHALE', 'HOLD_IN', 'EXHALE', 'HOLD_OUT'];

