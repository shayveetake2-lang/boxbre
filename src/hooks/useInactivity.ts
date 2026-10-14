import { useEffect, useRef, useState } from 'react';

export const useInactivity = (isActive: boolean, timeoutMs: number = 3000): boolean => {
  const [isInactive, setIsInactive] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isActive) {
      setIsInactive(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const resetTimer = () => {
      setIsInactive(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setIsInactive(true);
      }, timeoutMs);
    };

    // Initial arming
    resetTimer();

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'pointerdown'];
    events.forEach((ev) => window.addEventListener(ev, resetTimer, { passive: true }));

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach((ev) => window.removeEventListener(ev, resetTimer));
    };
  }, [isActive, timeoutMs]);

  return isInactive;
};

