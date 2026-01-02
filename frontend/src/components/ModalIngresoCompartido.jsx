import { useState } from 'react';
import { transaccionesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function ModalIngresoCompartido({ visible, onCerrar, cuentas, usuarios, onCrear }) {
  const { usuario } = useAuth();
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
        delete newParticipantes[usuarioId];
      } else {
        if (prev.tipoDistribucion === 'equitativa') {
          const participantesActuales = Object.keys(newParticipantes).filter(k => newParticipantes[k] > 0).length;
          const nuevoTotal = participantesActuales + 1;
          const montoTotal = parseFloat(prev.monto) || 0;
          const montoIndividual = montoTotal / nuevoTotal;
          
          Object.keys(newParticipantes).forEach(id => {
            newParticipantes[id] = montoIndividual;
          });
          newParticipantes[usuarioId] = montoIndividual;
        } else {
          newParticipantes[usuarioId] = 0;
        }
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
      const participantesSeleccionados = Object.keys(formData.participantes).filter(k => formData.participantes[k] > 0);
      if (participantesSeleccionados.length === 0) {
        alert('Selecciona al menos un participante');
        return;
      }

      // Validar monto en distribución personalizada
      if (formData.tipoDistribucion === 'personalizada') {
        const totalAsignado = calcularTotalParticipantes();
        const montoTotal = parseFloat(formData.monto);
        if (Math.abs(totalAsignado - montoTotal) > 0.01) {
          alert(`El total asignado ($${totalAsignado.toFixed(2)}) debe ser igual al monto ($${montoTotal.toFixed(2)})`);
          return;
        }
      }

      const montoTotal = parseFloat(formData.monto);
      
      // Crear objeto de participantes con sus montos
      const participantesConMonto = {};
      participantesSeleccionados.forEach(usuarioId => {
        participantesConMonto[usuarioId] = formData.participantes[usuarioId];
      });

      const transaccion = {
        tipo: 'ingreso',
        categoria: formData.categoria,
        cantidad: montoTotal,
        fecha: formData.fecha,
        hora: formData.hora,
        cuentaDestino: formData.cuentaDestino,
        anotaciones: `INGRESO COMPARTIDO: ${formData.concepto}`,
        usuario: usuario.id,
        esProgramada: formData.esProgramada,
        fechaProgramada: formData.esProgramada ? formData.fechaProgramada : null,
        participantes: participantesConMonto
      };

      await transaccionesAPI.crear(transaccion);
      onCrear?.();
      resetForm();
      onCerrar();
      alert('Ingreso compartido creado exitosamente');
    } catch (error) {
      console.error('Error al crear ingreso compartido:', error);
      alert('Error al crear ingreso compartido: ' + error.message);
    }
  };
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
                <span className="ml-2 text-slate-700">Equitativa (50/50, 33/33/33)</span>
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
                <span className="ml-2 text-slate-700">Personalizada (manual)</span>
              </label>
            </div>
          </div>

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
                      className="w-4 h-4 text-green-500"
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
