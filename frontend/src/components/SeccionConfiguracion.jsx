import React, { useState } from 'react';
import { monedasDisponibles } from '../utils/constantes';

const SeccionConfiguracion = ({ configuracion, onActualizar, transacciones }) => {
  const [moneda, setMoneda] = useState(configuracion?.moneda || 'CLP');
  const [exportando, setExportando] = useState(false);

  const handleCambiarMoneda = (nuevaMoneda) => {
    setMoneda(nuevaMoneda);
    onActualizar({ moneda: nuevaMoneda });
  };

  const exportarExcel = () => {
    setExportando(true);
    try {
      // Crear CSV
      const headers = ['Fecha', 'Hora', 'Tipo', 'Categoría', 'Cantidad', 'Grupo', 'Anotaciones'];
      const rows = transacciones.map(t => [
        new Date(t.fecha).toLocaleDateString(),
        t.hora || '',
        t.tipo,
        t.categoria || '',
        t.cantidad,
        t.grupo || 'personal',
        t.anotaciones || ''
      ]);

      const csvContent = [headers, ...rows]
        .map(row => row.map(cell => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `finanzas_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
    } catch (error) {
      alert('Error al exportar');
    } finally {
      setExportando(false);
    }
  };

  const exportarPDF = () => {
    alert('Funcionalidad de exportar a PDF próximamente');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Configuración</h2>
        <p className="text-gray-500">Personaliza tu experiencia</p>
      </div>

      {/* Moneda */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>💱</span> Moneda
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {monedasDisponibles.map((m) => (
            <button
              key={m.codigo}
              onClick={() => handleCambiarMoneda(m.codigo)}
              className={`p-3 rounded-xl border-2 transition text-left ${
                moneda === m.codigo ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-bold">{m.simbolo} {m.codigo}</p>
              <p className="text-xs text-gray-500">{m.nombre}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Exportar datos */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>📤</span> Exportar Datos
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Descarga tus transacciones en formato Excel o PDF
        </p>
        <div className="flex gap-3">
          <button
            onClick={exportarExcel}
            disabled={exportando}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar Excel
          </button>
          <button
            onClick={exportarPDF}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Información */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span>ℹ️</span> Información
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Versión</span>
            <span className="font-medium">2.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Total transacciones</span>
            <span className="font-medium">{transacciones.length}</span>
          </div>
        </div>
      </div>

      {/* Restablecer datos */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-red-100">
        <h3 className="font-bold text-red-600 mb-4 flex items-center gap-2">
          <span>⚠️</span> Zona de Peligro
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Estas acciones no se pueden deshacer
        </p>
        <button
          onClick={() => alert('Esta funcionalidad eliminaría todos los datos. Por seguridad, está deshabilitada.')}
          className="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition text-sm font-medium"
        >
          Eliminar todos los datos
        </button>
      </div>
    </div>
  );
};

export default SeccionConfiguracion;
