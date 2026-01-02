import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = ({ onMenuClick, onNuevoClick, onGastoCompartidoClick, onIngresoCompartidoClick, onMetaRequeridaClick, onAhorroCompartidoClick }) => {
  const { usuario, usuarios, cambiarUsuario, cerrarSesion, cargarUsuarios } = useAuth();
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (usuario) {
      cargarUsuarios();
    }
  }, [usuario]);

  const handleCerrarSesion = async () => {
    await cerrarSesion();
    navigate('/login');
  };

  const handleCambiarUsuario = (usuarioId) => {
    cambiarUsuario(usuarioId);
    setMostrarDropdown(false);
  };

  if (!usuario) {
    return (
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <h1 className="text-xl font-bold text-gray-800">Gestor financiero</h1>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition lg:hidden"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <h1 className="text-xl font-bold text-gray-800">Gestor financiero</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNuevoClick}
            className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Nuevo</span>
          </button>

          {/* Botones de modales compartidos */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={onGastoCompartidoClick}
              className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-medium text-sm"
              title="Crear Gasto Compartido"
            >
              💸 Gasto Compartido
            </button>
            <button
              onClick={onIngresoCompartidoClick}
              className="px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition font-medium text-sm"
              title="Crear Ingreso Compartido"
            >
              💰 Ingreso Compartido
            </button>
            <button
              onClick={onMetaRequeridaClick}
              className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition font-medium text-sm"
              title="Crear Meta"
            >
              🎯 Meta
            </button>
            <button
              onClick={onAhorroCompartidoClick}
              className="px-3 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition font-medium text-sm"
              title="Crear Fondo de Ahorro"
            >
              🏦 Ahorro Compartido
            </button>
          </div>

          {/* Avatar usuario con dropdown */}
          <div className="relative">
            <button
              onClick={() => setMostrarDropdown(!mostrarDropdown)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition"
              title={usuario.nombre}
            >
              <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {usuario.avatar}
              </div>
              <span className="hidden sm:inline text-sm font-medium text-slate-700">{usuario.nombre}</span>
              <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {mostrarDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-slate-200 py-2">
                <p className="px-4 py-2 text-xs font-semibold text-slate-600 uppercase">
                  Cambiar Usuario
                </p>
                
                {usuarios.length > 0 ? (
                  <>
                    {usuarios.map(u => (
                      <button
                        key={u._id}
                        onClick={() => handleCambiarUsuario(u._id)}
                        className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors flex items-center gap-3 ${
                          usuario._id === u._id ? 'bg-teal-50' : ''
                        }`}
                      >
                        <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {u.avatar}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-800">{u.nombre}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                        {usuario._id === u._id && (
                          <svg className="w-5 h-5 text-teal-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                    
                    <div className="border-t border-slate-200 mt-2 pt-2">
                      <button
                        onClick={() => {
                          setMostrarDropdown(false);
                          navigate('/registro');
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors text-sm text-teal-600 font-medium"
                      >
                        + Agregar nuevo usuario
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="px-4 py-3 text-sm text-slate-600">
                    No hay otros usuarios
                  </p>
                )}

                <div className="border-t border-slate-200 mt-2 pt-2">
                  <button
                    onClick={handleCerrarSesion}
                    className="w-full text-left px-4 py-2 hover:bg-red-50 transition-colors text-sm text-red-600 font-medium"
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
