import React, { useState, useEffect } from 'react';
import { ahorroCompartidoAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatearMoneda, formatearFecha } from '../utils/constantes';

function ModalDetallesAhorro({ ahorroId, visible, onClose, onAporteEliminado }) {
  const { usuario } = useAuth();
  const [ahorro, setAhorro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eliminando, setEliminando] = useState(null);

  useEffect(() => {
    if (visible && ahorroId) {
      cargarDetalles();
    }
  }, [visible, ahorroId]);

  const cargarDetalles = async () => {
    try {
      setLoading(true);
      const data = await ahorroCompartidoAPI.obtenerDetalles(ahorroId);
      setAhorro(data);
    } catch (error) {
      console.error('Error al cargar detalles de ahorro:', error);
      alert('Error al cargar los detalles');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarAporte = async (aporteId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este aporte?')) return;

    try {
      setEliminando(aporteId);
      await ahorroCompartidoAPI.eliminarAporte(ahorroId, aporteId, usuario._id || usuario.id);
      
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

  if (!ahorro) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 shadow-2xl">
          <p>Ahorro no encontrado</p>
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
  const aportesUsuario = ahorro.aportes.filter(a => 
    a.usuarioId._id === (usuario._id || usuario.id) || 
    a.usuarioId === (usuario._id || usuario.id)
  );

  const totalAportesUsuario = aportesUsuario.reduce((sum, a) => sum + a.monto, 0);
  const faltante = Math.max(0, ahorro.montoObjetivo - ahorro.montoActual);
  const numParticipantes = ahorro.aportes.length > 0 ? [...new Set(ahorro.aportes.map(a => a.usuarioId._id || a.usuarioId))].length : 0;
  const aporteProm = ahorro.montoActual / Math.max(1, numParticipantes);
  const tuContribucion = (totalAportesUsuario / ahorro.montoActual * 100).toFixed(1);

  // Mensaje dinámico según progreso
  const getMensajeProgreso = () => {
    if (ahorro.progreso >= 100) return "🎉 ¡Lo lograron! Objetivo alcanzado. Excelente gestión del ahorro.";
    if (ahorro.progreso >= 75) return "🚀 Casi listos! Solo falta un último empujón para completar el ahorro.";
    if (ahorro.progreso >= 50) return "📈 Vamos muy bien! La mitad del objetivo ya está asegurada.";
    if (ahorro.progreso >= 25) return "💪 Buen comienzo! Sigue ahorrando de manera constante.";
    return "🌱 Acaban de comenzar. Cada depósito es un paso hacia el objetivo.";
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 to-cyan-600 text-white p-8 sticky top-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{ahorro.nombre}</h1>
              <p className="text-teal-100 text-sm">{ahorro.descripcion}</p>
              <p className="text-teal-200 text-sm mt-3">{getMensajeProgreso()}</p>
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
              <p className="text-2xl font-bold text-blue-700 mt-2">{formatearMoneda(ahorro.montoObjetivo)}</p>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 p-5 rounded-xl border border-teal-200">
              <p className="text-xs font-bold text-teal-600 uppercase tracking-wide">Ahorrado</p>
              <p className="text-2xl font-bold text-teal-700 mt-2">{formatearMoneda(ahorro.montoActual)}</p>
            </div>
            <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-5 rounded-xl border border-cyan-200">
              <p className="text-xs font-bold text-cyan-600 uppercase tracking-wide">Tu Aporte</p>
              <p className="text-2xl font-bold text-cyan-700 mt-2">{formatearMoneda(totalAportesUsuario)}</p>
              <p className="text-xs text-cyan-600 mt-1">{tuContribucion}% del total</p>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-xl border border-orange-200">
              <p className="text-xs font-bold text-orange-600 uppercase tracking-wide">Falta</p>
              <p className="text-2xl font-bold text-orange-700 mt-2">{formatearMoneda(faltante)}</p>
              <p className="text-xs text-orange-600 mt-1">{(100 - ahorro.progreso).toFixed(1)}%</p>
            </div>
          </div>

          {/* Barra de progreso grande */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-gray-800">Progreso General</p>
              <p className="text-2xl font-bold text-teal-600">{ahorro.progreso?.toFixed(1)}%</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden shadow-sm">
              <div
                className="bg-gradient-to-r from-teal-500 to-cyan-600 h-full transition-all duration-700 flex items-center justify-center"
                style={{ width: `${Math.min(ahorro.progreso, 100)}%` }}
              >
                {ahorro.progreso > 10 && <span className="text-white text-xs font-bold">{ahorro.progreso?.toFixed(1)}%</span>}
              </div>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase">Ahorradores</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{numParticipantes}</p>
              <p className="text-xs text-gray-500 mt-1">personas aportando</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase">Aporte Promedio</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{formatearMoneda(aporteProm)}</p>
              <p className="text-xs text-gray-500 mt-1">por persona</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 font-semibold uppercase">Total Depósitos</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{ahorro.aportes.length}</p>
              <p className="text-xs text-gray-500 mt-1">movimientos</p>
            </div>
          </div>

          {/* Mis aportes */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">📊 Tus Depósitos</h3>
              <span className="text-sm bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full font-semibold">{aportesUsuario.length}</span>
            </div>
            
            {aportesUsuario.length === 0 ? (
              <div className="bg-cyan-50 border border-cyan-200 p-6 rounded-xl text-center">
                <p className="text-cyan-700 font-medium">Aún no has realizado depósitos</p>
                <p className="text-cyan-600 text-sm mt-1">¡Comienza a ahorrar! Todo aporte cuenta para alcanzar la meta.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {aportesUsuario.map(aporte => (
                  <div
                    key={aporte._id}
                    className="flex items-center justify-between bg-gradient-to-r from-cyan-50 to-teal-50 p-5 rounded-xl border border-cyan-200 hover:shadow-md transition"
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
          {ahorro.aportes.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800">💰 Todos los Depósitos ({ahorro.aportes.length})</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {ahorro.aportes.map((aporte, idx) => (
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
                        <p className="text-xs text-gray-600 mt-1">{((aporte.monto / ahorro.montoActual) * 100).toFixed(1)}% del total</p>
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
            className="w-full px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold rounded-xl hover:from-teal-700 hover:to-cyan-700 transition text-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalDetallesAhorro;
