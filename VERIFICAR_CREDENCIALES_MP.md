# 🔍 Cómo Verificar si las Credenciales de Mercado Pago son de Prueba o Producción

## ⚠️ Importante

**Las credenciales de prueba y producción tienen el MISMO formato** (ambas empiezan con `APP_USR-`), por lo que **NO puedes distinguirlas solo por su apariencia**. Debes verificar en el panel de Mercado Pago.

---

## 📋 Método 1: Verificar en el Panel de Mercado Pago (RECOMENDADO)

### Paso 1: Acceder al Panel
1. Ve a: **https://www.mercadopago.com.ar/developers/panel**
2. Inicia sesión con tu cuenta de Mercado Pago
3. Selecciona tu aplicación

### Paso 2: Verificar las Credenciales de Prueba
1. Haz clic en la pestaña **"Prueba"** (Test)
2. Copia el **Public Key** y **Access Token** que aparecen ahí
3. Compara con los que tienes configurados:
   - **Frontend (index.html línea 1661)**: `MERCADOPAGO_PUBLIC_KEY`
   - **Backend (Firebase Functions)**: `MERCADOPAGO_ACCESS_TOKEN`

### Paso 3: Verificar las Credenciales de Producción
1. Haz clic en la pestaña **"Producción"** (Production)
2. Copia el **Public Key** y **Access Token** que aparecen ahí
3. Compara con los que tienes configurados

### Paso 4: Comparar
- ✅ **Si coinciden con "Prueba"** → Estás usando credenciales de PRUEBA (sandbox)
- ✅ **Si coinciden con "Producción"** → Estás usando credenciales de PRODUCCIÓN

---

## 📋 Método 2: Verificar en el Código

### Frontend (index.html)
```javascript
// Línea 1661
const MERCADOPAGO_PUBLIC_KEY = 'APP_USR-3389cfc1-43fb-4b1c-9fa8-58a1d332403a';
```

**Para verificar:**
1. Abre `index.html` en tu editor
2. Busca la línea 1661
3. Copia el valor de `MERCADOPAGO_PUBLIC_KEY`
4. Compara con el panel de Mercado Pago

### Backend (Firebase Functions)
El Access Token está configurado en Firebase Functions config.

**Para verificar:**
```bash
# Ver el Access Token configurado en Firebase
firebase functions:config:get --project growapp-36701
```

O revisa los logs de Firebase Functions cuando se crea una preferencia:
```bash
firebase functions:log --only createDiagnosticPaymentPreference --project growapp-36701
```

Busca la línea que dice:
```
🔑 Access Token usado: APP_USR-...
```

---

## 📋 Método 3: Verificar por Comportamiento (Prueba Real)

### Si estás en PRUEBA (Sandbox):
- ✅ El checkout muestra: **"Sandbox de Mercado Pago"**
- ✅ La URL contiene: `sandbox.mercadopago.com.ar` o `sandbox`
- ✅ Solo funcionan tarjetas de prueba
- ✅ Los pagos son ficticios (no se cobran realmente)

### Si estás en PRODUCCIÓN:
- ✅ El checkout NO muestra "Sandbox"
- ✅ La URL contiene: `www.mercadopago.com.ar` (sin "sandbox")
- ✅ Funcionan tarjetas reales
- ✅ Los pagos son reales (se cobran realmente)

---

## 🔧 Cómo Cambiar de Prueba a Producción

### 1. Obtener Credenciales de Producción
1. Ve a: **https://www.mercadopago.com.ar/developers/panel**
2. Haz clic en la pestaña **"Producción"**
3. Copia el **Access Token** de producción

### 2. Actualizar Backend (Firebase Functions)
```bash
firebase functions:config:set mercadopago.access_token="TU_ACCESS_TOKEN_PRODUCCION" --project growapp-36701
```

### 3. Actualizar Frontend (index.html)
Edita la línea 1661 de `index.html`:
```javascript
const MERCADOPAGO_PUBLIC_KEY = 'TU_PUBLIC_KEY_PRODUCCION';
```

### 4. Redesplegar
```bash
# Redesplegar la función
firebase deploy --only functions:createDiagnosticPaymentPreference --project growapp-36701
```

---

## 📊 Tabla Comparativa

| Característica | Prueba (Test) | Producción |
|---------------|--------------|------------|
| **Formato** | `APP_USR-...` | `APP_USR-...` |
| **Panel** | Pestaña "Prueba" | Pestaña "Producción" |
| **Checkout URL** | `sandbox.mercadopago.com.ar` | `www.mercadopago.com.ar` |
| **Mensaje** | "Sandbox de Mercado Pago" | Sin mensaje de sandbox |
| **Tarjetas** | Solo tarjetas de prueba | Tarjetas reales |
| **Pagos** | Ficticios | Reales |

---

## ✅ Checklist de Verificación

- [ ] Accedí al panel de Mercado Pago
- [ ] Verifiqué la pestaña "Prueba" y copié las credenciales
- [ ] Verifiqué la pestaña "Producción" y copié las credenciales
- [ ] Comparé el Public Key del frontend con el panel
- [ ] Comparé el Access Token del backend con el panel
- [ ] Verifiqué el comportamiento del checkout (¿muestra "Sandbox"?)
- [ ] Confirmé si quiero usar Prueba o Producción

---

## 🎯 Resumen

**La única forma confiable de saber si tus credenciales son de prueba o producción es:**
1. Ir al panel de Mercado Pago
2. Comparar las credenciales que tienes configuradas con las que aparecen en cada pestaña
3. Si coinciden con "Prueba" → Son de prueba
4. Si coinciden con "Producción" → Son de producción

**NO puedes distinguirlas solo por su formato porque ambas tienen el mismo formato.**

