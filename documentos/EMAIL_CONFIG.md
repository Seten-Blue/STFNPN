# 📧 Configuración de Email (Gmail)

## Problema Actual
El error `535-5.7.8 Username and Password not accepted` indica que Gmail está rechazando las credenciales.

## Solución: Usar Google App Password

### Paso 1: Habilitar Autenticación de 2 Factores en tu cuenta Gmail
1. Ve a tu cuenta de Google: https://myaccount.google.com
2. En el menú izquierdo, selecciona "Seguridad"
3. Bajo "Cómo accedes a Google", activa "Verificación en 2 pasos"
4. Sigue las instrucciones para completar la configuración

### Paso 2: Crear una Contraseña de Aplicación
1. Después de habilitar 2FA, ve nuevamente a "Seguridad"
2. Desplázate hasta "Contraseñas de aplicación"
3. Selecciona:
   - **Aplicación:** "Correo"
   - **Dispositivo:** "Windows (o tu SO)"
4. Gmail generará una contraseña de 16 caracteres (sin espacios)

### Paso 3: Actualizar el archivo .env
Reemplaza el `EMAIL_PASSWORD` con la contraseña generada por Google:

```env
EMAIL_USER=tu.email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # (sin espacios en la contraseña real)
```

**⚠️ IMPORTANTE:** 
- La contraseña que genera Google NO es tu contraseña de Gmail
- Nunca compartas esta contraseña
- Cada contraseña de aplicación es única y está vinculada a tu cuenta

### Paso 4: Reiniciar el servidor
```bash
npm run dev  # o npm start
```

### Verificación
El servidor debería mostrar:
```
✅ Email de prueba enviado: <message-id>
📅 Inicializando tareas programadas...
✅ Tareas programadas inicializadas correctamente
```

## Problemas Comunes

### Error: "Less secure app access"
- Este error ocurre si intentas usar tu contraseña de Gmail regular
- Solución: Usa obligatoriamente la "Contraseña de Aplicación" (App Password)

### Error: "Invalid credentials"
- Verifica que el `EMAIL_USER` sea exactamente tu email de Gmail
- Verifica que la contraseña se copió correctamente sin espacios

### Error: "ECONNREFUSED"
- Verifica tu conexión a internet
- Comprueba que no hay firewall bloqueando el puerto SMTP (587)

## Variables de Entorno (.env)

```env
# Email Configuration
EMAIL_USER=sistem.financiero2025@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # App Password de Google (sin espacios)

# Database
MONGODB_URI=mongodb://localhost:27017/sistema_financiero

# Server
PORT=3001
NODE_ENV=development
```

## Funcionalidades que Requieren Email

1. **Notificaciones Urgentes por Email**: Cuando creas una notificación con "Urgente" = true
2. **Recordatorios Programados**: Las transacciones programadas envían confirmación al aplicarse
3. **Alertas de Meta**: Cuando una meta está por vencer
4. **Reportes**: Resúmenes mensuales por email (futuro)

## Prueba de Conexión

Envía un email de prueba mediante el endpoint:
```bash
curl -X POST http://localhost:3001/api/email/prueba \
  -H "Content-Type: application/json" \
  -d '{"email":"tu.email.de.prueba@gmail.com"}'
```

Respuesta esperada:
```json
{
  "mensaje": "Email de prueba enviado correctamente",
  "messageId": "<mensaje-id@gsmtp.google.com>"
}
```
