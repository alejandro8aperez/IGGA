// ============================================================
//  InformeDiarioProy.jsx  –  ERP-8AMPERIOS  (CORREGIDO v5)
//  Fix v5: Todos los botones de acción juntos en el top bar,
//          mismo color y tamaño.
//  Fix v4: Tab "FORM" con sublabel de proyecto
//  Fix v3: HojaFotosInforme en tab Fotos
// ============================================================
import { useState, useRef, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ClipboardList, LayoutDashboard, BookOpen, Plus,
  Image as ImageIcon, ArrowLeft, X,
  BarChart2, FileSpreadsheet, Printer, FileText, Grid3x3,
} from "lucide-react";

import InformeDashboard  from "@/components/informe-diario/InformeDashboard";
import InformeLista      from "@/components/informe-diario/InformeLista";
import InformeFormulario from "@/components/informe-diario/InformeFormulario";
import HojaFotosInforme, { imprimirFotos } from "@/components/informe-diario/HojaFotosInforme";
import ReportesInforme   from "@/components/informe-diario/ReportesInforme";

import { toast, Toaster } from "sonner";
import { useNavigate } from "react-router-dom";
import { informeDiarioService } from "@/services/informeDiarioApi";

const queryClient = new QueryClient();

const C = {
  pageBg: "#f1f5f9", white: "#ffffff", topBar: "#ffffff",
  border: "#e2e8f0", borderLight: "#f1f5f9",
  text: "#1e293b", textMuted: "#64748b", textFaint: "#94a3b8",
  primary: "#1B3A5C",
  indigo: "#6366f1",
  btnDisabled: "#94a3b8",
};

// Estilo compartido para TODOS los botones de acción
const actionBtn = (disabled = false) => ({
  display:        "flex",
  alignItems:     "center",
  gap:            "0.45rem",
  padding:        "0.55rem 1.1rem",
  borderRadius:   10,
  border:         "none",
  background:     disabled ? "#e2e8f0" : C.primary,
  color:          disabled ? C.btnDisabled : "#ffffff",
  fontSize:       "0.82rem",
  fontWeight:     700,
  letterSpacing:  "0.02em",
  cursor:         disabled ? "not-allowed" : "pointer",
  whiteSpace:     "nowrap",
  transition:     "background 0.15s, opacity 0.15s",
  opacity:        disabled ? 0.7 : 1,
  boxShadow:      disabled ? "none" : "0 2px 8px rgba(27,58,92,0.25)",
});

// ── Contenido principal ───────────────────────────────────────────────────────
function InformeDiarioContent() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]         = useState("dashboard");
  const [editingInforme, setEditingInforme] = useState(null);

  // Fotos levantadas aquí para que los botones del top bar puedan acceder
  const [fotosActuales, setFotosActuales] = useState({});
  const [showMatrizModal, setShowMatrizModal] = useState(false);

  const formRef = useRef(null);

  const hasInforme = !!editingInforme?.id;

  const handleTabChange = useCallback(async (tabId) => {
    if (tabId === activeTab) return;

    // Auto-guardar al salir del formulario (usa saveDraft para crear borrador aunque falten campos)
    if (activeTab === "formulario" && formRef.current) {
      try {
        const result = await formRef.current.saveDraft();
        if (result?.id) {
          setEditingInforme(prev => ({ ...prev, ...result }));
        }
      } catch {
        // Si falla el auto-save, igual permitimos cambiar de tab
      }
    }
    setActiveTab(tabId);
  }, [activeTab]);

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const formSublabel = editingInforme
    ? (editingInforme.obra_nombre || (editingInforme.id ? `# ${editingInforme.id}` : null))
    : null;

  const tabs = [
    { id: "dashboard",  icon: LayoutDashboard, label: "Panel"    },
    { id: "formulario", icon: ClipboardList,   label: "FORM",     sublabel: formSublabel },
    { id: "fotos",      icon: ImageIcon,        label: "Fotos"    },
    { id: "reportes",   icon: BarChart2,        label: "Reportes" },
  ];

  // ── Handlers de los botones de acción ────────────────────────────────────
  const handleNuevo = () => {
    setEditingInforme(null);
    setActiveTab("formulario");
  };

  const handleExportarExcel = async () => {
    if (!hasInforme) return;
    const toastId = toast.loading("Generando Excel...");
    try {
      const blob = await informeDiarioService.downloadExcel(editingInforme.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Informe_Diario_${editingInforme.id}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Excel exportado correctamente", { id: toastId });
    } catch (error) {
      toast.error("Error al exportar Excel", { id: toastId });
    }
  };

  const handleExportarPDF = async () => {
    if (!hasInforme) return;
    const toastId = toast.loading("Generando PDF...");
    try {
      const blob = await informeDiarioService.downloadPdf(editingInforme.id);
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      setTimeout(() => window.URL.revokeObjectURL(url), 60000);
      toast.success("PDF listo ✓", { id: toastId });
    } catch (error) {
      toast.error("Error al generar PDF", { id: toastId });
    }
  };

  const handleImprimirFotosImprimir = (layout = '4x6') => {
    if (!hasInforme) return;
    imprimirFotos(fotosActuales, editingInforme, layout);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.pageBg, overflow: "auto" }}>
      <Toaster position="bottom-right" richColors />

      {/* ── TOP BAR ───────────────────────────────────────────────────────── */}
      <div style={{
        background: C.topBar,
        padding: "0.75rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        gap: "1rem",
        flexWrap: "wrap",
      }}>

        {/* Izquierda: nav + título */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
          <button
            onClick={() => navigate("/")}
            style={{ background: C.borderLight, border: "none", borderRadius: 10, padding: "0.5rem", cursor: "pointer", color: C.textMuted, display: "flex", alignItems: "center" }}
            title="Regresar"
          >
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

        {/* Centro: informe en edición */}
        {editingInforme && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, minWidth: 0, pointerEvents: "none" }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 600, color: C.textFaint, textTransform: "uppercase", letterSpacing: "0.05em" }}>Proyecto en edición</span>
            <span style={{ fontSize: "1rem", fontWeight: 800, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
              {editingInforme.obra_nombre || `Informe #${editingInforme.id}`}
            </span>
            <span style={{ fontSize: "0.72rem", color: C.textMuted }}>{editingInforme.fecha}</span>
          </div>
        )}

        {/* Derecha: botones de acción — mismo color y tamaño */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0, flexWrap: "wrap" }}>

          <button onClick={handleNuevo} style={actionBtn(false)}>
            <Plus size={15} />
            NUEVO REGISTRO
          </button>

          <div style={{ width: 1, height: 28, background: C.border, margin: "0 0.25rem" }} />

          <button
            onClick={handleExportarExcel}
            disabled={!hasInforme}
            title={hasInforme ? "Exportar informe a Excel" : "Selecciona un informe primero"}
            style={actionBtn(!hasInforme)}
          >
            <FileSpreadsheet size={15} />
            EXPORTAR EXCEL
          </button>

          <button
            onClick={() => handleImprimirFotosImprimir('4x6')}
            disabled={!hasInforme}
            title={hasInforme ? "Imprimir registro fotográfico 4x6" : "Selecciona un informe primero"}
            style={actionBtn(!hasInforme)}
          >
            <Printer size={15} />
            FOTOS IMPRIMIR
          </button>

          <button
            onClick={() => setShowMatrizModal(true)}
            disabled={!hasInforme}
            title={hasInforme ? "Abrir matriz de fotos 4x6" : "Selecciona un informe primero"}
            style={actionBtn(!hasInforme)}
          >
            <Grid3x3 size={15} />
            MATRIZ 4x12
          </button>

          <button
            onClick={handleExportarPDF}
            disabled={!hasInforme}
            title={hasInforme ? "Exportar informe completo a PDF" : "Selecciona un informe primero"}
            style={actionBtn(!hasInforme)}
          >
            <FileText size={15} />
            EXPORTA PDF
          </button>

        </div>
      </div>

      {/* ── CONTENIDO ────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1600, margin: "0 auto", padding: "1.5rem" }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", overflowX: "auto", paddingBottom: "0.5rem", alignItems: "center" }}>
          {tabs.map(t => (
            <TabChip
              key={t.id}
              active={activeTab === t.id}
              onClick={() => handleTabChange(t.id)}
              label={t.label}
              sublabel={t.sublabel}
              icon={t.icon}
            />
          ))}
        </div>

        <div style={{ background: C.white, borderRadius: 24, border: `1px solid ${C.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.03)", padding: "1.5rem", minHeight: 600 }}>

          {/* Panel */}
          {activeTab === "dashboard" && (
            <div>
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
              <div style={{ height: 1, background: C.border, marginBottom: "2rem" }} />
              <InformeDashboard
                onNuevoInforme={() => { setEditingInforme(null); setActiveTab("formulario"); }}
              />
            </div>
          )}

          {/* Fotos — pasa onFotosChange y onAutoSave */}
          {activeTab === "fotos" && (
            <HojaFotosInforme
              informeId={editingInforme?.id}
              obraId={editingInforme?.obra}
              informe={editingInforme}
              onFotosChange={setFotosActuales}
              onAutoSave={async () => {
                if (formRef.current) {
                  const result = await formRef.current.saveDraft();
                  if (result?.id) {
                    setEditingInforme(prev => ({ ...prev, ...result }));
                    return result.id;
                  }
                }
                return null;
              }}
            />
          )}

          {/* Reportes */}
          {activeTab === "reportes" && (
            <ReportesInforme informeId={editingInforme?.id} informe={editingInforme} />
          )}

          {/* Formulario — siempre montado para conservar estado */}
          <div style={{ display: activeTab === "formulario" ? "block" : "none" }}>
            <InformeFormulario
              ref={formRef}
              informe={editingInforme}
              onGuardado={() => {
                setEditingInforme(null);
                setActiveTab("dashboard");
              }}
            />
          </div>

        </div>
      </div>

      {/* ── Modal MATRIZ 4x12 ──────────────────────────────────────────── */}
      {showMatrizModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 9999,
          background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center",
          padding: "2rem",
        }} onClick={() => setShowMatrizModal(false)}>
          <div style={{
            background: "#0f172a", borderRadius: 16, maxWidth: 900, width: "100%",
            maxHeight: "90vh", overflow: "auto", padding: "1.5rem",
            border: "1px solid #1e293b", position: "relative",
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <Grid3x3 size={16} style={{ marginRight: "0.5rem", verticalAlign: "middle" }} />
                Matriz Fotográfica 4×6
              </h3>
              <button onClick={() => setShowMatrizModal(false)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", padding: "0.25rem" }}>
                <X size={20} />
              </button>
            </div>
            <HojaFotosInforme
              informeId={editingInforme?.id}
              obraId={editingInforme?.obra}
              informe={editingInforme}
              onAutoSave={async () => {
                if (formRef.current) {
                  const result = await formRef.current.saveDraft();
                  if (result?.id) {
                    setEditingInforme(prev => ({ ...prev, ...result }));
                    return result.id;
                  }
                }
                return null;
              }}
            />
          </div>
        </div>
      )}


    </div>
  );
}

function TabChip({ active, onClick, label, sublabel, icon: Icon }) {
  return (
    <button onClick={onClick} style={{
      padding: "0.5rem 1.2rem", borderRadius: 25, display: "flex", alignItems: "center",
      gap: "0.5rem", border: active ? "none" : `1px solid ${C.border}`,
      background: active ? C.indigo : C.white, color: active ? C.white : C.textMuted,
      fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s",
      fontSize: "0.9rem",
    }}>
      <Icon size={16} />
      <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.25 }}>
        <span>{label}</span>
        {sublabel && (
          <span style={{
            fontSize: "0.62rem", fontWeight: 500, opacity: 0.85,
            maxWidth: 130, overflow: "hidden", textOverflow: "ellipsis",
            whiteSpace: "nowrap", marginTop: 1,
          }}>{sublabel}</span>
        )}
      </span>
    </button>
  );
}

export default function InformeDiarioProy() {
  return (
    <QueryClientProvider client={queryClient}>
      <InformeDiarioContent />
    </QueryClientProvider>
  );
}
