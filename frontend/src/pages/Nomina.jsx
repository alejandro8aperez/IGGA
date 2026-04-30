import React, { useState } from 'react';
import { Users, FileText, Download, Calculator, CheckCircle, Search } from 'lucide-react';
import axios from 'axios';

const Nomina = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [notificacion, setNotificacion] = useState(null);
    const [empleados] = useState([
        { id: 1, nombre: 'Juan Alexander Ramirez', cedula: '10203040', cargo: 'Ingeniero de Software', salario: 5000000 },
        { id: 2, nombre: 'Maria Paula Soto', cedula: '52637485', cargo: 'Gerente Comercial', salario: 8000000 },
    ]);

    const generarVoucher = async (empleado) => {
        const salud = empleado.salario * 0.04;
        const pension = empleado.salario * 0.04;
        const neto = empleado.salario - salud - pension;

        const payload = {
            nombre: empleado.nombre,
            cedula: empleado.cedula,
            cargo: empleado.cargo,
            periodo: 'Abril 2026',
            neto: neto,
            conceptos: [
                { nombre: 'Sueldo Básico', valor: empleado.salario, tipo: 'devengado' },
                { nombre: 'Aporte Salud (4%)', valor: salud, tipo: 'deduccion' },
                { nombre: 'Aporte Pensión (4%)', valor: pension, tipo: 'deduccion' },
            ]
        };

        try {
            const response = await axios.post('/api/nominas/voucher/pdf/', payload, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Voucher_${empleado.cedula}.pdf`);
            document.body.appendChild(link);
            link.click();
            
            setNotificacion(`Comprobante generado y asiento contable registrado para ${empleado.nombre}`);
            setTimeout(() => setNotificacion(null), 5000);
        } catch (error) {
            alert("Error al generar el comprobante.");
        }
    };

    return (
        <div style={{ padding: '2rem', background: '#f8fafc', minHeight: '100vh' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                
                {/* Alerta de Éxito SAP Style */}
                {notificacion && (
                    <div style={{ background: '#dcfce7', border: '1px solid #166534', color: '#166534', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', animation: 'slideIn 0.3s ease-out' }}>
                        <CheckCircle size={20} />
                        <span style={{ fontWeight: '600' }}>{notificacion}</span>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Gestión de Nómina</h1>
                        <p style={{ color: '#64748b' }}>Cálculo de provisiones y generación de comprobantes</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input 
                                type="text" 
                                placeholder="Buscar empleado..." 
                                style={{ padding: '0.6rem 1rem 0.6rem 2.5rem', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none' }}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ background: 'white', borderRadius: '20px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: '#f1f5f9' }}>
                            <tr>
                                <th style={thStyle}>Empleado</th>
                                <th style={thStyle}>Cargo</th>
                                <th style={thStyle}>Salario Base</th>
                                <th style={thStyle}>Estado</th>
                                <th style={thStyle}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {empleados.map(emp => (
                                <tr key={emp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{emp.nombre}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>CC: {emp.cedula}</div>
                                    </td>
                                    <td style={tdStyle}>{emp.cargo}</td>
                                    <td style={tdStyle}>$ {emp.salario.toLocaleString()}</td>
                                    <td style={tdStyle}>
                                        <span style={{ padding: '4px 12px', borderRadius: '20px', background: '#dcfce7', color: '#166534', fontSize: '0.75rem', fontWeight: '700' }}>
                                            LIQUIDADO
                                        </span>
                                    </td>
                                    <td style={tdStyle}>
                                        <button 
                                            onClick={() => generarVoucher(emp)}
                                            style={{ 
                                                display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', 
                                                borderRadius: '8px', border: 'none', background: '#4f46e5', 
                                                color: 'white', cursor: 'pointer', fontWeight: '600' 
                                            }}
                                        >
                                            <Download size={16} /> Comprobante
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={{ marginTop: '2rem', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                    <div style={statCardStyle}>
                        <Calculator style={{ color: '#4f46e5' }} />
                        <div>
                            <div style={statLabelStyle}>Total Nómina Mensual</div>
                            <div style={statValueStyle}>$ 13,000,000</div>
                        </div>
                    </div>
                    <div style={statCardStyle}>
                        <Users style={{ color: '#10b981' }} />
                        <div>
                            <div style={statLabelStyle}>Empleados Activos</div>
                            <div style={statValueStyle}>2</div>
                        </div>
                    </div>
                    <div style={statCardStyle}>
                        <FileText style={{ color: '#f59e0b' }} />
                        <div>
                            <div style={statLabelStyle}>Comprobantes Emitidos</div>
                            <div style={statValueStyle}>2</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const thStyle = { textAlign: 'left', padding: '1rem 1.5rem', fontSize: '0.85rem', color: '#64748b', fontWeight: '600' };
const tdStyle = { padding: '1rem 1.5rem', fontSize: '0.9rem', color: '#475569' };
const statCardStyle = { 
    background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', 
    display: 'flex', alignItems: 'center', gap: '1rem' 
};
const statLabelStyle = { fontSize: '0.8rem', color: '#64748b' };
const statValueStyle = { fontSize: '1.25rem', fontWeight: '800', color: '#1e293b' };

export default Nomina;