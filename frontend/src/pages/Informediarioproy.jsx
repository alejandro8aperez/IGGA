import { useState } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ClipboardList, LayoutDashboard, BookOpen, Settings, FileText, Send, CheckCircle, Plus } from "lucide-react";
import InformeDashboard from "@/components/informe-diario/InformeDashboard";
import InformeLista from "@/components/informe-diario/InformeLista";
import InformeFormulario from "@/components/informe-diario/InformeFormulario";
import InformeCatalogos from "@/components/informe-diario/InformeCatalogos";
import axios from "axios";

const queryClient = new QueryClient();

function StatsHeader() {
  const { data: stats } = useQuery({
    queryKey: ['informe-status-counts'],
    queryFn: () => axios.get('/api/informe-diario/informes/status-counts/').then(res => res.data),
    refetchInterval: 10000 // Feeling de POS: actualiza contadores cada 10 segundos
  });

  const statCards = [
    { label: "Borradores", count: stats?.borrador || 0, color: "text-amber-500", bg: "bg-amber-50", icon: FileText },
    { label: "Enviados", count: stats?.enviado || 0, color: "text-blue-500", bg: "bg-blue-50", icon: Send },
    { label: "Aprobados", count: stats?.aprobado || 0, color: "text-emerald-500", bg: "bg-emerald-50", icon: CheckCircle },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {statCards.map((s) => (
        <div key={s.label} className={`flex items-center p-4 rounded-xl border border-gray-100 shadow-sm ${s.bg}`}>
          <div className={`p-3 rounded-lg mr-4 ${s.color} bg-white shadow-sm`}>
            <s.icon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function InformeDiarioContent() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingInforme, setEditingInforme] = useState(null);

  const handleNuevoInforme = () => { setEditingInforme(null); setActiveTab("formulario"); };
  const handleEditarInforme = (informe) => { setEditingInforme(informe); setActiveTab("formulario"); };
  const handleGuardado = () => { setEditingInforme(null); setActiveTab("lista"); };

  return (
      <div className="max-w-[1600px] mx-auto space-y-6 p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Informe Diario PROY</h1>
            <p className="text-muted-foreground mt-1 text-lg">Control operativo y recursos en tiempo real</p>
          </div>
          <button 
            onClick={handleNuevoInforme} 
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <Plus className="h-5 w-5" /> Nuevo Informe
          </button>
        </div>

        <StatsHeader />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex bg-muted p-1 rounded-xl">
            <TabsTrigger value="dashboard" className="gap-2 rounded-lg transition-all"><LayoutDashboard className="h-4 w-4" /> Dashboard</TabsTrigger>
            <TabsTrigger value="lista" className="gap-2 rounded-lg transition-all"><BookOpen className="h-4 w-4" /> Informes</TabsTrigger>
            <TabsTrigger value="formulario" className="gap-2 rounded-lg transition-all"><ClipboardList className="h-4 w-4" />{editingInforme ? "Editar" : "Nuevo"}</TabsTrigger>
            <TabsTrigger value="catalogos" className="gap-2 rounded-lg transition-all"><Settings className="h-4 w-4" /> Catálogos</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="mt-6"><InformeDashboard onNuevoInforme={handleNuevoInforme} /></TabsContent>
          <TabsContent value="lista" className="mt-6"><InformeLista onNuevo={handleNuevoInforme} onEditar={handleEditarInforme} /></TabsContent>
          <TabsContent value="formulario" className="mt-6"><InformeFormulario informe={editingInforme} onGuardado={handleGuardado} onCancelar={() => setActiveTab("lista")} /></TabsContent>
          <TabsContent value="catalogos" className="mt-6"><InformeCatalogos /></TabsContent>
        </Tabs>
      </div>
  );
}

export default function InformeDiarioProy() {
  return (
    <QueryClientProvider client={queryClient}>
      <InformeDiarioContent />
    </QueryClientProvider>
  );
}
