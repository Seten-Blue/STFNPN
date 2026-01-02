# 🎯 Nueva Lógica de División de Gastos/Ingresos Compartidos

## Fecha: 2 de Enero 2026

### 📊 Ejemplo Práctico

**Situación:**
- Tú (Juan) y tu amigo Pedro salen a cenar
- La factura total es: **$50.000**
- Tú pagas **$30.000** (tu comida + propinas)
- Pedro debe pagar **$20.000** (su comida)

---

## ✅ CÓMO USAR AHORA

### **Opción 1: Distribución Equitativa (La más común)**

1. **Creas un GASTO COMPARTIDO:**
   - Concepto: "Cena"
   - **Monto Total**: $50.000
   - Seleccionas participantes: ✅ Tú, ✅ Pedro
   - Tipo de Distribución: **"Equitativa"**
   - **Mi Pago**: $30.000 ← **AQUÍ ES CLAVE**
   
2. **¿Qué sucede?**
   - Sistema calcula: $50.000 - $30.000 = $20.000 (para Pedro)
   - Se dividen en 1 participante (Pedro)
   - **Resultado final:**
     - Tú pagas: $30.000 ✅
     - Pedro paga: $20.000 ✅
     - **Total: $50.000** ✓

### **Opción 2: Distribución Personalizada**

Si necesitas que cada uno especifique exactamente cuánto paga:

1. **Creas un GASTO COMPARTIDO:**
   - Concepto: "Cena"
   - **Monto Total**: $50.000
   - Seleccionas: ✅ Tú, ✅ Pedro
   - Tipo: **"Personalizada"**
   
2. **Especificas montos individuales:**
   - Tu pago: $30.000
   - Pago de Pedro: $20.000
   - **Total debe sumar: $50.000** (El sistema valida esto)

3. **¿Qué sucede?**
   - Se crean 2 transacciones:
     - Tú pagas $30.000 en tu cuenta
     - Pedro paga $20.000 en la suya
   - Cada uno recibe una notificación del gasto

---

## 🔄 TRANSACCIONES GENERADAS

Cuando creas un **Gasto Compartido** por $50.000 con 2 participantes:

```
ANTES (❌ INCORRECTO):
- Transacción 1: Tu cuenta -$50.000 (PROBLEMA: pagabas todo)
- Transacción 2: Pedro +$50.000

AHORA (✅ CORRECTO):
- Transacción 1: Tu cuenta -$30.000 (tu verdadera deuda)
- Transacción 2: Pedro -$20.000 (su verdadera deuda)
```

---

## 💰 CUOTAS (NUEVO)

¿Necesitas que cada uno pague en cuotas en lugar de de una sola vez?

1. **Marcas "¿Diferir a cuotas?"** ✅
2. **Especificas número de cuotas**: 3 meses
3. **Sistema calcula:**
   - Tu pago por cuota: $30.000 ÷ 3 = $10.000/mes
   - Pago de Pedro por cuota: $20.000 ÷ 3 = $6.666/mes

**Nota:** Esto se guarda en el gasto para referencia, pero actualmente se aplica todo de una sola vez. En una próxima mejora se puede automatizar para crear cuotas automáticas.

---

## 🎓 CASOS DE USO

### Caso 1: Cena a mitades (50/50)
```
- Monto Total: $40.000
- Participantes: Tú, María
- Mi Pago: $20.000
- Resultado: Tú pagas $20.000, María paga $20.000 ✓
```

### Caso 2: Viaje entre 3 personas (no equitativo)
```
- Monto Total: $600.000 (alquiler hotel)
- Participantes: Tú, Pedro, Ana
- Tipo: Personalizada
- Tu pago: $250.000
- Pago Pedro: $200.000
- Pago Ana: $150.000
- Total: $600.000 ✓
```

### Caso 3: Gasto en 4 cuotas
```
- Concepto: Computadora compartida
- Monto Total: $2.000.000
- Participantes: Tú, Luis, Rosa, Carlos (4 personas)
- Tipo: Equitativa
- Mi Pago: $600.000
- Resto ($1.400.000) ÷ 3 personas = $466.666 c/u
- Con cuotas: 4 meses
- Tu cuota: $600.000 ÷ 4 = $150.000/mes
- Otros: $466.666 ÷ 4 = $116.666/mes
```

---

## ⚠️ VALIDACIONES IMPORTANTES

El sistema te alertará si:

1. **No seleccionas participantes**
   ```
   ❌ "Selecciona al menos un participante"
   ```

2. **Tu pago es inválido (equitativa)**
   ```
   ❌ "Tu pago debe ser mayor a 0 y menor al monto total"
   ```

3. **Los montos personalizados no suman el total**
   ```
   ❌ "El total asignado ($X) debe ser igual al monto ($Y)"
   ```

4. **No tienes otros participantes**
   ```
   ❌ "Necesitas al menos otro participante además de ti"
   ```

---

## 📝 CAMPOS NUEVO EN MODALES

### ModalGastoCompartido & ModalIngresoCompartido ahora incluyen:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| **Mi Pago** | Número | Lo que TÚ pagas (solo en equitativa) |
| **Diferir a Cuotas** | Checkbox | Dividir el pago en X cuotas |
| **Número de Cuotas** | Número | Cuántas cuotas quieres (1-24) |

---

## 🔮 PRÓXIMAS MEJORAS SUGERIDAS

1. **Cuotas automáticas:** Crear transacciones automáticamente cada mes
2. **Recordatorios de cuotas:** Notificar antes de cada cuota
3. **Historial de cuotas:** Ver quién pagó qué cuota
4. **Liquidación:** Ver quién le debe a quién en total
5. **Exportar:** Generar reporte PDF de los gastos compartidos

---

## 🐛 Si Algo No Funciona

Verifica que:
1. ✅ El backend está corriendo en puerto 3001
2. ✅ Los usuarios aparecen en la lista de participantes
3. ✅ Los montos son números válidos
4. ✅ La suma de montos es correcta (modo personalizado)
