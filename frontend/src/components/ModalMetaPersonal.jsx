import { useState } from 'react';
import { metasAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function ModalMetaPersonal({ visible, onCerrar, onCrear }) {
  const { usuario } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    montoObjetivo: '',
    fechaLimite: '',
    categoria: 'Meta Personal',
    prioridad: 'media',
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
      
      if (!formData.nombre || !formData.montoObjetivo || !formData.fechaLimite) {
        alert('Por favor completa los campos obligatorios');
        return;
      }

      const usuarioId = usuario._id || usuario.id;

      const meta = {
        nombre: formData.nombre,
        descripcion: formData.descripcion || '',
        montoObjetivo: parseFloat(formData.montoObjetivo),
        montoActual: 0,
        fechaLimite: formData.fechaLimite,
        categoria: formData.categoria,
        prioridad: formData.prioridad,
        motivo: formData.motivo,
        estado: 'activa',
        participantes: [usuarioId], // Solo el usuario actual
        esPersonal: true, // Marca como personal
      };

      await metasAPI.crear(meta);
      
      alert('✅ Meta personal creada correctamente');
      resetForm();
      onCrear?.();
      onCerrar();
    } catch (error) {
      console.error('Error al crear meta personal:', error);
      alert('Error al crear meta: ' + (error.message || error));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      montoObjetivo: '',
      fechaLimite: '',
      categoria: 'Meta Personal',
      prioridad: 'media',
      motivo: '',
    });
  };

  // Calcular días restantes
  const diasRestantes = formData.fechaLimite 
    ? Math.ceil((new Date(formData.fechaLimite) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl">🎯</span>
          <h2 className="text-xl font-bold text-slate-800">Nueva Meta Personal</h2>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm text-blue-700">
          <p className="font-medium">ℹ️ Meta Personal</p>
          <p className="text-xs mt-1">Esta meta es solo tuya, no se comparte con otros usuarios.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">📝 Nombre de la Meta *</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Viaje a Europa, Auto nuevo..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-slate-800"
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
              placeholder="Describe tu meta..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-slate-800 resize-none"
            />
          </div>

          {/* Monto y Fecha */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">💰 Monto Objetivo *</label>
              <input
                type="number"
                name="montoObjetivo"
                value={formData.montoObjetivo}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-slate-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">⏰ Fecha Límite *</label>
              <input
                type="date"
                name="fechaLimite"
                value={formData.fechaLimite}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-slate-800"
                required
              />
            </div>
          </div>

          {/* Días Restantes Info */}
          {diasRestantes !== null && (
            <div className={`p-3 rounded-lg text-sm font-medium ${
              diasRestantes > 30 ? 'bg-green-100 text-green-800' :
              diasRestantes > 7 ? 'bg-yellow-100 text-yellow-800' :
              diasRestantes > 0 ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {diasRestantes > 0 
                ? `⏳ ${diasRestantes} días restantes para alcanzar tu meta`
                : '⚠️ La fecha límite ya pasó'
              }
            </div>
          )}

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">🚀 Prioridad</label>
            <div className="flex gap-3">
              {['baja', 'media', 'alta'].map(p => (
                <label key={p} className="flex items-center">
                  <input
                    type="radio"
                    name="prioridad"
                    value={p}
                    checked={formData.prioridad === p}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-500"
                  />
                  <span className={`ml-2 text-slate-700 capitalize ${
                    p === 'alta' ? 'text-red-600 font-medium' :
                    p === 'media' ? 'text-orange-600' : 'text-blue-600'
                  }`}>{p}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">💭 ¿Por qué es importante?</label>
            <input
              type="text"
              name="motivo"
              value={formData.motivo}
              onChange={handleChange}
              placeholder="¿Qué te motiva a lograr esta meta?"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-slate-800"
            />
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
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:shadow-lg font-bold transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear Meta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalMetaPersonal;
