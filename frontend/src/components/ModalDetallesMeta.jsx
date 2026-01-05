import React, { useState, useEffect } from 'react';
import { metasAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatearMoneda, formatearFecha } from '../utils/constantes';

function ModalDetallesMeta({ metaId, visible, onClose, onAporteEliminado }) {
  const { usuario } = useAuth();
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eliminando, setEliminando] = useState(null);

  useEffect(() => {
    if (visible && metaId) {
      cargarDetalles();
    }
  }, [visible, metaId]);

  const cargarDetalles = async () => {
    try {
      setLoading(true);
      const data = await metasAPI.obtenerDetalles(metaId);
      setMeta(data);
    } catch (error) {
      console.error('Error al cargar detalles de meta:', error);
      alert('Error al cargar los detalles');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarAporte = async (aporteId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este aporte?')) return;

    try {
      setEliminando(aporteId);
      await metasAPI.eliminarAporte(metaId, aporteId, usuario._id || usuario.id);
      
      console.log('✅ Aporte eliminado');
      alert('Aporte eliminado correctamente');
      
      // Recargar detalles
      await cargarDetalles();
      onAporteEliminado && onAporteEliminado();
    } catch (error) {
      console.error('Error al eliminar aporte:', error);
      alert('Error: ' + error.message);
    } finally {
      setEliminando(null);
    }
  };

  if (!visible) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 shadow-2xl">
          <p>Cargando detalles...</p>
        </div>
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 shadow-2xl">
          <p>Meta no encontrada</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  // Obtener los aportes del usuario actual
  const aportesUsuario = meta.aportes.filter(a => 
    a.usuarioId._id === (usuario._id || usuario.id) || 
    a.usuarioId === (usuario._id || usuario.id)
  );

  const totalAportesUsuario = aportesUsuario.reduce((sum, a) => sum + a.monto, 0);
  const faltante = Math.max(0, meta.montoObjetivo - meta.montoActual);
  const numParticipantes = meta.aportes.length > 0 ? [...new Set(meta.aportes.map(a => a.usuarioId._id || a.usuarioId))].length : 0;
  const aporteProm = meta.montoActual / Math.max(1, numParticipantes);
  const tuContribucion = (totalAportesUsuario / meta.montoActual * 100).toFixed(1);

  // Mensaje dinámico según progreso
  const getMensajeProgreso = () => {
    if (meta.progreso >= 100) return "🎉 ¡Meta completada! Excelente trabajo de todos.";
    if (meta.progreso >= 75) return "🚀 Casi lo logran! Solo falta un último empujón.";
    if (meta.progreso >= 50) return "📈 Vamos por buen camino. La mitad ya está hecha.";
    if (meta.progreso >= 25) return "💪 Buen inicio! Sigue así para alcanzar la meta.";
    return "🌱 Acaban de empezar. Cada aporte cuenta.";
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 sticky top-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{meta.nombre}</h1>
              <p className="text-indigo-100 text-sm">{meta.descripcion}</p>
              <p className="text-indigo-200 text-sm mt-3">{getMensajeProgreso()}</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-3 transition text-2xl"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-8 space-y-8">
          {/* Tarjetas principales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wide">Objetivo</p>
              <p className="text-2xl font-bold text-blue-700 mt-2">{formatearMoneda(meta.montoObjetivo)}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-xl border border-green-200">
              <p className="text-xs font-bold text-green-600 uppercase tracking-wide">Acumulado</p>
              <p className="text-2xl font-bold text-green-700 mt-2">{formatearMoneda(meta.montoActual)}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200">
              <p className="text-xs font-bold text-purple-600 uppercase tracking-wide">Tu Aporte</p>
              <p className="text-2xl font-bold text-purple-700 mt-2">{formatearMoneda(totalAportesUsuario)}</p>
              <p className="text-xs text-purple-600 mt-1">{tuContribucion}% del total</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200">
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wide">Falta</p>
              <p className="text-2xl font-bold text-orange-700 mt-2">{formatearMoneda(faltante)}</p>
              <p className="text-xs text-orange-600 mt-1">{(100 - meta.progreso).toFixed(1)}%</p>
            </div>
          </div>

          {/* Barra de progreso grande */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-gray-800">Progreso General</p>
              <p className="text-2xl font-bold text-purple-600">{meta.progreso?.toFixed(1)}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden shadow-sm">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full transition-all duration-700 flex items-center justify-center"
                style={{ width: `${Math.min(meta.progreso, 100)}%` }}
              >
                {meta.progreso > 10 && <span className="text-white text-xs font-bold">{meta.progreso?.toFixed(1)}%</span>}
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase">Participantes</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{numParticipantes}</p>
              <p className="text-xs text-gray-500 mt-1">colaborando</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase">Aporte Promedio</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{formatearMoneda(aporteProm)}</p>
              <p className="text-xs text-gray-500 mt-1">por participante</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase">Total Aportes</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{meta.aportes.length}</p>
              <p className="text-xs text-gray-500 mt-1">movimientos</p>
            </div>
          </div>

          {/* Mis aportes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">📊 Tus Aportes</h3>
              <span className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">{aportesUsuario.length}</span>
            </div>
            
            {aportesUsuario.length === 0 ? (
              <div className="bg-purple-50 border border-purple-200 p-6 rounded-xl text-center">
                <p className="text-purple-700 font-medium">Aún no has hecho aportes</p>
                <p className="text-purple-600 text-sm mt-1">¡Sé el primero en contribuir a esta meta!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {aportesUsuario.map(aporte => (
                  <div
                    key={aporte._id}
                    className="flex items-center justify-between bg-gradient-to-r from-purple-50 to-indigo-50 p-5 rounded-xl border border-purple-200 hover:shadow-md transition"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-lg">{formatearMoneda(aporte.monto)}</p>
                      <p className="text-sm text-gray-600 mt-1">📅 {formatearFecha(aporte.fecha)}</p>
                    </div>
                    <button
                      onClick={() => handleEliminarAporte(aporte._id)}
                      disabled={eliminando === aporte._id}
                      className="ml-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50 font-medium"
                    >
                      {eliminando === aporte._id ? '...' : '🗑️ Eliminar'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Todos los aportes */}
          {meta.aportes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">💰 Todos los Aportes ({meta.aportes.length})</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {meta.aportes.map((aporte, idx) => (
                  <div key={aporte._id} className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {idx + 1}. {aporte.usuarioId.nombre || 'Usuario'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">📅 {formatearFecha(aporte.fecha)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-lg">{formatearMoneda(aporte.monto)}</p>
                        <p className="text-xs text-gray-600 mt-1">{((aporte.monto / meta.montoActual) * 100).toFixed(1)}% del total</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-6 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition text-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalDetallesMeta;
