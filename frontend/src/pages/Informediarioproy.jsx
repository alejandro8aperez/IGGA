import React, { useState } from 'react';
import api from '../services/api';

const Informediarioproy = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [form, setForm] = useState({
    obra: 'Ampliación SE LA LOMA 500 kV',
    fecha: new Date().toISOString().split('T')[0],
    codigo_formato: 'F-141-IN',
    version: '1',
    mod: '00',
    lluvia: 'NO',
    he_lluvia: 0,
    maquinaria: {
      camioneta_siemens: 0,
      buseta_vans: 0,
      generador: 0,
      camion_grua: 0,
      manlift_edemsa: 0,
    },
    personal: {
      residente_tecnico: 0,
      coordinadora_sst: 0,
      director_proyecto: 0,
      inspector_qa_qc: 0,
      ayudante_tecnico: 0,
      conductor: 0,
    },
    act_administrativas: '',
    act_tecnicas_cableado: '',
    act_montaje_pruebas: '',
    act_obra_civil: '',
    act_sst_ambiental: '',
    elaborado_por: '',
    revisado_por: '',
    aprobado_por: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setForm(prev => ({
        ...prev,
        [section]: { ...prev[section], [field]: value }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('operaciones/informes-diarios/', form);
      setSuccess(true);
      alert('Informe Diario guardado correctamente en la base de datos PostgreSQL.');
    } catch (error) {
      console.error("Error al guardar el informe:", error);
      alert('Error al conectar con la API del ERP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg">
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <h1 className="text-2xl font-bold text-blue-900">Libro Diario de Obra - Interventoría</h1>
        <span className="text-sm font-mono bg-gray-100 p-2 rounded">{form.codigo_formato} - V{form.version}</span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Encabezado y Metadatos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50 p-4 rounded">
          <div>
            <label className="block text-sm font-bold">Obra/Proyecto:</label>
            <input name="obra" value={form.obra} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div>
            <label className="block text-sm font-bold">Fecha de Reporte:</label>
            <input type="date" name="fecha" value={form.fecha} onChange={handleChange} className="w-full p-2 border rounded" />
          </div>
          <div className="flex gap-4">
            <div>
              <label className="block text-sm font-bold">Lluvia:</label>
              <select name="lluvia" value={form.lluvia} onChange={handleChange} className="p-2 border rounded">
                <option value="SI">SI</option>
                <option value="NO">NO</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold">Horas (He):</label>
              <input type="number" name="he_lluvia" value={form.he_lluvia} onChange={handleChange} className="w-20 p-2 border rounded" />
            </div>
          </div>
        </div>

        {/* Tablas de Recursos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section>
            <h3 className="font-bold border-b mb-3">Maquinaria y Equipos</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span>Camionetas (Siemens):</span> 
                <input type="number" name="maquinaria.camioneta_siemens" onChange={handleChange} className="w-16 border rounded text-center" /></div>
              <div className="flex justify-between"><span>Buseta Vans:</span> 
                <input type="number" name="maquinaria.buseta_vans" onChange={handleChange} className="w-16 border rounded text-center" /></div>
              <div className="flex justify-between"><span>Generador:</span> 
                <input type="number" name="maquinaria.generador" onChange={handleChange} className="w-16 border rounded text-center" /></div>
              <div className="flex justify-between"><span>Camión Grúa:</span> 
                <input type="number" name="maquinaria.camion_grua" onChange={handleChange} className="w-16 border rounded text-center" /></div>
              <div className="flex justify-between"><span>Manlift (Edemsa):</span> 
                <input type="number" name="maquinaria.manlift_edemsa" onChange={handleChange} className="w-16 border rounded text-center" /></div>
            </div>
          </section>

          <section>
            <h3 className="font-bold border-b mb-3">Personal de Obra</h3>
            <div className="space-y-2">
              <div className="flex justify-between"><span>Residente Técnico:</span> 
                <input type="number" name="personal.residente_tecnico" onChange={handleChange} className="w-16 border rounded text-center" /></div>
              <div className="flex justify-between"><span>Coordinadora SST:</span> 
                <input type="number" name="personal.coordinadora_sst" onChange={handleChange} className="w-16 border rounded text-center" /></div>
              <div className="flex justify-between"><span>Director Proyecto:</span> 
                <input type="number" name="personal.director_proyecto" onChange={handleChange} className="w-16 border rounded text-center" /></div>
              <div className="flex justify-between"><span>Inspector QA/QC:</span> 
                <input type="number" name="personal.inspector_qa_qc" onChange={handleChange} className="w-16 border rounded text-center" /></div>
              <div className="flex justify-between"><span>Ayudante Técnico:</span> 
                <input type="number" name="personal.ayudante_tecnico" onChange={handleChange} className="w-16 border rounded text-center" /></div>
              <div className="flex justify-between"><span>Conductor:</span> 
                <input type="number" name="personal.conductor" onChange={handleChange} className="w-16 border rounded text-center" /></div>
            </div>
          </section>
        </div>

        {/* Bloques de Actividades */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg bg-gray-200 p-2">Descripción de Actividades</h3>
          
          <div>
            <label className="block font-bold mb-1">1. Administrativas y Documentales:</label>
            <textarea name="act_administrativas" onChange={handleChange} className="w-full p-2 border rounded h-24" placeholder="Ej: Actualización listado de pendientes..."></textarea>
          </div>

          <div>
            <label className="block font-bold mb-1">2. Técnicas (Cableado/Conexionado/Pruebas):</label>
            <textarea name="act_tecnicas_cableado" onChange={handleChange} className="w-full p-2 border rounded h-24" placeholder="Ej: Sellado de tapas en tableros..."></textarea>
          </div>

          <div>
            <label className="block font-bold mb-1">3. Montaje y Pruebas:</label>
            <textarea name="act_montaje_pruebas" onChange={handleChange} className="w-full p-2 border rounded h-24" placeholder="Ej: Pruebas de continuidad..."></textarea>
          </div>

          <div>
            <label className="block font-bold mb-1">4. Obra Civil:</label>
            <textarea name="act_obra_civil" onChange={handleChange} className="w-full p-2 border rounded h-24" placeholder="Ej: Excavación de zanjas..."></textarea>
          </div>

          <div>
            <label className="block font-bold mb-1">5. Gestión SST y Ambiental:</label>
            <textarea name="act_sst_ambiental" onChange={handleChange} className="w-full p-2 border rounded h-24" placeholder="Ej: Jornadas de orden y aseo..."></textarea>
          </div>
        </div>

        {/* Firmas y Aprobaciones */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t pt-6">
          <input name="elaborado_por" onChange={handleChange} placeholder="Elaborado por (Nombre)" className="p-2 border-b outline-none text-center" />
          <input name="revisado_por" onChange={handleChange} placeholder="Revisado por (Nombre)" className="p-2 border-b outline-none text-center" />
          <input name="aprobado_por" onChange={handleChange} placeholder="Aprobado por (Nombre)" className="p-2 border-b outline-none text-center" />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-900 text-white font-bold py-3 rounded-lg hover:bg-blue-800 transition-colors"
        >
          {loading ? 'Sincronizando con PostgreSQL...' : 'Guardar Informe Diario'}
        </button>
      </form>
    </div>
  );
};

export default Informediarioproy;
