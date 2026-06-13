import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Users, Loader2 } from 'lucide-react';
import empleadoService from '../../services/empleadoService';

/**
 * Componente reutilizable: Dropdown de Empleados Activos desde RRHH
 * 
 * Props:
 *   - label: string (etiqueta del campo)
 *   - value: number|null (ID del empleado seleccionado)
 *   - onChange: (id: number|null) => void
 *   - required?: boolean
 *   - placeholder?: string
 *   - error?: string|null
 *   - disabled?: boolean
 */
const EmpleadoSelect = ({ 
    label = 'Empleado',
    value = null,
    onChange,
    required = false,
    placeholder = 'Seleccione un empleado',
    error = null,
    disabled = false,
}) => {
    const { data: empleados, isLoading, isError } = useQuery({
        queryKey: ['empleados', 'activos'],
        queryFn: empleadoService.getActivos,
        staleTime: 5 * 60 * 1000, // 5 minutos de cache
        retry: 2,
    });

    const handleChange = (e) => {
        const val = e.target.value;
        onChange(val ? parseInt(val, 10) : null);
    };

    // Encontrar el empleado seleccionado para mostrar detalles
    const empleadoSeleccionado = empleados?.find(emp => emp.id === value);

    return (
        <div className="form-group mb-3">
            <label className="form-label d-flex align-items-center gap-2">
                <Users size={16} />
                {label}
                {required && <span className="text-danger">*</span>}
            </label>

            <div className="position-relative">
                <select
                    className={`form-select ${error ? 'is-invalid' : ''}`}
                    value={value || ''}
                    onChange={handleChange}
                    required={required}
                    disabled={disabled || isLoading}
                    style={{
                        paddingLeft: '2.5rem',
                        minHeight: '42px',
                    }}
                >
                    <option value="">{placeholder}</option>

                    {isLoading && (
                        <option disabled>
                            <span className="d-flex align-items-center gap-2">
                                <Loader2 size={14} className="spin" />
                                Cargando empleados...
                            </span>
                        </option>
                    )}

                    {isError && (
                        <option disabled className="text-danger">
                            Error al cargar empleados
                        </option>
                    )}

                    {empleados?.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                            {emp.nombre_completo} — {emp.cargo_nombre || 'Sin cargo'}
                        </option>
                    ))}
                </select>

                {/* Icono decorativo */}
                <div 
                    className="position-absolute d-flex align-items-center justify-content-center"
                    style={{
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none',
                        color: '#6c757d',
                    }}
                >
                    <Users size={16} />
                </div>
            </div>

            {/* Info del empleado seleccionado */}
            {empleadoSeleccionado && (
                <div 
                    className="mt-2 p-2 rounded"
                    style={{
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e9ecef',
                        fontSize: '0.85rem',
                    }}
                >
                    <div className="d-flex flex-column gap-1">
                        <span className="fw-semibold text-dark">
                            {empleadoSeleccionado.nombre_completo}
                        </span>
                        <span className="text-muted">
                            {empleadoSeleccionado.cargo_nombre || 'Sin cargo asignado'}
                        </span>
                        {empleadoSeleccionado.numero_documento && (
                            <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                Doc: {empleadoSeleccionado.numero_documento}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {error && (
                <div className="invalid-feedback d-block mt-1">
                    {error}
                </div>
            )}
        </div>
    );
};

export default EmpleadoSelect;
