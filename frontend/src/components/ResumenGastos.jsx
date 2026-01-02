import React from 'react';

const ResumenGastos = ({ gastos }) => {
  if (!gastos || gastos.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Total Gastos</p>
          <p className="text-3xl font-bold text-red-600">$0</p>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Total Ingresos</p>
          <p className="text-3xl font-bold text-green-600">$0</p>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Balance</p>
          <p className="text-3xl font-bold text-blue-600">$0</p>
        </div>
      </div>
    );
  }

  const totalGastos = gastos
    .filter(g => g.tipo === 'gasto')
    .reduce((sum, g) => sum + g.valor, 0);
  
  const totalIngresos = gastos
    .filter(g => g.tipo === 'ingreso')
    .reduce((sum, g) => sum + g.valor, 0);
  
  const balance = totalIngresos - totalGastos;

  const formatearMoneda = (valor) =>
    valor.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 });

  const porCategoria = gastos.reduce((acc, g) => {
    if (!acc[g.categoria]) acc[g.categoria] = 0;
    if (g.tipo === 'gasto') acc[g.categoria] += g.valor;
    return acc;
  }, {});

  return (
    <div className="space-y-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white shadow-lg rounded-xl p-6 border border-red-200">
          <p className="text-sm text-gray-600 mb-2">Total Gastos</p>
          <p className="text-3xl font-bold text-red-600">{formatearMoneda(totalGastos)}</p>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6 border border-green-200">
          <p className="text-sm text-gray-600 mb-2">Total Ingresos</p>
          <p className="text-3xl font-bold text-green-600">{formatearMoneda(totalIngresos)}</p>
        </div>
        <div className={`bg-white shadow-lg rounded-xl p-6 border-2 ${balance >= 0 ? 'border-green-200' : 'border-red-200'}`}>
          <p className="text-sm text-gray-600 mb-2">Balance</p>
          <p className={`text-3xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatearMoneda(Math.abs(balance))}
          </p>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Gastos por Categoría</h3>
        <div className="space-y-2">
          {Object.entries(porCategoria).map(([categoria, valor]) => (
            <div key={categoria} className="flex justify-between items-center">
              <span className="text-gray-700">{categoria}</span>
              <span className="font-semibold text-red-600">{formatearMoneda(valor)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResumenGastos;
