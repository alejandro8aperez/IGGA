import React, { useState, useEffect, useRef, useCallback } from 'react';
import axiosInstance, { BASE_URL } from '../../config/axiosConfig';
import { Camera, X, UploadCloud, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import { API } from '@/config/api';
import { anexoService } from '@/services/informeDiarioApi';

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
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '0.75rem',
  },
  slot: {
    position: 'relative',
    borderRadius: '8px',
    border: '2px dashed #1e293b',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    cursor: 'pointer',
    background: 'rgba(15,23,42,0.4)',
    transition: 'border-color 0.2s, background 0.2s',
    minHeight: 0,
  },
  slotFilled: {
    border: '2px solid #334155',
    background: '#1e293b',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    cursor: 'default',
  },
  slotEmpty: {
    aspectRatio: '1 / 1',
  },
  imgWrap: {
    width: '100%',
    aspectRatio: '1 / 1',
    overflow: 'hidden',
    flexShrink: 0,
    position: 'relative',
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
  descArea: {
    width: '100%',
    border: 'none',
    borderTop: '1px solid #1e293b',
    background: '#0f172a',
    color: '#cbd5e1',
    fontSize: '0.55rem',
    padding: '0.3rem 0.4rem',
    outline: 'none',
    resize: 'none',
    fontFamily: 'inherit',
    lineHeight: 1.3,
    minHeight: '2.2rem',
    maxHeight: '2.2rem',
    boxSizing: 'border-box',
    cursor: 'text',
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
  savedBadge: {
    position: 'absolute',
    bottom: '2.5rem',
    right: '4px',
    background: 'rgba(22,163,74,0.9)',
    padding: '1px 5px',
    borderRadius: '4px',
    fontSize: '0.4rem',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    zIndex: 10,
    pointerEvents: 'none',
  },
  loadingBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    height: '100%',
    minHeight: '120px',
  },
  loadingText: {
    fontSize: '0.5rem',
    color: '#60a5fa',
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  uploadLabel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    minHeight: '120px',
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
  footer: {
    marginTop: '1rem',
    fontSize: '0.6rem',
    color: '#475569',
    fontStyle: 'italic',
    textAlign: 'center',
  },
};

function getImageUrl(src) {
  if (!src) return null;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  const base = BASE_URL.replace(/\/api\/?$/, '').replace(/\/+$/, '');
  const path = src.startsWith('/') ? src : '/' + src;
  return base + path;
}

export function imprimirFotos(fotos, informe, layout = '4x6') {
  const fotosLlenas = Object.entries(fotos)
    .sort(([a], [b]) => Number(a) - Number(b))
    .filter(([, f]) => f?.imagen_url || f?.imagen);

  if (fotosLlenas.length === 0) {
    toast.warning('No hay fotos para imprimir.');
    return;
  }

  const es4x12 = layout === '4x12';
  const fecha = informe?.fecha       || new Date().toLocaleDateString('es-CO');
  const obra  = informe?.proyecto_nombre || 'Informe Diario';
  const cod   = 'F-141-IN';

  function chunkFotos(arr, size) {
    const result = [];
    for (let i = 0; i < arr.length; i += size) result.push(arr.slice(i, i + size));
    return result;
  }

  const fotosHTML = fotosLlenas.map(([num, f]) => {
    const src  = getImageUrl(f.imagen_url || f.imagen);
    const desc = f.descripcion || '';
    const sec  = f.seccion_display || '';
    return `
      <div class="foto-card${es4x12 ? ' compact' : ''}">
        <img src="${src}" alt="Foto ${num}" />
        <div class="foto-info${es4x12 ? ' compact' : ''}">
          <span class="foto-num">${String(num).padStart(2, '0')}</span>
          ${sec  ? `<span class="foto-sec">${sec}</span>`  : ''}
          ${desc ? `<span class="foto-desc">${desc}</span>` : ''}
        </div>
      </div>
    `;
  });

  const fotosPorPagina = es4x12 ? 48 : 24;
  const paginas = chunkFotos(fotosHTML, fotosPorPagina);

  const paginaHTML = paginas.map((fotosPagina, idx) => `
    <div class="page">
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
      <div class="count-bar">Pág. ${idx + 1} de ${paginas.length} — ${fotosPagina.length} fotografía${fotosPagina.length !== 1 ? 's' : ''}</div>
      <div class="fotos-grid">${fotosPagina.join('')}</div>
      <div class="footer${es4x12 ? ' compact' : ''}">
        <span>Generado: ${new Date().toLocaleString('es-CO')}</span>
        <span>${cod} — ${obra} — ${fecha} — Matriz ${layout}</span>
      </div>
    </div>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Registro Fotográfico — ${obra}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 10px; color: #1e293b; background: #fff; }
    .page { page-break-after: always; }
    .page:last-child { page-break-after: auto; }
    .header { display: flex; align-items: stretch; border: 2px solid #1B3A5C; border-radius: ${es4x12 ? '4' : '6'}px; overflow: hidden; margin-bottom: ${es4x12 ? '6' : '14'}px; }
    .header-logo { background: #1B3A5C; color: #fff; font-size: ${es4x12 ? '14' : '22'}px; font-weight: 900; letter-spacing: 0.08em; padding: ${es4x12 ? '4 10' : '10 18'}px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: ${es4x12 ? '50' : '80'}px; }
    .header-logo span { font-size: ${es4x12 ? '5' : '8'}px; font-weight: 400; letter-spacing: 0.1em; margin-top: 1px; opacity: 0.8; }
    .header-info { flex: 1; padding: ${es4x12 ? '4 8' : '8 14'}px; display: flex; flex-direction: column; justify-content: center; gap: ${es4x12 ? '1' : '3'}px; border-left: 3px solid #1B3A5C; }
    .header-title { font-size: ${es4x12 ? '8' : '11'}px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #1B3A5C; }
    .header-meta { display: flex; gap: ${es4x12 ? '8' : '20'}px; font-size: ${es4x12 ? '6' : '9'}px; color: #475569; }
    .header-meta strong { color: #1e293b; }
    .header-cod { margin-left: auto; font-size: ${es4x12 ? '5' : '8'}px; font-family: monospace; color: #94a3b8; text-align: right; padding: ${es4x12 ? '4 8' : '8 12'}px; display: flex; flex-direction: column; justify-content: center; gap: ${es4x12 ? '1' : '2'}px; }
    .count-bar { font-size: ${es4x12 ? '6' : '8'}px; color: #64748b; margin-bottom: ${es4x12 ? '4' : '10'}px; text-align: right; text-transform: uppercase; letter-spacing: 0.06em; }
    .fotos-grid { display: grid; grid-template-columns: repeat(${es4x12 ? '4' : '4'}, 1fr); gap: ${es4x12 ? '3px' : '8px'}; }
    .foto-card { border: 1px solid #e2e8f0; border-radius: ${es4x12 ? '2' : '5'}px; overflow: hidden; break-inside: avoid; }
    .foto-card.compact { border-radius: 2px; }
    .foto-card img { width: 100%; aspect-ratio: ${es4x12 ? '4 / 3' : '1 / 1'}; object-fit: cover; display: block; }
    .foto-card.compact img { aspect-ratio: 4 / 3; }
    .foto-info { padding: 4px 5px; background: #f8fafc; display: flex; flex-direction: column; gap: 1px; }
    .foto-info.compact { padding: 1px 3px; gap: 0; }
    .foto-num { font-family: monospace; font-size: ${es4x12 ? '5' : '8'}px; font-weight: 700; color: #1B3A5C; }
    .foto-info.compact .foto-num { font-size: 5px; }
    .foto-sec { font-size: ${es4x12 ? '5' : '7'}px; font-weight: 700; text-transform: uppercase; color: #7c3aed; letter-spacing: 0.04em; }
    .foto-info.compact .foto-sec { font-size: 4px; }
    .foto-desc { font-size: ${es4x12 ? '5' : '8'}px; color: #334155; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .foto-info.compact .foto-desc { font-size: 5px; }
    .footer { margin-top: ${es4x12 ? '6' : '16'}px; border-top: 1px solid #e2e8f0; padding-top: ${es4x12 ? '3' : '8'}px; display: flex; justify-content: space-between; font-size: ${es4x12 ? '5' : '8'}px; color: #94a3b8; }
    .footer.compact { margin-top: 4px; padding-top: 2px; font-size: 5px; }
    @media print { @page { size: A4 landscape; margin: ${es4x12 ? '5mm' : '12mm'}; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  ${paginaHTML}
  <script>
    var _impreso = false;
    function _print() { if (_impreso) return; _impreso = true; window.print(); window.onafterprint = function() { window.close(); }; }
    window.onload = _print;
    setTimeout(_print, 5000);
  <\/script>
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

const HojaFotosInforme = ({ informeId, obraId, informe, onFotosChange, onAutoSave, startSlot = 1 }) => {
  const [fotos, setFotos]        = useState({});
  const [loading, setLoading]    = useState({});
  const [hovered, setHovered]    = useState(null);
  const [savingDesc, setSavingDesc] = useState({});
  const [errored, setErrored]    = useState({});
  const [cols, setCols]          = useState(3);
  const descTimers = useRef({});
  const fileRefs = useRef({});

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
        setErrored({});
        onFotosChange?.(mapa);
      } catch (err) {
        console.error('Error cargando fotos:', err);
      }
    };
    cargarFotos();
  }, [informeId, obraId]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const handler = e => setCols(e.matches ? 2 : 3);
    handler(mq);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleUpload = async (posicion, file) => {
    if (!file) return;
    let id = informeId;
    if (!id) {
      if (!onAutoSave) { toast.error('Debe guardar el informe antes de subir fotografías.'); return; }
      id = await onAutoSave();
      if (!id) { toast.error('No se pudo guardar el informe automáticamente.'); return; }
    }
    setLoading(prev => ({ ...prev, [posicion]: true }));
    const formData = new FormData();
    formData.append('imagen',   file);
    formData.append('informe',  id);
    formData.append('posicion', posicion);
    formData.append('seccion',  'actividades');
    formData.append('descripcion', '');
    try {
      const res = await axiosInstance.post(API.INFORME_DIARIO.ANEXOS, formData, {
        headers: { 'Content-Type': undefined },
      });
      const updated = { ...fotos, [posicion]: res.data };
      setFotos(updated);
      setErrored(prev => { const n = { ...prev }; delete n[posicion]; return n; });
      onFotosChange?.(updated);
      toast.success(`Foto ${posicion} subida correctamente`);
    } catch (err) {
      const detail = err?.response?.data ? JSON.stringify(err.response.data) : err.message;
      toast.error(`Error al subir la foto en posición ${posicion}: ${detail}`);
    } finally {
      setLoading(prev => ({ ...prev, [posicion]: false }));
    }
  };

  const handleDelete = async (posicion, fotoId) => {
    if (!window.confirm('¿Eliminar esta fotografía?')) return;
    try {
      await axiosInstance.delete(`${API.INFORME_DIARIO.ANEXOS}${fotoId}/`);
      const updated = { ...fotos };
      delete updated[posicion];
      setFotos(updated);
      onFotosChange?.(updated);
      toast.success('Fotografía eliminada');
    } catch {
      toast.error('No se pudo eliminar la foto.');
    }
  };

  const handleDescChange = useCallback((posicion, value) => {
    const updated = { ...fotos, [posicion]: { ...fotos[posicion], descripcion: value } };
    setFotos(updated);

    if (descTimers.current[posicion]) {
      clearTimeout(descTimers.current[posicion]);
    }
    descTimers.current[posicion] = setTimeout(() => {
      const foto = updated[posicion];
      if (foto?.id) {
        setSavingDesc(prev => ({ ...prev, [posicion]: true }));
        anexoService.update(foto.id, { descripcion: value })
          .then(() => {
            setTimeout(() => {
              setSavingDesc(prev => ({ ...prev, [posicion]: false }));
            }, 800);
          })
          .catch(() => {
            setSavingDesc(prev => ({ ...prev, [posicion]: false }));
            toast.error('Error al guardar la descripción');
          });
      }
    }, 1200);
  }, [fotos]);

  const fotasLlenas = Object.keys(fotos).length;
  const slots = Array.from({ length: 24 }, (_, i) => startSlot + i);

  return (
    <div style={S.wrapper}>
      <div style={S.header}>
        <div>
          <h2 style={S.title}>F-141-IN: Registro Fotográfico</h2>
          <p style={S.subtitle}>Grid 3×8 — {fotasLlenas}/24 fotos (slots {startSlot}–{startSlot + 23})</p>
        </div>
        <Camera color="#3b82f6" size={32} />
      </div>

      <div style={{ ...S.grid, gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {slots.map(num => {
          const isFilled  = !!fotos[num];
          const isLoading = !!loading[num];
          const isHov     = hovered === num;
          const fotoData  = fotos[num];
          const isSaving  = !!savingDesc[num];

          return (
            <div
              key={num}
              style={{
                ...S.slot,
                ...(isFilled ? S.slotFilled : {}),
                ...(!isFilled && !isLoading ? S.slotEmpty : {}),
              }}
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
                  <div style={S.imgWrap}>
                    {errored[num] ? (
                      <div style={{ ...S.loadingBox, minHeight: '100%' }}>
                        <UploadCloud color="#ef4444" size={22} />
                        <span style={{ ...S.loadingText, color: '#ef4444' }}>Foto no disponible</span>
                      </div>
                    ) : (
                      <img
                        src={getImageUrl(fotoData.imagen_url || fotoData.imagen)}
                        alt={`Foto ${num}`}
                        style={{ ...S.img, cursor: 'zoom-in' }}
                        loading="lazy"
                        onError={() => setErrored(prev => ({ ...prev, [num]: true }))}
                        onDoubleClick={() => window.open(getImageUrl(fotoData.imagen_url || fotoData.imagen), '_blank')}
                      />
                    )}
                    <div style={{ ...S.overlay, background: isHov ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0)' }}>
                      <button
                        onClick={() => handleDelete(num, fotoData.id)}
                        style={{ ...S.deleteBtn, opacity: isHov ? 1 : 0 }}
                        title="Eliminar"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                  <textarea
                    value={fotoData.descripcion || ''}
                    onChange={e => handleDescChange(num, e.target.value)}
                    onClick={e => e.stopPropagation()}
                    placeholder="Descripción..."
                    style={S.descArea}
                    rows={1}
                  />
                  {isSaving && (
                    <div style={S.savedBadge}>
                      <Loader2 size={8} style={{ animation: 'spin 1s linear infinite' }} />
                      Guardando
                    </div>
                  )}
                  <div style={S.badge}>{String(num).padStart(2, '0')}</div>
                </>
              ) : (
                <div
                  style={S.uploadLabel}
                  onClick={() => fileRefs.current[num]?.click()}
                >
                  <UploadCloud color={isHov ? '#3b82f6' : '#334155'} size={22} />
                  <span style={{ ...S.uploadText, color: isHov ? '#60a5fa' : '#475569' }}>
                    Subir {num}
                  </span>
                  <input
                    ref={el => { if (el) fileRefs.current[num] = el; }}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => {
                      if (e.target.files?.[0]) {
                        handleUpload(num, e.target.files[0]);
                        // Reset value so mobile fires change event next time
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <p style={S.footer}>* Las imágenes se guardan automáticamente al ser seleccionadas. Escribí la descripción y se guarda automáticamente.</p>
    </div>
  );
};

export default HojaFotosInforme;
