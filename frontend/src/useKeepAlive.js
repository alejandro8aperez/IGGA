// ============================================================
//  useKeepAlive.js  –  ERP-8AMPERIOS
//  Ping periódico al backend para evitar que Render hiberne.
//  Usar en App.jsx o en el layout raíz autenticado.
// ============================================================
import { useEffect, useRef } from 'react';
import { BASE_URL } from './axiosConfig';

/**
 * @param {object} options
 * @param {number}  options.intervalMs  Intervalo entre pings en ms (default: 10 min)
 * @param {boolean} options.enabled     Activar / desactivar (default: true en producción)
 */
const useKeepAlive = ({
  intervalMs = 10 * 60 * 1000,   // 10 minutos
  enabled = import.meta.env.PROD, // solo en producción
} = {}) => {
  const intervalRef = useRef(null);
  const lastPingRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const ping = async () => {
      try {
        // Usamos el endpoint público /api/health/ (lo crearemos en Django)
        // Si no existe aún, cae en 404 pero el servidor igualmente despierta.
        const url = `${BASE_URL}health/`;
        const res = await fetch(url, { method: 'GET', cache: 'no-store' });
        lastPingRef.current = new Date();
        console.debug(`[ERP Keep-Alive] Ping OK → ${res.status} @ ${lastPingRef.current.toLocaleTimeString()}`);
      } catch (err) {
        console.warn('[ERP Keep-Alive] Ping falló (sin conexión?):', err.message);
      }
    };

    // Primer ping inmediato al montar
    ping();

    intervalRef.current = setInterval(ping, intervalMs);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [enabled, intervalMs]);

  return { lastPing: lastPingRef.current };
};

export default useKeepAlive;
