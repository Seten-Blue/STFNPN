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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-96 overflow-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-6 sticky top-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{meta.nombre}</h2>
              <p className="text-sm opacity-90 mt-1">{meta.descripcion}</p>
            </div>
            <button
              onClick={onClose}
              className="text-xl font-bold hover:bg-white hover:text-purple-600 rounded-full p-2 transition"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-6">
          {/* Información de la meta */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Objetivo</p>
              <p className="text-xl font-bold text-blue-600">{formatearMoneda(meta.montoObjetivo)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Acumulado</p>
              <p className="text-xl font-bold text-green-600">{formatearMoneda(meta.montoActual)}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Tu aporte total</p>
              <p className="text-xl font-bold text-purple-600">{formatearMoneda(totalAportesUsuario)}</p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Progreso</p>
              <p className="text-xl font-bold text-orange-600">{meta.progreso?.toFixed(1)}%</p>
            </div>
          </div>

          {/* Barra de progreso */}
          <div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full transition-all duration-500"
                style={{ width: `${Math.min(meta.progreso, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Mis aportes */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">📊 Mis aportes ({aportesUsuario.length})</h3>
            
            {aportesUsuario.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No has hecho aportes aún</p>
            ) : (
              <div className="space-y-2">
                {aportesUsuario.map(aporte => (
                  <div
                    key={aporte._id}
                    className="flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{formatearMoneda(aporte.monto)}</p>
                      <p className="text-xs text-gray-500">{formatearFecha(aporte.fecha)}</p>
                    </div>
                    <button
                      onClick={() => handleEliminarAporte(aporte._id)}
                      disabled={eliminando === aporte._id}
                      className="ml-2 px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg transition disabled:opacity-50"
                    >
                      {eliminando === aporte._id ? '...' : '🗑️'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Todos los aportes */}
          {meta.aportes.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3">💰 Todos los aportes ({meta.aportes.length})</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {meta.aportes.map(aporte => (
                  <div key={aporte._id} className="bg-gray-50 p-3 rounded-lg text-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {aporte.usuarioId.nombre || 'Usuario'}
                        </p>
                        <p className="text-gray-500">{formatearFecha(aporte.fecha)}</p>
                      </div>
                      <p className="font-bold text-gray-800">{formatearMoneda(aporte.monto)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalDetallesMeta;
