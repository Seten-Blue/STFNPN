import React from 'react';
import { formatearMoneda, formatearFecha } from '../utils/constantes';
import { categoriasPredeterminadas } from '../utils/constantes';

const ListaTransacciones = ({ transacciones, onEditar, onEliminar }) => {
  const obtenerIconoCategoria = (categoria, tipo) => {
    const categorias = tipo === 'ingreso' ? categoriasPredeterminadas.ingresos : categoriasPredeterminadas.gastos;
    const cat = categorias.find(c => c.nombre === categoria);
    return cat?.icono || '📦';
  };

  const agruparPorFecha = (transacciones) => {
    const grupos = {};
    transacciones.forEach(t => {
      const fecha = new Date(t.fecha).toDateString();
      if (!grupos[fecha]) grupos[fecha] = [];
      grupos[fecha].push(t);
    });
    return grupos;
  };

  const transaccionesAgrupadas = agruparPorFecha(transacciones);

  if (transacciones.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
        <span className="text-5xl mb-4 block">📭</span>
        <p className="text-gray-800">No hay transacciones registradas</p>
        <p className="text-gray-700 text-sm mt-1">Agrega tu primer ingreso o gasto</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {Object.entries(transaccionesAgrupadas).map(([fecha, items]) => (
        <div key={fecha} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-800">
              {formatearFecha(fecha)}
            </p>
          </div>
          <div className="divide-y divide-gray-50">
            {items.map((t) => (
              <div key={t._id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${t.colorIcono}20` }}
                  >
                    {t.tipo === 'transferencia' ? '🔄' : obtenerIconoCategoria(t.categoria, t.tipo)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {t.tipo === 'transferencia' ? 'Transferencia' : t.categoria}
                    </p>
                    <p className="text-xs text-gray-800">
                      {t.hora} {t.esGrupal && <span className="text-blue-500">• {t.grupo}</span>}
                    </p>
                    {t.anotaciones && (
                      <p className="text-xs text-gray-700 mt-0.5">{t.anotaciones}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-bold ${
                    t.tipo === 'ingreso' ? 'text-teal-600' : t.tipo === 'gasto' ? 'text-slate-600' : 'text-slate-700'
                  }`}>
                    {t.tipo === 'ingreso' ? '+' : t.tipo === 'gasto' ? '-' : ''}{formatearMoneda(t.cantidad)}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => onEditar(t)}
                      className="p-2 text-gray-700 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onEliminar(t._id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListaTransacciones;
