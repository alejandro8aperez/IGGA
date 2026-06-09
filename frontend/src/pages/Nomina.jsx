import { useState, useEffect } from 'react';
import axiosInstance from '../config/axiosConfig';
import { 
    Users, FileText, Download, Calculator, CheckCircle, Search, 
    Calendar, Plus, Play, Eye, FileJson, AlertCircle, X, ChevronRight,
    DollarSign, TrendingUp, Briefcase, Building2
} from 'lucide-react';
import { API } from '../config/api';

const Nomina = () => {
    // --- Estados ---
    const [periodos, setPeriodos] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [nominas, setNominas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [notificacion, setNotificacion] = useState(null);
    const [isNewPeriodModalOpen, setIsNewPeriodModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [currentNomina, setCurrentNomina] = useState(null);

    // --- Formulario Nuevo Periodo ---
    const [newPeriodForm, setNewPeriodForm] = useState({
        nombre: '',
        tipo: 'MEN',
        fecha_inicio: '',
        fecha_fin: '',
        fecha_pago: ''
    });

    // --- Carga Inicial ---
    useEffect(() => {
        fetchPeriodos();
    }, []);

    useEffect(() => {
        if (selectedPeriod) {
            fetchNominas(selectedPeriod.id);
        }
    }, [selectedPeriod]);

    const fetchPeriodos = async () => {
        try {
            const res = await axiosInstance.get(API.NOMINA.PERIODOS);
            console.log("Periodos cargados:", res.data);
            
            // ✅ DEFENSA: Normalizar la respuesta sin importar el formato
            let data = res?.data;
            let listaPeriodos = [];
            
            if (Array.isArray(data)) {
                listaPeriodos = data;
            } else if (data && typeof data === 'object') {
                // Si el backend envuelve en PERIODOS, periodos, results, etc.
                listaPeriodos = data.PERIODOS || data.periodos || data.results || data.data || [];
            }
            
            setPeriodos(listaPeriodos);
            
            if (listaPeriodos.length > 0 && !selectedPeriod) {
                setSelectedPeriod(listaPeriodos[0]);
            }
        } catch (error) {
            console.error("Error fetching periodos:", error);
            setPeriodos([]); // ✅ No dejar el estado en limbo
        }
    };

    const fetchNominas = async (periodoId) => {
        if (!periodoId) {
            console.warn("fetchNominas llamado sin periodoId");
            return;
        }
        
        setLoading(true);
        try {
            const res = await axiosInstance.get(`${API.NOMINA.NOMINAS}?periodo=${periodoId}`);
            setNominas(res?.data || []);
        } catch (error) {
            console.error("Error fetching nominas:", error);
            setNominas([]);
        } finally {
            setLoading(false);
        }
    };

    // --- Acciones ---
    const handleCreatePeriod = async (e) => {
        e.preventDefault();
        try {
            const res = await axiosInstance.post(API.NOMINA.PERIODOS, newPeriodForm);
            setPeriodos([res.data, ...periodos]);
            setSelectedPeriod(res.data);
            setIsNewPeriodModalOpen(false);
            showNotify("Periodo creado correctamente");
        } catch (error) {
            alert("Error al crear el periodo");
        }
    };

    const handleLiquidar = async () => {
        if (!selectedPeriod) return;
        if (!window.confirm(`¿Desea liquidar la nómina para el periodo ${selectedPeriod.nombre}?`)) return;

        setLoading(true);
        try {
            const res = await axiosInstance.post(`${API.NOMINA.PERIODOS}${selectedPeriod.id}/liquidar/`);
            if (res.data.status === 'warning') {
                alert(res.data.message);
            } else {
                showNotify(res.data.message || "Nómina liquidada exitosamente");
            }
            fetchNominas(selectedPeriod.id);
        } catch (error) {
            console.error("Error liquidando:", error);
            alert("Error al liquidar la nómina: " + (error.response?.data?.error || "Error del servidor"));
        } finally {
            setLoading(false);
        }
    };

    const handleExportXML = async () => {
        if (!selectedPeriod) return;
        try {
            const res = await axiosInstance.get(`${API.NOMINA.NOMINAS}exportar-electronica/?periodo_id=${selectedPeriod.id}`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Nomina_Electronica_${selectedPeriod.nombre}.xml`);
            document.body.appendChild(link);
            link.click();
            showNotify("Archivo XML generado correctamente");
        } catch (error) {
            console.error("Error exportando XML:", error);
            alert("Error al exportar la nómina electrónica.");
        }
    };

    const handleDownloadVoucher = async (nomina) => {
        if (!selectedPeriod) {
            alert("No hay periodo seleccionado");
            return;
        }
        
        try {
            const res = await axiosInstance.post(`${API.NOMINA.NOMINAS}voucher/pdf/`, {
                nombre: nomina.empleado_nombre,
                cedula: nomina.empleado_numero_documento || 'N/A',
                cargo: nomina.empleado_cargo || 'N/A',
                periodo: selectedPeriod.nombre,
                neto: nomina.neto_pagar,
                conceptos: nomina.detalles?.map(d => ({
                    nombre: d.concepto_nombre,
                    valor: parseFloat(d.valor),
                    tipo: d.concepto_tipo === 'DEV' ? 'devengado' : 'deduccion'
                })) || []
            }, { responseType: 'blob' });

            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Voucher_${nomina.empleado_nombre}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            alert("Error al generar el voucher");
        }
    };

    const showNotify = (msg) => {
        setNotificacion(msg);
        setTimeout(() => setNotificacion(null), 5000);
    };

    const filteredNominas = nominas.filter(n => 
        n.empleado_nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- Estilos ---
    const styles = {
        container: { padding: '2rem', background: 'linear-gradient(135deg, #f0f4f8 0%, #d9e2ec 100%)', minHeight: '100vh', fontFamily: 'Inter, sans-serif' },
        header: { background: 'white', padding: '2rem', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
        card: { background: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflow: 'hidden' },
        btnPrimary: { background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', color: 'white', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' },
        btnSecondary: { background: 'white', color: '#4f46e5', border: '2px solid #4f46e5', padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' },
        statCard: { background: 'white', padding: '1.5rem', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
        modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
        modalContent: { background: 'white', borderRadius: '24px', padding: '2rem', width: '90%', maxWidth: '600px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' },
        input: { width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '0.5rem', fontSize: '1rem' }
    };

    return (
        <div style={styles.container}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                
                {/* Notificación */}
                {notificacion && (
                    <div style={{ background: '#ecfdf5', border: '1px solid #10b981', color: '#065f46', padding: '1rem 1.5rem', borderRadius: '16px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', animation: 'slideDown 0.3s ease-out' }}>
                        <CheckCircle size={20} />
                        <span style={{ fontWeight: '600' }}>{notificacion}</span>
                    </div>
                )}

                {/* Header */}
                <div style={styles.header}>
                    <div>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#1e293b', margin: 0, letterSpacing: '-0.02em' }}>Gestión de Nómina</h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
                            <select 
                                value={selectedPeriod?.id || ''} 
                                onChange={(e) => {
                                    const id = parseInt(e.target.value);
                                    const periodo = periodos.find(p => p.id === id);
                                    setSelectedPeriod(periodo || null);
                                }}
                                style={{ padding: '0.5rem 1rem', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: '600', color: '#475569' }}
                            >
                                {periodos.length === 0 && <option value="">Sin periodos</option>}
                                {periodos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                            </select>
                            <button onClick={() => setIsNewPeriodModalOpen(true)} style={{ color: '#6366f1', background: 'none', border: 'none', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Plus size={18} /> Nuevo Periodo
                            </button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                            onClick={handleExportXML} 
                            style={{ ...styles.btnSecondary, opacity: !selectedPeriod ? 0.5 : 1, cursor: !selectedPeriod ? 'not-allowed' : 'pointer' }}
                            disabled={!selectedPeriod}
                        >
                            <FileJson size={18} /> Nómina Electrónica
                        </button>
                        <button 
                            onClick={handleLiquidar} 
                            style={{ ...styles.btnPrimary, opacity: !selectedPeriod ? 0.5 : 1, cursor: !selectedPeriod ? 'not-allowed' : 'pointer' }} 
                            disabled={loading || !selectedPeriod}
                        >
                            {loading ? <Calculator className="animate-spin" /> : <Play size={18} />}
                            {nominas.length > 0 ? 'Reliquidar Todo' : 'Liquidar Periodo'}
                        </button>
                    </div>
                </div>

                {/* Resumen */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div style={styles.statCard}>
                        <div style={{ background: '#e0e7ff', padding: '12px', borderRadius: '15px', color: '#4f46e5' }}><DollarSign /></div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Costo Total</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>
                                ${nominas.reduce((acc, n) => acc + parseFloat(n.total_devengados || 0), 0).toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{ background: '#dcfce7', padding: '12px', borderRadius: '15px', color: '#10b981' }}><Users /></div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Empleados</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>{nominas.length}</div>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{ background: '#fee2e2', padding: '12px', borderRadius: '15px', color: '#ef4444' }}><TrendingUp /></div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Deducciones</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>
                                ${nominas.reduce((acc, n) => acc + parseFloat(n.total_deducciones || 0), 0).toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '15px', color: '#f59e0b' }}><Briefcase /></div>
                        <div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>Provisiones</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b' }}>
                                ${nominas.reduce((acc, n) => acc + parseFloat(n.total_provisiones || 0), 0).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Listado */}
                <div style={styles.card}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontWeight: '800', color: '#334155' }}>Empleados Liquidados</h3>
                        <div style={{ position: 'relative', width: '300px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input 
                                type="text" 
                                placeholder="Buscar empleado..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', padding: '0.7rem 1rem 0.7rem 2.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }}
                            />
                        </div>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f8fafc' }}>
                            <tr>
                                <th style={thStyle}>Empleado</th>
                                <th style={thStyle}>Salario Base</th>
                                <th style={thStyle}>Devengados</th>
                                <th style={thStyle}>Deducciones</th>
                                <th style={thStyle}>Neto a Pagar</th>
                                <th style={thStyle}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>Procesando nómina...</td></tr>
                            ) : filteredNominas.length === 0 ? (
                                <tr><td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>No hay registros de nómina para este periodo. Pulse "Liquidar" para generarlos.</td></tr>
                            ) : filteredNominas.map(n => (
                                <tr key={n.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }}>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: '700', color: '#1e293b' }}>{n.empleado_nombre}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Días: {n.dias_trabajados}</div>
                                    </td>
                                    <td style={tdStyle}>${parseFloat(n.salario_base || 0).toLocaleString()}</td>
                                    <td style={tdStyle}><span style={{ color: '#059669', fontWeight: '600' }}>+${parseFloat(n.total_devengados || 0).toLocaleString()}</span></td>
                                    <td style={tdStyle}><span style={{ color: '#dc2626', fontWeight: '600' }}>-${parseFloat(n.total_deducciones || 0).toLocaleString()}</span></td>
                                    <td style={tdStyle}>
                                        <div style={{ padding: '6px 12px', borderRadius: '10px', background: '#f0fdf4', color: '#166534', fontWeight: '800', display: 'inline-block' }}>
                                            ${parseFloat(n.neto_pagar || 0).toLocaleString()}
                                        </div>
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <button onClick={() => { setCurrentNomina(n); setIsDetailModalOpen(true); }} style={iconBtnStyle} title="Ver detalle"><Eye size={18} /></button>
                                            <button onClick={() => handleDownloadVoucher(n)} style={iconBtnStyle} title="Descargar PDF"><Download size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Nuevo Periodo */}
            {isNewPeriodModalOpen && (
                <div style={styles.modal} onClick={() => setIsNewPeriodModalOpen(false)}>
                    <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontWeight: '900', color: '#1e293b' }}>Nuevo Periodo de Nómina</h2>
                            <button onClick={() => setIsNewPeriodModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X /></button>
                        </div>
                        <form onSubmit={handleCreatePeriod}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={labelStyle}>Nombre del Periodo</label>
                                <input type="text" placeholder="Ej: Abril 2026" required style={styles.input} value={newPeriodForm.nombre} onChange={e => setNewPeriodForm({...newPeriodForm, nombre: e.target.value})} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label style={labelStyle}>Fecha Inicio</label>
                                    <input type="date" required style={styles.input} value={newPeriodForm.fecha_inicio} onChange={e => setNewPeriodForm({...newPeriodForm, fecha_inicio: e.target.value})} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Fecha Fin</label>
                                    <input type="date" required style={styles.input} value={newPeriodForm.fecha_fin} onChange={e => setNewPeriodForm({...newPeriodForm, fecha_fin: e.target.value})} />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={labelStyle}>Fecha de Pago</label>
                                <input type="date" required style={styles.input} value={newPeriodForm.fecha_pago} onChange={e => setNewPeriodForm({...newPeriodForm, fecha_pago: e.target.value})} />
                            </div>
                            <button type="submit" style={{ ...styles.btnPrimary, width: '100%', justifyContent: 'center' }}>Crear Periodo</button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Detalle Nómina */}
            {isDetailModalOpen && currentNomina && (
                <div style={styles.modal} onClick={() => setIsDetailModalOpen(false)}>
                    <div style={{ ...styles.modalContent, maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ margin: 0, fontWeight: '900', color: '#1e293b' }}>Detalle de Liquidación</h2>
                                <p style={{ margin: 0, color: '#64748b' }}>{currentNomina.empleado_nombre} · {selectedPeriod?.nombre || 'Sin periodo'}</p>
                            </div>
                            <button onClick={() => setIsDetailModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X /></button>
                        </div>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                            <div>
                                <h4 style={sectionHeaderStyle}>Devengados</h4>
                                {currentNomina.detalles?.filter(d => d.concepto_tipo !== 'DED' && d.concepto_tipo !== 'PROV').map(d => (
                                    <div key={d.id} style={detailRowStyle}>
                                        <span>{d.concepto_nombre}</span>
                                        <span style={{ fontWeight: '700', color: '#059669' }}>+${parseFloat(d.valor || 0).toLocaleString()}</span>
                                    </div>
                                )) || <p style={{ color: '#94a3b8' }}>Sin devengados</p>}
                            </div>
                            <div>
                                <h4 style={sectionHeaderStyle}>Deducciones</h4>
                                {currentNomina.detalles?.filter(d => d.concepto_tipo === 'DED').map(d => (
                                    <div key={d.id} style={detailRowStyle}>
                                        <span>{d.concepto_nombre}</span>
                                        <span style={{ fontWeight: '700', color: '#dc2626' }}>-${parseFloat(d.valor || 0).toLocaleString()}</span>
                                    </div>
                                )) || <p style={{ color: '#94a3b8' }}>Sin deducciones</p>}
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: '900' }}>
                                <span>NETO A PAGAR</span>
                                <span style={{ color: '#166534' }}>${parseFloat(currentNomina.neto_pagar || 0).toLocaleString()}</span>
                            </div>
                        </div>

                        <div style={{ marginTop: '1.5rem' }}>
                            <h4 style={sectionHeaderStyle}>Provisiones Patronales (No afectan el neto)</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                {currentNomina.detalles?.filter(d => d.concepto_tipo === 'PROV').map(d => (
                                    <div key={d.id} style={{ ...detailRowStyle, border: 'none', padding: '4px 0' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{d.concepto_nombre}</span>
                                        <span style={{ fontSize: '0.8rem', fontWeight: '700' }}>${parseFloat(d.valor || 0).toLocaleString()}</span>
                                    </div>
                                )) || <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Sin provisiones</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const thStyle = { textAlign: 'left', padding: '1.2rem 1.5rem', fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' };
const tdStyle = { padding: '1.2rem 1.5rem', fontSize: '0.95rem', color: '#334155' };
const iconBtnStyle = { background: '#f1f5f9', border: 'none', padding: '8px', borderRadius: '10px', cursor: 'pointer', color: '#475569', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const labelStyle = { fontSize: '0.85rem', fontWeight: '700', color: '#475569', display: 'block' };
const sectionHeaderStyle = { fontSize: '0.9rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' };
const detailRowStyle = { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' };

export default Nomina;
