// ============================================================
//  InformeDiarioProy.jsx  –  ERP-8AMPERIOS  (CORREGIDO v4)
//  Fix v4: Agrega tab "FORM" visible cuando el formulario está activo
//  Fix v3: Integra HojaFotosInforme en tab "Fotos", elimina botón duplicado
// ============================================================
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
import HojaFotosInforme  from "@/components/informe-diario/HojaFotosInforme";  // ✅ Importado
import ReportesInforme   from "@/components/informe-diario/ReportesInforme";

import axiosInstance from "@/config/axiosConfig";
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
    const keys = Object.keys(data);
    if (keys.length > 0 && keys.every(k => !isNaN(Number(k)))) {
      return keys.map(k => data[k]);
    }
  }
  return [];
}

// ── Contenido principal ───────────────────────────────────────────────────
function InformeDiarioContent() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab]           = useState("dashboard");
  const [editingInforme, setEditingInforme] = useState(null);

  const { data: rawFotosData } = useQuery({
    queryKey: ["informe-fotos", editingInforme?.id],
    queryFn: () =>
      editingInforme?.id
        ? axiosInstance.get(`${API.INFORME_DIARIO.ANEXOS}?informe=${editingInforme.id}`).then(r => r.data)
        : [],
    enabled: !!editingInforme?.id,
  });

  const fotosData = normalizeArray(rawFotosData);

  const fotosMap = fotosData.reduce((acc, f, index) => { 
    const key = f?.posicion > 0 ? f.posicion : (index + 1);
    acc[key] = f; 
    return acc; 
  }, {});

  useQuery({ queryKey: ["informes-diarios"], queryFn: () => informeDiarioService.list() });

  // ── 4 tabs: Panel / FORM (aparece activo al llenar formulario) / Fotos / Reportes ──
  const tabs = [
    { id: "dashboard",  icon: LayoutDashboard, label: "Panel"    },
    { id: "formulario", icon: ClipboardList,   label: "FORM"     },
    { id: "fotos",      icon: ImageIcon,        label: "Fotos"    },
    { id: "reportes",   icon: BarChart2,        label: "Reportes" },
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

        {/* Tabs — FORM se activa al presionar NUEVO REGISTRO o al editar un informe */}
        <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", overflowX: "auto", paddingBottom: "0.5rem", alignItems: "center" }}>
          {tabs.map(t => (
            <TabChip key={t.id} active={activeTab === t.id}
              onClick={() => setActiveTab(t.id)}
              label={t.label} icon={t.icon}
            />
          ))}
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

          {/* ✅ CORREGIDO: Usar HojaFotosInforme en lugar de InformeFotos inline */}
          {activeTab === "fotos" && (
            <HojaFotosInforme 
              informeId={editingInforme?.id} 
              obraId={editingInforme?.obra}
              informe={editingInforme}
            />
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

function TabChip({ active, onClick, label, icon: Icon }) {
  return (
    <button onClick={onClick} style={{ padding: "0.6rem 1.2rem", borderRadius: 25, display: "flex", alignItems: "center", gap: "0.5rem", border: active ? "none" : `1px solid ${C.border}`, background: active ? C.indigo : C.white, color: active ? C.white : C.textMuted, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.2s", fontSize: "0.9rem" }}>
      <Icon size={16} />{label}
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
