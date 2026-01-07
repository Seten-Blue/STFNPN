import React, { useState, useEffect } from 'react';
import { ahorroCompartidoAPI, cuentasAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatearMoneda } from '../utils/constantes';
import ModalDetallesAhorro from './ModalDetallesAhorro';
import ModalAhorroPersonal from './ModalAhorroPersonal';

function SeccionAhorrosCompartidos() {
  const { usuario } = useAuth();
  const [ahorros, setAhorros] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aportacionModal, setAportacionModal] = useState({
    visible: false,
    ahorroId: null,
    monto: ''
  });
  const [detallesModal, setDetallesModal] = useState({ visible: false, ahorroId: null });
  const [modalAhorroPersonal, setModalAhorroPersonal] = useState(false);

  useEffect(() => {
    if (usuario) {
      cargarAhorros();
      cargarCuentas();
    }
  }, [usuario]);

  const cargarCuentas = async () => {
    try {
      const data = await cuentasAPI.obtener({ usuarioId: usuario._id || usuario.id });
      setCuentas(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar cuentas:', error);
      setCuentas([]);
    }
  };

  const cargarAhorros = async () => {
    setLoading(true);
    try {
      const data = await ahorroCompartidoAPI.obtener({ usuarioId: usuario._id || usuario.id });
      setAhorros(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar ahorros:', error);
      setAhorros([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarAportacion = async (ahorroId) => {
    const monto = parseFloat(aportacionModal.monto);
    console.log('💰 Intentando agregar aportación:', { ahorroId, monto, usuarioId: usuario._id || usuario.id });
    
    if (!monto || isNaN(monto) || monto <= 0) {
      alert('Ingresa un monto válido');
      return;
    }

    try {
      const resultado = await ahorroCompartidoAPI.agregarAportacion(ahorroId, {
        usuarioId: usuario._id || usuario.id,
        monto: monto
      });
      console.log('✅ Aportación exitosa:', resultado);
      setAportacionModal({ visible: false, ahorroId: null, monto: '' });
      cargarAhorros();
      alert('✅ Aportación registrada exitosamente');
    } catch (error) {
      console.error('❌ Error al agregar aportación:', error);
      alert('Error al registrar aportación: ' + (error.message || error));
    }
  };

  const handleEliminar = async (ahorroId) => {
    if (window.confirm('¿Estás seguro de eliminar este ahorro?')) {
      try {
        await ahorroCompartidoAPI.eliminar(ahorroId);
        cargarAhorros();
        alert('✅ Ahorro eliminado');
      } catch (error) {
        console.error('Error al eliminar ahorro:', error);
        alert('Error al eliminar ahorro');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Cargando ahorros compartidos...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <span className="text-3xl">💹</span>
          <h2 className="text-2xl font-bold text-gray-800">Ahorros Compartidos</h2>
        </div>
        <button
          onClick={() => setModalAhorroPersonal(true)}
          className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:shadow-lg font-medium transition flex items-center gap-2"
        >
          <span>➕</span>
          <span>Nuevo Ahorro Personal</span>
        </button>
      </div>

      {ahorros.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <p className="text-gray-500 text-lg">No tienes ahorros compartidos aún</p>
          <p className="text-gray-400 text-sm mt-2">Crea un ahorro usando el botón "Ahorro Compartido" en el header</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {ahorros.map(ahorro => (
            <div key={ahorro._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800">{ahorro.nombre}</h3>
                  <p className="text-sm text-gray-500">{ahorro.descripcion}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEliminar(ahorro._id)}
                    className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {/* Información del Ahorro */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Objetivo</span>
                  <span className="font-bold text-gray-800">{formatearMoneda(ahorro.montoObjetivo)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ahorrado</span>
                  <span className="font-bold text-teal-600">{formatearMoneda(ahorro.montoActual || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progreso</span>
                  <span className="font-bold text-teal-600">{(ahorro.progreso || 0).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Falta por ahorrar</span>
                  <span className="font-bold text-orange-600">{formatearMoneda(Math.max(0, ahorro.montoObjetivo - (ahorro.montoActual || 0)))}</span>
                </div>
              </div>

              {/* Barra de Progreso */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full transition-all duration-500"
                    style={{ width: `${Math.min(ahorro.progreso || 0, 100)}%` }}
                  />
                </div>
              </div>

              {/* Participantes y Estado */}
              {ahorro.participantes && (
                <div className="mb-4 bg-teal-50 p-3 rounded-lg border border-teal-100">
                  <h4 className="text-sm font-bold text-teal-700 mb-2">
                    👥 Participantes ({Object.keys(ahorro.participantes).length})
                  </h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(ahorro.participantes).map(([usuarioId, monto], idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-white rounded border border-teal-100">
                        <span className="text-gray-700">Participante {idx + 1}</span>
                        <span className="font-bold text-teal-600">{formatearMoneda(monto)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Estado */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    ahorro.estado === 'activo' ? 'bg-green-100 text-green-800' :
                    ahorro.estado === 'pausado' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {ahorro.estado || 'activo'}
                  </span>
                  {ahorro.createdAt && (
                    <span className="text-xs text-gray-500">
                      📅 {new Date(ahorro.createdAt).toLocaleDateString('es-ES')}
                    </span>
                  )}
                </div>

                {/* Botones de Aportación y Detalles */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setAportacionModal({ visible: true, ahorroId: ahorro._id, monto: '' })}
                    className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition"
                  >
                    💰 Aporte
                  </button>
                  <button
                    onClick={() => setDetallesModal({ visible: true, ahorroId: ahorro._id })}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-2 px-4 rounded-lg transition"
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6 text-white rounded-t-2xl">
              <h3 className="text-2xl font-bold">💰 Hacer Aportación</h3>
              <p className="text-teal-100 text-sm mt-1">Contribuye al ahorro compartido</p>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-6">
              <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                <p className="text-sm text-teal-600 font-medium">Ahorro: {
                  ahorros.find(a => a._id === aportacionModal.ahorroId)?.nombre || 'Cargando...'
                }</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Monto a Ahorrar *</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500 font-bold">$</span>
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
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-gray-800 font-semibold"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Ingresa el monto que deseas ahorrar</p>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setAportacionModal({ ...aportacionModal, visible: false })}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleAgregarAportacion(aportacionModal.ahorroId)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold rounded-lg hover:from-teal-700 hover:to-cyan-700 transition"
                >
                  Confirmar Aporte
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles */}
      <ModalDetallesAhorro
        ahorroId={detallesModal.ahorroId}
        visible={detallesModal.visible}
        onClose={() => setDetallesModal({ visible: false, ahorroId: null })}
        onAporteEliminado={() => cargarAhorros()}
      />

      {/* Modal de Ahorro Personal */}
      <ModalAhorroPersonal
        visible={modalAhorroPersonal}
        onCerrar={() => setModalAhorroPersonal(false)}
        cuentas={cuentas}
        onCrear={() => cargarAhorros()}
      />
    </div>
  );
}

export default SeccionAhorrosCompartidos;
