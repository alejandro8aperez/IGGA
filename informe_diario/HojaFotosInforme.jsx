import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Camera, X, UploadCloud, Loader2 } from 'lucide-react';
import { API } from '@/config/api';

const HojaFotosInforme = ({ informeId, obraId }) => {
    const [fotos, setFotos] = useState({});
    const [loading, setLoading] = useState({});

    // Cargar fotos existentes al montar el componente
    useEffect(() => {
        const cargarFotos = async () => {
            try {
                // Si hay informeId, cargamos sus fotos. Si no, pero hay obraId, cargamos la galería de la obra.
                let url = `${API.INFORME_DIARIO.ANEXOS}`;
                if (informeId) {
                    url += `?informe=${informeId}`;
                } else if (obraId) {
                    // Soporte para selectores que envían el objeto completo {id, nombre...}
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

            <div className="grid grid-cols-4 gap-1.5 bg-slate-950/90 p-2 rounded-lg border border-slate-800 shadow-inner">
                {slots.map((num) => (
                    <div 
                        key={num} 
                        className={`relative aspect-square rounded border transition-all duration-200 flex items-center justify-center overflow-hidden
                            ${fotos[num] 
                                ? 'border-slate-600 bg-slate-800' 
                                : 'border-slate-800 border-dashed hover:border-blue-500/50 hover:bg-blue-500/5 bg-slate-900/30'
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
                                    alt={`Foto ${num}`} 
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button 
                                        onClick={() => handleDelete(num, fotos[num].id)}
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
                * Las imágenes se guardan automáticamente al ser seleccionadas.
            </div>
        </div>
    );
};

export default HojaFotosInforme;
