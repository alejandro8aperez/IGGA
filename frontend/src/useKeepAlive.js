// ============================================================
//  useKeepAlive.js  –  ERP-8AMPERIOS
//  Ping periódico al backend para evitar que Render hiberne.
// ============================================================
import { useEffect, useRef } from 'react';

const HEALTH_URL = 'https://erp-backend-a37b.onrender.com/api/health/';

const useKeepAlive = ({
  intervalMs = 10 * 60 * 1000,
  enabled = import.meta.env.PROD,
} = {}) => {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const ping = async () => {
      try {
        const res = await fetch(HEALTH_URL, { method: 'GET', cache: 'no-store' });
        console.debug(`[ERP Keep-Alive] Ping OK → ${res.status} @ ${new Date().toLocaleTimeString()}`);
      } catch (err) {
        console.warn('[ERP Keep-Alive] Ping falló:', err.message);
      }
    };

    ping();
    intervalRef.current = setInterval(ping, intervalMs);
    return () => clearInterval(intervalRef.current);
  }, [enabled, intervalMs]);
};

export default useKeepAlive;
