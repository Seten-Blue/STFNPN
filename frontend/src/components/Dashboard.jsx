import React from 'react';
import { formatearMoneda } from '../utils/constantes';

const TarjetaResumen = ({ titulo, valor, icono, color, subtitulo }) => {
  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{titulo}</p>
          <p className={`text-2xl font-bold ${color}`}>{formatearMoneda(valor)}</p>
          {subtitulo && <p className="text-xs text-gray-400 mt-1">{subtitulo}</p>}
        </div>
        <span className="text-3xl">{icono}</span>
      </div>
    </div>
  );
};

const Dashboard = ({ transacciones, cuentas, presupuestos, periodo, grupo, esGrupal, sujetoActivo = 'Sujeto 1' }) => {
  // Filtrar por sujeto activo
  const transaccionesDelSujeto = transacciones.filter(t => t.sujeto === sujetoActivo);
  const cuentasDelSujeto = cuentas.filter(c => c.sujeto === sujetoActivo);
  const presupuestosDelSujeto = presupuestos.filter(p => p.sujeto === sujetoActivo);

  // Calcular totales
  const totalIngresos = transaccionesDelSujeto
    .filter(t => t.tipo === 'ingreso')
    .reduce((sum, t) => sum + t.cantidad, 0);
  
  const totalGastos = transaccionesDelSujeto
    .filter(t => t.tipo === 'gasto')
    .reduce((sum, t) => sum + t.cantidad, 0);
  
  const balance = totalIngresos - totalGastos;

  const saldoTotal = cuentasDelSujeto.reduce((sum, c) => sum + c.saldo, 0);

  // Gastos por categoría
  const gastosPorCategoria = transaccionesDelSujeto
    .filter(t => t.tipo === 'gasto')
    .reduce((acc, t) => {
      if (!acc[t.categoria]) acc[t.categoria] = 0;
      acc[t.categoria] += t.cantidad;
      return acc;
    }, {});

  const categoriasOrdenadas = Object.entries(gastosPorCategoria)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxGasto = Math.max(...Object.values(gastosPorCategoria), 1);

  // Información de sujeto
  const sujetoInfo = sujetoActivo || 'Selecciona un sujeto';

  return (
    <div className="space-y-6 min-h-screen bg-[#f3f4f6]">
      {/* Resumen de sujetos */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <p className="text-sm text-gray-600">
          <span className="font-medium text-gray-800">Mostrando datos de:</span> <span className="font-bold text-blue-600">{sujetoInfo}</span>
        </p>
      </div>

      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <TarjetaResumen
          titulo="Ingresos"
          valor={totalIngresos}
          icono="📈"
          color="text-teal-600"
        />
        <TarjetaResumen
          titulo="Gastos"
          valor={totalGastos}
          icono="📉"
          color="text-slate-600"
        />
        <TarjetaResumen
          titulo="Balance"
          valor={balance}
          icono={balance >= 0 ? "✅" : "⚠️"}
          color={balance >= 0 ? "text-teal-600" : "text-slate-600"}
        />
        <TarjetaResumen
          titulo="Saldo Total"
          valor={saldoTotal}
          icono="💰"
          color="text-slate-700"
        />
      </div>

      {/* Comparativo y Cuentas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Comparativo Ingresos vs Gastos */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Comparativo</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Ingresos</span>
                <span className="text-teal-600 font-medium">{formatearMoneda(totalIngresos)}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 rounded-full transition-all"
                  style={{ width: `${totalIngresos > 0 ? (totalIngresos / (totalIngresos + totalGastos) * 100) : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Gastos</span>
                <span className="text-slate-600 font-medium">{formatearMoneda(totalGastos)}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-600 rounded-full transition-all"
                  style={{ width: `${totalGastos > 0 ? (totalGastos / (totalIngresos + totalGastos) * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Saldo por cuenta */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Cuentas</h3>
          {cuentasDelSujeto.length === 0 ? (
            <p className="text-gray-500 text-sm">No hay cuentas registradas para este sujeto</p>
          ) : (
            <div className="space-y-3">
              {cuentasDelSujeto.map((cuenta) => (
                <div key={cuenta._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: cuenta.color || '#3B82F6' }}
                    >
                      {cuenta.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{cuenta.nombre}</p>
                      <p className="text-xs text-gray-500">{cuenta.entidad || cuenta.tipo}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${cuenta.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatearMoneda(cuenta.saldo)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Gastos por categoría */}
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">Top Gastos por Categoría</h3>
        {categoriasOrdenadas.length === 0 ? (
          <p className="text-gray-500 text-sm">No hay gastos registrados</p>
        ) : (
          <div className="space-y-3">
            {categoriasOrdenadas.map(([categoria, valor]) => (
              <div key={categoria}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{categoria}</span>
                  <span className="text-gray-600 font-medium">{formatearMoneda(valor)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-red-400 to-red-600 rounded-full"
                    style={{ width: `${(valor / maxGasto) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Presupuestos */}
      {presupuestos.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-4">Presupuestos</h3>
          <div className="space-y-4">
            {presupuestos.map((p) => (
              <div key={p._id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">
                    {p.tipo === 'maxima_perdida' ? '🛑 Máx. Pérdida' : '🎯 Objetivo'} ({p.periodo})
                  </span>
                  <span className={`font-medium ${p.excedido ? 'text-red-600' : 'text-gray-600'}`}>
                    {formatearMoneda(p.gastado || 0)} / {formatearMoneda(p.monto)}
                  </span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      p.porcentajeUsado > 100 ? 'bg-red-500' : p.porcentajeUsado > 80 ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(p.porcentajeUsado || 0, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
