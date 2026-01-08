#!/bin/bash

# Script para limpiar y reiniciar MongoDB en caso de problemas graves

echo "🧹 Limpieza de MongoDB..."
echo "⚠️  ESTO ELIMINARÁ TODOS LOS DATOS DE MONGODB"
echo ""

read -p "¿Estás seguro de que quieres continuar? (s/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Operación cancelada"
    exit 1
fi

echo ""
echo "Deteniendo contenedores..."
docker compose down

echo ""
echo "Eliminando volumes..."
# Obtener el nombre del proyecto desde el directorio actual
PROJECT_NAME=$(basename "$(pwd)" | tr ' ' '_' | tr -d '-')
docker volume rm ${PROJECT_NAME}_mongo-data ${PROJECT_NAME}_mongo-config 2>/dev/null || true
docker volume rm mongo-data mongo-config 2>/dev/null || true

echo ""
echo "Eliminando contenedores en conflicto..."
docker rm mongo-sistemafinanciero mongo-express 2>/dev/null || true

echo ""
echo "Limpiando imágenes locales sin usar..."
docker image prune -f

echo ""
echo "✅ Limpieza completada"
echo ""
echo "Iniciando MongoDB nuevamente..."
docker compose up -d

echo ""
echo "Esperando a que MongoDB esté listo..."
sleep 10

echo ""
echo "✅ MongoDB reiniciado correctamente"
echo ""
echo "Verifica el estado:"
echo "  docker compose ps"
echo ""
echo "Accede a Mongo Express:"
echo "  http://localhost:8081"
