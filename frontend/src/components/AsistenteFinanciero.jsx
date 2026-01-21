import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { transaccionesAPI, cuentasAPI, prestamosAPI, presupuestosAPI, metasAPI, ahorroCompartidoAPI } from '../services/api';

// Mapeo de sentimientos a imágenes
const sentimientoImagen = {
  feliz: '/Feliz.png',
  triste: '/triste.png',
  sorpresa: '/sorpresa.png',
  sorprendido: '/sorpresa.png',
  enojado: '/enojado.png',
  relajado: '/explica en relajado.png',
  explicando: '/explica en relajado.png',
};

// Palabras clave para detectar sentimientos (con mayor especificidad)
const palabrasSentimiento = {
  feliz: ['excelente', 'genial', 'bien', 'muy bien', 'perfecto', 'fantástico', 'fantastico', 'estupendo', 'maravilloso', 'buen', 'bueno', 'positivo', 'mejora', 'crecimiento'],
  triste: ['mal', 'problema', 'crítico', 'critico', 'preocupante', 'negativo', 'pérdida', 'perdida', 'deuda', 'deficiente', 'bajo', 'malo', 'riesgo', 'alerta', 'adverso'],
  sorpresa: ['interesante', 'notable', 'importante', 'significativo', 'cambio', 'incremento', 'aumento', 'destacable', 'relevante', 'sorprendente'],
  enojado: ['problema serio', 'crítica', 'critica', 'error', 'incorrecto', 'fallida', 'fracaso', 'grave', 'urgente'],
  relajado: ['analizar', 'revisar', 'considerar', 'recomiendo', 'sugerencia', 'consejo', 'explicar', 'detalles', 'información', 'datos', 'análisis'],
};

const detectarSentimiento = (texto) => {
  const textoLower = texto.toLowerCase();
  
  // Detectar sentimiento basado en palabras clave
  for (const [sentimiento, palabras] of Object.entries(palabrasSentimiento)) {
    if (palabras.some(palabra => textoLower.includes(palabra))) {
      return sentimiento;
    }
  }
  
  // Por defecto, mostrar relajado si no detecta nada específico
  return 'relajado';
};

const AsistenteFinanciero = () => {
  const { usuario } = useAuth();
  const [mensajes, setMensajes] = useState([]);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const [datosFinancieros, setDatosFinancieros] = useState(null);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const messagesEndRef = useRef(null);

  // Cargar todos los datos financieros del usuario
  useEffect(() => {
    if (usuario) {
      cargarDatosFinancieros();
    }
  }, [usuario]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const cargarDatosFinancieros = async () => {
    setCargandoDatos(true);
    try {
      const usuarioId = usuario._id || usuario.id;
      
      // Cargar todos los datos en paralelo
      const [
        transacciones,
        cuentas,
        prestamos,
        presupuestos,
        metas,
        ahorrosCompartidos
      ] = await Promise.all([
        transaccionesAPI.obtener({ usuarioId }),
        cuentasAPI.obtener({ usuarioId }),
        prestamosAPI.obtener({ usuarioId }),
        presupuestosAPI.obtener({ usuarioId }),
        metasAPI.obtener({ usuarioId }),
        ahorroCompartidoAPI.obtener({ usuarioId })
      ]);

      // Calcular resumen de transacciones
      const gastos = transacciones.filter(t => t.tipo === 'gasto');
      const ingresos = transacciones.filter(t => t.tipo === 'ingreso');
      const totalGastos = gastos.reduce((sum, t) => sum + (t.cantidad || 0), 0);
      const totalIngresos = ingresos.reduce((sum, t) => sum + (t.cantidad || 0), 0);
      const balance = totalIngresos - totalGastos;

      // Gastos por categoría
      const gastosPorCategoria = gastos.reduce((acc, t) => {
        const cat = t.categoria || 'Sin categoría';
        acc[cat] = (acc[cat] || 0) + t.cantidad;
        return acc;
      }, {});

      // Saldo total de cuentas
      const saldoTotalCuentas = cuentas.reduce((sum, c) => sum + (c.saldoInicial || 0), 0);

      // Préstamos activos
      const prestamosActivos = prestamos.filter(p => p.estado === 'activo');
      const totalPrestado = prestamosActivos
        .filter(p => p.tipo === 'prestado')
        .reduce((sum, p) => sum + (p.montoTotal || 0), 0);
      const totalPrestamoDebe = prestamosActivos
        .filter(p => p.tipo === 'prestamo')
        .reduce((sum, p) => sum + (p.montoTotal || 0) - (p.montoPagado || 0), 0);

      // Presupuestos
      const presupuestosActivos = presupuestos.filter(p => p.activo);
      const totalPresupuestado = presupuestosActivos.reduce((sum, p) => sum + (p.monto || 0), 0);
      const totalGastadoPresupuesto = presupuestosActivos.reduce((sum, p) => sum + (p.gastado || 0), 0);

      // Metas
      const metasActivas = metas.filter(m => !m.completada);
      const totalMetas = metasActivas.reduce((sum, m) => sum + (m.montoObjetivo || 0), 0);
      const totalAhorradoMetas = metasActivas.reduce((sum, m) => sum + (m.montoActual || 0), 0);

      setDatosFinancieros({
        usuario: {
          nombre: usuario.nombre,
          email: usuario.email
        },
        resumen: {
          totalGastos,
          totalIngresos,
          balance,
          saldoTotalCuentas,
          totalPrestado,
          totalPrestamoDebe,
          totalPresupuestado,
          totalGastadoPresupuesto,
          totalMetas,
          totalAhorradoMetas
        },
        transacciones: {
          total: transacciones.length,
          gastos: gastos.length,
          ingresos: ingresos.length,
          gastosPorCategoria,
          ultimas10: transacciones.slice(0, 10).map(t => ({
            tipo: t.tipo,
            categoria: t.categoria,
            cantidad: t.cantidad,
            fecha: t.fecha,
            anotaciones: t.anotaciones
          }))
        },
        cuentas: cuentas.map(c => ({
          nombre: c.nombre,
          tipo: c.tipo,
          saldo: c.saldoInicial,
          moneda: c.moneda
        })),
        prestamos: {
          activos: prestamosActivos.length,
          prestado: totalPrestado,
          debe: totalPrestamoDebe,
          detalles: prestamosActivos.map(p => ({
            tipo: p.tipo,
            persona: p.personaPrestamista || p.personaPrestataria,
            monto: p.montoTotal,
            pagado: p.montoPagado,
            pendiente: (p.montoTotal || 0) - (p.montoPagado || 0)
          }))
        },
        presupuestos: {
          activos: presupuestosActivos.length,
          total: totalPresupuestado,
          gastado: totalGastadoPresupuesto,
          detalles: presupuestosActivos.map(p => ({
            categoria: p.categoria,
            presupuestado: p.monto,
            gastado: p.gastado,
            disponible: (p.monto || 0) - (p.gastado || 0),
            porcentaje: p.monto ? ((p.gastado || 0) / p.monto * 100).toFixed(1) : 0
          }))
        },
        metas: {
          activas: metasActivas.length,
          totalObjetivo: totalMetas,
          totalAhorrado: totalAhorradoMetas,
          detalles: metasActivas.map(m => ({
            nombre: m.nombre,
            objetivo: m.montoObjetivo,
            ahorrado: m.montoActual,
            faltante: (m.montoObjetivo || 0) - (m.montoActual || 0),
            porcentaje: m.montoObjetivo ? ((m.montoActual || 0) / m.montoObjetivo * 100).toFixed(1) : 0,
            fechaLimite: m.fechaLimite
          }))
        },
        ahorrosCompartidos: {
          total: ahorrosCompartidos.length,
          detalles: ahorrosCompartidos.map(a => ({
            nombre: a.nombre,
            objetivo: a.montoObjetivo,
            ahorrado: a.montoActual,
            participantes: a.participantes?.length || 0
          }))
        }
      });

      // Mensaje de bienvenida
      setMensajes([{
        role: 'assistant',
        content: `¡Hola ${usuario.nombre}! 👋 Soy tu asistente financiero personal. He cargado toda la información de tu cuenta y estoy listo para ayudarte.

📊 **Resumen rápido:**
• Balance: $${balance.toLocaleString()}
• Gastos totales: $${totalGastos.toLocaleString()}
• Ingresos totales: $${totalIngresos.toLocaleString()}
• Cuentas: ${cuentas.length}
• Transacciones: ${transacciones.length}

Puedes preguntarme cosas como:
• "¿Cómo van mis finanzas este mes?"
• "¿En qué estoy gastando más?"
• "¿Cuánto me falta para mis metas?"
• "Analiza mi presupuesto"
• "Dame consejos para ahorrar"

¿En qué puedo ayudarte? 💰`,
        sentimiento: 'relajado'
      }]);

    } catch (error) {
      console.error('Error al cargar datos financieros:', error);
      setMensajes([{
        role: 'assistant',
        content: '❌ Hubo un error al cargar tus datos financieros. Por favor, recarga la página.',
        sentimiento: 'triste'
      }]);
    } finally {
      setCargandoDatos(false);
    }
  };

  const enviarMensaje = async () => {
    if (!input.trim() || cargando || !datosFinancieros) return;

    const mensajeUsuario = input.trim();
    setInput('');
    
    // Agregar mensaje del usuario
    setMensajes(prev => [...prev, { role: 'user', content: mensajeUsuario }]);
    setCargando(true);

    try {
      // Construir el prompt con contexto financiero completo
      const promptSistema = `Eres un asistente financiero personal experto. Tienes acceso completo a los datos financieros del usuario ${datosFinancieros.usuario.nombre}.

DATOS FINANCIEROS COMPLETOS DEL USUARIO:

${JSON.stringify(datosFinancieros, null, 2)}

INSTRUCCIONES IMPORTANTES:
1. Solo proporciona información sobre los datos financieros de este usuario específico
2. Sé preciso con los números y cálculos
3. Ofrece análisis útiles y consejos prácticos
4. Usa emojis para hacer las respuestas más amigables
5. Si el usuario pregunta algo que no está en los datos, indícalo claramente
6. Formatea las respuestas de manera clara con puntos y saltos de línea
7. Cuando menciones cantidades monetarias, usa el formato local (ej: $1,234.56)

Responde a la pregunta del usuario basándote ÚNICAMENTE en los datos proporcionados arriba.`;

      // Preparar historial de conversación
      const mensajesParaAPI = [
        { role: 'user', content: promptSistema },
        { role: 'assistant', content: 'Entendido. Tengo acceso completo a los datos financieros del usuario y responderé basándome únicamente en esa información.' },
        ...mensajes.slice(1).map(m => ({ // Omitir el mensaje de bienvenida
          role: m.role,
          content: m.content
        })),
        { role: 'user', content: mensajeUsuario }
      ];

      // Llamar a la API del backend en vez de Anthropic directo
      const response = await fetch('/api/ia-financiera', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mensajesParaAPI })
      });

      if (!response.ok) {
        let errorMsg = `Error ${response.status}: ${response.statusText}`;
        if (response.status === 401) errorMsg = 'No autorizado. Verifica tu API Key en el backend.';
        if (response.status === 429) errorMsg = 'Límite de uso alcanzado. Intenta más tarde.';
        throw new Error(errorMsg);
      }

      const data = await response.json();
      const respuestaIA = data.content
        ? data.content.filter(block => block.type === 'text').map(block => block.text).join('\n')
        : 'No se recibió respuesta de la IA.';

      // Detectar sentimiento y agregar respuesta de la IA
      const sentimiento = detectarSentimiento(respuestaIA);
      setMensajes(prev => [...prev, {
        role: 'assistant',
        content: respuestaIA,
        sentimiento: sentimiento
      }]);

    } catch (error) {
      console.error('Error al comunicarse con la IA:', error);
      setMensajes(prev => [...prev, {
        role: 'assistant',
        content: '❌ Lo siento, hubo un error al procesar tu pregunta. Por favor, intenta de nuevo.',
        sentimiento: 'triste'
      }]);
    } finally {
      setCargando(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  const limpiarChat = () => {
    if (datosFinancieros) {
      setMensajes([{
        role: 'assistant',
        content: `Chat reiniciado. ¿En qué más puedo ayudarte con tus finanzas? 💰`
      }]);
    }
  };

  if (cargandoDatos) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tus datos financieros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header minimalista */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-lg">✨</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Asistente IA</h1>
              <p className="text-xs text-gray-500">Análisis financiero inteligente</p>
            </div>
          </div>
          <button
            onClick={limpiarChat}
            className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600"
            title="Nuevo chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 5v14m7-7H5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide bg-gradient-to-b from-white via-white to-gray-50">
        {mensajes.map((mensaje, index) => (
          <div
            key={index}
            className={`flex ${mensaje.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 items-end gap-3`}
          >
            {/* Imagen del asistente (lado izquierdo) */}
            {mensaje.role === 'assistant' && mensaje.sentimiento && (
              <img
                src={sentimientoImagen[mensaje.sentimiento] || sentimientoImagen.relajado}
                alt={mensaje.sentimiento}
                className="w-14 h-14 object-contain flex-shrink-0"
              />
            )}
            
            <div
              className={`max-w-[70%] px-5 py-3 rounded-2xl transition ${
                mensaje.role === 'user'
                  ? 'bg-indigo-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-900 shadow-sm'
              }`}
            >
              <div className={`text-sm leading-relaxed whitespace-pre-wrap ${
                mensaje.role === 'user' ? 'font-medium' : 'font-normal'
              }`}>
                {mensaje.content}
              </div>
            </div>
          </div>
        ))}
        
        {cargando && (
          <div className="flex justify-start animate-in fade-in">
            <div className="bg-gray-100 rounded-2xl px-5 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input área */}
      <div className="border-t border-gray-200 bg-white p-4 space-y-3">
        <div className="flex gap-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="¿Cómo van tus finanzas?"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-400 text-sm transition"
            rows={2}
            disabled={cargando}
          />
          <button
            onClick={enviarMensaje}
            disabled={cargando || !input.trim()}
            className={`h-fit px-4 py-3 rounded-xl transition flex items-center justify-center ${
              cargando || !input.trim()
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm hover:shadow-md'
            }`}
            title="Enviar (Enter)"
          >
            {cargando ? (
              <svg className="w-4 h-4 animate-spin" fill="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5.951-1.429 5.951 1.429a1 1 0 001.169-1.409l-7-14z" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 text-center">
          Enter para enviar • Shift+Enter para salto de línea
        </p>
      </div>
    </div>
  );
};

export default AsistenteFinanciero;