import React, { useState } from 'react';
import { categoriasPredeterminadas, coloresDisponibles, frecuenciasRecurrencia } from '../utils/constantes';

const ModalNuevo = ({ visible, onCerrar, cuentas, onGuardar }) => {
  const [tipoTransaccion, setTipoTransaccion] = useState('gasto');
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const [formData, setFormData] = useState({
    categoria: '',
    cantidad: '',
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
    anotaciones: '',
    esRecurrente: false,
    frecuenciaRecurrencia: '',
    tieneRecordatorio: false,
    cuentaOrigen: '',
    cuentaDestino: '',
    colorIcono: '#3B82F6',
    grupo: 'personal',
    esGrupal: false,
  });

  const categorias = tipoTransaccion === 'gasto' 
    ? categoriasPredeterminadas.gastos 
    : tipoTransaccion === 'ingreso' 
    ? categoriasPredeterminadas.ingresos 
    : [];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.cantidad) {
      alert('Por favor ingresa la cantidad');
      return;
    }

    onGuardar({
      ...formData,
      tipo: tipoTransaccion,
      cantidad: parseFloat(formData.cantidad),
    });

    // Reset
    setFormData({
      categoria: '',
      cantidad: '',
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
      anotaciones: '',
      esRecurrente: false,
      frecuenciaRecurrencia: '',
      tieneRecordatorio: false,
      cuentaOrigen: '',
      cuentaDestino: '',
      colorIcono: '#3B82F6',
      grupo: 'personal',
      esGrupal: false,
    });
    onCerrar();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">Nueva Transacción</h2>
          <button onClick={onCerrar} className="p-2 hover:bg-gray-100 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs de tipo */}
        <div className="flex border-b border-gray-200">
          {['gasto', 'ingreso', 'transferencia'].map((tipo) => (
            <button
              key={tipo}
              onClick={() => setTipoTransaccion(tipo)}
              className={`flex-1 py-3 font-medium transition ${
                tipoTransaccion === tipo
                  ? tipo === 'gasto' ? 'text-red-600 border-b-2 border-red-600' 
                  : tipo === 'ingreso' ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
            </button>
          ))}
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Categoría (solo para gasto/ingreso) */}
          {tipoTransaccion !== 'transferencia' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
              <div className="grid grid-cols-3 gap-2">
                {categorias.map((cat) => (
                  <button
                    key={cat.nombre}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, categoria: cat.nombre, colorIcono: cat.color }))}
                    className={`p-3 rounded-xl border-2 transition flex flex-col items-center ${
                      formData.categoria === cat.nombre
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-2xl">{cat.icono}</span>
                    <span className="text-xs mt-1 text-gray-600">{cat.nombre}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cuentas para transferencia */}
          {tipoTransaccion === 'transferencia' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta Origen</label>
                <select
                  name="cuentaOrigen"
                  value={formData.cuentaOrigen}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar cuenta</option>
                  {cuentas.map((c) => (
                    <option key={c._id} value={c._id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta Destino</label>
                <select
                  name="cuentaDestino"
                  value={formData.cuentaDestino}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar cuenta</option>
                  {cuentas.map((c) => (
                    <option key={c._id} value={c._id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {/* Cuenta para gasto/ingreso */}
          {tipoTransaccion !== 'transferencia' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">¿De qué cuenta?</label>
              <select
                name="cuentaOrigen"
                value={formData.cuentaOrigen}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccionar cuenta</option>
                {cuentas.map((c) => (
                  <option key={c._id} value={c._id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          )}

          {/* Cantidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
            <input
              type="number"
              name="cantidad"
              value={formData.cantidad}
              onChange={handleChange}
              placeholder="0"
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-2xl font-bold text-center"
              required
            />
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
              <input
                type="time"
                name="hora"
                value={formData.hora}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Individual/Grupal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, esGrupal: false, grupo: 'personal' }))}
                className={`flex-1 py-2 rounded-lg border-2 transition ${
                  !formData.esGrupal ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'
                }`}
              >
                Individual
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, esGrupal: true }))}
                className={`flex-1 py-2 rounded-lg border-2 transition ${
                  formData.esGrupal ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200'
                }`}
              >
                Grupal
              </button>
            </div>
          </div>

          {formData.esGrupal && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grupo</label>
              <select
                name="grupo"
                value={formData.grupo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="familia">Familia</option>
                <option value="trabajo">Trabajo</option>
                <option value="amigos">Amigos</option>
              </select>
            </div>
          )}

          {/* Opciones adicionales */}
          <button
            type="button"
            onClick={() => setMostrarOpciones(!mostrarOpciones)}
            className="w-full py-2 text-blue-600 font-medium flex items-center justify-center gap-2"
          >
            {mostrarOpciones ? 'Ocultar opciones' : 'Más opciones'}
            <svg className={`w-4 h-4 transition ${mostrarOpciones ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {mostrarOpciones && (
            <div className="space-y-4 border-t border-gray-200 pt-4">
              {/* Anotaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Anotaciones</label>
                <textarea
                  name="anotaciones"
                  value={formData.anotaciones}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Notas adicionales..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Recurrencia */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">¿Se repite?</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="esRecurrente"
                    checked={formData.esRecurrente}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {formData.esRecurrente && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Frecuencia</label>
                  <select
                    name="frecuenciaRecurrencia"
                    value={formData.frecuenciaRecurrencia}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar</option>
                    {frecuenciasRecurrencia.map((f) => (
                      <option key={f.valor} value={f.valor}>{f.nombre}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Recordatorio */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Recordatorio</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="tieneRecordatorio"
                    checked={formData.tieneRecordatorio}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Color del icono */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color del icono</label>
                <div className="flex gap-2 flex-wrap">
                  {coloresDisponibles.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, colorIcono: color }))}
                      className={`w-8 h-8 rounded-full border-2 transition ${
                        formData.colorIcono === color ? 'border-gray-800 scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Botón guardar */}
          <button
            type="submit"
            className={`w-full py-3 rounded-xl font-bold text-white transition ${
              tipoTransaccion === 'gasto' ? 'bg-red-500 hover:bg-red-600' 
              : tipoTransaccion === 'ingreso' ? 'bg-green-500 hover:bg-green-600'
              : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            Guardar {tipoTransaccion}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ModalNuevo;
