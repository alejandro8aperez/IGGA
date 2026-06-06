// ============================================================
//  useKeepAlive.js  –  ERP-8AMPERIOS
//  Ping periódico al backend para evitar que Render hiberne.
//  Usar en App.jsx o en el layout raíz autenticado.
// ============================================================
import { useEffect, useRef } from 'react';

const BACKEND_URL =
  import.meta.env.VITE_API_URL || 'https://erp-backend-a37b.onrender.com/api';

/**
 * @param {object} options
 * @param {number}  options.intervalMs  Intervalo entre pings en ms (default: 10 min)
 * @param {boolean} options.enabled     Activar / desactivar (default: true en producción)
 */
const useKeepAlive = ({
  intervalMs = 10 * 60 * 1000,
  enabled = import.meta.env.PROD,
} = {}) => {
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const ping = async () => {
      try {
        const url = `${BACKEND_URL}/health/`;
        const res = await fetch(url, { method: 'GET', cache: 'no-store' });
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
