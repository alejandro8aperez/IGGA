import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Search, Plus, CloudRain, Users } from "lucide-react";
import { useState } from "react";
import { informeDiarioService } from "@/services/informeDiarioApi";

const statusStyle = {
  aprobado: "bg-emerald-50 text-emerald-700",
  enviado: "bg-blue-50 text-blue-700",
  borrador: "bg-amber-50 text-amber-700",
};

export default function InformeLista({ onNuevo, onEditar }) {
  const [search, setSearch] = useState("");
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
    i.obra_codigo?.toLowerCase().includes(search.toLowerCase()) ||
    i.fecha?.includes(search)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por obra o fecha..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={onNuevo} className="gap-2 flex-shrink-0"><Plus className="h-4 w-4" /> Nuevo informe</Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Cargando...</div>
      ) : filtered.length === 0 ? (
        <Card><p className="text-center text-sm text-muted-foreground py-12">No hay informes. Crea el primero.</p></Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Obra</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Día</TableHead>
                <TableHead>Personal</TableHead>
                <TableHead>Lluvia</TableHead>
                <TableHead>Actividades</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(inf => {
                const personal = (inf.recursos || []).filter(r => r.categoria === "PERSONAL DE OBRA").reduce((s, r) => s + (r.cantidad || 0), 0);
                const lluvia = (inf.horas_lluvia || []).filter(Boolean).length;
                return (
                  <TableRow key={inf.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onEditar(inf)}>
                    <TableCell><p className="font-medium">{inf.obra_codigo}</p><p className="text-xs text-muted-foreground">{inf.obra_nombre}</p></TableCell>
                    <TableCell className="font-medium">{inf.fecha}</TableCell>
                    <TableCell className="text-muted-foreground capitalize">{inf.dia_semana || "-"}</TableCell>
                    <TableCell><span className="flex items-center gap-1 text-sm"><Users className="h-3.5 w-3.5 text-muted-foreground" />{Math.round(personal)}</span></TableCell>
                    <TableCell><span className="flex items-center gap-1 text-sm"><CloudRain className="h-3.5 w-3.5 text-blue-400" />{lluvia}h</span></TableCell>
                    <TableCell className="text-sm">{(inf.actividades || []).length}</TableCell>
                    <TableCell><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusStyle[inf.status || "borrador"]}`}>{inf.status || "borrador"}</span></TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditar(inf)}><Pencil className="h-4 w-4 mr-2" />Editar</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => deleteMutation.mutate(inf.id)}><Trash2 className="h-4 w-4 mr-2" />Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}