import { useState } from 'react';
import { ahorroCompartidoAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function ModalAhorroCompartido({ visible, onCerrar, cuentas, usuarios, onCrear }) {
  const { usuario } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    montoObjetivo: '',
    montoActual: 0,
    cuentaDestino: cuentas[0]?._id || '',
    participantes: {},
    estado: 'activo',
    motivo: '',
    fechaCreacion: new Date().toISOString().split('T')[0],
  });

  // Normalizar IDs para comparación correcta
  const normalizarId = (id) => {
    if (typeof id === 'string') return id;
    if (id?._id) return id._id.toString();
    if (id?.toString) return id.toString();
    return String(id);
  };

  const usuarioIdNormalizado = normalizarId(usuario._id || usuario.id);
  const participantesDisponibles = [
    usuario,
    ...usuarios.filter(u => {
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
      participantes: {
        ...prev.participantes,
        [usuarioId]: prev.participantes[usuarioId] ? 0 : 0
      }
    }));
  };

  const handleMontoParticipante = (usuarioId, nuevoMonto) => {
    setFormData(prev => ({
      ...prev,
      participantes: {
        ...prev.participantes,
        [usuarioId]: parseFloat(nuevoMonto) || 0
      }
    }));
  };

  const calcularTotalAportaciones = () => {
    return Object.values(formData.participantes).reduce((sum, m) => sum + m, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.nombre || !formData.montoObjetivo) {
        alert('Por favor completa los campos obligatorios');
        return;
      }

      if (!formData.cuentaDestino) {
        alert('Selecciona una cuenta destino');
        return;
      }

      const participantesActivos = Object.entries(formData.participantes)
        .filter(([_, monto]) => monto > 0)
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});

      if (Object.keys(participantesActivos).length === 0) {
        alert('Debe haber al menos un participante con aportación');
        return;
      }

      const ahorroCompartido = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        montoObjetivo: parseFloat(formData.montoObjetivo),
        montoActual: calcularTotalAportaciones(),
        cuentaDestino: formData.cuentaDestino,
        participantes: participantesActivos,
        estado: formData.estado,
        motivo: formData.motivo,
        fechaCreacion: formData.fechaCreacion,
        progreso: (calcularTotalAportaciones() / parseFloat(formData.montoObjetivo)) * 100,
        usuario: usuarioIdNormalizado,
      };

      if (ahorroCompartidoAPI && ahorroCompartidoAPI.crear) {
        await ahorroCompartidoAPI.crear(ahorroCompartido);
      }
      
      onCrear?.();
      resetForm();
      onCerrar();
    } catch (error) {
      console.error('Error al crear ahorro compartido:', error);
      alert('Error al crear ahorro compartido');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      montoObjetivo: '',
      montoActual: 0,
      cuentaDestino: cuentas[0]?._id || '',
      participantes: {},
      estado: 'activo',
      motivo: '',
      fechaCreacion: new Date().toISOString().split('T')[0],
    });
  };

  const calcularProgreso = () => {
    const objetivo = parseFloat(formData.montoObjetivo) || 1;
    const aportado = calcularTotalAportaciones();
    return Math.min(100, (aportado / objetivo) * 100);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-teal-500 to-cyan-500 p-6 flex items-center justify-between text-white">
          <div>
            <h2 className="text-2xl font-bold">🏦 Ahorro Compartido</h2>
            <p className="text-sm opacity-90">Fondo común para ahorros conjuntos</p>
          </div>
          <button onClick={onCerrar} className="p-2 hover:bg-white/20 rounded-lg transition">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Nombre del Fondo */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">📌 Nombre del Fondo</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Fondo Vacaciones, Proyecto Casa, Fondo de Emergencia"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-800"
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
              placeholder="¿Para qué es este fondo compartido?"
              rows="2"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-800 resize-none"
            />
          </div>

          {/* Monto Objetivo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">🎯 Monto Objetivo</label>
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
              <label className="block text-sm font-bold text-slate-800 mb-1">💾 Cuenta Destino</label>
              <select
                name="cuentaDestino"
                value={formData.cuentaDestino}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-800"
              >
                <option value="">Seleccionar cuenta</option>
                {cuentas.map(c => (
                  <option key={c._id} value={c._id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Barra de Progreso */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-slate-800">📊 Progreso del Ahorro</label>
              <span className="text-sm font-bold text-teal-600">{calcularProgreso().toFixed(1)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full transition-all duration-500"
                style={{ width: `${calcularProgreso()}%` }}
              />
            </div>
            <p className="text-xs text-slate-600 mt-2">
              ${calcularTotalAportaciones().toFixed(2)} de ${formData.montoObjetivo || 0} ahorrados
            </p>
          </div>

          {/* Motivo */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">💭 Propósito del Fondo</label>
            <input
              type="text"
              name="motivo"
              value={formData.motivo}
              onChange={handleChange}
              placeholder="¿Cuál es el propósito principal?"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 text-slate-800"
            />
          </div>

          {/* Participantes y Aportaciones */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">👥 Participantes y Aportaciones</label>
            <div className="space-y-2 bg-slate-50 p-3 rounded-lg max-h-48 overflow-y-auto">
              {participantesDisponibles.map(p => {
                const pId = normalizarId(p._id || p.id);
                return (
                  <div key={pId} className="flex items-center justify-between p-2 bg-white rounded hover:bg-slate-100">
                    <label className="flex items-center flex-1">
                      <input
                        type="checkbox"
                        checked={!!formData.participantes[pId] || formData.participantes[pId] === 0}
                        onChange={() => toggleParticipante(pId)}
                        className="w-4 h-4 text-teal-500"
                      />
                      <span className="ml-2 text-slate-700 text-sm">{p.nombre}</span>
                    </label>
                    {(formData.participantes[pId] !== undefined) && (
                      <input
                        type="number"
                        value={formData.participantes[pId]}
                        onChange={(e) => handleMontoParticipante(pId, e.target.value)}
                        step="0.01"
                        placeholder="0.00"
                        className="w-24 px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">📌 Estado</label>
            <div className="space-y-2">
              {['activo', 'pausado', 'completado'].map(s => (
                <label key={s} className="flex items-center">
                  <input
                    type="radio"
                    name="estado"
                    value={s}
                    checked={formData.estado === s}
                    onChange={handleChange}
                    className="w-4 h-4 text-teal-500"
                  />
                  <span className="ml-2 text-slate-700 capitalize">{s}</span>
                </label>
              ))}
            </div>
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
              className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:shadow-lg font-bold transition"
            >
              Crear Fondo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalAhorroCompartido;
