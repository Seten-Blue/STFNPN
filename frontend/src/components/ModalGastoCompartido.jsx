import { useState } from 'react';
import { transaccionesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function ModalGastoCompartido({ visible, onCerrar, cuentas, usuarios, onCrear }) {
  const { usuario } = useAuth();
  const [formData, setFormData] = useState({
    concepto: '',
    monto: '',
    fecha: new Date().toISOString().split('T')[0],
    hora: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
    categoria: 'Otros',
    participantes: {},
    tipoDistribucion: 'equitativa',
    cuentaOrigen: cuentas[0]?._id || '',
    anotaciones: '',
    esUrgente: false,
    esProgramada: false,
    fechaProgramada: new Date().toISOString().split('T')[0],
    diferirCuotas: false,
    numeroCuotas: 1,
    miPago: '', // Lo que pago yo específicamente
  });

  const participantesDisponibles = [usuario, ...usuarios.filter(u => u._id !== usuario.id)];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleParticipante = (usuarioId) => {
    setFormData(prev => {
      const isSelected = prev.participantes[usuarioId] && prev.participantes[usuarioId] > 0;
      const newParticipantes = { ...prev.participantes };
      
      if (isSelected) {
        // Deseleccionar
        delete newParticipantes[usuarioId];
      } else {
        // Seleccionar: en distribución personalizada dejar en 0 para que el usuario lo edite
        newParticipantes[usuarioId] = 0;
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

      if (!formData.cuentaOrigen) {
        alert('Selecciona una cuenta origen');
        return;
      }

      // Validar que hay participantes seleccionados
      const participantesSeleccionados = Object.keys(formData.participantes);
      if (participantesSeleccionados.length === 0) {
        alert('Selecciona al menos un participante');
        return;
      }

      const montoTotal = parseFloat(formData.monto);
      
      // LÓGICA CORRECTA DE DISTRIBUCIÓN:
      // Si es equitativa y el usuario especifica su pago, se divide el resto
      // Si el usuario pone montos personalizados, se usa eso
      
      let participantesConMonto = { ...formData.participantes };
      
      if (formData.tipoDistribucion === 'equitativa') {
        // Modo equitativo: el usuario especifica su pago (miPago)
        // El resto se divide entre los demás participantes
        const miPago = parseFloat(formData.miPago) || 0;
        
        if (miPago <= 0 || miPago >= montoTotal) {
          alert('Tu pago debe ser mayor a 0 y menor al monto total');
          return;
        }
        
        const montoRestante = montoTotal - miPago;
        const otrosParticipantes = participantesSeleccionados.filter(id => id !== usuario.id);
        
        if (otrosParticipantes.length === 0) {
          alert('Necesitas al menos otro participante además de ti');
          return;
        }
        
        // El usuario paga su porción
        participantesConMonto[usuario.id] = miPago;
        
        // Los demás dividen el resto equitativamente
        const pagoPorOtro = montoRestante / otrosParticipantes.length;
        otrosParticipantes.forEach(id => {
          participantesConMonto[id] = pagoPorOtro;
        });
      } else {
        // Modo personalizado: validar que los montos sumen el total
        const totalAsignado = Object.values(participantesConMonto).reduce((sum, m) => sum + (parseFloat(m) || 0), 0);
        if (Math.abs(totalAsignado - montoTotal) > 0.01) {
          alert(`El total asignado ($${totalAsignado.toFixed(2)}) debe ser igual al monto ($${montoTotal.toFixed(2)})`);
          return;
        }
      }

      const transaccion = {
        tipo: 'gasto',
        categoria: formData.categoria,
        cantidad: montoTotal,
        fecha: formData.fecha,
        hora: formData.hora,
        cuentaOrigen: formData.cuentaOrigen,
        anotaciones: `GASTO COMPARTIDO: ${formData.concepto}`,
        usuario: usuario.id,
        esUrgente: formData.esUrgente,
        esProgramada: formData.esProgramada && !formData.diferirCuotas,
        fechaProgramada: formData.esProgramada && !formData.diferirCuotas ? formData.fechaProgramada : null,
        diferirCuotas: formData.diferirCuotas,
        numeroCuotas: formData.diferirCuotas ? parseInt(formData.numeroCuotas) : 1,
        participantes: participantesConMonto
      };

      await transaccionesAPI.crear(transaccion);
      onCrear?.();
      resetForm();
      onCerrar();
      alert('Gasto compartido creado exitosamente');
    } catch (error) {
      console.error('Error al crear gasto compartido:', error);
      alert('Error al crear gasto compartido: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData({
      concepto: '',
      monto: '',
      fecha: new Date().toISOString().split('T')[0],
      hora: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
      categoria: 'Otros',
      participantes: {},
      tipoDistribucion: 'equitativa',
      cuentaOrigen: cuentas[0]?._id || '',
      anotaciones: '',
      esUrgente: false,
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
        <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 p-6 flex items-center justify-between text-white">
          <div>
            <h2 className="text-2xl font-bold">💸 Gasto Compartido</h2>
            <p className="text-sm opacity-90">Divide gastos entre usuarios</p>
          </div>
          <button onClick={onCerrar} className="p-2 hover:bg-white/20 rounded-lg transition">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Concepto */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">📝 Concepto del Gasto</label>
            <input
              type="text"
              name="concepto"
              value={formData.concepto}
              onChange={handleChange}
              placeholder="Ej: Cena, Viaje, Compras"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-900 font-medium"
              required
            />
          </div>

          {/* Monto */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">💰 Monto Total</label>
            <input
              type="number"
              name="monto"
              value={formData.monto}
              onChange={handleChange}
              placeholder="0.00"
              step="0.01"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-900 font-medium"
              required
            />
          </div>

          {/* Cuenta Origen */}
          <div>
            <label className="block text-sm font-bold text-slate-800 mb-1">🏦 Cuenta Origen (Quién paga)</label>
            <select
              name="cuentaOrigen"
              value={formData.cuentaOrigen}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-900 font-medium"
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
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-800 mb-1">🕐 Hora</label>
              <input
                type="time"
                name="hora"
                value={formData.hora}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-800"
              />
            </div>
          </div>

          {/* Programar Gasto */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="esProgramada"
                checked={formData.esProgramada}
                onChange={handleChange}
                className="w-4 h-4 text-orange-500"
              />
              <span className="text-sm font-bold text-slate-800">📆 ¿Programar para una fecha futura?</span>
            </label>
            {formData.esProgramada && (
              <input
                type="date"
                name="fechaProgramada"
                value={formData.fechaProgramada}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-800 mt-2"
              />
            )}
            <p className="text-xs text-slate-600 mt-1">
              {formData.esProgramada 
                ? '📌 Este gasto se aplicará en la fecha programada, no inmediatamente.'
                : '✅ Este gasto se aplicará inmediatamente.'}
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
                className="w-4 h-4 text-orange-500"
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
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-800"
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
                  className="w-4 h-4 text-orange-500"
                />
                <span className="ml-2 text-slate-700">Equitativa (Yo pago X, el resto divide lo demás)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipoDistribucion"
                  value="personalizada"
                  checked={formData.tipoDistribucion === 'personalizada'}
                  onChange={handleChange}
                  className="w-4 h-4 text-orange-500"
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
                placeholder="¿Cuánto pagas tú?"
                step="0.01"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-slate-900 font-medium"
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
              {participantesDisponibles.map(p => (
                <div key={p._id} className="flex items-center justify-between p-2 bg-white rounded hover:bg-slate-100">
                  <label className="flex items-center flex-1">
                    <input
                      type="checkbox"
                      checked={!!formData.participantes[p._id]}
                      onChange={() => toggleParticipante(p._id)}
                      className="w-4 h-4 text-orange-500"
                    />
                    <span className="ml-2 text-slate-700 text-sm">{p.nombre}</span>
                  </label>
                  {formData.tipoDistribucion === 'personalizada' && formData.participantes[p._id] && (
                    <input
                      type="number"
                      value={formData.participantes[p._id]}
                      onChange={(e) => handleMontoParticipante(p._id, e.target.value)}
                      step="0.01"
                      className="w-20 px-2 py-1 border border-slate-300 rounded text-xs"
                    />
                  )}
                </div>
              ))}
            </div>
            {formData.tipoDistribucion === 'personalizada' && (
              <p className="text-xs text-slate-600 mt-2">
                Total asignado: ${calcularTotalParticipantes().toFixed(2)} / ${formData.monto || 0}
              </p>
            )}
          </div>

          {/* Urgente */}
          <label className="flex items-center">
            <input
              type="checkbox"
              name="esUrgente"
              checked={formData.esUrgente}
              onChange={handleChange}
              className="w-4 h-4 text-orange-500"
            />
            <span className="ml-2 text-sm text-slate-700">🚨 Marcar como urgente</span>
          </label>

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
              className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg font-bold transition"
            >
              Crear Gasto Compartido
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ModalGastoCompartido;
