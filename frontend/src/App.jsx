import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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
import SelectorSujetos from './components/SelectorSujetos';
import Login from './pages/Login';
import { transaccionesAPI, cuentasAPI, prestamosAPI, presupuestosAPI } from './services/api';
import './App.css';

function AppContent() {
  const { usuario, token, loading: authLoading } = useAuth();
  const [seccionActiva, setSeccionActiva] = useState('dashboard');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [modalNuevoVisible, setModalNuevoVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [periodo, setPeriodo] = useState('mes');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [esGrupal, setEsGrupal] = useState(false);
  const [grupo, setGrupo] = useState('personal');

  // Sujetos
  const [sujetos, setSujetos] = useState([
    { id: '1', nombre: 'Sujeto 1' },
    { id: '2', nombre: 'Sujeto 2' },
  ]);
  const [sujetoActivo, setsujetoActivo] = useState('1');

  // Datos
  const [transacciones, setTransacciones] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [prestamos, setPrestamos] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);

  // Cargar datos
  useEffect(() => {
    if (usuario && token) {
      cargarDatos();
    }
  }, [periodo, fecha, esGrupal, grupo, usuario, token]);

  const cargarDatos = async () => {
    if (!usuario) return; // Agregar validación
    setLoading(true);
    try {
      const filtros = {
        periodo,
        fecha,
        usuarioId: usuario.id,
        ...(esGrupal && { grupo, esGrupal: 'true' }),
      };

      const [trans, ctas, prest, presup] = await Promise.all([
        transaccionesAPI.obtener(filtros),
        cuentasAPI.obtener(),
        prestamosAPI.obtener(),
        presupuestosAPI.estado({ grupo: esGrupal ? grupo : 'personal' }),
      ]);

      setTransacciones(Array.isArray(trans) ? trans : []);
      setCuentas(Array.isArray(ctas) ? ctas : []);
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
        usuario: usuario.id
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
      const dataConUsuario = {
        ...data,
        usuario: usuario.id
      };
      await cuentasAPI.crear(dataConUsuario);
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
        usuario: usuario.id
      };
      await prestamosAPI.crear(dataConUsuario);
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

  // Handlers de sujetos
  const handleAgregarSujeto = (nombre) => {
    const nuevoSujeto = {
      id: Date.now().toString(),
      nombre: nombre,
    };
    setSujetos([...sujetos, nuevoSujeto]);
    setsujetoActivo(nuevoSujeto.id);
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
            <SelectorSujetos
              sujetos={sujetos}
              sujetoActivo={sujetoActivo}
              onCambiarSujeto={setsujetoActivo}
              onAgregarSujeto={handleAgregarSujeto}
            />
            <FiltrosPeriodo
              periodo={periodo}
              setPeriodo={setPeriodo}
              fecha={fecha}
              setFecha={setFecha}
              esGrupal={esGrupal}
              setEsGrupal={setEsGrupal}
              grupo={grupo}
              setGrupo={setGrupo}
            />
            <Dashboard
              transacciones={transacciones}
              cuentas={cuentas}
              presupuestos={presupuestos}
              periodo={periodo}
              grupo={grupo}
              esGrupal={esGrupal}
              sujetoActivo={sujetoActivo}
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
              esGrupal={esGrupal}
              setEsGrupal={setEsGrupal}
              grupo={grupo}
              setGrupo={setGrupo}
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
            sujetoActivo={sujetoActivo}
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
            sujetoActivo={sujetoActivo}
          />
        );

      case 'presupuestos':
        return (
          <SeccionPresupuestos
            presupuestos={presupuestos}
            onCrear={handleCrearPresupuesto}
            onActualizar={() => {}}
            onEliminar={handleEliminarPresupuesto}
            sujetoActivo={sujetoActivo}
          />
        );

      case 'configuracion':
        return (
          <SeccionConfiguracion
            configuracion={{}}
            onActualizar={() => {}}
            transacciones={transacciones}
          />
        );

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
        sujetoActivo={sujetoActivo}
        sujetos={sujetos}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Login />} />
          <Route path="/" element={<AppContent />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
