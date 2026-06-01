import { useState } from "react";
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ClipboardList, LayoutDashboard, BookOpen, Plus,
  Image as ImageIcon, ArrowLeft, Package, Loader2,
  BarChart2, Printer,
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
          ${desc ? `<span class="foto-desc">${desc}</span>` : ""}
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
  .fotos-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
  .foto-card{border:1px solid #e2e8f0;border-radius:5px;overflow:hidden;break-inside:avoid}
  .foto-card img{width:100%;aspect-ratio:1/1;object-fit:cover;display:block}
  .foto-info{padding:4px 5px;background:#f8fafc;display:flex;flex-direction:column;gap:1px}
  .foto-num{font-family:monospace;font-size:8px;font-weight:700;color:#1B3A5C}
  .foto-sec{font-size:7px;font-weight:700;text-transform:uppercase;color:#7c3aed}
  .foto-desc{font-size:8px;color:#334155;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .footer{margin-top:16px;border-top:1px solid #e2e8f0;padding-top:8px;display:flex;justify-content:space-between;font-size:8px;color:#94a3b8}
  @media print{@page{size:A4 landscape;margin:12mm}body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
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

  const { data: fotos = [], isLoading } = useQuery({
    queryKey: ["informe-fotos", informeId],
    queryFn: () =>
      informeId ? axios.get(`${API.INFORME_DIARIO.ANEXOS}?informe=${informeId}`).then(r => r.data) : [],
    enabled: !!informeId,
  });

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("informe", informeId);
        fd.append("imagen", file);
        await axios.post(API.INFORME_DIARIO.ANEXOS, fd, { headers: { "Content-Type": "multipart/form-data" } });
      }
      queryClient.invalidateQueries(["informe-fotos", informeId]);
      toast.success("Fotos subidas exitosamente!");
    } catch { toast.error("Error al subir las fotos"); }
    finally { setUploading(false); e.target.value = ""; }
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
      <input type="file" accept="image/*" multiple onChange={handleUpload} style={{ display: "none" }} id="foto-upload" disabled={uploading} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
        <label htmlFor="foto-upload" style={{ display: "block" }}>
          <div style={{ background: C.white, borderRadius: 16, cursor: uploading ? "wait" : "pointer", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", border: "2px dashed #8b5cf6", height: 260, gap: "0.75rem", color: "#8b5cf6" }}>
            {uploading ? <><Loader2 size={48} className="animate-spin" /><span style={{ fontSize: "0.85rem", fontWeight: 700 }}>Subiendo...</span></> : <><Plus size={48} /><span style={{ fontSize: "0.85rem", fontWeight: 700 }}>+ Agregar Fotos</span></>}
          </div>
        </label>
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
                  <div style={{ width: "100%", height: 140, background: "linear-gradient(135deg,#f5f3ff,#ede9fe)", overflow: "hidden" }}>
                    {src ? <img src={src} alt={foto.descripcion || "Foto"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", color: "#8b5cf6", gap: "0.5rem" }}><Package size={48} /><span style={{ fontSize: "0.75rem" }}>SIN IMAGEN</span></div>}
                  </div>
                  <div style={{ padding: "1rem" }}>
                    <div style={{ background: "#f5f3ff", color: "#7c3aed", fontSize: "0.65rem", fontWeight: 800, width: "fit-content", padding: "2px 8px", borderRadius: 8, marginBottom: "0.5rem" }}>{foto.seccion_display || "Foto"}</div>
                    <h3 style={{ margin: 0, fontSize: "0.95rem", color: C.text, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{foto.descripcion || "Sin descripción"}</h3>
                    <span style={{ fontSize: "0.75rem", color: C.textFaint }}>{foto.fecha_captura ? new Date(foto.fecha_captura).toLocaleString("es-CO") : "Fecha no disponible"}</span>
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

  // fotos en memoria para el botón imprimir
  const { data: fotosData = [] } = useQuery({
    queryKey: ["informe-fotos", editingInforme?.id],
    queryFn: () =>
      editingInforme?.id
        ? axios.get(`${API.INFORME_DIARIO.ANEXOS}?informe=${editingInforme.id}`).then(r => r.data)
        : [],
    enabled: !!editingInforme?.id,
  });
  // convertir array a mapa { posicion: foto }
  const fotosMap = fotosData.reduce((acc, f) => { if (f.posicion > 0) acc[f.posicion] = f; return acc; }, {});

  useQuery({ queryKey: ["informes-diarios"], queryFn: () => informeDiarioService.list() });

  const tabs = [
    { id: "dashboard", icon: LayoutDashboard, label: "Panel"     },
    { id: "fotos",     icon: ImageIcon,        label: "Fotos"     },
    { id: "reportes",  icon: BarChart2,         label: "Reportes"  },
    { id: "lista",     icon: BookOpen,          label: "Historial" },
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

          {activeTab === "dashboard" && (
            <InformeDashboard onNuevoInforme={() => { setEditingInforme(null); setActiveTab("formulario"); }} />
          )}

          {activeTab === "fotos" && (
            <InformeFotos informeId={editingInforme?.id} />
          )}

          {activeTab === "reportes" && (
            <ReportesInforme informeId={editingInforme?.id} informe={editingInforme} />
          )}

          {activeTab === "lista" && (
            <InformeLista onEditar={(inf) => { setEditingInforme(inf); setActiveTab("formulario"); }} />
          )}

          {activeTab === "formulario" && (
            <InformeFormulario
              informe={editingInforme}
              onGuardado={() => setActiveTab("lista")}
              onCancelar={() => setActiveTab("lista")}
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
