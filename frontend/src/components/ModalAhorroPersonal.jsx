import { useState } from 'react';
import { ahorroCompartidoAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function ModalAhorroPersonal({ visible, onCerrar, cuentas, onCrear }) {
  const { usuario } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    montoObjetivo: '',
    montoActual: 0,
    cuentaDestino: cuentas?.[0]?._id || '',
    estado: 'activo',
    motivo: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      if (!formData.nombre || !formData.montoObjetivo) {
        alert('Por favor completa los campos obligatorios');
        return;
      }

      if (!formData.cuentaDestino) {
        alert('Selecciona una cuenta destino');
        return;
      }

      const usuarioId = usuario._id || usuario.id;

      const ahorro = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || '',
        montoObjetivo: parseFloat(formData.montoObjetivo),
        montoActual: 0,
        cuentaDestino: formData.cuentaDestino,
        estado: formData.estado,
        motivo: formData.motivo,
        participantes: { [usuarioId]: 0 }, // Solo el usuario actual
        esPersonal: true, // Marca como personal
      };

      await ahorroCompartidoAPI.crear(ahorro);
      
      alert('✅ Ahorro personal creado correctamente');
      resetForm();
      onCrear?.();
      onCerrar();
    } catch (error) {
      console.error('Error al crear ahorro personal:', error);
      alert('Error al crear ahorro: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      montoObjetivo: '',
      montoActual: 0,
      cuentaDestino: cuentas?.[0]?._id || '',
      estado: 'activo',
      motivo: '',
    });
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl">💰</span>
          <h2 className="text-xl font-bold text-slate-800">Nuevo Ahorro Personal</h2>
        </div>
        
        <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mb-4 text-sm text-teal-700">
          <p className="font-medium">ℹ️ Ahorro Personal</p>
          <p className="text-xs mt-1">Este fondo de ahorro es solo tuyo, no se comparte con otros usuarios.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">📝 Nombre del Ahorro *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Fondo de emergencia, Vacaciones..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-800"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">📄 Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Describe tu fondo de ahorro..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-800 resize-none"
            />
          </div>

          {/* Monto y Cuenta */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">🎯 Monto Objetivo *</label>
              <input
                type="number"
                name="montoObjetivo"
                value={formData.montoObjetivo}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">💾 Cuenta Destino *</label>
              <select
                name="cuentaDestino"
                value={formData.cuentaDestino}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-800"
                required
              >
                <option value="">Seleccionar cuenta</option>
                {cuentas?.map(c => (
                  <option key={c._id} value={c._id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">💭 Propósito del Ahorro</label>
            <input
              type="text"
              name="motivo"
              value={formData.motivo}
              onChange={handleChange}
              placeholder="¿Para qué es este fondo?"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-800"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">📌 Estado Inicial</label>
            <div className="flex gap-4">
              {['activo', 'pausado'].map(s => (
                <label key={s} className="flex items-center">
                  <input
                    type="radio"
                    name="estado"
                    value={s}
                    checked={formData.estado === s}
                    onChange={handleChange}
                    className="w-4 h-4 text-teal-500"
                  />
                  <span className={`ml-2 text-slate-700 capitalize ${
                    s === 'activo' ? 'text-green-600 font-medium' : 'text-yellow-600'
                  }`}>{s}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                resetForm();
                onCerrar();
              }}
              className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:shadow-lg font-bold transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Ahorro'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalAhorroPersonal;
