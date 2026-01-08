import React, { useState } from 'react';

const SelectorSujetos = ({ sujetos, sujetoActivo, onCambiarSujeto, onAgregarSujeto }) => {
  const [mostrarAgregarSujeto, setMostrarAgregarSujeto] = useState(false);
  const [nuevoSujeto, setNuevoSujeto] = useState('');

  const handleAgregarSujeto = () => {
    if (nuevoSujeto.trim()) {
      onAgregarSujeto(nuevoSujeto.trim());
      setNuevoSujeto('');
      setMostrarAgregarSujeto(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-800">Sujeto Activo</h3>
        <button
          onClick={() => setMostrarAgregarSujeto(!mostrarAgregarSujeto)}
          className="text-sm bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition"
        >
          + Agregar
        </button>
      </div>

      {/* Formulario agregar sujeto */}
      {mostrarAgregarSujeto && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <input
            type="text"
            value={nuevoSujeto}
            onChange={(e) => setNuevoSujeto(e.target.value)}
            placeholder="Nombre del sujeto"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-2"
            onKeyPress={(e) => e.key === 'Enter' && handleAgregarSujeto()}
          />
          <div className="flex gap-2">
            <button
              onClick={handleAgregarSujeto}
              className="flex-1 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              Guardar
            </button>
            <button
              onClick={() => {
                setMostrarAgregarSujeto(false);
                setNuevoSujeto('');
              }}
              className="flex-1 bg-gray-300 text-gray-700 px-3 py-1 rounded-lg hover:bg-gray-400 transition text-sm font-medium"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de sujetos */}
      <div className="flex flex-wrap gap-2">
        {sujetos.length === 0 ? (
          <p className="text-sm text-gray-500 w-full">No hay sujetos. Crea uno para comenzar.</p>
        ) : (
          sujetos.map((sujeto) => (
            <button
              key={sujeto.id}
              onClick={() => onCambiarSujeto(sujeto.id)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                sujetoActivo === sujeto.id
                  ? 'bg-blue-600 text-white border border-blue-700'
                  : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
              }`}
            >
              {sujeto.nombre}
            </button>
          ))
        )}
      </div>

      {/* Info de sujeto activo */}
      {sujetoActivo && (
        <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700 font-medium">
            Sujeto activo: <span className="font-bold">{sujetos.find(s => s.id === sujetoActivo)?.nombre}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default SelectorSujetos;
