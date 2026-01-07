import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { transaccionesAPI, fusionCuentasAPI } from '../services/api';
import {
  BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';

function SeccionFusion() {
  const { usuario, usuarios } = useAuth();
  
  // Estados para fusiones
  const [vistaActual, setVistaActual] = useState('fusiones'); // 'fusiones' o 'comparar'
  const [fusionesActivas, setFusionesActivas] = useState([]);
  const [solicitudesEnviadas, setSolicitudesEnviadas] = useState([]);
  const [solicitudesRecibidas, setSolicitudesRecibidas] = useState([]);
  const [usuariosDisponibles, setUsuariosDisponibles] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loadingFusiones, setLoadingFusiones] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  
  // Estados para comparación
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [transacciones1, setTransacciones1] = useState([]);
  const [transacciones2, setTransacciones2] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroFecha, setFiltroFecha] = useState('mes');
  const [fechaInicio, setFechaInicio] = useState(new Date(new Date().setDate(1)).toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);
  
  // Modal de enviar solicitud
  const [modalSolicitud, setModalSolicitud] = useState(false);
  const [usuarioParaSolicitud, setUsuarioParaSolicitud] = useState(null);
  const [mensajeSolicitud, setMensajeSolicitud] = useState('');

  const colores = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

  // Cargar fusiones
  const cargarFusiones = useCallback(async () => {
    setLoadingFusiones(true);
    try {
      const data = await fusionCuentasAPI.obtenerMisFusiones();
      setFusionesActivas(data.fusionesActivas || []);
      setSolicitudesEnviadas(data.solicitudesEnviadas || []);
      setSolicitudesRecibidas(data.solicitudesRecibidas || []);
    } catch (err) {
      console.error('Error al cargar fusiones:', err);
      setError('Error al cargar fusiones');
    } finally {
      setLoadingFusiones(false);
    }
  }, []);

  // Buscar usuarios disponibles
  const buscarUsuarios = useCallback(async () => {
    try {
      const data = await fusionCuentasAPI.buscarUsuarios(busqueda);
      setUsuariosDisponibles(data);
    } catch (err) {
      console.error('Error al buscar usuarios:', err);
    }
  }, [busqueda]);

  useEffect(() => {
    cargarFusiones();
  }, [cargarFusiones]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (vistaActual === 'fusiones') {
        buscarUsuarios();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [busqueda, vistaActual, buscarUsuarios]);

  // Enviar solicitud de fusión
  const enviarSolicitud = async () => {
    if (!usuarioParaSolicitud) return;
    
    try {
      await fusionCuentasAPI.enviarSolicitud({
        usuarioDestinoId: usuarioParaSolicitud._id,
        mensaje: mensajeSolicitud
      });
      setMensaje('Solicitud enviada correctamente');
      setModalSolicitud(false);
      setUsuarioParaSolicitud(null);
      setMensajeSolicitud('');
      cargarFusiones();
      buscarUsuarios();
    } catch (err) {
      setError(err.message);
    }
  };

  // Responder solicitud
  const responderSolicitud = async (fusionId, aceptar) => {
    try {
      await fusionCuentasAPI.responderSolicitud(fusionId, aceptar);
      setMensaje(aceptar ? 'Solicitud aceptada' : 'Solicitud rechazada');
      cargarFusiones();
    } catch (err) {
      setError(err.message);
    }
  };

  // Cancelar fusión
  const cancelarFusion = async (fusionId) => {
    if (!confirm('¿Estás seguro de cancelar esta fusión?')) return;
    
    try {
      await fusionCuentasAPI.cancelarFusion(fusionId);
      setMensaje('Fusión cancelada');
      cargarFusiones();
    } catch (err) {
      setError(err.message);
    }
  };

  // Datos de comparación
  useEffect(() => {
    if (usuarioSeleccionado && usuario && vistaActual === 'comparar') {
      cargarDatos();
    }
  }, [usuarioSeleccionado, filtroFecha, fechaInicio, fechaFin, vistaActual]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const filtros = {
        periodo: filtroFecha,
        usuarioId: usuario._id || usuario.id,
      };

      if (filtroFecha === 'personalizado') {
        filtros.fechaInicio = fechaInicio;
        filtros.fechaFin = fechaFin;
      } else {
        const hoy = new Date();
        if (filtroFecha === 'mes') {
          filtros.fecha = hoy.toISOString().split('T')[0];
        }
      }

      const trans1 = await transaccionesAPI.obtener(filtros);
      setTransacciones1(Array.isArray(trans1) ? trans1 : []);

      filtros.usuarioId = usuarioSeleccionado._id || usuarioSeleccionado.usuario?._id;
      const trans2 = await transaccionesAPI.obtener(filtros);
      setTransacciones2(Array.isArray(trans2) ? trans2 : []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularEstadisticas = (transacciones) => {
    const gastos = transacciones.filter(t => t.tipo === 'gasto');
    const ingresos = transacciones.filter(t => t.tipo === 'ingreso');

    const totalGastos = gastos.reduce((sum, t) => sum + (t.cantidad || 0), 0);
    const totalIngresos = ingresos.reduce((sum, t) => sum + (t.cantidad || 0), 0);
    const balance = totalIngresos - totalGastos;

    const gastosPorCategoria = {};
    gastos.forEach(t => {
      const cat = t.categoria || 'Sin categoría';
      gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + (t.cantidad || 0);
    });

    return {
      totalGastos,
      totalIngresos,
      balance,
      gastosPorCategoria,
    };
  };

  const stats1 = calcularEstadisticas(transacciones1);
  const stats2 = calcularEstadisticas(transacciones2);

  const datosComparacion = [
    {
      nombre: usuario?.nombre || 'Yo',
      ingresos: stats1.totalIngresos,
      gastos: stats1.totalGastos,
      balance: stats1.balance
    },
    {
      nombre: usuarioSeleccionado?.nombre || usuarioSeleccionado?.usuario?.nombre || 'Usuario 2',
      ingresos: stats2.totalIngresos,
      gastos: stats2.totalGastos,
      balance: stats2.balance
    }
  ];

  const datosGastosPastel1 = Object.entries(stats1.gastosPorCategoria).map(([cat, valor]) => ({
    name: cat,
    value: valor
  }));

  const datosGastosPastel2 = Object.entries(stats2.gastosPorCategoria).map(([cat, valor]) => ({
    name: cat,
    value: valor
  }));

  const formatear = (num) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'COP' }).format(num);
  };

  // Limpiar mensajes
  useEffect(() => {
    if (mensaje || error) {
      const timer = setTimeout(() => {
        setMensaje('');
        setError('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [mensaje, error]);

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Mensajes */}
      {mensaje && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          ✅ {mensaje}
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          ❌ {error}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">🔗 Fusión de Cuentas</h1>
        <p className="text-slate-600">Gestiona tus conexiones y compara finanzas con otros usuarios</p>
      </div>

      {/* Tabs de navegación */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setVistaActual('fusiones')}
          className={`px-6 py-3 rounded-lg font-medium transition ${
            vistaActual === 'fusiones'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          👥 Gestionar Fusiones
        </button>
        <button
          onClick={() => setVistaActual('comparar')}
          className={`px-6 py-3 rounded-lg font-medium transition ${
            vistaActual === 'comparar'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          📊 Comparar Finanzas
        </button>
      </div>

      {vistaActual === 'fusiones' ? (
        <>
          {/* Sección: Solicitudes Recibidas */}
          {solicitudesRecibidas.length > 0 && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl shadow-md p-6 mb-6 border-l-4 border-yellow-500">
              <h2 className="text-lg font-bold text-slate-800 mb-4">📩 Solicitudes Recibidas ({solicitudesRecibidas.length})</h2>
              <div className="space-y-3">
                {solicitudesRecibidas.map((sol) => (
                  <div key={sol._id} className="bg-white rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                        {sol.usuarioOrigen?.avatar || '👤'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{sol.usuarioOrigen?.nombre}</p>
                        <p className="text-sm text-slate-500">{sol.usuarioOrigen?.email}</p>
                        {sol.mensaje && (
                          <p className="text-sm text-slate-600 mt-1 italic">"{sol.mensaje}"</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => responderSolicitud(sol._id, true)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                      >
                        ✅ Aceptar
                      </button>
                      <button
                        onClick={() => responderSolicitud(sol._id, false)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      >
                        ❌ Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sección: Fusiones Activas */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border-l-4 border-green-500">
            <h2 className="text-lg font-bold text-slate-800 mb-4">✅ Fusiones Activas ({fusionesActivas.length})</h2>
            {loadingFusiones ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : fusionesActivas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {fusionesActivas.map((fusion) => {
                  const otroUsuario = fusion.usuarioOrigen._id === (usuario._id || usuario.id)
                    ? fusion.usuarioDestino
                    : fusion.usuarioOrigen;
                  return (
                    <div key={fusion._id} className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-2xl">
                          {otroUsuario?.avatar || '👤'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">{otroUsuario?.nombre}</p>
                          <p className="text-sm text-slate-500">{otroUsuario?.email}</p>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500 mb-3">
                        Fusionado desde: {new Date(fusion.fechaRespuesta || fusion.updatedAt).toLocaleDateString()}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setUsuarioSeleccionado({ ...otroUsuario, fusionId: fusion._id });
                            setVistaActual('comparar');
                          }}
                          className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition"
                        >
                          📊 Comparar
                        </button>
                        <button
                          onClick={() => cancelarFusion(fusion._id)}
                          className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-sm hover:bg-red-200 transition"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <span className="text-4xl">🔗</span>
                <p className="mt-2">No tienes fusiones activas</p>
                <p className="text-sm">Envía una solicitud para conectar con otros usuarios</p>
              </div>
            )}
          </div>

          {/* Sección: Solicitudes Enviadas */}
          {solicitudesEnviadas.length > 0 && (
            <div className="bg-white rounded-xl shadow-md p-6 mb-6 border-l-4 border-blue-500">
              <h2 className="text-lg font-bold text-slate-800 mb-4">📤 Solicitudes Enviadas ({solicitudesEnviadas.length})</h2>
              <div className="space-y-3">
                {solicitudesEnviadas.map((sol) => (
                  <div key={sol._id} className="bg-slate-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                        {sol.usuarioDestino?.avatar || '👤'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">{sol.usuarioDestino?.nombre}</p>
                        <p className="text-sm text-slate-500">Pendiente de respuesta</p>
                      </div>
                    </div>
                    <button
                      onClick={() => cancelarFusion(sol._id)}
                      className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sección: Buscar Usuarios */}
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <h2 className="text-lg font-bold text-slate-800 mb-4">🔍 Buscar Usuarios para Fusionar</h2>
            <div className="mb-4">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por nombre o email..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-800"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {usuariosDisponibles.map((u) => (
                <div key={u._id} className="bg-slate-50 rounded-lg p-4 flex items-center justify-between hover:bg-slate-100 transition">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-xl">
                      {u.avatar || '👤'}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">{u.nombre}</p>
                      <p className="text-sm text-slate-500">{u.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setUsuarioParaSolicitud(u);
                      setModalSolicitud(true);
                    }}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-sm"
                  >
                    Conectar
                  </button>
                </div>
              ))}
              {usuariosDisponibles.length === 0 && (
                <div className="col-span-3 text-center py-8 text-slate-500">
                  No hay usuarios disponibles para fusionar
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Vista de Comparación */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6 border-l-4 border-blue-500">
            <h2 className="text-lg font-bold text-slate-800 mb-4">👥 Seleccionar usuario para comparar</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Tu cuenta</label>
                <div className="px-4 py-3 bg-blue-50 rounded-lg border border-blue-200 text-slate-800 font-medium">
                  {usuario?.nombre || 'Cargando...'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Comparar con (solo usuarios fusionados)</label>
                <select
                  value={usuarioSeleccionado?._id || usuarioSeleccionado?.usuario?._id || ''}
                  onChange={(e) => {
                    const fusion = fusionesActivas.find(f => {
                      const otro = f.usuarioOrigen._id === (usuario._id || usuario.id) ? f.usuarioDestino : f.usuarioOrigen;
                      return otro._id === e.target.value;
                    });
                    if (fusion) {
                      const otro = fusion.usuarioOrigen._id === (usuario._id || usuario.id) ? fusion.usuarioDestino : fusion.usuarioOrigen;
                      setUsuarioSeleccionado({ ...otro, fusionId: fusion._id });
                    }
                  }}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                >
                  <option value="">Seleccionar usuario fusionado...</option>
                  {fusionesActivas.map(fusion => {
                    const otro = fusion.usuarioOrigen._id === (usuario._id || usuario.id) ? fusion.usuarioDestino : fusion.usuarioOrigen;
                    return (
                      <option key={fusion._id} value={otro._id}>{otro.nombre}</option>
                    );
                  })}
                </select>
                {fusionesActivas.length === 0 && (
                  <p className="text-sm text-orange-600 mt-2">
                    ⚠️ No tienes usuarios fusionados. Ve a "Gestionar Fusiones" para conectar con otros usuarios.
                  </p>
                )}
              </div>
            </div>
          </div>

          {usuarioSeleccionado ? (
            <>
              {/* Filtros */}
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">🔍 Filtros</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Período</label>
                    <select
                      value={filtroFecha}
                      onChange={(e) => setFiltroFecha(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                    >
                      <option value="mes">Este mes</option>
                      <option value="trimestre">Este trimestre</option>
                      <option value="año">Este año</option>
                      <option value="personalizado">Personalizado</option>
                    </select>
                  </div>

                  {filtroFecha === 'personalizado' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Desde</label>
                        <input
                          type="date"
                          value={fechaInicio}
                          onChange={(e) => setFechaInicio(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">Hasta</label>
                        <input
                          type="date"
                          value={fechaFin}
                          onChange={(e) => setFechaFin(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-4 text-slate-600">Cargando datos...</p>
                </div>
              ) : (
                <>
                  {/* Resumen Ejecutivo */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500 rounded-xl p-4 shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">💰</span>
                        <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">Ingresos</span>
                      </div>
                      <p className="text-slate-700 text-sm font-medium">{usuario?.nombre}</p>
                      <p className="text-2xl font-bold text-green-700">{formatear(stats1.totalIngresos)}</p>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500 rounded-xl p-4 shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">💸</span>
                        <span className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded">Gastos</span>
                      </div>
                      <p className="text-slate-700 text-sm font-medium">{usuario?.nombre}</p>
                      <p className="text-2xl font-bold text-red-700">{formatear(stats1.totalGastos)}</p>
                    </div>

                    <div className={`bg-gradient-to-br ${stats2.balance >= 0 ? 'from-blue-50 to-blue-100' : 'from-orange-50 to-orange-100'} border-l-4 ${stats2.balance >= 0 ? 'border-blue-500' : 'border-orange-500'} rounded-xl p-4 shadow-md`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">⚖️</span>
                        <span className={`text-xs px-2 py-1 rounded ${stats2.balance >= 0 ? 'bg-blue-200 text-blue-800' : 'bg-orange-200 text-orange-800'}`}>
                          {stats2.balance >= 0 ? 'Superávit' : 'Déficit'}
                        </span>
                      </div>
                      <p className="text-slate-700 text-sm font-medium">{usuarioSeleccionado?.nombre}</p>
                      <p className={`text-2xl font-bold ${stats2.balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                        {formatear(stats2.balance)}
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500 rounded-xl p-4 shadow-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-3xl">📈</span>
                        <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded">Mi Balance</span>
                      </div>
                      <p className="text-slate-700 text-sm font-medium">{usuario?.nombre}</p>
                      <p className={`text-2xl font-bold ${stats1.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {formatear(stats1.balance)}
                      </p>
                    </div>
                  </div>

                  {/* Gráfico de Comparación - Barras */}
                  <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h3 className="text-xl font-bold text-slate-800 mb-4">📊 Comparativa General</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={datosComparacion}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="nombre" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatear(value)} />
                        <Legend />
                        <Bar dataKey="ingresos" fill="#10b981" name="Ingresos" />
                        <Bar dataKey="gastos" fill="#ef4444" name="Gastos" />
                        <Bar dataKey="balance" fill="#3b82f6" name="Balance" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Gráficos de Gastos por Categoría */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-white rounded-xl shadow-md p-6">
                      <h3 className="text-lg font-bold text-slate-800 mb-4">🗂️ Gastos {usuario?.nombre}</h3>
                      {datosGastosPastel1.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={datosGastosPastel1}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${formatear(value)}`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {datosGastosPastel1.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colores[index % colores.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatear(value)} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-center text-slate-500 py-8">Sin gastos en este período</p>
                      )}
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6">
                      <h3 className="text-lg font-bold text-slate-800 mb-4">🗂️ Gastos {usuarioSeleccionado?.nombre}</h3>
                      {datosGastosPastel2.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={datosGastosPastel2}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${formatear(value)}`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {datosGastosPastel2.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colores[index % colores.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => formatear(value)} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <p className="text-center text-slate-500 py-8">Sin gastos en este período</p>
                      )}
                    </div>
                  </div>

                  {/* Historial de Movimientos */}
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">📅 Últimos Movimientos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-slate-700 mb-3">{usuario?.nombre}</h4>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {transacciones1.slice(0, 10).map((t, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                              <div>
                                <p className="font-medium text-slate-800">{t.categoria}</p>
                                <p className="text-xs text-slate-500">{new Date(t.fecha).toLocaleDateString()}</p>
                              </div>
                              <span className={`font-bold ${t.tipo === 'gasto' ? 'text-red-600' : 'text-green-600'}`}>
                                {t.tipo === 'gasto' ? '-' : '+'}{formatear(t.cantidad)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-slate-700 mb-3">{usuarioSeleccionado?.nombre}</h4>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {transacciones2.slice(0, 10).map((t, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                              <div>
                                <p className="font-medium text-slate-800">{t.categoria}</p>
                                <p className="text-xs text-slate-500">{new Date(t.fecha).toLocaleDateString()}</p>
                              </div>
                              <span className={`font-bold ${t.tipo === 'gasto' ? 'text-red-600' : 'text-green-600'}`}>
                                {t.tipo === 'gasto' ? '-' : '+'}{formatear(t.cantidad)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-12 text-center">
              <span className="text-6xl">👥</span>
              <p className="mt-4 text-slate-600 text-lg">Selecciona un usuario fusionado para comparar</p>
              {fusionesActivas.length === 0 && (
                <button
                  onClick={() => setVistaActual('fusiones')}
                  className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Ir a Gestionar Fusiones
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal de Solicitud */}
      {modalSolicitud && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-800 mb-4">🔗 Enviar Solicitud de Fusión</h3>
            
            <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-2xl">
                {usuarioParaSolicitud?.avatar || '👤'}
              </div>
              <div>
                <p className="font-bold text-slate-800">{usuarioParaSolicitud?.nombre}</p>
                <p className="text-sm text-slate-500">{usuarioParaSolicitud?.email}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Mensaje (opcional)</label>
              <textarea
                value={mensajeSolicitud}
                onChange={(e) => setMensajeSolicitud(e.target.value)}
                placeholder="¡Hola! Me gustaría que fusionáramos cuentas para compartir gastos..."
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-slate-800 resize-none"
                rows={3}
              />
            </div>

            <div className="bg-blue-50 rounded-lg p-3 mb-4 text-sm text-blue-700">
              <p className="font-medium">ℹ️ Al fusionar cuentas podrán:</p>
              <ul className="list-disc ml-4 mt-1 space-y-1">
                <li>Ver transacciones y estadísticas del otro</li>
                <li>Crear gastos, ingresos, metas y ahorros compartidos</li>
                <li>Comparar finanzas entre ambos</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setModalSolicitud(false);
                  setUsuarioParaSolicitud(null);
                  setMensajeSolicitud('');
                }}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
              >
                Cancelar
              </button>
              <button
                onClick={enviarSolicitud}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Enviar Solicitud
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SeccionFusion;
