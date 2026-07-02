import { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'
import { neon } from '@neondatabase/serverless'
import * as XLSX from 'xlsx'

function getDb() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')
  return neon(url)
}

function verifyToken(request: NextRequest): boolean {
  const auth = request.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return false
  const token = auth.slice(7)
  const secret = process.env.JWT_SECRET
  if (!secret) return false
  try {
    verify(token, secret)
    return true
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  if (!verifyToken(request)) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'xlsx'

    const sql = getDb()
    const rows = await sql`
      SELECT
        e.legajo                    AS "Legajo",
        e.nombre_completo           AS "Nombre Completo",
        e.dni                       AS "DNI",
        e.cuil                      AS "CUIL",
        s.email                     AS "Correo Electrónico",
        s.telefono                  AS "Teléfono",
        s.obra_social               AS "Obra Social",
        s.obra_social_file_url      AS "URL Obra Social",
        s.provincia                 AS "Provincia",
        s.localidad                 AS "Localidad",
        s.barrio                    AS "Barrio",
        s.calle                     AS "Calle",
        s.numero                    AS "Número",
        s.manzana                   AS "Manzana",
        s.block                     AS "Block",
        s.piso                      AS "Piso",
        s.departamento              AS "Departamento",
        s.descripcion_vivienda      AS "Descripción Vivienda",
        s.latitud                   AS "Latitud",
        s.longitud                  AS "Longitud",
        s.direccion_formateada      AS "Dirección Formateada",
        s.domicilio_file_url        AS "URL Imagen Domicilio",
        s.estado                    AS "Estado",
        s.created_at                AS "Fecha de Envío"
      FROM submissions s
      JOIN employees e ON s.employee_id = e.id
      ORDER BY s.created_at DESC
    `

    if (format === 'csv') {
      const headers = Object.keys(rows[0] || {})
      const csvRows = [
        headers.join(','),
        ...rows.map(row =>
          headers.map(h => {
            const val = (row as Record<string, unknown>)[h]
            const str = val === null || val === undefined ? '' : String(val)
            return `"${str.replace(/"/g, '""')}"`
          }).join(',')
        ),
      ]
      const csv = csvRows.join('\n')
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="servinorte-actualizaciones.csv"',
        },
      })
    }

    // Excel
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(rows)
    XLSX.utils.book_append_sheet(wb, ws, 'Actualizaciones')
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    return new Response(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="servinorte-actualizaciones.xlsx"',
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return Response.json({ error: 'Error al exportar' }, { status: 500 })
  }
}
