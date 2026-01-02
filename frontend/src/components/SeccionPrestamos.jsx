import React, { useState } from 'react';
import { formatearMoneda, formatearFecha } from '../utils/constantes';

const SeccionPrestamos = ({ prestamos, cuentas, onCrear, onActualizar, onRegistrarPago, onEliminar, sujetoActivo = 'Sujeto 1' }) => {
  // Filtrar préstamos y cuentas por sujeto activo
  const prestamosDelSujeto = prestamos.filter(p => p.sujeto === sujetoActivo);
  const cuentasDelSujeto = cuentas.filter(c => c.sujeto === sujetoActivo);

  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    montoTotal: '',
    montoDeuda: '',
    fechaInicio: new Date().toISOString().split('T')[0],
    prestamista: '',
    totalCuotas: '',
    diaPago: 5,
    cuentaAsociada: '',
    grupo: 'personal',
    sujeto: sujetoActivo,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const datos = {
      ...formData,
      montoTotal: parseFloat(formData.montoTotal),
      montoDeuda: parseFloat(formData.montoDeuda) || parseFloat(formData.montoTotal),
      totalCuotas: parseInt(formData.totalCuotas),
      diaPago: parseInt(formData.diaPago),
    };

    if (editando) {
      onActualizar(editando._id, datos);
    } else {
      onCrear(datos);
    }
    cerrarModal();
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setEditando(null);
    setFormData({
      nombre: '',
      descripcion: '',
      montoTotal: '',
      montoDeuda: '',
      fechaInicio: new Date().toISOString().split('T')[0],
      prestamista: '',
      totalCuotas: '',
      diaPago: 5,
      cuentaAsociada: '',
      grupo: 'personal',
      sujeto: sujetoActivo,
    });
  };

  const handlePago = (prestamo) => {
    const nuevasCuotas = prestamo.cuotasPagadas + 1;
    if (window.confirm(`¿Registrar pago de cuota ${nuevasCuotas}/${prestamo.totalCuotas}?`)) {
      onRegistrarPago(prestamo._id, nuevasCuotas);
    }
  };

  const totalDeuda = prestamosDelSujeto.reduce((sum, p) => sum + (p.montoRestante || 0), 0);
  const prestamosActivos = prestamosDelSujeto.filter(p => p.estado === 'activo').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Préstamos - {sujetoActivo}</h2>
          <p className="text-gray-500">Administra tus créditos y deudas</p>
        </div>
        <button
          onClick={() => setMostrarModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Préstamo
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Deuda Total</p>
          <p className="text-2xl font-bold text-red-600">{formatearMoneda(totalDeuda)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Préstamos Activos</p>
          <p className="text-2xl font-bold text-gray-800">{prestamosActivos}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500 mb-1">Total Préstamos</p>
          <p className="text-2xl font-bold text-gray-800">{prestamosDelSujeto.length}</p>
        </div>
      </div>

      {/* Lista de préstamos */}
      <div className="space-y-4">
        {prestamosDelSujeto.map((prestamo) => (
          <div key={prestamo._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">📋</span>
                  <div>
                    <h3 className="font-bold text-gray-800">{prestamo.nombre}</h3>
                    {prestamo.prestamista && (
                      <p className="text-xs text-gray-500">Prestado por: {prestamo.prestamista}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    prestamo.estado === 'pagado' ? 'bg-green-100 text-green-700' :
                    prestamo.estaAtrasado ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {prestamo.estado === 'pagado' ? 'Pagado' : prestamo.estaAtrasado ? 'Atrasado' : 'Activo'}
                  </span>
                </div>

                {prestamo.descripcion && (
                  <p className="text-sm text-gray-500 mb-3">{prestamo.descripcion}</p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Monto Original</p>
                    <p className="font-medium">{formatearMoneda(prestamo.montoTotal)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Deuda Total</p>
                    <p className="font-medium text-red-600">{formatearMoneda(prestamo.montoDeuda)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Cuotas</p>
                    <p className="font-medium">{prestamo.cuotasPagadas} / {prestamo.totalCuotas}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Día de Pago</p>
                    <p className="font-medium">Día {prestamo.diaPago}</p>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progreso: {prestamo.porcentajePagado?.toFixed(1)}%</span>
                    <span>Restante: {formatearMoneda(prestamo.montoRestante)}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        prestamo.estado === 'pagado' ? 'bg-green-500' : 
                        prestamo.estaAtrasado ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${prestamo.porcentajePagado}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex lg:flex-col gap-2">
                {prestamo.estado !== 'pagado' && (
                  <button
                    onClick={() => handlePago(prestamo)}
                    className="flex-1 lg:flex-none bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition text-sm font-medium"
                  >
                    Registrar Pago
                  </button>
                )}
                <button
                  onClick={() => {
                    if (window.confirm('¿Eliminar este préstamo?')) onEliminar(prestamo._id);
                  }}
                  className="flex-1 lg:flex-none bg-gray-100 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-200 transition text-sm"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {prestamos.length === 0 && (
        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
          <span className="text-5xl mb-4 block">📋</span>
          <p className="text-gray-500">No hay préstamos registrados</p>
          <p className="text-gray-400 text-sm mt-1">Agrega un préstamo para hacer seguimiento</p>
        </div>
      )}

      {/* Modal */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold">{editando ? 'Editar Préstamo' : 'Nuevo Préstamo'}</h3>
              <button onClick={cerrarModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Crédito de consumo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción/Anotación</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto Original *</label>
                  <input
                    type="number"
                    value={formData.montoTotal}
                    onChange={(e) => setFormData({ ...formData, montoTotal: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deuda Total</label>
                  <input
                    type="number"
                    value={formData.montoDeuda}
                    onChange={(e) => setFormData({ ...formData, montoDeuda: e.target.value })}
                    placeholder="Con intereses"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha que se sacó el crédito *</label>
                <input
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) => setFormData({ ...formData, fechaInicio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">¿Quién prestó? (opcional)</label>
                <input
                  type="text"
                  value={formData.prestamista}
                  onChange={(e) => setFormData({ ...formData, prestamista: e.target.value })}
                  placeholder="Ej: Banco de Chile"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Cuotas *</label>
                  <input
                    type="number"
                    value={formData.totalCuotas}
                    onChange={(e) => setFormData({ ...formData, totalCuotas: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Día de Pago *</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formData.diaPago}
                    onChange={(e) => setFormData({ ...formData, diaPago: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta Asociada</label>
                <select
                  value={formData.cuentaAsociada}
                  onChange={(e) => setFormData({ ...formData, cuentaAsociada: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar cuenta</option>
                  {cuentas.map((c) => (
                    <option key={c._id} value={c._id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                {editando ? 'Guardar Cambios' : 'Crear Préstamo'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeccionPrestamos;
