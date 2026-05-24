import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, X, Upload, CloudRain } from "lucide-react";
import { informeDiarioService, obraService, recursoService, categoriaService, uploadFile } from "@/services/informeDiarioApi";

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function HorasLluvia({ horas, onChange }) {
  return (
    <div className="space-y-2">
      <Label>Horas con lluvia (click para marcar)</Label>
      <div className="grid grid-cols-12 gap-1">
        {Array.from({ length: 24 }, (_, h) => (
          <button key={h} type="button"
            onClick={() => { const next = [...horas]; next[h] = !next[h]; onChange(next); }}
            className={`h-8 w-full rounded text-xs font-medium border transition-all ${horas[h] ? "bg-blue-500 text-white border-blue-600" : "bg-muted text-muted-foreground border-border hover:bg-muted/80"}`}
            title={`${h}:00 - ${h + 1}:00`}>{h}</button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground"><CloudRain className="h-3 w-3 inline mr-1 text-blue-400" />{horas.filter(Boolean).length} hora(s) con lluvia</p>
    </div>
  );
}

function RecursosSection({ recursos, allRecursos, onChange }) {
  const maquinaria = allRecursos.filter(r => r.categoria === "MAQUINARIA-EQUIPOS-HERRAMIENTAS-VEHICULOS" && r.activo !== false);
  const personal = allRecursos.filter(r => r.categoria === "PERSONAL DE OBRA" && r.activo !== false);

  const addRecurso = (recurso) => {
    if (recursos.find(r => r.recurso_id === recurso.id)) return;
    onChange([...recursos, { recurso_id: recurso.id, recurso_nombre: recurso.nombre, categoria: recurso.categoria, cantidad: 0, empresa: "", observacion: "" }]);
  };
  const updateRecurso = (idx, field, value) => { const next = [...recursos]; next[idx] = { ...next[idx], [field]: value }; onChange(next); };
  const removeRecurso = (idx) => onChange(recursos.filter((_, i) => i !== idx));

  const renderGrupo = (titulo, lista, catKey) => {
    const activos = recursos.filter(r => r.categoria === catKey);
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold">{titulo}</h4>
          <Select onValueChange={v => { const r = allRecursos.find(x => String(x.id) === v); if (r) addRecurso(r); }}>
            <SelectTrigger className="w-56 h-8 text-xs"><SelectValue placeholder="+ Agregar recurso" /></SelectTrigger>
            <SelectContent>{lista.map(r => <SelectItem key={r.id} value={String(r.id)} className="text-xs">{r.nombre}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        {activos.length === 0 ? <p className="text-xs text-muted-foreground italic py-2">Sin recursos agregados</p> : (
          <div className="space-y-2">
            {activos.map(r => {
              const idx = recursos.indexOf(r);
              return (
                <div key={r.recurso_id} className="grid grid-cols-12 gap-2 items-center text-sm bg-muted/40 rounded-lg p-2">
                  <span className="col-span-4 font-medium truncate">{r.recurso_nombre}</span>
                  <Input className="col-span-2 h-7 text-xs" type="number" min="0" value={r.cantidad} onChange={e => updateRecurso(idx, "cantidad", parseFloat(e.target.value) || 0)} placeholder="Cant." />
                  <Input className="col-span-3 h-7 text-xs" value={r.empresa} onChange={e => updateRecurso(idx, "empresa", e.target.value)} placeholder="Empresa" />
                  <Input className="col-span-2 h-7 text-xs" value={r.observacion} onChange={e => updateRecurso(idx, "observacion", e.target.value)} placeholder="Obs." />
                  <button type="button" onClick={() => removeRecurso(idx)} className="col-span-1 flex justify-center text-destructive hover:opacity-70"><X className="h-4 w-4" /></button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {renderGrupo("Maquinaria / Equipos", maquinaria, "MAQUINARIA-EQUIPOS-HERRAMIENTAS-VEHICULOS")}
      <Separator />
      {renderGrupo("Personal de Obra", personal, "PERSONAL DE OBRA")}
    </div>
  );
}

function ActividadesSection({ actividades, categorias, onChange }) {
  const addActividad = () => {
    const cat = categorias[0];
    if (!cat) return;
    onChange([...actividades, { categoria_id: cat.id, categoria_nombre: cat.nombre, descripcion: "" }]);
  };
  const update = (idx, field, value) => {
    const next = [...actividades];
    next[idx] = { ...next[idx], [field]: value };
    if (field === "categoria_id") next[idx].categoria_nombre = categorias.find(c => String(c.id) === value)?.nombre || "";
    onChange(next);
  };
  const remove = (idx) => onChange(actividades.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      {actividades.map((act, idx) => (
        <div key={idx} className="grid grid-cols-12 gap-2 items-start">
          <div className="col-span-4">
            <Select value={String(act.categoria_id)} onValueChange={v => update(idx, "categoria_id", v)}>
              <SelectTrigger className="text-xs h-9"><SelectValue placeholder="Categoría" /></SelectTrigger>
              <SelectContent>{categorias.map(c => <SelectItem key={c.id} value={String(c.id)} className="text-xs">{c.nombre}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Textarea className="col-span-7 text-xs min-h-[36px] h-9 resize-none" value={act.descripcion} onChange={e => update(idx, "descripcion", e.target.value)} placeholder="Descripción..." />
          <button type="button" onClick={() => remove(idx)} className="col-span-1 mt-2 flex justify-center text-destructive hover:opacity-70"><X className="h-4 w-4" /></button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={addActividad} className="gap-1 text-xs"><Plus className="h-3.5 w-3.5" />Agregar actividad</Button>
    </div>
  );
}

function FotosSection({ fotos, onChange }) {
  const [uploading, setUploading] = useState(false);
  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    const urls = [];
    for (const file of files) {
      const { file_url } = await uploadFile(file);
      urls.push(file_url);
    }
    onChange([...fotos, ...urls]);
    setUploading(false);
  };
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
      {fotos.map((url, i) => (
        <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border">
          <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
          <button type="button" onClick={() => onChange(fotos.filter((_, j) => j !== i))} className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"><X className="h-5 w-5" /></button>
        </div>
      ))}
      <label className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors">
        {uploading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : <Upload className="h-5 w-5 text-muted-foreground" />}
        <span className="text-xs text-muted-foreground mt-1">Subir</span>
        <input type="file" accept="image/*" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
      </label>
    </div>
  );
}

export default function InformeFormulario({ informe, onGuardado, onCancelar }) {
  const queryClient = useQueryClient();
  const { data: obras = [] } = useQuery({ queryKey: ["obras"], queryFn: () => obraService.list() });
  const { data: recursos = [] } = useQuery({ queryKey: ["recursos"], queryFn: () => recursoService.list() });
  const { data: categorias = [] } = useQuery({ queryKey: ["categorias-actividad"], queryFn: () => categoriaService.list() });

  const [form, setForm] = useState(informe || {
    obra_id: "", obra_nombre: "", obra_codigo: "",
    fecha: new Date().toISOString().split("T")[0],
    dia_semana: DIAS[new Date().getDay()],
    codigo_formato: "F-141-IN",
    observaciones_generales: "", estado_terreno_inicio: "", estado_terreno_final: "",
    elaborado_por: "", cargo_elaborado: "", revisado_por: "", cargo_revisado: "",
    comision_topografia: false,
    horas_lluvia: Array(24).fill(false),
    recursos: [], actividades: [], items_obra: [], fotos_urls: [],
    status: "borrador",
  });

  const saveMutation = useMutation({
    mutationFn: (data) => informe ? informeDiarioService.update(informe.id, data) : informeDiarioService.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["informes-diarios"] }); onGuardado(); },
  });

  const setField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleObraChange = (obraId) => {
    const obra = obras.find(o => String(o.id) === obraId);
    setForm(prev => ({ ...prev, obra_id: obraId, obra_nombre: obra?.nombre || "", obra_codigo: obra?.codigo || "" }));
  };

  const handleFechaChange = (fecha) => {
    const d = new Date(fecha + "T12:00:00");
    setForm(prev => ({ ...prev, fecha, dia_semana: DIAS[d.getDay()] }));
  };

  const addItemObra = () => setField("items_obra", [...(form.items_obra || []), { item: "", descripcion: "", empresa: "", responsable: "" }]);
  const updateItemObra = (idx, f, v) => { const next = [...(form.items_obra || [])]; next[idx] = { ...next[idx], [f]: v }; setField("items_obra", next); };
  const removeItemObra = (idx) => setField("items_obra", (form.items_obra || []).filter((_, i) => i !== idx));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-sm font-semibold">Datos generales</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>Obra *</Label>
            <Select value={String(form.obra_id)} onValueChange={handleObraChange}>
              <SelectTrigger><SelectValue placeholder="Seleccionar obra" /></SelectTrigger>
              <SelectContent>{obras.map(o => <SelectItem key={o.id} value={String(o.id)}>{o.codigo} — {o.nombre}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Fecha *</Label><Input type="date" value={form.fecha} onChange={e => handleFechaChange(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Día</Label><Input value={form.dia_semana} readOnly className="bg-muted" /></div>
          <div className="space-y-1.5"><Label>Código formato</Label><Input value={form.codigo_formato} onChange={e => setField("codigo_formato", e.target.value)} /></div>
          <div className="space-y-1.5">
            <Label>Estado</Label>
            <Select value={form.status} onValueChange={v => setField("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="borrador">Borrador</SelectItem>
                <SelectItem value="enviado">Enviado</SelectItem>
                <SelectItem value="aprobado">Aprobado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5 flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.comision_topografia} onChange={e => setField("comision_topografia", e.target.checked)} className="h-4 w-4 rounded" />
              <span className="text-sm">Comisión de Topografía</span>
            </label>
          </div>
        </CardContent>
      </Card>

      <Card>
<<<<<<< HEAD
=======
        <CardHeader><CardTitle className="text-sm font-semibold">Reporte de lluvia</CardTitle></CardHeader>
        <CardContent><HorasLluvia horas={form.horas_lluvia || Array(24).fill(false)} onChange={v => setField("horas_lluvia", v)} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm font-semibold">Recursos (Maquinaria y Personal)</CardTitle></CardHeader>
        <CardContent><RecursosSection recursos={form.recursos || []} allRecursos={recursos} onChange={v => setField("recursos", v)} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm font-semibold">Actividades del día</CardTitle></CardHeader>
        <CardContent><ActividadesSection actividades={form.actividades || []} categorias={categorias} onChange={v => setField("actividades", v)} /></CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Ítems de obra</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItemObra} className="gap-1 text-xs"><Plus className="h-3.5 w-3.5" />Agregar ítem</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {(form.items_obra || []).length === 0 && <p className="text-xs text-muted-foreground italic">Sin ítems de obra</p>}
          {(form.items_obra || []).map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 items-center text-sm">
              <Input className="col-span-2 h-8 text-xs" value={item.item} onChange={e => updateItemObra(idx, "item", e.target.value)} placeholder="Ítem" />
              <Textarea className="col-span-4 text-xs min-h-[32px] h-8 resize-none" value={item.descripcion} onChange={e => updateItemObra(idx, "descripcion", e.target.value)} placeholder="Descripción" />
              <Input className="col-span-2 h-8 text-xs" value={item.empresa} onChange={e => updateItemObra(idx, "empresa", e.target.value)} placeholder="Empresa" />
              <Input className="col-span-3 h-8 text-xs" value={item.responsable} onChange={e => updateItemObra(idx, "responsable", e.target.value)} placeholder="Responsable" />
              <button type="button" onClick={() => removeItemObra(idx)} className="col-span-1 flex justify-center text-destructive hover:opacity-70"><X className="h-4 w-4" /></button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
>>>>>>> d8a607cfdc1d14289f2c24949c8fecb7a71c1d9f
        <CardHeader><CardTitle className="text-sm font-semibold">Condiciones y observaciones</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Estado del terreno — Inicio</Label><Textarea value={form.estado_terreno_inicio} onChange={e => setField("estado_terreno_inicio", e.target.value)} rows={3} placeholder="Condiciones al inicio..." /></div>
            <div className="space-y-1.5"><Label>Estado del terreno — Final</Label><Textarea value={form.estado_terreno_final} onChange={e => setField("estado_terreno_final", e.target.value)} rows={3} placeholder="Condiciones al final..." /></div>
          </div>
          <div className="space-y-1.5"><Label>Observaciones generales</Label><Textarea value={form.observaciones_generales} onChange={e => setField("observaciones_generales", e.target.value)} rows={3} /></div>
        </CardContent>
      </Card>

<<<<<<< HEAD
=======
      <Card>
        <CardHeader><CardTitle className="text-sm font-semibold">Firmas</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Elaborado por</Label>
            <Input value={form.elaborado_por} onChange={e => setField("elaborado_por", e.target.value)} placeholder="Nombre" />
            <Input value={form.cargo_elaborado} onChange={e => setField("cargo_elaborado", e.target.value)} placeholder="Cargo" />
          </div>
          <div className="space-y-2">
            <Label>Revisado por</Label>
            <Input value={form.revisado_por} onChange={e => setField("revisado_por", e.target.value)} placeholder="Nombre" />
            <Input value={form.cargo_revisado} onChange={e => setField("cargo_revisado", e.target.value)} placeholder="Cargo" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-sm font-semibold">Anexos fotográficos</CardTitle></CardHeader>
        <CardContent><FotosSection fotos={form.fotos_urls || []} onChange={v => setField("fotos_urls", v)} /></CardContent>
      </Card>

>>>>>>> d8a607cfdc1d14289f2c24949c8fecb7a71c1d9f
      <div className="flex justify-end gap-3 pb-8">
        <Button variant="outline" onClick={onCancelar}>Cancelar</Button>
        <Button onClick={() => saveMutation.mutate(form)} disabled={!form.obra_id || !form.fecha || saveMutation.isPending}>
          {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {informe ? "Guardar cambios" : "Crear informe"}
        </Button>
      </div>
    </div>
  );
}
