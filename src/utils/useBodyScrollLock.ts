import { useEffect } from 'react';

let lockCount = 0;
let previousOverflow = '';
let previousPaddingRight = '';

/**
 * Locks page scrolling while `isLocked` is true. Reference-counted so that
 * multiple modals/drawers can be open (or closing) at once without one of
 * them prematurely re-enabling scroll for the others.
 * Also prevents desktop layout shifts by compensating for scrollbar width.
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    if (lockCount === 0) {
      previousOverflow = document.body.style.overflow;
      previousPaddingRight = document.body.style.paddingRight;

      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.body.style.overflow = 'hidden';
    }
    lockCount += 1;

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        document.body.style.overflow = previousOverflow;
        document.body.style.paddingRight = previousPaddingRight;
      }
    };
  }, [isLocked]);
}
