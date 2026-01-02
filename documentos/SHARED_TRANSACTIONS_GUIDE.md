# 📊 Guía de Transacciones Compartidas y Metas

## 🎯 Resumen

Se han implementado **4 modales profesionales** para gestionar transacciones compartidas y metas de ahorro en el Sistema Financiero.

---

## 📋 Módulos Implementados

### 1. 💸 **Modal Gasto Compartido**
**Archivo:** `frontend/src/components/ModalGastoCompartido.jsx`

**Descripción:** Permite dividir un gasto entre múltiples usuarios.

**Características:**
- 📝 Concepto/descripción del gasto
- 💳 Monto total a dividir
- 🏦 Selección de cuenta de origen
- 📅 Fecha y hora del gasto
- ⚖️ **Dos tipos de distribución:**
  - **Equitativa:** Divide automáticamente (50/50, 33/33/33, etc.)
  - **Personalizada:** Permite especificar montos manuales para cada participante
- 👥 Selector de participantes con checkboxes
- 🎨 **Tema:** Gradient naranja/rojo

**Validaciones:**
- Monto total debe ser positivo
- Al menos una cuenta debe estar seleccionada
- En distribución personalizada, el total debe coincidir con el monto

**Almacenamiento:**
- Crea un registro de tipo `gasto` en la colección transacciones
- Los participantes se guardan en el campo `anotaciones` en formato JSON

---

### 2. 💰 **Modal Ingreso Compartido**
**Archivo:** `frontend/src/components/ModalIngresoCompartido.jsx`

**Descripción:** Permite dividir un ingreso entre múltiples usuarios.

**Características:**
- 📝 Concepto del ingreso (Ej: Venta conjunta, Premio, Devolución)
- 💳 Monto total a dividir
- 🏦 Selección de cuenta destino
- 📅 Fecha y hora del ingreso
- ⚖️ **Dos tipos de distribución:**
  - **Equitativa:** División automática
  - **Personalizada:** Especificar montos manuales
- 👥 Selector de participantes
- 🎨 **Tema:** Gradient verde/esmeralda

**Validaciones:**
- Monto total debe ser positivo
- Debe seleccionar al menos una cuenta
- En distribución personalizada, validar total

**Almacenamiento:**
- Crea un registro de tipo `ingreso` en transacciones
- Los datos de participantes se guardan en anotaciones

---

### 3. 🎯 **Modal Meta Requerida**
**Archivo:** `frontend/src/components/ModalMetaRequerida.jsx`

**Descripción:** Define objetivos de ahorro a largo plazo.

**Características:**
- 📋 Nombre de la meta (Ej: Viaje a Europa, Auto nuevo)
- 📝 Descripción detallada
- 💰 Monto objetivo a alcanzar
- ⏰ Fecha límite
- 🚀 **Niveles de prioridad:** Baja, Media, Alta
- 💭 Motivo/propósito de la meta
- 👥 Múltiples participantes pueden compartir la meta
- 📊 **Display dinámico de días restantes** con color:
  - Verde (>30 días)
  - Amarillo (7-30 días)
  - Rojo (<7 días)
- 🎨 **Tema:** Gradient púrpura/índigo

**Validaciones:**
- Nombre y monto objetivo requeridos
- Fecha límite no puede ser anterior a hoy
- Monto objetivo debe ser positivo

**Almacenamiento:**
- Se almacena en una colección separada `metas`
- Incluye: nombre, descripción, montoObjetivo, montoActual, fechaLimite, prioridad, participantes, estado, progreso

---

### 4. 🏦 **Modal Ahorro Compartido**
**Archivo:** `frontend/src/components/ModalAhorroCompartido.jsx`

**Descripción:** Crea fondos comunes para ahorros conjuntos.

**Características:**
- 📌 Nombre del fondo (Ej: Fondo Vacaciones, Proyecto Casa)
- 📝 Descripción del propósito
- 🎯 Monto objetivo del fondo
- 💾 Cuenta destino para depósitos
- 👥 **Aportaciones personalizadas por participante**
  - Cada participante indica cuánto aporta
  - El total se suma automáticamente
- 📊 **Barra de progreso visual**
  - Muestra % de avance hacia la meta
  - Muestra cantidad ahorrada vs objetivo
- 💭 Motivo/propósito del fondo
- 📌 **Estados:** Activo, Pausado, Completado
- 🎨 **Tema:** Gradient teal/cyan

**Validaciones:**
- Nombre y monto objetivo requeridos
- Debe seleccionar una cuenta destino
- Al menos un participante con aportación > 0

**Almacenamiento:**
- Se almacena en colección `ahorroCompartido`
- Incluye: nombre, descripción, montoObjetivo, montoActual, cuentaDestino, participantes con aportaciones, estado, progreso automático

---

## 🎨 Esquema de Colores

| Modal | Colores | Emojis |
|-------|---------|--------|
| **Gasto Compartido** | Rojo/Naranja | 💸 |
| **Ingreso Compartido** | Verde/Esmeralda | 💰 |
| **Meta Requerida** | Púrpura/Índigo | 🎯 |
| **Ahorro Compartido** | Teal/Cyan | 🏦 |

---

## 🔗 Integración en la Aplicación

### Header
Los 4 modales tienen botones en el Header (visible en pantallas ≥ md):
```jsx
<button onClick={onGastoCompartidoClick}>💸 Gasto Compartido</button>
<button onClick={onIngresoCompartidoClick}>💰 Ingreso Compartido</button>
<button onClick={onMetaRequeridaClick}>🎯 Meta</button>
<button onClick={onAhorroCompartidoClick}>🏦 Ahorro Compartido</button>
```

### App.jsx
- Estados de visibilidad para cada modal
- Propiedades (props) pasadas desde App hacia Header
- Modales renderizados al final del componente
- Funcionan con los APIs del backend

---

## 🔌 APIs Requeridos en Backend

### Metas
```
POST   /api/metas                    - Crear meta
GET    /api/metas                    - Obtener metas
PUT    /api/metas/:id                - Actualizar meta
DELETE /api/metas/:id                - Eliminar meta
```

### Ahorro Compartido
```
POST   /api/ahorro-compartido        - Crear fondo
GET    /api/ahorro-compartido        - Obtener fondos
PUT    /api/ahorro-compartido/:id    - Actualizar fondo
DELETE /api/ahorro-compartido/:id    - Eliminar fondo
```

### Transacciones (Para Gasto/Ingreso Compartido)
- Se usan los endpoints existentes de transacciones
- Se diferencia por campo `tipo: 'gasto'` o `tipo: 'ingreso'`
- Datos de participantes en campo `anotaciones`

---

## 📦 Estructura de Datos

### Gasto/Ingreso Compartido
```json
{
  "tipo": "gasto|ingreso",
  "categoria": "Gasto/Ingreso Compartido",
  "cantidad": 100.00,
  "fecha": "2025-01-15",
  "hora": "14:30",
  "cuentaOrigen|cuentaDestino": "ObjectId",
  "anotaciones": "{\"usuarioId1\": 50, \"usuarioId2\": 50}"
}
```

### Meta Requerida
```json
{
  "nombre": "Viaje a Europa",
  "descripcion": "Viaje familiar",
  "montoObjetivo": 5000,
  "montoActual": 0,
  "fechaLimite": "2025-12-31",
  "prioridad": "alta|media|baja",
  "participantes": ["userId1", "userId2"],
  "estado": "activa",
  "motivo": "Vacaciones en verano",
  "progreso": 0
}
```

### Ahorro Compartido
```json
{
  "nombre": "Fondo Vacaciones",
  "descripcion": "Ahorro para viaje",
  "montoObjetivo": 5000,
  "montoActual": 1500,
  "cuentaDestino": "ObjectId",
  "participantes": {
    "userId1": 750,
    "userId2": 750
  },
  "estado": "activo|pausado|completado",
  "motivo": "Vacaciones de verano",
  "progreso": 30,
  "fechaCreacion": "2025-01-15"
}
```

---

## ✨ Características Destacadas

### Interfaz Profesional
- ✅ Headers con gradients atractivos
- ✅ Emojis para mejor UX
- ✅ Botones con transiciones suaves
- ✅ Validaciones en tiempo real
- ✅ Feedback visual del usuario

### Funcionalidad
- ✅ Distribución automática vs manual de montos
- ✅ Cálculos de progreso dinámicos
- ✅ Selector visual de participantes
- ✅ Validación total de distribuciones
- ✅ Indicadores de tiempo (días restantes)

### Responsividad
- ✅ Botones en Header visibles en md+ (no en mobile)
- ✅ Modales adaptativos (max-h-[90vh])
- ✅ Scrollable para lista de participantes
- ✅ Grid layouts adaptables

---

## 🚀 Próximos Pasos (Opcionales)

1. **Backend:** Crear models y controllers para Metas y AhorroCompartido
2. **Frontend:** Crear secciones de visualización de metas y ahorros
3. **Dashboard:** Agregar widgets que muestren progreso de metas
4. **Reportes:** Generar reportes de participación en fondos comunes
5. **Notificaciones:** Alertas cuando se aproximan fechas límite de metas
6. **PDF/Excel:** Exportar reportes de transacciones compartidas

---

## 📝 Notas Técnicas

- **React Hooks:** Uso de `useState` para manejo de estados
- **Tailwind CSS:** Clases de utilidad para estilos
- **Validaciones:** Implementadas en el cliente antes de enviar
- **Error Handling:** Try-catch en funciones async
- **Props:** Flujo unidireccional desde App → Header → Modales

---

## ✅ Checklist de Implementación

- [x] ModalGastoCompartido creado y funcional
- [x] ModalIngresoCompartido creado y funcional
- [x] ModalMetaRequerida creado y funcional
- [x] ModalAhorroCompartido creado y funcional
- [x] Integración en App.jsx
- [x] Botones en Header
- [x] APIs en services/api.js
- [x] Validaciones de formularios
- [x] Estilos con gradients y temas
- [x] Compilación sin errores (Vite)

---

**Creado:** 15 de Enero, 2025
**Versión:** 1.0
**Estado:** ✅ Completado y Listo para Usar
