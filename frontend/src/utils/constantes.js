// Categorías predeterminadas
export const categoriasPredeterminadas = {
  gastos: [
    { nombre: 'Alimentos', icono: '🍕', color: '#EF4444' },
    { nombre: 'Transporte', icono: '🚗', color: '#F59E0B' },
    { nombre: 'Entretenimiento', icono: '🎬', color: '#8B5CF6' },
    { nombre: 'Servicios', icono: '💡', color: '#3B82F6' },
    { nombre: 'Salud', icono: '🏥', color: '#10B981' },
    { nombre: 'Educación', icono: '📚', color: '#6366F1' },
    { nombre: 'Ropa', icono: '👕', color: '#EC4899' },
    { nombre: 'Hogar', icono: '🏠', color: '#14B8A6' },
    { nombre: 'Otros', icono: '📦', color: '#6B7280' },
  ],
  ingresos: [
    { nombre: 'Salario', icono: '💼', color: '#10B981' },
    { nombre: 'Freelance', icono: '💻', color: '#3B82F6' },
    { nombre: 'Inversiones', icono: '📈', color: '#8B5CF6' },
    { nombre: 'Regalo', icono: '🎁', color: '#EC4899' },
    { nombre: 'Otros', icono: '💰', color: '#6B7280' },
  ],
};

// Colores disponibles
export const coloresDisponibles = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#6366F1', '#14B8A6', '#F97316', '#84CC16',
];

// Monedas disponibles
export const monedasDisponibles = [
  { codigo: 'CLP', nombre: 'Peso Chileno', simbolo: '$' },
  { codigo: 'USD', nombre: 'Dólar Estadounidense', simbolo: '$' },
  { codigo: 'EUR', nombre: 'Euro', simbolo: '€' },
  { codigo: 'COP', nombre: 'Peso Colombiano', simbolo: '$' },
  { codigo: 'MXN', nombre: 'Peso Mexicano', simbolo: '$' },
  { codigo: 'ARS', nombre: 'Peso Argentino', simbolo: '$' },
];

// Frecuencias de recurrencia
export const frecuenciasRecurrencia = [
  { valor: 'diario', nombre: 'Diario' },
  { valor: 'semanal', nombre: 'Semanal' },
  { valor: 'quincenal', nombre: 'Quincenal' },
  { valor: 'mensual', nombre: 'Mensual' },
  { valor: 'anual', nombre: 'Anual' },
];

// Tipos de cuenta
export const tiposCuenta = [
  { valor: 'banco', nombre: 'Cuenta Bancaria', icono: '🏦' },
  { valor: 'efectivo', nombre: 'Efectivo', icono: '💵' },
  { valor: 'tarjeta', nombre: 'Tarjeta de Crédito', icono: '💳' },
  { valor: 'inversion', nombre: 'Inversión', icono: '📈' },
  { valor: 'otro', nombre: 'Otro', icono: '💰' },
];

// Formatear moneda
export const formatearMoneda = (valor, moneda = 'CLP') => {
  return valor?.toLocaleString('es-CL', {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: 0,
  }) || '$0';
};

// Formatear fecha
export const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

// Formatear hora
export const formatearHora = (hora) => {
  return hora || new Date().toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
