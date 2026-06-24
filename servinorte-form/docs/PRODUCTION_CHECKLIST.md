# Checklist de Producción

## Pre-Despliegue

### Base de Datos
- [ ] `DATABASE_URL` configurado con SSL (`?sslmode=require`)
- [ ] Script `01_create_tables.sql` ejecutado exitosamente
- [ ] Empleados reales cargados (reemplazar datos de muestra)
- [ ] Índices creados y verificados

### Google Cloud
- [ ] Proyecto de Google Cloud creado
- [ ] Google Sheets API habilitada
- [ ] Google Drive API habilitada  
- [ ] Maps JavaScript API habilitada
- [ ] Geocoding API habilitada
- [ ] Service Account creado con permisos correctos
- [ ] Google Sheets creado y compartido con Service Account
- [ ] API Key de Maps creada y restringida al dominio

### Variables de Entorno (Vercel)
- [ ] `DATABASE_URL` — PostgreSQL connection string
- [ ] `GOOGLE_SERVICE_ACCOUNT_KEY` — JSON del Service Account
- [ ] `GOOGLE_SPREADSHEET_ID` — ID del Google Sheets
- [ ] `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — API Key de Maps
- [ ] `ADMIN_PASSWORD` — Contraseña fuerte para panel admin
- [ ] `JWT_SECRET` — 64 caracteres aleatorios

### Vercel
- [ ] Proyecto creado en Vercel
- [ ] Build exitoso sin errores
- [ ] Dominio personalizado configurado
- [ ] HTTPS activo

## Post-Despliegue

### Funcionalidad
- [ ] Formulario carga en el dominio de producción
- [ ] DNI de prueba funciona: `30123456`
- [ ] Upload de archivo funciona (verificar en Google Drive)
- [ ] Datos aparecen en Google Sheets
- [ ] Panel admin `/admin` accesible
- [ ] Exportación Excel funciona
- [ ] Exportación CSV funciona
- [ ] Google Maps carga correctamente
- [ ] Geolocalización funciona

### Seguridad
- [ ] Rate limiting activo (probar con múltiples requests rápidos)
- [ ] Panel admin requiere contraseña
- [ ] No hay datos sensibles expuestos en el cliente
- [ ] Headers de seguridad configurados en Vercel

### Monitoreo
- [ ] Logs de Vercel configurados
- [ ] Error tracking configurado (opcional: Sentry)
- [ ] Backup de base de datos programado

## Carga de Empleados

Para cargar la nómina real de empleados, editar `sql/02_seed_employees.sql` con los datos reales, o usar importación CSV:

```sql
COPY employees (dni, legajo, nombre_completo, cuil, is_active)
FROM '/ruta/empleados.csv'
WITH (FORMAT csv, HEADER true);
```

Formato del CSV:
```csv
dni,legajo,nombre_completo,cuil,is_active
30123456,1001,Juan Carlos Pérez,20-30123456-7,true
```

## Contacto de Soporte

Para asistencia técnica, contactar al equipo de sistemas de SERVINORTE.
