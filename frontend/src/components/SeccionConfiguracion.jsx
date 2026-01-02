import React, { useState } from 'react';
import { monedasDisponibles } from '../utils/constantes';
import { emailAPI } from '../services/api';

const SeccionConfiguracion = ({ configuracion, onActualizar, transacciones }) => {
  const [moneda, setMoneda] = useState(configuracion?.moneda || 'CLP');
  const [exportando, setExportando] = useState(false);
  const [mostrarCredenciales, setMostrarCredenciales] = useState(false);
  const [credenciales, setCredenciales] = useState({
    emailUsuario: '',
    emailPassword: ''
  });
  const [guardandoCredenciales, setGuardandoCredenciales] = useState(false);
  const [mensajeCredenciales, setMensajeCredenciales] = useState('');

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

  const handleActualizarCredenciales = async (e) => {
    e.preventDefault();
    if (!credenciales.emailUsuario || !credenciales.emailPassword) {
      setMensajeCredenciales('Por favor completa todos los campos');
      return;
    }

    setGuardandoCredenciales(true);
    setMensajeCredenciales('');

    try {
      const response = await fetch('http://localhost:3001/api/email/actualizar-credenciales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credenciales)
      });

      const data = await response.json();
      if (response.ok) {
        setMensajeCredenciales('✅ Credenciales actualizadas correctamente');
        setCredenciales({ emailUsuario: '', emailPassword: '' });
        setTimeout(() => {
          setMostrarCredenciales(false);
          setMensajeCredenciales('');
        }, 2000);
      } else {
        setMensajeCredenciales(`❌ ${data.error || 'Error al actualizar credenciales'}`);
      }
    } catch (error) {
      setMensajeCredenciales('❌ Error de conexión');
    } finally {
      setGuardandoCredenciales(false);
    }
  };

  const handleProbarEmail = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/email/prueba', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' })
      });

      const data = await response.json();
      if (response.ok) {
        setMensajeCredenciales('✅ Email de prueba enviado exitosamente');
      } else {
        setMensajeCredenciales(`❌ ${data.error || 'Error al enviar email'}`);
      }
    } catch (error) {
      setMensajeCredenciales('❌ Error de conexión');
    }
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

      {/* Credenciales de Email */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100">
        <h3 className="font-bold text-blue-600 mb-4 flex items-center gap-2">
          <span>📧</span> Credenciales de Email
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Configura tus credenciales de Gmail para enviar notificaciones
        </p>
        
        {!mostrarCredenciales ? (
          <div className="flex gap-2">
            <button
              onClick={() => setMostrarCredenciales(true)}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Modificar Credenciales
            </button>
            <button
              onClick={handleProbarEmail}
              className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Probar Email
            </button>
          </div>
        ) : (
          <form onSubmit={handleActualizarCredenciales} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de Gmail
              </label>
              <input
                type="email"
                value={credenciales.emailUsuario}
                onChange={(e) => setCredenciales({ ...credenciales, emailUsuario: e.target.value })}
                placeholder="tu-email@gmail.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Ejemplo: gestioneducativa.informes.zarcos@gmail.com</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña de Aplicación
              </label>
              <input
                type="password"
                value={credenciales.emailPassword}
                onChange={(e) => setCredenciales({ ...credenciales, emailPassword: e.target.value })}
                placeholder="xxxx xxxx xxxx xxxx"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Genera una contraseña de aplicación en{' '}
                <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  Google Account
                </a>
              </p>
            </div>

            {mensajeCredenciales && (
              <div className={`p-3 rounded-lg text-sm ${
                mensajeCredenciales.includes('✅') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {mensajeCredenciales}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={guardandoCredenciales}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50 font-medium"
              >
                {guardandoCredenciales ? 'Guardando...' : 'Guardar Credenciales'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMostrarCredenciales(false);
                  setCredenciales({ emailUsuario: '', emailPassword: '' });
                  setMensajeCredenciales('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition font-medium"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
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
