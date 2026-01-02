import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [esRegistro, setEsRegistro] = useState(false);
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const { iniciarSesion, registrarse, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    if (esRegistro) {
      // Registro
      if (!nombre || !email || !contraseña) {
        setError('Por favor completa todos los campos');
        return;
      }
      
      if (contraseña.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }

      const resultado = await registrarse(nombre, email, contraseña);
      if (resultado.success) {
        setMensaje(resultado.message);
        setNombre('');
        setEmail('');
        setContraseña('');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(resultado.message);
      }
    } else {
      // Login
      if (!email || !contraseña) {
        setError('Por favor completa todos los campos');
        return;
      }

      const resultado = await iniciarSesion(email, contraseña);
      if (resultado.success) {
        setMensaje(resultado.message);
        setEmail('');
        setContraseña('');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        setError(resultado.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h1>
          <p className="text-slate-700 font-medium">Sistema Financiero Personal</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-300 rounded-lg text-red-800 font-medium">
            {error}
          </div>
        )}

        {mensaje && (
          <div className="mb-4 p-4 bg-green-50 border border-green-300 rounded-lg text-green-800 font-medium">
            {mensaje}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {esRegistro && (
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre completo"
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 font-medium placeholder-slate-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 font-medium placeholder-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={contraseña}
              onChange={(e) => setContraseña(e.target.value)}
              placeholder="Tu contraseña"
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-slate-900 font-medium placeholder-slate-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {loading ? 'Procesando...' : esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-center text-slate-700 text-sm font-medium">
            {esRegistro ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}
            <button
              type="button"
              onClick={() => {
                setEsRegistro(!esRegistro);
                setError('');
                setMensaje('');
              }}
              className="ml-2 text-teal-600 hover:text-teal-700 font-bold underline"
            >
              {esRegistro ? 'Iniciar sesión' : 'Crear cuenta'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
