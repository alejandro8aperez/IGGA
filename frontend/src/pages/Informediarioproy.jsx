import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  ArrowLeft,
  Package
} from "lucide-react";

import InformeDashboard from "@/components/informe-diario/InformeDashboard";
import InformeLista from "@/components/informe-diario/InformeLista";
import InformeFormulario from "@/components/informe-diario/InformeFormulario";
import InformeCatalogos from "@/components/informe-diario/InformeCatalogos";

import axios from "axios";
import { toast, Toaster } from "sonner";
import { useNavigate } from "react-router-dom";

import { API } from "@/config/api";

const queryClient = new QueryClient();

// ── Paleta idéntica al POS ────────────────────────────────────────────────────
const C = {
  pageBg: '#f1f5f9',
  white: '#ffffff',
  topBar: '#ffffff',
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  text: '#1e293b',
  textMuted: '#64748b',
  textFaint: '#94a3b8',
  primary: '#ec4899',
  primaryShadow: 'rgba(236,72,153,0.3)',
  indigo: '#6366f1',
  indigoLight: '#eef2ff',
  green: '#10b981',
  greenLight: '#ecfdf5',
  amber: '#f59e0b',
  amberLight: '#fffbeb',
  blue: '#3b82f6',
  blueLight: '#eff6ff',
  purple: '#8b5cf6',
  purpleLight: '#f5f3ff',
  skeleton: '#e2e8f0',
  cardShadow: '0 2px 8px rgba(0,0,0,0.04)',
};

// ── Estilos reutilizables ─────────────────────────────────────────────────────
const iconBtnStyle = {
  background: C.borderLight,
  border: 'none',
  borderRadius: 10,
  padding: '0.5rem',
  cursor: 'pointer',
  color: C.textMuted,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

// ── StatsHeader CORREGIDO ─────────────────────────────────────────────────────
function StatsHeader() {

  const {
    data: stats,
    isLoading,
    error
  } = useQuery({
    queryKey: ['informe-status-counts'],

    queryFn: async () => {

      console.log("CONSULTANDO:", API.INFORME_DIARIO.STATUS_COUNTS);

      const response = await axios.get(
        API.INFORME_DIARIO.STATUS_COUNTS
      );

      return response.data;
    },

    refetchInterval: 15000,
    retry: 1,
  });

  useEffect(() => {
    if (stats) {
      console.log("STATUS_COUNTS OK:", stats);
    }

    if (error) {
      console.error("STATUS_COUNTS ERROR:", error);
    }
  }, [stats, error]);

  const cards = [
    {
      label: "Borradores",
      count: stats?.borrador || 0,
      icon: FileText,
      accent: C.amber,
      bg: '#fffbeb',
      border: '#fde68a'
    },
    {
      label: "Enviados",
      count: stats?.enviado || 0,
      icon: Send,
      accent: C.blue,
      bg: '#eff6ff',
      border: '#bfdbfe'
    },
    {
      label: "Aprobados",
      count: stats?.aprobado || 0,
      icon: CheckCircle,
      accent: C.green,
      bg: '#ecfdf5',
      border: '#a7f3d0'
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}
    >
      {cards.map(c => (
        <div
          key={c.label}
          style={{
            background: C.white,
            borderRadius: 20,
            padding: '1.25rem 1.5rem',
            border: `1px solid ${c.border}`,
            boxShadow: C.cardShadow,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
        >
          <div
            style={{
              background: c.bg,
              borderRadius: 14,
              padding: '0.75rem',
              border: `1px solid ${c.border}`,
            }}
          >
            <c.icon
              size={28}
              style={{ color: c.accent }}
            />
          </div>

          <div>
            <p
              style={{
                margin: 0,
                fontSize: '0.7rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: C.textMuted
              }}
            >
              {c.label}
            </p>

            <p
              style={{
                margin: 0,
                fontSize: '2.25rem',
                fontWeight: 900,
                color: c.accent,
                lineHeight: 1.1
              }}
            >
              {isLoading ? '...' : c.count}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── FotoCard ──────────────────────────────────────────────────────────────────
function FotoCard({ foto, onClick }) {

  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const imgSrc = foto?.imagen_url || foto?.imagen;

  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: '1px solid #f1f5f9',
        height: '260px',
        position: 'relative'
      }}
    >
      <div style={{
        width: '100%',
        height: '140px',
        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        {!loaded && !errored && imgSrc && (
          <div className="skeleton" style={{ position: 'absolute', inset: 0, zIndex: 1 }}></div>
        )}
        {imgSrc && !errored ? (
          <img
            src={imgSrc}
            alt={foto.descripcion || 'Foto del informe'}
            onLoad={() => setLoaded(true)}
            onError={() => { setLoaded(true); setErrored(true); }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              padding: '0',
              opacity: loaded ? 1 : 0,
              transition: 'opacity 0.3s ease'
            }}
          />
        ) : (
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: '#8b5cf6',
            gap: '0.5rem'
          }}>
            <Package size={48} />
            <span style={{ fontSize: '0.75rem', fontWeight: '500' }}>SIN IMG</span>
          </div>
        )}
      </div>

      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1 }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <div style={{
            background: '#f5f3ff',
            color: '#7c3aed',
            fontSize: '0.65rem',
            fontWeight: '800',
            width: 'fit-content',
            padding: '2px 8px',
            borderRadius: '8px',
            marginBottom: '0.5rem'
          }}>
            {foto.seccion_display || 'Foto'}
          </div>
          <h3 style={{
            margin: 0,
            fontSize: '0.95rem',
            color: '#1e293b',
            fontWeight: '700',
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {foto.descripcion || 'Sin descripción'}
          </h3>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {foto.fecha_captura ? new Date(foto.fecha_captura).toLocaleString('es-CO') : 'Fecha no disponible'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── UploadCard ────────────────────────────────────────────────────────────────
function UploadCard({ onClick, uploading }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: uploading ? 'wait' : 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        border: '2px dashed #8b5cf6',
        height: '260px',
        gap: '0.75rem',
        color: '#8b5cf6'
      }}
    >
      {uploading ? (
        <>
          <Loader2 size={48} className="animate-spin" />
          <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>Subiendo...</span>
        </>
      ) : (
        <>
          <Plus size={48} />
          <span style={{ fontSize: '0.85rem', fontWeight: '700' }}>+ Agregar Fotos</span>
        </>
      )}
    </div>
  );
}

// ── InformeFotos ──────────────────────────────────────────────────────────────
function InformeFotos({ informeId }) {

  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: fotos = [], isLoading } = useQuery({
    queryKey: ['informe-fotos', informeId],
    queryFn: () =>
      axios
        .get(`${API.INFORME_DIARIO.ANEXOS}?informe=${informeId}`)
        .then(r => r.data),
    enabled: !!informeId,
  });

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append('informe', informeId);
        formData.append('imagen', file);
        await axios.post(`${API.INFORME_DIARIO.ANEXOS}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      queryClient.invalidateQueries(['informe-fotos', informeId]);
      toast.success('Fotos subidas exitosamente!');
    } catch (error) {
      console.error('Error al subir fotos:', error);
      toast.error('Error al subir las fotos');
    } finally {
      setUploading(false);
    }
  };

  if (!informeId) {
    return (
      <div
        style={{
          background: C.white,
          borderRadius: 20,
          padding: '5rem 2rem',
          border: `2px dashed ${C.border}`,
          textAlign: 'center',
        }}
      >
        <ImageIcon
          size={64}
          style={{
            color: C.textFaint,
            margin: '0 auto 1rem'
          }}
        />
        <h3
          style={{
            margin: 0,
            color: C.textMuted,
            fontWeight: 800,
            textTransform: 'uppercase'
          }}
        >
          Selecciona un informe para ver las fotos
        </h3>
      </div>
    );
  }

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleUpload}
        style={{ display: 'none' }}
        id="foto-upload"
        disabled={uploading}
      />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '1rem',
        }}
      >
        <label htmlFor="foto-upload">
          <UploadCard onClick={() => {}} uploading={uploading} />
        </label>
        {isLoading
          ? Array.from({ length: 6 }).map((_, n) => (
              <div
                key={n}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  height: '260px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  border: '1px solid #f1f5f9',
                }}
              >
                <div className="skeleton" style={{ width: '100%', height: '140px' }}></div>
                <div className="skeleton" style={{ width: '40%', height: '14px' }}></div>
                <div className="skeleton" style={{ width: '80%', height: '20px' }}></div>
              </div>
            ))
          : fotos.map(foto => (
              <FotoCard
                key={foto.id}
                foto={foto}
                onClick={() => {}}
              />
            ))}
      </div>
    </div>
  );
}

// ── TabChip ───────────────────────────────────────────────────────────────────
function TabChip({ active, onClick, label, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '0.6rem 1.2rem',
        borderRadius: 25,
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        border: active ? 'none' : `1px solid ${C.border}`,
        background: active ? C.indigo : C.white,
        color: active ? C.white : C.textMuted,
        fontWeight: 700,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s',
        fontSize: '0.9rem',
      }}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

// ── Contenido principal ───────────────────────────────────────────────────────
function InformeDiarioContent() {

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");

  const [editingInforme, setEditingInforme] = useState(null);

  const tabs = [
    {
      id: "dashboard",
      icon: LayoutDashboard,
      label: "Panel"
    },
    {
      id: "lista",
      icon: BookOpen,
      label: "Historial"
    },
    {
      id: "fotos",
      icon: ImageIcon,
      label: "Fotos"
    },
    {
      id: "catalogos",
      icon: Settings,
      label: "Config"
    },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: C.pageBg,
        overflow: 'auto'
      }}
    >
      <Toaster position="bottom-right" richColors />

      {/* TOP BAR */}
      <div
        style={{
          background: C.topBar,
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <button
            onClick={() => navigate('/')}
            style={iconBtnStyle}
            title="Regresar"
          >
            <ArrowLeft size={20} />
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <ClipboardList
              size={24}
              style={{ color: C.primary }}
            />

            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '1.2rem',
                  fontWeight: 800,
                  color: C.text
                }}
              >
                INFORME DIARIO
              </h1>

              <span
                style={{
                  fontSize: '0.75rem',
                  color: C.textMuted
                }}
              >
                Terminal de Control Proyectivo F-141-IN
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setEditingInforme(null);
            setActiveTab("formulario");
          }}
          style={{
            padding: '0.6rem 1.5rem',
            borderRadius: 14,
            border: 'none',
            background: `linear-gradient(135deg, ${C.primary} 0%, #db2777 100%)`,
            color: C.white,
            fontSize: '0.95rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: `0 6px 16px ${C.primaryShadow}`,
          }}
        >
          <Plus size={18} />
          NUEVO REGISTRO
        </button>
      </div>

      {/* CUERPO */}
      <div
        style={{
          maxWidth: 1600,
          margin: '0 auto',
          padding: '1.5rem'
        }}
      >
        <StatsHeader />

        <div
          style={{
            display: 'flex',
            gap: '0.75rem',
            marginBottom: '1.25rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
          }}
        >
          {tabs.map(t => (
            <TabChip
              key={t.id}
              active={activeTab === t.id}
              onClick={() => setActiveTab(t.id)}
              label={t.label}
              icon={t.icon}
            />
          ))}
        </div>

        <div
          style={{
            background: C.white,
            borderRadius: 24,
            border: `1px solid ${C.border}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
            padding: '1.5rem',
            minHeight: 600,
          }}
        >
          {activeTab === "dashboard" && (
        <InformeDashboard
          onNuevoInforme={() => {
            setEditingInforme(null);
            setActiveTab("formulario");
          }}
        />
      )}

      {activeTab === "lista" && (
        <InformeLista
          onEditar={inf => {
            setEditingInforme(inf);
            setActiveTab("formulario");
          }}
        />
      )}

      {activeTab === "fotos" && (
        <InformeFotos
          informeId={editingInforme?.id}
        />
      )}

      {(activeTab === "formulario") && (
        <InformeFormulario
          informe={editingInforme}
          onGuardado={() => setActiveTab("lista")}
          onCancelar={() => setActiveTab("lista")}
        />
      )}

      {activeTab === "catalogos" && (
        <InformeCatalogos />
      )}
        </div>
      </div>
    </div>
  );
}

// ── EXPORT ────────────────────────────────────────────────────────────────────
export default function InformeDiarioProy() {
  return (
    <QueryClientProvider client={queryClient}>
      <InformeDiarioContent />
    </QueryClientProvider>
  );
}
