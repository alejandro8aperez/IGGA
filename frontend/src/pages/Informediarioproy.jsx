import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ClipboardList, LayoutDashboard, BookOpen, Settings } from "lucide-react";
import InformeDashboard from "@/components/informe-diario/InformeDashboard";
import InformeLista from "@/components/informe-diario/InformeLista";
import InformeFormulario from "@/components/informe-diario/InformeFormulario";
import InformeCatalogos from "@/components/informe-diario/InformeCatalogos";

const queryClient = new QueryClient();

export default function InformeDiarioProy() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingInforme, setEditingInforme] = useState(null);
  const handleNuevoInforme = () => { setEditingInforme(null); setActiveTab("formulario"); };
  const handleEditarInforme = (informe) => { setEditingInforme(informe); setActiveTab("formulario"); };
  const handleGuardado = () => { setEditingInforme(null); setActiveTab("lista"); };
  return (
    <QueryClientProvider client={queryClient}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Informe Diario de Obra</h1>
          <p className="text-muted-foreground mt-1">Formato F-141-IN — Registro diario de actividades, recursos y condiciones</p>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
            <TabsTrigger value="dashboard" className="gap-2"><LayoutDashboard className="h-4 w-4" /> Dashboard</TabsTrigger>
            <TabsTrigger value="lista" className="gap-2"><BookOpen className="h-4 w-4" /> Informes</TabsTrigger>
            <TabsTrigger value="formulario" className="gap-2"><ClipboardList className="h-4 w-4" />{editingInforme ? "Editar" : "Nuevo"}</TabsTrigger>
            <TabsTrigger value="catalogos" className="gap-2"><Settings className="h-4 w-4" /> Catálogos</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="mt-6"><InformeDashboard onNuevoInforme={handleNuevoInforme} /></TabsContent>
          <TabsContent value="lista" className="mt-6"><InformeLista onNuevo={handleNuevoInforme} onEditar={handleEditarInforme} /></TabsContent>
          <TabsContent value="formulario" className="mt-6"><InformeFormulario informe={editingInforme} onGuardado={handleGuardado} onCancelar={() => setActiveTab("lista")} /></TabsContent>
          <TabsContent value="catalogos" className="mt-6"><InformeCatalogos /></TabsContent>
        </Tabs>
      </div>
    </QueryClientProvider>
  );
}
