


const GastoCard = ({ nombre, valor, fecha, categoria, descripcion, grupo, tipo }) => {
  // Formato de moneda CLP
  const valorFormateado = valor?.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 });
  const icono = tipo === 'gasto' ? (
    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ) : (
    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  );

  return (
    <div className="flex items-center bg-white shadow-lg rounded-xl p-5 mb-6 border border-gray-200 hover:shadow-xl transition-shadow">
      <div className="mr-4 flex-shrink-0">
        {icono}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-lg font-bold text-gray-800">{nombre}</h2>
          <span className={`text-sm font-semibold px-2 py-1 rounded ${tipo === 'gasto' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{tipo}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xl font-bold text-blue-700">{valorFormateado}</span>
          <span className="text-xs text-gray-400">{new Date(fecha).toLocaleDateString()}</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-2">
          <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">{categoria}</span>
          {grupo && <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">{grupo}</span>}
        </div>
        {descripcion && <p className="text-gray-500 text-sm mb-2">{descripcion}</p>}
        <div className="flex gap-2 mt-2">
          <button className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200 text-xs font-medium transition">Editar</button>
          <button className="bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 text-xs font-medium transition">Eliminar</button>
        </div>
      </div>
    </div>
  );
};

export default GastoCard;