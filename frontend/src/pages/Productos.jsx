import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Package, Plus, Edit3, Trash2, Search, X, Barcode, Box,
    ShoppingCart, TrendingUp, Factory, Warehouse, FileText,
    Save, ScanLine, Layers
} from 'lucide-react';
import { API } from '../config/api';

const TABS = [
    { id: 'general', label: 'General', icon: FileText },
    { id: 'clasificacion', label: 'Clasificación', icon: Layers },
    { id: 'empaque', label: 'Empaque', icon: Box },
    { id: 'barras', label: 'Códigos de barras', icon: Barcode },
    { id: 'compras', label: 'Compras', icon: ShoppingCart },
    { id: 'ventas', label: 'Ventas', icon: TrendingUp },
    { id: 'mrp', label: 'MRP', icon: Factory },
    { id: 'almacen', label: 'Almacén', icon: Warehouse },
];

const TIPOS_PRODUCTO = [
    { value: 'materia_prima', label: 'Materia Prima' },
    { value: 'producto_terminado', label: 'Producto Terminado' },
    { value: 'semielaborado', label: 'Semielaborado' },
    { value: 'insumo', label: 'Insumo / Consumible' },
    { value: 'servicio', label: 'Servicio' },
    { value: 'empaque', label: 'Empaque / Embalaje' },
];

const ESTADOS_MATERIAL = [
    { value: 'activo', label: 'Activo' },
    { value: 'bloqueado', label: 'Bloqueado' },
    { value: 'obsoleto', label: 'Obsoleto' },
    { value: 'en_desarrollo', label: 'En desarrollo' },
];

const TIPOS_BARRAS = ['EAN13', 'EAN8', 'UPC', 'CODE128', 'CODE39', 'QR', 'INTERNO', 'GTIN14'];
const NIVELES_EMPAQUE = [
    { value: 'unidad', label: 'Unidad base' },
    { value: 'inner', label: 'Empaque interno' },
    { value: 'caja', label: 'Caja / Cartón' },
    { value: 'bulto', label: 'Bulto' },
    { value: 'pallet', label: 'Pallet' },
    { value: 'contenedor', label: 'Contenedor' },
];

const emptyFicha = () => ({
    grupo_material: '', familia: '', codigo_interno: '', codigo_dian: '',
    codigo_arancelario: '', codigo_gtin: '', tipo_empaque: '',
    presentacion: '', contenido_neto: '', unidad_contenido: '', unidades_por_empaque: '',
    largo_cm: '', ancho_cm: '', alto_cm: '', volumen_m3: '',
    peso_bruto_kg: '', peso_neto_kg: '', pais_origen: 'Colombia', fabricante: '',
    proveedor_habitual: '', lead_time_dias: '', cantidad_minima_compra: '',
    moneda_compra: 'COP', ultimo_precio_compra: '', lista_precios: 'General',
    iva_porcentaje: 19, precio_sugerido: '', permite_descuento: true, es_vendible: true,
    politica_inventario: 'punto_reorden', planificador: '', tiempo_produccion_dias: '',
    lote_minimo_produccion: '', lote_estandar: '', gestion_lote: false, gestion_serie: false,
    temperatura_almacenamiento: '', clase_abc: '', estado_material: 'activo',
    requiere_certificado: false, norma_calidad: '', observaciones: '',
});

const emptyProducto = () => ({
    codigo_sku: '', nombre: '', descripcion: '', marca: '', referencia_fabrica: '',
    categoria: '', tipo_producto: 'producto_terminado', unidad_medida: 'UN',
    precio_venta: 0, precio_compra: 0, stock_actual: 0, stock_minimo: 5,
    stock_maximo: '', punto_reorden: '', almacen: '', ubicacion_almacen: '',
    peso_unitario_kg: '', es_perecedero: false, dias_vida_util: '', requiere_lote: false,
    activo: true, notas: '', ficha: emptyFicha(),
    codigos_barras: [], unidades_empaque: [],
});

const card = { background: '#1e293b', borderRadius: '12px', border: '1px solid #334155', padding: '1.25rem' };
const inp = {
    width: '100%', padding: '0.5rem 0.75rem', background: '#0f172a',
    border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0', fontSize: '0.875rem',
};
const lbl = { display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.35rem', fontWeight: 500 };
const btnPri = {
    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.55rem 1rem', background: 'linear-gradient(135deg,#667eea,#764ba2)',
    color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
};

function Field({ label: text, children }) {
    return (
        <div style={{ marginBottom: '0.85rem' }}>
            <label style={lbl}>{text}</label>
            {children}
        </div>
    );
}

export default function Productos() {
    const [loading, setLoading] = useState(true);
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [familias, setFamilias] = useState([]);
    const [tiposEmpaque, setTiposEmpaque] = useState([]);
    const [almacenes, setAlmacenes] = useState([]);
    const [resumen, setResumen] = useState({});
    const [search, setSearch] = useState('');
    const [filterGrupo, setFilterGrupo] = useState('');
    const [filterTipo, setFilterTipo] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [current, setCurrent] = useState(null);
    const [form, setForm] = useState(emptyProducto());
    const [barcodeScan, setBarcodeScan] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (search) params.search = search;
            if (filterGrupo) params.grupo_material = filterGrupo;
            if (filterTipo) params.tipo = filterTipo;

            const results = await Promise.allSettled([
                axios.get(API.INVENTARIOS.PRODUCTOS, { 
                    params: search ? { search } : {} 
                }), // 0 - Simplificamos params para asegurar compatibilidad
                axios.get(API.INVENTARIOS.CATEGORIAS),            // 1
                axios.get(API.PRODUCTOS.GRUPOS_MATERIAL),         // 2
                axios.get(API.PRODUCTOS.FAMILIAS),                // 3
                axios.get(API.PRODUCTOS.TIPOS_EMPAQUE),           // 4
                axios.get(API.INVENTARIOS.ALMACENES),             // 5
                axios.get(API.PRODUCTOS.RESUMEN).catch(() => ({ data: {} })), // 6 - Fallback silencioso
            ]);

            // Validamos la respuesta de productos (esencial)
            if (results[0].status === 'fulfilled') {
                const data = results[0].value.data;
                const lista = Array.isArray(data) ? data : (data.results || []);
                setProductos(lista);
                
                if (lista.length === 0) {
                    console.warn("La API devolvió 0 productos.");
                }
            } else {
                throw new Error(results[0].reason?.message || 'Error de conexión con Inventarios');
            }

            // Carga de metadatos (opcionales)
            if (results[1].status === 'fulfilled') setCategorias(results[1].value.data);
            if (results[2].status === 'fulfilled') setGrupos(results[2].value.data);
            if (results[3].status === 'fulfilled') setFamilias(results[3].value.data);
            if (results[4].status === 'fulfilled') setTiposEmpaque(results[4].value.data);
            if (results[5].status === 'fulfilled') setAlmacenes(results[5].value.data);
            if (results[6].status === 'fulfilled') setResumen(results[6].value.data);
            
            setError(null);
        } catch (err) {
            console.error("Error en Maestro de Productos:", err);
            setError('Error al cargar el maestro de productos');
        } finally {
            setLoading(false);
        }
    }, [search, filterGrupo, filterTipo]);

    useEffect(() => { loadData(); }, [loadData]);

    const openModal = async (prod = null) => {
        setActiveTab('general');
        if (prod?.id) {
            try {
                const res = await axios.get(`${API.INVENTARIOS.PRODUCTOS}${prod.id}/`);
                const p = res.data;
                setCurrent(p);
                setForm({
                    ...p,
                    categoria: p.categoria || '',
                    almacen: p.almacen || '',
                    ficha: { ...emptyFicha(), ...(p.ficha || {}) },
                    codigos_barras: p.codigos_barras || [],
                    unidades_empaque: p.unidades_empaque || [],
                });
            } catch {
                setError('No se pudo cargar el detalle del producto');
                return;
            }
        } else {
            setCurrent(null);
            setForm(emptyProducto());
        }
        setModalOpen(true);
    };

    const handleBarcodeLookup = async () => {
        if (!barcodeScan.trim()) return;
        try {
            const res = await axios.get(API.PRODUCTOS.POR_CODIGO_BARRAS, {
                params: { codigo: barcodeScan.trim() },
            });
            openModal(res.data);
            setBarcodeScan('');
        } catch {
            alert('Producto no encontrado para ese código de barras');
        }
    };

    const setField = (field, value) => setForm(f => ({ ...f, [field]: value }));
    const setFicha = (field, value) => setForm(f => ({
        ...f, ficha: { ...f.ficha, [field]: value },
    }));

    const addBarcode = () => setForm(f => ({
        ...f,
        codigos_barras: [...f.codigos_barras, { codigo: '', tipo: 'EAN13', es_principal: false, descripcion: '', activo: true }],
    }));
    const updateBarcode = (idx, field, value) => setForm(f => {
        const arr = [...f.codigos_barras];
        arr[idx] = { ...arr[idx], [field]: value };
        return { ...f, codigos_barras: arr };
    });
    const removeBarcode = (idx) => setForm(f => ({
        ...f, codigos_barras: f.codigos_barras.filter((_, i) => i !== idx),
    }));

    const addEmpaque = () => setForm(f => ({
        ...f,
        unidades_empaque: [...f.unidades_empaque, {
            nivel: 'caja', codigo: '', descripcion: '', factor_conversion: 1,
            codigo_barras: '', peso_kg: '', es_predeterminado: false, activo: true,
        }],
    }));
    const updateEmpaque = (idx, field, value) => setForm(f => {
        const arr = [...f.unidades_empaque];
        arr[idx] = { ...arr[idx], [field]: value };
        return { ...f, unidades_empaque: arr };
    });
    const removeEmpaque = (idx) => setForm(f => ({
        ...f, unidades_empaque: f.unidades_empaque.filter((_, i) => i !== idx),
    }));

    const buildPayload = () => {
        const ficha = { ...form.ficha };
        ['grupo_material', 'familia', 'tipo_empaque'].forEach(k => {
            if (ficha[k] === '') ficha[k] = null;
        });
        ['contenido_neto', 'unidades_por_empaque', 'largo_cm', 'ancho_cm', 'alto_cm',
            'volumen_m3', 'peso_bruto_kg', 'peso_neto_kg', 'lead_time_dias',
            'cantidad_minima_compra', 'ultimo_precio_compra', 'precio_sugerido',
            'tiempo_produccion_dias', 'lote_minimo_produccion', 'lote_estandar',
        ].forEach(k => { if (ficha[k] === '') ficha[k] = null; });

        return {
            codigo_sku: form.codigo_sku, nombre: form.nombre, descripcion: form.descripcion,
            marca: form.marca, referencia_fabrica: form.referencia_fabrica,
            categoria: form.categoria || null, tipo_producto: form.tipo_producto,
            unidad_medida: form.unidad_medida, precio_venta: form.precio_venta,
            precio_compra: form.precio_compra, stock_actual: form.stock_actual,
            stock_minimo: form.stock_minimo, stock_maximo: form.stock_maximo || null,
            punto_reorden: form.punto_reorden || null, almacen: form.almacen || null,
            ubicacion_almacen: form.ubicacion_almacen, peso_unitario_kg: form.peso_unitario_kg || null,
            es_perecedero: form.es_perecedero, dias_vida_util: form.dias_vida_util || null,
            requiere_lote: form.requiere_lote, activo: form.activo, notas: form.notas,
            ficha, codigos_barras: form.codigos_barras, unidades_empaque: form.unidades_empaque,
        };
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = buildPayload();
            if (current?.id) {
                await axios.put(`${API.INVENTARIOS.PRODUCTOS}${current.id}/`, payload);
            } else {
                await axios.post(API.INVENTARIOS.PRODUCTOS, payload);
            }
            setModalOpen(false);
            loadData();
        } catch (err) {
            alert(err.response?.data ? JSON.stringify(err.response.data) : 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar o desactivar este producto?')) return;
        try {
            await axios.delete(`${API.INVENTARIOS.PRODUCTOS}${id}/`);
            loadData();
        } catch {
            alert('No se pudo eliminar');
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general':
                return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                        <Field label="Código SKU / Material *">
                            <input style={inp} value={form.codigo_sku} onChange={e => setField('codigo_sku', e.target.value)} required disabled={!!current} />
                        </Field>
                        <Field label="Nombre *">
                            <input style={inp} value={form.nombre} onChange={e => setField('nombre', e.target.value)} required />
                        </Field>
                        <Field label="Marca">
                            <input style={inp} value={form.marca} onChange={e => setField('marca', e.target.value)} />
                        </Field>
                        <Field label="Referencia de fábrica">
                            <input style={inp} value={form.referencia_fabrica} onChange={e => setField('referencia_fabrica', e.target.value)} />
                        </Field>
                        <Field label="Categoría">
                            <select style={inp} value={form.categoria} onChange={e => setField('categoria', e.target.value)}>
                                <option value="">— Sin categoría —</option>
                                {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                            </select>
                        </Field>
                        <Field label="Tipo de producto">
                            <select style={inp} value={form.tipo_producto} onChange={e => setField('tipo_producto', e.target.value)}>
                                {TIPOS_PRODUCTO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </Field>
                        <Field label="Unidad de medida base">
                            <input style={inp} value={form.unidad_medida} onChange={e => setField('unidad_medida', e.target.value)} placeholder="UN, KG, LT..." />
                        </Field>
                        <Field label="Estado">
                            <select style={inp} value={form.activo ? '1' : '0'} onChange={e => setField('activo', e.target.value === '1')}>
                                <option value="1">Activo</option>
                                <option value="0">Inactivo</option>
                            </select>
                        </Field>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <Field label="Descripción">
                                <textarea style={{ ...inp, minHeight: 80 }} value={form.descripcion} onChange={e => setField('descripcion', e.target.value)} />
                            </Field>
                        </div>
                        <Field label="Precio compra">
                            <input style={inp} type="number" step="0.01" value={form.precio_compra} onChange={e => setField('precio_compra', e.target.value)} />
                        </Field>
                        <Field label="Precio venta">
                            <input style={inp} type="number" step="0.01" value={form.precio_venta} onChange={e => setField('precio_venta', e.target.value)} />
                        </Field>
                        <Field label="Peso unitario (kg)">
                            <input style={inp} type="number" step="0.0001" value={form.peso_unitario_kg} onChange={e => setField('peso_unitario_kg', e.target.value)} />
                        </Field>
                        <Field label="Notas internas">
                            <input style={inp} value={form.notas} onChange={e => setField('notas', e.target.value)} />
                        </Field>
                    </div>
                );
            case 'clasificacion':
                return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                        <Field label="Grupo de material (SAP)">
                            <select style={inp} value={form.ficha.grupo_material || ''} onChange={e => setFicha('grupo_material', e.target.value)}>
                                <option value="">— Seleccionar —</option>
                                {grupos.map(g => <option key={g.id} value={g.id}>{g.codigo} — {g.nombre}</option>)}
                            </select>
                        </Field>
                        <Field label="Familia / Subfamilia">
                            <select style={inp} value={form.ficha.familia || ''} onChange={e => setFicha('familia', e.target.value)}>
                                <option value="">— Seleccionar —</option>
                                {familias.map(f => <option key={f.id} value={f.id}>{f.codigo} — {f.nombre}</option>)}
                            </select>
                        </Field>
                        <Field label="Código interno">
                            <input style={inp} value={form.ficha.codigo_interno} onChange={e => setFicha('codigo_interno', e.target.value)} />
                        </Field>
                        <Field label="Código DIAN / FE">
                            <input style={inp} value={form.ficha.codigo_dian} onChange={e => setFicha('codigo_dian', e.target.value)} />
                        </Field>
                        <Field label="Partida arancelaria (HS)">
                            <input style={inp} value={form.ficha.codigo_arancelario} onChange={e => setFicha('codigo_arancelario', e.target.value)} />
                        </Field>
                        <Field label="GTIN / EAN principal">
                            <input style={inp} value={form.ficha.codigo_gtin} onChange={e => setFicha('codigo_gtin', e.target.value)} placeholder="7701234567890" />
                        </Field>
                        <Field label="Estado del material">
                            <select style={inp} value={form.ficha.estado_material} onChange={e => setFicha('estado_material', e.target.value)}>
                                {ESTADOS_MATERIAL.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </Field>
                        <Field label="Clase ABC">
                            <select style={inp} value={form.ficha.clase_abc} onChange={e => setFicha('clase_abc', e.target.value)}>
                                <option value="">—</option>
                                <option value="A">A</option>
                                <option value="B">B</option>
                                <option value="C">C</option>
                            </select>
                        </Field>
                        <Field label="País de origen">
                            <input style={inp} value={form.ficha.pais_origen} onChange={e => setFicha('pais_origen', e.target.value)} />
                        </Field>
                        <Field label="Fabricante">
                            <input style={inp} value={form.ficha.fabricante} onChange={e => setFicha('fabricante', e.target.value)} />
                        </Field>
                    </div>
                );
            case 'empaque':
                return (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem', marginBottom: '1rem' }}>
                            <Field label="Tipo de empaque">
                                <select style={inp} value={form.ficha.tipo_empaque || ''} onChange={e => setFicha('tipo_empaque', e.target.value)}>
                                    <option value="">— Seleccionar —</option>
                                    {tiposEmpaque.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                                </select>
                            </Field>
                            <Field label="Presentación">
                                <input style={inp} value={form.ficha.presentacion} onChange={e => setFicha('presentacion', e.target.value)} placeholder="Caja x 12 unidades" />
                            </Field>
                            <Field label="Contenido neto">
                                <input style={inp} type="number" value={form.ficha.contenido_neto} onChange={e => setFicha('contenido_neto', e.target.value)} />
                            </Field>
                            <Field label="UM contenido">
                                <input style={inp} value={form.ficha.unidad_contenido} onChange={e => setFicha('unidad_contenido', e.target.value)} />
                            </Field>
                            <Field label="Unidades por empaque">
                                <input style={inp} type="number" value={form.ficha.unidades_por_empaque} onChange={e => setFicha('unidades_por_empaque', e.target.value)} />
                            </Field>
                            <Field label="Peso bruto (kg)">
                                <input style={inp} type="number" value={form.ficha.peso_bruto_kg} onChange={e => setFicha('peso_bruto_kg', e.target.value)} />
                            </Field>
                            <Field label="Largo (cm)">
                                <input style={inp} type="number" value={form.ficha.largo_cm} onChange={e => setFicha('largo_cm', e.target.value)} />
                            </Field>
                            <Field label="Ancho (cm)">
                                <input style={inp} type="number" value={form.ficha.ancho_cm} onChange={e => setFicha('ancho_cm', e.target.value)} />
                            </Field>
                            <Field label="Alto (cm)">
                                <input style={inp} type="number" value={form.ficha.alto_cm} onChange={e => setFicha('alto_cm', e.target.value)} />
                            </Field>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                            <h4 style={{ color: '#e2e8f0', margin: 0, fontSize: '0.9rem' }}>Jerarquía de empaque (unidad → caja → pallet)</h4>
                            <button type="button" onClick={addEmpaque} style={{ ...btnPri, fontSize: '0.78rem' }}><Plus size={14}/> Agregar nivel</button>
                        </div>
                        {form.unidades_empaque.map((emp, idx) => (
                            <div key={idx} style={{ ...card, marginBottom: '0.75rem', padding: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: '0.5rem', alignItems: 'end' }}>
                                    <Field label="Nivel">
                                        <select style={inp} value={emp.nivel} onChange={e => updateEmpaque(idx, 'nivel', e.target.value)}>
                                            {NIVELES_EMPAQUE.map(n => <option key={n.value} value={n.value}>{n.label}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Descripción">
                                        <input style={inp} value={emp.descripcion} onChange={e => updateEmpaque(idx, 'descripcion', e.target.value)} />
                                    </Field>
                                    <Field label="Factor conversión">
                                        <input style={inp} type="number" value={emp.factor_conversion} onChange={e => updateEmpaque(idx, 'factor_conversion', e.target.value)} />
                                    </Field>
                                    <Field label="Cód. barras empaque">
                                        <input style={inp} value={emp.codigo_barras} onChange={e => updateEmpaque(idx, 'codigo_barras', e.target.value)} />
                                    </Field>
                                    <button type="button" onClick={() => removeEmpaque(idx)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.5rem' }}><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'barras':
                return (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>Múltiples códigos: EAN-13, UPC, interno, GTIN-14 caja, etc.</p>
                            <button type="button" onClick={addBarcode} style={btnPri}><Plus size={14}/> Agregar código</button>
                        </div>
                        {form.codigos_barras.length === 0 && (
                            <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>Sin códigos de barras. Agregue al menos uno.</p>
                        )}
                        {form.codigos_barras.map((cb, idx) => (
                            <div key={idx} style={{ ...card, marginBottom: '0.75rem', padding: '1rem' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
                                    <Field label="Código">
                                        <input style={inp} value={cb.codigo} onChange={e => updateBarcode(idx, 'codigo', e.target.value)} />
                                    </Field>
                                    <Field label="Tipo">
                                        <select style={inp} value={cb.tipo} onChange={e => updateBarcode(idx, 'tipo', e.target.value)}>
                                            {TIPOS_BARRAS.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Principal">
                                        <input type="checkbox" checked={cb.es_principal} onChange={e => updateBarcode(idx, 'es_principal', e.target.checked)} style={{ width: 18, height: 18 }} />
                                    </Field>
                                    <button type="button" onClick={() => removeBarcode(idx)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}><Trash2 size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            case 'compras':
                return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                        <Field label="Proveedor habitual">
                            <input style={inp} value={form.ficha.proveedor_habitual} onChange={e => setFicha('proveedor_habitual', e.target.value)} />
                        </Field>
                        <Field label="Lead time (días)">
                            <input style={inp} type="number" value={form.ficha.lead_time_dias} onChange={e => setFicha('lead_time_dias', e.target.value)} />
                        </Field>
                        <Field label="MOQ — Cantidad mínima compra">
                            <input style={inp} type="number" value={form.ficha.cantidad_minima_compra} onChange={e => setFicha('cantidad_minima_compra', e.target.value)} />
                        </Field>
                        <Field label="Moneda compra">
                            <select style={inp} value={form.ficha.moneda_compra} onChange={e => setFicha('moneda_compra', e.target.value)}>
                                <option value="COP">COP</option>
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                            </select>
                        </Field>
                        <Field label="Último precio compra">
                            <input style={inp} type="number" value={form.ficha.ultimo_precio_compra} onChange={e => setFicha('ultimo_precio_compra', e.target.value)} />
                        </Field>
                    </div>
                );
            case 'ventas':
                return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                        <Field label="Lista de precios">
                            <input style={inp} value={form.ficha.lista_precios} onChange={e => setFicha('lista_precios', e.target.value)} />
                        </Field>
                        <Field label="IVA %">
                            <input style={inp} type="number" value={form.ficha.iva_porcentaje} onChange={e => setFicha('iva_porcentaje', e.target.value)} />
                        </Field>
                        <Field label="Precio sugerido">
                            <input style={inp} type="number" value={form.ficha.precio_sugerido} onChange={e => setFicha('precio_sugerido', e.target.value)} />
                        </Field>
                        <Field label="Vendible">
                            <input type="checkbox" checked={form.ficha.es_vendible} onChange={e => setFicha('es_vendible', e.target.checked)} style={{ width: 18, height: 18 }} />
                        </Field>
                        <Field label="Permite descuento">
                            <input type="checkbox" checked={form.ficha.permite_descuento} onChange={e => setFicha('permite_descuento', e.target.checked)} style={{ width: 18, height: 18 }} />
                        </Field>
                    </div>
                );
            case 'mrp':
                return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                        <Field label="Política de inventario">
                            <select style={inp} value={form.ficha.politica_inventario} onChange={e => setFicha('politica_inventario', e.target.value)}>
                                <option value="lote_por_lote">Lote por lote</option>
                                <option value="punto_reorden">Punto de reorden</option>
                                <option value="planificacion">Planificación MRP</option>
                                <option value="sin_planificacion">Sin planificación</option>
                            </select>
                        </Field>
                        <Field label="Planificador">
                            <input style={inp} value={form.ficha.planificador} onChange={e => setFicha('planificador', e.target.value)} />
                        </Field>
                        <Field label="Tiempo producción (días)">
                            <input style={inp} type="number" value={form.ficha.tiempo_produccion_dias} onChange={e => setFicha('tiempo_produccion_dias', e.target.value)} />
                        </Field>
                        <Field label="Lote mínimo producción">
                            <input style={inp} type="number" value={form.ficha.lote_minimo_produccion} onChange={e => setFicha('lote_minimo_produccion', e.target.value)} />
                        </Field>
                        <Field label="Lote estándar">
                            <input style={inp} type="number" value={form.ficha.lote_estandar} onChange={e => setFicha('lote_estandar', e.target.value)} />
                        </Field>
                        <Field label="Punto de reorden">
                            <input style={inp} type="number" value={form.punto_reorden} onChange={e => setField('punto_reorden', e.target.value)} />
                        </Field>
                    </div>
                );
            case 'almacen':
                return (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                        <Field label="Almacén principal">
                            <select style={inp} value={form.almacen} onChange={e => setField('almacen', e.target.value)}>
                                <option value="">— Seleccionar —</option>
                                {almacenes.map(a => <option key={a.id} value={a.id}>{a.codigo} — {a.nombre}</option>)}
                            </select>
                        </Field>
                        <Field label="Ubicación (rack/pasillo)">
                            <input style={inp} value={form.ubicacion_almacen} onChange={e => setField('ubicacion_almacen', e.target.value)} placeholder="Pasillo A, Rack 3" />
                        </Field>
                        <Field label="Stock actual">
                            <input style={inp} type="number" value={form.stock_actual} onChange={e => setField('stock_actual', e.target.value)} />
                        </Field>
                        <Field label="Stock mínimo">
                            <input style={inp} type="number" value={form.stock_minimo} onChange={e => setField('stock_minimo', e.target.value)} />
                        </Field>
                        <Field label="Stock máximo">
                            <input style={inp} type="number" value={form.stock_maximo} onChange={e => setField('stock_maximo', e.target.value)} />
                        </Field>
                        <Field label="Gestión por lote">
                            <input type="checkbox" checked={form.ficha.gestion_lote || form.requiere_lote} onChange={e => { setFicha('gestion_lote', e.target.checked); setField('requiere_lote', e.target.checked); }} style={{ width: 18, height: 18 }} />
                        </Field>
                        <Field label="Gestión por serie">
                            <input type="checkbox" checked={form.ficha.gestion_serie} onChange={e => setFicha('gestion_serie', e.target.checked)} style={{ width: 18, height: 18 }} />
                        </Field>
                        <Field label="¿Perecedero?">
                            <input type="checkbox" checked={form.es_perecedero} onChange={e => setField('es_perecedero', e.target.checked)} style={{ width: 18, height: 18 }} />
                        </Field>
                        <Field label="Días vida útil">
                            <input style={inp} type="number" value={form.dias_vida_util} onChange={e => setField('dias_vida_util', e.target.value)} disabled={!form.es_perecedero} />
                        </Field>
                        <Field label="Temperatura almacenamiento">
                            <input style={inp} value={form.ficha.temperatura_almacenamiento} onChange={e => setFicha('temperatura_almacenamiento', e.target.value)} placeholder="2°C - 8°C" />
                        </Field>
                        <Field label="Norma de calidad">
                            <input style={inp} value={form.ficha.norma_calidad} onChange={e => setFicha('norma_calidad', e.target.value)} />
                        </Field>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <Field label="Observaciones ficha técnica">
                                <textarea style={{ ...inp, minHeight: 60 }} value={form.ficha.observaciones} onChange={e => setFicha('observaciones', e.target.value)} />
                            </Field>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Package color="#667eea" size={28}/>
                        PRODUCTOS — Maestro de Materiales (SAP MM)
                    </h1>
                    <p style={{ color: '#64748b', margin: '0.35rem 0 0', fontSize: '0.875rem' }}>
                        Códigos de barras, empaque, clasificación, compras, ventas y MRP
                    </p>
                </div>
                <button onClick={() => openModal()} style={btnPri}><Plus size={16}/> Nuevo producto</button>
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Total productos', value: resumen.total_productos ?? '—', color: '#667eea' },
                    { label: 'Con ficha SAP', value: resumen.con_ficha_sap ?? '—', color: '#34d399' },
                    { label: 'Con código barras', value: resumen.con_codigo_barras ?? '—', color: '#fbbf24' },
                    { label: 'Sin ficha', value: resumen.sin_ficha ?? '—', color: '#f87171' },
                ].map(k => (
                    <div key={k.label} style={card}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: k.color }}>{k.value}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{k.label}</div>
                    </div>
                ))}
            </div>

            {/* Búsqueda por código de barras */}
            <div style={{ ...card, marginBottom: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <ScanLine size={20} color="#667eea"/>
                <input
                    style={{ ...inp, flex: 1, minWidth: 200 }}
                    placeholder="Escanear o escribir código de barras / SKU / GTIN..."
                    value={barcodeScan}
                    onChange={e => setBarcodeScan(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleBarcodeLookup()}
                />
                <button onClick={handleBarcodeLookup} style={btnPri}>Buscar</button>
            </div>

            {/* Filtros */}
            <div style={{ ...card, marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <Search size={18} color="#64748b"/>
                <input style={{ ...inp, flex: 1, minWidth: 180 }} placeholder="Buscar por nombre, SKU, marca, barras..."
                    value={search} onChange={e => setSearch(e.target.value)} />
                <select style={{ ...inp, width: 180 }} value={filterGrupo} onChange={e => setFilterGrupo(e.target.value)}>
                    <option value="">Todos los grupos</option>
                    {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                </select>
                <select style={{ ...inp, width: 180 }} value={filterTipo} onChange={e => setFilterTipo(e.target.value)}>
                    <option value="">Todos los tipos</option>
                    {TIPOS_PRODUCTO.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <button onClick={loadData} style={{ ...btnPri, background: '#334155' }}>Filtrar</button>
            </div>

            {error && <div style={{ background: '#7f1d1d', color: '#fecaca', padding: '0.75rem', borderRadius: 8, marginBottom: '1rem' }}>{error}</div>}

            {/* Tabla */}
            <div style={card}>
                {loading ? (
                    <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>Cargando maestro de productos...</p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                                    <th style={{ padding: '0.6rem', textAlign: 'left' }}>SKU</th>
                                    <th style={{ padding: '0.6rem', textAlign: 'left' }}>Nombre</th>
                                    <th style={{ padding: '0.6rem', textAlign: 'left' }}>Tipo</th>
                                    <th style={{ padding: '0.6rem', textAlign: 'left' }}>Grupo</th>
                                    <th style={{ padding: '0.6rem', textAlign: 'left' }}>Empaque</th>
                                    <th style={{ padding: '0.6rem', textAlign: 'left' }}>Cód. barras</th>
                                    <th style={{ padding: '0.6rem', textAlign: 'right' }}>Precio</th>
                                    <th style={{ padding: '0.6rem', textAlign: 'center' }}>Estado</th>
                                    <th style={{ padding: '0.6rem' }}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {productos.map(p => (
                                    <tr key={p.id} style={{ borderBottom: '1px solid #1e293b', color: '#e2e8f0' }}
                                        onMouseOver={e => e.currentTarget.style.background = '#0f172a'}
                                        onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                                        <td style={{ padding: '0.6rem', fontFamily: 'monospace', color: '#a5b4fc' }}>{p.codigo_sku}</td>
                                        <td style={{ padding: '0.6rem' }}>{p.nombre}</td>
                                        <td style={{ padding: '0.6rem', color: '#94a3b8', textTransform: 'capitalize' }}>{p.tipo_producto_display || p.tipo_producto?.replace('_', ' ') || '—'}</td>
                                        <td style={{ padding: '0.6rem', color: '#94a3b8' }}>{p.grupo_material_nombre || p.grupo_material || '—'}</td>
                                        <td style={{ padding: '0.6rem', color: '#94a3b8' }}>{p.tipo_empaque_nombre || p.tipo_empaque || '—'}</td>
                                        <td style={{ padding: '0.6rem' }}>
                                            {p.codigo_barras_principal
                                                ? <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: '#34d399' }}>{p.codigo_barras_principal}</span>
                                                : <span style={{ color: '#475569' }}>—</span>}
                                        </td>
                                        <td style={{ padding: '0.6rem', textAlign: 'right' }}>
                                            ${Number(p.precio_venta).toLocaleString('es-CO')}
                                        </td>
                                        <td style={{ padding: '0.6rem', textAlign: 'center' }}>
                                            <span style={{
                                                padding: '2px 8px', borderRadius: 12, fontSize: '0.72rem',
                                                background: p.activo ? '#064e3b' : '#374151',
                                                color: p.activo ? '#6ee7b7' : '#9ca3af',
                                            }}>{p.estado_material || (p.activo ? 'Activo' : 'Inactivo')}</span>
                                        </td>
                                        <td style={{ padding: '0.6rem' }}>
                                            <div style={{ display: 'flex', gap: '0.35rem' }}>
                                                <button onClick={() => openModal(p)} style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer' }}><Edit3 size={15}/></button>
                                                <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}><Trash2 size={15}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {productos.length === 0 && (
                                    <tr><td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No hay productos. Cree el primero.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal maestro SAP */}
            {modalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 10000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
                }}>
                    <div style={{
                        background: '#1e293b', borderRadius: 16, border: '1px solid #334155',
                        width: '100%', maxWidth: 900, maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                    }}>
                        <div style={{
                            padding: '1rem 1.25rem', borderBottom: '1px solid #334155',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <h2 style={{ color: '#f1f5f9', margin: 0, fontSize: '1.1rem' }}>
                                {current ? `Editar: ${current.codigo_sku}` : 'Nuevo producto — Maestro SAP'}
                            </h2>
                            <button onClick={() => setModalOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20}/></button>
                        </div>

                        {/* Tabs estilo SAP */}
                        <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid #334155', padding: '0 0.5rem' }}>
                            {TABS.map(tab => {
                                const Icon = tab.icon;
                                const active = activeTab === tab.id;
                                return (
                                    <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} style={{
                                        display: 'flex', alignItems: 'center', gap: '0.35rem',
                                        padding: '0.65rem 0.85rem', background: 'none', border: 'none',
                                        borderBottom: active ? '2px solid #667eea' : '2px solid transparent',
                                        color: active ? '#a5b4fc' : '#64748b', cursor: 'pointer',
                                        fontSize: '0.78rem', whiteSpace: 'nowrap', fontWeight: active ? 600 : 400,
                                    }}>
                                        <Icon size={14}/>{tab.label}
                                    </button>
                                );
                            })}
                        </div>

                        <form onSubmit={handleSave} style={{ flex: 1, overflow: 'auto', padding: '1.25rem' }}>
                            {renderTabContent()}
                        </form>

                        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <button type="button" onClick={() => setModalOpen(false)} style={{ ...btnPri, background: '#334155' }}>Cancelar</button>
                            <button onClick={handleSave} disabled={saving} style={btnPri}>
                                <Save size={16}/>{saving ? 'Guardando...' : 'Guardar producto'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
