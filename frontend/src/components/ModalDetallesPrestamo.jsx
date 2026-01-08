import React from 'react';
import { formatearMoneda, formatearFecha } from '../utils/constantes';

function ModalDetallesPrestamo({ prestamoId, visible, onClose, prestamos }) {
  if (!visible || !prestamoId) return null;

  const prestamo = prestamos.find(p => p._id === prestamoId);
  if (!prestamo) return null;

  const calcularDetalles = () => {
    const hoy = new Date();
    const fechaInicio = new Date(prestamo.fechaInicio);
    const fechaFin = new Date(fechaInicio);
    fechaFin.setMonth(fechaFin.getMonth() + prestamo.totalCuotas);

    const mesesTranscurridos = (hoy.getFullYear() - fechaInicio.getFullYear()) * 12 + 
                               (hoy.getMonth() - fechaInicio.getMonth());
    const cuotasEsperadas = Math.min(Math.max(0, mesesTranscurridos), prestamo.totalCuotas);
    
    const montoPagado = prestamo.cuotasPagadas * prestamo.valorCuota;
    const montoRestante = prestamo.montoDeuda - montoPagado;
    const interes = prestamo.montoDeuda - prestamo.montoTotal;
    const tasaInteres = prestamo.montoTotal > 0 ? ((interes / prestamo.montoTotal) * 100).toFixed(2) : 0;

    return {
      fechaFin,
      mesesTranscurridos,
      cuotasEsperadas,
      montoPagado,
      montoRestante,
      interes,
      tasaInteres,
      cuotasAtrasadas: Math.max(0, cuotasEsperadas - prestamo.cuotasPagadas)
    };
  };

  const detalles = calcularDetalles();

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{prestamo.nombre}</h2>
            <p className="text-blue-100 text-sm mt-1">Informe detallado del préstamo</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-blue-500 rounded-lg transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Sección: Información General */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📋 Información General</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 font-semibold">ESTADO</p>
                <p className={`text-sm font-bold mt-1 ${
                  prestamo.estado === 'pagado' ? 'text-green-600' :
                  detalles.cuotasAtrasadas > 0 ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {prestamo.estado === 'pagado' ? '✓ Pagado' : 
                   detalles.cuotasAtrasadas > 0 ? '⚠ Atrasado' : '○ Activo'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 font-semibold">FECHA INICIO</p>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {formatearFecha(prestamo.fechaInicio)}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-xs text-gray-600 font-semibold">FECHA ESTIMADA FIN</p>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {formatearFecha(detalles.fechaFin)}
                </p>
              </div>
              {prestamo.prestamista && (
                <div className="bg-gray-50 p-4 rounded-lg col-span-2 md:col-span-3">
                  <p className="text-xs text-gray-600 font-semibold">PRESTAMISTA</p>
                  <p className="text-sm font-bold text-gray-900 mt-1">{prestamo.prestamista}</p>
                </div>
              )}
              {prestamo.descripcion && (
                <div className="bg-gray-50 p-4 rounded-lg col-span-2 md:col-span-3">
                  <p className="text-xs text-gray-600 font-semibold">DESCRIPCIÓN</p>
                  <p className="text-sm text-gray-900 mt-1">{prestamo.descripcion}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sección: Análisis Financiero */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Análisis Financiero</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">Monto Original del Préstamo</span>
                <span className="text-lg font-bold text-gray-900">{formatearMoneda(prestamo.montoTotal)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm font-semibold text-blue-700">Interés Total Generado</span>
                <span className="text-lg font-bold text-blue-700">{formatearMoneda(detalles.interes)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm font-semibold text-blue-700">Tasa de Interés Aproximada</span>
                <span className="text-lg font-bold text-blue-700">{detalles.tasaInteres}%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                <span className="text-sm font-semibold text-red-700">Deuda Total a Pagar</span>
                <span className="text-lg font-bold text-red-700">{formatearMoneda(prestamo.montoDeuda)}</span>
              </div>
            </div>
          </div>

          {/* Sección: Estado de Cuotas */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Estado de Cuotas</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">Valor de Cada Cuota</span>
                <span className="text-lg font-bold text-gray-900">{formatearMoneda(prestamo.valorCuota)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-sm font-semibold text-green-700">Cuotas Pagadas</span>
                <span className="text-lg font-bold text-green-700">{prestamo.cuotasPagadas}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">Total de Cuotas</span>
                <span className="text-lg font-bold text-gray-900">{prestamo.totalCuotas}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">Cuotas Esperadas al Día de Hoy</span>
                <span className="text-lg font-bold text-gray-900">{Math.floor(detalles.cuotasEsperadas)}</span>
              </div>
              {detalles.cuotasAtrasadas > 0 && (
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <span className="text-sm font-semibold text-red-700">Cuotas Atrasadas</span>
                  <span className="text-lg font-bold text-red-700">{detalles.cuotasAtrasadas}</span>
                </div>
              )}
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">Cuotas Pendientes</span>
                <span className="text-lg font-bold text-gray-900">{prestamo.totalCuotas - prestamo.cuotasPagadas}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">Día de Pago del Mes</span>
                <span className="text-lg font-bold text-gray-900">Día {prestamo.diaPago}</span>
              </div>
            </div>
          </div>

          {/* Sección: Pagos Realizados */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">✓ Pagos Realizados</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-sm font-semibold text-green-700">Total Pagado</span>
                <span className="text-lg font-bold text-green-700">{formatearMoneda(detalles.montoPagado)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                <span className="text-sm font-semibold text-red-700">Monto Restante a Pagar</span>
                <span className="text-lg font-bold text-red-700">{formatearMoneda(detalles.montoRestante)}</span>
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-xs text-gray-600 mb-2">
                  <span>Progreso de Pago</span>
                  <span>{((detalles.montoPagado / prestamo.montoDeuda) * 100).toFixed(1)}%</span>
                </div>
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all"
                    style={{ width: `${((detalles.montoPagado / prestamo.montoDeuda) * 100).toFixed(1)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sección: Resumen Temporal */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">⏱️ Resumen Temporal</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">Meses Transcurridos</span>
                <span className="text-lg font-bold text-gray-900">{Math.floor(detalles.mesesTranscurridos)} meses</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-semibold text-gray-700">Duración Total Estimada</span>
                <span className="text-lg font-bold text-gray-900">{prestamo.totalCuotas} meses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalDetallesPrestamo;
