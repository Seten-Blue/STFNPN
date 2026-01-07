import { useState } from 'react';
import { transaccionesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotificaciones } from '../context/NotificacionesContext';

function ModalIngresoCompartido({ visible, onCerrar, cuentas, usuarios, onCrear }) {
  const { usuario } = useAuth();
  const { cargarConteo } = useNotificaciones();
  const [formData, setFormData] = useState({
    concepto: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
    categoria: 'Ingreso Compartido',
    participantes: {},
    tipoDistribucion: 'equitativa',
    cuentaDestino: cuentas[0]?._id || '',
    anotaciones: '',
    esProgramada: false,
    fechaProgramada: new Date().toISOString().split('T')[0],
    diferirCuotas: false,
    numeroCuotas: 1,
    miPago: '',
  });

  const participantesDisponibles = usuario ? [usuario, ...usuarios.filter(u => {
    // Normalizar IDs a string para comparación correcta
    const uId = typeof u._id === 'string' ? u._id : u._id?.toString?.() || u.id;
    const usuarioIdStr = typeof usuario._id === 'string' ? usuario._id : usuario._id?.toString?.();
    return uId !== usuarioIdStr;
  })] : [];

  // Función para normalizar IDs a string
  const normalizarId = (id) => {
    if (typeof id === 'string') return id;
    if (id?._id) return id._id.toString();
    if (id?.toString) return id.toString();
    return String(id);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleParticipante = (usuarioId) => {
    // Normalizar el ID para que sea string
    const idNormalizado = normalizarId(usuarioId);
    setFormData(prev => {
      // Verificar si el participante existe en el objeto (no si su valor es > 0)
      const isSelected = idNormalizado in prev.participantes;
      const newParticipantes = { ...prev.participantes };
      
      if (isSelected) {
        delete newParticipantes[idNormalizado];
      } else {
        newParticipantes[idNormalizado] = 0;
      }
      
      return {
        ...prev,
        participantes: newParticipantes
      };
    });
  };

  const handleMontoParticipante = (usuarioId, nuevoMonto) => {
    setFormData(prev => ({
      ...prev,
      participantes: {
        ...prev.participantes,
        [usuarioId]: parseFloat(nuevoMonto) || 0
      }
    }));
  };

  const calcularTotalParticipantes = () => {
    return Object.values(formData.participantes).reduce((sum, m) => sum + m, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.concepto || !formData.monto) {
        alert('Por favor completa los campos obligatorios');
        return;
      }

      if (!formData.cuentaDestino) {
        alert('Selecciona una cuenta destino');
        return;
      }

      // Validar que hay participantes seleccionados
      let participantesSeleccionados = Object.keys(formData.participantes);
      const usuarioId = normalizarId(usuario._id || usuario.id);
      
      // Asegurar que el usuario actual siempre está incluido
      if (!participantesSeleccionados.includes(usuarioId)) {
        participantesSeleccionados.push(usuarioId);
      }
      
      if (participantesSeleccionados.length < 2) {
        alert('Selecciona al menos un participante adicional además de ti');
        return;
      }

      const montoTotal = parseFloat(formData.monto);
      
      // LÓGICA CORRECTA DE DISTRIBUCIÓN PARA INGRESOS:
      let participantesConMonto = {};
      
      if (formData.tipoDistribucion === 'equitativa') {
        // Equitativa: dividir equitativamente, opcionalmente especificando miPago
        const miPago = formData.miPago ? parseFloat(formData.miPago) : (montoTotal / participantesSeleccionados.length);
        
        if (formData.miPago) {
          // Usuario especifica cuánto le corresponde
          if (miPago <= 0 || miPago > montoTotal) {
            alert('Tu pago debe ser mayor a 0 y no mayor al monto total');
            return;
          }
          
          const montoRestante = montoTotal - miPago;
          const otrosParticipantes = participantesSeleccionados.filter(id => id !== usuarioId);
          
          participantesConMonto[usuarioId] = miPago;
          const pagoPorOtro = montoRestante / otrosParticipantes.length;
          otrosParticipantes.forEach(id => {
            participantesConMonto[id] = pagoPorOtro;
          });
        } else {
          // No se especifica miPago: dividir equitativamente entre TODOS
          const pagoPorPersona = montoTotal / participantesSeleccionados.length;
          participantesSeleccionados.forEach(id => {
            participantesConMonto[id] = pagoPorPersona;
          });
        }
      } else {
        // Modo personalizado: usar los montos especificados en formData.participantes
        participantesConMonto = { ...formData.participantes };
        
        // Asegurar que el usuario actual está incluido
        if (!(usuarioId in participantesConMonto)) {
          participantesConMonto[usuarioId] = 0;
        }
        
        // Validar que los montos sumen el total
        const totalAsignado = Object.values(participantesConMonto).reduce((sum, m) => sum + (parseFloat(m) || 0), 0);
        if (Math.abs(totalAsignado - montoTotal) > 0.01) {
          alert(`El total asignado ($${totalAsignado.toFixed(2)}) debe ser igual al monto ($${montoTotal.toFixed(2)})`);
          return;
        }
      }

      // IMPORTANTE: Asegurar que TODOS los participantes tienen montos válidos (> 0)
      // Eliminar participantes con monto 0
      Object.keys(participantesConMonto).forEach(id => {
        if (parseFloat(participantesConMonto[id]) <= 0) {
          delete participantesConMonto[id];
        }
      });

      // CRÍTICO: El usuario creador SIEMPRE debe estar incluido con un monto > 0
      if (!(usuarioId in participantesConMonto) || parseFloat(participantesConMonto[usuarioId]) <= 0) {
        alert('⚠️ Debes incluirte a ti mismo en el ingreso compartido con un monto mayor a 0');
        return;
      }

      const transaccion = {
        tipo: 'ingreso',
        categoria: formData.categoria,
        cantidad: montoTotal,
        fecha: formData.fecha,
        hora: formData.hora,
        cuentaDestino: formData.cuentaDestino,
        anotaciones: `INGRESO COMPARTIDO: ${formData.concepto}`,
        // El usuario ahora viene del token autenticado, no del body
        esProgramada: formData.esProgramada && !formData.diferirCuotas,
        fechaProgramada: formData.esProgramada && !formData.diferirCuotas ? formData.fechaProgramada : null,
        diferirCuotas: formData.diferirCuotas,
        numeroCuotas: formData.diferirCuotas ? parseInt(formData.numeroCuotas) : 1,
        participantes: participantesConMonto
      };

      console.log('📤 Enviando ingreso compartido:', {
        tipo: transaccion.tipo,
        cantidad: transaccion.cantidad,
        participantesEnviados: transaccion.participantes,
        anotaciones: transaccion.anotaciones.substring(0, 40) + '...'
      });

      const respuesta = await transaccionesAPI.crear(transaccion);
      
      console.log('✅ Respuesta del servidor:', respuesta);
      
      // Actualizar conteo de notificaciones inmediatamente
      console.log('🔔 Actualizando conteo de notificaciones...');
      cargarConteo();
      
      // Mostrar resumen detallado
      if (respuesta && respuesta.resumen) {
        const { transacciones: trans, notificaciones } = respuesta;
        const detalleTransacciones = trans.map(t => 
          `✓ ${t.usuario}: $${t.cantidad.toFixed(2)} (Cuenta: ${t.cuenta})`
        ).join('\n');
        
        const notifInfo = notificaciones ? `\n\n📬 ${notificaciones.length} notificaciones enviadas` : '';
        alert(`✅ Ingreso compartido creado exitosamente!\n\n📊 Transacciones:\n${detalleTransacciones}${notifInfo}`);
        console.log('📋 Resumen completo:', respuesta);
      } else {
        alert('✅ Ingreso compartido creado exitosamente');
      }
      
      onCrear?.();
      resetForm();
      onCerrar();
    } catch (error) {
      console.error('Error al crear ingreso compartido:', error);
      alert('Error al crear ingreso compartido: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      concepto: '',
      monto: '',
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
      categoria: 'Ingreso Compartido',
      participantes: {},
      tipoDistribucion: 'equitativa',
      cuentaDestino: cuentas[0]?._id || '',
      anotaciones: '',
      esProgramada: false,
      fechaProgramada: new Date().toISOString().split('T')[0],
      diferirCuotas: false,
      numeroCuotas: 1,
      miPago: '',
    });
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-500 p-6 flex items-center justify-between text-white">
          <div>
            <h2 className="text-2xl font-bold">💰 Ingreso Compartido</h2>
            <p className="text-sm opacity-90">Divide ingresos entre usuarios</p>
          </div>
          <button onClick={onCerrar} className="p-2 hover:bg-white/20 rounded-lg transition">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Concepto */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">📝 Concepto del Ingreso</label>
            <input
              type="text"
              name="concepto"
              value={formData.concepto}
              onChange={handleChange}
              placeholder="Ej: Venta conjunta, Premio, Devolución"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-800"
              required
            />
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">💳 Monto Total</label>
            <input
              type="number"
              name="monto"
              value={formData.monto}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-800"
              required
            />
          </div>

          {/* Cuenta Destino */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">🏦 Cuenta Destino</label>
            <select
              name="cuentaDestino"
              value={formData.cuentaDestino}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-800"
            >
              <option value="">Seleccionar cuenta</option>
              {cuentas.map(c => (
                <option key={c._id} value={c._id}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {/* Fecha y Hora */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">📅 Fecha</label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">🕐 Hora</label>
              <input
                type="time"
                name="hora"
                value={formData.hora}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-800"
              />
            </div>
          </div>

          {/* Programar Ingreso */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="esProgramada"
                checked={formData.esProgramada}
                onChange={handleChange}
                className="w-4 h-4 text-green-500"
              />
              <span className="text-sm font-bold text-slate-800">📆 ¿Programar para una fecha futura?</span>
            </label>
            {formData.esProgramada && (
              <input
                type="date"
                name="fechaProgramada"
                value={formData.fechaProgramada}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-800 mt-2"
              />
            )}
            <p className="text-xs text-slate-600 mt-1">
              {formData.esProgramada 
                ? '📌 Este ingreso se aplicará en la fecha programada, no inmediatamente.'
                : '✅ Este ingreso se aplicará inmediatamente.'}
            </p>
          </div>

          {/* Diferir a Cuotas */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="diferirCuotas"
                checked={formData.diferirCuotas}
                onChange={handleChange}
                className="w-4 h-4 text-green-500"
                disabled={formData.esProgramada}
              />
              <span className="text-sm font-bold text-slate-800">📊 ¿Diferir a cuotas?</span>
            </label>
            {formData.diferirCuotas && (
              <div className="mt-2">
                <label className="block text-xs font-bold text-slate-800 mb-1">Número de cuotas</label>
                <input
                  type="number"
                  name="numeroCuotas"
                  value={formData.numeroCuotas}
                  onChange={handleChange}
                  min="1"
                  max="24"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-800"
                />
                <p className="text-xs text-slate-600 mt-1">
                  Cada cuota será de ${(parseFloat(formData.monto) / parseInt(formData.numeroCuotas) || 0).toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Tipo de Distribución */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">⚖️ Tipo de Distribución</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipoDistribucion"
                  value="equitativa"
                  checked={formData.tipoDistribucion === 'equitativa'}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-500"
                />
                <span className="ml-2 text-slate-700">Equitativa (Yo recibo X, el resto divide lo demás)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipoDistribucion"
                  value="personalizada"
                  checked={formData.tipoDistribucion === 'personalizada'}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-500"
                />
                <span className="ml-2 text-slate-700">Personalizada (especificar cada pago)</span>
              </label>
            </div>
          </div>

          {/* Mi Pago (solo si es equitativa) */}
          {formData.tipoDistribucion === 'equitativa' && (
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">💵 Mi Pago</label>
              <input
                type="number"
                name="miPago"
                value={formData.miPago}
                onChange={handleChange}
                placeholder="¿Cuánto recibes tú?"
                step="0.01"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-500 text-slate-900 font-medium"
              />
              <p className="text-xs text-slate-600 mt-1">
                El resto se dividirá entre los otros participantes
              </p>
            </div>
          )}

          {/* Participantes */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-2">👥 Participantes</label>
            <div className="space-y-2 bg-slate-50 p-3 rounded-lg max-h-48 overflow-y-auto">
              {participantesDisponibles.map(p => {
                // Normalizar ID a string para consistencia
                const pId = normalizarId(p._id || p.id);
                return (
                <div key={pId} className="flex items-center justify-between p-2 bg-white rounded hover:bg-slate-100">
                  <label className="flex items-center flex-1">
                    <input
                      type="checkbox"
                      checked={pId in formData.participantes}
                      onChange={() => toggleParticipante(pId)}
                      className="w-4 h-4 text-green-500"
                    />
                    <span className="ml-2 text-slate-700 text-sm">{p.nombre}</span>
                  </label>
                  {formData.tipoDistribucion === 'personalizada' && (pId in formData.participantes) && (
                    <input
                      type="number"
                      value={formData.participantes[pId] || ''}
                      onChange={(e) => handleMontoParticipante(pId, e.target.value)}
                      step="0.01"
                      className="w-20 px-2 py-1 border border-slate-300 rounded text-xs"
                    />
                  )}
                </div>
                );
              })}
            </div>
            {formData.tipoDistribucion === 'personalizada' && (
              <p className="text-xs text-slate-600 mt-2">
                Total asignado: ${calcularTotalParticipantes().toFixed(2)} / ${formData.monto || 0}
              </p>
            )}
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:shadow-lg font-bold transition"
            >
              Crear Ingreso Compartido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalIngresoCompartido;
