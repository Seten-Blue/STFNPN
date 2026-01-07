const API_URL = 'http://localhost:3001/api';

// Función auxiliar para obtener headers con token
const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Transacciones
export const transaccionesAPI = {
  obtener: async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const res = await fetch(`${API_URL}/transacciones?${params}`, {
      headers: getHeaders()
    });
    return res.json();
  },
  crear: async (data) => {
    const res = await fetch(`${API_URL}/transacciones`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      console.error('❌ Error en crear transacción:', json);
      throw new Error(json.error || `Error ${res.status}`);
    }
    return json;
  },
  actualizar: async (id, data) => {
    const res = await fetch(`${API_URL}/transacciones/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  eliminar: async (id) => {
    const res = await fetch(`${API_URL}/transacciones/${id}`, { 
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Error ${res.status}: ${error}`);
    }
    return res.json();
  },
  resumen: async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const res = await fetch(`${API_URL}/transacciones/resumen?${params}`, {
      headers: getHeaders()
    });
    return res.json();
  },
};

// Cuentas
export const cuentasAPI = {
  obtener: async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const res = await fetch(`${API_URL}/cuentas?${params}`, {
      headers: getHeaders()
    });
    return res.json();
  },
  crear: async (data) => {
    const res = await fetch(`${API_URL}/cuentas`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  actualizar: async (id, data) => {
    const res = await fetch(`${API_URL}/cuentas/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  eliminar: async (id) => {
    const res = await fetch(`${API_URL}/cuentas/${id}`, { 
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },
  saldo: async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const res = await fetch(`${API_URL}/cuentas/saldo?${params}`, {
      headers: getHeaders()
    });
    return res.json();
  },
};

// Préstamos
export const prestamosAPI = {
  obtener: async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const res = await fetch(`${API_URL}/prestamos?${params}`, {
      headers: getHeaders()
    });
    return res.json();
  },
  crear: async (data) => {
    const res = await fetch(`${API_URL}/prestamos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  actualizar: async (id, data) => {
    const res = await fetch(`${API_URL}/prestamos/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  registrarPago: async (id, datoPago) => {
    const res = await fetch(`${API_URL}/prestamos/${id}/pago`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(datoPago),
    });
    return res.json();
  },
  eliminar: async (id) => {
    const res = await fetch(`${API_URL}/prestamos/${id}`, { 
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },
};

// Presupuestos
export const presupuestosAPI = {
  obtener: async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const res = await fetch(`${API_URL}/presupuestos?${params}`, {
      headers: getHeaders()
    });
    return res.json();
  },
  estado: async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const res = await fetch(`${API_URL}/presupuestos/estado?${params}`, {
      headers: getHeaders()
    });
    return res.json();
  },
  crear: async (data) => {
    const res = await fetch(`${API_URL}/presupuestos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  actualizar: async (id, data) => {
    const res = await fetch(`${API_URL}/presupuestos/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  eliminar: async (id) => {
    const res = await fetch(`${API_URL}/presupuestos/${id}`, { 
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },
};

// Notificaciones
export const notificacionesAPI = {
  obtener: async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const res = await fetch(`${API_URL}/notificaciones?${params}`, {
      headers: getHeaders()
    });
    return res.json();
  },
  obtenerPendientes: async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const res = await fetch(`${API_URL}/notificaciones/pendientes?${params}`, {
      headers: getHeaders()
    });
    return res.json();
  },
  contarNoLeidas: async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const res = await fetch(`${API_URL}/notificaciones/contar?${params}`, {
      headers: getHeaders()
    });
    return res.json();
  },
  crear: async (data) => {
    const res = await fetch(`${API_URL}/notificaciones`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  marcarLeida: async (id) => {
    const res = await fetch(`${API_URL}/notificaciones/${id}/leida`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return res.json();
  },
  marcarTodasLeidas: async () => {
    const res = await fetch(`${API_URL}/notificaciones/marcar-todas-leidas`, {
      method: 'PUT',
      headers: getHeaders()
    });
    return res.json();
  },
  actualizar: async (id, data) => {
    const res = await fetch(`${API_URL}/notificaciones/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  eliminar: async (id) => {
    const res = await fetch(`${API_URL}/notificaciones/${id}`, { 
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },
};

// Email
export const emailAPI = {
  enviarPrueba: async (email) => {
    const res = await fetch(`${API_URL}/email/prueba`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ email }),
    });
    return res.json();
  },
  procesarPendientes: async () => {
    const res = await fetch(`${API_URL}/email/procesar`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },
  enviarNotificacion: async (id) => {
    const res = await fetch(`${API_URL}/email/enviar/${id}`, {
      method: 'POST',
      headers: getHeaders()
    });
    return res.json();
  },
};

// Metas
export const metasAPI = {
  obtener: async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const res = await fetch(`${API_URL}/metas?${params}`, {
      headers: getHeaders()
    });
    return res.json();
  },
  crear: async (data) => {
    const res = await fetch(`${API_URL}/metas`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  actualizar: async (id, data) => {
    const res = await fetch(`${API_URL}/metas/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  eliminar: async (id) => {
    const res = await fetch(`${API_URL}/metas/${id}`, { 
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },
  obtenerDetalles: async (id) => {
    const res = await fetch(`${API_URL}/metas/${id}/detalles`, {
      headers: getHeaders()
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || `Error ${res.status}`);
    }
    return res.json();
  },
  agregarAportacion: async (id, data) => {
    const res = await fetch(`${API_URL}/metas/${id}/aportacion`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || `Error ${res.status}`);
    }
    return res.json();
  },
  eliminarAporte: async (id, aporteId, usuarioId) => {
    const res = await fetch(`${API_URL}/metas/${id}/aporte/${aporteId}`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ usuarioId }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || `Error ${res.status}`);
    }
    return res.json();
  },
};

// Ahorro Compartido
export const ahorroCompartidoAPI = {
  obtener: async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const res = await fetch(`${API_URL}/ahorro-compartido?${params}`, {
      headers: getHeaders()
    });
    return res.json();
  },
  crear: async (data) => {
    const res = await fetch(`${API_URL}/ahorro-compartido`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  actualizar: async (id, data) => {
    const res = await fetch(`${API_URL}/ahorro-compartido/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },
  eliminar: async (id) => {
    const res = await fetch(`${API_URL}/ahorro-compartido/${id}`, { 
      method: 'DELETE',
      headers: getHeaders()
    });
    return res.json();
  },
  obtenerDetalles: async (id) => {
    const res = await fetch(`${API_URL}/ahorro-compartido/${id}/detalles`, {
      headers: getHeaders()
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || `Error ${res.status}`);
    }
    return res.json();
  },
  agregarAportacion: async (id, data) => {
    const res = await fetch(`${API_URL}/ahorro-compartido/${id}/aportacion`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || `Error ${res.status}`);
    }
    return res.json();
  },
  eliminarAporte: async (id, aporteId, usuarioId) => {
    const res = await fetch(`${API_URL}/ahorro-compartido/${id}/aporte/${aporteId}`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ usuarioId }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || `Error ${res.status}`);
    }
    return res.json();
  },
};

// Transacciones Programadas
export const transaccionesProgramadasAPI = {
  obtener: async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const res = await fetch(`${API_URL}/transacciones-programadas?${params}`);
    return res.json();
  },
  procesar: async () => {
    const res = await fetch(`${API_URL}/transacciones-programadas/procesar`, {
      method: 'POST',
    });
    return res.json();
  },
  cancelar: async (id) => {
    const res = await fetch(`${API_URL}/transacciones-programadas/${id}`, {
      method: 'DELETE',
    });
    return res.json();
  },
};
