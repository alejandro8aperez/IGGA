import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  ClipboardList, 
  LayoutDashboard, 
  BookOpen, 
  Settings, 
  FileText, 
  Send, 
  CheckCircle, 
  Plus, 
  Image as ImageIcon,
  Camera,
  Trash2,
  Upload
} from "lucide-react";
import InformeDashboard from "@/components/informe-diario/InformeDashboard";
import InformeLista from "@/components/informe-diario/InformeLista";
import InformeFormulario from "@/components/informe-diario/InformeFormulario";
import InformeCatalogos from "@/components/informe-diario/InformeCatalogos";
import axios from "axios";

const queryClient = new QueryClient();

/**
 * COMPONENTE: StatsHeader (Estilo Dark/POS)
 */
function StatsHeader() {
  const { data: stats } = useQuery({
    queryKey: ['informe-status-counts'],
    queryFn: () => axios.get('/api/informe-diario/dashboard/status-counts/').then(res => res.data),
    refetchInterval: 10000
  });

  const statCards = [
    { label: "Borradores", count: stats?.borrador || 0, color: "text-amber-400", bg: "bg-amber-400/10", icon: FileText, border: "border-amber-400/20" },
    { label: "Enviados", count: stats?.enviado || 0, color: "text-cyan-400", bg: "bg-cyan-400/10", icon: Send, border: "border-cyan-400/20" },
    { label: "Aprobados", count: stats?.aprobado || 0, color: "text-emerald-400", bg: "bg-emerald-400/10", icon: CheckCircle, border: "border-emerald-400/20" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {statCards.map((s) => (
        <div key={s.label} className={`flex items-center p-5 rounded-2xl border ${s.border} ${s.bg} backdrop-blur-sm transition-all hover:scale-[1.02]`}>
          <div className={`p-3 rounded-xl mr-4 bg-slate-900 border ${s.border} shadow-[0_0_15px_rgba(0,0,0,0.5)]`}>
            <s.icon className={`h-7 w-7 ${s.color}`} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">{s.label}</p>
            <p className={`text-4xl font-black ${s.color} tracking-tighter`}>{s.count}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * COMPONENTE: InformeFotos (Cuadrícula 4x6 Estilo POS)
 */
function InformeFotos({ informeId }) {
  const queryClient = useQueryClient();
  const { data: fotos, isLoading } = useQuery({
    queryKey: ['informe-fotos', informeId],
    queryFn: () => axios.get(`/api/informe-diario/anexos/?informe=${informeId}`).then(res => res.data),
    enabled: !!informeId
  });

  // Generamos 24 slots (4 filas x 6 columnas)
  const slots = Array.from({ length: 24 }, (_, i) => i + 1);

  if (!informeId) {
    return (
      <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-3xl p-20 text-center">
        <ImageIcon className="h-16 w-16 text-slate-700 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-500">Selecciona o crea un informe para gestionar la galería</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-white flex items-center gap-2">
          <Camera className="text-cyan-500" /> GALERÍA TÉCNICA (4x6)
        </h2>
        <span className="text-slate-500 font-mono text-sm bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
          ID INFORME: {informeId}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {slots.map((slotNum) => {
          const foto = fotos?.find(f => f.posicion === slotNum);
          
          return (
            <div 
              key={slotNum} 
              className={`group relative aspect-square rounded-2xl border-2 transition-all duration-300 overflow-hidden
                ${foto 
                  ? 'border-slate-800 bg-slate-900 hover:border-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]' 
                  : 'border-slate-800/50 border-dashed bg-slate-950/50 hover:bg-slate-900 hover:border-slate-700'
                }`}
            >
              {foto ? (
                <>
                  <img 
                    src={foto.imagen_url || foto.imagen} 
                    alt={foto.descripcion}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                    <p className="text-[10px] text-cyan-400 font-bold uppercase truncate">{foto.seccion_display}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-white text-xs font-bold">Slot {slotNum}</span>
                      <button className="text-red-400 hover:text-red-300 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <button className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-700 hover:text-cyan-500 transition-colors">
                  <Plus className="h-8 w-8" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Slot {slotNum}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * COMPONENTE PRINCIPAL (Estilo Gamer/Dark POS)
 */
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      <div className="max-w-[1600px] mx-auto space-y-6 p-6">
        
        {/* Header Estilo POS - Dark Neon */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/50 backdrop-blur-md p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden">
          {/* Decoración de luz */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-[100px]" />
          
          <div className="relative z-10">
            <h1 className="text-5xl font-black tracking-tighter text-white flex items-center gap-4">
              <div className="bg-cyan-500 p-3 rounded-2xl text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                <ClipboardList className="h-10 w-10" />
              </div>
              INFORME <span className="text-cyan-500">DIARIO</span> PROY
            </h1>
            <p className="text-slate-400 mt-2 font-bold text-lg flex items-center gap-2 uppercase tracking-widest opacity-80">
              <CheckCircle className="h-5 w-5 text-emerald-500" /> Registro F-141-IN — Control de Campo
            </p>
          </div>

          <button 
            onClick={handleNuevoInforme}
            className="relative z-10 flex items-center justify-center gap-3 bg-cyan-500 text-slate-950 px-12 py-5 rounded-2xl font-black text-xl shadow-[0_10px_30px_rgba(6,182,212,0.3)] hover:scale-105 active:scale-95 transition-all group overflow-hidden"
          >
            <Plus className="h-7 w-7 transition-transform group-hover:rotate-90" />
            NUEVO REPORTE
          </button>
        </div>

        {/* Indicadores en Tiempo Real */}
        <StatsHeader />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex flex-wrap h-auto bg-slate-900/80 p-2 rounded-[2rem] border border-slate-800 backdrop-blur-xl mb-8">
            <TabsTrigger value="dashboard" className="flex-1 gap-2 rounded-2xl py-4 data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-950 transition-all font-black uppercase tracking-tighter text-lg">
              <LayoutDashboard className="h-5 w-5" /> Dashboard
            </TabsTrigger>
            <TabsTrigger value="lista" className="flex-1 gap-2 rounded-2xl py-4 data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-950 transition-all font-black uppercase tracking-tighter text-lg">
              <BookOpen className="h-5 w-5" /> Historial
            </TabsTrigger>
            <TabsTrigger value="fotos" className="flex-1 gap-2 rounded-2xl py-4 data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-950 transition-all font-black uppercase tracking-tighter text-lg">
              <ImageIcon className="h-5 w-5" /> Fotos
            </TabsTrigger>
            <TabsTrigger value="formulario" className="flex-1 gap-2 rounded-2xl py-4 data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-950 transition-all font-black uppercase tracking-tighter text-lg">
              <ClipboardList className="h-5 w-5" /> {editingInforme ? "Editor" : "Redactar"}
            </TabsTrigger>
            <TabsTrigger value="catalogos" className="flex-1 gap-2 rounded-2xl py-4 data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-950 transition-all font-black uppercase tracking-tighter text-lg">
              <Settings className="h-5 w-5" /> Config
            </TabsTrigger>
          </TabsList>

          <div className="bg-slate-900/30 p-8 rounded-[3rem] border border-slate-800 min-h-[600px]">
            <TabsContent value="dashboard" className="mt-0">
              <InformeDashboard onNuevoInforme={handleNuevoInforme} />
            </TabsContent>
            
            <TabsContent value="lista" className="mt-0">
              <InformeLista onNuevo={handleNuevoInforme} onEditar={handleEditarInforme} />
            </TabsContent>

            <TabsContent value="fotos" className="mt-0">
              <InformeFotos informeId={editingInforme?.id} />
            </TabsContent>

            <TabsContent value="formulario" className="mt-0">
              <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800">
                <InformeFormulario 
                  informe={editingInforme} 
                  onGuardado={handleGuardado} 
                  onCancelar={() => setActiveTab("lista")} 
                />
              </div>
            </TabsContent>
            
            <TabsContent value="catalogos" className="mt-0">
              <InformeCatalogos />
            </TabsContent>
          </div>
        </Tabs>
      </div>
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
