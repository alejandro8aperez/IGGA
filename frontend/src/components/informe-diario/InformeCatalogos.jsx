import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { obraService, recursoService, categoriaService } from "@/services/informeDiarioApi";

function ObrasCrud() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ codigo: "", nombre: "", ubicacion: "", cliente: "", activo: true });

  const { data: obras = [] } = useQuery({ queryKey: ["obras"], queryFn: () => obraService.list() });
  const createMut = useMutation({ mutationFn: d => obraService.create(d), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["obras"] }); setShowForm(false); } });
<<<<<<< HEAD
  const updateMut = useMutation({ mutationFn: ({ id, d }) => { return obraService.update(id, d); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["obras"] }); setShowForm(false); setEditing(null); } });
=======
  const updateMut = useMutation({ mutationFn: ({ id, d }) => obraService.update(id, d), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["obras"] }); setShowForm(false); setEditing(null); } });
>>>>>>> d8a607cfdc1d14289f2c24949c8fecb7a71c1d9f
  const deleteMut = useMutation({ mutationFn: id => obraService.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["obras"] }) });

  const openNew = () => { setEditing(null); setForm({ codigo: "", nombre: "", ubicacion: "", cliente: "", activo: true }); setShowForm(true); };
  const openEdit = (o) => { setEditing(o); setForm({ codigo: o.codigo, nombre: o.nombre, ubicacion: o.ubicacion || "", cliente: o.cliente || "", activo: o.activo !== false }); setShowForm(true); };
  const save = () => editing ? updateMut.mutate({ id: editing.id, d: form }) : createMut.mutate(form);
  const saving = createMut.isPending || updateMut.isPending;

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><Button size="sm" onClick={openNew} className="gap-1"><Plus className="h-3.5 w-3.5" />Nueva obra</Button></div>
      <div className="space-y-2">
        {obras.map(o => (
          <div key={o.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div><p className="text-sm font-medium">{o.codigo} — {o.nombre}</p><p className="text-xs text-muted-foreground">{o.cliente} · {o.ubicacion}</p></div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(o)}><Pencil className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteMut.mutate(o.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Editar obra" : "Nueva obra"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Código *</Label><Input value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })} /></div>
              <div className="space-y-1"><Label>Nombre *</Label><Input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} /></div>
            </div>
            <div className="space-y-1"><Label>Cliente</Label><Input value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} /></div>
            <div className="space-y-1"><Label>Ubicación</Label><Input value={form.ubicacion} onChange={e => setForm({ ...form, ubicacion: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={save} disabled={!form.codigo || !form.nombre || saving}>{saving && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}{editing ? "Guardar" : "Crear"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function RecursosCrud() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: "", categoria: "PERSONAL DE OBRA", unidad: "persona", activo: true, orden: 0 });

  const { data: recursos = [] } = useQuery({ queryKey: ["recursos"], queryFn: () => recursoService.list() });
  const createMut = useMutation({ mutationFn: d => recursoService.create(d), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["recursos"] }); setShowForm(false); } });
<<<<<<< HEAD
  const updateMut = useMutation({ mutationFn: ({ id, d }) => { return recursoService.update(id, d); }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["recursos"] }); setShowForm(false); setEditing(null); } });
=======
  const updateMut = useMutation({ mutationFn: ({ id, d }) => recursoService.update(id, d), onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["recursos"] }); setShowForm(false); setEditing(null); } });
>>>>>>> d8a607cfdc1d14289f2c24949c8fecb7a71c1d9f
  const deleteMut = useMutation({ mutationFn: id => recursoService.delete(id), onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recursos"] }) });

  const openNew = () => { setEditing(null); setForm({ nombre: "", categoria: "PERSONAL DE OBRA", unidad: "persona", activo: true, orden: 0 }); setShowForm(true); };
  const openEdit = (r) => { setEditing(r); setForm({ nombre: r.nombre, categoria: r.categoria, unidad: r.unidad || "persona", activo: r.activo !== false, orden: r.orden || 0 }); setShowForm(true); };
  const save = () => editing ? updateMut.mutate({ id: editing.id, d: form }) : createMut.mutate(form);
  const saving = createMut.isPending || updateMut.isPending;

  const maquinaria = recursos.filter(r => r.categoria === "MAQUINARIA-EQUIPOS-HERRAMIENTAS-VEHICULOS");
  const personal = recursos.filter(r => r.categoria === "PERSONAL DE OBRA");

  const renderGrupo = (titulo, lista) => (
    <div>
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{titulo}</h4>
      <div className="space-y-1.5">
        {lista.map(r => (
          <div key={r.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 text-sm">
            <span>{r.nombre} <span className="text-xs text-muted-foreground">({r.unidad})</span></span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(r)}><Pencil className="h-3 w-3" /></Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteMut.mutate(r.id)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button size="sm" onClick={openNew} className="gap-1"><Plus className="h-3.5 w-3.5" />Nuevo recurso</Button></div>
      {renderGrupo("Maquinaria / Equipos / Vehículos", maquinaria)}
      {renderGrupo("Personal de Obra", personal)}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Editar recurso" : "Nuevo recurso"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1"><Label>Nombre *</Label><Input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Categoría</Label>
                <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MAQUINARIA-EQUIPOS-HERRAMIENTAS-VEHICULOS">Maquinaria / Equipos</SelectItem>
                    <SelectItem value="PERSONAL DE OBRA">Personal de Obra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>Unidad</Label><Input value={form.unidad} onChange={e => setForm({ ...form, unidad: e.target.value })} placeholder="persona, unidad, hora..." /></div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={save} disabled={!form.nombre || saving}>{saving && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}{editing ? "Guardar" : "Crear"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

<<<<<<< HEAD
=======
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
    <div className="space-y-3">
      <div className="flex justify-end"><Button size="sm" onClick={openNew} className="gap-1"><Plus className="h-3.5 w-3.5" />Nueva categoría</Button></div>
      <div className="space-y-1.5">
        {categorias.map(c => (
          <div key={c.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/50 text-sm">
            <span>{c.nombre}</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => openEdit(c)}><Pencil className="h-3 w-3" /></Button>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => deleteMut.mutate(c.id)}><Trash2 className="h-3 w-3" /></Button>
            </div>
          </div>
        ))}
      </div>
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editing ? "Editar categoría" : "Nueva categoría"}</DialogTitle></DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="space-y-1"><Label>Nombre *</Label><Input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} /></div>
            <div className="space-y-1"><Label>Orden</Label><Input type="number" value={form.orden} onChange={e => setForm({ ...form, orden: parseInt(e.target.value) || 0 })} /></div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={save} disabled={!form.nombre || saving}>{saving && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}{editing ? "Guardar" : "Crear"}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

>>>>>>> d8a607cfdc1d14289f2c24949c8fecb7a71c1d9f
export default function InformeCatalogos() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Administra los catálogos maestros usados en los informes diarios.</p>
      <Tabs defaultValue="obras">
        <TabsList>
          <TabsTrigger value="obras">Obras</TabsTrigger>
          <TabsTrigger value="recursos">Recursos</TabsTrigger>
          <TabsTrigger value="categorias">Categorías de Actividad</TabsTrigger>
        </TabsList>
        <TabsContent value="obras" className="mt-4"><Card><CardContent className="pt-6"><ObrasCrud /></CardContent></Card></TabsContent>
        <TabsContent value="recursos" className="mt-4"><Card><CardContent className="pt-6"><RecursosCrud /></CardContent></Card></TabsContent>
<<<<<<< HEAD
      </Tabs>
    </div>
  );
}
=======
        <TabsContent value="categorias" className="mt-4"><Card><CardContent className="pt-6"><CategoriasCrud /></CardContent></Card></TabsContent>
      </Tabs>
    </div>
  );
}
>>>>>>> d8a607cfdc1d14289f2c24949c8fecb7a71c1d9f
