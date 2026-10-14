import { useEffect, useRef } from 'react';

export const useWakeLock = (isActive: boolean) => {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    let isMounted = true;

    const requestLock = async () => {
      if (typeof window === 'undefined' || !('wakeLock' in navigator)) return;
      try {
        if (!wakeLockRef.current && isMounted && isActive) {
          const lock = await navigator.wakeLock.request('screen');
          wakeLockRef.current = lock;

          lock.addEventListener('release', () => {
            wakeLockRef.current = null;
          });
        }
      } catch {
        // May fail if low battery or system policy; non-fatal
      }
    };

    const releaseLock = async () => {
      if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
        } catch {
          // ignore
        }
        wakeLockRef.current = null;
      }
    };

    if (isActive) {
      requestLock();
    } else {
      releaseLock();
    }

    const handleVisibilityChange = () => {
      if (!document.hidden && isActive) {
        requestLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      releaseLock();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive]);
};

