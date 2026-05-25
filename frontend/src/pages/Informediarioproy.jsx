import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  ClipboardList, LayoutDashboard, BookOpen, Settings, FileText, 
  Send, CheckCircle, Plus, Image as ImageIcon, Camera, Trash2, Move
} from "lucide-react";
import InformeDashboard from "@/components/informe-diario/InformeDashboard";
import InformeLista from "@/components/informe-diario/InformeLista";
import InformeFormulario from "@/components/informe-diario/InformeFormulario";
import InformeCatalogos from "@/components/informe-diario/InformeCatalogos";
import axios from "axios";
import { toast, Toaster } from "sonner";

const queryClient = new QueryClient();

function StatsHeader() {
  const { data: stats } = useQuery({
    queryKey: ['informe-status-counts'],
    queryFn: () => axios.get('/api/informe-diario/dashboard/status-counts/').then(res => res.data),
    refetchInterval: 15000
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

function InformeFotos({ informeId }) {
  const queryClient = useQueryClient();
  const [draggedItem, setDraggedItem] = useState(null);

  const { data: fotos } = useQuery({
    queryKey: ['informe-fotos', informeId],
    queryFn: () => axios.get(`/api/informe-diario/anexos/?informe=${informeId}`).then(res => res.data),
    enabled: !!informeId
  });

  const mutation = useMutation({
    mutationFn: (payload) => axios.post('/api/informe-diario/anexos/reorganizar-cuadricula/', payload),
    onSuccess: () => {
      queryClient.invalidateQueries(['informe-fotos', informeId]);
      toast.success("Cuadrícula sincronizada");
    }
  });

  const onDrop = (targetPos) => {
    if (!draggedItem || draggedItem.posicion === targetPos) return;
    const fotoDestino = fotos.find(f => f.posicion === targetPos);
    const payload = [{ id: draggedItem.id, posicion: targetPos }];
    if (fotoDestino) payload.push({ id: fotoDestino.id, posicion: draggedItem.posicion });
    mutation.mutate(payload);
    setDraggedItem(null);
  };

  const slots = Array.from({ length: 24 }, (_, i) => i + 1);

  if (!informeId) return (
    <div className="bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-[3rem] p-20 text-center">
      <ImageIcon className="h-16 w-16 text-slate-700 mx-auto mb-4" />
      <h3 className="text-xl font-bold text-slate-500 uppercase">Selecciona un informe para ver la cuadrícula</h3>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-lg">
        <h2 className="text-xl font-black text-white flex items-center gap-3">
          <Camera className="text-cyan-500 h-6 w-6" /> CUADRÍCULA POS <span className="text-cyan-500 font-mono">4x6</span>
        </h2>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Arrastra para organizar</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {slots.map((slotNum) => {
          const foto = fotos?.find(f => f.posicion === slotNum);
          return (
            <div 
              key={slotNum} 
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(slotNum)}
              className={`group relative aspect-square rounded-2xl border-2 transition-all duration-300 overflow-hidden cursor-pointer
                ${foto ? 'border-slate-800 bg-slate-900 hover:border-cyan-500' : 'border-slate-800/30 border-dashed bg-slate-950 hover:bg-slate-900/50'}
              `}
            >
              {foto ? (
                <div draggable onDragStart={() => setDraggedItem(foto)} className="w-full h-full">
                  <img src={foto.imagen_url || foto.imagen} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all" alt="" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex flex-col justify-end p-2">
                    <span className="text-[8px] font-black bg-cyan-500 text-slate-950 px-1.5 rounded-full w-fit">SLOT {slotNum}</span>
                    <p className="text-[9px] text-white font-bold truncate uppercase mt-1">{foto.seccion_display}</p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-slate-800 hover:text-cyan-500/40 transition-colors">
                  <Plus className="h-5 w-5" />
                  <span className="text-[9px] font-black uppercase tracking-tighter">Slot {slotNum}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InformeDiarioContent() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingInforme, setEditingInforme] = useState(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 selection:bg-cyan-500/30">
      <Toaster position="bottom-right" theme="dark" richColors />
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-[120px] rounded-full" />
          <div className="relative z-10">
            <h1 className="text-5xl font-black tracking-tighter text-white flex items-center gap-4">
              <div className="bg-cyan-500 p-3 rounded-2xl text-slate-950 shadow-[0_0_25px_rgba(6,182,212,0.4)]">
                <ClipboardList className="h-10 w-10" />
              </div>
              INFORME <span className="text-cyan-500">DIARIO</span>
            </h1>
            <p className="text-slate-500 mt-2 font-bold text-lg uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
              Terminal de Control Proyectivo F-141-IN
            </p>
          </div>
          <button 
            onClick={() => { setEditingInforme(null); setActiveTab("formulario"); }}
            className="relative z-10 bg-cyan-500 text-slate-950 px-10 py-5 rounded-2xl font-black text-xl shadow-[0_10px_30px_rgba(6,182,212,0.2)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
          >
            <Plus className="h-6 w-6" /> NUEVO REGISTRO
          </button>
        </div>

        <StatsHeader />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-900 border border-slate-800 p-2 rounded-[2rem] flex flex-wrap h-auto">
            {[
              { id: "dashboard", icon: LayoutDashboard, label: "Panel" },
              { id: "lista", icon: BookOpen, label: "Historial" },
              { id: "fotos", icon: ImageIcon, label: "Fotos POS" },
              { id: "formulario", icon: ClipboardList, label: editingInforme ? "Editar" : "Nuevo" },
              { id: "catalogos", icon: Settings, label: "Config" },
            ].map(tab => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="flex-1 py-4 rounded-2xl font-black uppercase tracking-tighter text-base data-[state=active]:bg-cyan-500 data-[state=active]:text-slate-950 transition-all"
              >
                <tab.icon className="h-5 w-5 mr-2" /> {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[3rem] min-h-[600px] backdrop-blur-sm">
            <TabsContent value="dashboard"><InformeDashboard onNuevoInforme={() => setActiveTab("formulario")} /></TabsContent>
            <TabsContent value="lista"><InformeLista onEditar={(inf) => { setEditingInforme(inf); setActiveTab("formulario"); }} /></TabsContent>
            <TabsContent value="fotos"><InformeFotos informeId={editingInforme?.id} /></TabsContent>
            <TabsContent value="formulario">
              <InformeFormulario informe={editingInforme} onGuardado={() => setActiveTab("lista")} onCancelar={() => setActiveTab("lista")} />
            </TabsContent>
            <TabsContent value="catalogos"><InformeCatalogos /></TabsContent>
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
