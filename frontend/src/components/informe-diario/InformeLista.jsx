import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, Search, CloudRain, Users, FileText } from "lucide-react";
import { informeDiarioService } from "@/services/informeDiarioApi";

const STATUS = {
  aprobado: { bg: "#f0fdf4", color: "#16a34a" },
  enviado:  { bg: "#eff6ff", color: "#2563eb" },
  borrador: { bg: "#fffbeb", color: "#d97706" },
};

export default function InformeLista({ onNuevo, onEditar }) {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);
  const queryClient = useQueryClient();

  const { data: informes = [], isLoading } = useQuery({
    queryKey: ["informes-diarios"],
    queryFn: () => informeDiarioService.list({ ordering: "-fecha" }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => informeDiarioService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["informes-diarios"] }),
  });

  const filtered = informes.filter(i =>
    i.obra_nombre?.toLowerCase().includes(search.toLowerCase()) ||
    i.fecha?.includes(search)
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>

      {/* Barra superior */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px", maxWidth: "360px" }}>
          <Search size={15} style={{ position: "absolute", left: "0.65rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none" }} />
          <input
            placeholder="Buscar por obra o fecha..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "0.5rem 0.75rem 0.5rem 2.2rem",
              border: "1px solid #cbd5e1", borderRadius: "8px",
              fontSize: "0.875rem", background: "white", outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
        <button
          onClick={onNuevo}
          style={{
            padding: "0.5rem 1rem", borderRadius: "8px", border: "none",
            background: "#667eea", color: "white", fontWeight: 600,
            fontSize: "0.875rem", cursor: "pointer", display: "flex",
            alignItems: "center", gap: "0.4rem", flexShrink: 0,
          }}
        >
          + Nuevo informe
        </button>
      </div>

      {/* Contenido */}
      {isLoading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8", fontSize: "0.875rem" }}>
          Cargando informes...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          textAlign: "center", padding: "3rem", color: "#94a3b8",
          background: "white", borderRadius: "12px", border: "1px solid #e2e8f0",
        }}>
          <FileText size={32} style={{ marginBottom: "0.5rem", opacity: 0.4 }} />
          <p style={{ margin: 0, fontWeight: 600 }}>
            {search ? "Sin resultados para esa búsqueda" : "No hay informes registrados"}
          </p>
          {!search && (
            <p style={{ margin: "0.4rem 0 0", fontSize: "0.8rem" }}>
              Presiona <strong>+ Nuevo informe</strong> para crear el primero.
            </p>
          )}
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
          {/* Cabecera tabla */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 0.7fr 0.7fr 0.7fr 0.8fr 2rem",
            padding: "0.65rem 1rem", background: "#f8fafc",
            borderBottom: "1px solid #e2e8f0", fontSize: "0.7rem",
            fontWeight: 700, color: "#94a3b8", textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>
            <span>Obra</span>
            <span>Fecha</span>
            <span>Personal</span>
            <span>Lluvia</span>
            <span>Activ.</span>
            <span>Estado</span>
            <span></span>
          </div>

          {/* Filas */}
          {filtered.map((inf, idx) => {
            const personal = (inf.recursos || [])
              .filter(r => r.categoria === "PERSONAL DE OBRA")
              .reduce((s, r) => s + (r.cantidad || 0), 0);
            const lluvia = (inf.horas_lluvia || []).filter(Boolean).length;
            const st = STATUS[inf.status || "borrador"];
            const isLast = idx === filtered.length - 1;

            return (
              <div
                key={inf.id}
                onClick={() => onEditar(inf)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 0.7fr 0.7fr 0.7fr 0.8fr 2rem",
                  padding: "0.75rem 1rem", alignItems: "center",
                  borderBottom: isLast ? "none" : "1px solid #f1f5f9",
                  cursor: "pointer", transition: "background 0.1s",
                }}
                onMouseOver={e => e.currentTarget.style.background = "#f8fafc"}
                onMouseOut={e => e.currentTarget.style.background = "transparent"}
              >
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: "0.875rem", color: "#1e293b" }}>
                    {inf.obra_nombre || "Sin obra"}
                  </p>
                  {inf.dia_semana && (
                    <p style={{ margin: 0, fontSize: "0.7rem", color: "#94a3b8", textTransform: "capitalize" }}>
                      {inf.dia_semana}
                    </p>
                  )}
                </div>
                <span style={{ fontSize: "0.875rem", color: "#475569" }}>{inf.fecha}</span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.875rem", color: "#475569" }}>
                  <Users size={13} color="#94a3b8" />{Math.round(personal) || 0}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.875rem", color: "#475569" }}>
                  <CloudRain size={13} color="#60a5fa" />{lluvia}h
                </span>
                <span style={{ fontSize: "0.875rem", color: "#475569" }}>
                  {(inf.actividades || []).length}
                </span>
                <span style={{
                  display: "inline-block", fontSize: "0.7rem", fontWeight: 700,
                  padding: "2px 8px", borderRadius: "20px", textTransform: "capitalize",
                  background: st.bg, color: st.color,
                }}>
                  {inf.status || "borrador"}
                </span>

                {/* Menú acciones */}
                <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => setMenuOpen(menuOpen === inf.id ? null : inf.id)}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      padding: "0.2rem", borderRadius: "4px", color: "#94a3b8",
                      display: "flex", alignItems: "center",
                    }}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  {menuOpen === inf.id && (
                    <div style={{
                      position: "absolute", right: 0, top: "100%", zIndex: 100,
                      background: "white", border: "1px solid #e2e8f0", borderRadius: "8px",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)", minWidth: "130px", padding: "4px",
                    }}>
                      <div
                        onClick={() => { onEditar(inf); setMenuOpen(null); }}
                        style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.75rem", borderRadius: "4px", fontSize: "0.875rem", color: "#334155", cursor: "pointer" }}
                        onMouseOver={e => e.currentTarget.style.background = "#f8fafc"}
                        onMouseOut={e => e.currentTarget.style.background = "transparent"}
                      >
                        <Pencil size={13} /> Editar
                      </div>
                      <div
                        onClick={() => { if (window.confirm("¿Eliminar este informe?")) deleteMutation.mutate(inf.id); setMenuOpen(null); }}
                        style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.75rem", borderRadius: "4px", fontSize: "0.875rem", color: "#ef4444", cursor: "pointer" }}
                        onMouseOver={e => e.currentTarget.style.background = "#fef2f2"}
                        onMouseOut={e => e.currentTarget.style.background = "transparent"}
                      >
                        <Trash2 size={13} /> Eliminar
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
