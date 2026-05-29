import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Camera, X, UploadCloud, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { API } from '@/config/api';

const S = {
  wrapper: {
    padding: '1.5rem',
    background: 'rgba(15,23,42,0.5)',
    borderRadius: '12px',
    border: '1px solid #1e293b',
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
  },
  title: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: 800,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  subtitle: {
    margin: 0,
    fontSize: '0.6rem',
    color: 'rgba(96,165,250,0.8)',
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.5rem',
    background: '#020617',
    padding: '0.75rem',
    borderRadius: '12px',
    border: '1px solid #1e293b',
  },
  slotBase: {
    position: 'relative',
    aspectRatio: '1 / 1',
    borderRadius: '8px',
    border: '2px dashed #1e293b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    cursor: 'pointer',
    background: 'rgba(15,23,42,0.4)',
    transition: 'border-color 0.2s, background 0.2s',
  },
  slotFilled: {
    border: '2px solid #334155',
    background: '#1e293b',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  loadingText: {
    fontSize: '0.5rem',
    color: '#60a5fa',
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  overlay: {
    position: 'absolute',
    inset: 0,
    background: 'rgba(0,0,0,0)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
  },
  deleteBtn: {
    background: '#ef4444',
    border: 'none',
    borderRadius: '50%',
    width: '2rem',
    height: '2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
    opacity: 0,
    transition: 'opacity 0.2s',
  },
  uploadLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    cursor: 'pointer',
    gap: '0.25rem',
  },
  uploadText: {
    fontSize: '0.5rem',
    fontWeight: 700,
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  badge: {
    position: 'absolute',
    top: '4px',
    left: '4px',
    background: 'rgba(2,6,23,0.8)',
    padding: '1px 4px',
    borderRadius: '4px',
    fontSize: '0.45rem',
    color: '#94a3b8',
    fontFamily: 'monospace',
    zIndex: 10,
    pointerEvents: 'none',
  },
  footer: {
    marginTop: '1rem',
    fontSize: '0.6rem',
    color: '#475569',
    fontStyle: 'italic',
    textAlign: 'center',
  },
};

const HojaFotosInforme = ({ informeId, obraId }) => {
  const [fotos, setFotos] = useState({});
  const [loading, setLoading] = useState({});
  const [hovered, setHovered] = useState(null);

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
        const mapa = {};
        res.data.forEach(f => { if (f.posicion > 0) mapa[f.posicion] = f; });
        setFotos(mapa);
      } catch (err) {
        console.error('Error cargando fotos:', err);
      }
    };
    cargarFotos();
  }, [informeId, obraId]);

  const handleUpload = async (posicion, file) => {
    if (!file) return;
    if (!informeId) { toast.error('Debe guardar el informe antes de subir fotografías.'); return; }
    setLoading(prev => ({ ...prev, [posicion]: true }));
    const formData = new FormData();
    formData.append('imagen', file);
    formData.append('informe', informeId);
    formData.append('posicion', posicion);
    formData.append('seccion', 'actividades');
    try {
      const res = await axios.post(API.INFORME_DIARIO.ANEXOS, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFotos(prev => ({ ...prev, [posicion]: res.data }));
      toast.success(`Foto ${posicion} subida correctamente`);
    } catch {
      toast.error(`Error al subir la foto en posición ${posicion}`);
    } finally {
      setLoading(prev => ({ ...prev, [posicion]: false }));
    }
  };

  const handleDelete = async (posicion, fotoId) => {
    if (!window.confirm('¿Eliminar esta fotografía?')) return;
    try {
      await axios.delete(`${API.INFORME_DIARIO.ANEXOS}${fotoId}/`);
      setFotos(prev => { const n = { ...prev }; delete n[posicion]; return n; });
      toast.success('Fotografía eliminada');
    } catch {
      toast.error('No se pudo eliminar la foto.');
    }
  };

  const slots = Array.from({ length: 24 }, (_, i) => i + 1);

  return (
    <div style={S.wrapper}>
      <div style={S.header}>
        <div>
          <h2 style={S.title}>F-141-IN: Registro Fotográfico</h2>
          <p style={S.subtitle}>Standard Grid Layout 4×6</p>
        </div>
        <Camera color="#3b82f6" size={32} />
      </div>

      <div style={S.grid}>
        {slots.map(num => {
          const isFilled = !!fotos[num];
          const isLoading = !!loading[num];
          const isHov = hovered === num;

          return (
            <div
              key={num}
              style={{ ...S.slotBase, ...(isFilled ? S.slotFilled : {}) }}
              onMouseEnter={() => setHovered(num)}
              onMouseLeave={() => setHovered(null)}
            >
              {isLoading ? (
                <div style={S.loadingBox}>
                  <Loader2 color="#3b82f6" size={20} style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={S.loadingText}>Subiendo…</span>
                </div>
              ) : isFilled ? (
                <>
                  <img
                    src={fotos[num].imagen_url || fotos[num].imagen}
                    alt={`Foto ${num}`}
                    style={S.img}
                  />
                  <div style={{ ...S.overlay, background: isHov ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0)' }}>
                    <button
                      onClick={() => handleDelete(num, fotos[num].id)}
                      style={{ ...S.deleteBtn, opacity: isHov ? 1 : 0 }}
                      title="Eliminar"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </>
              ) : (
                <label style={S.uploadLabel}>
                  <UploadCloud color={isHov ? '#3b82f6' : '#334155'} size={22} />
                  <span style={{ ...S.uploadText, color: isHov ? '#60a5fa' : '#475569' }}>
                    Subir {num}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => handleUpload(num, e.target.files[0])}
                  />
                </label>
              )}
              <div style={S.badge}>{String(num).padStart(2, '0')}</div>
            </div>
          );
        })}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <p style={S.footer}>* Las imágenes se guardan automáticamente al ser seleccionadas.</p>
    </div>
  );
};

export default HojaFotosInforme;
