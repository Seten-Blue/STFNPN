import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true); // Inicializa como true
  const [loadingAuth, setLoadingAuth] = useState(false); // Para operaciones
  const [usuarios, setUsuarios] = useState([]);

  // Inicializar con token del localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Cargar usuario actual cuando hay token
  useEffect(() => {
    if (token) {
      cargarUsuarioActual(token).then(() => {
        setLoading(false);
      });
    }
  }, [token]);

  // Cargar lista de usuarios
  const cargarUsuarios = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/users');
      const data = await response.json();
      if (data.success) {
        setUsuarios(data.usuarios);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  // Cargar usuario actual
  const cargarUsuarioActual = async (tokenToUse = token) => {
    return new Promise(async (resolve) => {
      try {
        const response = await fetch('http://localhost:3001/api/auth/current', {
          headers: {
            'Authorization': `Bearer ${tokenToUse}`
          }
        });
        const data = await response.json();
        if (data.success) {
          // Normalizar usuario: convertir _id a id
          const usuarioNormalizado = {
            ...data.usuario,
            id: data.usuario._id || data.usuario.id
          };
          setUsuario(usuarioNormalizado);
          resolve(true);
        } else {
          // Token inválido, limpiar
          setToken(null);
          setUsuario(null);
          localStorage.removeItem('token');
          resolve(false);
        }
      } catch (error) {
        console.error('Error al cargar usuario actual:', error);
        setToken(null);
        setUsuario(null);
        localStorage.removeItem('token');
        resolve(false);
      }
    });
  };

  // Registro
  const registrarse = async (nombre, email, contraseña) => {
    try {
      setLoadingAuth(true);
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre, email, contraseña })
      });
      const data = await response.json();
      
      if (data.success) {
        // Normalizar usuario: convertir _id a id
        const usuarioNormalizado = {
          ...data.usuario,
          id: data.usuario._id || data.usuario.id
        };
        setToken(data.token);
        setUsuario(usuarioNormalizado);
        localStorage.setItem('token', data.token);
        cargarUsuarios();
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error al registrarse:', error);
      return { success: false, message: error.message };
    } finally {
      setLoadingAuth(false);
    }
  };

  // Login
  const iniciarSesion = async (email, contraseña) => {
    try {
      setLoadingAuth(true);
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, contraseña })
      });
      const data = await response.json();
      
      if (data.success) {
        // Normalizar usuario: convertir _id a id
        const usuarioNormalizado = {
          ...data.usuario,
          id: data.usuario._id || data.usuario.id
        };
        setToken(data.token);
        setUsuario(usuarioNormalizado);
        localStorage.setItem('token', data.token);
        cargarUsuarios();
        return { success: true, message: data.message };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return { success: false, message: error.message };
    } finally {
      setLoadingAuth(false);
    }
  };

  // Logout
  const cerrarSesion = async () => {
    try {
      setToken(null);
      setUsuario(null);
      localStorage.removeItem('token');
      setUsuarios([]);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Cambiar usuario activo
  const cambiarUsuario = (usuarioId) => {
    const usuarioSeleccionado = usuarios.find(u => u._id === usuarioId);
    if (usuarioSeleccionado) {
      // Normalizar usuario: convertir _id a id
      const usuarioNormalizado = {
        ...usuarioSeleccionado,
        id: usuarioSeleccionado._id || usuarioSeleccionado.id
      };
      setUsuario(usuarioNormalizado);
    }
  };

  return (
    <AuthContext.Provider value={{
      usuario,
      token,
      loading,
      usuarios,
      registrarse,
      iniciarSesion,
      cerrarSesion,
      cambiarUsuario,
      cargarUsuarios,
      cargarUsuarioActual
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
