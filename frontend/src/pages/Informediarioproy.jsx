import { useState, useRef } from "react";
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ClipboardList, LayoutDashboard, BookOpen, Plus,
  Image as ImageIcon, ArrowLeft, Package, Loader2,
  BarChart2, Printer, Pencil, UploadCloud, X
} from "lucide-react";

import InformeDashboard  from "@/components/informe-diario/InformeDashboard";
import InformeLista      from "@/components/informe-diario/InformeLista";
import InformeFormulario from "@/components/informe-diario/InformeFormulario";
import HojaFotosInforme  from "@/components/informe-diario/HojaFotosInforme";
import ReportesInforme   from "@/components/informe-diario/ReportesInforme";

import axios from "axios";
import { toast, Toaster } from "sonner";
import { useNavigate } from "react-router-dom";
import { API } from "@/config/api";
import { informeDiarioService } from "@/services/informeDiarioApi";

const queryClient = new QueryClient();

const C = {
  pageBg: "#f1f5f9", white: "#ffffff", topBar: "#ffffff",
  border: "#e2e8f0", borderLight: "#f1f5f9",
  text: "#1e293b", textMuted: "#64748b", textFaint: "#94a3b8",
  primary: "#ec4899", primaryShadow: "rgba(236,72,153,0.3)",
  indigo: "#6366f1", skeleton: "#e2e8f0",
};

// ── Helper: normalizar respuesta de API a array ─────────────────────────
function normalizeArray(data) {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  if (data?.data && Array.isArray(data.data)) return data.data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    // Si es un objeto con keys numéricas, convertir a array
    const keys = Object.keys(data);
    if (keys.length > 0 && keys.every(k => !isNaN(Number(k)))) {
      return keys.map(k => data[k]);
    }
  }
  return [];
}

// ── Función de impresión de fotos ─────────────────────────────────────────
function imprimirFotos(fotos, informe) {
  const fotosLlenas = Object.entries(fotos)
    .sort(([a], [b]) => Number(a) - Number(b))
    .filter(([, f]) => f?.imagen_url || f?.imagen);

  if (fotosLlenas.length === 0) {
    toast.warning("No hay fotos cargadas para imprimir.");
    return;
  }

  const fecha = informe?.fecha       || new Date().toLocaleDateString("es-CO");
  const obra  = informe?.obra_nombre || "Informe Diario";

  const fotosHTML = fotosLlenas.map(([num, f]) => {
    const src  = f.imagen_url || f.imagen;
    const desc = f.descripcion || "";
    const sec  = f.seccion_display || "";
    return `
      <div class="foto-card">
        <img src="${src}" alt="Foto ${num}" />
        <div class="foto-info">
          <span class="foto-num">${String(num).padStart(2, "0")}</span>
          ${sec  ? `<span class="foto-sec">${sec}</span>`  : ""}
          <span class="foto-desc ${!desc ? 'vacia' : ''}">${desc || "Sin descripción"}</span>
        </div>
      </div>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"/>
<title>Registro Fotográfico — ${obra}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:Arial,sans-serif;font-size:10px;color:#1e293b;background:#fff}
  .header{display:flex;align-items:stretch;border:2px solid #1B3A5C;border-radius:6px;overflow:hidden;margin-bottom:14px}
  .header-logo{background:#1B3A5C;color:#fff;font-size:22px;font-weight:900;padding:10px 18px;display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:80px}
  .header-logo span{font-size:8px;font-weight:400;margin-top:2px;opacity:.8}
  .header-info{flex:1;padding:8px 14px;display:flex;flex-direction:column;justify-content:center;gap:3px;border-left:3px solid #1B3A5C}
  .header-title{font-size:11px;font-weight:800;text-transform:uppercase;color:#1B3A5C}
  .header-meta{display:flex;gap:20px;font-size:9px;color:#475569}
  .header-meta strong{color:#1e293b}
  .header-cod{font-size:8px;font-family:monospace;color:#94a3b8;text-align:right;padding:8px 12px;display:flex;flex-direction:column;justify-content:center;gap:2px}
  .count-bar{font-size:8px;color:#64748b;margin-bottom:10px;text-align:right;text-transform:uppercase;letter-spacing:.06em}
  .fotos-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:16px}
  .foto-card{border:1px solid #d1d5db;border-radius:6px;overflow:hidden;break-inside:avoid;page-break-inside:avoid}
  .foto-card img{width:100%;height:220px;object-fit:cover;display:block}
  .foto-info{padding:10px 12px;background:#f9fafb;border-top:1px solid #e5e7eb;display:flex;flex-direction:column;gap:2px}
  .foto-num{font-family:monospace;font-size:8px;font-weight:700;color:#1B3A5C}
  .foto-sec{font-size:7px;font-weight:700;text-transform:uppercase;color:#7c3aed}
  .foto-desc{font-size:11px;color:#374151;line-height:1.5;word-wrap:break-word;white-space:normal}
  .foto-desc.vacia{color:#9ca3af;font-style:italic}
  .footer{margin-top:16px;border-top:1px solid #e2e8f0;padding-top:8px;display:flex;justify-content:space-between;font-size:8px;color:#94a3b8}
  @media print{@page{size:A4 landscape;margin:12mm}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  @media (max-width:640px){.fotos-grid{grid-template-columns:1fr}}
</style></head><body>
  <div class="header">
    <div class="header-logo">IGGA<span>INTERVENTORÍA</span></div>
    <div class="header-info">
      <div class="header-title">Registro Fotográfico de Obra</div>
      <div class="header-meta">
        <div><strong>OBRA:</strong> ${obra}</div>
        <div><strong>FECHA:</strong> ${fecha}</div>
      </div>
    </div>
    <div class="header-cod"><div>F-141-IN</div><div>F. Emisión: 27/08/2009</div><div>Mod: 00</div></div>
  </div>
  <div class="count-bar">${fotosLlenas.length} fotografía${fotosLlenas.length !== 1 ? "s" : ""} registrada${fotosLlenas.length !== 1 ? "s" : ""}</div>
  <div class="fotos-grid">${fotosHTML}</div>
  <div class="footer">
    <span>Generado: ${new Date().toLocaleString("es-CO")}</span>
    <span>F-141-IN — ${obra} — ${fecha}</span>
  </div>
  <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}<\/script>
</body></html>`;

  const ventana = window.open("", "_blank", "width=1100,height=750");
  if (!ventana) { toast.error("Permite las ventanas emergentes para este sitio."); return; }
  ventana.document.write(html);
  ventana.document.close();
}

// ── Componente de fotos inline (para el tab) ──────────────────────────────
function InformeFotos({ informeId }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [descripcionUpload, setDescripcionUpload] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const debounceRef = useRef(null);

  // ✅ FIX: Normalizar respuesta a array
  const { data: rawFotos, isLoading } = useQuery({
    queryKey: ["informe-fotos", informeId],
    queryFn: () =>
      informeId ? axios.get(`${API.INFORME_DIARIO.ANEXOS}?informe=${informeId}`).then(r => r.data) : [],
    enabled: !!informeId,
  });
  const fotos = normalizeArray(rawFotos);

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("informe", informeId);
        fd.append("imagen", file);
        if (descripcionUpload.trim()) {
          fd.append("descripcion", descripcionUpload.trim());
        }
        await axios.post(API.INFORME_DIARIO.ANEXOS, fd, { headers: { "Content-Type": "multipart/form-data" } });
      }
      queryClient.invalidateQueries(["informe-fotos", informeId]);
      setDescripcionUpload("");
      toast.success("Fotos subidas exitosamente!");
    } catch { toast.error("Error al subir las fotos"); }
    finally { setUploading(false); e.target.value = ""; }
  };

  // ── EDICIÓN INLINE DE DESCRIPCIÓN ──────────────────────────────
  const startEdit = (foto) => {
    setEditingId(foto.id);
    setEditValue(foto.descripcion || "");
  };

  const saveDescripcion = async (id, value) => {
    try {
      await axios.patch(`${API.INFORME_DIARIO.ANEXOS}${id}/`, {
        descripcion: value.trim()
      }, {
        headers: { "Content-Type": "application/json" }
      });
      queryClient.invalidateQueries(["informe-fotos", informeId]);
      setEditingId(null);
    } catch {
      toast.error("Error al guardar la descripción");
    }
  };

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

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar esta foto?")) return;
    try {
      await axios.delete(`${API.INFORME_DIARIO.ANEXOS}${id}/`);
      queryClient.invalidateQueries(["informe-fotos", informeId]);
      toast.success("Foto eliminada");
    } catch {
      toast.error("Error al eliminar la foto");
    }
  };

  if (!informeId) return (
    <div style={{ padding: "5rem 2rem", border: `2px dashed ${C.border}`, borderRadius: 20, textAlign: "center" }}>
      <ImageIcon size={64} style={{ color: C.textFaint, margin: "0 auto 1rem" }} />
      <h3 style={{ margin: 0, color: C.textMuted, fontWeight: 800, textTransform: "uppercase" }}>
        Selecciona un informe para ver las fotos
      </h3>
    </div>
  );

  return (
    <div>
      {/* Zona de upload con descripción */}
      <div style={{ background: C.white, border: `2px dashed ${C.border}`, borderRadius: 16, padding: "1.5rem", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: C.textMuted, fontWeight: 700, fontSize: "0.9rem" }}>
            <UploadCloud size={18} />
            Subir nueva foto
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Descripción de la foto (opcional)"
              value={descripcionUpload}
              onChange={(e) => setDescripcionUpload(e.target.value)}
              style={{ flex: 1, minWidth: 200, padding: "0.5rem 0.75rem", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: "0.85rem", outline: "none" }}
            />
            <div style={{ position: "relative" }}>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                disabled={uploading}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: uploading ? "wait" : "pointer" }}
                id="foto-upload-inline"
              />
              <label
                htmlFor="foto-upload-inline"
                style={{
                  display: "flex", alignItems: "center", gap: "0.4rem",
                  padding: "0.5rem 1rem", background: C.indigo, color: "#fff",
                  borderRadius: 8, fontWeight: 700, fontSize: "0.85rem",
                  cursor: uploading ? "wait" : "pointer",
                  whiteSpace: "nowrap"
                }}
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                {uploading ? "Subiendo..." : "Seleccionar imagen"}
              </label>
            </div>
          </div>
        </div>
      </div>

      <input type="file" accept="image/*" multiple onChange={handleUpload} style={{ display: "none" }} id="foto-upload" disabled={uploading} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: C.white, borderRadius: 16, height: 260, padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{ width: "100%", height: 140, borderRadius: 8, background: C.skeleton }} />
                <div style={{ width: "40%", height: 14, background: C.skeleton }} />
                <div style={{ width: "80%", height: 20, background: C.skeleton }} />
              </div>
            ))
          : fotos.map(foto => {
              const src = foto?.imagen_url || foto?.imagen;
              return (
                <div key={foto.id} style={{ background: C.white, borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", border: "1px solid #f1f5f9", height: 260 }}>
                  <div style={{ width: "100%", height: 140, background: "linear-gradient(135deg,#f5f3ff,#ede9fe)", overflow: "hidden", position: "relative" }}>
                    {src ? <img src={src} alt={foto.descripcion || "Foto"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "#8b5cf6", gap: "0.5rem" }}><Package size={48} /><span style={{ fontSize: "0.75rem" }}>SIN IMAGEN</span></div>}
                    <button
                      onClick={() => handleDelete(foto.id)}
                      style={{ position: "absolute", top: 6, right: 6, background: "rgba(239,68,68,0.85)", color: "#fff", border: "none", borderRadius: "50%", width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                      title="Eliminar"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div style={{ padding: "1rem" }}>
                    <div style={{ background: "#f5f3ff", color: "#7c3aed", fontSize: "0.65rem", fontWeight: 800, width: "fit-content", padding: "2px 8px", borderRadius: 8, marginBottom: "0.5rem" }}>{foto.seccion_display || "Foto"}</div>

                    {/* DESCRIPCIÓN EDITABLE INLINE */}
                    {editingId === foto.id ? (
                      <input
                        autoFocus
                        value={editValue}
                        onChange={handleChangeEdit}
                        onBlur={() => handleBlur(foto.id)}
                        onKeyDown={(e) => handleKeyDown(e, foto.id)}
                        placeholder="Descripción..."
                        style={{
                          width: "100%", padding: "0.25rem 0.5rem", fontSize: "0.85rem",
                          border: `1px solid ${C.indigo}`, borderRadius: 6,
                          outline: "none", color: C.text
                        }}
                      />
                    ) : (
                      <div
                        onClick={() => startEdit(foto)}
                        style={{ display: "flex", alignItems: "flex-start", gap: "0.3rem", cursor: "text", minHeight: 22 }}
                        title="Click para editar descripción"
                      >
                        <Pencil size={12} style={{ color: C.textFaint, marginTop: 3, flexShrink: 0, opacity: 0.5 }} />
                        <p style={{ margin: 0, fontSize: "0.85rem", color: C.text, fontWeight: 700, lineHeight: 1.4, wordBreak: "break-word", flex: 1 }}>
                          {foto.descripcion ? (
                            foto.descripcion
                          ) : (
                            <span style={{ color: C.textFaint, fontStyle: "italic", fontWeight: 400 }}>Sin descripción — click para agregar</span>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}

function TabChip({ active, onClick, label, icon: Icon }) {
  return (
    <button onClick={onClick} style={{ padding: "0.6rem 1.2rem", borderRadius: 25, display: "flex", alignItems: "center", gap: "0.5rem", border: active ? "none" : `1px solid ${C.border}`, background: active ? C.indigo : C.white, color: active ? C.white : C.textMuted, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s", fontSize: "0.9rem" }}>
      <Icon size={16} />{label}
    </button>
  );
}

// ── Contenido principal ───────────────────────────────────────────────────
function InformeDiarioContent() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]           = useState("dashboard");
  const [editingInforme, setEditingInforme] = useState(null);

  // ✅ FIX: Normalizar respuesta a array antes de reduce
  const { data: rawFotosData } = useQuery({
    queryKey: ["informe-fotos", editingInforme?.id],
    queryFn: () =>
      editingInforme?.id
        ? axios.get(`${API.INFORME_DIARIO.ANEXOS}?informe=${editingInforme.id}`).then(r => r.data)
        : [],
    enabled: !!editingInforme?.id,
  });

  // Normalizar SIEMPRE a array
  const fotosData = normalizeArray(rawFotosData);

  // Ahora reduce es seguro
  const fotosMap = fotosData.reduce((acc, f) => { 
    if (f?.posicion > 0) acc[f.posicion] = f; 
    return acc; 
  }, {});

  useQuery({ queryKey: ["informes-diarios"], queryFn: () => informeDiarioService.list() });

  // ── Tab "Historial" eliminada — ahora son sólo 3 tabs ──
  const tabs = [
    { id: "dashboard", icon: LayoutDashboard, label: "Panel"    },
    { id: "fotos",     icon: ImageIcon,        label: "Fotos"    },
    { id: "reportes",  icon: BarChart2,         label: "Reportes" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.pageBg, overflow: "auto" }}>
      <Toaster position="bottom-right" richColors />

      {/* TOP BAR */}
      <div style={{ background: C.topBar, padding: "0.75rem 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", position: "sticky", top: 0, zIndex: 50 }}>
        {editingInforme && (
          <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", pointerEvents: "none" }}>
            <span style={{ fontSize: "0.7rem", fontWeight: 600, color: C.textFaint, textTransform: "uppercase", letterSpacing: "0.05em" }}>Proyecto en edición</span>
            <span style={{ fontSize: "1rem", fontWeight: 800, color: C.text, whiteSpace: "nowrap" }}>{editingInforme.obra_nombre || `Informe #${editingInforme.id}`}</span>
            <span style={{ fontSize: "0.72rem", color: C.textMuted }}>{editingInforme.fecha}</span>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button onClick={() => navigate("/")} style={{ background: C.borderLight, border: "none", borderRadius: 10, padding: "0.5rem", cursor: "pointer", color: C.textMuted, display: "flex", alignItems: "center" }} title="Regresar">
            <ArrowLeft size={20} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ClipboardList size={24} style={{ color: C.primary }} />
            <div>
              <h1 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: C.text }}>INFORME DIARIO</h1>
              <span style={{ fontSize: "0.75rem", color: C.textMuted }}>Terminal de Control Proyectivo F-141-IN</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => { setEditingInforme(null); setActiveTab("formulario"); }}
          style={{ padding: "0.6rem 1.5rem", borderRadius: 14, border: "none", background: `linear-gradient(135deg,${C.primary} 0%,#db2777 100%)`, color: C.white, fontSize: "0.95rem", fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", boxShadow: `0 6px 16px ${C.primaryShadow}` }}
        >
          <Plus size={18} />NUEVO REGISTRO
        </button>
      </div>

      {/* CONTENIDO */}
      <div style={{ maxWidth: 1600, margin: "0 auto", padding: "1.5rem" }}>

        {/* Tabs + botón imprimir fotos */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", overflowX: "auto", paddingBottom: "0.5rem", alignItems: "center" }}>
          {tabs.map(t => (
            <TabChip key={t.id} active={activeTab === t.id}
              onClick={() => { if (t.id === "formulario") setEditingInforme(null); setActiveTab(t.id); }}
              label={t.label} icon={t.icon}
            />
          ))}

          {/* ── BOTÓN IMPRIMIR FOTOS — siempre visible en la barra ── */}
          <button
            onClick={() => imprimirFotos(fotosMap, editingInforme)}
            style={{
              marginLeft: "auto",
              display: "flex", alignItems: "center", gap: 7,
              background: "#1B3A5C", color: "#fff",
              border: "none", borderRadius: 10,
              padding: "0.55rem 1.1rem",
              fontSize: "0.85rem", fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(27,58,92,0.25)",
              whiteSpace: "nowrap",
            }}
            title="Imprimir registro fotográfico"
          >
            <Printer size={15} />
            Imprimir Fotos
          </button>
        </div>

        <div style={{ background: C.white, borderRadius: 24, border: `1px solid ${C.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.03)", padding: "1.5rem", minHeight: 600 }}>

          {/* ── PANEL: Historial arriba + Dashboard abajo ── */}
          {activeTab === "dashboard" && (
            <div>
              {/* ── HISTORIAL (parte superior del Panel) ── */}
              <div style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: `2px solid ${C.borderLight}` }}>
                  <BookOpen size={18} style={{ color: C.indigo }} />
                  <h2 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: C.text, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Historial de Informes
                  </h2>
                </div>
                <InformeLista
                  onEditar={(inf) => { setEditingInforme(inf); setActiveTab("formulario"); }}
                />
              </div>

              {/* ── DIVISOR ── */}
              <div style={{ height: 1, background: C.border, marginBottom: "2rem" }} />

              {/* ── DASHBOARD (parte inferior del Panel) ── */}
              <InformeDashboard
                onNuevoInforme={() => { setEditingInforme(null); setActiveTab("formulario"); }}
              />
            </div>
          )}

          {activeTab === "fotos" && (
            <InformeFotos informeId={editingInforme?.id} />
          )}

          {activeTab === "reportes" && (
            <ReportesInforme informeId={editingInforme?.id} informe={editingInforme} />
          )}

          {activeTab === "formulario" && (
            <InformeFormulario
              informe={editingInforme}
              onGuardado={() => setActiveTab("dashboard")}
              onCancelar={() => setActiveTab("dashboard")}
            />
          )}

        </div>
      </div>
    </div>
  );
}

export default function InformeDiarioProy() {
  return (
    <QueryClientProvider client={queryClient}>
      <InformeDiarioContent />
    </QueryClientProvider>
  );
}
