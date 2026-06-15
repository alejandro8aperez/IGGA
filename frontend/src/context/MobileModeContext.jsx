import { createContext, useContext, useState, useCallback } from 'react';

const MobileModeContext = createContext(null);

export function MobileModeProvider({ children }) {
  const [isMobileMode, setIsMobileMode] = useState(false);

  const setMobileMode = useCallback((mode) => {
    setIsMobileMode(mode);
  }, []);

  const toggleMobileMode = useCallback(() => {
    setIsMobileMode(prev => !prev);
  }, []);

  return (
    <MobileModeContext.Provider value={{ isMobileMode, setMobileMode, toggleMobileMode }}>
      {children}
    </MobileModeContext.Provider>
  );
}

export function useMobileMode() {
  const ctx = useContext(MobileModeContext);
  if (!ctx) throw new Error('useMobileMode debe usarse dentro de <MobileModeProvider>');
  return ctx;
}

export default MobileModeContext;
