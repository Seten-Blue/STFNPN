import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificacionesProvider } from './context/NotificacionesContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
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
  const [sidebarVisible, setSidebarVisible] = useState(false);
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
        usuarioId: usuario._id || usuario.id,  // Asegurar que se usa _id
      };

      const [trans, ctas, prest, presup] = await Promise.all([
        transaccionesAPI.obtener(filtros),
        cuentasAPI.obtener({}), // El backend ahora obtiene usuarioId del token
        prestamosAPI.obtener({ usuarioId: usuario._id || usuario.id }),
        presupuestosAPI.estado({ usuarioId: usuario._id || usuario.id }),
      ]);

      setTransacciones(Array.isArray(trans) ? trans : []);
      setCuentas(Array.isArray(ctas) ? ctas : []);
      
      // Establecer primera cuenta como activa si existe
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

  // Handlers de transacciones
  const handleCrearTransaccion = async (data) => {
    try {
      const dataConUsuario = {
        ...data,
        usuario: usuario._id || usuario.id  // Asegurar que se usa _id
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

  // Handlers de cuentas
  const handleCrearCuenta = async (data) => {
    try {
      // No necesario enviar usuarioId, el backend lo obtiene del token
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
      const dataConUsuario = {
        ...data,
        usuario: usuario._id || usuario.id,
        sujeto: 'Sujeto 1'
      };
      console.log('📤 Creando préstamo:', dataConUsuario);
      const resultado = await prestamosAPI.crear(dataConUsuario);
      if (resultado.error) {
        alert('Error al crear préstamo: ' + resultado.error);
      } else {
        cargarDatos();
      }
    } catch (error) {
      console.error('Error al crear préstamo:', error);
      alert('Error al crear préstamo: ' + error.message);
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

  const handleRegistrarPago = async (id, cuotas) => {
    try {
      await prestamosAPI.registrarPago(id, cuotas);
      cargarDatos();
    } catch (error) {
      alert('Error al registrar pago');
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

  // Handlers de presupuestos
  const handleCrearPresupuesto = async (data) => {
    try {
      const dataConUsuario = {
        ...data,
        usuario: usuario.id
      };
      await presupuestosAPI.crear(dataConUsuario);
      cargarDatos();
    } catch (error) {
      alert('Error al crear presupuesto');
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
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Cargando...</p>
          </div>
        </div>
      );
    }

    switch (seccionActiva) {
      case 'dashboard':
        return (
          <>
            <FiltrosPeriodo
              periodo={periodo}
              setPeriodo={setPeriodo}
              fecha={fecha}
              setFecha={setFecha}
            />
            <Dashboard
              transacciones={transacciones}
              cuentas={cuentas}
              presupuestos={presupuestos}
              periodo={periodo}
              cuentaActiva={cuentaActiva}
            />
          </>
        );

      case 'transacciones':
        return (
          <>
            <FiltrosPeriodo
              periodo={periodo}
              setPeriodo={setPeriodo}
              fecha={fecha}
              setFecha={setFecha}
            />
            <ListaTransacciones
              transacciones={transacciones}
              onEditar={(t) => console.log('Editar:', t)}
              onEliminar={handleEliminarTransaccion}
            />
          </>
        );

      case 'cuentas':
        return (
          <SeccionCuentas
            cuentas={cuentas}
            onCrear={handleCrearCuenta}
            onActualizar={handleActualizarCuenta}
            onEliminar={handleEliminarCuenta}
            cuentaActiva={cuentaActiva}
          />
        );

      case 'prestamos':
        return (
          <SeccionPrestamos
            prestamos={prestamos}
            cuentas={cuentas}
            onCrear={handleCrearPrestamo}
            onActualizar={handleActualizarPrestamo}
            onRegistrarPago={handleRegistrarPago}
            onEliminar={handleEliminarPrestamo}
            cuentaActiva={cuentaActiva}
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

  // Validaciones después de todos los hooks
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
    return <Login />;
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      <Header
        onMenuClick={() => setSidebarVisible(true)}
        onNuevoClick={() => setModalNuevoVisible(true)}
        onGastoCompartidoClick={() => setModalGastoCompartidoVisible(true)}
        onIngresoCompartidoClick={() => setModalIngresoCompartidoVisible(true)}
        onMetaRequeridaClick={() => setModalMetaRequiridaVisible(true)}
        onAhorroCompartidoClick={() => setModalAhorroCompartidoVisible(true)}
        onNotificacionesClick={handleNotificacionesClick}
      />

      <div className="flex">
        <Sidebar
          seccionActiva={seccionActiva}
          onCambiarSeccion={setSeccionActiva}
          visible={sidebarVisible}
          onCerrar={() => setSidebarVisible(false)}
        />

        <main className="flex-1 p-4 lg:p-6 lg:ml-0">
          <div className="max-w-6xl mx-auto">
            {renderSeccion()}
          </div>
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
    <Router>
      <AuthProvider>
        <NotificacionesProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/registro" element={<Login />} />
            <Route path="/" element={<AppContent />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </NotificacionesProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
