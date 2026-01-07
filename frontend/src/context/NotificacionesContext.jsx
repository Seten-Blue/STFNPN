import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './AuthContext';
import { notificacionesAPI } from '../services/api';

const NotificacionesContext = createContext();

export const useNotificaciones = () => {
  const context = useContext(NotificacionesContext);
  if (!context) {
    throw new Error('useNotificaciones debe ser usado dentro de NotificacionesProvider');
  }
  return context;
};

export const NotificacionesProvider = ({ children }) => {
  const { usuario } = useAuth();
  const [conteoNoLeidas, setConteoNoLeidas] = useState(0);
  const [loading, setLoading] = useState(false);
  const [ultimaVerificacion, setUltimaVerificacion] = useState(new Date());
  const conteoRef = useRef(0); // Para evitar ciclos infinitos

  // Sonido de notificación
  const reproducirSonido = useCallback(() => {
    // Crear un sonido simple usando Web Audio API
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Sonido: dos notas cortas
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (error) {
      console.warn('No se pudo reproducir sonido de notificación:', error);
    }
  }, []);

  // Cargar conteo de notificaciones
  const cargarConteo = useCallback(async () => {
    if (!usuario) return;

    try {
      setLoading(true);
      const respuesta = await notificacionesAPI.obtener({
        soloNoLeidas: true
      });

      const noLeidas = Array.isArray(respuesta) ? respuesta.length : 0;
      const prevConteo = conteoRef.current; // Usar ref en lugar de state para evitar ciclo

      console.log('📊 Conteo de notificaciones:', { 
        noLeidas, 
        prevConteo, 
        cambio: noLeidas - prevConteo,
        notificaciones: respuesta.map(n => ({ id: n._id, titulo: n.titulo, leida: n.leida }))
      });

      setConteoNoLeidas(noLeidas);
      conteoRef.current = noLeidas; // Actualizar ref

      // Si hay nuevas notificaciones (noLeidas > prevConteo), reproducir sonido
      // Esto cubre cualquier tipo de notificación
      if (noLeidas > prevConteo) {
        console.log(`🔔 ${noLeidas - prevConteo} nueva(s) notificación(es) detectada(s), reproduciendo sonido`);
        reproducirSonido();
      }

      setUltimaVerificacion(new Date());
    } catch (error) {
      console.error('Error al cargar conteo de notificaciones:', error);
    } finally {
      setLoading(false);
    }
  }, [usuario, reproducirSonido]);

  // Carga inicial
  useEffect(() => {
    if (usuario) {
      cargarConteo();
    }
  }, [usuario]);

  // Polling cada 5 segundos (más frecuente para actualización rápida)
  useEffect(() => {
    if (!usuario) return;

    console.log('🔄 Iniciando polling de notificaciones (cada 5 segundos)');
    const intervalo = setInterval(() => {
      cargarConteo();
    }, 5000);

    return () => {
      console.log('🛑 Deteniendo polling de notificaciones');
      clearInterval(intervalo);
    };
  }, [usuario, cargarConteo]);

  const marcarTodasLeidas = useCallback(async () => {
    if (!usuario) return;

    try {
      await notificacionesAPI.marcarTodasLeidas();
      setConteoNoLeidas(0);
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
    }
  }, [usuario]);

  const valor = {
    conteoNoLeidas,
    loading,
    cargarConteo,
    marcarTodasLeidas,
    ultimaVerificacion,
    reproducirSonido
  };

  return (
    <NotificacionesContext.Provider value={valor}>
      {children}
    </NotificacionesContext.Provider>
  );
};

export default NotificacionesContext;
