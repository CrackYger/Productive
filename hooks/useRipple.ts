import { useState } from 'react';
import type React from 'react';

export interface Ripple {
  id: number;
  x: number;
  y: number;
}

export function useRipple(): [Ripple[], (e: React.MouseEvent) => void] {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const add = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples(r => [...r, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }]);
    setTimeout(() => setRipples(r => r.filter(x => x.id !== id)), 700);
  };

  return [ripples, add];
}
