import React from 'react';
import GastoCard from './GastoCard';

const ListaGastos = ({ gastos, onDelete, onEdit }) => {
  if (!gastos || gastos.length === 0) {
    return (
      <div className="bg-white shadow-lg rounded-xl p-6 text-center text-gray-500">
        <p className="text-lg">No hay gastos registrados aún</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Historial de Gastos</h2>
      {gastos.map((gasto) => (
        <div key={gasto._id || gasto.id} className="relative">
          <GastoCard
            nombre={gasto.nombre}
            valor={gasto.valor}
            fecha={gasto.fecha}
            categoria={gasto.categoria}
            descripcion={gasto.descripcion}
            grupo={gasto.grupo}
            tipo={gasto.tipo}
          />
          <div className="absolute top-6 right-6 flex gap-2">
            <button
              onClick={() => onEdit(gasto)}
              className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200 text-xs font-medium transition"
            >
              Editar
            </button>
            <button
              onClick={() => onDelete(gasto._id || gasto.id)}
              className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 text-xs font-medium transition"
            >
              Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListaGastos;
