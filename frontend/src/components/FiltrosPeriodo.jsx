import React from 'react';

const FiltrosPeriodo = ({ periodo, setPeriodo, fecha, setFecha }) => {
  const periodos = [
    { valor: 'dia', nombre: 'Día' },
    { valor: 'mes', nombre: 'Mes' },
    { valor: 'anio', nombre: 'Año' },
  ];

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Período */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Ver por:</span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {periodos.map((p) => (
              <button
                key={p.valor}
                onClick={() => setPeriodo(p.valor)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                  periodo === p.valor ? 'bg-white text-slate-700 shadow-sm font-semibold' : 'text-gray-600'
                }`}
              >
                {p.nombre}
              </button>
            ))}
          </div>
        </div>

        {/* Fecha */}
        <div>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default FiltrosPeriodo;
