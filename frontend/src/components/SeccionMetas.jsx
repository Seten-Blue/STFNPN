import React, { useState, useEffect } from 'react';
import { metasAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatearMoneda } from '../utils/constantes';
import ModalDetallesMeta from './ModalDetallesMeta';

function SeccionMetas() {
  const { usuario } = useAuth();
  const [metas, setMetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aportacionModal, setAportacionModal] = useState({ visible: false, metaId: null, monto: '' });
  const [detallesModal, setDetallesModal] = useState({ visible: false, metaId: null });

  useEffect(() => {
    if (usuario) {
      cargarMetas();
    }
  }, [usuario]);

  const cargarMetas = async () => {
    setLoading(true);
    try {
      // Obtener todas las metas del usuario (como creador)
      const data = await metasAPI.obtener({ usuarioId: usuario._id || usuario.id });
      setMetas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar metas:', error);
      setMetas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarAportacion = async (metaId) => {
    try {
      const monto = parseFloat(aportacionModal.monto);
      console.log('📊 Intentando agregar aportación:', { metaId, monto, usuarioId: usuario._id || usuario.id });
      
      if (!monto || isNaN(monto) || monto <= 0) {
        alert('Ingresa un monto válido');
        return;
      }

      const resultado = await metasAPI.agregarAportacion(metaId, {
        usuarioId: usuario._id || usuario.id,
        monto: monto
      });
      
      console.log('✅ Aportación exitosa:', resultado);
      cargarMetas();
      setAportacionModal({ visible: false, metaId: null, monto: '' });
      alert('✅ Aportación registrada correctamente');
    } catch (error) {
      console.error('❌ Error al agregar aportación:', error);
      alert('Error al agregar aportación: ' + (error.message || error));
    }
  };

  const handleEliminar = async (metaId) => {
    if (window.confirm('¿Estás seguro de eliminar esta meta?')) {
      try {
        await metasAPI.eliminar(metaId);
        cargarMetas();
        alert('✅ Meta eliminada');
      } catch (error) {
        console.error('Error al eliminar meta:', error);
        alert('Error al eliminar meta');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando metas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">🎯 Mis Metas</h2>
      </div>

      {metas.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500 text-lg">No tienes metas creadas aún</p>
          <p className="text-gray-400 text-sm mt-2">Crea una meta usando el botón "Meta" en el header</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {metas.map(meta => (
            <div key={meta._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{meta.nombre}</h3>
                  <p className="text-sm text-gray-500">{meta.descripcion}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEliminar(meta._id)}
                    className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Información de la Meta */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Objetivo</span>
                  <span className="font-bold text-gray-800">{formatearMoneda(meta.montoObjetivo)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Acumulado</span>
                  <span className="font-bold text-green-600">{formatearMoneda(meta.montoActual || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progreso</span>
                  <span className="font-bold text-purple-600">{(meta.progreso || 0).toFixed(1)}%</span>
                </div>
              </div>

              {/* Barra de Progreso */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full transition-all duration-500"
                    style={{ width: `${Math.min(meta.progreso || 0, 100)}%` }}
                  />
                </div>
              </div>

              {/* Participantes */}
              {meta.participantes && (
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-2">
                    👥 Participantes ({Array.isArray(meta.participantes) ? meta.participantes.length : Object.keys(meta.participantes).length})
                  </h4>
                  <div className="space-y-1 text-xs">
                    {Array.isArray(meta.participantes) ? (
                      // Si es array (con objeto {usuarioId, aportacion})
                      meta.participantes.map((p, idx) => (
                        <div key={idx} className="flex justify-between text-gray-600">
                          <span>{p.nombre || `Usuario ${p.usuarioId?.substring(0, 8)}`}</span>
                          <span className="font-bold text-purple-600">{formatearMoneda(p.aportacion || 0)}</span>
                        </div>
                      ))
                    ) : (
                      // Si es objeto Map {usuarioId: monto}
                      Object.entries(meta.participantes).map(([usuarioId, monto], idx) => (
                        <div key={idx} className="flex justify-between text-gray-600">
                          <span className="truncate">Usuario: {usuarioId.substring(0, 8)}...</span>
                          <span className="font-bold text-purple-600">{formatearMoneda(monto || 0)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Estado y Fecha */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      meta.estado === 'activa' ? 'bg-green-100 text-green-800' :
                      meta.estado === 'pausada' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {meta.estado || 'activa'}
                    </span>
                    {meta.prioridad && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        meta.prioridad === 'alta' ? 'bg-red-100 text-red-800' :
                        meta.prioridad === 'media' ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {meta.prioridad}
                      </span>
                    )}
                  </div>
                  {meta.fechaLimite && (
                    <span className="text-xs text-gray-500">
                      📅 {new Date(meta.fechaLimite).toLocaleDateString('es-ES')}
                    </span>
                  )}
                </div>

                {/* Botones de Aportación y Detalles */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setAportacionModal({ visible: true, metaId: meta._id, monto: '' })}
                    className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    💰 Aporte
                  </button>
                  <button
                    onClick={() => setDetallesModal({ visible: true, metaId: meta._id })}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    📋 Detalles
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Aportación */}
      {aportacionModal.visible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-2xl w-96 max-h-96 overflow-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Hacer Aportación</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Monto a Aportar</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={aportacionModal.monto}
                  onChange={(e) => setAportacionModal({
                    ...aportacionModal,
                    monto: e.target.value
                  })}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-gray-800"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setAportacionModal({ ...aportacionModal, visible: false })}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleAgregarAportacion(aportacionModal.metaId)}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition"
                >
                  Aceptar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles */}
      <ModalDetallesMeta
        metaId={detallesModal.metaId}
        visible={detallesModal.visible}
        onClose={() => setDetallesModal({ visible: false, metaId: null })}
        onAporteEliminado={() => cargarMetas()}
      />
    </div>
  );
}

export default SeccionMetas;
