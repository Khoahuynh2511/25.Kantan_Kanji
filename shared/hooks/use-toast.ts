'use client';

import { useState, useCallback } from 'react';

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  duration?: number;
}

type ToasterToast = Toast & { open: boolean };

let count = 0;

function generateId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

export function useToast() {
  const [toasts, setToasts] = useState<ToasterToast[]>([]);

  const toast = useCallback((props: Omit<Toast, 'id'>) => {
    const id = generateId();
    const duration = props.duration ?? 5000;

    setToasts(prev => [...prev, { ...props, id, open: true }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, open: false } : t));
      }, duration);
    }

    return { id };
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    setToasts(prev =>
      toastId
        ? prev.map(t => t.id === toastId ? { ...t, open: false } : t)
        : prev.map(t => ({ ...t, open: false }))
    );
  }, []);

  return { toasts, toast, dismiss };
}
