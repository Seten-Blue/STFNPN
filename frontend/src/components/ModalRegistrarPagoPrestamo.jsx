import React, { useState, useEffect } from 'react';
import { formatearMoneda } from '../utils/constantes';

function ModalRegistrarPagoPrestamo({ visible, onClose, prestamo, onRegistrar }) {
  const [formData, setFormData] = useState({
    montoPagado: '',
    fechaRealPago: new Date().toISOString().split('T')[0],
    diasAtraso: 0,
    notas: '',
    valorCuotaActual: '',
    ajusteInflacion: 0
  });

  useEffect(() => {
    if (prestamo && visible) {
      const valorBase = prestamo?.valorCuota || (prestamo?.montoDeuda / prestamo?.totalCuotas) || '';
      setFormData({
        montoPagado: valorBase || '',
        fechaRealPago: new Date().toISOString().split('T')[0],
        diasAtraso: 0,
        notas: '',
        valorCuotaActual: valorBase || '',
        ajusteInflacion: 0
      });
    }
  }, [prestamo, visible]);

  if (!visible) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['montoPagado', 'diasAtraso', 'ajusteInflacion', 'valorCuotaActual'].includes(name)
        ? (value === '' ? '' : parseFloat(value))
        : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.montoPagado || formData.montoPagado <= 0) {
      alert('Ingresa un monto válido a pagar');
      return;
    }

    const datoPago = {
      numeroCuota: prestamo.cuotasPagadas + 1,
      montoPagado: parseFloat(formData.montoPagado),
      fechaRealPago: formData.fechaRealPago,
      diasAtraso: parseInt(formData.diasAtraso) || 0,
      notas: formData.notas,
      valorCuotaActual: formData.valorCuotaActual ? parseFloat(formData.valorCuotaActual) : 0,
      ajusteInflacion: formData.ajusteInflacion ? parseFloat(formData.ajusteInflacion) : 0
    };

    onRegistrar(prestamo._id, datoPago);
    onClose();
  };

  const proximaCuota = prestamo.cuotasPagadas + 1;
  const valorBase = prestamo?.valorCuota || (prestamo?.montoDeuda / prestamo?.totalCuotas) || 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
          <h2 className="text-2xl font-bold">Registrar Pago</h2>
          <p className="text-green-100 text-sm">
            {prestamo.nombre} - Cuota #{proximaCuota} de {prestamo.totalCuotas}
          </p>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-green-500 rounded"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información General */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-3">📋 Información de la Cuota</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Cuota</p>
                <p className="font-bold text-gray-900">{proximaCuota}</p>
              </div>
              <div>
                <p className="text-gray-600">Cuotas Pagadas</p>
                <p className="font-bold text-gray-900">{prestamo.cuotasPagadas}</p>
              </div>
              <div>
                <p className="text-gray-600">Pendientes</p>
                <p className="font-bold text-gray-900">{prestamo.totalCuotas - prestamo.cuotasPagadas}</p>
              </div>
              <div>
                <p className="text-gray-600">Valor Base</p>
                <p className="font-bold text-gray-900">{formatearMoneda(valorBase)}</p>
              </div>
            </div>
          </div>

          {/* Monto a Pagar */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              💰 Monto a Pagar *
            </label>
            <input
              type="number"
              step="0.01"
              name="montoPagado"
              value={formData.montoPagado}
              onChange={handleChange}
              placeholder="Ej: 100"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900 font-bold text-lg"
              required
            />
            <p className="text-xs text-gray-700 mt-1">Monto real que pagas en esta cuota</p>
          </div>

          {/* Fecha de Pago */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              📅 Fecha de Pago *
            </label>
            <input
              type="date"
              name="fechaRealPago"
              value={formData.fechaRealPago}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
              required
            />
          </div>

          {/* Valor de Cuota Actual (Opcional) */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              💱 Valor de Cuota Actual (Opcional)
            </label>
            <input
              type="number"
              step="0.01"
              name="valorCuotaActual"
              value={formData.valorCuotaActual}
              onChange={handleChange}
              placeholder={`Ej: ${valorBase}`}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
            />
            <p className="text-xs text-gray-700 mt-1">Si cambió por inflación, actualiza el valor aquí</p>
          </div>

          {/* Ajuste por Inflación (Opcional) */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              📈 Ajuste por Inflación (Opcional)
            </label>
            <input
              type="number"
              step="0.01"
              name="ajusteInflacion"
              value={formData.ajusteInflacion}
              onChange={handleChange}
              placeholder="Ej: 5.50"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
            />
            <p className="text-xs text-gray-700 mt-1">Incremento por inflación u otro motivo</p>
          </div>

          {/* Días de Atraso (Opcional) */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              ⏰ Días de Atraso (Opcional)
            </label>
            <input
              type="number"
              name="diasAtraso"
              value={formData.diasAtraso}
              onChange={handleChange}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
            />
            <p className="text-xs text-gray-700 mt-1">Si pagaste tarde, indica cuántos días</p>
            {formData.diasAtraso > 0 && (
              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                ⚠️ Pago con {formData.diasAtraso} días de atraso
              </div>
            )}
          </div>

          {/* Notas (Opcional) */}
          <div>
            <label className="block text-sm font-bold text-gray-800 mb-2">
              📝 Notas Adicionales (Opcional)
            </label>
            <textarea
              name="notas"
              value={formData.notas}
              onChange={handleChange}
              placeholder="Ej: Pago parcial, se acordó nueva fecha, etc."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-gray-900"
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-bold hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700"
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
