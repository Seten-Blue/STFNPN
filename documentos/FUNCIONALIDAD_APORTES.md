# 📊 Funcionalidad: Ver Detalles y Eliminar Aportes

## ✨ Lo que se ha implementado

### Backend

#### 1. **Modelos Actualizados**
- **Meta.js**: Agregar array `aportes` que almacena historial detallado de cada aporte con:
  - `usuarioId`: Usuario que hizo el aporte
  - `monto`: Cantidad aportada
  - `fecha`: Fecha del aporte
  - `descripcion`: Descripción opcional
  
- **AhorroCompartido.js**: Cambios idénticos al modelo Meta

#### 2. **Nuevos Endpoints**

**Para Metas:**
- `GET /api/metas/:id/detalles` - Obtener detalles completos de una meta con todos los aportes
- `DELETE /api/metas/:id/aporte/:aporteId` - Eliminar un aporte específico

**Para Ahorros Compartidos:**
- `GET /api/ahorro-compartido/:id/detalles` - Obtener detalles con todos los aportes
- `DELETE /api/ahorro-compartido/:id/aporte/:aporteId` - Eliminar un aporte específico

#### 3. **Actualización de Endpoints Existentes**
- `POST /api/metas/:id/aportacion` - Ahora registra el aporte en el historial
- `POST /api/ahorro-compartido/:id/aportacion` - Ahora registra el aporte en el historial

### Frontend

#### 1. **Nuevos Componentes Modales**
- **ModalDetallesMeta.jsx**: Modal para ver detalles completos de una meta
  - Información general (objetivo, acumulado, mi aporte, progreso)
  - Barra de progreso visual
  - Lista de MIS aportes con opción de eliminar cada uno
  - Lista de TODOS los aportes (otros participantes)

- **ModalDetallesAhorro.jsx**: Modal equivalente para ahorros compartidos

#### 2. **Interfaz Actualizada**
- **SeccionMetas.jsx**: 
  - Botón "💰 Aporte" para agregar aportación
  - Botón "📋 Detalles" para ver detalles completos

- **SeccionAhorrosCompartidos.jsx**:
  - Botón "💰 Aporte" para agregar aportación
  - Botón "📋 Detalles" para ver detalles completos

#### 3. **API Service Actualizada**
- `metasAPI.obtenerDetalles(id)` - Obtener detalles de una meta
- `metasAPI.eliminarAporte(id, aporteId, usuarioId)` - Eliminar aporte
- `ahorroCompartidoAPI.obtenerDetalles(id)` - Obtener detalles de ahorro
- `ahorroCompartidoAPI.eliminarAporte(id, aporteId, usuarioId)` - Eliminar aporte

## 🎯 Flujo de Uso

### Para Ver Detalles y Administrar Aportes:
1. Ir a "Mis Metas" o "Ahorros Compartidos"
2. Hacer clic en botón "📋 Detalles" de la meta/ahorro deseado
3. Ver el modal con:
   - Información general de la meta/ahorro
   - Barra de progreso visual
   - **Mis aportes**: Todos tus aportes con botón 🗑️ para eliminar
   - **Todos los aportes**: Historial completo de otros participantes

### Para Eliminar un Aporte:
1. Abrir el modal de detalles
2. En la sección "Mis aportes", buscar el aporte a eliminar
3. Hacer clic en el botón 🗑️
4. Confirmar la eliminación
5. El aporte se elimina automáticamente y se recalculan totales

## 🔒 Seguridad
- Solo puedes eliminar tus propios aportes
- El sistema valida que el aporte pertenece al usuario antes de eliminar
- Se recalculan automáticamente: `participantes`, `montoActual`, `progreso`
- Si se elimina un aporte y ya no hay aportes, el estado vuelve de "completada" a "activa" si aplica

## 📋 Cambios en BD
Las metas y ahorros compartidos existentes seguirán funcionando normalmente. Los aportes nuevos se registrarán en el historial detallado automáticamente.

## ✅ Funcionalidad Completa
✓ Ver detalles de metas y ahorros  
✓ Ver historial de todos los aportes  
✓ Eliminar aportes propios  
✓ Validación de permisos  
✓ Recálculo automático de totales  
✓ Interface intuitiva con modales  
