// ============================================================
//  InformeFormulario.jsx  –  ERP-8AMPERIOS  (CON FIRMAS RRHH)
//  Integración: Dropdowns de empleados desde RRHH para firmas
// ============================================================
import { useState, useRef, useEffect, forwardRef, useImperativeHandle, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, X, CloudRain, Search, ChevronDown, Check, Users, Signature, Building2 } from "lucide-react";
import { toast } from "sonner";
import { informeDiarioService, obraService, recursoService, categoriaService, proveedorService } from "@/services/informeDiarioApi";
import empleadoService from "@/services/empleadoService";
import API from "@/config/api";
import axiosInstance from "@/config/axiosConfig";

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// ─── Estilos base ─────────────────────────────────────────────────────────────
const card      = { background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "1.25rem" };
const cardHead  = { padding: "1rem 1.25rem 0.75rem", borderBottom: "1px solid #f1f5f9", fontWeight: 700, fontSize: "0.8rem", color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" };
const cardBody  = { padding: "1.25rem" };
const label     = { display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.35rem" };
const inputStyle = { width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.875rem", background: "white", outline: "none", boxSizing: "border-box" };
const grid3     = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" };
const grid2     = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" };
const btnOutline = { padding: "0.5rem 1.25rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", color: "#475569", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" };
const btnGhost   = { background: "none", border: "none", cursor: "pointer", padding: "0.2rem", color: "#ef4444", display: "flex", alignItems: "center" };

const thStyle = {
  padding: "0.4rem 0.5rem", fontSize: "0.68rem", fontWeight: 700, color: "#64748b",
  textTransform: "uppercase", letterSpacing: "0.04em", textAlign: "left",
  borderBottom: "1px solid #e2e8f0", background: "#f8fafc",
};

// ─── Recursos por defecto ─────────────────────────────────────────────────────
const EQUIPOS_DEFAULT = [
  { recurso_id: "eq-1",  recurso_nombre: "Camioneta",                         categoria: "MAQUINARIA-EQUIPOS-HERRAMIENTAS-VEHICULOS", descripcion: "Camioneta",                         cantidad: 1, empresa: "Siemens",           notas: "", es_libre: true },
  { recurso_id: "eq-2",  recurso_nombre: "Buseta",                            categoria: "MAQUINARIA-EQUIPOS-HERRAMIENTAS-VEHICULOS", descripcion: "Buseta",                            cantidad: 1, empresa: "",                  notas: "", es_libre: true },
  { recurso_id: "eq-3",  recurso_nombre: "Camión Grúa",                       categoria: "MAQUINARIA-EQUIPOS-HERRAMIENTAS-VEHICULOS", descripcion: "Camión Grúa",                       cantidad: 1, empresa: "CTE Intercolombia", notas: "", es_libre: true },
  { recurso_id: "eq-4",  recurso_nombre: "Grúa",                              categoria: "MAQUINARIA-EQUIPOS-HERRAMIENTAS-VEHICULOS", descripcion: "Grúa",                              cantidad: 1, empresa: "",                  notas: "", es_libre: true },
  { recurso_id: "eq-5",  recurso_nombre: "Plataforma elevadora -Manlift",     categoria: "MAQUINARIA-EQUIPOS-HERRAMIENTAS-VEHICULOS", descripcion: "Plataforma elevadora -Manlift",     cantidad: 1, empresa: "Edemsa",            notas: "", es_libre: true },
  { recurso_id: "eq-6",  recurso_nombre: "Equipo de generación fotovoltaica", categoria: "MAQUINARIA-EQUIPOS-HERRAMIENTAS-VEHICULOS", descripcion: "Equipo de generación fotovoltaica", cantidad: 1, empresa: "",                  notas: "", es_libre: true },
  { recurso_id: "eq-7",  recurso_nombre: "Retrocargador",                     categoria: "MAQUINARIA-EQUIPOS-HERRAMIENTAS-VEHICULOS", descripcion: "Retrocargador",                     cantidad: 1, empresa: "",                  notas: "", es_libre: true },
];

const PERSONAL_DEFAULT = [
  { recurso_id: "pe-1",  recurso_nombre: "Coordinador Seguridad Salud en el Trabajo, SST", categoria: "PERSONAL DE OBRA", descripcion: "Coordinador Seguridad Salud en el Trabajo, SST", cantidad: 1, empresa: "",         notas: "", es_libre: true },
  { recurso_id: "pe-2",  recurso_nombre: "Supervisor SST",                                 categoria: "PERSONAL DE OBRA", descripcion: "Supervisor SST",                                 cantidad: 1, empresa: "Siemenes",  notas: "", es_libre: true },
  { recurso_id: "pe-3",  recurso_nombre: "Director de proyecto",                           categoria: "PERSONAL DE OBRA", descripcion: "Director de proyecto",                           cantidad: 1, empresa: "Siemens",   notas: "", es_libre: true },
  { recurso_id: "pe-4",  recurso_nombre: "Residente Técnico",                              categoria: "PERSONAL DE OBRA", descripcion: "Residente Técnico",                              cantidad: 1, empresa: "",          notas: "", es_libre: true },
  { recurso_id: "pe-5",  recurso_nombre: "Ingeniero Ambiental",                            categoria: "PERSONAL DE OBRA", descripcion: "Ingeniero Ambiental",                            cantidad: 1, empresa: "",          notas: "", es_libre: true },
  { recurso_id: "pe-6",  recurso_nombre: "Oficial de obra civil",                          categoria: "PERSONAL DE OBRA", descripcion: "Oficial de obra civil",                          cantidad: 1, empresa: "",          notas: "", es_libre: true },
  { recurso_id: "pe-7",  recurso_nombre: "Ayudante técnico",                               categoria: "PERSONAL DE OBRA", descripcion: "Ayudante técnico",                               cantidad: 1, empresa: "",          notas: "", es_libre: true },
  { recurso_id: "pe-8",  recurso_nombre: "Supervisor Quality Assurance Quality Control",   categoria: "PERSONAL DE OBRA", descripcion: "Supervisor Quality Assurance Quality Control",   cantidad: 1, empresa: "",          notas: "", es_libre: true },
  { recurso_id: "pe-9",  recurso_nombre: "Almacenista",                                    categoria: "PERSONAL DE OBRA", descripcion: "Almacenista",                                    cantidad: 1, empresa: "",          notas: "", es_libre: true },
  { recurso_id: "pe-10", recurso_nombre: "Topografo",                                      categoria: "PERSONAL DE OBRA", descripcion: "Topografo",                                      cantidad: 1, empresa: "",          notas: "", es_libre: true },
];

const RECURSOS_DEFAULT = [...EQUIPOS_DEFAULT, ...PERSONAL_DEFAULT];

// ─── Secciones fijas de actividades ──────────────────────────────────────────
const SECCIONES_ACTIVIDADES = [
  {
    titulo:    "ACTIVIDADES ADMINISTRATIVAS Y DOCUMENTALES",
    subtitulo: "INGESED",
    color:     "#6366f1",
    keywords:  ["admin", "documental", "ingesed"],
    defActividades: ["Actualización Listado de Pendientes SIEMENS", "Informes Diarios"],
  },
  {
    titulo:    "ACTIVIDADES DE CABLEADO, CONEXIONADO Y PRUEBAS FUNCIONALES",
    subtitulo: "SIEMENS",
    color:     "#f59e0b",
    keywords:  ["cableado", "conexionado", "pruebas funcionales", "siemens"],
    defActividades: ["Fabricación de marquillas pendientes de colocar", "Sellado de tapas en Tableros de control de Reactores"],
  },
  {
    titulo:    "ACTIVIDADES DE PRUEBAS DE EQUIPOS Y MONTAJE DE REACTORES",
    subtitulo: "CTE INTERCOLOMBIA",
    color:     "#f97316",
    keywords:  ["pruebas de equipo", "montaje", "reactor", "cte"],
    defActividades: ["NO HAY PROGRAMACIÓN DE ACTIVIDADES"],
  },
  {
    titulo:    "ACTIVIDADES DE OBRA CIVIL",
    subtitulo: "EDEMSA",
    color:     "#8b5cf6",
    keywords:  ["civil", "edemsa"],
    defActividades: ["NO HAY PROGRAMACIÓN DE ACTIVIDADES"],
  },
  {
    titulo:    "GESTIÓN EN LA SEGURIDAD Y LA SALUD EN EL TRABAJO",
    subtitulo: "SST",
    color:     "#10b981",
    keywords:  ["seguridad", "salud", "sst"],
    defActividades: ["Seguimiento al ingreso de personal", "Charla \"Uso adecuado de las herramientas de trabajo\"", "Delimitación y señalización de las áreas", "Orden y aseo en las áreas"],
  },
  {
    titulo:    "ACTIVIDADES AMBIENTALES Y SOCIALES",
    subtitulo: "",
    color:     "#22c55e",
    keywords:  ["ambiental", "social"],
    defActividades: ["Jornadas de orden y aseo de las áreas de trabajo", "Delimitación y señalización de las áreas"],
  },
];

// Mapea un categoria_nombre del API al título de sección más cercano
function normalizarCatNombre(nombre) {
  if (!nombre) return null;
  const n = nombre.toLowerCase();
  for (const sec of SECCIONES_ACTIVIDADES) {
    if (sec.keywords.some(k => n.includes(k))) return sec.titulo;
  }
  return nombre;
}

// Actividades por defecto para un informe nuevo
const ACTIVIDADES_DEFAULT = SECCIONES_ACTIVIDADES.flatMap(s =>
  s.defActividades.map(desc => ({ categoria_nombre: s.titulo, descripcion: desc }))
);

// ─── Normalizar informe cargado ───────────────────────────────────────────────
function normalizarInforme(informe) {
  if (!informe) return null;
  let oid = "";
  if (informe.obra_id) oid = String(informe.obra_id);
  else if (informe.obra) {
    oid = typeof informe.obra === "object" ? String(informe.obra.id) : String(informe.obra);
  }
  const actsRaw = Array.isArray(informe.actividades) ? informe.actividades : [];
  return {
    ...informe,
    obra_id:      oid,
    horas_lluvia: Array.isArray(informe.horas_lluvia) ? informe.horas_lluvia.map(Boolean) : Array(24).fill(false),
    recursos:     informe.recursos || [],
    actividades:  actsRaw.length > 0
      ? actsRaw.map(a => ({
          categoria_nombre: normalizarCatNombre(a.categoria_nombre || a.categoria_display || ""),
          descripcion:      a.descripcion || "",
        }))
      : ACTIVIDADES_DEFAULT,
    // ── FIRMAS RRHH ───────────────────────────────────────
    elaborado_por_id: informe.elaborado_por || null,
    revisado_por_id:  informe.revisado_por  || null,
    elaborado_por_detalle: informe.elaborado_por_detalle || null,
    revisado_por_detalle: informe.revisado_por_detalle || null,
    // Fallback para texto legacy
    elaborado_por_texto: informe.elaborado_por_texto || informe.elaborado_por_nombre || "",
    cargo_elaborado: informe.cargo_elaborado || "",
    revisado_por_texto: informe.revisado_por_texto || informe.revisado_por_nombre || "",
    cargo_revisado: informe.cargo_revisado || "",
    // ──────────────────────────────────────────────────────
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: EmpleadoSelect (Dropdown de RRHH)
// ═══════════════════════════════════════════════════════════════════════════════
function EmpleadoSelect({ label, value, onChange, required = false, placeholder = "Seleccione un empleado", error = null, disabled = false, onDetailChange = null }) {
  const { data: empleados, isLoading, isError } = useQuery({
    queryKey: ["empleados", "activos"],
    queryFn: empleadoService.getActivos,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const empleadoSeleccionado = empleados?.find(emp => emp.id === value);

  return (
    <div style={{ marginBottom: "0.75rem" }}>
      <label style={{  display: "flex", alignItems: "center", gap: "0.35rem" }}>
        <Users size={13} />
        {label}
        {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      <div style={{ position: "relative" }}>
        <select
          value={value || ""}
          onChange={e => {
            const id = e.target.value ? parseInt(e.target.value, 10) : null;
            onChange(id);
            if (onDetailChange) {
              const emp = empleados?.find(emp => emp.id === id) || null;
              onDetailChange(emp);
            }
          }}
          required={required}
          disabled={disabled || isLoading}
          style={{
            ...inputStyle,
            paddingLeft: "2.2rem",
            minHeight: "2.5rem",
            appearance: "none",
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 0.75rem center",
            paddingRight: "2rem",
          }}
        >
          <option value="">{placeholder}</option>
          {isLoading && <option disabled>Cargando empleados...</option>}
          {isError && <option disabled className="text-danger">Error al cargar empleados</option>}
          {empleados?.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.nombre_completo} — {emp.cargo_nombre || "Sin cargo"}
            </option>
          ))}
        </select>
        <div style={{ position: "absolute", left: "0.6rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "#94a3b8" }}>
          <Users size={14} />
        </div>
      </div>

      {/* Info del empleado seleccionado */}
      {empleadoSeleccionado && (
        <div style={{
          marginTop: "0.4rem",
          padding: "0.5rem 0.75rem",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "6px",
          fontSize: "0.78rem",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
        }}>
          {empleadoSeleccionado.firma_url && (
            <img src={
              empleadoSeleccionado.firma_url.startsWith('http')
                ? empleadoSeleccionado.firma_url
                : (axiosInstance.defaults.baseURL || '').replace(/\/api\/?$/, '') + '/' + empleadoSeleccionado.firma_url.replace(/^\//, '')
            }
              alt="Firma"
              style={{ height: 40, maxWidth: 120, objectFit: "contain", border: "1px solid #e2e8f0", borderRadius: 4, background: "#fff" }}
              onError={(e) => { e.target.style.display = 'none' }}
            />
          )}
          <div>
            <div style={{ fontWeight: 600, color: "#1e293b" }}>{empleadoSeleccionado.nombre_completo}</div>
            <div style={{ color: "#64748b" }}>{empleadoSeleccionado.cargo_nombre || "Sin cargo asignado"}</div>
            {empleadoSeleccionado.numero_documento && (
              <div style={{ color: "#94a3b8", fontSize: "0.7rem" }}>Doc: {empleadoSeleccionado.numero_documento}</div>
            )}
          </div>
        </div>
      )}

      {error && <div style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "0.25rem" }}>{error}</div>}
    </div>
  );
}

// ─── Selector de obra ─────────────────────────────────────────────────────────
function ObraSelect({ obras, value, onChange }) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const ref                 = useRef(null);

  const selected     = obras.find(o => String(o.id) === String(value));
  const displayLabel = selected
    ? (selected.codigo ? `${selected.codigo} — ${selected.nombre}` : selected.nombre)
    : "Seleccionar proyecto de OPERACIONES";
  const getClienteNombre = (o) => typeof o.cliente === "object" ? o.cliente?.nombre : (o.cliente_nombre || "");
  const filtered = obras.filter(o =>
    (o.nombre || "").toLowerCase().includes(search.toLowerCase()) ||
    (o.codigo || "").toLowerCase().includes(search.toLowerCase()) ||
    getClienteNombre(o).toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{ ...inputStyle, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none", border: open ? "1px solid #667eea" : "1px solid #cbd5e1", boxShadow: open ? "0 0 0 2px rgba(102,126,234,0.2)" : "none" }}
      >
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: selected ? "#1e293b" : "#94a3b8" }}>{displayLabel}</span>
        <ChevronDown size={15} style={{ flexShrink: 0, marginLeft: "0.5rem", color: "#94a3b8", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </div>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 9999, background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", overflow: "hidden" }}>
          <div style={{ padding: "0.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Search size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar obra o cliente..."
              style={{ flex: 1, border: "none", outline: "none", fontSize: "0.875rem", color: "#1e293b", background: "transparent" }} />
            {search && <X size={13} color="#94a3b8" style={{ cursor: "pointer" }} onClick={() => setSearch("")} />}
          </div>
          <div style={{ maxHeight: "220px", overflowY: "auto", padding: "4px" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "1rem", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>Sin resultados</div>
            ) : filtered.map(o => {
              const isSel = String(o.id) === String(value);
              return (
                <div key={o.id} onClick={() => { onChange(String(o.id)); setOpen(false); setSearch(""); }}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.75rem", borderRadius: "6px", cursor: "pointer", background: isSel ? "#f1f5f9" : "transparent" }}
                  onMouseOver={e => { if (!isSel) e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseOut={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}
                >
                  {isSel && <Check size={13} color="#667eea" style={{ flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: isSel ? 700 : 500, fontSize: "0.875rem", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {o.codigo ? `${o.codigo} — ${o.nombre}` : o.nombre}
                    </div>
                    {o.cliente_nombre && <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{o.cliente_nombre}</div>}
                  </div>
                  <span style={{ fontSize: "0.65rem", fontWeight: 700, padding: "1px 7px", borderRadius: "20px", background: o.estado === "ejecucion" ? "#f0fdf4" : "#f8fafc", color: o.estado === "ejecucion" ? "#16a34a" : "#64748b", textTransform: "capitalize", flexShrink: 0 }}>
                    {o.estado || "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Selector de cliente (CRM) ─────────────────────────────────────────────────
function ClienteSelect({ value, onChange }) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const ref                 = useRef(null);
  const { data: rawClientes = [], isLoading } = useQuery({
    queryKey: ["clientes-crm"],
    queryFn: () => axiosInstance.get(API.CRM.CLIENTES).then(r => r.data?.results || r.data || []),
  });
  const clientes = Array.isArray(rawClientes) ? rawClientes : [];

  const selected     = clientes.find(c => String(c.id) === String(value));
  const displayLabel = selected ? selected.nombre : "Seleccionar cliente de CRM";
  const filtered = clientes.filter(c =>
    (c.nombre || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.nit || "").toLowerCase().includes(search.toLowerCase()) ||
    (c.codigo_cliente || "").toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        onClick={() => !isLoading && setOpen(o => !o)}
        style={{ ...inputStyle, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: isLoading ? "not-allowed" : "pointer", userSelect: "none", border: open ? "1px solid #667eea" : "1px solid #cbd5e1", boxShadow: open ? "0 0 0 2px rgba(102,126,234,0.2)" : "none" }}
      >
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: selected ? "#1e293b" : "#94a3b8" }}>
          {isLoading ? "Cargando clientes..." : displayLabel}
        </span>
        <ChevronDown size={15} style={{ flexShrink: 0, marginLeft: "0.5rem", color: "#94a3b8", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </div>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 9999, background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", overflow: "hidden" }}>
          <div style={{ padding: "0.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Search size={14} color="#94a3b8" style={{ flexShrink: 0 }} />
            <input autoFocus value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar cliente..."
              style={{ flex: 1, border: "none", outline: "none", fontSize: "0.875rem", color: "#1e293b", background: "transparent" }} />
            {search && <X size={13} color="#94a3b8" style={{ cursor: "pointer" }} onClick={() => setSearch("")} />}
          </div>
          <div style={{ maxHeight: "220px", overflowY: "auto", padding: "4px" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "1rem", textAlign: "center", color: "#94a3b8", fontSize: "0.8rem" }}>Sin resultados</div>
            ) : filtered.map(c => {
              const isSel = String(c.id) === String(value);
              return (
                <div key={c.id} onClick={() => { onChange(String(c.id), c.nombre); setOpen(false); setSearch(""); }}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.75rem", borderRadius: "6px", cursor: "pointer", background: isSel ? "#f1f5f9" : "transparent" }}
                  onMouseOver={e => { if (!isSel) e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseOut={e => { if (!isSel) e.currentTarget.style.background = "transparent"; }}
                >
                  {isSel && <Check size={13} color="#667eea" style={{ flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: isSel ? 700 : 500, fontSize: "0.875rem", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.nombre}
                    </div>
                    {(c.nit || c.codigo_cliente) && <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{c.codigo_cliente ? `#${c.codigo_cliente}` : ""}{c.codigo_cliente && c.nit ? " · " : ""}{c.nit ? `NIT: ${c.nit}` : ""}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Horas de lluvia ──────────────────────────────────────────────────────────
function HorasLluvia({ horas, onChange }) {
  return (
    <div>
      <label style={label}>Horas con lluvia (click para marcar)</label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "4px" }}>
        {Array.from({ length: 24 }, (_, h) => (
          <button key={h} type="button"
            onClick={() => { const n = [...horas]; n[h] = !n[h]; onChange(n); }}
            title={`${h}:00 - ${h + 1}:00`}
            style={{ height: "2rem", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 700, border: horas[h] ? "none" : "1px solid #e2e8f0", background: horas[h] ? "#3b82f6" : "#f8fafc", color: horas[h] ? "white" : "#94a3b8", cursor: "pointer", transition: "all 0.1s" }}
          >{h}</button>
        ))}
      </div>
      <p style={{ margin: "0.5rem 0 0", fontSize: "0.75rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.3rem" }}>
        <CloudRain size={13} color="#60a5fa" />{horas.filter(Boolean).length} hora(s) con lluvia
      </p>
    </div>
  );
}

// ─── Selector simple ───────────────────────────────────────────────────────────
function SimpleSelect({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = options.find(o => String(o.value) === String(value));

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div onClick={() => setOpen(o => !o)} style={{ ...inputStyle, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", userSelect: "none", height: "2.25rem", padding: "0 0.65rem", border: open ? "1px solid #667eea" : "1px solid #cbd5e1" }}>
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.8rem", color: selected ? "#1e293b" : "#94a3b8" }}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={13} color="#94a3b8" style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "none" }} />
      </div>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0, zIndex: 9999, background: "white", border: "1px solid #e2e8f0", borderRadius: "8px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", maxHeight: "180px", overflowY: "auto", padding: "4px" }}>
          {options.map(o => (
            <div key={o.value} onClick={() => { onChange(o.value); setOpen(false); }}
              style={{ padding: "0.4rem 0.65rem", borderRadius: "4px", fontSize: "0.8rem", cursor: "pointer", color: "#334155", background: String(o.value) === String(value) ? "#f1f5f9" : "transparent" }}
              onMouseOver={e => e.currentTarget.style.background = "#f8fafc"}
              onMouseOut={e => e.currentTarget.style.background = String(o.value) === String(value) ? "#f1f5f9" : "transparent"}
            >{o.label}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Selector de empresa (proveedor) ─────────────────────────────────────────
function EmpresaSelect({ value, onChange, proveedores }) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const ref                 = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = proveedores.filter(p =>
    (p.razon_social || "").toLowerCase().includes(search.toLowerCase()) ||
    (p.nombre_comercial || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (nombre) => {
    onChange(nombre);
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange("");
    setSearch("");
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          ...inputStyle, fontSize: "0.8rem", padding: "0.3rem 0.5rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", userSelect: "none",
          border: open ? "1px solid #667eea" : "1px solid #cbd5e1",
        }}
      >
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: value ? "#1e293b" : "#94a3b8" }}>
          {value || "Empresa..."}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: "2px", flexShrink: 0 }}>
          {value && (
            <span onClick={handleClear} style={{ color: "#94a3b8", cursor: "pointer", lineHeight: 1, padding: "0 2px" }}>
              <X size={11} />
            </span>
          )}
          <ChevronDown size={11} color="#94a3b8" style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
        </div>
      </div>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0, zIndex: 9999,
          background: "white", border: "1px solid #e2e8f0", borderRadius: "8px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.14)", minWidth: "200px", overflow: "hidden",
        }}>
          <div style={{ padding: "0.4rem 0.5rem", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Search size={12} color="#94a3b8" style={{ flexShrink: 0 }} />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar proveedor..."
              style={{ flex: 1, border: "none", outline: "none", fontSize: "0.78rem", color: "#1e293b", background: "transparent" }}
            />
          </div>
          {/* Opción para texto libre */}
          {search && !filtered.some(p => p.razon_social.toLowerCase() === search.toLowerCase()) && (
            <div
              onClick={() => handleSelect(search)}
              style={{ padding: "0.35rem 0.65rem", fontSize: "0.78rem", color: "#667eea", cursor: "pointer", borderBottom: "1px solid #f1f5f9", fontStyle: "italic" }}
              onMouseOver={e => e.currentTarget.style.background = "#f8fafc"}
              onMouseOut={e => e.currentTarget.style.background = "transparent"}
            >
              Usar &quot;{search}&quot;
            </div>
          )}
          <div style={{ maxHeight: "160px", overflowY: "auto", padding: "3px" }}>
            {filtered.length === 0 && !search ? (
              <div style={{ padding: "0.75rem", textAlign: "center", color: "#94a3b8", fontSize: "0.75rem" }}>Sin proveedores</div>
            ) : filtered.map(p => (
              <div
                key={p.id}
                onClick={() => handleSelect(p.razon_social)}
                style={{ padding: "0.35rem 0.65rem", borderRadius: "4px", fontSize: "0.78rem", cursor: "pointer", color: "#334155", background: value === p.razon_social ? "#f1f5f9" : "transparent" }}
                onMouseOver={e => e.currentTarget.style.background = "#f8fafc"}
                onMouseOut={e => e.currentTarget.style.background = value === p.razon_social ? "#f1f5f9" : "transparent"}
              >
                <div style={{ fontWeight: 500 }}>{p.razon_social}</div>
                {p.nombre_comercial && p.nombre_comercial !== p.razon_social && (
                  <div style={{ fontSize: "0.68rem", color: "#94a3b8" }}>{p.nombre_comercial}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tabla de recursos (Maquinaria o Personal) ────────────────────────────────
function TablaRecursos({ titulo, accentColor, recursos, allRecursos, catKey, onChange, proveedores }) {
  const filas = recursos.filter(r => r.categoria === catKey);

  const update = (recursoId, field, value) =>
    onChange(recursos.map(r => String(r.recurso_id) === String(recursoId) ? { ...r, [field]: value } : r));

  const remove = (recursoId) =>
    onChange(recursos.filter(r => String(r.recurso_id) !== String(recursoId)));

  return (
    <div style={{ marginBottom: "2rem" }}>
      <h4 style={{ margin: "0 0 0.6rem", fontSize: "0.78rem", fontWeight: 800, color: accentColor, textTransform: "uppercase", letterSpacing: "0.06em" }}>{titulo}</h4>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: "28%" }}>Descripción</th>
            <th style={{ ...thStyle, width: "10%", textAlign: "right" }}>Cantidad</th>
            <th style={{ ...thStyle, width: "22%" }}>Empresa</th>
            <th style={{ ...thStyle, width: "32%" }}>Notas</th>
            <th style={{ ...thStyle, width: "8%", textAlign: "center" }}></th>
          </tr>
        </thead>
        <tbody>
          {filas.length === 0 ? (
            <tr><td colSpan={5} style={{ padding: "1rem", textAlign: "center", color: "#94a3b8", fontSize: "0.78rem", fontStyle: "italic" }}>Sin registros — usa "Agregar fila libre"</td></tr>
          ) : filas.map((r) => (
            <tr key={r.recurso_id} style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "0.35rem 0.4rem" }}>
                <input value={r.descripcion || ""} onChange={e => update(r.recurso_id, "descripcion", e.target.value)} placeholder="Descripción..." style={{ ...inputStyle, fontSize: "0.8rem", padding: "0.3rem 0.5rem" }} />
              </td>
              <td style={{ padding: "0.35rem 0.4rem" }}>
                <input type="number" min="0" step="0.5" value={r.cantidad} onChange={e => update(r.recurso_id, "cantidad", parseFloat(e.target.value) || 0)} style={{ ...inputStyle, fontSize: "0.8rem", padding: "0.3rem 0.5rem", textAlign: "right" }} />
              </td>
              <td style={{ padding: "0.35rem 0.4rem" }}>
                <EmpresaSelect
                  value={r.empresa || ""}
                  onChange={v => update(r.recurso_id, "empresa", v)}
                  proveedores={proveedores}
                />
              </td>
              <td style={{ padding: "0.35rem 0.4rem" }}>
                <input value={r.notas || ""} onChange={e => update(r.recurso_id, "notas", e.target.value)} placeholder="Notas..." style={{ ...inputStyle, fontSize: "0.8rem", padding: "0.3rem 0.5rem" }} />
              </td>
              <td style={{ padding: "0.35rem 0.4rem", textAlign: "center" }}>
                <button type="button" onClick={() => remove(r.recurso_id)} style={btnGhost}><X size={15} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        onClick={() => onChange([...recursos, { recurso_id: `libre-${Date.now()}`, recurso_nombre: "", categoria: catKey, descripcion: "", cantidad: 0, empresa: "", notas: "", es_libre: true }])}
        style={{ ...btnOutline, fontSize: "0.75rem", padding: "0.3rem 0.75rem", marginTop: "0.5rem" }}
      >
        <Plus size={12} style={{ marginRight: "4px" }} />Agregar fila libre
      </button>
    </div>
  );
}

// ─── Sección de actividades fija por categoría ────────────────────────────────
function ActividadesFija({ titulo, subtitulo, color, actividades, onChange }) {
  const filas = actividades.filter(a => a.categoria_nombre === titulo);

  const add = () =>
    onChange([...actividades, { categoria_nombre: titulo, descripcion: "" }]);

  const updateDesc = (idxInSec, value) => {
    let secIdx = -1;
    onChange(actividades.map(a => {
      if (a.categoria_nombre === titulo) {
        secIdx++;
        if (secIdx === idxInSec) return { ...a, descripcion: value };
      }
      return a;
    }));
  };

  const remove = (idxInSec) => {
    let secIdx = -1;
    onChange(actividades.filter(a => {
      if (a.categoria_nombre === titulo) { secIdx++; return secIdx !== idxInSec; }
      return true;
    }));
  };

  return (
    <div style={{ ...card, borderLeft: `4px solid ${color}` }}>
      <div style={{ ...cardHead, color, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>
          {titulo}
          {subtitulo && <span style={{ fontWeight: 400, color: "#94a3b8", marginLeft: "0.5rem", fontSize: "0.72rem" }}>— {subtitulo}</span>}
        </span>
        <span style={{ fontSize: "0.7rem", fontWeight: 700, background: color + "18", color, borderRadius: 20, padding: "2px 10px" }}>
          {filas.length} actividad{filas.length !== 1 ? "es" : ""}
        </span>
      </div>
      <div style={cardBody}>
        {filas.length === 0 && (
          <p style={{ margin: "0 0 0.75rem", fontSize: "0.8rem", color: "#94a3b8", fontStyle: "italic" }}>
            Sin actividades — agrega con el botón inferior
          </p>
        )}
        {filas.map((a, i) => (
          <div key={i} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "flex-start" }}>
            <span style={{ color: "#cbd5e1", fontSize: "0.72rem", minWidth: 20, textAlign: "right", paddingTop: "0.65rem", flexShrink: 0 }}>{i + 1}.</span>
            <textarea
              value={a.descripcion}
              onChange={e => updateDesc(i, e.target.value)}
              rows={2}
              placeholder="Descripción de la actividad..."
              style={{ ...inputStyle, resize: "vertical", fontSize: "0.82rem", flex: 1 }}
            />
            <button type="button" onClick={() => remove(i)} style={{ ...btnGhost, marginTop: "0.4rem" }}><X size={14} /></button>
          </div>
        ))}
        <button type="button" onClick={add} style={{ ...btnOutline, fontSize: "0.75rem", padding: "0.3rem 0.75rem", marginTop: "0.25rem" }}>
          <Plus size={12} style={{ marginRight: "4px" }} />Agregar actividad
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FORMULARIO PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════════
const InformeFormulario = forwardRef(({ informe, onGuardado }, ref) => {
  const queryClient = useQueryClient();

  const { data: rawObras = [],   isLoading: isLoadingObras }     = useQuery({ queryKey: ["obras"],               queryFn: () => obraService.list() });
  const { data: recursos = [],   isLoading: isLoadingRecursos }   = useQuery({ queryKey: ["recursos"],            queryFn: () => recursoService.list() });
  const { data: categorias = [], isLoading: isLoadingCategorias } = useQuery({ queryKey: ["categorias-actividad"], queryFn: () => categoriaService.list() });
  const { data: proveedores = [] }                                 = useQuery({ queryKey: ["proveedores-informe"], queryFn: () => proveedorService.list({ estado: "activo" }) });

  const obras = Array.isArray(rawObras) ? rawObras : (rawObras?.results || []);

  const [form, setForm] = useState(normalizarInforme(informe) || {
    obra_id: "", obra_nombre: "", cliente_nombre: "", cliente_seleccionado_id: "", cliente_seleccionado_nombre: "", fecha: new Date().toISOString().split("T")[0],
    dia_semana: DIAS[new Date().getDay()], codigo_formato: "F-141-IN",
    observaciones_generales: "", estado_terreno_inicio: "", estado_terreno_final: "",
    // ── FIRMAS RRHH (nuevos campos) ──────────────────────
    elaborado_por_id: null,
    revisado_por_id: null,
    elaborado_por_detalle: null,
    revisado_por_detalle: null,
    elaborado_por_texto: "",
    cargo_elaborado: "",
    revisado_por_texto: "",
    cargo_revisado: "",
    // ──────────────────────────────────────────────────────
    comision_topografia: false, horas_lluvia: Array(24).fill(false),
    recursos: RECURSOS_DEFAULT, actividades: ACTIVIDADES_DEFAULT, status: "borrador",
  });

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleObraChange = (obraId) => {
    const obra = obras.find(o => String(o.id) === obraId);
    setForm(prev => ({ ...prev, obra_id: obraId, obra_nombre: obra?.nombre || "", cliente_nombre: obra?.cliente_nombre || "" }));
  };

  const handleClienteChange = (clienteId, clienteNombre) => {
    setForm(prev => ({ ...prev, cliente_seleccionado_id: clienteId, cliente_seleccionado_nombre: clienteNombre || "" }));
  };

  const obrasFiltradas = form.cliente_seleccionado_id
    ? obras.filter(o => String(o.cliente) === String(form.cliente_seleccionado_id))
    : obras;

  const handleFechaChange = (fecha) => {
    const d = new Date(fecha + "T12:00:00");
    setForm(prev => ({ ...prev, fecha, dia_semana: DIAS[d.getDay()] }));
  };

  // Busca el ID de categoría en el API por keywords de la sección
  const lookupCatId = (catNombre) => {
    const sec = SECCIONES_ACTIVIDADES.find(s => s.titulo === catNombre);
    if (!sec) return null;
    const found = categorias.find(c =>
      sec.keywords.some(k => c.nombre.toLowerCase().includes(k))
    );
    return found ? parseInt(found.id, 10) : null;
  };

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        obra: data.obra_id ? parseInt(data.obra_id, 10) : null,

        // ── FIRMAS RRHH ───────────────────────────────────
        elaborado_por_id: data.elaborado_por_id,
        revisado_por_id: data.revisado_por_id,
        // ───────────────────────────────────────────────────

        detalles: (data.recursos || [])
          .filter(r => !r.es_libre && r.recurso_id && !String(r.recurso_id).startsWith("libre-"))
          .map(r => ({ recurso: parseInt(r.recurso_id, 10), cantidad: parseFloat(r.cantidad) || 0, empresa: r.empresa || "", notas: r.notas || "" })),

        maquinaria_libre: (data.recursos || [])
          .filter(r => r.es_libre && r.categoria === "MAQUINARIA-EQUIPOS-HERRAMIENTAS-VEHICULOS")
          .map(r => ({ descripcion: r.descripcion || "", cantidad: parseFloat(r.cantidad) || 0, empresa: r.empresa || "", notas: r.notas || "" })),

        personal_libre: (data.recursos || [])
          .filter(r => r.es_libre && r.categoria === "PERSONAL DE OBRA")
          .map(r => ({ descripcion: r.descripcion || "", cantidad: parseFloat(r.cantidad) || 0, empresa: r.empresa || "", notas: r.notas || "" })),

        reportes_lluvia: (data.horas_lluvia || []).map((con_lluvia, hora) => ({ hora, con_lluvia: Boolean(con_lluvia) })),

        actividades: (data.actividades || [])
          .filter(a => (a.descripcion || "").trim())
          .map(a => ({ categoria: lookupCatId(a.categoria_nombre), descripcion: a.descripcion }))
          .filter(a => a.categoria != null),

        items_obra: [],
      };

      delete payload.recursos;
      delete payload.obra_id;
      delete payload.obra_nombre;
      delete payload.cliente_seleccionado_id;
      delete payload.cliente_seleccionado_nombre;
      delete payload.dia_semana;
      // Limpiar campos internos de firmas
      delete payload.elaborado_por_texto;
      delete payload.revisado_por_texto;
      delete payload.elaborado_por_detalle;
      delete payload.revisado_por_detalle;

      return informe ? informeDiarioService.update(informe.id, payload) : informeDiarioService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["informes-diarios"] });
    },
  });

  const getDraftPayload = useCallback(() => {
    const p = { ...form };
    if (!p.fecha) p.fecha = new Date().toISOString().split("T")[0];
    if (!p.dia_semana) {
      const d = new Date(p.fecha + "T12:00:00");
      p.dia_semana = DIAS[d.getDay()];
    }
    if (!p.status) p.status = "borrador";
    return p;
  }, [form]);

  const handleManualSave = useCallback(async () => {
    try {
      await saveMutation.mutateAsync({ ...form });
      toast.success(informe ? "Informe actualizado ✓" : "Informe creado ✓");
      onGuardado();
    } catch (err) {
      const data = err?.response?.data;
      const msg = data?.detail || data?.non_field_errors?.[0] || (typeof data === "object" ? JSON.stringify(data) : null) || "Error al guardar";
      toast.error(msg);
    }
  }, [form, saveMutation, informe, onGuardado]);

  useImperativeHandle(ref, () => ({
    save: () => saveMutation.mutateAsync({ ...form }),
    saveDraft: () => saveMutation.mutateAsync(getDraftPayload()),
    manualSave: handleManualSave,
    getId: () => informe?.id,
  }), [form, saveMutation, informe?.id, getDraftPayload, handleManualSave]);

  if (isLoadingObras || isLoadingRecursos || isLoadingCategorias) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <Loader2 size={28} color="#667eea" style={{ animation: "spin 1s linear infinite" }} />
    </div>
  );
}

  return (
    <div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* ── Datos generales ─────────────────────────────────────────────── */}
      <div style={card}>
        <div style={cardHead}>Datos generales</div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div>
            <label style={label}>Cliente <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: "0.7rem" }}>(desde CRM)</span></label>
            <ClienteSelect value={form.cliente_seleccionado_id} onChange={handleClienteChange} />
            {form.cliente_seleccionado_nombre && form.cliente_nombre && form.cliente_seleccionado_nombre !== form.cliente_nombre &&
              <div style={{ fontSize: "0.7rem", color: "#f59e0b", marginTop: "0.25rem" }}>
                Obra seleccionada pertenece a otro cliente
              </div>}
          </div>
          <div style={{ ...grid3 }}>
          <div>
            <label style={label}>Obra * <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: "0.7rem" }}>(desde OPERACIONES)</span></label>
            <ObraSelect obras={obrasFiltradas} value={form.obra_id} onChange={handleObraChange} />
          </div>
          <div>
            <label style={label}>Fecha *</label>
            <input type="date" value={form.fecha} onChange={e => handleFechaChange(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={label}>Día</label>
            <input value={form.dia_semana} readOnly style={{ ...inputStyle, background: "#f8fafc", color: "#64748b" }} />
          </div>
          <div>
            <label style={label}>Código formato</label>
            <input value={form.codigo_formato} onChange={e => setField("codigo_formato", e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={label}>Estado</label>
            <SimpleSelect
              value={form.status}
              onChange={v => setField("status", v)}
              options={[{ value: "borrador", label: "Borrador" }, { value: "enviado", label: "Enviado" }, { value: "aprobado", label: "Aprobado" }]}
              placeholder="Estado"
            />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.875rem", color: "#475569" }}>
              <input type="checkbox" checked={form.comision_topografia} onChange={e => setField("comision_topografia", e.target.checked)} style={{ width: "1rem", height: "1rem" }} />
              Comisión de Topografía
            </label>
          </div>
          </div>
        </div>
      </div>

      {/* ── Reporte de lluvia ────────────────────────────────────────────── */}
      <div style={card}>
        <div style={cardHead}>Reporte de lluvia</div>
        <div style={cardBody}>
          <HorasLluvia horas={form.horas_lluvia || Array(24).fill(false)} onChange={v => setField("horas_lluvia", v)} />
        </div>
      </div>

      {/* ── Maquinaria / Equipos / Vehículos ────────────────────────────── */}
      <div style={card}>
        <div style={cardHead}>Maquinaria / Equipos / Herramientas / Vehículos</div>
        <div style={cardBody}>
          <TablaRecursos
            titulo="Maquinaria — Equipos — Herramientas — Vehículos"
            accentColor="#f59e0b"
            recursos={form.recursos || []}
            allRecursos={recursos}
            catKey="MAQUINARIA-EQUIPOS-HERRAMIENTAS-VEHICULOS"
            onChange={v => setField("recursos", v)}
            proveedores={proveedores}
          />
        </div>
      </div>

      {/* ── Personal de Obra ─────────────────────────────────────────────── */}
      <div style={card}>
        <div style={cardHead}>Personal de Obra</div>
        <div style={cardBody}>
          <TablaRecursos
            titulo="Personal de Obra"
            accentColor="#10b981"
            recursos={form.recursos || []}
            allRecursos={recursos}
            catKey="PERSONAL DE OBRA"
            onChange={v => setField("recursos", v)}
            proveedores={proveedores}
          />
        </div>
      </div>

      {/* ── 6 secciones fijas de actividades ────────────────────────────── */}
      {SECCIONES_ACTIVIDADES.map(sec => (
        <ActividadesFija
          key={sec.titulo}
          titulo={sec.titulo}
          subtitulo={sec.subtitulo}
          color={sec.color}
          actividades={form.actividades || []}
          onChange={v => setField("actividades", v)}
        />
      ))}

      {/* ── Condiciones y observaciones ─────────────────────────────────── */}
      <div style={card}>
        <div style={cardHead}>Condiciones y observaciones</div>
        <div style={cardBody}>
          <div style={{ ...grid2, marginBottom: "1rem" }}>
            <div>
              <label style={label}>Estado del terreno — Inicio</label>
              <textarea value={form.estado_terreno_inicio} onChange={e => setField("estado_terreno_inicio", e.target.value)} rows={3} placeholder="Condiciones al inicio..." style={{ ...inputStyle, resize: "vertical" }} />
            </div>
            <div>
              <label style={label}>Estado del terreno — Final</label>
              <textarea value={form.estado_terreno_final} onChange={e => setField("estado_terreno_final", e.target.value)} rows={3} placeholder="Condiciones al final..." style={{ ...inputStyle, resize: "vertical" }} />
            </div>
          </div>
          <div>
            <label style={label}>Observaciones generales</label>
            <textarea value={form.observaciones_generales} onChange={e => setField("observaciones_generales", e.target.value)} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          SECCIÓN DE FIRMAS — VINCULADA A RRHH (Empleados)
          ═══════════════════════════════════════════════════════════════════ */}
      <div style={{ ...card, border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(102,126,234,0.08)" }}>
        <div style={{
          ...cardHead,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          borderRadius: "12px 12px 0 0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Signature size={16} />
            Firmas del Informe
          </span>
          <span style={{
            fontSize: "0.65rem",
            fontWeight: 700,
            background: "rgba(255,255,255,0.2)",
            color: "white",
            borderRadius: 20,
            padding: "2px 10px",
          }}>RRHH</span>
        </div>
        <div style={cardBody}>
          <div style={grid2}>
            {/* ── Elaborado por ── */}
            <div>
              <EmpleadoSelect
                label="Elaborado por"
                value={form.elaborado_por_id}
                onChange={(id) => setField("elaborado_por_id", id)}
                onDetailChange={(emp) => setField("elaborado_por_detalle", emp)}
                required={true}
                placeholder="Seleccione el responsable de elaboración"
              />
            </div>

            {/* ── Revisado por ── */}
            <div>
              <EmpleadoSelect
                label="Revisado por"
                value={form.revisado_por_id}
                onChange={(id) => setField("revisado_por_id", id)}
                onDetailChange={(emp) => setField("revisado_por_detalle", emp)}
                required={true}
                placeholder="Seleccione el responsable de revisión"
              />
            </div>
          </div>

          {/* Vista previa de firmas */}
          {(form.elaborado_por_id || form.revisado_por_id) && (
            <div style={{
              marginTop: "1.5rem",
              padding: "1rem",
              background: "#f8fafc",
              border: "1px dashed #cbd5e1",
              borderRadius: "8px",
            }}>
              <p style={{ margin: "0 0 0.75rem", fontSize: "0.78rem", color: "#64748b", fontWeight: 600 }}>
                Vista previa de firmas en el documento:
              </p>
              <div style={grid2}>
                <div style={{ textAlign: "center" }}>
                  {(form.elaborado_por_detalle?.firma_url) ? (
                    <img src={
                      form.elaborado_por_detalle.firma_url.startsWith('http')
                        ? form.elaborado_por_detalle.firma_url
                        : (axiosInstance.defaults.baseURL || '').replace(/\/api\/?$/, '') + '/' + form.elaborado_por_detalle.firma_url.replace(/^\//, '')
                    }
                      alt="Firma elaborado"
                      style={{ height: 50, maxWidth: 160, objectFit: "contain", marginBottom: "0.5rem" }}
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <div style={{ borderTop: "1px solid #94a3b8", paddingTop: "0.5rem", marginTop: "2rem" }}>
                      <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#1e293b" }}>
                        {form.elaborado_por_detalle?.nombre_completo || "_________________"}
                      </div>
                    </div>
                  )}
                  <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.25rem" }}>Elaborado por</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  {(form.revisado_por_detalle?.firma_url) ? (
                    <img src={
                      form.revisado_por_detalle.firma_url.startsWith('http')
                        ? form.revisado_por_detalle.firma_url
                        : (axiosInstance.defaults.baseURL || '').replace(/\/api\/?$/, '') + '/' + form.revisado_por_detalle.firma_url.replace(/^\//, '')
                    }
                      alt="Firma revisado"
                      style={{ height: 50, maxWidth: 160, objectFit: "contain", marginBottom: "0.5rem" }}
                      onError={(e) => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <div style={{ borderTop: "1px solid #94a3b8", paddingTop: "0.5rem", marginTop: "2rem" }}>
                      <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "#1e293b" }}>
                        {form.revisado_por_detalle?.nombre_completo || "_________________"}
                      </div>
                    </div>
                  )}
                  <div style={{ fontSize: "0.72rem", color: "#64748b", marginTop: "0.25rem" }}>Revisado por</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Botones eliminados — el módulo es auto-save */}
    </div>
  );
});

export default InformeFormulario;

