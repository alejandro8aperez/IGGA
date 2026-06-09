import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosConfig';
import { Camera, X, UploadCloud, Loader2, Printer } from 'lucide-react';
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
  printBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    background: '#1B3A5C',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 18px',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(27,58,92,0.35)',
    letterSpacing: '0.03em',
    transition: 'background 0.15s',
  },
};

// ── Función de impresión ───────────────────────────────────────────────────
function imprimirFotos(fotos, informe) {
  const fotosLlenas = Object.entries(fotos)
    .sort(([a], [b]) => Number(a) - Number(b))
    .filter(([, f]) => f?.imagen_url || f?.imagen);

  if (fotosLlenas.length === 0) {
    toast.warning('No hay fotos para imprimir.');
    return;
  }

  const fecha  = informe?.fecha        || new Date().toLocaleDateString('es-CO');
  const obra   = informe?.obra_nombre  || 'Informe Diario';
  const cod    = 'F-141-IN';

  const fotosHTML = fotosLlenas.map(([num, f]) => {
    const src  = f.imagen_url || f.imagen;
    const desc = f.descripcion || '';
    const sec  = f.seccion_display || '';
    return `
      <div class="foto-card">
        <img src="${src}" alt="Foto ${num}" />
        <div class="foto-info">
          <span class="foto-num">${String(num).padStart(2, '0')}</span>
          ${sec  ? `<span class="foto-sec">${sec}</span>`  : ''}
          ${desc ? `<span class="foto-desc">${desc}</span>` : ''}
        </div>
      </div>
    `;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Registro Fotográfico — ${obra}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 10px; color: #1e293b; background: #fff; }
    .header { display: flex; align-items: stretch; border: 2px solid #1B3A5C; border-radius: 6px; overflow: hidden; margin-bottom: 14px; }
    .header-logo { background: #1B3A5C; color: #fff; font-size: 22px; font-weight: 900; letter-spacing: 0.08em; padding: 10px 18px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 80px; }
    .header-logo span { font-size: 8px; font-weight: 400; letter-spacing: 0.1em; margin-top: 2px; opacity: 0.8; }
    .header-info { flex: 1; padding: 8px 14px; display: flex; flex-direction: column; justify-content: center; gap: 3px; border-left: 3px solid #1B3A5C; }
    .header-title { font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #1B3A5C; }
    .header-meta { display: flex; gap: 20px; font-size: 9px; color: #475569; }
    .header-meta strong { color: #1e293b; }
    .header-cod { margin-left: auto; font-size: 8px; font-family: monospace; color: #94a3b8; text-align: right; padding: 8px 12px; display: flex; flex-direction: column; justify-content: center; gap: 2px; }
    .count-bar { font-size: 8px; color: #64748b; margin-bottom: 10px; text-align: right; text-transform: uppercase; letter-spacing: 0.06em; }
    .fotos-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
    .foto-card { border: 1px solid #e2e8f0; border-radius: 5px; overflow: hidden; break-inside: avoid; }
    .foto-card img { width: 100%; aspect-ratio: 1 / 1; object-fit: cover; display: block; }
    .foto-info { padding: 4px 5px; background: #f8fafc; display: flex; flex-direction: column; gap: 1px; }
    .foto-num { font-family: monospace; font-size: 8px; font-weight: 700; color: #1B3A5C; }
    .foto-sec { font-size: 7px; font-weight: 700; text-transform: uppercase; color: #7c3aed; letter-spacing: 0.04em; }
    .foto-desc { font-size: 8px; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .footer { margin-top: 16px; border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; justify-content: space-between; font-size: 8px; color: #94a3b8; }
    @media print { @page { size: A4 landscape; margin: 12mm; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-logo">IGGA<span>INTERVENTORÍA</span></div>
    <div class="header-info">
      <div class="header-title">Registro Fotográfico de Obra</div>
      <div class="header-meta">
        <div><strong>OBRA:</strong> ${obra}</div>
        <div><strong>FECHA:</strong> ${fecha}</div>
      </div>
    </div>
    <div class="header-cod">
      <div>${cod}</div>
      <div>F. Emisión: 27/08/2009</div>
      <div>Mod: 00</div>
    </div>
  </div>
  <div class="count-bar">${fotosLlenas.length} fotografía${fotosLlenas.length !== 1 ? 's' : ''} registrada${fotosLlenas.length !== 1 ? 's' : ''}</div>
  <div class="fotos-grid">${fotosHTML}</div>
  <div class="footer">
    <span>Generado: ${new Date().toLocaleString('es-CO')}</span>
    <span>${cod} — ${obra} — ${fecha}</span>
  </div>
  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); };<\/script>
</body>
</html>`;

  const ventana = window.open('', '_blank', 'width=1100,height=750');
  if (!ventana) {
    toast.error('El navegador bloqueó la ventana emergente. Permite las ventanas emergentes para este sitio.');
    return;
  }
  ventana.document.write(html);
  ventana.document.close();
}

// ── Componente ────────────────────────────────────────────────────────────────
const HojaFotosInforme = ({ informeId, obraId, informe }) => {
  const [fotos, setFotos]     = useState({});
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
        const res = await axiosInstance.get(url);
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
    formData.append('imagen',   file);
    formData.append('informe',  informeId);
    formData.append('posicion', posicion);
    formData.append('seccion',  'actividades');
    try {
      const res = await axiosInstance.post(API.INFORME_DIARIO.ANEXOS, formData, {
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
      await axiosInstance.delete(`${API.INFORME_DIARIO.ANEXOS}${fotoId}/`);
      setFotos(prev => { const n = { ...prev }; delete n[posicion]; return n; });
      toast.success('Fotografía eliminada');
    } catch {
      toast.error('No se pudo eliminar la foto.');
    }
  };

  const fotasLlenas = Object.keys(fotos).length;
  const slots = Array.from({ length: 24 }, (_, i) => i + 1);

  return (
    <div style={S.wrapper}>
      <div style={S.header}>
        <div>
          <h2 style={S.title}>F-141-IN: Registro Fotográfico</h2>
          <p style={S.subtitle}>Standard Grid Layout 4×6 — {fotasLlenas}/24 fotos</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            style={S.printBtn}
            onClick={() => imprimirFotos(fotos, informe)}
            title="Imprimir registro fotográfico"
          >
            <Printer size={15} />
            Imprimir Fotos
          </button>
          <Camera color="#3b82f6" size={32} />
        </div>
      </div>

      <div style={S.grid}>
        {slots.map(num => {
          const isFilled  = !!fotos[num];
          const isLoading = !!loading[num];
          const isHov     = hovered === num;

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
