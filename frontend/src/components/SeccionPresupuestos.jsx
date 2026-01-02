import React, { useState } from 'react';
import { formatearMoneda } from '../utils/constantes';

const SeccionPresupuestos = ({ presupuestos, onCrear, onActualizar, onEliminar }) => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [formData, setFormData] = useState({
    tipo: 'maxima_perdida',
    periodo: 'mensual',
    monto: '',
    grupo: 'personal',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCrear({
      ...formData,
      monto: parseFloat(formData.monto),
    });
    cerrarModal();
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setFormData({
      tipo: 'maxima_perdida',
      periodo: 'mensual',
      monto: '',
      grupo: 'personal',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Presupuestos</h2>
          <p className="text-gray-500">Define límites de gasto y metas de ahorro</p>
        </div>
        <button
          onClick={() => setMostrarModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Presupuesto
        </button>
      </div>

      {/* Lista de presupuestos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {presupuestos.map((p) => {
          const porcentaje = p.porcentajeUsado || 0;
          const excedido = porcentaje > 100;

          return (
            <div key={p._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {p.tipo === 'maxima_perdida' ? '🛑' : '🎯'}
                  </span>
                  <div>
                    <p className="font-bold text-gray-800">
                      {p.tipo === 'maxima_perdida' ? 'Máx. Pérdida' : 'Objetivo'}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">{p.periodo}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('¿Eliminar este presupuesto?')) onEliminar(p._id);
                  }}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className={excedido ? 'text-red-600 font-medium' : 'text-gray-600'}>
                    {formatearMoneda(p.gastado || 0)} gastado
                  </span>
                  <span className="text-gray-600">
                    de {formatearMoneda(p.monto)}
                  </span>
                </div>
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      excedido ? 'bg-red-500' : porcentaje > 80 ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(porcentaje, 100)}%` }}
                  />
                </div>
                <p className={`text-xs mt-1 ${excedido ? 'text-red-600' : 'text-gray-500'}`}>
                  {excedido 
                    ? `⚠️ Excedido por ${formatearMoneda((p.gastado || 0) - p.monto)}`
                    : `Disponible: ${formatearMoneda(p.monto - (p.gastado || 0))}`
                  }
                </p>
              </div>

              <div className="text-center">
                <p className={`text-2xl font-bold ${excedido ? 'text-red-600' : 'text-gray-800'}`}>
                  {porcentaje.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">usado</p>
              </div>
            </div>
          );
        })}
      </div>

      {presupuestos.length === 0 && (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
          <span className="text-5xl mb-4 block">🎯</span>
          <p className="text-gray-500">No hay presupuestos definidos</p>
          <p className="text-gray-400 text-sm mt-1">Define un límite de gasto o meta de ahorro</p>
        </div>
      )}

      {/* Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold">Nuevo Presupuesto</h3>
              <button onClick={cerrarModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tipo: 'maxima_perdida' })}
                    className={`p-3 rounded-xl border-2 transition ${
                      formData.tipo === 'maxima_perdida' ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    }`}
                  >
                    <span className="text-2xl block">🛑</span>
                    <span className="text-sm">Máx. Pérdida</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, tipo: 'objetivo' })}
                    className={`p-3 rounded-xl border-2 transition ${
                      formData.tipo === 'objetivo' ? 'border-green-500 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <span className="text-2xl block">🎯</span>
                    <span className="text-sm">Objetivo</span>
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
                <select
                  value={formData.periodo}
                  onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="diario">Diario</option>
                  <option value="mensual">Mensual</option>
                  <option value="anual">Anual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto *</label>
                <input
                  type="number"
                  value={formData.monto}
                  onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
                <select
                  value={formData.grupo}
                  onChange={(e) => setFormData({ ...formData, grupo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="personal">Personal</option>
                  <option value="familia">Familia</option>
                  <option value="trabajo">Trabajo</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Crear Presupuesto
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeccionPresupuestos;
