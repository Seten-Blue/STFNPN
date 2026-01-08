# 🗄️ Instrucciones MongoDB - Sistema Financiero

## ✅ Solución: Ahora con Docker Compose es Suficiente

Se ha actualizado la configuración de Docker Compose para que **MongoDB se inicie y mantenga automáticamente** sin necesidad de scripts adicionales.

### Cambios Realizados:

1. **Persistencia de datos** - Volumes de Docker
   - `mongo-data:/data/db` - Datos de la base de datos
   - `mongo-config:/data/configdb` - Configuración de MongoDB

2. **Reinicio automático** - `restart: unless-stopped`
   - Si el contenedor falla, Docker lo reinicia automáticamente
   - Si lo detienes manualmente con `docker stop`, no se reinicia

3. **Health Check** - Verificación de salud
   - MongoDB se espera hasta que esté listo
   - Mongo-Express solo se inicia cuando MongoDB está completamente operativo

4. **Dependencias correctas**
   - `depends_on` con `condition: service_healthy`
   - Esto garantiza que el orden de inicio sea correcto

---

## 🚀 Uso Simple

### Iniciar Todo:
```bash
cd /home/juanda/Documentos/Poyectos\ /SistemaFinanciero
docker compose up -d
```

✅ Eso es todo. MongoDB estará listo en segundos.

### Verificar Estado:
```bash
docker compose ps
```

Deberías ver:
- ✅ `mongo-sistemafinanciero` - running
- ✅ `mongo-express` - running

### Detener (si es necesario):
```bash
docker compose down
```
⚠️ Los datos se conservan (están en los volumes)

### Ver Logs de MongoDB:
```bash
docker compose logs mongo -f
```

### Ver Logs de Mongo Express:
```bash
docker compose logs mongo-express -f
```

---

## 🔧 Si Necesitas Limpiar Todo (última opción):

```bash
# Detener contenedores
docker compose down

# Eliminar volumes (⚠️ ESTO ELIMINA LOS DATOS)
docker volume rm sistemafinanciero_mongo-data sistemafinanciero_mongo-config

# Reiniciar
docker compose up -d
```

---

## 📊 Acceso a MongoDB

**Mongo Express (GUI):** http://localhost:8081
- Usuario: `admin`
- Contraseña: `admin123`

**MongoDB Connection String:**
```
mongodb://admin:admin123@localhost:27017/sistemafinanciero?authSource=admin
```

---

## ⚠️ Solución de Problemas

### Error: "Address already in use :27017"
```bash
# El puerto 27017 ya está en uso
# Opción 1: Detener otros MongoDB
docker ps -a | grep mongo

# Opción 2: Cambiar puerto en docker-compose.yml
# Cambiar: 27017:27017
# A:      27018:27017 (por ejemplo)
```

### Error: "mongo-express can't connect to mongo"
```bash
# Esperar 30-40 segundos, Mongo tarda en estar listo
docker compose logs mongo
```

### MongoDB no inicia después de apagar el PC
```bash
# Esto ya no debería pasar con la nueva configuración
# Si ocurre, revisar logs:
docker compose logs mongo
```

---

## 📝 Resumen de Cambios

| Antes | Ahora |
|-------|-------|
| ❌ Sin persistencia | ✅ Con volumes |
| ❌ Sin reinicio automático | ✅ `restart: unless-stopped` |
| ❌ Sin health check | ✅ Health check incluido |
| ❌ Mongo-express inicia antes de estar listo | ✅ Espera a que Mongo esté listo |

---

Ahora simplemente ejecuta `docker compose up -d` y olvídate del mantenimiento manual de MongoDB.
