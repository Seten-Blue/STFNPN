import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificacionesProvider } from './context/NotificacionesContext';
import Header from './components/Header';
import MenuModulos from './components/MenuModulos';
import Dashboard from './components/Dashboard';
import ListaTransacciones from './components/ListaTransacciones';
import FiltrosPeriodo from './components/FiltrosPeriodo';
import ModalNuevo from './components/ModalNuevo';
import SeccionCuentas from './components/SeccionCuentas';
import SeccionPrestamos from './components/SeccionPrestamos';
import SeccionPresupuestos from './components/SeccionPresupuestos';
import SeccionConfiguracion from './components/SeccionConfiguracion';
import SeccionFusion from './components/SeccionFusion';
import SeccionNotificaciones from './components/SeccionNotificaciones';
import SeccionMetas from './components/SeccionMetas';
import SeccionAhorrosCompartidos from './components/SeccionAhorrosCompartidos';
import SeccionAnotaciones from './components/SeccionAnotaciones';
import ModalGastoCompartido from './components/ModalGastoCompartido';
import ModalIngresoCompartido from './components/ModalIngresoCompartido';
import ModalMetaRequerida from './components/ModalMetaRequerida';
import ModalAhorroCompartido from './components/ModalAhorroCompartido';
import Login from './pages/Login';
import { transaccionesAPI, cuentasAPI, prestamosAPI, presupuestosAPI } from './services/api';
import './App.css';

function AppContent() {
  const { usuario, token, loading: authLoading, cargarUsuarios, usuarios: usuariosDelContexto } = useAuth();
  const [seccionActiva, setSeccionActiva] = useState('dashboard');
  const [menuModulosVisible, setMenuModulosVisible] = useState(false);
  const [modalNuevoVisible, setModalNuevoVisible] = useState(false);
  const [modalGastoCompartidoVisible, setModalGastoCompartidoVisible] = useState(false);
  const [modalIngresoCompartidoVisible, setModalIngresoCompartidoVisible] = useState(false);
  const [modalMetaRequiridaVisible, setModalMetaRequiridaVisible] = useState(false);
  const [modalAhorroCompartidoVisible, setModalAhorroCompartidoVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [periodo, setPeriodo] = useState('mes');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);

  // Cuenta activa (primera cuenta del usuario)
  const [cuentaActiva, setCuentaActiva] = useState(null);

  // Datos
  const [transacciones, setTransacciones] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);

  // Manejar click en notificaciones
  const handleNotificacionesClick = () => {
    setSeccionActiva('notificaciones');
    setSidebarVisible(false);
  };

  // Cargar datos
  useEffect(() => {
    if (usuario && token) {
      cargarDatos();
    }
  }, [periodo, fecha, usuario, token]);

  // Cargar usuarios solo una vez al montar o cuando usuario cambia
  useEffect(() => {
    if (usuario && token) {
      cargarUsuarios();
    }
  }, [usuario, token, cargarUsuarios]);

  const cargarDatos = async () => {
    if (!usuario) return;
    setLoading(true);
    try {
      const filtros = {
        periodo,
        fecha,
        usuarioId: usuario._id || usuario.id,
      };

      const [trans, ctas, prest, presup] = await Promise.all([
        transaccionesAPI.obtener(filtros),
        cuentasAPI.obtener({}),
        prestamosAPI.obtener({ usuarioId: usuario._id || usuario.id }),
        presupuestosAPI.estado({ usuarioId: usuario._id || usuario.id }),
      ]);

      setTransacciones(Array.isArray(trans) ? trans : []);
      setCuentas(Array.isArray(ctas) ? ctas : []);
      
      if (Array.isArray(ctas) && ctas.length > 0 && !cuentaActiva) {
        setCuentaActiva(ctas[0]._id);
      }

      setPrestamos(Array.isArray(prest) ? prest : []);
      setPresupuestos(Array.isArray(presup) ? presup : []);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearTransaccion = async (data) => {
    try {
      const dataConUsuario = {
        ...data,
        usuario: usuario._id || usuario.id
      };
      await transaccionesAPI.crear(dataConUsuario);
      cargarDatos();
    } catch (error) {
      alert('Error al crear transacción');
    }
  };

  const handleEliminarTransaccion = async (id) => {
    if (!window.confirm('¿Eliminar esta transacción?')) return;
    try {
      await transaccionesAPI.eliminar(id);
      cargarDatos();
    } catch (error) {
      alert('Error al eliminar transacción');
    }
  };

  const handleCrearCuenta = async (data) => {
    try {
      await cuentasAPI.crear(data);
      cargarDatos();
    } catch (error) {
      alert('Error al crear cuenta');
    }
  };

  const handleActualizarCuenta = async (id, data) => {
    try {
      await cuentasAPI.actualizar(id, data);
      cargarDatos();
    } catch (error) {
      alert('Error al actualizar cuenta');
    }
  };

  const handleEliminarCuenta = async (id) => {
    try {
      await cuentasAPI.eliminar(id);
      cargarDatos();
    } catch (error) {
      alert('Error al eliminar cuenta');
    }
  };

  const handleCrearPrestamo = async (data) => {
    try {
      await prestamosAPI.crear(data);
      cargarDatos();
    } catch (error) {
      alert('Error al crear préstamo');
    }
  };

  const handleActualizarPrestamo = async (id, data) => {
    try {
      await prestamosAPI.actualizar(id, data);
      cargarDatos();
    } catch (error) {
      alert('Error al actualizar préstamo');
    }
  };

  const handleEliminarPrestamo = async (id) => {
    try {
      await prestamosAPI.eliminar(id);
      cargarDatos();
    } catch (error) {
      alert('Error al eliminar préstamo');
    }
  };

  const handleCrearPresupuesto = async (data) => {
    try {
      await presupuestosAPI.crear(data);
      cargarDatos();
    } catch (error) {
      alert('Error al crear presupuesto');
    }
  };

  const handleActualizarPresupuesto = async (id, data) => {
    try {
      await presupuestosAPI.actualizar(id, data);
      cargarDatos();
    } catch (error) {
      alert('Error al actualizar presupuesto');
    }
  };

  const handleEliminarPresupuesto = async (id) => {
    try {
      await presupuestosAPI.eliminar(id);
      cargarDatos();
    } catch (error) {
      alert('Error al eliminar presupuesto');
    }
  };

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'dashboard':
        return (
          <>
            <FiltrosPeriodo periodo={periodo} fecha={fecha} onPeriodoChange={setPeriodo} onFechaChange={setFecha} />
            <Dashboard transacciones={transacciones} cuentas={cuentas} prestamos={prestamos} presupuestos={presupuestos} />
          </>
        );

      case 'transacciones':
        return (
          <>
            <FiltrosPeriodo periodo={periodo} fecha={fecha} onPeriodoChange={setPeriodo} onFechaChange={setFecha} />
            <button 
              onClick={() => setModalNuevoVisible(true)}
              className="mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              + Nueva Transacción
            </button>
            <ListaTransacciones transacciones={transacciones} onEliminar={handleEliminarTransaccion} />
          </>
        );

      case 'cuentas':
        return (
          <SeccionCuentas 
            cuentas={cuentas}
            onCrear={handleCrearCuenta}
            onActualizar={handleActualizarCuenta}
            onEliminar={handleEliminarCuenta}
          />
        );

      case 'prestamos':
        return (
          <SeccionPrestamos 
            prestamos={prestamos}
            onCrear={handleCrearPrestamo}
            onActualizar={handleActualizarPrestamo}
            onEliminar={handleEliminarPrestamo}
          />
        );

      case 'presupuestos':
        return (
          <SeccionPresupuestos
            presupuestos={presupuestos}
            onCrear={handleCrearPresupuesto}
            onActualizar={() => {}}
            onEliminar={handleEliminarPresupuesto}
            cuentaActiva={cuentaActiva}
          />
        );

      case 'metas':
        return <SeccionMetas />;

      case 'ahorroscompartidos':
        return <SeccionAhorrosCompartidos />;

      case 'anotaciones':
        return <SeccionAnotaciones />;

      case 'fusion':
        return <SeccionFusion />;

      case 'configuracion':
        return (
          <SeccionConfiguracion
            configuracion={{}}
            onActualizar={() => {}}
            transacciones={transacciones}
          />
        );

      case 'notificaciones':
        return <SeccionNotificaciones />;

      default:
        return null;
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f3f4f6]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!usuario || !token) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex h-screen bg-[#f3f4f6]">
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          onMenuClick={() => setMenuModulosVisible(!menuModulosVisible)}
          onNotificacionesClick={handleNotificacionesClick}
          onGastoClick={() => setModalNuevoVisible(true)}
          onGastoCompartidoClick={() => setModalGastoCompartidoVisible(true)}
          onIngresoCompartidoClick={() => setModalIngresoCompartidoVisible(true)}
          onMetaRequiridaClick={() => setModalMetaRequiridaVisible(true)}
          onAhorroCompartidoClick={() => setModalAhorroCompartidoVisible(true)}
          menuModulosVisible={menuModulosVisible}
          usuario={usuario}
        />

        <MenuModulos 
          visible={menuModulosVisible}
          onCambiarSeccion={(seccion) => {
            setSeccionActiva(seccion);
            setMenuModulosVisible(false);
          }}
          onCerrar={() => setMenuModulosVisible(false)}
        />

        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Cargando...</p>
              </div>
            </div>
          ) : (
            renderSeccion()
          )}
        </main>
      </div>

      <ModalNuevo
        visible={modalNuevoVisible}
        onCerrar={() => setModalNuevoVisible(false)}
        cuentas={cuentas}
        onGuardar={handleCrearTransaccion}
        cuentaActiva={cuentaActiva}
      />

      <ModalGastoCompartido
        visible={modalGastoCompartidoVisible}
        onCerrar={() => setModalGastoCompartidoVisible(false)}
        cuentas={cuentas}
        usuarios={usuariosDelContexto}
        onCrear={cargarDatos}
      />

      <ModalIngresoCompartido
        visible={modalIngresoCompartidoVisible}
        onCerrar={() => setModalIngresoCompartidoVisible(false)}
        cuentas={cuentas}
        usuarios={usuariosDelContexto}
        onCrear={cargarDatos}
      />

      <ModalMetaRequerida
        visible={modalMetaRequiridaVisible}
        onCerrar={() => setModalMetaRequiridaVisible(false)}
        usuarios={usuariosDelContexto}
        onCrear={cargarDatos}
      />

      <ModalAhorroCompartido
        visible={modalAhorroCompartidoVisible}
        onCerrar={() => setModalAhorroCompartidoVisible(false)}
        cuentas={cuentas}
        usuarios={usuariosDelContexto}
        onCrear={cargarDatos}
      />
    </div>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <NotificacionesProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Login />} />
            <Route path="/*" element={<AppContent />} />
          </Routes>
        </NotificacionesProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
