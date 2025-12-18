# 🔍 Tus Credenciales Actuales de Mercado Pago

## 📋 Credenciales Configuradas Actualmente

### Frontend (index.html - línea 1661)
```
Public Key: APP_USR-3389cfc1-43fb-4b1c-9fa8-58a1d332403a
```

### Backend (Firebase Functions)
```
Access Token: APP_USR-4089958117850782-112417-2caeb630658a9586e044a011db933574-322263721
```

---

## ✅ Cómo Verificar si son de Prueba o Producción

### Paso 1: Ir al Panel de Mercado Pago
1. Abre: **https://www.mercadopago.com.ar/developers/panel**
2. Inicia sesión
3. Selecciona tu aplicación

### Paso 2: Verificar Public Key (Frontend)

#### En la pestaña "Prueba":
1. Busca el **Public Key** en la sección "Credenciales de prueba"
2. Compara con: `APP_USR-3389cfc1-43fb-4b1c-9fa8-58a1d332403a`
   - ✅ **Si COINCIDE** → Estás usando credenciales de **PRUEBA**
   - ❌ **Si NO coincide** → Continúa con el siguiente paso

#### En la pestaña "Producción":
1. Busca el **Public Key** en la sección "Credenciales de producción"
2. Compara con: `APP_USR-3389cfc1-43fb-4b1c-9fa8-58a1d332403a`
   - ✅ **Si COINCIDE** → Estás usando credenciales de **PRODUCCIÓN**

### Paso 3: Verificar Access Token (Backend)

#### En la pestaña "Prueba":
1. Busca el **Access Token** en la sección "Credenciales de prueba"
2. Compara con: `APP_USR-4089958117850782-112417-2caeb630658a9586e044a011db933574-322263721`
   - ✅ **Si COINCIDE** → Estás usando credenciales de **PRUEBA**
   - ❌ **Si NO coincide** → Continúa con el siguiente paso

#### En la pestaña "Producción":
1. Busca el **Access Token** en la sección "Credenciales de producción"
2. Compara con: `APP_USR-4089958117850782-112417-2caeb630658a9586e044a011db933574-322263721`
   - ✅ **Si COINCIDE** → Estás usando credenciales de **PRODUCCIÓN**

---

## ⚠️ Importante: Ambos deben coincidir

**Para que funcione correctamente:**
- ✅ El **Public Key** y el **Access Token** deben ser del **mismo entorno** (ambos de Prueba O ambos de Producción)
- ❌ **NO mezcles** credenciales de Prueba con Producción

---

## 🔍 Verificación Rápida por Comportamiento

### Si ves esto en el checkout:
- ✅ Texto: **"Sandbox de Mercado Pago"**
- ✅ URL contiene: `sandbox.mercadopago.com.ar`
- ✅ Solo acepta tarjetas de prueba

**→ Estás usando credenciales de PRUEBA**

### Si ves esto en el checkout:
- ✅ NO hay texto de "Sandbox"
- ✅ URL: `www.mercadopago.com.ar` (sin "sandbox")
- ✅ Acepta tarjetas reales

**→ Estás usando credenciales de PRODUCCIÓN**

---

## 📝 Resumen de Comparación

| Credencial | Valor Actual | ¿Dónde Verificar? |
|-----------|--------------|-------------------|
| **Public Key** | `APP_USR-3389cfc1-43fb-4b1c-9fa8-58a1d332403a` | Panel MP → Pestaña "Prueba" o "Producción" |
| **Access Token** | `APP_USR-4089958117850782-112417-2caeb630658a9586e044a011db933574-322263721` | Panel MP → Pestaña "Prueba" o "Producción" |

---

## 🎯 Próximos Pasos

1. ✅ Ve al panel de Mercado Pago
2. ✅ Compara tus credenciales con las del panel
3. ✅ Identifica si son de Prueba o Producción
4. ✅ Si quieres cambiar a Producción, actualiza ambas credenciales

---

## 🔗 Enlaces Útiles

- **Panel de Prueba**: https://www.mercadopago.com.ar/developers/panel/app/credentials/test
- **Panel de Producción**: https://www.mercadopago.com.ar/developers/panel/app/credentials/prod
- **Panel Principal**: https://www.mercadopago.com.ar/developers/panel

