# Guía de Despliegue en Vercel

## Pre-requisitos

- Cuenta en Vercel
- Base de datos PostgreSQL (Neon Database recomendado)
- Proyecto de Google Cloud con APIs habilitadas
- Google Sheets creado

## Paso 1: Base de Datos (Neon Database)

1. Ir a [neon.tech](https://neon.tech) y crear una cuenta gratuita
2. Crear un nuevo proyecto: `servinorte-form`
3. Copiar la **Connection String** (formato: `postgresql://...`)
4. Ejecutar los scripts SQL:

```sql
-- En la consola SQL de Neon:
-- Pegar y ejecutar el contenido de sql/01_create_tables.sql
-- Pegar y ejecutar el contenido de sql/02_seed_employees.sql
```

## Paso 2: Google Cloud Platform

### Crear proyecto y habilitar APIs

1. Ir a [console.cloud.google.com](https://console.cloud.google.com)
2. Crear proyecto: `servinorte-form`
3. Habilitar las siguientes APIs:
   - Google Sheets API
   - Google Drive API
   - Maps JavaScript API
   - Geocoding API
   - Places API

### Crear Service Account

1. IAM & Admin → Service Accounts → Crear cuenta de servicio
2. Nombre: `servinorte-sheets-drive`
3. Roles: Editor de Google Sheets, Editor de Google Drive
4. Crear clave JSON → Descargar

### Google Sheets

1. Crear nueva hoja de cálculo en Google Sheets
2. Compartirla con el email del Service Account (con permiso de Editor)
3. Copiar el ID del spreadsheet desde la URL

### Google Maps

1. APIs & Services → Credenciales → Crear clave de API
2. Restringir: HTTP referrers → agregar su dominio
3. Restringir APIs: Maps JavaScript API, Geocoding API, Places API

## Paso 3: Despliegue en Vercel

### Opción A: Desde GitHub (Recomendado)

1. Subir el código a GitHub
2. Ir a [vercel.com](https://vercel.com) → New Project
3. Importar repositorio
4. **Root Directory**: `servinorte-form` (si el repo tiene otros archivos en raíz)
5. Framework: Next.js (detectado automáticamente)
6. Agregar variables de entorno (ver sección abajo)
7. Deploy

### Opción B: Vercel CLI

```bash
cd servinorte-form
npx vercel --prod
```

## Variables de Entorno en Vercel

En Vercel Dashboard → Settings → Environment Variables, agregar:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | Connection string de Neon |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | JSON completo del Service Account (en una línea) |
| `GOOGLE_SPREADSHEET_ID` | ID del Google Sheets |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Clave de API de Maps |
| `ADMIN_PASSWORD` | Contraseña del panel admin |
| `JWT_SECRET` | String aleatorio de 64 caracteres |

### Generar JWT_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Paso 4: Dominio Personalizado

1. Vercel Dashboard → Settings → Domains
2. Agregar: `actualizacion.servinorte.com.ar`
3. Configurar DNS en su proveedor:
   - Tipo: CNAME
   - Host: actualizacion
   - Valor: cname.vercel-dns.com

## Verificación Post-Despliegue

- [ ] Formulario carga correctamente
- [ ] Validación de DNI funciona (test con DNI de muestra: 30123456)
- [ ] Upload de archivos funciona → verificar en Google Drive
- [ ] Datos se guardan en Google Sheets
- [ ] Panel admin `/admin` accesible
- [ ] HTTPS activo
