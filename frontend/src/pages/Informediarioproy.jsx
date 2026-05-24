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
    refetchInterval: 10000 // Actualiza contadores cada 10s para feedback en tiempo real
  });

  const statCards = [
    { label: "Borradores", count: stats?.borrador || 0, color: "text-amber-600", bg: "bg-amber-50", icon: FileText, border: "border-amber-100" },
    { label: "Enviados", count: stats?.enviado || 0, color: "text-blue-600", bg: "bg-blue-50", icon: Send, border: "border-blue-100" },
    { label: "Aprobados", count: stats?.aprobado || 0, color: "text-emerald-600", bg: "bg-emerald-50", icon: CheckCircle, border: "border-emerald-100" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {statCards.map((s) => (
        <div key={s.label} className={`flex items-center p-5 rounded-2xl border ${s.border} shadow-sm ${s.bg} transition-all hover:shadow-md hover:-translate-y-1`}>
          <div className={`p-3 rounded-xl mr-4 ${s.color} bg-white shadow-sm`}>
            <s.icon className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">{s.label}</p>
            <p className={`text-4xl font-black ${s.color}`}>{s.count}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function InformeDiarioContent() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingInforme, setEditingInforme] = useState(null);

  const handleNuevoInforme = () => { 
    setEditingInforme(null); 
    setActiveTab("formulario"); 
  };
  
  const handleEditarInforme = (informe) => { 
    setEditingInforme(informe); 
    setActiveTab("formulario"); 
  };
  
  const handleGuardado = () => { 
    setEditingInforme(null); 
    setActiveTab("lista"); 
  };

  return (
      <div className="max-w-[1600px] mx-auto space-y-6 p-4">
        {/* Cabecera Principal Estilo POS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-2xl text-primary">
                <ClipboardList className="h-9 w-9" />
              </div>
              Informe Diario PROY
            </h1>
            <p className="text-slate-500 mt-1 font-medium text-lg italic">
              Registro técnico F-141-IN — Control de obra y recursos en campo
            </p>
          </div>
          <button 
            onClick={handleNuevoInforme}
            className="flex items-center justify-center gap-3 bg-primary text-primary-foreground px-10 py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all group"
          >
            <Plus className="h-6 w-6 transition-transform group-hover:rotate-90" />
            NUEVO INFORME
          </button>
        </div>

        {/* Indicadores Visuales Superiores */}
        <StatsHeader />

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex bg-slate-100/50 p-1.5 rounded-[1.5rem] border border-slate-200">
            <TabsTrigger value="dashboard" className="gap-2 rounded-2xl py-3 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all font-bold">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="lista" className="gap-2 rounded-2xl py-3 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all font-bold">
              <BookOpen className="h-4 w-4" /> Informes
            </TabsTrigger>
            <TabsTrigger value="formulario" className="gap-2 rounded-2xl py-3 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all font-bold">
              <ClipboardList className="h-4 w-4" /> {editingInforme ? "Editar" : "Nuevo"}
            </TabsTrigger>
            <TabsTrigger value="catalogos" className="gap-2 rounded-2xl py-3 data-[state=active]:bg-white data-[state=active]:shadow-md transition-all font-bold">
              <Settings className="h-4 w-4" /> Configuración
            </TabsTrigger>
          </TabsList>
          <div className="mt-10">
            <TabsContent value="dashboard"><InformeDashboard onNuevoInforme={handleNuevoInforme} /></TabsContent>
            <TabsContent value="lista"><InformeLista onNuevo={handleNuevoInforme} onEditar={handleEditarInforme} /></TabsContent>
            <TabsContent value="formulario"><InformeFormulario informe={editingInforme} onGuardado={handleGuardado} onCancelar={() => setActiveTab("lista")} /></TabsContent>
            <TabsContent value="catalogos"><InformeCatalogos /></TabsContent>
          </div>
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
