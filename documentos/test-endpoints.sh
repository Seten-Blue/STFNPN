#!/bin/bash

# Este script prueba los endpoints de notificaciones manualmente

echo "🧪 Probando endpoints de notificaciones"
echo "======================================="
echo ""

# Token de prueba para Juan Alvarez (esto puede necesitar actualización)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5NWQzYmZjM2ZhNjhiMzJiNWNhYjNiNiIsIm5vbWJyZSI6Ikp1YW4gQWx2YXJleiIsImVtYWlsIjoianVhbmNhcmxvcy5hbHZhcmV6MjEwNkBnbWFpbC5jb20iLCJpYXQiOjE3MzYzMjYyMDksImV4cCI6MTczNjQxMjYwOX0.QhXdVrFZe7PYCeaIX7J0TAWjJVSqJJ74HWxKQCWlmxc"

echo "1️⃣ Probando GET /api/notificaciones"
echo "   Token: ${TOKEN:0:20}..."
echo ""
curl -s -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:3001/api/notificaciones | jq . | head -50

echo ""
echo "======================================="
echo ""
echo "2️⃣ Probando GET /api/notificaciones/contar"
echo ""
curl -s -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     http://localhost:3001/api/notificaciones/contar | jq .

echo ""
echo "======================================="
echo ""
echo "⚠️ NOTA: El token anterior puede estar expirado"
echo "Para obtener un token válido, inicia sesión en la app"
echo "y copia el valor de 'token' desde localStorage en la consola"
