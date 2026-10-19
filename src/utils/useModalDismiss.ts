import { useEffect, useRef } from 'react';

/**
 * Closes a modal with the Escape key while it is open. Only the most recently
 * opened modal reacts, so Escape on a stacked dialog closes just the top one.
 */
const openStack: symbol[] = [];

export function useModalDismiss(isOpen: boolean, onClose: () => void) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const id = Symbol('modal');
    openStack.push(id);
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openStack[openStack.length - 1] === id) {
        e.preventDefault();
        onCloseRef.current();
      }
    };
    document.addEventListener('keydown', handler);
    return () => {
      document.removeEventListener('keydown', handler);
      const i = openStack.indexOf(id);
      if (i >= 0) openStack.splice(i, 1);
    };
  }, [isOpen]);
}
