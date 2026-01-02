# 🔐 Sistema de Autenticación - Guía de Implementación

## ✅ Lo que se ha implementado

### Backend (Node.js + Express)

#### 1. **Modelo de Usuario** (`/backend/models/usuario.js`)
- Campo `nombre`: nombre del usuario
- Campo `email`: email único para identificar usuarios
- Campo `contraseña`: hasheada automáticamente con bcryptjs
- Campo `avatar`: inicial del nombre (ej: "J" para "Juan")
- Timestamps automáticos (createdAt, updatedAt)
- Pre-save hook que hashea la contraseña antes de guardar

#### 2. **Controlador de Autenticación** (`/backend/controllers/authController.js`)
Implementa 5 funciones principales:

- **`register()`**: Crea nuevo usuario
  - Valida que email no esté registrado
  - Genera avatar automaticamente
  - Retorna token JWT válido por 30 días
  
- **`login()`**: Inicia sesión
  - Verifica email existe
  - Valida contraseña contra hash
  - Retorna token JWT
  
- **`getCurrentUser()`**: Obtiene usuario actual
  - Valida token JWT
  - Retorna datos del usuario sin contraseña
  
- **`logout()`**: Cierra sesión (solo frontend)
  - Endpoint para limpiar estado
  
- **`getAllUsers()`**: Obtiene todos usuarios
  - Para función de comparativas
  - Retorna lista sin contraseñas

#### 3. **Rutas de Autenticación** (`/backend/routes/authRoutes.js`)
```
POST   /api/auth/register  - Registrar nuevo usuario
POST   /api/auth/login     - Iniciar sesión
GET    /api/auth/current   - Obtener usuario actual (requiere token)
POST   /api/auth/logout    - Cerrar sesión
GET    /api/auth/users     - Obtener lista de usuarios
```

#### 4. **Modelos Actualizados con Usuario**
- `transaccion.js`: Agregado campo `usuario` (ObjectId referencia)
- `cuenta.js`: Agregado campo `usuario` (ObjectId referencia)
- `prestamo.js`: Agregado campo `usuario` (ObjectId referencia)
- `presupuesto.js`: Agregado campo `usuario` (ObjectId referencia)

#### 5. **Dependencias Backend**
- `bcryptjs@^2.4.3` - Hashing de contraseñas
- `jsonwebtoken@^9.0.0` - Generación y validación de tokens JWT
- `express` y `mongoose` (ya instaladas)

---

### Frontend (React + Vite)

#### 1. **Contexto de Autenticación** (`/frontend/src/context/AuthContext.jsx`)
Hook personalizado `useAuth()` que proporciona:

```javascript
{
  usuario,              // Objeto usuario actual
  token,                // Token JWT
  loading,              // Estado de carga
  usuarios,             // Lista de todos los usuarios
  registrarse(nombre, email, contraseña),    // Función registro
  iniciarSesion(email, contraseña),          // Función login
  cerrarSesion(),                            // Función logout
  cambiarUsuario(usuarioId),                 // Cambiar usuario activo
  cargarUsuarios(),                          // Cargar lista de usuarios
  cargarUsuarioActual()                      // Cargar usuario desde token
}
```

#### 2. **Componente Login** (`/frontend/src/pages/Login.jsx`)
- Interfaz limpia con dos modos: Login y Registro
- Validación de campos
- Manejo de errores
- Almacena token en localStorage
- Redirecciona a dashboard tras login exitoso

#### 3. **Header Actualizado** (`/frontend/src/components/Header.jsx`)
Nuevas características:
- Avatar circular con inicial del usuario en top-right
- Dropdown al hacer click en avatar que muestra:
  - Usuario actual (con checkmark)
  - Lista de otros usuarios para cambiar
  - Botón "+ Agregar nuevo usuario"
  - Botón "Cerrar sesión"

#### 4. **App.jsx Refactorizado**
- Integración con Router (react-router-dom)
- AuthProvider envuelve toda la app
- Componente AppContent es el flujo principal (requiere usuario)
- Protección de rutas: si no hay usuario, muestra login
- Todos los handlers de creación agregan `usuario` ID automáticamente

#### 5. **Rutas Disponibles**
```
/login       - Página de login/registro
/registro    - Página de registro (mismo componente que login)
/            - Dashboard principal (requiere autenticación)
```

#### 6. **Dependencias Frontend**
- `react-router-dom@^6.20.0` - Routing
- (Otras ya instaladas: React, Tailwind, etc.)

---

## 🚀 Cómo Usar

### Para Usuarios

#### Primer acceso (Registro):
1. Navega a `http://localhost:3000/login`
2. Haz click en "¿No tienes cuenta? Crear cuenta"
3. Completa: Nombre, Email, Contraseña
4. Se crea la cuenta y accedes automáticamente al dashboard

#### Login:
1. En `http://localhost:3000/login`
2. Ingresa Email y Contraseña
3. Accedes a tu dashboard personal

#### Cambiar de Usuario:
1. En el top-right, haz click en el avatar (letra)
2. En el dropdown verás tus usuarios
3. Haz click en otro usuario para cambiar
4. O haz click en "+ Agregar nuevo usuario" para crear otro

#### Cerrar Sesión:
1. Click en avatar
2. Click en "Cerrar sesión"
3. Serás redirigido a login

---

## 📋 Flujo de Datos

```
Frontend (React)
├── AuthContext (AuthProvider)
│   ├── Estado: usuario, token, usuarios, loading
│   └── Métodos: login, register, logout, cambiarUsuario
├── Login component (page)
│   └── Maneja registro e login
├── Header component
│   └── Muestra avatar y dropdown de usuarios
└── AppContent (Dashboard + Sidebar)
    └── Usa usuario de contexto para filtrar datos

Backend (Express)
├── POST /api/auth/register
│   ├── Valida datos
│   ├── Crea usuario (hashea contraseña)
│   └── Genera token JWT
├── POST /api/auth/login
│   ├── Verifica credenciales
│   └── Genera token JWT
├── GET /api/auth/current
│   ├── Valida token
│   └── Retorna usuario actual
├── GET /api/auth/users
│   └── Retorna lista de usuarios
└── Todas las rutas de datos (transacciones, cuentas, etc.)
    ├── Reciben usuario ID en body
    └── Guardan referencia usuario en documento

MongoDB
├── Collection: usuarios
│   └── email (unique), nombre, contraseña (hashed), avatar
├── Collection: transacciones
│   └── usuario: ObjectId (referencia a Usuario)
├── Collection: cuentas
│   └── usuario: ObjectId (referencia a Usuario)
├── Collection: prestamos
│   └── usuario: ObjectId (referencia a Usuario)
└── Collection: presupuestos
    └── usuario: ObjectId (referencia a Usuario)
```

---

## 🔒 Seguridad

### Implementado:
✅ Contraseñas hasheadas con bcryptjs (salt rounds: 10)
✅ Tokens JWT con expiración (30 días)
✅ Email único por usuario
✅ Validación de campos (backend)
✅ Manejo de errores seguro (no expone detalles sensibles)

### Por Implementar (Futuro):
- [ ] Middleware de autenticación en rutas protegidas
- [ ] Refresh tokens
- [ ] Rate limiting en login
- [ ] Validación más robusta de emails (verificación)
- [ ] 2FA (autenticación de dos factores)
- [ ] Recuperación de contraseña

---

## 🛠️ Instalación y Ejecución

### Backend:
```bash
cd backend
npm install
npm run dev
# Escucha en http://localhost:3001
```

### Frontend:
```bash
cd frontend
npm install
npm run dev
# Escucha en http://localhost:5173 (o puerto disponible)
```

### Variables de Entorno (Opcional):
```bash
# Backend (.env)
JWT_SECRET=tu_secreto_aqui  # Default: 'tu_secreto_aqui'
PORT=3001                    # Default: 3001
```

---

## 📝 Ejemplos de API

### Registro
```bash
POST /api/auth/register
Content-Type: application/json

{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "contraseña": "micontraseña123"
}

Response:
{
  "success": true,
  "usuario": {
    "id": "...",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "avatar": "J"
  },
  "token": "eyJhbGc..."
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "contraseña": "micontraseña123"
}

Response:
{
  "success": true,
  "usuario": { ... },
  "token": "eyJhbGc..."
}
```

### Obtener Usuario Actual
```bash
GET /api/auth/current
Authorization: Bearer eyJhbGc...

Response:
{
  "success": true,
  "usuario": { ... }
}
```

### Crear Transacción (con usuario)
```bash
POST /api/transacciones
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "tipo": "gasto",
  "categoria": "Alimentos",
  "cantidad": 50000,
  "usuario": "usuario_id_aqui",
  "sujeto": "Sujeto 1",
  ...
}
```

---

## 🧪 Testing Manual

### Crear cuenta:
1. Ir a http://localhost:3000/login
2. Click "Crear cuenta"
3. Rellenar: Nombre="Test User", Email="test@email.com", Contraseña="test123"
4. Click "Crear Cuenta"
5. ✅ Deberías ver el dashboard con tu nombre

### Crear segunda cuenta:
1. Click en avatar (T)
2. Click "+ Agregar nuevo usuario"
3. Crear nueva cuenta con diferentes datos
4. Aparecer en el dropdown

### Cambiar entre usuarios:
1. Click avatar
2. Click en otro usuario
3. ✅ La información debe cambiar al usuario seleccionado

---

## 📊 Próximas Mejoras

1. **Comparativas**: Función para comparar datos entre múltiples usuarios
2. **Sujetos mejorados**: Los sujetos ahora pertenecen a un usuario
3. **Histórico**: Mantener registro de cambios
4. **Permisos**: Sistema de compartir datos entre usuarios
5. **Notificaciones**: Alertas por límites de presupuesto

---

## 🐛 Troubleshooting

### "Token inválido o expirado"
- Elimina el token de localStorage: `localStorage.removeItem('token')`
- Vuelve a iniciar sesión

### "El email ya está registrado"
- Usa un email diferente

### "Email o contraseña incorrectos"
- Verifica que escribiste bien email y contraseña
- Comprueba que la cuenta existe

### API no responde
- Verifica que backend está corriendo: `npm run dev` en carpeta backend
- Comprueba que MongoDB está activo

---

## 📚 Archivos Modificados/Creados

### Backend:
- ✅ `/backend/models/usuario.js` (Creado)
- ✅ `/backend/controllers/authController.js` (Creado)
- ✅ `/backend/routes/authRoutes.js` (Creado)
- ✅ `/backend/models/transaccion.js` (Modificado - agregado usuario)
- ✅ `/backend/models/cuenta.js` (Modificado - agregado usuario)
- ✅ `/backend/models/prestamo.js` (Modificado - agregado usuario)
- ✅ `/backend/models/presupuesto.js` (Modificado - agregado usuario)
- ✅ `/backend/index.js` (Modificado - agregadas rutas auth)
- ✅ `/backend/package.json` (Modificado - agregadas dependencias)

### Frontend:
- ✅ `/frontend/src/context/AuthContext.jsx` (Creado)
- ✅ `/frontend/src/pages/Login.jsx` (Creado)
- ✅ `/frontend/src/components/Header.jsx` (Modificado)
- ✅ `/frontend/src/App.jsx` (Modificado - integrado routing y auth)
- ✅ `/frontend/package.json` (Modificado - agregado react-router-dom)

---

**Implementado por:** Asistente de IA
**Fecha:** Enero 2025
**Estado:** ✅ Listo para pruebas
