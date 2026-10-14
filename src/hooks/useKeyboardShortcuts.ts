import { useEffect } from 'react';

interface KeyboardShortcutsOptions {
  onTogglePlay: () => void;
  onReset: () => void;
  onToggleMute: () => void;
  onIncreaseSideDuration: () => void;
  onDecreaseSideDuration: () => void;
  onToggleTick?: () => void;
}

export const useKeyboardShortcuts = ({
  onTogglePlay,
  onReset,
  onToggleMute,
  onIncreaseSideDuration,
  onDecreaseSideDuration,
  onToggleTick,
}: KeyboardShortcutsOptions) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is inside an input/textarea
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        onTogglePlay();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        onReset();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        onToggleMute();
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        onIncreaseSideDuration();
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        onDecreaseSideDuration();
      } else if (e.code === 'KeyT' && onToggleTick) {
        e.preventDefault();
        onToggleTick();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    onTogglePlay,
    onReset,
    onToggleMute,
    onIncreaseSideDuration,
    onDecreaseSideDuration,
    onToggleTick,
  ]);
};

