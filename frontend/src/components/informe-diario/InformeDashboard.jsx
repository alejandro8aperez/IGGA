import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { FileText, CloudRain, Users, Hammer } from "lucide-react";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { informeDiarioService, obraService } from "@/services/informeDiarioApi";

export default function InformeDashboard({ onNuevoInforme }) {
  const [obraFiltro, setObraFiltro] = useState("todas");

  const { data: rawInformes = [], isLoading } = useQuery({
    queryKey: ["informes-diarios"],
    queryFn: () => informeDiarioService.list({ ordering: "-fecha", limit: 200 }),
  });
  const informes = (Array.isArray(rawInformes) ? rawInformes : (rawInformes?.results || []))
    .filter(i => i.proyecto);

  const { data: rawObras = [] } = useQuery({
    queryKey: ["obras"],
    queryFn: () => obraService.list(),
  });
  const obras = Array.isArray(rawObras) ? rawObras : (rawObras?.results || []);

  const filtrados = useMemo(() => {
    if (obraFiltro === "todas") return informes;
    return informes.filter(i => String(i.proyecto) === String(obraFiltro));
  }, [informes, obraFiltro]);

  const totalInformes = filtrados.length;
  const totalPersonal = filtrados.reduce((sum, i) => sum + (i.total_personal ?? 0), 0);
  const totalHorasLluvia = filtrados.reduce((sum, i) => sum + (i.total_horas_lluvia ?? 0), 0);
  const totalActividades = filtrados.reduce((sum, i) => sum + (i.total_actividades ?? 0), 0);

  const chartData = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const key = format(d, "yyyy-MM");
      const label = format(d, "MMM", { locale: es });
      const count = filtrados.filter(inf => inf.fecha?.startsWith(key)).length;
      const lluvia = filtrados.filter(inf => inf.fecha?.startsWith(key))
        .reduce((sum, inf) => sum + (inf.total_horas_lluvia ?? 0), 0);
      return { name: label, informes: count, horas_lluvia: lluvia };
    });
  }, [filtrados]);

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">Cargando...</div>;

  return (
    <div className="space-y-6">
      {/* Filtro de obra — SIN botón Nuevo informe */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Select value={obraFiltro} onValueChange={setObraFiltro}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Filtrar por obra" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las obras</SelectItem>
            {obras.map(o => <SelectItem key={o.id} value={String(o.id)}>{o.codigo} — {o.nombre}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total informes", value: totalInformes, icon: FileText, color: "bg-blue-100 text-blue-600" },
          { title: "Personal total", value: Math.round(totalPersonal), icon: Users, color: "bg-green-100 text-green-600" },
          { title: "Horas con lluvia", value: totalHorasLluvia, icon: CloudRain, color: "bg-yellow-100 text-yellow-600" },
          { title: "Actividades", value: totalActividades, icon: Hammer, color: "bg-purple-100 text-purple-600" },
        ].map(({ title, value, icon: Icon, color }) => (
          <Card key={title}>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className={`p-3 rounded-lg ${color}`}><Icon className="h-5 w-5" /></div>
              <div><p className="text-sm text-muted-foreground">{title}</p><p className="text-2xl font-bold">{value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-sm font-semibold">Informes por mes</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="informes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm font-semibold">Horas de lluvia por mes</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="horas_lluvia" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-sm font-semibold">Últimos informes</CardTitle></CardHeader>
        <CardContent>
          {filtrados.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No hay informes registrados</p>
          ) : (
            <div className="space-y-2">
              {filtrados.slice(0, 8).map(inf => (
                <div key={inf.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium">{inf.proyecto_codigo} — {inf.proyecto_nombre}</p>
                    <p className="text-xs text-muted-foreground">{inf.fecha} · {inf.dia_semana}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    inf.status === "aprobado" ? "bg-emerald-50 text-emerald-700" :
                    inf.status === "enviado" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"
                  }`}>{inf.status || "borrador"}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
