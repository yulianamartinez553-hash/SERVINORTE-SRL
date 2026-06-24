# SERVINORTE - Formulario de Actualización de Datos de Empleados

Aplicación web corporativa para la actualización de datos personales de empleados de SERVINORTE SRL.

## Stack Tecnológico

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS, Shadcn/UI, Framer Motion
- **Backend**: Next.js API Routes, Server Actions
- **Base de Datos**: PostgreSQL (Neon Database / Supabase)
- **Integraciones**: Google Sheets API, Google Drive API, Google Maps JavaScript API
- **Hosting**: Vercel

## Estructura del Formulario

| Paso | Sección |
|------|---------|
| 1 | Identificación por DNI |
| 2 | Datos Personales (email, teléfono) |
| 3 | Obra Social + adjunto |
| 4 | Domicilio Actual |
| 5 | Ubicación en Google Maps |
| 6 | Evidencia fotográfica del domicilio |
| 7 | Declaración Jurada |

## Configuración Rápida

### 1. Variables de entorno

Copie `.env.example` a `.env.local` y complete todos los valores:

```bash
cp .env.example .env.local
```

Edite `.env.local` con sus credenciales reales.

### 2. Base de datos

Ejecute los scripts SQL en orden:

```bash
psql $DATABASE_URL -f sql/01_create_tables.sql
psql $DATABASE_URL -f sql/02_seed_employees.sql
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Desarrollo local

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

### 5. Producción (Vercel)

Ver `docs/DEPLOYMENT.md` para instrucciones completas de despliegue.

## Panel Administrativo

Acceso en `/admin` con la contraseña configurada en `ADMIN_PASSWORD`.

Funcionalidades:
- Ver todas las actualizaciones enviadas
- Buscar por DNI, legajo o nombre
- Filtrar por estado
- Exportar a Excel o CSV
- Ver ubicación en Google Maps
- Acceder a archivos en Google Drive
- Cambiar estado de registros

## Seguridad

- HTTPS obligatorio en producción
- Rate limiting en todos los endpoints
- Validación frontend (Zod) y backend
- JWT para sesiones del panel admin
- Sanitización de entradas
- Protección contra inyección SQL (queries parametrizadas)

## Documentación

- `docs/DEPLOYMENT.md` - Guía de despliegue en Vercel
- `docs/ADMIN_MANUAL.md` - Manual del panel administrativo
- `docs/ARCHITECTURE.md` - Arquitectura del sistema
- `docs/TECHNICAL_DOCS.md` - Documentación técnica
- `docs/PRODUCTION_CHECKLIST.md` - Checklist de producción
