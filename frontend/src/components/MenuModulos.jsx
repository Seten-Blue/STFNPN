import React from 'react';

const menuItems = [
  { id: 'dashboard', nombre: 'Dashboard', icono: '📊', descripcion: 'Resumen financiero' },
  { id: 'transacciones', nombre: 'Transacciones', icono: '💸', descripcion: 'Gestiona tus movimientos' },
  { id: 'cuentas', nombre: 'Cuentas', icono: '🏦', descripcion: 'Administra cuentas' },
  { id: 'prestamos', nombre: 'Préstamos', icono: '📋', descripcion: 'Control de préstamos' },
  { id: 'presupuestos', nombre: 'Presupuestos', icono: '📊', descripcion: 'Planifica gastos' },
  { id: 'metas', nombre: 'Metas', icono: '🎯', descripcion: 'Define objetivos' },
  { id: 'ahorroscompartidos', nombre: 'Ahorros Compartidos', icono: '🏦', descripcion: 'Fondos colectivos' },
  { id: 'fusion', nombre: 'Fusión Cuentas', icono: '🔄', descripcion: 'Unificar cuentas' },
  { id: 'anotaciones', nombre: 'Anotaciones', icono: '📝', descripcion: 'Notas y recordatorios' },
  { id: 'notificaciones', nombre: 'Notificaciones', icono: '🔔', descripcion: 'Alertas' },
  { id: 'configuracion', nombre: 'Configuración', icono: '⚙️', descripcion: 'Ajustes' },
];

const MenuModulos = ({ visible, onCambiarSeccion, onCerrar }) => {
  if (!visible) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-30 lg:hidden"
        onClick={onCerrar}
      />

      {/* Menú desplegable */}
      <div className="fixed top-16 left-0 right-0 z-40 bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onCambiarSeccion(item.id);
                  onCerrar();
                }}
                className="flex flex-col items-center p-4 rounded-lg hover:bg-blue-50 transition group"
              >
                <span className="text-3xl mb-2 group-hover:scale-110 transition">{item.icono}</span>
                <span className="text-xs font-semibold text-gray-800 text-center">{item.nombre}</span>
                <span className="text-xs text-gray-500 text-center mt-1 hidden sm:block">{item.descripcion}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default MenuModulos;
