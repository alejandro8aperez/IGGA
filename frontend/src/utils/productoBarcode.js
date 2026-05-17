import axios from 'axios';
import { API } from '../config/api';

/**
 * Busca un producto en el maestro por código de barras, GTIN, SKU, etc.
 * @returns {Promise<object|null>} Producto maestro o null si no existe
 */
export async function buscarProductoPorCodigoBarras(codigo) {
    const trimmed = String(codigo || '').trim();
    if (!trimmed) return null;
    try {
        const { data } = await axios.get(API.PRODUCTOS.POR_CODIGO_BARRAS, {
            params: { codigo: trimmed },
        });
        return data;
    } catch (err) {
        if (err.response?.status === 404) return null;
        throw err;
    }
}

/** Normaliza producto maestro para el carrito del POS */
export function productoParaPOS(p) {
    return {
        id: p.id,
        nombre: p.nombre,
        codigo_sku: p.codigo_sku,
        precio_venta: p.precio_venta,
        imagen_url: p.imagen_url,
        categoria_nombre: p.categoria_nombre,
        unidad_medida: p.unidad_medida,
        activo: p.activo !== false,
    };
}

/** Línea de cotización desde producto maestro */
export function productoParaCotizacion(p, cantidad = 1) {
    const qty = Number(cantidad) || 1;
    const precio = Number(p.ficha?.precio_sugerido ?? p.precio_venta ?? 0);
    const descuento = 0;
    return {
        id: `${p.id}-${Date.now()}`,
        producto_id: p.id,
        codigo_sku: p.codigo_sku,
        descripcion: `[${p.codigo_sku}] ${p.nombre}`,
        cantidad: qty,
        precio_unitario: precio,
        descuento,
        total: qty * precio - descuento,
        unidad_medida: p.unidad_medida || 'UN',
    };
}
