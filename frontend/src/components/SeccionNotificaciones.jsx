import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotificaciones, notificacionesEmitter } from '../context/NotificacionesContext';
import { notificacionesAPI, emailAPI } from '../services/api';

function SeccionNotificaciones() {
  const { usuario } = useAuth();
  const { cargarConteo } = useNotificaciones();
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('todas');
  const [paginaActual, setPaginaActual] = useState(1);
  const notificacionesPorPagina = 10;
  
  console.log('🎯 [SeccionNotificaciones] Componente montado/renderizado. Usuario:', usuario?.nombre);
  const [configEmail, setConfigEmail] = useState({
    mostrar: false,
    emailPrueba: usuario?.email || '',
    enviando: false,
    mensaje: ''
  });

  const [formNotificacion, setFormNotificacion] = useState({
    titulo: '',
    mensaje: '',
    tipo: 'recordatorio',
    fechaRecordatorio: '',
    horaRecordatorio: '09:00',
    urgente: false,
    enviarEmail: false
  });

  // Definir cargarNotificaciones con useCallback para que sea estable
  const cargarNotificaciones = useCallback(async () => {
    setLoading(true);
    try {
      const filtros = {};
      if (filtroTipo !== 'todas') {
        filtros.tipo = filtroTipo;
      }
      console.log('📡 [SeccionNotificaciones] Pidiendo notificaciones con filtros:', filtros);
      const data = await notificacionesAPI.obtener(filtros);
      console.log('📨 [SeccionNotificaciones] Respuesta recibida:', data);
      setNotificaciones(Array.isArray(data) ? data : []);
      setPaginaActual(1);  // Resetear a primera página
      console.log(`✅ [SeccionNotificaciones] ${Array.isArray(data) ? data.length : 0} notificaciones cargadas`);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setLoading(false);
    }
  }, [filtroTipo]);

  useEffect(() => {
    if (usuario) {
      cargarNotificaciones();
    }
  }, [usuario, filtroTipo, cargarNotificaciones]);

  // Escuchar el evento de nuevas notificaciones
  useEffect(() => {
    console.log('👂 Escuchando eventos de notificaciones en SeccionNotificaciones...');
    const unsubscribe = notificacionesEmitter.on((evento) => {
      console.log('📡 Evento recibido en SeccionNotificaciones:', evento);
      if (evento.tipo === 'nuevasNotificaciones') {
        console.log(`🔄 Refrescando notificaciones (${evento.cantidad} nuevas)...`);
        cargarNotificaciones();
      }
    });

    return () => {
      console.log('👂 Dejando de escuchar eventos de notificaciones');
      unsubscribe();
    };
  }, [cargarNotificaciones]);

  const handleCrearNotificacion = async (e) => {
    e.preventDefault();
    try {
      const fechaCompleta = new Date(`${formNotificacion.fechaRecordatorio}T${formNotificacion.horaRecordatorio}`);
      
      console.log('📝 [handleCrearNotificacion] Creando notificación:', {
        titulo: formNotificacion.titulo,
        tipo: formNotificacion.tipo,
        fechaRecordatorio: fechaCompleta.toISOString()
      });
      
      const respuesta = await notificacionesAPI.crear({
        titulo: formNotificacion.titulo,
        mensaje: formNotificacion.mensaje,
        tipo: formNotificacion.tipo,
        fechaRecordatorio: fechaCompleta.toISOString(),
        urgente: formNotificacion.urgente,
        enviarEmail: formNotificacion.urgente && formNotificacion.enviarEmail
      });

      console.log('✅ [handleCrearNotificacion] Respuesta del servidor:', respuesta);

      setMostrarModal(false);
      setFormNotificacion({
        titulo: '',
        mensaje: '',
        tipo: 'recordatorio',
        fechaRecordatorio: '',
        horaRecordatorio: '09:00',
        urgente: false,
        enviarEmail: false
      });
      
      console.log('🔄 [handleCrearNotificacion] Recargando notificaciones...');
      cargarNotificaciones();
      cargarConteo();
      
      alert('✅ Notificación creada exitosamente');
    } catch (error) {
      console.error('❌ [handleCrearNotificacion] Error:', error);
      alert('Error al crear notificación: ' + error.message);
    }
  };

  const handleMarcarLeida = async (id) => {
    try {
      await notificacionesAPI.marcarLeida(id);
      cargarNotificaciones();
      cargarConteo();
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta notificación?')) {
      try {
        await notificacionesAPI.eliminar(id);
        cargarNotificaciones();
        cargarConteo();
      } catch (error) {
        console.error('Error al eliminar:', error);
      }
    }
  };

  const handleAceptar = async (id) => {
    try {
      await notificacionesAPI.actualizar(id, { estado: 'aceptada' });
      cargarNotificaciones();
      alert('✅ Acción aceptada');
    } catch (error) {
      console.error('Error al aceptar:', error);
    }
  };

  const handleDeclinar = async (id) => {
    try {
      await notificacionesAPI.actualizar(id, { estado: 'declinada' });
      cargarNotificaciones();
      alert('❌ Acción declinada');
    } catch (error) {
      console.error('Error al declinar:', error);
    }
  };

  const handleMarcarTodasLeidas = async () => {
    try {
      await notificacionesAPI.marcarTodasLeidas();
      cargarNotificaciones();
      cargarConteo();
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  };

  const handleEnviarEmailPrueba = async () => {
    if (!configEmail.emailPrueba) return;
    
    setConfigEmail(prev => ({ ...prev, enviando: true, mensaje: '' }));
    try {
      const resultado = await emailAPI.enviarPrueba(configEmail.emailPrueba);
      setConfigEmail(prev => ({ 
        ...prev, 
        enviando: false, 
        mensaje: resultado.mensaje || 'Email enviado correctamente ✅'
      }));
    } catch (error) {
      setConfigEmail(prev => ({ 
        ...prev, 
        enviando: false, 
        mensaje: 'Error al enviar email de prueba ❌'
      }));
    }
  };

  const getTipoInfo = (tipo) => {
    const tipos = {
      recordatorio: { icon: '📌', color: 'bg-blue-100 text-blue-800', label: 'Recordatorio' },
      alerta: { icon: '⚠️', color: 'bg-yellow-100 text-yellow-800', label: 'Alerta' },
      vencimiento: { icon: '📅', color: 'bg-red-100 text-red-800', label: 'Vencimiento' },
      presupuesto: { icon: '💰', color: 'bg-green-100 text-green-800', label: 'Presupuesto' },
      prestamo: { icon: '🏦', color: 'bg-purple-100 text-purple-800', label: 'Préstamo' },
      general: { icon: '📢', color: 'bg-gray-100 text-gray-800', label: 'General' }
    };
    return tipos[tipo] || tipos.general;
  };

  const notificacionesPendientes = notificaciones.filter(n => !n.leida && new Date(n.fechaRecordatorio) <= new Date());

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🔔 Notificaciones</h1>
          <p className="text-slate-600">Gestiona tus recordatorios y alertas</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setConfigEmail(prev => ({ ...prev, mostrar: !prev.mostrar }))}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            ⚙️ Config Email
          </button>
          <button
            onClick={() => setMostrarModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            + Nuevo Recordatorio
          </button>
        </div>
      </div>

      {/* Config Email Panel */}
      {configEmail.mostrar && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-slate-800 mb-3">⚙️ Configuración de Email</h3>
          <p className="text-sm text-slate-600 mb-4">
            Para enviar emails, necesitas tener configuradas las variables de entorno en el servidor backend.
          </p>
          <div className="flex gap-2 mb-2">
            <input
              type="email"
              value={configEmail.emailPrueba}
              onChange={(e) => setConfigEmail(prev => ({ ...prev, emailPrueba: e.target.value }))}
              placeholder="Ingresa un email para probar"
              className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
            />
            <button
              onClick={handleEnviarEmailPrueba}
              disabled={configEmail.enviando}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {configEmail.enviando ? 'Enviando...' : '📧 Enviar Prueba'}
            </button>
          </div>
          {configEmail.mensaje && (
            <p className="mt-2 text-sm font-medium text-slate-700 bg-white p-2 rounded border-l-4 border-green-500">
              {configEmail.mensaje}
            </p>
          )}
        </div>
      )}

      {/* Notificaciones Pendientes */}
      {notificacionesPendientes.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-orange-800">
              🔔 {notificacionesPendientes.length} Notificación(es) Pendiente(s)
            </h3>
            <button
              onClick={handleMarcarTodasLeidas}
              className="text-sm text-orange-600 hover:text-orange-800"
            >
              Marcar todas como leídas
            </button>
          </div>
          <div className="space-y-2">
            {notificacionesPendientes.slice(0, 3).map(notif => (
              <div 
                key={notif._id} 
                className={`flex items-center justify-between p-3 rounded-lg ${notif.urgente ? 'bg-red-100' : 'bg-white'}`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xl">{notif.urgente ? '🚨' : '📌'}</span>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{notif.titulo}</p>
                    <p className="text-sm text-slate-600">{notif.mensaje}</p>
                  </div>
                </div>
                <div className="flex gap-2 ml-2">
                  {(notif.tipo.includes('compartido') || notif.tipo.includes('Gasto') || notif.tipo.includes('Ingreso')) && (
                    <>
                      <button
                        onClick={() => handleAceptar(notif._id)}
                        className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 font-medium"
                        title="Aceptar esta acción"
                      >
                        ✓ Aceptar
                      </button>
                      <button
                        onClick={() => handleDeclinar(notif._id)}
                        className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 font-medium"
                        title="Declinar esta acción"
                      >
                        ✗ Declinar
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleMarcarLeida(notif._id)}
                    className="px-3 py-1 text-sm bg-orange-200 text-orange-800 rounded hover:bg-orange-300"
                  >
                    ✓ Leída
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        {['todas', 'recordatorio', 'alerta', 'vencimiento', 'presupuesto', 'prestamo'].map(tipo => (
          <button
            key={tipo}
            onClick={() => setFiltroTipo(tipo)}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${
              filtroTipo === tipo
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {tipo === 'todas' ? 'Todas' : getTipoInfo(tipo).label}
          </button>
        ))}
      </div>

      {/* Lista de Notificaciones */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500">Cargando...</div>
        ) : notificaciones.length === 0 ? (
          <div className="p-8 text-center">
            <span className="text-4xl">📭</span>
            <p className="mt-2 text-slate-500">No hay notificaciones</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {notificaciones
                .slice((paginaActual - 1) * notificacionesPorPagina, paginaActual * notificacionesPorPagina)
                .map(notif => {
                  const tipoInfo = getTipoInfo(notif.tipo);
                  const fechaRecordatorio = new Date(notif.fechaRecordatorio);
                  const esPasada = fechaRecordatorio < new Date();
                  
                  return (
                    <div 
                      key={notif._id} 
                      className={`p-4 hover:bg-slate-50 transition ${notif.leida ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Icono */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          notif.urgente ? 'bg-red-100' : 'bg-slate-100'
                        }`}>
                          <span className="text-xl">{notif.urgente ? '🚨' : tipoInfo.icon}</span>
                        </div>
                        
                        {/* Contenido */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-semibold ${notif.leida ? 'text-slate-500' : 'text-slate-800'}`}>
                              {notif.titulo}
                            </h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${tipoInfo.color}`}>
                              {tipoInfo.label}
                            </span>
                            {notif.urgente && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800">
                                URGENTE
                              </span>
                            )}
                            {notif.enviarEmail && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
                                📧 {notif.emailEnviado ? 'Enviado' : 'Pendiente'}
                              </span>
                            )}
                          </div>
                          <p className="text-slate-600 text-sm mb-2">{notif.mensaje}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
                            <span className={esPasada && !notif.leida ? 'text-red-600 font-medium' : ''}>
                              📅 {fechaRecordatorio.toLocaleDateString('es-ES', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            {notif.leida && (
                              <span className="text-green-600">✓ Leída</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Acciones */}
                        <div className="flex gap-2">
                          {!notif.leida && (
                            <button
                              onClick={() => handleMarcarLeida(notif._id)}
                              className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Marcar como leída"
                            >
                              ✓
                            </button>
                          )}
                          <button
                            onClick={() => handleEliminar(notif._id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Eliminar"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
            
            {/* Paginación */}
            {notificaciones.length > notificacionesPorPagina && (
              <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-200">
                <div className="text-sm text-slate-600">
                  Mostrando {(paginaActual - 1) * notificacionesPorPagina + 1}-{Math.min(paginaActual * notificacionesPorPagina, notificaciones.length)} de {notificaciones.length}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPaginaActual(Math.max(1, paginaActual - 1))}
                    disabled={paginaActual === 1}
                    className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    ← Anterior
                  </button>
                  <span className="px-3 py-1.5 text-sm font-medium text-slate-800">
                    Página {paginaActual} de {Math.ceil(notificaciones.length / notificacionesPorPagina)}
                  </span>
                  <button
                    onClick={() => setPaginaActual(Math.min(Math.ceil(notificaciones.length / notificacionesPorPagina), paginaActual + 1))}
                    disabled={paginaActual === Math.ceil(notificaciones.length / notificacionesPorPagina)}
                    className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Crear Notificación */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold text-slate-800 mb-4">📌 Nuevo Recordatorio</h2>
            
            <form onSubmit={handleCrearNotificacion} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
                <input
                  type="text"
                  value={formNotificacion.titulo}
                  onChange={(e) => setFormNotificacion(prev => ({ ...prev, titulo: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  placeholder="Ej: Pagar tarjeta de crédito"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mensaje</label>
                <textarea
                  value={formNotificacion.mensaje}
                  onChange={(e) => setFormNotificacion(prev => ({ ...prev, mensaje: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                  rows={3}
                  placeholder="Descripción del recordatorio..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
                <select
                  value={formNotificacion.tipo}
                  onChange={(e) => setFormNotificacion(prev => ({ ...prev, tipo: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                >
                  <option value="recordatorio">📌 Recordatorio</option>
                  <option value="alerta">⚠️ Alerta</option>
                  <option value="vencimiento">📅 Vencimiento</option>
                  <option value="presupuesto">💰 Presupuesto</option>
                  <option value="prestamo">🏦 Préstamo</option>
                  <option value="general">📢 General</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={formNotificacion.fechaRecordatorio}
                    onChange={(e) => setFormNotificacion(prev => ({ ...prev, fechaRecordatorio: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Hora</label>
                  <input
                    type="time"
                    value={formNotificacion.horaRecordatorio}
                    onChange={(e) => setFormNotificacion(prev => ({ ...prev, horaRecordatorio: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-800"
                    required
                  />
                </div>
              </div>

              {/* Switch Urgente */}
              <div className="bg-slate-50 p-3 rounded-lg">
                <label className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🚨</span>
                    <div>
                      <span className="font-medium text-slate-800">Marcar como Urgente</span>
                      <p className="text-xs text-slate-500">Recibirás alerta especial</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formNotificacion.urgente}
                    onChange={(e) => setFormNotificacion(prev => ({ 
                      ...prev, 
                      urgente: e.target.checked,
                      enviarEmail: e.target.checked ? prev.enviarEmail : false
                    }))}
                    className="w-5 h-5 rounded text-red-600"
                  />
                </label>
              </div>

              {/* Switch Email (solo si es urgente) */}
              {formNotificacion.urgente && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">📧</span>
                      <div>
                        <span className="font-medium text-slate-800">Enviar Email</span>
                        <p className="text-xs text-slate-500">Recibe notificación por correo</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formNotificacion.enviarEmail}
                      onChange={(e) => setFormNotificacion(prev => ({ ...prev, enviarEmail: e.target.checked }))}
                      className="w-5 h-5 rounded text-blue-600"
                    />
                  </label>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Crear Recordatorio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default SeccionNotificaciones;
