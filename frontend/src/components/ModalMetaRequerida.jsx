import { useState, useEffect } from 'react';
import { metasAPI, fusionCuentasAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function ModalMetaRequerida({ visible, onCerrar, usuarios, onCrear }) {
  const { usuario } = useAuth();
  const [usuariosFusionados, setUsuariosFusionados] = useState([]);
  const [loadingFusionados, setLoadingFusionados] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    montoObjetivo: '',
    fechaLimite: '',
    categoria: 'Meta de Ahorro',
    participantes: [usuario._id || usuario.id],
    prioridad: 'media',
    motivo: '',
  });

  // Normalizar IDs para comparación correcta
  const normalizarId = (id) => {
    if (typeof id === 'string') return id;
    if (id?._id) return id._id.toString();
    if (id?.toString) return id.toString();
    return String(id);
  };

  // Cargar usuarios fusionados cuando el modal se abre
  useEffect(() => {
    const cargarUsuariosFusionados = async () => {
      if (!visible) return;
      setLoadingFusionados(true);
      try {
        const fusionados = await fusionCuentasAPI.obtenerUsuariosFusionados();
        setUsuariosFusionados(fusionados.map(f => f.usuario));
      } catch (err) {
        console.error('Error al cargar usuarios fusionados:', err);
        setUsuariosFusionados(usuarios);
      } finally {
        setLoadingFusionados(false);
      }
    };
    cargarUsuariosFusionados();
  }, [visible]);

  const usuarioIdNormalizado = normalizarId(usuario._id || usuario.id);
  const participantesDisponibles = [
    usuario,
    ...usuariosFusionados.filter(u => {
      const uId = normalizarId(u._id || u.id);
      return uId !== usuarioIdNormalizado;
    })
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleParticipante = (usuarioId) => {
    setFormData(prev => ({
      ...prev,
      participantes: prev.participantes.includes(usuarioId)
        ? prev.participantes.filter(p => p !== usuarioId)
        : [...prev.participantes, usuarioId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.nombre || !formData.montoObjetivo || !formData.fechaLimite) {
        alert('Por favor completa los campos obligatorios');
        return;
      }

      const meta = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        montoObjetivo: parseFloat(formData.montoObjetivo),
        montoActual: 0,
        fechaLimite: formData.fechaLimite,
        categoria: formData.categoria,
        prioridad: formData.prioridad,
        participantes: formData.participantes,
        estado: 'activa',
        progreso: 0,
        motivo: formData.motivo,
        // El usuario ahora viene del token autenticado, no del body
      };

      if (metasAPI && metasAPI.crear) {
        await metasAPI.crear(meta);
      }
      
      onCrear?.();
      resetForm();
      onCerrar();
    } catch (error) {
      console.error('Error al crear meta:', error);
      alert('Error al crear meta');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      montoObjetivo: '',
      fechaLimite: '',
      categoria: 'Meta de Ahorro',
      participantes: [usuario.id],
      prioridad: 'media',
      motivo: '',
    });
  };

  const calcularDiasRestantes = () => {
    if (!formData.fechaLimite) return null;
    const hoy = new Date();
    const limite = new Date(formData.fechaLimite);
    const diff = limite - hoy;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (!visible) return null;

  const diasRestantes = calcularDiasRestantes();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-indigo-500 p-6 flex items-center justify-between text-white">
          <div>
            <h2 className="text-2xl font-bold">🏆 Meta Requerida</h2>
            <p className="text-sm opacity-90">Define tu objetivo de ahorro</p>
          </div>
          <button onClick={onCerrar} className="p-2 hover:bg-white/20 rounded-lg transition">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre de la Meta */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">📋 Nombre de la Meta</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Viaje a Europa, Auto nuevo, Fondo de emergencia"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-slate-800"
              required
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">📝 Descripción</label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              placeholder="Describe por qué esta meta es importante"
              rows="2"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-slate-800 resize-none"
            />
          </div>

          {/* Monto Objetivo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">💰 Monto Objetivo</label>
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
              <label className="block text-sm font-bold text-slate-800 mb-1">⏰ Fecha Límite</label>
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
              'bg-red-100 text-red-800'
            }`}>
              ⏳ {diasRestantes} días restantes para alcanzar tu meta
            </div>
          )}

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">🚀 Prioridad</label>
            <div className="space-y-2">
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
                  <span className="ml-2 text-slate-700 capitalize">{p}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">💭 Motivo/Propósito</label>
            <input
              type="text"
              name="motivo"
              value={formData.motivo}
              onChange={handleChange}
              placeholder="¿Por qué es importante esta meta?"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-slate-800"
            />
          </div>

          {/* Participantes */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">👥 Participantes (solo usuarios fusionados)</label>
            {loadingFusionados ? (
              <div className="text-center py-4 bg-slate-50 rounded-lg">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500 mx-auto"></div>
                <p className="text-sm text-slate-500 mt-2">Cargando usuarios...</p>
              </div>
            ) : usuariosFusionados.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                <span className="text-3xl">🔗</span>
                <p className="text-sm text-yellow-700 mt-2 font-medium">No tienes usuarios fusionados</p>
                <p className="text-xs text-yellow-600 mt-1">
                  Ve a "Fusión de Cuentas" para conectar con otros usuarios y poder crear metas compartidas
                </p>
              </div>
            ) : (
              <div className="space-y-2 bg-slate-50 p-3 rounded-lg max-h-36 overflow-y-auto">
                {participantesDisponibles.map(p => {
                  const pId = normalizarId(p._id || p.id);
                  return (
                    <label key={pId} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.participantes.includes(pId)}
                        onChange={() => toggleParticipante(pId)}
                        className="w-4 h-4 text-purple-500"
                      />
                      <span className="ml-2 text-slate-700 text-sm">{p.nombre}</span>
                    </label>
                  );
                })}
              </div>
            )}
            {usuariosFusionados.length > 0 && (
              <p className="text-xs text-slate-600 mt-2">
                {formData.participantes.length} participante(s) en esta meta
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg hover:shadow-lg font-bold transition"
            >
              Crear Meta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalMetaRequerida;
