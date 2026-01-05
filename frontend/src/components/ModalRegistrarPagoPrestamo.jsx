import React, { useState, useEffect } from 'react';
import { formatearMoneda, formatearFecha } from '../utils/constantes';

function ModalRegistrarPagoPrestamo({ visible, onClose, prestamo, onRegistrar }) {
  const [formData, setFormData] = useState({
    montoPagado: '',
    fechaRealPago: new Date().toISOString().split('T')[0],
    diasAtraso: 0,
    notas: '',
    valorCuotaActual: '',
    ajusteInflacion: 0
  });

  // Actualizar el formulario cuando cambie el préstamo
  useEffect(() => {
    if (prestamo) {
      setFormData({
        montoPagado: prestamo?.valorCuotaActual || prestamo?.valorCuota || '',
        fechaRealPago: new Date().toISOString().split('T')[0],
        diasAtraso: 0,
        notas: '',
        valorCuotaActual: prestamo?.valorCuotaActual || prestamo?.valorCuota || '',
        ajusteInflacion: 0
      });
    }
  }, [prestamo, visible]);

  if (!visible || !prestamo) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'montoPagado' || name === 'diasAtraso' || name === 'ajusteInflacion' || name === 'valorCuotaActual'
        ? parseFloat(value) || 0
        : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.montoPagado || formData.montoPagado <= 0) {
      alert('Ingresa un monto válido a pagar');
      return;
    }

    onRegistrar(prestamo._id, {
      numeroCuota: prestamo.cuotasPagadas + 1,
      montoPagado: formData.montoPagado,
      fechaRealPago: formData.fechaRealPago,
      diasAtraso: formData.diasAtraso,
      notas: formData.notas,
      valorCuotaActual: formData.valorCuotaActual,
      ajusteInflacion: formData.ajusteInflacion
    });

    // Reset form
    setFormData({
      montoPagado: prestamo?.valorCuotaActual || prestamo?.valorCuota || '',
      fechaRealPago: new Date().toISOString().split('T')[0],
      diasAtraso: 0,
      notas: '',
      valorCuotaActual: prestamo?.valorCuotaActual || prestamo?.valorCuota || '',
      ajusteInflacion: 0
    });
    onClose();
  };

  const valorCuotaBase = prestamo?.valorCuota || (prestamo?.montoDeuda / prestamo?.totalCuotas);
  const proximaCuota = prestamo?.cuotasPagadas + 1;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 p-6 text-white flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Registrar Pago - {prestamo.nombre}</h2>
            <p className="text-green-100 text-sm mt-1">Cuota #{proximaCuota} de {prestamo.totalCuotas}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-green-500 rounded-lg transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información General de la Cuota */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Información de la Cuota</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 font-semibold">CUOTA #</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{proximaCuota}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 font-semibold">CUOTAS PAGADAS</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{prestamo.cuotasPagadas}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 font-semibold">PENDIENTES</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{prestamo.totalCuotas - prestamo.cuotasPagadas}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg col-span-2 md:col-span-3 border border-blue-200">
                <p className="text-xs text-blue-600 font-semibold">VALOR BASE DE CUOTA</p>
                <p className="text-lg font-bold text-blue-700 mt-1">{formatearMoneda(valorCuotaBase)}</p>
              </div>
            </div>
          </div>

          {/* Monto a Pagar */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Monto a Pagar</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Monto a Pagar *</label>
                <input
                  type="number"
                  step="0.01"
                  name="montoPagado"
                  value={formData.montoPagado}
                  onChange={handleChange}
                  placeholder="Ej: 100"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 font-semibold text-lg"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">Este es el monto real que pagas en esta cuota</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Valor de Cuota Actual (Opcional)</label>
                <input
                  type="number"
                  step="0.01"
                  name="valorCuotaActual"
                  value={formData.valorCuotaActual}
                  onChange={handleChange}
                  placeholder={`Ej: ${prestamo.valorCuota}`}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-2">Si cambió por inflación u otro motivo, actualiza aquí</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Ajuste por Inflación u Otro (Opcional)</label>
                <input
                  type="number"
                  step="0.01"
                  name="ajusteInflacion"
                  value={formData.ajusteInflacion}
                  onChange={handleChange}
                  placeholder="Ej: 5.50"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-2">Incremento por inflación, revaluación, etc.</p>
              </div>
            </div>
          </div>

          {/* Información de Fecha y Atraso */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📅 Fecha y Estado</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">Fecha de Pago *</label>
                <input
                  type="date"
                  name="fechaRealPago"
                  value={formData.fechaRealPago}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">Cuándo realizaste el pago</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">¿Cuántos Días de Atraso? (Opcional)</label>
                <input
                  type="number"
                  name="diasAtraso"
                  value={formData.diasAtraso}
                  onChange={handleChange}
                  placeholder="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-2">Si pagaste después de la fecha vencida, indica cuántos días</p>
              </div>

              {formData.diasAtraso > 0 && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-red-700">⚠️ Pago Atrasado</p>
                  <p className="text-sm text-red-600 mt-1">Cuota pagada con {formData.diasAtraso} días de atraso</p>
                </div>
              )}
            </div>
          </div>

          {/* Notas Adicionales */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">📝 Notas Adicionales (Opcional)</h3>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              placeholder="Ej: Pago parcial, se acordó nueva fecha, etc."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
            />
            <p className="text-xs text-gray-500 mt-2">Anotaciones sobre el pago, acuerdos, cambios, etc.</p>
          </div>

          {/* Resumen del Pago */}
          <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
            <p className="text-sm font-semibold text-gray-900 mb-3">📊 Resumen del Pago</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Monto a pagar:</span>
                <span className="font-bold text-gray-900">{formatearMoneda(formData.montoPagado)}</span>
              </div>
              {formData.ajusteInflacion > 0 && (
                <div className="flex justify-between text-blue-700">
                  <span>+ Ajuste inflación:</span>
                  <span className="font-bold">{formatearMoneda(formData.ajusteInflacion)}</span>
                </div>
              )}
              {formData.diasAtraso > 0 && (
                <div className="flex justify-between text-red-700">
                  <span>⚠️ Días de atraso:</span>
                  <span className="font-bold">{formData.diasAtraso} días</span>
                </div>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
            >
              Registrar Pago
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalRegistrarPagoPrestamo;
