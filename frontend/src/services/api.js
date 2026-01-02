const API_URL = 'http://localhost:3001/api';

// Transacciones
export const transaccionesAPI = {
  obtener: async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const res = await fetch(`${API_URL}/transacciones?${params}`);
    return res.json();
  },
  crear: async (data) => {
    const res = await fetch(`${API_URL}/transacciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  actualizar: async (id, data) => {
    const res = await fetch(`${API_URL}/transacciones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  eliminar: async (id) => {
    const res = await fetch(`${API_URL}/transacciones/${id}`, { method: 'DELETE' });
    return res.json();
  },
  resumen: async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const res = await fetch(`${API_URL}/transacciones/resumen?${params}`);
    return res.json();
  },
};

// Cuentas
export const cuentasAPI = {
  obtener: async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const res = await fetch(`${API_URL}/cuentas?${params}`);
    return res.json();
  },
  crear: async (data) => {
    const res = await fetch(`${API_URL}/cuentas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  actualizar: async (id, data) => {
    const res = await fetch(`${API_URL}/cuentas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  eliminar: async (id) => {
    const res = await fetch(`${API_URL}/cuentas/${id}`, { method: 'DELETE' });
    return res.json();
  },
  saldo: async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const res = await fetch(`${API_URL}/cuentas/saldo?${params}`);
    return res.json();
  },
};

// Préstamos
export const prestamosAPI = {
  obtener: async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const res = await fetch(`${API_URL}/prestamos?${params}`);
    return res.json();
  },
  crear: async (data) => {
    const res = await fetch(`${API_URL}/prestamos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  actualizar: async (id, data) => {
    const res = await fetch(`${API_URL}/prestamos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  registrarPago: async (id, cuotasPagadas) => {
    const res = await fetch(`${API_URL}/prestamos/${id}/pago`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cuotasPagadas }),
    });
    return res.json();
  },
  eliminar: async (id) => {
    const res = await fetch(`${API_URL}/prestamos/${id}`, { method: 'DELETE' });
    return res.json();
  },
};

// Presupuestos
export const presupuestosAPI = {
  obtener: async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const res = await fetch(`${API_URL}/presupuestos?${params}`);
    return res.json();
  },
  estado: async (filtros = {}) => {
    const params = new URLSearchParams(filtros);
    const res = await fetch(`${API_URL}/presupuestos/estado?${params}`);
    return res.json();
  },
  crear: async (data) => {
    const res = await fetch(`${API_URL}/presupuestos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  actualizar: async (id, data) => {
    const res = await fetch(`${API_URL}/presupuestos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  eliminar: async (id) => {
    const res = await fetch(`${API_URL}/presupuestos/${id}`, { method: 'DELETE' });
    return res.json();
  },
};
