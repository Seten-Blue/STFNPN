import React, { useState, useEffect } from 'react';
import { formatearMoneda } from '../utils/constantes';
import { useAuth } from '../context/AuthContext';

const SeccionFusion = ({
  transacciones,
  cuentas,
  presupuestos,
  onCrearTransaccion,
  periodo,
  setPeriodo,
  fecha,
  setFecha,
}) => {
  const { usuario, usuarios, cargarUsuarios } = useAuth();
  const [usuarioComparativo, setUsuarioComparativo] = useState(null);
  const [datosComparativos, setDatosComparativos] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [loadingComparativo, setLoadingComparativo] = useState(false);
  
  const [formData, setFormData] = useState({
    concepto: '',
    cantidad: '',
    tipo: 'gasto',
    categoria: 'Otros',
    distribucion: 'igual',
    porcentajeUsuario1: 50,
    porcentajeUsuario2: 50,
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarDatosComparativos = async (usuarioId) => {
    setLoadingComparativo(true);
    try {
      const API_URL = 'http://localhost:3001/api';
      const params = new URLSearchParams({ usuarioId, periodo, fecha });
      
      const [trans, ctas, presup] = await Promise.all([
        fetch(`${API_URL}/transacciones?${params}`).then(r => r.json()),
        fetch(`${API_URL}/cuentas?usuarioId=${usuarioId}`).then(r => r.json()),
        fetch(`${API_URL}/presupuestos/estado?usuarioId=${usuarioId}`).then(r => r.json()),
      ]);
      
      setDatosComparativos({
        transacciones: Array.isArray(trans) ? trans : [],
        cuentas: Array.isArray(ctas) ? ctas : [],
        presupuestos: Array.isArray(presup) ? presup : [],
      });
    } catch (error) {
      console.error('Error cargando datos comparativos:', error);
    } finally {
      setLoadingComparativo(false);
    }
  };

  const handleSeleccionarUsuario = (user) => {
    setUsuarioComparativo(user);
    cargarDatosComparativos(user._id);
  };

  const calcularTotales = (trans) => {
    const ingresos = trans.filter(t => t.tipo === 'ingreso').reduce((sum, t) => sum + t.cantidad, 0);
    const gastos = trans.filter(t => t.tipo === 'gasto').reduce((sum, t) => sum + t.cantidad, 0);
    return { ingresos, gastos, balance: ingresos - gastos };
  };

  const calcularSaldoTotal = (ctas) => {
    return ctas.reduce((sum, c) => sum + (c.saldo || 0), 0);
  };

  const totalesUsuario1 = calcularTotales(transacciones);
  const saldoUsuario1 = calcularSaldoTotal(cuentas);
  
  const totalesUsuario2 = datosComparativos ? calcularTotales(datosComparativos.transacciones) : null;
  const saldoUsuario2 = datosComparativos ? calcularSaldoTotal(datosComparativos.cuentas) : null;

  const handleCrearTransaccionCompartida = async (e) => {
    e.preventDefault();
    if (!formData.concepto || !formData.cantidad) {
      alert('Por favor completa todos los campos');
      return;
    }

    const cantidadTotal = parseFloat(formData.cantidad);
    let cantidadUsuario1, cantidadUsuario2;

    if (formData.distribucion === 'igual') {
      cantidadUsuario1 = cantidadTotal / 2;
      cantidadUsuario2 = cantidadTotal / 2;
    } else {
      cantidadUsuario1 = (cantidadTotal * formData.porcentajeUsuario1) / 100;
      cantidadUsuario2 = (cantidadTotal * formData.porcentajeUsuario2) / 100;
    }

    try {
      await onCrearTransaccion({
        concepto: `[Compartido] ${formData.concepto}`,
        cantidad: cantidadUsuario1,
        tipo: formData.tipo,
        categoria: formData.categoria,
        esCompartida: true,
        usuarioCompartido: usuarioComparativo._id,
      });

      const API_URL = 'http://localhost:3001/api';
      await fetch(`${API_URL}/transacciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concepto: `[Compartido] ${formData.concepto}`,
          cantidad: cantidadUsuario2,
          tipo: formData.tipo,
          categoria: formData.categoria,
          usuario: usuarioComparativo._id,
          esCompartida: true,
          usuarioCompartido: usuario.id,
        }),
      });

      setFormData({
        concepto: '',
        cantidad: '',
        tipo: 'gasto',
        categoria: 'Otros',
        distribucion: 'igual',
        porcentajeUsuario1: 50,
        porcentajeUsuario2: 50,
      });
      setMostrarFormulario(false);
      
      cargarDatosComparativos(usuarioComparativo._id);
      alert('Transacción compartida registrada exitosamente');
    } catch (error) {
      alert('Error al crear transacción compartida');
    }
  };

  if (!usuarioComparativo) {
    const otrosUsuarios = usuarios.filter(u => u._id !== usuario?.id);
    
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">🔄 Fusión de Cuentas</h2>
          <p className="text-slate-600 mb-6">
            Compara tus finanzas con otro usuario y registra gastos/ingresos compartidos.
          </p>
          
          {otrosUsuarios.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <span className="text-4xl mb-4 block">👥</span>
              <p className="text-slate-600">No hay otros usuarios registrados.</p>
              <p className="text-sm text-slate-500 mt-2">
                Invita a alguien a crear una cuenta para usar esta función.
              </p>
            </div>
          ) : (
            <>
              <h3 className="font-semibold text-slate-700 mb-4">Selecciona un usuario para comparar:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otrosUsuarios.map(u => (
                  <button
                    key={u._id}
                    onClick={() => handleSeleccionarUsuario(u)}
                    className="p-4 border-2 border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-white text-xl font-bold">
                        {u.avatar || u.nombre?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800 group-hover:text-teal-700">
                          {u.nombre}
                        </div>
                        <div className="text-sm text-slate-500">{u.email}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">🔄 Comparativa de Finanzas</h2>
            <p className="text-slate-600 text-sm mt-1">
              Comparando: <span className="font-semibold">{usuario?.nombre}</span> vs{' '}
              <span className="font-semibold">{usuarioComparativo.nombre}</span>
            </p>
          </div>
          <button
            onClick={() => {
              setUsuarioComparativo(null);
              setDatosComparativos(null);
            }}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-slate-700 transition"
          >
            Cambiar usuario
          </button>
        </div>
      </div>

      {/* Comparativa principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usuario 1 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-teal-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white font-bold">
              {usuario?.avatar || usuario?.nombre?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-slate-800">{usuario?.nombre}</h3>
              <p className="text-xs text-slate-500">Tu cuenta</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-teal-50 rounded-lg">
              <span className="text-slate-700">Saldo Total</span>
              <span className="font-bold text-lg text-teal-700">{formatearMoneda(saldoUsuario1)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-slate-700">Ingresos</span>
              <span className="font-bold text-green-700">{formatearMoneda(totalesUsuario1.ingresos)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-slate-700">Gastos</span>
              <span className="font-bold text-red-700">{formatearMoneda(totalesUsuario1.gastos)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-100 rounded-lg border-t-2">
              <span className="font-semibold text-slate-800">Balance</span>
              <span className={`font-bold text-lg ${totalesUsuario1.balance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                {formatearMoneda(totalesUsuario1.balance)}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t">
            <h4 className="font-semibold text-slate-700 mb-2">Cuentas ({cuentas.length})</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {cuentas.map(c => (
                <div key={c._id} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                  <span className="text-slate-700">{c.nombre}</span>
                  <span className="font-medium text-teal-700">{formatearMoneda(c.saldo)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Usuario 2 */}
        <div className="bg-white rounded-xl p-6 shadow-sm border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
              {usuarioComparativo.avatar || usuarioComparativo.nombre?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-bold text-slate-800">{usuarioComparativo.nombre}</h3>
              <p className="text-xs text-slate-500">Cuenta comparativa</p>
            </div>
          </div>
          
          {loadingComparativo ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : datosComparativos ? (
            <>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-slate-700">Saldo Total</span>
                  <span className="font-bold text-lg text-purple-700">{formatearMoneda(saldoUsuario2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-slate-700">Ingresos</span>
                  <span className="font-bold text-green-700">{formatearMoneda(totalesUsuario2?.ingresos || 0)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="text-slate-700">Gastos</span>
                  <span className="font-bold text-red-700">{formatearMoneda(totalesUsuario2?.gastos || 0)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-slate-100 rounded-lg border-t-2">
                  <span className="font-semibold text-slate-800">Balance</span>
                  <span className={`font-bold text-lg ${(totalesUsuario2?.balance || 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {formatearMoneda(totalesUsuario2?.balance || 0)}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t">
                <h4 className="font-semibold text-slate-700 mb-2">Cuentas ({datosComparativos.cuentas.length})</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {datosComparativos.cuentas.map(c => (
                    <div key={c._id} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                      <span className="text-slate-700">{c.nombre}</span>
                      <span className="font-medium text-purple-700">{formatearMoneda(c.saldo)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>

      {/* Resumen combinado */}
      {datosComparativos && (
        <div className="bg-gradient-to-r from-teal-600 to-purple-600 rounded-xl p-6 text-white">
          <h3 className="font-bold text-xl mb-4">📊 Resumen Combinado</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <p className="text-sm opacity-80">Saldo Total</p>
              <p className="text-2xl font-bold">{formatearMoneda(saldoUsuario1 + (saldoUsuario2 || 0))}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <p className="text-sm opacity-80">Ingresos</p>
              <p className="text-2xl font-bold">{formatearMoneda(totalesUsuario1.ingresos + (totalesUsuario2?.ingresos || 0))}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <p className="text-sm opacity-80">Gastos</p>
              <p className="text-2xl font-bold">{formatearMoneda(totalesUsuario1.gastos + (totalesUsuario2?.gastos || 0))}</p>
            </div>
            <div className="bg-white/20 rounded-lg p-4 text-center">
              <p className="text-sm opacity-80">Balance</p>
              <p className="text-2xl font-bold">{formatearMoneda(totalesUsuario1.balance + (totalesUsuario2?.balance || 0))}</p>
            </div>
          </div>
        </div>
      )}

      {/* Formulario compartido */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">💸 Gasto/Ingreso Compartido</h3>
            <p className="text-sm text-slate-500">Divide automáticamente entre ambos</p>
          </div>
          {!mostrarFormulario && (
            <button
              onClick={() => setMostrarFormulario(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition"
            >
              + Nuevo Compartido
            </button>
          )}
        </div>

        {mostrarFormulario && (
          <form onSubmit={handleCrearTransaccionCompartida} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">Concepto *</label>
                <input
                  type="text"
                  placeholder="Ej: Cena, Alquiler..."
                  value={formData.concepto}
                  onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-800"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">Cantidad Total *</label>
                <input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={formData.cantidad}
                  onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-800"
                >
                  <option value="gasto">Gasto</option>
                  <option value="ingreso">Ingreso</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-1">Categoría</label>
                <select
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-slate-800"
                >
                  <option value="Alimentación">Alimentación</option>
                  <option value="Transporte">Transporte</option>
                  <option value="Hogar">Hogar</option>
                  <option value="Entretenimiento">Entretenimiento</option>
                  <option value="Utilidades">Utilidades</option>
                  <option value="Otros">Otros</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg">
              <label className="block text-sm font-medium text-slate-800 mb-3">¿Cómo dividir?</label>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="igual"
                    checked={formData.distribucion === 'igual'}
                    onChange={(e) => setFormData({ ...formData, distribucion: e.target.value, porcentajeUsuario1: 50, porcentajeUsuario2: 50 })}
                    className="w-4 h-4 text-teal-600"
                  />
                  <span className="text-sm font-medium text-slate-700">50/50</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="personalizado"
                    checked={formData.distribucion === 'personalizado'}
                    onChange={(e) => setFormData({ ...formData, distribucion: e.target.value })}
                    className="w-4 h-4 text-teal-600"
                  />
                  <span className="text-sm font-medium text-slate-700">Personalizado</span>
                </label>
              </div>

              {formData.distribucion === 'personalizado' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">{usuario?.nombre} (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.porcentajeUsuario1}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setFormData({ ...formData, porcentajeUsuario1: val, porcentajeUsuario2: 100 - val });
                      }}
                      className="w-full px-3 py-2 border rounded-lg text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 mb-1">{usuarioComparativo.nombre} (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.porcentajeUsuario2}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setFormData({ ...formData, porcentajeUsuario2: val, porcentajeUsuario1: 100 - val });
                      }}
                      className="w-full px-3 py-2 border rounded-lg text-slate-800"
                    />
                  </div>
                </div>
              )}

              {formData.cantidad && (
                <div className="mt-4 p-3 bg-white rounded-lg border">
                  <p className="text-xs text-slate-600 mb-2">Vista previa:</p>
                  <div className="flex justify-between">
                    <span className="text-sm text-teal-700 font-medium">
                      {usuario?.nombre}: {formatearMoneda((parseFloat(formData.cantidad) * formData.porcentajeUsuario1) / 100)}
                    </span>
                    <span className="text-sm text-purple-700 font-medium">
                      {usuarioComparativo.nombre}: {formatearMoneda((parseFloat(formData.cantidad) * formData.porcentajeUsuario2) / 100)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition"
              >
                Registrar
              </button>
              <button
                type="button"
                onClick={() => {
                  setMostrarFormulario(false);
                  setFormData({
                    concepto: '',
                    cantidad: '',
                    tipo: 'gasto',
                    categoria: 'Otros',
                    distribucion: 'igual',
                    porcentajeUsuario1: 50,
                    porcentajeUsuario2: 50,
                  });
                }}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-slate-700 rounded-lg font-medium transition"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SeccionFusion;
