import { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'
import { neon } from '@neondatabase/serverless'

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
    const search = searchParams.get('search') || ''
    const estado = searchParams.get('estado') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = (page - 1) * limit

    const sql = getDb()

    // JOIN submissions with employees to get all required fields
    const rows = await sql`
      SELECT
        s.id,
        e.legajo,
        e.nombre_completo,
        e.dni,
        e.cuil,
        s.email,
        s.telefono,
        s.obra_social,
        s.obra_social_file_url   AS url_obra_social,
        s.obra_social_file_id    AS id_archivo_obra_social,
        s.provincia,
        s.localidad,
        s.barrio,
        s.calle,
        s.numero,
        s.manzana,
        s.block,
        s.piso,
        s.departamento,
        s.descripcion_vivienda,
        s.latitud,
        s.longitud,
        s.direccion_formateada,
        s.place_id,
        s.domicilio_file_url     AS url_imagen_domicilio,
        s.domicilio_file_id      AS id_archivo_domicilio,
        s.declaracion_jurada,
        s.estado,
        s.created_at,
        s.updated_at
      FROM submissions s
      JOIN employees e ON s.employee_id = e.id
      WHERE
        (${search} = '' OR
         e.nombre_completo ILIKE ${'%' + search + '%'} OR
         e.dni             ILIKE ${'%' + search + '%'} OR
         e.legajo          ILIKE ${'%' + search + '%'})
        AND (${estado} = '' OR s.estado = ${estado})
      ORDER BY s.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `

    const countResult = await sql`
      SELECT COUNT(*) AS total
      FROM submissions s
      JOIN employees e ON s.employee_id = e.id
      WHERE
        (${search} = '' OR
         e.nombre_completo ILIKE ${'%' + search + '%'} OR
         e.dni             ILIKE ${'%' + search + '%'} OR
         e.legajo          ILIKE ${'%' + search + '%'})
        AND (${estado} = '' OR s.estado = ${estado})
    `

    return Response.json({
      success: true,
      data: rows,
      total: parseInt(countResult[0].total),
      page,
      limit,
    })
  } catch (error) {
    console.error('Admin submissions error:', error)
    return Response.json({ error: 'Error al obtener registros' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  if (!verifyToken(request)) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const { id, estado } = await request.json()
    if (!id || !['pendiente', 'completado', 'anulado'].includes(estado)) {
      return Response.json({ error: 'Parámetros inválidos' }, { status: 400 })
    }

    const sql = getDb()
    await sql`UPDATE submissions SET estado = ${estado} WHERE id = ${id}`

    return Response.json({ success: true })
  } catch (error) {
    console.error('Admin update error:', error)
    return Response.json({ error: 'Error al actualizar registro' }, { status: 500 })
  }
}
