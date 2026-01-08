# 🧪 Guía de Debugging - Notificaciones Vacías

## Problema
La sección de notificaciones aparece vacía aunque debería haber notificaciones.

## Paso 1: Verificar que el componente se monta
1. Abre DevTools (F12 → Console)
2. Busca el log: `🎯 [SeccionNotificaciones] Componente montado/renderizado`
3. Si NO ves este log:
   - El componente no se está cargando
   - Verifica que estás navegando a la sección de notificaciones
   - Revisa que no hay errores en React/componentes

## Paso 2: Verificar que el usuario está autenticado
1. En DevTools Console, escribe:
   ```javascript
   localStorage.getItem('usuario')
   ```
2. Si devuelve `null` o `undefined`:
   - ❌ Usuario NO autenticado
   - Inicia sesión nuevamente
3. Si devuelve un objeto JSON:
   - ✅ Usuario autenticado correctamente

## Paso 3: Verificar que el token existe
1. En DevTools Console, escribe:
   ```javascript
   localStorage.getItem('token')
   ```
2. Si devuelve `null`:
   - ❌ No hay token
   - Inicia sesión nuevamente
3. Si devuelve una cadena larga (JWT):
   - ✅ Token presente

## Paso 4: Verificar que se intenta cargar las notificaciones
1. En DevTools Console, busca logs como:
   ```
   📡 [SeccionNotificaciones] Pidiendo notificaciones con filtros:
   ```
2. Si NO ves este log:
   - El `cargarNotificaciones()` no se ejecutó
   - Revisa que no hay errores en React

## Paso 5: Verificar la respuesta del servidor
1. En DevTools Console, busca:
   ```
   📨 [SeccionNotificaciones] Respuesta recibida: [Array...]
   ```
2. Si ves un Array vacío `[]`:
   - ❌ El servidor no devuelve notificaciones
   - Ve al Paso 6
3. Si ves un Array con objetos:
   - ✅ Las notificaciones llegan correctamente
   - El problema es que no se están mostrando en el UI
   - Abre la Network tab y verifica la respuesta HTTP

## Paso 6: Verificar en Base de Datos
1. Abre terminal y ve a la carpeta backend:
   ```bash
   cd backend
   node verificar-notificaciones.js
   ```
2. Verifica:
   - ¿Existen notificaciones en la BD? (Debe mostrar "32 notificaciones")
   - ¿Tu usuario tiene notificaciones? (Busca tu nombre en la lista)

## Paso 7: Probar endpoint manualmente
1. En DevTools, Network tab
2. Filtra por `notificaciones`
3. Cuando se carga SeccionNotificaciones, deberías ver:
   - GET /api/notificaciones
   - Status: 200 (no 401, 403, 500)
   - Response contiene un Array

## Paso 8: Revisar errores en consola
1. En DevTools Console, busca errores rojos (🔴)
2. Busca especialmente:
   - `Error al cargar notificaciones`
   - `Error al obtener notificaciones`
   - Cualquier error 401/403/500

## Si aún no funciona...

### Opción A: Crear notificación manual de prueba
1. En SeccionNotificaciones, hay botón "+ Nuevo Recordatorio"
2. Llena:
   - Título: "Test"
   - Mensaje: "Prueba de notificación"
   - Tipo: "recordatorio"
   - Fecha: Hoy
   - Hora: Ahora mismo
3. Click en Crear
4. Mira los logs en Console

### Opción B: Crear una petición HTTP manual
1. En DevTools Console:
```javascript
const token = localStorage.getItem('token');
fetch('http://localhost:3001/api/notificaciones', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('📨 Respuesta:', data))
.catch(e => console.error('❌ Error:', e))
```
2. Observa la respuesta en Console

### Opción C: Revisar logs del servidor backend
1. En terminal donde corre el backend, busca:
   ```
   🔔 [obtenerNotificaciones] Usuario:
   📊 [obtenerNotificaciones] Filtro:
   ✅ [obtenerNotificaciones] X notificaciones encontradas
   ```
2. Si hay error:
   ```
   ❌ [obtenerNotificaciones] Usuario no autenticado
   ```
   = El token no se envía correctamente

## Información a proporcionar si necesitas ayuda

Si aún no funciona, proporciona:

1. **Logs de Console** (screenshot o copia/pega)
   - ¿Ves `🎯 [SeccionNotificaciones] Componente montado`?
   - ¿Ves `📡 [SeccionNotificaciones] Pidiendo notificaciones`?
   - ¿Qué dice `📨 [SeccionNotificaciones] Respuesta recibida`?

2. **Logs del servidor backend** (copia/pega)
   - ¿Ves `🔔 [obtenerNotificaciones]`?
   - ¿Qué dice `✅ [obtenerNotificaciones] X notificaciones`?

3. **Status HTTP**
   - ¿Qué código devuelve GET /api/notificaciones?

4. **Base de datos**
   - ¿Qué dice `node verificar-notificaciones.js`?
   - ¿Tu usuario tiene notificaciones?

---

**Fecha de creación:** 7 de enero de 2026
