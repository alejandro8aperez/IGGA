import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Camera, X, UploadCloud, Loader2 } from 'lucide-react';
import API from '../config/api';

const HojaFotosInforme = ({ informeId }) => {
    const [fotos, setFotos] = useState({});
    const [loading, setLoading] = useState({});

    // Cargar fotos existentes al montar el componente
    useEffect(() => {
        const cargarFotos = async () => {
            try {
                const res = await axios.get(`${API.INFORME_DIARIO.ANEXOS}?informe=${informeId}`);
                const mapaFotos = {};
                res.data.forEach(f => {
                    if (f.posicion) mapaFotos[f.posicion] = f;
                });
                setFotos(mapaFotos);
            } catch (err) {
                console.error("Error cargando fotos:", err);
            }
        };
        if (informeId) cargarFotos();
    }, [informeId]);

    const handleUpload = async (posicion, file) => {
        if (!file) return;
        
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
        <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-white uppercase tracking-wider">F-141-IN: Registro Fotográfico</h2>
                    <p className="text-slate-400 text-xs">Cuadrícula Técnica Estándar (4x6)</p>
                </div>
                <Camera className="text-blue-500" size={32} />
            </div>

            <div className="grid grid-cols-4 gap-3 bg-slate-950 p-4 rounded-lg">
                {slots.map((num) => (
                    <div key={num} className="relative group aspect-square rounded-md border border-slate-700 bg-slate-800 overflow-hidden flex items-center justify-center">
                        {loading[num] ? (
                            <Loader2 className="animate-spin text-blue-500" />
                        ) : fotos[num] ? (
                            <>
                                <img 
                                    src={fotos[num].imagen} 
                                    alt={`Foto ${num}`} 
                                    className="w-full h-full object-cover"
                                />
                                <button 
                                    onClick={() => handleDelete(num, fotos[num].id)}
                                    className="absolute top-1 right-1 bg-red-600 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                >
                                    <X size={14} />
                                </button>
                            </>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-slate-700 transition-all">
                                <UploadCloud className="text-slate-500 mb-1" size={20} />
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Foto {num}</span>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => handleUpload(num, e.target.files[0])}
                                />
                            </label>
                        )}
                        {/* Indicador de número de slot */}
                        <div className="absolute bottom-0 left-0 bg-black/60 px-1.5 text-[9px] text-white font-mono">
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