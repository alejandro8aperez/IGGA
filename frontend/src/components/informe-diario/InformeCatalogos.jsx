import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Pencil, Trash2, Plus, Loader2, ExternalLink } from "lucide-react";
import { obraService, recursoService, categoriaService } from "@/services/informeDiarioApi";

// ── OBRAS: solo lectura, vienen de OPERACIONES ─────────────────────────────
const ESTADO_COLOR = {
  planificacion: { bg: "#eff6ff", color: "#3b82f6" },
  ejecucion:     { bg: "#f0fdf4", color: "#16a34a" },
  pausado:       { bg: "#fffbeb", color: "#d97706" },
  completado:    { bg: "#f8fafc", color: "#64748b" },
};

function ObrasLista() {
  const { data: rawObras = [], isLoading } = useQuery({
    queryKey: ["obras"],
    queryFn: () => obraService.list(),
  });
  const obras = Array.isArray(rawObras) ? rawObras : (rawObras?.results || []);

  if (isLoading) return (
    <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
      <Loader2 style={{ display: "inline", animation: "spin 1s linear infinite" }} size={24} />
    </div>
  );

  if (obras.length === 0) return (
    <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
      <p style={{ margin: 0, fontWeight: 600 }}>No hay proyectos registrados</p>
      <p style={{ margin: "0.5rem 0 0", fontSize: "0.8rem" }}>
        Los proyectos se crean desde el módulo <strong>OPERACIONES</strong>.
      </p>
    </div>
  );

  return (
    <div>
      <div style={{
        background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px",
        padding: "0.75rem 1rem", marginBottom: "1rem", display: "flex",
        alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "#64748b",
      }}>
        <ExternalLink size={14} />
        Las obras provienen del módulo <strong>OPERACIONES → Proyectos</strong>. Para agregar o editar, ve a ese módulo.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {obras.map(o => {
          const estilo = ESTADO_COLOR[o.estado] || ESTADO_COLOR.planificacion;
          return (
            <div key={o.id} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "0.75rem 1rem", borderRadius: "8px", background: "#f8fafc",
              border: "1px solid #e2e8f0",
            }}>
              <div>
                <p style={{ margin: 0, fontSize: "0.9rem", fontWeight: 600, color: "#1e293b" }}>
                  {o.nombre}
                </p>
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.75rem", color: "#64748b" }}>
                  {o.cliente_nombre && `Cliente: ${o.cliente_nombre}`}
                  {o.cliente_nombre && o.fecha_inicio && " · "}
                  {o.fecha_inicio && `Inicio: ${o.fecha_inicio}`}
                </p>
              </div>
              <span style={{
                fontSize: "0.7rem", fontWeight: 700, padding: "2px 10px",
                borderRadius: "20px", textTransform: "capitalize",
                background: estilo.bg, color: estilo.color,
              }}>
                {o.estado}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── RECURSOS CRUD ────────────────────────────────────────────────────────────
function RecursosCrud() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: "", categoria: "PERSONAL DE OBRA", unidad: "persona", activo: true, orden: 0 });

  const { data: recursos = [] } = useQuery({ queryKey: ["recursos"], queryFn: () => recursoService.list() });
  const createMut = useMutation({ mutationFn: d => recursoService.create(d), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["recursos"] }); setShowForm(false); } });
  const updateMut = useMutation({ mutationFn: ({ id, d }) => recursoService.update(id, d), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["recursos"] }); setShowForm(false); setEditing(null); } });
  const deleteMut = useMutation({ mutationFn: id => recursoService.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recursos"] }) });

  const openNew = () => { setEditing(null); setForm({ nombre: "", categoria: "PERSONAL DE OBRA", unidad: "persona", activo: true, orden: 0 }); setShowForm(true); };
  const openEdit = (r) => { setEditing(r); setForm({ nombre: r.nombre, categoria: r.categoria, unidad: r.unidad || "persona", activo: r.activo !== false, orden: r.orden || 0 }); setShowForm(true); };
  const save = () => editing ? updateMut.mutate({ id: editing.id, d: form }) : createMut.mutate(form);
  const saving = createMut.isPending || updateMut.isPending;

  const maquinaria = recursos.filter(r => r.categoria === "MAQUINARIA-EQUIPOS-HERRAMIENTAS-VEHICULOS");
  const personal = recursos.filter(r => r.categoria === "PERSONAL DE OBRA");

  const renderGrupo = (titulo, lista) => (
    <div style={{ marginBottom: "1rem" }}>
      <h4 style={{ fontSize: "0.7rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>{titulo}</h4>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        {lista.map(r => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.75rem", borderRadius: "8px", background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "0.875rem" }}>
            <span style={{ color: "#1e293b" }}>{r.nombre} <span style={{ color: "#94a3b8", fontSize: "0.75rem" }}>({r.unidad})</span></span>
            <div style={{ display: "flex", gap: "0.25rem" }}>
              <Button variant="ghost" size="icon" onClick={() => openEdit(r)}><Pencil size={13} /></Button>
              <Button variant="ghost" size="icon" onClick={() => deleteMut.mutate(r.id)} style={{ color: "#ef4444" }}><Trash2 size={13} /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <Button size="sm" onClick={openNew}><Plus size={14} style={{ marginRight: "4px" }} />Nuevo recurso</Button>
      </div>
      {renderGrupo("Maquinaria / Equipos / Vehículos", maquinaria)}
      {renderGrupo("Personal de Obra", personal)}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar recurso" : "Nuevo recurso"}</DialogTitle></DialogHeader>
          <div style={{ display: "grid", gap: "0.75rem", padding: "0.5rem 0" }}>
            <div><Label>Nombre *</Label><Input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <Label>Categoría</Label>
                <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MAQUINARIA-EQUIPOS-HERRAMIENTAS-VEHICULOS">Maquinaria / Equipos</SelectItem>
                    <SelectItem value="PERSONAL DE OBRA">Personal de Obra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Unidad</Label><Input value={form.unidad} onChange={e => setForm({ ...form, unidad: e.target.value })} placeholder="persona, unidad, hora..." /></div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={save} disabled={!form.nombre || saving}>{saving && <Loader2 size={13} style={{ marginRight: "4px", animation: "spin 1s linear infinite" }} />}{editing ? "Guardar" : "Crear"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── CATEGORÍAS CRUD ──────────────────────────────────────────────────────────
function CategoriasCrud() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: "", orden: 0, activo: true });

  const { data: categorias = [] } = useQuery({ queryKey: ["categorias-actividad"], queryFn: () => categoriaService.list() });
  const createMut = useMutation({ mutationFn: d => categoriaService.create(d), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["categorias-actividad"] }); setShowForm(false); } });
  const updateMut = useMutation({ mutationFn: ({ id, d }) => categoriaService.update(id, d), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["categorias-actividad"] }); setShowForm(false); setEditing(null); } });
  const deleteMut = useMutation({ mutationFn: id => categoriaService.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categorias-actividad"] }) });

  const openNew = () => { setEditing(null); setForm({ nombre: "", orden: categorias.length, activo: true }); setShowForm(true); };
  const openEdit = (c) => { setEditing(c); setForm({ nombre: c.nombre, orden: c.orden || 0, activo: c.activo !== false }); setShowForm(true); };
  const save = () => editing ? updateMut.mutate({ id: editing.id, d: form }) : createMut.mutate(form);
  const saving = createMut.isPending || updateMut.isPending;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <Button size="sm" onClick={openNew}><Plus size={14} style={{ marginRight: "4px" }} />Nueva categoría</Button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        {categorias.map(c => (
          <div key={c.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.75rem", borderRadius: "8px", background: "#f8fafc", border: "1px solid #e2e8f0", fontSize: "0.875rem", color: "#1e293b" }}>
            <span>{c.nombre}</span>
            <div style={{ display: "flex", gap: "0.25rem" }}>
              <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Pencil size={13} /></Button>
              <Button variant="ghost" size="icon" onClick={() => deleteMut.mutate(c.id)} style={{ color: "#ef4444" }}><Trash2 size={13} /></Button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Editar categoría" : "Nueva categoría"}</DialogTitle></DialogHeader>
          <div style={{ display: "grid", gap: "0.75rem", padding: "0.5rem 0" }}>
            <div><Label>Nombre *</Label><Input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} /></div>
            <div><Label>Orden</Label><Input type="number" value={form.orden} onChange={e => setForm({ ...form, orden: parseInt(e.target.value) || 0 })} /></div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={save} disabled={!form.nombre || saving}>{saving && <Loader2 size={13} style={{ marginRight: "4px", animation: "spin 1s linear infinite" }} />}{editing ? "Guardar" : "Crear"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── EXPORT ───────────────────────────────────────────────────────────────────
export default function InformeCatalogos() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <p style={{ margin: 0, fontSize: "0.875rem", color: "#64748b" }}>
        Administra los catálogos maestros usados en los informes diarios.
      </p>
      <Tabs defaultValue="recursos">
        <TabsList>
          <TabsTrigger value="recursos">Recursos</TabsTrigger>
          <TabsTrigger value="categorias">Categorías de Actividad</TabsTrigger>
        </TabsList>
        <TabsContent value="recursos" style={{ marginTop: "1rem" }}>
          <Card><CardContent style={{ paddingTop: "1.5rem" }}><RecursosCrud /></CardContent></Card>
        </TabsContent>
        <TabsContent value="categorias" style={{ marginTop: "1rem" }}>
          <Card><CardContent style={{ paddingTop: "1.5rem" }}><CategoriasCrud /></CardContent></Card>
        </TabsContent>
      </Tabs>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
