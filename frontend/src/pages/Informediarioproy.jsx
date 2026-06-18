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
  ChevronDown, ChevronUp, MonitorSmartphone,
} from "lucide-react";

import InformeDashboard  from "@/components/informe-diario/InformeDashboard";
import InformeLista      from "@/components/informe-diario/InformeLista";
import InformeFormulario from "@/components/informe-diario/InformeFormulario";
import HojaFotosInforme, { imprimirFotos } from "@/components/informe-diario/HojaFotosInforme";
import ReportesInforme, { exportarPDFReporte } from "@/components/informe-diario/ReportesInforme";

import { toast, Toaster } from "sonner";
import { useNavigate } from "react-router-dom";
import { informeDiarioService } from "@/services/informeDiarioApi";
import { useMobileMode } from "@/context/MobileModeContext";

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

// Estilo para botones de acción en modo celular
const mobileActionBtn = (disabled = false) => ({
  display:        "flex",
  alignItems:     "center",
  gap:            "0.25rem",
  padding:        "0.35rem 0.65rem",
  borderRadius:   8,
  border:         `1px solid ${C.border}`,
  background:     disabled ? "#f8fafc" : C.white,
  color:          disabled ? C.btnDisabled : C.text,
  fontSize:       "0.7rem",
  fontWeight:     600,
  cursor:         disabled ? "not-allowed" : "pointer",
  whiteSpace:     "nowrap",
  transition:     "all 0.15s",
  opacity:        disabled ? 0.5 : 1,
});

// ── Contenido principal ───────────────────────────────────────────────────────
function InformeDiarioContent() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]         = useState("dashboard");
  const [editingInforme, setEditingInforme] = useState(null);
  const [formSnapshot, setFormSnapshot]     = useState(null); // radiografia del form para Reportes

  // Fotos levantadas aquí para que los botones del top bar puedan acceder
  const [fotosActuales, setFotosActuales] = useState({});
  const [showMatrizModal, setShowMatrizModal] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);

  const { isMobileMode } = useMobileMode();
  const formRef = useRef(null);

  const hasInforme = !!editingInforme?.id;

  const handleTabChange = useCallback(async (tabId) => {
    if (tabId === activeTab) return;

    // Auto-guardar al cambiar de pestaña (form siempre montado vía display:none)
    if (formRef.current) {
      try {
        // Capturar campos frontend antes del save (backend no los devuelve)
        const snapshot = formRef.current.getFormSnapshot();
        const result = await formRef.current.saveDraft();
        if (result?.id) {
          setEditingInforme(prev => ({
            ...prev,
            ...result,
            cliente_seleccionado_id: snapshot.cliente_seleccionado_id || prev.cliente_seleccionado_id || '',
            cliente_seleccionado_nombre: snapshot.cliente_seleccionado_nombre || prev.cliente_seleccionado_nombre || '',
            obra_nombre: snapshot.obra_nombre || prev.obra_nombre || '',
          }));
        }
      } catch {
        // Si falla el auto-save, igual permitimos cambiar de tab
      }
    }

    // Si es la pestaña Reportes, tomar radiografía del form
    if (tabId === "reportes" && formRef.current) {
      setFormSnapshot(formRef.current.getFormSnapshot());
    } else if (tabId !== "reportes") {
      // Limpiar snapshot al salir de Reportes
      setFormSnapshot(null);
    }

    setActiveTab(tabId);
  }, [activeTab]);

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const formSublabel = editingInforme
    ? (editingInforme.proyecto_nombre || (editingInforme.id ? `# ${editingInforme.id}` : null))
    : null;

  const tabs = [
    { id: "dashboard",  icon: LayoutDashboard, label: "Panel"    },
    { id: "formulario", icon: ClipboardList,   label: "FORM",     sublabel: formSublabel },
    { id: "fotos",      icon: ImageIcon,        label: "Fotos"    },
    { id: "reportes",   icon: BarChart2,        label: "Reportes" },
  ];

  // ── Handlers de los botones de acción ────────────────────────────────────
  const handleNuevo = async () => {
    // Auto-guardar el informe actual antes de empezar uno nuevo
    if (formRef.current) {
      try {
        await formRef.current.saveDraft();
      } catch { /* ignorar */ }
    }
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

    if (formSnapshot) {
      exportarPDFReporte(formSnapshot);
      return;
    }

    const toastId = toast.loading("Generando PDF...");
    try {
      const detalle = await informeDiarioService.get(editingInforme.id);
      exportarPDFReporte(detalle);
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
        padding: isMobileMode ? "0.5rem 0.75rem" : "0.75rem 1.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        gap: isMobileMode ? "0.5rem" : "1rem",
        flexWrap: isMobileMode ? "nowrap" : "wrap",
      }}>

        {/* Izquierda: nav + título */}
        <div style={{ display: "flex", alignItems: "center", gap: isMobileMode ? "0.5rem" : "1rem", flexShrink: 0, minWidth: 0 }}>
          <button
            onClick={() => navigate("/")}
            style={{ background: C.borderLight, border: "none", borderRadius: 10, padding: "0.4rem", cursor: "pointer", color: C.textMuted, display: "flex", alignItems: "center", flexShrink: 0 }}
            title="Regresar"
          >
            <ArrowLeft size={isMobileMode ? 18 : 20} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: isMobileMode ? "0.35rem" : "0.5rem", minWidth: 0 }}>
            <ClipboardList size={isMobileMode ? 20 : 24} style={{ color: C.primary, flexShrink: 0 }} />
            <div style={{ minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: isMobileMode ? "0.9rem" : "1.2rem", fontWeight: 800, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>INFORME DIARIO</h1>
              {!isMobileMode && <span style={{ fontSize: "0.75rem", color: C.textMuted }}>Terminal de Control Proyectivo F-141-IN</span>}
            </div>
          </div>
        </div>

        {/* Centro: informe en edición */}
        {editingInforme && !isMobileMode && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, minWidth: 0, pointerEvents: "none" }}>
            <span style={{ fontSize: "0.68rem", fontWeight: 600, color: C.textFaint, textTransform: "uppercase", letterSpacing: "0.05em" }}>Proyecto en edición</span>
            <span style={{ fontSize: "1rem", fontWeight: 800, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>
              {editingInforme.proyecto_nombre || `Informe #${editingInforme.id}`}
            </span>
            <span style={{ fontSize: "0.72rem", color: C.textMuted }}>{editingInforme.fecha}</span>
          </div>
        )}

        {/* Derecha: botones de acción */}
        {isMobileMode ? (
          <button
            onClick={() => setShowMobileActions(s => !s)}
            style={{
              background: showMobileActions ? C.primary : C.borderLight,
              border: "none", borderRadius: 10, padding: "0.4rem 0.6rem",
              cursor: "pointer", color: showMobileActions ? "#fff" : C.textMuted,
              display: "flex", alignItems: "center", gap: "0.3rem",
              fontSize: "0.7rem", fontWeight: 700, flexShrink: 0,
            }}
          >
            <MonitorSmartphone size={16} />
            {showMobileActions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        ) : (
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
        )}
      </div>

      {/* ── MOBILE ACTIONS DRAWER ─────────────────────────────────────────── */}
      {isMobileMode && showMobileActions && (
        <div style={{
          background: C.topBar,
          borderBottom: `1px solid ${C.border}`,
          padding: "0.5rem 0.75rem",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          flexWrap: "wrap",
          position: "sticky",
          top: isMobileMode ? "52px" : 0,
          zIndex: 49,
          boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
        }}>
          <button onClick={handleNuevo} style={mobileActionBtn(false)}>
            <Plus size={14} /> NUEVO
          </button>
          <button onClick={handleExportarExcel} disabled={!hasInforme} style={mobileActionBtn(!hasInforme)}>
            <FileSpreadsheet size={14} /> EXCEL
          </button>
          <button onClick={() => handleImprimirFotosImprimir('4x6')} disabled={!hasInforme} style={mobileActionBtn(!hasInforme)}>
            <Printer size={14} /> FOTOS
          </button>
          <button onClick={() => setShowMatrizModal(true)} disabled={!hasInforme} style={mobileActionBtn(!hasInforme)}>
            <Grid3x3 size={14} /> MATRIZ
          </button>
          <button onClick={handleExportarPDF} disabled={!hasInforme} style={mobileActionBtn(!hasInforme)}>
            <FileText size={14} /> PDF
          </button>

          {editingInforme && (
            <span style={{
              marginLeft: "auto", fontSize: "0.6rem", color: C.textFaint,
              maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis",
              whiteSpace: "nowrap", textAlign: "right",
            }}>
              {editingInforme.proyecto_nombre || `#${editingInforme.id}`}
            </span>
          )}
        </div>
      )}

      {/* ── CONTENIDO ────────────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1600, margin: "0 auto", padding: isMobileMode ? "0.75rem" : "1.5rem" }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: isMobileMode ? "0.4rem" : "0.75rem", marginBottom: "1rem", overflowX: "auto", paddingBottom: "0.5rem", alignItems: "center" }}>
          {tabs.map(t => (
            <TabChip
              key={t.id}
              active={activeTab === t.id}
              onClick={() => handleTabChange(t.id)}
              label={t.label}
              sublabel={t.sublabel}
              icon={t.icon}
              mobile={isMobileMode}
            />
          ))}
        </div>

        <div style={{ background: C.white, borderRadius: 24, border: `1px solid ${C.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.03)", padding: isMobileMode ? "0.75rem" : "1.5rem", minHeight: isMobileMode ? 300 : 600 }}>

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
                  const snapshot = formRef.current.getFormSnapshot();
                  const result = await formRef.current.saveDraft();
                  if (result?.id) {
                    setEditingInforme(prev => ({
                      ...prev,
                      ...result,
                      cliente_seleccionado_id: snapshot.cliente_seleccionado_id || prev.cliente_seleccionado_id || '',
                      cliente_seleccionado_nombre: snapshot.cliente_seleccionado_nombre || prev.cliente_seleccionado_nombre || '',
                      obra_nombre: snapshot.obra_nombre || prev.obra_nombre || '',
                    }));
                    return result.id;
                  }
                }
                return null;
              }}
            />
          )}

          {/* Reportes */}
          {activeTab === "reportes" && (
            <ReportesInforme informeId={editingInforme?.id} informe={editingInforme} formSnapshot={formSnapshot} />
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
              startSlot={25}
              onFotosChange={(nuevas) => setFotosActuales(prev => ({ ...prev, ...nuevas }))}
              onAutoSave={async () => {
                if (formRef.current) {
                  const snapshot = formRef.current.getFormSnapshot();
                  const result = await formRef.current.saveDraft();
                  if (result?.id) {
                    setEditingInforme(prev => ({
                      ...prev,
                      ...result,
                      cliente_seleccionado_id: snapshot.cliente_seleccionado_id || prev.cliente_seleccionado_id || '',
                      cliente_seleccionado_nombre: snapshot.cliente_seleccionado_nombre || prev.cliente_seleccionado_nombre || '',
                      obra_nombre: snapshot.obra_nombre || prev.obra_nombre || '',
                    }));
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

function TabChip({ active, onClick, label, sublabel, icon: Icon, mobile }) {
  return (
    <button onClick={onClick} style={{
      padding: mobile ? "0.35rem 0.75rem" : "0.5rem 1.2rem", borderRadius: 25, display: "flex", alignItems: "center",
      gap: mobile ? "0.3rem" : "0.5rem", border: active ? "none" : `1px solid ${C.border}`,
      background: active ? C.indigo : C.white, color: active ? C.white : C.textMuted,
      fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s",
      fontSize: mobile ? "0.75rem" : "0.9rem", flexShrink: 0,
    }}>
      <Icon size={mobile ? 14 : 16} />
      <span style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.25 }}>
        <span>{label}</span>
        {sublabel && (
          <span style={{
            fontSize: "0.62rem", fontWeight: 500, opacity: 0.85,
            maxWidth: mobile ? 80 : 130, overflow: "hidden", textOverflow: "ellipsis",
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
