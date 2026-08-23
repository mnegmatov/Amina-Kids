import { useEffect } from 'react';

let lockCount = 0;
let previousOverflow = '';

/**
 * Locks page scrolling while `isLocked` is true. Reference-counted so that
 * multiple modals/drawers can be open (or closing) at once without one of
 * them prematurely re-enabling scroll for the others.
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    if (lockCount === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = previousOverflow;
      }
    };
  }, [isLocked]);
}
