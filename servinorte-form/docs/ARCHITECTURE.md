# Arquitectura del Sistema

## Diagrama General

```
[Empleado]
    │
    ▼
[Navegador Web] ──── HTTPS ────► [Vercel / Next.js 16]
                                         │
                    ┌────────────────────┼────────────────────┐
                    ▼                    ▼                    ▼
              [PostgreSQL]        [Google Drive]       [Google Sheets]
               (Neon DB)           (Archivos)          (Registro datos)
                    │
                    └── [Panel Admin] ◄── [RRHH]
```

## Componentes

### Frontend (Next.js App Router)
- `src/app/page.tsx` — Página principal con formulario
- `src/app/admin/page.tsx` — Panel administrativo
- `src/components/form/EmployeeForm.tsx` — Orquestador del formulario multi-paso
- `src/components/form/Step*.tsx` — Componentes de cada paso

### Backend (API Routes)
- `GET /api/employees/[dni]` — Validación de empleado por DNI
- `POST /api/upload` — Subida de archivos a Google Drive
- `POST /api/submit` — Envío final del formulario
- `GET /api/geocode` — Proxy de geocodificación inversa
- `POST /api/admin/login` — Autenticación del panel admin
- `GET/PATCH /api/admin/submissions` — Gestión de registros
- `GET /api/admin/export` — Exportación de datos

### Base de Datos (PostgreSQL)
- `employees` — Tabla de empleados activos (precargada por RRHH)
- `form_submissions` — Actualizaciones enviadas por empleados
- `audit_log` — Log de eventos del sistema
- `admin_sessions` — Sesiones del panel administrativo

### Google Drive
Estructura de carpetas automática:
```
SERVINORTE/
└── Actualización Datos Empleados/
    ├── Comprobantes Obra Social/
    └── Evidencias Domicilio/
```

### Google Sheets
Hoja de cálculo con 28 columnas, una fila por actualización enviada.

## Flujo de Datos

1. Empleado ingresa DNI → validado contra tabla `employees`
2. Empleado completa 7 pasos del formulario
3. Archivos subidos directamente a Google Drive durante el proceso
4. Al enviar: datos guardados en PostgreSQL + fila agregada en Google Sheets
5. RRHH visualiza registros en panel `/admin` o en Google Sheets directamente

## Seguridad

- Rate limiting por IP en todos los endpoints
- JWT con expiración de 8h para panel admin
- Queries parametrizadas (sin SQL injection)
- Validación Zod en frontend y backend
- Sanitización de strings
- HTTPS obligatorio (Vercel)
- No se exponen datos sensibles en el cliente
