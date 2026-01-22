# Sistema de Recordatorios de Anotaciones

## Descripción General

El sistema de recordatorios de anotaciones permite a los usuarios programar notificaciones para sus anotaciones. Cuando la fecha y hora del recordatorio llega, se crea automáticamente una notificación en el sistema que aparecerá en la bandeja de notificaciones.

## Componentes del Sistema

### 1. **Backend**

#### Modelo Anotacion.js
- `tieneRecordatorio`: Boolean que indica si la anotación tiene un recordatorio
- `fechaRecordatorio`: Fecha en la que se debe activar el recordatorio
- `horaRecordatorio`: Hora en formato HH:MM (opcional)
- `recordatorioEnviado`: Boolean que marca si el recordatorio ya ha sido procesado

#### Modelo Notificacion.js
- `tipo`: Ahora incluye el enum `'recordatorio-anotacion'`
- `anotacion`: ObjectId que referencia la anotación asociada
- Mantiene `urgente`, `enviarEmail`, `emailEnviado` para notificaciones por correo

#### CronService.js
Nueva función `verificarRecordatoriosAnotaciones()`:
```javascript
// Se ejecuta en intervalos según el ambiente:
// - Desarrollo: Cada 30 minutos (para pruebas rápidas)
// - Producción: Cada hora
```

**Flujo de ejecución:**
1. Busca todas las anotaciones con:
   - `tieneRecordatorio: true`
   - `recordatorioEnviado: false`
   - `completada: false`
   - `fechaRecordatorio <= ahora`

2. Para cada anotación encontrada:
   - Crea una nueva notificación con:
     - Tipo: `'recordatorio-anotacion'`
     - Urgente: `true` si la prioridad es 'alta'
     - Enlace a la anotación original
   - Marca `recordatorioEnviado: true` en la anotación
   - Registra en logs: `✅ Notificación de recordatorio creada`

3. Retorna el número de notificaciones creadas

### 2. **Frontend**

#### SeccionAnotaciones.jsx
- Interfaz para marcar una anotación con recordatorio
- Campo de fecha (`fechaRecordatorio`)
- Campo de hora (`horaRecordatorio`) - opcional
- Indicador visual en la tarjeta mostrando que tiene recordatorio

#### NotificacionesContext.jsx
- Realiza polling de notificaciones cada 30 segundos
- Incluye notificaciones de tipo `'recordatorio-anotacion'`
- Muestra iconos y colores diferenciados para este tipo

## Flujo Completo

### Usuario
1. Crea una anotación
2. Marca "Tiene recordatorio"
3. Selecciona fecha y hora
4. Guarda la anotación

### Sistema
1. **Cron Job** verifica cada 30 minutos (dev) o cada hora (prod)
2. Si encuentra anotaciones con recordatorio vencido:
   - Crea una notificación
   - Marca la anotación como "recordatorio enviado"
3. **Frontend** recibe la notificación en la siguiente consulta
4. **Usuario** ve la notificación en la bandeja

## Variables de Entorno

```bash
# En .env del backend
NODE_ENV=development  # Para intervalos de 30 minutos
# O
NODE_ENV=production   # Para intervalos de 1 hora
```

## Troubleshooting

### Las notificaciones no aparecen
1. **Verificar que el cronService está inicializado:**
   ```bash
   # En los logs del backend deben aparecer:
   # ✅ Tareas programadas inicializadas correctamente
   # 🔔 [DEV] Verificando recordatorios de anotaciones...
   ```

2. **Verificar que la anotación tiene recordatorio:**
   ```javascript
   // En el backend, ejecutar:
   db.anotacions.findOne({ tieneRecordatorio: true })
   ```

3. **Verificar fechaRecordatorio:**
   - La fecha debe estar en formato ISO (ej: `2026-01-20T14:30:00Z`)
   - Debe ser <= a la hora actual

4. **Verificar que recordatorioEnviado es false:**
   - Si es `true`, la tarea no lo procesará de nuevo

### Email no se envía
- El sistema intenta enviar email si `urgente: true` (prioridad alta)
- Verificar configuración de `emailService.js`
- Ver logs de `enviarEmailRecordatorio()`

## Testing

### Prueba Manual en Desarrollo

1. **Crear anotación con recordatorio inmediato:**
```javascript
// En el frontend, crear anotación con:
fechaRecordatorio: new Date()  // Fecha actual
prioridad: 'alta'  // Para que sea urgente
```

2. **Esperar hasta 30 minutos** (en dev) o mirar los logs

3. **Verificar logs del backend:**
```
✅ Notificación de recordatorio creada para anotación: Mi Anotación
```

4. **Verificar que aparece en NotificacionesContext**

## Ejemplos de Documentos en MongoDB

### Anotacion con Recordatorio
```javascript
{
  _id: ObjectId,
  titulo: "Pagar factura",
  contenido: "Factura del mes",
  tieneRecordatorio: true,
  fechaRecordatorio: ISODate("2026-01-20T14:30:00Z"),
  horaRecordatorio: "14:30",
  recordatorioEnviado: false,  // Se marca true después del cron
  prioridad: "alta",
  usuario: ObjectId,
  fechaCreacion: ISODate
}
```

### Notificacion Generada
```javascript
{
  _id: ObjectId,
  usuario: ObjectId,
  tipo: "recordatorio-anotacion",
  titulo: "Recordatorio: Pagar factura",
  mensaje: "Tienes un recordatorio para la anotación \"Pagar factura\"",
  anotacion: ObjectId,  // Referencia a la anotación
  leida: false,
  urgente: true,        // Si prioridad es 'alta'
  enviarEmail: true,
  emailEnviado: false,
  createdAt: ISODate
}
```

## Próximos Pasos Sugeridos

1. **Mejorar UI de recordatorios:**
   - Agregar vista previa de cuándo vence el recordatorio
   - Mostrar contador de recordatorios pendientes

2. **Agregar más opciones:**
   - Recordatorios recurrentes (cada día, cada semana)
   - Notificación push en el navegador
   - Integración con calendarios

3. **Optimizaciones:**
   - Considerar WebSockets para notificaciones en tiempo real
   - Agregar índices en MongoDB para `fechaRecordatorio`

## Logs Esperados

En desarrollo, deberías ver logs como:
```
📅 Inicializando tareas programadas...
✅ Tareas programadas inicializadas correctamente

[Cada 30 minutos:]
🔔 [DEV] Verificando recordatorios de anotaciones...
✅ [DEV] 2 notificaciones de recordatorio creadas
```

En producción:
```
🔔 Verificando recordatorios de anotaciones...
✅ 1 notificaciones de recordatorio creadas
```
