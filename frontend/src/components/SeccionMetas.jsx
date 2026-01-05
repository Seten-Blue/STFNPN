import React, { useState, useEffect } from 'react';
import { metasAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatearMoneda } from '../utils/constantes';

function SeccionMetas() {
  const { usuario } = useAuth();
  const [metas, setMetas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (usuario) {
      cargarMetas();
    }
  }, [usuario]);

  const cargarMetas = async () => {
    setLoading(true);
    try {
      const data = await metasAPI.obtener({ usuarioId: usuario._id || usuario.id });
      setMetas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar metas:', error);
      setMetas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleActualizar = async (metaId, nuevosDatos) => {
    try {
      await metasAPI.actualizar(metaId, nuevosDatos);
      cargarMetas();
      alert('✅ Meta actualizada');
    } catch (error) {
      console.error('Error al actualizar meta:', error);
      alert('Error al actualizar meta');
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
              {meta.participantes && meta.participantes.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-gray-700 mb-2">👥 Participantes ({meta.participantes.length})</h4>
                  <div className="space-y-1 text-xs">
                    {meta.participantes.map((p, idx) => (
                      <div key={idx} className="flex justify-between text-gray-600">
                        <span>{p.nombre || 'Usuario desconocido'}</span>
                        <span className="text-gray-400">({formatearMoneda(p.aportacion || 0)})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Estado y Fecha */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SeccionMetas;
