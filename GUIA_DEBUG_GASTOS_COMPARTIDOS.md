# Guía de Debug - Gastos Compartidos

## Problema Reportado
El usuario reporta que:
1. **Las notificaciones no aparecen** cuando se crea un gasto compartido
2. **Las transacciones solo se asignan al creador**, no a los participantes
3. **Los otros participantes no ven la transacción** en sus cuentas

## Cambios Realizados

### 1. ✅ Fix en las Notificaciones (Crítico)
**Archivo:** `backend/controllers/transaccionController.js`

**Problema:** La comparación de IDs al crear notificaciones estaba fallando porque se comparaba un `ObjectId` con un `string`.

**Solución:** Ahora se comparan correctamente como strings para determinar si el usuario es el creador.

```javascript
// ANTES: ❌ Falla porque usuarioId es ObjectId y usuario es string
leida: usuarioId === usuario ? true : false,

// DESPUÉS: ✅ Compara correctamente
const esElCreador = usuarioIdStr === usuario || usuarioIdStr === usuarioIdString;
leida: esElCreador ? true : false,
```

**Resultado:** 
- El creador ve la notificación como leída ✓
- Los otros participantes ven la notificación como NO leída ✓

### 2. ✅ Mejor Visibilidad de Transacciones Creadas
**Archivo:** `backend/controllers/transaccionController.js`

Se agregó un resumen detallado en la respuesta al crear un gasto compartido:

```json
{
  "resumen": {
    "tipo": "gasto",
    "montoTotal": 100,
    "numParticipantes": 3,
    "transacciones": [
      {
        "id": "...",
        "usuario": "Juan",
        "cantidad": 33.33,
        "cuenta": "Mi Cuenta Bancaria"
      },
      ...
    ]
  }
}
```

### 3. ✅ Mejor Comunicación al Usuario (Frontend)
**Archivos:** 
- `frontend/src/components/ModalGastoCompartido.jsx`
- `frontend/src/components/ModalIngresoCompartido.jsx`

Ahora se muestra un resumen de las transacciones creadas:

```
✅ Gasto compartido creado exitosamente!

Transacciones creadas:
✓ Juan: $33.33 (Cuenta: Mi Cuenta Bancaria)
✓ Pedro: $33.33 (Cuenta: Mi Cuenta Bancaria)
✓ Tú: $33.34 (Cuenta: Cuenta Bancaria Principal)
```

### 4. ✅ Mejor Logging para Debug
**Archivo:** `backend/controllers/transaccionController.js`

Se mejoró el logging para incluir:
- IDs de participantes recibidos
- Usuario creador
- Nombre de las cuentas

### 5. ✅ Endpoint de Debug
**Archivo:** `backend/routes/transaccionRoutes.js`

Se agregó un nuevo endpoint `/api/transacciones/debug?usuarioId=...` que muestra:
- Las últimas transacciones compartidas del usuario
- Las cuentas utilizadas para cada transacción
- Resumen por sujeto/participante

## Cómo Probar

### Paso 1: Crear un Gasto Compartido
1. Inicia sesión como Usuario A
2. Ve a Dashboard → Gasto Compartido
3. Completa el formulario:
   - Concepto: "Cena"
   - Monto: $100
   - Participantes: Selecciona Usuario B y Usuario C
   - Tipo de distribución: Equitativa
4. Envía el formulario

### Paso 2: Verificar el Resumen
- Deberías ver una alerta con el resumen de transacciones creadas
- Verifica que menciona a cada participante con su monto

### Paso 3: Verificar Notificaciones
1. **Para Usuario A:** Las notificaciones deberían estar marcadas como leídas (ya que es el creador)
2. **Para Usuario B y C:** 
   - Cambia al Usuario B/C
   - Ve a Notificaciones
   - Deberías ver una notificación "Gasto compartido creado"
   - La notificación debe estar sin leer (fondo diferente)

### Paso 4: Verificar Transacciones
1. **Para Usuario A:**
   - Ve a Transacciones
   - Filtra por el período/fecha
   - Deberías ver transacciones con anotación "GASTO COMPARTIDO: Cena"

2. **Para Usuario B:**
   - Cambia al Usuario B
   - Ve a Transacciones
   - Deberías ver la misma transacción con su monto ($33.33)
   - En la cuenta que se especificó

3. **Para Usuario C:**
   - Cambia al Usuario C
   - Ve a Transacciones
   - Deberías ver la transacción con su monto ($33.34)

### Paso 5: Verificar Saldos
- **Usuario A:** Saldo debe disminuir en $100
- **Usuario B:** Saldo debe disminuir en $33.33
- **Usuario C:** Saldo debe disminuir en $33.34

### Paso 6: Debug en la Consola del Navegador
1. Abre la consola del navegador (F12)
2. Busca el log `📤 Enviando gasto compartido`
3. Verifica que `participantesEnviados` incluye a todos los usuarios con sus montos

### Paso 7: Debug en el Servidor
1. En los logs del servidor, busca `🎯 ENTRADA A crearTransaccionCompartida`
2. Verifica que muestre los participantes recibidos correctamente
3. Busca `✅ Transacción creada` para cada participante

## Posibles Problemas y Soluciones

### Problema: "No veo ningún participante seleccionado"
- **Causa:** El participante no está siendo enviado al backend
- **Solución:** Verifica que seleccionaste participantes en el modal
- **Debug:** Abre la consola y revisa el log `participantesEnviados`

### Problema: "Se creó transacción pero solo para el creador"
- **Causa:** Los participantes podrían no estar en el objeto enviado
- **Solución:** Revisa el resumen que se muestra - ¿cuántas transacciones dice que creó?
- **Debug:** Ve a `/api/transacciones/debug?usuarioId=TU_ID` en el navegador

### Problema: "El participante no ve la transacción en su cuenta"
- **Causa:** Podría haber múltiples cuentas y se usó la primera
- **Solución:** Verifica cuál cuenta se menciona en el resumen
- **Nota:** Actualmente el sistema usa la PRIMERA cuenta del participante

### Problema: "Las notificaciones del participante no aparecen"
- **Causa:** El fix del comparador de IDs debería haber solucionado esto
- **Solución:** Asegúrate de recargar la página después de hacer cambios
- **Debug:** Revisa que `leida: false` en la notificación creada para los no-creadores

## Próximas Mejoras

1. **Permitir seleccionar cuenta por participante** - Actualmente usa la primera
2. **Notificación visual en el header** - Alert badge cuando hay gastos compartidos pendientes
3. **Vista de aprobación** - Permitir aceptar/rechazar gastos compartidos
4. **Historial de participación** - Ver todos los gastos compartidos en los que participa

## Preguntas?

Si algo sigue sin funcionar:
1. Revisa los logs del servidor (busca "COMPARTIDO")
2. Abre la consola del navegador (F12)
3. Intenta crear de nuevo un gasto compartido
4. Comparte los logs con el equipo de desarrollo
