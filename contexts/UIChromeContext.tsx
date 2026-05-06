import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

interface UIChromeContextValue {
  chromeHidden: boolean;
  pushOverlay: () => () => void;
}

const UIChromeContext = createContext<UIChromeContextValue | null>(null);

export const UIChromeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [count, setCount] = useState(0);

  const pushOverlay = useCallback(() => {
    setCount(value => value + 1);
    return () => setCount(value => Math.max(0, value - 1));
  }, []);

  const value = useMemo<UIChromeContextValue>(
    () => ({ chromeHidden: count > 0, pushOverlay }),
    [count, pushOverlay],
  );

  return <UIChromeContext.Provider value={value}>{children}</UIChromeContext.Provider>;
};

export function useUIChrome() {
  const ctx = useContext(UIChromeContext);
  if (!ctx) throw new Error('useUIChrome muss innerhalb von UIChromeProvider verwendet werden.');
  return ctx;
}

export function useHideChromeWhileMounted(active = true) {
  const { pushOverlay } = useUIChrome();
  useEffect(() => {
    if (!active) return;
    const release = pushOverlay();
    return release;
  }, [active, pushOverlay]);
}
