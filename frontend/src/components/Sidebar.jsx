import React from 'react';

const menuItems = [
  { id: 'dashboard', nombre: 'Dashboard', icono: '📊' },
  { id: 'transacciones', nombre: 'Transacciones', icono: '💸' },
  { id: 'cuentas', nombre: 'Cuentas', icono: '🏦' },
  { id: 'prestamos', nombre: 'Préstamos', icono: '📋' },
  { id: 'presupuestos', nombre: 'Presupuestos', icono: '📊' },
  { id: 'metas', nombre: 'Metas', icono: '🎯' },
  { id: 'ahorroscompartidos', nombre: 'Ahorros Compartidos', icono: '🏦' },
  { id: 'fusion', nombre: 'Fusión Cuentas', icono: '🔄' },
  { id: 'anotaciones', nombre: 'Anotaciones', icono: '📝' },
  { id: 'notificaciones', nombre: 'Notificaciones', icono: '🔔' },
  { id: 'configuracion', nombre: 'Configuración', icono: '⚙️' },
];

const Sidebar = ({ seccionActiva, onCambiarSeccion, visible, onCerrar }) => {
  return (
    <>
      {/* Overlay móvil */}
      {visible && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onCerrar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 lg:transform-none ${
          visible ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-4 border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-gray-800">💰 FinanzasApp</span>
            <button onClick={onCerrar} className="p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="p-4 space-y-1 h-full overflow-y-auto scrollbar-hide flex flex-col">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onCambiarSeccion(item.id);
                  onCerrar();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium text-left ${
                  seccionActiva === item.id
                    ? 'bg-blue-100 text-blue-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl flex-shrink-0 w-6 text-center">{item.icono}</span>
                <span className="flex-1">{item.nombre}</span>
              </button>
            ))}
          </div>
        </nav>

      </aside>
    </>
  );
};

export default Sidebar;
