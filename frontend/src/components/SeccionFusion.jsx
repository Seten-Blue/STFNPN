import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { transaccionesAPI } from '../services/api';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';

function SeccionFusion() {
  const { usuario, usuarios } = useAuth();
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [transacciones1, setTransacciones1] = useState([]);
  const [transacciones2, setTransacciones2] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroFecha, setFiltroFecha] = useState('mes');
  const [fechaInicio, setFechaInicio] = useState(new Date(new Date().setDate(1)).toISOString().split('T')[0]);
  const [fechaFin, setFechaFin] = useState(new Date().toISOString().split('T')[0]);

  const colores = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];

  useEffect(() => {
    if (usuarioSeleccionado && usuario) {
      cargarDatos();
    }
  }, [usuarioSeleccionado, filtroFecha, fechaInicio, fechaFin]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const filtros = {
        periodo: filtroFecha,
        usuarioId: usuario.id,
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

      filtros.usuarioId = usuarioSeleccionado._id;
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

    const ingresosPorCategoria = {};
    ingresos.forEach(t => {
      const cat = t.categoria || 'Sin categoría';
      ingresosPorCategoria[cat] = (ingresosPorCategoria[cat] || 0) + (t.cantidad || 0);
    });

    return {
      totalGastos,
      totalIngresos,
      balance,
      gastos,
      ingresos,
      gastosPorCategoria,
      ingresosPorCategoria,
      cantidadTransacciones: transacciones.length
    };
  };

  const stats1 = calcularEstadisticas(transacciones1);
  const stats2 = calcularEstadisticas(transacciones2);

  const datosComparacion = [
    {
      nombre: usuario?.nombre || 'Usuario 1',
      ingresos: stats1.totalIngresos,
      gastos: stats1.totalGastos,
      balance: stats1.balance
    },
    {
      nombre: usuarioSeleccionado?.nombre || 'Usuario 2',
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

  const diferenciasValores = {
    ingresos: stats2.totalIngresos - stats1.totalIngresos,
    gastos: stats2.totalGastos - stats1.totalGastos,
    balance: stats2.balance - stats1.balance
  };

  const diferenciasProcentaje = {
    ingresos: stats1.totalIngresos !== 0 ? ((diferenciasValores.ingresos / stats1.totalIngresos) * 100).toFixed(2) : 0,
    gastos: stats1.totalGastos !== 0 ? ((diferenciasValores.gastos / stats1.totalGastos) * 100).toFixed(2) : 0,
    balance: stats1.balance !== 0 ? ((diferenciasValores.balance / Math.abs(stats1.balance)) * 100).toFixed(2) : 0
  };

  const formatear = (num) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'COP' }).format(num);
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">🔄 Fusión & Comparativa de Cuentas</h1>
        <p className="text-slate-600">Análisis detallado y comparación entre usuarios</p>
      </div>

      {/* Selector de usuario */}
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
            <label className="block text-sm font-medium text-slate-700 mb-2">Comparar con</label>
            <select
              value={usuarioSeleccionado?._id || ''}
              onChange={(e) => {
                const u = usuarios.find(usr => usr._id === e.target.value);
                setUsuarioSeleccionado(u);
              }}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-slate-800"
            >
              <option value="">Seleccionar usuario...</option>
              {usuarios.filter(u => u._id !== usuario?.id).map(u => (
                <option key={u._id} value={u._id}>{u.nombre}</option>
              ))}
            </select>
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

                <div className={`bg-gradient-to-br ${Math.max(stats1.totalGastos, stats2.totalGastos) > Math.max(stats1.totalIngresos, stats2.totalIngresos) ? 'from-yellow-50 to-yellow-100 border-l-4 border-yellow-500' : 'from-green-50 to-green-100 border-l-4 border-green-500'} rounded-xl p-4 shadow-md`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{Math.max(stats1.totalGastos, stats2.totalGastos) > Math.max(stats1.totalIngresos, stats2.totalIngresos) ? '⚠️' : '✅'}</span>
                    <span className="text-xs bg-slate-200 text-slate-800 px-2 py-1 rounded">Estado</span>
                  </div>
                  <p className="text-slate-700 text-sm font-medium">Finanzas</p>
                  <p className="text-lg font-bold text-slate-800">
                    {Math.max(stats1.totalGastos, stats2.totalGastos) > Math.max(stats1.totalIngresos, stats2.totalIngresos)
                      ? 'Gastos ⬆️'
                      : 'Equilibrio ✓'}
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

              {/* Diferencias */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-green-500">
                  <h4 className="text-sm font-medium text-slate-600 mb-2">Diferencia Ingresos</h4>
                  <p className="text-2xl font-bold text-slate-800">{formatear(diferenciasValores.ingresos)}</p>
                  <p className={`text-sm ${diferenciasValores.ingresos >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {diferenciasValores.ingresos >= 0 ? '+' : ''}{diferenciasProcentaje.ingresos}%
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-red-500">
                  <h4 className="text-sm font-medium text-slate-600 mb-2">Diferencia Gastos</h4>
                  <p className="text-2xl font-bold text-slate-800">{formatear(diferenciasValores.gastos)}</p>
                  <p className={`text-sm ${diferenciasValores.gastos <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {diferenciasValores.gastos >= 0 ? '+' : ''}{diferenciasProcentaje.gastos}%
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-t-4 border-blue-500">
                  <h4 className="text-sm font-medium text-slate-600 mb-2">Diferencia Balance</h4>
                  <p className="text-2xl font-bold text-slate-800">{formatear(diferenciasValores.balance)}</p>
                  <p className={`text-sm ${diferenciasValores.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {diferenciasValores.balance >= 0 ? '+' : ''}{diferenciasProcentaje.balance}%
                  </p>
                </div>
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

              {/* Detalle de Categorías */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">📋 Detalle Gastos - {usuario?.nombre}</h3>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {Object.entries(stats1.gastosPorCategoria)
                      .sort(([, a], [, b]) => b - a)
                      .map(([categoria, monto], idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                          <span className="font-medium text-slate-700">{categoria}</span>
                          <span className="text-red-600 font-bold">{formatear(monto)}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">📋 Detalle Gastos - {usuarioSeleccionado?.nombre}</h3>
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {Object.entries(stats2.gastosPorCategoria)
                      .sort(([, a], [, b]) => b - a)
                      .map(([categoria, monto], idx) => (
                        <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                          <span className="font-medium text-slate-700">{categoria}</span>
                          <span className="text-red-600 font-bold">{formatear(monto)}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Historial de Movimientos */}
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">📅 Historial de Movimientos</h3>
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
          <p className="mt-4 text-slate-600 text-lg">Selecciona un usuario para comenzar la comparativa</p>
        </div>
      )}
    </div>
  );
}

export default SeccionFusion;
