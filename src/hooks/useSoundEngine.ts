import { useCallback, useEffect, useRef, useState } from 'react';
import { Phase } from '../types/breathing';

export interface UseSoundEngineReturn {
  isMuted: boolean;
  isTickEnabled: boolean;
  toggleMute: () => void;
  toggleTick: () => void;
  playPhaseCue: (phase: Phase) => void;
  playTick: () => void;
  initAudio: () => void;
}

export const useSoundEngine = (): UseSoundEngineReturn => {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('boxbre-muted');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [isTickEnabled, setIsTickEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('boxbre-tick');
      return saved ? JSON.parse(saved) : false; // Default OFF
    } catch {
      return false;
    }
  });

  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);

  // Initialize Audio Context on user gesture
  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();

      // Master Compressor to prevent any clipping/distortion
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.setValueAtTime(-12, ctx.currentTime);
      compressor.knee.setValueAtTime(10, ctx.currentTime);
      compressor.ratio.setValueAtTime(4, ctx.currentTime);
      compressor.attack.setValueAtTime(0.003, ctx.currentTime);
      compressor.release.setValueAtTime(0.25, ctx.currentTime);

      // Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMuted ? 0 : 0.35, ctx.currentTime);

      masterGain.connect(compressor);
      compressor.connect(ctx.destination);

      audioCtxRef.current = ctx;
      masterGainRef.current = masterGain;
      compressorRef.current = compressor;
    }

    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, [isMuted]);

  // Update master gain when muted state toggles
  useEffect(() => {
    if (masterGainRef.current && audioCtxRef.current) {
      const now = audioCtxRef.current.currentTime;
      masterGainRef.current.gain.cancelScheduledValues(now);
      masterGainRef.current.gain.linearRampToValueAtTime(isMuted ? 0 : 0.35, now + 0.05);
    }
    try {
      localStorage.setItem('boxbre-muted', JSON.stringify(isMuted));
    } catch {
      // ignore
    }
  }, [isMuted]);

  // Update tick preference in storage
  useEffect(() => {
    try {
      localStorage.setItem('boxbre-tick', JSON.stringify(isTickEnabled));
    } catch {
      // ignore
    }
  }, [isTickEnabled]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
    initAudio();
  }, [initAudio]);

  const toggleTick = useCallback(() => {
    setIsTickEnabled((prev) => !prev);
    initAudio();
  }, [initAudio]);

  // Mobile Haptic vibration helper
  const triggerHaptic = useCallback((pattern: number | number[] = 30) => {
    if (typeof window !== 'undefined' && 'navigator' in window && 'vibrate' in navigator) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // ignore on unsupported devices
      }
    }
  }, []);

  // 1-second subtle mechanical tick click
  const playTick = useCallback(() => {
    if (isMuted || !isTickEnabled) return;
    initAudio();
    const ctx = audioCtxRef.current;
    const master = masterGainRef.current;
    if (!ctx || !master) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.Q.setValueAtTime(3.0, now);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1800, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.015);

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.015);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(master);

    osc.start(now);
    osc.stop(now + 0.02);
  }, [initAudio, isMuted, isTickEnabled]);

  // Phase transition chimes
  const playPhaseCue = useCallback(
    (phase: Phase) => {
      // Always trigger mobile haptic
      triggerHaptic(30);

      if (isMuted) return;
      initAudio();
      const ctx = audioCtxRef.current;
      const master = masterGainRef.current;
      if (!ctx || !master) return;

      const now = ctx.currentTime;

      if (phase === 'INHALE') {
        // Soft rising warm chord: C4 (261.63Hz) + G4 (392.00Hz)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(261.63, now); // C4
        osc1.frequency.exponentialRampToValueAtTime(293.66, now + 1.2); // swell to D4

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(392.0, now); // G4
        osc2.frequency.exponentialRampToValueAtTime(440.0, now + 1.2); // swell to A4

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, now);
        filter.frequency.exponentialRampToValueAtTime(1100, now + 0.8);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.28, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(master);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.85);
        osc2.stop(now + 1.85);
      } else if (phase === 'HOLD_IN') {
        // Crystalline high ping: E5 (659.25Hz)
        const osc = ctx.createOscillator();
        const oscHarmonic = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, now);

        oscHarmonic.type = 'sine';
        oscHarmonic.frequency.setValueAtTime(1318.5, now); // Octave overtone

        filter.type = 'highpass';
        filter.frequency.setValueAtTime(500, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.22, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

        osc.connect(filter);
        oscHarmonic.connect(filter);
        filter.connect(gain);
        gain.connect(master);

        osc.start(now);
        oscHarmonic.start(now);
        osc.stop(now + 0.85);
        oscHarmonic.stop(now + 0.85);
      } else if (phase === 'EXHALE') {
        // Grounding descending warm tone: G3 (196Hz) + D4 (293.66Hz)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(196.0, now); // G3
        osc1.frequency.exponentialRampToValueAtTime(164.81, now + 1.5); // descends to E3

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(293.66, now); // D4
        osc2.frequency.exponentialRampToValueAtTime(261.63, now + 1.5); // descends to C4

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, now);
        filter.frequency.exponentialRampToValueAtTime(280, now + 1.5);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.9);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(master);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.95);
        osc2.stop(now + 1.95);
      } else if (phase === 'HOLD_OUT') {
        // Deep subtle resonant sub-pulse: C3 (130.81Hz)
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(130.81, now); // C3
        osc.frequency.exponentialRampToValueAtTime(110.0, now + 0.6); // A2

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(220, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.24, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(master);

        osc.start(now);
        osc.stop(now + 0.95);
      }
    },
    [initAudio, isMuted, triggerHaptic]
  );

  return {
    isMuted,
    isTickEnabled,
    toggleMute,
    toggleTick,
    playPhaseCue,
    playTick,
    initAudio,
  };
};

