import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, X, CloudRain, Search, ChevronDown, Check } from "lucide-react";
import { toast } from "sonner";
import { informeDiarioService, obraService, recursoService, categoriaService } from "@/services/informeDiarioApi";

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// ─── Estilos base ────────────────────────────────────────────────────────────
const card     = { background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", marginBottom: "1.25rem" };
const cardHead = { padding: "1rem 1.25rem 0.75rem", borderBottom: "1px solid #f1f5f9", fontWeight: 700, fontSize: "0.8rem", color: "#475569", textTransform: "uppercase", letterSpacing: "0.05em" };
const cardBody = { padding: "1.25rem" };
const label    = { display: "block", fontSize: "0.75rem", fontWeight: 600, color: "#64748b", marginBottom: "0.35rem" };
const inputStyle = { width: "100%", padding: "0.5rem 0.75rem", border: "1px solid #cbd5e1", borderRadius: "8px", fontSize: "0.875rem", background: "white", outline: "none", boxSizing: "border-box" };
const grid3    = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" };
const grid2    = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" };
const btnPrimary = { padding: "0.5rem 1.25rem", borderRadius: "8px", border: "none", background: "#667eea", color: "white", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "0.4rem" };
const btnOutline = { padding: "0.5rem 1.25rem", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", color: "#475569", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer" };
const btnGhost   = { background: "none", border: "none", cursor: "pointer", padding: "0.2rem", color: "#ef4444", display: "flex", alignItems: "center" };

// Cabeceras de las tablas de recursos
const thStyle = {
  padding: "0.4rem 0.5rem",
  fontSize: "0.68rem",
  fontWeight: 700,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  textAlign: "left",
  borderBottom: "1px solid #e2e8f0",
  background: "#f8fafc",
};

function normalizarInforme(informe) {
  if (!informe) return null;
  let oid = "";
  if (informe.obra_id) oid = String(informe.obra_id);
  else if (informe.obra) {
    oid = typeof informe.obra === "object" ? String(informe.obra.id) : String(informe.obra);
  }
  return {
    ...informe,
    obra_id: oid,
    horas_lluvia: Array.isArray(informe.horas_lluvia) ? informe.horas_lluvia.map(Boolean) : Array(24).fill(false),
    recursos: informe.recursos || [],
    actividades: informe.actividades || [],
    items_obra: informe.items_obra || [],
  };
}

// ─── Selector de obra con búsqueda ───────────────────────────────────────────
function ObraSelect({ obras, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  const selected = obras.find(o => String(o.id) === String(value));
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
        style={{
          ...inputStyle, display: "flex", alignItems: "center", justifyContent: "space-between",
          cursor: "pointer", userSelect: "none",
          border: open ? "1px solid #667eea" : "1px solid #cbd5e1",
          boxShadow: open ? "0 0 0 2px rgba(102,126,234,0.2)" : "none",
        }}
      >
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: selected ? "#1e293b" : "#94a3b8" }}>
          {displayLabel}
        </span>
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
              const isSelected = String(o.id) === String(value);
              return (
                <div key={o.id} onClick={() => { onChange(String(o.id)); setOpen(false); setSearch(""); }}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.75rem", borderRadius: "6px", cursor: "pointer", background: isSelected ? "#f1f5f9" : "transparent" }}
                  onMouseOver={e => { if (!isSelected) e.currentTarget.style.background = "#f8fafc"; }}
                  onMouseOut={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                >
                  {isSelected && <Check size={13} color="#667eea" style={{ flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: isSelected ? 700 : 500, fontSize: "0.875rem", color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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

// ─── Horas de lluvia ─────────────────────────────────────────────────────────
function HorasLluvia({ horas, onChange }) {
  return (
    <div>
      <label style={label}>Horas con lluvia (click para marcar)</label>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "4px" }}>
        {Array.from({ length: 24 }, (_, h) => (
          <button key={h} type="button"
            onClick={() => { const n = [...horas]; n[h] = !n[h]; onChange(n); }}
            title={`${h}:00 - ${h + 1}:00`}
            style={{
              height: "2rem", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 700,
              border: horas[h] ? "none" : "1px solid #e2e8f0",
              background: horas[h] ? "#3b82f6" : "#f8fafc",
              color: horas[h] ? "white" : "#94a3b8",
              cursor: "pointer", transition: "all 0.1s",
            }}
          >{h}</button>
        ))}
      </div>
      <p style={{ margin: "0.5rem 0 0", fontSize: "0.75rem", color: "#64748b", display: "flex", alignItems: "center", gap: "0.3rem" }}>
        <CloudRain size={13} color="#60a5fa" />{horas.filter(Boolean).length} hora(s) con lluvia
      </p>
    </div>
  );
}

// ─── Selector simple ──────────────────────────────────────────────────────────
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

// ─── Tabla de recursos (Maquinaria o Personal) ────────────────────────────────
// Columnas: DESCRIPCIÓN | CANTIDAD | EMPRESA | NOTAS | (eliminar)
function TablaRecursos({ titulo, accentColor, recursos, allRecursos, catKey, onChange }) {
  const opciones = allRecursos.filter(r => r.categoria === catKey && r.activo !== false);
  const filas = recursos.filter(r => r.categoria === catKey);

  const agregar = (recursoId) => {
    const recurso = allRecursos.find(r => String(r.id) === String(recursoId));
    if (!recurso || recursos.find(r => String(r.recurso_id) === String(recurso.id))) return;
    onChange([
      ...recursos,
      {
        recurso_id:     recurso.id,
        recurso_nombre: recurso.nombre,
        categoria:      recurso.categoria,
        descripcion:    recurso.nombre,   // pre-rellena con el nombre del catálogo
        cantidad:       0,
        empresa:        "",
        notas:          "",
      },
    ]);
  };

  const update = (recursoId, field, value) => {
    onChange(recursos.map(r => String(r.recurso_id) === String(recursoId) ? { ...r, [field]: value } : r));
  };

  const remove = (recursoId) => {
    onChange(recursos.filter(r => String(r.recurso_id) !== String(recursoId)));
  };

  return (
    <div style={{ marginBottom: "2rem" }}>
      {/* Cabecera de sección */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.6rem" }}>
        <h4 style={{ margin: 0, fontSize: "0.78rem", fontWeight: 800, color: accentColor, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {titulo}
        </h4>
        <div style={{ width: "200px" }}>
          <SimpleSelect
            value=""
            onChange={agregar}
            options={opciones.map(r => ({ value: String(r.id), label: r.nombre }))}
            placeholder="+ Agregar del catálogo"
          />
        </div>
      </div>

      {/* Tabla */}
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
            <tr>
              <td colSpan={5} style={{ padding: "1rem", textAlign: "center", color: "#94a3b8", fontSize: "0.78rem", fontStyle: "italic" }}>
                Sin registros — agrega desde el catálogo o usa "Agregar fila libre"
              </td>
            </tr>
          ) : filas.map((r) => (
            <tr key={r.recurso_id} style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "0.35rem 0.4rem" }}>
                <input
                  value={r.descripcion || ""}
                  onChange={e => update(r.recurso_id, "descripcion", e.target.value)}
                  placeholder="Descripción..."
                  style={{ ...inputStyle, fontSize: "0.8rem", padding: "0.3rem 0.5rem" }}
                />
              </td>
              <td style={{ padding: "0.35rem 0.4rem" }}>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={r.cantidad}
                  onChange={e => update(r.recurso_id, "cantidad", parseFloat(e.target.value) || 0)}
                  style={{ ...inputStyle, fontSize: "0.8rem", padding: "0.3rem 0.5rem", textAlign: "right" }}
                />
              </td>
              <td style={{ padding: "0.35rem 0.4rem" }}>
                <input
                  value={r.empresa || ""}
                  onChange={e => update(r.recurso_id, "empresa", e.target.value)}
                  placeholder="Empresa..."
                  style={{ ...inputStyle, fontSize: "0.8rem", padding: "0.3rem 0.5rem" }}
                />
              </td>
              <td style={{ padding: "0.35rem 0.4rem" }}>
                <input
                  value={r.notas || ""}
                  onChange={e => update(r.recurso_id, "notas", e.target.value)}
                  placeholder="Notas..."
                  style={{ ...inputStyle, fontSize: "0.8rem", padding: "0.3rem 0.5rem" }}
                />
              </td>
              <td style={{ padding: "0.35rem 0.4rem", textAlign: "center" }}>
                <button type="button" onClick={() => remove(r.recurso_id)} style={btnGhost}>
                  <X size={15} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Botón fila libre */}
      <button
        type="button"
        onClick={() => onChange([
          ...recursos,
          {
            recurso_id:     `libre-${Date.now()}`,
            recurso_nombre: "",
            categoria:      catKey,
            descripcion:    "",
            cantidad:       0,
            empresa:        "",
            notas:          "",
            es_libre:       true,
          },
        ])}
        style={{ ...btnOutline, fontSize: "0.75rem", padding: "0.3rem 0.75rem", marginTop: "0.5rem" }}
      >
        <Plus size={12} style={{ marginRight: "4px" }} />Agregar fila libre
      </button>
    </div>
  );
}

// ─── Actividades ──────────────────────────────────────────────────────────────
function ActividadesSection({ actividades, categorias, onChange }) {
  const addActividad = () => {
    const cat = categorias[0];
    if (!cat) return;
    onChange([...actividades, { categoria_id: cat.id, categoria_nombre: cat.nombre, descripcion: "" }]);
  };
  const update = (idx, field, value) => {
    const n = [...actividades];
    n[idx] = { ...n[idx], [field]: value };
    if (field === "categoria_id") n[idx].categoria_nombre = categorias.find(c => String(c.id) === value)?.nombre || "";
    onChange(n);
  };
  const remove = (idx) => onChange(actividades.filter((_, i) => i !== idx));

  return (
    <div>
      {actividades.map((act, idx) => (
        <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.5fr 3fr auto", gap: "0.5rem", alignItems: "start", marginBottom: "0.5rem" }}>
          <SimpleSelect
            value={String(act.categoria_id)}
            onChange={v => update(idx, "categoria_id", v)}
            options={categorias.map(c => ({ value: String(c.id), label: c.nombre }))}
            placeholder="Categoría"
          />
          <textarea
            value={act.descripcion}
            onChange={e => update(idx, "descripcion", e.target.value)}
            placeholder="Descripción de la actividad..."
            rows={2}
            style={{ ...inputStyle, resize: "vertical", fontSize: "0.8rem", padding: "0.4rem 0.65rem" }}
          />
          <button type="button" onClick={() => remove(idx)} style={{ ...btnGhost, marginTop: "0.4rem" }}><X size={15} /></button>
        </div>
      ))}
      <button type="button" onClick={addActividad} style={{ ...btnOutline, fontSize: "0.8rem", padding: "0.4rem 0.75rem", marginTop: "0.5rem" }}>
        <Plus size={13} style={{ marginRight: "4px" }} />Agregar actividad
      </button>
    </div>
  );
}

// ─── Formulario principal ─────────────────────────────────────────────────────
export default function InformeFormulario({ informe, onGuardado, onCancelar }) {
  const queryClient = useQueryClient();

  const { data: rawObras = [], isLoading: isLoadingObras }         = useQuery({ queryKey: ["obras"],              queryFn: () => obraService.list() });
  const { data: recursos = [], isLoading: isLoadingRecursos }       = useQuery({ queryKey: ["recursos"],           queryFn: () => recursoService.list() });
  const { data: categorias = [], isLoading: isLoadingCategorias }   = useQuery({ queryKey: ["categorias-actividad"], queryFn: () => categoriaService.list() });

  const obras = Array.isArray(rawObras) ? rawObras : (rawObras?.results || []);

  const [form, setForm] = useState(normalizarInforme(informe) || {
    obra_id: "", obra_nombre: "", fecha: new Date().toISOString().split("T")[0],
    dia_semana: DIAS[new Date().getDay()], codigo_formato: "F-141-IN",
    observaciones_generales: "", estado_terreno_inicio: "", estado_terreno_final: "",
    elaborado_por: "", cargo_elaborado: "", revisado_por: "", cargo_revisado: "",
    comision_topografia: false, horas_lluvia: Array(24).fill(false),
    recursos: [], actividades: [], items_obra: [], status: "borrador",
  });

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleObraChange = (obraId) => {
    const obra = obras.find(o => String(o.id) === obraId);
    setForm(prev => ({ ...prev, obra_id: obraId, obra_nombre: obra?.nombre || "" }));
  };

  const handleFechaChange = (fecha) => {
    const d = new Date(fecha + "T12:00:00");
    setForm(prev => ({ ...prev, fecha, dia_semana: DIAS[d.getDay()] }));
  };

  const addItemObra    = () => setField("items_obra", [...(form.items_obra || []), { item: "", descripcion: "", empresa: "", responsable: "" }]);
  const updateItemObra = (idx, f, v) => { const n = [...(form.items_obra || [])]; n[idx] = { ...n[idx], [f]: v }; setField("items_obra", n); };
  const removeItemObra = (idx) => setField("items_obra", (form.items_obra || []).filter((_, i) => i !== idx));

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const payload = { ...data, obra: data.obra_id ? parseInt(data.obra_id, 10) : null };
      return informe ? informeDiarioService.update(informe.id, payload) : informeDiarioService.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["informes-diarios"] });
      toast.success(informe ? "Informe actualizado ✓" : "Informe creado ✓");
      onGuardado();
    },
    onError: (error) => {
      const data = error?.response?.data;
      const msg = data?.detail || data?.non_field_errors?.[0] || (typeof data === "object" ? JSON.stringify(data) : null) || "Error al guardar";
      toast.error(msg);
    },
  });

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

      {/* Datos generales */}
      <div style={card}>
        <div style={cardHead}>Datos generales</div>
        <div style={{ ...cardBody, ...grid3 }}>
          <div>
            <label style={label}>Obra * <span style={{ color: "#94a3b8", fontWeight: 400, fontSize: "0.7rem" }}>(desde OPERACIONES)</span></label>
            <ObraSelect obras={obras} value={form.obra_id} onChange={handleObraChange} />
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

      {/* Lluvia */}
      <div style={card}>
        <div style={cardHead}>Reporte de lluvia</div>
        <div style={cardBody}>
          <HorasLluvia horas={form.horas_lluvia || Array(24).fill(false)} onChange={v => setField("horas_lluvia", v)} />
        </div>
      </div>

      {/* ── MAQUINARIA / EQUIPOS / VEHÍCULOS ── */}
      <div style={card}>
        <div style={cardHead}>Maquinaria / Equipos / Vehículos</div>
        <div style={cardBody}>
          <TablaRecursos
            titulo="Maquinaria — Equipos — Herramientas — Vehículos"
            accentColor="#f59e0b"
            recursos={form.recursos || []}
            allRecursos={recursos}
            catKey="MAQUINARIA-EQUIPOS-HERRAMIENTAS-VEHICULOS"
            onChange={v => setField("recursos", v)}
          />
        </div>
      </div>

      {/* ── PERSONAL DE OBRA ── */}
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
          />
        </div>
      </div>

      {/* Actividades */}
      <div style={card}>
        <div style={cardHead}>Actividades del día</div>
        <div style={cardBody}>
          <ActividadesSection actividades={form.actividades || []} categorias={categorias} onChange={v => setField("actividades", v)} />
        </div>
      </div>

      {/* Ítems de obra */}
      <div style={card}>
        <div style={{ ...cardHead, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span>Ítems de obra</span>
          <button type="button" onClick={addItemObra} style={{ ...btnOutline, fontSize: "0.75rem", padding: "0.3rem 0.65rem" }}>
            <Plus size={12} style={{ marginRight: "4px" }} />Agregar ítem
          </button>
        </div>
        <div style={cardBody}>
          {(form.items_obra || []).length === 0 && <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8", fontStyle: "italic" }}>Sin ítems de obra</p>}
          {(form.items_obra || []).map((item, idx) => (
            <div key={idx} style={{ display: "grid", gridTemplateColumns: "1fr 3fr 1.5fr 2fr auto", gap: "0.5rem", marginBottom: "0.5rem", alignItems: "center" }}>
              <input value={item.item} onChange={e => updateItemObra(idx, "item", e.target.value)} placeholder="Ítem" style={{ ...inputStyle, fontSize: "0.8rem", padding: "0.35rem 0.6rem" }} />
              <input value={item.descripcion} onChange={e => updateItemObra(idx, "descripcion", e.target.value)} placeholder="Descripción" style={{ ...inputStyle, fontSize: "0.8rem", padding: "0.35rem 0.6rem" }} />
              <input value={item.empresa} onChange={e => updateItemObra(idx, "empresa", e.target.value)} placeholder="Empresa" style={{ ...inputStyle, fontSize: "0.8rem", padding: "0.35rem 0.6rem" }} />
              <input value={item.responsable} onChange={e => updateItemObra(idx, "responsable", e.target.value)} placeholder="Responsable" style={{ ...inputStyle, fontSize: "0.8rem", padding: "0.35rem 0.6rem" }} />
              <button type="button" onClick={() => removeItemObra(idx)} style={btnGhost}><X size={15} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* Condiciones */}
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

      {/* Firmas */}
      <div style={card}>
        <div style={cardHead}>Firmas</div>
        <div style={{ ...cardBody, ...grid2 }}>
          <div>
            <label style={label}>Elaborado por</label>
            <input value={form.elaborado_por} onChange={e => setField("elaborado_por", e.target.value)} placeholder="Nombre" style={{ ...inputStyle, marginBottom: "0.5rem" }} />
            <input value={form.cargo_elaborado} onChange={e => setField("cargo_elaborado", e.target.value)} placeholder="Cargo" style={inputStyle} />
          </div>
          <div>
            <label style={label}>Revisado por</label>
            <input value={form.revisado_por} onChange={e => setField("revisado_por", e.target.value)} placeholder="Nombre" style={{ ...inputStyle, marginBottom: "0.5rem" }} />
            <input value={form.cargo_revisado} onChange={e => setField("cargo_revisado", e.target.value)} placeholder="Cargo" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Botones */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", paddingBottom: "2rem" }}>
        <button type="button" onClick={onCancelar} disabled={saveMutation.isPending} style={btnOutline}>Cancelar</button>
        <button
          type="button"
          onClick={() => saveMutation.mutate(form)}
          disabled={!form.obra_id || !form.fecha || saveMutation.isPending}
          title={!form.obra_id ? "Selecciona una obra primero" : ""}
          style={{
            ...btnPrimary,
            opacity: (!form.obra_id || !form.fecha || saveMutation.isPending) ? 0.5 : 1,
            cursor: (!form.obra_id || !form.fecha || saveMutation.isPending) ? "not-allowed" : "pointer",
          }}
        >
          {saveMutation.isPending && <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />}
          {informe ? "Guardar cambios" : "Crear informe"}
        </button>
      </div>
    </div>
  );
}
