# Manual del Panel Administrativo

## Acceso

URL: `https://actualizacion.servinorte.com.ar/admin`

Contraseña: configurada en la variable de entorno `ADMIN_PASSWORD`.

La sesión dura 8 horas. Al cerrar el navegador se cierra la sesión.

## Pantalla Principal

### Estadísticas
- **Total Registros**: cantidad total de actualizaciones recibidas
- **Completados**: formularios enviados exitosamente
- **Pendientes**: registros marcados como pendientes
- **Anulados**: registros invalidados

### Búsqueda y Filtros
- **Campo de búsqueda**: busca por nombre, DNI o número de legajo
- **Filtro de estado**: filtra por Completado / Pendiente / Anulado
- **Botón Actualizar**: recarga la tabla manualmente

### Exportación
- **Excel (.xlsx)**: descarga todos los registros en formato Excel
- **CSV (.csv)**: descarga en formato CSV para otros sistemas

## Tabla de Registros

Columnas disponibles:

| Columna | Descripción |
|---------|-------------|
| Legajo | Número de legajo del empleado |
| Nombre | Nombre completo |
| DNI | Documento de identidad |
| Email | Correo electrónico personal |
| Teléfono | Teléfono celular |
| Obra Social | Nombre de la obra social |
| Domicilio | Dirección completa |
| Ubicación | Link "Ver mapa" → abre Google Maps |
| Archivos | Links a Google Drive (OS = Obra Social, Dom. = Domicilio) |
| Estado | Estado actual del registro |
| Fecha | Fecha y hora de envío |
| Acciones | Cambiar estado del registro |

## Cambiar Estado de un Registro

1. En la columna "Acciones", seleccionar el nuevo estado
2. Los estados son: Completado, Pendiente, Anulado
3. El cambio se aplica inmediatamente

## Ver Archivos

- **OS**: abre la constancia/credencial de obra social en Google Drive
- **Dom.**: abre la imagen de evidencia del domicilio en Google Drive

## Ver Ubicación en Google Maps

Hacer clic en "Ver mapa" en la columna Ubicación abre Google Maps centrado en la ubicación exacta que indicó el empleado.

## Paginación

Los registros se muestran de a 20 por página. Use los botones "Anterior" y "Siguiente" para navegar.
