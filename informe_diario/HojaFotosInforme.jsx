import React, { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';
import { Camera, X, UploadCloud, Loader2, Pencil } from 'lucide-react';
import { API } from '@/config/api';

const HojaFotosInforme = ({ informeId, obraId }) => {
    const [fotos, setFotos] = useState({});
    const [loading, setLoading] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState("");
    const debounceRef = useRef(null);

    // Cargar fotos existentes al montar el componente
    useEffect(() => {
        const cargarFotos = async () => {
            try {
                let url = `${API.INFORME_DIARIO.ANEXOS}`;
                if (informeId) {
                    url += `?informe=${informeId}`;
                } else if (obraId) {
                    const oid = typeof obraId === 'object' ? obraId.id : obraId;
                    if (oid) url += `?obra=${oid}`;
                    else return;
                } else {
                    return;
                }

                const res = await axios.get(url);
                const mapaFotos = {};
                res.data.forEach(f => {
                    if (f.posicion > 0) mapaFotos[f.posicion] = f;
                });
                setFotos(mapaFotos);
            } catch (err) {
                console.error("Error cargando fotos:", err);
            }
        };
        cargarFotos();
    }, [informeId, obraId]);

    const handleUpload = async (posicion, file) => {
        if (!file || !informeId) {
            if (!informeId) alert("Debe guardar el informe antes de subir fotografías.");
            return;
        }

        setLoading(prev => ({ ...prev, [posicion]: true }));
        const formData = new FormData();
        formData.append('imagen', file);
        formData.append('informe', informeId);
        formData.append('posicion', posicion);
        formData.append('seccion', 'actividades');

        try {
            const res = await axios.post(API.INFORME_DIARIO.ANEXOS, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFotos(prev => ({ ...prev, [posicion]: res.data }));
        } catch (err) {
            alert(`Error al subir la foto en posición ${posicion}`);
        } finally {
            setLoading(prev => ({ ...prev, [posicion]: false }));
        }
    };

    const handleDelete = async (posicion, fotoId) => {
        if (!window.confirm("¿Eliminar esta fotografía?")) return;
        try {
            await axios.delete(`${API.INFORME_DIARIO.ANEXOS}${fotoId}/`);
            const nuevasFotos = { ...fotos };
            delete nuevasFotos[posicion];
            setFotos(nuevasFotos);
        } catch (err) {
            alert("No se pudo eliminar la foto.");
        }
    };

    // ── EDICIÓN INLINE DE DESCRIPCIÓN ──────────────────────────────
    const startEdit = (foto) => {
        setEditingId(foto.id);
        setEditValue(foto.descripcion || "");
    };

    const saveDescripcion = useCallback(async (id, value) => {
        try {
            await axios.patch(`${API.INFORME_DIARIO.ANEXOS}${id}/`, {
                descripcion: value.trim()
            }, {
                headers: { 'Content-Type': 'application/json' }
            });
            setFotos(prev => {
                const nuevas = { ...prev };
                Object.keys(nuevas).forEach(key => {
                    if (nuevas[key].id === id) {
                        nuevas[key] = { ...nuevas[key], descripcion: value.trim() };
                    }
                });
                return nuevas;
            });
            setEditingId(null);
        } catch (err) {
            console.error("Error guardando descripción:", err);
            alert("No se pudo guardar la descripción.");
        }
    }, []);

    const handleChangeEdit = (e) => {
        const val = e.target.value;
        setEditValue(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            if (editingId) saveDescripcion(editingId, val);
        }, 800);
    };

    const handleBlur = (id) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        saveDescripcion(id, editValue);
    };

    const handleKeyDown = (e, id) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (debounceRef.current) clearTimeout(debounceRef.current);
            saveDescripcion(id, editValue);
        }
        if (e.key === "Escape") {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            setEditingId(null);
        }
    };
    // ────────────────────────────────────────────────────────────────

    // Generamos los 24 slots (4 columnas x 6 filas)
    const slots = Array.from({ length: 24 }, (_, i) => i + 1);

    return (
        <div className="p-6 bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white uppercase tracking-wider">F-141-IN: Registro Fotográfico</h2>
                    <p className="text-blue-400/80 text-[10px] font-mono uppercase tracking-widest">Standard Grid Layout 4x6</p>
                </div>
                <Camera className="text-blue-500" size={32} />
            </div>

            <div className="grid grid-cols-4 gap-2 bg-slate-950/80 p-3 rounded-xl shadow-2xl border border-slate-800/50">
                {slots.map((num) => (
                    <div 
                        key={num} 
                        className={`relative group aspect-square rounded-lg border-2 transition-all duration-200 flex items-center justify-center overflow-hidden
                            ${fotos[num] 
                                ? 'border-slate-700 bg-slate-800 shadow-md' 
                                : 'border-slate-800/50 border-dashed hover:border-blue-500/50 hover:bg-blue-500/10 bg-slate-900/40'
                            }`}
                    >
                        {loading[num] ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="animate-spin text-blue-500" size={20} />
                                <span className="text-[8px] text-blue-400 font-bold animate-pulse">SUBIENDO...</span>
                            </div>
                        ) : fotos[num] ? (
                            <>
                                <img 
                                    src={fotos[num].imagen_url || fotos[num].imagen} 
                                    alt={fotos[num].descripcion || `Foto ${num}`} 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                    {/* Descripción editable inline */}
                                    {editingId === fotos[num].id ? (
                                        <input
                                            autoFocus
                                            value={editValue}
                                            onChange={handleChangeEdit}
                                            onBlur={() => handleBlur(fotos[num].id)}
                                            onKeyDown={(e) => handleKeyDown(e, fotos[num].id)}
                                            placeholder="Descripción..."
                                            className="w-[90%] px-2 py-1 text-[10px] rounded bg-white/90 text-slate-900 outline-none"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    ) : (
                                        <div
                                            onClick={(e) => { e.stopPropagation(); startEdit(fotos[num]); }}
                                            className="w-[90%] px-2 py-1 text-[10px] text-white text-center cursor-text truncate"
                                            title="Click para editar descripción"
                                        >
                                            {fotos[num].descripcion ? (
                                                <span className="font-medium">{fotos[num].descripcion}</span>
                                            ) : (
                                                <span className="italic text-white/60">Sin descripción — click para agregar</span>
                                            )}
                                        </div>
                                    )}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleDelete(num, fotos[num].id); }}
                                        className="bg-red-500/90 p-1.5 rounded-full text-white shadow-xl"
                                        title="Eliminar"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <label className="w-full h-full cursor-pointer flex items-center justify-center group">
                                <UploadCloud className="text-slate-700 group-hover:text-blue-500 transition-colors" size={20} />
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => handleUpload(num, e.target.files[0])}
                                />
                            </label>
                        )}
                        {/* Indicador de número de slot */}
                        <div className="absolute top-1 left-1 bg-slate-900/80 px-1 rounded text-[7px] text-slate-400 font-mono z-10 border border-white/5">
                            {num.toString().padStart(2, '0')}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 text-[10px] text-slate-500 italic text-center">
                * Las imágenes se guardan automáticamente al ser seleccionadas. Click en la descripción para editarla.
            </div>
        </div>
    );
};

export default HojaFotosInforme;
